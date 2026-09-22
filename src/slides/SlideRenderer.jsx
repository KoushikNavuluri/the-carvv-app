import React, { createContext, useContext } from "react";
import { IMG } from "../data/assets";
import { styleOf, platformOf, fontCls } from "../lib/tokens";

/* ============================================================
   Slide Specification -> layout -> render.
   Everything below draws inside a fixed 1080 x H coordinate
   space, then gets scaled. One engine for thumbnails, viewer,
   editor canvas and export preview, so they can never disagree.
   ============================================================ */

const PAD = 84;
const ScaleCtx = createContext(1);
const DecoCtx = createContext({ mark:true });

function Kicker({ s, c, style }) {
  if (!s) return null;
  return <div className="mono" style={{ fontSize:25, letterSpacing:".12em", textTransform:"uppercase", color:c, ...style }}>{s}</div>;
}
function Foot({ s, c, style }) {
  if (!s) return null;
  return <div className="mono" style={{ fontSize:21, letterSpacing:".02em", color:c, ...style }}>{s}</div>;
}
function Annot({ s, c, flip=false, style, size=42 }) {
  if (!s) return null;
  return (
    <div style={{ display:"flex", alignItems:"flex-start", gap:8, ...style }}>
      {flip && <Arrow c={c} flip/>}
      <span className="hand" style={{ fontSize:size, lineHeight:1.05, color:c, maxWidth:360 }}>{s}</span>
      {!flip && <Arrow c={c}/>}
    </div>
  );
}
function Arrow({ c, flip=false, w=64 }) {
  return <svg width={w} height={w*0.62} viewBox="0 0 64 40" fill="none" style={{ transform:flip?"scaleX(-1)":"none", flex:"0 0 auto", marginTop:6 }}>
    <path d="M60 6C46 1 18 4 9 18c-4 7 1 14 8 15" stroke={c} strokeWidth="2.6" strokeLinecap="round"/>
    <path d="M17 33l-8-2.5M17 33l1.5-8" stroke={c} strokeWidth="2.6" strokeLinecap="round"/>
  </svg>;
}
function Head({ text, st, size, c, mw=860, style }) {
  const fam = fontCls(st.display);
  const hand = st.display === "hand";
  size = Math.round(size * useContext(ScaleCtx) * (fam === "serif" ? 0.94 : fam === "mono" ? 0.84 : 1));
  return <h1 className={fam} style={{ margin:0, fontSize:size, fontWeight: hand?700:fam==="serif"?600:600,
    lineHeight: hand?1.0:fam==="serif"?1.1:1.06, letterSpacing: st.head==="upper"?".01em":fam==="cond"?"-0.03em":fam==="serif"?"-0.004em":hand?"0":"-0.022em",
    textTransform: st.head==="upper"?"uppercase":"none", color:c, maxWidth:mw, whiteSpace:"pre-line", ...style }}>{text}</h1>;
}
function Copy({ text, st, c, size=34, mw=740, style }) {
  if(!text) return null;
  return <p style={{ margin:0, fontSize:size, lineHeight:1.42, color:c, maxWidth:mw, ...style }}>{text}</p>;
}
const Sig = ({ c }) => {
  const d = useContext(DecoCtx);
  if (d && d.mark === false) return null;
  return <span className="disp" style={{ fontSize:24, fontWeight:700, letterSpacing:"-0.02em", color:c, opacity:.85 }}>Carvv</span>;
};
const Grain = () => (
  <svg className="grain" width="100%" height="100%" aria-hidden="true">
    <filter id="cvGrain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/></filter>
    <rect width="100%" height="100%" filter="url(#cvGrain)" opacity="0.32"/>
  </svg>
);

/* ---------------- charts ---------------- */
function Bars({ data, st, w=912, h=430 }) {
  const max = Math.max(...data.series.map(d=>d.v)) * 1.18;
  const n = data.series.length, gap = 26, bw = (w - gap*(n-1)) / n;
  return (
    <svg width={w} height={h+86} viewBox={`0 0 ${w} ${h+86}`} fill="none">
      {data.series.map((d,i)=>{
        const bh = (d.v/max)*h, x = i*(bw+gap), y = h-bh, last = i===n-1;
        return <g key={d.l}>
          <rect x={x} y={y} width={bw} height={bh} rx="4" fill={last?st.accent:st.ink} opacity={last?1:.16}/>
          <text x={x+bw/2} y={y-18} textAnchor="middle" className="disp" fontSize="34" fontWeight="600" fill={last?st.accent:st.ink} opacity={last?1:.55}>{d.v.toFixed(2)}</text>
          <text x={x+bw/2} y={h+38} textAnchor="middle" className="mono" fontSize="22" fill={st.body}>{d.l}</text>
        </g>;
      })}
      <line x1="0" y1={h+1} x2={w} y2={h+1} stroke={st.rule} strokeWidth="2"/>
      <text x="0" y={h+76} className="mono" fontSize="21" fill={st.body} letterSpacing="1">{data.label} · {data.unit}</text>
    </svg>
  );
}
function Line({ data, st, w=912, h=420 }) {
  const all = [...data.points.map(p=>p.v), data.proj ? data.proj.hi : 0];
  const max = Math.max(...all)*1.12;
  const years = [...data.points.map(p=>+p.l), data.proj?+data.proj.l:0];
  const x0 = Math.min(...years), x1 = Math.max(...years);
  const X = y => ((y-x0)/(x1-x0))*(w-70);
  const Y = v => h - (v/max)*h;
  const path = data.points.map((p,i)=>`${i?"L":"M"}${X(+p.l)},${Y(p.v)}`).join(" ");
  const pj = data.proj;
  return (
    <svg width={w} height={h+88} viewBox={`0 0 ${w} ${h+88}`} fill="none">
      {[0.25,0.5,0.75,1].map(g=><line key={g} x1="0" y1={Y(max*g)} x2={w} y2={Y(max*g)} stroke={st.rule} strokeWidth="1.4" strokeDasharray="2 8"/>)}
      {pj && <>
        <polygon points={`${X(+data.points.at(-1).l)},${Y(data.points.at(-1).v)} ${X(+pj.l)},${Y(pj.hi)} ${X(+pj.l)},${Y(pj.lo)}`} fill={st.accent} opacity=".16"/>
        <line x1={X(+data.points.at(-1).l)} y1={Y(data.points.at(-1).v)} x2={X(+pj.l)} y2={Y(pj.hi)} stroke={st.accent} strokeWidth="3" strokeDasharray="10 8"/>
        <line x1={X(+data.points.at(-1).l)} y1={Y(data.points.at(-1).v)} x2={X(+pj.l)} y2={Y(pj.lo)} stroke={st.accent} strokeWidth="3" strokeDasharray="10 8"/>
        <text x={X(+pj.l)} y={Y(pj.hi)-20} textAnchor="end" className="disp" fontSize="32" fontWeight="600" fill={st.accent}>{pj.hi}</text>
        <text x={X(+pj.l)} y={Y(pj.lo)+44} textAnchor="end" className="disp" fontSize="32" fontWeight="600" fill={st.accent}>{pj.lo}</text>
        <text x={X(+pj.l)} y={h+38} textAnchor="end" className="mono" fontSize="22" fill={st.body}>{pj.l} est.</text>
      </>}
      <path d={path} stroke={st.ink} strokeWidth="4" strokeLinecap="round"/>
      {data.points.map(p=><g key={p.l}>
        <circle cx={X(+p.l)} cy={Y(p.v)} r="9" fill={st.paper} stroke={st.ink} strokeWidth="4"/>
        <text x={X(+p.l)} y={Y(p.v)-26} textAnchor="middle" className="disp" fontSize="30" fontWeight="600" fill={st.ink}>{p.v}</text>
        <text x={X(+p.l)} y={h+38} textAnchor="middle" className="mono" fontSize="22" fill={st.body}>{p.l}</text>
      </g>)}
      <line x1="0" y1={h} x2={w} y2={h} stroke={st.rule} strokeWidth="2"/>
      <text x="0" y={h+78} className="mono" fontSize="21" fill={st.body}>{data.label} · {data.unit}</text>
    </svg>
  );
}
function CompareBars({ data, st, w=912 }) {
  const max = Math.max(...data.rows.map(r=>r.v));
  const total = data.rows.reduce((a,r)=>a+r.v,0);
  return (
    <div style={{ width:w }}>
      {data.rows.map((r,i)=>(
        <div key={r.l} style={{ marginBottom:i? 0 : 46 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:14 }}>
            <span style={{ fontSize:32, fontWeight:500, color:r.hi?st.ink:st.body }}>{r.l}</span>
            <span className="disp" style={{ fontSize:52, fontWeight:600, color:r.hi?st.accent:st.body }}>
              {r.v}{data.unit.includes("%")?"%":""}
            </span>
          </div>
          <div style={{ height:r.hi?54:54, background:r.hi?st.accent:st.ink, opacity:r.hi?1:.14,
            width:`${(r.v/max)*100}%`, borderRadius:4 }}/>
          {r.hi && <div style={{ display:"flex", alignItems:"center", gap:12, marginTop:16 }}>
            <span className="mono" style={{ fontSize:22, color:st.accent }}>{Math.round((r.v/total)*100)}% of total</span>
          </div>}
        </div>
      ))}
      <div className="mono" style={{ fontSize:21, color:st.body, marginTop:34 }}>{data.unit}</div>
    </div>
  );
}
function Flywheel({ data, st, s=620 }) {
  const c = s/2, R = s*0.33;
  const pos = i => { const a = -Math.PI/2 + i*(Math.PI/2); return [c + R*Math.cos(a), c + R*Math.sin(a)]; };
  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} fill="none">
      <circle cx={c} cy={c} r={R} stroke={st.rule} strokeWidth="2.5" strokeDasharray="3 10"/>
      {[0,1,2,3].map(i=>{
        const a0 = -Math.PI/2 + i*(Math.PI/2) + 0.38, a1 = a0 + Math.PI/2 - 0.76;
        const p0 = [c+R*Math.cos(a0), c+R*Math.sin(a0)], p1 = [c+R*Math.cos(a1), c+R*Math.sin(a1)];
        const mid = [c+ (R*1.06)*Math.cos((a0+a1)/2), c+(R*1.06)*Math.sin((a0+a1)/2)];
        const ang = ((a1*180/Math.PI)+90);
        return <g key={i}>
          <path d={`M${p0[0]},${p0[1]} Q${mid[0]},${mid[1]} ${p1[0]},${p1[1]}`} stroke={st.accent} strokeWidth="3.4" strokeLinecap="round"/>
          <g transform={`translate(${p1[0]},${p1[1]}) rotate(${ang})`}>
            <path d="M0,0 L-9,-16 M0,0 L9,-16" stroke={st.accent} strokeWidth="3.4" strokeLinecap="round"/>
          </g>
        </g>;
      })}
      {data.nodes.map((n,i)=>{
        const [x,y] = pos(i);
        return <g key={n}>
          <circle cx={x} cy={y} r="13" fill={st.ink}/>
          <text x={x} y={i===1? y+8 : i===3 ? y+8 : (i===0? y-38 : y+52)} textAnchor={i===1?"end":i===3?"start":"middle"}
            className="disp" fontSize="30" fontWeight="600" fill={st.ink}
            transform={i===1?`translate(-30,0)`:i===3?`translate(30,0)`:undefined}>{n}</text>
        </g>;
      })}
      <text x={c} y={c-6} textAnchor="middle" className="hand" fontSize="40" fill={st.accent}>each turn</text>
      <text x={c} y={c+34} textAnchor="middle" className="hand" fontSize="40" fill={st.accent}>funds the next</text>
    </svg>
  );
}
const US = ["00111111111111111100","01111111111111111110","11111111111111111110","11111111111111111100","11111111111111111000","01111111111111111000","00111111111111110000","00011111111111100000","00001111111111000000","00000111011111100000","00000010000011100000"];
function DotMap({ data, st, w=880 }) {
  const cols = 20, rows = US.length, step = w/cols, r = step*0.26;
  const flag = (x,y) => data.flags.some(f=>f.x===x&&f.y===y);
  return (
    <svg width={w} height={step*rows} viewBox={`0 0 ${w} ${step*rows}`} fill="none">
      {US.map((row,y)=>row.split("").map((ch,x)=> ch==="1" ? (
        <circle key={`${x}-${y}`} cx={x*step+step/2} cy={y*step+step/2} r={flag(x,y)?r*1.75:r}
          fill={flag(x,y)?st.accent:st.ink} opacity={flag(x,y)?1:.22}/>
      ) : null))}
      {data.flags.map((f,i)=>{
        const cx = f.x*step+step/2, cy = f.y*step+step/2;
        const right = f.x > cols/2;
        return <g key={f.n}>
          <circle cx={cx} cy={cy} r={r*3.4} stroke={st.accent} strokeWidth="2" opacity=".5"/>
          <line x1={cx} y1={cy} x2={right? cx+64 : cx-64} y2={cy - 44 - i*8} stroke={st.accent} strokeWidth="2"/>
          <text x={right? cx+72 : cx-72} y={cy-42-i*8} textAnchor={right?"start":"end"} className="mono" fontSize="22" fill={st.ink}>{f.n}</text>
        </g>;
      })}
    </svg>
  );
}
function ShotMock({ data, st, w=912 }) {
  const h = w*0.62;
  const dark = isDark(st.paper);
  const chrome = dark ? "rgba(255,255,255,.06)" : "#ffffff";
  const field = dark ? "rgba(255,255,255,.08)" : "#F4F4F4";
  return (
    <div style={{ width:w, position:"relative" }}>
      <div style={{ width:w, height:h, borderRadius:14, border:`2px solid ${st.rule}`, background:chrome, overflow:"hidden" }}>
        <div style={{ height:52, borderBottom:`2px solid ${st.rule}`, display:"flex", alignItems:"center", gap:9, padding:"0 20px" }}>
          {["#ff5f56","#ffbd2e","#27c93f"].map(c=><span key={c} style={{ width:14, height:14, borderRadius:99, background:c }}/>)}
          <span className="mono" style={{ fontSize:19, color:st.body, marginLeft:14 }}>app · /signup/step-3</span>
        </div>
        <div style={{ padding:"36px 40px" }}>
          <div className="disp" style={{ fontSize:40, fontWeight:600, color:st.ink, marginBottom:28 }}>{data.title}</div>
          {data.rows.map((r,i)=>{
            const hot = r===data.field;
            return <div key={r} style={{ marginBottom:20, opacity:hot?1:.4 }}>
              <div className="mono" style={{ fontSize:19, color:st.body, marginBottom:8 }}>{r}</div>
              <div style={{ height:60, borderRadius:8, background:field,
                border:`2px solid ${hot?st.accent:st.rule}`, display:"flex", alignItems:"center", padding:"0 18px" }}>
                {hot ? <span style={{ width:2, height:26, background:st.accent, animation:"cvBlink 1.1s step-end infinite" }}/>
                     : <span style={{ fontSize:22, color:st.body, opacity:.6 }}>{i===0?"you@company.com":"—"}</span>}
              </div>
            </div>;
          })}
        </div>
      </div>
      <div style={{ position:"absolute", right:-6, top:h*0.40, display:"flex", alignItems:"flex-start" }}>
        <Annot s={data.note} c={st.accent} size={38} flip/>
      </div>
    </div>
  );
}
function isDark(hex) {
  const h = hex.replace("#",""); if(h.length<6) return false;
  const [r,g,b] = [0,2,4].map(i=>parseInt(h.slice(i,i+2),16));
  return (0.299*r+0.587*g+0.114*b) < 140;
}

/* ---------------- layouts ---------------- */
function LayoutPhotoHero({ s, st, H }) {
  const img = IMG[s.asset];
  return (
    <div style={{ position:"absolute", inset:0 }}>
      {img && <img src={img} alt="" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover" }}/>}
      <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom, rgba(0,0,0,.42) 0%, rgba(0,0,0,.06) 34%, rgba(0,0,0,.72) 78%, rgba(0,0,0,.86) 100%)" }}/>
      <div style={{ position:"absolute", left:PAD, top:PAD, right:PAD, display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <Kicker s={s.kicker} c="rgba(255,255,255,.82)"/>
        <Sig c="rgba(255,255,255,.8)"/>
      </div>
      {s.annot && <div style={{ position:"absolute", right:PAD, top:H*0.42 }}>
        <Annot s={s.annot} c="#fff" size={40} flip/>
      </div>}
      <div style={{ position:"absolute", left:PAD, right:PAD, bottom:PAD }}>
        <Head text={s.headline} st={st} size={s.density?.text==="low"?86:72} c="#fff" mw={880}/>
        {s.caption && <div className="mono" style={{ fontSize:20, color:"rgba(255,255,255,.66)", marginTop:34 }}>{s.caption}</div>}
      </div>
    </div>
  );
}
function LayoutStatement({ s, st }) {
  const center = st.align === "center";
  return (
    <div style={{ position:"absolute", inset:0, padding:PAD, display:"flex", flexDirection:"column",
      alignItems:center?"center":"flex-start", textAlign:center?"center":"left" }}>
      <div style={{ width:"100%", display:"flex", justifyContent:"space-between" }}>
        <Kicker s={s.kicker} c={st.body}/><Sig c={st.body}/>
      </div>
      <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"center", width:"100%" }}>
        <Head text={s.headline} st={st} size={s.headline.length<26?150:92} c={st.ink} mw={900}
          style={{ marginBottom:44, alignSelf:center?"center":"flex-start" }}/>
        <div style={{ width:center?200:132, height:3, background:st.accent, marginBottom:44, alignSelf:center?"center":"flex-start" }}/>
        <Copy text={s.body} st={st} c={st.body} size={36} mw={center?760:700} style={{ margin:center?"0 auto":0 }}/>
      </div>
      <Foot s={s.foot} c={st.body}/>
    </div>
  );
}
function LayoutBar({ s, st }) {
  return (
    <div style={{ position:"absolute", inset:0, padding:PAD, display:"flex", flexDirection:"column" }}>
      <div style={{ display:"flex", justifyContent:"space-between" }}><Kicker s={s.kicker} c={st.body}/><Sig c={st.body}/></div>
      <Head text={s.headline} st={st} size={64} c={st.ink} mw={820} style={{ marginTop:42 }}/>
      <div style={{ flex:1, display:"flex", alignItems:"center", marginTop:20 }}><Bars data={s.data} st={st}/></div>
      {s.annot && <div style={{ display:"flex", justifyContent:"flex-end", marginTop:-96, marginBottom:40, paddingRight:12 }}>
        <Annot s={s.annot} c={st.accent} size={40}/></div>}
      <Foot s={s.foot} c={st.body}/>
    </div>
  );
}
function LayoutLine({ s, st }) {
  return (
    <div style={{ position:"absolute", inset:0, padding:PAD, display:"flex", flexDirection:"column" }}>
      <div style={{ display:"flex", justifyContent:"space-between" }}><Kicker s={s.kicker} c={st.body}/><Sig c={st.body}/></div>
      <Head text={s.headline} st={st} size={64} c={st.ink} mw={820} style={{ marginTop:42 }}/>
      <div style={{ flex:1, display:"flex", alignItems:"center", marginTop:24 }}><Line data={s.data} st={st}/></div>
      <Foot s={s.foot} c={st.body}/>
    </div>
  );
}
function LayoutFlywheel({ s, st }) {
  return (
    <div style={{ position:"absolute", inset:0, padding:PAD, display:"flex", flexDirection:"column" }}>
      <div style={{ display:"flex", justifyContent:"space-between" }}><Kicker s={s.kicker} c={st.body}/><Sig c={st.body}/></div>
      <Head text={s.headline} st={st} size={62} c={st.ink} mw={760} style={{ marginTop:42 }}/>
      <div style={{ flex:1, display:"grid", placeItems:"center" }}><Flywheel data={s.data} st={st}/></div>
      <Copy text={s.body} st={st} c={st.body} size={32} mw={780}/>
    </div>
  );
}
function LayoutPhotoNumber({ s, st, H }) {
  const img = IMG[s.asset];
  return (
    <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column" }}>
      <div style={{ position:"relative", height:H*0.56, overflow:"hidden" }}>
        {img && <img src={img} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>}
        <div style={{ position:"absolute", left:PAD, top:PAD, right:PAD, display:"flex", justifyContent:"space-between" }}>
          <Kicker s={s.kicker} c="rgba(255,255,255,.9)"/><Sig c="rgba(255,255,255,.85)"/>
        </div>
        {s.annot && <div style={{ position:"absolute", right:PAD-10, bottom:44 }}><Annot s={s.annot} c="#fff" size={38} flip/></div>}
      </div>
      <div style={{ flex:1, padding:`54px ${PAD}px ${PAD}px`, display:"flex", flexDirection:"column", justifyContent:"center" }}>
        <div className="disp" style={{ fontSize:210, fontWeight:600, letterSpacing:"-0.05em", lineHeight:.86, color:st.accent }}>{s.big}</div>
        <Head text={s.headline} st={st} size={62} c={st.ink} mw={820} style={{ marginTop:34 }}/>
        <Copy text={s.body} st={st} c={st.body} size={32} mw={740} style={{ marginTop:22 }}/>
      </div>
    </div>
  );
}
function LayoutComparison({ s, st }) {
  return (
    <div style={{ position:"absolute", inset:0, padding:PAD, display:"flex", flexDirection:"column" }}>
      <div style={{ display:"flex", justifyContent:"space-between" }}><Kicker s={s.kicker} c={st.body}/><Sig c={st.body}/></div>
      <Head text={s.headline} st={st} size={66} c={st.ink} mw={800} style={{ marginTop:42 }}/>
      <div style={{ flex:1, display:"flex", alignItems:"center", marginTop:30 }}><CompareBars data={s.data} st={st}/></div>
      <Foot s={s.foot} c={st.body}/>
    </div>
  );
}
function LayoutMap({ s, st }) {
  return (
    <div style={{ position:"absolute", inset:0, padding:PAD, display:"flex", flexDirection:"column" }}>
      <div style={{ display:"flex", justifyContent:"space-between" }}><Kicker s={s.kicker} c={st.body}/><Sig c={st.body}/></div>
      <Head text={s.headline} st={st} size={62} c={st.ink} mw={800} style={{ marginTop:40 }}/>
      <div style={{ flex:1, display:"grid", placeItems:"center" }}><DotMap data={s.data} st={st}/></div>
      <Copy text={s.body} st={st} c={st.body} size={31} mw={800} style={{ marginBottom:22 }}/>
      <Foot s={s.foot} c={st.body}/>
    </div>
  );
}
function LayoutSteps({ s, st }) {
  return (
    <div style={{ position:"absolute", inset:0, padding:PAD, display:"flex", flexDirection:"column" }}>
      <div style={{ display:"flex", justifyContent:"space-between" }}><Kicker s={s.kicker} c={st.body}/><Sig c={st.body}/></div>
      <Head text={s.headline} st={st} size={60} c={st.ink} mw={800} style={{ marginTop:40, marginBottom:20 }}/>
      <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"center" }}>
        {s.data.steps.map((x,i)=>(
          <div key={x.t} style={{ display:"flex", gap:32, padding:"30px 0", borderTop:`2px solid ${st.rule}` }}>
            <span className="mono" style={{ fontSize:26, color:st.accent, width:56, flex:"0 0 auto", paddingTop:6 }}>{String(i+1).padStart(2,"0")}</span>
            <span>
              <span className="disp" style={{ display:"block", fontSize:40, fontWeight:600, color:st.ink, letterSpacing:"-0.01em" }}>{x.t}</span>
              <span style={{ display:"block", fontSize:29, color:st.body, marginTop:8, maxWidth:700 }}>{x.d}</span>
            </span>
          </div>
        ))}
      </div>
      <Foot s={s.foot} c={st.body}/>
    </div>
  );
}
function LayoutQuote({ s, st }) {
  return (
    <div style={{ position:"absolute", inset:0, padding:PAD, display:"flex", flexDirection:"column" }}>
      <div style={{ display:"flex", justifyContent:"space-between" }}><Kicker s={s.kicker} c={st.body}/><Sig c={st.body}/></div>
      <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"center" }}>
        <div className="disp" style={{ fontSize:200, lineHeight:.6, color:st.accent, marginBottom:26 }}>&ldquo;</div>
        <Head text={s.quote} st={st} size={66} c={st.ink} mw={880}/>
        <div style={{ marginTop:48, display:"flex", alignItems:"center", gap:22 }}>
          <div style={{ width:70, height:70, borderRadius:999, background:st.accent, opacity:.18 }}/>
          <div>
            <div className="disp" style={{ fontSize:34, fontWeight:600, color:st.ink }}>{s.who}</div>
            <div className="mono" style={{ fontSize:21, color:st.body, marginTop:6 }}>{s.role}</div>
          </div>
        </div>
      </div>
      <Foot s={s.foot} c={st.body}/>
    </div>
  );
}
function LayoutTimeline({ s, st }) {
  return (
    <div style={{ position:"absolute", inset:0, padding:PAD, display:"flex", flexDirection:"column" }}>
      <div style={{ display:"flex", justifyContent:"space-between" }}><Kicker s={s.kicker} c={st.body}/><Sig c={st.body}/></div>
      <Head text={s.headline} st={st} size={62} c={st.ink} mw={760} style={{ marginTop:40 }}/>
      <div style={{ flex:1, position:"relative", marginTop:56, paddingLeft:26 }}>
        <div style={{ position:"absolute", left:6, top:14, bottom:40, width:2, background:st.rule }}/>
        {s.data.items.map(it=>(
          <div key={it.y} style={{ position:"relative", marginBottom:64, paddingLeft:52 }}>
            <span style={{ position:"absolute", left:-5, top:18, width:24, height:24, borderRadius:999, background:st.accent }}/>
            <div className="mono" style={{ fontSize:24, color:st.accent, letterSpacing:".06em" }}>{it.y}</div>
            <div className="disp" style={{ fontSize:52, fontWeight:600, color:st.ink, marginTop:10, letterSpacing:"-0.02em" }}>{it.t}</div>
          </div>
        ))}
      </div>
      <Foot s={s.foot} c={st.body}/>
    </div>
  );
}
function LayoutShot({ s, st }) {
  return (
    <div style={{ position:"absolute", inset:0, padding:PAD, display:"flex", flexDirection:"column" }}>
      <div style={{ display:"flex", justifyContent:"space-between" }}><Kicker s={s.kicker} c={st.body}/><Sig c={st.body}/></div>
      <Head text={s.headline} st={st} size={66} c={st.ink} mw={800} style={{ marginTop:40, marginBottom:34 }}/>
      <div style={{ flex:1, display:"grid", placeItems:"center" }}><ShotMock data={s.data} st={st}/></div>
      <Foot s={s.foot} c={st.body} style={{ marginTop:20 }}/>
    </div>
  );
}
function LayoutClosing({ s, st, H }) {
  const img = IMG[s.asset];
  return (
    <div style={{ position:"absolute", inset:0, padding:PAD, display:"flex", flexDirection:"column" }}>
      <div style={{ display:"flex", justifyContent:"space-between" }}><Kicker s={s.kicker} c={st.body}/><Sig c={st.body}/></div>
      {img && <div style={{ marginTop:44, height:H*0.30, borderRadius:10, overflow:"hidden" }}>
        <img src={img} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
      </div>}
      <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"center", paddingTop:img?44:0 }}>
        <Head text={s.headline} st={st} size={img?76:96} c={st.ink} mw={880}/>
        <Copy text={s.body} st={st} c={st.body} size={34} mw={720} style={{ marginTop:34 }}/>
      </div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", borderTop:`2px solid ${st.rule}`, paddingTop:34 }}>
        <span className="mono" style={{ fontSize:24, color:st.ink }}>{s.cta}</span>
        <span style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ width:34, height:34, borderRadius:999, background:st.accent, opacity:.9 }}/>
          <Sig c={st.ink}/>
        </span>
      </div>
    </div>
  );
}

const LAYOUTS = {
  "photo-hero":LayoutPhotoHero, "statement":LayoutStatement, "bar-chart":LayoutBar, "line-chart":LayoutLine,
  "flywheel":LayoutFlywheel, "photo-number":LayoutPhotoNumber, "comparison":LayoutComparison, "map":LayoutMap,
  "steps":LayoutSteps, "quote":LayoutQuote, "timeline":LayoutTimeline, "annotated-shot":LayoutShot, "closing":LayoutClosing,
};
export const LAYOUT_LIST = [
  { id:"photo-hero", name:"Photo hero", visual:"photograph" },
  { id:"statement", name:"Editorial statement", visual:"typography" },
  { id:"bar-chart", name:"Bar chart", visual:"bar_chart" },
  { id:"line-chart", name:"Line chart", visual:"line_chart" },
  { id:"comparison", name:"Comparison", visual:"comparison" },
  { id:"flywheel", name:"Loop diagram", visual:"diagram" },
  { id:"photo-number", name:"Photo + big number", visual:"photograph" },
  { id:"annotated-shot", name:"Annotated screenshot", visual:"annotated_screenshot" },
  { id:"steps", name:"Visual sequence", visual:"steps" },
  { id:"timeline", name:"Timeline", visual:"timeline" },
  { id:"map", name:"Dot map", visual:"map" },
  { id:"quote", name:"Quote", visual:"quote" },
  { id:"closing", name:"Closing", visual:"typography" },
];

const NEED = {
  "bar-chart":"series", "line-chart":"points", "comparison":"rows", "flywheel":"nodes",
  "steps":"steps", "timeline":"items", "map":"flags", "annotated-shot":"rows",
};
const FALLBACK = {
  "bar-chart":{ unit:"placeholder", label:"Add your data", series:[{l:"A",v:2},{l:"B",v:3.1},{l:"C",v:4.4}] },
  "line-chart":{ unit:"placeholder", label:"Add your data", points:[{l:"2019",v:18},{l:"2022",v:36},{l:"2025",v:61}], proj:{l:"2028",lo:80,hi:120} },
  "comparison":{ unit:"placeholder · %", rows:[{ l:"This", v:71, hi:true },{ l:"That", v:38 }] },
  "flywheel":{ nodes:["Cause","Effect","Reinforcement","Advantage"] },
  "steps":{ steps:[{t:"First",d:"What starts it"},{t:"Then",d:"What follows"},{t:"Finally",d:"What it means"}] },
  "timeline":{ items:[{y:"2019",t:"The start"},{y:"2022",t:"The turn"},{y:"2025",t:"Where it landed"}] },
  "map":{ flags:[{ n:"Region", x:8, y:8 }] },
  "annotated-shot":{ title:"Your screen", field:"The field that fails", note:"circle the problem", rows:["First field","The field that fails","Last field"] },
};
/* A specification may be edited into a layout its data doesn't fit.
   Normalise here so a swap can never render a broken slide. */
function normalise(slide) {
  const need = NEED[slide.layout];
  let s = slide;
  if (need && !(s.data && s.data[need])) s = { ...s, data:{ ...(FALLBACK[s.layout] || {}) } };
  if (s.layout === "quote" && !s.quote) s = { ...s, quote:s.headline || "Add the line worth quoting.", who:s.who || "Attribution", role:s.role || "add a source" };
  if (s.layout === "photo-number" && !s.big) s = { ...s, big:s.data?.series ? String(s.data.series.at(-1).v) : "01" };
  if ((s.layout === "photo-hero" || s.layout === "photo-number") && !s.asset) s = { ...s, asset:"warehouse" };
  if (s.layout === "closing" && !s.cta) s = { ...s, cta:"Made with Carvv" };
  return s;
}

export function Slide({ slide:raw, styleId="editorial", platformId="instagram", w=300, radius=2, onClick, shadow=false, id, deco, index, total }) {
  const slide = normalise(raw);
  const base = styleOf(styleId), pf = platformOf(platformId);
  const d = deco || {};
  let st = d.pal ? { ...base, ...d.pal } : base;
  if (d.font) st = { ...st, display:d.font };
  const H = pf.h / pf.w * 1080;
  const h = w * (pf.h/pf.w);
  const L = LAYOUTS[slide.layout] || LayoutStatement;
  const Tag = onClick ? "button" : "div";
  return (
    <Tag onClick={onClick} data-slide={id||slide.id} style={{ width:w, height:h, position:"relative", overflow:"hidden",
      borderRadius:d.radius !== undefined ? Math.round(radius * d.radius) : radius, background:st.paper, display:"block", padding:0, border:"none",
      flex:"0 0 auto", textAlign:"left", cursor:onClick?"pointer":"default" }}>
      <div style={{ width:1080, height:H, position:"absolute", top:0, left:0, transform:`scale(${w/1080})`, transformOrigin:"top left" }}>
        <DecoCtx.Provider value={{ mark:d.mark !== false }}>
          <ScaleCtx.Provider value={slide.scale || 1}><L s={slide} st={st} H={H}/></ScaleCtx.Provider>
        </DecoCtx.Provider>
        {d.numbers && index !== undefined && (
          <div className="mono" style={{ position:"absolute", right:PAD, bottom:30, fontSize:22, color:st.body, letterSpacing:".14em" }}>
            {String(index + 1).padStart(2, "0")}/{String(total || 0).padStart(2, "0")}
          </div>
        )}
        {d.grain && <Grain/>}
      </div>
    </Tag>
  );
}
