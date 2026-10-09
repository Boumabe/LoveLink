import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const LANGUES = { fr: "FRANÇAIS", en: "ENGLISH", es: "ESPAÑOL", ht: "KREYÒL AYISYEN" };
const propre = (v, max) =>
  String(v ?? "").replace(/[^\p{L}\p{N} _'’\-]/gu, "").trim().slice(0, max);

function extraireJSON(texte) {
  const m = String(texte).match(/\{[\s\S]*\}/);
  if (!m) throw new Error("pas de JSON");
  return JSON.parse(m[0]);
}

export default async function handler(req, res) {
  // CORS : indispensable pour l'application Android (APK) et le web
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "POST uniquement" });

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const langue = LANGUES[body.langue] ? body.langue : "fr";
    const categorie = propre(body.categorie, 40) || "général";
    const niveau = propre(body.niveau, 20) || "doux";
    const historique = (Array.isArray(body.historique) ? body.historique : [])
      .slice(-15).map((h) => propre(h, 160)).filter(Boolean);

    const prompt = `Tu écris UNE question de quiz pour un couple.
Langue : ${LANGUES[langue]} (la question ET les 4 réponses, sans exception).
Catégorie : ${categorie}. Niveau : ${niveau}.
Ton : chaleureux, concret, jamais vulgaire ni humiliant ; les 4 réponses sont courtes, distinctes et plausibles.
Questions déjà posées, à ne pas répéter : ${historique.join(" | ") || "aucune"}.
Réponds UNIQUEMENT par un objet JSON de la forme :
{"e":"un emoji","t":"la question","r":["réponse 1","réponse 2","réponse 3","réponse 4"]}`;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        temperature: 0.95,
        responseMimeType: "application/json",
        thinkingConfig: { thinkingBudget: 0 }, // réponse plus rapide et moins chère
      },
    });
    const result = await model.generateContent(prompt);
    const q = extraireJSON(result.response.text());

    const valide =
      typeof q.e === "string" && typeof q.t === "string" && q.t.length > 5 &&
      Array.isArray(q.r) && q.r.length === 4 && q.r.every((x) => typeof x === "string" && x.trim());
    if (!valide) throw new Error("format invalide");

    return res.status(200).json({ ok: true, question: { e: q.e, t: q.t.trim(), r: q.r.map((x) => x.trim()) } });
  } catch (error) {
    console.error("question.js", error);
    return res.status(502).json({ ok: false, error: "Erreur IA" });
  }
}
