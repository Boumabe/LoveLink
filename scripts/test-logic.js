// Tests de la logique de l'arbre : node scripts/test-logic.js  (via Babel-less import dynamique)
const fs = require('fs'); const path = require('path');
// charge src/services/tree.js sans dépendance (retire les « export » puis évalue)
const code = fs.readFileSync(path.join(__dirname, '../src/services/tree.js'), 'utf8').replace(/^export /gm, '');
const { computeTree, addDays, STAGES } = new Function(code + '\nreturn { computeTree, addDays, STAGES };')();
let ok = 0, ko = 0;
const eq = (n, a, b) => { const pass = JSON.stringify(a) === JSON.stringify(b); pass ? ok++ : ko++; console.log(pass ? '✅' : '❌', n, pass ? '' : `→ obtenu ${JSON.stringify(a)}, attendu ${JSON.stringify(b)}`); };
const A = 'A', B = 'B';
const log = (m) => { const w = {}; Object.entries(m).forEach(([d, u]) => { w[d] = {}; u.forEach((x) => (w[d][x] = 1)); }); return w; };

// 1) Jour 1 : A arrose seul, pas encore réglé
let t = computeTree({ water: log({ '2026-10-01': [A] }), uids: [A, B], today: '2026-10-01' });
eq('jour 1, A seul → croissance 1, 0 fleur', [t.growth, t.flowers, t.streak], [1, 0, 0]);

// 2) 5 jours où les deux arrosent → série 5 (aujourd'hui inclus), arbre jeune
const w5 = {}; for (let i = 0; i < 5; i++) w5[addDays('2026-10-01', i)] = [A, B];
t = computeTree({ water: log(w5), uids: [A, B], today: '2026-10-05' });
eq('5 jours ensemble → série 5, croissance 10', [t.streak, t.growth], [5, 10]);
eq('stade « pousse » ou plus', t.stage.id >= 1, true);

// 3) Les fleurs poussent seulement quand le stade le permet (cap) et fanent si on manque
const w = {}; for (let i = 0; i < 20; i++) w[addDays('2026-10-01', i)] = [A, B];
t = computeTree({ water: log(w), uids: [A, B], today: '2026-10-21' });
eq('20 jours ensemble : fleurs plafonnées au stade', t.flowers <= t.stage.cap && t.flowers > 0, true);
const f0 = t.flowers;
// B disparaît 3 jours
const w2 = { ...w }; for (let i = 20; i < 23; i++) w2[addDays('2026-10-01', i)] = [A];
t = computeTree({ water: log(w2), uids: [A, B], today: '2026-10-24' });
eq('B absent 3 jours → perd 3 fleurs', f0 - t.flowers, 3);
eq('la série retombe à 0', t.streak, 0);
const g1 = t.growth;
// Personne 2 jours → −2 fleurs/jour, mais la croissance ne baisse pas
t = computeTree({ water: log(w2), uids: [A, B], today: '2026-10-26' });
eq('la taille ne régresse jamais', t.growth >= g1, true);
eq('fleurs ≥ 0', t.flowers >= 0, true);
eq('feuillage plus pâle quand on délaisse', t.vitality < 1, true);

// 4) Solo
t = computeTree({ water: log({ '2026-10-01': [A], '2026-10-02': [A] }), uids: [A], today: '2026-10-03' });
eq('solo : 2 jours → croissance 2, série 2 (le jour 3 pas encore réglé)', [t.growth, t.streak], [2, 2]);

// 5) Stades
eq('stades croissants', STAGES.every((s, i) => i === 0 || s.at > STAGES[i - 1].at), true);
console.log(`\n${ok} réussis, ${ko} échoués`); process.exit(ko ? 1 : 0);
