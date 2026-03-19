import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const STAFF_ROLES = ["super_admin", "manager", "employee", "chef"];

/**
 * ProtectedRoute
 *
 * Usage (new — preferred):
 *   <ProtectedRoute allowedRoles={['super_admin', 'manager']}>
 *
 * Usage (legacy — still works):
 *   <ProtectedRoute requiredRole="admin">   ← accepts any staff role
 */
const ProtectedRoute = ({ children, requiredRole, allowedRoles }) => {
  const { isAuthenticated, userRole } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Resolve which roles are allowed
  let permitted;
  if (allowedRoles) {
    permitted = allowedRoles.includes(userRole);
  } else if (requiredRole === "admin") {
    // Legacy: 'admin' means any staff role
    permitted = STAFF_ROLES.includes(userRole);
  } else if (requiredRole) {
    permitted = userRole === requiredRole;
  } else {
    permitted = true; // no role requirement — just needs auth
  }

  if (!permitted) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
