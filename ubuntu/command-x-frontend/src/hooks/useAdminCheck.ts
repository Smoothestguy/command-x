import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

/**
 * Custom hook to check if the current user has admin privileges
 * @returns An object containing isAdmin flag and the current user
 */
export const useAdminCheck = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  
  return {
    isAdmin: user?.role === 'Admin',
    currentUser: user,
  };
};
