import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (userData) => api.post('/auth/login', userData),
  logout: (userData) => api.post('/auth/logout', userData),
};

// Users API
export const usersAPI = {
  getAllUsers: () => api.get('/users'),
  getUserByUsername: (username) => api.get(`/users/${username}`),
};

// Messages API
export const messagesAPI = {
  sendMessage: (messageData) => api.post('/messages/send', messageData),
  getConversation: (username) => api.get(`/messages/conversation/${username}`),
  getConversations: () => api.get('/messages/conversations'),
};

export default api;
