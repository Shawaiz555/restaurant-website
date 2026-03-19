const Settings = require('../models/Settings');

// @desc    Get settings
// @route   GET /api/settings
// @access  Private (super_admin)
const getSettings = async (req, res) => {
  try {
    const settings = await Settings.getSingleton();
    res.json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch settings' });
  }
};

// @desc    Update settings
// @route   PUT /api/settings
// @access  Private (super_admin)
const updateSettings = async (req, res) => {
  try {
    const settings = await Settings.setSingleton(req.body, req.user._id);
    res.json({ success: true, message: 'Settings updated successfully', settings });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message || 'Failed to update settings' });
  }
};

// @desc    Get public settings (no auth — for frontend display)
// @route   GET /api/settings/public
// @access  Public
const getPublicSettings = async (req, res) => {
  try {
    const settings = await Settings.getSingleton();
    res.json({
      success: true,
      settings: {
        restaurant: {
          name:        settings.restaurant.name,
          tagline:     settings.restaurant.tagline,
          phone:       settings.restaurant.phone,
          email:       settings.restaurant.email,
          address:     settings.restaurant.address,
          city:        settings.restaurant.city,
          openingTime: settings.restaurant.openingTime,
          closingTime: settings.restaurant.closingTime,
        },
        currency: settings.currency,
        ordering: {
          deliveryFee:       settings.ordering.deliveryFee,
          minOrderAmount:    settings.ordering.minOrderAmount,
          acceptingOrders:   settings.ordering.acceptingOrders,
          estimatedDelivery: settings.ordering.estimatedDelivery,
        },
        reservations: {
          acceptingReservations: settings.reservations.acceptingReservations,
          maxPartySize:          settings.reservations.maxPartySize,
          advanceBookingDays:    settings.reservations.advanceBookingDays,
          slotDurationMins:      settings.reservations.slotDurationMins,
        },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch settings' });
  }
};

module.exports = { getSettings, updateSettings, getPublicSettings };
