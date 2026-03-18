import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  // Sécurité : on n'accepte que le POST
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  try {
    const { langue, categorie, niveau, historique } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Génère une question de couple unique pour la catégorie "${categorie}" et le niveau "${niveau}".
    Langue de réponse : ${langue}.
    Réponds EXCLUSIVEMENT en JSON pur avec ce format :
    {
      "e": "un emoji",
      "t": "la question",
      "r": ["réponse A", "réponse B", "réponse C", "réponse D"]
    }
    Historique à éviter : ${historique ? historique.join(', ') : ''}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace(/```json|```/g, "").trim();
    
    const data = JSON.parse(text);
    return res.status(200).json({ ok: true, question: data });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, error: "Erreur IA" });
  }
}
