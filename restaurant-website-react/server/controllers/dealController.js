const Deal = require('../models/Deal');
const Product = require('../models/Product');

// Helper: resolve missing imageUrl for deal items from Product collection.
// Re-fetches from Product whenever imageUrl is blank (empty string or falsy).
const resolveItemImages = async (deal) => {
  const plain = deal.toObject();

  await Promise.all(
    plain.items.map(async (item, i) => {
      // Skip if a usable imageUrl is already stored
      if (item.imageUrl && item.imageUrl.trim() !== '') return;

      const productId = plain.items[i].productId;
      if (!productId) return;

      try {
        const product = await Product.findById(productId).select('imageUrl imageId').lean();
        if (!product) return;

        if (product.imageUrl && product.imageUrl.trim() !== '') {
          plain.items[i].imageUrl = product.imageUrl;
        } else if (product.imageId) {
          plain.items[i].imageUrl = `/api/images/${product.imageId.toString()}`;
          plain.items[i].imageId = product.imageId;
        }
      } catch {
        // silently skip unresolvable items
      }
    })
  );

  return plain;
};

// @desc    Get deals (public: active+date-valid only; admin: ?all=true for all)
// @route   GET /api/deals
const getDeals = async (req, res) => {
  try {
    const { all, isActive } = req.query;
    let filter = {};

    if (all !== 'true') {
      // Public: show all active deals regardless of date range
      filter.isActive = true;
    } else if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    const deals = await Deal.find(filter).sort({ createdAt: -1 });
    const resolvedDeals = await Promise.all(deals.map(resolveItemImages));

    res.json({
      success: true,
      deals: resolvedDeals,
      total: resolvedDeals.length,
    });
  } catch (error) {
    console.error('Get deals error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch deals' });
  }
};

// @desc    Get single deal by ID (public)
// @route   GET /api/deals/:id
const getDealById = async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);
    if (!deal) {
      return res.status(404).json({ success: false, message: 'Deal not found' });
    }
    const resolved = await resolveItemImages(deal);
    res.json({ success: true, deal: resolved });
  } catch (error) {
    console.error('Get deal error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch deal' });
  }
};

// Helper: Enrich deal items by fetching product data
const enrichItems = async (items) => {
  return Promise.all(
    items.map(async (item) => {
      const product = await Product.findById(item.productId).select('name imageUrl imageId category');
      if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
      }
      // Prefer external imageUrl; fall back to GridFS API path via imageId
      const imageUrl = product.imageUrl || (product.imageId ? `/api/images/${product.imageId}` : '');
      return {
        productId: product._id,
        name: product.name,
        imageUrl,
        imageId: product.imageId || null,
        category: product.category || '',
        quantity: item.quantity && Number(item.quantity) >= 1 ? Number(item.quantity) : 1,
      };
    })
  );
};

// @desc    Create a new deal (admin only)
// @route   POST /api/deals
const createDeal = async (req, res) => {
  try {
    const { title, description, price, items, isActive, startDate, endDate } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Deal title is required' });
    }
    if (price === undefined || price === null || isNaN(Number(price)) || Number(price) < 0) {
      return res.status(400).json({ success: false, message: 'A valid deal price is required' });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one item is required' });
    }

    let enrichedItems;
    try {
      enrichedItems = await enrichItems(items);
    } catch (err) {
      return res.status(400).json({ success: false, message: err.message });
    }

    const deal = await Deal.create({
      title: title.trim(),
      description: description ? description.trim() : '',
      price: Number(price),
      items: enrichedItems,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
    });

    res.status(201).json({
      success: true,
      message: 'Deal created successfully',
      deal,
    });
  } catch (error) {
    console.error('Create deal error:', error);
    res.status(500).json({ success: false, message: 'Failed to create deal' });
  }
};

// @desc    Update a deal (admin only)
// @route   PUT /api/deals/:id
const updateDeal = async (req, res) => {
  try {
    const { title, description, price, items, isActive, startDate, endDate } = req.body;

    const deal = await Deal.findById(req.params.id);
    if (!deal) {
      return res.status(404).json({ success: false, message: 'Deal not found' });
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description ? description.trim() : '';
    if (price !== undefined) {
      if (isNaN(Number(price)) || Number(price) < 0) {
        return res.status(400).json({ success: false, message: 'Price must be a non-negative number' });
      }
      updateData.price = Number(price);
    }
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;

    if (items !== undefined) {
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ success: false, message: 'At least one item is required' });
      }
      try {
        updateData.items = await enrichItems(items);
      } catch (err) {
        return res.status(400).json({ success: false, message: err.message });
      }
    }

    const updatedDeal = await Deal.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Deal updated successfully',
      deal: updatedDeal,
    });
  } catch (error) {
    console.error('Update deal error:', error);
    res.status(500).json({ success: false, message: 'Failed to update deal' });
  }
};

// @desc    Toggle isActive on a deal (admin only)
// @route   PATCH /api/deals/:id/toggle
const toggleDealActive = async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);
    if (!deal) {
      return res.status(404).json({ success: false, message: 'Deal not found' });
    }
    deal.isActive = !deal.isActive;
    await deal.save();
    res.json({
      success: true,
      message: `Deal ${deal.isActive ? 'activated' : 'deactivated'} successfully`,
      deal,
    });
  } catch (error) {
    console.error('Toggle deal error:', error);
    res.status(500).json({ success: false, message: 'Failed to toggle deal status' });
  }
};

// @desc    Delete a deal (admin only)
// @route   DELETE /api/deals/:id
const deleteDeal = async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);
    if (!deal) {
      return res.status(404).json({ success: false, message: 'Deal not found' });
    }
    await Deal.findByIdAndDelete(req.params.id);
    res.json({
      success: true,
      message: 'Deal deleted successfully',
    });
  } catch (error) {
    console.error('Delete deal error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete deal' });
  }
};

module.exports = {
  getDeals,
  getDealById,
  createDeal,
  updateDeal,
  toggleDealActive,
  deleteDeal,
};
