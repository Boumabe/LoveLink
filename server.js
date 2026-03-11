const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const GEMINI_KEY = process.env.GEMINI_KEY;

app.post('/question', async (req, res) => {
  const { langue, categorie, niveau, historique = [] } = req.body;

  const instructions = {
    fr: `Tu es un générateur de questions pour couples. Génère UNE question en FRANÇAIS pour la catégorie "${categorie}" au niveau "${niveau}". La question ET les 4 réponses doivent être en FRANÇAIS.`,
    en: `You are a couples quiz generator. Generate ONE question in ENGLISH for the category "${categorie}" at level "${niveau}". The question AND all 4 answers must be in ENGLISH.`,
    es: `Eres un generador de preguntas para parejas. Genera UNA pregunta en ESPAÑOL para la categoría "${categorie}" al nivel "${niveau}". La pregunta Y las 4 respuestas deben estar en ESPAÑOL.`,
    ht: `Ou se yon jenatè kesyon pou koup. Jenere YON kesyon nan KREYÒL AYISYEN pou kategori "${categorie}" nan nivo "${niveau}". Kesyon AN ak 4 repons yo dwe ann kreyòl.`,
  };

  const prompt = `${instructions[langue] || instructions.fr}

Questions déjà posées à éviter: ${historique.slice(-15).join(' | ')}

IMPORTANT: Réponds UNIQUEMENT avec un JSON valide, sans markdown, sans explication, sans backticks:
{"e":"emoji_approprié","t":"la question","r":["réponse1","réponse2","réponse3","réponse4"]}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.9, maxOutputTokens: 400 }
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
