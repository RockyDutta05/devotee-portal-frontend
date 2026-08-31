import api from './api';
import axios from 'axios';

const resumeService = {
  getMyResumes: async () => {
    const response = await api.get('/resumes/mine');
    return response.data;
  },

  browseResumes: async () => {
    const response = await api.get('/resumes/browse');
    return response.data;
  },

  getPresignedUrl: async (fileName, fileType, contentLength) => {
    const response = await api.post('/resumes/presign-upload', {
      fileName,
      fileType,
      contentLength
    });
    return response.data;
  },

  uploadToCloudflare: async (presignedUrl, file) => {
    // We use a clean axios instance here to avoid sending JWT token or custom headers to Cloudflare S3
    await axios.put(presignedUrl, file, {
      headers: {
        'Content-Type': file.type
      }
    });
  },

  createResumeRecord: async (resumeData) => {
    const response = await api.post('/resumes', resumeData);
    return response.data;
  },

  updateResume: async (id, resumeData) => {
    const response = await api.put(`/resumes/${id}`, resumeData);
    return response.data;
  },

  deleteResume: async (id) => {
    const response = await api.delete(`/resumes/${id}`);
    return response.data;
  }
};

export default resumeService;
