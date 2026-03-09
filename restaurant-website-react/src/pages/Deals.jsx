import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import dealsService from "../services/dealsService";
import DealsHeroSection from "../components/deals/DealsHeroSection";
import { addDealToCart, openCart } from "../store/slices/cartSlice";
import { showNotification } from "../store/slices/notificationSlice";
import { useAuth } from "../hooks/useAuth";
import productsService from "../services/productsService";
import {
  Package,
  ArrowRight,
  Clock,
  CheckCircle2,
  Sparkles,
  Flame,
  Crown,
  Zap,
  ShoppingCart,
  Tag,
} from "lucide-react";
import { Link } from "react-router-dom";

/* ─────────────────────────────────────────────────────
   Size classification
   1   item  → "sm"   solo pick
   2-3 items → "md"   value bundle
   4-6 items → "lg"   featured deal (full-width)
   7+  items → "xl"   mega bundle (full-width hero)
───────────────────────────────────────────────────── */
const getDealSize = (itemCount) => {
  if (itemCount <= 1) return "sm";
  if (itemCount <= 3) return "md";
  if (itemCount <= 6) return "lg";
  return "xl";
};

/* Size-type metadata — defines the display order */
const SIZE_TYPES = [
  { key: "sm", label: "Solo Picks", desc: "Single item deals", icon: Zap },
  { key: "md", label: "Value Bundles", desc: "2–3 item combos", icon: Package },
  {
    key: "lg",
    label: "Featured Deals",
    desc: "4–6 item featured packages",
    icon: Flame,
  },
  {
    key: "xl",
    label: "Mega Bundles",
    desc: "7+ item ultimate packages",
    icon: Crown,
  },
];

const formatPrice = (price) => `Rs. ${Number(price).toFixed(0)}`;

const formatDate = (dateStr) => {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

/* ── Item image ── */
const ItemImage = ({ item, className = "w-14 h-14" }) => {
  const src =
    item.imageUrl || item.imageId
      ? productsService.getImageUrl(item.imageUrl || item.imageId)
      : null;

  return (
    <div
      className={`${className} rounded-xl border-2 border-white shadow overflow-hidden bg-cream flex-shrink-0`}
    >
      {src ? (
        <img
          src={src}
          alt={item.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.parentNode.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-primary/10 text-lg">🍽️</div>`;
          }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-primary/10 text-xl">
          🍽️
        </div>
      )}
    </div>
  );
};

/* ── Availability badge ── */
const AvailBadge = ({ deal }) => {
  const hasDate = deal.startDate || deal.endDate;
  if (hasDate) {
    return (
      <div className="flex items-center gap-1 text-[10px] font-bold text-dark-gray/60">
        <Clock className="w-3 h-3 text-primary" />
        {deal.endDate
          ? `Ends ${formatDate(deal.endDate)}`
          : `From ${formatDate(deal.startDate)}`}
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1 text-[10px] font-bold text-green-600">
      <CheckCircle2 className="w-3 h-3" />
      Always Available
    </div>
  );
};

/* ══════════════════════════════════════════════════════
   SM CARD — compact horizontal pill (1 item)
══════════════════════════════════════════════════════ */
const SmCard = ({ deal, onClaim }) => {
  const item = deal.items?.[0];

  return (
    <div className="group relative bg-white rounded-2xl border border-cream-dark hover:border-primary/30 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden h-full flex flex-col justify-between">
      {/* Orange left accent stripe */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-primary-light rounded-l-2xl" />

      <div className="pl-5 pr-4 py-5 flex flex-col gap-4 flex-1">
        {/* Top row: image + info */}
        <div className="flex items-center gap-4">
          {item && (
            <ItemImage item={item} className="w-16 h-16 flex-shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full mb-1">
              <Zap className="w-2.5 h-2.5" />
              Solo Pick
            </span>
            <h3 className="font-bold text-dark text-base leading-snug group-hover:text-primary transition-colors">
              {deal.title}
            </h3>
            {item && (
              <p className="text-dark-gray/60 text-xs font-medium truncate mt-0.5">
                {(item.quantity || 1) > 1 ? `${item.quantity}× ` : ""}
                {item.name}
              </p>
            )}
          </div>
        </div>

        {/* Description if any */}
        {deal.description && (
          <p className="text-dark-gray/60 text-xs leading-relaxed line-clamp-2">
            {deal.description}
          </p>
        )}

        {/* Footer */}
        <div className="mt-auto pt-3 border-t border-cream flex items-center justify-between">
          <div>
            <AvailBadge deal={deal} />
            <p className="text-primary font-black text-2xl leading-tight mt-0.5">
              {formatPrice(deal.price)}
            </p>
          </div>
          <button
            onClick={() => onClaim(deal)}
            className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
          >
            Claim <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════
   MD CARD — clean vertical card (2-3 items)
══════════════════════════════════════════════════════ */
const MdCard = ({ deal, onClaim }) => {
  const items = deal.items || [];

  return (
    <div className="group relative bg-white rounded-2xl border border-cream-dark hover:border-primary/30 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden flex flex-col h-full">
      {/* Top image strip */}
      <div className="relative bg-gradient-to-br from-cream via-cream-light to-cream-dark h-36 flex items-center justify-center overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute top-2 right-2 w-20 h-20 bg-primary/8 rounded-full blur-xl" />
        <div className="absolute -bottom-4 left-4 w-16 h-16 bg-primary-light/10 rounded-full blur-lg" />

        {/* Stacked item images */}
        <div className="relative flex items-center justify-center gap-2 z-10">
          {items.slice(0, 3).map((item, idx) => (
            <div
              key={idx}
              className="group-hover:scale-105 transition-transform duration-400"
              style={{ transitionDelay: `${idx * 50}ms` }}
            >
              <ItemImage item={item} className="w-16 h-16 shadow-md" />
            </div>
          ))}
        </div>

        {/* Type badge */}
        <div className="absolute top-3 left-3 z-20">
          <span className="inline-flex items-center gap-1 bg-white/90 backdrop-blur text-primary text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shadow border border-primary/20">
            <Package className="w-2.5 h-2.5" />
            Value Bundle
          </span>
        </div>

        {/* Item count */}
        <div className="absolute top-3 right-3 z-20">
          <span className="bg-primary/10 text-primary text-[10px] font-black px-2.5 py-1 rounded-full">
            {items.length} items
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1 gap-3">
        <div>
          <h3 className="font-bold text-dark text-lg leading-tight group-hover:text-primary transition-colors">
            {deal.title}
          </h3>
          {deal.description && (
            <p className="text-dark-gray/70 text-xs mt-1.5 line-clamp-2 leading-relaxed">
              {deal.description}
            </p>
          )}
        </div>

        {/* Includes */}
        <div className="flex flex-col gap-1.5">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 text-xs font-medium text-dark-gray"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
              <span className="truncate">
                {(item.quantity || 1) > 1 && (
                  <span className="text-primary font-bold mr-1">
                    {item.quantity}×
                  </span>
                )}
                {item.name}
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-auto pt-3 border-t border-cream flex items-center justify-between">
          <div>
            <AvailBadge deal={deal} />
            <p className="text-primary font-black text-2xl leading-tight mt-0.5">
              {formatPrice(deal.price)}
            </p>
          </div>
          <button
            onClick={() => onClaim(deal)}
            className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
          >
            Claim Deal
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════
   LG CARD — full-width featured (4-6 items)
══════════════════════════════════════════════════════ */
const LgCard = ({ deal, onClaim }) => {
  const items = deal.items || [];

  return (
    <div className="group relative bg-white rounded-2xl border border-cream-dark hover:border-primary/40 shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col-reverse sm:flex-row">
      {/* Left content */}
      <div className="flex flex-col flex-1 p-6 sm:p-8 gap-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-2">
              <Flame className="w-3 h-3" />
              Featured Deal · {items.length} items
            </span>
            <h3 className="font-bold text-dark text-2xl sm:text-3xl leading-tight group-hover:text-primary transition-colors">
              {deal.title}
            </h3>
          </div>
          <AvailBadge deal={deal} />
        </div>

        {deal.description && (
          <p className="text-dark-gray/70 text-sm leading-relaxed line-clamp-2">
            {deal.description}
          </p>
        )}

        {/* Items */}
        <div>
          <p className="text-[9px] font-black uppercase tracking-widest text-dark-gray/40 mb-2.5 flex items-center gap-1.5">
            <Package className="w-3 h-3" />
            Package Includes
          </p>
          <div className="grid grid-cols-2 gap-2">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 bg-cream-light rounded-lg px-3 py-2 text-xs font-medium text-dark-gray"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                <span className="truncate">
                  {(item.quantity || 1) > 1 && (
                    <span className="text-primary font-bold mr-1">
                      {item.quantity}×
                    </span>
                  )}
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-auto">
          <button
            onClick={() => onClaim(deal)}
            className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-primary to-primary-dark text-white font-bold text-sm uppercase tracking-wider py-4 rounded-xl shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 transition-all duration-200"
          >
            <Flame className="w-5 h-5" />
            Claim This Deal
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
      {/* Right orange panel */}
      <div className="relative sm:w-64 lg:w-2/5 flex-shrink-0 bg-gradient-to-br from-primary to-primary-dark flex flex-col items-center justify-center p-8 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
        <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full bg-white/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-white/5" />

        {/* Badge */}
        <div className="absolute top-4 left-4">
          <span className="inline-flex items-center gap-1 bg-white/20 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-white/30">
            <Flame className="w-2.5 h-2.5" />
            Featured
          </span>
        </div>

        {/* Item images grid */}
        <div className="relative z-10 flex flex-wrap gap-2 justify-center max-w-[160px]">
          {items.slice(0, 6).map((item, idx) => (
            <div
              key={idx}
              className="group-hover:scale-105 transition-transform duration-500"
              style={{ transitionDelay: `${idx * 60}ms` }}
            >
              <ItemImage
                item={item}
                className="w-14 h-14 border-2 border-white/50 shadow-lg"
              />
            </div>
          ))}
          {items.length > 6 && (
            <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-white/20 text-white font-black text-sm border-2 border-white/50">
              +{items.length - 6}
            </div>
          )}
        </div>

        {/* Price */}
        <div className="relative z-10 mt-5 text-center">
          <p className="text-white/60 text-[10px] font-black uppercase tracking-widest">
            Deal Price
          </p>
          <p className="text-white font-black text-4xl leading-none">
            {formatPrice(deal.price)}
          </p>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════
   XL CARD — mega hero full-width (7+ items)
══════════════════════════════════════════════════════ */
const XlCard = ({ deal, onClaim }) => {
  const items = deal.items || [];

  return (
    <div className="group relative bg-white rounded-2xl border border-cream-dark hover:border-primary/40 shadow-lg hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 overflow-hidden">
      {/* Hero header */}
      <div className="relative bg-gradient-to-r from-primary-dark via-primary to-primary-light px-8 sm:px-10 py-10 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -top-12 -right-12 w-56 h-56 bg-white rounded-full blur-3xl" />
          <div className="absolute -bottom-8 left-1/4 w-40 h-40 bg-white rounded-full blur-2xl" />
          <div className="absolute top-1/2 right-1/3 w-32 h-32 bg-primary-dark rounded-full blur-2xl" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          {/* Left: text */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-white/30">
                <Crown className="w-3 h-3" />
                Mega Bundle
              </span>
              <span className="inline-flex items-center gap-1.5 bg-white/20 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-white/30">
                <Sparkles className="w-3 h-3" />
                {items.length} Items
              </span>
              <AvailBadge deal={{ ...deal, _overrideStyle: "light" }} />
            </div>

            <h3 className="font-black text-white text-3xl sm:text-4xl lg:text-5xl leading-tight">
              {deal.title}
            </h3>

            {deal.description && (
              <p className="text-white/80 text-sm sm:text-base mt-3 max-w-xl leading-relaxed">
                {deal.description}
              </p>
            )}
          </div>

          {/* Right: price + CTA */}
          <div className="flex flex-col items-start lg:items-end gap-4 flex-shrink-0">
            <div className="lg:text-right">
              <p className="text-white/60 text-[10px] font-black uppercase tracking-widest">
                Total Value
              </p>
              <p className="text-white font-black text-5xl sm:text-6xl leading-none">
                {formatPrice(deal.price)}
              </p>
              <p className="text-white/50 text-[10px] mt-1">
                Inclusive of all items
              </p>
            </div>
            <button
              onClick={() => onClaim(deal)}
              className="flex items-center gap-2.5 bg-white text-primary hover:bg-cream font-black text-sm uppercase tracking-wider px-8 py-4 rounded-xl shadow-2xl hover:scale-105 hover:shadow-white/30 transition-all duration-200"
            >
              <ShoppingCart className="w-5 h-5" />
              Claim Mega Bundle
            </button>
          </div>
        </div>

        {/* Scrollable image strip */}
        <div className="relative z-10 mt-8 flex items-center gap-3 overflow-x-auto pb-1 scrollbar-hide">
          {items.map((item, idx) => (
            <div
              key={idx}
              className="flex-shrink-0 group-hover:scale-105 transition-transform duration-500"
              style={{ transitionDelay: `${idx * 35}ms` }}
            >
              <ItemImage
                item={item}
                className="w-16 h-16 border-2 border-white/50 shadow-lg"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Items tag row */}
      <div className="px-8 sm:px-10 py-5 bg-cream-light border-t border-cream-dark">
        <p className="text-[9px] font-black uppercase tracking-widest text-dark-gray/40 mb-3 flex items-center gap-1.5">
          <Package className="w-3 h-3" />
          Full Package Contents
        </p>
        <div className="flex flex-wrap gap-2">
          {items.map((item, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1.5 bg-white border border-cream-dark text-dark-gray text-xs font-medium px-3 py-1.5 rounded-lg"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
              {(item.quantity || 1) > 1 && (
                <span className="text-primary font-bold">{item.quantity}×</span>
              )}
              {item.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ── Route to the right card ── */
const DealCard = ({ deal, onClaim }) => {
  const size = getDealSize(deal.items?.length || 0);
  if (size === "sm") return <SmCard deal={deal} onClaim={onClaim} />;
  if (size === "lg") return <LgCard deal={deal} onClaim={onClaim} />;
  if (size === "xl") return <XlCard deal={deal} onClaim={onClaim} />;
  return <MdCard deal={deal} onClaim={onClaim} />;
};

/* ── Grid for a single size-type group (all cards same height) ── */
const DealsGrid = ({ deals, onClaim, sizeType }) => {
  const isSmall = sizeType === "sm";
  const isMedium = sizeType === "md";
  if (isSmall) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 lg:gap-6 items-stretch">
        {deals.map((deal) => (
          <DealCard key={deal._id} deal={deal} onClaim={onClaim} />
        ))}
      </div>
    );
  }
  if (isMedium) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6 items-stretch">
        {deals.map((deal) => (
          <DealCard key={deal._id} deal={deal} onClaim={onClaim} />
        ))}
      </div>
    );
  }
  // LG / XL — full-width stacked
  return (
    <div className="flex flex-col gap-5 lg:gap-6">
      {deals.map((deal) => (
        <DealCard key={deal._id} deal={deal} onClaim={onClaim} />
      ))}
    </div>
  );
};

/* ══════════════════════════════════════════════════════
   Main page
══════════════════════════════════════════════════════ */
const Deals = () => {
  const dispatch = useDispatch();
  const { userId } = useAuth();
  const [deals, setDeals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeType, setActiveType] = useState("all");

  const loadDeals = () => {
    setIsLoading(true);
    setError(null);
    dealsService
      .getDeals()
      .then((data) =>
        setDeals([...data].sort((a, b) => (a.price || 0) - (b.price || 0))),
      )
      .catch(() => setError("Failed to load deals. Please try again."))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadDeals();
  }, []);

  const handleClaimDeal = (deal) => {
    dispatch(addDealToCart({ deal, userId }));
    dispatch(
      showNotification({
        message: `${deal.title} added to cart!`,
        type: "success",
      }),
    );
    dispatch(openCart());
  };

  // Group deals by size type, in display order
  const typeGroups = SIZE_TYPES.map((t) => ({
    ...t,
    deals: deals.filter((d) => getDealSize(d.items?.length || 0) === t.key),
  })).filter((g) => g.deals.length > 0);

  return (
    <main className="min-h-screen bg-gradient-to-br from-cream-light via-white to-cream-light pt-20">
      <DealsHeroSection deals={deals} isLoading={isLoading} error={error} />

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-14 h-14 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-dark-gray font-medium text-lg">
              Loading deals...
            </p>
          </div>
        )}

        {/* Error */}
        {error && !isLoading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
              <span className="text-4xl">😕</span>
            </div>
            <h3 className="text-xl font-bold text-dark">
              Oops! Something went wrong
            </h3>
            <p className="text-dark-gray max-w-sm">{error}</p>
            <button
              onClick={loadDeals}
              className="bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-dark transition-all hover:scale-105"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty */}
        {!isLoading && !error && deals.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="w-24 h-24 bg-cream rounded-full flex items-center justify-center">
              <span className="text-5xl">🍽️</span>
            </div>
            <h3 className="text-2xl font-bold text-dark">No Deals Right Now</h3>
            <p className="text-dark-gray max-w-md text-lg">
              Our chefs are cooking up something special. Check back soon!
            </p>
            <Link
              to="/menu"
              className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-dark transition-all hover:scale-105 mt-2"
            >
              Browse Our Menu
            </Link>
          </div>
        )}

        {/* Deals content */}
        {!isLoading && !error && deals.length > 0 && (
          <div className="space-y-10">
            {/* Header + type filter tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-primary/20 pb-6">
              <div>
                <h2 className="text-4xl lg:text-5xl font-bold text-primary">
                  Today's Deals
                </h2>
                <p className="text-dark-gray/60 text-sm mt-3">
                  {deals.length} deal{deals.length !== 1 ? "s" : ""} available
                  {typeGroups.length > 1 && ` · ${typeGroups.length} types`}
                </p>
              </div>

              {/* Type tabs */}
              {typeGroups.length > 1 && (
                <div className="flex flex-wrap gap-2 border border-primary/40 rounded-xl p-3">
                  <button
                    onClick={() => setActiveType("all")}
                    className={`inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl border transition-all duration-200 ${
                      activeType === "all"
                        ? "bg-primary border-primary text-white shadow-md shadow-primary/20"
                        : "bg-white border-cream-dark text-dark-gray hover:border-primary/40 hover:text-primary"
                    }`}
                  >
                    <Tag className="w-3.5 h-3.5" />
                    All
                  </button>
                  {typeGroups.map((g) => {
                    const Icon = g.icon;
                    return (
                      <button
                        key={g.key}
                        onClick={() => setActiveType(g.key)}
                        className={`inline-flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl border transition-all duration-200 ${
                          activeType === g.key
                            ? "bg-primary border-primary text-white shadow-md shadow-primary/20"
                            : "bg-white border-cream-dark text-dark-gray hover:border-primary/40 hover:text-primary"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {g.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* All view: one section per type */}
            {activeType === "all" ? (
              <div className="space-y-12">
                {typeGroups.map((g) => {
                  const Icon = g.icon;
                  return (
                    <div key={g.key}>
                      {/* Section header */}
                      <div className="flex items-center gap-3 mb-6">
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-dark leading-none">
                              {g.label}
                            </h3>
                            <p className="text-xs text-dark-gray/50 mt-0.5">
                              {g.desc}
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-dark-gray/40 bg-cream px-2.5 py-1 rounded-full flex-shrink-0">
                          {g.deals.length} deal{g.deals.length !== 1 ? "s" : ""}
                        </span>
                        <div className="flex-1 h-px bg-cream-dark" />
                      </div>
                      <DealsGrid
                        deals={g.deals}
                        onClaim={handleClaimDeal}
                        sizeType={g.key}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Single type view */
              (() => {
                const g = typeGroups.find((t) => t.key === activeType);
                return g ? (
                  <DealsGrid
                    deals={g.deals}
                    onClaim={handleClaimDeal}
                    sizeType={g.key}
                  />
                ) : null;
              })()
            )}
          </div>
        )}
      </div>
    </main>
  );
};

export default Deals;
