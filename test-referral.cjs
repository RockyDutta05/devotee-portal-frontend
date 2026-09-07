const axios = require('axios');

const API_URL = 'http://localhost:8080/api';

async function runTest() {
  try {
    console.log("=== Start E2E Referral Test ===");
    
    // 1. Setup User A
    console.log("Registering User A...");
    await axios.post(`${API_URL}/auth/signup`, {
      name: "User A",
      email: "usera_test4@example.com",
      password: "Password123!",
      phone: "1234567890",
      connectedToContact: "1234567890",
      role: "USER"
    });
    
    // Login User A
    const loginARes = await axios.post(`${API_URL}/auth/login`, {
      email: "usera_test4@example.com",
      password: "Password123!"
    });
    const tokenA = loginARes.data.token;
    console.log("User A Logged In. Token length:", tokenA.length);
    
    // 2. Setup User B
    console.log("Registering User B...");
    await axios.post(`${API_URL}/auth/signup`, {
      name: "User B",
      email: "userb_test4@example.com",
      password: "Password123!",
      phone: "0987654321",
      connectedToContact: "0987654321",
      role: "USER"
    });
    
    // Login User B
    const loginBRes = await axios.post(`${API_URL}/auth/login`, {
      email: "userb_test4@example.com",
      password: "Password123!"
    });
    const tokenB = loginBRes.data.token;
    console.log("User B Logged In. Token length:", tokenB.length);

    // 3. User A toggles Willing to Refer
    console.log("User A sets isWillingToRefer to true...");
    await axios.post(`${API_URL}/referrals/willingness`, null, {
      params: { isWilling: true },
      headers: { Authorization: `Bearer ${tokenA}` }
    });

    // 4. Get Companies and Statuses to Post a Job
    console.log("Fetching Companies and Statuses...");
    const companies = await axios.get(`${API_URL}/companies`, { headers: { Authorization: `Bearer ${tokenA}` }});
    const statuses = await axios.get(`${API_URL}/jobs/statuses`, { headers: { Authorization: `Bearer ${tokenA}` }});
    
    if (!companies.data || companies.data.length === 0 || !statuses.data || statuses.data.length === 0) {
        throw new Error("No companies or statuses found in the DB. Make sure data.sql ran.");
    }
    
    const companyId = companies.data[0].id;
    const statusId = statuses.data[0].id;
    
    // 5. User A posts a job
    console.log("User A posting a job...");
    const jobRes = await axios.post(`${API_URL}/jobs`, {
      title: "Senior Backend Engineer",
      companyId: companyId,
      jobIdOrLink: "https://example.com/job/123",
      statusId: statusId,
      noticePeriodRequirement: "30 Days"
    }, { headers: { Authorization: `Bearer ${tokenA}` }});
    const jobPost = jobRes.data;
    console.log("Job posted successfully by User A.");

    // 6. User B fetches available referrers and sends request
    console.log("User B fetching available referrers...");
    const referrersRes = await axios.get(`${API_URL}/referrals/willing`, {
      headers: { Authorization: `Bearer ${tokenB}` }
    });
    const referrers = referrersRes.data;
    const userAReferrer = referrers.find(r => r.name === "User A");
    
    if (!userAReferrer) {
        throw new Error("User A not found in willing referrers list.");
    }
    console.log("User A found in referrers list.");

    console.log("User B sending referral request to User A...");
    const reqRes = await axios.post(`${API_URL}/referrals/request`, {
      referrerId: userAReferrer.userId,
      companyId: companyId,
      jobIdOrLink: jobPost.jobIdOrLink,
      jobTitle: jobPost.title,
      comments: "Hi User A, I saw your job posting and would love a referral!"
    }, { headers: { Authorization: `Bearer ${tokenB}` }});
    const referralReqId = reqRes.data.id;
    console.log("Referral request created. ID:", referralReqId);

    // 7. User A checks their incoming requests
    console.log("User A fetching incoming requests...");
    const incomingRes = await axios.get(`${API_URL}/requests/referrals`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    const incomingReq = incomingRes.data.find(r => r.id === referralReqId);
    if (!incomingReq) {
        throw new Error("User A did not receive the referral request.");
    }
    console.log("User A received the referral request from User B.");

    // 8. User A approves the request
    console.log("User A approving the request...");
    await axios.post(`${API_URL}/referrals/${referralReqId}/approve`, null, {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    console.log("Request approved successfully.");

    // 9. Verify the final state
    console.log("Verifying final state...");
    const finalIncomingRes = await axios.get(`${API_URL}/requests/referrals`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    const finalReq = finalIncomingRes.data.find(r => r.id === referralReqId);
    if (finalReq.status !== 'ACCEPTED') {
        throw new Error(`Expected status ACCEPTED, got ${finalReq.status}`);
    }
    
    console.log("=== Test Passed Successfully! End-to-End Referral Flow Works! ===");
    
  } catch (error) {
    console.error("Test Failed:", error.response ? error.response.data : error.message);
  }
}

runTest();
