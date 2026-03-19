import React, { useState, useEffect, useRef } from 'react';
import { 
  View, Text, TouchableOpacity, ScrollView, 
  StyleSheet, SafeAreaView, StatusBar, TextInput,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
  Share, Clipboard
} from 'react-native';

const isWeb = Platform.OS === 'web';

// =============================
// CONFIGURATION
// =============================
const FB_URL = "https://lovelink-a8e75-default-rtdb.firebaseio.com";
const API_URL = "/api/question";

// =============================
// API REST FIREBASE (SIMPLIFIÉ)
// =============================
async function fbSet(path, value) {
  try {
    await fetch(`${FB_URL}/${path}.json`, {
      method: 'PUT',
      body: JSON.stringify(value)
    });
  } catch(e) { console.error(e); }
}

async function fbGet(path) {
  try {
    const res = await fetch(`${FB_URL}/${path}.json`);
    return await res.json();
  } catch(e) { return null; }
}

// =============================
// COMPOSANTS UI
// =============================
const Button = ({ title, onPress, color = '#6366f1', outline = false, icon }) => (
  <TouchableOpacity 
    style={[styles.button, { backgroundColor: outline ? 'transparent' : color, borderColor: color, borderWidth: 2 }]} 
    onPress={onPress}
  >
    <Text style={[styles.buttonText, { color: outline ? color : '#fff' }]}>{icon} {title}</Text>
  </TouchableOpacity>
);

const Card = ({ children }) => <View style={styles.card}>{children}</View>;

// =============================
// APPLICATION PRINCIPALE
// =============================
export default function App() {
  const [etape, setEtape] = useState('menu'); // menu, quiz, resultat, historique
  const [langue, setLangue] = useState('fr');
  const [categorie, setCategorie] = useState('Complicité');
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [points, setPoints] = useState(0);
  const [historique, setHistorique] = useState([]);

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

  // Charger l'historique au démarrage
  useEffect(() => {
    loadHistorique();
  }, []);

  const loadHistorique = async () => {
    const data = await fbGet('historique');
    if (data) setHistorique(Object.values(data).reverse());
  };

  const genererQuestion = async () => {
    setLoading(true);
    setEtape('quiz');
    
    // Questions de secours si l'IA échoue
    const fallback = {
      fr: "Quelle est la chose que tu préfères chez moi ?",
      en: "What is your favorite thing about me?",
      ht: "Kisa ou pi renmen lakay mwen?",
      es: "¿Qué est lo que más te gusta de mí?"
    };

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: categorie, language: langue })
      });

      const data = await response.json();
      
      if (data && data.question) {
        setQuestion(data);
      } else {
        throw new Error("Erreur format");
      }
    } catch (error) {
      console.log("IA indisponible, fallback utilisé");
      setQuestion({
        question: fallback[langue] || fallback['fr'],
        options: ["Option A", "Option B", "Option C", "Option D"]
      });
    } finally {
      setLoading(false);
    }
  };

  const repondre = async (index) => {
    const nouvelleReponse = {
      date: new Date().toLocaleString(),
      question: question.question,
      reponse: question.options[index],
      langue: langue,
      categorie: categorie
    };
    
    setPoints(points + 10);
    await fbSet(`historique/${Date.now()}`, nouvelleReponse);
    loadHistorique();
    setEtape('resultat');
  };

  const partager = async () => {
    try {
      await Share.share({ message: `LoveLink Question : ${question.question}` });
    } catch (e) {}
  };

  // --- ECRANS ---

  if (etape === 'menu') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.logo}>LoveLink 💖</Text>
          <Text style={styles.subtitle}>Renforcez votre complicité</Text>

          <Card>
            <Text style={styles.label}>Langue du jeu :</Text>
            <View style={styles.row}>
              {langues.map(l => (
                <TouchableOpacity 
                  key={l.c} 
                  style={[styles.langBtn, langue === l.c && styles.langBtnActive]}
                  onPress={() => setLangue(l.c)}
                >
                  <Text style={styles.emoji}>{l.f}</Text>
                  <Text style={styles.langText}>{l.n}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          <Text style={styles.label}>Choisissez un thème :</Text>
          <View style={styles.grid}>
            {categories.map(c => (
              <TouchableOpacity 
                key={c.n} 
                style={[styles.catCard, categorie === c.n && styles.catCardActive]}
                onPress={() => setCategorie(c.n)}
              >
                <Text style={styles.bigEmoji}>{c.e}</Text>
                <Text style={styles.catText}>{c.n}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Button title="LANCER LE QUIZ" onPress={genererQuestion} />
          
          <TouchableOpacity onPress={() => setEtape('historique')}>
            <Text style={styles.link}>Voir l'historique des réponses</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (etape === 'quiz') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setEtape('menu')}>
            <Text style={styles.back}>🔙 Menu</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{categorie}</Text>
        </View>

        <View style={styles.content}>
          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator size="large" color="#6366f1" />
              <Text style={styles.loadingText}>Gemini génère une question unique...</Text>
            </View>
          ) : (
            <>
              <Card>
                <Text style={styles.questionText}>{question?.question}</Text>
              </Card>
              <View style={styles.optionsContainer}>
                {question?.options?.map((opt, i) => (
                  <TouchableOpacity key={i} style={styles.optionBtn} onPress={() => repondre(i)}>
                    <Text style={styles.optionText}>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
        </View>
      </SafeAreaView>
    );
  }

  if (etape === 'resultat') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <Text style={styles.bigEmoji}>✨</Text>
          <Text style={styles.logo}>Bravo !</Text>
          <Text style={styles.points}>+10 points de complicité</Text>
          <View style={{ width: '80%', marginTop: 20 }}>
            <Button title="AUTRE QUESTION" onPress={genererQuestion} />
            <Button title="PARTAGER" outline onPress={partager} />
            <TouchableOpacity onPress={() => setEtape('menu')}>
              <Text style={styles.link}>Retour au menu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (etape === 'historique') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setEtape('menu')}>
            <Text style={styles.back}>🔙 Retour</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Historique</Text>
        </View>
        <ScrollView style={styles.scroll}>
          {historique.map((h, i) => (
            <Card key={i}>
              <Text style={styles.histDate}>{h.date} • {h.categorie}</Text>
              <Text style={styles.histQ}>{h.question}</Text>
              <Text style={styles.histR}>✅ {h.reponse}</Text>
            </Card>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }
}

// =============================
// STYLES
// =============================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  scroll: { padding: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  logo: { fontSize: 32, fontWeight: '900', color: '#1e293b', textAlign: 'center', marginTop: 10 },
  subtitle: { fontSize: 16, color: '#64748b', textAlign: 'center', marginBottom: 30 },
  label: { fontSize: 14, fontWeight: '700', color: '#475569', marginBottom: 10, marginTop: 10 },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 20, marginBottom: 15, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
  langBtn: { alignItems: 'center', padding: 10, borderRadius: 12, width: '23%' },
  langBtnActive: { backgroundColor: '#e0e7ff', borderWidth: 1, borderColor: '#6366f1' },
  emoji: { fontSize: 24 },
  langText: { fontSize: 10, color: '#1e293b', marginTop: 5 },
  catCard: { width: '48%', backgroundColor: '#fff', padding: 20, borderRadius: 20, alignItems: 'center', marginBottom: 15, borderWidth: 2, borderColor: 'transparent' },
  catCardActive: { borderColor: '#6366f1', backgroundColor: '#e0e7ff' },
  bigEmoji: { fontSize: 40, marginBottom: 10 },
  catText: { fontWeight: '700', color: '#1e293b' },
  button: { padding: 18, borderRadius: 15, alignItems: 'center', marginTop: 10 },
  buttonText: { fontSize: 16, fontWeight: '800' },
  link: { textAlign: 'center', marginTop: 20, color: '#6366f1', fontWeight: '600' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  headerTitle: { fontSize: 18, fontWeight: '800', marginLeft: 20 },
  back: { color: '#6366f1', fontWeight: '600' },
  questionText: { fontSize: 22, fontWeight: '800', color: '#1e293b', textAlign: 'center', lineHeight: 30 },
  optionsContainer: { padding: 20 },
  optionBtn: { backgroundColor: '#fff', padding: 20, borderRadius: 15, marginBottom: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  optionText: { fontSize: 16, color: '#334155', fontWeight: '600' },
  loadingText: { marginTop: 20, color: '#64748b', textAlign: 'center' },
  points: { fontSize: 18, color: '#22c55e', fontWeight: '700', marginTop: 5 },
  histDate: { fontSize: 10, color: '#94a3b8', marginBottom: 5 },
  histQ: { fontSize: 14, fontWeight: '700', color: '#1e293b' },
  histR: { fontSize: 14, color: '#6366f1', marginTop: 5 }
});
