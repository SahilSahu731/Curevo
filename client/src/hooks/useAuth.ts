import { useAuthStore } from '@/store/authStore';

export const useAuth = () => {
  const {
    user,
    isLoading,
    login,
    register,
    logout,
    verifyMfa,
    mfaRequired,
    mfaEnrollmentRequired,
    getCurrentUser
  } = useAuthStore();

  const isAuthenticated = Boolean(user);

  return {
    // User data
    user,
    isAuthenticated,
    isLoading,

    // Auth actions
    login,
    register,
    logout,
    verifyMfa,
    mfaRequired,
    mfaEnrollmentRequired,
    getCurrentUser,
  };
};
