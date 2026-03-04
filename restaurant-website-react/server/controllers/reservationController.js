const Reservation = require('../models/Reservation');
const Table = require('../models/Table');
const { sendReservationEmails } = require('../../api/_lib/emailService');

// Helper: sync table status based on whether it has any active (Pending/Confirmed) reservations
const syncTableStatus = async (tableId) => {
  const today = new Date().toISOString().split('T')[0];
  const activeCount = await Reservation.countDocuments({
    tableId,
    status: { $in: ['Pending', 'Confirmed'] },
    reservationDate: { $gte: today },
  });
  const newStatus = activeCount > 0 ? 'Reserved' : 'Available';
  await Table.findByIdAndUpdate(tableId, { status: newStatus });
};

// Helper to generate unique reservation ID
const generateReservationId = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substr(2, 5).toUpperCase();
  return `RES-${timestamp}-${random}`;
};

// @desc    Create a new reservation (public — guests + logged-in users)
// @route   POST /api/reservations
const createReservation = async (req, res) => {
  try {
    const {
      tableId,      // legacy single-table field (kept for backward compat)
      tableIds,     // new multi-table field (preferred)
      fullName,
      email,
      phone,
      reservationDate,
      reservationTime,
      partySize,
      specialRequests,
      guestDetails,
    } = req.body;

    // Resolve the list of table IDs — accept either tableIds[] or legacy tableId
    let resolvedTableIds = [];
    if (Array.isArray(tableIds) && tableIds.length > 0) {
      resolvedTableIds = tableIds;
    } else if (tableId) {
      resolvedTableIds = [tableId];
    }

    // Validate required fields
    if (resolvedTableIds.length === 0 || !fullName || !email || !phone || !reservationDate || !reservationTime || !partySize) {
      return res.status(400).json({
        success: false,
        message: 'Table(s), name, email, phone, date, time, and party size are required',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }

    // Validate all tables exist and are active
    const tables = await Table.find({ _id: { $in: resolvedTableIds } });
    if (tables.length !== resolvedTableIds.length) {
      return res.status(404).json({ success: false, message: 'One or more selected tables were not found' });
    }
    for (const t of tables) {
      if (!t.isActive || t.status === 'Maintenance') {
        return res.status(400).json({ success: false, message: `Table #${t.tableNumber} is not available` });
      }
    }

    // Check combined capacity >= party size
    const combinedCapacity = tables.reduce((sum, t) => sum + t.capacity, 0);
    if (parseInt(partySize, 10) > combinedCapacity) {
      return res.status(400).json({
        success: false,
        message: `Party size exceeds combined table capacity (max ${combinedCapacity} for selected tables)`,
      });
    }

    // Validate guest details if provided
    let sanitizedGuestDetails = { hasGuestList: false, guests: [] };
    if (guestDetails && guestDetails.hasGuestList) {
      const guests = Array.isArray(guestDetails.guests) ? guestDetails.guests : [];
      if (guests.length > combinedCapacity) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more guests than combined table capacity (max ${combinedCapacity})`,
        });
      }
      for (const g of guests) {
        if (!g.name || !g.name.trim()) {
          return res.status(400).json({ success: false, message: 'Each guest must have a name' });
        }
      }
      sanitizedGuestDetails = {
        hasGuestList: true,
        guests: guests.map((g) => ({
          name: g.name.trim(),
          note: g.note ? g.note.trim() : '',
        })),
      };
    }

    // Check for conflicts on each table at same date+time
    for (const tid of resolvedTableIds) {
      const conflict = await Reservation.findOne({
        tableIds: tid,
        reservationDate,
        reservationTime,
        status: { $in: ['Pending', 'Confirmed'] },
      });
      // Also check legacy single-tableId reservations
      const legacyConflict = !conflict && await Reservation.findOne({
        tableId: tid,
        tableIds: { $size: 0 },
        reservationDate,
        reservationTime,
        status: { $in: ['Pending', 'Confirmed'] },
      });
      if (conflict || legacyConflict) {
        const conflictTable = tables.find((t) => t._id.toString() === tid.toString());
        return res.status(409).json({
          success: false,
          message: `Table #${conflictTable?.tableNumber || ''} is already reserved for the selected date and time`,
        });
      }
    }

    // Determine if guest or user reservation
    const isGuestReservation = !req.user;
    const userId = req.user ? req.user._id : null;

    const reservationId = generateReservationId();
    // Use first table as the legacy tableId field
    const primaryTableId = resolvedTableIds[0];

    const reservation = await Reservation.create({
      reservationId,
      userId,
      tableId: primaryTableId,
      tableIds: resolvedTableIds,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      reservationDate,
      reservationTime,
      partySize: parseInt(partySize, 10),
      specialRequests: specialRequests ? specialRequests.trim() : '',
      status: 'Pending',
      isGuestReservation,
      guestDetails: sanitizedGuestDetails,
      statusHistory: [{ status: 'Pending', timestamp: new Date(), note: 'Reservation created' }],
    });

    // Sync status for all reserved tables
    await Promise.all(resolvedTableIds.map((tid) => syncTableStatus(tid)));

    // Build table info for email
    const primaryTable = tables.find((t) => t._id.toString() === primaryTableId.toString());
    const emailPayload = {
      reservationId,
      fullName: reservation.fullName,
      email: reservation.email,
      phone: reservation.phone,
      reservationDate: reservation.reservationDate,
      reservationTime: reservation.reservationTime,
      partySize: reservation.partySize,
      specialRequests: reservation.specialRequests,
      status: reservation.status,
      // Legacy single-table fields (backward compat)
      tableNumber: primaryTable.tableNumber,
      tableName: primaryTable.name,
      tableLocation: primaryTable.location,
      // Multi-table array for new email templates
      tables: tables.map((t) => ({ tableNumber: t.tableNumber, name: t.name, location: t.location })),
      isGuestReservation,
      guestDetails: reservation.guestDetails,
    };

    let emailStatus = { customerEmailSent: false, adminEmailSent: false };
    try {
      emailStatus = await sendReservationEmails(emailPayload);
    } catch (emailError) {
      console.error('Reservation email error (non-fatal):', emailError);
    }

    // Populate table info for the response
    const populatedReservation = await Reservation.findById(reservation._id)
      .populate('tableId', 'tableNumber name capacity location')
      .populate('tableIds', 'tableNumber name capacity location');

    res.status(201).json({
      success: true,
      message: 'Reservation created successfully',
      reservation: populatedReservation,
      emailStatus,
    });
  } catch (error) {
    console.error('Create reservation error:', error);
    res.status(500).json({ success: false, message: 'Failed to create reservation' });
  }
};

// @desc    Get all reservations (admin only)
// @route   GET /api/reservations
const getReservations = async (req, res) => {
  try {
    const { status, date, search, page = 1, limit = 50 } = req.query;
    const filter = {};

    if (status && status !== 'All') filter.status = status;
    if (date) filter.reservationDate = date;

    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [
        { fullName: searchRegex },
        { email: searchRegex },
        { reservationId: searchRegex },
      ];
    }

    const reservations = await Reservation.find(filter)
      .populate('tableId', 'tableNumber name capacity location')
      .populate('tableIds', 'tableNumber name capacity location')
      .sort({ reservationDate: -1, reservationTime: -1, createdAt: -1 })
      .limit(parseInt(limit, 10))
      .skip((parseInt(page, 10) - 1) * parseInt(limit, 10));

    const total = await Reservation.countDocuments(filter);

    res.json({
      success: true,
      reservations,
      total,
      page: parseInt(page, 10),
    });
  } catch (error) {
    console.error('Get reservations error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch reservations' });
  }
};

// @desc    Get reservation stats (admin only)
// @route   GET /api/reservations/stats
const getReservationStats = async (req, res) => {
  try {
    const total = await Reservation.countDocuments();
    const pending = await Reservation.countDocuments({ status: 'Pending' });
    const confirmed = await Reservation.countDocuments({ status: 'Confirmed' });
    const cancelled = await Reservation.countDocuments({ status: 'Cancelled' });
    const completed = await Reservation.countDocuments({ status: 'Completed' });

    // Today's reservations
    const today = new Date().toISOString().split('T')[0];
    const todayCount = await Reservation.countDocuments({ reservationDate: today });

    res.json({
      success: true,
      stats: { total, pending, confirmed, cancelled, completed, today: todayCount },
    });
  } catch (error) {
    console.error('Get reservation stats error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch reservation stats' });
  }
};

// @desc    Get reservations for the logged-in user
// @route   GET /api/reservations/my
const getMyReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({ userId: req.user._id })
      .populate('tableId', 'tableNumber name capacity location')
      .populate('tableIds', 'tableNumber name capacity location')
      .sort({ reservationDate: -1, reservationTime: -1 });

    res.json({ success: true, reservations });
  } catch (error) {
    console.error('Get my reservations error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch your reservations' });
  }
};

// @desc    Get single reservation by ID
// @route   GET /api/reservations/:id
const getReservationById = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('tableId', 'tableNumber name capacity location')
      .populate('tableIds', 'tableNumber name capacity location');
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }
    res.json({ success: true, reservation });
  } catch (error) {
    console.error('Get reservation error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch reservation' });
  }
};

// @desc    Update reservation status (admin only)
// @route   PUT /api/reservations/:id/status
const updateReservationStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const validStatuses = ['Pending', 'Confirmed', 'Cancelled', 'Completed'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    reservation.status = status;
    reservation.statusHistory.push({
      status,
      timestamp: new Date(),
      note: note || `Status updated to ${status}`,
    });

    await reservation.save();

    // Sync all table statuses
    const allTableIds = reservation.tableIds?.length > 0
      ? reservation.tableIds
      : [reservation.tableId];
    await Promise.all(allTableIds.map((tid) => syncTableStatus(tid)));

    const updatedReservation = await Reservation.findById(req.params.id)
      .populate('tableId', 'tableNumber name capacity location')
      .populate('tableIds', 'tableNumber name capacity location');

    res.json({
      success: true,
      message: `Reservation status updated to ${status}`,
      reservation: updatedReservation,
    });
  } catch (error) {
    console.error('Update reservation status error:', error);
    res.status(500).json({ success: false, message: 'Failed to update reservation status' });
  }
};

// @desc    Cancel own reservation (logged-in user)
// @route   PUT /api/reservations/:id/cancel
const cancelMyReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    if (['Cancelled', 'Completed'].includes(reservation.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a reservation that is already ${reservation.status.toLowerCase()}`,
      });
    }

    const allTableIds = reservation.tableIds?.length > 0
      ? reservation.tableIds
      : [reservation.tableId];

    reservation.status = 'Cancelled';
    reservation.statusHistory.push({
      status: 'Cancelled',
      timestamp: new Date(),
      note: 'Cancelled by customer',
    });

    await reservation.save();

    // Sync all reserved tables — may free them back to Available
    await Promise.all(allTableIds.map((tid) => syncTableStatus(tid)));

    res.json({
      success: true,
      message: 'Reservation cancelled successfully',
      reservation,
    });
  } catch (error) {
    console.error('Cancel reservation error:', error);
    res.status(500).json({ success: false, message: 'Failed to cancel reservation' });
  }
};

// @desc    Delete a reservation (admin only)
// @route   DELETE /api/reservations/:id
const deleteReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    const allTableIds = reservation.tableIds?.length > 0
      ? reservation.tableIds
      : [reservation.tableId];

    await Reservation.findByIdAndDelete(req.params.id);

    // Sync all table statuses after deletion
    await Promise.all(allTableIds.map((tid) => syncTableStatus(tid)));

    res.json({ success: true, message: 'Reservation deleted successfully' });
  } catch (error) {
    console.error('Delete reservation error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete reservation' });
  }
};

// @desc    Get booked time slots for a specific date (public)
// @route   GET /api/reservations/booked-times?date=
const getBookedTimes = async (req, res) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(400).json({ success: false, message: 'Date is required' });
    }

    // Get total number of active tables
    const totalActiveTables = await Table.countDocuments({ isActive: true, status: { $ne: 'Maintenance' } });

    if (totalActiveTables === 0) {
      return res.json({ success: true, bookedTimes: [] });
    }

    // For each time slot, count how many distinct tables are reserved
    const reservations = await Reservation.find({
      reservationDate: date,
      status: { $in: ['Pending', 'Confirmed'] },
    }).select('reservationTime tableId tableIds');

    // Build a map: time -> Set of reserved table IDs
    const timeToReservedTables = {};
    for (const r of reservations) {
      const time = r.reservationTime;
      if (!timeToReservedTables[time]) timeToReservedTables[time] = new Set();
      // Check tableIds array (multi-table) and legacy tableId
      if (Array.isArray(r.tableIds) && r.tableIds.length > 0) {
        r.tableIds.forEach((id) => timeToReservedTables[time].add(id.toString()));
      } else if (r.tableId) {
        timeToReservedTables[time].add(r.tableId.toString());
      }
    }

    // A time slot is "fully booked" when all active tables are reserved at that time
    const bookedTimes = Object.entries(timeToReservedTables)
      .filter(([, tableSet]) => tableSet.size >= totalActiveTables)
      .map(([time]) => time);

    res.json({ success: true, bookedTimes });
  } catch (error) {
    console.error('Get booked times error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch booked times' });
  }
};

module.exports = {
  createReservation,
  getReservations,
  getReservationStats,
  getMyReservations,
  getReservationById,
  updateReservationStatus,
  cancelMyReservation,
  deleteReservation,
  getBookedTimes,
};
