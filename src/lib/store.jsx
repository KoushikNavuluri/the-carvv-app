import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { PROJECTS, QA_TEMPLATE } from "../data/projects";
import { ASSETS } from "../data/assets";
import { applyTheme, setCustomPalette, PALETTES, derive } from "./theme";
import { isConfigured, getSessionUser, pullProjects, pullAssets, pullProfile, pushProfile, syncProjects, syncAssets } from "./appwrite";

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

const clone = o => JSON.parse(JSON.stringify(o));

export function AppProvider({ children }) {
  const [phase, setPhase] = useState("splash");           // splash | onboarding | auth | app
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("create");
  const [stack, setStack] = useState([]);                  // screens above the tab
  const [projects, setProjects] = useState(() => clone(PROJECTS));
  const [assets, setAssets] = useState(() => clone(ASSETS));
  const [qa, setQa] = useState(() => clone(QA_TEMPLATE));
  const [toasts, setToasts] = useState([]);
  const [brand, setBrand] = useState({
    name:"Field Notes", colors:["#141210","#B23A22","#FBF8F3","#4A443C"], accent:"#B23A22",
    pair:"Nunito / Inter", tone:["Editorial","Specific","Dry"], icon:"Line, 1.5px", illo:"Hand-drawn accents",
    refs:["Monocle spreads","1968 annual reports","Field guides"], logo:"FN", active:true,
  });
  const [prefs, setPrefs] = useState({ autosave:true, motion:true, haptics:true, cites:true, quality:"2x", grid:true,
    theme:"paper", accent:"ink" });
  const [palette, setPalette] = useState(() => ({ id:"bone", name:"Bone & clay", ...derive("#FBF8F3", "#B23A22"), display:"disp" }));
  const [themeV, setThemeV] = useState(0);
  useEffect(() => { applyTheme(prefs.theme, prefs.accent); setThemeV(v => v + 1); }, [prefs.theme, prefs.accent]);
  useEffect(() => { setCustomPalette(palette, palette.display); setThemeV(v => v + 1); }, [palette]);
  const [draft, setDraft] = useState({ input:"", slides:7, auto:true, platform:"instagram", style:"editorial", template:"auto", file:null });
  const [hist, setHist] = useState({ past:[], future:[] });
  const [saved, setSaved] = useState("Saved");
  const saveTimer = useRef(null);
  const [hasSession, setHasSession] = useState(false);

  /* ---- Appwrite: restore the session, then hydrate + sync the studio ---- */
  const hydratedFor = useRef(null);
  const hydrate = useCallback((id) => {
    if (!isConfigured || !id || hydratedFor.current === id) return;
    hydratedFor.current = id;
    Promise.all([pullProjects(id), pullAssets(id), pullProfile(id)]).then(([pr, as, pf]) => {
      if (pr === null && as === null && pf === null) { hydratedFor.current = null; return; }
      if (pr && pr.length) setProjects(pr);
      if (as && as.length) setAssets(as);
      if (pf?.brand) setBrand(pf.brand);
      if (pf?.prefs) setPrefs(x => ({ ...x, ...pf.prefs }));
      if (pf?.palette) setPalette(x => ({ ...x, ...pf.palette }));
    });
  }, []);
  useEffect(() => {
    if (!isConfigured) return;
    getSessionUser().then(u => {
      if (!u) return;
      setHasSession(true);
      setUser({ name:u.name || (u.email ? u.email.split("@")[0] : "Guest"), email:u.email || "guest@carvv.local", plan:"Pro", uid:u.$id });
    });
  }, []);
  useEffect(() => { if (user?.uid) hydrate(user.uid); }, [user?.uid, hydrate]);
  const syncTimer = useRef(null);
  useEffect(() => {
    const uid = user?.uid;
    if (!isConfigured || !uid || hydratedFor.current !== uid) return;
    clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => syncProjects(uid, projects), 1200);
    return () => clearTimeout(syncTimer.current);
  }, [projects, user?.uid]);
  useEffect(() => {
    const uid = user?.uid;
    if (!isConfigured || !uid || hydratedFor.current !== uid) return;
    const t = setTimeout(() => syncAssets(uid, assets), 1200);
    return () => clearTimeout(t);
  }, [assets, user?.uid]);
  useEffect(() => {
    const uid = user?.uid;
    if (!isConfigured || !uid || hydratedFor.current !== uid) return;
    const t = setTimeout(() => pushProfile(uid, { brand, prefs, palette }), 1200);
    return () => clearTimeout(t);
  }, [brand, prefs, palette, user?.uid]);

  const toast = useCallback((msg, icon="check") => {
    const id = Math.random().toString(36).slice(2);
    setToasts(t => [...t, { id, msg, icon }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 2600);
  }, []);

  const go = useCallback((n, p = {}) => setStack(s => [...s, { n, p }]), []);
  const back = useCallback(() => setStack(s => s.slice(0, -1)), []);
  const reset = useCallback((t) => { setStack([]); if (t) setTab(t); }, []);
  const replace = useCallback((n, p = {}) => setStack(s => [...s.slice(0, -1), { n, p }]), []);

  const project = useCallback(id => projects.find(p => p.id === id), [projects]);

  const commit = useCallback((id, fn, label) => {
    setProjects(prev => {
      const snap = clone(prev);
      setHist(h => ({ past:[...h.past.slice(-24), { snap, label }], future:[] }));
      return prev.map(p => p.id === id ? fn(clone(p)) : p);
    });
    setSaved("Saving…");
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => setSaved("Saved · just now"), 700);
  }, []);
  const undo = useCallback(() => {
    setHist(h => {
      if (!h.past.length) return h;
      const last = h.past[h.past.length - 1];
      setProjects(cur => { setHist(hh => ({ ...hh, future:[{ snap:clone(cur), label:last.label }, ...hh.future].slice(0, 24) })); return last.snap; });
      return { past:h.past.slice(0, -1), future:h.future };
    });
  }, []);
  const redo = useCallback(() => {
    setHist(h => {
      if (!h.future.length) return h;
      const nx = h.future[0];
      setProjects(cur => { setHist(hh => ({ ...hh, past:[...hh.past, { snap:clone(cur), label:nx.label }] })); return nx.snap; });
      return { past:h.past, future:h.future.slice(1) };
    });
  }, []);

  const addProject = useCallback(p => { setProjects(prev => [p, ...prev]); }, []);
  const removeProject = useCallback(id => setProjects(prev => prev.filter(p => p.id !== id)), []);

  const value = useMemo(() => ({
    phase, setPhase, user, setUser, tab, setTab, stack, go, back, reset, replace,
    projects, setProjects, project, addProject, removeProject, commit, undo, redo,
    canUndo: hist.past.length > 0, canRedo: hist.future.length > 0, histLen: hist.past.length,
    assets, setAssets, qa, setQa, brand, setBrand, prefs, setPrefs, draft, setDraft,
    palette, setPalette, themeV, toast, toasts, saved, setSaved, hasSession,
  }), [phase, user, tab, stack, projects, assets, qa, brand, prefs, palette, themeV, draft, toasts, saved, hist, hasSession, go, back, reset, replace, project, commit, undo, redo, addProject, removeProject, toast]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
