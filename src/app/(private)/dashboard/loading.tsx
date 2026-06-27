import React from 'react';

export default function DashboardLoading() {
  return (
    <div className="space-y-6 font-sans">
      {/* Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-pulse">
        <div className="space-y-2">
          {/* Title Placeholder */}
          <div className="h-7 w-48 bg-slate-200 rounded-xl" />
          {/* Subtitle Placeholder */}
          <div className="h-4 w-72 bg-slate-100 rounded-lg" />
        </div>
        {/* Action Button Placeholder */}
        <div className="h-9.5 w-36 bg-slate-200 rounded-xl shrink-0" />
      </div>

      {/* KPI Cards Grid (3 Columns) */}
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-2xl border border-slate-100 bg-white p-6 shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between">
              {/* Card Title */}
              <div className="h-4 w-28 bg-slate-100 rounded-md" />
              {/* Card Icon */}
              <div className="h-8 w-8 bg-slate-100 rounded-lg" />
            </div>
            <div className="space-y-2">
              {/* Card Value */}
              <div className="h-7 w-24 bg-slate-200 rounded-xl" />
              {/* Card Subtitle/Trend */}
              <div className="h-3.5 w-36 bg-slate-100 rounded-md" />
            </div>
          </div>
        ))}
      </div>

      {/* Table Section Skeleton */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden animate-pulse">
        {/* Filter bar */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="h-9 w-64 bg-slate-100 rounded-xl" />
          <div className="h-8 w-8 bg-slate-100 rounded-lg sm:hidden" />
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {[...Array(4)].map((_, i) => (
                  <th key={i} className="px-6 py-4">
                    <div className="h-3 w-16 bg-slate-200 rounded-md" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[...Array(5)].map((_, rowIndex) => (
                <tr key={rowIndex}>
                  {/* Column 1: Item details (Thumbnail + Main Text + Subtext) */}
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-16 bg-slate-100 rounded-lg shrink-0" />
                      <div className="space-y-1.5">
                        <div className="h-4.5 w-28 bg-slate-200 rounded-md" />
                        <div className="h-3 w-16 bg-slate-100 rounded-md" />
                      </div>
                    </div>
                  </td>
                  {/* Column 2: Details */}
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="space-y-1.5">
                      <div className="h-4 w-16 bg-slate-200 rounded-md" />
                      <div className="h-3 w-12 bg-slate-100 rounded-md" />
                    </div>
                  </td>
                  {/* Column 3: Numeric Values */}
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="h-4 w-20 bg-slate-200 rounded-md" />
                  </td>
                  {/* Column 4: Status Badges */}
                  <td className="px-6 py-5 whitespace-nowrap">
                    <div className="h-6 w-16 bg-slate-100 rounded-md" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
