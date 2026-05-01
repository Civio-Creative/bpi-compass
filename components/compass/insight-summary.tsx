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
    <div className="bg-[#15151A] rounded-lg border border-[rgba(255,255,255,0.08)] px-[22px] py-5">
      <h2 className="text-[#E8E6F0] text-base font-medium mb-3">Insight summary</h2>
      <p className="text-[#B4B2A9] text-sm leading-[1.7]">{text}</p>
    </div>
  );
}
