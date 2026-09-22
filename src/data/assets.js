import { warehouse, card, foodcourt, towers } from "../assets/images.js";
export const IMG = { warehouse, card, foodcourt, towers };
export const ASSETS = [
  { id:"a1", key:"warehouse", name:"Warehouse club interior", kind:"real", type:"photograph",
    prov:{ src:"Stock library · editorial licence", detail:"Wide aisle, pallet racking", got:"Retrieved 18 Sep 2026" }, used:["p1-1"], dims:"1122 × 1402" },
  { id:"a2", key:"foodcourt", name:"Food court tray, overhead", kind:"real", type:"photograph",
    prov:{ src:"Stock library · editorial licence", detail:"Hot dog + soda, flat lay", got:"Retrieved 18 Sep 2026" }, used:["p1-5"], dims:"1122 × 1402" },
  { id:"a3", key:"card", name:"Membership card in hands", kind:"real", type:"photograph",
    prov:{ src:"Stock library · editorial licence", detail:"Blank matte card, window light", got:"Retrieved 18 Sep 2026" }, used:["p1-7"], dims:"1122 × 1402" },
  { id:"a4", key:"towers", name:"Transmission towers at dusk", kind:"real", type:"photograph",
    prov:{ src:"Stock library · editorial licence", detail:"Row of pylons, blue hour", got:"Retrieved 19 Sep 2026" }, used:["p2-1"], dims:"1122 × 1402" },
  { id:"a5", key:null, name:"Membership flywheel", kind:"generated", type:"diagram",
    prov:{ src:"Carvv diagram engine", detail:"4-node loop, drawn from claim c4", got:"Built 20 Sep 2026" }, used:["p1-4"], dims:"vector" },
  { id:"a6", key:null, name:"Fee revenue, FY20–FY24", kind:"generated", type:"chart",
    prov:{ src:"Carvv chart engine", detail:"Bars from 10-K table, exhibit 5", got:"Built 20 Sep 2026" }, used:["p1-3"], dims:"vector" },
  { id:"a7", key:null, name:"Profit split, FY24", kind:"generated", type:"chart",
    prov:{ src:"Carvv chart engine", detail:"Comparison bars, derived ratio", got:"Built 20 Sep 2026" }, used:["p1-6"], dims:"vector" },
  { id:"a8", key:null, name:"Data-centre load curve", kind:"generated", type:"chart",
    prov:{ src:"Carvv chart engine", detail:"Line + projection band", got:"Built 19 Sep 2026" }, used:["p2-3"], dims:"vector" },
  { id:"a9", key:null, name:"US load-growth hotspots", kind:"generated", type:"map",
    prov:{ src:"Carvv map engine", detail:"Dot-density, 3 regions flagged", got:"Built 19 Sep 2026" }, used:["p2-4"], dims:"vector" },
  { id:"a10", key:null, name:"Signup funnel, step 3", kind:"generated", type:"screenshot",
    prov:{ src:"Product screenshot · annotated by Carvv", detail:"Cropped to the field that fails", got:"Captured 12 Sep 2026" }, used:["p4-1"], dims:"1280 × 800" },
];
