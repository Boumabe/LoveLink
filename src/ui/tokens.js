// Design tokens : une seule source de vérité pour couleurs, espacements, typo
export const C = {
  bg: '#0E0A14', bg2: '#150F1D',
  text: '#F9F2E7', muted: 'rgba(249,242,231,0.66)', faint: 'rgba(249,242,231,0.42)',
  line: 'rgba(255,255,255,0.10)', surface: 'rgba(255,255,255,0.05)', surface2: 'rgba(255,255,255,0.09)',
  rose: '#FF3D6B', gold: '#F5A623', mint: '#10D9A0', violet: '#A78BFA', danger: '#FF6B6B',
  leaf1: '#2FBF71', leaf2: '#1E9D5B', leaf3: '#37D98A', bark: '#8B5A3C', bark2: '#6E4228',
};
export const SP = { xs: 4, sm: 8, md: 14, lg: 22, xl: 32 };
export const R = { sm: 12, md: 18, lg: 24, pill: 999 };
// Police des titres : chargée dans Root (Fraunces). Repli automatique sur la police système.
export const FONT = { title: 'Fraunces_700Bold', titleSemi: 'Fraunces_600SemiBold' };
