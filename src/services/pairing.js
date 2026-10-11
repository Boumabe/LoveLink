// ═══════════════════════════════════════════════════════════════
//  Couple persistant : on s'associe UNE fois (code à 6 caractères),
//  ensuite tout (jeux, arbre, premium) passe par l'identifiant du couple.
//
//  Base de données :
//   invites/{CODE}   = { cid, owner, ts }
//   couples/{cid}    = { open, meta:{tz,created}, members:{uid:{name}}, presence:{uid:ts},
//                        live:{jeu:{sid,by,ts,joined}}, water:{jour:{uid:ts}} }
// ═══════════════════════════════════════════════════════════════
import { CONFIG } from '../config';
import { fbGet, fbSet, fbUpdate, fbDel, getUid, SERVER_TS } from './fb';

const ALPHA = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';           // pas de O/0 ni I/1
const rnd = (n, set) => Array.from({ length: n }, () => set[Math.floor(Math.random() * set.length)]).join('');
export const genInviteCode = () => rnd(6, ALPHA);
const genCid = () => 'c' + rnd(12, 'abcdefghijklmnopqrstuvwxyz0123456789'); // jamais de « _ » (voir règles)

export const myTzOffsetMin = () => -new Date().getTimezoneOffset();

export async function createInvite(myName) {
  const uid = await getUid();
  const cid = genCid();
  let code = genInviteCode();
  for (let i = 0; i < 6; i++) { if (!(await fbGet(`invites/${code}`))) break; code = genInviteCode(); }
  await fbSet(`couples/${cid}`, {
    open: true,
    meta: { tz: myTzOffsetMin(), created: SERVER_TS },
    members: { [uid]: { name: myName || '' } },
  });
  await fbSet(`invites/${code}`, { cid, owner: uid, ts: SERVER_TS });
  return { code, cid, uid };
}

export async function cancelInvite(code, cid) {
  await fbDel(`invites/${code}`);
  if (cid) await fbDel(`couples/${cid}`);
}

// Le créateur attend que le partenaire apparaisse dans members
export function readMembers(cid) { return fbGet(`couples/${cid}/members`); }

export function partnerOf(members, myUid) {
  if (!members) return null;
  const ids = Object.keys(members).filter((k) => k !== myUid);
  return ids.length ? { uid: ids[0], name: (members[ids[0]] || {}).name || '' } : null;
}

export async function closeCouple(cid) { await fbSet(`couples/${cid}/open`, false); }

// Résultat : { ok:true, cid, partner } ou { ok:false, error:'notfound'|'expired'|'full'|'network' }
export async function joinWithCode(code, myName) {
  try {
    const uid = await getUid();
    const inv = await fbGet(`invites/${code}`);
    if (!inv || !inv.cid) return { ok: false, error: 'notfound' };
    if (inv.owner === uid) return { ok: false, error: 'own' };
    if (inv.ts && Date.now() - inv.ts > CONFIG.INVITE_TTL_MS * 3) return { ok: false, error: 'expired' };
    try {
      await fbSet(`couples/${inv.cid}/members/${uid}`, { name: myName || '' });
    } catch (e) { return { ok: false, error: 'full' }; }   // règles : le couple est déjà fermé
    await closeCouple(inv.cid);
    await fbDel(`invites/${code}`).catch(() => {});
    const members = await readMembers(inv.cid);
    return { ok: true, cid: inv.cid, partner: partnerOf(members, uid) };
  } catch (e) { return { ok: false, error: 'network' }; }
}

export async function leaveCouple(cid) {
  const uid = await getUid();
  if (cid && uid) await fbDel(`couples/${cid}/members/${uid}`);
}

export async function touchPresence(cid) {
  const uid = await getUid();
  if (cid && uid) await fbSet(`couples/${cid}/presence/${uid}`, SERVER_TS).catch(() => {});
}
export const readPresence = (cid, partnerUid) => fbGet(`couples/${cid}/presence/${partnerUid}`);

// ───────────────────────────── Parties en direct ─────────────────────────────
// Le créateur écrit live/{jeu}; le partenaire « rejoint » ; les deux utilisent ensuite sid.
export async function startLive(cid, game) {
  const uid = await getUid();
  const sid = `${cid}_${Date.now().toString(36)}`;
  await fbSet(`couples/${cid}/live/${game}`, { sid, by: uid, ts: SERVER_TS, joined: null });
  return sid;
}
export const readLive = (cid, game) => fbGet(`couples/${cid}/live/${game}`);
export async function joinLive(cid, game) {
  const uid = await getUid();
  await fbUpdate(`couples/${cid}/live/${game}`, { joined: uid });
}
export const clearLive = (cid, game) => fbDel(`couples/${cid}/live/${game}`);
