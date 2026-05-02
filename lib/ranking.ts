import type { SearchFilters, InsightSummary } from './types';
import { getDataset, type NormalizedTarget } from './data';

export interface RankedTarget extends NormalizedTarget {
  score: number;
  rank: number;
}

export const SECTOR_ALL = 'All';
export const TYPE_ALL = 'All types';

function matchesSector(t: NormalizedTarget, sector: string): boolean {
  const c = t.rawCategory.toLowerCase();
  const primary = t.category.toLowerCase();
  switch (sector) {
    case 'News, journalism & politics':
      return (
        c.includes('news media') ||
        /newspapers?/.test(c) ||
        c.includes('print media') ||
        /politics|government|social issues/.test(c) ||
        /websites\|\|news\b/.test(c) ||
        /tv\|\|[^|]*news/.test(c) ||
        /radio\|\|[^|]*news/.test(c) ||
        /podcasts\|\|[^|]*news/.test(c) ||
        /podcasts\|\|[^|]*politics/.test(c)
      );
    case 'Sports':
      return primary.startsWith('sports');
    case 'Music, arts & entertainment':
      return /music|art\s*\/\s*artists|performing arts|film\s*\/\s*tv|entertainment|comedy|movies|streaming|\btv\b/.test(c);
    case 'Business & finance':
      return c.includes('business');
    case 'Health, science & academia':
      return /health|wellness|medical|science|academics/.test(c);
    case 'Lifestyle & culture':
      return /fashion|beauty|food|travel|home|family|religion|animals/.test(c);
    case 'Digital creators':
      return /youtube|social media|internet related|bloggers/.test(c);
    default:
      return false;
  }
}

function matchesAccountType(t: NormalizedTarget, type: string): boolean {
  const tags = t.rawMediaTags;
  const cat = t.category;
  const rawCat = t.rawCategory;
  switch (type) {
    case 'Journalists':
      return /journalist/i.test(tags);
    case 'News outlets':
      return /newspaper|tv_news|news_website/i.test(tags);
    case 'Politicians & officials':
      return /politician/i.test(tags);
    case 'Activists':
      return /activist/i.test(tags);
    case 'Authors':
      return cat === 'Authors' || /political_author/i.test(tags);
    case 'Podcasters & radio hosts':
      return (
        cat === 'Podcasts' ||
        cat === 'Radio' ||
        /podcast_political|radio_political/i.test(tags)
      );
    case 'Athletes':
      return /^sports/i.test(cat) && !/journalist broadcaster/i.test(rawCat);
    case 'Musicians & artists':
      return cat === 'Music';
    case 'TV & film personalities':
      return ['Film / Tv', 'Tv', 'Entertainment', 'Movies', 'Comedy'].includes(cat);
    case 'Business leaders':
      return cat === 'Business';
    case 'Academics & experts':
      return cat === 'Academics' || cat === 'Science / Technology';
    case 'Influencers & creators':
      return ['Youtube Channels', 'Social Media / Video', 'Internet Related', 'Bloggers'].includes(cat);
    default:
      return false;
  }
}

function reachFor(t: NormalizedTarget, audience: SearchFilters['targetAudience']): number {
  switch (audience) {
    case 'public':
      return t.genPopReach;
    case 'dem':
      return t.demReach;
    case 'rep':
      return t.repReach;
    case 'bpi':
    default:
      return t.panelReach;
  }
}

export function filterAndRank(filters: SearchFilters): RankedTarget[] {
  let pool = getDataset();

  const sectorsActive = filters.sectors.filter((s) => s !== SECTOR_ALL);
  if (sectorsActive.length > 0) {
    pool = pool.filter((t) => sectorsActive.some((s) => matchesSector(t, s)));
  }

  const typesActive = filters.accountTypes.filter((t) => t !== TYPE_ALL);
  if (typesActive.length > 0) {
    pool = pool.filter((t) => typesActive.some((type) => matchesAccountType(t, type)));
  }

  const scored: RankedTarget[] = pool.map((t) => ({
    ...t,
    score: reachFor(t, filters.targetAudience),
    rank: 0,
  }));

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
