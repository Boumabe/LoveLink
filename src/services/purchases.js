// Version « sans magasin » (web, ou tests) — la vraie est dans purchases.native.js
import { CONFIG } from '../config';
export async function initPurchases() { return { premium: !!CONFIG.DEV_UNLOCK_PREMIUM }; }
export async function getOffering() { return null; }
export async function purchase() { return { ok: false, error: 'unsupported' }; }
export async function restore() { return { premium: !!CONFIG.DEV_UNLOCK_PREMIUM }; }
export function onPremiumChange() { return () => {}; }
