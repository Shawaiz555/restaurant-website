const Purchase = require('../models/Purchase');
const Ingredient = require('../models/Ingredient');

// @desc    Get all purchases
// @route   GET /api/purchases
// @access  Private (Admin)
const getPurchases = async (req, res) => {
  try {
    const { supplierId, startDate, endDate } = req.query;
    let query = {};

    if (supplierId) query.supplierId = supplierId;

    if (startDate || endDate) {
      query.purchaseDate = {};
      if (startDate) query.purchaseDate.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.purchaseDate.$lte = end;
      }
    }

    const purchases = await Purchase.find(query)
      .populate('supplierId', 'name email phone')
      .populate('createdBy', 'name email')
      .sort({ purchaseDate: -1 });

    res.json({ success: true, count: purchases.length, purchases });
  } catch (error) {
    console.error('Get purchases error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch purchases' });
  }
};

// @desc    Get single purchase
// @route   GET /api/purchases/:id
// @access  Private (Admin)
const getPurchaseById = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id)
      .populate('supplierId', 'name email phone address')
      .populate('createdBy', 'name email');

    if (!purchase) {
      return res.status(404).json({ success: false, message: 'Purchase not found' });
    }
    res.json({ success: true, purchase });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch purchase' });
  }
};

// @desc    Create purchase (stock increment handled by Mongoose post-save hook)
// @route   POST /api/purchases
// @access  Private (Admin)
const createPurchase = async (req, res) => {
  try {
    const purchaseData = {
      ...req.body,
      createdBy: req.user._id
    };

    // Compute subtotals and totalCost server-side
    if (purchaseData.items && purchaseData.items.length > 0) {
      purchaseData.items = purchaseData.items.map((item) => ({
        ...item,
        subtotal: item.quantity * item.pricePerUnit
      }));
      purchaseData.totalCost = purchaseData.items.reduce((sum, item) => sum + item.subtotal, 0);
    }

    const purchase = await Purchase.create(purchaseData);

    res.status(201).json({
      success: true,
      message: 'Purchase recorded and stock updated successfully',
      purchase
    });
  } catch (error) {
    console.error('Create purchase error:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to create purchase' });
  }
};

// @desc    Delete purchase (reverses stock)
// @route   DELETE /api/purchases/:id
// @access  Private (Admin)
const deletePurchase = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);
    if (!purchase) {
      return res.status(404).json({ success: false, message: 'Purchase not found' });
    }

    // Reverse stock increments
    const updates = purchase.items.map((item) =>
      Ingredient.findByIdAndUpdate(item.ingredientId, {
        $inc: { currentStock: -item.quantity }
      })
    );
    await Promise.all(updates);

    // Floor any negatives to 0 after reversal
    const ingredientIds = purchase.items.map((i) => i.ingredientId);
    await Ingredient.updateMany(
      { _id: { $in: ingredientIds }, currentStock: { $lt: 0 } },
      { $set: { currentStock: 0 } }
    );

    await purchase.deleteOne();

    res.json({ success: true, message: 'Purchase deleted and stock reversed' });
  } catch (error) {
    console.error('Delete purchase error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete purchase' });
  }
};

// @desc    Get purchase stats
// @route   GET /api/purchases/stats
// @access  Private (Admin)
const getPurchaseStats = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const total = await Purchase.countDocuments();

    const monthlyAgg = await Purchase.aggregate([
      { $match: { purchaseDate: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$totalCost' }, count: { $sum: 1 } } }
    ]);

    const allTimeAgg = await Purchase.aggregate([
      { $group: { _id: null, total: { $sum: '$totalCost' } } }
    ]);

    res.json({
      success: true,
      stats: {
        totalPurchases: total,
        thisMonthTotal: monthlyAgg[0]?.total || 0,
        thisMonthCount: monthlyAgg[0]?.count || 0,
        allTimeTotal: allTimeAgg[0]?.total || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch purchase stats' });
  }
};

module.exports = { getPurchases, getPurchaseById, createPurchase, deletePurchase, getPurchaseStats };
