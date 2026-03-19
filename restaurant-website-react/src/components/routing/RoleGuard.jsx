import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

/**
 * RoleGuard — wraps individual admin pages to restrict by role.
 * Used inside nested <Route> elements (inside AdminLayout).
 *
 * Usage:
 *   <Route path="expenses" element={
 *     <RoleGuard allowedRoles={['super_admin', 'manager']}>
 *       <AdminExpenses />
 *     </RoleGuard>
 *   } />
 *
 * Redirects to /admin/dashboard if role is not allowed.
 */
const RoleGuard = ({ children, allowedRoles }) => {
  const { userRole } = useAuth();

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};

export default RoleGuard;
