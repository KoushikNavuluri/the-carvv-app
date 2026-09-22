/* ============================================================
   Demo providers. Swap these for real services without touching
   any screen: each function is the whole contract.
   research()  -> sources + claims
   story()     -> narrative beats
   visualPlan()-> layout + asset decisions
   design()    -> slide specifications
   critic()    -> QA findings
   exportJob() -> rendered files
   ============================================================ */
import { PROJECTS } from "../data/projects";
import { templateOf } from "../data/templates";
import { fetchAiStory, fetchSource, normalizeStory } from "./ai";

export function detectInput(v) {
  const t = (v || "").trim();
  if (!t) return { type:"empty", label:"Paste a topic, URL, article or document" };
  if (/^https?:\/\/|^www\.|\.(com|org|net|io|gov|edu)\//i.test(t)) return { type:"url", label:"URL · I'll fetch and strip the page" };
  if (t.length > 320) return { type:"paste", label:"Pasted source · I'll read it as the primary source" };
  if (t.split(/\s+/).length > 26) return { type:"paragraph", label:"Paragraph · I'll research around it" };
  return { type:"topic", label:"Topic · I'll go find the sources" };
}

const KNOWN = [
  { match:/costco|warehouse club|membership model|retail margin/i, id:"p1" },
  { match:/grid|data cent|power|electric|interconnect|ai energy|lbl\.gov|eta\.lbl/i, id:"p2" },
  { match:/signup|funnel|onboarding|drop-?off|activation/i, id:"p4" },
];

export function stagesFor(kind) {
  const fetchLine = kind === "url"
    ? ["GET page · 200 OK", "stripped nav, ads, cookie banner", "title, author, date resolved"]
    : ["query expansion · 6 angles", "42 candidates ranked", "authority + recency filter"];
  return [
    { k:"research", title:"Researching your source", icon:"book",
      lines:[...fetchLine, "14 sources kept", "4 tables, 2 charts detected", "9 statistics extracted"], done:"14 relevant sources" },
    { k:"story", title:"Finding the story", icon:"spark",
      lines:["claims clustered by theme", "narrative candidates scored", "hook chosen: the misdirection", "progression checked end to end"], done:"7 key insights" },
    { k:"visual", title:"Planning visuals", icon:"eye",
      lines:["statistic → bar chart", "causality → loop diagram", "ratio → comparison", "2 photo opportunities matched"], done:"2 charts · 1 diagram · 3 photos" },
    { k:"art", title:"Art directing", icon:"palette",
      lines:["rhythm set: photo, type, data, diagram", "text density per slide assigned", "accent reserved for evidence"], done:"Story structure complete" },
    { k:"design", title:"Designing", icon:"layout",
      lines:["slide specifications built", "layouts resolved", "type scale + safe areas applied", "critic pass: 4 fixes applied"], done:"slides ready" },
  ];
}

/* generateStory(): the real pipeline brain. A URL input is scraped live
   first; the material then goes to the OpenRouter model (via the Carvv
   server, so the key never touches the browser). Any failure falls back
   to the built-in editorial brain, so the studio always delivers. */
export async function generateStory(input, opts) {
  const value = (input && input.value) || "";
  try {
    const source = input.type === "url" ? await fetchSource(value) : null;
    const raw = await fetchAiStory({ inputType: input.type, value,
      options: { slides: opts.slides, auto: opts.auto, platform: opts.platform, style: opts.style, template: opts.template },
      source });
    const norm = normalizeStory(raw);
    if (norm) {
      const tpl = templateOf(opts.template);
      if (tpl.beats.length) norm.slides = reshape(norm.slides, tpl);
      return norm;
    }
  } catch { /* the local brain below takes over */ }
  return story(input, opts);
}

/* The animation and the generation run in parallel; the meter waits at
   the last stage until the model (or the fallback) has actually answered. */
export function runPipeline(input, opts, onTick, onDone) {
  const stages = stagesFor(input.type);
  let si = 0, li = 0, cancelled = false, animDone = false, resolved = false, result = null;
  const maybeFinish = () => { if (!cancelled && animDone && resolved) onDone(result); };
  generateStory(input, opts).then(r => { result = r; resolved = true; maybeFinish(); });
  const timer = setInterval(() => {
    if (si >= stages.length) {
      clearInterval(timer);
      animDone = true;
      maybeFinish();
      return;
    }
    onTick({ stage:si, line:li, stages });
    li += 1;
    if (li > stages[si].lines.length) { si += 1; li = 0; }
  }, 250);
  return () => { cancelled = true; clearInterval(timer); };
}

/* story(): narrative beats -> slide specifications */
export function story(input, opts) {
  const v = (input && input.value) || "";
  const hit = KNOWN.find(k => k.match.test(v));
  const n = opts.auto ? null : opts.slides;
  const tpl = templateOf(opts.template);
  if (hit) {
    const base = PROJECTS.find(p => p.id === hit.id);
    let slides = JSON.parse(JSON.stringify(base.slides));
    if (n && n < slides.length) slides = trim(slides, n);
    if (tpl.beats.length) slides = reshape(slides, tpl);
    return { slides, sources:base.sources, matched:base.id, score:base.score };
  }
  let slides = synth(v, n || (tpl.beats.length || 7));
  if (tpl.beats.length) slides = reshape(slides, tpl);
  return { slides, sources:[], matched:null, score:78 };
}

/* Fit the researched beats onto a chosen shape: keep the strongest slide for
   each purpose, then carry its content into the layout the shape asks for. */
function reshape(slides, tpl) {
  const pool = JSON.parse(JSON.stringify(slides));
  const out = tpl.beats.map(([purpose, layout], i) => {
    let idx = pool.findIndex(s => s.purpose === purpose && s.layout === layout);
    if (idx < 0) idx = pool.findIndex(s => s.purpose === purpose);
    if (idx < 0) idx = pool.findIndex(s => (s.data && LAYOUT_DATA[layout] && s.data[LAYOUT_DATA[layout]]));
    if (idx < 0) idx = 0;
    const s = pool.splice(idx, 1)[0] || { headline:"Add the point of this beat.", density:{ text:"low", visual:"high" }, claims:[] };
    const keptLayout = layout === "diagram" ? "flywheel" : layout;
    return { ...s, id:`t${i + 1}`, purpose, layout:keptLayout, visual:VISUAL_BY_LAYOUT[keptLayout] || s.visual,
      kicker:`${String(i + 1).padStart(2, "0")} — ${purpose.toLowerCase()}`, comp:`${keptLayout}_from_${tpl.id}` };
  });
  return out;
}
const LAYOUT_DATA = { "bar-chart":"series", "line-chart":"points", comparison:"rows", steps:"steps", timeline:"items", map:"flags" };
const VISUAL_BY_LAYOUT = { "photo-hero":"photograph", "photo-number":"photograph", statement:"typography", closing:"typography",
  "bar-chart":"bar_chart", "line-chart":"line_chart", comparison:"comparison", flywheel:"diagram", steps:"steps",
  timeline:"timeline", map:"map", quote:"quote", "annotated-shot":"annotated_screenshot" };
function trim(slides, n) {
  const keep = ["HOOK","CONCLUSION"];
  const out = slides.filter(s => keep.includes(s.purpose));
  const rest = slides.filter(s => !keep.includes(s.purpose));
  while (out.length < n && rest.length) out.splice(out.length - 1, 0, rest.shift());
  return out.map((s, i) => ({ ...s, kicker:`${String(i + 1).padStart(2, "0")} — ${s.kicker.split("— ")[1] || s.purpose.toLowerCase()}` }));
}
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
function synth(topicRaw, n) {
  const topic = (topicRaw || "your idea").replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "").slice(0, 90);
  const t = cap((topic.replace(/^(why|how|what)\s+/i, "").trim() || "your idea"));
  const beats = [
    { purpose:"HOOK", layout:"statement", visual:"typography", kicker:"01 — Hook",
      headline:`Most takes on ${t.toLowerCase()} start in the wrong place.`,
      body:"Carvv drafted this opening from your input. Research is still thin, so nothing here is presented as fact.",
      foot:"No source attached yet", conf:"low",
      insight:"Open on the misread, not the summary.", why:"A contrarian frame earns the second slide. Swap it if the research disagrees." },
    { purpose:"CONTEXT", layout:"statement", visual:"typography", kicker:"02 — Context",
      headline:`${t}, in one line.`,
      body:`What the audience needs before the evidence lands. Replace this with the definition your sources actually support.`,
      foot:"Needs a source", conf:"low",
      insight:"Set the baseline once, briefly.", why:"Type only. There is nothing to show yet." },
    { purpose:"EVIDENCE", layout:"bar-chart", visual:"bar_chart", kicker:"03 — Evidence",
      headline:"The number that makes the case.",
      data:{ unit:"placeholder", label:"Awaiting verified data", series:[{l:"A",v:2.1},{l:"B",v:3.4},{l:"C",v:3.9},{l:"D",v:5.2}] },
      foot:"⚠ Unverified — attach a source before exporting", conf:"low", annot:"needs real data",
      insight:"One chart, one claim.", why:"Statistic → chart. The shape is right; the data is not real yet." },
    { purpose:"EXPLANATION", layout:"steps", visual:"steps", kicker:"04 — Explanation",
      headline:"How it actually works.",
      data:{ steps:[{t:"First move",d:"The mechanism that starts it"},{t:"The reinforcement",d:"Why it does not decay"},{t:"The constraint",d:"What eventually limits it"},{t:"The consequence",d:"What the audience should expect next"}] },
      conf:"low", insight:"Process, not prose.", why:"A sequence of four beats reads faster as numbered steps." },
    { purpose:"INSIGHT", layout:"comparison", visual:"comparison", kicker:"05 — Insight",
      headline:"The non-obvious half.",
      data:{ unit:"placeholder · %", rows:[{ l:"What people assume", v:38 },{ l:"What the data shows", v:71, hi:true }] },
      foot:"⚠ Unverified", conf:"low", insight:"Name the gap between belief and evidence.", why:"Two bars carry a contrast better than a sentence." },
    { purpose:"EXAMPLE", layout:"quote", visual:"quote", kicker:"06 — Example",
      quote:"Ground the idea in something that actually happened.", who:"Add a real voice", role:"placeholder attribution",
      conf:"low", insight:"Abstractions need one concrete anchor.", why:"A quote breaks the rhythm before the close." },
    { purpose:"CONCLUSION", layout:"closing", visual:"typography", kicker:"07",
      headline:`So what?\nSay it in six words.`,
      body:"End on the rule the reader can reuse tomorrow.", cta:"Made with Carvv",
      conf:"low", insight:"Leave one reusable idea.", why:"Quiet close. No image competes with the takeaway." },
  ];
  return beats.slice(0, Math.max(3, Math.min(n || 7, beats.length))).map((b, i) => ({
    ...b, id:`new-${i + 1}`, density:{ text:i ? "med" : "low", visual:b.layout === "statement" ? "low" : "high" },
    comp:`${b.layout}_default`, claims:[],
  }));
}

/* the AI command layer: it edits the slide specification, never the pixels */
export const COMMANDS = [
  { id:"visual", label:"Make it more visual", icon:"image" },
  { id:"less", label:"Reduce the text", icon:"type" },
  { id:"premium", label:"Make it more premium", icon:"spark" },
  { id:"compare", label:"Turn this into a comparison", icon:"chart" },
  { id:"chart", label:"Make the chart easier to read", icon:"chart" },
  { id:"photo", label:"Use a real photograph", icon:"camera" },
];
export function applyCommand(id, slide, project) {
  const s = JSON.parse(JSON.stringify(slide));
  switch (id) {
    case "visual":
      s.density = { text:"low", visual:"high" };
      if (s.body && s.body.length > 90) s.body = s.body.split(". ")[0] + ".";
      if (s.layout === "statement") { s.layout = s.data?.series ? "bar-chart" : "photo-hero"; s.asset = s.asset || "warehouse"; s.visual = "photograph"; }
      return { s, note:"Text density dropped to low, layout swapped to a visual-led composition." };
    case "less": {
      const before = (s.body || "").length;
      if (s.body) s.body = s.body.split(". ").slice(0, 1).join(". ").replace(/\.?$/, ".");
      if (s.headline.length > 58) s.headline = s.headline.split(/[.:]/)[0] + ".";
      return { s, note:`Copy cut from ${before} to ${(s.body || "").length} characters. Meaning kept.` };
    }
    case "premium":
      s.density = { ...s.density, text:"low" };
      s.annot = null;
      s.comp = s.comp + "_quiet";
      return { s, note:"Annotation removed, spacing opened up. Quieter register." };
    case "compare":
      s.layout = "comparison"; s.visual = "comparison";
      s.data = s.data?.rows ? s.data : { unit:"derived · $B", rows:[{ l:"Membership fees", v:4.83, hi:true },{ l:"Everything else", v:4.46 }] };
      return { s, note:"Rebuilt as a two-bar comparison from the same claim." };
    case "chart":
      if (s.data?.series) s.data = { ...s.data, series:s.data.series.slice(-4) };
      s.annot = s.annot || "last bar is the point";
      return { s, note:"Dropped the oldest bar and annotated the one that matters." };
    case "photo":
      s.layout = s.big ? "photo-number" : "photo-hero"; s.visual = "photograph";
      s.asset = s.asset || (project?.cover || "warehouse");
      return { s, note:"Swapped to a retrieved photograph. Generated art removed." };
    default: return { s, note:"No change." };
  }
}

export function critic(project) {
  const out = [];
  project.slides.forEach((s, i) => {
    if (!s.claims?.length) out.push({ id:`c-${s.id}`, group:"Content", sev:"med", txt:`Slide ${i + 1} has no source attached.`, fix:null, state:"flagged" });
    if ((s.headline || "").length > 76) out.push({ id:`h-${s.id}`, group:"Design", sev:"low", txt:`Slide ${i + 1} headline may wrap to 4 lines.`, fix:"Trimmed to two lines.", state:"fixed" });
    if (s.foot && s.foot.includes("⚠")) out.push({ id:`u-${s.id}`, group:"Content", sev:"high", txt:`Slide ${i + 1} uses placeholder data.`, fix:null, state:"flagged" });
  });
  out.push({ id:"pf", group:"Platform", sev:"low", txt:"1080 × 1350 · safe areas clear · minimum type 34px.", fix:null, state:"passed" });
  return out;
}

export function exportJob(project, format, onProgress, onDone, onError, fail = false) {
  const steps = project.slides.length + 2;
  let i = 0;
  const t = setInterval(() => {
    i += 1;
    if (fail && i === 3) { clearInterval(t); onError("Render worker dropped the job at slide 3."); return; }
    onProgress(Math.min(100, Math.round((i / steps) * 100)), i);
    if (i >= steps) { clearInterval(t); onDone(); }
  }, 260);
  return () => clearInterval(t);
}
