import React, { useEffect, useState } from "react";
import dealsService from "../services/dealsService";
import DealsHeroSection from "../components/deals/DealsHeroSection";
import { Package, ArrowRight, Clock, CheckCircle2 } from "lucide-react";

const DealCard = ({ deal }) => {
  const formatPrice = (price) => {
    return `Rs. ${Number(price).toFixed(0)}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const hasDateRange = deal.startDate || deal.endDate;
  const items = deal.items || [];

  return (
    <div className="group bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col h-full relative">
      {/* Save Badge */}
      <div className="absolute top-4 left-4 z-20 bg-primary text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg transform -rotate-2 group-hover:rotate-0 transition-transform duration-300">
        Save Big
      </div>

      {/* Image Section / Header */}
      <div className="relative h-52 bg-gradient-to-br from-primary/10 via-orange/5 to-cream flex items-center justify-center overflow-hidden">
        {/* Animated background decorators */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange/10 rounded-full blur-2xl group-hover:translate-x-10 transition-transform duration-700" />

        {/* Overlapping items display */}
        <div className="relative flex items-center justify-center py-8">
          {items.slice(0, 4).map((item, idx) => (
            <div
              key={idx}
              className="w-20 h-20 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white flex-shrink-0 relative group-hover:scale-110 transition-transform duration-500"
              style={{
                marginLeft: idx > 0 ? "-24px" : "0",
                zIndex: 4 - idx,
                boxShadow:
                  "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
              }}
            >
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:rotate-6 transition-transform duration-500"
                  onError={(e) => {
                    e.target.parentNode.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10 text-2xl">🍽️</div>`;
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10 text-2xl text-primary">
                  🍽️
                </div>
              )}
            </div>
          ))}
          {items.length > 4 && (
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center bg-primary text-white font-black text-xs flex-shrink-0 border-4 border-white shadow-lg relative z-0"
              style={{ marginLeft: "-20px" }}
            >
              +{items.length - 4}
            </div>
          )}
        </div>

        {/* Date / Status Badge */}
        <div className="absolute top-4 right-4 z-20">
          {hasDateRange ? (
            <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-sm text-[11px] font-bold text-primary px-3 py-1.5 rounded-full shadow-md border border-primary/10">
              <Clock className="w-3.5 h-3.5" />
              <span>
                {deal.endDate
                  ? `Ends ${formatDate(deal.endDate)}`
                  : `From ${formatDate(deal.startDate)}`}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-green-500 text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-md">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Always Live</span>
            </div>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex-1">
          <h3 className="font-bold text-dark text-2xl leading-tight group-hover:text-primary transition-colors duration-300">
            {deal.title}
          </h3>

          {deal.description && (
            <p className="text-dark-gray text-sm mt-3 line-clamp-2 leading-relaxed font-medium">
              {deal.description}
            </p>
          )}

          {/* Includes Section */}
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-3">
              <Package className="w-4 h-4 text-primary" />
              <span className="text-[11px] font-black text-dark-gray uppercase tracking-widest">
                Deal Package Includes
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="inline-flex items-center bg-cream-light/50 hover:bg-primary/10 text-primary-dark font-bold px-3 py-1.5 rounded-xl border border-primary/5 transition-colors cursor-default"
                >
                  <span className="text-[12px]">
                    {(item.quantity || 1) > 1 && (
                      <span className="text-primary mr-1">
                        {item.quantity}×
                      </span>
                    )}
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer / CTA Section */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="flex items-end justify-between mb-4">
            <div>
              <p className="text-[10px] font-black text-dark-gray uppercase tracking-widest mb-0.5">
                Total Deal Value
              </p>
              <div className="flex items-baseline gap-1">
                <span className="text-primary font-black text-3xl">
                  {formatPrice(deal.price)}
                </span>
                <span className="text-dark-gray text-[10px] font-bold">
                  Incl. Tax
                </span>
              </div>
            </div>
          </div>

          <button className="w-full flex items-center justify-center gap-2 bg-dark hover:bg-primary text-white font-bold py-4 rounded-2xl transition-all duration-300 group/btn shadow-lg hover:shadow-primary/30">
            <span>Claim This Deal</span>
            <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};

const Deals = () => {
  const [deals, setDeals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    dealsService
      .getDeals()
      .then((data) => setDeals(data))
      .catch(() => setError("Failed to load deals. Please try again."))
      .finally(() => setIsLoading(false));
  }, []);

  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    dealsService
      .getDeals()
      .then((data) => setDeals(data))
      .catch(() => setError("Failed to load deals. Please try again."))
      .finally(() => setIsLoading(false));
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-cream-light via-white to-cream-light pt-20">
      <DealsHeroSection deals={deals} isLoading={isLoading} error={error} />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
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
              onClick={handleRetry}
              className="bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-dark transition-all hover:scale-105"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && deals.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
            <div className="w-24 h-24 bg-cream rounded-full flex items-center justify-center">
              <span className="text-5xl">🍽️</span>
            </div>
            <h3 className="text-2xl font-bold text-dark">No Deals Right Now</h3>
            <p className="text-dark-gray max-w-md text-lg">
              Our chefs are cooking up something special. Check back soon for
              exciting new deals!
            </p>
            <a
              href="/menu"
              className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-semibold hover:bg-primary-dark transition-all hover:scale-105 mt-2"
            >
              Browse Our Menu
            </a>
          </div>
        )}

        {/* Deals Grid */}
        {!isLoading && !error && deals.length > 0 && (
          <>
            {/* Section label */}
            <div className="flex items-center gap-4 mb-8">
              <div className="flex-1 h-px bg-gray-200" />
              <h2 className="text-dark-gray font-semibold text-sm uppercase tracking-widest whitespace-nowrap">
                {deals.length} Deal{deals.length !== 1 ? "s" : ""} Available
              </h2>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {deals.map((deal) => (
                <DealCard key={deal._id} deal={deal} />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
};

export default Deals;
