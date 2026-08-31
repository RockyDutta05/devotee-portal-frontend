import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent } from '../components/Card';
import Button from '../components/Button';
import { ProfileForm } from '../components/ProfileForm';
import { Eye, Edit, Save, X, AlertCircle } from 'lucide-react';
import profileService from '../services/profileService';

export default function Profile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isPublicView, setIsPublicView] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [initialData, setInitialData] = useState({});
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const data = await profileService.getMe();
      setInitialData(data);
      setFormData(data);
    } catch (err) {
      setError('Failed to load profile data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = async () => {
    try {
      const updated = await profileService.updateMe(formData);
      setInitialData(updated);
      setFormData(updated);
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    }
  };

  const handleCancel = () => {
    setFormData(initialData); // Revert changes
    setIsEditing(false);
    setError('');
  };

  if (isLoading) {
    return <div className="text-center mt-12">Loading profile...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600">Manage your personal and professional details.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!isEditing && (
            <Button 
              variant={isPublicView ? 'primary' : 'outline'}
              className="flex items-center gap-2"
              onClick={() => setIsPublicView(!isPublicView)}
            >
              <Eye className="h-4 w-4" />
              {isPublicView ? 'Exit Public Preview' : 'Preview Public Profile'}
            </Button>
          )}
          {!isPublicView && !isEditing && (
            <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2">
              <Edit className="h-4 w-4" /> Edit Profile
            </Button>
          )}
          {isEditing && (
            <>
              <Button variant="ghost" onClick={handleCancel} className="flex items-center gap-2">
                <X className="h-4 w-4" /> Cancel
              </Button>
              <Button onClick={handleSave} className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
                <Save className="h-4 w-4" /> Save Changes
              </Button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-800 p-4 rounded-xl border border-red-100 flex items-start sm:items-center gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 sm:mt-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {isPublicView && (
        <div className="bg-blue-50 text-blue-800 p-4 rounded-xl border border-blue-100 flex items-start sm:items-center gap-3">
          <Eye className="h-5 w-5 shrink-0 mt-0.5 sm:mt-0" />
          <p className="text-sm font-medium">
            You are viewing how your profile appears to other users. Your email and phone number are hidden by default, and others must send a "Contact Info Request" to view them.
          </p>
        </div>
      )}

      <Card>
        <CardContent className="p-8">
          <ProfileForm 
            formData={formData} 
            isEditing={isEditing} 
            onChange={handleChange}
            isPublicView={isPublicView}
          />
        </CardContent>
      </Card>
    </div>
  );
}
