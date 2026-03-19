import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, ScrollView, 
  SafeAreaView, StatusBar, ActivityIndicator, Share, Platform, Alert, Clipboard 
} from 'react-native';

// =============================
// CONFIGURATION
// =============================
const FB_URL = "https://lovelink-a8e75-default-rtdb.firebaseio.com";
const API_URL = "/api/question";

export default function App() {
  const [etape, setEtape] = useState('menu'); 
  const [langue, setLangue] = useState('fr');
  const [categorie, setCategorie] = useState('Complicité');
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [points, setPoints] = useState(0);
  const [historique, setHistorique] = useState([]);

  // Configuration des menus (Ajout ES)
  const categories = [
    { n: 'Complicité', e: '💕' },
    { n: 'Humour', e: '😂' },
    { n: 'Futur', e: '🚀' },
    { n: 'Hot', e: '🔥' }
  ];

  const langues = [
    { c: 'fr', n: 'Français', f: '🇫🇷' },
    { c: 'en', n: 'English', f: '🇬🇧' },
    { c: 'ht', n: 'Kreyòl', f: '🇭🇹' },
    { c: 'es', n: 'Español', f: '🇪🇸' }
  ];

  // Charger les données au démarrage
  useEffect(() => {
    recupererDonnees();
  }, []);

  const recupererDonnees = async () => {
    try {
      const res = await fetch(`${FB_URL}/stats.json`);
      const data = await res.json();
      if (data) {
        setPoints(data.points || 0);
        if (data.historique) setHistorique(Object.values(data.historique).reverse());
      }
    } catch (e) { console.log("Erreur chargement Firebase"); }
  };

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
      // MODE SECOURS AVEC ESPAGNOL
      const fallbacks = {
        fr: "Quel est ton plus grand rêve pour nous ?",
        en: "What is your biggest dream for us?",
        ht: "Kisa ki pi gwo rèv ou genyen pou nou de a?",
        es: "¿Cuál es tu mayor sueño para nosotros?"
      };
      setQuestion({
        question: fallbacks[langue] || fallbacks['fr'],
        options: ["Option A", "Option B", "Option C", "Option D"]
      });
    } finally {
      setLoading(false);
    }
  };

  const sauvegarderReponse = async (reponseChoisie) => {
    const nouveauScore = points + 10;
    const nouvelleEntree = {
      date: new Date().toLocaleDateString(),
      question: question.question,
      reponse: reponseChoisie
    };

    setPoints(nouveauScore);
    setEtape('menu');

    try {
      await fetch(`${FB_URL}/stats/points.json`, { method: 'PUT', body: JSON.stringify(nouveauScore) });
      await fetch(`${FB_URL}/stats/historique.json`, { 
        method: 'POST', 
        body: JSON.stringify(nouvelleEntree) 
      });
      recupererDonnees();
    } catch (e) { console.log("Erreur sauvegarde"); }
    
    if(Platform.OS !== 'web') Alert.alert("Bravo !", "+10 points.");
  };

  const partager = async () => {
    const msg = `LoveLink ❤️ [${langue.toUpperCase()}] : ${question.question}`;
    if (Platform.OS === 'web') {
      Clipboard.setString(msg);
      alert("Copié dans le presse-papier ! Envoie-le à Milly.");
    } else {
      await Share.share({ message: msg });
    }
  };

  // --- RENDU ---
  if (etape === 'menu') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.logo}>LoveLink 💖</Text>
          <View style={styles.scoreBadge}><Text style={styles.scoreText}>🏆 {points} Points</Text></View>

          <View style={styles.card}>
            <Text style={styles.label}>Idioma / Langue :</Text>
            <View style={styles.row}>
              {langues.map(l => (
                <TouchableOpacity key={l.c} style={[styles.langBtn, langue === l.c && styles.langBtnActive]} onPress={() => setLangue(l.c)}>
                  <Text style={styles.emoji}>{l.f}</Text>
                  <Text style={styles.langText}>{l.n}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Text style={styles.label}>Thème :</Text>
          <View style={styles.grid}>
            {categories.map(c => (
              <TouchableOpacity key={c.n} style={[styles.catCard, categorie === c.n && styles.catCardActive]} onPress={() => setCategorie(c.n)}>
                <Text style={styles.bigEmoji}>{c.e}</Text>
                <Text style={styles.catText}>{c.n}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.mainBtn} onPress={genererQuestion}>
            <Text style={styles.mainBtnText}>EMPIEZA / JOUER</Text>
          </TouchableOpacity>

          {historique.length > 0 && (
            <View style={{width:'100%', marginTop: 20}}>
               <Text style={styles.label}>Dernière réponse :</Text>
               <View style={styles.card}><Text style={styles.histText}>"{historique[0].reponse}"</Text></View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerNav}>
        <TouchableOpacity onPress={() => setEtape('menu')}><Text style={styles.backBtn}>🔙</Text></TouchableOpacity>
        <Text style={styles.headerTitle}>{categorie}</Text>
      </View>
      <View style={styles.content}>
        {loading ? (
          <View style={styles.center}><ActivityIndicator size="large" color="#ff4d4d" /><Text style={styles.loadingText}>Gemini réfléchit...</Text></View>
        ) : (
          <ScrollView>
            <View style={styles.questionCard}><Text style={styles.questionText}>{question?.question}</Text></View>
            {question?.options?.map((opt, i) => (
              <TouchableOpacity key={i} style={styles.optionBtn} onPress={() => sauvegarderReponse(opt)}>
                <Text style={styles.optionText}>{opt}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.shareBtn} onPress={partager}><Text style={styles.shareBtnText}>Partager avec Milly 📲</Text></TouchableOpacity>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fffafa' },
  scroll: { padding: 20, alignItems: 'center' },
  logo: { fontSize: 38, fontWeight: '900', color: '#ff4d4d', marginTop: 10 },
  scoreBadge: { backgroundColor: '#ffe5e5', paddingHorizontal: 15, paddingVertical: 5, borderRadius: 20, marginBottom: 20 },
  scoreText: { color: '#ff4d4d', fontWeight: 'bold' },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 20, width: '100%', marginBottom: 15, elevation: 1 },
  label: { fontWeight: '800', marginBottom: 10, color: '#444', alignSelf: 'flex-start' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  langBtn: { alignItems: 'center', padding: 8, borderRadius: 12, width: '23%' },
  langBtnActive: { backgroundColor: '#fff0f0', borderWidth: 1, borderColor: '#ff4d4d' },
  emoji: { fontSize: 24 },
  langText: { fontSize: 10, marginTop: 5, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', width: '100%' },
  catCard: { width: '48%', backgroundColor: '#fff', padding: 15, borderRadius: 20, alignItems: 'center', marginBottom: 10, borderWidth: 1, borderColor: '#eee' },
  catCardActive: { borderColor: '#ff4d4d', backgroundColor: '#fff5f5' },
  bigEmoji: { fontSize: 35 },
  catText: { fontWeight: '700', marginTop: 5, fontSize: 13 },
  mainBtn: { backgroundColor: '#ff4d4d', padding: 20, borderRadius: 20, width: '100%', alignItems: 'center', marginTop: 10 },
  mainBtnText: { color: '#fff', fontWeight: '900', fontSize: 16 },
  headerNav: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: '#fff' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '800', marginRight: 40 },
  backBtn: { fontSize: 20 },
  content: { flex: 1, padding: 20 },
  questionCard: { backgroundColor: '#fff', padding: 30, borderRadius: 25, marginBottom: 20, elevation: 3 },
  questionText: { fontSize: 22, fontWeight: '800', textAlign: 'center', color: '#1a1a1a' },
  optionBtn: { backgroundColor: '#fff', padding: 18, borderRadius: 15, marginBottom: 10, borderWidth: 1, borderColor: '#eee' },
  optionText: { textAlign: 'center', fontSize: 16, fontWeight: '600' },
  shareBtn: { marginTop: 15, alignItems: 'center' },
  shareBtnText: { color: '#ff4d4d', fontWeight: '800' },
  histText: { fontStyle: 'italic', color: '#666', textAlign: 'center' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 15, color: '#999' }
});
