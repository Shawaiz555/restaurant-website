const Supplier = require('../models/Supplier');

// @desc    Get all suppliers
// @route   GET /api/suppliers
// @access  Private (Admin)
const getSuppliers = async (req, res) => {
  try {
    const { active } = req.query;
    let query = {};
    if (active === 'true') query.isActive = true;
    if (active === 'false') query.isActive = false;

    const suppliers = await Supplier.find(query).sort({ name: 1 });
    res.json({ success: true, count: suppliers.length, suppliers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch suppliers' });
  }
};

// @desc    Get single supplier
// @route   GET /api/suppliers/:id
// @access  Private (Admin)
const getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }
    res.json({ success: true, supplier });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch supplier' });
  }
};

// @desc    Create supplier
// @route   POST /api/suppliers
// @access  Private (Admin)
const createSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.create(req.body);
    res.status(201).json({ success: true, message: 'Supplier created successfully', supplier });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Supplier with this name already exists' });
    }
    res.status(500).json({ success: false, message: error.message || 'Failed to create supplier' });
  }
};

// @desc    Update supplier
// @route   PUT /api/suppliers/:id
// @access  Private (Admin)
const updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }
    res.json({ success: true, message: 'Supplier updated successfully', supplier });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Supplier with this name already exists' });
    }
    res.status(500).json({ success: false, message: 'Failed to update supplier' });
  }
};

// @desc    Delete supplier
// @route   DELETE /api/suppliers/:id
// @access  Private (Admin)
const deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }
    await supplier.deleteOne();
    res.json({ success: true, message: 'Supplier deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete supplier' });
  }
};

module.exports = { getSuppliers, getSupplierById, createSupplier, updateSupplier, deleteSupplier };
