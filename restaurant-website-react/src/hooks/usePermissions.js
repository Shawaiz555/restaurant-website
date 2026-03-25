import { useAuth } from './useAuth';

/**
 * Central permission definitions per role.
 * Each key maps to a boolean indicating access.
 *
 * Usage:
 *   const { can } = usePermissions();
 *   if (can.manageStaff) { ... }
 */
const ROLE_PERMISSIONS = {
  super_admin: {
    // POS
    managePOS: true,
    // Orders
    viewOrders: true,
    updateOrderStatus: true,
    deleteOrders: true,
    viewOrderStats: true,
    // Products
    manageProducts: true,
    // Tables
    manageTables: true,
    deleteTables: true,
    // Reservations
    manageReservations: true,
    deleteReservations: true,
    // Deals
    manageDeals: true,
    // Expenses
    manageExpenses: true,
    // Analytics
    viewAnalytics: true,
    viewFinancialReports: true,
    // Stock
    viewIngredients: true,
    manageIngredients: true,
    manageSuppliers: true,
    managePurchases: true,
    viewRecipes: true,
    manageRecipes: true,
    viewWastage: true,
    manageWastage: true,
    manageAddonStock: true,
    viewStockReports: true,
    // Staff
    manageAllStaff: true,
    manageSubordinates: true,
    viewLiveSessions: true,
    // System
    systemSettings: true,
    viewAuditLog: true,
    // Payments
    processPayments: true,
  },

  manager: {
    managePOS: true,
    viewOrders: true,
    updateOrderStatus: true,
    deleteOrders: true,
    viewOrderStats: true,
    manageProducts: true,
    manageTables: true,
    deleteTables: true,
    manageReservations: true,
    deleteReservations: true,
    manageDeals: true,
    manageExpenses: true,
    viewAnalytics: true,
    viewFinancialReports: false,
    viewIngredients: true,
    manageIngredients: true,
    manageSuppliers: true,
    managePurchases: true,
    viewRecipes: true,
    manageRecipes: true,
    viewWastage: true,
    manageWastage: true,
    manageAddonStock: true,
    viewStockReports: true,
    manageAllStaff: false,
    manageSubordinates: true,   // employees + chefs only
    viewLiveSessions: true,
    systemSettings: false,
    viewAuditLog: false,
    processPayments: true,
  },

  employee: {
    managePOS: true,
    viewOrders: true,
    updateOrderStatus: true,
    deleteOrders: false,
    viewOrderStats: false,
    manageProducts: false,
    manageTables: true,
    deleteTables: false,
    manageReservations: true,
    deleteReservations: false,
    manageDeals: false,
    manageExpenses: false,
    viewAnalytics: false,
    viewFinancialReports: false,
    viewIngredients: false,
    manageIngredients: false,
    manageSuppliers: false,
    managePurchases: false,
    viewRecipes: false,
    manageRecipes: false,
    viewWastage: false,
    manageWastage: false,
    manageAddonStock: false,
    viewStockReports: false,
    manageAllStaff: false,
    manageSubordinates: false,
    viewLiveSessions: false,
    systemSettings: false,
    viewAuditLog: false,
    processPayments: true,
  },

  chef: {
    managePOS: false,
    viewOrders: true,
    updateOrderStatus: true,
    deleteOrders: false,
    viewOrderStats: false,
    manageProducts: false,
    manageTables: false,
    deleteTables: false,
    manageReservations: false,
    deleteReservations: false,
    manageDeals: false,
    manageExpenses: false,
    viewAnalytics: false,
    viewFinancialReports: false,
    viewIngredients: true,
    manageIngredients: false,
    manageSuppliers: false,
    managePurchases: false,
    viewRecipes: true,
    manageRecipes: true,
    viewWastage: true,
    manageWastage: true,
    manageAddonStock: false,
    viewStockReports: false,
    manageAllStaff: false,
    manageSubordinates: false,
    viewLiveSessions: false,
    systemSettings: false,
    viewAuditLog: false,
    processPayments: false,
  },

  user: {
    // Regular customers have no staff permissions
    managePOS: false,
    viewOrders: false,
    updateOrderStatus: false,
    deleteOrders: false,
    viewOrderStats: false,
    manageProducts: false,
    manageTables: false,
    deleteTables: false,
    manageReservations: false,
    deleteReservations: false,
    manageDeals: false,
    manageExpenses: false,
    viewAnalytics: false,
    viewFinancialReports: false,
    viewIngredients: false,
    manageIngredients: false,
    manageSuppliers: false,
    managePurchases: false,
    viewRecipes: false,
    manageRecipes: false,
    viewWastage: false,
    manageWastage: false,
    manageAddonStock: false,
    viewStockReports: false,
    manageAllStaff: false,
    manageSubordinates: false,
    viewLiveSessions: false,
    systemSettings: false,
    viewAuditLog: false,
    processPayments: false,
  },
};

export const usePermissions = () => {
  const { userRole } = useAuth();
  const can = ROLE_PERMISSIONS[userRole] || ROLE_PERMISSIONS.user;
  return { can, userRole };
};

// Sidebar nav item visibility per role — used by AdminSidebar
export const getSidebarConfig = (role) => {
  const mainMenu = [
    { path: '/admin/dashboard',    label: 'Dashboard',    roles: ['super_admin', 'manager', 'employee', 'chef'] },
    { path: '/admin/pos',          label: 'POS / New Order', roles: ['super_admin', 'manager', 'employee'] },
    { path: '/admin/orders',       label: 'Orders',       roles: ['super_admin', 'manager', 'employee', 'chef'] },
    { path: '/admin/products',     label: 'Products',     roles: ['super_admin', 'manager'] },
    { path: '/admin/tables',       label: 'Tables',       roles: ['super_admin', 'manager', 'employee'] },
    { path: '/admin/reservations', label: 'Reservations', roles: ['super_admin', 'manager', 'employee'] },
    { path: '/admin/deals',        label: 'Deals',        roles: ['super_admin', 'manager'] },
    { path: '/admin/expenses',     label: 'Expenses',     roles: ['super_admin', 'manager'] },
    { path: '/admin/analytics',    label: 'Analytics',    roles: ['super_admin', 'manager'] },
    { path: '/admin/payments',       label: 'Payments',       roles: ['super_admin', 'manager', 'employee'] },
    { path: '/admin/kitchen-queue', label: 'Kitchen Queue',  roles: ['super_admin', 'manager', 'chef'] },
    { path: '/admin/staff',         label: 'Staff',          roles: ['super_admin', 'manager'] },
    { path: '/admin/settings',      label: 'Settings',       roles: ['super_admin'] },
  ];

  const stockMenu = [
    { path: '/admin/ingredients',   label: 'Ingredients',   roles: ['super_admin', 'manager', 'chef'] },
    { path: '/admin/suppliers',     label: 'Suppliers',     roles: ['super_admin', 'manager'] },
    { path: '/admin/purchases',     label: 'Purchases',     roles: ['super_admin', 'manager'] },
    { path: '/admin/recipes',       label: 'Recipes',       roles: ['super_admin', 'manager', 'chef'] },
    { path: '/admin/wastage',       label: 'Wastage',       roles: ['super_admin', 'manager', 'chef'] },
    { path: '/admin/addon-stock',   label: 'Addon Stock',   roles: ['super_admin', 'manager'] },
    { path: '/admin/stock-reports', label: 'Stock Reports', roles: ['super_admin', 'manager'] },
  ];

  return {
    mainMenu: mainMenu.filter((item) => item.roles.includes(role)),
    stockMenu: stockMenu.filter((item) => item.roles.includes(role)),
  };
};

// Human-readable role label
export const getRoleLabel = (role) => {
  const labels = {
    super_admin: 'Super Admin',
    manager:     'Manager',
    employee:    'Employee',
    chef:        'Chef',
    user:        'Customer',
  };
  return labels[role] || role;
};

export default usePermissions;
