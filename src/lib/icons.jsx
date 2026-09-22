import React from "react";

const P = {
  plus:"M12 5v14M5 12h14",
  minus:"M5 12h14",
  chevL:"M15 5l-7 7 7 7",
  chevR:"M9 5l7 7-7 7",
  chevD:"M6 9l6 6 6-6",
  chevU:"M6 15l6-6 6 6",
  x:"M6 6l12 12M18 6L6 18",
  check:"M4 12.5l5 5L20 6.5",
  search:"M11 4a7 7 0 100 14 7 7 0 000-14zM16.2 16.2L21 21",
  spark:"M12 3l1.6 5.1L19 10l-5.4 1.9L12 17l-1.6-5.1L5 10l5.4-1.9L12 3zM18.5 15.5l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2z",
  folder:"M3 7.5A1.5 1.5 0 014.5 6h4l2 2.5h7A1.5 1.5 0 0119 10v7.5A1.5 1.5 0 0117.5 19h-13A1.5 1.5 0 013 17.5v-10z",
  palette:"M12 3a9 9 0 100 18c1.4 0 2-1 2-2s-.8-2-.8-3 .9-1.6 2.3-1.6H19a2 2 0 002-2A9 9 0 0012 3zM7.5 9.5h.01M11 7h.01M15.5 8.5h.01M7 14h.01",
  layers:"M12 3l8 4.5-8 4.5-8-4.5L12 3zM4 12l8 4.5 8-4.5M4 16.5L12 21l8-4.5",
  user:"M12 12a4 4 0 100-8 4 4 0 000 8zM4.5 20a7.5 7.5 0 0115 0",
  slide:"M4 5h16v11H4zM9 19h6",
  grid:"M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",
  list:"M4 6h16M4 12h16M4 18h16",
  drag:"M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01",
  trash:"M4 7h16M9 7V5h6v2M6 7l1 13h10l1-13M10 11v6M14 11v6",
  copy:"M9 9h10v11H9zM15 5H5v10",
  refresh:"M20 12a8 8 0 11-2.6-5.9M20 4v4.5h-4.5",
  undo:"M4 9h10a5 5 0 010 10H9M4 9l4-4M4 9l4 4",
  redo:"M20 9H10a5 5 0 000 10h5M20 9l-4-4M20 9l-4 4",
  download:"M12 4v11M7.5 11L12 15.5 16.5 11M5 20h14",
  share:"M12 16V4M8 8l4-4 4 4M5 13v7h14v-7",
  link:"M10.5 13.5l3-3M9 15l-1.5 1.5a3.2 3.2 0 01-4.5-4.5L5 10.5M15 9l1.5-1.5a3.2 3.2 0 014.5 4.5L19.5 13.5",
  file:"M6 3h7l5 5v13H6zM13 3v5h5",
  image:"M4 5h16v14H4zM4 15l4.5-4.5L13 15l3-3 4 4M9 9h.01",
  chart:"M4 20V9M10 20V4M16 20v-7M22 20H2",
  quote:"M8.5 6C6 7 4.5 9.4 4.5 12.2c0 2 1.2 3.3 2.9 3.3 1.6 0 2.7-1.1 2.7-2.6 0-1.4-1-2.5-2.4-2.5-.3 0-.6 0-.8.1C7.2 9 8.3 7.6 10 6.8L8.5 6zM17.5 6c-2.5 1-4 3.4-4 6.2 0 2 1.2 3.3 2.9 3.3 1.6 0 2.7-1.1 2.7-2.6 0-1.4-1-2.5-2.4-2.5-.3 0-.6 0-.8.1.3-1.5 1.4-2.9 3.1-3.7L17.5 6z",
  lock:"M6 11h12v9H6zM8.5 11V8a3.5 3.5 0 017 0v3",
  bell:"M6 16V10.5a6 6 0 1112 0V16l1.5 2.5h-15L6 16zM10 21h4",
  logout:"M15 5H6v14h9M11 12h9M17 8.5l3.5 3.5L17 15.5",
  pencil:"M5 19l1-4L17 4l3 3L9 18l-4 1z",
  eye:"M2.5 12S6 6.5 12 6.5 21.5 12 21.5 12 18 17.5 12 17.5 2.5 12 2.5 12zM12 14.6a2.6 2.6 0 100-5.2 2.6 2.6 0 000 5.2z",
  alert:"M12 4l9 16H3l9-16zM12 10v4.5M12 17.5h.01",
  info:"M12 21a9 9 0 100-18 9 9 0 000 18zM12 11v5M12 8h.01",
  filter:"M4 6h16M7 12h10M10 18h4",
  sort:"M7 4v16M7 20l-3-3M7 20l3-3M17 20V4M17 4l-3 3M17 4l3 3",
  play:"M7 4.5l12 7.5-12 7.5z",
  wand:"M4 20L14 10M15.5 4l1 2.6 2.6 1-2.6 1-1 2.6-1-2.6-2.6-1 2.6-1L15.5 4zM19 15l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8z",
  type:"M5 7V5h14v2M12 5v14M9.5 19h5",
  layout:"M4 5h16v14H4zM4 10h16M10 10v9",
  dots:"M6 12h.01M12 12h.01M18 12h.01",
  clock:"M12 21a9 9 0 100-18 9 9 0 000 18zM12 7.5V12l3 2",
  bolt:"M13 3L5 14h6l-1 7 8-11h-6l1-7z",
  book:"M6 3h9l4 4v14H6zM15 3v4h4M9.5 12h6M9.5 16h4",
  shield:"M12 3l7 3v6c0 4.2-2.9 7.5-7 9-4.1-1.5-7-4.8-7-9V6l7-3zM9 12l2.2 2.2L15.5 10",
  cmd:"M9 9h6v6H9zM9 9V7a2 2 0 10-2 2h2zM15 9V7a2 2 0 112 2h-2zM9 15v2a2 2 0 11-2-2h2zM15 15v2a2 2 0 102-2h-2z",
  sliders:"M5 8h10M19 8h0.01M5 16h4M13 16h6M15 5v6M9 13v6",
  up:"M12 19V5M6 11l6-6 6 6",
  arrowR:"M5 12h13M13 6.5l5.5 5.5L13 17.5",
  camera:"M4 8h3l1.5-2h7L17 8h3v11H4zM12 16.5a3.2 3.2 0 100-6.4 3.2 3.2 0 000 6.4",
  save:"M5 5h11l3 3v11H5zM8 5v5h7V5M8 19v-5h8v5",
  history:"M12 7.5V12l3 1.8M4 12a8 8 0 1016 0 8 8 0 00-13.9-5.4M4 4v4h4",
  globe:"M12 21a9 9 0 100-18 9 9 0 000 18zM3.5 9.5h17M3.5 14.5h17M12 3c2.5 2.4 3.8 5.3 3.8 9S14.5 18.6 12 21c-2.5-2.4-3.8-5.3-3.8-9S9.5 5.4 12 3z",
  crop:"M6 4v12.5h12.5M4 6.5h13V19",
  target:"M12 21a9 9 0 100-18 9 9 0 000 18zM12 16.5a4.5 4.5 0 100-9 4.5 4.5 0 000 9zM12 13.2a1.2 1.2 0 100-2.4 1.2 1.2 0 000 2.4",
};

export function Icon({ n, s = 20, c = "currentColor", w = 1.6, style, className }) {
  const d = P[n] || P.info;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" aria-hidden="true" style={style} className={className}>
      <path d={d} stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* The Carvv mark: a V groove carved through three woven threads. */
export function Mark({ s = 28, c = "#000", draw = false, thread = true }) {
  const L = 120;
  const a = (i) => draw ? { strokeDasharray: L, strokeDashoffset: 0, style:{ "--len": L, animation:`cvDraw .9s cubic-bezier(.3,.9,.3,1) ${0.12*i}s both` } } : {};
  return (
    <svg width={s} height={s} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <g stroke={c} strokeWidth="1.7" strokeLinecap="round" opacity={thread?0.42:1} className={thread?"thread":""}>
        <path d="M3 10.5h26" {...a(0)} />
        <path d="M3 16h26" {...a(1)} />
        <path d="M3 21.5h26" {...a(2)} />
      </g>
      <path d="M8 6.5L16 25.5L24 6.5" stroke={c} strokeWidth="3.1" strokeLinecap="round" strokeLinejoin="round" {...a(3)} />
    </svg>
  );
}

export function Wordmark({ s = 20, c = "#000" }) {
  return (
    <span className="disp" style={{ fontSize:s, fontWeight:700, letterSpacing:"-0.02em", color:c, lineHeight:1 }}>
      Carvv
    </span>
  );
}
