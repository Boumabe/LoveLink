// ═══════════════════════════════════════════════════════════════
//  Messages personnalisés pour le partenaire
//  • Hors-ligne : modèles écrits à la main (4 langues) assemblés selon le profil
//  • En ligne  : l'IA (Gemini via /api/message) pour des messages uniques
// ═══════════════════════════════════════════════════════════════
import { CONFIG, MESSAGE_API_URL } from '../config';
import { load, save } from './storage';

export const OCCASIONS = ['morning', 'night', 'miss', 'thanks', 'support'];
export const TONES = ['romantic', 'funny', 'simple'];
export const LOVE_LANGS = ['words', 'time', 'gifts', 'service', 'touch'];
export const RELATIONS = ['new', 'couple', 'distance', 'married'];

const TPL = {
  fr: {
    morning: { romantic: "Bonjour {p} 🌅 Ma première pensée du jour, c'est toi. Que cette journée te soit douce.", funny: "Bonjour {p} ! Le café est prêt, mais j'avoue que tu me réveilles mieux que lui ☕😄", simple: "Bonjour {p}. Belle journée à toi, je pense à toi." },
    night: { romantic: "Bonne nuit {p} 🌙 Merci d'être ma paix à la fin de chaque journée. Fais de beaux rêves.", funny: "Bonne nuit {p} ! Je te garde la moitié du lit… et toute la couverture 😴😂", simple: "Bonne nuit {p}. Dors bien, à demain." },
    miss: { romantic: "{p}, tu me manques plus que les mots ne savent le dire 💞 Vivement qu'on se retrouve.", funny: "{p}, tu me manques tellement que mon téléphone commence à avoir pitié de moi 📱😅", simple: "Tu me manques, {p}. J'ai hâte de te voir." },
    thanks: { romantic: "Merci d'être toi, {p}. Avec toi, tout devient plus beau et plus léger ❤️", funny: "Merci {p} de me supporter chaque jour. Je sais, je suis un cadeau 😎🎁", simple: "Merci pour tout, {p}. Ça compte énormément pour moi." },
    support: { romantic: "{p}, je crois en toi, toujours. Quoi qu'il arrive aujourd'hui, je suis là, tout près de ton cœur 🤍", funny: "{p}, tu vas tout déchirer aujourd'hui. Et sinon, j'ai des câlins en réserve 💪🤗", simple: "Courage {p}. Je suis avec toi, tu vas y arriver." },
  },
  en: {
    morning: { romantic: "Good morning {p} 🌅 You're my first thought of the day. May it be gentle with you.", funny: "Morning {p}! Coffee's ready, but honestly you wake me up better than it does ☕😄", simple: "Good morning {p}. Have a great day, I'm thinking of you." },
    night: { romantic: "Good night {p} 🌙 Thank you for being my peace at the end of every day. Sweet dreams.", funny: "Night {p}! I'm saving you half the bed… and all of the blanket 😴😂", simple: "Good night {p}. Sleep well, talk tomorrow." },
    miss: { romantic: "{p}, I miss you more than words can say 💞 Can't wait until we're together again.", funny: "{p}, I miss you so much even my phone feels sorry for me 📱😅", simple: "I miss you, {p}. Can't wait to see you." },
    thanks: { romantic: "Thank you for being you, {p}. Everything is lighter and brighter with you ❤️", funny: "Thanks {p} for putting up with me every day. I know, I'm a gift 😎🎁", simple: "Thank you for everything, {p}. It means so much to me." },
    support: { romantic: "{p}, I believe in you, always. Whatever today brings, I'm right here with you 🤍", funny: "{p}, you're going to crush it today. And if not, I have hugs in stock 💪🤗", simple: "You've got this, {p}. I'm with you." },
  },
  es: {
    morning: { romantic: "Buenos días {p} 🌅 Eres mi primer pensamiento del día. Que sea un día dulce para ti.", funny: "¡Buenos días {p}! El café está listo, pero la verdad tú me despiertas mejor ☕😄", simple: "Buenos días {p}. Que tengas un lindo día, pienso en ti." },
    night: { romantic: "Buenas noches {p} 🌙 Gracias por ser mi paz al final de cada día. Dulces sueños.", funny: "¡Buenas noches {p}! Te guardo la mitad de la cama… y toda la manta 😴😂", simple: "Buenas noches {p}. Descansa, hablamos mañana." },
    miss: { romantic: "{p}, te extraño más de lo que las palabras pueden decir 💞 Ya quiero que estemos juntos.", funny: "{p}, te extraño tanto que hasta mi teléfono me tiene lástima 📱😅", simple: "Te extraño, {p}. Tengo ganas de verte." },
    thanks: { romantic: "Gracias por ser tú, {p}. Contigo todo es más bonito y más ligero ❤️", funny: "Gracias {p} por aguantarme cada día. Lo sé, soy un regalo 😎🎁", simple: "Gracias por todo, {p}. Significa muchísimo para mí." },
    support: { romantic: "{p}, creo en ti, siempre. Pase lo que pase hoy, estoy contigo 🤍", funny: "{p}, hoy vas a romperla. Y si no, tengo abrazos de reserva 💪🤗", simple: "Ánimo {p}. Estoy contigo, tú puedes." },
  },
  ht: {
    morning: { romantic: "Bonjou {p} 🌅 Se ou ki premye panse mwen jodi a. Pase jounen an dous pou ou.", funny: "Bonjou {p}! Kafe a pare, men ou reveye m pi byen pase l ☕😄", simple: "Bonjou {p}. Bon jounen, m ap panse ak ou." },
    night: { romantic: "Bonswa {p} 🌙 Mèsi paske ou se lapè mwen nan fen chak jou. Fè bèl rèv.", funny: "Bonn nwit {p}! M kenbe mwatye kabann nan pou ou… ak tout dra a 😴😂", simple: "Bonn nwit {p}. Dòmi byen, n ap pale demen." },
    miss: { romantic: "{p}, ou manke m plis pase mo yo ka di 💞 M grangou pou n rejwenn.", funny: "{p}, ou manke m tèlman telefòn mwen menm gen pitye pou mwen 📱😅", simple: "Ou manke m, {p}. M gen anvi wè ou." },
    thanks: { romantic: "Mèsi paske ou se ou, {p}. Avè ou tout bagay pi bèl, pi lejè ❤️", funny: "Mèsi {p} paske ou sipòte m chak jou. Wi, mwen se yon kado 😎🎁", simple: "Mèsi pou tout bagay, {p}. Sa konte anpil pou mwen." },
    support: { romantic: "{p}, m kwè nan ou, toutan. Kèlkeswa sa jodi a pote, m la ak ou 🤍", funny: "{p}, w ap kraze tout jodi a. Sinon, m gen anbrase an rezèv 💪🤗", simple: "Kouraj {p}. M avè ou, w ap rive." },
  },
};
const CLOSE = {
  fr: { words: "Tu comptes énormément pour moi.", time: "Dis-moi quand on s'appelle ce soir, je garde un moment rien que pour nous.", gifts: "J'ai déjà une petite surprise en tête pour toi 🎁", service: "Dis-moi ce que je peux faire pour t'alléger la journée.", touch: "J'ai hâte de te serrer dans mes bras." },
  en: { words: "You mean the world to me.", time: "Tell me when we can call tonight, I'm saving time just for us.", gifts: "I already have a little surprise in mind for you 🎁", service: "Tell me what I can do to make your day lighter.", touch: "I can't wait to hold you." },
  es: { words: "Significas muchísimo para mí.", time: "Dime cuándo hablamos esta noche, guardo un momento solo para nosotros.", gifts: "Ya tengo una sorpresita en mente para ti 🎁", service: "Dime qué puedo hacer para aligerarte el día.", touch: "Tengo ganas de abrazarte." },
  ht: { words: "Ou konte anpil pou mwen.", time: "Di m kilè nou rele aswè a, m kenbe yon moman sèlman pou nou.", gifts: "M deja gen yon ti sipriz nan tèt mwen pou ou 🎁", service: "Di m sa m ka fè pou m fè jounen w pi lejè.", touch: "M gen anvi sere ou nan bra m." },
};

export function offlineMessage({ langue = 'fr', occasion = 'morning', tone = 'romantic', loveLang = 'words', namePartner = '', variant = 0 }) {
  const L = TPL[langue] ? langue : 'fr';
  const base = (TPL[L][occasion] || TPL[L].morning)[tone] || TPL[L][occasion].romantic;
  const p = (namePartner || '').trim() || (L === 'en' ? 'love' : L === 'es' ? 'amor' : L === 'ht' ? 'cheri' : 'mon cœur');
  let text = base.replace(/\{p\}/g, p);
  if (variant % 2 === 0 && CLOSE[L][loveLang]) text += '\n' + CLOSE[L][loveLang];
  return text;
}

// Occasion suggérée selon l'heure
export function suggestOccasion(date = new Date()) {
  const h = date.getHours();
  if (h < 11) return 'morning';
  if (h >= 21 || h < 4) return 'night';
  const doy = Math.floor((date - new Date(date.getFullYear(), 0, 0)) / 86400000);
  return ['miss', 'thanks', 'support'][doy % 3];
}

// ── Quota IA gratuit (le premium est illimité) ──
const dayStr = () => new Date().toISOString().slice(0, 10);
export async function aiLeft(isPremium) {
  if (isPremium) return Infinity;
  const q = await load('aiq', null);
  const used = q && q.day === dayStr() ? q.n : 0;
  return Math.max(0, CONFIG.FREE_AI_MESSAGES_PER_DAY - used);
}
async function aiUsed() {
  const q = await load('aiq', null);
  await save('aiq', { day: dayStr(), n: (q && q.day === dayStr() ? q.n : 0) + 1 });
}

// Retourne { text, source:'ai'|'offline' }
export async function generateMessage(params, { isPremium = false, variant = 0 } = {}) {
  if ((await aiLeft(isPremium)) > 0) {
    try {
      const ctl = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const to = setTimeout(() => ctl && ctl.abort(), 12000);
      const r = await fetch(MESSAGE_API_URL, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: ctl ? ctl.signal : undefined,
        body: JSON.stringify(params),
      });
      clearTimeout(to);
      const d = await r.json();
      if (d.ok && d.text) { await aiUsed(); return { text: d.text, source: 'ai' }; }
    } catch (e) { /* hors-ligne → modèle local */ }
  }
  return { text: offlineMessage({ ...params, variant }), source: 'offline' };
}
