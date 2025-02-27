import { create } from 'zustand';
import { userService, adminService } from '@/lib/api';

const useQuizStore = create((set, get) => ({
  // State
  quizzes: [],
  currentQuiz: null,
  quizQuestions: [],
  quizAttempt: null,
  quizResults: null,
  isLoading: false,
  error: null,
  
  // Actions - User
  fetchUserQuizzes: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await userService.getQuizzes();
      set({ quizzes: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to fetch quizzes';
      set({ isLoading: false, error: errorMsg });
      throw new Error(errorMsg);
    }
  },
  
  startQuiz: async (quizId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await userService.startQuiz(quizId);
      set({ quizAttempt: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to start quiz';
      set({ isLoading: false, error: errorMsg });
      throw new Error(errorMsg);
    }
  },
  
  fetchQuizQuestions: async (quizId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await userService.getQuizQuestions(quizId);
      set({ 
        currentQuiz: {
          id: response.data.quiz_id,
          title: response.data.title,
          duration: response.data.duration_minutes,
          totalScore: response.data.total_score,
        },
        quizQuestions: response.data.questions,
        quizAttempt: {
          id: response.data.attempt_id,
          startTime: response.data.start_time,
        },
        isLoading: false,
      });
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to fetch quiz questions';
      set({ isLoading: false, error: errorMsg });
      throw new Error(errorMsg);
    }
  },
  
  submitQuiz: async (quizId, responses) => {
    set({ isLoading: true, error: null });
    try {
      const response = await userService.submitQuiz(quizId, { responses });
      set({ isLoading: false });
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to submit quiz';
      set({ isLoading: false, error: errorMsg });
      throw new Error(errorMsg);
    }
  },
  
  fetchQuizResults: async (quizId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await userService.getQuizResults(quizId);
      set({ quizResults: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to fetch quiz results';
      set({ isLoading: false, error: errorMsg });
      throw new Error(errorMsg);
    }
  },
  
  // Actions - Admin
  fetchAllQuizzes: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminService.getAllQuizzes();
      set({ quizzes: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to fetch quizzes';
      set({ isLoading: false, error: errorMsg });
      throw new Error(errorMsg);
    }
  },
  
  fetchQuizById: async (quizId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminService.getQuiz(quizId);
      set({ currentQuiz: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to fetch quiz';
      set({ isLoading: false, error: errorMsg });
      throw new Error(errorMsg);
    }
  },
  
  createQuiz: async (quizData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminService.createQuiz(quizData);
      set({ 
        quizzes: [...get().quizzes, response.data],
        isLoading: false 
      });
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to create quiz';
      set({ isLoading: false, error: errorMsg });
      throw new Error(errorMsg);
    }
  },
  
  updateQuiz: async (quizId, quizData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminService.updateQuiz(quizId, quizData);
      set({
        quizzes: get().quizzes.map(quiz => 
          quiz.id === quizId ? response.data : quiz
        ),
        currentQuiz: response.data,
        isLoading: false,
      });
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to update quiz';
      set({ isLoading: false, error: errorMsg });
      throw new Error(errorMsg);
    }
  },
  
  deleteQuiz: async (quizId) => {
    set({ isLoading: true, error: null });
    try {
      await adminService.deleteQuiz(quizId);
      set({
        quizzes: get().quizzes.filter(quiz => quiz.id !== quizId),
        isLoading: false,
      });
      return true;
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to delete quiz';
      set({ isLoading: false, error: errorMsg });
      throw new Error(errorMsg);
    }
  },
  
  assignQuestionsToQuiz: async (quizId, questionsData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminService.assignQuestions(quizId, questionsData);
      set({
        currentQuiz: response.data,
        isLoading: false,
      });
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to assign questions';
      set({ isLoading: false, error: errorMsg });
      throw new Error(errorMsg);
    }
  },
  
  // Reset state
  resetQuizState: () => set({
    currentQuiz: null,
    quizQuestions: [],
    quizAttempt: null,
    quizResults: null,
  }),
}));

export default useQuizStore;