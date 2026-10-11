// Onglet « Messages » : des mots personnalisés selon le profil, à partager au partenaire
import { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, TextInput, Share, ActivityIndicator } from 'react-native';
import { useApp } from '../state/AppContext';
import { fmt } from '../i18n';
import { OCCASIONS, TONES, offlineMessage, generateMessage, suggestOccasion, aiLeft } from '../services/messages';
import { FadeIn, Btn, Chip, Icon, Title } from '../ui/primitives';
import { C } from '../ui/tokens';

const OCC_KEY = { morning: 'occMorning', night: 'occNight', miss: 'occMiss', thanks: 'occThanks', support: 'occSupport' };
const TONE_KEY = { romantic: 'toneRomantic', funny: 'toneFunny', simple: 'toneSimple' };

export default function Messages() {
  const { t, langue, profile, premium, partnerName, partnerLabel } = useApp();
  const [occasion, setOccasion] = useState(suggestOccasion());
  const [tone, setTone] = useState(profile.tone || 'romantic');
  const [detail, setDetail] = useState('');
  const [text, setText] = useState('');
  const [source, setSource] = useState('offline');
  const [variant, setVariant] = useState(0);
  const [loading, setLoading] = useState(false);
  const [left, setLeft] = useState(null);

  const params = useCallback(() => ({
    langue, occasion, tone, loveLang: profile.loveLang, relation: profile.relation,
    nameMe: profile.name, namePartner: partnerName, detail: detail.trim(),
  }), [langue, occasion, tone, profile, partnerName, detail]);

  // Modèle immédiat (gratuit, hors-ligne) à chaque changement d'occasion/ton
  useEffect(() => { setText(offlineMessage({ ...params(), variant: 0 })); setSource('offline'); setVariant(0); }, [occasion, tone, langue, partnerName, profile.loveLang]);
  useEffect(() => { aiLeft(premium).then(setLeft); }, [premium, source]);

  async function generer() {
    setLoading(true);
    const next = variant + 1; setVariant(next);
    const r = await generateMessage(params(), { isPremium: premium, variant: next });
    setText(r.text); setSource(r.source); setLoading(false);
  }
  async function partager() { try { await Share.share({ message: text }); } catch (e) {} }

  return (
    <ScrollView contentContainerStyle={{ padding: 22, paddingBottom: 130, alignItems: 'center' }} keyboardShouldPersistTaps="handled">
      <FadeIn style={{ width: '100%', maxWidth: 360, marginTop: 6 }}>
        <Title size={32}>{t.msgTitle}</Title>
        <Text style={{ color: C.muted, fontSize: 14, marginTop: 4 }}>{t.msgSub}</Text>
      </FadeIn>

      <View style={{ width: '100%', maxWidth: 360, marginTop: 20 }}>
        <Text style={lbl}>{t.msgOccasion.toUpperCase()}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {OCCASIONS.map((o) => <Chip key={o} label={t[OCC_KEY[o]]} active={occasion === o} onPress={() => setOccasion(o)} color={C.rose} />)}
        </View>
        <Text style={[lbl, { marginTop: 18 }]}>{t.msgTone.toUpperCase()}</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {TONES.map((x) => <Chip key={x} label={t[TONE_KEY[x]]} active={tone === x} onPress={() => setTone(x)} color={C.gold} />)}
        </View>
        <Text style={[lbl, { marginTop: 18 }]}>{t.msgDetail.toUpperCase()}</Text>
        <TextInput value={detail} onChangeText={setDetail} placeholder={t.msgDetailPh} placeholderTextColor={C.faint} maxLength={120}
          style={{ backgroundColor: C.surface, borderWidth: 1, borderColor: C.line, borderRadius: 14, padding: 14, color: C.text, fontSize: 15 }} />
      </View>

      <View style={{ width: '100%', maxWidth: 360, marginTop: 22, backgroundColor: C.rose + '0F', borderWidth: 1, borderColor: C.rose + '44', borderRadius: 24, padding: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <Icon name="sparkle" size={14} color={source === 'ai' ? C.gold : C.faint} />
          <Text style={{ color: source === 'ai' ? C.gold : C.faint, fontSize: 11, fontWeight: '700', letterSpacing: 1.4 }}>{(source === 'ai' ? t.msgAi : t.msgOffline).toUpperCase()}</Text>
        </View>
        {loading ? <View style={{ minHeight: 110, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color={C.rose} /></View> : (
          <TextInput value={text} onChangeText={setText} multiline style={{ color: C.text, fontSize: 17, lineHeight: 25, minHeight: 110, textAlignVertical: 'top', padding: 0 }} />
        )}
        <Text style={{ color: C.faint, fontSize: 12, marginTop: 8 }}>{t.msgEditHint}</Text>
      </View>

      <View style={{ width: '100%', alignItems: 'center', marginTop: 18, gap: 8 }}>
        <Btn label={fmt(t.msgShare, { p: partnerLabel })} color={C.rose} icon="send" onPress={partager} disabled={!text.trim()} />
        <Btn ghost small icon="refresh" label={source === 'ai' || left === 0 ? t.msgRegen : t.msgGenerate} onPress={generer} loading={loading} />
        <Text style={{ color: C.faint, fontSize: 12, marginTop: 2 }}>
          {premium ? t.msgAiUnlimited : left == null ? '' : fmt(t.msgAiLeft, { n: left })}
        </Text>
      </View>
    </ScrollView>
  );
}
const lbl = { fontSize: 11, fontWeight: '700', letterSpacing: 2.2, color: C.gold, marginBottom: 10 };
