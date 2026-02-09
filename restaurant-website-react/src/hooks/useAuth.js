import { useSelector } from 'react-redux';

export const useAuth = () => {
  const { currentUser, isAuthenticated } = useSelector((state) => state.auth);

  return {
    currentUser,
    isAuthenticated,
    userId: currentUser?.id,
  };
};

export default useAuth;
