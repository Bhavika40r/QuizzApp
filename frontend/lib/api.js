import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// Create axios instance with baseURL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include auth token in headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle expired tokens
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Redirect to login on 401 Unauthorized
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  register: (userData) => api.post('/register', userData),
  login: (credentials) => api.post('/login', credentials),
  logout: () => api.post('/logout'),
};

// User services
export const userService = {
  getQuizzes: () => api.get('/user/my-quizzes'),
  startQuiz: (quizId) => api.post(`/user/quizzes/${quizId}/start`),
  getQuizQuestions: (quizId) => api.get(`/user/quizzes/${quizId}/questions`),
  submitQuiz: (quizId, responses) => api.post(`/user/quizzes/${quizId}/submit`, responses),
  getQuizResults: (quizId) => api.get(`/user/quizzes/${quizId}/response`),
};

// Admin services
export const adminService = {
  // Quiz management
  getAllQuizzes: () => api.get('/admin/quizzes'),
  getQuiz: (quizId) => api.get(`/admin/quizzes/${quizId}`),
  createQuiz: (quizData) => api.post('/admin/quizzes', quizData),
  updateQuiz: (quizId, quizData) => api.put(`/admin/quizzes/${quizId}`, quizData),
  deleteQuiz: (quizId) => api.delete(`/admin/quizzes/${quizId}`),
  assignQuestions: (quizId, questions) => api.post(`/admin/quizzes/${quizId}/questions`, questions),
  
  // Question management
  getAllQuestions: () => api.get('/admin/questions'),
  createQuestion: (questionData) => api.post('/admin/questions', questionData),
  updateQuestion: (questionId, questionData) => api.put(`/admin/questions/${questionId}`, questionData),
  deleteQuestion: (questionId) => api.delete(`/admin/questions/${questionId}`),
  
  // Results and reports
  getQuizParticipants: (quizId) => api.get(`/admin/quizzes/${quizId}/participants`),
  getParticipantResponses: (quizId, userId) => api.get(`/admin/quizzes/${quizId}/responses/${userId}`),
};

export default api;