import { useAuth } from "../../hooks/useAuth";
import SuperAdminDashboard from "./dashboards/SuperAdminDashboard";
import ManagerDashboard from "./dashboards/ManagerDashboard";
import EmployeeDashboard from "./dashboards/EmployeeDashboard";
import ChefDashboard from "./dashboards/ChefDashboard";

/**
 * Smart dashboard switcher.
 * Reads the current user's role and renders the appropriate dashboard.
 * Each dashboard fetches only the data it needs — no wasted API calls.
 */
const AdminDashboard = () => {
  const { userRole } = useAuth();

  switch (userRole) {
    case "super_admin":
      return <SuperAdminDashboard />;
    case "manager":
      return <ManagerDashboard />;
    case "employee":
      return <EmployeeDashboard />;
    case "chef":
      return <ChefDashboard />;
    default:
      return <SuperAdminDashboard />;
  }
};

export default AdminDashboard;
