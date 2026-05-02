# Compass — V2 roadmap

## Sports-specific targeting

**Observed in V1 demo (NCAA / NIL brief):** with `sector: "all"` + `successMetric: "visibility"`, the sector-interleave correctly returns 5 news + 5 culture in the top 10, but the *culture* slots fill with mainstream entertainment (Jimmy Fallon, Ellen, Tonight Show) rather than the sports voices the brief explicitly asked for (Pat McAfee, LeBron James, ESPN).

**Why:** sports figures sit lower on `panelReach` than late-night entertainers in the BPI dataset (Pat McAfee 1.2%, LeBron 5.5%, ESPN 7.2% vs. Fallon 15.4%, Ellen 12.4%). The interleave guarantees sector breadth but not sub-vertical breadth within culture. The current `successMetric` formulas reward elite-skewed reach (`panel - genpop`) or raw panel reach — neither favors sports-specific signal.

**Three options worth prototyping:**

1. **Sports sub-pill in the Culture & lifestyle pill row.** Already a UX slot; just needs a ranking bias when selected (already wired via `matchesSubSector`). Cheapest path — a strategist who wants sports voices selects the pill explicitly.
2. **Brief-aware re-rank.** Run a Claude pass over the top ~50 candidates with the campaign brief in scope and let the model promote targets whose context matches the brief (e.g., NIL → boost athletes, athlete-adjacent podcasts). Higher latency, but produces brief-relevant ordering without metric tuning.
3. **Alternative metric: "cultural relevance".** A new `successMetric` option that uses a different formula better suited to non-news targets — e.g., `genPopReach` weighted by sub-sector match, or panel-reach within a sub-category percentile.

**Recommendation:** start with (1) since the UX is already there; revisit (2) once Claude prompt-cache hit-rates are measured in production.

## Other deferred items

- **Streaming `/api/search` response.** Currently summary + page insights are awaited serially before responding (~12-16s). Streaming the page targets first, then the summary, would cut perceived latency.
- **Trust formula vs. partisan balance.** The Walmart demo showed WSJ ranked #5 instead of #1 even though it has the most bipartisan numbers (14.2% Dem / 12.5% Rep). The trust formula `panel - genpop` rewards elite-skew, not balance. Per-card insights surface the nuance, but if balance becomes a first-class signal, formula needs revision.
- **Saved searches** currently store one page of results. Loading a saved search after pagination would require refetch from filters; acceptable for V1 but worth normalizing.
