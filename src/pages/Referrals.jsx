import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import { UserPlus, Search, Building, Plus, Trash2, ShieldAlert, Send } from 'lucide-react';
import referralService from '../services/referralService';
import profileService from '../services/profileService';
import { useAuth } from '../context/AuthContext';

export default function Referrals() {
  const { user } = useAuth();
  // My Settings State
  const [isWilling, setIsWilling] = useState(false);
  const [myCompanies, setMyCompanies] = useState([]);
  const [newCompany, setNewCompany] = useState('');

  // Find Referrers State
  const [searchCompany, setSearchCompany] = useState('');
  const [referrers, setReferrers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Request Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReferrer, setSelectedReferrer] = useState(null);
  const [requestsUsed, setRequestsUsed] = useState(0);
  const [requestLimit, setRequestLimit] = useState(3);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const referrersData = await referralService.getWillingReferrers();
      setReferrers(referrersData);
      
      // In a real scenario, you might have separate endpoints to fetch My Referrals settings and caps
      // Since it's not strictly specified how user's own willingness is retrieved, we can fallback to profile or mock for now, but assume referrers API might not return it.
      // Let's assume we can fetch our own willingness from profile or a specific referral endpoint if it existed.
    } catch (error) {
      console.error("Failed to load referrers", error);
    } finally {
      setIsLoading(false);
    }
  };

  const [formData, setFormData] = useState({
    jobTitle: '',
    jobIdLink: '',
    company: '',
    comments: ''
  });

  const handleAddCompany = async (e) => {
    e.preventDefault();
    if (newCompany.trim() && !myCompanies.includes(newCompany.trim())) {
      try {
        await referralService.addCompany(newCompany.trim());
        setMyCompanies([...myCompanies, newCompany.trim()]);
        setNewCompany('');
      } catch (error) {
        alert("Failed to add company");
      }
    }
  };

  const handleRemoveCompany = async (company) => {
    try {
      await referralService.removeCompany(company);
      setMyCompanies(myCompanies.filter(c => c !== company));
    } catch (error) {
      alert("Failed to remove company");
    }
  };

  const handleWillingnessToggle = async (e) => {
    const checked = e.target.checked;
    try {
      await referralService.updateWillingness(checked);
      setIsWilling(checked);
    } catch (error) {
      alert("Failed to update status");
    }
  };

  const handleOpenRequest = (referrer) => {
    setSelectedReferrer(referrer);
    setFormData(prev => ({ ...prev, company: searchCompany || referrer.companies[0] || '' }));
    setIsModalOpen(true);
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    if (requestsUsed >= requestLimit) {
      alert("You have reached the maximum active referral requests limit.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await referralService.createReferralRequest({
        ...formData,
        referrerId: selectedReferrer.userId || selectedReferrer.id
      });
      setRequestsUsed(prev => prev + 1);
      setIsModalOpen(false);
      alert(`Referral request sent to ${selectedReferrer.name}!`);
      setFormData({ jobTitle: '', jobIdLink: '', company: '', comments: '' });
    } catch (error) {
      alert(error.response?.data?.message || "Failed to send referral request");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Derive priority vs general referrers based on search
  const { priorityReferrers, generalReferrers } = useMemo(() => {
    if (!searchCompany.trim()) {
      return { priorityReferrers: [], generalReferrers: referrers };
    }
    
    const term = searchCompany.toLowerCase().trim();
    const priority = [];
    const general = [];

    referrers.forEach(r => {
      const hasMatch = r.companies && r.companies.some(c => (c.name || c).toLowerCase().includes(term));
      if (hasMatch) {
        priority.push(r);
      } else {
        general.push(r);
      }
    });

    return { priorityReferrers: priority, generalReferrers: general };
  }, [searchCompany, referrers]);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Referral Network</h1>
          <p className="text-gray-600">Offer referrals or request them from the community.</p>
        </div>
        <div className="bg-orange-50 px-4 py-2 rounded-lg border border-orange-100 flex items-center gap-3">
          <ShieldAlert className="h-5 w-5 text-orange-600" />
          <div className="text-sm">
            <span className="block text-orange-800 font-semibold">Active Requests</span>
            <span className="text-orange-600 font-medium">{requestsUsed} / {requestLimit} Used</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: My Settings */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>My Referral Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <input 
                  type="checkbox" 
                  id="isWilling" 
                  checked={isWilling}
                  onChange={handleWillingnessToggle}
                  className="h-5 w-5 mt-0.5 text-orange-600 rounded border-gray-300 focus:ring-orange-500"
                />
                <div>
                  <label htmlFor="isWilling" className="font-semibold text-gray-900 block mb-1">
                    I am willing to refer others
                  </label>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    By checking this, you will appear in the search results for devotees looking for referrals.
                  </p>
                </div>
              </div>

              {isWilling && (
                <div className="space-y-4 pt-4 border-t border-gray-100 animate-in fade-in duration-300">
                  <h4 className="font-medium text-gray-900 text-sm">Companies I can refer for:</h4>
                  
                  <ul className="space-y-2">
                    {myCompanies.map(c => (
                      <li key={c} className="flex justify-between items-center bg-white border border-gray-200 px-3 py-2 rounded-lg text-sm">
                        <span className="flex items-center gap-2 font-medium text-gray-700">
                          <Building className="h-4 w-4 text-gray-400" /> {c}
                        </span>
                        <button onClick={() => handleRemoveCompany(c)} className="text-gray-400 hover:text-red-500 transition-colors">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                    {myCompanies.length === 0 && (
                      <li className="text-sm text-gray-500 italic">No companies added yet.</li>
                    )}
                  </ul>

                  <form onSubmit={handleAddCompany} className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Add company..." 
                      className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none"
                      value={newCompany}
                      onChange={(e) => setNewCompany(e.target.value)}
                    />
                    <Button type="submit" size="sm" variant="outline" className="px-3" disabled={!newCompany.trim()}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Find Referrers */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <div className="w-full">
                <CardTitle className="mb-4">Find a Referrer</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search by target company (e.g. Google)..." 
                    className="w-full pl-10 pr-4 py-2.5 text-base border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    value={searchCompany}
                    onChange={(e) => setSearchCompany(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-8 bg-gray-50/50">
              
              {/* Priority Referrers (Direct Match) */}
              {searchCompany && priorityReferrers.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-green-700 flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
                    Priority Matches ({priorityReferrers.length})
                  </h4>
                  <p className="text-sm text-gray-500 mb-2">These devotees explicitly list your target company.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {priorityReferrers.map(r => (
                      <div key={r.id} className="bg-white p-4 rounded-xl border border-green-200 shadow-sm">
                        <h5 className="font-bold text-gray-900">{r.name}</h5>
                        <p className="text-sm text-gray-500 mb-2">{r.role}</p>
                        <div className="flex flex-wrap gap-1 mb-4">
                          {r.companies && r.companies.map(c => {
                            const compName = c.name || c;
                            return (
                              <span key={compName} className={`px-2 py-0.5 rounded text-xs font-medium ${compName.toLowerCase().includes(searchCompany.toLowerCase()) ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                {compName}
                              </span>
                            );
                          })}
                        </div>
                        <Button size="sm" className="w-full text-xs" onClick={() => handleOpenRequest(r)}>
                          Request Referral
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* General Referrers */}
              <div className="space-y-3">
                {searchCompany && <h4 className="font-semibold text-gray-700 mt-6 border-t pt-6">Other Willing Referrers</h4>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {generalReferrers.map(r => (
                    <div key={r.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                      <h5 className="font-bold text-gray-900">{r.name}</h5>
                      <p className="text-sm text-gray-500 mb-2">{r.role}</p>
                      <div className="flex flex-wrap gap-1 mb-4">
                        {r.companies && r.companies.length > 0 ? r.companies.map(c => (
                          <span key={c.name || c} className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                            {c.name || c}
                          </span>
                        )) : (
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-600 italic">
                            General Referrals
                          </span>
                        )}
                      </div>
                      <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => handleOpenRequest(r)}>
                        Ask to connect
                      </Button>
                    </div>
                  ))}
                  {generalReferrers.length === 0 && !priorityReferrers.length && (
                     <div className="col-span-full py-8 text-center text-gray-500">
                        No referrers found matching your search.
                     </div>
                  )}
                </div>
              </div>

            </CardContent>
          </Card>
        </div>
      </div>

      {/* Referral Request Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Send Referral Request">
        {selectedReferrer && (
          <form onSubmit={handleRequestSubmit} className="space-y-4 mt-2">
            
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4 text-sm text-blue-800">
              You are requesting a referral from <strong>{selectedReferrer.name}</strong>. 
              Be polite, professional, and provide all necessary information to make it easy for them to refer you.
            </div>

            <Input 
              label="Target Company" 
              name="company" 
              value={formData.company} 
              onChange={e => setFormData({...formData, company: e.target.value})} 
              required 
            />

            <Input 
              label="Job Title" 
              name="jobTitle" 
              value={formData.jobTitle} 
              onChange={e => setFormData({...formData, jobTitle: e.target.value})} 
              required 
              placeholder="e.g. Frontend Developer"
            />

            <Input 
              label="Job ID or Link (Crucial for large companies)" 
              name="jobIdLink" 
              value={formData.jobIdLink} 
              onChange={e => setFormData({...formData, jobIdLink: e.target.value})} 
              required 
              placeholder="https://..."
            />

            <div className="w-full flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Message / Comments</label>
              <textarea 
                name="comments"
                value={formData.comments}
                onChange={e => setFormData({...formData, comments: e.target.value})} 
                rows={4}
                required
                className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Briefly explain why you are a good fit for this role. Max 500 characters."
              />
            </div>

            {/* Note about attaching resume */}
            <div className="flex items-start gap-2 text-xs text-gray-500 italic mt-2">
              <UserPlus className="h-4 w-4 shrink-0 text-orange-500" />
              <span>Your default active resume will be attached to this request automatically.</span>
            </div>

            <div className="flex justify-between items-center pt-4 border-t mt-6">
              <div className="text-xs font-semibold text-gray-500">
                Requests used: {requestsUsed}/{requestLimit}
              </div>
              <div className="flex gap-3">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={requestsUsed >= requestLimit || isSubmitting} className="flex items-center gap-2">
                  <Send className="h-4 w-4" /> {isSubmitting ? 'Sending...' : 'Send Request'}
                </Button>
              </div>
            </div>
          </form>
        )}
      </Modal>

    </div>
  );
}
