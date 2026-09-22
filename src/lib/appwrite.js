/* ============================================================
   Appwrite backend layer (project "carvv").
   Auth (email/password, 6-digit email code, anonymous guest),
   session restore, and per-user document sync for projects,
   assets and profile (brand DNA, prefs, palette).

   Everything here is optional at runtime: when the VITE_APPWRITE_*
   env vars are absent, isConfigured is false and the app runs in
   its fully local demo mode, pixel-identical to the mockup.
   ============================================================ */
import { Client, Account, Databases, ID, Query, Permission, Role } from "appwrite";

const ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT || "";
const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID || "";
const DB_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID || "carvv-db";

export const isConfigured = Boolean(ENDPOINT && PROJECT_ID);

let client = null, account = null, db = null;
if (isConfigured) {
  client = new Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID);
  account = new Account(client);
  db = new Databases(client);
}

const safe = (fn, fallback = null) => Promise.resolve().then(fn).catch(() => fallback);
const perms = (uid) => [Permission.read(Role.user(uid)), Permission.update(Role.user(uid)), Permission.delete(Role.user(uid))];

/* ---------------------------------------------------------- auth */
export async function getSessionUser() {
  if (!isConfigured) return null;
  return safe(() => account.get());
}
export async function signInEmail(email, password) {
  await account.createEmailPasswordSession(email, password);
  return account.get();
}
export async function signUpStart(name, email, password) {
  const u = await account.create(ID.unique(), email, password, name);
  // Send the 6-digit email code (matches the mockup's "Check your inbox" step).
  await account.createEmailToken(u.$id, email).catch(() => null);
  return u;
}
export async function verifyEmailCode(userId, secret) {
  await account.createSession(userId, secret);
  return account.get();
}
export async function guestLogin() {
  await account.createAnonymousSession();
  return account.get();
}
export async function remoteSignOut() {
  if (!isConfigured) return;
  await safe(() => account.deleteSession("current"));
}

/* ---------------------------------------------------------- mapping */
const parse = (s, fb) => { try { return JSON.parse(s); } catch { return fb; } };

function projectToRow(p, uid) {
  return {
    user_id: uid,
    title: String(p.title || "Untitled story").slice(0, 250),
    input_type: p.input?.type || "topic",
    input_value: String(p.input?.value || "").slice(0, 2000),
    platform: p.platform || "instagram",
    style: p.style || "editorial",
    template: p.template || "auto",
    status: p.status || "storyboard",
    cover: p.cover || "",
    slides: JSON.stringify(p.slides || []),
    sources: JSON.stringify(p.sources || []),
    score: typeof p.score === "number" ? Math.round(p.score) : (p.score?.total ?? null),
    fresh: !!p.fresh,
    updated_label: p.updated || "",
    payload: JSON.stringify(p),
  };
}
function rowToProject(r) {
  const p = parse(r.payload, null);
  if (p && p.id && Array.isArray(p.slides)) return p;
  return {
    id: r.$id, title: r.title, input: { type: r.input_type, value: r.input_value },
    platform: r.platform, style: r.style, template: r.template, status: r.status,
    cover: r.cover || null, slides: parse(r.slides, []), sources: parse(r.sources, []),
    created: r.$createdAt, updated: r.updated_label || "", score: r.score, fresh: r.fresh,
    versions: [], exports: [],
  };
}
function rowToAsset(r) {
  return { id: r.$id, key: r.asset_key || null, name: r.name, kind: r.kind, type: r.type,
    prov: parse(r.prov, {}), used: parse(r.used, []), dims: r.dims || "" };
}

/* ---------------------------------------------------------- reads */
export async function pullProjects(uid) {
  if (!isConfigured) return null;
  return safe(async () => {
    const r = await db.listDocuments(DB_ID, "projects", [Query.equal("user_id", uid), Query.limit(100), Query.orderDesc("$createdAt")]);
    return r.documents.map(rowToProject);
  }, null);
}
export async function pullAssets(uid) {
  if (!isConfigured) return null;
  return safe(async () => {
    const r = await db.listDocuments(DB_ID, "assets", [Query.equal("user_id", uid), Query.limit(100)]);
    return r.documents.map(rowToAsset);
  }, null);
}
export async function pullProfile(uid) {
  if (!isConfigured) return null;
  return safe(async () => {
    const r = await db.listDocuments(DB_ID, "profiles", [Query.equal("user_id", uid), Query.limit(1)]);
    const d = r.documents[0];
    if (!d) return null;
    return { brand: parse(d.brand, null), prefs: parse(d.prefs, null), palette: parse(d.palette, null) };
  }, null);
}

/* ---------------------------------------------------------- writes */
export async function pushProfile(uid, { brand, prefs, palette }) {
  if (!isConfigured) return;
  return safe(async () => {
    const data = { user_id: uid, brand: JSON.stringify(brand), prefs: JSON.stringify(prefs), palette: JSON.stringify(palette) };
    const r = await db.listDocuments(DB_ID, "profiles", [Query.equal("user_id", uid), Query.limit(1)]);
    if (r.documents[0]) await db.updateDocument(DB_ID, "profiles", r.documents[0].$id, data);
    else await db.createDocument(DB_ID, "profiles", ID.unique(), data, perms(uid));
  });
}

/* Whole-list sync: the studio keeps a small, personal corpus, so a
   debounced reconcile (upsert local, delete remote-only) is enough. */
export async function syncProjects(uid, projects) {
  if (!isConfigured) return;
  return safe(async () => {
    const remote = await db.listDocuments(DB_ID, "projects", [Query.equal("user_id", uid), Query.limit(100)]);
    const byLocal = new Map(remote.documents.map(d => [parse(d.payload, null)?.id || d.$id, d]));
    const keep = new Set();
    for (const p of projects) {
      keep.add(p.id);
      const data = projectToRow(p, uid);
      const existing = byLocal.get(p.id);
      if (existing) await db.updateDocument(DB_ID, "projects", existing.$id, data).catch(() => {});
      else await db.createDocument(DB_ID, "projects", ID.unique(), data, perms(uid)).catch(() => {});
    }
    for (const [pid, doc] of byLocal) {
      if (!keep.has(pid)) await db.deleteDocument(DB_ID, "projects", doc.$id).catch(() => {});
    }
  });
}
export async function syncAssets(uid, assets) {
  if (!isConfigured) return;
  return safe(async () => {
    const remote = await db.listDocuments(DB_ID, "assets", [Query.equal("user_id", uid), Query.limit(100)]);
    const byName = new Map(remote.documents.map(d => [d.name, d]));
    const keep = new Set(assets.map(a => a.name));
    for (const a of assets) {
      const data = { user_id: uid, name: a.name, kind: a.kind, type: a.type,
        asset_key: a.key || "", prov: JSON.stringify(a.prov || {}), used: JSON.stringify(a.used || []), dims: a.dims || "" };
      const existing = byName.get(a.name);
      if (existing) await db.updateDocument(DB_ID, "assets", existing.$id, data).catch(() => {});
      else await db.createDocument(DB_ID, "assets", ID.unique(), data, perms(uid)).catch(() => {});
    }
    for (const [name, doc] of byName) {
      if (!keep.has(name)) await db.deleteDocument(DB_ID, "assets", doc.$id).catch(() => {});
    }
  });
}
