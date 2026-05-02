import { NextRequest, NextResponse } from 'next/server';
import type { SearchFilters, Target, InsightSummary } from '@/lib/types';
import { filterAndRank, computeSummaryStats } from '@/lib/ranking';
import { generateCardInsights, generateInsightSummary } from '@/lib/anthropic';
import { toTarget } from '@/lib/data';

const DEFAULT_COUNT = 25;

export async function POST(req: NextRequest) {
  try {
    const body: {
      filters: SearchFilters;
      offset?: number;
      count?: number;
      includeSummary?: boolean;
    } = await req.json();
    const { filters } = body;
    const offset = Math.max(0, body.offset ?? 0);
    const count = Math.max(1, body.count ?? DEFAULT_COUNT);
    const includeSummary = body.includeSummary ?? offset === 0;

    const ranked = filterAndRank(filters);
    const totalCount = ranked.length;
    const slice = ranked.slice(offset, offset + count);

    const insightsPromise = generateCardInsights(filters, slice);

    let summary: InsightSummary | null = null;
    if (includeSummary && ranked.length > 0) {
      const stats = computeSummaryStats(ranked, 25);
      const narrative = await generateInsightSummary(filters, ranked.slice(0, 10), stats);
      summary = { ...stats, totalTargets: totalCount, narrative };
    }

    const insights = await insightsPromise;
    const targets: Target[] = slice.map((t) => toTarget(t, t.rank, insights[t.id] ?? ''));

    return NextResponse.json({
      targets,
      summary,
      totalCount,
      offset,
      displayedCount: targets.length,
      hasMore: offset + targets.length < totalCount,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
