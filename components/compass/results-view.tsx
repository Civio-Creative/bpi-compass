'use client';

import { ArrowLeft, ArrowRight, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InsightSummary } from './insight-summary';
import { SnapshotCards } from './snapshot-cards';
import { ResultCard } from './result-card';
import { Pagination } from './pagination';
import { AskFollowUp } from './ask-follow-up';
import type { Target, InsightSummary as InsightSummaryType, ChatMessage, SearchFilters } from '@/lib/types';

interface ResultsViewProps {
  targets: Target[];
  summary: InsightSummaryType;
  chatHistory: ChatMessage[];
  isTyping: boolean;
  onSendMessage: (text: string) => void;
  onSaveSearch: () => void;
  canSave: boolean;
  totalItems: number;
  viewMode: 'top' | 'all';
  currentPage: number;
  targetAudience: SearchFilters['targetAudience'];
  onPageChange: (page: number) => void;
  onViewAll: () => void;
  onBackToTop: () => void;
  isPageLoading: boolean;
  selectedIds: Set<string>;
  onToggleSelect: (target: Target) => void;
}

const PAGE_SIZE = 10;
const TOP_LIMIT = 25;

const AUDIENCE_LABEL: Record<string, string> = {
  bpi: "BPI's audience",
  public: 'US public reach',
  dem: 'Democratic-leaning reach',
  rep: 'Republican-leaning reach',
};

export function ResultsView({
  targets,
  summary,
  chatHistory,
  isTyping,
  onSendMessage,
  onSaveSearch,
  canSave,
  totalItems,
  viewMode,
  currentPage,
  targetAudience,
  onPageChange,
  onViewAll,
  onBackToTop,
  isPageLoading,
  selectedIds,
  onToggleSelect,
}: ResultsViewProps) {
  const isTopMode = viewMode === 'top';
  const effectiveTotal = isTopMode ? Math.min(TOP_LIMIT, totalItems) : totalItems;
  const totalPages = Math.max(1, Math.ceil(effectiveTotal / PAGE_SIZE));
  const isLastTopPage = isTopMode && currentPage >= totalPages;
  const showActionLink = totalItems > TOP_LIMIT;

  const audienceLabel = AUDIENCE_LABEL[targetAudience] ?? targetAudience;
  const actionLabel = isTopMode
    ? `View all ${totalItems.toLocaleString()} →`
    : '← Back to top picks';
  const handleAction = isTopMode ? onViewAll : onBackToTop;

  return (
    <div className="flex-1 p-8 pb-28 overflow-y-auto">
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
          totalTargets={totalItems}
          avgGenPopReach={summary.avgGenPopReach}
          avgDemReach={summary.avgDemReach}
          avgRepReach={summary.avgRepReach}
        />
      </div>

      <div className="mt-8">
        <div className="mb-4">
          <div className="flex items-baseline gap-3 flex-wrap">
            <h3 className="text-[#E8E6F0] text-base font-semibold uppercase tracking-[0.05em]">
              {isTopMode ? 'Top 25 Recommendations' : 'All Recommendations'}
            </h3>
            <p className="text-[#888780] text-xs font-normal">
              {isTopMode
                ? `from ${totalItems.toLocaleString()} matching accounts`
                : `${totalItems.toLocaleString()} accounts ranked by ${audienceLabel}`}
            </p>
          </div>
          {showActionLink && (
            <button
              type="button"
              onClick={handleAction}
              className="block mt-1 text-[12px] font-medium text-[#888780] hover:text-[#CECBF6] transition-colors whitespace-nowrap"
            >
              {actionLabel}
            </button>
          )}
        </div>

        <div className="flex justify-end mb-2">
          <p className="text-[#888780] text-xs font-normal whitespace-nowrap">
            Select up to 10 target accounts to export data
          </p>
        </div>

        <div
          className={`flex flex-col gap-4 transition-opacity ${
            isPageLoading ? 'opacity-40 pointer-events-none' : ''
          }`}
        >
          {targets.map((target) => (
            <ResultCard
              key={target.id}
              target={target}
              selected={selectedIds.has(target.id)}
              onToggle={onToggleSelect}
            />
          ))}
        </div>

        {totalPages > 1 && (
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={effectiveTotal}
              itemsPerPage={PAGE_SIZE}
              onPageChange={onPageChange}
            />
          </div>
        )}

        {showActionLink && (isLastTopPage || !isTopMode) && (
          <div className="mt-6">
            <button
              type="button"
              onClick={handleAction}
              className="w-full inline-flex items-center justify-center gap-2 rounded-[12px] border border-[rgba(127,119,221,0.4)] bg-[rgba(127,119,221,0.08)] text-[#CECBF6] text-sm font-semibold px-6 py-[14px] hover:bg-[rgba(127,119,221,0.16)] transition-colors"
            >
              {isTopMode ? (
                <>
                  View all {totalItems.toLocaleString()}
                  <ArrowRight className="h-4 w-4" />
                </>
              ) : (
                <>
                  <ArrowLeft className="h-4 w-4" />
                  Back to top picks
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
