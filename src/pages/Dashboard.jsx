import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import Button from '../components/Button';
import { 
  Briefcase, FileText, Users, Bell, 
  ChevronRight, Edit, Upload, Search, 
  UserPlus, MessageSquare, MapPin, Building
} from 'lucide-react';
import jobService from '../services/jobService';
import profileService from '../services/profileService';

const StatBox = ({ title, value, icon: Icon, colorClass }) => (
  <Card>
    <CardContent className="flex items-center gap-4 p-6">
      <div className={`p-4 rounded-xl ${colorClass}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <h4 className="text-2xl font-bold text-gray-900">{value}</h4>
      </div>
    </CardContent>
  </Card>
);

export default function Dashboard() {
  const { user } = useAuth();
  const [recentJobs, setRecentJobs] = useState([]);
  const [profileCompletion, setProfileCompletion] = useState(0);
  
  useEffect(() => {
    // Fetch profile for accurate completion stats
    profileService.getMe().then(data => {
      let filled = 0;
      const fields = ['name', 'email', 'phone', 'initiatedName', 'chantingRounds', 'connectedToName', 'connectedToContact', 'currentEmployer', 'jobTitle', 'location'];
      fields.forEach(field => {
        if (data[field] !== null && data[field] !== undefined && data[field] !== '') filled++;
      });
      setProfileCompletion(Math.round((filled / fields.length) * 100));
    }).catch(err => console.error("Failed to load profile for dashboard", err));

    jobService.getJobs().then(jobs => {
      // Sort by newest and take top 3
      const sorted = jobs.sort((a, b) => new Date(b.createdAt || b.postedAt || 0) - new Date(a.createdAt || a.postedAt || 0));
      setRecentJobs(sorted.slice(0, 3));
    }).catch(err => console.error("Failed to load jobs for dashboard", err));
  }, []);

  // Mock Data for stats
  const stats = {
    availableJobs: 142,
    myResumes: 2,
    referralOpportunities: 89,
    pendingReferrals: 1,
    pendingContacts: 3
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (hours < 24) return `${Math.max(1, hours)} hours ago`;
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name || 'Devotee'}!</h1>
          <p className="text-gray-600 mt-2">Here's what is happening in the community today.</p>
        </div>
        
        {/* Profile Completion */}
        <div className="flex items-center gap-4 bg-orange-50 p-4 rounded-xl border border-orange-100">
          <div className="relative h-14 w-14 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path className="text-orange-200" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className="text-orange-600" strokeWidth="3" strokeDasharray={`${profileCompletion}, 100`} stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <span className="absolute text-sm font-bold text-orange-700">{profileCompletion}%</span>
          </div>
          <div>
            <p className="font-semibold text-gray-900">Profile Completion</p>
            <Link to="/profile" className="text-sm text-orange-600 hover:underline">Complete profile &rarr;</Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatBox title="Available Jobs" value={stats.availableJobs} icon={Briefcase} colorClass="bg-blue-100 text-blue-600" />
        <StatBox title="My Resumes" value={stats.myResumes} icon={FileText} colorClass="bg-purple-100 text-purple-600" />
        <StatBox title="Referrers Available" value={stats.referralOpportunities} icon={Users} colorClass="bg-green-100 text-green-600" />
        <StatBox title="Pending Requests" value={stats.pendingContacts + stats.pendingReferrals} icon={Bell} colorClass="bg-red-100 text-red-600" />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Jobs & Quick Actions */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Link to="/profile" className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-orange-50 hover:border-orange-200 transition-colors gap-2 text-center">
                <Edit className="h-6 w-6 text-orange-600" />
                <span className="text-sm font-medium text-gray-700">Edit Profile</span>
              </Link>
              <Link to="/resumes" className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-orange-50 hover:border-orange-200 transition-colors gap-2 text-center">
                <Upload className="h-6 w-6 text-orange-600" />
                <span className="text-sm font-medium text-gray-700">Upload Resume</span>
              </Link>
              <Link to="/jobs" className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-orange-50 hover:border-orange-200 transition-colors gap-2 text-center">
                <Search className="h-6 w-6 text-orange-600" />
                <span className="text-sm font-medium text-gray-700">Browse Jobs</span>
              </Link>
              <Link to="/referrals" className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-orange-50 hover:border-orange-200 transition-colors gap-2 text-center">
                <UserPlus className="h-6 w-6 text-orange-600" />
                <span className="text-sm font-medium text-gray-700">Find Referrers</span>
              </Link>
              <Link to="/requests" className="flex flex-col items-center justify-center p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-orange-50 hover:border-orange-200 transition-colors gap-2 text-center">
                <MessageSquare className="h-6 w-6 text-orange-600" />
                <span className="text-sm font-medium text-gray-700">View Requests</span>
              </Link>
            </CardContent>
          </Card>

          {/* Recent Jobs */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Job Postings</CardTitle>
              <Link to="/jobs" className="text-sm font-medium text-orange-600 hover:underline flex items-center">
                View all <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </CardHeader>
            <div className="divide-y divide-gray-100">
              {recentJobs.map(job => (
                <div key={job.id} className="p-6 hover:bg-gray-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-semibold text-gray-900 text-lg">{job.title}</h4>
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                        {job.status || 'Hiring'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1"><Building className="h-4 w-4" /> {job.company?.name || job.company}</span>
                      <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {job.location || 'Remote'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 md:flex-col md:items-end">
                    <span className="text-xs text-gray-400">{formatDate(job.createdAt || job.postedAt)}</span>
                    <Link to="/jobs">
                      <Button variant="outline" className="text-sm py-1.5">View Details</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Pending Requests */}
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Pending Action Required</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* Request Item */}
              <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                <div className="flex items-start justify-between mb-2">
                  <h5 className="font-semibold text-gray-900 text-sm">Contact Info Request</h5>
                  <span className="h-2 w-2 rounded-full bg-orange-500 mt-1.5"></span>
                </div>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  "Hi, I would love to connect to discuss the software engineering role at your company."
                </p>
                <div className="flex gap-2">
                  <Link to="/requests" className="w-full">
                    <Button size="sm" className="w-full text-xs py-1.5">Review</Button>
                  </Link>
                </div>
              </div>

              {/* Request Item */}
              <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                <div className="flex items-start justify-between mb-2">
                  <h5 className="font-semibold text-gray-900 text-sm">Referral Request</h5>
                  <span className="h-2 w-2 rounded-full bg-orange-500 mt-1.5"></span>
                </div>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  Target Company: <strong>InnovateX</strong><br/>
                  "I have applied for the Product Manager role. Please refer me."
                </p>
                <div className="flex gap-2">
                  <Link to="/requests" className="w-full">
                    <Button size="sm" className="w-full text-xs py-1.5">Review</Button>
                  </Link>
                </div>
              </div>

              <Link to="/requests" className="block text-center text-sm font-medium text-orange-600 hover:underline pt-2">
                See all {stats.pendingContacts + stats.pendingReferrals} requests
              </Link>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
