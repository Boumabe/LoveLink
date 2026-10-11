// ═══════════════════════════════════════════════════════════════
//  Racine : polices, démarrage, onboarding, onglets, pile d'écrans, bouton retour Android
// ═══════════════════════════════════════════════════════════════
import { useEffect } from 'react';
import { View, StatusBar, BackHandler, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
// Sous-chemins : on n'embarque que 2 graisses (≈145 Ko) au lieu des 18 de la famille
import { Fraunces_600SemiBold } from '@expo-google-fonts/fraunces/600SemiBold';
import { Fraunces_700Bold } from '@expo-google-fonts/fraunces/700Bold';
import { useApp } from './state/AppContext';
import { NavProvider, useNav } from './state/nav';
import { Aura, FadeIn, Loading } from './ui/primitives';
import TabBar from './ui/TabBar';
import { C } from './ui/tokens';
import Onboarding from './screens/Onboarding';
import Hub from './screens/Hub';
import Garden from './screens/Garden';
import Messages from './screens/Messages';
import CoupleTab from './screens/CoupleTab';
import Profile from './screens/Profile';
import Pairing from './screens/Pairing';
import GameHost from './screens/GameHost';

const TAB_SCREENS = { jouer: Hub, jardin: Garden, messages: Messages, couple: CoupleTab, profil: Profile };

function Shell() {
  const { t, premium } = useApp();
  const { tab, setTab, stack, top, back } = useNav();

  useEffect(() => {
    if (Platform.OS !== 'android') return undefined;   // le bouton retour matériel n'existe que sur Android
    const h = BackHandler.addEventListener('hardwareBackPress', () => {
      if (stack.length) { back(); return true; }
      if (tab !== 'jouer') { setTab('jouer'); return true; }
      return false;
    });
    return () => { if (h && h.remove) h.remove(); };
  }, [stack.length, tab]);

  const Tab = TAB_SCREENS[tab];
  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1, display: top ? 'none' : 'flex' }}>
        <FadeIn key={tab} style={{ flex: 1 }}><Tab /></FadeIn>
        <TabBar tab={tab} onChange={setTab} t={t} premium={premium} />
      </View>
      {top && (
        <FadeIn key={stack.length + top.name} style={{ flex: 1 }}>
          {top.name === 'game' && <GameHost id={top.params.id} />}
          {top.name === 'pairing' && <Pairing then={top.params.then} />}
        </FadeIn>
      )}
    </View>
  );
}

export default function Root() {
  const { ready, profile } = useApp();
  const [fontsLoaded, fontError] = useFonts({ Fraunces_600SemiBold, Fraunces_700Bold });
  const booting = !ready || !(fontsLoaded || fontError);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <Aura />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {booting ? <Loading /> : !profile.onboarded ? <Onboarding /> : <NavProvider><Shell /></NavProvider>}
      </SafeAreaView>
    </View>
  );
}
