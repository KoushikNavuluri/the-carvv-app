import React, { useEffect, useMemo, useRef, useState } from "react";
import { C, STYLES, PLATFORMS, styleOf, platformOf, VISUAL_TYPES } from "../lib/tokens";
import { Icon, Mark, Wordmark } from "../lib/icons";
import { Btn, IconBtn, Body, H, Eyebrow, Chip, Seg, Sheet, Dialog, Rule, Note, Tag, TerminalCard, Meter,
  Stepper, Switch, Card, Row, EmptyState, Skel, Squiggle, Spinner } from "../lib/ui";
import { useApp } from "../lib/store";
import { Slide, LAYOUT_LIST } from "../slides/SlideRenderer";
import { detectInput, runPipeline, stagesFor, critic } from "../services/pipeline";
import { TEMPLATES, templateOf } from "../data/templates";
import { SOURCES } from "../data/projects";

export function Header({ title, sub, back, right, left, onBack }) {
  const { back:goBack } = useApp();
  return (
    <div style={{ padding:"2px 12px 8px", display:"flex", alignItems:"center", gap:4, flex:"0 0 auto", minHeight:44 }}>
      {back && <IconBtn n="chevL" label="Back" onClick={onBack || goBack}/>}
      {left}
      <div style={{ flex:1, minWidth:0, paddingLeft:back ? 0 : 6 }}>
        {title && <div className="disp" style={{ fontSize:17, fontWeight:600, letterSpacing:"-0.01em", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{title}</div>}
        {sub && <div className="mono" style={{ fontSize:12, color:C.body, letterSpacing:".04em", textTransform:"uppercase", marginTop:1 }}>{sub}</div>}
      </div>
      {right}
    </div>
  );
}

const SUGGEST = [
  "Why Costco's business model works",
  "https://eta.lbl.gov/publications/2024-united-states-data-center",
  "What actually killed the smart speaker",
  "The economics of a coffee shop",
];

export function Create() {
  const { draft, setDraft, go, projects, user, brand, toast } = useApp();
  const [focus, setFocus] = useState(false);
  const [sheet, setSheet] = useState(null);
  const ta = useRef(null);
  const det = detectInput(draft.input);
  const st = styleOf(draft.style), pf = platformOf(draft.platform);
  const recents = projects.filter(p => p.slides.length).slice(0, 4);
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Morning" : hour < 17 ? "Afternoon" : "Evening";

  const start = () => {
    if (!draft.input.trim()) { ta.current?.focus(); toast("Give me something to work with", "pencil"); return; }
    go("generating");
  };

  return (
    <>
      <Header
        left={<div style={{ display:"flex", alignItems:"center", gap:7, paddingLeft:6 }}><Mark s={23}/><Wordmark s={18}/></div>}
        right={<div style={{ display:"flex" }}>
          <IconBtn n="cmd" label="Command palette" onClick={() => go("palette")}/>
          <IconBtn n="bell" label="Notifications" onClick={() => go("notifications")}/>
        </div>}
      />
      <div className="noscroll" style={{ flex:1, overflowY:"auto", padding:"0 18px 26px" }}>
        <Eyebrow>{greet}, {(user?.name || "there").split(" ")[0]}</Eyebrow>
        <H s={29} w={600} style={{ margin:"8px 0 14px", letterSpacing:"-0.03em" }}>Create something visual.</H>

        {/* the carve pill: pill when empty, editorial card once you start */}
        <div style={{ background:focus || draft.input ? C.canvas : C.soft,
          border:`1px solid ${focus ? C.ink : draft.input ? C.hair : "transparent"}`,
          borderRadius:focus || draft.input ? 12 : 9999, padding:focus || draft.input ? "14px 16px" : "0 18px",
          minHeight:48, display:"flex", alignItems:focus || draft.input ? "flex-start" : "center", gap:10,
          transition:"border-radius .2s cubic-bezier(.2,.8,.2,1), padding .2s ease, background .2s ease" }}>
          <Icon n={det.type === "url" ? "link" : "pencil"} s={16} c={C.mute} style={{ marginTop:focus || draft.input ? 3 : 0, flex:"0 0 auto" }}/>
          <textarea ref={ta} rows={focus || draft.input ? 3 : 1} value={draft.input}
            onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
            onChange={e => setDraft({ ...draft, input:e.target.value })}
            placeholder={focus || draft.input ? "Paste a topic, URL, article or document…" : "Paste a topic, URL or file…"}
            className={draft.input ? "" : "mono"}
            style={{ resize:"none", fontSize:draft.input ? 15 : 13.5, lineHeight:1.45, paddingTop:focus || draft.input ? 1 : 0, background:"none" }}/>
          {draft.input && <button aria-label="Clear" className="focusable" onClick={() => setDraft({ ...draft, input:"" })} style={{ marginTop:2 }}><Icon n="x" s={15} c={C.mute}/></button>}
        </div>
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:8, margin:"10px 2px 0", minHeight:26 }}>
          {draft.input ? <Note w={230}>{det.label.replace(/^[^·]+· /, "")}</Note>
            : <div style={{ display:"flex", gap:6, overflowX:"auto" }} className="noscroll">
                <Chip icon="file" s="sm" onClick={() => setSheet("file")}>Attach</Chip>
                <Chip icon="spark" s="sm" onClick={() => setDraft({ ...draft, input:SUGGEST[0] })}>Try the demo</Chip>
              </div>}
        </div>

        {draft.file && <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:10, padding:"8px 12px", background:C.soft, borderRadius:9999 }}>
          <Icon n="file" s={15} c={C.charcoal}/><span style={{ fontSize:13, flex:1 }}>{draft.file}</span>
          <button className="focusable" aria-label="Remove file" onClick={() => setDraft({ ...draft, file:null })}><Icon n="x" s={14} c={C.mute}/></button>
        </div>}

        <div style={{ marginTop:18, border:`1px solid ${C.hair}`, borderRadius:12, padding:"2px 14px" }}>
          <div style={{ display:"flex", alignItems:"center", padding:"11px 0", borderBottom:`1px solid ${C.hair}` }}>
            <span style={{ flex:1, fontSize:14.5 }}>Slides</span>
            <Stepper value={draft.slides} auto={draft.auto} onAuto={() => setDraft({ ...draft, auto:!draft.auto })}
              onChange={v => setDraft({ ...draft, slides:v, auto:false })} max={pf.max}/>
          </div>
          <button className="focusable tapf" onClick={() => setSheet("template")} style={{ width:"100%", display:"flex", alignItems:"center", padding:"12px 0", borderBottom:`1px solid ${C.hair}` }}>
            <span style={{ flex:1, fontSize:14.5, textAlign:"left" }}>Shape</span>
            <span style={{ fontSize:14, color:C.body, marginRight:6 }}>{templateOf(draft.template).name}</span>
            <Icon n="chevR" s={15} c={C.mute}/>
          </button>
          <button className="focusable tapf" onClick={() => setSheet("platform")} style={{ width:"100%", display:"flex", alignItems:"center", padding:"12px 0", borderBottom:`1px solid ${C.hair}` }}>
            <span style={{ flex:1, fontSize:14.5, textAlign:"left" }}>Platform</span>
            <span style={{ fontSize:14, color:C.body, marginRight:6 }}>{pf.name} · {pf.ratio}</span>
            <Icon n="chevR" s={15} c={C.mute}/>
          </button>
          <button className="focusable tapf" onClick={() => setSheet("style")} style={{ width:"100%", display:"flex", alignItems:"center", padding:"12px 0" }}>
            <span style={{ flex:1, fontSize:14.5, textAlign:"left" }}>Style</span>
            <span style={{ display:"flex", gap:3, marginRight:8 }}>
              {[st.paper, st.ink, st.accent].map((c, i) => <span key={i} style={{ width:12, height:12, borderRadius:9999, background:c, border:`1px solid ${C.hair}` }}/>)}
            </span>
            <span style={{ fontSize:14, color:C.body, marginRight:6 }}>{st.name}</span>
            <Icon n="chevR" s={15} c={C.mute}/>
          </button>
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:10, marginTop:12, padding:"0 2px" }}>
          <Icon n="target" s={15} c={C.charcoal}/>
          <span style={{ flex:1, fontSize:13.5, color:C.charcoal }}>Brand DNA · {brand.name}</span>
          <Switch on={brand.active} label="Use brand DNA" onChange={() => { toast(brand.active ? "Brand DNA off for this run" : "Brand DNA on", "target"); }}/>
        </div>

        <div style={{ marginTop:18 }}>
          <Btn full size="lg" onClick={start} icon="spark">Create Story</Btn>
        </div>

        <div className="noscroll" style={{ display:"flex", gap:6, overflowX:"auto", marginTop:14, paddingBottom:2 }}>
          {SUGGEST.map(s => <Chip key={s} s="sm" onClick={() => setDraft({ ...draft, input:s })}>
            {s.length > 34 ? s.slice(0, 32).replace(/^https?:\/\//, "") + "…" : s}
          </Chip>)}
        </div>

        <div style={{ marginTop:28 }}>
          <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", marginBottom:10 }}>
            <Eyebrow>Pick up where you left off</Eyebrow>
            <button className="focusable" onClick={() => go("examples")} style={{ fontSize:12.5, color:C.ink, textDecoration:"underline" }}>Examples</button>
          </div>
          <div className="noscroll" style={{ display:"flex", gap:10, overflowX:"auto", paddingBottom:4 }}>
            {recents.map(p => (
              <button key={p.id} className="tapf focusable" onClick={() => go("project", { id:p.id })} style={{ width:116, flex:"0 0 auto", textAlign:"left" }}>
                <Slide slide={p.slides[0]} styleId={p.style} platformId={p.platform} w={116} radius={8}/>
                <div style={{ fontSize:12.5, fontWeight:450, marginTop:7, lineHeight:1.3, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{p.title}</div>
                <div className="mono" style={{ fontSize:12, color:C.body, marginTop:3 }}>{p.slides.length} SLIDES · {p.updated.toUpperCase()}</div>
              </button>
            ))}
          </div>
        </div>

        <Rule style={{ margin:"24px 0 12px" }}/>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <span className="mono" style={{ fontSize:12, color:C.body, letterSpacing:".04em" }}>3 OF 3 FREE CAROUSELS LEFT</span>
          <button className="focusable" onClick={() => go("plan")} style={{ fontSize:12.5, textDecoration:"underline" }}>See plans</button>
        </div>
      </div>

      <Sheet open={sheet === "template"} onClose={() => setSheet(null)} title="Story shape" height="76%">
        <div style={{ paddingBottom:16 }}>
          {TEMPLATES.map(t => (
            <button key={t.id} className="focusable tapf" onClick={() => { setDraft({ ...draft, template:t.id }); setSheet(null); }}
              style={{ width:"100%", display:"flex", gap:11, alignItems:"center", padding:"12px 0", borderBottom:`1px solid ${C.hair}`, textAlign:"left" }}>
              <span style={{ width:30, height:30, borderRadius:9999, background:C.soft, display:"grid", placeItems:"center", flex:"0 0 auto" }}>
                <Icon n={t.icon} s={15} c={C.charcoal}/></span>
              <span style={{ flex:1, minWidth:0 }}>
                <span style={{ display:"block", fontSize:14.5 }}>{t.name}</span>
                <span style={{ display:"block", fontSize:12.5, color:C.body, marginTop:2, lineHeight:1.35 }}>{t.blurb}</span>
              </span>
              {draft.template === t.id && <Icon n="check" s={16}/>}
            </button>
          ))}
          <Note style={{ marginTop:12 }} w={250}>a shape is a narrative constraint, not a template file</Note>
        </div>
      </Sheet>

      <Sheet open={sheet === "platform"} onClose={() => setSheet(null)} title="Platform">
        {PLATFORMS.map(p => (
          <button key={p.id} className="focusable tapf" onClick={() => { setDraft({ ...draft, platform:p.id }); setSheet(null); }}
            style={{ width:"100%", display:"flex", gap:12, alignItems:"center", padding:"14px 0", borderBottom:`1px solid ${C.hair}`, textAlign:"left" }}>
            <span style={{ width:34, height:42, borderRadius:4, border:`1px solid ${C.hair2}`, display:"grid", placeItems:"center" }}>
              <span className="mono" style={{ fontSize:12, color:C.body }}>{p.ratio}</span></span>
            <span style={{ flex:1 }}>
              <span style={{ display:"block", fontSize:15, fontWeight:450 }}>{p.name}</span>
              <span style={{ display:"block", fontSize:13, color:C.body, marginTop:2 }}>{p.note}</span>
            </span>
            {draft.platform === p.id && <Icon n="check" s={17}/>}
          </button>
        ))}
        <Note style={{ margin:"14px 0 18px" }}>same story, recomposed — not just resized</Note>
      </Sheet>

      <Sheet open={sheet === "style"} onClose={() => setSheet(null)} title="Visual direction" height="80%">
        <div style={{ display:"grid", gap:10, paddingBottom:18 }}>
          {STYLES.map(s => (
            <button key={s.id} className="focusable tapf" onClick={() => { setDraft({ ...draft, style:s.id }); setSheet(null); }}
              style={{ display:"flex", gap:12, alignItems:"center", padding:10, borderRadius:12,
                border:`1px solid ${draft.style === s.id ? C.ink : C.hair}`, textAlign:"left" }}>
              <Slide slide={SAMPLE} styleId={s.id} w={62} radius={6}/>
              <span style={{ flex:1, minWidth:0 }}>
                <span className="disp" style={{ display:"block", fontSize:15, fontWeight:600 }}>{s.name}</span>
                <span style={{ display:"block", fontSize:12.5, color:C.body, marginTop:2 }}>{s.blurb}</span>
                <span className="mono" style={{ display:"block", fontSize:12, color:C.body, marginTop:5 }}>{s.traits.join(" · ").toUpperCase()}</span>
              </span>
              {draft.style === s.id && <Icon n="check" s={17}/>}
            </button>
          ))}
        </div>
      </Sheet>

      <Sheet open={sheet === "file"} onClose={() => setSheet(null)} title="Add a source">
        <div style={{ border:`1px dashed ${C.hair2}`, borderRadius:12, padding:"26px 16px", textAlign:"center" }}>
          <Icon n="file" s={22} c={C.mute}/>
          <div style={{ fontSize:14, marginTop:8 }}>Drop a PDF, doc or CSV here</div>
          <div className="mono" style={{ fontSize:12, color:C.body, marginTop:4 }}>MAX 25 MB · TEXT IS EXTRACTED LOCALLY</div>
        </div>
        <div style={{ marginTop:14 }}>
          <Eyebrow style={{ marginBottom:6 }}>Recent files</Eyebrow>
          {["funnel-export-sep.csv", "q4-membership-deck.pdf", "grid-queue-2024.pdf"].map(f => (
            <Row key={f} title={f} icon="file" sub={f.endsWith("csv") ? "CSV · 412 rows" : "PDF · 24 pages"}
              onClick={() => { setDraft({ ...draft, file:f }); setSheet(null); }} right={<Icon n="plus" s={16} c={C.mute}/>}/>
          ))}
        </div>
        <div style={{ height:16 }}/>
      </Sheet>
    </>
  );
}
const SAMPLE = { id:"sample", purpose:"EVIDENCE", layout:"bar-chart", kicker:"03 — Evidence", headline:"The number that carries it.",
  data:{ unit:"$B", label:"Fee revenue", series:[{ l:"20", v:3.5 },{ l:"21", v:3.9 },{ l:"22", v:4.2 },{ l:"23", v:4.6 },{ l:"24", v:4.8 }] },
  foot:"Source attached", density:{ text:"low", visual:"high" }, annot:"the point" };

/* ---------------------------------------------------------- generating */
export function Generating() {
  const { draft, back, replace, addProject, toast, projects } = useApp();
  const det = { ...detectInput(draft.input), value:draft.input };
  const [tick, setTick] = useState({ stage:0, line:0, stages:stagesFor(det.type) });
  const [result, setResult] = useState(null);
  const [ask, setAsk] = useState(false);
  const logRef = useRef(null);
  useEffect(() => {
    const stop = runPipeline(det, draft, setTick, r => setResult(r));
    return stop;
  }, []);
  useEffect(() => { logRef.current?.scrollTo({ top:9e6, behavior:"smooth" }); }, [tick]);
  useEffect(() => {
    if (!result) return;
    const id = "np" + Date.now().toString(36).slice(-4);
    const p = { id, title:titleFor(draft.input), input:{ type:det.type, value:draft.input }, platform:draft.platform,
      style:draft.style, template:draft.template, status:"storyboard", cover:result.slides[0]?.asset || null, slides:result.slides,
      deco:{ grain:false, numbers:false, mark:true, radius:1 },
      sources:result.sources, created:"Just now", updated:"just now", score:result.score,
      versions:[{ v:"v1", when:"just now", what:`First generation · ${result.slides.length} slides` }], exports:[], fresh:!result.matched };
    addProject(p);
    const t = setTimeout(() => replace("storyboard", { id }), 600);
    return () => clearTimeout(t);
  }, [result]);

  const total = tick.stages.reduce((a, s) => a + s.lines.length + 1, 0);
  const done = tick.stages.slice(0, tick.stage).reduce((a, s) => a + s.lines.length + 1, 0) + tick.line;
  const pct = result ? 100 : Math.min(98, Math.round((done / total) * 100));

  return (
    <>
      <Header title="Generating" sub={`${det.type} input · ${platformOf(draft.platform).name}`}
        right={<IconBtn n="x" label="Cancel" onClick={() => setAsk(true)}/>}/>
      <div className="noscroll" style={{ flex:1, overflowY:"auto", padding:"4px 18px 20px" }}>
        <div style={{ fontSize:15, lineHeight:1.4, color:C.charcoal, marginBottom:4 }}>
          <span className="hand" style={{ fontSize:20, color:C.ink }}>“{shorten(draft.input, 64)}”</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10, margin:"14px 0 16px" }}>
          <Meter v={pct} c={C.ink}/>
          <span className="mono" style={{ fontSize:12, color:C.body, width:34, textAlign:"right" }}>{pct}%</span>
        </div>
        <TerminalCard title="carvv pipeline">
          <div ref={logRef} className="noscroll" style={{ maxHeight:288, overflowY:"auto" }}>
            {tick.stages.map((s, si) => {
              if (si > tick.stage) return null;
              const finished = si < tick.stage || !!result;
              return (
                <div key={s.k} style={{ marginBottom:12 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, color:C.ink }}>
                    {finished ? <Icon n="check" s={13} w={2.4}/> : <Spinner s={12}/>}
                    <span>{s.title}{finished ? "" : "…"}</span>
                  </div>
                  {s.lines.map((l, li) => {
                    if (si === tick.stage && li >= tick.line && !result) return null;
                    return <div key={l} className="anim-down" style={{ color:C.mute, paddingLeft:21 }}>· {l}</div>;
                  })}
                  {finished && <div style={{ paddingLeft:21, color:C.charcoal }}>✓ {s.k === "design" ? `${result ? result.slides.length : ""} ${s.done}` : s.done}</div>}
                </div>
              );
            })}
          </div>
        </TerminalCard>
        <div style={{ marginTop:18 }}>
          <Eyebrow style={{ marginBottom:8 }}>Coming through the press</Eyebrow>
          <div className="noscroll" style={{ display:"flex", gap:8, overflowX:"auto" }}>
            {(result ? result.slides : Array.from({ length:5 })).map((s, i) => s
              ? <div key={i} className="anim-pop" style={{ animationDelay:`${i * 70}ms` }}><Slide slide={s} styleId={draft.style} platformId={draft.platform} w={96} radius={6}/></div>
              : <Skel key={i} w={96} h={120} r={6} style={{ flex:"0 0 auto" }}/>)}
          </div>
        </div>
      </div>
      <div style={{ padding:"10px 18px calc(14px + env(safe-area-inset-bottom))", borderTop:`1px solid ${C.hair}` }}>
        <Btn full variant="secondary" onClick={() => setAsk(true)}>Cancel</Btn>
      </div>
      <Dialog open={ask} onClose={() => setAsk(false)} title="Stop generating?" destructive confirm="Stop"
        body="The research already done will be discarded." onConfirm={() => { back(); toast("Generation cancelled", "x"); }}/>
    </>
  );
}
const shorten = (s, n) => s.length > n ? s.slice(0, n).trim() + "…" : s;
function titleFor(v) {
  const t = v.replace(/^https?:\/\/(www\.)?/, "").split(/[/?#]/)[0];
  if (/costco/i.test(v)) return "Why Costco's business model works";
  if (/eta\.lbl|data cent|grid|power/i.test(v)) return "The AI power bottleneck";
  if (/signup|funnel/i.test(v)) return "One field, 41% of signups";
  return v.length > 46 ? v.slice(0, 44).trim() + "…" : (v[0].toUpperCase() + v.slice(1));
}

/* ---------------------------------------------------------- storyboard */
export function Storyboard({ id }) {
  const { project, commit, go, back, toast, setQa, reset } = useApp();
  const p = project(id);
  const [menu, setMenu] = useState(null);
  const [detail, setDetail] = useState(null);
  const [adding, setAdding] = useState(false);
  const [designing, setDesigning] = useState(false);
  const [drag, setDrag] = useState(null);
  const [del, setDel] = useState(null);
  if (!p) return <EmptyState title="Gone" body="That project no longer exists." action={<Btn onClick={back}>Back</Btn>}/>;
  const st = styleOf(p.style);

  const move = (i, d) => {
    const j = i + d; if (j < 0 || j >= p.slides.length) return;
    commit(p.id, x => { const s = [...x.slides]; [s[i], s[j]] = [s[j], s[i]]; return { ...x, slides:renumber(s) }; }, "Reordered slides");
  };
  const dup = i => commit(p.id, x => { const s = [...x.slides]; s.splice(i + 1, 0, { ...JSON.parse(JSON.stringify(s[i])), id:s[i].id + "-c" }); return { ...x, slides:renumber(s) }; }, "Duplicated slide");
  const rm = i => commit(p.id, x => ({ ...x, slides:renumber(x.slides.filter((_, k) => k !== i)) }), "Deleted slide");
  const add = layout => {
    const L = LAYOUT_LIST.find(l => l.id === layout);
    commit(p.id, x => ({ ...x, slides:renumber([...x.slides, {
      id:"s" + Date.now().toString(36).slice(-4), purpose:"EVIDENCE", layout, visual:L.visual,
      kicker:"new — evidence", headline:"New slide. Say something worth a slide.",
      body:layout === "statement" ? "Replace this with the point this slide exists to make." : null,
      data:defaultData(layout), density:{ text:"low", visual:"high" }, comp:layout + "_default",
      insight:"Not set yet.", why:"Added by hand, so no rationale from the art director.", claims:[], conf:"low" }]) }), "Added slide");
    setAdding(false); toast("Slide added", "plus");
  };

  const design = () => {
    setDesigning(true);
    setTimeout(() => {
      commit(p.id, x => ({ ...x, status:"ready" }), "Designed carousel");
      setQa(critic(p));
      setDesigning(false);
      go("viewer", { id:p.id });
    }, 1900);
  };

  return (
    <>
      <Header title="Storyboard" sub={`${p.slides.length} slides · ${platformOf(p.platform).name} · ${st.name}`} back
        right={<IconBtn n="dots" label="Project menu" onClick={() => setMenu({ kind:"project" })}/>}/>
      <div className="noscroll" style={{ flex:1, overflowY:"auto", padding:"0 18px 18px" }}>
        <div style={{ display:"flex", gap:8, marginBottom:14 }}>
          <button className="focusable tapf" onClick={() => go("research", { id:p.id })}
            style={{ flex:1, border:`1px solid ${C.hair}`, borderRadius:12, padding:"10px 12px", textAlign:"left" }}>
            <div className="mono" style={{ fontSize:12, color:C.body, letterSpacing:".06em" }}>RESEARCH</div>
            <div style={{ fontSize:14, marginTop:3 }}>{p.sources.length || 0} sources · {p.fresh ? "thin" : "strong"}</div>
          </button>
          <button className="focusable tapf" onClick={() => go("qa", { id:p.id })}
            style={{ flex:1, border:`1px solid ${C.hair}`, borderRadius:12, padding:"10px 12px", textAlign:"left" }}>
            <div className="mono" style={{ fontSize:12, color:C.body, letterSpacing:".06em" }}>CRITIC</div>
            <div style={{ fontSize:14, marginTop:3 }}>{p.fresh ? "Needs sources" : "4 fixed · 2 flagged"}</div>
          </button>
        </div>
        {p.fresh && <div style={{ display:"flex", gap:10, alignItems:"flex-start", background:"#FFF9EC", borderRadius:12, padding:"11px 13px", marginBottom:14 }}>
          <Icon n="alert" s={16} c="#8A5A00"/>
          <div style={{ fontSize:13, color:"#7A5200", lineHeight:1.4 }}>
            No verified sources matched this input, so the data slides use placeholders. Attach a source before exporting.
          </div>
        </div>}
        <Note style={{ marginBottom:10 }} w={250}>drag a row to reorder the story</Note>

        {p.slides.map((s, i) => (
          <div key={s.id} style={{ display:"flex", gap:10, alignItems:"center", padding:"10px 0",
            borderBottom:`1px solid ${C.hair}`, background:drag === i ? C.soft : "transparent",
            transform:drag === i ? "scale(1.01)" : "none", transition:"background .15s ease" }}>
            <button className="focusable" aria-label="Reorder" onPointerDown={() => setDrag(i)} onPointerUp={() => setDrag(null)}
              onPointerLeave={e => { if (drag === i) { const up = e.movementY < 0; setDrag(null); move(i, up ? -1 : 1); } }}
              style={{ padding:"4px 2px", touchAction:"none", cursor:"grab" }}>
              <Icon n="drag" s={16} c={C.mute} w={2.4}/>
            </button>
            <button className="focusable tapf" onClick={() => setDetail(i)} style={{ flex:1, display:"flex", gap:10, alignItems:"center", textAlign:"left", minWidth:0 }}>
              <Slide slide={s} styleId={p.style} platformId={p.platform} w={46} radius={4}/>
              <span style={{ flex:1, minWidth:0 }}>
                <span style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <span className="mono" style={{ fontSize:12, color:C.body }}>{String(i + 1).padStart(2, "0")}</span>
                  <Tag tone="soft">{s.purpose}</Tag>
                </span>
                <span style={{ fontSize:14, fontWeight:450, marginTop:4, lineHeight:1.3,
                  display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
                  {(s.headline || s.quote || "").replace("\n", " ")}</span>
                <span className="mono" style={{ display:"block", fontSize:12, color:C.body, marginTop:4 }}>
                  {(VISUAL_TYPES[s.visual] || "Visual").toUpperCase()}</span>
              </span>
            </button>
            <IconBtn n="dots" s={17} label={`Slide ${i + 1} menu`} tone="mute" onClick={() => setMenu({ kind:"slide", i })}/>
          </div>
        ))}

        <button className="focusable tapf" onClick={() => setAdding(true)}
          style={{ width:"100%", marginTop:14, border:`1px dashed ${C.hair2}`, borderRadius:12, padding:"14px 0",
            display:"flex", alignItems:"center", justifyContent:"center", gap:8, color:C.charcoal, fontSize:14 }}>
          <Icon n="plus" s={16}/> Add a slide
        </button>
      </div>
      <div style={{ padding:"10px 18px calc(14px + env(safe-area-inset-bottom))", borderTop:`1px solid ${C.hair}`, display:"flex", gap:8 }}>
        <Btn variant="secondary" onClick={() => go("editor", { id:p.id, index:0 })}>Edit</Btn>
        <Btn full size="md" onClick={design} icon="wand">Design carousel</Btn>
      </div>

      {designing && <div style={{ position:"absolute", inset:0, background:"rgba(255,255,255,.96)", zIndex:90, display:"grid", placeItems:"center" }}>
        <div style={{ display:"grid", justifyItems:"center", gap:16 }}>
          <div style={{ display:"flex", gap:6 }}>
            {p.slides.slice(0, 4).map((s, i) => <div key={s.id} className="anim-pop" style={{ animationDelay:`${i * 160}ms` }}>
              <Slide slide={s} styleId={p.style} platformId={p.platform} w={58} radius={5}/></div>)}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}><Spinner/><span style={{ fontSize:14 }}>Setting type, cropping assets…</span></div>
        </div>
      </div>}

      <Sheet open={menu?.kind === "slide"} onClose={() => setMenu(null)} title={`Slide ${(menu?.i ?? 0) + 1}`}>
        <div style={{ paddingBottom:12 }}>
          <Row icon="pencil" title="Edit on canvas" onClick={() => { go("editor", { id:p.id, index:menu.i }); setMenu(null); }}/>
          <Row icon="refresh" title="Regenerate this slide" sub="Same claim, new composition" onClick={() => {
            commit(p.id, x => { const s = [...x.slides]; const cur = s[menu.i];
              const opts = ["statement", "comparison", "bar-chart", "steps"].filter(l => l !== cur.layout);
              s[menu.i] = { ...cur, layout:cur.data?.series ? "bar-chart" : opts[0], comp:cur.comp + "_regen" }; return { ...x, slides:s }; }, "Regenerated slide");
            setMenu(null); toast("Slide regenerated", "refresh"); }}/>
          <Row icon="up" title="Move up" onClick={() => { move(menu.i, -1); setMenu(null); }}/>
          <Row icon="chevD" title="Move down" onClick={() => { move(menu.i, 1); setMenu(null); }}/>
          <Row icon="copy" title="Duplicate" onClick={() => { dup(menu.i); setMenu(null); toast("Duplicated", "copy"); }}/>
          <Row icon="trash" title="Delete slide" danger last onClick={() => { setDel(menu.i); setMenu(null); }}/>
        </div>
      </Sheet>
      <Sheet open={menu?.kind === "project"} onClose={() => setMenu(null)} title="Story">
        <div style={{ paddingBottom:12 }}>
          <Row icon="refresh" title="Regenerate the whole story" sub="Keeps your input, rebuilds the narrative" onClick={() => { setMenu(null); go("generating"); }}/>
          <Row icon="book" title="Research & evidence" onClick={() => { setMenu(null); go("research", { id:p.id }); }}/>
          <Row icon="shield" title="Run the critic" onClick={() => { setMenu(null); go("qa", { id:p.id }); }}/>
          <Row icon="eye" title="Preview as published" onClick={() => { setMenu(null); go("viewer", { id:p.id }); }}/>
          <Row icon="trash" title="Discard story" danger last onClick={() => { setMenu(null); setDel("all"); }}/>
        </div>
      </Sheet>
      <Sheet open={adding} onClose={() => setAdding(false)} title="What should this slide do?" height="72%">
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, paddingBottom:18 }}>
          {LAYOUT_LIST.map(l => (
            <button key={l.id} className="focusable tapf" onClick={() => add(l.id)}
              style={{ border:`1px solid ${C.hair}`, borderRadius:12, padding:8, textAlign:"left" }}>
              <div style={{ display:"grid", placeItems:"center", background:C.soft, borderRadius:6, height:64 }}>
                <MiniLayout id={l.id}/>
              </div>
              <div style={{ fontSize:13, fontWeight:450, marginTop:7 }}>{l.name}</div>
              <div className="mono" style={{ fontSize:12, color:C.body, marginTop:2 }}>{(VISUAL_TYPES[l.visual] || "").toUpperCase()}</div>
            </button>
          ))}
        </div>
      </Sheet>
      {detail !== null && <SlideSheet p={p} i={detail} onClose={() => setDetail(null)}/>}
      <Dialog open={del !== null} onClose={() => setDel(null)} destructive
        title={del === "all" ? "Discard this story?" : "Delete this slide?"}
        body={del === "all" ? "The storyboard, research and assets go with it." : "The narrative will be renumbered."}
        confirm="Delete" onConfirm={() => {
          if (del === "all") { reset("projects"); toast("Story discarded", "trash"); }
          else { rm(del); toast("Slide deleted", "trash"); }
          setDel(null);
        }}/>
    </>
  );
}
const renumber = s => s.map((x, i) => ({ ...x, kicker:`${String(i + 1).padStart(2, "0")} — ${(x.kicker || "").split("— ")[1] || x.purpose.toLowerCase()}` }));
function defaultData(layout) {
  if (layout === "bar-chart") return { unit:"placeholder", label:"Add your data", series:[{ l:"A", v:2 },{ l:"B", v:3 },{ l:"C", v:4.2 }] };
  if (layout === "line-chart") return { unit:"placeholder", label:"Add your data", points:[{ l:"2020", v:20 },{ l:"2023", v:48 }], proj:{ l:"2026", lo:60, hi:95 } };
  if (layout === "comparison") return { unit:"placeholder · %", rows:[{ l:"This", v:71, hi:true },{ l:"That", v:38 }] };
  if (layout === "flywheel") return { nodes:["Cause", "Effect", "Reinforcement", "Advantage"] };
  if (layout === "steps") return { steps:[{ t:"First", d:"What happens" },{ t:"Then", d:"What follows" },{ t:"Finally", d:"What it means" }] };
  if (layout === "timeline") return { items:[{ y:"2019", t:"The start" },{ y:"2023", t:"The turn" }] };
  if (layout === "map") return { flags:[{ n:"Region", x:8, y:8 }] };
  if (layout === "annotated-shot") return { title:"Your screen", field:"The field that fails", note:"circle the problem", rows:["First field", "The field that fails", "Last field"] };
  return undefined;
}
const MiniLayout = ({ id }) => {
  const b = (x, y, w, h, f = C.hair2) => <rect key={`${x}${y}${w}${h}`} x={x} y={y} width={w} height={h} rx="1.5" fill={f}/>;
  const m = {
    "photo-hero":[b(3, 3, 42, 34, "#d4d4d4"), b(7, 26, 26, 3, "#fff"), b(7, 31, 18, 3, "#fff")],
    "statement":[b(6, 10, 30, 6, "#000"), b(6, 20, 20, 2), b(6, 25, 24, 2)],
    "bar-chart":[b(7, 24, 5, 12), b(15, 18, 5, 18), b(23, 13, 5, 23), b(31, 8, 5, 28, "#000")],
    "line-chart":[b(6, 30, 34, 1.4), b(8, 26, 4, 4, "#000"), b(20, 18, 4, 4, "#000"), b(32, 10, 4, 4, "#000")],
    "comparison":[b(6, 12, 30, 6, "#000"), b(6, 24, 16, 6)],
    "flywheel":[<circle key="c" cx="24" cy="20" r="11" stroke="#d4d4d4" fill="none"/>, b(21, 6, 6, 3, "#000"), b(21, 31, 6, 3)],
    "photo-number":[b(3, 3, 42, 20, "#d4d4d4"), b(7, 26, 16, 10, "#000")],
    "annotated-shot":[b(6, 8, 36, 24, "#e5e5e5"), b(10, 18, 20, 5, "#000")],
    "steps":[b(6, 10, 28, 2), b(6, 18, 24, 2), b(6, 26, 30, 2), b(6, 34, 20, 2)],
    "timeline":[b(9, 6, 1.5, 28), b(14, 8, 16, 3, "#000"), b(14, 18, 12, 3), b(14, 28, 14, 3)],
    "map":[b(10, 10, 4, 4), b(18, 10, 4, 4), b(26, 10, 4, 4, "#000"), b(14, 18, 4, 4), b(22, 18, 4, 4)],
    "quote":[b(6, 8, 8, 8, "#000"), b(6, 20, 30, 3), b(6, 26, 22, 3)],
    "closing":[b(6, 12, 26, 7, "#000"), b(6, 30, 34, 1.4)],
  };
  return <svg width="48" height="40" viewBox="0 0 48 40">{m[id] || m.statement}</svg>;
};

function SlideSheet({ p, i, onClose }) {
  const { commit, go, toast } = useApp();
  const s = p.slides[i];
  const [h, setH] = useState(s.headline || s.quote || "");
  const [b, setB] = useState(s.body || "");
  const save = () => {
    commit(p.id, x => { const arr = [...x.slides]; arr[i] = { ...arr[i], [s.quote ? "quote" : "headline"]:h, body:b || arr[i].body }; return { ...x, slides:arr }; }, "Edited copy");
    toast("Copy saved", "check"); onClose();
  };
  return (
    <Sheet open onClose={onClose} title={`${String(i + 1).padStart(2, "0")} · ${s.purpose}`} height="86%"
      footer={<div style={{ display:"flex", gap:8 }}><Btn variant="secondary" full onClick={onClose}>Cancel</Btn><Btn full onClick={save}>Save</Btn></div>}>
      <div style={{ display:"grid", placeItems:"center", marginBottom:14 }}>
        <Slide slide={{ ...s, headline:s.quote ? s.headline : h, quote:s.quote ? h : undefined, body:b || s.body }} styleId={p.style} platformId={p.platform} w={188} radius={8}/>
      </div>
      <Eyebrow style={{ marginBottom:6 }}>Headline</Eyebrow>
      <textarea value={h} onChange={e => setH(e.target.value)} rows={2}
        style={{ border:`1px solid ${C.hair}`, borderRadius:12, padding:"10px 12px", fontSize:15, resize:"none", marginBottom:14 }}/>
      {(s.body !== undefined || b) && <>
        <Eyebrow style={{ marginBottom:6 }}>Supporting copy</Eyebrow>
        <textarea value={b} onChange={e => setB(e.target.value)} rows={3} placeholder="Optional. Carvv prefers none."
          style={{ border:`1px solid ${C.hair}`, borderRadius:12, padding:"10px 12px", fontSize:14, resize:"none", marginBottom:14 }}/>
      </>}
      <div style={{ border:`1px solid ${C.hair}`, borderRadius:12, padding:"12px 14px", marginBottom:14 }}>
        <Eyebrow style={{ marginBottom:8 }}>Specification</Eyebrow>
        {[["purpose", s.purpose],["visual_type", s.visual],["composition", s.comp],["text_density", s.density?.text],["visual_density", s.density?.visual],["confidence", s.conf]]
          .map(([k, v]) => <div key={k} className="mono" style={{ display:"flex", justifyContent:"space-between", fontSize:12, padding:"3px 0", color:C.body }}>
            <span>{k}</span><span style={{ color:C.ink }}>{String(v || "—")}</span></div>)}
      </div>
      <Btn full variant="secondary" icon="pencil" onClick={() => { onClose(); go("editor", { id:p.id, index:i }); }}>Open on canvas</Btn>
      <div style={{ height:10 }}/>
    </Sheet>
  );
}
