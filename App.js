import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, ScrollView, 
  SafeAreaView, StatusBar, ActivityIndicator, Share, Platform, Alert, Clipboard 
} from 'react-native';

const FB_URL = "https://lovelink-a8e75-default-rtdb.firebaseio.com";
const API_URL = "/api/question";

export default function App() {
  const [etape, setEtape] = useState('menu'); 
  const [langue, setLangue] = useState('fr');
  const [categorie, setCategorie] = useState('Complicité');
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [points, setPoints] = useState(0);

  const categories = [
    { n: 'Complicité', e: '💕', c: '#ff4d4d' },
    { n: 'Humour', e: '😂', c: '#ffb347' },
    { n: 'Futur', e: '🚀', c: '#6366f1' },
    { n: 'Hot', e: '🔥', c: '#9c27b0' }
  ];

  const langues = [
    { c: 'fr', n: 'Français', f: '🇫🇷' },
    { c: 'en', n: 'English', f: '🇬🇧' },
    { c: 'ht', n: 'Kreyòl', f: '🇭🇹' },
    { c: 'es', n: 'Español', f: '🇪🇸' }
  ];

  // Système de génération via Gemini
  const genererQuestion = async () => {
    setLoading(true);
    setEtape('quiz');
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: categorie, language: langue })
      });
      const data = await response.json();
      if (data && data.question) {
        setQuestion(data);
      } else { throw new Error(); }
    } catch (error) {
      const fallbacks = {
        fr: "Quel est le projet que tu rêves de réaliser avec moi cette année ?",
        en: "What project do you dream of achieving with me this year?",
        ht: "Ki pwojè ou ta renmen nou reyalize ansanm ane sa?",
        es: "¿Qué proyecto sueñas con realizar conmigo este año?"
      };
      setQuestion({
        question: fallbacks[langue] || fallbacks['fr'],
        options: ["Voyager ensemble", "Créer un projet", "Acheter quelque chose", "Se marier/Fêter"]
      });
    } finally {
      setLoading(false);
    }
  };

  const validerReponse = async (opt) => {
    const nextScore = points + 10;
    setPoints(nextScore);
    // Sauvegarde silencieuse sur Firebase
    fetch(`${FB_URL}/stats/points.json`, { method: 'PUT', body: JSON.stringify(nextScore) });
    setEtape('menu');
    if(Platform.OS !== 'web') Alert.alert("Bravo !", "+10 points de complicité.");
    else alert("Félicitations ! +10 points de complicité.");
  };

  const partager = async () => {
    const msg = `LoveLink ❤️ [${categorie}] : ${question.question}`;
    if (Platform.OS === 'web') {
      Clipboard.setString(msg);
      alert("Copié ! Envoie-le vite à Milly.");
    } else {
      await Share.share({ message: msg });
    }
  };

  if (etape === 'menu') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.logo}>LoveLink</Text>
          <View style={styles.scoreContainer}>
            <Text style={styles.scoreVal}>{points}</Text>
            <Text style={styles.scoreLabel}>POINTS COMPLICITÉ</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>Choisir la langue :</Text>
            <View style={styles.row}>
              {langues.map(l => (
                <TouchableOpacity key={l.c} style={[styles.langCard, langue === l.c && styles.langActive]} onPress={() => setLangue(l.c)}>
                  <Text style={styles.emoji}>{l.f}</Text>
                  <Text style={styles.langName}>{l.n}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Text style={styles.label}>Thème de votre moment :</Text>
          <View style={styles.grid}>
            {categories.map(c => (
              <TouchableOpacity key={c.n} style={[styles.catCard, categorie === c.n && {borderColor: c.c, backgroundColor: c.c+'10'}]} onPress={() => setCategorie(c.n)}>
                <Text style={styles.bigEmoji}>{c.e}</Text>
                <Text style={[styles.catText, {color: c.c}]}>{c.n}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.playBtn} onPress={genererQuestion}>
            <Text style={styles.playBtnText}>DÉCOUVRIR LA QUESTION</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: '#fff'}]}>
      <View style={styles.nav}>
        <TouchableOpacity onPress={() => setEtape('menu')}><Text style={styles.back}>⬅ Quitter</Text></TouchableOpacity>
        <Text style={styles.navTitle}>{categorie}</Text>
      </View>
      <View style={styles.quizContent}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#ff4d4d" />
            <Text style={styles.loadTxt}>Gemini crée votre moment...</Text>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.qCard}><Text style={styles.qText}>{question?.question}</Text></View>
            {question?.options?.map((opt, i) => (
              <TouchableOpacity key={i} style={styles.optBtn} onPress={() => validerReponse(opt)}>
                <Text style={styles.optTxt}>{opt}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.share} onPress={partager}>
              <Text style={styles.shareTxt}>Envoyer à Milly 💖</Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fffafa' },
  scroll: { padding: 25, alignItems: 'center' },
  logo: { fontSize: 42, fontWeight: '900', color: '#ff4d4d', letterSpacing: -1 },
  scoreContainer: { alignItems: 'center', marginVertical: 20, backgroundColor: '#fff', padding: 15, borderRadius: 25, width: '100%', elevation: 2 },
  scoreVal: { fontSize: 32, fontWeight: '900', color: '#ff4d4d' },
  scoreLabel: { fontSize: 10, fontWeight: '700', color: '#999', letterSpacing: 1 },
  section: { width: '100%', marginBottom: 20 },
  label: { fontWeight: '800', color: '#444', marginBottom: 15, alignSelf: 'flex-start' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  langCard: { alignItems: 'center', padding: 10, borderRadius: 15, width: '23%', backgroundColor: '#fff' },
  langActive: { backgroundColor: '#ffe5e5', borderWidth: 1, borderColor: '#ff4d4d' },
  emoji: { fontSize: 22 },
  langName: { fontSize: 10, fontWeight: '600', marginTop: 5 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', width: '100%' },
  catCard: { width: '48%', backgroundColor: '#fff', padding: 20, borderRadius: 25, alignItems: 'center', marginBottom: 15, borderWidth: 2, borderColor: '#f0f0f0' },
  bigEmoji: { fontSize: 35 },
  catText: { fontWeight: '800', marginTop: 10 },
  playBtn: { backgroundColor: '#ff4d4d', padding: 22, borderRadius: 25, width: '100%', alignItems: 'center', shadowColor: '#ff4d4d', shadowOpacity: 0.3, shadowRadius: 10 },
  playBtnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
  nav: { flexDirection: 'row', padding: 20, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#eee' },
  back: { color: '#ff4d4d', fontWeight: '700' },
  navTitle: { flex: 1, textAlign: 'center', fontWeight: '800', fontSize: 18, marginRight: 50 },
  quizContent: { flex: 1, padding: 20 },
  qCard: { backgroundColor: '#f8f9fa', padding: 35, borderRadius: 30, marginBottom: 25 },
  qText: { fontSize: 24, fontWeight: '800', textAlign: 'center', color: '#1a1a1a', lineHeight: 32 },
  optBtn: { backgroundColor: '#fff', padding: 20, borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: '#eee' },
  optTxt: { textAlign: 'center', fontSize: 17, fontWeight: '600', color: '#444' },
  share: { marginTop: 20, alignItems: 'center' },
  shareTxt: { color: '#ff4d4d', fontWeight: '800', fontSize: 16 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadTxt: { marginTop: 20, color: '#ff4d4d', fontWeight: '700' }
});
