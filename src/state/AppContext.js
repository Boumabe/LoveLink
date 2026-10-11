// ═══════════════════════════════════════════════════════════════
//  État global : profil, couple, premium, arbre. Un seul endroit, des services
//  purs en dessous (src/services) et des écrans « bêtes » au-dessus (src/screens).
// ═══════════════════════════════════════════════════════════════
import { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { AppState } from 'react-native';
import { load, save, clearAll } from '../services/storage';
import { fbGet, fbSet, getUid, SERVER_TS } from '../services/fb';
import { myTzOffsetMin, leaveCouple, touchPresence, readPresence } from '../services/pairing';
import { computeTree, dayKey } from '../services/tree';
import { initPurchases, onPremiumChange, restore as restorePurchases } from '../services/purchases';
import { scheduleReminders, ensurePermission } from '../services/notifications';
import { T, detectLang, fmt } from '../i18n';

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

const DEFAULT_PROFILE = { name: '', partnerName: '', relation: 'couple', loveLang: 'words', tone: 'romantic', onboarded: false };

export function AppProvider({ children }) {
  const [ready, setReady] = useState(false);
  const [langue, setLangueState] = useState(detectLang());
  const [profile, setProfile] = useState(DEFAULT_PROFILE);
  const [uid, setUid] = useState(null);
  const [couple, setCouple] = useState(null);
  const [premium, setPremium] = useState(false);
  const [remindersOn, setRemindersOn] = useState(true);
  const [waterLog, setWaterLog] = useState({});
  const [logReady, setLogReady] = useState(false);
  const [partnerSeen, setPartnerSeen] = useState(null);
  const [rainKey, setRainKey] = useState(0);
  const [lost, setLost] = useState(0);
  const [fallKey, setFallKey] = useState(0);
  const [tick, setTick] = useState(0);
  const t = T[langue] || T.fr;

  // ── Démarrage : on relit tout ce qui a été sauvegardé ──
  useEffect(() => {
    (async () => {
      const [l, p, c, r] = await Promise.all([load('lang', null), load('profile', null), load('couple', null), load('remind', true)]);
      if (l) setLangueState(l);
      if (p) setProfile({ ...DEFAULT_PROFILE, ...p });
      if (c) setCouple(c);
      setRemindersOn(r !== false);
      setReady(true);
      getUid().then(setUid).catch(() => {});
    })();
  }, []);
  useEffect(() => { if (ready) save('lang', langue); }, [langue, ready]);
  useEffect(() => { if (ready) save('profile', profile); }, [profile, ready]);
  useEffect(() => { if (ready) save('couple', couple); }, [couple, ready]);
  useEffect(() => { if (ready) save('remind', remindersOn); }, [remindersOn, ready]);

  // ── Arbre ──
  const tz = couple ? couple.tz : myTzOffsetMin();
  const today = dayKey(Date.now(), tz);
  const me = couple ? uid : 'me';
  const uids = couple ? [uid, couple.partnerUid] : ['me'];
  const tree = useMemo(() => computeTree({ water: waterLog, uids, today }), [waterLog, couple, uid, today]);

  const refreshTree = useCallback(async () => {
    if (couple && uid) {
      try { setWaterLog((await fbGet(`couples/${couple.cid}/water`)) || {}); setLogReady(true); } catch (e) {}
    } else { setWaterLog(await load('soloWater', {})); setLogReady(true); }
  }, [couple, uid]);
  useEffect(() => { if (ready && (!couple || uid)) { setLogReady(false); refreshTree(); } }, [ready, couple, uid]);

  const water = useCallback(async () => {
    if (!me) return false;
    const day = dayKey(Date.now(), tz);
    if (waterLog[day] && waterLog[day][me]) return false;
    const prev = waterLog;
    setWaterLog({ ...waterLog, [day]: { ...(waterLog[day] || {}), [me]: Date.now() } });
    setRainKey((k) => k + 1);
    try {
      if (couple) await fbSet(`couples/${couple.cid}/water/${day}/${uid}`, SERVER_TS);
      else await save('soloWater', { ...waterLog, [day]: { ...(waterLog[day] || {}), me: Date.now() } });
    } catch (e) { setWaterLog(prev); return false; }
    ensurePermission();
    return true;
  }, [waterLog, couple, uid, me, tz]);

  // Fleurs perdues depuis la dernière visite → pétales qui tombent + bandeau
  useEffect(() => {
    if (!ready || !logReady) return;
    (async () => {
      const k = couple ? couple.cid : 'solo';
      const st = await load('lastFlowers', null);
      if (st && st.key === k && tree.flowers < st.n) { setLost(st.n - tree.flowers); setFallKey((x) => x + 1); }
      else if (!st || st.key !== k || tree.flowers > st.n) await save('lastFlowers', { key: k, n: tree.flowers });
    })();
  }, [tree.flowers, ready, logReady, couple]);
  const ackLost = useCallback(async () => {
    await save('lastFlowers', { key: couple ? couple.cid : 'solo', n: tree.flowers }); setLost(0);
  }, [couple, tree.flowers]);

  // ── Présence du partenaire + retour au premier plan ──
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => { if (s === 'active') { setTick((x) => x + 1); refreshTree(); } });
    return () => { if (sub && sub.remove) sub.remove(); };
  }, [refreshTree]);
  useEffect(() => {
    if (!couple || !uid) { setPartnerSeen(null); return undefined; }
    let stop = false;
    const run = async () => {
      touchPresence(couple.cid);
      try { const ts = await readPresence(couple.cid, couple.partnerUid); if (!stop) setPartnerSeen(ts || null); } catch (e) {}
    };
    run();
    const id = setInterval(() => { if (AppState.currentState === 'active') run(); }, 45000);
    return () => { stop = true; clearInterval(id); };
  }, [couple, uid, tick]);

  // ── Premium (RevenueCat) : l'identifiant client = l'identifiant du couple ──
  useEffect(() => {
    if (!ready) return undefined;
    let off = () => {}; let gone = false;
    (async () => {
      const r = await initPurchases(couple ? couple.cid : null);
      if (!gone) setPremium(!!r.premium);
      off = onPremiumChange((p) => { if (!gone) setPremium(p); });
    })();
    return () => { gone = true; off(); };
  }, [ready, couple && couple.cid]);

  // ── Rappels « ton arbre a soif » ──
  const wateredNow = !!(tree.wateredToday && tree.wateredToday[me]);
  useEffect(() => {
    if (!ready) return;
    scheduleReminders({ enabled: remindersOn, skipToday: wateredNow, title: t.reminderTitle, bodies: [t.rem1, t.rem2, t.rem3] });
  }, [ready, remindersOn, langue, wateredNow]);

  // ── Actions ──
  const setLangue = useCallback((l) => setLangueState(l), []);
  const updateProfile = useCallback((patch) => setProfile((p) => ({ ...p, ...patch })), []);
  const pairWith = useCallback(async ({ cid, partner }) => {
    let ctz = myTzOffsetMin();
    try { const m = await fbGet(`couples/${cid}/meta`); if (m && typeof m.tz === 'number') ctz = m.tz; } catch (e) {}
    setCouple({ cid, partnerUid: partner.uid, partnerName: partner.name || '', tz: ctz });
  }, []);
  const unpair = useCallback(async () => {
    if (couple) await leaveCouple(couple.cid).catch(() => {});
    await save('lastFlowers', null); setCouple(null); setPremium(false);
  }, [couple]);
  const enableReminders = useCallback(async (on) => {
    if (on) { const ok = await ensurePermission(); setRemindersOn(ok || true); } else setRemindersOn(false);
  }, []);
  const doRestore = useCallback(async () => { const r = await restorePurchases(); setPremium(!!r.premium); return !!r.premium; }, []);
  const resetAll = useCallback(async () => { await clearAll(); setProfile(DEFAULT_PROFILE); setCouple(null); setPremium(false); setWaterLog({}); }, []);

  const partnerName = (profile.partnerName || (couple && couple.partnerName) || '').trim();
  const partnerLabel = partnerName || t.partnerFallback;
  const partnerOnline = !!partnerSeen && Date.now() - partnerSeen < 2 * 60 * 1000;
  const timeAgo = (ts) => {
    if (!ts) return '';
    const m = Math.max(0, Math.round((Date.now() - ts) / 60000));
    if (m < 1) return t.justNow;
    if (m < 60) return fmt(t.minAgo, { n: m });
    if (m < 1440) return fmt(t.hAgo, { n: Math.round(m / 60) });
    return fmt(t.dAgo, { n: Math.round(m / 1440) });
  };

  const value = useMemo(() => ({
    ready, langue, setLangue, t, profile, updateProfile, uid, couple, pairWith, unpair,
    premium, doRestore, remindersOn, enableReminders,
    tree, wateredNow, water, refreshTree, rainKey, lost, fallKey, ackLost,
    partnerName, partnerLabel, partnerSeen, partnerOnline, timeAgo, resetAll,
  }), [ready, langue, profile, uid, couple, premium, remindersOn, tree, wateredNow, rainKey, lost, fallKey, partnerSeen, waterLog, tick]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
