'use client';

import { useState, useEffect } from 'react';

const loadingMessages = [
  'Reading the brief...',
  'Ranking 11,560 accounts...',
  'Generating insights for top targets...',
];

export function LoadingState() {
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 2400);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex-1 p-8">
      {/* Loading Indicator */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-2 h-2 rounded-full bg-[#7F77DD] animate-pulse-dot" />
        <span className="text-[#B4B2A9] text-sm">{loadingMessages[messageIndex]}</span>
      </div>

      {/* Skeleton Layout */}
      <div className="space-y-6">
        {/* Summary Skeleton */}
        <div className="bg-[#15151A] rounded-lg border border-[rgba(255,255,255,0.08)] p-6">
          <div className="h-5 w-32 bg-[rgba(255,255,255,0.05)] rounded animate-shimmer mb-4" />
          <div className="space-y-2">
            <div className="h-4 w-full bg-[rgba(255,255,255,0.05)] rounded animate-shimmer" />
            <div className="h-4 w-4/5 bg-[rgba(255,255,255,0.05)] rounded animate-shimmer" />
            <div className="h-4 w-3/4 bg-[rgba(255,255,255,0.05)] rounded animate-shimmer" />
          </div>
        </div>

        {/* Snapshot Cards Skeleton */}
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-[#15151A] rounded-lg p-4">
              <div className="h-3 w-20 bg-[rgba(255,255,255,0.05)] rounded animate-shimmer mb-2" />
              <div className="h-7 w-16 bg-[rgba(255,255,255,0.05)] rounded animate-shimmer" />
            </div>
          ))}
        </div>

        {/* Result Cards Skeleton */}
        <div className="space-y-3">
          <div className="h-4 w-36 bg-[rgba(255,255,255,0.05)] rounded animate-shimmer mb-4" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-[#15151A] rounded-lg border border-[rgba(255,255,255,0.04)] p-4">
              <div className="flex items-center gap-4 mb-3">
                <div className="h-5 w-8 bg-[rgba(255,255,255,0.05)] rounded animate-shimmer" />
                <div className="h-5 w-32 bg-[rgba(255,255,255,0.05)] rounded animate-shimmer" />
                <div className="h-5 w-20 bg-[rgba(255,255,255,0.05)] rounded animate-shimmer" />
              </div>
              <div className="flex gap-8 mb-3">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="space-y-1">
                    <div className="h-3 w-16 bg-[rgba(255,255,255,0.05)] rounded animate-shimmer" />
                    <div className="h-5 w-12 bg-[rgba(255,255,255,0.05)] rounded animate-shimmer" />
                  </div>
                ))}
              </div>
              <div className="h-4 w-full bg-[rgba(255,255,255,0.05)] rounded animate-shimmer" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
