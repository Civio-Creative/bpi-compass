'use client';

import { Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InsightSummary } from './insight-summary';
import { SnapshotCards } from './snapshot-cards';
import { ResultCard } from './result-card';
import { Pagination } from './pagination';
import { AskFollowUp } from './ask-follow-up';
import type { Target, InsightSummary as InsightSummaryType, ChatMessage } from '@/lib/types';

interface ResultsViewProps {
  targets: Target[];
  summary: InsightSummaryType;
  chatHistory: ChatMessage[];
  isTyping: boolean;
  onSendMessage: (text: string) => void;
  onSaveSearch: () => void;
  canSave: boolean;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  isPageLoading: boolean;
}

export function ResultsView({
  targets,
  summary,
  chatHistory,
  isTyping,
  onSendMessage,
  onSaveSearch,
  canSave,
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  isPageLoading,
}: ResultsViewProps) {
  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="flex items-start gap-4 mb-6">
        <div className="flex-1">
          <InsightSummary summary={summary} />
        </div>
        <Button
          onClick={onSaveSearch}
          disabled={!canSave}
          variant="outline"
          size="sm"
          className="shrink-0 border-[rgba(255,255,255,0.08)] bg-transparent text-[#B4B2A9] hover:text-[#E8E6F0] hover:bg-[rgba(255,255,255,0.05)] disabled:opacity-50"
        >
          <Bookmark className="h-4 w-4 mr-1.5" />
          Save search
        </Button>
      </div>

      <AskFollowUp chatHistory={chatHistory} isTyping={isTyping} onSendMessage={onSendMessage} />

      <div className="mt-6 mb-6">
        <SnapshotCards
          totalTargets={summary.totalTargets}
          avgGenPopReach={summary.avgGenPopReach}
          avgDemReach={summary.avgDemReach}
          avgRepReach={summary.avgRepReach}
        />
      </div>

      <div>
        <h3 className="text-[#888780] text-xs font-medium uppercase tracking-wider mb-4">
          Recommended targets <span className="text-[#888780]">· {totalItems}</span>
        </h3>
        <div
          className={`flex flex-col gap-[10px] transition-opacity ${
            isPageLoading ? 'opacity-40 pointer-events-none' : ''
          }`}
        >
          {targets.map((target) => (
            <ResultCard key={target.id} target={target} />
          ))}
        </div>

        {totalPages > 1 && (
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={pageSize}
              onPageChange={onPageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}
