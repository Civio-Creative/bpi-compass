export type Sector = 'news' | 'culture';

const NEWS_CATEGORIES = new Set<string>(
  [
    'News Media',
    'Politics / Government',
    'Websites > News',
    'Law Government And Politics',
    'Tv > Networks > News',
    'Tv > News & Information shows',
    'Newspapers',
    'Newsletters',
    'Magazines > Politics',
    'Magazines > News',
    'Authors > Politics & Social Sciences',
    'Podcasts > News',
    'Podcasts > Politics/Government',
    'Radio > News/Talk',
    'Radio > Public',
    'International > Europe > General News',
    'Sports > Journalist Broadcaster',
    'Social Issues',
    'Youtube Channels > News',
  ].map((s) => s.toLowerCase()),
);

export function classifySector(rawCategory: string): Sector {
  const segments = rawCategory.split('||').map((s) => s.trim().toLowerCase());
  return segments.some((s) => NEWS_CATEGORIES.has(s)) ? 'news' : 'culture';
}

const NEWS_PILL_TAG_MATCHERS: Record<string, RegExp> = {
  Journalists: /journalist/i,
  'News outlets': /news_website|newspaper|tv_news/i,
  'Podcasts & radio': /podcast_political|radio_political/i,
  Activists: /activist/i,
};

const CULTURE_PILL_CATEGORY_MATCHERS: Record<string, RegExp> = {
  'Entertainment & TV': /entertainment|film|tv|comedy|reality/i,
  Music: /^music/i,
  Sports: /^sports(?!.*journalist broadcaster)/i,
  'Fashion & beauty': /fashion|beauty/i,
  'Business & tech': /business|technology|management|ceo/i,
  'Health & wellness': /health|wellness|medical/i,
};

export function matchesSubSector(
  sector: Sector,
  pill: string,
  category: string,
  mediaTags: string,
): boolean {
  if (pill === 'All') return true;
  if (sector === 'news') {
    const rx = NEWS_PILL_TAG_MATCHERS[pill];
    return rx ? rx.test(mediaTags) : false;
  }
  const rx = CULTURE_PILL_CATEGORY_MATCHERS[pill];
  return rx ? rx.test(category) : false;
}

export function displayMediaTag(mediaTags: string, primaryCategory: string): string {
  const trimmed = mediaTags.trim();
  if (trimmed) return trimmed.split(/[|,]/)[0].trim();
  return primaryCategory;
}
