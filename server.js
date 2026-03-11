const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const GEMINI_KEY = process.env.GEMINI_KEY;

app.post('/question', async (req, res) => {
  const { langue, categorie, niveau, historique = [] } = req.body;

  const langueNom = {
    fr: 'français', en: 'English', es: 'español', ht: 'kreyòl ayisyen'
  }[langue] || 'français';

  const prompt = `Tu es un générateur de questions pour un jeu de couple.
Génère UNE question de couple en ${langueNom} pour la catégorie "${categorie}" au niveau "${niveau}".
La question doit avoir exactement 4 réponses courtes.
Questions déjà posées à éviter: ${historique.slice(-20).join(' | ')}
Réponds UNIQUEMENT en JSON valide, sans markdown, sans explication:
{"e":"emoji","t":"question","r":["réponse1","réponse2","réponse3","réponse4"]}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.9, maxOutputTokens: 300 }
        })
      }
    );
    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const clean = text.replace(/```json|```/g, '').trim();
    const question = JSON.parse(clean);
    res.json({ ok: true, question });
  } catch (e) {
    res.json({ ok: false, error: e.message });
  }
});

app.get('/', (req, res) => res.send('LoveLink API ✅'));

app.listen(3000, () => console.log('LoveLink API running on port 3000'));
