import { T as legacy } from './legacy';
import fr from './fr';
import en from './en';
import es from './es';
import ht from './ht';

const NEW = { fr, en, es, ht };
export const LANGUES = [
  { id: 'fr', drapeau: '🇫🇷', nom: 'Français' },
  { id: 'en', drapeau: '🇬🇧', nom: 'English' },
  { id: 'es', drapeau: '🇪🇸', nom: 'Español' },
  { id: 'ht', drapeau: '🇭🇹', nom: 'Kreyòl Ayisyen' },
];
// T[langue] = textes historiques des jeux + textes des nouveaux écrans
export const T = {};
Object.keys(NEW).forEach((l) => { T[l] = { ...(legacy[l] || {}), ...NEW[l] }; });

export const fmt = (s, v = {}) => String(s == null ? '' : s).replace(/\{(\w+)\}/g, (_, k) => (v[k] !== undefined ? v[k] : ''));

export function detectLang() {
  try {
    const loc = (Intl.DateTimeFormat().resolvedOptions().locale || 'fr').toLowerCase().slice(0, 2);
    return NEW[loc] ? loc : 'en';
  } catch (e) { return 'fr'; }
}
