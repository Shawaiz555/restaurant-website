/**
 * Skeleton loader primitives for admin pages.
 * All skeletons use Tailwind animate-pulse for a consistent shimmer effect.
 *
 * Usage:
 *   import { TablePageSkeleton, DashboardSkeleton, FormPageSkeleton } from './SkeletonLoader';
 *   if (loading) return <TablePageSkeleton stats={4} cols={6} rows={8} />;
 */

import React from "react";

// ─── Primitives ───────────────────────────────────────────────────────────────

const Bone = ({ className = "" }) => (
  <div className={`bg-gray-200 rounded-lg animate-pulse ${className}`} />
);

// ─── Stats row ────────────────────────────────────────────────────────────────

const StatsSkeleton = ({ count = 4 }) => (
  <div className={`grid gap-4 grid-cols-2 md:grid-cols-${Math.min(count, 4)} xl:grid-cols-${count}`}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-3">
          <Bone className="w-10 h-10 rounded-xl" />
          <Bone className="h-3 w-20" />
        </div>
        <Bone className="h-7 w-24 mb-1" />
        <Bone className="h-3 w-16" />
      </div>
    ))}
  </div>
);

// ─── Page header ──────────────────────────────────────────────────────────────

const HeaderSkeleton = ({ hasButton = true }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
    <div className="flex items-center justify-between flex-wrap gap-3">
      <div className="flex items-center gap-3">
        <Bone className="w-12 h-12 rounded-2xl" />
        <div className="space-y-2">
          <Bone className="h-7 w-48" />
          <Bone className="h-3 w-36" />
        </div>
      </div>
      {hasButton && <Bone className="h-10 w-32 rounded-xl" />}
    </div>
  </div>
);

// ─── Filter bar ───────────────────────────────────────────────────────────────

const FilterSkeleton = ({ inputs = 3 }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
    <div className="flex flex-wrap gap-3">
      {Array.from({ length: inputs }).map((_, i) => (
        <Bone key={i} className="h-10 w-40 rounded-xl" />
      ))}
    </div>
  </div>
);

// ─── Table ────────────────────────────────────────────────────────────────────

const TableSkeleton = ({ cols = 6, rows = 8 }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
    {/* header row */}
    <div className="flex gap-4 px-6 py-4 border-b border-gray-100 bg-gray-50">
      {Array.from({ length: cols }).map((_, i) => (
        <Bone key={i} className="h-3 flex-1" />
      ))}
    </div>
    {/* data rows */}
    {Array.from({ length: rows }).map((_, r) => (
      <div
        key={r}
        className={`flex gap-4 px-6 py-4 border-b border-gray-50 ${r % 2 === 1 ? "bg-gray-50/50" : ""}`}
      >
        {Array.from({ length: cols }).map((_, c) => (
          <Bone key={c} className={`h-4 flex-1 ${c === 0 ? "max-w-[2rem]" : ""}`} />
        ))}
      </div>
    ))}
    {/* footer pagination */}
    <div className="flex items-center justify-between px-6 py-4">
      <Bone className="h-3 w-32" />
      <div className="flex gap-2">
        {[1, 2, 3].map((i) => (
          <Bone key={i} className="h-8 w-8 rounded-lg" />
        ))}
      </div>
    </div>
  </div>
);

/**
 * Rows-only skeleton for pages that already wrap the table in a white card.
 * Used when loading state is inline: {loading ? <InlineTableSkeleton /> : <rows>}
 */
export const InlineTableSkeleton = ({ cols = 6, rows = 7 }) => (
  <>
    {/* header row */}
    <div className="flex gap-4 px-6 py-4 border-b border-gray-100 bg-gray-50">
      {Array.from({ length: cols }).map((_, i) => (
        <Bone key={i} className="h-3 flex-1 animate-pulse" />
      ))}
    </div>
    {/* data rows */}
    {Array.from({ length: rows }).map((_, r) => (
      <div
        key={r}
        className={`flex gap-4 px-6 py-4 border-b border-gray-50 ${r % 2 === 1 ? "bg-gray-50/50" : ""}`}
      >
        {Array.from({ length: cols }).map((_, c) => (
          <Bone key={c} className={`h-4 flex-1 animate-pulse ${c === 0 ? "max-w-[2rem]" : ""}`} />
        ))}
      </div>
    ))}
  </>
);

// ─── Composed page skeletons ──────────────────────────────────────────────────

/**
 * Standard table-based admin page:
 * Header → Stats → Filters → Table
 */
export const TablePageSkeleton = ({
  stats = 4,
  cols = 6,
  rows = 8,
  hasFilter = true,
  hasButton = true,
}) => (
  <div className="space-y-6">
    <HeaderSkeleton hasButton={hasButton} />
    {stats > 0 && <StatsSkeleton count={stats} />}
    {hasFilter && <FilterSkeleton />}
    <TableSkeleton cols={cols} rows={rows} />
  </div>
);

/**
 * Dashboard page:
 * Header → Stats → two-column content (chart left, list right)
 */
export const DashboardSkeleton = ({ stats = 6 }) => (
  <div className="space-y-6">
    <HeaderSkeleton hasButton={false} />
    <StatsSkeleton count={stats} />
    {/* two wide panels */}
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
        <Bone className="h-5 w-36 mb-2" />
        <Bone className="h-48 w-full rounded-xl" />
      </div>
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-3">
        <Bone className="h-5 w-36 mb-2" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Bone className="w-8 h-8 rounded-full shrink-0" />
            <Bone className="h-4 flex-1" />
            <Bone className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
    {/* bottom row */}
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-3">
          <Bone className="h-5 w-28 mb-2" />
          {Array.from({ length: 4 }).map((_, j) => (
            <div key={j} className="flex items-center gap-3">
              <Bone className="h-4 flex-1" />
              <Bone className="h-4 w-12" />
            </div>
          ))}
        </div>
      ))}
    </div>
  </div>
);

/**
 * Form page (create / edit):
 * Header → two-column form
 */
export const FormPageSkeleton = () => (
  <div className="space-y-6">
    <HeaderSkeleton hasButton={false} />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {[1, 2].map((col) => (
        <div key={col} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5">
          <Bone className="h-5 w-32 mb-1" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Bone className="h-3 w-24" />
              <Bone className="h-10 w-full rounded-xl" />
            </div>
          ))}
        </div>
      ))}
    </div>
    <div className="flex justify-end gap-3">
      <Bone className="h-10 w-24 rounded-xl" />
      <Bone className="h-10 w-28 rounded-xl" />
    </div>
  </div>
);

/**
 * Settings page:
 * Header → stacked sections
 */
export const SettingsPageSkeleton = ({ sections = 4 }) => (
  <div className="space-y-6">
    <HeaderSkeleton />
    {Array.from({ length: sections }).map((_, s) => (
      <div key={s} className="bg-white max-w-4xl rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 px-6 py-6 border-b border-gray-100">
          <Bone className="w-9 h-9 rounded-xl" />
          <Bone className="h-4 w-32" />
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, f) => (
            <div key={f} className="space-y-2">
              <Bone className="h-3 w-24" />
              <Bone className="h-10 w-full rounded-xl" />
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

/**
 * Analytics page:
 * Header → Stats → charts grid
 */
export const AnalyticsPageSkeleton = ({ stats = 4 }) => (
  <div className="space-y-6">
    <HeaderSkeleton hasButton={false} />
    <StatsSkeleton count={stats} />
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-3">
          <Bone className="h-5 w-36" />
          <Bone className="h-56 w-full rounded-xl" />
        </div>
      ))}
    </div>
  </div>
);

/**
 * Split-panel page (e.g. Recipes, KitchenQueue):
 * Header → left list + right detail panel
 */
export const SplitPageSkeleton = ({ stats = 0 }) => (
  <div className="space-y-6">
    <HeaderSkeleton />
    {stats > 0 && <StatsSkeleton count={stats} />}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* list panel */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3">
        <Bone className="h-10 w-full rounded-xl mb-2" />
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100">
            <Bone className="w-10 h-10 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <Bone className="h-4 w-3/4" />
              <Bone className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
      {/* detail panel */}
      <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-5">
        <Bone className="h-6 w-40 mb-2" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Bone className="h-3 w-24" />
            <Bone className="h-10 w-full rounded-xl" />
          </div>
        ))}
        <div className="flex gap-3 justify-end pt-2">
          <Bone className="h-10 w-24 rounded-xl" />
          <Bone className="h-10 w-28 rounded-xl" />
        </div>
      </div>
    </div>
  </div>
);
