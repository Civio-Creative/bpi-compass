'use client';

import type { InsightSummary as InsightSummaryType } from '@/lib/types';

interface InsightSummaryProps {
  summary: InsightSummaryType;
}

export function InsightSummary({ summary }: InsightSummaryProps) {
  const text =
    summary.narrative ||
    `${summary.totalTargets} targets surfaced. Average reach: ${summary.avgPanelReach}% of BPI's tracked audience panel and ${summary.avgGenPopReach}% of the general public. Average partisan reach: ${summary.avgDemReach}% Democratic, ${summary.avgRepReach}% Republican.`;

  return (
    <div className="bg-[#15151A] rounded-[16px] border border-[rgba(255,255,255,0.08)] p-8 shadow-[0_4px_12px_rgba(0,0,0,0.25)]">
      <h2 className="text-[#E8E6F0] text-[28px] font-semibold mb-4">Insight summary</h2>
      <p className="text-[#B4B2A9] text-[15px] leading-[1.7]">{text}</p>
    </div>
  );
}
