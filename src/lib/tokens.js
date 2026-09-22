/* Mutable on purpose: applyTheme() rewrites these and the tree re-renders. */
export const C = {
  canvas:"#ffffff", soft:"#fafafa", dark:"#171717", hair:"#e5e5e5", hair2:"#d4d4d4",
  ink:"#000000", inkDeep:"#090909", charcoal:"#525252", body:"#6b6b6b", mute:"#8a8a8a",
  onDark:"#ffffff", onDarkMute:"rgba(255,255,255,0.7)", accent:"#000000", onAccent:"#ffffff",
  theme:"paper", isDark:false,
  tRed:"#ff5f56", tYel:"#ffbd2e", tGrn:"#27c93f",
};

/* The user's own slide palette, driven by the palette studio. */
export const CUSTOM = { paper:"#F6F4F1", ink:"#12130F", body:"#585B4E", rule:"#DEDCD3", accent:"#2F5D3A", display:"disp" };

/* Display type pairings for the work (not the chrome). */
export const FONTS = [
  { id:"disp", name:"Nunito", note:"Rounded geometric · the house face", cls:"disp" },
  { id:"hand", name:"Caveat", note:"Handwritten · loose and warm", cls:"hand" },
  { id:"serif", name:"Fraunces", note:"Editorial serif · magazine weight", cls:"serif" },
  { id:"cond", name:"Archivo", note:"Grotesque · tight and news-like", cls:"cond" },
  { id:"mono", name:"JetBrains", note:"Monospace · technical register", cls:"mono" },
];
export const fontCls = id => (FONTS.find(f => f.id === id) || FONTS[0]).cls;
// Style presets. These colors live inside the *work*, never in the app chrome.
export const STYLES = [
  { id:"editorial", name:"Editorial", blurb:"Magazine-like, typography-led, clay accent.",
    paper:"#FBF8F3", ink:"#141210", body:"#4A443C", accent:"#B23A22", rule:"#DCD4C6",
    display:"disp", head:"none", align:"left", annot:true, traits:["Nunito 600 / Inter","Clay + bone","Asymmetric columns"] },
  { id:"minimal", name:"Minimal", blurb:"Clean, spacious, nothing you don't need.",
    paper:"#FFFFFF", ink:"#111111", body:"#6B6B6B", accent:"#111111", rule:"#E8E8E8",
    display:"disp", head:"none", align:"left", annot:false, traits:["One weight","Paper white","Huge margins"] },
  { id:"bold", name:"Bold", blurb:"High contrast, loud numbers, no apologies.",
    paper:"#101010", ink:"#FFFFFF", body:"rgba(255,255,255,.72)", accent:"#F2E900", rule:"rgba(255,255,255,.18)",
    display:"disp", head:"upper", align:"left", annot:false, traits:["Caps display","Acid yellow","Edge-to-edge type"] },
  { id:"luxury", name:"Luxury", blurb:"Elegant, quiet, generous letter-spacing.",
    paper:"#0E0D0C", ink:"#F2EDE4", body:"rgba(242,237,228,.68)", accent:"#C8A96A", rule:"rgba(242,237,228,.18)",
    display:"disp", head:"upper", align:"center", annot:false, traits:["Wide tracking","Champagne foil","Centered"] },
  { id:"tech", name:"Tech", blurb:"Structured, information-rich, mono labels.",
    paper:"#0B0F14", ink:"#E8F0F7", body:"rgba(232,240,247,.66)", accent:"#5AA9FF", rule:"rgba(232,240,247,.14)",
    display:"disp", head:"none", align:"left", annot:false, traits:["Mono metadata","Grid overlay","Cyan data"] },
  { id:"playful", name:"Playful", blurb:"Handwritten display, warm paper, energy.",
    paper:"#FFF6E9", ink:"#1B1A17", body:"#5C5548", accent:"#FF6B35", rule:"#EADDC8",
    display:"hand", head:"none", align:"left", annot:true, traits:["Caveat display","Marker accents","Loose baseline"] },
  { id:"documentary", name:"Documentary", blurb:"Photo-led, evidence first, caption discipline.",
    paper:"#121212", ink:"#F5F5F5", body:"rgba(245,245,245,.7)", accent:"#E8E8E8", rule:"rgba(245,245,245,.2)",
    display:"disp", head:"none", align:"left", annot:true, traits:["Full-bleed photo","Mono captions","Hard crops"] },
  { id:"custom", name:"Custom", blurb:"Your saved Brand DNA drives every slide.",
    paper:"#F6F4F1", ink:"#12130F", body:"#585B4E", accent:"#2F5D3A", rule:"#DEDCD3",
    display:"disp", head:"none", align:"left", annot:true, traits:["From Brand DNA","Your palette","Your type pair"] },
];
export const styleOf = id => STYLES.find(s=>s.id===id) || STYLES[0];
export const PLATFORMS = [
  { id:"instagram", name:"Instagram", ratio:"4:5", w:1080, h:1350, note:"Mobile-first. Hook hard, move fast.", max:10 },
  { id:"linkedin", name:"LinkedIn", ratio:"4:5", w:1080, h:1350, note:"Denser insight, professional register.", max:12 },
  { id:"square", name:"Square", ratio:"1:1", w:1080, h:1080, note:"Safe everywhere. Less room to breathe.", max:10 },
];
export const platformOf = id => PLATFORMS.find(p=>p.id===id) || PLATFORMS[0];
export const VISUAL_TYPES = {
  photograph:"Photograph", bar_chart:"Bar chart", line_chart:"Line chart", diagram:"Diagram",
  annotated_screenshot:"Annotated screenshot", comparison:"Comparison", big_number:"Oversized number",
  quote:"Quote composition", timeline:"Timeline", map:"Map", steps:"Visual sequence", typography:"Editorial type",
};
