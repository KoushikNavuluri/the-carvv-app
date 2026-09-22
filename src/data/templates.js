/* ============================================================
   Story blueprints. A template is a narrative shape plus a visual
   rhythm — it constrains what each beat is allowed to be, which is
   why it changes the output more than a colour ever could.
   ============================================================ */
export const TEMPLATES = [
  { id:"auto", name:"Let Carvv decide", kind:"Adaptive", blurb:"The story architect picks the shape from the material.",
    beats:[], best:"Anything. This is the default for a reason.", icon:"spark" },
  { id:"breakdown", name:"Business breakdown", kind:"Explainer", blurb:"Misdirection, rule, evidence, loop, proof, insight, close.",
    beats:[["HOOK","photo-hero"],["CONTEXT","statement"],["EVIDENCE","bar-chart"],["EXPLANATION","flywheel"],["EXAMPLE","photo-number"],["INSIGHT","comparison"],["CONCLUSION","closing"]],
    best:"Companies, pricing models, unit economics.", icon:"chart" },
  { id:"myth", name:"Myth vs fact", kind:"Corrective", blurb:"Name the belief, break it, replace it with evidence.",
    beats:[["HOOK","statement"],["CONTEXT","statement"],["EVIDENCE","comparison"],["EXPLANATION","steps"],["INSIGHT","bar-chart"],["CONCLUSION","closing"]],
    best:"Received wisdom, hot takes, industry folklore.", icon:"shield" },
  { id:"howitworks", name:"How it works", kind:"Mechanism", blurb:"A system pulled apart step by step, then reassembled.",
    beats:[["HOOK","photo-hero"],["CONTEXT","statement"],["EXPLANATION","steps"],["EVIDENCE","diagram"],["EXAMPLE","annotated-shot"],["CONCLUSION","closing"]],
    best:"Products, processes, technical concepts.", icon:"layers" },
  { id:"datastory", name:"Data story", kind:"Evidence-led", blurb:"One number, its slope, its geography, its consequence.",
    beats:[["HOOK","photo-hero"],["CONTEXT","statement"],["EVIDENCE","line-chart"],["EXPLANATION","map"],["INSIGHT","comparison"],["CONCLUSION","closing"]],
    best:"Trends, forecasts, anything with a table behind it.", icon:"chart" },
  { id:"timeline", name:"Timeline", kind:"Chronology", blurb:"Dates that changed the answer, in order.",
    beats:[["HOOK","statement"],["CONTEXT","timeline"],["EVIDENCE","line-chart"],["EXAMPLE","quote"],["CONCLUSION","closing"]],
    best:"Histories, product eras, regulatory shifts.", icon:"clock" },
  { id:"ranking", name:"Ranking", kind:"List", blurb:"A countdown that actually argues for its order.",
    beats:[["HOOK","statement"],["EVIDENCE","comparison"],["EVIDENCE","bar-chart"],["EXAMPLE","photo-number"],["INSIGHT","statement"],["CONCLUSION","closing"]],
    best:"Best-of lists, benchmarks, comparisons.", icon:"sort" },
  { id:"casestudy", name:"Case study", kind:"Narrative", blurb:"One situation, one decision, one measurable outcome.",
    beats:[["HOOK","annotated-shot"],["CONTEXT","statement"],["EXPLANATION","steps"],["EVIDENCE","comparison"],["EXAMPLE","quote"],["CONCLUSION","closing"]],
    best:"Teardowns, growth work, before-and-after.", icon:"target" },
  { id:"quotefirst", name:"Quote-led", kind:"Editorial", blurb:"A voice carries the story, the data corroborates it.",
    beats:[["HOOK","quote"],["CONTEXT","statement"],["EVIDENCE","bar-chart"],["EXAMPLE","photo-hero"],["CONCLUSION","closing"]],
    best:"Interviews, founder stories, opinion pieces.", icon:"quote" },
];
export const templateOf = id => TEMPLATES.find(t => t.id === id) || TEMPLATES[0];

/* Caption + alt text. Written from the slide specs, not bolted on. */
export function captionFor(p) {
  const hook = (p.slides[0]?.headline || p.title).replace("\n", " ");
  const insight = p.slides.find(s => s.purpose === "INSIGHT")?.headline || p.slides.at(-1)?.headline || "";
  const close = p.slides.at(-1);
  const body = p.slides.filter(s => ["CONTEXT", "EVIDENCE", "EXPLANATION"].includes(s.purpose))
    .slice(0, 3).map(s => "· " + (s.headline || "").replace("\n", " ")).join("\n");
  return {
    hook,
    body:`${body}\n\n${insight.replace("\n", " ")}`,
    cta:close?.cta || "Swipe through, then tell me where I'm wrong.",
    tags:tagsFor(p),
  };
}
function tagsFor(p) {
  const base = { instagram:["#visualstorytelling", "#carouselpost", "#designthinking"], linkedin:["#strategy", "#analysis", "#business"], square:["#design", "#story"] }[p.platform] || [];
  const topical = /costco|retail|margin/i.test(p.title) ? ["#retail", "#businessmodel", "#unitEconomics"]
    : /grid|power|energy|data cent/i.test(p.title) ? ["#energy", "#infrastructure", "#datacenters"]
    : /signup|funnel|product/i.test(p.title) ? ["#productdesign", "#growth", "#ux"]
    : ["#research", "#insight"];
  return [...topical, ...base];
}
export function altFor(s, i) {
  const kind = { photograph:"Photograph", bar_chart:"Bar chart", line_chart:"Line chart", diagram:"Diagram",
    comparison:"Two-bar comparison", map:"Dot map of the United States", annotated_screenshot:"Annotated screenshot",
    steps:"Numbered sequence", timeline:"Timeline", quote:"Pull quote", typography:"Text slide" }[s.visual] || "Slide";
  const head = (s.headline || s.quote || "").replace("\n", " ");
  const data = s.data?.series ? ` Values: ${s.data.series.map(d => `${d.l} ${d.v}`).join(", ")}.`
    : s.data?.rows ? ` ${s.data.rows.map(r => `${r.l} ${r.v}`).join(" versus ")}.`
    : s.data?.points ? ` From ${s.data.points[0].l} at ${s.data.points[0].v} to ${s.data.points.at(-1).l} at ${s.data.points.at(-1).v}.` : "";
  return `Slide ${i + 1} of the carousel. ${kind}. Headline: “${head}”.${data}`;
}

/* Scroll-stop score. Computed from the specs, so it moves when you edit. */
export function score(p) {
  const s = p.slides;
  if (!s.length) return null;
  const hookVisual = ["photo-hero", "photo-number", "annotated-shot", "quote"].includes(s[0].layout);
  const hookLen = (s[0].headline || s[0].quote || "").length;
  const hook = Math.min(100, (hookVisual ? 62 : 44) + (hookLen < 62 ? 30 : hookLen < 84 ? 18 : 6));
  const variety = Math.min(100, Math.round((new Set(s.map(x => x.layout)).size / s.length) * 118));
  const words = s.reduce((a, x) => a + ((x.headline || x.quote || "") + " " + (x.body || "")).split(/\s+/).filter(Boolean).length, 0) / s.length;
  const economy = Math.max(20, Math.min(100, Math.round(128 - words * 3.1)));
  const cited = s.filter(x => x.claims?.length).length / s.length;
  const evidence = Math.round(cited * 100);
  const total = Math.round(hook * 0.3 + variety * 0.25 + economy * 0.2 + evidence * 0.25);
  return { hook, variety, economy, evidence, total,
    note:hook < 60 ? "The hook is doing too little work. Make slide 1 visual."
      : variety < 55 ? "Too many slides share a layout. Vary the rhythm."
      : economy < 55 ? "Copy is heavy. Cut a sentence per slide."
      : evidence < 60 ? "Attach sources to the unsourced slides."
      : "Strong shape. This one is ready to publish." };
}
