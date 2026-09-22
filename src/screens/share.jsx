import React, { useMemo, useRef, useState } from "react";
import { C, styleOf, platformOf } from "../lib/tokens";
import { Icon, Mark } from "../lib/icons";
import { Btn, IconBtn, Body, H, Eyebrow, Chip, Sheet, Rule, Note, Tag, Card, Row, Seg, EmptyState, Meter, Spinner } from "../lib/ui";
import { useApp } from "../lib/store";
import { Slide } from "../slides/SlideRenderer";
import { Header } from "./create";
import { captionFor, altFor } from "../data/templates";

const TONES = [
  { id:"punchy", name:"Punchy", rewrite:t => t.replace(/\.$/, "").toUpperCase().slice(0, 64) },
  { id:"analytical", name:"Analytical", rewrite:t => `Three things worth noting: ${t.toLowerCase()}` },
  { id:"plain", name:"Plain", rewrite:t => t },
];

export function Caption({ id }) {
  const { project, toast, go, prefs } = useApp();
  const p = project(id);
  const base = useMemo(() => p ? captionFor(p) : null, [p]);
  const [tone, setTone] = useState("plain");
  const [hook, setHook] = useState(base?.hook || "");
  const [body, setBody] = useState(base?.body || "");
  const [cta, setCta] = useState(base?.cta || "");
  const [tags, setTags] = useState(() => new Set(base?.tags?.slice(0, 5) || []));
  const [busy, setBusy] = useState(false);
  const [alt, setAlt] = useState(false);
  if (!p) return <EmptyState title="Nothing to caption" body="Open a project first."/>;
  const full = `${hook}\n\n${body}\n\n${cta}\n\n${[...tags].join(" ")}`;
  const chars = full.length;
  const limit = p.platform === "instagram" ? 2200 : 3000;
  const regen = t => {
    setBusy(true); setTone(t);
    setTimeout(() => {
      const fn = TONES.find(x => x.id === t).rewrite;
      setHook(t === "punchy" ? fn(base.hook) : base.hook);
      setBody(t === "analytical" ? base.body + "\n\nThe evidence behind each line is in the sources panel." : base.body);
      setBusy(false); toast(`${TONES.find(x => x.id === t).name} rewrite`, "spark");
    }, 900);
  };
  return (
    <>
      <Header title="Caption" sub={`${platformOf(p.platform).name} · written from the slides`} back
        right={<IconBtn n="copy" label="Copy all" onClick={() => toast("Caption copied", "copy")}/>}/>
      <div className="noscroll" style={{ flex:1, overflowY:"auto", padding:"0 18px 18px" }}>
        <div className="noscroll" style={{ display:"flex", gap:6, overflowX:"auto", marginBottom:12 }}>
          {TONES.map(t => <Chip key={t.id} s="sm" active={tone === t.id} onClick={() => regen(t.id)}>{t.name}</Chip>)}
          <div style={{ flex:1 }}/>
          {busy && <Spinner s={14}/>}
        </div>
        <Eyebrow style={{ marginBottom:6 }}>Hook line</Eyebrow>
        <Area v={hook} on={setHook} rows={2}/>
        <Eyebrow style={{ margin:"12px 0 6px" }}>Body</Eyebrow>
        <Area v={body} on={setBody} rows={5}/>
        <Eyebrow style={{ margin:"12px 0 6px" }}>Call to action</Eyebrow>
        <Area v={cta} on={setCta} rows={2}/>
        <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", margin:"16px 0 8px" }}>
          <Eyebrow>Hashtags</Eyebrow>
          <span className="mono" style={{ fontSize:12, color:C.body }}>{tags.size} SELECTED</span>
        </div>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {base.tags.map(t => (
            <Chip key={t} s="sm" active={tags.has(t)} onClick={() => {
              const n = new Set(tags); n.has(t) ? n.delete(t) : n.add(t); setTags(n);
            }}>{t}</Chip>
          ))}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10, margin:"16px 0 8px" }}>
          <Meter v={(chars / limit) * 100}/>
          <span className="mono" style={{ fontSize:12, color:chars > limit ? "#A3332A" : C.body }}>{chars}/{limit}</span>
        </div>
        <Row icon="eye" title="Alt text for every slide" sub="Generated from the slide specs" onClick={() => setAlt(true)}/>
        <Row icon="layout" title="See it in the feed" sub="Mocked at real feed scale" onClick={() => go("feed", { id:p.id })} last/>
        <div style={{ display:"flex", gap:8, marginTop:16 }}>
          <Btn variant="secondary" full icon="copy" onClick={() => toast("Caption copied", "copy")}>Copy caption</Btn>
          <Btn full icon="share" onClick={() => toast("Sent to your drafts", "share")}>Send to drafts</Btn>
        </div>
      </div>
      <Sheet open={alt} onClose={() => setAlt(false)} title="Alt text" height="82%">
        <div style={{ paddingBottom:14 }}>
          {p.slides.map((s, i) => (
            <div key={s.id} style={{ display:"flex", gap:10, padding:"12px 0", borderBottom:`1px solid ${C.hair}` }}>
              <Slide slide={s} styleId={p.style} platformId={p.platform} w={40} radius={4}/>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:12.5, lineHeight:1.45, color:C.charcoal }}>{altFor(s, i)}</div>
                <button className="focusable" onClick={() => toast(`Alt text ${i + 1} copied`, "copy")}
                  style={{ display:"flex", alignItems:"center", gap:5, marginTop:6, fontSize:12, color:C.ink }}>
                  <Icon n="copy" s={12}/> Copy
                </button>
              </div>
            </div>
          ))}
        </div>
      </Sheet>
    </>
  );
}
const Area = ({ v, on, rows }) => (
  <textarea value={v} rows={rows} onChange={e => on(e.target.value)}
    style={{ border:`1px solid ${C.hair}`, borderRadius:12, padding:"11px 13px", fontSize:14.5, lineHeight:1.5, resize:"none", background:C.canvas }}/>
);

/* ============================ in-feed preview ============================ */
export function Feed({ id }) {
  const { project, back, toast } = useApp();
  const p = project(id);
  const [pf, setPf] = useState(p?.platform === "linkedin" ? "linkedin" : "instagram");
  const [i, setI] = useState(0);
  const [liked, setLiked] = useState(false);
  const [expand, setExpand] = useState(false);
  const ref = useRef(null);
  if (!p) return null;
  const cap = captionFor(p);
  const onScroll = () => { const el = ref.current; if (el) setI(Math.round(el.scrollLeft / el.clientWidth)); };
  const W = 358;
  const ig = pf === "instagram";
  return (
    <div style={{ flex:1, minHeight:0, display:"flex", flexDirection:"column", background:ig ? C.canvas : C.soft }}>
      <Header title="In the feed" sub={`${platformOf(pf).name} · ${platformOf(pf).ratio}`} back
        right={<IconBtn n="refresh" label="Swap platform" onClick={() => setPf(ig ? "linkedin" : "instagram")}/>}/>
      <div className="noscroll" style={{ flex:1, overflowY:"auto", padding:"0 16px 18px" }}>
        <div style={{ background:C.canvas, border:ig ? "none" : `1px solid ${C.hair}`, borderRadius:ig ? 0 : 10, overflow:"hidden" }}>
          {/* author row */}
          <div style={{ display:"flex", alignItems:"center", gap:9, padding:ig ? "10px 2px" : "12px 12px 8px" }}>
            <span style={{ width:ig ? 34 : 42, height:ig ? 34 : 42, borderRadius:9999, background:C.ink, display:"grid", placeItems:"center", flex:"0 0 auto" }}>
              <Mark s={ig ? 18 : 22} c={C.canvas} thread={false}/></span>
            <span style={{ flex:1, minWidth:0 }}>
              <span style={{ display:"block", fontSize:13.5, fontWeight:500 }}>fieldnotes.studio</span>
              <span style={{ display:"block", fontSize:12, color:C.body, marginTop:1 }}>
                {ig ? "Sponsored · Bengaluru" : "Research & visual storytelling · 2h"}</span>
            </span>
            <Icon n="dots" s={17} c={C.body}/>
          </div>
          {!ig && <div style={{ padding:"0 12px 10px", fontSize:14, lineHeight:1.5 }}>
            {cap.hook}
            {expand ? <> <span style={{ color:C.charcoal }}>{cap.body}</span></>
              : <button className="focusable" onClick={() => setExpand(true)} style={{ color:C.body, marginLeft:4 }}>…see more</button>}
          </div>}
          {/* the carousel */}
          <div ref={ref} onScroll={onScroll} className="noscroll snapx" style={{ display:"flex", overflowX:"auto", background:"#000" }}>
            {p.slides.map((s, n) => (
              <div key={s.id} className="snapc" style={{ flex:"0 0 100%", width:"100%" }}>
                <Slide slide={s} styleId={p.style} platformId={pf} w={W} radius={0} deco={p.deco} index={n} total={p.slides.length}/>
              </div>
            ))}
          </div>
          {/* actions */}
          {ig ? <>
            <div style={{ display:"flex", alignItems:"center", gap:14, padding:"10px 2px 6px" }}>
              <button className="focusable tap" aria-label="Like" onClick={() => { setLiked(l => !l); toast(liked ? "Unliked" : "Liked", "check"); }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill={liked ? "#E0245E" : "none"}>
                  <path d="M12 20.3C7 17 3.5 14.2 3.5 10.6A4.1 4.1 0 0112 8.5a4.1 4.1 0 018.5 2.1c0 3.6-3.5 6.4-8.5 9.7z"
                    stroke={liked ? "#E0245E" : C.ink} strokeWidth="1.7" strokeLinejoin="round"/></svg>
              </button>
              <Icon n="quote" s={23} c={C.ink} w={1.5}/>
              <Icon n="share" s={22} c={C.ink} w={1.5}/>
              <div style={{ flex:1, display:"flex", justifyContent:"center", gap:5 }}>
                {p.slides.map((s, n) => <span key={s.id} style={{ width:6, height:6, borderRadius:9999,
                  background:n === i ? C.ink : C.hair2, transition:"background .2s ease" }}/>)}
              </div>
              <Icon n="save" s={22} c={C.ink} w={1.5}/>
            </div>
            <div style={{ padding:"0 2px 14px" }}>
              <div style={{ fontSize:13.5, fontWeight:500 }}>{liked ? "1,241" : "1,240"} likes</div>
              <div style={{ fontSize:13.5, lineHeight:1.5, marginTop:5 }}>
                <span style={{ fontWeight:500 }}>fieldnotes.studio </span>
                {expand ? <>{cap.hook} {cap.body} <span style={{ color:C.charcoal }}>{cap.cta}</span> <span style={{ color:"#3A6DA8" }}>{cap.tags.join(" ")}</span></>
                  : <>{cap.hook.slice(0, 74)}… <button className="focusable" onClick={() => setExpand(true)} style={{ color:C.body }}>more</button></>}
              </div>
              <div className="mono" style={{ fontSize:12, color:C.body, marginTop:8 }}>SLIDE {i + 1} OF {p.slides.length}</div>
            </div>
          </> : <>
            <div style={{ display:"flex", alignItems:"center", gap:6, padding:"10px 12px", borderTop:`1px solid ${C.hair}` }}>
              {[["Like", "up"],["Comment", "quote"],["Repost", "refresh"],["Send", "share"]].map(([n, ic]) => (
                <button key={n} className="focusable tap" onClick={() => toast(n + "d", "check")}
                  style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6, padding:"7px 0", color:C.charcoal, fontSize:12.5 }}>
                  <Icon n={ic} s={16}/> {n}
                </button>
              ))}
            </div>
            <div style={{ padding:"0 12px 12px", display:"flex", alignItems:"center", gap:6 }}>
              <span className="mono" style={{ fontSize:12, color:C.body }}>318 REACTIONS · 44 COMMENTS</span>
              <div style={{ flex:1 }}/>
              <span className="mono" style={{ fontSize:12, color:C.body }}>{i + 1}/{p.slides.length}</span>
            </div>
          </>}
        </div>
        <Note style={{ marginTop:14 }} w={260}>{ig ? "the first 74 characters are all most people read" : "linkedin shows the text before the deck — front-load the insight"}</Note>
        <div style={{ display:"flex", gap:8, marginTop:14 }}>
          <Btn variant="secondary" full onClick={() => setPf(ig ? "linkedin" : "instagram")}>See as {ig ? "LinkedIn" : "Instagram"}</Btn>
          <Btn full icon="download" onClick={back}>Back to export</Btn>
        </div>
      </div>
    </div>
  );
}
