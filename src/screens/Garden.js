// Onglet « Jardin » : l'arbre du couple, la série, l'arrosage quotidien
import { useEffect } from 'react';
import { View, Text, ScrollView, Share } from 'react-native';
import { useApp } from '../state/AppContext';
import { useNav } from '../state/nav';
import { fmt } from '../i18n';
import { FadeIn, Press, Btn, Icon, Title, buzz } from '../ui/primitives';
import TreeArt from '../ui/TreeArt';
import { C } from '../ui/tokens';

const stageLabel = (t, key) => t['st' + key[0].toUpperCase() + key.slice(1)];

function Stat({ label, value, color }) {
  return (
    <View style={{ flex: 1, backgroundColor: C.surface, borderWidth: 1, borderColor: C.line, borderRadius: 18, paddingVertical: 12, alignItems: 'center' }}>
      <Text style={{ color, fontSize: 24, fontWeight: '800' }}>{value}</Text>
      <Text style={{ color: C.faint, fontSize: 11, fontWeight: '700', letterSpacing: 1.4, marginTop: 2 }}>{label.toUpperCase()}</Text>
    </View>
  );
}

export default function Garden() {
  const { t, couple, tree, wateredNow, water, refreshTree, rainKey, lost, fallKey, ackLost, partnerLabel, uid } = useApp();
  const { go } = useNav();

  useEffect(() => { refreshTree(); const id = setInterval(refreshTree, 20000); return () => clearInterval(id); }, [refreshTree]);
  useEffect(() => { if (!lost) return undefined; const id = setTimeout(ackLost, 6000); return () => clearTimeout(id); }, [lost]);

  const partnerDone = couple ? !!(tree.wateredToday && tree.wateredToday[couple.partnerUid]) : false;
  const label = stageLabel(t, tree.stage.key);

  return (
    <ScrollView contentContainerStyle={{ padding: 22, paddingBottom: 130, alignItems: 'center' }}>
      <FadeIn style={{ width: '100%', maxWidth: 360, marginTop: 6 }}>
        <Title size={32}>{couple ? t.gardenTitle : t.gardenSolo}</Title>
        <Text style={{ color: C.gold, fontSize: 12, fontWeight: '700', letterSpacing: 2.4, marginTop: 4 }}>{label.toUpperCase()}</Text>
      </FadeIn>

      {lost > 0 && (
        <FadeIn style={{ width: '100%', maxWidth: 360, marginTop: 14 }}>
          <View style={{ backgroundColor: C.danger + '18', borderWidth: 1, borderColor: C.danger + '55', borderRadius: 16, padding: 14 }}>
            <Text style={{ color: C.text, fontSize: 14, lineHeight: 20 }}>{fmt(t.lostFlowers, { n: lost })}</Text>
          </View>
        </FadeIn>
      )}

      <FadeIn delay={80} style={{ alignItems: 'center', marginTop: 8 }}>
        <TreeArt stage={tree.stage.id} flowers={tree.flowers} vitality={tree.vitality} size={290} rainKey={rainKey} fallKey={fallKey} fallCount={lost} />
      </FadeIn>

      <View style={{ width: '100%', maxWidth: 360, marginTop: 4 }}>
        <View style={{ height: 8, borderRadius: 4, backgroundColor: C.surface2, overflow: 'hidden' }}>
          <View style={{ width: `${Math.round(Math.max(0.04, tree.progress) * 100)}%`, height: 8, borderRadius: 4, backgroundColor: C.leaf3 }} />
        </View>
        <Text style={{ color: C.muted, fontSize: 13, textAlign: 'center', marginTop: 8 }}>
          {tree.toNext > 0 ? fmt(t.nextStage, { n: Math.ceil(tree.toNext / (couple ? 2 : 1)) }) : t.maxStage}
        </Text>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 16 }}>
          <Stat label={t.streakLbl} value={tree.streak} color={C.gold} />
          <Stat label={t.flowersLbl} value={tree.flowers} color={C.rose} />
        </View>
      </View>

      <View style={{ width: '100%', alignItems: 'center', marginTop: 22 }}>
        {wateredNow ? (
          <FadeIn style={{ alignItems: 'center' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Icon name="check" size={20} color={C.mint} stroke={2.4} /><Text style={{ color: C.mint, fontSize: 17, fontWeight: '800' }}>{t.wateredToday}</Text>
            </View>
            <Text style={{ color: C.muted, fontSize: 13, marginTop: 4 }}>{t.wateredDesc}</Text>
          </FadeIn>
        ) : <Btn label={t.waterBtn} color="#3AA0FF" icon="drop" onPress={() => { buzz(24); water(); }} />}
      </View>

      {couple ? (
        <View style={{ width: '100%', maxWidth: 360, marginTop: 18, backgroundColor: C.surface, borderWidth: 1, borderColor: C.line, borderRadius: 20, padding: 14 }}>
          <Text style={{ color: wateredNow ? C.mint : C.faint, fontSize: 14, fontWeight: '700' }}>{wateredNow ? t.youWatered : t.youNot}</Text>
          <Text style={{ color: partnerDone ? C.mint : C.muted, fontSize: 14, fontWeight: '700', marginTop: 6 }}>{partnerDone ? fmt(t.waterDone, { p: partnerLabel }) : fmt(t.waterWait, { p: partnerLabel })}</Text>
          {!partnerDone && (
            <View style={{ marginTop: 12 }}>
              <Btn small ghost icon="bell" label={t.remind} onPress={async () => { try { await Share.share({ message: t.remindMsg }); } catch (e) {} }} />
            </View>
          )}
        </View>
      ) : (
        <View style={{ width: '100%', maxWidth: 360, marginTop: 18, alignItems: 'center' }}>
          <Text style={{ color: C.muted, fontSize: 14, textAlign: 'center', marginBottom: 12 }}>{t.gardenPairHint}</Text>
          <Btn label={t.gardenGoPair} color={C.rose} icon="heart" onPress={() => go('pairing', {})} />
        </View>
      )}
    </ScrollView>
  );
}
