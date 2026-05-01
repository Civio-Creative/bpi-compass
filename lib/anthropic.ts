import Anthropic from '@anthropic-ai/sdk';
import type { SearchFilters, ChatMessage } from './types';
import type { RankedTarget } from './ranking';

const MODEL = 'claude-sonnet-4-5';

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!client) {
    if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY not set');
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

const SYSTEM_BASE = `You are Compass, an internal media-targeting assistant for BPI strategists.
You help select and explain the best media targets — journalists, outlets, podcasts, cultural figures — for a given campaign brief.
Voice: concise, expert, factual. No marketing language. No exclamation points.
Reach percentages are precomputed panel/audience reach values; never invent numbers.`;

const targetLine = (t: RankedTarget) =>
  `${t.name} | ${t.category} | tag=${t.mediaTag} | panel=${t.panelReach}% gen=${t.genPopReach}% dem=${t.demReach}% rep=${t.repReach}%`;

const briefBlock = (f: SearchFilters) => `Campaign brief:
${f.campaignBrief}

Audience alignment: ${f.audienceAlignment || 'unspecified'}
Sector: ${f.sector || 'all'}
Sub-sectors: ${f.subSectors.join(', ')}
Success metric: ${f.successMetric}`;

const textOf = (resp: Anthropic.Messages.Message): string =>
  resp.content
    .filter((b): b is Anthropic.Messages.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('')
    .trim();

export async function generateInsightSummary(
  filters: SearchFilters,
  topResults: RankedTarget[],
  stats: Record<string, unknown>,
): Promise<string> {
  const userBlock = `${briefBlock(filters)}

Stats: ${JSON.stringify(stats)}
Top targets:
${topResults.slice(0, 10).map(targetLine).join('\n')}

Write a 2-3 sentence summary of the result set for the strategist. Mention the strongest signal (sector, audience composition, or notable tag concentration). Do not enumerate individual targets.`;

  const resp = await getClient().messages.create({
    model: MODEL,
    max_tokens: 300,
    system: SYSTEM_BASE,
    messages: [{ role: 'user', content: userBlock }],
  });
  return textOf(resp);
}

export async function generateCardInsights(
  filters: SearchFilters,
  pageTargets: RankedTarget[],
): Promise<Record<string, string>> {
  const out: Record<string, string> = Object.fromEntries(pageTargets.map((t) => [t.id, '']));
  if (pageTargets.length === 0) return out;

  const userBlock = `${briefBlock(filters)}

For each target below, return a 1-2 sentence insight explaining why this target fits the brief. Reference audience overlap and the success metric. Reference specific reach numbers when they're notable.

Return JSON only: { "insights": { "<id>": "<sentence>", ... } }

Targets:
${pageTargets.map((t) => `[${t.id}] ${targetLine(t)}`).join('\n')}`;

  const resp = await getClient().messages.create({
    model: MODEL,
    max_tokens: 1500,
    system: SYSTEM_BASE,
    messages: [{ role: 'user', content: userBlock }],
  });
  const text = textOf(resp);
  try {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start === -1 || end === -1) return out;
    const parsed = JSON.parse(text.slice(start, end + 1));
    const insights = parsed?.insights ?? {};
    for (const id of Object.keys(out)) {
      if (typeof insights[id] === 'string') out[id] = insights[id];
    }
  } catch {
    /* leave empties */
  }
  return out;
}

export async function chatFollowUp(
  filters: SearchFilters,
  contextTargets: RankedTarget[],
  history: ChatMessage[],
): Promise<string> {
  const contextBlock = `Active campaign context (reason from this; do not repeat verbatim):
${briefBlock(filters)}

Top results in scope:
${contextTargets.slice(0, 25).map(targetLine).join('\n')}`;

  const resp = await getClient().messages.create({
    model: MODEL,
    max_tokens: 600,
    system: [
      { type: 'text', text: SYSTEM_BASE },
      { type: 'text', text: contextBlock, cache_control: { type: 'ephemeral' } },
    ],
    messages: history.map((m) => ({ role: m.role, content: m.content })),
  });
  return textOf(resp);
}
