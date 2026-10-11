// Onglet « Couple » : le mode premium. Un seul abonnement débloque les deux téléphones.
import { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useApp } from '../state/AppContext';
import { useNav } from '../state/nav';
import { fmt } from '../i18n';
import { getOffering, purchase } from '../services/purchases';
import { FadeIn, Btn, Glow, Icon, Title } from '../ui/primitives';
import { C } from '../ui/tokens';

const UNITS = {
  fr: { DAY: 'jour(s)', WEEK: 'semaine(s)', MONTH: 'mois', YEAR: 'an' },
  en: { DAY: 'day(s)', WEEK: 'week(s)', MONTH: 'month(s)', YEAR: 'year' },
  es: { DAY: 'día(s)', WEEK: 'semana(s)', MONTH: 'mes(es)', YEAR: 'año' },
  ht: { DAY: 'jou', WEEK: 'semèn', MONTH: 'mwa', YEAR: 'ane' },
};

export default function CoupleTab() {
  const { t, langue, couple, premium, doRestore } = useApp();
  const { go } = useNav();
  const [offer, setOffer] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => { if (couple && !premium) getOffering().then(setOffer); }, [couple, premium]);

  async function acheter() {
    setBusy(true); setMsg('');
    const r = await purchase();
    if (r.ok) await doRestore();
    else if (r.cancelled) setMsg(t.payCancelled);
    else if (['unsupported', 'no-offering', 'no-key'].includes(r.error)) setMsg(t.payUnavailable);
    else setMsg(t.payError);
    setBusy(false);
  }
  async function restaurer() { setBusy(true); const ok = await doRestore(); if (!ok) setMsg(t.payUnavailable); setBusy(false); }

  const trial = offer && offer.trial ? fmt(t.trialLine, { d: `${offer.trial.days} ${(UNITS[langue] || UNITS.fr)[offer.trial.unit] || ''}`.trim() }) : '';
  const benefits = [t.pb1, t.pb2, t.pb3, t.pb4, t.pb5];

  return (
    <ScrollView contentContainerStyle={{ padding: 22, paddingBottom: 130, alignItems: 'center' }}>
      <FadeIn style={{ alignItems: 'center', width: '100%', maxWidth: 360, marginTop: 10 }}>
        <View style={{ alignItems: 'center', justifyContent: 'center', height: 150, width: 220 }}>
          <Glow size={260} color={C.gold} />
          <View style={{ width: 84, height: 84, borderRadius: 28, backgroundColor: C.gold + '1F', borderWidth: 1.5, borderColor: C.gold + '88', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="crown" size={40} color={C.gold} stroke={1.6} />
          </View>
        </View>
        <Title size={30} style={{ textAlign: 'center' }}>{t.premiumTitle}</Title>
        <Text style={{ color: C.muted, fontSize: 15, textAlign: 'center', marginTop: 6, marginBottom: 22, maxWidth: 300 }}>{t.premiumSub}</Text>
      </FadeIn>

      <FadeIn delay={90} style={{ width: '100%', maxWidth: 360 }}>
        <View style={{ backgroundColor: C.surface, borderWidth: 1, borderColor: C.line, borderRadius: 24, padding: 18, gap: 14 }}>
          {benefits.map((b, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: C.gold + '22', alignItems: 'center', justifyContent: 'center' }}><Icon name="check" size={16} color={C.gold} stroke={2.4} /></View>
              <Text style={{ flex: 1, color: C.text, fontSize: 15, lineHeight: 21 }}>{b}</Text>
            </View>
          ))}
        </View>
      </FadeIn>

      <View style={{ width: '100%', alignItems: 'center', marginTop: 22 }}>
        {!couple ? (
          <>
            <Text style={{ color: C.muted, fontSize: 14, textAlign: 'center', marginBottom: 14, maxWidth: 300 }}>{t.premiumNeedPair}</Text>
            <Btn label={t.inviteCta} color={C.rose} icon="heart" onPress={() => go('pairing', {})} />
          </>
        ) : premium ? (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Icon name="check" size={18} color={C.mint} stroke={2.4} /><Text style={{ color: C.mint, fontSize: 16, fontWeight: '800' }}>{t.premiumActive}</Text>
            </View>
            <Btn label={t.cplStart} color={C.gold} icon="play" onPress={() => go('game', { id: 'couple' })} />
          </>
        ) : (
          <>
            {offer ? <Text style={{ color: C.text, fontSize: 22, fontWeight: '800' }}>{fmt(t.perMonth, { p: offer.price })}</Text> : null}
            {!!trial && <Text style={{ color: C.mint, fontSize: 14, fontWeight: '700', marginTop: 4 }}>{trial}</Text>}
            <View style={{ height: 14 }} />
            <Btn label={t.unlock} color={C.gold} icon="crown" loading={busy} onPress={acheter} />
            <View style={{ height: 6 }} />
            <Btn ghost small label={t.restore} onPress={restaurer} disabled={busy} />
            {!!msg && <Text style={{ color: C.danger, fontSize: 13, textAlign: 'center', marginTop: 12, maxWidth: 300 }}>{msg}</Text>}
            <Text style={{ color: C.faint, fontSize: 12, textAlign: 'center', marginTop: 14, maxWidth: 300 }}>{t.payLegal}</Text>
          </>
        )}
      </View>
    </ScrollView>
  );
}
