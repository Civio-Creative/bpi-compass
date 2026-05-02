'use client';

import { useState } from 'react';
import type { Target, SearchFilters } from '@/lib/types';

interface SelectionBarProps {
  selectedTargets: Target[];
  filters: SearchFilters;
  onClear: () => void;
}

function todayDate(): string {
  return new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatPlainText(targets: Target[], filters: SearchFilters): string {
  const briefSnippet =
    filters.campaignBrief.slice(0, 150) + (filters.campaignBrief.length > 150 ? '...' : '');
  const lines: string[] = [`COMPASS TARGETS — ${todayDate()}`];
  if (briefSnippet.trim()) lines.push(`Brief: ${briefSnippet}`);
  lines.push('');
  targets.forEach((t, i) => {
    lines.push(`${i + 1}. ${t.name} (${t.mediaTag}) — ${t.panelReach}% panel reach`);
    lines.push(`   ${t.insight}`);
    lines.push('');
  });
  return lines.join('\n').trimEnd();
}

function csvCell(value: string | number): string {
  const s = String(value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function formatCSV(targets: Target[]): string {
  const headers = [
    'Rank',
    'Name',
    'Category',
    'Tag',
    'Panel Reach %',
    'Gen Pop Reach %',
    'Dem Reach %',
    'Rep Reach %',
    'Insight',
  ];
  const rows = targets.map((t) => [
    t.rank,
    t.name,
    t.category,
    t.mediaTag,
    t.panelReach,
    t.genPopReach,
    t.demReach,
    t.repReach,
    t.insight,
  ]);
  return [headers, ...rows].map((row) => row.map(csvCell).join(',')).join('\n');
}

export function SelectionBar({ selectedTargets, filters, onClear }: SelectionBarProps) {
  const [toastVisible, setToastVisible] = useState(false);
  const visible = selectedTargets.length > 0;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formatPlainText(selectedTargets, filters));
      setToastVisible(true);
      setTimeout(() => setToastVisible(false), 2000);
    } catch (e) {
      console.error('Copy failed:', e);
    }
  };

  const handleExport = () => {
    const csv = formatCSV(selectedTargets);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compass-targets-${todayIso()}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 bg-[#15151A] border-t border-[rgba(255,255,255,0.08)] px-8 py-4 flex items-center justify-end gap-4 transition-transform duration-200 ${
          visible ? 'translate-y-0' : 'translate-y-full pointer-events-none'
        }`}
      >
        <span className="text-[#E8E6F0] text-sm font-medium">
          {selectedTargets.length} selected
        </span>
        <button
          type="button"
          onClick={onClear}
          className="text-[#888780] text-sm hover:text-[#E8E6F0] transition-colors"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={handleCopy}
          className="border border-[rgba(255,255,255,0.2)] text-[#E8E6F0] text-sm font-medium px-[18px] py-[10px] rounded-lg hover:bg-[rgba(255,255,255,0.05)] transition-colors"
        >
          Copy to clipboard
        </button>
        <button
          type="button"
          onClick={handleExport}
          className="bg-[#7F77DD] text-white text-sm font-medium px-[18px] py-[10px] rounded-lg hover:bg-[#6B63C7] transition-colors"
        >
          Export as CSV
        </button>
      </div>
      {toastVisible && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] bg-[#15151A] border border-[rgba(255,255,255,0.08)] text-[#E8E6F0] text-sm px-4 py-2 rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.4)]">
          Copied!
        </div>
      )}
    </>
  );
}
