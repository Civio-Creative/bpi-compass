export type Sector = 'news' | 'culture';

const NEWS_CATEGORY_PATHS = new Set<string>(
  [
    'News Media',
    'Politics / Government',
    'Websites||News',
    'Websites||Law Government And Politics',
    'Tv||Networks||News',
    'Tv||News & Information shows',
    'Newspapers',
    'Print Media||Newspapers',
    'Print Media||Newsletters',
    'Newsletters',
    'Magazines||Politics',
    'Magazines||News',
    'Authors||Politics & Social Sciences',
    'Podcasts||News',
    'Podcasts||Politics/Government',
    'Radio||News/Talk',
    'Radio||Public',
    'International||Europe||General News',
    'Sports||Journalist Broadcaster',
    'Social Issues',
    'Youtube Channels||News',
  ].map((s) => s.toLowerCase()),
);

const HSEP = '\x00';

function splitCategoryPaths(raw: string): string[] {
  if (!raw) return [];
  return raw
    .replace(/\|\|/g, HSEP)
    .split('|')
    .map((p) => p.replace(new RegExp(HSEP, 'g'), '||').trim())
    .filter(Boolean);
}

export function classifySector(rawCategoriesAll: string): Sector {
  const paths = splitCategoryPaths(rawCategoriesAll).map((p) => p.toLowerCase());
  return paths.some((p) => NEWS_CATEGORY_PATHS.has(p)) ? 'news' : 'culture';
}

type PillMatcher = (rawCategory: string, mediaTags: string) => boolean;

const NEWS_PILL_MATCHERS: Record<string, PillMatcher> = {
  Journalists: (_c, t) => /journalist/i.test(t),
  'News outlets': (_c, t) => /newspaper|tv_news|news_website/i.test(t),
  'Podcasts & radio': (_c, t) => /podcast|radio/i.test(t),
  'Politicians & officials': (c, t) =>
    /politics\s*\/\s*government/i.test(c) || /politician/i.test(t) || /politician/i.test(c),
  Activists: (_c, t) => /activist/i.test(t),
};

const CULTURE_PILL_MATCHERS: Record<string, PillMatcher> = {
  'Sports figures': (c) => /sports/i.test(c) && !/journalist broadcaster/i.test(c),
  Musicians: (c) => /music/i.test(c),
  'TV & entertainment': (c) => /\btv\b|film|entertainment|comedy/i.test(c),
  'Business leaders': (c) => /business|\bceo\b|management/i.test(c),
  'Health & wellness': (c) => /health|wellness|medical/i.test(c),
  'Fashion & beauty': (c) => /fashion|beauty/i.test(c),
};

export function matchesSubSector(
  sector: Sector,
  pill: string,
  rawCategory: string,
  mediaTags: string,
): boolean {
  if (pill === 'All') return true;
  const matchers = sector === 'news' ? NEWS_PILL_MATCHERS : CULTURE_PILL_MATCHERS;
  const fn = matchers[pill];
  return fn ? fn(rawCategory, mediaTags) : false;
}

export function displayMediaTag(mediaTags: string, primaryCategory: string): string {
  const trimmed = mediaTags.trim();
  if (trimmed) return trimmed.split(/[|,]/)[0].trim();
  return primaryCategory;
}
