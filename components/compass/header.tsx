'use client';

import { useState } from 'react';
import { Plus, ChevronDown, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import type { SavedSearch } from '@/lib/types';

interface HeaderProps {
  savedSearches: SavedSearch[];
  onNewAnalysis: () => void;
  onLoadSearch: (search: SavedSearch) => void;
  onDeleteSearch: (id: string) => void;
}

export function Header({ savedSearches, onNewAnalysis, onLoadSearch, onDeleteSearch }: HeaderProps) {
  return (
    <header className="h-14 border-b border-[rgba(255,255,255,0.08)] bg-[#0A0A0D] px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded bg-[#7F77DD] flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="9" stroke="#0F0F12" strokeWidth="2"/>
            <circle cx="12" cy="12" r="3" fill="#0F0F12"/>
            <line x1="12" y1="3" x2="12" y2="7" stroke="#0F0F12" strokeWidth="2" strokeLinecap="round"/>
            <line x1="12" y1="17" x2="12" y2="21" stroke="#0F0F12" strokeWidth="2" strokeLinecap="round"/>
            <line x1="3" y1="12" x2="7" y2="12" stroke="#0F0F12" strokeWidth="2" strokeLinecap="round"/>
            <line x1="17" y1="12" x2="21" y2="12" stroke="#0F0F12" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </div>
        <span className="text-[#B4B2A9] text-sm">BPI Labs</span>
        <span className="text-[#5F5E5A] text-sm">·</span>
        <span className="text-[#E8E6F0] text-sm font-medium">Compass</span>
      </div>
      
      <div className="flex items-center gap-3">
        {savedSearches.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-[#B4B2A9] hover:text-[#E8E6F0] hover:bg-[rgba(255,255,255,0.05)]"
              >
                Saved searches
                <ChevronDown className="ml-1 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72 bg-[#15151A] border-[rgba(255,255,255,0.08)]">
              {savedSearches.map((search) => (
                <DropdownMenuItem
                  key={search.id}
                  className="flex items-center justify-between text-[#E8E6F0] hover:bg-[rgba(255,255,255,0.05)] focus:bg-[rgba(255,255,255,0.05)] cursor-pointer"
                  onClick={() => onLoadSearch(search)}
                >
                  <div className="flex-1 truncate pr-2">
                    <span className="text-sm">{search.name}</span>
                    <span className="text-xs text-[#5F5E5A] ml-2">
                      {new Date(search.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSearch(search.id);
                    }}
                    className="p-1 hover:bg-[rgba(255,255,255,0.1)] rounded"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-[#5F5E5A] hover:text-[#F09595]" />
                  </button>
                </DropdownMenuItem>
              ))}
              {savedSearches.length >= 5 && (
                <>
                  <DropdownMenuSeparator className="bg-[rgba(255,255,255,0.08)]" />
                  <div className="px-2 py-1.5 text-xs text-[#5F5E5A]">
                    5 search limit reached
                  </div>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        
        <Button 
          size="sm" 
          onClick={onNewAnalysis}
          className="bg-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.12)] text-[#E8E6F0] border-0"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          New analysis
        </Button>
        
        <div className="w-8 h-8 rounded-full bg-[#7F77DD] flex items-center justify-center text-[#0F0F12] text-xs font-medium">
          SC
        </div>
      </div>
    </header>
  );
}
