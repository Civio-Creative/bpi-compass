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
You help select and explain the best media targets — journalists, outlets, podcasts, cultural figures — for a given campaign brief and target audience.
Voice: concise, expert, factual. No marketing language. No exclamation points.
Reach percentages are precomputed audience reach values; never invent numbers.`;

const SYSTEM_CHAT_CONSTRAINTS = `You are Compass's strategic assistant. You can ONLY reason about the accounts shown in the result set, the four reach percentages (% of BPI audience, % of US public, % Democratic, % Republican), the user's selected filters (Sector, Account type, Target audience), and the categories and media tags present in the data. You do NOT have access to: state-level data, geographic data, age demographics, follower counts, posting frequency, content topics beyond category labels, or any other dimensions. If a user asks about something outside this scope, say so directly: "Compass doesn't have data on [X]. Here's what I can tell you based on what's in the result set..." and pivot to what IS available.

Never propose filters or actions that aren't supported by the current sidebar (Sector, Account type, Target audience). If a user asks "can we filter by X", and X isn't one of those three, explain that's not currently a filter and suggest what is available.`;

const AUDIENCE_LABEL: Record<string, string> = {
  bpi: "BPI's tracked audience",
  public: 'US public',
  dem: 'Democratic-leaning audience',
  rep: 'Republican-leaning audience',
};

const audienceLabel = (a: SearchFilters['targetAudience']) =>
  AUDIENCE_LABEL[a] ?? (a || 'unspecified');

const targetLine = (t: RankedTarget) =>
  `${t.name} | ${t.category} | tag=${t.mediaTag} | bpi=${t.panelReach}% public=${t.genPopReach}% dem=${t.demReach}% rep=${t.repReach}%`;

const briefBlock = (f: SearchFilters) => `Campaign brief:
${f.campaignBrief}

Sectors selected: ${f.sectors.join(', ')}
Account types selected: ${f.accountTypes.join(', ')}
Target audience: ${audienceLabel(f.targetAudience)}`;

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

Write a 2-3 sentence summary of the result set for the strategist. Mention the strongest signal for reaching the chosen target audience given the selected sectors and account types. Do not enumerate individual targets.`;

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

For each target below, return a 1-2 sentence insight explaining why this account is a strong fit for reaching the selected target audience and the campaign brief, given the chosen sectors and account types. Reference specific reach numbers when they're notable.

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
      { type: 'text', text: SYSTEM_CHAT_CONSTRAINTS },
      { type: 'text', text: contextBlock, cache_control: { type: 'ephemeral' } },
    ],
    messages: history.map((m) => ({ role: m.role, content: m.content })),
  });
  return textOf(resp);
}
