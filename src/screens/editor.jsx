import React, { useState } from "react";
import { C, STYLES, FONTS, styleOf, fontCls, platformOf, VISUAL_TYPES } from "../lib/tokens";
import { PALETTES, derive } from "../lib/theme";
import { Icon } from "../lib/icons";
import { Btn, IconBtn, Body, H, Eyebrow, Chip, Sheet, Dialog, Rule, Note, Tag, Meter, Card, Row, Seg,
  EmptyState, Spinner, Input, Switch } from "../lib/ui";
import { useApp } from "../lib/store";
import { Slide, LAYOUT_LIST } from "../slides/SlideRenderer";
import { Inspector } from "./viewer";
import { COMMANDS, applyCommand } from "../services/pipeline";
import { ASSETS, IMG } from "../data/assets";

const LAYERS = [
  { id:"kicker", name:"Kicker", icon:"type" },
  { id:"headline", name:"Headline", icon:"type" },
  { id:"body", name:"Copy", icon:"list" },
  { id:"visual", name:"Visual", icon:"image" },
  { id:"foot", name:"Footnote", icon:"book" },
];

export function Editor({ id, index = 0 }) {
  const { project, commit, back, go, toast, undo, redo, canUndo, canRedo, saved, prefs, setPrefs } = useApp();
  const p = project(id);
  const [i, setI] = useState(Math.min(index, (p?.slides.length || 1) - 1));
  const [tool, setTool] = useState(null);
  const [layer, setLayer] = useState("headline");
  const [busy, setBusy] = useState(false);
  const [lastNote, setLastNote] = useState(null);
  const [del, setDel] = useState(false);
  if (!p || !p.slides.length) return <EmptyState title="Nothing to edit" body="This project has no slides yet." action={<Btn onClick={back}>Back</Btn>}/>;
  const s = p.slides[i];
  const st = styleOf(p.style);

  const edit = (fn, label) => commit(p.id, x => { const arr = [...x.slides]; arr[i] = fn(JSON.parse(JSON.stringify(arr[i]))); return { ...x, slides:arr }; }, label);
  const runCmd = (cid) => {
    setBusy(true); setTool(null);
    setTimeout(() => {
      const { s:ns, note } = applyCommand(cid, s, p);
      commit(p.id, x => { const arr = [...x.slides]; arr[i] = ns; return { ...x, slides:arr }; }, "AI command: " + cid);
      setBusy(false); setLastNote(note); toast("Specification updated", "spark");
    }, 1100);
  };

  return (
    <>
      <div style={{ display:"flex", alignItems:"center", gap:2, padding:"2px 8px 6px" }}>
        <IconBtn n="chevL" label="Back" onClick={back}/>
        <div style={{ flex:1, minWidth:0, paddingLeft:2 }}>
          <div className="disp" style={{ fontSize:15, fontWeight:600 }}>Slide {i + 1} of {p.slides.length}</div>
          <div className="mono" style={{ fontSize:12, color:C.body, letterSpacing:".04em", textTransform:"uppercase" }}>{saved}</div>
        </div>
        <IconBtn n="undo" label="Undo" onClick={undo} tone={canUndo ? "ink" : "mute"} style={{ opacity:canUndo ? 1 : .35 }}/>
        <IconBtn n="redo" label="Redo" onClick={redo} tone={canRedo ? "ink" : "mute"} style={{ opacity:canRedo ? 1 : .35 }}/>
        <IconBtn n="dots" label="More" onClick={() => setTool("more")}/>
      </div>

      {/* canvas */}
      <div style={{ flex:1, minHeight:0, background:C.soft, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", position:"relative", padding:"8px 0" }}>
        <div style={{ position:"relative" }}>
          <Slide slide={s} styleId={p.style} platformId={p.platform} w={252} radius={8} deco={p.deco} index={i} total={p.slides.length}/>
          {prefs.grid && <div style={{ position:"absolute", inset:0, pointerEvents:"none", borderRadius:8,
            background:"repeating-linear-gradient(to right, rgba(0,0,0,.05) 0 1px, transparent 1px 100%)", backgroundSize:"29px 100%",
            outline:`1px dashed ${C.hair2}`, outlineOffset:-18 }}/>}
          {busy && <div style={{ position:"absolute", inset:0, background:"rgba(255,255,255,.72)", borderRadius:8, display:"grid", placeItems:"center", gap:8 }}>
            <Spinner/><span className="mono" style={{ fontSize:12, color:C.charcoal }}>REWRITING SPEC…</span></div>}
        </div>
        {lastNote && <div style={{ position:"absolute", left:14, right:14, bottom:8 }}>
          <div className="anim-in" style={{ display:"flex", gap:8, alignItems:"flex-start", background:C.canvas, border:`1px solid ${C.hair}`, borderRadius:12, padding:"9px 11px" }}>
            <Icon n="spark" s={14} c={C.ink} style={{ marginTop:2 }}/>
            <span className="hand" style={{ flex:1, fontSize:17, lineHeight:1.2, color:C.charcoal }}>{lastNote}</span>
            <button className="focusable" aria-label="Dismiss" onClick={() => setLastNote(null)}><Icon n="x" s={13} c={C.mute}/></button>
          </div>
        </div>}
      </div>

      {/* filmstrip */}
      <div className="noscroll" style={{ display:"flex", gap:6, overflowX:"auto", padding:"8px 14px", borderTop:`1px solid ${C.hair}` }}>
        {p.slides.map((x, n) => (
          <button key={x.id} onClick={() => { setI(n); setLastNote(null); }} className="focusable" aria-label={`Slide ${n + 1}`}
            style={{ flex:"0 0 auto", borderRadius:4, outline:n === i ? `1.5px solid ${C.ink}` : "none", outlineOffset:2, opacity:n === i ? 1 : .6 }}>
            <Slide slide={x} styleId={p.style} platformId={p.platform} w={33} radius={3} deco={p.deco} index={n} total={p.slides.length}/>
          </button>
        ))}
        <button onClick={() => { edit(x => x, "noop"); go("storyboard", { id:p.id }); }} aria-label="Storyboard"
          className="focusable" style={{ flex:"0 0 auto", width:33, height:41, borderRadius:3, border:`1px dashed ${C.hair2}`, display:"grid", placeItems:"center" }}>
          <Icon n="list" s={12} c={C.mute}/>
        </button>
      </div>

      {/* tools */}
      <div style={{ display:"flex", padding:"6px 6px calc(8px + env(safe-area-inset-bottom))", borderTop:`1px solid ${C.hair}` }}>
        {[["text", "Text", "type"],["layout", "Layout", "layout"],["visual", "Visual", "image"],["style", "Design", "palette"],["ai", "AI", "spark"],["inspect", "Why", "info"]]
          .map(([k, n, ic]) => (
            <button key={k} onClick={() => setTool(k)} className="focusable tap"
              style={{ flex:1, display:"grid", placeItems:"center", gap:3, padding:"6px 0", color:C.ink }}>
              <Icon n={ic} s={19} w={1.6}/><span style={{ fontSize:9.5 }}>{n}</span>
            </button>
          ))}
      </div>

      {/* --- text --- */}
      <Sheet open={tool === "text"} onClose={() => setTool(null)} title="Text" height="84%">
        <div className="noscroll" style={{ display:"flex", gap:6, overflowX:"auto", marginBottom:12 }}>
          {LAYERS.map(l => <Chip key={l.id} s="sm" active={layer === l.id} onClick={() => setLayer(l.id)}>{l.name}</Chip>)}
        </div>
        <div style={{ display:"grid", placeItems:"center", marginBottom:14 }}>
          <Slide slide={s} styleId={p.style} platformId={p.platform} w={176} radius={8}/>
        </div>
        {layer === "kicker" && <Field label="Kicker" v={s.kicker || ""} on={v => edit(x => ({ ...x, kicker:v }), "Edited kicker")}/>}
        {layer === "headline" && <>
          <Field label="Headline" v={s.headline || s.quote || ""} rows={3} on={v => edit(x => (x.quote ? { ...x, quote:v } : { ...x, headline:v }), "Edited headline")}/>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginTop:6 }}>
            <span style={{ fontSize:13.5, flex:1 }}>Type scale</span>
            <div style={{ display:"flex", gap:6 }}>
              {[["0.86", "S"],["1", "M"],["1.14", "L"]].map(([v, n]) =>
                <Chip key={n} s="sm" active={String(s.scale || 1) === v} onClick={() => edit(x => ({ ...x, scale:+v }), "Type scale")}>{n}</Chip>)}
            </div>
          </div>
        </>}
        {layer === "body" && <Field label="Supporting copy" v={s.body || ""} rows={4} on={v => edit(x => ({ ...x, body:v }), "Edited copy")}/>}
        {layer === "foot" && <Field label="Footnote / source line" v={s.foot || ""} on={v => edit(x => ({ ...x, foot:v }), "Edited footnote")}/>}
        {layer === "visual" && <div style={{ fontSize:13.5, color:C.body, lineHeight:1.5 }}>
          The visual is not text. Use the <b style={{ color:C.ink }}>Visual</b> tool to swap the chart, the photograph or the diagram.
        </div>}
        <div style={{ marginTop:14 }}>
          <Eyebrow style={{ marginBottom:6 }}>Annotation</Eyebrow>
          <Input value={s.annot || ""} onChange={v => edit(x => ({ ...x, annot:v }), "Edited annotation")} placeholder="Handwritten margin note (optional)"/>
          <Note style={{ marginTop:8 }} w={250}>keep it to five words, it's a note not a caption</Note>
        </div>
        <div style={{ height:14 }}/>
      </Sheet>

      {/* --- layout --- */}
      <Sheet open={tool === "layout"} onClose={() => setTool(null)} title="Composition" height="80%">
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, paddingBottom:16 }}>
          {LAYOUT_LIST.map(l => (
            <button key={l.id} className="focusable tapf" onClick={() => { edit(x => ({ ...x, layout:l.id, visual:l.visual }), "Changed layout"); toast(l.name, "layout"); }}
              style={{ border:`1px solid ${s.layout === l.id ? C.ink : C.hair}`, borderRadius:12, padding:6 }}>
              <Slide slide={{ ...s, layout:l.id }} styleId={p.style} platformId={p.platform} w={92} radius={5}/>
              <div style={{ fontSize:12, marginTop:6, textAlign:"center", color:s.layout === l.id ? C.ink : C.body }}>{l.name}</div>
            </button>
          ))}
        </div>
      </Sheet>

      {/* --- visual --- */}
      <Sheet open={tool === "visual"} onClose={() => setTool(null)} title="Visual" height="82%">
        <div style={{ display:"grid", placeItems:"center", marginBottom:14 }}>
          <Slide slide={s} styleId={p.style} platformId={p.platform} w={176} radius={8}/>
        </div>
        {s.data?.series && <>
          <Eyebrow style={{ marginBottom:6 }}>Chart type</Eyebrow>
          <Seg value={s.layout} onChange={v => edit(x => ({ ...x, layout:v }), "Chart type")}
            options={[{ id:"bar-chart", name:"Bars" },{ id:"line-chart", name:"Line" },{ id:"comparison", name:"Split" }]}/>
          <div style={{ marginTop:14 }}>
            <Eyebrow style={{ marginBottom:6 }}>Data · from the source table</Eyebrow>
            {(s.data.series || []).map((d, n) => (
              <div key={d.l} style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 0", borderBottom:`1px solid ${C.hair}` }}>
                <span className="mono" style={{ fontSize:12, color:C.body, width:44 }}>{d.l}</span>
                <Meter v={(d.v / Math.max(...s.data.series.map(x => x.v))) * 100}/>
                <span className="mono" style={{ fontSize:12, width:38, textAlign:"right" }}>{d.v}</span>
              </div>
            ))}
            <Note style={{ marginTop:8 }} w={250}>numbers are locked to the source — edit the claim, not the bar</Note>
          </div>
        </>}
        <div style={{ marginTop:16 }}>
          <Eyebrow style={{ marginBottom:8 }}>Photography</Eyebrow>
          <div className="noscroll" style={{ display:"flex", gap:8, overflowX:"auto" }}>
            {ASSETS.filter(a => a.key).map(a => (
              <button key={a.id} className="focusable tapf" onClick={() => { edit(x => ({ ...x, asset:a.key, layout:x.layout.startsWith("photo") ? x.layout : "photo-hero", visual:"photograph" }), "Replaced image"); toast("Image replaced", "image"); }}
                style={{ flex:"0 0 auto", width:74, textAlign:"left" }}>
                <img src={IMG[a.key]} alt={a.name} style={{ width:74, height:92, objectFit:"cover", borderRadius:6,
                  outline:s.asset === a.key ? `1.5px solid ${C.ink}` : "none", outlineOffset:2 }}/>
                <div className="mono" style={{ fontSize:12, color:C.body, marginTop:5, lineHeight:1.3 }}>{a.kind.toUpperCase()}</div>
              </button>
            ))}
          </div>
          <div style={{ display:"flex", gap:8, marginTop:12 }}>
            <Btn variant="secondary" size="sm" icon="wand" onClick={() => { setTool(null); setBusy(true); setTimeout(() => { setBusy(false); setLastNote("Generated an editorial illustration instead: no licensed photo matched this claim."); toast("Asset generated", "wand"); }, 1200); }}>Generate one</Btn>
            {s.asset && <Btn variant="secondary" size="sm" icon="x" onClick={() => edit(x => ({ ...x, asset:null, layout:"statement", visual:"typography" }), "Removed image")}>Remove</Btn>}
          </div>
        </div>
        <div style={{ height:16 }}/>
      </Sheet>

      {/* --- design: preset, colour, type, finish --- */}
      <Sheet open={tool === "style"} onClose={() => setTool(null)} title="Design" height="86%">
        <DesignPanel p={p} s={s} commit={commit} toast={toast}/>
      </Sheet>

      {/* --- ai --- */}
      <Sheet open={tool === "ai"} onClose={() => setTool(null)} title="Tell Carvv what to change">
        <div style={{ display:"grid", gap:8, paddingBottom:16 }}>
          {COMMANDS.map(c => (
            <button key={c.id} className="focusable tapf" onClick={() => runCmd(c.id)}
              style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 14px", border:`1px solid ${C.hair}`, borderRadius:9999, textAlign:"left" }}>
              <Icon n={c.icon} s={16} c={C.charcoal}/><span style={{ flex:1, fontSize:14 }}>{c.label}</span>
              <Icon n="arrowR" s={15} c={C.mute}/>
            </button>
          ))}
          <button className="focusable tapf" onClick={() => { setTool("variants"); }}
            style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 14px", border:`1px solid ${C.hair}`, borderRadius:9999, textAlign:"left" }}>
            <Icon n="layers" s={16} c={C.charcoal}/><span style={{ flex:1, fontSize:14 }}>Give me three hook variants</span>
            <Icon n="arrowR" s={15} c={C.mute}/>
          </button>
          <div style={{ display:"flex", gap:8, marginTop:4 }}>
            <div style={{ flex:1 }}><Input value="" onChange={() => {}} placeholder="Or type an instruction…" icon="cmd"/></div>
            <Btn onClick={() => runCmd("visual")}>Run</Btn>
          </div>
          <div className="mono" style={{ fontSize:12, color:C.body, lineHeight:1.6 }}>
            COMMANDS EDIT THE SLIDE SPECIFICATION, NOT THE PIXELS. THE RENDERER RE-RUNS AFTERWARDS.
          </div>
        </div>
      </Sheet>

      <Sheet open={tool === "variants"} onClose={() => setTool(null)} title="Hook variants" height="82%">
        <Variants p={p} s={s} onPick={(text) => {
          edit(x => (x.quote ? { ...x, quote:text } : { ...x, headline:text }), "Picked a variant");
          setTool(null); toast("Headline swapped", "check");
        }}/>
      </Sheet>

      <Sheet open={tool === "inspect"} onClose={() => setTool(null)} title="AI inspector" height="82%">
        <Inspector p={p} s={s}/>
      </Sheet>

      <Sheet open={tool === "more"} onClose={() => setTool(null)} title="Slide">
        <div style={{ paddingBottom:12 }}>
          <Row icon="copy" title="Duplicate slide" onClick={() => { commit(p.id, x => { const a = [...x.slides]; a.splice(i + 1, 0, { ...JSON.parse(JSON.stringify(s)), id:s.id + "-c" }); return { ...x, slides:a }; }, "Duplicated"); setTool(null); toast("Duplicated", "copy"); }}/>
          <Row icon="refresh" title="Regenerate this slide" onClick={() => { runCmd("visual"); }}/>
          <Row icon="list" title="Back to storyboard" onClick={() => { setTool(null); go("storyboard", { id:p.id }); }}/>
          <Row icon="history" title="Version history" sub={`${p.versions.length} versions`} onClick={() => { setTool(null); go("project", { id:p.id }); }}/>
          <Row icon="download" title="Export" onClick={() => { setTool(null); go("review", { id:p.id }); }}/>
          <Row icon="trash" title="Delete slide" danger last onClick={() => { setTool(null); setDel(true); }}/>
        </div>
      </Sheet>
      <Dialog open={del} onClose={() => setDel(false)} destructive title="Delete this slide?" confirm="Delete"
        body="The story will be renumbered and the narrative re-checked."
        onConfirm={() => { commit(p.id, x => ({ ...x, slides:x.slides.filter((_, n) => n !== i) }), "Deleted slide"); setI(Math.max(0, i - 1)); setDel(false); toast("Slide deleted", "trash"); }}/>
    </>
  );
}

function Field({ label, v, on, rows = 1 }) {
  const [t, setT] = useState(v);
  return (
    <div style={{ marginBottom:12 }}>
      <Eyebrow style={{ marginBottom:6 }}>{label}</Eyebrow>
      <textarea value={t} rows={rows} onChange={e => { setT(e.target.value); on(e.target.value); }}
        style={{ border:`1px solid ${C.hair}`, borderRadius:rows > 1 ? 12 : 9999, padding:rows > 1 ? "10px 12px" : "9px 16px",
          fontSize:rows > 1 ? 15 : 14, resize:"none", lineHeight:1.4 }}/>
    </div>
  );
}

/* ---------------------------------------------------------- design panel */
function DesignPanel({ p, s, commit, toast }) {
  const [seg, setSeg] = useState("preset");
  const deco = p.deco || { grain:false, numbers:false, mark:true, radius:1 };
  const setDeco = (k, v) => commit(p.id, x => ({ ...x, deco:{ ...deco, [k]:v } }), "Changed finish");
  return (
    <div style={{ paddingBottom:16 }}>
      <div style={{ display:"grid", placeItems:"center", marginBottom:12 }}>
        <Slide slide={s} styleId={p.style} platformId={p.platform} w={158} radius={8} deco={deco} index={0} total={p.slides.length}/>
      </div>
      <div style={{ marginBottom:14 }}>
        <Seg small value={seg} onChange={setSeg} options={[
          { id:"preset", name:"Preset" },{ id:"colour", name:"Colour" },{ id:"type", name:"Type" },{ id:"finish", name:"Finish" }]}/>
      </div>

      {seg === "preset" && (
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
          {STYLES.map(x => (
            <button key={x.id} className="focusable tapf"
              onClick={() => { commit(p.id, y => ({ ...y, style:x.id }), "Changed style"); toast(`${x.name} across all ${p.slides.length} slides`, "palette"); }}
              style={{ border:`1px solid ${p.style === x.id ? C.ink : C.hair}`, borderRadius:12, padding:8, textAlign:"left" }}>
              <Slide slide={s} styleId={x.id} platformId={p.platform} w={136} radius={6} deco={deco}/>
              <div style={{ fontSize:12.5, fontWeight:450, marginTop:7 }}>{x.name}</div>
            </button>
          ))}
        </div>
      )}

      {seg === "colour" && (
        <>
          <Eyebrow style={{ marginBottom:8 }}>Palettes · applied as the Custom style</Eyebrow>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
            {PALETTES.map(pl => {
              const d = derive(pl.paper, pl.accent);
              return (
                <button key={pl.id} className="focusable tapf"
                  onClick={() => { setPaletteOn(pl, p, commit); toast(`${pl.name} applied`, "palette"); }}
                  style={{ border:`1px solid ${C.hair}`, borderRadius:12, padding:8, textAlign:"left" }}>
                  <div style={{ background:d.paper, borderRadius:7, padding:"12px 10px", minHeight:70 }}>
                    <div className="mono" style={{ fontSize:12, color:d.body, letterSpacing:".07em" }}>03 — EVIDENCE</div>
                    <div className="disp" style={{ fontSize:15, fontWeight:600, color:d.ink, marginTop:5, lineHeight:1.14 }}>The number that carries it.</div>
                    <div style={{ height:5, width:34, borderRadius:9999, background:d.accent, marginTop:8 }}/>
                  </div>
                  <div style={{ fontSize:12.5, marginTop:7 }}>{pl.name}</div>
                </button>
              );
            })}
          </div>
          <Note style={{ marginTop:12 }} w={250}>body colour and rules are derived, so contrast can't break</Note>
        </>
      )}

      {seg === "type" && (
        <>
          <Eyebrow style={{ marginBottom:8 }}>Display face</Eyebrow>
          {FONTS.map(f => (
            <button key={f.id} className="focusable tapf" onClick={() => setDeco("font", f.id)}
              style={{ width:"100%", display:"flex", gap:12, alignItems:"center", padding:"11px 0", borderBottom:`1px solid ${C.hair}`, textAlign:"left" }}>
              <span className={fontCls(f.id)} style={{ fontSize:26, fontWeight:600, width:48, lineHeight:1 }}>Ag</span>
              <span style={{ flex:1 }}>
                <span style={{ display:"block", fontSize:14.5 }}>{f.name}</span>
                <span style={{ display:"block", fontSize:12.5, color:C.body, marginTop:2 }}>{f.note}</span>
              </span>
              {(deco.font || styleOf(p.style).display) === f.id && <Icon n="check" s={16}/>}
            </button>
          ))}
          <div style={{ display:"flex", alignItems:"center", gap:10, marginTop:14 }}>
            <span style={{ fontSize:13.5, flex:1 }}>Headline scale, this slide</span>
            <div style={{ display:"flex", gap:6 }}>
              {[["0.86", "S"],["1", "M"],["1.14", "L"]].map(([v, n]) => (
                <Chip key={n} s="sm" active={String(s.scale || 1) === v}
                  onClick={() => commit(p.id, x => { const a = [...x.slides]; const k = a.findIndex(z => z.id === s.id); a[k] = { ...a[k], scale:+v }; return { ...x, slides:a }; }, "Type scale")}>{n}</Chip>
              ))}
            </div>
          </div>
          <Btn variant="secondary" full style={{ marginTop:14 }} onClick={() => setDeco("font", null)}>Reset to the preset face</Btn>
        </>
      )}

      {seg === "finish" && (
        <>
          <Eyebrow style={{ marginBottom:4 }}>Texture and marks</Eyebrow>
          <FinishRow t="Paper grain" d="Fine noise over the whole slide" on={!!deco.grain} set={v => setDeco("grain", v)}/>
          <FinishRow t="Slide numbers" d="01/07 in the bottom corner" on={!!deco.numbers} set={v => setDeco("numbers", v)}/>
          <FinishRow t="Carvv watermark" d="The wordmark in the top corner" on={deco.mark !== false} set={v => setDeco("mark", v)}/>
          <div style={{ display:"flex", alignItems:"center", padding:"13px 0", borderBottom:`1px solid ${C.hair}` }}>
            <span style={{ flex:1 }}>
              <span style={{ display:"block", fontSize:15 }}>Corner radius</span>
              <span style={{ display:"block", fontSize:12.5, color:C.body, marginTop:2 }}>How soft the exported card reads</span>
            </span>
            <div style={{ display:"flex", gap:6 }}>
              {[["0", "Sharp"],["1", "Soft"],["2", "Round"]].map(([v, n]) => (
                <Chip key={n} s="sm" active={String(deco.radius ?? 1) === v} onClick={() => setDeco("radius", +v)}>{n}</Chip>
              ))}
            </div>
          </div>
          <Note style={{ marginTop:14 }} w={250}>grain is the one decoration this system allows</Note>
        </>
      )}
    </div>
  );
}
function FinishRow({ t, d, on, set }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:12, padding:"13px 0", borderBottom:`1px solid ${C.hair}` }}>
      <span style={{ flex:1 }}>
        <span style={{ display:"block", fontSize:15 }}>{t}</span>
        <span style={{ display:"block", fontSize:12.5, color:C.body, marginTop:2 }}>{d}</span>
      </span>
      <Switch on={on} label={t} onChange={set}/>
    </div>
  );
}
function setPaletteOn(pl, p, commit) {
  const d = derive(pl.paper, pl.accent);
  if (typeof window !== "undefined") window.__carvvPalette = { ...d, name:pl.name };
  commit(p.id, x => ({ ...x, style:"custom", palette:{ ...d, name:pl.name } }), "Applied palette");
}

/* ---------------------------------------------------------- hook variants */
function Variants({ p, s, onPick }) {
  const [busy, setBusy] = useState(true);
  const [list, setList] = useState([]);
  React.useEffect(() => {
    const t = setTimeout(() => { setList(variantsFor(s, p)); setBusy(false); }, 1100);
    return () => clearTimeout(t);
  }, []);
  if (busy) return (
    <div style={{ padding:"26px 0", display:"grid", justifyItems:"center", gap:10 }}>
      <Spinner/><span className="mono" style={{ fontSize:12, color:C.body }}>WRITING THREE ANGLES…</span>
    </div>
  );
  return (
    <div style={{ paddingBottom:14 }}>
      {list.map(v => (
        <div key={v.kind} style={{ border:`1px solid ${C.hair}`, borderRadius:12, padding:13, marginBottom:9 }}>
          <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:7 }}>
            <Tag tone="soft">{v.kind.toUpperCase()}</Tag>
            <span style={{ fontSize:12, color:C.body }}>{v.why}</span>
          </div>
          <div className="disp" style={{ fontSize:17, fontWeight:600, lineHeight:1.2, letterSpacing:"-0.01em" }}>{v.text}</div>
          <div style={{ display:"flex", gap:8, marginTop:11 }}>
            <Btn size="sm" onClick={() => onPick(v.text)}>Use this</Btn>
            <span style={{ flex:1 }}/>
            <span className="mono" style={{ fontSize:12, color:C.body, alignSelf:"center" }}>{v.text.length} CHARS</span>
          </div>
        </div>
      ))}
      <Note style={{ marginTop:6 }} w={250}>shorter hooks win on mobile, almost always</Note>
    </div>
  );
}
function variantsFor(s, p) {
  const h = (s.headline || s.quote || p.title).replace("\n", " ").replace(/\.$/, "");
  const subject = p.title.replace(/^(why|how|what)\s+/i, "").replace(/'s.*$/, "");
  return [
    { kind:"Contrarian", why:"breaks an assumption", text:`Everything you know about ${subject.toLowerCase()} is the marketing.` },
    { kind:"Number-first", why:"leads with the evidence", text:`${h.match(/\d[\d.,%$]*/) ? h.match(/\d[\d.,%$]*/)[0] : "52%"} of the story happens before anyone buys anything.` },
    { kind:"Shortest", why:"fewest words that still land", text:h.split(" ").slice(0, 7).join(" ") + "." },
  ];
}
