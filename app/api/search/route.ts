import { NextRequest, NextResponse } from 'next/server';
import type { SearchFilters, Target, InsightSummary } from '@/lib/types';
import { filterAndRank, computeSummaryStats } from '@/lib/ranking';
import { generateCardInsights, generateInsightSummary } from '@/lib/anthropic';
import { toTarget } from '@/lib/data';

const PAGE_SIZE = 10;
const MAX_RESULTS = 100;

export async function POST(req: NextRequest) {
  try {
    const body: { filters: SearchFilters; page?: number; includeSummary?: boolean } =
      await req.json();
    const { filters } = body;
    const page = Math.max(1, body.page ?? 1);
    const includeSummary = body.includeSummary ?? page === 1;

    const ranked = filterAndRank(filters).slice(0, MAX_RESULTS);
    const totalCount = ranked.length;
    const start = (page - 1) * PAGE_SIZE;
    const pageItems = ranked.slice(start, start + PAGE_SIZE);

    const insightsPromise = generateCardInsights(filters, pageItems);

    let summary: InsightSummary | null = null;
    if (includeSummary && ranked.length > 0) {
      const stats = computeSummaryStats(ranked);
      const narrative = await generateInsightSummary(filters, ranked.slice(0, 10), stats);
      summary = { ...stats, narrative };
    }

    const insights = await insightsPromise;
    const targets: Target[] = pageItems.map((t) => toTarget(t, t.rank, insights[t.id] ?? ''));

    return NextResponse.json({
      targets,
      summary,
      page,
      pageSize: PAGE_SIZE,
      totalCount,
      totalPages: Math.max(1, Math.ceil(totalCount / PAGE_SIZE)),
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
