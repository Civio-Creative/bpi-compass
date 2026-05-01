import type { SearchFilters, InsightSummary } from './types';
import { getDataset, type NormalizedTarget } from './data';
import { matchesSubSector } from './taxonomy';

export interface RankedTarget extends NormalizedTarget {
  score: number;
  rank: number;
}

export function filterAndRank(filters: SearchFilters): RankedTarget[] {
  let pool = getDataset();

  if (filters.sector === 'news') pool = pool.filter((t) => t.sector === 'news');
  else if (filters.sector === 'culture') pool = pool.filter((t) => t.sector === 'culture');

  const pills = filters.subSectors.filter((p) => p !== 'All');
  if (pills.length > 0 && (filters.sector === 'news' || filters.sector === 'culture')) {
    pool = pool.filter((t) =>
      pills.some((p) =>
        matchesSubSector(filters.sector as 'news' | 'culture', p, t.category, t.rawMediaTags),
      ),
    );
  }

  const reachOf = (t: NormalizedTarget) =>
    filters.audienceAlignment === 'dem'
      ? t.demReach
      : filters.audienceAlignment === 'rep'
        ? t.repReach
        : t.panelReach;

  const scored = pool.flatMap<RankedTarget>((t) => {
    const reach = reachOf(t);
    let score: number;
    switch (filters.successMetric) {
      case 'visibility':
        score = reach;
        break;
      case 'trust':
        score = reach - t.genPopReach;
        break;
      case 'insider':
        if (t.genPopReach >= 10) return [];
        score = reach - t.genPopReach;
        break;
      default:
        score = reach;
    }
    return [{ ...t, score, rank: 0 }];
  });

  scored.sort((a, b) => b.score - a.score);
  scored.forEach((t, i) => {
    t.rank = i + 1;
  });
  return scored;
}

export function computeSummaryStats(
  ranked: RankedTarget[],
  topN = 25,
): Omit<InsightSummary, 'narrative'> {
  const sample = ranked.slice(0, topN);
  if (sample.length === 0) {
    return {
      totalTargets: 0,
      avgPanelReach: 0,
      avgGenPopReach: 0,
      avgDemReach: 0,
      avgRepReach: 0,
      topMediaTags: [],
      topCategories: [],
    };
  }
  const avg = (k: 'panelReach' | 'genPopReach' | 'demReach' | 'repReach') =>
    Math.round((sample.reduce((s, t) => s + t[k], 0) / sample.length) * 10) / 10;

  const tagCounts = new Map<string, number>();
  const catCounts = new Map<string, number>();
  for (const t of sample) {
    tagCounts.set(t.mediaTag, (tagCounts.get(t.mediaTag) ?? 0) + 1);
    catCounts.set(t.category, (catCounts.get(t.category) ?? 0) + 1);
  }
  const top = (m: Map<string, number>) =>
    [...m.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([k]) => k)
      .slice(0, 3);

  return {
    totalTargets: ranked.length,
    avgPanelReach: avg('panelReach'),
    avgGenPopReach: avg('genPopReach'),
    avgDemReach: avg('demReach'),
    avgRepReach: avg('repReach'),
    topMediaTags: top(tagCounts),
    topCategories: top(catCounts),
  };
}
