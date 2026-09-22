import React, { useState } from "react";
import { C, STYLES, styleOf } from "../lib/tokens";
import { Icon, Mark, Wordmark } from "../lib/icons";
import { Btn, IconBtn, Body, H, Eyebrow, Chip, Sheet, Dialog, Rule, Note, Tag, Meter, Card, Row, Seg,
  EmptyState, SearchPill, Switch, Input, Spinner } from "../lib/ui";
import { useApp } from "../lib/store";
import { Slide } from "../slides/SlideRenderer";
import { Header } from "./create";
import { remoteSignOut } from "../lib/appwrite";

export function You() {
  const { user, go, setPhase, setUser, brand, projects, toast } = useApp();
  const [out, setOut] = useState(false);
  const initials = (user?.name || "You").split(" ").map(w => w[0]).slice(0, 2).join("");
  const used = projects.filter(p => p.slides.length).length;
  return (
    <>
      <Header title="You" right={<IconBtn n="cmd" label="Command palette" onClick={() => go("palette")}/>}/>
      <div className="noscroll" style={{ flex:1, overflowY:"auto", padding:"0 18px 18px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
          <div className="disp" style={{ width:52, height:52, borderRadius:9999, background:C.ink, color:"#fff",
            display:"grid", placeItems:"center", fontSize:19, fontWeight:600 }}>{initials}</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div className="disp" style={{ fontSize:18, fontWeight:600 }}>{user?.name || "Guest"}</div>
            <div style={{ fontSize:13, color:C.body, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user?.email || "not signed in"}</div>
          </div>
          <Tag tone="ink" mono={false}>{user?.plan || "Free"}</Tag>
        </div>
        <Card pad={14} style={{ marginBottom:16 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
            <Eyebrow>This month</Eyebrow>
            <span className="mono" style={{ fontSize:12, color:C.body }}>{used} / 50 CAROUSELS</span>
          </div>
          <Meter v={(used / 50) * 100}/>
          <div style={{ display:"flex", gap:16, marginTop:12 }}>
            {[["Sources read", "41"],["Assets made", "12"],["Exports", "3"]].map(([k, v]) => (
              <div key={k}><div className="disp" style={{ fontSize:19, fontWeight:600 }}>{v}</div>
                <div className="mono" style={{ fontSize:12, color:C.body, marginTop:1 }}>{k.toUpperCase()}</div></div>
            ))}
          </div>
        </Card>
        <Eyebrow style={{ marginBottom:4 }}>Studio</Eyebrow>
        <Row icon="target" title="Brand DNA" sub={`${brand.name} · ${brand.active ? "on" : "off"}`} onClick={() => go("brand")}/>
        <Row icon="palette" title="Styles" sub="8 visual directions" onClick={() => go("styles")}/>
        <Row icon="grid" title="Examples" sub="See what Carvv can do" onClick={() => go("examples")} last/>
        <Eyebrow style={{ margin:"18px 0 4px" }}>Account</Eyebrow>
        <Row icon="bolt" title="Plan & billing" sub={`${user?.plan || "Free"} · renews 14 Oct`} onClick={() => go("plan")}/>
        <Row icon="sliders" title="Preferences" sub="Autosave, motion, export defaults" onClick={() => go("prefs")}/>
        <Row icon="bell" title="Notifications" sub="2 unread" onClick={() => go("notifications")}/>
        <Row icon="user" title="Account & security" onClick={() => go("account")} last/>
        <Eyebrow style={{ margin:"18px 0 4px" }}>About</Eyebrow>
        <Row icon="info" title="What's new" sub="v1.4 · Dot maps and the critic panel" onClick={() => toast("Release notes are web-only for now", "info")}/>
        <Row icon="shield" title="Privacy" sub="Your sources never train anything" onClick={() => toast("Opened privacy summary", "shield")}/>
        <Row icon="book" title="Help & support" onClick={() => toast("Support chat is coming to mobile", "info")} last/>
        <div style={{ marginTop:18 }}>
          <Btn full variant="secondary" icon="logout" onClick={() => setOut(true)}>Sign out</Btn>
        </div>
        <div style={{ display:"grid", placeItems:"center", gap:6, padding:"22px 0 6px" }}>
          <Mark s={22} c={C.mute}/>
          <span className="mono" style={{ fontSize:12, color:C.body, letterSpacing:".06em" }}>CARVV 1.4.0 · DEMO BUILD</span>
          <span className="hand" style={{ fontSize:17, color:C.mute }}>weave ideas into visual stories</span>
        </div>
      </div>
      <Dialog open={out} onClose={() => setOut(false)} title="Sign out?" confirm="Sign out" destructive
        body="Your projects stay on this device." onConfirm={() => { remoteSignOut(); setUser(null); setPhase("auth"); }}/>
    </>
  );
}

const PLANS = [
  { id:"free", name:"Free", price:"$0", per:"forever", blurb:"See whether it thinks like you do.",
    feats:["3 carousels a month", "Full research engine", "Editorial + Minimal styles", "PNG export, 1x"] },
  { id:"pro", name:"Pro", price:"$20", per:"per month", blurb:"For people who publish every week.",
    feats:["50 carousels a month", "All 8 styles + Brand DNA", "Generated illustrations", "PDF + package export, 3x", "Version history"] },
  { id:"max", name:"Max", price:"$60", per:"per month", dark:true, blurb:"Solve harder sources, faster.",
    feats:["Unlimited carousels", "Long documents and paywalled PDFs", "Priority research agents", "Team brand kits", "API access"] },
];
const FAQ = [
  ["Does Carvv make up statistics?", "No. Every figure has to come from a source in the evidence panel. If research comes back thin, the slide is marked as a placeholder instead."],
  ["Can I edit what it designs?", "All of it. Text, layout, chart type, crop, palette. Edits change the slide specification, so regeneration respects them."],
  ["Who owns the output?", "You do. Retrieved photography carries its licence in the asset provenance panel."],
  ["What happens to my sources?", "They stay in your project. Nothing you upload is used to train a model."],
];
export function Plan() {
  const { user, setUser, toast } = useApp();
  return (
    <>
      <Header title="Plans" sub="Start local. Scale cloud." back/>
      <div className="noscroll" style={{ flex:1, overflowY:"auto", padding:"0 18px 22px" }}>
        {PLANS.map(p => {
          const current = (user?.plan || "Free").toLowerCase() === p.id;
          return (
            <div key={p.id} style={{ background:p.dark ? C.dark : C.canvas, color:p.dark ? "#fff" : C.ink,
              border:p.dark ? "1px solid transparent" : `1px solid ${C.hair}`, borderRadius:12, padding:20, marginBottom:12 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                <Mark s={22} c={p.dark ? "#fff" : C.ink}/>
                <span className="disp" style={{ fontSize:19, fontWeight:600 }}>{p.name}</span>
                {current && <Tag tone={p.dark ? "soft" : "ink"} mono={false}>Current</Tag>}
              </div>
              <div style={{ fontSize:13.5, color:p.dark ? "rgba(255,255,255,.7)" : C.body, marginTop:8 }}>{p.blurb}</div>
              <div style={{ display:"flex", alignItems:"baseline", gap:6, margin:"14px 0" }}>
                <span className="disp" style={{ fontSize:32, fontWeight:600, letterSpacing:"-0.02em" }}>{p.price}</span>
                <span style={{ fontSize:13, color:p.dark ? "rgba(255,255,255,.7)" : C.body }}>{p.per}</span>
              </div>
              <Btn full variant={p.dark ? "ondark" : current ? "soft" : "primary"} disabled={current}
                onClick={() => { setUser({ ...(user || { name:"You", email:"you@studio.com" }), plan:p.name }); toast(`${p.name} active`, "bolt"); }}>
                {current ? "Your plan" : `Get ${p.name}`}
              </Btn>
              <div style={{ height:1, background:p.dark ? "rgba(255,255,255,.16)" : C.hair, margin:"16px 0" }}/>
              <div className="mono" style={{ fontSize:12, color:p.dark ? "rgba(255,255,255,.6)" : C.mute, marginBottom:8 }}>
                {p.id === "free" ? "INCLUDED" : "EVERYTHING BEFORE, PLUS"}</div>
              {p.feats.map(f => (
                <div key={f} style={{ display:"flex", gap:9, alignItems:"flex-start", marginBottom:7 }}>
                  <Icon n="check" s={14} c={p.dark ? "#fff" : C.ink} w={2.2} style={{ marginTop:2 }}/>
                  <span style={{ fontSize:13.5, color:p.dark ? "rgba(255,255,255,.82)" : C.charcoal, lineHeight:1.4 }}>{f}</span>
                </div>
              ))}
            </div>
          );
        })}
        <H s={21} style={{ margin:"22px 0 10px" }}>Frequently asked questions</H>
        {FAQ.map(([q, a]) => (
          <div key={q} style={{ padding:"14px 0", borderBottom:`1px solid ${C.hair}` }}>
            <div className="disp" style={{ fontSize:16, fontWeight:500, marginBottom:5 }}>{q}</div>
            <Body s={14}>{a}</Body>
          </div>
        ))}
        <Note style={{ marginTop:16 }} w={250}>cancel any time, nothing is held hostage</Note>
      </div>
    </>
  );
}

const SWATCHES = ["#141210", "#B23A22", "#FBF8F3", "#4A443C", "#2F5D3A", "#C8A96A", "#1B4965", "#F2E900", "#FF6B35", "#0B0F14"];
const TONES = ["Editorial", "Specific", "Dry", "Warm", "Punchy", "Academic", "Playful", "Plain"];
export function Brand() {
  const { brand, setBrand, toast, projects } = useApp();
  const [pick, setPick] = useState(null);
  const [addRef, setAddRef] = useState(false);
  const [ref, setRef] = useState("");
  const demo = projects.find(p => p.slides.length);
  return (
    <>
      <Header title="Brand DNA" sub={brand.name} back right={<Switch on={brand.active} label="Brand DNA active" onChange={v => { setBrand({ ...brand, active:v }); toast(v ? "Brand DNA on" : "Brand DNA off", "target"); }}/>}/>
      <div className="noscroll" style={{ flex:1, overflowY:"auto", padding:"0 18px 18px" }}>
        <Body s={14} style={{ marginBottom:14 }}>Saved once, applied to every generation. Carvv treats this as constraint, not decoration.</Body>
        <div style={{ display:"flex", gap:12, alignItems:"center", marginBottom:16 }}>
          <div className="disp" style={{ width:56, height:56, borderRadius:12, background:brand.colors[0], color:brand.colors[2],
            display:"grid", placeItems:"center", fontSize:18, fontWeight:700 }}>{brand.logo}</div>
          <div style={{ flex:1 }}>
            <Input value={brand.name} onChange={v => setBrand({ ...brand, name:v })}/>
            <div className="mono" style={{ fontSize:12, color:C.body, marginTop:6 }}>USED BY {projects.filter(p => p.style === "custom").length || 2} PROJECTS</div>
          </div>
        </div>
        <Eyebrow style={{ marginBottom:8 }}>Palette</Eyebrow>
        <div style={{ display:"flex", gap:8, marginBottom:8 }}>
          {brand.colors.map((c, i) => (
            <button key={i} className="focusable tap" onClick={() => setPick(i)} style={{ flex:1 }}>
              <div style={{ height:52, borderRadius:8, background:c, border:`1px solid ${C.hair}` }}/>
              <div className="mono" style={{ fontSize:12, color:C.body, marginTop:5 }}>{c.toUpperCase()}</div>
            </button>
          ))}
        </div>
        <Note style={{ marginBottom:16 }} w={240}>tap a swatch to change it</Note>
        <Eyebrow style={{ marginBottom:8 }}>Preview</Eyebrow>
        {demo && <div style={{ display:"grid", placeItems:"center", marginBottom:16 }}>
          <Slide slide={demo.slides[1] || demo.slides[0]} styleId="custom" w={180} radius={9}/>
        </div>}
        <Row icon="type" title="Type pair" sub={brand.pair} onClick={() => toast("Nunito / Inter locked in this build", "type")}/>
        <Row icon="image" title="Illustration style" sub={brand.illo} onClick={() => toast("Illustration style saved", "image")}/>
        <Row icon="spark" title="Icon style" sub={brand.icon} onClick={() => toast("Icon style saved", "spark")} last/>
        <Eyebrow style={{ margin:"18px 0 8px" }}>Tone</Eyebrow>
        <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
          {TONES.map(t => (
            <Chip key={t} s="sm" active={brand.tone.includes(t)}
              onClick={() => setBrand({ ...brand, tone:brand.tone.includes(t) ? brand.tone.filter(x => x !== t) : [...brand.tone, t] })}>{t}</Chip>
          ))}
        </div>
        <Eyebrow style={{ margin:"18px 0 8px" }}>Visual references</Eyebrow>
        {brand.refs.map(r => (
          <div key={r} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 0", borderBottom:`1px solid ${C.hair}` }}>
            <Icon n="book" s={15} c={C.charcoal}/><span style={{ flex:1, fontSize:13.5 }}>{r}</span>
            <button className="focusable" aria-label={`Remove ${r}`} onClick={() => setBrand({ ...brand, refs:brand.refs.filter(x => x !== r) })}><Icon n="x" s={14} c={C.mute}/></button>
          </div>
        ))}
        <button className="focusable tapf" onClick={() => setAddRef(true)} style={{ display:"flex", alignItems:"center", gap:8, padding:"12px 0", color:C.charcoal, fontSize:13.5 }}>
          <Icon n="plus" s={15}/> Add a reference
        </button>
        <Btn full style={{ marginTop:10 }} onClick={() => toast("Brand DNA saved", "save")}>Save Brand DNA</Btn>
      </div>
      <Sheet open={pick !== null} onClose={() => setPick(null)} title="Pick a colour">
        <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:8, paddingBottom:16 }}>
          {SWATCHES.map(c => (
            <button key={c} className="focusable tap" onClick={() => { const cs = [...brand.colors]; cs[pick] = c; setBrand({ ...brand, colors:cs, accent:pick === 1 ? c : brand.accent }); setPick(null); }}
              style={{ height:56, borderRadius:8, background:c, border:`1px solid ${C.hair}` }} aria-label={c}/>
          ))}
        </div>
      </Sheet>
      <Sheet open={addRef} onClose={() => setAddRef(false)} title="Add a reference"
        footer={<Btn full onClick={() => { if (ref.trim()) setBrand({ ...brand, refs:[...brand.refs, ref.trim()] }); setRef(""); setAddRef(false); toast("Reference added", "plus"); }}>Add</Btn>}>
        <div style={{ paddingBottom:10 }}><Input value={ref} onChange={setRef} placeholder="e.g. Swiss railway timetables" autoFocus/></div>
      </Sheet>
    </>
  );
}

export function Preferences() {
  const { prefs, setPrefs, toast } = useApp();
  const row = (title, sub, key) => (
    <div style={{ display:"flex", alignItems:"center", gap:12, padding:"13px 0", borderBottom:`1px solid ${C.hair}` }}>
      <span style={{ flex:1 }}>
        <span style={{ display:"block", fontSize:15 }}>{title}</span>
        <span style={{ display:"block", fontSize:12.5, color:C.body, marginTop:2 }}>{sub}</span>
      </span>
      <Switch on={prefs[key]} label={title} onChange={v => setPrefs({ ...prefs, [key]:v })}/>
    </div>
  );
  return (
    <>
      <Header title="Preferences" back/>
      <div className="noscroll" style={{ flex:1, overflowY:"auto", padding:"0 18px 18px" }}>
        <Eyebrow style={{ marginBottom:4 }}>Editing</Eyebrow>
        {row("Autosave", "Every change, immediately", "autosave")}
        {row("Canvas grid", "Show the column guides", "grid")}
        {row("Haptics", "Feedback on snap and reorder", "haptics")}
        <Eyebrow style={{ margin:"18px 0 4px" }}>Export defaults</Eyebrow>
        {row("Include citations", "Appends a source slide", "cites")}
        <div style={{ display:"flex", alignItems:"center", padding:"13px 0", borderBottom:`1px solid ${C.hair}` }}>
          <span style={{ flex:1, fontSize:15 }}>Render quality</span>
          <div style={{ display:"flex", gap:6 }}>{["1x", "2x", "3x"].map(q => <Chip key={q} s="sm" active={prefs.quality === q} onClick={() => setPrefs({ ...prefs, quality:q })}>{q}</Chip>)}</div>
        </div>
        <Eyebrow style={{ margin:"18px 0 4px" }}>Motion</Eyebrow>
        {row("Animations", "Transitions and generation choreography", "motion")}
        <Eyebrow style={{ margin:"18px 0 4px" }}>Storage</Eyebrow>
        <Card pad={14}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
            <span style={{ fontSize:13.5 }}>Projects & assets</span><span className="mono" style={{ fontSize:12, color:C.body }}>412 MB / 2 GB</span>
          </div>
          <Meter v={20}/>
          <Btn size="sm" variant="secondary" style={{ marginTop:12 }} onClick={() => toast("Cleared 74 MB of render cache", "trash")}>Clear render cache</Btn>
        </Card>
        <Row icon="globe" title="Language" sub="English (US)" onClick={() => toast("More languages soon", "globe")} last/>
      </div>
    </>
  );
}

export function Account() {
  const { user, toast, setPhase, setUser } = useApp();
  const [pw, setPw] = useState(false);
  const [del, setDel] = useState(false);
  return (
    <>
      <Header title="Account & security" back/>
      <div className="noscroll" style={{ flex:1, overflowY:"auto", padding:"0 18px 18px" }}>
        <Eyebrow style={{ marginBottom:4 }}>Identity</Eyebrow>
        <Row icon="user" title="Name" sub={user?.name || "Guest"} onClick={() => toast("Name editing is in Preferences", "user")}/>
        <Row icon="globe" title="Email" sub={user?.email || "—"} onClick={() => toast("Verification email sent", "globe")}/>
        <Row icon="lock" title="Password" sub="Last changed 4 months ago" onClick={() => setPw(true)} last/>
        <Eyebrow style={{ margin:"18px 0 4px" }}>Sessions</Eyebrow>
        {[["iPhone 15 Pro", "This device · Bengaluru", true],["MacBook Pro", "Chrome · 2 days ago", false]].map(([a, b, cur]) => (
          <div key={a} style={{ display:"flex", alignItems:"center", gap:10, padding:"12px 0", borderBottom:`1px solid ${C.hair}` }}>
            <Icon n={cur ? "target" : "layout"} s={16} c={C.charcoal}/>
            <span style={{ flex:1 }}>
              <span style={{ display:"block", fontSize:14.5 }}>{a}</span>
              <span style={{ display:"block", fontSize:12.5, color:C.body, marginTop:2 }}>{b}</span>
            </span>
            {!cur && <Chip s="sm" onClick={() => toast("Signed out of MacBook Pro", "logout")}>Revoke</Chip>}
          </div>
        ))}
        <Eyebrow style={{ margin:"18px 0 4px" }}>Data</Eyebrow>
        <Row icon="download" title="Export my data" sub="Projects, research, assets as JSON" onClick={() => toast("Export queued, you'll get an email", "download")}/>
        <Row icon="trash" title="Delete account" sub="Immediate and irreversible" danger last onClick={() => setDel(true)}/>
      </div>
      <Sheet open={pw} onClose={() => setPw(false)} title="Change password"
        footer={<Btn full onClick={() => { setPw(false); toast("Password updated", "lock"); }}>Update</Btn>}>
        <div style={{ display:"grid", gap:10, paddingBottom:10 }}>
          <Input value="" onChange={() => {}} placeholder="Current password" type="password" icon="lock"/>
          <Input value="" onChange={() => {}} placeholder="New password (8+)" type="password" icon="lock"/>
        </div>
      </Sheet>
      <Dialog open={del} onClose={() => setDel(false)} destructive title="Delete your account?" confirm="Delete everything"
        body="Every project, source, asset and export is removed. This cannot be undone."
        onConfirm={() => { remoteSignOut(); setUser(null); setPhase("auth"); }}/>
    </>
  );
}

const ACTIONS = [
  { id:"a1", label:"New story", icon:"spark", to:"create" },
  { id:"a2", label:"All projects", icon:"folder", to:"projects" },
  { id:"a3", label:"Brand DNA", icon:"target", to:"brand" },
  { id:"a4", label:"Asset library", icon:"layers", to:"assets" },
  { id:"a5", label:"Styles", icon:"palette", to:"styles" },
  { id:"a6", label:"Examples", icon:"grid", to:"examples" },
  { id:"a7", label:"Plans & billing", icon:"bolt", to:"plan" },
  { id:"a8", label:"Preferences", icon:"sliders", to:"prefs" },
];
export function Palette() {
  const { projects, go, back, reset, setTab } = useApp();
  const [q, setQ] = useState("");
  const acts = ACTIONS.filter(a => a.label.toLowerCase().includes(q.toLowerCase()));
  const projs = projects.filter(p => p.title.toLowerCase().includes(q.toLowerCase()));
  const open = (fn) => { back(); setTimeout(fn, 10); };
  return (
    <div style={{ flex:1, minHeight:0, background:C.canvas, display:"flex", flexDirection:"column" }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 14px 10px" }}>
        <div style={{ flex:1 }}><SearchPill value={q} onChange={setQ} placeholder="Jump to anything"/></div>
        <Btn variant="ghost" size="sm" onClick={back}>Close</Btn>
      </div>
      <div className="noscroll" style={{ flex:1, overflowY:"auto", padding:"0 18px calc(18px + env(safe-area-inset-bottom))" }}>
        {acts.length > 0 && <>
          <Eyebrow style={{ margin:"6px 0 4px" }}>Actions</Eyebrow>
          {acts.map(a => <Row key={a.id} icon={a.icon} title={a.label} right={<span className="mono" style={{ fontSize:12, color:C.body }}>↵</span>}
            onClick={() => open(() => { if (["create", "projects", "assets", "styles"].includes(a.to)) reset(a.to); else go(a.to); })}/>)}
        </>}
        {projs.length > 0 && <>
          <Eyebrow style={{ margin:"18px 0 4px" }}>Projects</Eyebrow>
          {projs.map(p => <Row key={p.id} icon="file" title={p.title} sub={`${p.slides.length} slides · ${p.updated}`}
            onClick={() => open(() => go("project", { id:p.id }))}/>)}
        </>}
        {!acts.length && !projs.length && <EmptyState icon="search" title="No match" body={`Nothing called “${q}”. Try a project title or an action.`}/>}
      </div>
    </div>
  );
}

const NOTES = [
  { id:"n1", icon:"check", title:"The AI power bottleneck is ready", body:"6 slides designed · 3 sources traced", when:"Yesterday, 18:04", unread:true },
  { id:"n2", icon:"alert", title:"Critic flagged 2 notes", body:"Slide 5 price claim rests on press coverage, not a filing", when:"Yesterday, 18:02", unread:true },
  { id:"n3", icon:"download", title:"Export finished", body:"PDF · 6 pages · 4.1 MB", when:"Yesterday, 18:10", unread:false },
  { id:"n4", icon:"spark", title:"Dot maps are live", body:"Geography now gets its own visual format", when:"4 days ago", unread:false },
];
export function Notifications() {
  const { toast, go } = useApp();
  const [list, setList] = useState(NOTES);
  return (
    <>
      <Header title="Notifications" sub={`${list.filter(n => n.unread).length} unread`} back
        right={list.length ? <Btn variant="ghost" size="sm" onClick={() => { setList(l => l.map(n => ({ ...n, unread:false }))); toast("All marked read", "check"); }}>Mark read</Btn> : null}/>
      <div className="noscroll" style={{ flex:1, overflowY:"auto", padding:"0 18px 18px" }}>
        {list.length ? list.map(n => (
          <button key={n.id} className="focusable tapf" onClick={() => { setList(l => l.map(x => x.id === n.id ? { ...x, unread:false } : x)); go("projects"); }}
            style={{ width:"100%", display:"flex", gap:11, padding:"13px 0", borderBottom:`1px solid ${C.hair}`, textAlign:"left" }}>
            <span style={{ width:30, height:30, borderRadius:9999, background:C.soft, display:"grid", placeItems:"center", flex:"0 0 auto" }}>
              <Icon n={n.icon} s={15} c={C.ink}/></span>
            <span style={{ flex:1, minWidth:0 }}>
              <span style={{ display:"block", fontSize:14, fontWeight:n.unread ? 500 : 400 }}>{n.title}</span>
              <span style={{ display:"block", fontSize:12.5, color:C.body, marginTop:3, lineHeight:1.4 }}>{n.body}</span>
              <span className="mono" style={{ display:"block", fontSize:12, color:C.body, marginTop:5 }}>{n.when.toUpperCase()}</span>
            </span>
            {n.unread && <span style={{ width:7, height:7, borderRadius:9999, background:C.ink, marginTop:6 }}/>}
          </button>
        )) : <EmptyState icon="bell" title="All clear" body="Nothing needs you right now."/>}
        {list.length > 0 && <Btn full variant="secondary" style={{ marginTop:16 }} onClick={() => { setList([]); toast("Inbox cleared", "trash"); }}>Clear all</Btn>}
      </div>
    </>
  );
}
