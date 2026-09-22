/* ============================================================
   CARVV — mobile studio  ·  pinned subject & design plan
   ------------------------------------------------------------
   Subject: Carvv, an AI research-to-carousel studio, as an iOS app.
   Audience: creators and strategists who publish editorial carousels.
   Job: idea in -> researched, art-directed, publish-ready story out.
   Concept: "quiet studio, loud work." The chrome is a paper-white
   Markdown-flat system (pill geometry, one black CTA, hairline cards,
   zero shadows); all the colour, photography and drama lives inside
   the slides being made. The one handwritten voice in the product is
   the art director's margin note — Caveat, used where a human would
   scribble on a layout pad.
   Type: Nunito (display 500/600/700) · Inter (body/UI) ·
         JetBrains Mono (labels, code, data) · Caveat (margin notes).
   Colour: #fff canvas, #fafafa soft, #171717 inverted surface,
           #e5e5e5 hairline, ink/charcoal/body/mute greys. No brand hue.
   Signature: the carve pill (input), the margin note + hand arrow,
              and the traffic-light pipeline log.
   ============================================================ */
import React, { useEffect, useState } from "react";
import "./styles.css";
import { C } from "./lib/tokens";
import { AppProvider, useApp } from "./lib/store";
import { Icon, Mark } from "./lib/icons";
import { Splash, Onboarding, Auth } from "./screens/boot";
import { Create, Generating, Storyboard } from "./screens/create";
import { Viewer, Research, QA, Review, ExportScreen } from "./screens/viewer";
import { Editor } from "./screens/editor";
import { Projects, ProjectDetail, StyleDetail, AssetsScreen, Examples } from "./screens/library";
import { Studio, PaletteStudio, Appearance } from "./screens/studio";
import { Caption, Feed } from "./screens/share";
import { You, Brand, Plan, Preferences, Account, Palette, Notifications } from "./screens/settings";

const SCREENS = {
  create:Create, projects:Projects, styles:Studio, assets:AssetsScreen, you:You,
  paletteStudio:PaletteStudio, appearance:Appearance, caption:Caption, feed:Feed,
  generating:Generating, storyboard:Storyboard, viewer:Viewer, editor:Editor,
  research:Research, qa:QA, review:Review, export:ExportScreen,
  project:ProjectDetail, style:StyleDetail, examples:Examples,
  brand:Brand, plan:Plan, prefs:Preferences, account:Account, palette:Palette, notifications:Notifications,
};
const FULL = ["generating", "viewer", "editor", "export", "review", "palette", "feed"];
const DARK = ["viewer"];

function StatusBar({ dark }) {
  const [t, setT] = useState(() => new Date());
  useEffect(() => { const i = setInterval(() => setT(new Date()), 20000); return () => clearInterval(i); }, []);
  const c = dark ? "#fff" : C.ink;
  const hh = t.getHours() % 12 || 12, mm = String(t.getMinutes()).padStart(2, "0");
  return (
    <div style={{ height:44, paddingTop:"env(safe-area-inset-top)", display:"flex", alignItems:"center",
      justifyContent:"space-between", padding:"0 22px", flex:"0 0 auto", color:c, position:"relative", zIndex:30 }}>
      <span className="mono" style={{ fontSize:13, fontWeight:500, letterSpacing:"-.01em" }}>{hh}:{mm}</span>
      <div style={{ display:"flex", alignItems:"center", gap:5 }}>
        <svg width="17" height="11" viewBox="0 0 17 11" fill="none">{[0, 1, 2, 3].map(i => <rect key={i} x={i * 4.4} y={8 - i * 2.4} width="2.9" height={3 + i * 2.4} rx="1" fill={c}/>)}</svg>
        <svg width="15" height="11" viewBox="0 0 15 11" fill="none">
          <path d="M1 4.2C3 2 6 1 7.5 1S12 2 14 4.2" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M4 7C5.2 5.8 6.5 5.3 7.5 5.3s2.3.5 3.5 1.7" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
          <circle cx="7.5" cy="9.4" r="1.2" fill={c}/>
        </svg>
        <svg width="26" height="13" viewBox="0 0 26 13" fill="none">
          <rect x="0.7" y="0.7" width="21.6" height="11.6" rx="3.4" stroke={c} strokeOpacity=".4" strokeWidth="1.1"/>
          <rect x="2.4" y="2.4" width="15" height="8.2" rx="2.2" fill={c}/>
          <rect x="23.8" y="4.4" width="1.7" height="4.2" rx="0.85" fill={c} fillOpacity=".4"/>
        </svg>
      </div>
    </div>
  );
}

const TABS = [
  { id:"create", name:"Create", icon:null },
  { id:"projects", name:"Projects", icon:"folder" },
  { id:"styles", name:"Studio", icon:"palette" },
  { id:"assets", name:"Assets", icon:"layers" },
  { id:"you", name:"You", icon:"user" },
];
function TabBar() {
  const { tab, setTab, reset } = useApp();
  return (
    <div style={{ flex:"0 0 auto", borderTop:`1px solid ${C.hair}`, background:C.canvas, position:"relative", zIndex:25 }}>
      <div style={{ display:"flex", height:49 }}>
        {TABS.map(t => {
          const on = t.id === tab;
          return (
            <button key={t.id} onClick={() => { reset(t.id); }} className="focusable"
              style={{ flex:1, display:"grid", placeItems:"center", gap:2, color:on ? C.ink : "#8a8a8a", paddingTop:6 }}>
              {t.icon ? <Icon n={t.icon} s={21} w={on ? 1.9 : 1.6}/> : <Mark s={21} c={on ? C.ink : C.mute} thread={false}/>}
              <span style={{ fontSize:12, fontWeight:on ? 500 : 400, letterSpacing:".01em" }}>{t.name}</span>
            </button>
          );
        })}
      </div>
      <div style={{ height:"env(safe-area-inset-bottom)" }}/>
      <div style={{ display:"grid", placeItems:"center", paddingBottom:8 }}>
        <span style={{ width:132, height:5, borderRadius:9999, background:C.ink, opacity:.85 }}/>
      </div>
    </div>
  );
}

function Toasts() {
  const { toasts } = useApp();
  return (
    <div style={{ position:"absolute", left:0, right:0, bottom:96, display:"grid", justifyItems:"center", gap:8, zIndex:80, pointerEvents:"none" }}>
      {toasts.map(t => (
        <div key={t.id} className="anim-in" style={{ display:"flex", alignItems:"center", gap:8, background:C.isDark ? C.dark : C.dark, color:"#fff",
          borderRadius:9999, padding:"9px 16px", maxWidth:"86%" }}>
          <Icon n={t.icon} s={15} c="#fff" w={1.8}/>
          <span style={{ fontSize:13 }}>{t.msg}</span>
        </div>
      ))}
    </div>
  );
}

function Router() {
  const { phase, tab, stack } = useApp();
  if (phase === "splash") return <Splash/>;
  if (phase === "onboarding") return <Onboarding/>;
  if (phase === "auth") return <Auth/>;
  const top = stack[stack.length - 1];
  const name = top ? top.n : tab;
  const S = SCREENS[name] || Create;
  const full = FULL.includes(name);
  return (
    <>
      <div key={name + (stack.length)} className="anim-fade" style={{ flex:1, minHeight:0, display:"flex", flexDirection:"column", background:C.canvas }}>
        <S {...(top?.p || {})}/>
      </div>
      {!full && <TabBar/>}
    </>
  );
}

function Device() {
  const { phase, stack, themeV } = useApp();
  const top = stack[stack.length - 1];
  const dark = (phase === "app" && top && DARK.includes(top.n)) || C.isDark;
  return (
    <div style={{ minHeight:"100dvh", display:"grid", placeItems:"center", background:C.isDark ? "#070707" : C.soft, padding:0 }}>
      <div key={themeV} className="device" style={{ position:"relative", background:(phase === "app" && top && DARK.includes(top.n)) ? "#0b0b0b" : C.canvas,
        overflow:"hidden", display:"flex", flexDirection:"column", isolation:"isolate" }}>
        <StatusBar dark={dark}/>
        <Router/>
        <Toasts/>
      </div>
    </div>
  );
}

export default function App() {
  return <AppProvider><Device/></AppProvider>;
}
