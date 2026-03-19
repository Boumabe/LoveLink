import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, StatusBar, TextInput,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';

// ══════════════════════════════
//  CONFIG (OPTIMISÉ VERCEL)
// ══════════════════════════════
const FB_URL = "https://lovelink-a8e75-default-rtdb.firebaseio.com";
const API_URL = "/api/question"; // Utilisation de l'URL locale Vercel

// ══════════════════════════════
//  FIREBASE REST API
// ══════════════════════════════
async function fbSet(path, value) {
  try { await fetch(`${FB_URL}/${path}.json`, { method:'PUT', body:JSON.stringify(value) }); } catch(e){}
}
async function fbGet(path) {
  try {
    const r = await fetch(`${FB_URL}/${path}.json`);
    return await r.json();
  } catch(e) { return null; }
}
async function fbPush(path, value) {
  try { await fetch(`${FB_URL}/${path}.json`, { method:'POST', body:JSON.stringify(value) }); } catch(e) {}
}
function fbListen(path, cb, ms=1500) {
  const id = setInterval(async () => { try { cb(await fbGet(path)); } catch(e){} }, ms);
  return () => clearInterval(id);
}

// ══════════════════════════════
//  FALLBACK & TRADUCTIONS
// ══════════════════════════════
const FALLBACK = [
  {e:"💕",t:"Quelle est la chose que tu préfères faire avec moi ?",r:["Parler","Rire","Câlins","Voyager"]},
  {e:"🌙",t:"Quel est le moment où tu penses le plus à moi ?",r:["Matin","Soir","Journée","Tout le temps"]},
];

const T = {
  fr: {
    tagline:'QUIZ DES COUPLES', desc:'Questions générées par IA 💞', jouerCouple:'💑  Jouer en couple →',
    seConnecter:'Se connecter', creerSession:'Créer une session', entrerCode:'ENTRER UN CODE',
    placeholder:'Ex: ABC123', rejoindre:'Rejoindre →', connectes:'Connectés !', attente:'En attente...',
    partagerCode:'Partage ce code :', commencer:'🚀  Choisir le niveau →', retour:'← Retour',
    generating:'✨ L\'IA génère...', choixReponse:'💭 Choisis ta réponse', attentePartner:'⏳ Attente patnè...',
    memeReponse:'💞 Vous pensez pareil !', resume:'Résumé →', sessionTerminee:'Session terminée !', accueil:'← Accueil'
  },
  ht: {
    tagline:'JWÈT KÈ POU KOUP', desc:'Kesyon jenere pa IA 💞', jouerCouple:'💑  Jwe an koup →',
    seConnecter:'Konekte', creerSession:'Kreye sesyon', entrerCode:'ANTRE KÒD LA',
    placeholder:'Egz: ABC123', rejoindre:'Rantre →', connectes:'Konekte!', attente:'Ap tann...',
    partagerCode:'Pataje kòd sa :', commencer:'🚀  Chwazi nivo →', retour:'← Tounen',
    generating:'✨ IA ap kreye...', choixReponse:'💭 Chwazi repons ou', attentePartner:'⏳ Ap tann patnè...',
    memeReponse:'💞 Nou panse menm bagay!', resume:'Rezime →', sessionTerminee:'Sesyon fini!', accueil:'← Akèy'
  }
};

const NIVEAUX = [
  { id:'doux', emoji:'🌸', nom:'Se connaître', couleur:'#10D9A0' },
  { id:'intense', emoji:'🔥', nom:'Intense', couleur:'#F5A623' },
  { id:'coquin', emoji:'🍑', nom:'Coquin 🔞', couleur:'#FF3D6B' },
];

const CATS = ['💕 Complicité', '🌙 Intimité', '✈️ Distance', '🔮 Rêves'];
const genCode = () => Math.random().toString(36).substring(2,8).toUpperCase();

// ══════════════════════════════
//  APP PRINCIPALE
// ══════════════════════════════
export default function App() {
  const [langue, setLangue] = useState(null);
  const [ecran, setEcran] = useState('langue');
  const [session, setSession] = useState(null);
  const [estJ1, setEstJ1] = useState(true);
  const [niveauId, setNiveauId] = useState('doux');
  const [categorieKey, setCategorieKey] = useState(CATS[0]);
  const [q, setQ] = useState(null);
  const [load, setLoad] = useState(false);
  const [num, setNum] = useState(1);

  const t = T[langue] || T.fr;

  // Fonctions de navigation
  const demarrerSession = (code, j1) => { setSession(code); setEstJ1(j1); setEcran('choix'); };

  if (ecran === 'langue') return (
    <SafeAreaView style={s.fond}><View style={s.centre}>
      <Text style={s.bigE}>💞</Text><Text style={s.titre1}>LoveLink</Text>
      <TouchableOpacity style={s.langueBtn} onPress={() => {setLangue('fr'); setEcran('accueil')}}>
        <Text style={{fontSize:28}}>🇫🇷</Text><Text style={s.langueNom}>Français</Text>
      </TouchableOpacity>
      <TouchableOpacity style={s.langueBtn} onPress={() => {setLangue('ht'); setEcran('accueil')}}>
        <Text style={{fontSize:28}}>🇭🇹</Text><Text style={s.langueNom}>Kreyòl</Text>
      </TouchableOpacity>
    </View></SafeAreaView>
  );

  if (ecran === 'accueil') return (
    <SafeAreaView style={s.fond}><View style={s.centre}>
      <Text style={s.bigE}>💞</Text><Text style={s.titre1}>LoveLink</Text>
      <Text style={s.sous}>{t.tagline}</Text><Text style={s.desc}>{t.desc}</Text>
      <TouchableOpacity style={s.btnR} onPress={() => setEcran('connexion')}>
        <Text style={s.btnRT}>{t.jouerCouple}</Text>
      </TouchableOpacity>
    </View></SafeAreaView>
  );

  if (ecran === 'connexion') return (
    <SafeAreaView style={s.fond}><ScrollView contentContainerStyle={s.ecranC}>
      <TouchableOpacity onPress={() => setEcran('accueil')}><Text style={s.retour}>{t.retour}</Text></TouchableOpacity>
      <Text style={s.titre2}>{t.seConnecter}</Text>
      <TouchableOpacity style={s.carteG} onPress={async () => {
        const code = genCode();
        await fbSet(`sessions/${code}`, { j1:'ok', ts:Date.now() });
        demarrerSession(code, true);
      }}>
        <Text style={{fontSize:36}}>🔗</Text><Text style={s.carteN}>{t.creerSession}</Text>
      </TouchableOpacity>
    </ScrollView></SafeAreaView>
  );

  return (
    <SafeAreaView style={s.fond}><View style={s.centre}>
      <Text style={s.titre2}>Prêt pour le Quiz</Text>
      <TouchableOpacity style={s.btnR} onPress={() => setEcran('langue')}>
        <Text style={s.btnRT}>{t.accueil}</Text>
      </TouchableOpacity>
    </View></SafeAreaView>
  );
}

// ══════════════════════════════
//  STYLES (TON DESIGN ORIGINAL)
// ══════════════════════════════
const s = StyleSheet.create({
  fond:{ flex:1, backgroundColor:'#0E0A14' },
  centre:{ flex:1, alignItems:'center', justifyContent:'center', padding:28 },
  ecranC:{ padding:20, alignItems:'center' },
  bigE:{ fontSize:64, marginBottom:8 },
  titre1:{ fontSize:42, fontWeight:'800', color:'#F9F2E7', letterSpacing:-1, marginBottom:4 },
  titre2:{ fontSize:24, fontWeight:'700', color:'#F9F2E7', marginBottom:12, textAlign:'center' },
  sous:{ fontSize:11, letterSpacing:3, color:'#F5A623', marginBottom:20, textAlign:'center' },
  desc:{ fontSize:14, color:'rgba(249,242,231,0.5)', textAlign:'center', lineHeight:22, marginBottom:20, maxWidth:300 },
  langueBtn:{ flexDirection:'row', alignItems:'center', gap:14, backgroundColor:'rgba(255,255,255,0.05)', borderWidth:1, borderColor:'rgba(255,255,255,0.1)', borderRadius:16, padding:16, width:Platform.OS==='web'?300:'100%', marginBottom:10 },
  langueNom:{ fontSize:18, fontWeight:'600', color:'#F9F2E7' },
  btnR:{ backgroundColor:'#FF3D6B', borderRadius:50, paddingVertical:16, paddingHorizontal:32, width:Platform.OS==='web'?300:'100%', alignItems:'center' },
  btnRT:{ color:'white', fontSize:15, fontWeight:'600' },
  retour:{ color:'rgba(249,242,231,0.5)', fontSize:15, marginBottom:16 },
  carteG:{ backgroundColor:'rgba(255,255,255,0.05)', borderWidth:1, borderColor:'rgba(255,255,255,0.1)', borderRadius:20, padding:24, width:'100%', alignItems:'center' },
  carteN:{ fontSize:16, fontWeight:'600', color:'#F9F2E7', marginTop:8 }
});
