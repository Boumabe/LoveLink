// ═══════════════════════════════════════════════════════════════
//  Lancer / rejoindre une partie avec le partenaire déjà associé.
//  Remplace les anciens « codes de session » : plus rien à saisir.
//  (Nom conservé — ConnexionEcran — pour que les jeux historiques restent inchangés.)
// ═══════════════════════════════════════════════════════════════
import { useEffect, useRef, useState } from 'react';
import { View, Text, Share } from 'react-native';
import { useApp } from '../state/AppContext';
import { CONFIG } from '../config';
import { fmt } from '../i18n';
import { startLive, readLive, joinLive, clearLive } from '../services/pairing';
import { getUid } from '../services/fb';
import { Btn, Back, FadeIn, Glow, Pulse, Icon, Title } from '../ui/primitives';
import { C } from '../ui/tokens';

const GAME_KEY = { sessions: 'quiz', verite: 'verite', devine: 'devine', couple: 'couple' };

export function ConnexionEcran({ t, fbPath, emoji, couleur, onRetour, onConnecte }) {
  const { couple, partnerLabel, partnerOnline, partnerSeen, timeAgo } = useApp();
  const game = GAME_KEY[fbPath] || fbPath;
  const [uid, setUid] = useState(null);
  const [live, setLive] = useState(undefined);       // undefined = chargement
  const [mine, setMine] = useState(null);            // sid que j'ai créé
  const [busy, setBusy] = useState(false);
  const doneRef = useRef(false);

  useEffect(() => { getUid().then(setUid); }, []);
  useEffect(() => {
    if (!couple || !uid) return undefined;
    let stop = false;
    const poll = async () => {
      try {
        const l = await readLive(couple.cid, game);
        if (stop) return;
        setLive(l || null);
        if (l && l.by === uid && l.joined && mine === l.sid && !doneRef.current) { doneRef.current = true; onConnecte(l.sid, true); }
      } catch (e) { if (!stop) setLive((x) => (x === undefined ? null : x)); }
    };
    poll();
    const id = setInterval(poll, CONFIG.POLL_MS);
    return () => { stop = true; clearInterval(id); };
  }, [couple, uid, game, mine]);

  const fresh = live && live.ts && Date.now() - live.ts < CONFIG.LIVE_TTL_MS && !live.joined;
  const partnerWaits = !!(fresh && live.by !== uid);
  const iWait = !!(fresh && live.by === uid && mine === live.sid);

  async function lancer() { setBusy(true); try { const sid = await startLive(couple.cid, game); setMine(sid); } catch (e) {} setBusy(false); }
  async function rejoindre() {
    setBusy(true);
    try { await joinLive(couple.cid, game); doneRef.current = true; onConnecte(live.sid, false); } catch (e) { setBusy(false); }
  }
  async function annuler() { try { await clearLive(couple.cid, game); } catch (e) {} setMine(null); }
  async function prevenir() { try { await Share.share({ message: t.liveNudgeMsg }); } catch (e) {} }

  const presence = partnerOnline ? fmt(t.partnerOnline, { p: partnerLabel }) : partnerSeen ? fmt(t.partnerSeen, { p: partnerLabel, t: timeAgo(partnerSeen) }) : '';

  return (
    <View style={{ flex: 1, padding: 22 }}>
      <Back onPress={() => { if (iWait) annuler(); onRetour(); }} label={t.retour} />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <FadeIn key={partnerWaits ? 'w' : iWait ? 'i' : 'n'} style={{ alignItems: 'center', width: '100%' }}>
          <View style={{ alignItems: 'center', justifyContent: 'center', height: 200, width: 200, marginBottom: 14 }}>
            <Glow size={230} color={couleur} />
            {iWait && <><Pulse color={couleur} size={110} /><Pulse color={couleur} size={110} delay={1100} /></>}
            <View style={{ width: 96, height: 96, borderRadius: 48, borderWidth: 1.5, borderColor: couleur + '88', backgroundColor: couleur + '1F', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 42 }}>{emoji}</Text>
            </View>
          </View>
          {partnerWaits ? (
            <>
              <Title size={26} style={{ textAlign: 'center', marginBottom: 8 }}>{fmt(t.livePartnerWaits, { p: partnerLabel })}</Title>
              <Text style={[{ color: C.muted, fontSize: 15, textAlign: 'center', marginBottom: 22 }]}>{t.livePartnerWaitsDesc}</Text>
              <Btn label={t.liveJoin} color={couleur} loading={busy} onPress={rejoindre} icon="play" />
            </>
          ) : iWait ? (
            <>
              <Title size={26} style={{ textAlign: 'center', marginBottom: 8 }}>{fmt(t.liveWaiting, { p: partnerLabel })}</Title>
              <Text style={{ color: C.muted, fontSize: 15, textAlign: 'center', marginBottom: 22, maxWidth: 300 }}>{fmt(t.liveWaitingDesc, { p: partnerLabel })}</Text>
              <Btn label={fmt(t.liveNudge, { p: partnerLabel })} color={couleur} onPress={prevenir} icon="send" />
              <View style={{ height: 6 }} />
              <Btn ghost label={t.liveCancel} onPress={annuler} />
            </>
          ) : (
            <>
              <Title size={26} style={{ textAlign: 'center', marginBottom: 8 }}>{fmt(t.liveInviteTitle, { p: partnerLabel })}</Title>
              <Text style={{ color: C.muted, fontSize: 15, textAlign: 'center', marginBottom: 6, maxWidth: 300 }}>{fmt(t.liveInviteDesc, { p: partnerLabel })}</Text>
              {!!presence && <Text style={{ color: partnerOnline ? C.mint : C.faint, fontSize: 13, fontWeight: '600', marginBottom: 20 }}>{presence}</Text>}
              <View style={{ height: presence ? 0 : 14 }} />
              <Btn label={t.liveStart} color={couleur} loading={busy || live === undefined} onPress={lancer} icon="play" />
            </>
          )}
        </FadeIn>
      </View>
    </View>
  );
}
