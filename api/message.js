import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const LANGUES = { fr: "FRANÇAIS", en: "ENGLISH", es: "ESPAÑOL", ht: "KREYÒL AYISYEN" };
const OCCASIONS = { morning: "un bonjour du matin", night: "un bonne nuit", miss: "dire à quel point il/elle manque", thanks: "un remerciement sincère", support: "un encouragement avant une journée difficile" };
const TONES = { romantic: "romantique et tendre", funny: "drôle et complice, sans moquerie blessante", simple: "simple, sincère, sans fioritures" };
const LOVE = { words: "les mots doux", time: "les moments passés ensemble", gifts: "les petites attentions offertes", service: "les gestes qui allègent le quotidien", touch: "la tendresse physique" };
const RELATIONS = { new: "un nouveau couple", couple: "un couple", distance: "un couple à distance", married: "un couple marié" };
const propre = (v, max) => String(v ?? "").replace(/[^\p{L}\p{N} _'’\-.,!?]/gu, "").trim().slice(0, max);

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ ok: false, error: "POST uniquement" });

  try {
    const b = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const langue = LANGUES[b.langue] ? b.langue : "fr";
    const occasion = OCCASIONS[b.occasion] || OCCASIONS.morning;
    const tone = TONES[b.tone] || TONES.romantic;
    const love = LOVE[b.loveLang] || LOVE.words;
    const relation = RELATIONS[b.relation] || RELATIONS.couple;
    const me = propre(b.nameMe, 30), partner = propre(b.namePartner, 30), detail = propre(b.detail, 120);

    const prompt = `Écris UN message court (2 à 4 phrases, 280 caractères maximum) que ${me || "une personne"} envoie à ${partner || "son/sa partenaire"}.
Langue : ${LANGUES[langue]}. Occasion : ${occasion}. Ton : ${tone}.
Contexte : ${relation}. Le langage d'amour de l'expéditeur : ${love} — laisse-le transparaître sans le nommer.
${detail ? `Détail personnel à glisser naturellement : ${detail}.` : ""}
Règles : naturel (comme un vrai SMS), pas de hashtags, au plus 2 emojis, aucun cliché lourd, ne mentionne pas que tu es une IA.
Réponds UNIQUEMENT par un objet JSON : {"text":"le message"}`;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { temperature: 1, responseMimeType: "application/json", thinkingConfig: { thinkingBudget: 0 } },
    });
    const out = (await model.generateContent(prompt)).response.text();
    const m = out.match(/\{[\s\S]*\}/);
    const text = m ? String(JSON.parse(m[0]).text || "").trim() : "";
    if (text.length < 8 || text.length > 600) throw new Error("format invalide");
    return res.status(200).json({ ok: true, text });
  } catch (e) {
    console.error("message.js", e);
    return res.status(502).json({ ok: false, error: "Erreur IA" });
  }
}
