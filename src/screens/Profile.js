// Onglet « Profil » : identité, style (alimente les messages), langue, couple, rappels
import { useState } from 'react';
import { View, Text, ScrollView, TextInput } from 'react-native';
import { useApp } from '../state/AppContext';
import { useNav } from '../state/nav';
import { fmt, LANGUES } from '../i18n';
import { RELATIONS, LOVE_LANGS, TONES } from '../services/messages';
import { FadeIn, Btn, Chip, Title } from '../ui/primitives';
import { C } from '../ui/tokens';

export const REL_KEY = { new: 'relNew', couple: 'relCouple', distance: 'relDistance', married: 'relMarried' };
export const LOVE_KEY = { words: 'llWords', time: 'llTime', gifts: 'llGifts', service: 'llService', touch: 'llTouch' };
export const TONE_KEY = { romantic: 'toneRomantic', funny: 'toneFunny', simple: 'toneSimple' };

export const inputStyle = { backgroundColor: C.surface, borderWidth: 1, borderColor: C.line, borderRadius: 14, padding: 14, color: C.text, fontSize: 16 };
export const Label = ({ children, top }) => <Text style={{ fontSize: 11, fontWeight: '700', letterSpacing: 2.2, color: C.gold, marginBottom: 10, marginTop: top ? 22 : 0 }}>{String(children).toUpperCase()}</Text>;
export const Wrap = ({ children }) => <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{children}</View>;

export function StylePicker({ t, profile, updateProfile }) {
  return (
    <>
      <Label>{t.obRelation}</Label>
      <Wrap>{RELATIONS.map((r) => <Chip key={r} label={t[REL_KEY[r]]} active={profile.relation === r} onPress={() => updateProfile({ relation: r })} />)}</Wrap>
      <Label top>{t.obLove}</Label>
      <Wrap>{LOVE_LANGS.map((r) => <Chip key={r} label={t[LOVE_KEY[r]]} active={profile.loveLang === r} color={C.violet} onPress={() => updateProfile({ loveLang: r })} />)}</Wrap>
      <Label top>{t.obTone}</Label>
      <Wrap>{TONES.map((r) => <Chip key={r} label={t[TONE_KEY[r]]} active={profile.tone === r} color={C.gold} onPress={() => updateProfile({ tone: r })} />)}</Wrap>
    </>
  );
}

export default function Profile() {
  const { t, langue, setLangue, profile, updateProfile, couple, unpair, partnerLabel, remindersOn, enableReminders, premium } = useApp();
  const { go } = useNav();
  const [confirm, setConfirm] = useState(false);

  return (
    <ScrollView contentContainerStyle={{ padding: 22, paddingBottom: 130, alignItems: 'center' }} keyboardShouldPersistTaps="handled">
      <FadeIn style={{ width: '100%', maxWidth: 360, marginTop: 6 }}>
        <Title size={32}>{t.profTitle}</Title>
        <View style={{ marginTop: 20 }}>
          <Label>{t.profName}</Label>
          <TextInput value={profile.name} onChangeText={(v) => updateProfile({ name: v })} style={inputStyle} maxLength={30} placeholderTextColor={C.faint} />
          <Label top>{t.profPartner}</Label>
          <TextInput value={profile.partnerName} onChangeText={(v) => updateProfile({ partnerName: v })} style={inputStyle} maxLength={30} placeholderTextColor={C.faint} />
          <Label top>{t.profLang}</Label>
          <Wrap>{LANGUES.map((l) => <Chip key={l.id} label={`${l.drapeau} ${l.nom}`} active={langue === l.id} onPress={() => setLangue(l.id)} />)}</Wrap>
          <View style={{ height: 22 }} />
          <StylePicker t={t} profile={profile} updateProfile={updateProfile} />

          <Label top>{t.profPair}</Label>
          <View style={{ backgroundColor: C.surface, borderWidth: 1, borderColor: C.line, borderRadius: 20, padding: 16 }}>
            <Text style={{ color: C.text, fontSize: 15, fontWeight: '700' }}>{couple ? fmt(t.profPaired, { p: partnerLabel }) : t.profNotPaired}</Text>
            {premium && <Text style={{ color: C.gold, fontSize: 13, fontWeight: '700', marginTop: 4 }}>{t.premiumActive}</Text>}
            <View style={{ marginTop: 12 }}>
              {!couple ? <Btn small color={C.rose} icon="heart" label={t.inviteCta} onPress={() => go('pairing', {})} />
                : confirm ? (
                  <View>
                    <Text style={{ color: C.muted, fontSize: 13, marginBottom: 10 }}>{t.profUnpairConfirm}</Text>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                      <Chip label={t.yes} active color={C.danger} onPress={async () => { await unpair(); setConfirm(false); }} />
                      <Chip label={t.no} onPress={() => setConfirm(false)} />
                    </View>
                  </View>
                ) : <Btn small ghost label={t.profUnpair} onPress={() => setConfirm(true)} />}
            </View>
          </View>

          <Label top>{t.profReminders}</Label>
          <Wrap>
            <Chip icon="bell" label={t.yes} active={remindersOn} color={C.mint} onPress={() => enableReminders(true)} />
            <Chip label={t.no} active={!remindersOn} onPress={() => enableReminders(false)} />
          </Wrap>
          <Text style={{ color: C.faint, fontSize: 12, marginTop: 26, textAlign: 'center' }}>{t.profVersion} 1.0.0</Text>
        </View>
      </FadeIn>
    </ScrollView>
  );
}
