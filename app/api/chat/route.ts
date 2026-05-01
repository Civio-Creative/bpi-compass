import { NextRequest, NextResponse } from 'next/server';
import type { SearchFilters, ChatMessage } from '@/lib/types';
import { filterAndRank } from '@/lib/ranking';
import { chatFollowUp } from '@/lib/anthropic';

export async function POST(req: NextRequest) {
  try {
    const body: { filters: SearchFilters; history: ChatMessage[] } = await req.json();
    const { filters, history } = body;
    if (!history?.length) {
      return NextResponse.json({ error: 'history required' }, { status: 400 });
    }
    const ranked = filterAndRank(filters).slice(0, 25);
    const reply = await chatFollowUp(filters, ranked, history);
    const message: ChatMessage = {
      id: `${Date.now()}-a`,
      role: 'assistant',
      content: reply,
    };
    return NextResponse.json({ message });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
