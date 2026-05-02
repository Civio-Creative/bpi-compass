'use client';

import { Check } from 'lucide-react';
import type { Target } from '@/lib/types';

interface ResultCardProps {
  target: Target;
  selected: boolean;
  onToggle: (target: Target) => void;
}

function tagBg(mediaTag: string): string {
  const t = mediaTag.toLowerCase();
  if (/journalist/.test(t)) return 'rgba(127,119,221,0.12)';
  if (/newspaper|tv_news|news_website/.test(t)) return 'rgba(96,165,250,0.12)';
  if (/podcast|radio/.test(t)) return 'rgba(251,191,36,0.12)';
  if (/activist/.test(t)) return 'rgba(248,113,113,0.12)';
  if (/sport|music|entertainment|fashion|beauty|business|technology|health|wellness|film|^tv$|culture|lifestyle|comedy/.test(t)) {
    return 'rgba(45,212,191,0.12)';
  }
  return 'rgba(255,255,255,0.05)';
}

export function ResultCard({ target, selected, onToggle }: ResultCardProps) {
  const rankStr = target.rank.toString().padStart(2, '0');

  return (
    <div className="relative bg-[#15151A] rounded-[16px] border border-[rgba(255,255,255,0.08)] p-7 shadow-[0_4px_12px_rgba(0,0,0,0.25)]">
      <button
        type="button"
        onClick={() => onToggle(target)}
        aria-label={selected ? 'Deselect target' : 'Select target'}
        className={`absolute top-4 right-4 w-[18px] h-[18px] rounded flex items-center justify-center transition-colors ${
          selected
            ? 'bg-[#7F77DD] border-0'
            : 'bg-transparent border border-[rgba(255,255,255,0.2)] hover:border-[rgba(255,255,255,0.35)]'
        }`}
      >
        {selected && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
      </button>

      <div className="flex items-center gap-3 mb-5 pr-8">
        <span className="text-[#5F5E5A] text-base font-medium w-7">{rankStr}</span>
        <span className="text-[#E8E6F0] text-[22px] font-semibold">{target.name}</span>
        <span
          className="px-2.5 py-1 rounded-md text-[11px] font-medium uppercase tracking-[0.04em] text-[#B4B2A9]"
          style={{ backgroundColor: tagBg(target.mediaTag) }}
        >
          {target.mediaTag}
        </span>
      </div>

      <div className="flex gap-6 mb-5">
        <div>
          <p className="text-[#5F5E5A] text-[11px] uppercase tracking-[0.04em] mb-1">% of BPI audience</p>
          <p className="text-[#E8E6F0] text-[14px] font-medium">{target.panelReach}%</p>
        </div>
        <div>
          <p className="text-[#5F5E5A] text-[11px] uppercase tracking-[0.04em] mb-1">Gen pop</p>
          <p className="text-[#E8E6F0] text-[14px] font-medium">{target.genPopReach}%</p>
        </div>
        <div>
          <p className="text-[#5F5E5A] text-[11px] uppercase tracking-[0.04em] mb-1">Dem</p>
          <p className="text-[#85B7EB] text-[14px] font-medium">{target.demReach}%</p>
        </div>
        <div>
          <p className="text-[#5F5E5A] text-[11px] uppercase tracking-[0.04em] mb-1">Rep</p>
          <p className="text-[#F09595] text-[14px] font-medium">{target.repReach}%</p>
        </div>
      </div>

      <div className="pt-4 border-t border-[rgba(255,255,255,0.06)]">
        <p className="text-[#B4B2A9] text-sm leading-[1.6]">{target.insight}</p>
      </div>
    </div>
  );
}
