import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import { FileText, Upload, Trash2, Edit2, Eye, EyeOff } from 'lucide-react';
import resumeService from '../services/resumeService';

export default function Resumes() {
  const [resumes, setResumes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    noticePeriod: 'Immediate',
    status: 'ACTIVELY_LOOKING',
    hiddenFromPublicSearch: false,
    file: null
  });

  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    setIsLoading(true);
    try {
      const data = await resumeService.getMyResumes();
      setResumes(data);
    } catch (error) {
      console.error("Failed to fetch resumes", error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      noticePeriod: 'Immediate',
      status: 'ACTIVELY_LOOKING',
      hiddenFromPublicSearch: false,
      file: null
    });
    setEditingId(null);
  };

  const handleOpenModal = (resume = null) => {
    if (resume) {
      setFormData({
        title: resume.title,
        noticePeriod: resume.noticePeriod,
        status: resume.status,
        hiddenFromPublicSearch: resume.hiddenFromPublicSearch,
        file: null // won't re-upload on edit
      });
      setEditingId(resume.id);
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);

    try {
      if (editingId) {
        await resumeService.updateResume(editingId, {
          title: formData.title,
          noticePeriod: formData.noticePeriod,
          status: formData.status,
          hiddenFromPublicSearch: formData.hiddenFromPublicSearch
        });
      } else {
        if (!formData.file) {
          alert('Please select a file');
          setIsUploading(false);
          return;
        }

        // 1. Get presigned URL
        const presignedData = await resumeService.getPresignedUrl(formData.file.name, formData.file.type);
        
        // 2. Upload to Cloudflare R2
        await resumeService.uploadToCloudflare(presignedData.uploadUrl, formData.file);

        // 3. Save metadata to DB
        await resumeService.createResumeRecord({
          title: formData.title,
          fileName: formData.file.name,
          fileType: formData.file.type,
          fileUrl: presignedData.fileUrl,
          noticePeriod: formData.noticePeriod,
          status: formData.status,
          hiddenFromPublicSearch: formData.hiddenFromPublicSearch
        });
      }
      await fetchResumes();
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error("Failed to upload/update resume", error);
      alert(error.response?.data?.message || 'Failed to process resume');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this resume?")) {
      try {
        await resumeService.deleteResume(id);
        setResumes(prev => prev.filter(r => r.id !== id));
      } catch (error) {
        alert("Failed to delete resume");
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVELY_LOOKING':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Actively Looking</span>;
      case 'OPEN_TO_OFFERS':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Open to Offers</span>;
      case 'NOT_LOOKING':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Not Looking</span>;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Resume Management</h1>
          <p className="text-gray-600">Upload multiple resumes for different target profiles.</p>
        </div>
        <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
          <Upload className="h-4 w-4" /> Upload New Resume
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {resumes.map(resume => (
          <Card key={resume.id} className="flex flex-col relative group">
            <CardContent className="p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-50 p-3 rounded-lg text-orange-600">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 line-clamp-1" title={resume.title}>{resume.title}</h3>
                    <p className="text-sm text-gray-500 line-clamp-1">{resume.fileName}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleOpenModal(resume)} className="p-2 text-gray-400 hover:text-orange-600 rounded-full hover:bg-orange-50 transition-colors" title="Edit Metadata">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(resume.id)} className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors" title="Delete Resume">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-auto space-y-4 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Status</p>
                    {getStatusBadge(resume.status)}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Notice Period</p>
                    <p className="text-sm font-medium text-gray-900">{resume.noticePeriod}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm pt-2">
                  <div className="flex items-center gap-2 text-gray-600">
                    {resume.hiddenFromPublicSearch ? (
                      <><EyeOff className="h-4 w-4 text-gray-400" /> Hidden from search</>
                    ) : (
                      <><Eye className="h-4 w-4 text-green-500" /> Visible in search</>
                    )}
                  </div>
                  {resume.fileUrl && (
                    <a href={resume.fileUrl} target="_blank" rel="noreferrer" className="font-medium text-orange-600 hover:underline">View File</a>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {resumes.length === 0 && (
          <div className="col-span-full py-16 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No resumes uploaded</h3>
            <p className="text-gray-500 mb-4">Get started by uploading your first resume.</p>
            <Button onClick={() => handleOpenModal()} variant="outline">Upload Resume</Button>
          </div>
        )}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingId ? "Edit Resume Details" : "Upload New Resume"}
      >
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          
          <Input 
            label="Resume Title (e.g. Frontend Developer Profile)" 
            name="title" 
            value={formData.title} 
            onChange={handleChange} 
            required 
          />
          
          {!editingId && (
            <div className="w-full flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Resume File (PDF/DOCX/IMG)</label>
              <input 
                type="file" 
                name="file"
                accept=".pdf,.doc,.docx,image/*"
                onChange={handleChange}
                className="flex w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm file:border-0 file:bg-orange-50 file:text-orange-700 file:font-semibold file:mr-4 file:px-4 file:py-1 file:rounded-full hover:file:bg-orange-100"
                required
              />
              <p className="text-xs text-gray-500 mt-1">File will be uploaded to Cloudflare R2.</p>
            </div>
          )}

          <div className="w-full flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Current Status</label>
            <select 
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="ACTIVELY_LOOKING">Actively Looking</option>
              <option value="OPEN_TO_OFFERS">Open to Offers</option>
              <option value="NOT_LOOKING">Not Looking</option>
            </select>
          </div>

          <Input 
            label="Notice Period (e.g. 30 days, Immediate)" 
            name="noticePeriod" 
            value={formData.noticePeriod} 
            onChange={handleChange} 
            required 
          />

          <div className="flex items-start gap-3 mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
            <input 
              type="checkbox" 
              id="hiddenFromPublicSearch" 
              name="hiddenFromPublicSearch"
              checked={formData.hiddenFromPublicSearch}
              onChange={handleChange}
              className="h-4 w-4 mt-0.5 text-orange-600 rounded border-gray-300 focus:ring-orange-500"
            />
            <div>
              <label htmlFor="hiddenFromPublicSearch" className="text-sm font-medium text-gray-900 block mb-0.5">
                Hide from Public Search
              </label>
              <p className="text-xs text-gray-500 leading-relaxed">
                If checked, this resume won't appear in the general resume browse page. 
                It will only be visible when you explicitly use it to request a referral or apply to a job post.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t mt-6">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isUploading} className="min-w-[120px]">
              {isUploading ? 'Saving...' : editingId ? 'Save Changes' : 'Upload Resume'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
