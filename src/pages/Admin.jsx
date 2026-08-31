import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { Users, Building, AlertTriangle, Settings, Activity, Check, X, Search, Edit2, ShieldCheck } from 'lucide-react';
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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [signupsData, settingsData, reportsData, companiesData] = await Promise.all([
        adminService.getPendingSignups().catch(() => []),
        adminService.getSettings().catch(() => ({ referralRequestCapPerPerson: 3 })),
        adminService.getReports().catch(() => []),
        jobService.getCompanies().catch(() => []) // We can reuse jobService for master companies
      ]);
      setSignups(signupsData);
      setReferralCap(settingsData.referralRequestCapPerPerson || 3);
      setReports(reportsData);
      setCompanies(companiesData);
    } catch (error) {
      console.error("Failed to fetch admin data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveSignup = async (id) => {
    try {
      await adminService.approveSignup(id);
      await fetchData();
    } catch (error) {
      alert("Failed to approve signup");
    }
  };

  const handleRejectSignup = async (id) => {
    try {
      await adminService.rejectSignup(id);
      await fetchData();
    } catch (error) {
      alert("Failed to reject signup");
    }
  };

  const handleReviewReport = async (id) => {
    try {
      await adminService.reviewReport(id);
      await fetchData();
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

  const navItems = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'signups', label: 'Pending Signups', icon: Users },
    { id: 'companies', label: 'Master Companies', icon: Building },
    { id: 'reports', label: 'Job Reports', icon: AlertTriangle },
    { id: 'settings', label: 'Referral Settings', icon: Settings }
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
                {item.id === 'signups' && signups.filter(s => s.status === 'PENDING').length > 0 && (
                  <span className="ml-auto bg-red-100 text-red-600 py-0.5 px-2 rounded-full text-xs">
                    {signups.filter(s => s.status === 'PENDING').length}
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
                        {signups.filter(s => s.status === 'PENDING').length + reports.filter(r => r.status === 'PENDING').length}
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
            
            <div className="space-y-4">
              {signups.map(signup => (
                <Card key={signup.id}>
                  <CardContent className="p-6 flex flex-col md:flex-row justify-between items-start gap-6">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <h3 className="font-bold text-lg text-gray-900">{signup.name} {signup.initiatedName && `(${signup.initiatedName})`}</h3>
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          signup.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          signup.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {signup.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div><span className="font-semibold text-gray-900 block mb-1">Mentor / Connection:</span> {signup.mentor}</div>
                        <div><span className="font-semibold text-gray-900 block mb-1">Email:</span> {signup.email}</div>
                        <div><span className="font-semibold text-gray-900 block mb-1">Phone:</span> {signup.phone}</div>
                      </div>
                    </div>
                    
                    {signup.approvalStatus === 'PENDING' && (
                      <div className="flex items-center gap-2 w-full md:w-auto">
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
              {signups.length === 0 && <p className="text-gray-500 py-8 text-center">No signups found.</p>}
            </div>
          </div>
        )}

        {/* COMPANIES */}
        {activeTab === 'companies' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Master Companies</h1>
              <Button size="sm"><Building className="h-4 w-4 mr-2" /> Add Company</Button>
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
              {reports.length === 0 && <p className="text-gray-500 py-8 text-center">No active reports.</p>}
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

      </div>
    </div>
  );
}
