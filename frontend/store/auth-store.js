import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '@/lib/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoggedIn: false,
      isAdmin: false,
      isLoading: false,
      error: null,
      
      // Set loading state
      setLoading: (loading) => set({ isLoading: loading }),
      
      // Set error state
      setError: (error) => set({ error }),
      
      // Register a new user
      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.register(userData);
          set({ isLoading: false });
          return response.data;
        } catch (error) {
          const errorMsg = error.response?.data?.detail || 'Registration failed';
          set({ isLoading: false, error: errorMsg });
          throw new Error(errorMsg);
        }
      },
      
      // Login
      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.login(credentials);
          const { access_token, token_type, user } = response.data;
          
          set({
            isLoading: false,
            user,
            token: access_token,
            isLoggedIn: true,
            isAdmin: user.is_admin,
          });
          
          return user;
        } catch (error) {
          const errorMsg = error.response?.data?.detail || 'Login failed';
          set({ isLoading: false, error: errorMsg });
          throw new Error(errorMsg);
        }
      },
      
      // Logout
      logout: async () => {
        set({ isLoading: true });
        try {
          await authService.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          // Clear auth state regardless of API response
          set({
            user: null,
            token: null,
            isLoggedIn: false,
            isAdmin: false,
            isLoading: false,
            error: null,
          });
          
          // If we're in the browser, navigate to login
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
      },
      
      // Check if user is authenticated (useful for protected routes)
      checkAuth: () => {
        const { user, token } = get();
        return !!(user && token);
      },
      
      // Update user profile
      updateProfile: (userData) => {
        set({ user: { ...get().user, ...userData } });
      },
    }),
    {
      name: 'auth-storage', // name of the item in localStorage
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token, 
        isLoggedIn: state.isLoggedIn, 
        isAdmin: state.isAdmin 
      }),
    }
  )
);

export default useAuthStore;