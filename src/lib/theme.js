import { C, CUSTOM } from "./tokens";

/* ============================================================
   Chrome themes. The Ollama system is one continuous sheet, so a
   theme swaps the sheet and its neutrals — never adds decoration.
   Every component reads C.* at render time, so mutating C and
   re-rendering the tree is the whole implementation.
   ============================================================ */
export const THEMES = [
  { id:"paper", name:"Paper", blurb:"The original. Pure white, hairline rules.",
    v:{ canvas:"#ffffff", soft:"#fafafa", dark:"#171717", hair:"#e5e5e5", hair2:"#d4d4d4",
        ink:"#000000", inkDeep:"#090909", charcoal:"#525252", body:"#6b6b6b", mute:"#8a8a8a", shell:"#fafafa" } },
  { id:"sand", name:"Sand", blurb:"Warm stock. Reads like a printed page.",
    v:{ canvas:"#FCFAF6", soft:"#F3EFE6", dark:"#1C1915", hair:"#E6DFD1", hair2:"#D6CDBA",
        ink:"#16130E", inkDeep:"#0D0B07", charcoal:"#575044", body:"#6E6656", mute:"#8E8677", shell:"#F1ECE1" } },
  { id:"ink", name:"Ink", blurb:"Lights off. For editing at 1am.",
    v:{ canvas:"#0D0D0D", soft:"#181818", dark:"#1F1F1F", hair:"#262626", hair2:"#333333",
        ink:"#FFFFFF", inkDeep:"#E6E6E6", charcoal:"#DCDCDC", body:"#CACACA", mute:"#ADADAD", shell:"#080808" } },
  { id:"slate", name:"Slate", blurb:"Cool grey, softer contrast, long sessions.",
    v:{ canvas:"#12151A", soft:"#1B1F26", dark:"#232830", hair:"#2A303A", hair2:"#38404C",
        ink:"#EEF2F7", inkDeep:"#D7DDE5", charcoal:"#D5DCE5", body:"#C0C8D3", mute:"#A3ACB8", shell:"#0D1014" } },
];
export const themeOf = id => THEMES.find(t => t.id === id) || THEMES[0];

/* Chrome accent. Ink is the default and the design's intent; the rest are
   opt-in and only touch meters, active chips, switches and focus. */
export const ACCENTS = [
  { id:"ink", name:"Ink", hex:null },
  { id:"clay", name:"Clay", hex:"#B23A22" },
  { id:"forest", name:"Forest", hex:"#2F5D3A" },
  { id:"cobalt", name:"Cobalt", hex:"#2D4EA8" },
  { id:"plum", name:"Plum", hex:"#6B2D5B" },
  { id:"amber", name:"Amber", hex:"#9A6612" },
  { id:"teal", name:"Teal", hex:"#106B6B" },
];
export const accentOf = id => ACCENTS.find(a => a.id === id) || ACCENTS[0];

export function applyTheme(themeId, accentId) {
  const t = themeOf(themeId), a = accentOf(accentId);
  Object.assign(C, t.v);
  C.theme = t.id;
  C.isDark = t.id === "ink" || t.id === "slate";
  C.accent = a.hex || t.v.ink;
  C.onAccent = a.hex ? "#ffffff" : (t.id === "ink" || t.id === "slate" ? "#0D0D0D" : "#ffffff");
  C.onDark = t.id === "ink" || t.id === "slate" ? "#ffffff" : "#ffffff";
  if (typeof document !== "undefined") {
    const r = document.documentElement.style;
    r.setProperty("--canvas", C.canvas); r.setProperty("--soft", C.soft);
    r.setProperty("--hair", C.hair); r.setProperty("--hair2", C.hair2);
    r.setProperty("--ink", C.ink); r.setProperty("--body", C.body);
    r.setProperty("--mute", C.mute); r.setProperty("--charcoal", C.charcoal);
    r.setProperty("--shell", t.v.shell);
    document.body.style.background = t.v.shell;
    document.body.style.color = C.ink;
  }
  return C;
}

/* ---------- palette maths, used by the palette studio ---------- */
const hex2rgb = h => { const s = h.replace("#", ""); return [0, 2, 4].map(i => parseInt(s.slice(i, i + 2), 16)); };
const lum = h => { const [r, g, b] = hex2rgb(h).map(v => { const c = v / 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
export function contrast(a, b) { const l1 = lum(a), l2 = lum(b); const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1]; return Math.round(((hi + 0.05) / (lo + 0.05)) * 10) / 10; }
export const isDarkHex = h => lum(h) < 0.32;
export function mix(a, b, t) {
  const A = hex2rgb(a), B = hex2rgb(b);
  return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, "0")).join("");
}
/* Build a full slide palette from one accent + one paper. Body and rule are
   derived so a user-picked pair can never produce unreadable type. */
export function derive(paper, accent) {
  const dark = isDarkHex(paper);
  const ink = dark ? mix(paper, "#ffffff", 0.94) : mix(paper, "#000000", 0.93);
  const body = dark ? mix(paper, "#ffffff", 0.76) : mix(paper, "#000000", 0.55);
  const rule = dark ? mix(paper, "#ffffff", 0.18) : mix(paper, "#000000", 0.13);
  let acc = accent;
  if (contrast(acc, paper) < 2.4) acc = dark ? mix(acc, "#ffffff", 0.45) : mix(acc, "#000000", 0.35);
  return { paper, ink, body, rule, accent:acc };
}
export const PALETTES = [
  { id:"bone", name:"Bone & clay", paper:"#FBF8F3", accent:"#B23A22" },
  { id:"news", name:"Newsprint", paper:"#F2F0EB", accent:"#1A1A1A" },
  { id:"oxblood", name:"Oxblood", paper:"#140C0C", accent:"#C2412C" },
  { id:"teal", name:"Deep teal", paper:"#06211F", accent:"#4FD1C5" },
  { id:"arctic", name:"Arctic", paper:"#F4F8FB", accent:"#2D4EA8" },
  { id:"press", name:"Mustard press", paper:"#FFFBF0", accent:"#A9760B" },
  { id:"midnight", name:"Midnight", paper:"#0B0F1A", accent:"#7C9BFF" },
  { id:"moss", name:"Moss", paper:"#F4F5EF", accent:"#3F5D2E" },
  { id:"carbon", name:"Carbon", paper:"#111111", accent:"#F2E900" },
  { id:"blush", name:"Blush", paper:"#FDF3F1", accent:"#A83A5B" },
];
export function setCustomPalette(p, font) {
  Object.assign(CUSTOM, derive(p.paper, p.accent));
  if (font) CUSTOM.display = font;
  return CUSTOM;
}
