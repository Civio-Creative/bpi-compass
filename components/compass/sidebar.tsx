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
}

const newsPills = ['All', 'Journalists', 'News outlets', 'Podcasts & radio', 'Activists'];
const culturePills = ['All', 'Entertainment & TV', 'Music', 'Sports', 'Fashion & beauty', 'Business & tech', 'Health & wellness'];

export function Sidebar({ filters, onFiltersChange, onSearch, appState }: SidebarProps) {
  const isLoading = appState === 'loading';
  const canSearch = 
    filters.campaignBrief.trim().length > 0 &&
    filters.audienceAlignment !== '' &&
    filters.sector !== '' &&
    filters.successMetric !== '';

  const handleSubSectorToggle = (pill: string) => {
    const currentSubSectors = filters.subSectors;
    
    if (pill === 'All') {
      onFiltersChange({ ...filters, subSectors: ['All'] });
    } else {
      let newSubSectors = currentSubSectors.filter(s => s !== 'All');
      
      if (newSubSectors.includes(pill)) {
        newSubSectors = newSubSectors.filter(s => s !== pill);
      } else {
        newSubSectors = [...newSubSectors, pill];
      }
      
      if (newSubSectors.length === 0) {
        newSubSectors = ['All'];
      }
      
      onFiltersChange({ ...filters, subSectors: newSubSectors });
    }
  };

  const activePills = filters.sector === 'news' ? newsPills : filters.sector === 'culture' ? culturePills : [];

  return (
    <aside className="w-[300px] bg-[#0A0A0D] border-r border-[rgba(255,255,255,0.08)] p-5 flex flex-col h-full">
      <div className="flex-1 flex flex-col gap-5">
        {/* Campaign Brief */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="campaign-brief" className="text-[#E8E6F0] text-sm font-medium">
            Tell me about the campaign
          </Label>
          <Textarea
            id="campaign-brief"
            placeholder="Describe the campaign. The more context you give — client, audience, moment, stakes — the sharper the targeting."
            value={filters.campaignBrief}
            onChange={(e) => onFiltersChange({ ...filters, campaignBrief: e.target.value })}
            className="min-h-[96px] bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)] text-[#E8E6F0] placeholder:text-[#5F5E5A] resize-none focus:border-[#7F77DD] focus:ring-1 focus:ring-[#7F77DD]"
          />
        </div>

        {/* Audience Alignment */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="audience-alignment" className="text-[#E8E6F0] text-sm font-medium">
            Is your audience politically aligned?
          </Label>
          <Select
            value={filters.audienceAlignment}
            onValueChange={(value: 'no' | 'dem' | 'rep') => onFiltersChange({ ...filters, audienceAlignment: value })}
          >
            <SelectTrigger 
              id="audience-alignment"
              className={`bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)] hover:text-[#00a1fe] transition-colors duration-200 focus:border-[#7F77DD] focus:ring-1 focus:ring-[#7F77DD] ${filters.audienceAlignment ? 'text-[#E8E6F0]' : 'text-[#5F5E5A]'}`}
            >
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent className="bg-[#15151A] border-[rgba(255,255,255,0.08)]">
              <SelectItem value="no" className="text-[#E8E6F0] hover:text-[#00a1fe] focus:text-[#00a1fe] transition-colors duration-200 focus:bg-[rgba(255,255,255,0.05)]">No</SelectItem>
              <SelectItem value="dem" className="text-[#E8E6F0] hover:text-[#00a1fe] focus:text-[#00a1fe] transition-colors duration-200 focus:bg-[rgba(255,255,255,0.05)]">Yes, Democratic</SelectItem>
              <SelectItem value="rep" className="text-[#E8E6F0] hover:text-[#00a1fe] focus:text-[#00a1fe] transition-colors duration-200 focus:bg-[rgba(255,255,255,0.05)]">Yes, Republican</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sector */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="sector" className="text-[#E8E6F0] text-sm font-medium">
            Sector
          </Label>
          <Select
            value={filters.sector}
            onValueChange={(value: 'all' | 'news' | 'culture') => onFiltersChange({ 
              ...filters, 
              sector: value,
              subSectors: ['All']
            })}
          >
            <SelectTrigger 
              id="sector"
              className={`bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)] hover:text-[#00a1fe] transition-colors duration-200 focus:border-[#7F77DD] focus:ring-1 focus:ring-[#7F77DD] ${filters.sector ? 'text-[#E8E6F0]' : 'text-[#5F5E5A]'}`}
            >
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent className="bg-[#15151A] border-[rgba(255,255,255,0.08)]">
              <SelectItem value="all" className="text-[#E8E6F0] hover:text-[#00a1fe] focus:text-[#00a1fe] transition-colors duration-200 focus:bg-[rgba(255,255,255,0.05)]">All</SelectItem>
              <SelectItem value="news" className="text-[#E8E6F0] hover:text-[#00a1fe] focus:text-[#00a1fe] transition-colors duration-200 focus:bg-[rgba(255,255,255,0.05)]">News & politics</SelectItem>
              <SelectItem value="culture" className="text-[#E8E6F0] hover:text-[#00a1fe] focus:text-[#00a1fe] transition-colors duration-200 focus:bg-[rgba(255,255,255,0.05)]">Culture & lifestyle</SelectItem>
            </SelectContent>
          </Select>

          {/* Sub-sector Pills */}
          {activePills.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {activePills.map((pill) => {
                const isSelected = filters.subSectors.includes(pill);
                return (
                  <button
                    key={pill}
                    onClick={() => handleSubSectorToggle(pill)}
                    className={`
                      px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5
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
          )}
        </div>

        {/* Success Metric */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="success-metric" className="text-[#E8E6F0] text-sm font-medium">
            Success metric
          </Label>
          <Select
            value={filters.successMetric}
            onValueChange={(value: 'visibility' | 'trust' | 'insider') => onFiltersChange({ ...filters, successMetric: value })}
          >
            <SelectTrigger 
              id="success-metric"
              className={`bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.08)] hover:text-[#00a1fe] transition-colors duration-200 focus:border-[#7F77DD] focus:ring-1 focus:ring-[#7F77DD] ${filters.successMetric ? 'text-[#E8E6F0]' : 'text-[#5F5E5A]'}`}
            >
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent className="bg-[#15151A] border-[rgba(255,255,255,0.08)]">
              <SelectItem value="visibility" className="text-[#E8E6F0] hover:text-[#00a1fe] focus:text-[#00a1fe] transition-colors duration-200 focus:bg-[rgba(255,255,255,0.05)]">Maximum visibility</SelectItem>
              <SelectItem value="trust" className="text-[#E8E6F0] hover:text-[#00a1fe] focus:text-[#00a1fe] transition-colors duration-200 focus:bg-[rgba(255,255,255,0.05)]">Trust and credibility</SelectItem>
              <SelectItem value="insider" className="text-[#E8E6F0] hover:text-[#00a1fe] focus:text-[#00a1fe] transition-colors duration-200 focus:bg-[rgba(255,255,255,0.05)]">Insider reach</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Find Targets Button */}
      <Button
        onClick={onSearch}
        disabled={!canSearch || isLoading}
        className={`
          w-full mt-5 font-medium transition-colors
          ${canSearch && !isLoading
            ? 'bg-[#7F77DD] hover:bg-[#6B63C7] text-[#0F0F12]'
            : 'bg-[#2A2A30] text-[#5F5E5A] cursor-not-allowed'
          }
        `}
      >
        {isLoading ? 'Finding targets...' : 'Find targets'}
      </Button>
    </aside>
  );
}
