import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";
import { showNotification } from "../../store/slices/notificationSlice";
import productsService from "../../services/productsService";
import ordersService from "../../services/ordersService";
import tablesService from "../../services/tablesService";
import useSettings from "../../hooks/useSettings";
import {
  Search,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ChevronRight,
  X,
  CheckCircle,
  Package,
  UtensilsCrossed,
  Banknote,
  TableIcon,
  User,
  Phone,
  ChefHat,
  RefreshCw,
  ShoppingCart,
  ArrowLeft,
  Users,
  Loader2,
} from "lucide-react";

// ─── Helpers ────────────────────────────────────────────────────────────────

const getImageUrl = (product) => productsService.getImageUrl(product);

const calcItemTotal = (item) => {
  let base = item.selectedSize ? item.selectedSize.price : item.basePrice;
  const addonTotal = [
    ...(item.selectedDrinks || []),
    ...(item.selectedDesserts || []),
    ...(item.selectedExtras || []),
  ].reduce((s, a) => s + a.price * (a.qty || 1), 0);
  return (base + addonTotal) * item.qty;
};

// ─── Addon Counter ───────────────────────────────────────────────────────────

const AddonCounter = ({ addon, qty, onInc, onDec }) => (
  <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium text-dark truncate">{addon.name}</p>
      <p className="text-xs text-primary font-semibold">+ Rs. {addon.price}</p>
    </div>
    <div className="flex items-center gap-2 ml-3">
      <button
        onClick={onDec}
        className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
      >
        <Minus className="w-3 h-3 text-dark-gray" />
      </button>
      <span className="w-6 text-center text-sm font-bold text-dark">{qty}</span>
      <button
        onClick={onInc}
        className="w-7 h-7 rounded-full bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors"
      >
        <Plus className="w-3 h-3 text-primary" />
      </button>
    </div>
  </div>
);

// ─── Product Configurator Panel ──────────────────────────────────────────────

const ProductConfigurator = ({ product, onAdd, onClose }) => {
  const { formatPrice } = useSettings();

  const defaultSize = product.sizes?.[0] || null;
  const [selectedSize, setSelectedSize] = useState(defaultSize);
  const [selectedSpice, setSelectedSpice] = useState(null);
  const [qty, setQty] = useState(1);
  const [drinkQtys, setDrinkQtys] = useState({});
  const [dessertQtys, setDessertQtys] = useState({});
  const [extraQtys, setExtraQtys] = useState({});

  const basePrice = selectedSize ? selectedSize.price : product.basePrice;

  const getAddonList = (type) => {
    const qtys = {
      drinks: drinkQtys,
      desserts: dessertQtys,
      extras: extraQtys,
    }[type];
    const items = product[type] || [];
    return items
      .filter((a) => qtys[a.name] > 0)
      .map((a) => ({ ...a, qty: qtys[a.name] }));
  };

  const addonTotal = [
    ...(product.drinks || [])
      .filter((a) => drinkQtys[a.name] > 0)
      .map((a) => ({ ...a, qty: drinkQtys[a.name] })),
    ...(product.desserts || [])
      .filter((a) => dessertQtys[a.name] > 0)
      .map((a) => ({ ...a, qty: dessertQtys[a.name] })),
    ...(product.extras || [])
      .filter((a) => extraQtys[a.name] > 0)
      .map((a) => ({ ...a, qty: extraQtys[a.name] })),
  ].reduce((s, a) => s + a.price * a.qty, 0);

  const lineTotal = (basePrice + addonTotal) * qty;

  const handleAdd = () => {
    onAdd({
      productId: product._id,
      id: product._id,
      name: product.name,
      basePrice: product.basePrice,
      image: product.imageUrl || product.imageId,
      selectedSize,
      selectedSpice,
      selectedDrinks: getAddonList("drinks"),
      selectedDesserts: getAddonList("desserts"),
      selectedExtras: getAddonList("extras"),
      qty,
    });
    onClose();
  };

  const makeQtyUpdater = (setter) => (name, delta) =>
    setter((prev) => ({
      ...prev,
      [name]: Math.max(0, (prev[name] || 0) + delta),
    }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 p-5 border-b border-gray-100 shrink-0">
          <img
            src={getImageUrl(product)}
            alt={product.name}
            className="w-16 h-16 rounded-xl object-cover border border-gray-100"
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/64x64?text=No+Image";
            }}
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-dark text-lg truncate">
              {product.name}
            </h3>
            <p className="text-primary font-semibold text-sm">
              {formatPrice(
                selectedSize ? selectedSize.price : product.basePrice,
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-dark-gray" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Sizes */}
          {product.sizes && product.sizes.length > 0 && (
            <div>
              <p className="text-xs font-bold text-dark-gray uppercase tracking-wider mb-2">
                Size
              </p>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s.name}
                    onClick={() => setSelectedSize(s)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition-all ${
                      selectedSize?.name === s.name
                        ? "bg-primary text-white border-primary shadow-md"
                        : "bg-white text-dark border-gray-200 hover:border-primary/50"
                    }`}
                  >
                    {s.name}
                    <span className="ml-1 text-xs opacity-80">
                      Rs. {s.price}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Spice Level */}
          {product.addOnsConfig?.showSpiceLevel &&
            product.spiceLevels?.length > 0 && (
              <div>
                <p className="text-xs font-bold text-dark-gray uppercase tracking-wider mb-2">
                  Spice Level
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.spiceLevels.map((s) => (
                    <button
                      key={s.name}
                      onClick={() =>
                        setSelectedSpice(
                          selectedSpice?.name === s.name ? null : s,
                        )
                      }
                      className={`px-3 py-1.5 rounded-xl text-sm font-semibold border-2 transition-all ${
                        selectedSpice?.name === s.name
                          ? "bg-primary text-white border-primary"
                          : "bg-white text-dark border-gray-200 hover:border-primary"
                      }`}
                    >
                      🌶 {s.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

          {/* Drinks */}
          {product.addOnsConfig?.showDrinks && product.drinks?.length > 0 && (
            <div>
              <p className="text-xs font-bold text-dark-gray uppercase tracking-wider mb-2">
                Drinks
              </p>
              <div className="bg-gray-50 rounded-xl p-3">
                {product.drinks.map((a) => (
                  <AddonCounter
                    key={a.name}
                    addon={a}
                    qty={drinkQtys[a.name] || 0}
                    onInc={() => makeQtyUpdater(setDrinkQtys)(a.name, 1)}
                    onDec={() => makeQtyUpdater(setDrinkQtys)(a.name, -1)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Desserts */}
          {product.addOnsConfig?.showDesserts &&
            product.desserts?.length > 0 && (
              <div>
                <p className="text-xs font-bold text-dark-gray uppercase tracking-wider mb-2">
                  Desserts
                </p>
                <div className="bg-gray-50 rounded-xl p-3">
                  {product.desserts.map((a) => (
                    <AddonCounter
                      key={a.name}
                      addon={a}
                      qty={dessertQtys[a.name] || 0}
                      onInc={() => makeQtyUpdater(setDessertQtys)(a.name, 1)}
                      onDec={() => makeQtyUpdater(setDessertQtys)(a.name, -1)}
                    />
                  ))}
                </div>
              </div>
            )}

          {/* Extras */}
          {product.addOnsConfig?.showExtras && product.extras?.length > 0 && (
            <div>
              <p className="text-xs font-bold text-dark-gray uppercase tracking-wider mb-2">
                Extras
              </p>
              <div className="bg-gray-50 rounded-xl p-3">
                {product.extras.map((a) => (
                  <AddonCounter
                    key={a.name}
                    addon={a}
                    qty={extraQtys[a.name] || 0}
                    onInc={() => makeQtyUpdater(setExtraQtys)(a.name, 1)}
                    onDec={() => makeQtyUpdater(setExtraQtys)(a.name, -1)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer — quantity & add */}
        <div className="p-5 border-t border-gray-100 shrink-0 bg-cream-light/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 bg-white rounded-xl border-2 border-gray-200 p-1">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <Minus className="w-4 h-4 text-dark-gray" />
              </button>
              <span className="w-8 text-center font-bold text-dark text-lg">
                {qty}
              </span>
              <button
                onClick={() => setQty((q) => q + 1)}
                className="w-8 h-8 rounded-lg bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors"
              >
                <Plus className="w-4 h-4 text-primary" />
              </button>
            </div>
            <div className="text-right">
              <p className="text-xs text-dark-gray">Total</p>
              <p className="text-xl font-bold text-primary">
                {formatPrice(lineTotal)}
              </p>
            </div>
          </div>
          <button
            onClick={handleAdd}
            className="w-full py-3 bg-gradient-to-r from-primary to-primary-dark text-white font-bold rounded-xl hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all text-base"
          >
            Add to Order
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Cart Item Row ────────────────────────────────────────────────────────────

const CartItemRow = ({ item, onRemove, onQtyChange, formatPrice }) => {
  const allAddons = [
    ...(item.selectedDrinks || []).map(
      (a) => `${a.name}${a.qty > 1 ? ` ×${a.qty}` : ""}`,
    ),
    ...(item.selectedDesserts || []).map(
      (a) => `${a.name}${a.qty > 1 ? ` ×${a.qty}` : ""}`,
    ),
    ...(item.selectedExtras || []).map(
      (a) => `${a.name}${a.qty > 1 ? ` ×${a.qty}` : ""}`,
    ),
  ];

  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-dark text-sm truncate">{item.name}</p>
        {item.selectedSize && (
          <p className="text-xs text-dark-gray">{item.selectedSize.name}</p>
        )}
        {item.selectedSpice && (
          <p className="text-xs text-orange-500">
            🌶 {item.selectedSpice.name}
          </p>
        )}
        {allAddons.length > 0 && (
          <p className="text-xs text-dark-gray truncate">
            {allAddons.join(", ")}
          </p>
        )}
        <p className="text-sm font-bold text-primary mt-1">
          {formatPrice(calcItemTotal(item))}
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
          <button
            onClick={() => onQtyChange(item.cartId, -1)}
            className="w-6 h-6 rounded-md hover:bg-white flex items-center justify-center transition-colors"
          >
            <Minus className="w-3 h-3 text-dark-gray" />
          </button>
          <span className="w-5 text-center text-xs font-bold text-dark">
            {item.qty}
          </span>
          <button
            onClick={() => onQtyChange(item.cartId, 1)}
            className="w-6 h-6 rounded-md hover:bg-white flex items-center justify-center transition-colors"
          >
            <Plus className="w-3 h-3 text-primary" />
          </button>
        </div>
        <button
          onClick={() => onRemove(item.cartId)}
          className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors"
        >
          <Trash2 className="w-3 h-3 text-red-500" />
        </button>
      </div>
    </div>
  );
};

// ─── Success Screen ───────────────────────────────────────────────────────────

const SuccessScreen = ({ orderId, orderType, tableNumber, onNewOrder }) => (
  <div className="flex flex-col items-center justify-center h-full py-16 px-8 text-center">
    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-lg">
      <CheckCircle className="w-10 h-10 text-green-500" />
    </div>
    <h2 className="text-2xl font-bold text-dark mb-2">Order Placed!</h2>
    <p className="text-dark-gray mb-1 text-sm">
      Order ID: <span className="font-mono font-bold text-dark">{orderId}</span>
    </p>
    <div className="flex items-center gap-2 mt-2 mb-6">
      <span
        className={`px-3 py-1 rounded-full text-xs font-bold ${
          orderType === "dine-in"
            ? "bg-blue-100 text-blue-700"
            : "bg-orange-100 text-orange-700"
        }`}
      >
        {orderType === "dine-in"
          ? `Dine-In — Table ${tableNumber}`
          : "Takeaway"}
      </span>
      <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
        Cash Payment
      </span>
    </div>
    <p className="text-dark-gray text-sm mb-8">
      The order has been sent to the kitchen queue and will appear in All
      Orders.
    </p>
    <button
      onClick={onNewOrder}
      className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary-dark text-white font-bold rounded-xl hover:shadow-lg hover:scale-105 active:scale-95 transition-all"
    >
      <ShoppingBag className="w-5 h-5" />
      New Order
    </button>
  </div>
);

// ─── Main POS Component ───────────────────────────────────────────────────────

const AdminPOS = () => {
  const dispatch = useDispatch();
  const { formatPrice } = useSettings();

  // Products
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  // Configurator
  const [configProduct, setConfigProduct] = useState(null);

  // Cart
  const [cartItems, setCartItems] = useState([]);

  // Tables (for dine-in picker)
  const [availableTables, setAvailableTables] = useState([]);
  const [loadingTables, setLoadingTables] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null); // full table object

  // Order details
  const [orderType, setOrderType] = useState("takeaway"); // 'takeaway' | 'dine-in'
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  // UI state
  const [placing, setPlacing] = useState(false);
  const [successOrder, setSuccessOrder] = useState(null); // { orderId, orderType, tableNumber }
  const [showMobileCart, setShowMobileCart] = useState(false);

  // Load products
  const loadProducts = useCallback(async () => {
    setLoadingProducts(true);
    const data = await productsService.fetchProducts();
    setProducts(data.filter((p) => p.available !== false));
    setLoadingProducts(false);
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Fetch available tables whenever dine-in is selected
  const loadAvailableTables = useCallback(async () => {
    setLoadingTables(true);
    try {
      const all = await tablesService.getTables();
      setAvailableTables(
        all.filter((t) => t.status === "Available" && t.isActive),
      );
    } catch {
      setAvailableTables([]);
    } finally {
      setLoadingTables(false);
    }
  }, []);

  useEffect(() => {
    if (orderType === "dine-in") {
      loadAvailableTables();
      setSelectedTable(null);
    }
  }, [orderType, loadAvailableTables]);

  // Derived: categories
  const categories = useMemo(() => {
    const cats = [...new Set(products.map((p) => p.category))]
      .filter(Boolean)
      .sort();
    return ["All", ...cats];
  }, [products]);

  // Derived: filtered products
  const filteredProducts = useMemo(() => {
    let list = products;
    if (activeCategory !== "All")
      list = list.filter((p) => p.category === activeCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }
    return list;
  }, [products, activeCategory, searchQuery]);

  // Cart operations
  const addToCart = (item) => {
    const cartId = `${item.productId}-${Date.now()}`;
    setCartItems((prev) => [...prev, { ...item, cartId }]);
    dispatch(
      showNotification({
        type: "success",
        message: `${item.name} added to order`,
      }),
    );
  };

  const removeFromCart = (cartId) => {
    setCartItems((prev) => prev.filter((i) => i.cartId !== cartId));
  };

  const changeQty = (cartId, delta) => {
    setCartItems((prev) =>
      prev
        .map((i) => (i.cartId === cartId ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0),
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setCustomerName("");
    setCustomerPhone("");
    setCustomerEmail("");
    setOrderType("takeaway");
    setSelectedTable(null);
  };

  // Totals
  const subtotal = cartItems.reduce((s, i) => s + calcItemTotal(i), 0);

  // Place order
  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      dispatch(
        showNotification({
          type: "error",
          message: "Add at least one item to place an order",
        }),
      );
      return;
    }
    if (orderType === "dine-in" && !selectedTable) {
      dispatch(
        showNotification({
          type: "error",
          message: "Please select a table for dine-in orders",
        }),
      );
      return;
    }

    setPlacing(true);
    try {
      // Build order items in the format the backend expects
      const items = cartItems.map((item) => ({
        productId: item.productId,
        id: item.productId,
        name: item.name,
        price: item.selectedSize ? item.selectedSize.price : item.basePrice,
        quantity: item.qty,
        size: item.selectedSize?.name || null,
        image: item.image || null,
        addOns: {
          drinks: (item.selectedDrinks || []).map((a) => ({
            id: a._id || a.name,
            name: a.name,
            price: a.price,
            quantity: a.qty,
          })),
          desserts: (item.selectedDesserts || []).map((a) => ({
            id: a._id || a.name,
            name: a.name,
            price: a.price,
            quantity: a.qty,
          })),
          extras: (item.selectedExtras || []).map((a) => ({
            id: a._id || a.name,
            name: a.name,
            price: a.price,
            quantity: a.qty,
          })),
        },
        spiceLevel: item.selectedSpice
          ? { id: item.selectedSpice.name, name: item.selectedSpice.name }
          : null,
        isDeal: false,
      }));

      const tableNum = selectedTable ? String(selectedTable.tableNumber) : null;

      const orderData = {
        customerInfo: {
          fullName: customerName.trim() || "Walk-in Customer",
          email: customerEmail.trim() || "",
          phone: customerPhone.trim() || "",
          address:
            orderType === "dine-in" ? `Table ${tableNum}` : "In-Store Takeaway",
          city: "In-Store",
          postalCode: "00000",
        },
        items,
        subtotal,
        deliveryFee: 0,
        total: subtotal,
        paymentMethod: "Cash",
        orderSource: "in-store",
        orderType,
        tableNumber: tableNum,
        isGuestOrder: false,
      };

      const result = await ordersService.placeOrder(orderData);

      if (result.success) {
        // Mark the selected table as Reserved so online bookings are blocked
        if (orderType === "dine-in" && selectedTable?._id) {
          await tablesService.updateTable(selectedTable._id, {
            status: "Reserved",
          });
        }
        setSuccessOrder({
          orderId: result.order?.orderId || "—",
          orderType,
          tableNumber: tableNum,
        });
        clearCart();
        setShowMobileCart(false);
      } else {
        dispatch(
          showNotification({
            type: "error",
            message: result.message || "Failed to place order",
          }),
        );
      }
    } catch (err) {
      dispatch(
        showNotification({
          type: "error",
          message: "An error occurred. Please try again.",
        }),
      );
    } finally {
      setPlacing(false);
    }
  };

  const handleNewOrder = () => setSuccessOrder(null);

  // ── Render ──────────────────────────────────────────────────────────────────

  if (successOrder) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 min-h-[500px]">
        <SuccessScreen
          orderId={successOrder.orderId}
          orderType={successOrder.orderType}
          tableNumber={successOrder.tableNumber}
          onNewOrder={handleNewOrder}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold font-sans text-primary mb-1 flex items-center gap-2">
              <ShoppingBag className="w-7 h-7" />
              Point of Sale
            </h1>
            <p className="text-dark-gray text-sm">
              Place takeaway & dine-in orders for walk-in customers
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Mobile cart toggle */}
            <button
              onClick={() => setShowMobileCart(true)}
              className="lg:hidden relative flex items-center gap-2 px-4 py-2 bg-primary text-white font-bold rounded-xl text-sm shadow-md"
            >
              <ShoppingCart className="w-4 h-4" />
              Order
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {cartItems.length}
                </span>
              )}
            </button>
            <button
              onClick={loadProducts}
              className="flex items-center gap-1.5 text-xs font-semibold text-primary border border-primary/30 px-3 py-2 rounded-xl hover:bg-primary/5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex gap-4 items-start">
        {/* ── Left: Product Browser ── */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Search */}
          <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-gray" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
              />
            </div>
          </div>

          {/* Category tabs */}
          <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    activeCategory === cat
                      ? "bg-gradient-to-r from-primary to-primary-dark text-white shadow-md"
                      : "bg-gray-100 text-dark-gray hover:bg-primary hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
            {loadingProducts ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="rounded-xl bg-gray-100 animate-pulse h-44"
                  />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-dark-gray font-semibold">
                  No products found
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Try a different category or search term
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                {filteredProducts.map((product) => (
                  <button
                    key={product._id}
                    onClick={() => setConfigProduct(product)}
                    className="group relative flex flex-col bg-white rounded-xl border-2 border-gray-100 hover:border-primary/40 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 overflow-hidden text-left"
                  >
                    <div className="relative w-full aspect-[4/3] bg-cream-light overflow-hidden">
                      <img
                        src={getImageUrl(product)}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/160x120?text=No+Image";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-dark/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-lg">
                          <Plus className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="font-semibold text-dark text-sm leading-tight line-clamp-2">
                        {product.name}
                      </p>
                      <p className="text-primary font-bold text-sm mt-1">
                        {formatPrice(
                          product.sizes?.[0]?.price || product.basePrice,
                        )}
                      </p>
                      <p className="text-xs text-dark-gray mt-0.5">
                        {product.category}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Right: Order Panel (desktop) ── */}
        <div className="hidden lg:flex w-80 xl:w-96 shrink-0 flex-col gap-4">
          <OrderPanel
            cartItems={cartItems}
            orderType={orderType}
            setOrderType={setOrderType}
            selectedTable={selectedTable}
            setSelectedTable={setSelectedTable}
            availableTables={availableTables}
            loadingTables={loadingTables}
            onRefreshTables={loadAvailableTables}
            customerName={customerName}
            setCustomerName={setCustomerName}
            customerPhone={customerPhone}
            setCustomerPhone={setCustomerPhone}
            customerEmail={customerEmail}
            setCustomerEmail={setCustomerEmail}
            subtotal={subtotal}
            placing={placing}
            onRemove={removeFromCart}
            onQtyChange={changeQty}
            onClear={clearCart}
            onPlace={handlePlaceOrder}
            formatPrice={formatPrice}
          />
        </div>
      </div>

      {/* Mobile Cart Drawer */}
      {showMobileCart && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-dark/60 backdrop-blur-sm"
            onClick={() => setShowMobileCart(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-gray-50 flex flex-col shadow-2xl">
            <div className="flex items-center justify-between p-4 bg-white border-b border-gray-100 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowMobileCart(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
                >
                  <ArrowLeft className="w-4 h-4 text-dark-gray" />
                </button>
                <h2 className="font-bold text-dark">Current Order</h2>
              </div>
              <span className="text-sm font-semibold text-primary">
                {cartItems.length} item{cartItems.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <OrderPanel
                cartItems={cartItems}
                orderType={orderType}
                setOrderType={setOrderType}
                selectedTable={selectedTable}
                setSelectedTable={setSelectedTable}
                availableTables={availableTables}
                loadingTables={loadingTables}
                onRefreshTables={loadAvailableTables}
                customerName={customerName}
                setCustomerName={setCustomerName}
                customerPhone={customerPhone}
                setCustomerPhone={setCustomerPhone}
                customerEmail={customerEmail}
                setCustomerEmail={setCustomerEmail}
                subtotal={subtotal}
                placing={placing}
                onRemove={removeFromCart}
                onQtyChange={changeQty}
                onClear={clearCart}
                onPlace={() => {
                  setShowMobileCart(false);
                  handlePlaceOrder();
                }}
                formatPrice={formatPrice}
                isMobile
              />
            </div>
          </div>
        </div>
      )}

      {/* Product Configurator Modal */}
      {configProduct && (
        <ProductConfigurator
          product={configProduct}
          onAdd={addToCart}
          onClose={() => setConfigProduct(null)}
        />
      )}
    </div>
  );
};

// ─── Order Panel (extracted for reuse in mobile drawer) ──────────────────────

const OrderPanel = ({
  cartItems,
  orderType,
  setOrderType,
  selectedTable,
  setSelectedTable,
  availableTables,
  loadingTables,
  onRefreshTables,
  customerName,
  setCustomerName,
  customerPhone,
  setCustomerPhone,
  customerEmail,
  setCustomerEmail,
  subtotal,
  placing,
  onRemove,
  onQtyChange,
  onClear,
  onPlace,
  formatPrice,
  isMobile = false,
}) => (
  <div className={`space-y-3 ${isMobile ? "" : ""}`}>
    {/* Order type selector */}
    <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
      <p className="text-xs font-bold text-dark-gray uppercase tracking-wider mb-3">
        Order Type
      </p>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setOrderType("takeaway")}
          className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all font-semibold text-sm ${
            orderType === "takeaway"
              ? "bg-primary/10 border-primary text-primary"
              : "border-gray-200 text-dark-gray hover:border-primary/40"
          }`}
        >
          <ShoppingBag className="w-5 h-5" />
          Takeaway
        </button>
        <button
          onClick={() => setOrderType("dine-in")}
          className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all font-semibold text-sm ${
            orderType === "dine-in"
              ? "bg-blue-50 border-blue-500 text-blue-600"
              : "border-gray-200 text-dark-gray hover:border-blue-300"
          }`}
        >
          <TableIcon className="w-5 h-5" />
          Dine-In
        </button>
      </div>

      {/* Dine-In: Available Table Picker */}
      {orderType === "dine-in" && (
        <div className="mt-3">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-dark-gray uppercase tracking-wider">
              Select Table *
            </label>
            <button
              onClick={onRefreshTables}
              disabled={loadingTables}
              className="flex items-center gap-1 text-[11px] font-semibold text-blue-500 hover:text-blue-700 transition-colors"
            >
              <RefreshCw
                className={`w-3 h-3 ${loadingTables ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>

          {loadingTables ? (
            <div className="flex items-center justify-center py-6 gap-2 text-sm text-dark-gray">
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
              Loading tables...
            </div>
          ) : availableTables.length === 0 ? (
            <div className="text-center py-5 bg-red-50 rounded-xl border border-red-200">
              <TableIcon className="w-7 h-7 mx-auto mb-1.5 text-red-400" />
              <p className="text-xs font-semibold text-red-600">
                No available tables
              </p>
              <p className="text-[11px] text-red-500 mt-0.5">
                All tables are currently occupied or reserved
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {availableTables.map((table) => {
                const isSelected = selectedTable?._id === table._id;
                return (
                  <button
                    key={table._id}
                    onClick={() => setSelectedTable(isSelected ? null : table)}
                    className={`relative flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all ${
                      isSelected
                        ? "bg-blue-50 border-blue-500 text-blue-700 shadow-md"
                        : "bg-gray-50 border-gray-200 text-dark-gray hover:border-blue-300 hover:bg-blue-50/50"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-2.5 h-2.5 text-white" />
                      </div>
                    )}
                    <TableIcon
                      className={`w-5 h-5 ${isSelected ? "text-blue-500" : "text-gray-400"}`}
                    />
                    <span className="text-xs font-bold leading-none">
                      T{table.tableNumber}
                    </span>
                    <div className="flex items-center gap-0.5 text-[10px] opacity-70">
                      <Users className="w-2.5 h-2.5" />
                      {table.capacity}
                    </div>
                    {table.location && (
                      <span className="text-[9px] opacity-60 truncate w-full text-center leading-none">
                        {table.location}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {selectedTable && (
            <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-xl border border-blue-200">
              <TableIcon className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <p className="text-xs font-semibold text-blue-700 flex-1">
                Table {selectedTable.tableNumber}
                {selectedTable.name ? ` — ${selectedTable.name}` : ""}
              </p>
              <div className="flex items-center gap-1 text-[11px] text-blue-600">
                <Users className="w-3 h-3" />
                {selectedTable.capacity} seats
              </div>
            </div>
          )}
        </div>
      )}
    </div>

    {/* Cart items */}
    <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold text-dark-gray uppercase tracking-wider">
          Items
        </p>
        {cartItems.length > 0 && (
          <button
            onClick={onClear}
            className="text-xs text-red-500 font-semibold hover:text-red-700 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>
      {cartItems.length === 0 ? (
        <div className="text-center py-8">
          <UtensilsCrossed className="w-10 h-10 mx-auto mb-2 text-gray-300" />
          <p className="text-sm text-dark-gray">No items yet</p>
          <p className="text-xs text-gray-400 mt-1">
            Select products from the menu
          </p>
        </div>
      ) : (
        <div>
          {cartItems.map((item) => (
            <CartItemRow
              key={item.cartId}
              item={item}
              onRemove={onRemove}
              onQtyChange={onQtyChange}
              formatPrice={formatPrice}
            />
          ))}
        </div>
      )}
    </div>

    {/* Customer info */}
    <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
      <p className="text-xs font-bold text-dark-gray uppercase tracking-wider mb-3">
        Customer Info{" "}
        <span className="normal-case font-normal text-gray-400">
          (optional)
        </span>
      </p>
      <div className="space-y-2">
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Customer name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full pl-8 pr-3 py-2 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-xs"
          />
        </div>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="tel"
            placeholder="Phone number"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            className="w-full pl-8 pr-3 py-2 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-xs"
          />
        </div>
        <div className="relative">
          <ChefHat className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="email"
            placeholder="Email (for receipt)"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            className="w-full pl-8 pr-3 py-2 rounded-xl border-2 border-gray-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-xs"
          />
        </div>
      </div>
    </div>

    {/* Summary & Place */}
    <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-dark-gray">Subtotal</span>
          <span className="font-semibold text-dark">
            {formatPrice(subtotal)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-dark-gray">Delivery Fee</span>
          <span className="font-semibold text-green-600">Free (In-Store)</span>
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          <span className="font-bold text-dark">Total</span>
          <span className="font-bold text-xl text-primary">
            {formatPrice(subtotal)}
          </span>
        </div>
      </div>
      {/* Payment badge */}
      <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl border border-green-200 mb-3">
        <Banknote className="w-4 h-4 text-green-600 shrink-0" />
        <div>
          <p className="text-xs font-bold text-green-700">Cash Payment</p>
          <p className="text-[11px] text-green-600">
            Collect payment at counter
          </p>
        </div>
      </div>
      <button
        onClick={onPlace}
        disabled={placing || cartItems.length === 0}
        className={`w-full py-3.5 font-bold rounded-xl text-base transition-all flex items-center justify-center gap-2 ${
          placing || cartItems.length === 0
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-gradient-to-r from-primary to-primary-dark text-white hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
        }`}
      >
        {placing ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            Placing Order...
          </>
        ) : (
          <>
            <ChevronRight className="w-5 h-5" />
            Place Order
          </>
        )}
      </button>
    </div>
  </div>
);

export default AdminPOS;
