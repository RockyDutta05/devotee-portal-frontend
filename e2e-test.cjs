const axios = require('axios');

const API_URL = 'http://localhost:8080/api';

const apiClient = axios.create({
  baseURL: API_URL,
  validateStatus: () => true // Allow all status codes
});

const delay = ms => new Promise(res => setTimeout(res, ms));

async function runTests() {
  console.log("Waiting for backend...");
  let backendReady = false;
  for(let i=0; i<30; i++) {
      try {
          const res = await apiClient.get('/auth/login'); // just some endpoint to see if it responds
          // even 404 or 405 means it's up
          if(res.status) {
              backendReady = true;
              break;
          }
      } catch(e) {}
      await delay(1000);
  }
  if(!backendReady) {
      console.error("Backend not ready");
      return;
  }
  console.log("Backend is UP.");

  let adminToken = null;
  let userAId = null, userBId = null, userCId = null;
  let userAToken = null, userBToken = null, userCToken = null;

  const assert = (condition, msg, errInfo) => {
      if(!condition) {
          console.error("❌ FAILED:", msg, errInfo ? errInfo : '');
          process.exit(1);
      } else {
          console.log("✅ PASSED:", msg);
      }
  }

  // Admin login (seeded by DataSeeder)
  let adminLogin;
  try {
      adminLogin = await apiClient.post('/auth/login', { email: 'admin@example.com', password: 'admin123' });
  } catch(e) {
      assert(false, "Admin login exception", e.message + (e.response ? " data: " + JSON.stringify(e.response.data) + " status: " + e.response.status : ""));
  }
  assert(adminLogin.status === 200, "Admin login", adminLogin.status);
  adminToken = adminLogin.data.token;

  const rnd = Math.random().toString(36).substring(7);

  console.log("---- Test 1: User signup creates PENDING account ----");
  const signupA = await apiClient.post('/auth/signup', { name: 'User A', email: `a_${rnd}@example.com`, password: 'password123', hideEmployer: true, currentEmployer: 'Google' });
  assert(signupA.status === 200 || signupA.status === 201, "User A signup", signupA.status + " " + JSON.stringify(signupA.data));
  userAId = signupA.data.id;
  assert(signupA.data.approvalStatus === 'PENDING', "User A is PENDING");

  console.log("---- Test 2: PENDING user cannot login ----");
  const loginA1 = await apiClient.post('/auth/login', { email: `a_${rnd}@example.com`, password: 'password123' });
  assert(loginA1.status === 403, "User A login rejected (403)");

  console.log("---- Test 3: ADMIN approves user ----");
  const approveA = await apiClient.put(`/admin/signups/${userAId}/approve`, {}, { headers: { Authorization: `Bearer ${adminToken}` } });
  assert(approveA.status === 200, "Admin approves User A");

  console.log("---- Test 4: APPROVED user can login ----");
  const loginA2 = await apiClient.post('/auth/login', { email: `a_${rnd}@example.com`, password: 'password123' });
  assert(loginA2.status === 200, "User A login succeeds");
  userAToken = loginA2.data.token;

  console.log("---- Test 5: USER cannot access ADMIN APIs ----");
  const adminAccess = await apiClient.get('/admin/signups/pending', { headers: { Authorization: `Bearer ${userAToken}` } });
  assert(adminAccess.status === 403, "User A gets 403 when accessing Admin API");

  // Create User B (and approve)
  const signupB = await apiClient.post('/auth/signup', { name: 'User B', email: `b_${rnd}@example.com`, password: 'password123', phone: '1234', hideEmployer: false });
  await apiClient.put(`/admin/signups/${signupB.data.id}/approve`, {}, { headers: { Authorization: `Bearer ${adminToken}` } });
  const loginB = await apiClient.post('/auth/login', { email: `b_${rnd}@example.com`, password: 'password123' });
  userBToken = loginB.data.token;
  userBId = signupB.data.id;

  // Create User C (and approve)
  const signupC = await apiClient.post('/auth/signup', { name: 'User C', email: `c_${rnd}@example.com`, password: 'password123', phone: '5678' });
  await apiClient.put(`/admin/signups/${signupC.data.id}/approve`, {}, { headers: { Authorization: `Bearer ${adminToken}` } });
  const loginC = await apiClient.post('/auth/login', { email: `c_${rnd}@example.com`, password: 'password123' });
  userCToken = loginC.data.token;
  userCId = signupC.data.id;

  console.log("---- Test 6: hideEmployer=true hides employer in public profile ----");
  const profileA_B = await apiClient.get(`/profile/${userAId}`, { headers: { Authorization: `Bearer ${userBToken}` } });
  assert(profileA_B.status === 200, "User B fetches User A profile");
  assert(profileA_B.data.currentEmployer == null, "User A employer is hidden");

  console.log("---- Test 7: Phone and email are hidden before contact approval ----");
  assert(profileA_B.data.email == null && profileA_B.data.phone == null, "User A email/phone are hidden");

  console.log("---- Test 8: Contact request requires a reason ----");
  const reqFail = await apiClient.post('/contact-requests', { targetId: userAId, reason: '' }, { headers: { Authorization: `Bearer ${userBToken}` } });
  assert(reqFail.status !== 200 && reqFail.status !== 201, "Contact request without reason fails");

  console.log("---- Test 9: Approved contact request exposes contact info to requester ----");
  const reqSuccess = await apiClient.post('/contact-requests', { targetId: userAId, reason: 'Mentorship' }, { headers: { Authorization: `Bearer ${userBToken}` } });
  assert(reqSuccess.status === 200 || reqSuccess.status === 201, "Contact request successful");
  const reqId = reqSuccess.data.id;
  const approvedReq = await apiClient.put(`/contact-requests/${reqId}/approve`, {}, { headers: { Authorization: `Bearer ${userAToken}` } });
  assert(approvedReq.data.contactEmail === `a_${rnd}@example.com`, "User B gets User A email after approval", JSON.stringify(approvedReq.data));
  
  const profileA_C = await apiClient.get(`/profile/${userAId}`, { headers: { Authorization: `Bearer ${userCToken}` } });
  assert(profileA_C.data.email == null, "User C still cannot see User A email");

  console.log("---- Test 10: User can have multiple resumes ----");
  const res1 = await apiClient.post('/resumes', { title: 'R1', fileUrl: 'url1', fileName: 'f1', fileType: 'pdf', status: 'ACTIVE', noticePeriod: 'IMMEDIATE', hiddenFromPublicSearch: false }, { headers: { Authorization: `Bearer ${userAToken}` } });
  const res2 = await apiClient.post('/resumes', { title: 'R2', fileUrl: 'url2', fileName: 'f2', fileType: 'pdf', status: 'ACTIVE', noticePeriod: 'IMMEDIATE', hiddenFromPublicSearch: true }, { headers: { Authorization: `Bearer ${userAToken}` } });
  assert(res1.status === 200 || res1.status === 201, "Resume 1 created");
  assert(res2.status === 200 || res2.status === 201, "Resume 2 created");

  console.log("---- Test 10.5: Presign upload enforces 10MB limit ----");
  const uploadReq = await apiClient.post('/resumes/presign-upload', {
    fileName: 'large.pdf',
    fileType: 'application/pdf',
    contentLength: 15000000 // 15MB
  }, { headers: { Authorization: `Bearer ${userAToken}` } });
  
  if (uploadReq.status !== 400) {
      console.log("UPLOAD REQ FAILED. Status: ", uploadReq.status, "Data: ", uploadReq.data);
  }
  assert(uploadReq.status === 400, "Rejected 15MB file with 400");
  console.log("✅ PASSED: 10MB upload limit enforced");

  console.log("---- Test 11: hiddenFromPublicSearch=true removes resume from public browse ----");
  const publicResumes = await apiClient.get('/resumes/browse', { headers: { Authorization: `Bearer ${userBToken}` } });
  assert(publicResumes.status === 200, "Fetch public resumes");
  const hasRes1 = publicResumes.data.some(r => r.id === res1.data.id);
  const hasRes2 = publicResumes.data.some(r => r.id === res2.data.id);
  assert(hasRes1 && !hasRes2, "Only non-hidden resume is in browse list");

  console.log("---- Test 12: Company autocomplete does not create duplicates ----");
  const c1 = await apiClient.post('/companies', { name: 'Google' }, { headers: { Authorization: `Bearer ${userAToken}` } });
  const c2 = await apiClient.post('/companies', { name: 'Google ' }, { headers: { Authorization: `Bearer ${userBToken}` } }); // maybe same?
  const allCompanies = await apiClient.get('/companies?search=Google', { headers: { Authorization: `Bearer ${userBToken}` } });
  // Just checking if Google appears once or twice
  const googles = allCompanies.data.filter(c => c.name.trim().toLowerCase() === 'google');
  assert(googles.length === 1, "Company dedup logic works");

  console.log("---- Test 13: Direct company referrers appear before general referrers ----");
  // User B willing to refer Google
  await apiClient.post('/referral/companies', { companyId: c1.data.id }, { headers: { Authorization: `Bearer ${userBToken}` } });
  // User C general willingness
  await apiClient.post('/referral/willingness', { isWilling: true }, { headers: { Authorization: `Bearer ${userCToken}` } });
  
  const willing = await apiClient.get(`/referral/willing-referrers?companyId=${c1.data.id}`, { headers: { Authorization: `Bearer ${userAToken}` } });
  assert(willing.status === 200, "Get willing referrers");
  
  const currentB = willing.data.find(w => w.userId === userBId);
  assert(currentB && currentB.directCompanyMatch === true, "User B (direct) is in list and directCompanyMatch is true", JSON.stringify(willing.data));
  const currentC = willing.data.find(w => w.userId === userCId);
  assert(currentC && currentC.directCompanyMatch === false, "User C (general) is in list and directCompanyMatch is false");
  
  const firstFalse = willing.data.findIndex(w => w.directCompanyMatch === false);
  const lastTrue = willing.data.findLastIndex(w => w.directCompanyMatch === true);
  assert(firstFalse === -1 || lastTrue < firstFalse, "Direct referrers appear before general referrers");

  console.log("---- Test 14 & 15: Referral request cap is enforced ----");
  const ref1 = await apiClient.post('/referral/requests', { referrerId: userBId, companyId: c1.data.id, jobTitle: 'J1', jobIdOrLink: 'L1' }, { headers: { Authorization: `Bearer ${userAToken}` } });
  const ref2 = await apiClient.post('/referral/requests', { referrerId: userBId, companyId: c1.data.id, jobTitle: 'J2', jobIdOrLink: 'L2' }, { headers: { Authorization: `Bearer ${userAToken}` } });
  const ref3 = await apiClient.post('/referral/requests', { referrerId: userBId, companyId: c1.data.id, jobTitle: 'J3', jobIdOrLink: 'L3' }, { headers: { Authorization: `Bearer ${userAToken}` } });
  assert(ref1.status === 200 || ref1.status === 201, "Ref 1 OK");
  assert(ref2.status === 200 || ref2.status === 201, "Ref 2 OK");
  assert(ref3.status === 200 || ref3.status === 201, "Ref 3 OK");
  
  const ref4 = await apiClient.post('/referral/requests', { referrerId: userBId, companyId: c1.data.id, jobTitle: 'J4', jobIdOrLink: 'L4' }, { headers: { Authorization: `Bearer ${userAToken}` } });
  assert(ref4.status !== 200 && ref4.status !== 201, "Ref 4 Rejected due to cap");

  console.log("---- Test 16: Job posts appear latest first ----");
  const statusesResp = await apiClient.get('/jobs/statuses', { headers: { Authorization: `Bearer ${userAToken}` } });
  const statusId = statusesResp.data[0].id;
  const job1 = await apiClient.post('/jobs', { title: 'Job 1', companyId: c1.data.id, jobIdOrLink: 'L1', statusId: statusId }, { headers: { Authorization: `Bearer ${userAToken}` } });
  await delay(100);
  const job2 = await apiClient.post('/jobs', { title: 'Job 2', companyId: c1.data.id, jobIdOrLink: 'L2', statusId: statusId }, { headers: { Authorization: `Bearer ${userAToken}` } });
  
  const jobs = await apiClient.get('/jobs', { headers: { Authorization: `Bearer ${userBToken}` } });
  assert(jobs.status === 200, "Get jobs");
  assert(jobs.data.length >= 2, "Has jobs");
  
  // We should find our specific jobs to check ordering, as other test runs might have created other jobs
  const myJob1Idx = jobs.data.findIndex(j => j.id === job1.data.id);
  const myJob2Idx = jobs.data.findIndex(j => j.id === job2.data.id);
  assert(myJob2Idx < myJob1Idx, "Latest job is first");

  console.log("---- Test 17: Admin can review reports ----");
  const jobToReport = jobs.data[0].id;
  const report = await apiClient.post('/reports', { jobPostId: jobToReport, reason: 'Spam' }, { headers: { Authorization: `Bearer ${userAToken}` } });
  assert(report.status === 200 || report.status === 201, "Report created");
  
  const allReports = await apiClient.get('/reports', { headers: { Authorization: `Bearer ${adminToken}` } });
  assert(allReports.status === 200, "Get all reports");
  assert(allReports.data.some(r => r.id === report.data.id), "Admin sees report");
  
  const review = await apiClient.put(`/reports/${report.data.id}/review`, {}, { headers: { Authorization: `Bearer ${adminToken}` } });
  assert(review.status === 200, "Admin reviews report");

  console.log("---- Test 18: Non-admin cannot access admin APIs ----");
  const badAccess = await apiClient.get('/admin/reports', { headers: { Authorization: `Bearer ${userAToken}` } });
  assert(badAccess.status === 403, "User cannot see reports");

  console.log("🎉 All Tests Passed!");
}

runTests();
