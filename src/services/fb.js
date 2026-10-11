// ═══════════════════════════════════════════════════════════════
//  Firebase Realtime Database via REST + connexion anonyme (sans SDK)
//  - Chaque téléphone a une identité anonyme (uid) → les règles de sécurité
//    peuvent n'autoriser que les deux membres d'un couple.
//  - Si la clé API n'est pas renseignée, l'app fonctionne en mode « ancien »
//    (sans authentification) pour ne rien casser pendant la migration.
// ═══════════════════════════════════════════════════════════════
import { AppState } from 'react-native';
import { CONFIG, isPlaceholder } from '../config';
import { load, save } from './storage';

const DB = CONFIG.FIREBASE_DB_URL;
const AUTH_KEY = 'auth';
let auth = null;          // { uid, idToken, refreshToken, expiresAt }
let pending = null;

const authEnabled = () => !isPlaceholder(CONFIG.FIREBASE_API_KEY);

async function signUpAnonymous() {
  const r = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${CONFIG.FIREBASE_API_KEY}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ returnSecureToken: true }),
  });
  if (!r.ok) throw new Error('auth ' + r.status);
  const d = await r.json();
  return { uid: d.localId, idToken: d.idToken, refreshToken: d.refreshToken, expiresAt: Date.now() + (+d.expiresIn) * 1000 };
}

async function refreshToken(rt) {
  const r = await fetch(`https://securetoken.googleapis.com/v1/token?key=${CONFIG.FIREBASE_API_KEY}`, {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=refresh_token&refresh_token=${encodeURIComponent(rt)}`,
  });
  if (!r.ok) throw new Error('refresh ' + r.status);
  const d = await r.json();
  return { uid: d.user_id, idToken: d.id_token, refreshToken: d.refresh_token, expiresAt: Date.now() + (+d.expires_in) * 1000 };
}

export async function ensureAuth() {
  if (!authEnabled()) return null;
  if (pending) return pending;
  pending = (async () => {
    try {
      if (!auth) auth = await load(AUTH_KEY, null);
      if (auth && auth.expiresAt - Date.now() > 60 * 1000) return auth;
      auth = auth && auth.refreshToken ? await refreshToken(auth.refreshToken).catch(() => null) : null;
      if (!auth) auth = await signUpAnonymous();
      await save(AUTH_KEY, auth);
      return auth;
    } finally { pending = null; }
  })();
  return pending;
}

export async function getUid() {
  const a = await ensureAuth().catch(() => null);
  if (a) return a.uid;
  // Mode « sans authentification » : identifiant local persistant (pour tester avant de configurer Firebase Auth)
  let id = await load('localUid', null);
  if (!id) { id = 'u' + Math.random().toString(36).slice(2, 12); await save('localUid', id); }
  return id;
}

async function req(method, path, body, query = '') {
  for (let attempt = 0; attempt < 2; attempt++) {
    const a = await ensureAuth().catch(() => null);
    const q = (a ? `auth=${encodeURIComponent(a.idToken)}&` : '') + query;
    const r = await fetch(`${DB}/${path}.json?${q}`, {
      method,
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    if (r.status === 401 && attempt === 0 && a) { auth = { ...a, expiresAt: 0 }; continue; } // jeton expiré → on renouvelle
    if (!r.ok) throw new Error('fb ' + r.status);
    return r.json();
  }
  throw new Error('fb 401');
}

export const SERVER_TS = { '.sv': 'timestamp' };
export const fbGet = (p) => req('GET', p);
export const fbSet = async (p, v) => { await req('PUT', p, v === undefined ? null : v); };
export const fbUpdate = async (p, v) => { await req('PATCH', p, v); };
export const fbPush = async (p, v) => (await req('POST', p, v)).name;
export const fbDel = async (p) => { try { await req('DELETE', p); } catch (e) {} };

// Écoute par sondage, mis en pause quand l'app est en arrière-plan (économise batterie et data)
export function fbListen(p, cb, ms = CONFIG.POLL_MS) {
  let stopped = false, busy = false;
  const id = setInterval(async () => {
    if (stopped || busy || AppState.currentState !== 'active') return;
    busy = true;
    try { const v = await fbGet(p); if (!stopped) cb(v); } catch (e) {}
    busy = false;
  }, ms);
  return () => { stopped = true; clearInterval(id); };
}
