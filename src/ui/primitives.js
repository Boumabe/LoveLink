// ═══════════════════════════════════════════════════════════════
//  Briques visuelles du design system LoveLink
// ═══════════════════════════════════════════════════════════════
import { useEffect, useRef } from 'react';
import { View, Text, TextInput, Pressable, Animated, Easing, StyleSheet, ActivityIndicator, Platform, Vibration } from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { C, FONT } from './tokens';

export const NATIF = Platform.OS !== 'web';
export const buzz = (ms = 8) => { if (Platform.OS === 'android') Vibration.vibrate(ms); };

export function FadeIn({ children, delay = 0, style }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.timing(v, { toValue: 1, duration: 420, delay, easing: Easing.out(Easing.cubic), useNativeDriver: NATIF }).start(); }, []);
  return (
    <Animated.View style={[{ opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) }] }, style]}>
      {children}
    </Animated.View>
  );
}

export function Press({ onPress, style, wrap, children, disabled, haptic = true }) {
  const sc = useRef(new Animated.Value(1)).current;
  const to = (x) => Animated.spring(sc, { toValue: x, speed: 40, bounciness: 5, useNativeDriver: NATIF }).start();
  return (
    <Pressable disabled={disabled} style={wrap} onPressIn={() => to(0.97)} onPressOut={() => to(1)}
      onPress={() => { if (haptic) buzz(); onPress && onPress(); }}>
      <Animated.View style={[style, { transform: [{ scale: sc }] }, disabled && { opacity: 0.5 }]}>{children}</Animated.View>
    </Pressable>
  );
}

export function Btn({ label, onPress, color = C.rose, ghost, disabled, loading, icon, small }) {
  return (
    <Press wrap={{ width: '100%', maxWidth: 340 }} disabled={disabled || loading} onPress={onPress}
      style={[u.btn, small && { minHeight: 46 }, ghost ? u.btnGhost : { backgroundColor: color, shadowColor: color }]}>
      {loading ? <ActivityIndicator color="#fff" /> : (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          {icon ? <Icon name={icon} size={18} color={ghost ? C.muted : '#fff'} /> : null}
          <Text style={[u.btnTxt, ghost && { color: C.muted, fontWeight: '600' }]}>{label}</Text>
        </View>
      )}
    </Press>
  );
}

export function Back({ onPress, label }) {
  return (
    <Press wrap={{ alignSelf: 'flex-start', marginBottom: 10 }} onPress={onPress} style={u.back}>
      <Text style={u.backChev}>‹</Text><Text style={u.backTxt}>{String(label || '').replace(/^←\s*/, '')}</Text>
    </Press>
  );
}

export function Glow({ size, color, style }) {
  return (
    <View pointerEvents="none" style={[{ position: 'absolute', width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}>
      {[1, 0.82, 0.64, 0.46, 0.3].map((k, i) => (
        <View key={i} style={{ position: 'absolute', width: size * k, height: size * k, borderRadius: (size * k) / 2, backgroundColor: color, opacity: 0.05 }} />
      ))}
    </View>
  );
}

export function Aura() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Glow size={520} color={C.rose} style={{ top: -230, right: -210 }} />
      <Glow size={560} color={C.gold} style={{ bottom: -300, left: -260, opacity: 0.7 }} />
    </View>
  );
}

export function Logo({ size = 80 }) {
  const d = size * 0.62, b = Math.max(3, Math.round(size * 0.07));
  return (
    <View style={{ width: d * 1.65, height: d }}>
      <View style={{ position: 'absolute', left: 0, top: 0, width: d, height: d, borderRadius: d / 2, borderWidth: b, borderColor: C.rose }} />
      <View style={{ position: 'absolute', right: 0, top: 0, width: d, height: d, borderRadius: d / 2, borderWidth: b, borderColor: C.gold }} />
    </View>
  );
}

export function Pulse({ color, size, delay = 0 }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const a = Animated.sequence([Animated.delay(delay), Animated.loop(Animated.timing(v, { toValue: 1, duration: 2200, easing: Easing.out(Easing.quad), useNativeDriver: NATIF }))]);
    a.start(); return () => a.stop();
  }, []);
  return (
    <Animated.View pointerEvents="none" style={{ position: 'absolute', width: size, height: size, borderRadius: size / 2, borderWidth: 2, borderColor: color,
      opacity: v.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] }), transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.75, 1.55] }) }] }} />
  );
}

// ───────── Icônes (tracé maison, même épaisseur partout) ─────────
const ICONS = {
  play: [['circle', 12, 12, 9], ['path', 'M10 8.5L16 12l-6 3.5z']],
  leaf: [['path', 'M5 19C5 10 10 5 19 5c0 9-5 14-14 14z'], ['path', 'M5 19L13 11']],
  chat: [['path', 'M4 6a2 2 0 012-2h12a2 2 0 012 2v9a2 2 0 01-2 2H10l-5 4v-4H6a2 2 0 01-2-2z']],
  heart: [['path', 'M12 20s-7-4.6-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.4-7 10-7 10z']],
  user: [['circle', 12, 8, 4], ['path', 'M4 21c0-4 4-6 8-6s8 2 8 6']],
  lock: [['rect', 5, 11, 14, 9, 2], ['path', 'M8 11V8a4 4 0 018 0v3']],
  crown: [['path', 'M3 8l4 4 5-7 5 7 4-4-2 11H5z']],
  drop: [['path', 'M12 3s6 6.5 6 11a6 6 0 01-12 0c0-4.5 6-11 6-11z']],
  check: [['path', 'M5 12.5l4.5 4.5L19 7.5']],
  send: [['path', 'M4 12L20 4l-6 16-3-7z']],
  refresh: [['path', 'M20 11a8 8 0 10-2.3 5.7'], ['path', 'M20 4v7h-7']],
  bell: [['path', 'M6 17V11a6 6 0 0112 0v6l1.5 2h-15z'], ['path', 'M10 21h4']],
  share: [['circle', 6, 12, 2.5], ['circle', 18, 6, 2.5], ['circle', 18, 18, 2.5], ['path', 'M8.2 10.8l7.6-3.6M8.2 13.2l7.6 3.6']],
  sparkle: [['path', 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z']],
};
export function Icon({ name, size = 22, color = C.text, stroke = 1.8 }) {
  const parts = ICONS[name] || [];
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">
      {parts.map((p, i) => p[0] === 'path' ? <Path key={i} d={p[1]} />
        : p[0] === 'circle' ? <Circle key={i} cx={p[1]} cy={p[2]} r={p[3]} />
        : <Rect key={i} x={p[1]} y={p[2]} width={p[3]} height={p[4]} rx={p[5]} />)}
    </Svg>
  );
}

export function Title({ children, size = 28, style }) {
  return <Text style={[{ fontFamily: FONT.title, fontSize: size, color: C.text, letterSpacing: -0.4 }, style]}>{children}</Text>;
}

export function Chip({ label, active, onPress, color = C.rose, icon }) {
  return (
    <Press onPress={onPress} style={[u.chip, active && { backgroundColor: color + '26', borderColor: color }]}>
      {icon ? <Icon name={icon} size={15} color={active ? color : C.muted} /> : null}
      <Text style={[u.chipTxt, active && { color }]}>{label}</Text>
    </Press>
  );
}

export function ModeCard({ emoji, icon, titre, desc, tag, couleur, onPress, locked }) {
  return (
    <Press wrap={{ width: '100%', maxWidth: 360, marginBottom: 14 }} onPress={onPress}
      style={[u.modeCard, { borderColor: couleur + '55', backgroundColor: couleur + '10', shadowColor: couleur }]}>
      <View style={[u.orb, { backgroundColor: couleur + '22', borderColor: couleur + '55' }]}>
        {icon ? <Icon name={icon} size={26} color={couleur} /> : <Text style={{ fontSize: 28 }}>{emoji}</Text>}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[u.modeNom, { color: couleur }]}>{titre}</Text>
        <Text style={u.modeDesc}>{desc}</Text>
        {!!tag && <View style={[u.tag, { borderColor: couleur + '55' }]}><Text style={[u.tagTxt, { color: couleur }]}>{tag}</Text></View>}
      </View>
      {locked ? <Icon name="lock" size={20} color={couleur} /> : <Text style={[u.chev, { color: couleur }]}>›</Text>}
    </Press>
  );
}

export function CodeInput({ value, onChange, couleur = C.rose, erreur, secousse, disabled }) {
  const ref = useRef(null);
  const sh = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!secousse) return;
    Animated.sequence([8, -8, 6, -6, 0].map((x) => Animated.timing(sh, { toValue: x, duration: 55, useNativeDriver: NATIF }))).start();
  }, [secousse]);
  return (
    <Pressable onPress={() => ref.current && ref.current.focus()} style={{ width: '100%', maxWidth: 340 }}>
      <Animated.View style={{ flexDirection: 'row', justifyContent: 'space-between', transform: [{ translateX: sh }] }}>
        {Array.from({ length: 6 }).map((_, i) => {
          const ch = value[i]; const actif = i === value.length && !disabled;
          return (
            <View key={i} style={[u.codeCase, ch && { borderColor: couleur + '88', backgroundColor: couleur + '14' }, actif && { borderColor: couleur }, !!erreur && { borderColor: C.danger }]}>
              <Text style={u.codeCh}>{ch || ''}</Text>
            </View>
          );
        })}
      </Animated.View>
      <TextInput ref={ref} value={value} editable={!disabled} onChangeText={(v) => onChange(v.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
        autoCapitalize="characters" autoCorrect={false} maxLength={14} caretHidden style={u.codeHidden} />
    </Pressable>
  );
}

export function Loading() {
  return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Logo size={80} /></View>;
}

export const u = StyleSheet.create({
  btn: { minHeight: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 16, elevation: 8 },
  btnGhost: { backgroundColor: 'transparent', borderWidth: 1, borderColor: C.line, elevation: 0, shadowOpacity: 0, minHeight: 50 },
  btnTxt: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.2 },
  back: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingRight: 14 },
  backChev: { color: C.muted, fontSize: 28, lineHeight: 30, marginRight: 6, marginTop: -3 },
  backTxt: { color: C.muted, fontSize: 15, fontWeight: '600' },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: C.line, backgroundColor: C.surface, borderRadius: 999, paddingVertical: 10, paddingHorizontal: 15 },
  chipTxt: { color: C.muted, fontSize: 14, fontWeight: '600' },
  modeCard: { flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 1, borderRadius: 24, padding: 16, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.18, shadowRadius: 18, elevation: 3 },
  orb: { width: 60, height: 60, borderRadius: 20, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  modeNom: { fontSize: 18, fontWeight: '800', marginBottom: 3, letterSpacing: -0.2 },
  modeDesc: { fontSize: 13, lineHeight: 18, color: C.muted },
  tag: { alignSelf: 'flex-start', borderWidth: 1, borderRadius: 50, paddingVertical: 2, paddingHorizontal: 9, marginTop: 8 },
  tagTxt: { fontSize: 11, fontWeight: '700', letterSpacing: 0.3 },
  chev: { fontSize: 30, lineHeight: 32, fontWeight: '300' },
  codeCase: { width: 48, height: 60, borderRadius: 14, borderWidth: 1.5, borderColor: C.line, backgroundColor: C.surface, alignItems: 'center', justifyContent: 'center' },
  codeCh: { fontSize: 26, fontWeight: '800', color: C.text },
  codeHidden: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, opacity: 0, color: 'transparent' },
});
