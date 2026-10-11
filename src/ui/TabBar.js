import { View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Press, Icon } from './primitives';
import { C } from './tokens';

const TABS = [
  { id: 'jouer', icon: 'play', key: 'tabJouer' },
  { id: 'jardin', icon: 'leaf', key: 'tabJardin' },
  { id: 'messages', icon: 'chat', key: 'tabMessages' },
  { id: 'couple', icon: 'heart', key: 'tabCouple', premium: true },
  { id: 'profil', icon: 'user', key: 'tabProfil' },
];

export default function TabBar({ tab, onChange, t, premium }) {
  const ins = useSafeAreaInsets();
  return (
    <View pointerEvents="box-none" style={{ position: 'absolute', left: 14, right: 14, bottom: Math.max(ins.bottom, 8) + 6 }}>
      <View style={{ flexDirection: 'row', backgroundColor: 'rgba(26,19,36,0.97)', borderRadius: 32, borderWidth: 1, borderColor: C.line, paddingVertical: 8, paddingHorizontal: 6,
        shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 20, elevation: 14 }}>
        {TABS.map((x) => {
          const on = tab === x.id;
          const col = on ? (x.premium ? C.gold : C.rose) : C.faint;
          return (
            <Press key={x.id} wrap={{ flex: 1 }} onPress={() => onChange(x.id)} style={{ alignItems: 'center', paddingVertical: 6, borderRadius: 24, backgroundColor: on ? col + '1A' : 'transparent' }}>
              <View>
                <Icon name={x.icon} size={23} color={col} stroke={on ? 2 : 1.7} />
                {x.premium && !premium ? <View style={{ position: 'absolute', right: -5, top: -3, width: 8, height: 8, borderRadius: 4, backgroundColor: C.gold }} /> : null}
              </View>
              <Text style={{ color: col, fontSize: 10.5, fontWeight: '700', marginTop: 3 }}>{t[x.key]}</Text>
            </Press>
          );
        })}
      </View>
    </View>
  );
}
