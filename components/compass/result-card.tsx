'use client';

import type { Target } from '@/lib/types';

interface ResultCardProps {
  target: Target;
}

export function ResultCard({ target }: ResultCardProps) {
  const rankStr = target.rank.toString().padStart(2, '0');

  return (
    <div className="bg-[#15151A] rounded-[10px] border-[0.5px] border-[rgba(255,255,255,0.08)] px-5 py-[18px]">
      {/* Top Row */}
      <div className="flex items-center gap-3 mb-[14px]">
        <span className="text-[#5F5E5A] text-sm font-medium w-6">{rankStr}</span>
        <span className="text-[#E8E6F0] font-medium">{target.name}</span>
        <span className="px-2 py-0.5 rounded text-xs bg-[rgba(255,255,255,0.05)] text-[#888780]">
          {target.mediaTag}
        </span>
      </div>

      {/* Stats Row */}
      <div className="flex gap-6 mb-[14px]">
        <div>
          <p className="text-[#5F5E5A] text-xs mb-0.5">Panel reach</p>
          <p className="text-[#E8E6F0] text-sm font-medium">{target.panelReach}%</p>
        </div>
        <div>
          <p className="text-[#5F5E5A] text-xs mb-0.5">Gen pop</p>
          <p className="text-[#E8E6F0] text-sm font-medium">{target.genPopReach}%</p>
        </div>
        <div>
          <p className="text-[#5F5E5A] text-xs mb-0.5">Dem</p>
          <p className="text-[#85B7EB] text-sm font-medium">{target.demReach}%</p>
        </div>
        <div>
          <p className="text-[#5F5E5A] text-xs mb-0.5">Rep</p>
          <p className="text-[#F09595] text-sm font-medium">{target.repReach}%</p>
        </div>
      </div>

      {/* Insight */}
      <div className="pt-3 border-t border-[rgba(255,255,255,0.06)]">
        <p className="text-[#B4B2A9] text-sm leading-[1.6]">{target.insight}</p>
      </div>
    </div>
  );
}
