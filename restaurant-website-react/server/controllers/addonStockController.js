const AddonStock = require('../models/AddonStock');

// @desc    Get all addon stocks
// @route   GET /api/addon-stocks
// @access  Private (Admin)
const getAddonStocks = async (req, res) => {
  try {
    const { addonType, lowStock, search } = req.query;
    let query = {};

    if (addonType && addonType !== 'All') query.addonType = addonType;
    if (lowStock === 'true') query.$expr = { $lte: ['$currentStock', '$minimumStock'] };
    if (search) query.name = { $regex: search, $options: 'i' };

    const addonStocks = await AddonStock.find(query).sort({ addonType: 1, name: 1 });

    res.json({ success: true, count: addonStocks.length, addonStocks });
  } catch (error) {
    console.error('Get addon stocks error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch addon stocks' });
  }
};

// @desc    Get addon stock stats
// @route   GET /api/addon-stocks/stats
// @access  Private (Admin)
const getAddonStockStats = async (req, res) => {
  try {
    const total = await AddonStock.countDocuments();
    const lowStock = await AddonStock.countDocuments({
      $expr: { $and: [{ $gt: ['$currentStock', 0] }, { $lte: ['$currentStock', '$minimumStock'] }] },
    });
    const outOfStock = await AddonStock.countDocuments({ currentStock: 0 });
    const typeBreakdown = await AddonStock.aggregate([
      { $group: { _id: '$addonType', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    res.json({ success: true, stats: { total, lowStock, outOfStock, typeBreakdown } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch addon stock stats' });
  }
};

// @desc    Get single addon stock
// @route   GET /api/addon-stocks/:id
// @access  Private (Admin)
const getAddonStockById = async (req, res) => {
  try {
    const addonStock = await AddonStock.findById(req.params.id);
    if (!addonStock) return res.status(404).json({ success: false, message: 'Addon stock not found' });
    res.json({ success: true, addonStock });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch addon stock' });
  }
};

// @desc    Create addon stock
// @route   POST /api/addon-stocks
// @access  Private (Admin)
const createAddonStock = async (req, res) => {
  try {
    const addonStock = await AddonStock.create(req.body);
    res.status(201).json({ success: true, message: 'Addon stock created successfully', addonStock });
  } catch (error) {
    if (error.code === 11000)
      return res.status(400).json({ success: false, message: 'Addon with this name already exists' });
    res.status(500).json({ success: false, message: error.message || 'Failed to create addon stock' });
  }
};

// @desc    Update addon stock
// @route   PUT /api/addon-stocks/:id
// @access  Private (Admin)
const updateAddonStock = async (req, res) => {
  try {
    const addonStock = await AddonStock.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!addonStock) return res.status(404).json({ success: false, message: 'Addon stock not found' });
    res.json({ success: true, message: 'Addon stock updated successfully', addonStock });
  } catch (error) {
    if (error.code === 11000)
      return res.status(400).json({ success: false, message: 'Addon with this name already exists' });
    res.status(500).json({ success: false, message: error.message || 'Failed to update addon stock' });
  }
};

// @desc    Delete addon stock
// @route   DELETE /api/addon-stocks/:id
// @access  Private (Admin)
const deleteAddonStock = async (req, res) => {
  try {
    const addonStock = await AddonStock.findById(req.params.id);
    if (!addonStock) return res.status(404).json({ success: false, message: 'Addon stock not found' });
    await addonStock.deleteOne();
    res.json({ success: true, message: 'Addon stock deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete addon stock' });
  }
};

module.exports = {
  getAddonStocks,
  getAddonStockStats,
  getAddonStockById,
  createAddonStock,
  updateAddonStock,
  deleteAddonStock,
};
