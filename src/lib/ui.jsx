import React, { useEffect, useRef, useState } from "react";
import { C } from "./tokens";
import { Icon } from "./icons";

/* ---------- buttons ---------- */
export function Btn({ children, onClick, variant="primary", full=false, icon, iconRight, loading=false, disabled=false, size="md", style, className="" }) {
  const h = size==="lg" ? 48 : size==="sm" ? 32 : 36;
  const pad = size==="lg" ? "0 24px" : size==="sm" ? "0 14px" : "0 20px";
  const v = {
    primary:{ background:disabled?C.soft:C.ink, color:disabled?C.mute:C.canvas, border:"1px solid transparent" },
    secondary:{ background:C.canvas, color:C.ink, border:`1px solid ${C.hair2}` },
    ondark:{ background:C.canvas, color:C.ink, border:"1px solid transparent" },
    ghost:{ background:"transparent", color:C.ink, border:"1px solid transparent" },
    soft:{ background:C.soft, color:C.ink, border:"1px solid transparent" },
    accent:{ background:C.accent, color:C.onAccent, border:"1px solid transparent" },
    danger:{ background:C.canvas, color:"#B42318", border:`1px solid ${C.hair2}` },
  }[variant];
  return (
    <button onClick={disabled||loading?undefined:onClick} disabled={disabled}
      className={`focusable tap ${className}`}
      style={{ height:h, padding:pad, borderRadius:9999, fontSize:size==="lg"?15:14, fontWeight:500, lineHeight:1,
        display:"inline-flex", alignItems:"center", justifyContent:"center", gap:8, width:full?"100%":undefined,
        opacity:disabled?1:1, cursor:disabled?"default":"pointer", ...v, ...style }}>
      {loading ? <Spinner c={variant==="primary"?"#fff":C.ink}/> : icon ? <Icon n={icon} s={16} w={1.7}/> : null}
      <span style={{whiteSpace:"nowrap"}}>{children}</span>
      {iconRight && !loading ? <Icon n={iconRight} s={16} w={1.7}/> : null}
    </button>
  );
}
export function IconBtn({ n, onClick, s=20, label, active=false, style, tone="ink" }) {
  return (
    <button onClick={onClick} aria-label={label} className="focusable tap"
      style={{ width:36, height:36, borderRadius:9999, display:"grid", placeItems:"center",
        background:active?C.soft:"transparent", color:tone==="mute"?C.body:C.ink, ...style }}>
      <Icon n={n} s={s} w={1.6}/>
    </button>
  );
}
export function Spinner({ c=C.ink, s=15 }) {
  return <svg className="spin" width={s} height={s} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="9" stroke={c} strokeOpacity=".22" strokeWidth="2.6"/>
    <path d="M21 12a9 9 0 00-9-9" stroke={c} strokeWidth="2.6" strokeLinecap="round"/>
  </svg>;
}

/* ---------- chips / pills ---------- */
export function Chip({ children, active=false, onClick, icon, s="md" }) {
  return (
    <button onClick={onClick} className="focusable tap"
      style={{ height:s==="sm"?28:32, padding:s==="sm"?"0 10px":"0 14px", borderRadius:9999, fontSize:13, fontWeight:active?500:400,
        display:"inline-flex", alignItems:"center", gap:6, whiteSpace:"nowrap",
        background:active?C.accent:C.soft, color:active?C.onAccent:C.charcoal, border:"1px solid transparent" }}>
      {icon && <Icon n={icon} s={14} w={1.7}/>}{children}
    </button>
  );
}
export function Tag({ children, tone="soft", mono=true }) {
  const t = C.isDark
    ? { soft:{bg:C.soft,c:C.charcoal}, ink:{bg:C.ink,c:C.canvas}, warn:{bg:"rgba(255,189,46,.14)",c:"#E8B44A"}, ok:{bg:"rgba(39,201,63,.14)",c:"#69C97D"}, bad:{bg:"rgba(255,95,86,.14)",c:"#F08379"} }[tone]
    : { soft:{bg:C.soft,c:C.charcoal}, ink:{bg:C.ink,c:C.canvas}, warn:{bg:"#FFF6E5",c:"#8A5A00"}, ok:{bg:"#EDF7EE",c:"#2F6B33"}, bad:{bg:"#FDF0EF",c:"#A3332A"} }[tone];
  return <span className={mono?"mono":""} style={{ background:t.bg, color:t.c, borderRadius:6, padding:"3px 7px", fontSize:12.5, letterSpacing:".02em", whiteSpace:"nowrap" }}>{children}</span>;
}
export function Seg({ options, value, onChange, small=false }) {
  return (
    <div style={{ display:"flex", gap:4, background:C.soft, borderRadius:9999, padding:3 }}>
      {options.map(o=>{
        const on = o.id===value;
        return <button key={o.id} onClick={()=>onChange(o.id)} className="focusable"
          style={{ flex:1, height:small?28:32, borderRadius:9999, fontSize:13, fontWeight:on?500:400,
            background:on?C.canvas:"transparent", color:on?C.ink:(C.isDark?C.charcoal:C.body),
            border:on?`1px solid ${C.hair}`:"1px solid transparent", transition:"background .16s ease" }}>{o.name}</button>;
      })}
    </div>
  );
}
export function Switch({ on, onChange, label }) {
  return (
    <button aria-label={label} role="switch" aria-checked={on} onClick={()=>onChange(!on)} className="focusable"
      style={{ width:44, height:26, borderRadius:9999, background:on?C.accent:C.hair, position:"relative", transition:"background .18s ease", flex:"0 0 auto" }}>
      <span style={{ position:"absolute", top:3, left:on?21:3, width:20, height:20, borderRadius:9999, background:"#fff", transition:"left .18s cubic-bezier(.2,.8,.2,1)" }}/>
    </button>
  );
}
export function Stepper({ value, onChange, min=3, max=10, auto=false, onAuto }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
      {onAuto && <Chip active={auto} onClick={onAuto} s="sm">Auto</Chip>}
      <div style={{ display:"flex", alignItems:"center", gap:2, background:C.soft, borderRadius:9999, padding:3, opacity:auto?.45:1 }}>
        <button className="focusable tap" aria-label="Fewer slides" onClick={()=>onChange(Math.max(min,value-1))} style={{width:26,height:26,borderRadius:9999,display:"grid",placeItems:"center"}}><Icon n="minus" s={14}/></button>
        <span className="mono" style={{ width:22, textAlign:"center", fontSize:13 }}>{value}</span>
        <button className="focusable tap" aria-label="More slides" onClick={()=>onChange(Math.min(max,value+1))} style={{width:26,height:26,borderRadius:9999,display:"grid",placeItems:"center"}}><Icon n="plus" s={14}/></button>
      </div>
    </div>
  );
}

/* ---------- layout bits ---------- */
export function Rule({ strong=false, style }) { return <div style={{ height:1, background:strong?C.hair2:C.hair, ...style }}/>; }
export function Eyebrow({ children, c=C.body, style }) {
  return <div className="mono" style={{ fontSize:12, letterSpacing:".08em", textTransform:"uppercase", color:c, ...style }}>{children}</div>;
}
export function H({ children, s=24, w=600, style }) {
  return <h2 className="disp" style={{ fontSize:s, fontWeight:w, lineHeight:1.2, letterSpacing:"-0.01em", margin:0, ...style }}>{children}</h2>;
}
export function Body({ children, s=15, c=C.body, style }) {
  return <p style={{ fontSize:s, lineHeight:1.5, color:c, margin:0, ...style }}>{children}</p>;
}
export function Card({ children, dark=false, pad=16, style, onClick }) {
  const Comp = onClick ? "button" : "div";
  return <Comp onClick={onClick} className={onClick?"tapf focusable":""} style={{ display:"block", width:"100%", textAlign:"left",
    background:dark?C.dark:C.canvas, color:dark?"#fff":C.ink, border:dark?"1px solid transparent":`1px solid ${C.hair}`,
    borderRadius:12, padding:pad, ...style }}>{children}</Comp>;
}
export function Row({ title, sub, icon, right, onClick, danger=false, last=false }) {
  return (
    <button onClick={onClick} className="focusable tapf" style={{ width:"100%", display:"flex", alignItems:"center", gap:12, padding:"13px 0",
      borderBottom:last?"none":`1px solid ${C.hair}`, textAlign:"left" }}>
      {icon && <span style={{ width:30, height:30, borderRadius:9999, background:C.soft, display:"grid", placeItems:"center", flex:"0 0 auto" }}>
        <Icon n={icon} s={16} c={danger?"#B42318":C.ink} w={1.6}/></span>}
      <span style={{ flex:1, minWidth:0 }}>
        <span style={{ display:"block", fontSize:15, fontWeight:450, color:danger?"#B42318":C.ink }}>{title}</span>
        {sub && <span style={{ display:"block", fontSize:13, color:C.body, marginTop:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{sub}</span>}
      </span>
      {right !== undefined ? right : <Icon n="chevR" s={16} c={C.mute} w={1.6}/>}
    </button>
  );
}
export function Meter({ v, c, h=4, bg=C.hair, animate=true }) {
  c = c || C.accent;
  return <div style={{ height:h, background:bg, borderRadius:9999, overflow:"hidden", flex:1, minWidth:0 }}>
    <div style={{ height:"100%", width:`${Math.max(0,Math.min(100,v))}%`, background:c, borderRadius:9999, transition:animate?"width .5s cubic-bezier(.2,.8,.2,1)":"none" }}/>
  </div>;
}
export function Skel({ w="100%", h=12, r=9999, style }) { return <div className="shim" style={{ width:w, height:h, borderRadius:r, ...style }}/>; }

/* ---------- the signature: art-director margin note ---------- */
export function Note({ children, dir="left", w=180, style }) {
  return (
    <div style={{ display:"flex", alignItems:"flex-start", gap:4, color:C.body, ...style }}>
      {dir==="left" && <Squiggle flip/>}
      <span className="hand" style={{ fontSize:17, lineHeight:1.15, maxWidth:w, color:C.charcoal }}>{children}</span>
      {dir==="right" && <Squiggle/>}
    </div>
  );
}
export function Squiggle({ flip=false, s=26, c=C.mute }) {
  return <svg width={s} height={s*0.75} viewBox="0 0 26 20" fill="none" aria-hidden="true" style={{ transform:flip?"scaleX(-1)":"none", flex:"0 0 auto", marginTop:2 }}>
    <path d="M24 4C18 2 9 3 5 9c-2 3 0 6 3 6" stroke={c} strokeWidth="1.3" strokeLinecap="round"/>
    <path d="M8 15l-3.4-1.6M8 15l1.1-3.6" stroke={c} strokeWidth="1.3" strokeLinecap="round"/>
  </svg>;
}

/* ---------- terminal card (repurposed for the pipeline log) ---------- */
export function TrafficLights() {
  return <div style={{ display:"flex", gap:4 }}>
    {[C.tRed,C.tYel,C.tGrn].map(c=><span key={c} style={{ width:12, height:12, borderRadius:9999, background:c }}/>)}
  </div>;
}
export function TerminalCard({ children, title, style }) {
  return (
    <div style={{ border:`1px solid ${C.hair}`, borderRadius:12, background:C.canvas, padding:16, ...style }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
        <TrafficLights/>
        {title && <span className="mono" style={{ fontSize:12, color:C.body }}>{title}</span>}
      </div>
      <div className="mono" style={{ fontSize:13, lineHeight:1.55 }}>{children}</div>
    </div>
  );
}

/* ---------- inputs ---------- */
export function Input({ value, onChange, placeholder, type="text", icon, error, onEnter, autoFocus, right, name }) {
  const [f,setF] = useState(false);
  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:8, height:40, padding:"0 16px", borderRadius:9999,
        background:C.canvas, border:`1px solid ${error?"#E0A6A0":f?C.ink:C.hair}`,
        boxShadow:f?"0 0 0 3px rgba(59,130,246,.18)":"none", transition:"box-shadow .15s ease, border-color .15s ease" }}>
        {icon && <Icon n={icon} s={16} c={C.mute} w={1.6}/>}
        <input name={name} type={type} value={value} placeholder={placeholder} autoFocus={autoFocus}
          onFocus={()=>setF(true)} onBlur={()=>setF(false)}
          onChange={e=>onChange(e.target.value)} onKeyDown={e=>{ if(e.key==="Enter"&&onEnter) onEnter(); }}
          style={{ fontSize:15 }}/>
        {right}
      </div>
      {error && <div style={{ fontSize:12, color:"#B42318", marginTop:6, marginLeft:16 }}>{error}</div>}
    </div>
  );
}
export function SearchPill({ value, onChange, placeholder="Search", onClear }) {
  const [f,setF] = useState(false);
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, height:36, padding:"0 14px", borderRadius:9999,
      background:f?C.canvas:C.soft, border:`1px solid ${f?C.hair2:"transparent"}`, boxShadow:f?"0 0 0 3px rgba(59,130,246,.16)":"none" }}>
      <Icon n="search" s={15} c={C.mute} w={1.7}/>
      <input value={value} placeholder={placeholder} onFocus={()=>setF(true)} onBlur={()=>setF(false)}
        onChange={e=>onChange(e.target.value)} style={{ fontSize:14 }}/>
      {value && <button className="focusable" aria-label="Clear" onClick={()=>{onChange("");onClear&&onClear();}}><Icon n="x" s={14} c={C.mute}/></button>}
    </div>
  );
}

/* ---------- sheet / dialog ---------- */
export function Sheet({ open, onClose, title, children, footer, height="auto", padded=true }) {
  const [drag,setDrag] = useState(0);
  const st = useRef(null);
  useEffect(()=>{ if(open) setDrag(0); },[open]);
  if(!open) return null;
  const down = e => { st.current = e.clientY; e.currentTarget.setPointerCapture(e.pointerId); };
  const move = e => { if(st.current!=null) setDrag(Math.max(0, e.clientY - st.current)); };
  const up = () => { if(drag>96) onClose(); setDrag(0); st.current=null; };
  return (
    <div style={{ position:"absolute", inset:0, zIndex:60 }}>
      <div onClick={onClose} className="anim-fade" style={{ position:"absolute", inset:0, background:"rgba(0,0,0,.28)" }}/>
      <div className="anim-up" style={{ position:"absolute", left:0, right:0, bottom:0, background:C.canvas,
        borderTopLeftRadius:12, borderTopRightRadius:12, borderTop:`1px solid ${C.hair}`,
        maxHeight:"88%", height, display:"flex", flexDirection:"column",
        transform:`translateY(${drag}px)`, transition:st.current?"none":"transform .22s cubic-bezier(.2,.8,.2,1)" }}>
        <div onPointerDown={down} onPointerMove={move} onPointerUp={up} style={{ padding:"10px 0 2px", cursor:"grab", touchAction:"none" }}>
          <div style={{ width:36, height:4, borderRadius:9999, background:C.hair2, margin:"0 auto" }}/>
        </div>
        {title && <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"6px 16px 10px" }}>
          <H s={18} w={600}>{title}</H>
          <IconBtn n="x" label="Close" onClick={onClose} s={18}/>
        </div>}
        <div className="noscroll" style={{ overflowY:"auto", padding:padded?"0 16px 8px":0, flex:1 }}>{children}</div>
        {footer && <div style={{ padding:"12px 16px", borderTop:`1px solid ${C.hair}`, paddingBottom:"calc(12px + env(safe-area-inset-bottom))" }}>{footer}</div>}
      </div>
    </div>
  );
}
export function Dialog({ open, onClose, title, body, confirm, onConfirm, destructive=false, cancel="Cancel" }) {
  if(!open) return null;
  return (
    <div style={{ position:"absolute", inset:0, zIndex:70, display:"grid", placeItems:"center", padding:24 }}>
      <div onClick={onClose} className="anim-fade" style={{ position:"absolute", inset:0, background:"rgba(0,0,0,.32)" }}/>
      <div className="anim-pop" style={{ position:"relative", background:C.canvas, border:`1px solid ${C.hair}`, borderRadius:12, padding:20, width:"100%", maxWidth:300 }}>
        <H s={18} w={600} style={{marginBottom:6}}>{title}</H>
        <Body s={14}>{body}</Body>
        <div style={{ display:"flex", gap:8, marginTop:18 }}>
          <Btn variant="secondary" full onClick={onClose}>{cancel}</Btn>
          <Btn variant={destructive?"danger":"primary"} full onClick={onConfirm}>{confirm}</Btn>
        </div>
      </div>
    </div>
  );
}
export function EmptyState({ icon="folder", title, body, action, art }) {
  return (
    <div style={{ padding:"46px 24px", textAlign:"center", display:"grid", justifyItems:"center", gap:10 }}>
      {art || <div style={{ width:52, height:52, borderRadius:9999, background:C.soft, display:"grid", placeItems:"center" }}><Icon n={icon} s={22} c={C.mute} w={1.5}/></div>}
      <H s={18} w={600}>{title}</H>
      <Body s={14} style={{ maxWidth:260 }}>{body}</Body>
      {action && <div style={{marginTop:8}}>{action}</div>}
    </div>
  );
}
