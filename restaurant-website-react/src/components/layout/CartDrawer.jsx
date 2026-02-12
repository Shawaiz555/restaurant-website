import React from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { showNotification } from "../../store/slices/notificationSlice";
import { useCart } from "../../hooks/useCart";
import { useAuth } from "../../hooks/useAuth";

const CartDrawer = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    items,
    isOpen,
    total,
    itemCount,
    removeFromCart,
    updateQuantity,
    clearCart,
    closeCart,
  } = useCart();
  const { isAuthenticated } = useAuth();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      dispatch(
        showNotification({
          message: "Please login to checkout",
          type: "error",
        }),
      );
      closeCart();
      setTimeout(() => {
        navigate("/login");
      }, 300);
      return;
    }

    // Checkout logic - navigate to checkout page
    closeCart();
    dispatch(
      showNotification({
        message: "Proceeding to checkout... 🛒",
        type: "success",
      }),
    );
    setTimeout(() => {
      navigate("/checkout");
    }, 300);
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeCart}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-cream-light">
          <h2 className="font-display text-2xl text-dark flex items-center gap-2">
            <span>🛒</span>
            <span>Your Cart</span>
            <span className="text-lg text-primary">({itemCount})</span>
          </h2>
          <button
            onClick={closeCart}
            className="w-10 h-10 rounded-full hover:bg-cream transition-all flex items-center justify-center text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Items Container */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-6xl mb-4">🛒</div>
              <h3 className="font-display text-xl text-dark mb-2">
                Your cart is empty
              </h3>
              <p className="text-dark-gray text-sm">
                Add some delicious items to get started!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={`${item.id}-${item.size}`}
                  className="bg-cream-light rounded-2xl p-4"
                >
                  <div className="flex gap-3 mb-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-xl flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-display text-base text-dark mb-1 truncate">
                        {item.name}
                      </h4>
                      {item.size && (
                        <p className="text-xs text-dark-gray mb-1">
                          Size: {item.size}
                        </p>
                      )}
                      <p className="text-primary font-semibold">
                        Rs.{item.price.toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-xl opacity-60 hover:opacity-100 hover:text-red-600 transition-all flex-shrink-0"
                      title="Remove item"
                    >
                      🗑️
                    </button>
                  </div>

                  {/* Quantity Controls and Total */}
                  <div className="flex items-center justify-between pt-3 border-t border-cream">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="w-8 h-8 flex items-center justify-center bg-white rounded-lg hover:bg-primary hover:text-white transition-all shadow-sm"
                      >
                        <span className="text-lg font-semibold">−</span>
                      </button>
                      <span className="font-semibold text-dark w-10 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="w-8 h-8 flex items-center justify-center bg-white rounded-lg hover:bg-primary hover:text-white transition-all shadow-sm"
                      >
                        <span className="text-lg font-semibold">+</span>
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-lg text-dark">
                        Rs.{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-200 bg-cream-light p-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-dark-gray font-medium">Subtotal</span>
              <span className="font-display text-xl text-dark">
                Rs.{total.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center mb-6 pt-3 border-t border-gray-300">
              <span className="font-display text-lg text-dark">Total</span>
              <span className="font-display text-2xl text-primary">
                Rs.{total.toFixed(2)}
              </span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary text-white py-4 rounded-2xl font-display text-lg transition-all shadow-xl hover:shadow-2xl hover:scale-105 flex items-center justify-center gap-2"
            >
              <span>Proceed to Checkout</span>
              <span className="text-xl">→</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
