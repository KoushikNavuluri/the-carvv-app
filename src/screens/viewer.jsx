import React, { useEffect, useMemo, useRef, useState } from "react";
import { C, styleOf, platformOf, VISUAL_TYPES } from "../lib/tokens";
import { Icon, Mark } from "../lib/icons";
import { Btn, IconBtn, Body, H, Eyebrow, Chip, Sheet, Dialog, Rule, Note, Tag, Meter, Card, Row,
  EmptyState, SearchPill, Switch, Spinner, TerminalCard } from "../lib/ui";
import { useApp } from "../lib/store";
import { Slide } from "../slides/SlideRenderer";
import { Header } from "./create";
import { SOURCES, CLAIMS } from "../data/projects";
import { exportJob, critic } from "../services/pipeline";
import { score as scoreOf } from "../data/templates";

/* ---------------------------------------------------------- viewer */
export function Viewer({ id, start = 0 }) {
  const { project, back, go, toast } = useApp();
  const p = project(id);
  const [i, setI] = useState(start);
  const [chrome, setChrome] = useState(true);
  const [sheet, setSheet] = useState(null);
  const ref = useRef(null);
  const W = 390;
  useEffect(() => { ref.current?.scrollTo({ left:start * ref.current.clientWidth }); }, []);
  if (!p) return <EmptyState title="Nothing to show" body="Open a project first." action={<Btn onClick={back}>Back</Btn>}/>;
  const s = p.slides[i];
  const onScroll = () => { const el = ref.current; if (el) setI(Math.round(el.scrollLeft / el.clientWidth)); };
  const jump = n => ref.current?.scrollTo({ left:n * ref.current.clientWidth, behavior:"smooth" });

  return (
    <div style={{ flex:1, minHeight:0, position:"relative", background:"#0b0b0b", display:"flex", flexDirection:"column" }}>
      <div onClick={() => setChrome(c => !c)} style={{ flex:1, display:"flex", alignItems:"center", minHeight:0, paddingTop:46, paddingBottom:96 }}>
        <div ref={ref} onScroll={onScroll} className="noscroll snapx" style={{ display:"flex", overflowX:"auto", width:"100%", alignItems:"center" }}>
          {p.slides.map((x, n) => (
            <div key={x.id} className="snapc" style={{ flex:"0 0 100%", width:"100%", display:"grid", placeItems:"center", padding:"0 0" }}>
              <div style={{ transition:"transform .3s ease", transform:n === i ? "scale(1)" : "scale(.94)" }}>
                <Slide slide={x} styleId={p.style} platformId={p.platform} w={W - 28} radius={10} deco={p.deco} index={n} total={p.slides.length}/>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ position:"absolute", top:0, left:0, right:0, padding:"6px 10px 0", display:"flex", alignItems:"center", gap:4,
        opacity:chrome ? 1 : 0, transform:chrome ? "none" : "translateY(-8px)", transition:"all .22s ease", pointerEvents:chrome ? "auto" : "none" }}>
        <IconBtn n="x" label="Close" onClick={back} style={{ color:"#fff" }}/>
        <div style={{ flex:1, minWidth:0, color:"#fff" }}>
          <div style={{ fontSize:13.5, fontWeight:500, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.title}</div>
          <div className="mono" style={{ fontSize:12, color:"rgba(255,255,255,.55)", letterSpacing:".06em" }}>
            {String(i + 1).padStart(2, "0")} / {String(p.slides.length).padStart(2, "0")} · {s.purpose}</div>
        </div>
        <IconBtn n="info" label="Inspector" onClick={() => setSheet("inspect")} style={{ color:"#fff" }}/>
      </div>

      <div style={{ position:"absolute", bottom:0, left:0, right:0, paddingBottom:"calc(10px + env(safe-area-inset-bottom))",
        opacity:chrome ? 1 : 0, transform:chrome ? "none" : "translateY(10px)", transition:"all .22s ease", pointerEvents:chrome ? "auto" : "none" }}>
        <div className="noscroll" style={{ display:"flex", gap:6, overflowX:"auto", padding:"0 14px 10px" }}>
          {p.slides.map((x, n) => (
            <button key={x.id} onClick={() => jump(n)} aria-label={`Slide ${n + 1}`} className="focusable"
              style={{ flex:"0 0 auto", opacity:n === i ? 1 : .5, borderRadius:4, outline:n === i ? "1.5px solid #fff" : "none", outlineOffset:2 }}>
              <Slide slide={x} styleId={p.style} platformId={p.platform} w={30} radius={3}/>
            </button>
          ))}
        </div>
        <div style={{ display:"flex", gap:6, padding:"0 14px" }}>
          <ViewBtn n="book" t="Sources" onClick={() => go("research", { id:p.id })}/>
          <ViewBtn n="pencil" t="Edit" onClick={() => go("editor", { id:p.id, index:i })}/>
          <ViewBtn n="layout" t="Feed" onClick={() => go("feed", { id:p.id })}/>
          <ViewBtn n="download" t="Export" primary onClick={() => go("review", { id:p.id })}/>
        </div>
      </div>

      <Sheet open={sheet === "inspect"} onClose={() => setSheet(null)} title="AI inspector" height="82%">
        <Inspector p={p} s={s}/>
      </Sheet>
    </div>
  );
}
const ViewBtn = ({ n, t, onClick, primary }) => (
  <button onClick={onClick} className="focusable tap" style={{ flex:1, height:44, borderRadius:9999,
    background:primary ? "#fff" : "rgba(255,255,255,.14)", color:primary ? "#000" : "#fff",
    display:"grid", placeItems:"center", gap:2, backdropFilter:"blur(8px)" }}>
    <Icon n={n} s={17} w={1.7}/><span style={{ fontSize:12, letterSpacing:".02em" }}>{t}</span>
  </button>
);

export function Inspector({ p, s }) {
  const claims = (s.claims || []).map(c => CLAIMS[c]).filter(Boolean);
  const conf = s.conf === "high" ? 92 : s.conf === "medium" ? 64 : 28;
  return (
    <div style={{ paddingBottom:18 }}>
      <div style={{ display:"flex", gap:12, marginBottom:16 }}>
        <Slide slide={s} styleId={p.style} platformId={p.platform} w={96} radius={6}/>
        <div style={{ flex:1, minWidth:0 }}>
          <Tag tone="ink">{s.purpose}</Tag>
          <div style={{ fontSize:14.5, fontWeight:450, marginTop:8, lineHeight:1.35 }}>{(s.headline || s.quote || "").replace("\n", " ")}</div>
          <div className="mono" style={{ fontSize:12, color:C.body, marginTop:6 }}>{(VISUAL_TYPES[s.visual] || "").toUpperCase()}</div>
        </div>
      </div>
      <Block t="Story purpose" b={`Why this slide exists: ${s.insight || "not set"}`}/>
      <Block t="Visual rationale" b={s.why || "Not recorded."} hand/>
      <Block t="Composition" b={<span className="mono" style={{ fontSize:12 }}>{s.comp}</span>}/>
      <div style={{ padding:"12px 0", borderBottom:`1px solid ${C.hair}` }}>
        <Eyebrow style={{ marginBottom:8 }}>Confidence</Eyebrow>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <Meter v={conf}/><span className="mono" style={{ fontSize:12, width:64, textAlign:"right", color:C.body }}>{s.conf || "low"}</span>
        </div>
      </div>
      <div style={{ padding:"12px 0" }}>
        <Eyebrow style={{ marginBottom:8 }}>Evidence</Eyebrow>
        {claims.length ? claims.map(c => (
          <div key={c.id} style={{ border:`1px solid ${C.hair}`, borderRadius:12, padding:12, marginBottom:8 }}>
            <div style={{ fontSize:13.5, lineHeight:1.4 }}>{c.text}</div>
            <div style={{ fontSize:12.5, color:C.body, marginTop:6, lineHeight:1.45 }}>{c.ev}</div>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:8 }}>
              <Tag tone={c.conf === "high" ? "ok" : "warn"}>{c.conf}</Tag>
              <span className="mono" style={{ fontSize:12, color:C.body, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                {SOURCES[c.src]?.pub}</span>
            </div>
          </div>
        )) : <div style={{ display:"flex", gap:8, alignItems:"center", background:"#FFF9EC", borderRadius:12, padding:"10px 12px" }}>
          <Icon n="alert" s={15} c="#8A5A00"/><span style={{ fontSize:13, color:"#7A5200" }}>No source attached to this slide yet.</span></div>}
      </div>
      <div style={{ padding:"4px 0 0" }}>
        <Eyebrow style={{ marginBottom:8 }}>Assets</Eyebrow>
        <div className="mono" style={{ fontSize:12, color:C.body, lineHeight:1.7 }}>
          {s.asset ? <>photograph · retrieved · editorial licence<br/></> : null}
          {s.data ? <>{VISUAL_TYPES[s.visual]?.toLowerCase()} · generated from source table<br/></> : null}
          {!s.asset && !s.data ? "type only — no asset needed" : null}
        </div>
      </div>
    </div>
  );
}
const Block = ({ t, b, hand }) => (
  <div style={{ padding:"12px 0", borderBottom:`1px solid ${C.hair}` }}>
    <Eyebrow style={{ marginBottom:6 }}>{t}</Eyebrow>
    {hand ? <div className="hand" style={{ fontSize:19, lineHeight:1.25, color:C.charcoal }}>{b}</div>
          : <div style={{ fontSize:14, lineHeight:1.45, color:C.charcoal }}>{b}</div>}
  </div>
);

/* ---------------------------------------------------------- research */
export function Research({ id }) {
  const { project, toast } = useApp();
  const p = project(id);
  const [q, setQ] = useState("");
  const [f, setF] = useState("all");
  const [open, setOpen] = useState(null);
  const srcs = (p?.sources || []).map(s => SOURCES[s]).filter(Boolean);
  const claims = Object.values(CLAIMS).filter(c => p?.sources?.includes(c.src));
  const shown = claims.filter(c => (f === "all" || c.conf === f) && (!q || (c.text + c.ev).toLowerCase().includes(q.toLowerCase())));
  return (
    <>
      <Header title="Research & evidence" sub={`${srcs.length} sources · ${claims.length} claims`} back/>
      <div style={{ padding:"0 18px 10px" }}>
        <SearchPill value={q} onChange={setQ} placeholder="Search claims and evidence"/>
        <div className="noscroll" style={{ display:"flex", gap:6, overflowX:"auto", marginTop:10 }}>
          {[["all", "All"],["high", "High confidence"],["medium", "Needs a check"]].map(([k, n]) =>
            <Chip key={k} s="sm" active={f === k} onClick={() => setF(k)}>{n}</Chip>)}
        </div>
      </div>
      <div className="noscroll" style={{ flex:1, overflowY:"auto", padding:"0 18px 20px" }}>
        {!srcs.length && <EmptyState icon="book" title="No research yet" body="This project was written from your input alone. Attach a URL or document and regenerate to build an evidence trail."/>}
        {srcs.length > 0 && <>
          <Eyebrow style={{ margin:"6px 0 4px" }}>Sources</Eyebrow>
          {srcs.map(s => (
            <button key={s.id} className="focusable tapf" onClick={() => setOpen(s)} style={{ width:"100%", display:"flex", gap:10, alignItems:"center", padding:"12px 0", borderBottom:`1px solid ${C.hair}`, textAlign:"left" }}>
              <span className="mono" style={{ width:34, height:34, borderRadius:8, background:C.soft, display:"grid", placeItems:"center", fontSize:12, color:C.charcoal, flex:"0 0 auto" }}>
                {s.kind.slice(0, 3).toUpperCase()}</span>
              <span style={{ flex:1, minWidth:0 }}>
                <span style={{ display:"block", fontSize:14, fontWeight:450, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.title}</span>
                <span className="mono" style={{ display:"block", fontSize:12, color:C.body, marginTop:3 }}>{s.pub.toUpperCase()} · {s.date}</span>
              </span>
              <Tag tone={s.conf === "high" ? "ok" : "warn"}>{s.conf}</Tag>
            </button>
          ))}
          <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", margin:"18px 0 4px" }}>
            <Eyebrow>Claims</Eyebrow>
            <span className="mono" style={{ fontSize:12, color:C.body }}>{shown.length} SHOWN</span>
          </div>
          {shown.map(c => (
            <div key={c.id} style={{ border:`1px solid ${C.hair}`, borderRadius:12, padding:13, marginBottom:8 }}>
              <div style={{ fontSize:14, lineHeight:1.4 }}>{c.text}</div>
              <div style={{ fontSize:12.5, color:C.body, marginTop:7, lineHeight:1.45 }}>{c.ev}</div>
              <Rule style={{ margin:"10px 0" }}/>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <Tag tone={c.conf === "high" ? "ok" : "warn"}>{c.conf}</Tag>
                <span className="mono" style={{ fontSize:12, color:C.body, flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{SOURCES[c.src]?.title}</span>
                <button className="focusable" onClick={() => setOpen(SOURCES[c.src])} aria-label="Open source"><Icon n="arrowR" s={15} c={C.ink}/></button>
              </div>
            </div>
          ))}
          {!shown.length && <EmptyState icon="search" title="Nothing matches" body="No claim contains that text at this confidence level."
            action={<Btn variant="secondary" onClick={() => { setQ(""); setF("all"); }}>Clear filters</Btn>}/>}
        </>}
      </div>
      <Sheet open={!!open} onClose={() => setOpen(null)} title="Source">
        {open && <div style={{ paddingBottom:18 }}>
          <H s={19} style={{ marginBottom:6 }}>{open.title}</H>
          <div className="mono" style={{ fontSize:12, color:C.body, marginBottom:12 }}>{open.pub.toUpperCase()} · {open.date} · {open.kind.toUpperCase()}</div>
          <div style={{ background:C.soft, borderRadius:9999, padding:"10px 16px", display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
            <Icon n="link" s={15} c={C.mute}/>
            <span className="mono" style={{ fontSize:12, flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{open.url}</span>
            <button className="focusable" aria-label="Copy link" onClick={() => toast("Link copied", "copy")}><Icon n="copy" s={14} c={C.charcoal}/></button>
          </div>
          {Object.values(CLAIMS).filter(c => c.src === open.id).map(c => (
            <div key={c.id} style={{ padding:"10px 0", borderTop:`1px solid ${C.hair}` }}>
              <div style={{ fontSize:13.5 }}>{c.text}</div>
              <div style={{ fontSize:12.5, color:C.body, marginTop:5 }}>{c.ev}</div>
            </div>
          ))}
        </div>}
      </Sheet>
    </>
  );
}

/* ---------------------------------------------------------- critic */
export function QA({ id }) {
  const { project, qa, setQa, toast, go } = useApp();
  const p = project(id);
  const [running, setRunning] = useState(false);
  const list = qa;
  const groups = ["Content", "Design", "Story", "Platform"];
  const sevTone = s => s === "high" ? "bad" : s === "med" ? "warn" : "soft";
  const fixAll = () => {
    setQa(q => q.map(x => x.state === "flagged" && x.sev !== "high" ? { ...x, state:"fixed", fix:"Auto-fixed: tightened copy and spacing." } : x));
    toast("Applied every high-confidence fix", "wand");
  };
  const run = () => { setRunning(true); setTimeout(() => { setQa(critic(p)); setRunning(false); toast("Critic pass complete", "shield"); }, 1500); };
  const flagged = list.filter(x => x.state === "flagged").length;
  return (
    <>
      <Header title="Critic" sub={`${list.filter(x => x.state === "fixed").length} fixed · ${flagged} flagged`} back
        right={<IconBtn n="refresh" label="Run again" onClick={run}/>}/>
      <div className="noscroll" style={{ flex:1, overflowY:"auto", padding:"0 18px 20px" }}>
        {running ? <div style={{ padding:"30px 0" }}>
          <TerminalCard title="critic">
            {["checking claims against sources", "measuring type at export size", "looking for clipping and overflow", "scoring narrative progression", "verifying platform safe areas"]
              .map((l, i) => <div key={l} className="anim-down" style={{ color:C.mute, animationDelay:`${i * 220}ms` }}>· {l}</div>)}
          </TerminalCard>
        </div> : <>
          <div style={{ display:"flex", gap:8, margin:"4px 0 14px" }}>
            <Card pad={12} style={{ flex:1 }}>
              <div className="mono" style={{ fontSize:12, color:C.body }}>QUALITY</div>
              <div className="disp" style={{ fontSize:26, fontWeight:600, marginTop:2 }}>{p?.score || 78}<span style={{ fontSize:14, color:C.mute }}>/100</span></div>
            </Card>
            <Card pad={12} style={{ flex:1 }}>
              <div className="mono" style={{ fontSize:12, color:C.body }}>BLOCKERS</div>
              <div className="disp" style={{ fontSize:26, fontWeight:600, marginTop:2 }}>{list.filter(x => x.sev === "high").length}</div>
            </Card>
          </div>
          {flagged > 0 && <Btn full variant="secondary" icon="wand" onClick={fixAll} style={{ marginBottom:14 }}>Fix everything safe to fix</Btn>}
          {groups.map(g => {
            const rows = list.filter(x => x.group === g);
            if (!rows.length) return null;
            return (
              <div key={g} style={{ marginBottom:16 }}>
                <Eyebrow style={{ marginBottom:6 }}>{g}</Eyebrow>
                {rows.map(x => (
                  <div key={x.id} style={{ display:"flex", gap:10, padding:"11px 0", borderBottom:`1px solid ${C.hair}` }}>
                    <span style={{ marginTop:2 }}>
                      {x.state === "fixed" ? <Icon n="check" s={15} c="#2F6B33" w={2.2}/>
                        : x.state === "passed" ? <Icon n="check" s={15} c={C.mute} w={2}/>
                        : <Icon n="alert" s={15} c={x.sev === "high" ? "#A3332A" : "#8A5A00"}/>}
                    </span>
                    <span style={{ flex:1 }}>
                      <span style={{ display:"block", fontSize:13.5, lineHeight:1.4 }}>{x.txt}</span>
                      {x.fix && <span className="hand" style={{ display:"block", fontSize:17, color:C.charcoal, marginTop:3 }}>{x.fix}</span>}
                      {!x.fix && x.state === "flagged" && <span style={{ display:"flex", gap:6, marginTop:7 }}>
                        <Chip s="sm" onClick={() => { setQa(q => q.map(y => y.id === x.id ? { ...y, state:"fixed", fix:"Accepted your call." } : y)); toast("Marked resolved", "check"); }}>Resolve</Chip>
                        <Chip s="sm" onClick={() => go("editor", { id, index:0 })}>Open slide</Chip>
                      </span>}
                    </span>
                    <Tag tone={sevTone(x.sev)}>{x.sev}</Tag>
                  </div>
                ))}
              </div>
            );
          })}
        </>}
      </div>
      <div style={{ padding:"10px 18px calc(14px + env(safe-area-inset-bottom))", borderTop:`1px solid ${C.hair}` }}>
        <Btn full onClick={() => go("review", { id })} disabled={list.some(x => x.sev === "high" && x.state === "flagged")}
          icon={list.some(x => x.sev === "high" && x.state === "flagged") ? "lock" : "check"}>
          {list.some(x => x.sev === "high" && x.state === "flagged") ? "Fix blockers to continue" : "Continue to review"}
        </Btn>
      </div>
    </>
  );
}

/* ---------------------------------------------------------- review */
export function Review({ id }) {
  const { project, go, back, qa } = useApp();
  const p = project(id);
  if (!p) return null;
  const pf = platformOf(p.platform), st = styleOf(p.style);
  const photos = p.slides.filter(s => s.asset).length;
  const charts = p.slides.filter(s => s.data).length;
  return (
    <>
      <Header title="Final review" back right={<IconBtn n="eye" label="Preview" onClick={() => go("viewer", { id })}/>}/>
      <div className="noscroll" style={{ flex:1, overflowY:"auto", padding:"0 18px 20px" }}>
        <H s={28} style={{ letterSpacing:"-0.03em", marginBottom:6 }}>Your story is ready.</H>
        <Body s={14.5} style={{ marginBottom:14 }}>{p.slides.length} slides · {pf.name} {pf.w}×{pf.h} · {st.name}</Body>
        <div className="noscroll" style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:6 }}>
          {p.slides.map((s, i) => <button key={s.id} className="focusable tapf" onClick={() => go("viewer", { id, start:i })} style={{ flex:"0 0 auto" }}>
            <Slide slide={s} styleId={p.style} platformId={p.platform} w={108} radius={7}/>
            <div className="mono" style={{ fontSize:12, color:C.body, marginTop:5, textAlign:"left" }}>{String(i + 1).padStart(2, "0")} {s.purpose}</div>
          </button>)}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginTop:16 }}>
          <Card pad={13}><div className="mono" style={{ fontSize:12, color:C.body }}>SOURCES</div>
            <div className="disp" style={{ fontSize:22, fontWeight:600, marginTop:2 }}>{p.sources.length}</div>
            <div style={{ fontSize:12, color:C.body, marginTop:2 }}>all claims traced</div></Card>
          <Card pad={13}><div className="mono" style={{ fontSize:12, color:C.body }}>ASSETS</div>
            <div className="disp" style={{ fontSize:22, fontWeight:600, marginTop:2 }}>{photos + charts}</div>
            <div style={{ fontSize:12, color:C.body, marginTop:2 }}>{photos} retrieved · {charts} generated</div></Card>
          <Card pad={13}><div className="mono" style={{ fontSize:12, color:C.body }}>QUALITY</div>
            <div className="disp" style={{ fontSize:22, fontWeight:600, marginTop:2 }}>{p.score || 78}/100</div>
            <div style={{ fontSize:12, color:C.body, marginTop:2 }}>{qa.filter(x => x.state === "flagged").length} open notes</div></Card>
          <Card pad={13}><div className="mono" style={{ fontSize:12, color:C.body }}>SAFE AREAS</div>
            <div className="disp" style={{ fontSize:22, fontWeight:600, marginTop:2 }}>Clear</div>
            <div style={{ fontSize:12, color:C.body, marginTop:2 }}>min type 34px</div></Card>
        </div>
        <ScoreCard p={p}/>
        <div style={{ marginTop:14 }}>
          <Row icon="type" title="Caption & hashtags" sub="Written from the slide specs" onClick={() => go("caption", { id })}/>
          <Row icon="layout" title="Preview in the feed" sub="At real feed scale, with the caption crop" onClick={() => go("feed", { id })}/>
          <Row icon="sliders" title="Finish & customisation" sub="Type, grain, slide numbers, watermark" onClick={() => go("editor", { id, index:0 })} last/>
        </div>
        <Note style={{ marginTop:14 }} w={260}>read slide 1 and the last back to back — that's the whole test</Note>
        <div style={{ display:"flex", gap:8, marginTop:18 }}>
          <Btn variant="secondary" full icon="pencil" onClick={() => go("editor", { id, index:0 })}>Edit</Btn>
          <Btn variant="secondary" full icon="refresh" onClick={() => go("storyboard", { id })}>Storyboard</Btn>
        </div>
      </div>
      <div style={{ padding:"10px 18px calc(14px + env(safe-area-inset-bottom))", borderTop:`1px solid ${C.hair}` }}>
        <Btn full size="lg" icon="download" onClick={() => go("export", { id })}>Export</Btn>
      </div>
    </>
  );
}

function ScoreCard({ p }) {
  const s = scoreOf(p);
  if (!s) return null;
  const rows = [["Hook strength", s.hook],["Visual variety", s.variety],["Text economy", s.economy],["Evidence density", s.evidence]];
  return (
    <Card pad={14} style={{ marginTop:16 }}>
      <div style={{ display:"flex", alignItems:"baseline", gap:8, marginBottom:12 }}>
        <Eyebrow>Scroll-stop score</Eyebrow>
        <div style={{ flex:1 }}/>
        <span className="disp" style={{ fontSize:24, fontWeight:600 }}>{s.total}</span>
        <span className="mono" style={{ fontSize:12, color:C.body }}>/100</span>
      </div>
      {rows.map(([k, v]) => (
        <div key={k} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
          <span style={{ fontSize:12.5, width:104, color:C.charcoal }}>{k}</span>
          <Meter v={v}/>
          <span className="mono" style={{ fontSize:12, color:C.body, width:24, textAlign:"right" }}>{v}</span>
        </div>
      ))}
      <div className="hand" style={{ fontSize:18, color:C.charcoal, marginTop:8, lineHeight:1.2 }}>{s.note}</div>
    </Card>
  );
}

/* ---------------------------------------------------------- export */
const FORMATS = [
  { id:"png", name:"PNG slides", sub:"One file per slide, lossless", icon:"image" },
  { id:"pdf", name:"PDF", sub:"Single document, print safe", icon:"file" },
  { id:"pack", name:"Carousel package", sub:"Slides, captions, sources, alt text", icon:"layers" },
];
export function ExportScreen({ id }) {
  const { project, prefs, setPrefs, toast, go, back, commit } = useApp();
  const p = project(id);
  const [fmt, setFmt] = useState("png");
  const [state, setState] = useState("idle"); // idle | running | done | error
  const [pct, setPct] = useState(0);
  const [step, setStep] = useState(0);
  const [err, setErr] = useState(null);
  const tries = useRef(0);
  if (!p) return null;
  const pf = platformOf(p.platform);
  const run = () => {
    setState("running"); setPct(0); setStep(0); setErr(null);
    const willFail = fmt === "pack" && tries.current === 0;
    tries.current += 1;
    exportJob(p, fmt, (v, i) => { setPct(v); setStep(i); },
      () => { setState("done"); commit(p.id, x => ({ ...x, status:"exported", exports:[{ what:`${fmt.toUpperCase()} · ${p.slides.length} slides`, when:"just now", size:"9.4 MB" }, ...x.exports] }), "Exported"); },
      e => { setState("error"); setErr(e); }, willFail);
  };
  if (state === "done") return (
    <div style={{ flex:1, minHeight:0, display:"flex", flexDirection:"column", padding:"0 18px calc(18px + env(safe-area-inset-bottom))" }}>
      <Header title="Export" back/>
      <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", textAlign:"center", gap:12 }}>
        <div className="anim-pop" style={{ width:58, height:58, borderRadius:9999, background:C.ink, display:"grid", placeItems:"center" }}>
          <Icon n="check" s={26} c="#fff" w={2.4}/></div>
        <H s={26} style={{ letterSpacing:"-0.02em" }}>Exported.</H>
        <Body s={14.5} style={{ maxWidth:280 }}>{p.slides.length} slides at {pf.w}×{pf.h}, {prefs.quality}. Captions and source list included.</Body>
        <div className="noscroll" style={{ display:"flex", gap:6, overflowX:"auto", maxWidth:"100%", marginTop:6 }}>
          {p.slides.map(s => <Slide key={s.id} slide={s} styleId={p.style} platformId={p.platform} w={54} radius={4}/>)}
        </div>
      </div>
      <div style={{ display:"grid", gap:8 }}>
        <Btn full size="lg" icon="share" onClick={() => toast("Shared to your camera roll", "share")}>Save & share</Btn>
        <Btn full variant="secondary" onClick={() => go("project", { id })}>Back to project</Btn>
      </div>
    </div>
  );
  return (
    <>
      <Header title="Export" sub={`${pf.name} · ${pf.w}×${pf.h}`} back/>
      <div className="noscroll" style={{ flex:1, overflowY:"auto", padding:"0 18px 20px" }}>
        {state === "error" && <div style={{ background:"#FDF0EF", borderRadius:12, padding:"12px 14px", marginBottom:14, display:"flex", gap:10 }}>
          <Icon n="alert" s={17} c="#A3332A"/>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13.5, color:"#8A2B22", fontWeight:500 }}>Export failed</div>
            <div style={{ fontSize:12.5, color:"#A3332A", marginTop:3, lineHeight:1.4 }}>{err} Your slides are untouched.</div>
            <Btn size="sm" variant="secondary" icon="refresh" style={{ marginTop:9 }} onClick={run}>Retry</Btn>
          </div>
        </div>}
        <Eyebrow style={{ marginBottom:8 }}>Format</Eyebrow>
        {FORMATS.map(f => (
          <button key={f.id} className="focusable tapf" onClick={() => setFmt(f.id)} disabled={state === "running"}
            style={{ width:"100%", display:"flex", gap:12, alignItems:"center", padding:"12px 0", borderBottom:`1px solid ${C.hair}`, textAlign:"left", opacity:state === "running" ? .5 : 1 }}>
            <Icon n={f.icon} s={18} c={C.charcoal}/>
            <span style={{ flex:1 }}>
              <span style={{ display:"block", fontSize:14.5 }}>{f.name}</span>
              <span style={{ display:"block", fontSize:12.5, color:C.body, marginTop:2 }}>{f.sub}</span>
            </span>
            <span style={{ width:20, height:20, borderRadius:9999, border:`1.5px solid ${fmt === f.id ? C.ink : C.hair2}`, display:"grid", placeItems:"center" }}>
              {fmt === f.id && <span style={{ width:10, height:10, borderRadius:9999, background:C.ink }}/>}</span>
          </button>
        ))}
        <div style={{ marginTop:16 }}>
          <Eyebrow style={{ marginBottom:8 }}>Options</Eyebrow>
          <div style={{ display:"flex", alignItems:"center", padding:"11px 0", borderBottom:`1px solid ${C.hair}` }}>
            <span style={{ flex:1, fontSize:14.5 }}>Include source citations</span>
            <Switch on={prefs.cites} label="citations" onChange={v => setPrefs({ ...prefs, cites:v })}/>
          </div>
          <div style={{ display:"flex", alignItems:"center", padding:"11px 0", borderBottom:`1px solid ${C.hair}` }}>
            <span style={{ flex:1, fontSize:14.5 }}>Render quality</span>
            <div style={{ display:"flex", gap:6 }}>{["1x", "2x", "3x"].map(q => <Chip key={q} s="sm" active={prefs.quality === q} onClick={() => setPrefs({ ...prefs, quality:q })}>{q}</Chip>)}</div>
          </div>
        </div>
        {state === "running" && <div style={{ marginTop:18 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
            <Meter v={pct}/><span className="mono" style={{ fontSize:12, color:C.body, width:34, textAlign:"right" }}>{pct}%</span>
          </div>
          <div className="mono" style={{ fontSize:12, color:C.mute }}>
            {step <= p.slides.length ? `rendering slide ${Math.min(step, p.slides.length)} of ${p.slides.length}` : "packing files"}
          </div>
        </div>}
      </div>
      <div style={{ padding:"10px 18px calc(14px + env(safe-area-inset-bottom))", borderTop:`1px solid ${C.hair}` }}>
        <Btn full size="lg" loading={state === "running"} onClick={run} icon="download">
          {state === "running" ? "Rendering…" : `Export ${p.slides.length} slides`}
        </Btn>
      </div>
    </>
  );
}
