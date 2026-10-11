import AsyncStorage from '@react-native-async-storage/async-storage';

const P = 'll:';
export async function load(key, fallback = null) {
  try {
    const raw = await AsyncStorage.getItem(P + key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch (e) { return fallback; }
}
export async function save(key, value) {
  try {
    if (value === null || value === undefined) await AsyncStorage.removeItem(P + key);
    else await AsyncStorage.setItem(P + key, JSON.stringify(value));
  } catch (e) { /* stockage indisponible : l'app continue */ }
}
export async function clearAll() {
  try {
    const keys = (await AsyncStorage.getAllKeys()).filter((k) => k.startsWith(P));
    await AsyncStorage.multiRemove(keys);
  } catch (e) {}
}
