// Rappels locaux : « ton arbre a soif » (aucun serveur nécessaire)
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { CONFIG } from '../config';

let ready = false;
function setup() {
  if (ready) return;
  try {
    Notifications.setNotificationHandler({ handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }) });
    ready = true;
  } catch (e) {}
}

export async function ensurePermission() {
  if (Platform.OS === 'web') return false;
  try {
    setup();
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('garden', { name: 'Arbre du couple', importance: Notifications.AndroidImportance.DEFAULT });
    }
    const cur = await Notifications.getPermissionsAsync();
    if (cur.granted) return true;
    const r = await Notifications.requestPermissionsAsync();
    return !!r.granted;
  } catch (e) { return false; }
}

// Programme les 3 prochains soirs ; chaque ouverture de l'app repousse tout → si on revient, aucun rappel inutile
export async function scheduleReminders({ enabled, title, bodies, skipToday = false }) {
  if (Platform.OS === 'web') return;
  try {
    setup();
    await Notifications.cancelAllScheduledNotificationsAsync();
    if (!enabled) return;
    const now = new Date();
    for (let i = skipToday ? 1 : 0; i < (skipToday ? 4 : 3); i++) {
      const at = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i, CONFIG.REMINDER_HOUR, CONFIG.REMINDER_MINUTE, 0);
      if (at <= now) continue;
      await Notifications.scheduleNotificationAsync({
        content: { title, body: bodies[i % bodies.length] },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: at, channelId: 'garden' },
      });
    }
  } catch (e) {}
}
