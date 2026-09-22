/* ============================================================
   AI + scraping client. Talks to the Carvv API server, never to
   OpenRouter directly: the key stays server-side. Every function
   fails soft (null) so the studio can fall back to its built-in
   demo pipeline with zero visual difference.
   ============================================================ */

const BASE = (import.meta.env.VITE_API_BASE || "").replace(/\/$/, "");

async function req(path, opts = {}, timeoutMs = 30000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetch(BASE + path, { signal: ctrl.signal, ...opts });
    if (!r.ok) return null;
    return await r.json();
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

/* Real-time page fetch + strip, via the server scraper. */
export function fetchSource(url) {
  return req(`/api/scrape?url=${encodeURIComponent(url)}`, {}, 15000);
}

/* Story generation through the OpenRouter model, via the server. */
export function fetchAiStory({ inputType, value, options, source }) {
  return req("/api/ai/story", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ inputType, value, options, source }),
  }, 65000);
}

/* ---- normalize the model's output into Carvv's slide spec ---- */
const LAYOUTS = new Set(["photo-hero", "photo-number", "statement", "bar-chart", "line-chart", "comparison", "flywheel", "steps", "timeline", "map", "quote", "annotated-shot", "closing"]);
const VISUAL_BY_LAYOUT = { "photo-hero": "photograph", "photo-number": "photograph", statement: "typography", closing: "typography",
  "bar-chart": "bar_chart", "line-chart": "line_chart", comparison: "comparison", flywheel: "diagram", steps: "steps",
  timeline: "timeline", map: "map", quote: "quote", "annotated-shot": "annotated_screenshot" };
const PURPOSES = new Set(["HOOK", "CONTEXT", "EVIDENCE", "EXPLANATION", "EXAMPLE", "INSIGHT", "CONCLUSION"]);
const DATA_LAYOUT = { "bar-chart": "series", "line-chart": "points", comparison: "rows", steps: "steps", timeline: "items", map: "flags" };

export function normalizeStory(raw) {
  if (!raw || !Array.isArray(raw.slides) || raw.slides.length < 3) return null;
  const slides = raw.slides.slice(0, 12).map((s, i) => {
    let layout = LAYOUTS.has(s.layout) ? s.layout : "statement";
    const need = DATA_LAYOUT[layout];
    if (need && !s.data?.[need]) layout = "statement";            // no invented charts
    if (layout === "quote" && !s.quote) layout = "statement";
    const purpose = PURPOSES.has(s.purpose) ? s.purpose : i === 0 ? "HOOK" : i === raw.slides.length - 1 ? "CONCLUSION" : "EVIDENCE";
    return {
      id: `ai-${i + 1}`,
      purpose: i === 0 ? "HOOK" : purpose,
      layout,
      visual: VISUAL_BY_LAYOUT[layout],
      kicker: `${String(i + 1).padStart(2, "0")} — ${(i === 0 ? "HOOK" : purpose).toLowerCase()}`,
      headline: typeof s.headline === "string" ? s.headline.slice(0, 110) : null,
      body: typeof s.body === "string" ? s.body : null,
      data: s.data || null,
      quote: layout === "quote" ? String(s.quote || "") : null,
      who: s.who || null, role: s.role || null,
      big: layout === "photo-number" ? String(s.big || "") : null,
      foot: s.foot || null, annot: s.annot || null,
      insight: String(s.insight || "The editorial point of this beat."),
      why: String(s.why || "Chosen by the story architect."),
      claims: Array.isArray(s.claims) ? s.claims : [],
      conf: ["high", "medium", "low"].includes(s.conf) ? s.conf : "medium",
      density: { text: layout === "statement" || layout === "closing" ? "low" : "med", visual: layout === "statement" ? "low" : "high" },
      comp: `${layout}_ai`,
    };
  });
  slides[0].purpose = "HOOK";
  const last = slides[slides.length - 1];
  last.purpose = "CONCLUSION";
  if (last.layout !== "closing" && !last.quote) { last.layout = "closing"; last.visual = "typography"; last.comp = "closing_ai"; last.data = null; }
  const sources = Array.isArray(raw.sources) ? raw.sources.slice(0, 14).map((s, i) => ({
    id: `ai-src-${i + 1}`, publisher: String(s.publisher || "Source"), title: String(s.title || "").slice(0, 140),
    confidence: ["high", "medium", "low"].includes(s.confidence) ? s.confidence : "medium",
    url: s.url || null, got: "Fetched just now",
  })) : [];
  const score = Number.isFinite(raw.score) ? Math.max(0, Math.min(100, Math.round(raw.score))) : 76;
  return { slides, sources, matched: null, score, title: typeof raw.title === "string" ? raw.title.slice(0, 60) : null, ai: true };
}
