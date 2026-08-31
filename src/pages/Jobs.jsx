import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import { Search, Building, Clock, Filter, Plus, ExternalLink, Flag } from 'lucide-react';
import jobService from '../services/jobService';

const mockStatuses = ['Urgently Hiring', 'Hiring', 'Position Filled'];

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    company: '',
    status: '',
    noticePeriod: ''
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    jobIdOrLink: '',
    comments: '',
    noticePeriodRequirement: '',
    status: 'Hiring'
  });

  // Autocomplete state
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [companySuggestions, setCompanySuggestions] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [jobsData, companiesData] = await Promise.all([
        jobService.getJobs(),
        jobService.getCompanies()
      ]);
      setJobs(jobsData);
      setCompanies(companiesData);
    } catch (error) {
      console.error("Failed to fetch jobs/companies", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (formData.company) {
      jobService.getCompanies(formData.company).then(data => {
        setCompanySuggestions(data);
      }).catch(() => setCompanySuggestions([]));
    } else {
      setCompanySuggestions([]);
    }
  }, [formData.company]);

  const filteredJobs = useMemo(() => {
    return jobs
      .filter(job => {
        const matchesSearch = job.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              job.comments?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCompany = filters.company ? job.company?.name === filters.company || job.company === filters.company : true;
        const matchesStatus = filters.status ? job.status === filters.status : true;
        const matchesNotice = filters.noticePeriod ? job.noticePeriodRequirement?.toLowerCase().includes(filters.noticePeriod.toLowerCase()) : true;
        
        return matchesSearch && matchesCompany && matchesStatus && matchesNotice;
      });
  }, [jobs, searchTerm, filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await jobService.createJob({
        ...formData,
        companyName: formData.company // adjust payload based on API
      });
      setIsModalOpen(false);
      setFormData({
        title: '', company: '', jobIdOrLink: '', comments: '', noticePeriodRequirement: '', status: 'Hiring'
      });
      fetchData(); // Refresh list
    } catch (error) {
      console.error("Failed to post job", error);
      alert(error.response?.data?.message || "Failed to post job.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReport = (id) => {
    const reason = prompt("Why are you reporting this job post?");
    if (reason) {
      alert("Job reported successfully. Admin will review it.");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (hours < 24) return `${hours} hours ago`;
    if (days === 1) return 'Yesterday';
    return `${days} days ago`;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-300">
      
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Job Board</h1>
          <p className="text-gray-600">Browse opportunities shared by the community.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 whitespace-nowrap">
          <Plus className="h-4 w-4" /> Post a Job
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Filters Sidebar */}
        <Card className="lg:col-span-1 lg:sticky lg:top-24">
          <div className="p-4 border-b border-gray-100 flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <h3 className="font-semibold text-gray-900">Filters</h3>
          </div>
          <CardContent className="p-4 space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Keywords..." 
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase">Company</label>
              <select 
                name="company" 
                value={filters.company} 
                onChange={handleFilterChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none"
              >
                <option value="">All Companies</option>
                {companies.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase">Status</label>
              <select 
                name="status" 
                value={filters.status} 
                onChange={handleFilterChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none"
              >
                <option value="">All Statuses</option>
                {mockStatuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase">Notice Period</label>
              <input 
                type="text" 
                name="noticePeriod" 
                placeholder="e.g. 30 days" 
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none"
                value={filters.noticePeriod}
                onChange={handleFilterChange}
              />
            </div>

            <Button 
              variant="outline" 
              className="w-full mt-2" 
              onClick={() => {
                setSearchTerm('');
                setFilters({ company: '', status: '', noticePeriod: '' });
              }}
            >
              Clear Filters
            </Button>
          </CardContent>
        </Card>

        {/* Job List */}
        <div className="lg:col-span-3 space-y-4">
          <div className="text-sm text-gray-500 mb-2">Showing {filteredJobs.length} jobs</div>
          
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading jobs...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
              <Search className="h-10 w-10 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900">No jobs found</h3>
              <p className="text-gray-500">Try adjusting your filters or search term.</p>
            </div>
          ) : (
            filteredJobs.map(job => (
              <Card key={job.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{job.title}</h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1 font-medium text-gray-800">
                          <Building className="h-4 w-4 text-gray-400" /> {job.company?.name || job.company}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-gray-400" /> {formatDate(job.createdAt || job.postedAt)}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        job.status === 'Urgently Hiring' ? 'bg-red-100 text-red-700' :
                        job.status === 'Hiring' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {job.status}
                      </span>
                      <button onClick={() => handleReport(job.id)} className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 mt-1 transition-colors">
                        <Flag className="h-3 w-3" /> Report
                      </button>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4 mb-4 text-sm text-gray-700">
                    <p className="whitespace-pre-wrap">{job.comments}</p>
                  </div>

                  <div className="flex flex-wrap justify-between items-center gap-4 text-sm">
                    <div className="flex gap-4">
                      <div>
                        <span className="text-gray-500">Notice Period:</span> <span className="font-medium text-gray-900">{job.noticePeriodRequirement || job.noticePeriodReq || 'Not specified'}</span>
                      </div>
                      {(job.jobIdOrLink || job.jobIdLink) && (
                        <div>
                          <span className="text-gray-500">Job ID/Link:</span>{' '}
                          {(job.jobIdOrLink || job.jobIdLink).startsWith('http') ? (
                            <a href={job.jobIdOrLink || job.jobIdLink} target="_blank" rel="noreferrer" className="font-medium text-orange-600 hover:underline flex items-center inline-flex gap-1">
                              External Link <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            <span className="font-medium text-gray-900">{job.jobIdOrLink || job.jobIdLink}</span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <Button variant="outline" className="text-sm">Apply / Details</Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Post Job Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Post a Job">
        <form onSubmit={handlePostJob} className="space-y-4 mt-2">
          <Input 
            label="Job Title" 
            name="title" 
            value={formData.title} 
            onChange={handleFormChange} 
            required 
            placeholder="e.g. Senior Backend Developer"
          />

          <div className="relative">
            <Input 
              label="Company Name" 
              name="company" 
              value={formData.company} 
              onChange={handleFormChange} 
              onFocus={() => setShowAutocomplete(true)}
              onBlur={() => setTimeout(() => setShowAutocomplete(false), 200)}
              required 
              placeholder="Start typing to search or add new"
            />
            {showAutocomplete && companySuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-y-auto">
                {companySuggestions.map(c => (
                  <div 
                    key={c.id} 
                    className="px-4 py-2 hover:bg-orange-50 cursor-pointer text-sm text-gray-700"
                    onMouseDown={() => {
                      setFormData(prev => ({ ...prev, company: c.name }));
                      setShowAutocomplete(false);
                    }}
                  >
                    {c.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="w-full flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Hiring Status</label>
            <select 
              name="status"
              value={formData.status}
              onChange={handleFormChange}
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {mockStatuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <Input 
            label="Notice Period Requirement" 
            name="noticePeriodRequirement" 
            value={formData.noticePeriodRequirement} 
            onChange={handleFormChange} 
            placeholder="e.g. 30 days, Immediate"
          />

          <Input 
            label="Job ID or Link (Optional)" 
            name="jobIdOrLink" 
            value={formData.jobIdOrLink} 
            onChange={handleFormChange} 
            placeholder="https://..."
          />

          <div className="w-full flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Comments / Job Description</label>
            <textarea 
              name="comments"
              value={formData.comments}
              onChange={handleFormChange}
              rows={4}
              className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Add relevant details..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t mt-6">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Posting...' : 'Post Job'}
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
