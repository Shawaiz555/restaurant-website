import { useSelector } from 'react-redux';

/**
 * Access app-wide restaurant settings from Redux.
 *
 * Returns flat convenience fields alongside the raw sections so
 * consumers can do: const { restaurantName, deliveryFee, currencySymbol } = useSettings();
 */
const useSettings = () => {
  const { restaurant, currency, ordering, reservations, loaded } =
    useSelector((state) => state.settings);

  return {
    // Raw sections
    restaurant,
    currency,
    ordering,
    reservations,
    loaded,

    // Flat convenience aliases
    restaurantName:          restaurant.name,
    openingTime:             restaurant.openingTime,
    closingTime:             restaurant.closingTime,
    restaurantPhone:         restaurant.phone,
    restaurantEmail:         restaurant.email,
    restaurantAddress:       restaurant.address,
    restaurantCity:          restaurant.city,

    currencySymbol:          currency.symbol,
    currencyCode:            currency.code,

    deliveryFee:             ordering.deliveryFee,
    minOrderAmount:          ordering.minOrderAmount,
    acceptingOrders:         ordering.acceptingOrders,
    estimatedDelivery:       ordering.estimatedDelivery,

    acceptingReservations:   reservations.acceptingReservations,
    maxPartySize:            reservations.maxPartySize,
    advanceBookingDays:      reservations.advanceBookingDays,
    slotDurationMins:        reservations.slotDurationMins,

    /** Format a number as currency: formatPrice(99) → "Rs 99.00" */
    formatPrice: (amount) =>
      `${currency.symbol} ${parseFloat(amount || 0).toFixed(2)}`,
  };
};

export default useSettings;
