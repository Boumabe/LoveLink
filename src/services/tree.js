// ═══════════════════════════════════════════════════════════════
//  L'arbre du couple — fonction PURE : même journal d'arrosages ⇒ même arbre
//  sur les deux téléphones, sans conflit d'écriture.
//
//  Règles (une « journée » = jour calendaire dans le fuseau du couple) :
//   • les deux ont arrosé        → croissance +2, fleur +1, série +1
//   • un seul a arrosé           → croissance +1, il perd 1 fleur (pour celui qui a manqué), série à 0
//   • personne                   → fleurs −2, série à 0
//   • l'arbre ne régresse JAMAIS en taille : seules les fleurs fanent (pas de punition cruelle).
// ═══════════════════════════════════════════════════════════════
export const STAGES = [
  { id: 0, at: 0,   cap: 0,  key: 'seed' },
  { id: 1, at: 4,   cap: 0,  key: 'sprout' },
  { id: 2, at: 12,  cap: 3,  key: 'young' },
  { id: 3, at: 28,  cap: 8,  key: 'shrub' },
  { id: 4, at: 55,  cap: 14, key: 'tree' },
  { id: 5, at: 100, cap: 22, key: 'big' },
  { id: 6, at: 170, cap: 30, key: 'blossom' },
];

export function dayKey(ts, tzOffsetMin = 0) {
  return new Date(ts + tzOffsetMin * 60000).toISOString().slice(0, 10);
}
export function addDays(key, n) {
  const d = new Date(key + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
export function stageFor(growth) {
  let st = STAGES[0];
  for (const s of STAGES) if (growth >= s.at) st = s;
  return st;
}

/**
 * water : { 'YYYY-MM-DD': { [uid]: timestamp } }
 * uids  : les membres attendus (1 en solo, 2 en couple)
 * today : clé du jour courant
 */
export function computeTree({ water = {}, uids = [], today, startDay }) {
  const days = Object.keys(water).sort();
  const first = startDay || days[0] || today;
  let growth = 0, flowers = 0, streak = 0, best = 0, lost = 0;
  let cursor = first;
  while (cursor < today) {                              // jours « réglés » : strictement avant aujourd'hui
    const w = water[cursor] || {};
    const did = uids.filter((u) => w[u]).length;
    const stage = stageFor(growth);
    if (did === uids.length && uids.length > 0) {
      growth += uids.length; streak += 1; best = Math.max(best, streak);
      flowers = Math.min(stage.cap, flowers + 1);
    } else {
      streak = 0;
      const missed = uids.length - did;
      growth += did;
      const before = flowers;
      flowers = Math.max(0, flowers - missed);
      lost += before - flowers;
    }
    cursor = addDays(cursor, 1);
  }
  const wt = water[today] || {};
  const wateredToday = {};
  uids.forEach((u) => { wateredToday[u] = !!wt[u]; });
  const allToday = uids.length > 0 && uids.every((u) => wateredToday[u]);
  if (allToday) { growth += uids.length; streak += 1; best = Math.max(best, streak); }
  else uids.forEach((u) => { if (wateredToday[u]) growth += 1; });
  const stage = stageFor(growth);
  const next = STAGES[stage.id + 1] || null;
  // jours écoulés depuis le dernier arrosage de n'importe qui (pour la couleur du feuillage)
  const last = days.length ? days[days.length - 1] : null;
  let idle = 0;
  if (last) { let c = last; while (c < today) { c = addDays(c, 1); idle += 1; } }
  const displayFlowers = Math.min(stage.cap, flowers + (allToday ? 1 : 0));
  return {
    growth, stage, flowers: displayFlowers, streak, best, wateredToday, allToday, lost,
    toNext: next ? next.at - growth : 0,
    progress: next ? (growth - stage.at) / (next.at - stage.at) : 1,
    vitality: Math.max(0.25, 1 - idle * 0.18),            // 1 = vert éclatant ; baisse si on délaisse l'arbre
    idle,
  };
}
