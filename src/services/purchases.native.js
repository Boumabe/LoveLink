// ═══════════════════════════════════════════════════════════════
//  Paiement Google Play via RevenueCat.
//  L'identifiant client RevenueCat = l'identifiant du COUPLE : un seul abonnement
//  débloque le mode Couple sur les deux téléphones.
// ═══════════════════════════════════════════════════════════════
import Purchases from 'react-native-purchases';
import { CONFIG, isPlaceholder } from '../config';

let configured = false;
let pkg = null;
const hasPremium = (info) => !!(info && info.entitlements && info.entitlements.active && info.entitlements.active[CONFIG.ENTITLEMENT_ID]);

export async function initPurchases(appUserId) {
  if (CONFIG.DEV_UNLOCK_PREMIUM) return { premium: true };
  if (isPlaceholder(CONFIG.REVENUECAT_ANDROID_KEY)) return { premium: false, error: 'no-key' };
  try {
    if (!configured) { Purchases.configure({ apiKey: CONFIG.REVENUECAT_ANDROID_KEY, appUserID: appUserId || undefined }); configured = true; }
    else if (appUserId) { const { customerInfo } = await Purchases.logIn(appUserId); return { premium: hasPremium(customerInfo) }; }
    return { premium: hasPremium(await Purchases.getCustomerInfo()) };
  } catch (e) { return { premium: false, error: String(e && e.message) }; }
}

export async function getOffering() {
  try {
    const o = await Purchases.getOfferings();
    const cur = o && o.current;
    if (!cur) return null;
    pkg = cur.monthly || (cur.availablePackages || [])[0] || null;
    if (!pkg) return null;
    const p = pkg.product;
    return { price: p.priceString, title: p.title, trial: p.introPrice ? { price: p.introPrice.priceString, days: p.introPrice.periodNumberOfUnits, unit: p.introPrice.periodUnit } : null };
  } catch (e) { return null; }
}

export async function purchase() {
  try {
    if (!pkg) await getOffering();
    if (!pkg) return { ok: false, error: 'no-offering' };
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    return { ok: true, premium: hasPremium(customerInfo) };
  } catch (e) {
    if (e && e.userCancelled) return { ok: false, cancelled: true };
    return { ok: false, error: String(e && e.message) };
  }
}

export async function restore() {
  try { return { premium: hasPremium(await Purchases.restorePurchases()) }; } catch (e) { return { premium: false }; }
}

export function onPremiumChange(cb) {
  try {
    const l = (info) => cb(hasPremium(info));
    Purchases.addCustomerInfoUpdateListener(l);
    return () => { try { Purchases.removeCustomerInfoUpdateListener(l); } catch (e) {} };
  } catch (e) { return () => {}; }
}
