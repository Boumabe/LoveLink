import { Platform } from 'react-native';

// ═══════════════════════════════════════════════════════════════
//  CONFIGURATION — le seul fichier à remplir avec tes clés
// ═══════════════════════════════════════════════════════════════
export const CONFIG = {
  // Firebase › Paramètres du projet › « Clé API Web »  (active aussi Authentication › Anonyme)
  FIREBASE_API_KEY: 'COLLE_ICI_TA_CLE_API_WEB',
  FIREBASE_DB_URL: 'https://lovelink-a8e75-default-rtdb.firebaseio.com',

  // Adresse de ton projet Vercel (serveur IA)
  API_BASE: 'https://VOTRE-PROJET.vercel.app',

  // RevenueCat › Project › API keys › Google Play (clé publique « goog_… »)
  REVENUECAT_ANDROID_KEY: 'COLLE_ICI_TA_CLE_REVENUECAT',
  ENTITLEMENT_ID: 'premium',          // nom de l'« entitlement » créé dans RevenueCat
  DEV_UNLOCK_PREMIUM: false,          // true = débloque le mode Couple SANS payer (tests uniquement)

  // Rappel quotidien « ton arbre a soif »
  REMINDER_HOUR: 19,
  REMINDER_MINUTE: 30,

  FREE_AI_MESSAGES_PER_DAY: 5,        // messages IA gratuits par jour (illimité en premium)
  INVITE_TTL_MS: 10 * 60 * 1000,      // un code d'invitation vit 10 min
  LIVE_TTL_MS: 3 * 60 * 1000,         // une invitation à jouer vit 3 min
  POLL_MS: 1500,
};

export const isPlaceholder = (v) => !v || String(v).startsWith('COLLE_ICI');
export const API_URL = Platform.OS === 'web' ? '/api/question' : `${CONFIG.API_BASE}/api/question`;
export const MESSAGE_API_URL = Platform.OS === 'web' ? '/api/message' : `${CONFIG.API_BASE}/api/message`;
