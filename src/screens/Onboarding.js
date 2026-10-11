// Premier lancement : prénom + style (2 étapes, 20 secondes)
import { useState } from 'react';
import { View, Text, ScrollView, TextInput } from 'react-native';
import { useApp } from '../state/AppContext';
import { LANGUES } from '../i18n';
import { FadeIn, Btn, Chip, Glow, Logo, Title } from '../ui/primitives';
import { StylePicker, Label, Wrap, inputStyle } from './Profile';
import { C } from '../ui/tokens';

export default function Onboarding() {
  const { t, langue, setLangue, profile, updateProfile } = useApp();
  const [step, setStep] = useState(0);
  const ok = profile.name.trim().length > 0;

  return (
    <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 60, alignItems: 'center', flexGrow: 1 }} keyboardShouldPersistTaps="handled">
      <FadeIn key={step} style={{ width: '100%', maxWidth: 360, alignItems: 'center' }}>
        {step === 0 ? (
          <>
            <View style={{ alignItems: 'center', justifyContent: 'center', width: 240, height: 150, marginTop: 30 }}>
              <Glow size={280} color={C.rose} /><Logo size={96} />
            </View>
            <Title size={34} style={{ textAlign: 'center', marginTop: 6 }}>{t.obWelcome}</Title>
            <Text style={{ color: C.muted, fontSize: 15, lineHeight: 22, textAlign: 'center', marginTop: 8, marginBottom: 26, maxWidth: 310 }}>{t.obWelcomeSub}</Text>
            <View style={{ width: '100%' }}>
              <Label>{t.obName}</Label>
              <TextInput value={profile.name} onChangeText={(v) => updateProfile({ name: v })} placeholder={t.obNamePh} placeholderTextColor={C.faint} style={inputStyle} maxLength={30} />
              <View style={{ height: 18 }} />
              <Wrap>{LANGUES.map((l) => <Chip key={l.id} label={`${l.drapeau} ${l.nom}`} active={langue === l.id} onPress={() => setLangue(l.id)} />)}</Wrap>
            </View>
            <View style={{ height: 28 }} />
            <Btn label={t.obNext} color={C.rose} disabled={!ok} onPress={() => setStep(1)} />
          </>
        ) : (
          <>
            <Title size={30} style={{ textAlign: 'center', marginTop: 24 }}>{t.obStyle}</Title>
            <Text style={{ color: C.muted, fontSize: 15, textAlign: 'center', marginTop: 6, marginBottom: 24 }}>{t.obStyleSub}</Text>
            <View style={{ width: '100%' }}><StylePicker t={t} profile={profile} updateProfile={updateProfile} /></View>
            <View style={{ height: 30 }} />
            <Btn label={t.obStart} color={C.rose} onPress={() => updateProfile({ onboarded: true })} />
          </>
        )}
      </FadeIn>
    </ScrollView>
  );
}
