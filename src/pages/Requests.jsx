import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/Card';
import Button from '../components/Button';
import { Check, X, Building, MessageSquare, User, FileText, Lock, Unlock } from 'lucide-react';
import requestService from '../services/requestService';
import referralService from '../services/referralService';

export default function Requests() {
  const [activeTab, setActiveTab] = useState('referral');

  const [referralRequests, setReferralRequests] = useState([]);
  const [contactRequests, setContactRequests] = useState([]);
  const [connectRequests, setConnectRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [refData, contactData, connectData] = await Promise.all([
        referralService.getIncomingRequests().catch(() => []),
        requestService.getIncomingRequests().catch(() => []),
        requestService.getIncomingConnectRequests().catch(() => [])
      ]);
      
      setReferralRequests(refData);
      setContactRequests(contactData);
      setConnectRequests(connectData);
    } catch (error) {
      console.error("Failed to load requests", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (type, id, action) => {
    const isApprove = action === 'approve';
    try {
      if (type === 'referral') {
        if (isApprove) await referralService.approveRequest(id);
        else await referralService.rejectRequest(id);
      } else if (type === 'contact') {
        if (isApprove) await requestService.approveContactRequest(id);
        else await requestService.rejectContactRequest(id);
      } else if (type === 'connect') {
        if (isApprove) await requestService.approveConnectRequest(id);
        else await requestService.rejectConnectRequest(id);
      }
      // Re-fetch to get updated state (including revealed email/phone)
      await fetchData();
    } catch (error) {
      alert("Failed to perform action");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2 py-1 rounded text-xs font-semibold bg-yellow-100 text-yellow-800">Pending Review</span>;
      case 'APPROVED':
        return <span className="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800">Approved</span>;
      case 'REJECTED':
        return <span className="px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-800">Rejected</span>;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-900">Requests Inbox</h1>
        <p className="text-gray-600 mt-1">Manage incoming requests from the community.</p>
        
        {/* Tabs */}
        <div className="flex border-b border-gray-200 mt-6 overflow-x-auto">
          <button 
            className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === 'referral' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            onClick={() => setActiveTab('referral')}
          >
            Referral Requests
          </button>
          <button 
            className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === 'contact' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            onClick={() => setActiveTab('contact')}
          >
            Contact Info Requests
          </button>
          <button 
            className={`px-6 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeTab === 'connect' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            onClick={() => setActiveTab('connect')}
          >
            Connect Requests
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading && <p className="text-center py-8 text-gray-500">Loading requests...</p>}
        
        {/* REFERRAL TAB */}
        {!isLoading && activeTab === 'referral' && (
          <>
            {referralRequests.map(req => (
              <Card key={req.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 mb-2">
                        <User className="h-5 w-5 text-gray-400" />
                        <h3 className="font-bold text-lg text-gray-900">{req.requesterName || req.requester?.name || 'User'}</h3>
                        {getStatusBadge(req.status)}
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-2">
                        <span className="flex items-center gap-1 font-medium"><Building className="h-4 w-4" /> {req.company}</span>
                        <span className="flex items-center gap-1"><FileText className="h-4 w-4" /> {req.jobTitle}</span>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700 border border-gray-100">
                        <span className="font-semibold block mb-1">Message:</span>
                        {req.comments}
                      </div>
                    </div>
                    
                    {req.status === 'PENDING' && (
                      <div className="flex items-center gap-2 mt-4 md:mt-0 whitespace-nowrap">
                        <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleAction('referral', req.id, 'reject')}>
                          <X className="h-4 w-4 mr-1" /> Reject
                        </Button>
                        <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleAction('referral', req.id, 'approve')}>
                          <Check className="h-4 w-4 mr-1" /> Approve
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {referralRequests.length === 0 && <p className="text-center text-gray-500 py-8">No referral requests.</p>}
          </>
        )}

        {/* CONTACT TAB */}
        {!isLoading && activeTab === 'contact' && (
          <>
            {contactRequests.map(req => (
              <Card key={req.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-gray-400" />
                        <h3 className="font-bold text-lg text-gray-900">{req.requesterName || req.requester?.name || 'User'}</h3>
                        {getStatusBadge(req.status)}
                      </div>
                      <p className="text-sm text-gray-700">
                        <span className="font-semibold">Reason:</span> {req.reason}
                      </p>
                      
                      {/* Masked vs Unmasked Details */}
                      <div className={`p-4 rounded-xl border ${req.status === 'APPROVED' ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                        <div className="flex items-center gap-2 mb-2 font-semibold text-gray-900 text-sm">
                          {req.status === 'APPROVED' ? <Unlock className="h-4 w-4 text-green-600" /> : <Lock className="h-4 w-4 text-gray-500" />}
                          Contact Information
                        </div>
                        {req.status === 'APPROVED' ? (
                          <div className="text-sm space-y-1 text-gray-700 font-medium">
                            <p>Email: <a href={`mailto:${req.email || req.requester?.email}`} className="text-orange-600 hover:underline">{req.email || req.requester?.email}</a></p>
                            <p>Phone: {req.phone || req.requester?.phone}</p>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 italic">
                            Email and Phone are masked until you approve this request.
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {req.status === 'PENDING' && (
                      <div className="flex flex-col sm:flex-row items-center gap-2 mt-4 md:mt-0 whitespace-nowrap">
                        <Button variant="outline" className="w-full sm:w-auto text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleAction('contact', req.id, 'reject')}>
                          Reject
                        </Button>
                        <Button className="w-full sm:w-auto bg-green-600 hover:bg-green-700" onClick={() => handleAction('contact', req.id, 'approve')}>
                          Approve
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {contactRequests.length === 0 && <p className="text-center text-gray-500 py-8">No contact requests.</p>}
          </>
        )}

        {/* CONNECT TAB */}
        {!isLoading && activeTab === 'connect' && (
          <>
            {connectRequests.map(req => (
              <Card key={req.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-gray-400" />
                        <h3 className="font-bold text-lg text-gray-900">{req.requesterName || req.requester?.name || 'User'}</h3>
                        {getStatusBadge(req.status)}
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700 border border-gray-100 flex items-start gap-3">
                        <MessageSquare className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
                        <p>{req.message}</p>
                      </div>
                    </div>
                    
                    {req.status === 'PENDING' && (
                      <div className="flex items-center gap-2 mt-4 md:mt-0 whitespace-nowrap">
                        <Button variant="outline" onClick={() => handleAction('connect', req.id, 'reject')}>
                          Decline
                        </Button>
                        <Button onClick={() => handleAction('connect', req.id, 'approve')}>
                          Accept
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {connectRequests.length === 0 && <p className="text-center text-gray-500 py-8">No connect requests.</p>}
          </>
        )}

      </div>
    </div>
  );
}
