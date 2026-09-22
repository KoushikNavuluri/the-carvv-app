import React, { useEffect, useRef, useState } from "react";
import { C } from "../lib/tokens";
import { Icon, Mark, Wordmark } from "../lib/icons";
import { Btn, Body, H, Input, Note, Rule, Eyebrow, Tag, TerminalCard, Squiggle } from "../lib/ui";
import { useApp } from "../lib/store";
import { Slide } from "../slides/SlideRenderer";
import { PROJECTS } from "../data/projects";
import { isConfigured, signInEmail, signUpStart, verifyEmailCode, guestLogin } from "../lib/appwrite";

export function Splash() {
  const { setPhase, hasSession } = useApp();
  const [step, setStep] = useState(0);
  useEffect(() => {
    const a = setTimeout(() => setStep(1), 700);
    const b = setTimeout(() => setPhase(hasSession ? "app" : "onboarding"), 2150);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, [setPhase, hasSession]);
  return (
    <div style={{ position:"absolute", inset:0, background:C.canvas, display:"grid", placeItems:"center" }}>
      <div style={{ display:"grid", justifyItems:"center", gap:14 }}>
        <Mark s={64} draw/>
        <div style={{ opacity:step?1:0, transition:"opacity .5s ease .1s", display:"grid", justifyItems:"center", gap:6 }}>
          <Wordmark s={34}/>
          <span className="hand" style={{ fontSize:19, color:C.body }}>weave ideas into visual stories</span>
        </div>
      </div>
      <div className="mono" style={{ position:"absolute", bottom:46, fontSize:12, color:C.body, letterSpacing:".08em",
        opacity:step?1:0, transition:"opacity .4s ease" }}>WARMING THE STUDIO…</div>
    </div>
  );
}

const PANES = [
  { k:"a", eyebrow:"The principle", h:"Don't turn text\ninto slides.", p:"Carvv reads the material, finds the story inside it, then decides what deserves to be shown.",
    note:"this is the whole product" },
  { k:"b", eyebrow:"Step one", h:"It researches\nbefore it writes.", p:"Sources are fetched, stripped and ranked. Every statistic keeps a receipt you can open." },
  { k:"c", eyebrow:"Step two", h:"It picks the\nvisual, not a\ntemplate.", p:"A statistic becomes a chart. Causality becomes a diagram. A process becomes a sequence." },
  { k:"d", eyebrow:"Step three", h:"Then it\nart-directs.", p:"Rhythm, density, accent and crop are decided per slide, so no two slides look the same." },
];
export function Onboarding() {
  const { setPhase } = useApp();
  const [i, setI] = useState(0);
  const ref = useRef(null);
  const to = n => { setI(n); ref.current?.scrollTo({ left:n * ref.current.clientWidth, behavior:"smooth" }); };
  const onScroll = () => { const el = ref.current; if (el) setI(Math.round(el.scrollLeft / el.clientWidth)); };
  return (
    <div style={{ flex:1, minHeight:0, background:C.canvas, display:"flex", flexDirection:"column" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"6px 16px 0" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}><Mark s={22}/><Wordmark s={17}/></div>
        <Btn variant="ghost" size="sm" onClick={() => setPhase("auth")}>Skip</Btn>
      </div>
      <div ref={ref} onScroll={onScroll} className="noscroll snapx" style={{ flex:1, display:"flex", overflowX:"auto", overflowY:"hidden" }}>
        {PANES.map((p, n) => (
          <div key={p.k} className="snapc" style={{ width:"100%", flex:"0 0 100%", padding:"18px 24px 0", display:"flex", flexDirection:"column" }}>
            <Eyebrow>{p.eyebrow}</Eyebrow>
            <h1 className="disp" style={{ fontSize:34, fontWeight:600, lineHeight:1.1, letterSpacing:"-0.03em", margin:"10px 0 12px", whiteSpace:"pre-line" }}>{p.h}</h1>
            <Body s={15} style={{ maxWidth:300 }}>{p.p}</Body>
            {p.note && <Note style={{ marginTop:12 }} dir="left">{p.note}</Note>}
            <div style={{ flex:1, display:"flex", alignItems:"flex-start", justifyContent:"center", paddingTop:34, paddingBottom:8 }}>
              {n === 0 && <FlowArt/>}
              {n === 1 && <SourceArt/>}
              {n === 2 && <MapArt/>}
              {n === 3 && <CarouselArt/>}
            </div>
          </div>
        ))}
      </div>
      <div style={{ padding:"0 24px calc(22px + env(safe-area-inset-bottom))" }}>
        <div style={{ display:"flex", gap:6, justifyContent:"center", marginBottom:16 }}>
          {PANES.map((p, n) => <button key={p.k} aria-label={`Go to ${n + 1}`} onClick={() => to(n)}
            style={{ width:n === i ? 20 : 6, height:6, borderRadius:9999, background:n === i ? C.ink : C.hair2, transition:"width .2s ease" }}/>)}
        </div>
        <Btn full size="lg" onClick={() => i < 3 ? to(i + 1) : setPhase("auth")} iconRight={i < 3 ? "arrowR" : undefined}>
          {i < 3 ? "Next" : "Create your account"}
        </Btn>
      </div>
    </div>
  );
}
const FlowArt = () => (
  <div style={{ display:"grid", gap:10, justifyItems:"center" }}>
    <div className="mono" style={{ height:44, display:"flex", alignItems:"center", gap:10, padding:"0 18px", borderRadius:9999, background:C.soft, fontSize:12, color:C.charcoal }}>
      Why Costco's model works<span style={{ width:1, height:14, background:C.mute, animation:"cvBlink 1.1s step-end infinite" }}/>
    </div>
    <Icon n="chevD" s={18} c={C.mute}/>
    <div style={{ display:"flex", gap:8 }}>
      {PROJECTS[0].slides.slice(0, 3).map(s => <Slide key={s.id} slide={s} styleId="editorial" w={84} radius={6}/>)}
    </div>
  </div>
);
const SourceArt = () => (
  <div style={{ width:"100%", maxWidth:300 }}>
    {[["SEC EDGAR","Form 10-K FY2024","high"],["Investor relations","Q4 membership metrics","high"],["Press archive","$1.50 since 1985","medium"]].map(([a, b, c]) => (
      <div key={a} style={{ display:"flex", alignItems:"center", gap:10, padding:"11px 0", borderBottom:`1px solid ${C.hair}` }}>
        <span style={{ width:26, height:26, borderRadius:9999, background:C.soft, display:"grid", placeItems:"center" }}><Icon n="book" s={13} c={C.charcoal}/></span>
        <span style={{ flex:1, minWidth:0 }}>
          <span className="mono" style={{ display:"block", fontSize:12, color:C.body, letterSpacing:".06em", textTransform:"uppercase" }}>{a}</span>
          <span style={{ display:"block", fontSize:13, marginTop:1 }}>{b}</span>
        </span>
        <Tag tone={c === "high" ? "ok" : "warn"}>{c}</Tag>
      </div>
    ))}
  </div>
);
const MapArt = () => (
  <TerminalCard title="visual-opportunity engine" style={{ width:"100%", maxWidth:300 }}>
    {[["statistic","bar chart"],["growth","line + band"],["causality","loop diagram"],["process","numbered steps"],["place","dot map"]].map(([a, b]) => (
      <div key={a} style={{ display:"flex", alignItems:"center", gap:8, color:C.charcoal }}>
        <span style={{ color:C.mute, width:74 }}>{a}</span><Icon n="arrowR" s={13} c={C.mute}/><span>{b}</span>
      </div>
    ))}
  </TerminalCard>
);
const CarouselArt = () => {
  const s = PROJECTS[0].slides;
  return <div className="noscroll" style={{ display:"flex", gap:10, overflowX:"auto", width:"100%", padding:"0 2px" }}>
    {s.map(x => <Slide key={x.id} slide={x} styleId="editorial" w={128} radius={8}/>)}
  </div>;
};

export function Auth() {
  const { setPhase, setUser, toast } = useApp();
  const [mode, setMode] = useState("signin"); // signin | create | code
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [name, setName] = useState("");
  const [err, setErr] = useState({});
  const [busy, setBusy] = useState(false);
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [left, setLeft] = useState(28);
  const boxes = useRef([]);
  const uidRef = useRef(null);
  useEffect(() => { if (mode !== "code") return; const t = setInterval(() => setLeft(l => l > 0 ? l - 1 : 0), 1000); return () => clearInterval(t); }, [mode]);

  const enter = (nm, u) => { setUser({ name:nm, email:u?.email || email || "you@studio.com", plan:"Pro", uid:u?.$id || null }); setPhase("app"); toast(`Welcome${nm ? `, ${nm.split(" ")[0]}` : ""}`, "spark"); };
  const signin = () => {
    const e = {};
    if (!/.+@.+\..+/.test(email)) e.email = "That email doesn't look right.";
    if (pw.length < 4) e.pw = "Password is at least 4 characters.";
    setErr(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    if (isConfigured) {
      signInEmail(email, pw)
        .then(u => { setBusy(false); enter(u.name || email.split("@")[0], u); })
        .catch(() => { setBusy(false); setErr({ pw:"That email and password don't match an account." }); });
      return;
    }
    setTimeout(() => {
      setBusy(false);
      if (pw !== "carvv") { setErr({ pw:"Wrong password. Demo hint: carvv" }); return; }
      enter("Koushi Navuluri");
    }, 900);
  };
  const create = () => {
    const e = {};
    if (name.trim().length < 2) e.name = "Tell me what to call you.";
    if (!/.+@.+\..+/.test(email)) e.email = "That email doesn't look right.";
    if (pw.length < 8) e.pw = "Eight characters minimum.";
    setErr(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    if (isConfigured) {
      signUpStart(name.trim(), email, pw)
        .then(u => { uidRef.current = u.$id; setBusy(false); setMode("code"); setLeft(28); })
        .catch(() => { setBusy(false); setErr({ email:"Couldn't create it. The email may already have an account." }); });
      return;
    }
    setTimeout(() => { setBusy(false); setMode("code"); setLeft(28); }, 900);
  };
  const setDigit = (i, v) => {
    const d = v.replace(/\D/g, "").slice(-1);
    const next = [...code]; next[i] = d; setCode(next);
    if (d && i < 5) boxes.current[i + 1]?.focus();
    if (next.every(x => x)) {
      setBusy(true);
      if (isConfigured) {
        verifyEmailCode(uidRef.current, next.join(""))
          .then(u => { setBusy(false); enter(u.name || name || "there", u); })
          .catch(() => { setBusy(false); setCode(["", "", "", "", "", ""]); boxes.current[0]?.focus(); toast("That code didn't check out", "alert"); });
        return;
      }
      setTimeout(() => { setBusy(false); enter(name || "Koushi Navuluri"); }, 800);
    }
  };

  return (
    <div style={{ flex:1, minHeight:0, background:C.canvas, display:"flex", flexDirection:"column", padding:"10px 24px calc(20px + env(safe-area-inset-bottom))" }}>
      <div style={{ display:"flex", alignItems:"center", gap:8, minHeight:36 }}>
        {mode !== "signin" && <button className="focusable tap" aria-label="Back" onClick={() => setMode(mode === "code" ? "create" : "signin")} style={{ marginLeft:-6 }}><Icon n="chevL" s={20}/></button>}
        <div style={{ flex:1 }}/>
        <Mark s={22}/>
      </div>

      {mode === "code" ? (
        <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"center" }}>
          <Eyebrow>Step 2 of 2</Eyebrow>
          <H s={28} style={{ margin:"10px 0 8px" }}>Check your inbox.</H>
          <Body s={15}>Six digits sent to <span style={{ color:C.ink }}>{email}</span>.{isConfigured ? "" : " Any six will do in this demo."}</Body>
          <div style={{ display:"flex", gap:8, margin:"26px 0 18px" }}>
            {code.map((d, i) => (
              <input key={i} ref={el => boxes.current[i] = el} value={d} inputMode="numeric" aria-label={`Digit ${i + 1}`}
                onChange={e => setDigit(i, e.target.value)}
                onKeyDown={e => { if (e.key === "Backspace" && !d && i) boxes.current[i - 1]?.focus(); }}
                className="mono focusable" style={{ width:"100%", height:52, textAlign:"center", fontSize:20,
                  background:d ? C.canvas : C.soft, border:`1px solid ${d ? C.ink : "transparent"}`, borderRadius:12 }}/>
            ))}
          </div>
          {busy && <div style={{ display:"flex", alignItems:"center", gap:8, color:C.body, fontSize:13 }}><span className="spin" style={{ width:13, height:13, border:`2px solid ${C.hair2}`, borderTopColor:C.ink, borderRadius:99 }}/>Verifying…</div>}
          <Btn variant="ghost" size="sm" onClick={() => setLeft(28)} disabled={left > 0} style={{ marginTop:8, alignSelf:"flex-start", paddingLeft:0 }}>
            {left > 0 ? `Resend in 0:${String(left).padStart(2, "0")}` : "Resend code"}
          </Btn>
        </div>
      ) : (
        <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"center", gap:14 }}>
          <div>
            <H s={30} style={{ marginBottom:6 }}>{mode === "signin" ? "Sign in to Carvv." : "Make an account."}</H>
            <Body s={15}>{mode === "signin" ? "Your projects, brand DNA and exports, where you left them." : "Free plan: 3 carousels a month, full research engine."}</Body>
          </div>
          <div style={{ display:"grid", gap:10 }}>
            {mode === "create" && <Input value={name} onChange={setName} placeholder="Your name" icon="user" error={err.name}/>}
            <Input value={email} onChange={setEmail} placeholder="Email" icon="globe" error={err.email}/>
            <Input value={pw} onChange={setPw} placeholder={mode === "signin" ? "Password" : "Password (8+)"} type="password" icon="lock" error={err.pw} onEnter={mode === "signin" ? signin : create}/>
          </div>
          <Btn full size="lg" loading={busy} onClick={mode === "signin" ? signin : create}>{mode === "signin" ? "Continue" : "Send me a code"}</Btn>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}><Rule style={{ flex:1 }}/><span className="mono" style={{ fontSize:12, color:C.body }}>OR</span><Rule style={{ flex:1 }}/></div>
          <Btn full variant="secondary" onClick={() => {
            if (!isConfigured) return enter("Guest");
            setBusy(true);
            guestLogin().then(u => { setBusy(false); enter("Guest", u); }).catch(() => { setBusy(false); enter("Guest"); });
          }}>Continue as guest</Btn>
          <div style={{ textAlign:"center", fontSize:13, color:C.body }}>
            {mode === "signin" ? "No account yet? " : "Already have one? "}
            <button className="focusable" onClick={() => { setErr({}); setMode(mode === "signin" ? "create" : "signin"); }}
              style={{ color:C.ink, textDecoration:"underline" }}>{mode === "signin" ? "Create one" : "Sign in"}</button>
          </div>
        </div>
      )}
      <div className="mono" style={{ fontSize:12, color:C.body, textAlign:"center", letterSpacing:".04em" }}>
        {!isConfigured ? (mode === "signin" ? "DEMO · PASSWORD IS “carvv”" : "BY CONTINUING YOU ACCEPT THE DEMO TERMS")
          : (mode === "signin" ? "SECURED BY APPWRITE" : "A SIX-DIGIT CODE WILL BE EMAILED TO YOU")}
      </div>
    </div>
  );
}
