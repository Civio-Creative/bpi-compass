import type { SearchFilters } from './types';

export interface ExampleBrief {
  category: string;
  color: string;
  title: string;
  brief: string;
  preset: Pick<SearchFilters, 'sectors' | 'accountTypes' | 'targetAudience'>;
}

export const exampleBriefs: ExampleBrief[] = [
  {
    category: 'Corporate',
    color: '#7F77DD',
    title: 'Walmart campaign on American manufacturing and trade policy',
    brief: 'Walmart campaign on American manufacturing and trade policy ahead of the next congressional session. Need bipartisan coverage with credibility on the Hill.',
    preset: {
      sectors: ['News, journalism & politics', 'Business & finance'],
      accountTypes: ['Journalists', 'News outlets', 'Business leaders'],
      targetAudience: 'bpi',
    },
  },
  {
    category: 'Advocacy',
    color: '#5EBFB5',
    title: 'Foundation launching a maternal health initiative',
    brief: 'Foundation campaign on maternal health and racial disparities. Need policy press, women\'s health advocates, and leaders in high-mortality states.',
    preset: {
      sectors: ['News, journalism & politics', 'Health, science & academia'],
      accountTypes: ['Journalists', 'Activists', 'Politicians & officials'],
      targetAudience: 'bpi',
    },
  },
  {
    category: 'Political',
    color: '#85B7EB',
    title: 'Senate candidate running on healthcare costs in Pennsylvania',
    brief: 'PA Democratic Senate campaign on healthcare costs and pre-existing conditions. Need voices that reach suburban and working-class persuadable voters.',
    preset: {
      sectors: ['News, journalism & politics'],
      accountTypes: ['Journalists', 'News outlets', 'Politicians & officials'],
      targetAudience: 'dem',
    },
  },
  {
    category: 'Reputation',
    color: '#E89B8C',
    title: 'Tech CEO repositioning around AI safety',
    brief: 'Tech CEO repositioning on AI safety. Need tech press, AI policy experts, and business media covering technology and ethics.',
    preset: {
      sectors: ['News, journalism & politics', 'Business & finance', 'Health, science & academia'],
      accountTypes: ['Journalists', 'Academics & experts', 'Business leaders'],
      targetAudience: 'bpi',
    },
  },
];
