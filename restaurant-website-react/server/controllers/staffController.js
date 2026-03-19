const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Role hierarchy — defines which roles a given role can manage
const MANAGEABLE_ROLES = {
  super_admin: ['super_admin', 'manager', 'employee', 'chef'],
  manager:     ['employee', 'chef'],
  employee:    [],
  chef:        [],
};

// Roles that are considered "staff" (non-customer)
const STAFF_ROLES = ['super_admin', 'manager', 'employee', 'chef'];

const canManage = (actorRole, targetRole) => {
  return (MANAGEABLE_ROLES[actorRole] || []).includes(targetRole);
};

// @desc    Get all staff members (filtered by hierarchy)
// @route   GET /api/staff
// @access  super_admin (all), manager (employee + chef only)
const getStaff = async (req, res) => {
  try {
    const actorRole = req.user.role;
    const allowedRoles = MANAGEABLE_ROLES[actorRole] || [];

    const staff = await User.find({
      role: { $in: allowedRoles }
    }).select('-password -refreshToken -cart').sort({ createdAt: -1 });

    res.json({ success: true, staff });
  } catch (error) {
    console.error('getStaff error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch staff' });
  }
};

// @desc    Get single staff member
// @route   GET /api/staff/:id
// @access  super_admin, manager (subordinates only)
const getStaffById = async (req, res) => {
  try {
    const member = await User.findById(req.params.id).select('-password -refreshToken -cart');

    if (!member || !STAFF_ROLES.includes(member.role)) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }

    if (!canManage(req.user.role, member.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, member });
  } catch (error) {
    console.error('getStaffById error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch staff member' });
  }
};

// @desc    Create new staff member
// @route   POST /api/staff
// @access  super_admin (any staff role), manager (employee + chef only)
const createStaff = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Name, email, password and role are required' });
    }

    if (!STAFF_ROLES.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    if (!canManage(req.user.role, role)) {
      return res.status(403).json({
        success: false,
        message: `You do not have permission to create a ${role}`
      });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const member = await User.create({ name, email: email.toLowerCase(), password, role, phone: phone || '' });

    res.status(201).json({
      success: true,
      message: `${role.replace('_', ' ')} account created successfully`,
      member: {
        id: member._id,
        name: member.name,
        email: member.email,
        phone: member.phone,
        role: member.role,
        isActive: member.isActive,
        createdAt: member.createdAt,
      }
    });
  } catch (error) {
    console.error('createStaff error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to create staff member' });
  }
};

// @desc    Update staff member (name, email, role)
// @route   PUT /api/staff/:id
// @access  super_admin, manager (subordinates only)
const updateStaff = async (req, res) => {
  try {
    const member = await User.findById(req.params.id);

    if (!member || !STAFF_ROLES.includes(member.role)) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }

    if (!canManage(req.user.role, member.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const { name, email, role, phone } = req.body;

    // Prevent role escalation beyond actor's permissions
    if (role && !canManage(req.user.role, role)) {
      return res.status(403).json({
        success: false,
        message: `You cannot assign the role: ${role}`
      });
    }

    if (email && email.toLowerCase() !== member.email) {
      const taken = await User.findOne({ email: email.toLowerCase() });
      if (taken) {
        return res.status(400).json({ success: false, message: 'Email already in use' });
      }
      member.email = email.toLowerCase();
    }

    if (name) member.name = name;
    if (role) member.role = role;
    if (phone !== undefined) member.phone = phone;

    await member.save();

    res.json({
      success: true,
      message: 'Staff member updated successfully',
      member: {
        id: member._id,
        name: member.name,
        email: member.email,
        phone: member.phone,
        role: member.role,
        isActive: member.isActive,
      }
    });
  } catch (error) {
    console.error('updateStaff error:', error);
    res.status(500).json({ success: false, message: 'Failed to update staff member' });
  }
};

// @desc    Activate / deactivate a staff member (soft delete)
// @route   PATCH /api/staff/:id/status
// @access  super_admin, manager (subordinates only)
const toggleStaffStatus = async (req, res) => {
  try {
    const member = await User.findById(req.params.id);

    if (!member || !STAFF_ROLES.includes(member.role)) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }

    if (!canManage(req.user.role, member.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Prevent deactivating yourself
    if (member._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot deactivate your own account' });
    }

    member.isActive = !member.isActive;
    await member.save();

    res.json({
      success: true,
      message: `Account ${member.isActive ? 'activated' : 'deactivated'} successfully`,
      isActive: member.isActive
    });
  } catch (error) {
    console.error('toggleStaffStatus error:', error);
    res.status(500).json({ success: false, message: 'Failed to update status' });
  }
};

// @desc    Reset password for a subordinate staff member
// @route   PATCH /api/staff/:id/reset-password
// @access  super_admin, manager (subordinates only)
const resetStaffPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const member = await User.findById(req.params.id).select('+password');

    if (!member || !STAFF_ROLES.includes(member.role)) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }

    if (!canManage(req.user.role, member.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    member.password = newPassword; // pre-save hook hashes it
    await member.save();

    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    console.error('resetStaffPassword error:', error);
    res.status(500).json({ success: false, message: 'Failed to reset password' });
  }
};

// @desc    Get currently active staff (lastActive within 30 minutes)
// @route   GET /api/staff/live-sessions
// @access  super_admin, manager
const getLiveSessions = async (req, res) => {
  try {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    const activeSessions = await User.find({
      role: { $in: STAFF_ROLES },
      lastActive: { $gte: thirtyMinutesAgo },
      isActive: true,
    }).select('name email role lastActive').sort({ lastActive: -1 });

    res.json({ success: true, sessions: activeSessions });
  } catch (error) {
    console.error('getLiveSessions error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch live sessions' });
  }
};

module.exports = {
  getStaff,
  getStaffById,
  createStaff,
  updateStaff,
  toggleStaffStatus,
  resetStaffPassword,
  getLiveSessions,
};
