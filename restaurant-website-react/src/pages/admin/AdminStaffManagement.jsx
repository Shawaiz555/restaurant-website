import React, { useEffect, useState, useCallback } from "react";
import staffService from "../../services/staffService";
import { useAuth } from "../../hooks/useAuth";
import ConfirmModal from "../../components/admin/common/ConfirmModal";
import StatsCard from "../../components/admin/common/StatsCard";
import {
  Users,
  Plus,
  Search,
  Edit2,
  ToggleLeft,
  ToggleRight,
  KeyRound,
  Shield,
  UserCheck,
  UserX,
  ChevronDown,
  X,
  Eye,
  EyeOff,
} from "lucide-react";

const ROLE_OPTIONS = [
  { value: "super_admin", label: "Super Admin" },
  { value: "manager", label: "Manager" },
  { value: "employee", label: "Employee" },
  { value: "chef", label: "Chef" },
];

const ROLE_COLORS = {
  super_admin: "bg-purple-100 text-purple-700",
  manager: "bg-blue-100 text-blue-700",
  employee: "bg-green-100 text-green-700",
  chef: "bg-orange-100 text-orange-700",
};

const MANAGEABLE = {
  super_admin: ["super_admin", "manager", "employee", "chef"],
  manager: ["employee", "chef"],
};

// Modal for create / edit
const StaffModal = ({ member, onClose, onSave, currentUserRole }) => {
  const isEdit = !!member?._id;
  const allowedRoles = MANAGEABLE[currentUserRole] || [];

  const [form, setForm] = useState({
    name: member?.name || "",
    email: member?.email || "",
    phone: member?.phone || "",
    role: member?.role || allowedRoles[0] || "employee",
    password: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || (!isEdit && !form.password)) {
      setError("Name, email and password are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        role: form.role,
      };
      if (!isEdit) payload.password = form.password;
      await onSave(member?._id, payload);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-dark font-sans">
            {isEdit ? "Edit Staff Member" : "Add Staff Member"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5 text-dark-gray" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-2 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-dark mb-1">
              Full Name *
            </label>
            <input
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-dark mb-1">
              Email *
            </label>
            <input
              type="email"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="staff@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-dark mb-1">
              Phone
            </label>
            <input
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
              placeholder="+92 300 0000000"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-dark mb-1">
              Role *
            </label>
            <select
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              value={form.role}
              onChange={(e) => set("role", e.target.value)}
            >
              {ROLE_OPTIONS.filter((r) => allowedRoles.includes(r.value)).map(
                (r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ),
              )}
            </select>
          </div>

          {!isEdit && (
            <div>
              <label className="block text-sm font-semibold text-dark mb-1">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  value={form.password}
                  onChange={(e) => set("password", e.target.value)}
                  placeholder="Min 8 characters"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-gray"
                >
                  {showPw ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-dark hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark disabled:opacity-50"
            >
              {saving ? "Saving..." : isEdit ? "Save Changes" : "Add Member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Reset password modal
const ResetPasswordModal = ({ member, onClose, onReset }) => {
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await onReset(member._id, password);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to reset password");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-dark font-sans">
            Reset Password
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5 text-dark-gray" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-sm text-dark-gray">
            Resetting password for{" "}
            <span className="font-semibold text-dark">{member.name}</span>.
          </p>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-2 text-sm">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-dark mb-1">
              New Password *
            </label>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 characters"
                required
              />
              <button
                type="button"
                onClick={() => setShowPw((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-gray"
              >
                {showPw ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-dark hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-dark disabled:opacity-50"
            >
              {saving ? "Resetting..." : "Reset Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Main Page ───────────────────────────────────────────────────────────────
const AdminStaffManagement = () => {
  const { userRole } = useAuth();
  const isSuperAdmin = userRole === "super_admin";
  const manageableRoles = MANAGEABLE[userRole] || [];

  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("All");

  // Modals
  const [showForm, setShowForm] = useState(false);
  const [editMember, setEditMember] = useState(null);
  const [resetMember, setResetMember] = useState(null);
  const [toggleTarget, setToggleTarget] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await staffService.getStaff();
      setStaff(res.staff || res || []);
    } catch (err) {
      console.error("Staff load error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async (id, data) => {
    if (id) {
      await staffService.updateStaff(id, data);
    } else {
      await staffService.createStaff(data);
    }
    await load();
  };

  const handleToggle = async () => {
    if (!toggleTarget) return;
    await staffService.toggleStatus(toggleTarget._id);
    setToggleTarget(null);
    await load();
  };

  const handleResetPw = async (id, password) => {
    await staffService.resetPassword(id, password);
  };

  const openEdit = (member) => {
    setEditMember(member);
    setShowForm(true);
  };
  const openAdd = () => {
    setEditMember(null);
    setShowForm(true);
  };

  const filtered = staff.filter((m) => {
    const matchRole = filterRole === "All" || m.role === filterRole;
    const matchSearch =
      !search ||
      m.name?.toLowerCase().includes(search.toLowerCase()) ||
      m.email?.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  // Stats
  const roleCount = (role) => staff.filter((m) => m.role === role).length;
  const activeCount = staff.filter((m) => m.isActive !== false).length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-lg animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2" />
          <div className="h-4 bg-gray-100 rounded w-1/2" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-6 animate-pulse h-24"
              />
            ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center shadow-sm">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold font-sans text-primary mb-0.5">
                Staff Management
              </h1>
              <p className="text-dark-gray text-sm">
                {isSuperAdmin
                  ? "Manage all staff accounts"
                  : "Manage employees & chefs"}
              </p>
            </div>
          </div>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary-dark transition-all shadow-sm hover:shadow-md"
          >
            <Plus className="w-4 h-4" /> Add Staff
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard icon={Users} label="Total Staff" value={staff.length} />
        <StatsCard icon={UserCheck} label="Active" value={activeCount} />
        {isSuperAdmin ? (
          <StatsCard icon={Shield} label="Managers" value={roleCount("manager")} />
        ) : (
          <StatsCard icon={Users} label="Chefs" value={roleCount("chef")} />
        )}
        <StatsCard icon={Users} label="Employees" value={roleCount("employee")} />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-gray" />
            <input
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="relative">
            <select
              className="appearance-none pl-3 pr-8 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="All">All Roles</option>
              {ROLE_OPTIONS.filter((r) =>
                manageableRoles.includes(r.value),
              ).map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-gray pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-dark-gray">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="font-semibold">No staff members found</p>
            <p className="text-sm mt-1">Try adjusting your search or filter</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-cream-light border-b border-gray-100">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold text-dark-gray">
                    Member
                  </th>
                  <th className="text-left px-5 py-3 font-semibold text-dark-gray">
                    Role
                  </th>
                  <th className="text-left px-5 py-3 font-semibold text-dark-gray hidden md:table-cell">
                    Phone
                  </th>
                  <th className="text-left px-5 py-3 font-semibold text-dark-gray hidden lg:table-cell">
                    Last Active
                  </th>
                  <th className="text-left px-5 py-3 font-semibold text-dark-gray">
                    Status
                  </th>
                  <th className="text-right px-5 py-3 font-semibold text-dark-gray">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((member) => {
                  const isActive = member.isActive !== false;
                  const canManage = manageableRoles.includes(member.role);
                  return (
                    <tr
                      key={member._id}
                      className="hover:bg-cream-light/50 transition-colors"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold text-sm shrink-0">
                            {member.name?.charAt(0)?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-dark">
                              {member.name}
                            </p>
                            <p className="text-xs text-dark-gray">
                              {member.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${ROLE_COLORS[member.role] || "bg-gray-100 text-gray-700"}`}
                        >
                          {member.role?.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-dark-gray hidden md:table-cell">
                        {member.phone || "—"}
                      </td>
                      <td className="px-5 py-3 text-dark-gray hidden lg:table-cell text-xs">
                        {member.lastActive
                          ? new Date(member.lastActive).toLocaleString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )
                          : "Never"}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full text-xs font-semibold ${
                            isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {isActive ? (
                            <UserCheck className="w-3 h-3" />
                          ) : (
                            <UserX className="w-3 h-3" />
                          )}
                          {isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          {canManage && (
                            <>
                              <button
                                onClick={() => openEdit(member)}
                                className="p-1.5 rounded-lg hover:bg-gray-100 text-dark-gray hover:text-primary"
                                title="Edit"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setResetMember(member)}
                                className="p-1.5 rounded-lg hover:bg-gray-100 text-dark-gray hover:text-amber-600"
                                title="Reset Password"
                              >
                                <KeyRound className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setToggleTarget(member)}
                                className={`p-1.5 rounded-lg hover:bg-gray-100 ${isActive ? "text-green-600 hover:text-red-500" : "text-red-500 hover:text-green-600"}`}
                                title={isActive ? "Deactivate" : "Activate"}
                              >
                                {isActive ? (
                                  <ToggleRight className="w-4 h-4" />
                                ) : (
                                  <ToggleLeft className="w-4 h-4" />
                                )}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {showForm && (
        <StaffModal
          member={editMember}
          onClose={() => setShowForm(false)}
          onSave={handleSave}
          currentUserRole={userRole}
        />
      )}

      {resetMember && (
        <ResetPasswordModal
          member={resetMember}
          onClose={() => setResetMember(null)}
          onReset={handleResetPw}
        />
      )}

      {toggleTarget && (
        <ConfirmModal
          title={
            toggleTarget.isActive !== false
              ? "Deactivate Staff Member"
              : "Activate Staff Member"
          }
          message={`Are you sure you want to ${toggleTarget.isActive !== false ? "deactivate" : "activate"} ${toggleTarget.name}?`}
          variant={toggleTarget.isActive !== false ? "danger" : "default"}
          onConfirm={handleToggle}
          onCancel={() => setToggleTarget(null)}
        />
      )}
    </div>
  );
};

export default AdminStaffManagement;
