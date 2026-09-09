import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import profileService from '../services/profileService';
import { Card, CardContent } from '../components/Card';
import Button from '../components/Button';
import ContactRequestModal from '../components/ContactRequestModal';
import ConnectRequestModal from '../components/ConnectRequestModal';
import { useToast } from '../hooks/useToast';

export default function PublicProfile() {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await profileService.getProfileById(userId);
        setProfile(data);
      } catch (err) {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [userId]);

  const handleContactRequest = async (reason) => {
    try {
      await profileService.requestContactInfo(userId, reason);
      toast.success('Contact request sent');
      setContactModalOpen(false);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to send request');
    }
  };

  const handleConnectRequest = async (message) => {
    try {
      await profileService.connectRequest(userId, message);
      toast.success('Connect request sent');
      setConnectModalOpen(false);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to send connect request');
    }
  };

  if (loading) return <div className="text-center mt-12">Loading profile...</div>;
  if (error) return <div className="text-center text-red-600 mt-12">{error}</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-8">
      <Card>
        <CardContent className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{profile.name}</h1>
          {profile.initiatedName && <p className="text-gray-600">{profile.initiatedName}</p>}
          <div className="mt-4 space-y-2">
            <p><strong>Chanting Rounds:</strong> {profile.chantingRounds}</p>
            <p><strong>Connected To:</strong> {profile.connectedToName} ({profile.connectedToTemple})</p>
            <p><strong>Contact:</strong> {profile.connectedToContact}</p>
            {profile.hideEmployer ? (
              <p className="text-gray-500 italic">Employer info hidden by user</p>
            ) : (
              <>
                <p><strong>Job Title:</strong> {profile.jobTitle}</p>
                <p><strong>Current Employer:</strong> {profile.currentEmployer}</p>
                <p><strong>Location:</strong> {profile.location}</p>
              </>
            )}
          </div>
          <div className="mt-6 flex gap-4">
            <Button onClick={() => setContactModalOpen(true)}>Request Contact Info</Button>
            <Button onClick={() => setConnectModalOpen(true)}>Connect</Button>
          </div>
        </CardContent>
      </Card>

      <ContactRequestModal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        onSubmit={handleContactRequest}
      />
      <ConnectRequestModal
        isOpen={connectModalOpen}
        onClose={() => setConnectModalOpen(false)}
        onSubmit={handleConnectRequest}
      />
    </div>
  );
}
