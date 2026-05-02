'use client';

import { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/compass/header';
import { Sidebar } from '@/components/compass/sidebar';
import { EmptyState } from '@/components/compass/empty-state';
import { LoadingState } from '@/components/compass/loading-state';
import { ResultsView } from '@/components/compass/results-view';
import { SaveLimitModal } from '@/components/compass/save-limit-modal';
import { SelectionBar } from '@/components/compass/selection-bar';
import type {
  SearchFilters,
  AppState,
  Target,
  InsightSummary,
  ChatMessage,
  SavedSearch,
} from '@/lib/types';

const STORAGE_KEY = 'compass-saved-searches';
const MAX_SAVED_SEARCHES = 5;
const PAGE_SIZE = 10;
const TOP_LIMIT = 25;

const defaultFilters: SearchFilters = {
  campaignBrief: '',
  sectors: ['All'],
  accountTypes: [],
  targetAudience: '',
};

type ViewMode = 'top' | 'all';

function pageCount(mode: ViewMode, totalCount: number): number {
  const effective = mode === 'top' ? Math.min(TOP_LIMIT, totalCount) : totalCount;
  return Math.max(1, Math.ceil(effective / PAGE_SIZE));
}

function pageSlice(mode: ViewMode, page: number, totalCount: number): { offset: number; count: number } {
  const offset = (page - 1) * PAGE_SIZE;
  if (mode === 'top') {
    const cap = Math.min(TOP_LIMIT, totalCount);
    return { offset, count: Math.max(0, Math.min(PAGE_SIZE, cap - offset)) };
  }
  return { offset, count: PAGE_SIZE };
}

export default function CompassPage() {
  const [appState, setAppState] = useState<AppState>('empty');
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters);
  const [results, setResults] = useState<Target[]>([]);
  const [summary, setSummary] = useState<InsightSummary | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('top');
  const [currentPage, setCurrentPage] = useState(1);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedTargets, setSelectedTargets] = useState<Record<string, Target>>({});
  const [appliedFilters, setAppliedFilters] = useState<SearchFilters | null>(null);

  const filtersStale = (() => {
    if (appState !== 'results' || !appliedFilters) return false;
    if (filters.campaignBrief !== appliedFilters.campaignBrief) return true;
    if (filters.targetAudience !== appliedFilters.targetAudience) return true;
    const sortedJoin = (xs: string[]) => [...xs].sort().join('|');
    if (sortedJoin(filters.sectors) !== sortedJoin(appliedFilters.sectors)) return true;
    if (sortedJoin(filters.accountTypes) !== sortedJoin(appliedFilters.accountTypes)) return true;
    return false;
  })();

  const handleToggleSelect = useCallback((target: Target) => {
    setSelectedTargets((prev) => {
      const next = { ...prev };
      if (next[target.id]) delete next[target.id];
      else next[target.id] = target;
      return next;
    });
  }, []);

  const handleClearSelection = useCallback(() => setSelectedTargets({}), []);

  const selectedIds = new Set(Object.keys(selectedTargets));
  const selectedList = Object.values(selectedTargets);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setSavedSearches(JSON.parse(stored));
    } catch (e) {
      console.error('Failed to load saved searches:', e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedSearches));
    } catch (e) {
      console.error('Failed to save searches:', e);
    }
  }, [savedSearches]);

  const fetchPage = useCallback(
    async (
      mode: ViewMode,
      page: number,
      knownTotal: number | null,
      includeSummary: boolean,
    ): Promise<{ targets: Target[]; summary: InsightSummary | null; totalCount: number }> => {
      const total = knownTotal ?? Number.MAX_SAFE_INTEGER;
      const { offset, count } = pageSlice(mode, page, total);
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filters, offset, count, includeSummary }),
      });
      if (!res.ok) throw new Error(`Search failed: ${res.status}`);
      return res.json();
    },
    [filters],
  );

  const handleSearch = useCallback(async () => {
    const snapshot = { ...filters };
    setAppState('loading');
    setChatHistory([]);
    setResults([]);
    setViewMode('top');
    setCurrentPage(1);
    try {
      const data = await fetchPage('top', 1, null, true);
      setResults(data.targets);
      setSummary(data.summary);
      setTotalCount(data.totalCount);
      setAppliedFilters(snapshot);
      setAppState('results');
    } catch (e) {
      console.error(e);
      setAppState('empty');
    }
  }, [fetchPage, filters]);

  const handlePageChange = useCallback(
    async (page: number) => {
      const max = pageCount(viewMode, totalCount);
      if (page === currentPage || page < 1 || page > max) return;
      setIsPageLoading(true);
      try {
        const data = await fetchPage(viewMode, page, totalCount, false);
        setResults(data.targets);
        setCurrentPage(page);
      } catch (e) {
        console.error(e);
      } finally {
        setIsPageLoading(false);
      }
    },
    [fetchPage, viewMode, currentPage, totalCount],
  );

  const handleViewAll = useCallback(async () => {
    setIsPageLoading(true);
    try {
      const data = await fetchPage('all', 1, totalCount, false);
      setResults(data.targets);
      setViewMode('all');
      setCurrentPage(1);
    } catch (e) {
      console.error(e);
    } finally {
      setIsPageLoading(false);
    }
  }, [fetchPage, totalCount]);

  const handleBackToTop = useCallback(async () => {
    setIsPageLoading(true);
    try {
      const data = await fetchPage('top', 1, totalCount, false);
      setResults(data.targets);
      setViewMode('top');
      setCurrentPage(1);
    } catch (e) {
      console.error(e);
    } finally {
      setIsPageLoading(false);
    }
  }, [fetchPage, totalCount]);

  const handleNewAnalysis = useCallback(() => {
    setAppState('empty');
    setFilters(defaultFilters);
    setResults([]);
    setSummary(null);
    setChatHistory([]);
    setTotalCount(0);
    setViewMode('top');
    setCurrentPage(1);
    setSelectedTargets({});
    setAppliedFilters(null);
  }, []);

  const handleSelectExample = useCallback(
    (example: { brief: string; preset: Partial<SearchFilters> }) => {
      setFilters((prev) => ({ ...prev, campaignBrief: example.brief, ...example.preset }));
    },
    [],
  );

  const handleSendMessage = useCallback(
    async (text: string) => {
      const userMessage: ChatMessage = {
        id: `${Date.now()}-u`,
        role: 'user',
        content: text,
      };
      const newHistory = [...chatHistory, userMessage];
      setChatHistory(newHistory);
      setIsTyping(true);
      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filters, history: newHistory }),
        });
        if (!res.ok) throw new Error(`Chat failed: ${res.status}`);
        const data = await res.json();
        setChatHistory((prev) => [...prev, data.message]);
      } catch (e) {
        console.error(e);
      } finally {
        setIsTyping(false);
      }
    },
    [chatHistory, filters],
  );

  const handleSaveSearch = useCallback(() => {
    if (savedSearches.length >= MAX_SAVED_SEARCHES) {
      setShowLimitModal(true);
      return;
    }
    if (!summary) return;

    const briefPreview =
      filters.campaignBrief.slice(0, 50) + (filters.campaignBrief.length > 50 ? '...' : '');

    const newSearch: SavedSearch = {
      id: Date.now().toString(),
      name: briefPreview || 'Untitled search',
      timestamp: Date.now(),
      filters: { ...filters },
      results: [...results],
      summary: { ...summary },
      chatHistory: [...chatHistory],
    };

    setSavedSearches((prev) => [newSearch, ...prev]);
  }, [filters, results, summary, chatHistory, savedSearches.length]);

  const handleLoadSearch = useCallback((search: SavedSearch) => {
    setFilters(search.filters);
    setAppliedFilters({ ...search.filters });
    setResults(search.results);
    setSummary(search.summary);
    setChatHistory(search.chatHistory);
    setTotalCount(search.summary.totalTargets);
    setViewMode('top');
    setCurrentPage(1);
    setAppState('results');
  }, []);

  const handleDeleteSearch = useCallback((id: string) => {
    setSavedSearches((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const canSave =
    appState === 'results' &&
    !savedSearches.some(
      (s) =>
        s.filters.campaignBrief === filters.campaignBrief && s.results.length === results.length,
    );

  return (
    <div className="h-screen flex flex-col bg-[#11141a]">
      <Header
        savedSearches={savedSearches}
        onNewAnalysis={handleNewAnalysis}
        onLoadSearch={handleLoadSearch}
        onDeleteSearch={handleDeleteSearch}
      />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          filters={filters}
          onFiltersChange={setFilters}
          onSearch={handleSearch}
          appState={appState}
          filtersStale={filtersStale}
        />

        <main className="flex-1 flex flex-col overflow-hidden bg-[#11141a]">
          {appState === 'empty' && <EmptyState onSelectExample={handleSelectExample} />}

          {appState === 'loading' && <LoadingState />}

          {appState === 'results' && summary && (
            <ResultsView
              targets={results}
              summary={summary}
              chatHistory={chatHistory}
              isTyping={isTyping}
              onSendMessage={handleSendMessage}
              onSaveSearch={handleSaveSearch}
              canSave={canSave}
              totalItems={totalCount}
              viewMode={viewMode}
              currentPage={currentPage}
              targetAudience={filters.targetAudience}
              onPageChange={handlePageChange}
              onViewAll={handleViewAll}
              onBackToTop={handleBackToTop}
              isPageLoading={isPageLoading}
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
            />
          )}
        </main>
      </div>

      <SaveLimitModal isOpen={showLimitModal} onClose={() => setShowLimitModal(false)} />
      <SelectionBar
        selectedTargets={selectedList}
        filters={filters}
        onClear={handleClearSelection}
      />
    </div>
  );
}
