import { create } from 'zustand';
import { adminService } from '@/lib/api';

const useQuestionStore = create((set, get) => ({
  // State
  questions: [],
  currentQuestion: null,
  isLoading: false,
  error: null,
  
  // Actions
  fetchAllQuestions: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminService.getAllQuestions();
      set({ questions: response.data, isLoading: false });
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to fetch questions';
      set({ isLoading: false, error: errorMsg });
      throw new Error(errorMsg);
    }
  },
  
  createQuestion: async (questionData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminService.createQuestion(questionData);
      set({ 
        questions: [...get().questions, response.data],
        isLoading: false 
      });
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to create question';
      set({ isLoading: false, error: errorMsg });
      throw new Error(errorMsg);
    }
  },
  
  updateQuestion: async (questionId, questionData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await adminService.updateQuestion(questionId, questionData);
      set({
        questions: get().questions.map(question => 
          question.id === questionId ? response.data : question
        ),
        currentQuestion: response.data,
        isLoading: false,
      });
      return response.data;
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to update question';
      set({ isLoading: false, error: errorMsg });
      throw new Error(errorMsg);
    }
  },
  
  deleteQuestion: async (questionId) => {
    set({ isLoading: true, error: null });
    try {
      await adminService.deleteQuestion(questionId);
      set({
        questions: get().questions.filter(question => question.id !== questionId),
        isLoading: false,
      });
      return true;
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to delete question';
      set({ isLoading: false, error: errorMsg });
      throw new Error(errorMsg);
    }
  },
  
  setCurrentQuestion: (question) => {
    set({ currentQuestion: question });
  },
  
  resetQuestionState: () => set({
    currentQuestion: null,
  }),
}));

export default useQuestionStore;