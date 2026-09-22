import React, { useEffect, useMemo, useState } from "react";
import { C, STYLES, styleOf, platformOf, VISUAL_TYPES } from "../lib/tokens";
import { Icon, Mark } from "../lib/icons";
import { Btn, IconBtn, Body, H, Eyebrow, Chip, Sheet, Dialog, Rule, Note, Tag, Meter, Card, Row, Seg,
  EmptyState, SearchPill, Skel, Spinner, Input } from "../lib/ui";
import { useApp } from "../lib/store";
import { Slide } from "../slides/SlideRenderer";
import { Header } from "./create";
import { EXAMPLES, SOURCES } from "../data/projects";
import { ASSETS, IMG } from "../data/assets";

const STATUS = { draft:["soft", "Draft"], storyboard:["warn", "Storyboard"], ready:["ok", "Ready"], exported:["ink", "Exported"] };

function Thumb({ p, w = 54 }) {
  if (p.slides.length) return <Slide slide={p.slides[0]} styleId={p.style} platformId={p.platform} w={w} radius={5}/>;
  const h = w * 1.25;
  return <div style={{ width:w, height:h, borderRadius:5, background:C.soft, display:"grid", placeItems:"center", flex:"0 0 auto" }}>
    <Icon n="pencil" s={15} c={C.mute}/></div>;
}

export function Projects() {
  const { projects, go, toast, removeProject, addProject } = useApp();
  const [q, setQ] = useState("");
  const [f, setF] = useState("all");
  const [sort, setSort] = useState("recent");
  const [menu, setMenu] = useState(null);
  const [del, setDel] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { const t = setTimeout(() => setLoading(false), 620); return () => clearTimeout(t); }, []);
  const list = useMemo(() => {
    let l = projects.filter(p => (f === "all" || p.status === f) && (!q || p.title.toLowerCase().includes(q.toLowerCase())));
    if (sort === "name") l = [...l].sort((a, b) => a.title.localeCompare(b.title));
    if (sort === "slides") l = [...l].sort((a, b) => b.slides.length - a.slides.length);
    return l;
  }, [projects, q, f, sort]);

  return (
    <>
      <Header title="Projects" sub={`${projects.length} stories`} right={
        <div style={{ display:"flex" }}>
          <IconBtn n="sort" label="Sort" onClick={() => setMenu({ kind:"sort" })}/>
          <IconBtn n="plus" label="New" onClick={() => go("create")}/>
        </div>}/>
      <div style={{ padding:"0 18px 10px" }}>
        <SearchPill value={q} onChange={setQ} placeholder="Search projects"/>
        <div className="noscroll" style={{ display:"flex", gap:6, overflowX:"auto", marginTop:10 }}>
          {[["all", "All"],["ready", "Ready"],["exported", "Exported"],["storyboard", "Storyboard"],["draft", "Drafts"]].map(([k, n]) =>
            <Chip key={k} s="sm" active={f === k} onClick={() => setF(k)}>{n}</Chip>)}
        </div>
      </div>
      <div className="noscroll" style={{ flex:1, overflowY:"auto", padding:"0 18px 18px" }}>
        {loading ? [0, 1, 2].map(i => (
          <div key={i} style={{ display:"flex", gap:12, padding:"12px 0", borderBottom:`1px solid ${C.hair}` }}>
            <Skel w={54} h={68} r={5}/>
            <div style={{ flex:1, display:"grid", gap:8, alignContent:"center" }}><Skel w="80%" h={13}/><Skel w="45%" h={10}/></div>
          </div>
        )) : list.length ? list.map(p => {
          const [tone, label] = STATUS[p.status];
          return (
            <div key={p.id} style={{ display:"flex", gap:12, alignItems:"center", padding:"12px 0", borderBottom:`1px solid ${C.hair}` }}>
              <button className="focusable tapf" onClick={() => go("project", { id:p.id })} style={{ display:"flex", gap:12, alignItems:"center", flex:1, minWidth:0, textAlign:"left" }}>
                <Thumb p={p}/>
                <span style={{ flex:1, minWidth:0 }}>
                  <span style={{ display:"block", fontSize:14.5, fontWeight:450, lineHeight:1.3 }}>{p.title}</span>
                  <span className="mono" style={{ display:"block", fontSize:12, color:C.body, marginTop:4, letterSpacing:".03em" }}>
                    {platformOf(p.platform).name.toUpperCase()} · {styleOf(p.style).name.toUpperCase()} · {p.slides.length} SLIDES</span>
                  <span style={{ display:"flex", alignItems:"center", gap:6, marginTop:6 }}>
                    <Tag tone={tone} mono={false}>{label}</Tag>
                    <span style={{ fontSize:12, color:C.mute }}>{p.updated}</span>
                  </span>
                </span>
              </button>
              <IconBtn n="dots" s={17} tone="mute" label={`${p.title} menu`} onClick={() => setMenu({ kind:"project", p })}/>
            </div>
          );
        }) : q || f !== "all"
          ? <EmptyState icon="search" title="Nothing here" body={`No ${f === "all" ? "" : f + " "}project matches “${q || f}”.`}
              action={<Btn variant="secondary" onClick={() => { setQ(""); setF("all"); }}>Clear filters</Btn>}/>
          : <EmptyState art={<Mark s={40} c={C.mute}/>} title="No stories yet" body="Paste a topic or a URL and Carvv will research it, find the story and design the slides."
              action={<Btn icon="spark" onClick={() => go("create")}>Create your first</Btn>}/>}
      </div>

      <Sheet open={menu?.kind === "sort"} onClose={() => setMenu(null)} title="Sort by">
        <div style={{ paddingBottom:12 }}>
          {[["recent", "Most recent"],["name", "Title A–Z"],["slides", "Most slides"]].map(([k, n], i, a) =>
            <Row key={k} title={n} last={i === a.length - 1} right={sort === k ? <Icon n="check" s={16}/> : null} onClick={() => { setSort(k); setMenu(null); }}/>)}
        </div>
      </Sheet>
      <Sheet open={menu?.kind === "project"} onClose={() => setMenu(null)} title={menu?.p?.title}>
        <div style={{ paddingBottom:12 }}>
          <Row icon="eye" title="Open" onClick={() => { go("project", { id:menu.p.id }); setMenu(null); }}/>
          {menu?.p?.slides.length ? <Row icon="pencil" title="Edit slides" onClick={() => { go("editor", { id:menu.p.id, index:0 }); setMenu(null); }}/> : null}
          <Row icon="copy" title="Duplicate" onClick={() => {
            const c = JSON.parse(JSON.stringify(menu.p)); c.id = "d" + Date.now().toString(36).slice(-4);
            c.title = menu.p.title + " (copy)"; c.updated = "just now"; addProject(c); setMenu(null); toast("Duplicated", "copy"); }}/>
          {menu?.p?.slides.length ? <Row icon="download" title="Export" onClick={() => { go("export", { id:menu.p.id }); setMenu(null); }}/> : null}
          <Row icon="trash" title="Delete project" danger last onClick={() => { setDel(menu.p); setMenu(null); }}/>
        </div>
      </Sheet>
      <Dialog open={!!del} onClose={() => setDel(null)} destructive title="Delete this project?" confirm="Delete"
        body={`“${del?.title}” and its ${del?.slides.length || 0} slides, research and exports will go.`}
        onConfirm={() => { removeProject(del.id); setDel(null); toast("Project deleted", "trash"); }}/>
    </>
  );
}

export function ProjectDetail({ id }) {
  const { project, go, commit, toast, removeProject, reset } = useApp();
  const p = project(id);
  const [menu, setMenu] = useState(false);
  const [ren, setRen] = useState(null);
  const [del, setDel] = useState(false);
  if (!p) return <EmptyState title="Not found" body="This project was deleted." action={<Btn onClick={() => reset("projects")}>All projects</Btn>}/>;
  const st = styleOf(p.style), pf = platformOf(p.platform);
  const [tone, label] = STATUS[p.status];
  return (
    <>
      <Header title={p.title} sub={`${pf.name} · ${st.name}`} back right={<IconBtn n="dots" label="Menu" onClick={() => setMenu(true)}/>}/>
      <div className="noscroll" style={{ flex:1, overflowY:"auto", padding:"0 18px 18px" }}>
        {p.slides.length ? (
          <>
            <button className="focusable tapf" onClick={() => go("viewer", { id:p.id })} style={{ width:"100%", display:"grid", placeItems:"center", marginBottom:12 }}>
              <Slide slide={p.slides[0]} styleId={p.style} platformId={p.platform} w={220} radius={10}/>
            </button>
            <div style={{ display:"flex", gap:8, marginBottom:16 }}>
              <Btn full icon="play" onClick={() => go("viewer", { id:p.id })}>Open</Btn>
              <Btn variant="secondary" icon="pencil" onClick={() => go("editor", { id:p.id, index:0 })}>Edit</Btn>
              <Btn variant="secondary" icon="download" onClick={() => go("review", { id:p.id })}>Export</Btn>
            </div>
          </>
        ) : (
          <EmptyState icon="pencil" title="Still a draft" body="You saved the idea but never ran the research. Pick it up now?"
            action={<Btn icon="spark" onClick={() => go("generating")}>Generate the story</Btn>}/>
        )}
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
          <Tag tone={tone} mono={false}>{label}</Tag>
          {p.score && <Tag tone="soft">QUALITY {p.score}</Tag>}
          <span style={{ fontSize:12, color:C.mute, marginLeft:"auto" }}>Updated {p.updated}</span>
        </div>
        <Card pad={13} style={{ marginBottom:14 }}>
          <Eyebrow style={{ marginBottom:6 }}>Input</Eyebrow>
          <div className="mono" style={{ fontSize:12, lineHeight:1.5, color:C.charcoal, wordBreak:"break-all" }}>{p.input.value}</div>
          <div className="mono" style={{ fontSize:12, color:C.body, marginTop:6 }}>{p.input.type.toUpperCase()} · CREATED {p.created.toUpperCase()}</div>
        </Card>
        {p.slides.length > 0 && <>
          <Eyebrow style={{ marginBottom:8 }}>Storyboard</Eyebrow>
          <div className="noscroll" style={{ display:"flex", gap:6, overflowX:"auto", paddingBottom:8 }}>
            {p.slides.map((s, i) => <button key={s.id} className="focusable tapf" onClick={() => go("viewer", { id:p.id, start:i })} style={{ flex:"0 0 auto" }}>
              <Slide slide={s} styleId={p.style} platformId={p.platform} w={66} radius={5}/></button>)}
          </div>
          <div style={{ marginTop:8 }}>
            <Row icon="list" title="Open storyboard" sub={`${p.slides.length} beats`} onClick={() => go("storyboard", { id:p.id })}/>
            <Row icon="book" title="Research & evidence" sub={`${p.sources.length} sources`} onClick={() => go("research", { id:p.id })}/>
            <Row icon="shield" title="Critic report" sub="Content, design, story, platform" onClick={() => go("qa", { id:p.id })}/>
          </div>
        </>}
        {p.versions.length > 0 && <>
          <Eyebrow style={{ margin:"18px 0 8px" }}>History</Eyebrow>
          {p.versions.map(v => (
            <div key={v.v} style={{ display:"flex", gap:10, padding:"10px 0", borderBottom:`1px solid ${C.hair}` }}>
              <span className="mono" style={{ fontSize:12, color:C.ink, width:26 }}>{v.v}</span>
              <span style={{ flex:1, fontSize:13.5 }}>{v.what}</span>
              <span style={{ fontSize:12, color:C.mute }}>{v.when}</span>
            </div>
          ))}
        </>}
        {p.exports.length > 0 && <>
          <Eyebrow style={{ margin:"18px 0 8px" }}>Exports</Eyebrow>
          {p.exports.map((e, i) => (
            <div key={i} style={{ display:"flex", gap:10, padding:"10px 0", borderBottom:`1px solid ${C.hair}` }}>
              <Icon n="download" s={15} c={C.charcoal}/>
              <span style={{ flex:1, fontSize:13.5 }}>{e.what}</span>
              <span className="mono" style={{ fontSize:12, color:C.body }}>{e.size}</span>
            </div>
          ))}
        </>}
      </div>
      <Sheet open={menu} onClose={() => setMenu(false)} title="Project">
        <div style={{ paddingBottom:12 }}>
          <Row icon="pencil" title="Rename" onClick={() => { setRen(p.title); setMenu(false); }}/>
          <Row icon="palette" title="Change style" onClick={() => { setMenu(false); go("styles"); }}/>
          <Row icon="refresh" title="Regenerate story" onClick={() => { setMenu(false); go("generating"); }}/>
          <Row icon="trash" title="Delete project" danger last onClick={() => { setMenu(false); setDel(true); }}/>
        </div>
      </Sheet>
      <Sheet open={ren !== null} onClose={() => setRen(null)} title="Rename"
        footer={<Btn full onClick={() => { commit(p.id, x => ({ ...x, title:ren }), "Renamed"); setRen(null); toast("Renamed", "check"); }}>Save</Btn>}>
        <div style={{ paddingBottom:10 }}><Input value={ren || ""} onChange={setRen} autoFocus/></div>
      </Sheet>
      <Dialog open={del} onClose={() => setDel(false)} destructive title="Delete this project?" confirm="Delete"
        body="Slides, research, assets and exports all go with it." onConfirm={() => { removeProject(p.id); reset("projects"); toast("Project deleted", "trash"); }}/>
    </>
  );
}

/* ---------------------------------------------------------- styles */
const STYLE_SAMPLE = {
  id:"ss", purpose:"HOOK", layout:"statement", kicker:"01 — Hook", headline:"Same story.\nDifferent voice.",
  body:"A preset is a whole point of view: type, palette, density, crop, how loud the accent is allowed to be.",
  foot:"Style preview", density:{ text:"med", visual:"low" },
};
export function Styles() {
  const { go, draft, setDraft, toast } = useApp();
  return (
    <>
      <Header title="Styles" sub="8 visual directions" right={<IconBtn n="target" label="Brand DNA" onClick={() => go("brand")}/>}/>
      <div className="noscroll" style={{ flex:1, overflowY:"auto", padding:"0 18px 18px" }}>
        <Body s={14} style={{ marginBottom:14 }}>A style changes composition, density and crop, not just the background colour.</Body>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
          {STYLES.map(s => (
            <button key={s.id} className="focusable tapf" onClick={() => go("style", { id:s.id })} style={{ textAlign:"left" }}>
              <Slide slide={STYLE_SAMPLE} styleId={s.id} w={155} radius={8}/>
              <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:7 }}>
                <span className="disp" style={{ fontSize:14, fontWeight:600 }}>{s.name}</span>
                {draft.style === s.id && <Tag tone="ink" mono={false}>In use</Tag>}
              </div>
              <div style={{ fontSize:12, color:C.body, marginTop:2, lineHeight:1.35 }}>{s.blurb}</div>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
export function StyleDetail({ id }) {
  const { go, draft, setDraft, toast, projects, commit } = useApp();
  const s = styleOf(id);
  const [apply, setApply] = useState(false);
  const demo = projects.find(p => p.slides.length >= 3);
  return (
    <>
      <Header title={s.name} sub="Visual direction" back/>
      <div className="noscroll" style={{ flex:1, overflowY:"auto", padding:"0 18px 18px" }}>
        <div className="noscroll" style={{ display:"flex", gap:10, overflowX:"auto", paddingBottom:8 }}>
          {(demo?.slides || [STYLE_SAMPLE]).slice(0, 4).map(x => <Slide key={x.id} slide={x} styleId={s.id} w={168} radius={9}/>)}
        </div>
        <H s={22} style={{ margin:"14px 0 6px" }}>{s.blurb}</H>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap", margin:"10px 0 16px" }}>
          {s.traits.map(t => <Tag key={t} tone="soft">{t}</Tag>)}
        </div>
        <Eyebrow style={{ marginBottom:8 }}>Palette</Eyebrow>
        <div style={{ display:"flex", gap:8, marginBottom:16 }}>
          {[["paper", s.paper],["ink", s.ink],["accent", s.accent],["rule", s.rule]].map(([n, c]) => (
            <div key={n} style={{ flex:1 }}>
              <div style={{ height:46, borderRadius:8, background:c, border:`1px solid ${C.hair}` }}/>
              <div className="mono" style={{ fontSize:12, color:C.body, marginTop:5 }}>{n.toUpperCase()}</div>
            </div>
          ))}
        </div>
        <Row icon="type" title="Display face" sub={s.display === "hand" ? "Caveat · handwritten" : "Nunito · rounded geometric"} right={null}/>
        <Row icon="layout" title="Alignment" sub={s.align === "center" ? "Centred, wide tracking" : "Left, asymmetric"} right={null}/>
        <Row icon="spark" title="Annotations" sub={s.annot ? "Handwritten margin notes on" : "No annotations"} right={null} last/>
      </div>
      <div style={{ padding:"10px 18px calc(14px + env(safe-area-inset-bottom))", borderTop:`1px solid ${C.hair}`, display:"flex", gap:8 }}>
        <Btn variant="secondary" full onClick={() => setApply(true)}>Apply to project</Btn>
        <Btn full onClick={() => { setDraft({ ...draft, style:s.id }); toast(`${s.name} set as default`, "palette"); go("create"); }}>Use for new</Btn>
      </div>
      <Sheet open={apply} onClose={() => setApply(false)} title="Apply to which project?">
        <div style={{ paddingBottom:12 }}>
          {projects.filter(p => p.slides.length).map((p, i, a) => (
            <Row key={p.id} title={p.title} sub={`${p.slides.length} slides · ${styleOf(p.style).name}`} last={i === a.length - 1}
              onClick={() => { commit(p.id, x => ({ ...x, style:s.id }), "Changed style"); setApply(false); toast(`${s.name} applied to ${p.title}`, "palette"); }}/>
          ))}
        </div>
      </Sheet>
    </>
  );
}

/* ---------------------------------------------------------- assets */
export function AssetsScreen() {
  const { assets, toast, go } = useApp();
  const [f, setF] = useState("all");
  const [open, setOpen] = useState(null);
  const [up, setUp] = useState(false);
  const list = assets.filter(a => f === "all" || a.kind === f);
  return (
    <>
      <Header title="Assets" sub={`${assets.length} in the library`} right={<IconBtn n="plus" label="Upload" onClick={() => setUp(true)}/>}/>
      <div style={{ padding:"0 18px 12px" }}>
        <Seg value={f} onChange={setF} options={[{ id:"all", name:"All" },{ id:"real", name:"Retrieved" },{ id:"generated", name:"Generated" }]}/>
      </div>
      <div className="noscroll" style={{ flex:1, overflowY:"auto", padding:"0 18px 18px" }}>
        <Note style={{ marginBottom:12 }} w={270}>retrieve what exists, generate what has to be invented</Note>
        {list.length ? (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8 }}>
            {list.map(a => (
              <button key={a.id} className="focusable tapf" onClick={() => setOpen(a)} style={{ textAlign:"left" }}>
                <div style={{ position:"relative", borderRadius:8, overflow:"hidden", background:C.soft, height:104, display:"grid", placeItems:"center" }}>
                  {a.key ? <img src={IMG[a.key]} alt={a.name} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                    : <Icon n={a.type === "chart" ? "chart" : a.type === "map" ? "globe" : a.type === "screenshot" ? "layout" : "target"} s={22} c={C.mute}/>}
                  <span style={{ position:"absolute", top:6, left:6, background:a.kind === "real" ? "rgba(255,255,255,.92)" : C.dark,
                    color:a.kind === "real" ? C.ink : "#fff", borderRadius:9999, padding:"2px 7px", fontSize:9 }} className="mono">
                    {a.kind === "real" ? "REAL" : "GEN"}</span>
                </div>
                <div style={{ fontSize:12, marginTop:6, lineHeight:1.3, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{a.name}</div>
              </button>
            ))}
          </div>
        ) : <EmptyState icon="layers" title="No generated assets yet" body="Charts, diagrams and illustrations Carvv builds for you land here with their provenance attached."/>}
      </div>
      <Sheet open={!!open} onClose={() => setOpen(null)} title="Asset" height="76%">
        {open && <div style={{ paddingBottom:16 }}>
          <div style={{ borderRadius:12, overflow:"hidden", background:C.soft, height:190, display:"grid", placeItems:"center", marginBottom:14 }}>
            {open.key ? <img src={IMG[open.key]} alt={open.name} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
              : <Icon n="chart" s={32} c={C.mute}/>}
          </div>
          <H s={19} style={{ marginBottom:4 }}>{open.name}</H>
          <div className="mono" style={{ fontSize:12, color:C.body, marginBottom:14 }}>{open.type.toUpperCase()} · {open.dims} · {open.kind === "real" ? "RETRIEVED" : "GENERATED"}</div>
          <Eyebrow style={{ marginBottom:6 }}>Provenance</Eyebrow>
          {[["Source", open.prov.src],["Detail", open.prov.detail],["Added", open.prov.got],["Used on", `${open.used.length} slide${open.used.length === 1 ? "" : "s"}`]]
            .map(([k, v]) => <div key={k} style={{ display:"flex", justifyContent:"space-between", gap:12, padding:"8px 0", borderBottom:`1px solid ${C.hair}` }}>
              <span style={{ fontSize:13, color:C.body }}>{k}</span><span style={{ fontSize:13, textAlign:"right" }}>{v}</span></div>)}
          <div style={{ display:"flex", gap:8, marginTop:16 }}>
            <Btn variant="secondary" full icon="refresh" onClick={() => { setOpen(null); toast("Regenerating asset…", "wand"); }}>Regenerate</Btn>
            <Btn variant="secondary" full icon="image" onClick={() => { setOpen(null); toast("Pick a slide to place it on", "image"); }}>Place</Btn>
          </div>
        </div>}
      </Sheet>
      <Sheet open={up} onClose={() => setUp(false)} title="Add assets">
        <div style={{ border:`1px dashed ${C.hair2}`, borderRadius:12, padding:"28px 16px", textAlign:"center", marginBottom:12 }}>
          <Icon n="image" s={22} c={C.mute}/>
          <div style={{ fontSize:14, marginTop:8 }}>Drop images, logos or screenshots</div>
          <div className="mono" style={{ fontSize:12, color:C.body, marginTop:4 }}>PNG, JPG, SVG · UP TO 25 MB</div>
        </div>
        <Row icon="camera" title="Take a screenshot" sub="Carvv will crop and annotate it" onClick={() => { setUp(false); toast("Screen capture is desktop-only", "info"); }}/>
        <Row icon="wand" title="Generate an illustration" sub="Editorial, matched to your style" last onClick={() => { setUp(false); toast("Describe it in the editor's AI panel", "spark"); }}/>
        <div style={{ height:14 }}/>
      </Sheet>
    </>
  );
}

/* ---------------------------------------------------------- examples */
export function Examples() {
  const { go, setDraft, draft, toast } = useApp();
  const [open, setOpen] = useState(null);
  return (
    <>
      <Header title="Examples" sub="Eight visual languages" back/>
      <div className="noscroll" style={{ flex:1, overflowY:"auto", padding:"0 18px 18px" }}>
        <Body s={14} style={{ marginBottom:14 }}>Real generations, not templates. Open one to see the story structure it used.</Body>
        {EXAMPLES.map(e => (
          <button key={e.id} className="focusable tapf" onClick={() => setOpen(e)}
            style={{ width:"100%", display:"flex", gap:12, alignItems:"center", padding:"12px 0", borderBottom:`1px solid ${C.hair}`, textAlign:"left" }}>
            <Slide slide={e.slide} styleId={e.style} w={74} radius={6}/>
            <span style={{ flex:1, minWidth:0 }}>
              <span className="mono" style={{ display:"block", fontSize:12, color:C.body, letterSpacing:".06em" }}>{e.kind.toUpperCase()}</span>
              <span style={{ display:"block", fontSize:14.5, fontWeight:450, marginTop:3, lineHeight:1.3 }}>{e.title}</span>
              <span style={{ display:"block", fontSize:12, color:C.body, marginTop:4 }}>{e.slides} slides · {styleOf(e.style).name} · {e.likes} saves</span>
            </span>
            <Icon n="chevR" s={16} c={C.mute}/>
          </button>
        ))}
        <div style={{ height:10 }}/>
      </div>
      <Sheet open={!!open} onClose={() => setOpen(null)} title={open?.kind} height="84%"
        footer={<Btn full icon="spark" onClick={() => { setDraft({ ...draft, input:open.title, style:open.style }); setOpen(null); toast("Loaded into Create", "spark"); go("create"); }}>Remix this story</Btn>}>
        {open && <div style={{ paddingBottom:12 }}>
          <div style={{ display:"grid", placeItems:"center", marginBottom:14 }}>
            <Slide slide={open.slide} styleId={open.style} w={228} radius={10}/>
          </div>
          <H s={20} style={{ marginBottom:6 }}>{open.title}</H>
          <Body s={14} style={{ marginBottom:14 }}>{styleOf(open.style).blurb}</Body>
          <Eyebrow style={{ marginBottom:6 }}>Why this visual</Eyebrow>
          <div className="hand" style={{ fontSize:19, color:C.charcoal, lineHeight:1.25, marginBottom:14 }}>
            {open.slide.layout === "bar-chart" ? "five years of one line item is a shape, and a shape reads faster than a sentence"
              : open.slide.layout === "line-chart" ? "the uncertainty band is the story, so the band gets the ink"
              : open.slide.layout === "quote" ? "a voice breaks the rhythm right before the close"
              : open.slide.layout === "timeline" ? "three dates carry a decade better than three paragraphs"
              : open.slide.layout === "steps" ? "a process is a sequence, so it gets numbers"
              : "showing the actual field beats describing it"}
          </div>
          <Eyebrow style={{ marginBottom:6 }}>Specification</Eyebrow>
          {[["purpose", open.slide.purpose],["layout", open.slide.layout],["style", open.style],["text_density", open.slide.density?.text]]
            .map(([k, v]) => <div key={k} className="mono" style={{ display:"flex", justifyContent:"space-between", fontSize:12, padding:"3px 0", color:C.body }}>
              <span>{k}</span><span style={{ color:C.ink }}>{v}</span></div>)}
        </div>}
      </Sheet>
    </>
  );
}
