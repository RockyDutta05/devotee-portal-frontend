import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { Users, Building, AlertTriangle, Settings, Activity, Check, X, Search, Edit2, ShieldCheck, List } from 'lucide-react';
import adminService from '../services/adminService';
import jobService from '../services/jobService';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('overview');

  const [signups, setSignups] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [reports, setReports] = useState([]);
  const [referralCap, setReferralCap] = useState(3);
  const [isLoading, setIsLoading] = useState(true);
  
  const [companySearch, setCompanySearch] = useState('');

  // Pending Signups State
  const [signupSearch, setSignupSearch] = useState('');
  const [signupSort, setSignupSort] = useState('createdAt desc');
  const [selectedSignups, setSelectedSignups] = useState([]);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [bulkRejectReason, setBulkRejectReason] = useState('');

  // Reports State
  const [reportStatus, setReportStatus] = useState('PENDING');
  const [reportSearch, setReportSearch] = useState('');

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState([]);
  const [logActionType, setLogActionType] = useState('');
  const [logStartDate, setLogStartDate] = useState('');
  const [logEndDate, setLogEndDate] = useState('');
  const [logPage, setLogPage] = useState(0);
  const [logTotalPages, setLogTotalPages] = useState(1);

  useEffect(() => {
    fetchSignups();
    fetchReports();
    fetchSettings();
    fetchCompanies();
  }, []);

  useEffect(() => {
    fetchSignups();
  }, [signupSearch, signupSort]);

  useEffect(() => {
    fetchReports();
  }, [reportStatus, reportSearch]);

  useEffect(() => {
    if (activeTab === 'activity') {
      fetchLogs();
    }
  }, [activeTab, logActionType, logStartDate, logEndDate, logPage]);

  const fetchSignups = async () => {
    try {
      const data = await adminService.getPendingSignups(signupSearch, signupSort);
      setSignups(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchReports = async () => {
    try {
      const data = await adminService.getReports(reportStatus, reportSearch);
      setReports(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchSettings = async () => {
    try {
      const data = await adminService.getSettings();
      setReferralCap(data.referralRequestCapPerPerson || 3);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCompanies = async () => {
    try {
      const data = await jobService.getCompanies();
      setCompanies(data || []);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchLogs = async () => {
    try {
      const data = await adminService.getAuditLogs(logActionType, logStartDate || null, logEndDate || null, logPage, 10);
      setAuditLogs(data.content || []);
      setLogTotalPages(data.totalPages || 1);
    } catch (e) {
      console.error(e);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedSignups.length === 0) return;
    try {
      await adminService.bulkApproveSignups(selectedSignups);
      setSelectedSignups([]);
      fetchSignups();
    } catch (e) {
      alert("Failed to bulk approve");
    }
  };

  const handleBulkReject = async () => {
    if (selectedSignups.length === 0) return;
    try {
      await adminService.bulkRejectSignups(selectedSignups, bulkRejectReason);
      setRejectModalOpen(false);
      setBulkRejectReason('');
      setSelectedSignups([]);
      fetchSignups();
    } catch (e) {
      alert("Failed to bulk reject");
    }
  };

  const toggleSignupSelection = (id) => {
    setSelectedSignups(prev => 
      prev.includes(id) ? prev.filter(sId => sId !== id) : [...prev, id]
    );
  };

  const handleApproveSignup = async (id) => {
    try {
      await adminService.approveSignup(id);
      fetchSignups();
    } catch (error) {
      alert("Failed to approve signup");
    }
  };

  const handleRejectSignup = async (id) => {
    try {
      await adminService.rejectSignup(id);
      fetchSignups();
    } catch (error) {
      alert("Failed to reject signup");
    }
  };

  const handleReviewReport = async (id) => {
    try {
      await adminService.reviewReport(id);
      fetchReports();
    } catch (error) {
      alert("Failed to review report");
    }
  };

  const handleSaveSettings = async () => {
    try {
      await adminService.updateReferralCap(referralCap);
      alert("Settings saved successfully!");
    } catch (error) {
      alert("Failed to save settings");
    }
  };

  const handleAddCompany = async () => {
    const name = prompt("Enter the name of the new master company:");
    if (!name || name.trim() === '') return;
    try {
      await jobService.createCompany({ name: name.trim() });
      alert("Company added successfully!");
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to add company.");
    }
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'signups', label: 'Pending Signups', icon: Users },
    { id: 'companies', label: 'Master Companies', icon: Building },
    { id: 'reports', label: 'Job Reports', icon: AlertTriangle },
    { id: 'settings', label: 'Referral Settings', icon: Settings },
    { id: 'activity', label: 'Activity Log', icon: List }
  ];

  const filteredCompanies = companies.filter(c => c.name.toLowerCase().includes(companySearch.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8 animate-in fade-in duration-300">
      
      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 shrink-0">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sticky top-24">
          <div className="flex items-center gap-3 mb-6 px-2 text-orange-600">
            <ShieldCheck className="h-6 w-6" />
            <h2 className="text-xl font-bold text-gray-900">Admin Panel</h2>
          </div>
          <nav className="space-y-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === item.id ? 'bg-orange-50 text-orange-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className={`h-5 w-5 ${activeTab === item.id ? 'text-orange-600' : 'text-gray-400'}`} />
                {item.label}
                {item.id === 'signups' && signups.filter(s => s.approvalStatus === 'PENDING').length > 0 && (
                  <span className="ml-auto bg-red-100 text-red-600 py-0.5 px-2 rounded-full text-xs">
                    {signups.filter(s => s.approvalStatus === 'PENDING').length}
                  </span>
                )}
                {item.id === 'reports' && reports.filter(r => r.status === 'PENDING').length > 0 && (
                  <span className="ml-auto bg-red-100 text-red-600 py-0.5 px-2 rounded-full text-xs">
                    {reports.filter(r => r.status === 'PENDING').length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 space-y-6">
        
        {/* OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Users</p>
                      <h4 className="text-2xl font-bold text-gray-900 mt-1">1,248</h4>
                    </div>
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                      <Users className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Active Jobs</p>
                      <h4 className="text-2xl font-bold text-gray-900 mt-1">42</h4>
                    </div>
                    <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                      <Activity className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Pending Actions</p>
                      <h4 className="text-2xl font-bold text-gray-900 mt-1">
                        {signups.filter(s => s.approvalStatus === 'PENDING').length + reports.filter(r => r.status === 'PENDING').length}
                      </h4>
                    </div>
                    <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                      <AlertTriangle className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* SIGNUPS */}
        {activeTab === 'signups' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Pending Signups</h1>
            <p className="text-gray-600">Review and approve new user registrations based on their community connections.</p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search by name, email, or phone..." 
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  value={signupSearch}
                  onChange={(e) => setSignupSearch(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <span className="text-sm font-medium text-gray-700">Sort by:</span>
                <select 
                  className="border border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  value={signupSort}
                  onChange={(e) => setSignupSort(e.target.value)}
                >
                  <option value="createdAt desc">Newest First</option>
                  <option value="createdAt asc">Oldest First</option>
                </select>
              </div>
            </div>

            {selectedSignups.length > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center justify-between shadow-sm animate-in slide-in-from-top-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-orange-900 bg-orange-200 px-2 py-0.5 rounded text-sm">{selectedSignups.length}</span>
                  <span className="text-orange-900 font-medium text-sm">Signups Selected</span>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 bg-white" onClick={() => setRejectModalOpen(true)}>
                    <X className="h-4 w-4 mr-1" /> Bulk Reject
                  </Button>
                  <Button className="bg-green-600 hover:bg-green-700" onClick={handleBulkApprove}>
                    <Check className="h-4 w-4 mr-1" /> Bulk Approve
                  </Button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {signups.map(signup => (
                <Card key={signup.id} className={`transition-colors ${selectedSignups.includes(signup.id) ? 'ring-2 ring-orange-400 bg-orange-50/30' : ''}`}>
                  <CardContent className="p-6 flex flex-col md:flex-row justify-between items-start gap-6 relative">
                    {signup.approvalStatus === 'PENDING' && (
                      <div className="absolute left-6 top-7">
                        <input 
                          type="checkbox" 
                          className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500 cursor-pointer"
                          checked={selectedSignups.includes(signup.id)}
                          onChange={() => toggleSignupSelection(signup.id)}
                        />
                      </div>
                    )}
                    
                    <div className={`flex-1 space-y-3 ${signup.approvalStatus === 'PENDING' ? 'pl-8' : ''}`}>
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-lg text-gray-900">{signup.name} {signup.initiatedName && `(${signup.initiatedName})`}</h3>
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          signup.approvalStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          signup.approvalStatus === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {signup.approvalStatus}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div><span className="font-semibold text-gray-900 block mb-1">Mentor / Connection:</span> {signup.connectedToName || signup.mentor}</div>
                        <div><span className="font-semibold text-gray-900 block mb-1">Email:</span> {signup.email}</div>
                        <div><span className="font-semibold text-gray-900 block mb-1">Phone:</span> {signup.phone}</div>
                      </div>
                    </div>
                    
                    {signup.approvalStatus === 'PENDING' && (
                      <div className="flex items-center gap-2 w-full md:w-auto mt-4 md:mt-0">
                        <Button variant="outline" className="flex-1 text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleRejectSignup(signup.id)}>
                          <X className="h-4 w-4 mr-1" /> Reject
                        </Button>
                        <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => handleApproveSignup(signup.id)}>
                          <Check className="h-4 w-4 mr-1" /> Approve
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
              {signups.length === 0 && <p className="text-gray-500 py-8 text-center bg-gray-50 rounded-xl border border-gray-100">No signups found matching your criteria.</p>}
            </div>

            {rejectModalOpen && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-in fade-in">
                <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl animate-in zoom-in-95">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Bulk Reject Signups</h3>
                  <p className="text-sm text-gray-500 mb-4">You are about to reject {selectedSignups.length} signup(s). You can provide an optional shared reason for this rejection.</p>
                  
                  <div className="space-y-1 mb-6">
                    <label className="text-sm font-medium text-gray-700">Rejection Reason (Optional)</label>
                    <textarea 
                      className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none min-h-[100px]"
                      placeholder="e.g. Could not verify temple connection details..."
                      value={bulkRejectReason}
                      onChange={(e) => setBulkRejectReason(e.target.value)}
                    ></textarea>
                  </div>
                  
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => { setRejectModalOpen(false); setBulkRejectReason(''); }}>Cancel</Button>
                    <Button className="bg-red-600 hover:bg-red-700" onClick={handleBulkReject}>Confirm Rejection</Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* COMPANIES */}
        {activeTab === 'companies' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Master Companies</h1>
              <Button size="sm" onClick={handleAddCompany}><Building className="h-4 w-4 mr-2" /> Add Company</Button>
            </div>
            
            <Card>
              <div className="p-4 border-b border-gray-100 relative">
                <Search className="absolute left-7 top-6 h-5 w-5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search companies..." 
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  value={companySearch}
                  onChange={(e) => setCompanySearch(e.target.value)}
                />
              </div>
              <ul className="divide-y divide-gray-100">
                {filteredCompanies.map(company => (
                  <li key={company.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-gray-900">{company.name}</span>
                      {company.status === 'PENDING' && (
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded font-semibold">Pending Approval</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {company.status === 'PENDING' && (
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-xs py-1 h-auto" onClick={() => handleAction(setCompanies, company.id, 'APPROVED')}>Approve</Button>
                      )}
                      <button className="p-2 text-gray-400 hover:text-orange-600 rounded-full hover:bg-orange-50"><Edit2 className="h-4 w-4" /></button>
                    </div>
                  </li>
                ))}
                {filteredCompanies.length === 0 && (
                  <li className="p-8 text-center text-gray-500">No companies match your search.</li>
                )}
              </ul>
            </Card>
          </div>
        )}

        {/* REPORTS */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Job Reports</h1>
            <p className="text-gray-600">Review jobs flagged by the community for moderation.</p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex bg-gray-100 p-1 rounded-lg w-full sm:w-auto">
                {['PENDING', 'REVIEWED'].map(status => (
                  <button
                    key={status}
                    onClick={() => setReportStatus(status)}
                    className={`flex-1 sm:flex-none px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      reportStatus === status ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {status === 'PENDING' ? 'Pending Review' : 'Reviewed'}
                  </button>
                ))}
              </div>
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search reported jobs..." 
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  value={reportSearch}
                  onChange={(e) => setReportSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4">
              {reports.map(report => (
                <Card key={report.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                          <h3 className="font-bold text-lg text-gray-900">Reported Job: {report.job}</h3>
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            report.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {report.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700"><span className="font-semibold text-gray-900">Reported by:</span> {report.reporter}</p>
                        <div className="bg-red-50 text-red-900 p-4 rounded-xl border border-red-100 mt-2 text-sm">
                          <span className="font-semibold block mb-1">Reason:</span>
                          {report.reason}
                        </div>
                      </div>
                      
                      {report.status === 'PENDING' && (
                        <div className="flex flex-col gap-2 w-full md:w-auto mt-4 md:mt-0">
                          <Button className="bg-red-600 hover:bg-red-700" onClick={() => handleReviewReport(report.id)}>
                            Delete Job (Review)
                          </Button>
                          <Button variant="outline" onClick={() => handleReviewReport(report.id)}>
                            Dismiss Report
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {reports.length === 0 && <p className="text-gray-500 py-8 text-center bg-gray-50 rounded-xl border border-gray-100">No active reports match your criteria.</p>}
            </div>
          </div>
        )}

        {/* SETTINGS */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Referral Settings</h1>
            
            <Card>
              <CardContent className="p-6 max-w-md">
                <div className="space-y-4">
                  <Input 
                    label="Referral Request Cap Per Person" 
                    type="number"
                    value={referralCap}
                    onChange={(e) => setReferralCap(e.target.value)}
                  />
                  <p className="text-xs text-gray-500">
                    Maximum number of active referral requests a single user can have at any given time.
                  </p>
                  <Button className="mt-4" onClick={handleSaveSettings}>Save Settings</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ACTIVITY LOG */}
        {activeTab === 'activity' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Activity Log</h1>
            <p className="text-gray-600">Audit trail of administrative actions performed on the platform.</p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <span className="text-sm font-medium text-gray-700">Filter Action:</span>
                <select 
                  className="border border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none w-full sm:w-auto"
                  value={logActionType}
                  onChange={(e) => { setLogActionType(e.target.value); setLogPage(0); }}
                >
                  <option value="">All Actions</option>
                  <option value="SIGNUP_APPROVED">Signup Approved</option>
                  <option value="SIGNUP_REJECTED">Signup Rejected</option>
                  <option value="COMPANY_EDITED">Company Edited</option>
                  <option value="COMPANY_DEACTIVATED">Company Deactivated</option>
                  <option value="JOB_STATUS_ADDED">Job Status Added</option>
                  <option value="JOB_STATUS_EDITED">Job Status Edited</option>
                  <option value="REFERRAL_CAP_UPDATED">Referral Cap Updated</option>
                  <option value="REPORT_REVIEWED">Report Reviewed</option>
                </select>
                <div className="flex items-center gap-2">
                  <input 
                    type="date"
                    className="border border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    value={logStartDate}
                    onChange={(e) => { setLogStartDate(e.target.value); setLogPage(0); }}
                  />
                  <span className="text-gray-500 text-sm">to</span>
                  <input 
                    type="date"
                    className="border border-gray-300 rounded-lg py-2 px-3 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    value={logEndDate}
                    onChange={(e) => { setLogEndDate(e.target.value); setLogPage(0); }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setLogPage(Math.max(0, logPage - 1))} disabled={logPage === 0}>Previous</Button>
                <span className="text-sm text-gray-600 px-2">Page {logPage + 1} of {logTotalPages}</span>
                <Button variant="outline" size="sm" onClick={() => setLogPage(Math.min(logTotalPages - 1, logPage + 1))} disabled={logPage >= logTotalPages - 1}>Next</Button>
              </div>
            </div>

            <Card>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600">
                  <thead className="bg-gray-50 border-b border-gray-100 text-gray-900 font-semibold">
                    <tr>
                      <th className="p-4">Timestamp</th>
                      <th className="p-4">Admin</th>
                      <th className="p-4">Action</th>
                      <th className="p-4">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {auditLogs.map(log => (
                      <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-4 whitespace-nowrap text-gray-500">{new Date(log.createdAt).toLocaleString()}</td>
                        <td className="p-4 font-medium text-gray-900">{log.adminUser}</td>
                        <td className="p-4">
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-md text-xs font-semibold">
                            {log.actionType}
                          </span>
                        </td>
                        <td className="p-4">{log.details || '-'}</td>
                      </tr>
                    ))}
                    {auditLogs.length === 0 && (
                      <tr>
                        <td colSpan="4" className="p-8 text-center text-gray-500">No activity logs found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

      </div>
    </div>
  );
}
