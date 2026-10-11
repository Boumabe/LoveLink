// ═══════════════════════════════════════════════════════════════
//  Associer deux téléphones (une seule fois). Un seul écran : inviter OU saisir un code.
// ═══════════════════════════════════════════════════════════════
import { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, Share, ActivityIndicator } from 'react-native';
import { useApp } from '../state/AppContext';
import { useNav } from '../state/nav';
import { CONFIG } from '../config';
import { fmt } from '../i18n';
import { createInvite, cancelInvite, readMembers, partnerOf, joinWithCode } from '../services/pairing';
import { Btn, Back, FadeIn, Glow, Pulse, Icon, Title, CodeInput, buzz } from '../ui/primitives';
import { C } from '../ui/tokens';

export default function Pairing({ then }) {
  const { t, profile, pairWith, partnerLabel } = useApp();
  const { back, replace } = useNav();
  const couleur = C.rose;
  const [vue, setVue] = useState('choix');           // choix | attente | ok
  const [inv, setInv] = useState(null);
  const [code, setCode] = useState('');
  const [erreur, setErreur] = useState('');
  const [secousse, setSecousse] = useState(0);
  const [busy, setBusy] = useState(false);
  const [expire, setExpire] = useState(false);
  const pollRef = useRef(null);
  const timerRef = useRef(null);
  const done = useRef(false);
  const invRef = useRef(null);

  const stop = () => { if (pollRef.current) clearInterval(pollRef.current); if (timerRef.current) clearTimeout(timerRef.current); pollRef.current = timerRef.current = null; };
  useEffect(() => () => { stop(); const i = invRef.current; if (i && !done.current) cancelInvite(i.code, i.cid).catch(() => {}); }, []);

  const echec = (m) => { setErreur(m); setSecousse((n) => n + 1); setBusy(false); };

  async function creer() {
    if (busy) return;
    setErreur(''); setExpire(false); setBusy(true);
    try {
      const r = await createInvite(profile.name);
      invRef.current = r; setInv(r); setVue('attente');
      stop();
      pollRef.current = setInterval(async () => {
        try {
          const p = partnerOf(await readMembers(r.cid), r.uid);
          if (p) { stop(); done.current = true; await pairWith({ cid: r.cid, partner: p }); buzz(40); setVue('ok'); }
        } catch (e) {}
      }, CONFIG.POLL_MS);
      timerRef.current = setTimeout(() => { stop(); setExpire(true); }, CONFIG.INVITE_TTL_MS);
    } catch (e) { setErreur(t.erreurReseau); setSecousse((n) => n + 1); }
    setBusy(false);
  }
  async function annuler() { stop(); if (invRef.current) await cancelInvite(invRef.current.code, invRef.current.cid).catch(() => {}); invRef.current = null; setInv(null); setExpire(false); setVue('choix'); }
  async function renouveler() { await annuler(); creer(); }

  async function rejoindre(c) {
    if (busy || c.length < 6) return;
    setErreur(''); setBusy(true);
    const r = await joinWithCode(c, profile.name);
    if (!r.ok) {
      return echec(r.error === 'notfound' ? t.erreurCode : r.error === 'own' ? t.pairOwn : r.error === 'expired' ? t.erreurExpiree : r.error === 'full' ? t.erreurPleine : t.erreurReseau);
    }
    done.current = true;
    await pairWith({ cid: r.cid, partner: r.partner || { uid: '', name: '' } });
    buzz(40); setVue('ok'); setBusy(false);
  }
  const surSaisie = (v) => { setCode(v); setErreur(''); if (v.length === 6) setTimeout(() => rejoindre(v), 150); };
  const partager = async () => { try { await Share.share({ message: t.partageMsg.replace('{code}', inv.code) }); } catch (e) {} };
  const finir = () => { if (then) replace(then.name, then.params); else back(); };

  if (vue === 'ok') return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 }}>
      <FadeIn style={{ alignItems: 'center', width: '100%' }}>
        <View style={{ alignItems: 'center', justifyContent: 'center', marginBottom: 22 }}>
          <Glow size={260} color={couleur} />
          <View style={{ width: 92, height: 92, borderRadius: 46, borderWidth: 1.5, borderColor: couleur, backgroundColor: couleur + '22', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="check" size={44} color={couleur} stroke={2.4} />
          </View>
        </View>
        <Title size={28} style={{ textAlign: 'center', marginBottom: 8 }}>{t.pairDone}</Title>
        <Text style={{ color: C.muted, fontSize: 15, textAlign: 'center', marginBottom: 6 }}>{partnerLabel}</Text>
        <Text style={{ color: C.muted, fontSize: 15, textAlign: 'center', marginBottom: 24, maxWidth: 300 }}>{t.pairDoneDesc}</Text>
        <Btn label={t.pairContinue} color={couleur} onPress={finir} />
      </FadeIn>
    </View>
  );

  if (vue === 'attente' && inv) return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 }}>
      <FadeIn style={{ alignItems: 'center', width: '100%' }}>
        <Text style={{ fontSize: 11, fontWeight: '700', letterSpacing: 2.2, color: C.gold, marginBottom: 8 }}>{t.codeLabel}</Text>
        <View style={{ height: 230, width: 230, alignItems: 'center', justifyContent: 'center' }}>
          {!expire && <><Pulse color={couleur} size={190} /><Pulse color={couleur} size={190} delay={1100} /></>}
          <View style={{ borderWidth: 2, borderColor: couleur, borderRadius: 26, backgroundColor: 'rgba(14,10,20,0.85)', paddingVertical: 20, paddingHorizontal: 30, alignItems: 'center' }}>
            <Text style={codeStyle}>{inv.code.slice(0, 3)}</Text><Text style={codeStyle}>{inv.code.slice(3)}</Text>
          </View>
        </View>
        <Title size={24} style={{ textAlign: 'center', marginBottom: 8 }}>{expire ? t.erreurExpiree : t.attenteTitre}</Title>
        {!expire && <Text style={{ color: C.muted, fontSize: 15, textAlign: 'center', marginBottom: 16, maxWidth: 300 }}>{t.attenteDesc}</Text>}
        {expire ? <Btn label={t.nouveauCode} color={couleur} onPress={renouveler} /> : <Btn label={t.partager} color={couleur} onPress={partager} icon="share" />}
        <View style={{ height: 6 }} />
        <Btn ghost label={t.annuler} onPress={annuler} />
      </FadeIn>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={{ padding: 22, paddingBottom: 56, alignItems: 'center' }} keyboardShouldPersistTaps="handled">
      <View style={{ alignSelf: 'stretch' }}><Back onPress={back} label={t.retour} /></View>
      <FadeIn style={{ alignItems: 'center', width: '100%' }}>
        <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 6, marginBottom: 14 }}>
          <Glow size={200} color={couleur} />
          <View style={{ width: 88, height: 88, borderRadius: 44, borderWidth: 1.5, borderColor: couleur + '66', backgroundColor: couleur + '22', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="heart" size={38} color={couleur} />
          </View>
        </View>
        <Title size={26} style={{ textAlign: 'center', marginBottom: 8 }}>{t.connexionTitre}</Title>
        <Text style={{ color: C.muted, fontSize: 15, textAlign: 'center', marginBottom: 24, maxWidth: 320 }}>{t.connexionSous}</Text>
        <Btn label={t.inviter} color={couleur} loading={busy && !code} onPress={creer} icon="send" />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 22, width: '100%', maxWidth: 340 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: C.line }} />
          <Text style={{ color: C.faint, fontSize: 12, fontWeight: '700', letterSpacing: 2 }}>{t.ou.toUpperCase()}</Text>
          <View style={{ flex: 1, height: 1, backgroundColor: C.line }} />
        </View>
        <Text style={{ fontSize: 11, fontWeight: '700', letterSpacing: 2.2, color: C.gold, marginBottom: 12 }}>{t.saisis.toUpperCase()}</Text>
        <CodeInput value={code} onChange={surSaisie} couleur={couleur} erreur={erreur} secousse={secousse} disabled={busy} />
        <View style={{ minHeight: 44, justifyContent: 'center' }}>
          {busy && code.length === 6 ? <ActivityIndicator color={couleur} /> : !!erreur && <Text style={{ color: C.danger, fontSize: 14, fontWeight: '600', textAlign: 'center', marginTop: 12 }}>{erreur}</Text>}
        </View>
      </FadeIn>
    </ScrollView>
  );
}
const codeStyle = { fontSize: 38, fontWeight: '800', color: C.text, letterSpacing: 9, lineHeight: 46, paddingLeft: 9 };
