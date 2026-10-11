// Onglet « Jouer » = écran d'ouverture de l'app (Se divertir)
import { View, Text, ScrollView } from 'react-native';
import { useApp } from '../state/AppContext';
import { useNav } from '../state/nav';
import { fmt } from '../i18n';
import { FadeIn, ModeCard, Press, Icon, Title, buzz } from '../ui/primitives';
import TreeArt from '../ui/TreeArt';
import { C } from '../ui/tokens';

export default function Hub() {
  const { t, profile, couple, tree, wateredNow, water, rainKey, partnerLabel, partnerOnline, partnerSeen, timeAgo } = useApp();
  const { go, setTab } = useNav();
  const h = new Date().getHours();
  const greet = (h >= 18 || h < 4) ? t.greetEvening : t.greetMorning;
  const presence = !couple ? '' : partnerOnline ? fmt(t.partnerOnline, { p: partnerLabel }) : partnerSeen ? fmt(t.partnerSeen, { p: partnerLabel, t: timeAgo(partnerSeen) }) : '';

  const jeux = [
    { id: 'quiz', emoji: '💞', nom: t.quiz, desc: t.quizDesc, couleur: C.rose },
    { id: 'devine', emoji: '🔍', nom: t.devine, desc: t.devineDesc, couleur: C.mint },
    { id: 'verite', emoji: '🔥', nom: t.verite, desc: t.veriteDesc, couleur: C.gold },
  ];
  const ouvrir = (id) => (couple ? go('game', { id }) : go('pairing', { then: { name: 'game', params: { id } } }));

  return (
    <ScrollView contentContainerStyle={{ padding: 22, paddingBottom: 130, alignItems: 'center' }}>
      <FadeIn style={{ width: '100%', maxWidth: 360, marginTop: 6 }}>
        <Text style={{ color: C.muted, fontSize: 15, fontWeight: '600' }}>{greet}{profile.name ? `, ${profile.name}` : ''}</Text>
        <Title size={32} style={{ marginTop: 2 }}>{t.divertirTitle}</Title>
        <Text style={{ color: C.muted, fontSize: 14, marginTop: 4 }}>{t.hubSub}</Text>
      </FadeIn>

      <FadeIn delay={80} style={{ width: '100%', maxWidth: 360, marginTop: 20, marginBottom: 6 }}>
        {couple ? (
          <Press onPress={() => setTab('jardin')} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.surface, borderWidth: 1, borderColor: C.line, borderRadius: 24, padding: 14, gap: 12 }}>
            <View style={{ width: 84, height: 96, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <TreeArt stage={tree.stage.id} flowers={tree.flowers} vitality={tree.vitality} size={96} glow={false} rainKey={rainKey} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: C.text, fontSize: 16, fontWeight: '800' }}>{fmt(t.streakDays, { n: tree.streak })}</Text>
              {!!presence && <Text style={{ color: partnerOnline ? C.mint : C.faint, fontSize: 12, fontWeight: '600', marginTop: 2 }}>{presence}</Text>}
              {!wateredNow ? (
                <Press haptic onPress={() => { buzz(18); water(); }} style={{ alignSelf: 'flex-start', marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#3AA0FF', borderRadius: 999, paddingVertical: 8, paddingHorizontal: 14 }}>
                  <Icon name="drop" size={16} color="#fff" /><Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>{t.waterBtn}</Text>
                </Press>
              ) : <Text style={{ color: C.mint, fontSize: 13, fontWeight: '700', marginTop: 8 }}>{t.youWatered}</Text>}
            </View>
          </Press>
        ) : (
          <Press onPress={() => go('pairing', {})} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.rose + '12', borderWidth: 1, borderColor: C.rose + '55', borderRadius: 24, padding: 16, gap: 14 }}>
            <View style={{ width: 52, height: 52, borderRadius: 18, backgroundColor: C.rose + '22', alignItems: 'center', justifyContent: 'center' }}><Icon name="heart" size={24} color={C.rose} /></View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: C.text, fontSize: 16, fontWeight: '800' }}>{t.partnerNone}</Text>
              <Text style={{ color: C.muted, fontSize: 13, marginTop: 2 }}>{t.partnerNoneDesc}</Text>
            </View>
            <Text style={{ color: C.rose, fontSize: 28, fontWeight: '300' }}>›</Text>
          </Press>
        )}
      </FadeIn>

      <View style={{ height: 14 }} />
      {jeux.map((j, i) => (
        <FadeIn key={j.id} delay={140 + 80 * i} style={{ width: '100%', alignItems: 'center' }}>
          <ModeCard emoji={j.emoji} titre={j.nom} desc={j.desc} tag={t.deuxJoueurs} couleur={j.couleur} onPress={() => ouvrir(j.id)} />
        </FadeIn>
      ))}
    </ScrollView>
  );
}
