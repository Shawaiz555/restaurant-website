import { useSelector, useDispatch } from 'react-redux';
import { addToCart, removeFromCart, updateQuantity, clearCart, toggleCart, openCart, closeCart } from '../store/slices/cartSlice';
import { showNotification } from '../store/slices/notificationSlice';
import { useAuth } from './useAuth';

export const useCart = () => {
  const dispatch = useDispatch();
  const { userId } = useAuth();
  const { items, isOpen } = useSelector((state) => state.cart);

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleAddToCart = (product) => {
    dispatch(addToCart({ product, userId }));
    dispatch(showNotification({
      message: `${product.name} added to cart! 🛒`,
      type: 'success'
    }));
    // Auto-open cart when item is added
    dispatch(openCart());
  };

  const handleRemoveFromCart = (productId) => {
    const item = items.find(i => i.id === productId);
    dispatch(removeFromCart({ productId, userId }));
    if (item) {
      dispatch(showNotification({
        message: `${item.name} removed from cart`,
        type: 'success'
      }));
    }
  };

  const handleUpdateQuantity = (productId, quantity) => {
    dispatch(updateQuantity({ productId, quantity, userId }));
  };

  const handleClearCart = (silent = false) => {
    dispatch(clearCart(userId));
    if (!silent) {
      dispatch(showNotification({
        message: 'Cart cleared successfully',
        type: 'success'
      }));
    }
  };

  const handleToggleCart = () => {
    dispatch(toggleCart());
  };

  const handleOpenCart = () => {
    dispatch(openCart());
  };

  const handleCloseCart = () => {
    dispatch(closeCart());
  };

  return {
    items,
    isOpen,
    total,
    itemCount,
    addToCart: handleAddToCart,
    removeFromCart: handleRemoveFromCart,
    updateQuantity: handleUpdateQuantity,
    clearCart: handleClearCart,
    toggleCart: handleToggleCart,
    openCart: handleOpenCart,
    closeCart: handleCloseCart,
  };
};

export default useCart;
