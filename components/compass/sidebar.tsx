'use client';

import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { SearchFilters, AppState } from '@/lib/types';

interface SidebarProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onSearch: () => void;
  appState: AppState;
  filtersStale?: boolean;
}

const SECTOR_OPTIONS = [
  'News, journalism & politics',
  'Sports',
  'Music, arts & entertainment',
  'Business & finance',
  'Health, science & academia',
  'Lifestyle & culture',
  'Digital creators',
];
const SECTOR_ALL = 'All';

interface SectorListProps {
  value: string[];
  options: string[];
  allOption: string;
  onChange: (next: string[]) => void;
}

function SectorList({ value, options, allOption, onChange }: SectorListProps) {
  const allSelected = value.includes(allOption);

  function toggle(opt: string) {
    if (opt === allOption) {
      onChange(allSelected ? [] : [allOption]);
      return;
    }
    if (allSelected) {
      onChange([opt]);
      return;
    }
    let next = value.filter((v) => v !== allOption);
    if (next.includes(opt)) {
      next = next.filter((v) => v !== opt);
    } else {
      next = [...next, opt];
    }
    if (next.length === 0) next = [allOption];
    onChange(next);
  }

  const all = [allOption, ...options];

  return (
    <div className="flex flex-col gap-1">
      {all.map((opt) => {
        const isSelected = value.includes(opt);
        const isAllOpt = opt === allOption;
        const isDimmed = !isAllOpt && allSelected;
        return (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={`flex items-center gap-3 text-left transition-opacity hover:opacity-100 ${
              isDimmed ? 'opacity-50' : ''
            }`}
          >
            <span
              className={`w-4 h-4 rounded-full border-[1.5px] flex items-center justify-center shrink-0 transition-colors ${
                isSelected
                  ? 'bg-[#7F77DD] border-[#7F77DD]'
                  : 'border-[rgba(255,255,255,0.3)]'
              }`}
            >
              {isSelected && <span className="w-[6px] h-[6px] rounded-full bg-white" />}
            </span>
            <span className={`text-sm ${isSelected ? 'text-[#E8E6F0]' : 'text-[#B4B2A9]'}`}>
              {opt}
            </span>
          </button>
        );
      })}
    </div>
  );
}

const TYPE_OPTIONS = [
  'Journalists',
  'News outlets',
  'Politicians & officials',
  'Activists',
  'Authors',
  'Podcasters & radio hosts',
  'Athletes',
  'Musicians & artists',
  'TV & film personalities',
  'Business leaders',
  'Academics & experts',
  'Influencers & creators',
];
const TYPE_ALL = 'All types';

interface PillGroupProps {
  value: string[];
  options: string[];
  allOption: string;
  onChange: (next: string[]) => void;
}

function PillGroup({ value, options, allOption, onChange }: PillGroupProps) {
  function toggle(pill: string) {
    if (pill === allOption) {
      const allSelected = value.includes(allOption);
      onChange(allSelected ? [] : [allOption]);
      return;
    }
    let next = value.filter((v) => v !== allOption);
    if (next.includes(pill)) {
      next = next.filter((v) => v !== pill);
    } else {
      next = [...next, pill];
    }
    onChange(next);
  }

  const all = [allOption, ...options];

  return (
    <div className="flex flex-wrap gap-[6px]">
      {all.map((pill) => {
        const isSelected = value.includes(pill);
        return (
          <button
            key={pill}
            type="button"
            onClick={() => toggle(pill)}
            className={`
              px-[14px] py-2 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5
              ${isSelected
                ? 'bg-[#1F1B3D] text-[#CECBF6]'
                : 'bg-transparent text-[#5F5E5A] border border-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.15)]'
              }
            `}
          >
            {isSelected && <Check className="h-3 w-3" />}
            {pill}
          </button>
        );
      })}
    </div>
  );
}

export function Sidebar({ filters, onFiltersChange, onSearch, appState, filtersStale = false }: SidebarProps) {
  const isLoading = appState === 'loading';
  const canSearch =
    filters.campaignBrief.trim().length > 0 && filters.targetAudience !== '';
  const buttonLabel = isLoading
    ? 'Finding targets...'
    : filtersStale
      ? 'Update results'
      : 'Find targets';

  const labelClass = 'block text-[#E8E6F0] text-base font-semibold';
  const descriptionClass = 'text-[#888780] text-[12px] font-normal mt-[2px] mb-[6px]';

  return (
    <aside className="w-[460px] bg-[#0f1115] flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-2">
        <div className="flex flex-col gap-5">
          {/* Campaign Brief */}
          <div className="flex flex-col">
            <Label htmlFor="campaign-brief" className={`${labelClass} mb-[6px]`}>
              Tell me about the campaign
            </Label>
            <Textarea
              id="campaign-brief"
              rows={4}
              placeholder="Describe the campaign. The more context you give, the sharper the targeting."
              value={filters.campaignBrief}
              onChange={(e) => onFiltersChange({ ...filters, campaignBrief: e.target.value })}
              className="min-h-[88px] bg-[#15151A] border border-[rgba(255,255,255,0.06)] text-[#E8E6F0] placeholder:text-[#5F5E5A] resize-none focus:border-[#7F77DD] focus:ring-1 focus:ring-[#7F77DD]"
            />
          </div>

          {/* Sector */}
          <div className="flex flex-col">
            <Label className={labelClass}>Sector</Label>
            <p className={descriptionClass}>Pick one or more categories</p>
            <SectorList
              value={filters.sectors}
              options={SECTOR_OPTIONS}
              allOption={SECTOR_ALL}
              onChange={(sectors) => onFiltersChange({ ...filters, sectors })}
            />
          </div>

          {/* Account type */}
          <div className="flex flex-col">
            <Label className={labelClass}>Account type</Label>
            <p className={descriptionClass}>Pick one or more types</p>
            <PillGroup
              value={filters.accountTypes}
              options={TYPE_OPTIONS}
              allOption={TYPE_ALL}
              onChange={(accountTypes) => onFiltersChange({ ...filters, accountTypes })}
            />
          </div>

          {/* Target audience */}
          <div className="flex flex-col">
            <Label htmlFor="target-audience" className={labelClass}>
              Target audience
            </Label>
            <p className={descriptionClass}>Reach to rank by</p>
            <Select
              value={filters.targetAudience}
              onValueChange={(value: 'bpi' | 'public' | 'dem' | 'rep') =>
                onFiltersChange({ ...filters, targetAudience: value })
              }
            >
              <SelectTrigger
                id="target-audience"
                className={`bg-[#15151A] border border-[rgba(255,255,255,0.06)] hover:text-[#00a1fe] transition-colors duration-200 focus:border-[#7F77DD] focus:ring-1 focus:ring-[#7F77DD] ${filters.targetAudience ? 'text-[#E8E6F0]' : 'text-[#5F5E5A]'}`}
              >
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent className="bg-[#15151A] border-[rgba(255,255,255,0.08)]">
                <SelectItem value="bpi" className="text-[#E8E6F0] hover:text-[#00a1fe] focus:text-[#00a1fe] transition-colors duration-200 focus:bg-[rgba(255,255,255,0.05)]">BPI&apos;s audience</SelectItem>
                <SelectItem value="public" className="text-[#E8E6F0] hover:text-[#00a1fe] focus:text-[#00a1fe] transition-colors duration-200 focus:bg-[rgba(255,255,255,0.05)]">US public</SelectItem>
                <SelectItem value="dem" className="text-[#E8E6F0] hover:text-[#00a1fe] focus:text-[#00a1fe] transition-colors duration-200 focus:bg-[rgba(255,255,255,0.05)]">Democratic-leaning</SelectItem>
                <SelectItem value="rep" className="text-[#E8E6F0] hover:text-[#00a1fe] focus:text-[#00a1fe] transition-colors duration-200 focus:bg-[rgba(255,255,255,0.05)]">Republican-leaning</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="shrink-0 p-4 border-t border-[rgba(255,255,255,0.06)]">
        <Button
          onClick={onSearch}
          disabled={!canSearch || isLoading}
          className={`
            w-full py-2.5 text-[14px] font-semibold transition-all
            ${canSearch && !isLoading
              ? 'bg-[#7F77DD] hover:bg-[#6B63C7] text-[#0F0F12] hover:shadow-[0_0_20px_rgba(127,119,221,0.3)]'
              : 'bg-[#2A2A30] text-[#5F5E5A] cursor-not-allowed'
            }
          `}
        >
          {buttonLabel}
        </Button>
      </div>
    </aside>
  );
}
