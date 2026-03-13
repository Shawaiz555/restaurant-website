const Wastage = require('../models/Wastage');
const Ingredient = require('../models/Ingredient');

// @desc    Get all wastage records
// @route   GET /api/wastage
// @access  Private (Admin)
const getWastage = async (req, res) => {
  try {
    const { ingredientId, reason, startDate, endDate } = req.query;
    let query = {};

    if (ingredientId) query.ingredientId = ingredientId;
    if (reason && reason !== 'All') query.reason = reason;

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    const records = await Wastage.find(query)
      .populate('createdBy', 'name email')
      .sort({ date: -1 });

    res.json({ success: true, count: records.length, wastage: records });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch wastage records' });
  }
};

// @desc    Create wastage record (stock deduction handled by Mongoose post-save hook)
// @route   POST /api/wastage
// @access  Private (Admin)
const createWastage = async (req, res) => {
  try {
    const wastageData = { ...req.body, createdBy: req.user._id };

    // Snapshot ingredient name
    if (!wastageData.ingredientName && wastageData.ingredientId) {
      const ingredient = await Ingredient.findById(wastageData.ingredientId);
      if (!ingredient) {
        return res.status(404).json({ success: false, message: 'Ingredient not found' });
      }
      wastageData.ingredientName = ingredient.name;
    }

    const record = await Wastage.create(wastageData);
    const populated = await Wastage.findById(record._id).populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Wastage recorded and stock updated',
      wastage: populated
    });
  } catch (error) {
    console.error('Create wastage error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to record wastage' });
  }
};

// @desc    Delete wastage record (reverses stock deduction)
// @route   DELETE /api/wastage/:id
// @access  Private (Admin)
const deleteWastage = async (req, res) => {
  try {
    const record = await Wastage.findById(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Wastage record not found' });
    }

    // Restore stock
    await Ingredient.findByIdAndUpdate(record.ingredientId, {
      $inc: { currentStock: record.quantity }
    });

    await record.deleteOne();
    res.json({ success: true, message: 'Wastage record deleted and stock restored' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete wastage record' });
  }
};

// @desc    Get wastage stats
// @route   GET /api/wastage/stats
// @access  Private (Admin)
const getWastageStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Join with ingredient to calculate cost
    const [todayAgg, weekAgg, monthAgg, byReason] = await Promise.all([
      Wastage.aggregate([
        { $match: { date: { $gte: startOfDay } } },
        { $lookup: { from: 'ingredients', localField: 'ingredientId', foreignField: '_id', as: 'ingredient' } },
        { $unwind: { path: '$ingredient', preserveNullAndEmptyArrays: true } },
        { $group: { _id: null, count: { $sum: 1 }, estimatedCost: { $sum: { $multiply: ['$quantity', { $ifNull: ['$ingredient.costPerUnit', 0] }] } } } }
      ]),
      Wastage.aggregate([
        { $match: { date: { $gte: startOfWeek } } },
        { $lookup: { from: 'ingredients', localField: 'ingredientId', foreignField: '_id', as: 'ingredient' } },
        { $unwind: { path: '$ingredient', preserveNullAndEmptyArrays: true } },
        { $group: { _id: null, count: { $sum: 1 }, estimatedCost: { $sum: { $multiply: ['$quantity', { $ifNull: ['$ingredient.costPerUnit', 0] }] } } } }
      ]),
      Wastage.aggregate([
        { $match: { date: { $gte: startOfMonth } } },
        { $lookup: { from: 'ingredients', localField: 'ingredientId', foreignField: '_id', as: 'ingredient' } },
        { $unwind: { path: '$ingredient', preserveNullAndEmptyArrays: true } },
        { $group: { _id: null, count: { $sum: 1 }, estimatedCost: { $sum: { $multiply: ['$quantity', { $ifNull: ['$ingredient.costPerUnit', 0] }] } } } }
      ]),
      Wastage.aggregate([
        { $group: { _id: '$reason', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
    ]);

    res.json({
      success: true,
      stats: {
        today: { count: todayAgg[0]?.count || 0, estimatedCost: todayAgg[0]?.estimatedCost || 0 },
        thisWeek: { count: weekAgg[0]?.count || 0, estimatedCost: weekAgg[0]?.estimatedCost || 0 },
        thisMonth: { count: monthAgg[0]?.count || 0, estimatedCost: monthAgg[0]?.estimatedCost || 0 },
        byReason
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch wastage stats' });
  }
};

module.exports = { getWastage, createWastage, deleteWastage, getWastageStats };
