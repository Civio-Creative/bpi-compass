'use client';

import { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/compass/header';
import { Sidebar } from '@/components/compass/sidebar';
import { EmptyState } from '@/components/compass/empty-state';
import { LoadingState } from '@/components/compass/loading-state';
import { ResultsView } from '@/components/compass/results-view';
import { SaveLimitModal } from '@/components/compass/save-limit-modal';
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

const defaultFilters: SearchFilters = {
  campaignBrief: '',
  audienceAlignment: '',
  sector: '',
  subSectors: ['All'],
  successMetric: '',
};

export default function CompassPage() {
  const [appState, setAppState] = useState<AppState>('empty');
  const [filters, setFilters] = useState<SearchFilters>(defaultFilters);
  const [results, setResults] = useState<Target[]>([]);
  const [summary, setSummary] = useState<InsightSummary | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

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

  const handleSearch = useCallback(async () => {
    setAppState('loading');
    setChatHistory([]);
    setCurrentPage(1);
    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filters, page: 1, includeSummary: true }),
      });
      if (!res.ok) throw new Error(`Search failed: ${res.status}`);
      const data = await res.json();
      setResults(data.targets);
      setSummary(data.summary);
      setTotalCount(data.totalCount);
      setTotalPages(data.totalPages);
      setAppState('results');
    } catch (e) {
      console.error(e);
      setAppState('empty');
    }
  }, [filters]);

  const handlePageChange = useCallback(
    async (page: number) => {
      if (page === currentPage || page < 1 || page > totalPages) return;
      setIsPageLoading(true);
      try {
        const res = await fetch('/api/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filters, page, includeSummary: false }),
        });
        if (!res.ok) throw new Error(`Search failed: ${res.status}`);
        const data = await res.json();
        setResults(data.targets);
        setCurrentPage(page);
      } catch (e) {
        console.error(e);
      } finally {
        setIsPageLoading(false);
      }
    },
    [filters, currentPage, totalPages],
  );

  const handleNewAnalysis = useCallback(() => {
    setAppState('empty');
    setFilters(defaultFilters);
    setResults([]);
    setSummary(null);
    setChatHistory([]);
    setCurrentPage(1);
    setTotalPages(1);
    setTotalCount(0);
  }, []);

  const handleSelectBrief = useCallback((brief: string) => {
    setFilters((prev) => ({ ...prev, campaignBrief: brief }));
  }, []);

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
    setResults(search.results);
    setSummary(search.summary);
    setChatHistory(search.chatHistory);
    setCurrentPage(1);
    setTotalCount(search.results.length);
    setTotalPages(Math.max(1, Math.ceil(search.results.length / PAGE_SIZE)));
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
    <div className="h-screen flex flex-col bg-[#0F0F12]">
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
        />

        <main className="flex-1 flex flex-col overflow-hidden">
          {appState === 'empty' && <EmptyState onSelectBrief={handleSelectBrief} />}

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
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalCount}
              pageSize={PAGE_SIZE}
              onPageChange={handlePageChange}
              isPageLoading={isPageLoading}
            />
          )}
        </main>
      </div>

      <SaveLimitModal isOpen={showLimitModal} onClose={() => setShowLimitModal(false)} />
    </div>
  );
}
