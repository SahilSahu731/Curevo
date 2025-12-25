import { useAuthStore } from '@/store/authStore';

export const useAuth = () => {
  const { 
    user, 
    token,
    isLoading, 
    login,
    register,
    logout,
    getCurrentUser 
  } = useAuthStore();

  const isAuthenticated = !!token;

  return {
    // User data
    user,
    token,
    isAuthenticated,
    isLoading,
    
    // Auth actions
    login,
    register,
    logout,
    getCurrentUser,
  };
};