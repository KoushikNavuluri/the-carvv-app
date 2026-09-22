import React, { useState } from "react";
import { C, STYLES, FONTS, styleOf, fontCls, platformOf } from "../lib/tokens";
import { THEMES, ACCENTS, PALETTES, derive, contrast, isDarkHex, themeOf, accentOf } from "../lib/theme";
import { TEMPLATES, templateOf } from "../data/templates";
import { Icon, Mark, Wordmark } from "../lib/icons";
import { Btn, IconBtn, Body, H, Eyebrow, Chip, Sheet, Dialog, Rule, Note, Tag, Meter, Card, Row, Seg,
  EmptyState, Switch, Input, Spinner } from "../lib/ui";
import { useApp } from "../lib/store";
import { Slide } from "../slides/SlideRenderer";
import { Header } from "./create";

const SAMPLE = {
  id:"ss", purpose:"HOOK", layout:"statement", kicker:"01 — Hook", headline:"Same story.\nDifferent voice.",
  body:"A direction is a whole point of view: type, palette, density, crop, how loud the accent may be.",
  foot:"Preview", density:{ text:"med", visual:"low" },
};
const SAMPLE2 = {
  id:"ss2", purpose:"EVIDENCE", layout:"bar-chart", kicker:"03 — Evidence", headline:"The number that carries it.",
  data:{ unit:"$B", label:"Fee revenue", series:[{ l:"20", v:3.5 },{ l:"21", v:3.9 },{ l:"22", v:4.2 },{ l:"23", v:4.6 },{ l:"24", v:4.8 }] },
  foot:"Source attached", annot:"the point", density:{ text:"low", visual:"high" },
};

/* ============================ Studio tab ============================ */
export function Studio() {
  const { go } = useApp();
  const [seg, setSeg] = useState("styles");
  return (
    <>
      <Header title="Studio" sub="Look, shape and feel"
        left={null}
        right={<IconBtn n="target" label="Brand DNA" onClick={() => go("brand")}/>}/>
      <div style={{ padding:"0 18px 12px" }}>
        <Seg value={seg} onChange={setSeg} options={[
          { id:"styles", name:"Styles" },{ id:"templates", name:"Shapes" },{ id:"palettes", name:"Colour" },{ id:"themes", name:"App" }]}/>
      </div>
      <div key={seg} className="noscroll anim-fade" style={{ flex:1, overflowY:"auto", padding:"0 18px 20px" }}>
        {seg === "styles" && <StylesPanel/>}
        {seg === "templates" && <TemplatesPanel/>}
        {seg === "palettes" && <PalettesPanel/>}
        {seg === "themes" && <ThemesPanel/>}
      </div>
    </>
  );
}

function StylesPanel() {
  const { go, draft } = useApp();
  return (
    <>
      <Body s={14} style={{ marginBottom:14 }}>A style changes composition, density and crop, not just the background colour.</Body>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        {STYLES.map(s => (
          <button key={s.id} className="focusable tapf" onClick={() => go("style", { id:s.id })} style={{ textAlign:"left" }}>
            <Slide slide={SAMPLE} styleId={s.id} w={155} radius={8}/>
            <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:7 }}>
              <span className="disp" style={{ fontSize:14, fontWeight:600 }}>{s.name}</span>
              {draft.style === s.id && <Tag tone="ink" mono={false}>In use</Tag>}
            </div>
            <div style={{ fontSize:12, color:C.body, marginTop:2, lineHeight:1.35 }}>{s.blurb}</div>
          </button>
        ))}
      </div>
    </>
  );
}

/* ---------------------------- templates ---------------------------- */
function TemplatesPanel() {
  const { draft, setDraft, toast } = useApp();
  const [open, setOpen] = useState(null);
  return (
    <>
      <Body s={14} style={{ marginBottom:14 }}>A shape decides what each beat is allowed to be. Pick one, or let the story architect choose.</Body>
      {TEMPLATES.map(t => {
        const on = draft.template === t.id;
        return (
          <button key={t.id} className="focusable tapf" onClick={() => setOpen(t)}
            style={{ width:"100%", display:"flex", gap:12, alignItems:"center", padding:"13px 0", borderBottom:`1px solid ${C.hair}`, textAlign:"left" }}>
            <span style={{ width:34, height:34, borderRadius:9999, background:on ? C.ink : C.soft, display:"grid", placeItems:"center", flex:"0 0 auto" }}>
              <Icon n={t.icon} s={16} c={on ? C.canvas : C.charcoal}/></span>
            <span style={{ flex:1, minWidth:0 }}>
              <span style={{ display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ fontSize:14.5, fontWeight:450 }}>{t.name}</span>
                {on && <Tag tone="ink" mono={false}>In use</Tag>}
              </span>
              <span style={{ display:"block", fontSize:12.5, color:C.body, marginTop:3, lineHeight:1.35 }}>{t.blurb}</span>
              {t.beats.length > 0 && <span style={{ display:"flex", gap:3, marginTop:7 }}>
                {t.beats.map(([b], i) => <span key={i} style={{ height:4, flex:1, maxWidth:22, borderRadius:9999,
                  background:b === "HOOK" ? C.ink : b === "CONCLUSION" ? C.charcoal : C.hair2 }}/>)}
              </span>}
            </span>
            <Icon n="chevR" s={16} c={C.mute}/>
          </button>
        );
      })}
      <Note style={{ marginTop:14 }} w={250}>shapes constrain the beats, not the words</Note>
      <Sheet open={!!open} onClose={() => setOpen(null)} title={open?.name} height="80%"
        footer={<Btn full onClick={() => { setDraft({ ...draft, template:open.id }); setOpen(null); toast(`${open.name} set as the shape`, "layers"); }}>
          Use this shape</Btn>}>
        {open && <div style={{ paddingBottom:14 }}>
          <div style={{ display:"flex", gap:8, marginBottom:12 }}>
            <Tag tone="soft">{open.kind.toUpperCase()}</Tag>
            <Tag tone="soft">{open.beats.length ? `${open.beats.length} BEATS` : "ADAPTIVE"}</Tag>
          </div>
          <Body s={14.5} style={{ marginBottom:6 }}>{open.blurb}</Body>
          <div className="hand" style={{ fontSize:19, color:C.charcoal, marginBottom:16 }}>best for: {open.best.toLowerCase()}</div>
          {open.beats.length ? <>
            <Eyebrow style={{ marginBottom:8 }}>The shape</Eyebrow>
            {open.beats.map(([purpose, layout], i) => (
              <div key={i} style={{ display:"flex", gap:12, alignItems:"center", padding:"9px 0", borderBottom:`1px solid ${C.hair}` }}>
                <span className="mono" style={{ fontSize:12, color:C.body, width:22 }}>{String(i + 1).padStart(2, "0")}</span>
                <span style={{ flex:1 }}>
                  <span style={{ display:"block", fontSize:13.5 }}>{purpose[0] + purpose.slice(1).toLowerCase()}</span>
                  <span className="mono" style={{ display:"block", fontSize:12, color:C.body, marginTop:2 }}>{layout.replace("-", " ").toUpperCase()}</span>
                </span>
                <Icon n={purpose === "EVIDENCE" ? "chart" : purpose === "HOOK" ? "bolt" : purpose === "CONCLUSION" ? "target" : "layers"} s={15} c={C.mute}/>
              </div>
            ))}
          </> : <EmptyState icon="spark" title="No fixed shape" body="Carvv reads the material, counts the strong claims and decides how many beats the story needs."/>}
        </div>}
      </Sheet>
    </>
  );
}

/* ---------------------------- palettes ---------------------------- */
const SWATCH = ["#B23A22","#C2412C","#A83A5B","#6B2D5B","#2D4EA8","#7C9BFF","#106B6B","#4FD1C5","#2F5D3A","#3F5D2E","#A9760B","#F2E900","#1A1A1A","#FFFFFF"];
const PAPERS = ["#FFFFFF","#FBF8F3","#F2F0EB","#F4F8FB","#FFFBF0","#F4F5EF","#111111","#140C0C","#06211F","#0B0F1A"];
function PalettesPanel() {
  const { palette, setPalette, toast, go } = useApp();
  return (
    <>
      <Body s={14} style={{ marginBottom:12 }}>Colour for the work, not the app. Every pairing is contrast-checked before it ships.</Body>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        {PALETTES.map(p => {
          const d = derive(p.paper, p.accent);
          const on = palette.id === p.id;
          return (
            <button key={p.id} className="focusable tapf" onClick={() => { setPalette({ id:p.id, name:p.name, ...d, display:palette.display }); toast(`${p.name} is your custom palette`, "palette"); }}
              style={{ textAlign:"left", border:`1px solid ${on ? C.ink : C.hair}`, borderRadius:12, padding:8 }}>
              <div style={{ borderRadius:8, overflow:"hidden", background:d.paper, padding:"14px 12px", minHeight:88 }}>
                <div className="mono" style={{ fontSize:12, color:d.body, letterSpacing:".08em" }}>03 — EVIDENCE</div>
                <div className="disp" style={{ fontSize:17, fontWeight:600, color:d.ink, marginTop:6, lineHeight:1.12 }}>Half the profit never touches a product.</div>
                <div style={{ display:"flex", gap:4, marginTop:9 }}>
                  <span style={{ height:6, width:38, borderRadius:9999, background:d.accent }}/>
                  <span style={{ height:6, width:18, borderRadius:9999, background:d.rule }}/>
                </div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:7 }}>
                <span style={{ fontSize:13, fontWeight:450, flex:1 }}>{p.name}</span>
                {on && <Icon n="check" s={14}/>}
              </div>
            </button>
          );
        })}
      </div>
      <Btn full variant="secondary" icon="wand" style={{ marginTop:14 }} onClick={() => go("paletteStudio")}>Build your own</Btn>
    </>
  );
}

export function PaletteStudio() {
  const { palette, setPalette, toast, brand, setBrand, projects, commit, back } = useApp();
  const [paper, setPaper] = useState(palette.paper);
  const [accent, setAccent] = useState(palette.accent);
  const [font, setFont] = useState(palette.display || "disp");
  const [name, setName] = useState(palette.name?.startsWith("Custom") ? palette.name : "Custom palette");
  const [apply, setApply] = useState(false);
  const d = derive(paper, accent);
  const cHead = contrast(d.ink, d.paper), cBody = contrast(d.body, d.paper), cAcc = contrast(d.accent, d.paper);
  const grade = v => v >= 7 ? ["ok", "AAA"] : v >= 4.5 ? ["ok", "AA"] : v >= 3 ? ["warn", "Large only"] : ["bad", "Fails"];
  const save = () => {
    setPalette({ id:"custom-" + Date.now().toString(36).slice(-3), name, ...d, display:font });
    toast("Palette saved to Custom style", "palette");
  };
  return (
    <>
      <Header title="Palette studio" sub="Paper, accent, type" back
        right={<Btn variant="ghost" size="sm" onClick={save}>Save</Btn>}/>
      <div className="noscroll" style={{ flex:1, overflowY:"auto", padding:"0 18px 18px" }}>
        <div style={{ display:"flex", gap:8, overflowX:"auto" }} className="noscroll">
          <Slide slide={SAMPLE2} styleId="custom" w={168} radius={9} deco={{ font, pal:d }}/>
          <Slide slide={SAMPLE} styleId="custom" w={168} radius={9} deco={{ font, pal:d }}/>
        </div>
        <div className="mono" style={{ fontSize:12, color:C.body, margin:"10px 0 16px" }}>LIVE PREVIEW · CUSTOM STYLE</div>

        <Eyebrow style={{ marginBottom:8 }}>Paper</Eyebrow>
        <div style={{ display:"flex", gap:7, flexWrap:"wrap", marginBottom:16 }}>
          {PAPERS.map(p => (
            <button key={p} aria-label={`Paper ${p}`} className="focusable tap" onClick={() => setPaper(p)}
              style={{ width:38, height:38, borderRadius:9999, background:p, border:`1px solid ${C.hair2}`,
                outline:paper === p ? `2px solid ${C.ink}` : "none", outlineOffset:2 }}/>
          ))}
        </div>
        <Eyebrow style={{ marginBottom:8 }}>Accent</Eyebrow>
        <div style={{ display:"flex", gap:7, flexWrap:"wrap", marginBottom:16 }}>
          {SWATCH.map(p => (
            <button key={p} aria-label={`Accent ${p}`} className="focusable tap" onClick={() => setAccent(p)}
              style={{ width:38, height:38, borderRadius:9999, background:p, border:`1px solid ${C.hair2}`,
                outline:accent === p ? `2px solid ${C.ink}` : "none", outlineOffset:2 }}/>
          ))}
        </div>
        <Eyebrow style={{ marginBottom:8 }}>Display type</Eyebrow>
        <div className="noscroll" style={{ display:"flex", gap:7, overflowX:"auto", marginBottom:16 }}>
          {FONTS.map(f => (
            <button key={f.id} className="focusable tapf" onClick={() => setFont(f.id)}
              style={{ flex:"0 0 auto", minWidth:96, border:`1px solid ${font === f.id ? C.ink : C.hair}`, borderRadius:12, padding:"10px 12px", textAlign:"left" }}>
              <div className={fontCls(f.id)} style={{ fontSize:22, fontWeight:600, lineHeight:1 }}>Ag</div>
              <div style={{ fontSize:12, marginTop:6 }}>{f.name}</div>
            </button>
          ))}
        </div>
        <Eyebrow style={{ marginBottom:8 }}>Derived &amp; checked</Eyebrow>
        {[["Headline on paper", d.ink, cHead],["Body on paper", d.body, cBody],["Accent on paper", d.accent, cAcc]].map(([label, col, v]) => {
          const [tone, txt] = grade(v);
          return (
            <div key={label} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 0", borderBottom:`1px solid ${C.hair}` }}>
              <span style={{ width:22, height:22, borderRadius:6, background:col, border:`1px solid ${C.hair2}` }}/>
              <span style={{ flex:1, fontSize:13.5 }}>{label}</span>
              <span className="mono" style={{ fontSize:12, color:C.body }}>{v}:1</span>
              <Tag tone={tone} mono={false}>{txt}</Tag>
            </div>
          );
        })}
        <div style={{ marginTop:14 }}>
          <Eyebrow style={{ marginBottom:6 }}>Name</Eyebrow>
          <Input value={name} onChange={setName} placeholder="Name this palette"/>
        </div>
        <div style={{ display:"flex", gap:8, marginTop:14 }}>
          <Btn variant="secondary" full onClick={() => { setBrand({ ...brand, colors:[d.ink, d.accent, d.paper, d.body], accent:d.accent }); toast("Pushed into Brand DNA", "target"); }}>To Brand DNA</Btn>
          <Btn full onClick={() => { save(); setApply(true); }}>Apply to…</Btn>
        </div>
      </div>
      <Sheet open={apply} onClose={() => setApply(false)} title="Apply to which project?">
        <div style={{ paddingBottom:12 }}>
          {projects.filter(p => p.slides.length).map((p, i, a) => (
            <Row key={p.id} title={p.title} sub={`${p.slides.length} slides · ${styleOf(p.style).name}`} last={i === a.length - 1}
              onClick={() => { commit(p.id, x => ({ ...x, style:"custom", deco:{ ...(x.deco || {}), font } }), "Applied custom palette"); setApply(false); back(); toast(`Palette applied to ${p.title}`, "palette"); }}/>
          ))}
        </div>
      </Sheet>
    </>
  );
}

/* ---------------------------- app themes ---------------------------- */
function ThemesPanel() {
  const { prefs, setPrefs, toast } = useApp();
  return (
    <>
      <Body s={14} style={{ marginBottom:14 }}>The chrome stays out of the way: one sheet, hairline rules, no decoration. Pick the sheet.</Body>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:18 }}>
        {THEMES.map(t => {
          const on = prefs.theme === t.id;
          return (
            <button key={t.id} className="focusable tapf" onClick={() => { setPrefs({ ...prefs, theme:t.id }); toast(`${t.name} theme`, "palette"); }}
              style={{ textAlign:"left", border:`1px solid ${on ? C.ink : C.hair}`, borderRadius:12, padding:8 }}>
              <ThemeChip v={t.v}/>
              <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:8 }}>
                <span style={{ fontSize:13.5, fontWeight:450, flex:1 }}>{t.name}</span>
                {on && <Icon n="check" s={14}/>}
              </div>
              <div style={{ fontSize:12, color:C.body, marginTop:2, lineHeight:1.35 }}>{t.blurb}</div>
            </button>
          );
        })}
      </div>
      <Eyebrow style={{ marginBottom:8 }}>Accent</Eyebrow>
      <div style={{ display:"flex", gap:7, flexWrap:"wrap", marginBottom:8 }}>
        {ACCENTS.map(a => {
          const on = prefs.accent === a.id;
          return (
            <button key={a.id} aria-label={a.name} className="focusable tap" onClick={() => setPrefs({ ...prefs, accent:a.id })}
              style={{ width:40, height:40, borderRadius:9999, background:a.hex || C.ink, border:`1px solid ${C.hair2}`,
                outline:on ? `2px solid ${C.ink}` : "none", outlineOffset:2, display:"grid", placeItems:"center" }}>
              {!a.hex && <span className="mono" style={{ fontSize:12, color:C.canvas }}>Ink</span>}
            </button>
          );
        })}
      </div>
      <Note style={{ marginBottom:16 }} w={260}>accent only touches meters, chips and switches. CTAs stay ink</Note>
      <Eyebrow style={{ marginBottom:8 }}>Preview</Eyebrow>
      <Card pad={14}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
          <Mark s={20}/><Wordmark s={15}/>
          <div style={{ flex:1 }}/>
          <Tag tone="ink" mono={false}>{themeOf(prefs.theme).name}</Tag>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
          <Meter v={68} c={C.accent}/><span className="mono" style={{ fontSize:12, color:C.body }}>68%</span>
        </div>
        <div style={{ display:"flex", gap:6, marginBottom:12 }}>
          <Chip active s="sm">Active chip</Chip><Chip s="sm">Quiet chip</Chip>
          <div style={{ flex:1 }}/><Switch on label="Preview" onChange={() => {}}/>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <Btn size="sm">Primary</Btn><Btn size="sm" variant="secondary">Secondary</Btn>
        </div>
      </Card>
    </>
  );
}
const ThemeChip = ({ v }) => (
  <div style={{ borderRadius:8, overflow:"hidden", background:v.canvas, border:`1px solid ${v.hair}`, padding:10, minHeight:86 }}>
    <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:8 }}>
      <span style={{ width:14, height:14, borderRadius:9999, background:v.ink }}/>
      <span style={{ height:5, width:26, borderRadius:9999, background:v.ink, opacity:.75 }}/>
      <div style={{ flex:1 }}/>
      <span style={{ height:12, width:26, borderRadius:9999, background:v.ink }}/>
    </div>
    <div style={{ height:5, width:"84%", borderRadius:9999, background:v.charcoal, marginBottom:5 }}/>
    <div style={{ height:5, width:"62%", borderRadius:9999, background:v.body, opacity:.7, marginBottom:9 }}/>
    <div style={{ display:"flex", gap:5 }}>
      <span style={{ height:18, flex:1, borderRadius:5, background:v.soft, border:`1px solid ${v.hair}` }}/>
      <span style={{ height:18, flex:1, borderRadius:5, background:v.dark }}/>
    </div>
  </div>
);

/* ---------------------------- appearance (from You) ---------------------------- */
export function Appearance() {
  return (
    <>
      <Header title="Appearance" sub="Theme and accent" back/>
      <div className="noscroll" style={{ flex:1, overflowY:"auto", padding:"0 18px 20px" }}><ThemesPanel/></div>
    </>
  );
}
