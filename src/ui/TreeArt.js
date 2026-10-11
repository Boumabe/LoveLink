// ═══════════════════════════════════════════════════════════════
//  L'arbre du couple, dessiné en SVG (aucune image, tout est généré)
//  stage 0→6 : graine, pousse, jeune plant, arbuste, arbre, grand arbre, arbre en fleurs
// ═══════════════════════════════════════════════════════════════
import { useEffect, useRef } from 'react';
import { View, Animated, Easing } from 'react-native';
import Svg, { Defs, RadialGradient, LinearGradient, Stop, Path, Circle, Ellipse, G } from 'react-native-svg';
import { C } from './tokens';
import { NATIF, Glow } from './primitives';

const W = 300, H = 340, GY = 300;
const TABLE = [
  { h: 0, w: 0, r: 0 }, { h: 30, w: 0, r: 0 }, { h: 70, w: 7, r: 32 },
  { h: 95, w: 12, r: 50 }, { h: 120, w: 16, r: 68 }, { h: 140, w: 20, r: 84 }, { h: 155, w: 24, r: 98 },
];
const BLOBS = [[0, 0, 1], [-0.55, 0.15, 0.7], [0.55, 0.15, 0.7], [-0.25, -0.5, 0.65], [0.3, -0.5, 0.65], [-0.8, 0.4, 0.5], [0.8, 0.4, 0.5]];
const PETALS = ['#FF6B9A', '#FFB3CB', '#FFD27A', '#FF3D6B'];

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a, b, t) => { const A = hex(a), B = hex(b); return '#' + A.map((x, i) => Math.round(x + (B[i] - x) * t).toString(16).padStart(2, '0')).join(''); };

function Rain({ rainKey, size }) {
  const drops = useRef(Array.from({ length: 8 }, () => new Animated.Value(0))).current;
  useEffect(() => {
    if (!rainKey) return;
    drops.forEach((v) => v.setValue(0));
    Animated.stagger(90, drops.map((v) => Animated.timing(v, { toValue: 1, duration: 900, easing: Easing.in(Easing.quad), useNativeDriver: NATIF }))).start();
  }, [rainKey]);
  if (!rainKey) return null;
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: 0, top: 0, width: size, height: size }}>
      {drops.map((v, i) => (
        <Animated.View key={i} style={{ position: 'absolute', left: size * (0.28 + (i % 4) * 0.15) + (i % 2) * 6, top: size * 0.04, width: 7, height: 12, borderRadius: 6, backgroundColor: '#7CC8FF',
          opacity: v.interpolate({ inputRange: [0, 0.15, 0.85, 1], outputRange: [0, 1, 1, 0] }),
          transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, size * 0.62] }) }] }} />
      ))}
    </View>
  );
}

function Fall({ fallKey, count, size }) {
  const n = Math.min(count || 0, 6);
  const ps = useRef(Array.from({ length: 6 }, () => new Animated.Value(0))).current;
  useEffect(() => {
    if (!fallKey || !n) return;
    ps.forEach((v) => v.setValue(0));
    Animated.stagger(180, ps.slice(0, n).map((v) => Animated.timing(v, { toValue: 1, duration: 2600, easing: Easing.out(Easing.quad), useNativeDriver: NATIF }))).start();
  }, [fallKey]);
  if (!fallKey || !n) return null;
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: 0, top: 0, width: size, height: size }}>
      {ps.slice(0, n).map((v, i) => (
        <Animated.View key={i} style={{ position: 'absolute', left: size * (0.3 + i * 0.07), top: size * 0.3, width: 9, height: 9, borderRadius: 5, backgroundColor: PETALS[i % 4],
          opacity: v.interpolate({ inputRange: [0, 0.1, 0.85, 1], outputRange: [0, 1, 1, 0] }),
          transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, size * 0.55] }) }, { translateX: v.interpolate({ inputRange: [0, 1], outputRange: [0, (i % 2 ? 1 : -1) * 22] }) }, { rotate: v.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '240deg'] }) }] }} />
      ))}
    </View>
  );
}

export default function TreeArt({ stage = 0, flowers = 0, vitality = 1, size = 280, rainKey = 0, fallKey = 0, fallCount = 0, glow = true }) {
  const id = useRef('t' + Math.random().toString(36).slice(2, 7)).current;
  const sway = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const a = Animated.loop(Animated.sequence([
      Animated.timing(sway, { toValue: 1, duration: 3200, easing: Easing.inOut(Easing.sin), useNativeDriver: NATIF }),
      Animated.timing(sway, { toValue: 0, duration: 3200, easing: Easing.inOut(Easing.sin), useNativeDriver: NATIF }),
    ]));
    a.start(); return () => a.stop();
  }, []);

  const T = TABLE[Math.max(0, Math.min(6, stage))];
  const tired = 1 - Math.max(0, Math.min(1, vitality));
  const dark = mix(C.leaf2, '#8A7A35', tired), mid = mix(C.leaf1, '#B49A45', tired), light = mix(C.leaf3, '#D6C066', tired);
  const topY = GY - T.h;
  const cy = topY - T.r * 0.25;
  const bw = T.w * 1.5, tw = T.w * 0.8;
  const px = (n) => (n / W) * size;

  const flowerDots = [];
  if (T.r) {
    for (let k = 0; k < flowers; k++) {
      const [dx, dy, rs] = BLOBS[k % 7];
      const a = k * 2.399, rad = rs * T.r * 0.72;
      flowerDots.push({ x: 150 + dx * T.r + Math.cos(a) * rad, y: cy + dy * T.r + Math.sin(a) * rad * 0.8, c: PETALS[k % 4] });
    }
  }
  const rot = sway.interpolate({ inputRange: [0, 1], outputRange: ['-1.4deg', '1.4deg'] });
  const wrapH = (H / W) * size;

  return (
    <View style={{ width: size, height: wrapH, alignItems: 'center', justifyContent: 'center' }}>
      {glow && <Glow size={size * 1.15} color={mix(C.leaf1, '#C9A227', tired)} style={{ top: -size * 0.1 }} />}
      <Animated.View style={{ width: size, height: wrapH, transform: [{ translateY: wrapH / 2 }, { rotate: rot }, { translateY: -wrapH / 2 }] }}>
        <Svg width={size} height={wrapH} viewBox={`0 0 ${W} ${H}`}>
          <Defs>
            <LinearGradient id={id + 'b'} x1="0" y1="0" x2="1" y2="0"><Stop offset="0" stopColor={C.bark2} /><Stop offset="0.5" stopColor={C.bark} /><Stop offset="1" stopColor={C.bark2} /></LinearGradient>
            <RadialGradient id={id + 'g'} cx="50%" cy="40%" r="60%"><Stop offset="0" stopColor={light} /><Stop offset="1" stopColor={mid} /></RadialGradient>
          </Defs>
          <Ellipse cx={150} cy={GY + 4} rx={96} ry={13} fill="rgba(0,0,0,0.35)" />
          <Path d={`M52 ${GY + 2} Q150 ${GY - 30} 248 ${GY + 2} Z`} fill="#3A2718" />
          <Path d={`M70 ${GY + 2} Q150 ${GY - 22} 230 ${GY + 2} Z`} fill="#4E3422" />

          {stage === 0 && <G><Ellipse cx={150} cy={GY - 8} rx={7} ry={10} fill={C.bark} /><Circle cx={150} cy={GY - 14} r={2} fill="#FFD27A" /></G>}

          {stage === 1 && (
            <G>
              <Path d={`M150 ${GY} Q145 ${GY - T.h / 2} 150 ${topY}`} stroke={mid} strokeWidth={4} strokeLinecap="round" fill="none" />
              <Ellipse cx={137} cy={topY + 2} rx={13} ry={6} fill={light} transform={`rotate(-30 137 ${topY + 2})`} />
              <Ellipse cx={163} cy={topY + 6} rx={13} ry={6} fill={mid} transform={`rotate(30 163 ${topY + 6})`} />
            </G>
          )}

          {stage >= 2 && (
            <G>
              <Path d={`M${150 - bw / 2} ${GY} C${150 - bw / 2} ${GY - T.h * 0.4} ${150 - tw / 2 - 4} ${GY - T.h * 0.7} ${150 - tw / 2} ${topY} L${150 + tw / 2} ${topY} C${150 + tw / 2 + 4} ${GY - T.h * 0.7} ${150 + bw / 2} ${GY - T.h * 0.4} ${150 + bw / 2} ${GY} Z`} fill={`url(#${id}b)`} />
              {stage >= 4 && <Path d={`M150 ${topY + 8} L${150 - T.r * 0.55} ${topY - T.r * 0.3} M150 ${topY + 8} L${150 + T.r * 0.55} ${topY - T.r * 0.3}`} stroke={C.bark} strokeWidth={Math.max(3, tw * 0.5)} strokeLinecap="round" fill="none" />}
              {BLOBS.map(([dx, dy, rs], i) => <Circle key={'d' + i} cx={150 + dx * T.r + 3} cy={cy + dy * T.r + 5} r={rs * T.r * 0.7} fill={dark} />)}
              {BLOBS.map(([dx, dy, rs], i) => <Circle key={'m' + i} cx={150 + dx * T.r} cy={cy + dy * T.r} r={rs * T.r * 0.68} fill={`url(#${id}g)`} />)}
              {BLOBS.slice(0, 5).map(([dx, dy, rs], i) => <Circle key={'l' + i} cx={150 + dx * T.r - 5} cy={cy + dy * T.r - 6} r={rs * T.r * 0.28} fill={light} opacity={0.45} />)}
              {flowerDots.map((f, i) => (
                <G key={i}>
                  <Circle cx={f.x} cy={f.y} r={5.2} fill={f.c} />
                  <Circle cx={f.x} cy={f.y} r={1.9} fill="#FFF4C4" />
                </G>
              ))}
            </G>
          )}
        </Svg>
        <Rain rainKey={rainKey} size={size} />
        <Fall fallKey={fallKey} count={fallCount} size={size} />
      </Animated.View>
    </View>
  );
}
