import { useSelector } from 'react-redux';

const STAFF_ROLES = ['super_admin', 'manager', 'employee', 'chef'];

export const useAuth = () => {
  const { currentUser, isAuthenticated } = useSelector((state) => state.auth);
  const role = currentUser?.role || 'user';

  return {
    currentUser,
    isAuthenticated,
    userId: currentUser?.id,
    userRole: role,
    // Convenience booleans
    isAdmin: role === 'super_admin',         // true only for super admin
    isSuperAdmin: role === 'super_admin',
    isManager: role === 'manager',
    isEmployee: role === 'employee',
    isChef: role === 'chef',
    isStaff: STAFF_ROLES.includes(role),     // true for any staff role
    // Check if user has one of the given roles
    hasRole: (...roles) => roles.includes(role),
  };
};

export default useAuth;
