import { readFileSync } from 'fs';
import path from 'path';
import type { Target } from './types';
import { classifySector, displayMediaTag, type Sector } from './taxonomy';

export interface NormalizedTarget {
  id: string;
  name: string;
  category: string;
  rawCategory: string;
  mediaTag: string;
  rawMediaTags: string;
  panelReach: number;
  genPopReach: number;
  demReach: number;
  repReach: number;
  sector: Sector;
}

let CACHE: NormalizedTarget[] | null = null;

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let field = '';
  let row: string[] = [];
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ',') {
        row.push(field);
        field = '';
      } else if (c === '\n') {
        row.push(field);
        rows.push(row);
        row = [];
        field = '';
      } else if (c !== '\r') field += c;
    }
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const round1 = (n: number) => Math.round(n * 1000) / 10;

function loadFromDisk(): NormalizedTarget[] {
  const csvPath = path.join(process.cwd(), 'data', 'policy_leader_data.csv');
  const rows = parseCSV(readFileSync(csvPath, 'utf-8'));
  const [header, ...data] = rows;
  const col = (name: string) => header.indexOf(name);
  const cCat = col('category');
  const cAll = col('categories_all');
  const cTags = col('media_tags');
  const cName = col('name');
  const cGen = col('gen_pop_reach');
  const cAllReach = col('all_reach');
  const cDem = col('dem_reach');
  const cRep = col('rep_reach');

  const out: NormalizedTarget[] = [];
  const seen = new Set<string>();
  for (const r of data) {
    if (r.length < 8) continue;
    const name = r[cName]?.trim();
    if (!name) continue;
    let id = slugify(name) || `row-${out.length}`;
    if (seen.has(id)) {
      let i = 2;
      while (seen.has(`${id}-${i}`)) i++;
      id = `${id}-${i}`;
    }
    seen.add(id);
    const categoriesAll = (r[cAll] || r[cCat] || '').trim();
    const mediaTags = (r[cTags] || '').trim();
    const primary = categoriesAll.split('||')[0].trim();
    out.push({
      id,
      name,
      category: primary,
      rawCategory: categoriesAll,
      mediaTag: displayMediaTag(mediaTags, primary),
      rawMediaTags: mediaTags,
      panelReach: round1(parseFloat(r[cAllReach])),
      genPopReach: round1(parseFloat(r[cGen])),
      demReach: round1(parseFloat(r[cDem])),
      repReach: round1(parseFloat(r[cRep])),
      sector: classifySector(categoriesAll),
    });
  }
  return out;
}

export function getDataset(): NormalizedTarget[] {
  if (!CACHE) CACHE = loadFromDisk();
  return CACHE;
}

export function toTarget(n: NormalizedTarget, rank: number, insight: string): Target {
  return {
    id: n.id,
    rank,
    name: n.name,
    category: n.category,
    mediaTag: n.mediaTag,
    panelReach: n.panelReach,
    genPopReach: n.genPopReach,
    demReach: n.demReach,
    repReach: n.repReach,
    insight,
  };
}
