'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, totalItems, itemsPerPage, onPageChange }: PaginationProps) {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="flex items-center justify-between pt-4 border-t border-[rgba(255,255,255,0.08)]">
      <p className="text-[#5F5E5A] text-sm">
        Showing {startItem}-{endItem} of {totalItems} targets
      </p>
      
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-8 w-8 p-0 text-[#B4B2A9] hover:text-[#E8E6F0] hover:bg-[rgba(255,255,255,0.05)] disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        {[...Array(totalPages)].map((_, i) => {
          const page = i + 1;
          const isActive = page === currentPage;
          
          return (
            <Button
              key={page}
              variant="ghost"
              size="sm"
              onClick={() => onPageChange(page)}
              className={`
                h-8 w-8 p-0 text-sm
                ${isActive 
                  ? 'bg-[#7F77DD] text-[#0F0F12] hover:bg-[#6B63C7]' 
                  : 'text-[#B4B2A9] hover:text-[#E8E6F0] hover:bg-[rgba(255,255,255,0.05)]'
                }
              `}
            >
              {page}
            </Button>
          );
        })}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-8 w-8 p-0 text-[#B4B2A9] hover:text-[#E8E6F0] hover:bg-[rgba(255,255,255,0.05)] disabled:opacity-30"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
