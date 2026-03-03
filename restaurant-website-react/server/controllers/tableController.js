const Table = require('../models/Table');

// @desc    Get all tables (public)
// @route   GET /api/tables
const getTables = async (req, res) => {
  try {
    const { location, status, isActive } = req.query;
    const filter = {};

    if (location) filter.location = location;
    if (status) filter.status = status;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const tables = await Table.find(filter).sort({ tableNumber: 1 });

    res.json({
      success: true,
      tables,
      total: tables.length,
    });
  } catch (error) {
    console.error('Get tables error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch tables' });
  }
};

// @desc    Get single table by ID (public)
// @route   GET /api/tables/:id
const getTableById = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) {
      return res.status(404).json({ success: false, message: 'Table not found' });
    }
    res.json({ success: true, table });
  } catch (error) {
    console.error('Get table error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch table' });
  }
};

// @desc    Create a new table (admin only)
// @route   POST /api/tables
const createTable = async (req, res) => {
  try {
    const { tableNumber, name, capacity, location, status, description, imageUrl, isActive } = req.body;

    if (!tableNumber || !name || !capacity || !location) {
      return res.status(400).json({
        success: false,
        message: 'Table number, name, capacity, and location are required',
      });
    }

    // Check if table number already exists
    const existingTable = await Table.findOne({ tableNumber });
    if (existingTable) {
      return res.status(400).json({
        success: false,
        message: `Table number ${tableNumber} already exists`,
      });
    }

    const table = await Table.create({
      tableNumber,
      name,
      capacity,
      location,
      status: status || 'Available',
      description: description || '',
      imageUrl: imageUrl || '',
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json({
      success: true,
      message: 'Table created successfully',
      table,
    });
  } catch (error) {
    console.error('Create table error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Table number must be unique' });
    }
    res.status(500).json({ success: false, message: 'Failed to create table' });
  }
};

// @desc    Update a table (admin only)
// @route   PUT /api/tables/:id
const updateTable = async (req, res) => {
  try {
    const { tableNumber, name, capacity, location, status, description, imageUrl, isActive } = req.body;

    const table = await Table.findById(req.params.id);
    if (!table) {
      return res.status(404).json({ success: false, message: 'Table not found' });
    }

    // Check table number uniqueness if it's being changed
    if (tableNumber && tableNumber !== table.tableNumber) {
      const existingTable = await Table.findOne({
        tableNumber,
        _id: { $ne: req.params.id },
      });
      if (existingTable) {
        return res.status(400).json({
          success: false,
          message: `Table number ${tableNumber} is already taken`,
        });
      }
    }

    const updatedTable = await Table.findByIdAndUpdate(
      req.params.id,
      {
        ...(tableNumber !== undefined && { tableNumber }),
        ...(name !== undefined && { name }),
        ...(capacity !== undefined && { capacity }),
        ...(location !== undefined && { location }),
        ...(status !== undefined && { status }),
        ...(description !== undefined && { description }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(isActive !== undefined && { isActive }),
      },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Table updated successfully',
      table: updatedTable,
    });
  } catch (error) {
    console.error('Update table error:', error);
    res.status(500).json({ success: false, message: 'Failed to update table' });
  }
};

// @desc    Delete a table (admin only)
// @route   DELETE /api/tables/:id
const deleteTable = async (req, res) => {
  try {
    const table = await Table.findById(req.params.id);
    if (!table) {
      return res.status(404).json({ success: false, message: 'Table not found' });
    }

    await Table.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Table deleted successfully',
    });
  } catch (error) {
    console.error('Delete table error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete table' });
  }
};

// @desc    Get available tables for a specific date/time/party size (public)
// @route   GET /api/tables/available
const getAvailableTables = async (req, res) => {
  try {
    const { date, time, partySize } = req.query;

    if (!date || !time) {
      return res.status(400).json({
        success: false,
        message: 'Date and time are required',
      });
    }

    const Reservation = require('../models/Reservation');

    // Find tables already reserved at this exact date+time
    const conflictingReservations = await Reservation.find({
      reservationDate: date,
      reservationTime: time,
      status: { $in: ['Pending', 'Confirmed'] },
    }).select('tableId');

    const reservedTableIds = conflictingReservations.map((r) => r.tableId.toString());

    // Build filter for available tables
    const filter = {
      isActive: true,
      status: { $ne: 'Maintenance' },
      _id: { $nin: reservedTableIds },
    };

    // Filter by party size if provided
    if (partySize) {
      filter.capacity = { $gte: parseInt(partySize, 10) };
    }

    const tables = await Table.find(filter).sort({ tableNumber: 1 });

    res.json({
      success: true,
      tables,
      total: tables.length,
    });
  } catch (error) {
    console.error('Get available tables error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch available tables' });
  }
};

module.exports = {
  getTables,
  getTableById,
  createTable,
  updateTable,
  deleteTable,
  getAvailableTables,
};
