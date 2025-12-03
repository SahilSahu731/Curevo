import { useAuthStore } from '@/store/authStore';

export const useAuth = () => {
  const { 
    user, 
    token,
    isAuthenticated, 
    isLoading, 
    login,
    register,
    logout,
    getCurrentUser 
  } = useAuthStore();

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