/* ============================================================
   Carvv API server
   - GET  /api/scrape?url=...   fetch + strip a page (title, text, images)
   - POST /api/ai/story         story generation via OpenRouter
   - GET  /api/health           liveness + capability flags
   The OpenRouter key lives ONLY here, in server env. The browser
   never sees it. In production this server also serves the client
   build from /dist, so the whole app is one deployable unit.
   ============================================================ */
import express from "express";
import * as cheerio from "cheerio";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json({ limit: "1mb" }));

const PORT = Number(process.env.PORT || 8787);
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || "nvidia/nemotron-3-ultra-550b-a55b:free";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36 Carvv/1.0";

/* ---------------------------------------------------------- health */
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, ai: Boolean(OPENROUTER_API_KEY), model: OPENROUTER_MODEL, ts: Date.now() });
});

/* ---------------------------------------------------------- scraping
   Real-time page retrieval: fetches a URL with a browser-grade user
   agent, strips chrome (nav/ads/cookie banners/scripts), and returns
   structured content: title, byline, date, reading text and images. */
const PRIVATE_HOST = /^(localhost|127\.|0\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|\[|::1)/i;

app.get("/api/scrape", async (req, res) => {
  const raw = String(req.query.url || "").trim();
  if (!raw) return res.status(400).json({ error: "Missing url parameter." });
  let url;
  try {
    url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    if (!/^https?:$/.test(url.protocol)) throw new Error("bad protocol");
    if (PRIVATE_HOST.test(url.hostname)) throw new Error("private host");
  } catch {
    return res.status(400).json({ error: "That URL is not fetchable." });
  }

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 12000);
  try {
    const resp = await fetch(url.toString(), {
      signal: ctrl.signal,
      redirect: "follow",
      headers: { "User-Agent": UA, Accept: "text/html,application/xhtml+xml", "Accept-Language": "en-US,en;q=0.9" },
    });
    if (!resp.ok) return res.status(502).json({ error: `Source answered ${resp.status}.` });
    const type = resp.headers.get("content-type") || "";
    if (!type.includes("html")) return res.status(415).json({ error: "That URL is not a web page." });
    const html = (await resp.text()).slice(0, 2_000_000);

    const $ = cheerio.load(html);
    $("script,style,noscript,template,svg,iframe,nav,footer,form,aside,header,[role=banner],[role=navigation],[aria-modal=true]").remove();
    $("[class*=cookie],[id*=cookie],[class*=consent],[id*=consent],[class*=newsletter],[class*=paywall]").remove();

    const meta = (sel) => $(sel).attr("content") || "";
    const abs = (u) => { try { return u ? new URL(u, url).toString() : null; } catch { return null; } };
    const root = $("article").length ? $("article") : $("main").length ? $("main") : $("body");
    const text = root.text().replace(/\s+/g, " ").trim().slice(0, 9000);
    const images = [];
    const og = abs(meta('meta[property="og:image"]'));
    if (og) images.push(og);
    $("img[src]").each((_i, el) => {
      const u = abs($(el).attr("src"));
      const w = Number($(el).attr("width") || 0);
      if (u && images.length < 8 && !/logo|icon|sprite|avatar|pixel/i.test(u) && (w === 0 || w >= 240)) images.push(u);
    });

    res.json({
      url: url.toString(),
      title: meta('meta[property="og:title"]') || $("title").first().text().trim() || url.hostname,
      site: meta('meta[property="og:site_name"]') || url.hostname.replace(/^www\./, ""),
      byline: meta('meta[name="author"]') || meta('meta[property="article:author"]') || null,
      published: meta('meta[property="article:published_time"]') || null,
      description: meta('meta[property="og:description"]') || meta('meta[name="description"]') || null,
      text,
      words: text ? text.split(" ").length : 0,
      images: [...new Set(images)],
      fetchedAt: new Date().toISOString(),
    });
  } catch (err) {
    const aborted = err?.name === "AbortError";
    res.status(aborted ? 504 : 502).json({ error: aborted ? "The source took too long to answer." : "Could not fetch that page." });
  } finally {
    clearTimeout(timer);
  }
});

/* ---------------------------------------------------------- AI story
   The story architect. Sends the topic (or scraped source text) to the
   OpenRouter model and expects one strict JSON slide specification. */
const LAYOUTS = ["photo-hero", "photo-number", "statement", "bar-chart", "line-chart", "comparison", "flywheel", "steps", "timeline", "map", "quote", "annotated-shot", "closing"];
const PURPOSES = ["HOOK", "CONTEXT", "EVIDENCE", "EXPLANATION", "EXAMPLE", "INSIGHT", "CONCLUSION"];

const SYSTEM_PROMPT = `You are Carvv's story architect: an editor who turns source material into an Instagram/LinkedIn carousel specification.

Return ONLY a JSON object (no markdown, no commentary) with this exact shape:
{
  "title": string,                       // short project title, max 60 chars
  "score": number,                       // 0-100, how strong the story shape is
  "sources": [ { "publisher": string, "title": string, "confidence": "high"|"medium"|"low", "url": string|null } ],
  "slides": [ Slide ]
}

Slide = {
  "purpose": one of ${PURPOSES.join("|")},
  "layout": one of ${LAYOUTS.join("|")},
  "headline": string,                    // max 90 chars; may contain one "\\n". Required except for layout "quote".
  "body": string|null,                   // 1-2 short sentences, plain words
  "data": null | one of:
      {"unit": string, "label": string, "series": [{"l": string, "v": number}]}   // bar-chart (3-6 bars)
    | {"unit": string, "label": string, "points": [{"l": string, "v": number}]}   // line-chart (4-8 points)
    | {"unit": string, "rows": [{"l": string, "v": number, "hi": boolean?}]}      // comparison (exactly 2 rows)
    | {"steps": [{"t": string, "d": string}]}                                     // steps (3-5)
    | {"items": [{"t": string, "d": string}]}                                     // timeline (3-5)
    | {"flags": [{"t": string, "d": string}]}                                     // map (2-4)
  "quote": string|null, "who": string|null, "role": string|null,   // only for layout "quote"
  "big": string|null,                    // oversized number text, only for "photo-number" (e.g. "12.6%")
  "foot": string|null,                   // source receipt line, e.g. "SEC 10-K FY2024"
  "annot": string|null,                  // short hand-written style margin note, lowercase
  "insight": string,                     // one line: the editorial point of this slide
  "why": string,                         // one line: why this layout was chosen
  "conf": "high"|"medium"|"low"
}

Rules that matter:
- First slide is always purpose HOOK and a visual-led layout (photo-hero, photo-number or quote).
- Last slide is purpose CONCLUSION with layout "closing".
- Only emit chart layouts (bar-chart, line-chart, comparison) when the source text contains real numbers to plot. Never invent statistics.
- If numbers exist in the material, prefer showing them over describing them.
- Vary layouts: no two adjacent slides may share a layout.
- Kicker will be generated client-side; do not include one.`;

app.post("/api/ai/story", async (req, res) => {
  if (!OPENROUTER_API_KEY) return res.status(501).json({ error: "AI is not configured on this server." });
  const { inputType = "topic", value = "", options = {}, source = null } = req.body || {};
  if (!String(value).trim() && !source) return res.status(400).json({ error: "Nothing to work with." });

  const n = options.auto ? 7 : Math.max(3, Math.min(12, Number(options.slides) || 7));
  const userMsg = [
    `Input type: ${inputType}`,
    `Platform: ${options.platform || "instagram"}`,
    `Visual style: ${options.style || "editorial"}`,
    `Requested slide count: ${n} (finish with exactly ${n} slides)`,
    options.template && options.template !== "auto" ? `Narrative shape to follow: ${options.template}` : "Choose the narrative shape yourself.",
    "",
    "Material:",
    source?.text ? `SOURCE TITLE: ${source.title}\nSOURCE PUBLISHER: ${source.site}\nSOURCE TEXT:\n${source.text}` : String(value).slice(0, 6000),
  ].join("\n");

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 60000);
  try {
    const resp = await fetch(OPENROUTER_URL, {
      method: "POST",
      signal: ctrl.signal,
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": req.headers.origin || "http://localhost:5173",
        "X-Title": "Carvv",
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        temperature: 0.4,
        max_tokens: 4000,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, { role: "user", content: userMsg }],
      }),
    });
    if (!resp.ok) {
      const detail = (await resp.text()).slice(0, 300);
      return res.status(502).json({ error: `OpenRouter answered ${resp.status}.`, detail });
    }
    const data = await resp.json();
    const content = data?.choices?.[0]?.message?.content || "";
    const start = content.indexOf("{");
    const end = content.lastIndexOf("}");
    if (start < 0 || end <= start) return res.status(502).json({ error: "The model returned no JSON." });
    let parsed;
    try { parsed = JSON.parse(content.slice(start, end + 1)); }
    catch { return res.status(502).json({ error: "The model returned malformed JSON." }); }
    if (!Array.isArray(parsed.slides) || parsed.slides.length < 3) return res.status(502).json({ error: "The model returned too few slides." });
    res.json(parsed);
  } catch (err) {
    res.status(err?.name === "AbortError" ? 504 : 502).json({ error: err?.name === "AbortError" ? "The model took too long." : "Story generation failed." });
  } finally {
    clearTimeout(timer);
  }
});

/* ---------------------------------------------------------- static client (production) */
const dist = path.join(__dirname, "..", "dist");
if (process.env.NODE_ENV === "production" && fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get("*", (_req, res) => res.sendFile(path.join(dist, "index.html")));
}

app.listen(PORT, () => {
  console.log(`Carvv API on :${PORT} · ai=${OPENROUTER_API_KEY ? OPENROUTER_MODEL : "not configured"}`);
});
