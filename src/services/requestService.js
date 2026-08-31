import api from './api';

const requestService = {
  // We can group both contact requests and connect requests here
  
  createContactRequest: async (targetId, reason) => {
    const response = await api.post('/contact-requests', { targetId, reason });
    return response.data;
  },
  
  approveContactRequest: async (id) => {
    const response = await api.put(`/contact-requests/${id}/approve`);
    return response.data;
  },

  rejectContactRequest: async (id) => {
    const response = await api.put(`/contact-requests/${id}/reject`);
    return response.data;
  },

  createConnectRequest: async (targetId, message) => {
    const response = await api.post('/connect-requests', { targetId, message });
    return response.data;
  },
  
  approveConnectRequest: async (id) => {
    const response = await api.put(`/connect-requests/${id}/approve`);
    return response.data;
  },

  rejectConnectRequest: async (id) => {
    const response = await api.put(`/connect-requests/${id}/reject`);
    return response.data;
  },

  // Note: Since the backend spec only asked for POST and PUT /approve /reject, 
  // getting the list of requests may need custom API or we can mock the fetching until the endpoint exists.
  // The spec did NOT explicitly list GET /api/contact-requests, so I will add a fetch wrapper just in case.
  getIncomingRequests: async () => {
    const response = await api.get('/contact-requests/incoming');
    return response.data;
  },
  
  getOutgoingRequests: async () => {
    const response = await api.get('/contact-requests/outgoing');
    return response.data;
  },

  getIncomingConnectRequests: async () => {
    const response = await api.get('/connect-requests/incoming');
    return response.data;
  }
};

export default requestService;
