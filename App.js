import { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, StatusBar, TextInput,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';

// ══════════════════════════════
//  CONFIG
// ══════════════════════════════
const FB_URL = "https://lovelink-a8e75-default-rtdb.firebaseio.com";
const API_URL = "https://lovelink-api-jw65.onrender.com";

// ══════════════════════════════
//  FIREBASE REST API
// ══════════════════════════════
async function fbSet(path, value) {
  await fetch(`${FB_URL}/${path}.json`, { method:'PUT', body:JSON.stringify(value) });
}
async function fbGet(path) {
  const r = await fetch(`${FB_URL}/${path}.json`);
  return await r.json();
}
async function fbPush(path, value) {
  await fetch(`${FB_URL}/${path}.json`, { method:'POST', body:JSON.stringify(value) });
}
function fbListen(path, cb, ms=1500) {
  const id = setInterval(async () => { try { cb(await fbGet(path)); } catch(e){} }, ms);
  return () => clearInterval(id);
}

// ══════════════════════════════
//  QUESTIONS FALLBACK (si IA hors ligne)
// ══════════════════════════════
const FALLBACK = [
  {e:"💕",t:"Quelle est la chose que tu préfères faire avec moi ?",r:["Parler pendant des heures","Rire aux éclats","Se faire des câlins","Regarder des films ensemble"]},
  {e:"🌙",t:"Quel est le moment où tu penses le plus à moi ?",r:["Le matin au réveil","Le soir avant de dormir","Pendant une journée difficile","À tout moment"]},
  {e:"✈️",t:"Comment tu gères les jours où la distance est difficile ?",r:["Je relis nos messages","Je t'écris un long message","Je pense à nos retrouvailles","Je m'occupe en pensant à toi"]},
  {e:"🔮",t:"Comment tu imagines notre vie dans 5 ans ?",r:["Ensemble dans notre maison","En voyage quelque part","Une belle vie construite","Heureux peu importe où"]},
  {e:"😂",t:"Si tu devais me donner un surnom ridicule, ce serait ?",r:["Mon poussin d'amour","Mon gros nounours","Mon petit cactus","Mon extra-terrestre préféré"]},
  {e:"🌱",t:"Quelle valeur est la plus importante dans notre relation ?",r:["La confiance","L'honnêteté","Le respect","La communication"]},
  {e:"💋",t:"Quelle est la première chose que tu as remarquée chez moi ?",r:["Tes yeux","Ton sourire","Ta façon de parler","Ton énergie"]},
  {e:"🏠",t:"Comment tu imagines notre future famille ?",r:["Chaleureuse et unie","Ouverte et communicative","Simple et aimante","À notre image"]},
  {e:"🧳",t:"Quel voyage tu rêves de faire avec moi en premier ?",r:["Un endroit qu'on rêve de voir","Ton pays","Un endroit romantique","N'importe où ensemble"]},
  {e:"💞",t:"Dans quel moment tu te sens le plus proche de moi ?",r:["Quand on se raconte tout","Quand on rit ensemble","Quand on se comprend sans mots","Quand on surmonte quelque chose"]},
];

// ══════════════════════════════
//  GÉNÉRATION IA VIA RENDER
// ══════════════════════════════
async function genererQuestion(langue, categorie, niveau, historique = []) {
  try {
    const response = await fetch(`${API_URL}/question`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ langue, categorie, niveau, historique })
    });
    const data = await response.json();
    if (data.ok && data.question) return data.question;
    throw new Error('IA indisponible');
  } catch(e) {
    const used = historique.slice(-10);
    const dispo = FALLBACK.filter(q => !used.includes(q.t));
    const pool = dispo.length > 0 ? dispo : FALLBACK;
    return pool[Math.floor(Math.random() * pool.length)];
  }
}

// ══════════════════════════════
//  HISTORIQUE ANTI-RÉPÉTITION
// ══════════════════════════════
async function getHistorique(sessionCode) {
  try {
    const d = await fbGet(`sessions/${sessionCode}/historique`);
    return d ? Object.values(d) : [];
  } catch(e) { return []; }
}

async function ajouterHistorique(sessionCode, texte) {
  try { await fbPush(`sessions/${sessionCode}/historique`, texte); } catch(e) {}
}

// ══════════════════════════════
//  LANGUES & TRADUCTIONS
// ══════════════════════════════
const LANGUES = [
  { id:'fr', drapeau:'🇫🇷', nom:'Français' },
  { id:'en', drapeau:'🇬🇧', nom:'English' },
  { id:'es', drapeau:'🇪🇸', nom:'Español' },
  { id:'ht', drapeau:'🇭🇹', nom:'Kreyòl Ayisyen' },
];

const T = {
  fr: {
    tagline:'QUIZ DES COUPLES',
    desc:'Questions générées par IA 💞\nDans votre langue, à l\'infini 🔥',
    jouerCouple:'💑  Jouer en couple →',
    seConnecter:'Se connecter', creerSession:'Créer une session',
    creerDesc:'Génère un code pour inviter ton partenaire',
    entrerCode:'ENTRER UN CODE', placeholder:'Ex: ABC123', rejoindre:'Rejoindre →',
    connectes:'Connectés !', attente:'En attente...',
    partagerCode:'Partage ce code à ton partenaire :',
    commencer:'🚀  Choisir le niveau →', retour:'← Retour',
    choisirEnsemble:'Choisissez ensemble 💞',
    niveauIntensite:"NIVEAU D'INTENSITÉ", categorie:'CATÉGORIE',
    lancerQuiz:'🚀 Lancer le quiz →',
    partnerChoosing:'Ton partenaire choisit\nle niveau...',
    generating:'✨ L\'IA génère une question...',
    choixReponse:'💭 Choisis ta réponse',
    attentePartner:'⏳ En attente de ton partenaire...',
    memeReponse:'💞 Vous pensez pareil !', parlezEnsemble:'🗣️ Parlez-en ensemble !',
    complicite:'Belle complicité 💕', differences:'Vos différences vous enrichissent ✨',
    questionSuivante:'Question suivante →', resume:'Résumé →',
    sessionTerminee:'Session terminée !', questionsExplo:'questions explorées ensemble 🥰',
    continuer:'CONTINUER AVEC UN AUTRE NIVEAU ?', accueil:'← Accueil',
    autreReponse:'✏️ Ma propre réponse', valider:'Valider →', ecrireTa:'Écris ta réponse...',
    iaActif:'🤖 IA active — questions infinies', iaNonDispo:'📚 Mode hors ligne',
  },
  en: {
    tagline:'COUPLES QUIZ',
    desc:'AI-generated questions 💞\nIn your language, forever 🔥',
    jouerCouple:'💑  Play as a couple →',
    seConnecter:'Connect', creerSession:'Create a session',
    creerDesc:'Generate a code to invite your partner',
    entrerCode:'ENTER A CODE', placeholder:'Ex: ABC123', rejoindre:'Join →',
    connectes:'Connected!', attente:'Waiting...',
    partagerCode:'Share this code with your partner:',
    commencer:'🚀  Choose level →', retour:'← Back',
    choisirEnsemble:'Choose together 💞',
    niveauIntensite:'INTENSITY LEVEL', categorie:'CATEGORY',
    lancerQuiz:'🚀 Start quiz →',
    partnerChoosing:'Your partner is choosing\nthe level...',
    generating:'✨ AI is generating a question...',
    choixReponse:'💭 Choose your answer',
    attentePartner:'⏳ Waiting for your partner...',
    memeReponse:'💞 You think alike!', parlezEnsemble:'🗣️ Talk about it together!',
    complicite:'Great connection 💕', differences:'Your differences enrich you ✨',
    questionSuivante:'Next question →', resume:'Summary →',
    sessionTerminee:'Session complete!', questionsExplo:'questions explored together 🥰',
    continuer:'CONTINUE WITH ANOTHER LEVEL?', accueil:'← Home',
    autreReponse:'✏️ My own answer', valider:'Submit →', ecrireTa:'Write your answer...',
    iaActif:'🤖 AI active — infinite questions', iaNonDispo:'📚 Offline mode',
  },
  es: {
    tagline:'QUIZ DE PAREJAS',
    desc:'Preguntas generadas por IA 💞\nEn tu idioma, infinitas 🔥',
    jouerCouple:'💑  Jugar en pareja →',
    seConnecter:'Conectarse', creerSession:'Crear sesión',
    creerDesc:'Genera un código para invitar a tu pareja',
    entrerCode:'INGRESAR CÓDIGO', placeholder:'Ej: ABC123', rejoindre:'Unirse →',
    connectes:'¡Conectados!', attente:'Esperando...',
    partagerCode:'Comparte este código con tu pareja:',
    commencer:'🚀  Elegir nivel →', retour:'← Volver',
    choisirEnsemble:'Elijan juntos 💞',
    niveauIntensite:'NIVEL DE INTENSIDAD', categorie:'CATEGORÍA',
    lancerQuiz:'🚀 Iniciar quiz →',
    partnerChoosing:'Tu pareja está eligiendo\nel nivel...',
    generating:'✨ La IA genera una pregunta...',
    choixReponse:'💭 Elige tu respuesta',
    attentePartner:'⏳ Esperando a tu pareja...',
    memeReponse:'💞 ¡Piensan igual!', parlezEnsemble:'🗣️ ¡Háblalo juntos!',
    complicite:'Gran complicidad 💕', differences:'Sus diferencias los enriquecen ✨',
    questionSuivante:'Siguiente pregunta →', resume:'Resumen →',
    sessionTerminee:'¡Sesión terminada!', questionsExplo:'preguntas exploradas juntos 🥰',
    continuer:'¿CONTINUAR CON OTRO NIVEL?', accueil:'← Inicio',
    autreReponse:'✏️ Mi propia respuesta', valider:'Enviar →', ecrireTa:'Escribe tu respuesta...',
    iaActif:'🤖 IA activa — preguntas infinitas', iaNonDispo:'📚 Modo sin conexión',
  },
  ht: {
    tagline:'JWÈT KÈ POU KOUP',
    desc:'Kesyon jenere pa IA 💞\nNan lang ou, san limit 🔥',
    jouerCouple:'💑  Jwe an koup →',
    seConnecter:'Konekte', creerSession:'Kreye sesyon',
    creerDesc:'Jenere yon kòd pou envite patnè ou',
    entrerCode:'ANTRE KÒD LA', placeholder:'Egz: ABC123', rejoindre:'Rantre →',
    connectes:'Konekte!', attente:'Ap tann...',
    partagerCode:'Pataje kòd sa ak patnè ou:',
    commencer:'🚀  Chwazi nivo →', retour:'← Tounen',
    choisirEnsemble:'Chwazi ansanm 💞',
    niveauIntensite:'NIVO ENTANSITE', categorie:'KATEGORI',
    lancerQuiz:'🚀 Kòmanse jwèt →',
    partnerChoosing:'Patnè ou ap chwazi\nnivo a...',
    generating:'✨ IA ap kreye yon kesyon...',
    choixReponse:'💭 Chwazi repons ou',
    attentePartner:'⏳ Ap tann patnè ou...',
    memeReponse:'💞 Nou panse menm bagay!', parlezEnsemble:'🗣️ Pale sou li ansanm!',
    complicite:'Bèl konplisite 💕', differences:'Diferans nou yo fè nou pi rich ✨',
    questionSuivante:'Pwochen kesyon →', resume:'Rezime →',
    sessionTerminee:'Sesyon fini!', questionsExplo:'kesyon eksplore ansanm 🥰',
    continuer:'KONTINYE AK YON LÒT NIVO?', accueil:'← Akèy',
    autreReponse:'✏️ Repons pa mwen', valider:'Voye →', ecrireTa:'Ekri repons ou...',
    iaActif:'🤖 IA aktif — kesyon san limit', iaNonDispo:'📚 Mòd san entènèt',
  },
};

const NIVEAUX = {
  fr: [
    { id:'doux',    emoji:'🌸', nom:'Se connaître',  desc:'Questions douces et tendres',          couleur:'#10D9A0' },
    { id:'intense', emoji:'🔥', nom:'Intense',        desc:"Mettre le couple à l'épreuve",          couleur:'#F5A623' },
    { id:'dark',    emoji:'🌑', nom:'Dark',           desc:'Questions sombres et philosophiques',   couleur:'#7C3AED' },
    { id:'coquin',  emoji:'🍑', nom:'Coquin 🔞',     desc:'Sexuel et intense — adultes seulement', couleur:'#FF3D6B' },
  ],
  en: [
    { id:'doux',    emoji:'🌸', nom:'Get to know',   desc:'Sweet and tender questions',            couleur:'#10D9A0' },
    { id:'intense', emoji:'🔥', nom:'Intense',        desc:'Put the couple to the test',            couleur:'#F5A623' },
    { id:'dark',    emoji:'🌑', nom:'Dark',           desc:'Dark and philosophical questions',      couleur:'#7C3AED' },
    { id:'coquin',  emoji:'🍑', nom:'Naughty 🔞',    desc:'Sexual and intense — adults only',      couleur:'#FF3D6B' },
  ],
  es: [
    { id:'doux',    emoji:'🌸', nom:'Conocerse',      desc:'Preguntas dulces y tiernas',            couleur:'#10D9A0' },
    { id:'intense', emoji:'🔥', nom:'Intenso',        desc:'Poner la pareja a prueba',              couleur:'#F5A623' },
    { id:'dark',    emoji:'🌑', nom:'Oscuro',         desc:'Preguntas oscuras y filosóficas',       couleur:'#7C3AED' },
    { id:'coquin',  emoji:'🍑', nom:'Picante 🔞',    desc:'Sexual e intenso — solo adultos',       couleur:'#FF3D6B' },
  ],
  ht: [
    { id:'doux',    emoji:'🌸', nom:'Konnen youn lòt',desc:'Kesyon dou ak tandr',                  couleur:'#10D9A0' },
    { id:'intense', emoji:'🔥', nom:'Entans',          desc:'Mete koup la à leprèv',               couleur:'#F5A623' },
    { id:'dark',    emoji:'🌑', nom:'Nwa',             desc:'Kesyon fon ak filozofik',              couleur:'#7C3AED' },
    { id:'coquin',  emoji:'🍑', nom:'Koken 🔞',       desc:'Seksyèl — granmoun sèlman',           couleur:'#FF3D6B' },
  ],
};

const CATS = {
  fr: ['💕 Complicité','🌙 Intimité','✈️ Distance','🔮 Rêves futurs','😂 Humour','🌱 Valeurs','💋 Séduction','🏠 Famille','🧳 Aventure'],
  en: ['💕 Complicity','🌙 Intimacy','✈️ Distance','🔮 Future dreams','😂 Humor','🌱 Values','💋 Seduction','🏠 Family','🧳 Adventure'],
  es: ['💕 Complicidad','🌙 Intimidad','✈️ Distancia','🔮 Sueños futuros','😂 Humor','🌱 Valores','💋 Seducción','🏠 Familia','🧳 Aventura'],
  ht: ['💕 Konplisite','🌙 Entimite','✈️ Distans','🔮 Rèv pou demen','😂 Imè','🌱 Valè','💋 Sediksyon','🏠 Fanmi','🧳 Avanti'],
};

const LETTRES = ['A','B','C','D'];
const genCode = () => Math.random().toString(36).substring(2,8).toUpperCase();

// ══════════════════════════════
//  ÉCRANS
// ══════════════════════════════
function ChoixLangue({ onChoisir }) {
  return (
    <View style={s.centre}>
      <Text style={s.bigE}>💞</Text>
      <Text style={s.titre1}>LoveLink</Text>
      <Text style={[s.sous,{marginBottom:30}]}>Choose your language · Choisissez</Text>
      {LANGUES.map(l => (
        <TouchableOpacity key={l.id} style={s.langueBtn} onPress={() => onChoisir(l.id)}>
          <Text style={{fontSize:28}}>{l.drapeau}</Text>
          <Text style={s.langueNom}>{l.nom}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function Accueil({ t, onCouple, onChangerLangue }) {
  const [iaOk, setIaOk] = useState(null);
  useEffect(() => {
    fetch(`${API_URL}/`).then(r => setIaOk(r.ok)).catch(() => setIaOk(false));
  }, []);

  return (
    <View style={s.centre}>
      <TouchableOpacity style={s.langueTag} onPress={onChangerLangue}>
        <Text style={s.langueTagTxt}>🌍 Langue</Text>
      </TouchableOpacity>
      <Text style={s.bigE}>💞</Text>
      <Text style={s.titre1}>LoveLink</Text>
      <Text style={s.sous}>{t.tagline}</Text>
      <Text style={s.desc}>{t.desc}</Text>
      {iaOk !== null && (
        <View style={[s.iaBadge,{
          backgroundColor: iaOk?'rgba(16,217,160,0.1)':'rgba(245,166,35,0.1)',
          borderColor: iaOk?'rgba(16,217,160,0.4)':'rgba(245,166,35,0.4)'
        }]}>
          <Text style={{color:iaOk?'#10D9A0':'#F5A623',fontSize:12}}>
            {iaOk ? t.iaActif : t.iaNonDispo}
          </Text>
        </View>
      )}
      <TouchableOpacity style={s.btnR} onPress={onCouple}>
        <Text style={s.btnRT}>{t.jouerCouple}</Text>
      </TouchableOpacity>
    </View>
  );
}

function Connexion({ t, onRetour, onDemarrer }) {
  const [mode, setMode] = useState(null);
  const [code, setCode] = useState('');
  const [monCode] = useState(genCode());
  const [connecte, setConnecte] = useState(false);
  const unsubRef = useRef(null);

  async function creer() {
    setMode('creer');
    await fbSet(`sessions/${monCode}`, { j1:'ok', j2:null, ts:Date.now() });
    unsubRef.current = fbListen(`sessions/${monCode}/j2`, val => {
      if (val === 'ok') { setConnecte(true); if (unsubRef.current) unsubRef.current(); }
    });
  }
  async function rejoindre() {
    if (code.length < 4) { Alert.alert('!', 'Entre le code de ton partenaire'); return; }
    await fbSet(`sessions/${code}/j2`, 'ok');
    onDemarrer(code, false);
  }
  useEffect(() => () => { if (unsubRef.current) unsubRef.current(); }, []);

  if (mode === 'creer') return (
    <View style={s.centre}>
      <Text style={s.bigE}>{connecte ? '🎉' : '⏳'}</Text>
      <Text style={s.titre2}>{connecte ? t.connectes : t.attente}</Text>
      {!connecte && <>
        <Text style={s.desc}>{t.partagerCode}</Text>
        <View style={s.codeBox}><Text style={s.codeTxt}>{monCode}</Text></View>
        <ActivityIndicator color="#FF3D6B" size="large" style={{marginTop:16}}/>
      </>}
      {connecte && <TouchableOpacity style={s.btnR} onPress={() => onDemarrer(monCode, true)}>
        <Text style={s.btnRT}>{t.commencer}</Text>
      </TouchableOpacity>}
      <TouchableOpacity style={[s.btnV,{marginTop:20}]} onPress={onRetour}>
        <Text style={s.btnVT}>{t.retour}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={s.ecran} contentContainerStyle={s.ecranC}>
      <TouchableOpacity onPress={onRetour}><Text style={s.retour}>{t.retour}</Text></TouchableOpacity>
      <Text style={s.titre2}>{t.seConnecter}</Text>
      <TouchableOpacity style={s.carteG} onPress={creer}>
        <Text style={{fontSize:36}}>🔗</Text>
        <Text style={s.carteN}>{t.creerSession}</Text>
        <Text style={s.carteD}>{t.creerDesc}</Text>
      </TouchableOpacity>
      <View style={s.sep}><View style={s.ligne}/><Text style={s.ou}>OU</Text><View style={s.ligne}/></View>
      <View style={s.joinBox}>
        <Text style={s.label}>{t.entrerCode}</Text>
        <TextInput style={s.input} placeholder={t.placeholder} placeholderTextColor="rgba(249,242,231,0.3)"
          value={code} onChangeText={v => setCode(v.toUpperCase())} maxLength={6} autoCapitalize="characters"/>
        <TouchableOpacity style={s.btnR} onPress={rejoindre}>
          <Text style={s.btnRT}>{t.rejoindre}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function ChoixNiveau({ t, langue, sessionCode, estJ1, onDemarrer }) {
  const [niveau, setNiveau] = useState(null);
  const [categorie, setCategorie] = useState(null);
  const niveaux = NIVEAUX[langue] || NIVEAUX.fr;
  const cats = CATS[langue] || CATS.fr;
  const unsubRef = useRef(null);

  useEffect(() => {
    if (!estJ1) {
      unsubRef.current = fbListen(`sessions/${sessionCode}/config`, val => {
        if (val?.niveau && val?.categorie && val?.confirme) {
          onDemarrer(val.niveau, val.categorie);
          if (unsubRef.current) unsubRef.current();
        }
      });
      return () => { if (unsubRef.current) unsubRef.current(); };
    }
  }, []);

  async function confirmer() {
    if (!niveau || !categorie) { Alert.alert('!', 'Choisissez un niveau et une catégorie'); return; }
    await fbSet(`sessions/${sessionCode}/config`, { niveau: niveau.id, categorie, confirme: true });
    onDemarrer(niveau.id, categorie);
  }

  if (!estJ1) return (
    <View style={s.centre}>
      <Text style={s.bigE}>⏳</Text>
      <Text style={s.titre2}>{t.partnerChoosing}</Text>
      <ActivityIndicator color="#FF3D6B" size="large" style={{marginTop:20}}/>
    </View>
  );

  return (
    <ScrollView style={s.ecran} contentContainerStyle={s.ecranC}>
      <Text style={[s.titre2,{marginTop:10}]}>{t.choisirEnsemble}</Text>
      <Text style={s.label}>{t.niveauIntensite}</Text>
      <View style={{gap:10,marginBottom:20}}>
        {niveaux.map(n => (
          <TouchableOpacity key={n.id}
            style={[s.niveauCard, niveau?.id===n.id && {borderColor:n.couleur,backgroundColor:`${n.couleur}15`}]}
            onPress={() => setNiveau(n)}>
            <View style={{flexDirection:'row',alignItems:'center',gap:12}}>
              <Text style={{fontSize:32}}>{n.emoji}</Text>
              <View style={{flex:1}}>
                <Text style={[s.niveauNom, niveau?.id===n.id && {color:n.couleur}]}>{n.nom}</Text>
                <Text style={s.niveauDesc}>{n.desc}</Text>
              </View>
              {niveau?.id===n.id && <Text style={{color:n.couleur,fontSize:20}}>✓</Text>}
            </View>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={s.label}>{t.categorie}</Text>
      <View style={{flexDirection:'row',flexWrap:'wrap',gap:10,marginBottom:24}}>
        {cats.map(c => {
          const actif = categorie === c;
          const parts = c.split(' ');
          const emoji = parts[0];
          const nom = parts.slice(1).join(' ');
          return (
            <TouchableOpacity key={c} style={[s.catPill, actif && s.catPillActif]} onPress={() => setCategorie(c)}>
              <Text style={{fontSize:20}}>{emoji}</Text>
              <Text style={[s.catNom, actif && {color:'#F9F2E7'}]}>{nom}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <TouchableOpacity style={[s.btnR, (!niveau||!categorie) && {opacity:0.4}]} onPress={confirmer}>
        <Text style={s.btnRT}>{t.lancerQuiz}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Quiz({ t, langue, sessionCode, estJ1, niveauId, categorieKey, onFin }) {
  const [q, setQ] = useState(null);
  const [load, setLoad] = useState(true);
  const [choisi, setChoisi] = useState(null);
  const [choixP, setChoixP] = useState(null);
  const [num, setNum] = useState(1);
  const [modePerso, setModePerso] = useState(false);
  const [reponsePerso, setReponsePerso] = useState('');
  const unsubRef = useRef(null);

  const maCle = estJ1 ? 'rep1' : 'rep2';
  const pCle  = estJ1 ? 'rep2' : 'rep1';
  const niveaux = NIVEAUX[langue] || NIVEAUX.fr;
  const niveau = niveaux.find(n => n.id === niveauId) || niveaux[0];

  useEffect(() => {
    setLoad(true); setChoisi(null); setChoixP(null);
    setModePerso(false); setReponsePerso('');
    if (unsubRef.current) unsubRef.current();
    unsubRef.current = fbListen(`sessions/${sessionCode}/q${num}/${pCle}`, val => {
      if (val !== null && val !== undefined) setChoixP(val);
    });
    charger();
    return () => { if (unsubRef.current) unsubRef.current(); };
  }, [num]);

  async function charger() {
    if (estJ1) {
      const historique = await getHistorique(sessionCode);
      const question = await genererQuestion(langue, categorieKey, niveauId, historique);
      await ajouterHistorique(sessionCode, question.t);
      await fbSet(`sessions/${sessionCode}/questions/q${num}`, question);
      setQ(question); setLoad(false);
    } else {
      let attempts = 0;
      const poll = setInterval(async () => {
        attempts++;
        const val = await fbGet(`sessions/${sessionCode}/questions/q${num}`);
        if (val) { setQ(val); setLoad(false); clearInterval(poll); }
        if (attempts > 40) clearInterval(poll);
      }, 1500);
    }
  }

  async function choisir(index, textePerso = null) {
    if (choisi !== null) return;
    const valeur = textePerso ? `perso:${textePerso}` : index;
    setChoisi(valeur);
    await fbSet(`sessions/${sessionCode}/q${num}/${maCle}`, valeur);
    setModePerso(false);
  }

  async function validerPerso() {
    if (!reponsePerso.trim()) return;
    await choisir(4, reponsePerso.trim());
  }

  const lesDeux = choisi !== null && choixP !== null;
  const memeReponse = lesDeux && choisi === choixP;

  if (load || !q) return (
    <View style={s.centre}>
      <ActivityIndicator color={niveau.couleur} size="large"/>
      <Text style={[s.desc,{marginTop:16}]}>{t.generating}</Text>
      <Text style={{color:'rgba(249,242,231,0.2)',fontSize:11,marginTop:8}}>
        🤖 {langue === 'fr' ? 'français' : langue === 'en' ? 'English' : langue === 'es' ? 'español' : 'kreyòl'}...
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':'height'}>
      <ScrollView style={s.ecran} contentContainerStyle={s.ecranC}>
        <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
          <View style={[s.niveauBadge,{borderColor:`${niveau.couleur}50`,backgroundColor:`${niveau.couleur}15`}]}>
            <Text style={{fontSize:12}}>{niveau.emoji}</Text>
            <Text style={[s.niveauBadgeTxt,{color:niveau.couleur}]}>{niveau.nom}</Text>
          </View>
          <TouchableOpacity onPress={() => onFin(num)} style={s.btnFin}>
            <Text style={s.btnFinT}>{t.resume}</Text>
          </TouchableOpacity>
        </View>

        <Text style={{color:'rgba(249,242,231,0.3)',fontSize:11,marginBottom:14,textAlign:'center'}}>
          Q{num} · {categorieKey}
        </Text>

        <View style={[s.carteQ,{borderColor:`${niveau.couleur}30`}]}>
          <Text style={{fontSize:46,marginBottom:8}}>{q.e}</Text>
          <Text style={{color:'#F9F2E7',fontSize:18,fontWeight:'600',textAlign:'center',lineHeight:28}}>{q.t}</Text>
        </View>

        {!modePerso && (
          <View style={{gap:9,marginBottom:10}}>
            {(q.r||[]).map((r, i) => {
              let st = [s.repN];
              if (lesDeux && choisi===i && choixP===i) st=[s.repN,s.repM];
              else if (choisi===i) st=[s.repN,s.repC];
              else if (lesDeux && choixP===i) st=[s.repN,s.repP];
              return (
                <TouchableOpacity key={i} style={st} onPress={() => choisir(i)} disabled={choisi!==null}>
                  <View style={[s.lettre, choisi===i && {backgroundColor:niveau.couleur,borderColor:niveau.couleur}]}>
                    <Text style={{color:'#F9F2E7',fontSize:11,fontWeight:'700'}}>{LETTRES[i]}</Text>
                  </View>
                  <Text style={{color:'#F9F2E7',fontSize:14,flex:1,lineHeight:20}}>{r}</Text>
                  {lesDeux && choixP===i && <Text style={{fontSize:16}}>👩</Text>}
                </TouchableOpacity>
              );
            })}
            {choisi===null && (
              <TouchableOpacity
                style={[s.repN,{borderColor:'rgba(245,166,35,0.4)',backgroundColor:'rgba(245,166,35,0.06)'}]}
                onPress={() => setModePerso(true)}>
                <View style={[s.lettre,{borderColor:'rgba(245,166,35,0.4)'}]}>
                  <Text style={{color:'#F5A623',fontSize:14}}>✏️</Text>
                </View>
                <Text style={{color:'#F5A623',fontSize:14,flex:1}}>{t.autreReponse}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {modePerso && choisi===null && (
          <View style={s.persoBox}>
            <TextInput style={s.persoInput} placeholder={t.ecrireTa}
              placeholderTextColor="rgba(249,242,231,0.3)" value={reponsePerso}
              onChangeText={setReponsePerso} multiline autoFocus/>
            <View style={{flexDirection:'row',gap:10,marginTop:10}}>
              <TouchableOpacity style={[s.btnV,{flex:1,marginTop:0}]} onPress={() => setModePerso(false)}>
                <Text style={s.btnVT}>← Retour</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.btnR,{flex:1,marginBottom:0}]} onPress={validerPerso}>
                <Text style={s.btnRT}>{t.valider}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {choisi!==null && typeof choisi==='string' && choisi.startsWith('perso:') && (
          <View style={[s.repN,s.repC,{marginBottom:10}]}>
            <Text style={{color:'#F9F2E7',fontSize:14,flex:1}}>✏️ {choisi.replace('perso:','')}</Text>
          </View>
        )}
        {lesDeux && typeof choixP==='string' && choixP.startsWith('perso:') && (
          <View style={[s.repN,s.repP,{marginBottom:10}]}>
            <Text style={{color:'#F9F2E7',fontSize:14,flex:1}}>👩 ✏️ {choixP.replace('perso:','')}</Text>
          </View>
        )}

        {!lesDeux && (
          <View style={s.msgBox}>
            <Text style={s.msgTxt}>{choisi===null ? t.choixReponse : t.attentePartner}</Text>
          </View>
        )}

        {lesDeux && (
          <View style={[s.msgBox,{
            borderColor:memeReponse?'rgba(16,217,160,0.4)':'rgba(245,166,35,0.4)',
            backgroundColor:memeReponse?'rgba(16,217,160,0.08)':'rgba(245,166,35,0.08)'
          }]}>
            <Text style={[s.msgTxt,{color:memeReponse?'#10D9A0':'#F5A623',fontWeight:'700',fontSize:15}]}>
              {memeReponse ? t.memeReponse : t.parlezEnsemble}
            </Text>
            <Text style={[s.msgTxt,{marginTop:6,fontSize:12}]}>
              {memeReponse ? t.complicite : t.differences}
            </Text>
          </View>
        )}

        {lesDeux && (
          <TouchableOpacity style={[s.btnR,{marginTop:16,backgroundColor:niveau.couleur}]} onPress={() => setNum(n => n+1)}>
            <Text style={s.btnRT}>{t.questionSuivante}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Resume({ t, langue, nombreQ, onChanger, onAccueil }) {
  const niveaux = NIVEAUX[langue] || NIVEAUX.fr;
  return (
    <ScrollView style={s.ecran} contentContainerStyle={[s.ecranC,{alignItems:'center'}]}>
      <Text style={[s.bigE,{marginTop:20}]}>💞</Text>
      <Text style={s.titre2}>{t.sessionTerminee}</Text>
      <Text style={s.desc}>{nombreQ} {t.questionsExplo}</Text>
      <View style={s.messageFinal}>
        <Text style={{fontSize:32,marginBottom:12}}>💌</Text>
        <Text style={{color:'#F9F2E7',fontSize:15,textAlign:'center',lineHeight:24,fontWeight:'500'}}>
          Chaque question vous rapproche,{'\n'}même à des milliers de kilomètres. 💕
        </Text>
      </View>
      <Text style={[s.label,{marginBottom:12}]}>{t.continuer}</Text>
      {niveaux.map(n => (
        <TouchableOpacity key={n.id} style={[s.btnR,{backgroundColor:n.couleur,marginBottom:10}]} onPress={() => onChanger(n.id)}>
          <Text style={s.btnRT}>{n.emoji} {n.nom}</Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity style={s.btnV} onPress={onAccueil}>
        <Text style={s.btnVT}>{t.accueil}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ══════════════════════════════
//  APP PRINCIPALE
// ══════════════════════════════
export default function App() {
  const [langue, setLangue] = useState(null);
  const [ecran, setEcran] = useState('langue');
  const [session, setSession] = useState(null);
  const [estJ1, setEstJ1] = useState(true);
  const [niveauId, setNiveauId] = useState('doux');
  const [categorieKey, setCategorieKey] = useState('');
  const [nombreQ, setNombreQ] = useState(0);

  const t = T[langue] || T.fr;

  return (
    <SafeAreaView style={s.fond}>
      <StatusBar barStyle="light-content" backgroundColor="#0E0A14"/>
      {ecran==='langue'    && <ChoixLangue onChoisir={l => { setLangue(l); setEcran('accueil'); }}/>}
      {ecran==='accueil'   && <Accueil t={t} onCouple={() => setEcran('connexion')} onChangerLangue={() => setEcran('langue')}/>}
      {ecran==='connexion' && <Connexion t={t} onRetour={() => setEcran('accueil')} onDemarrer={(code, j1) => { setSession(code); setEstJ1(j1); setEcran('choix'); }}/>}
      {ecran==='choix'     && <ChoixNiveau t={t} langue={langue} sessionCode={session} estJ1={estJ1} onDemarrer={(niv, cat) => { setNiveauId(niv); setCategorieKey(cat); setEcran('quiz'); }}/>}
      {ecran==='quiz'      && <Quiz t={t} langue={langue} sessionCode={session} estJ1={estJ1} niveauId={niveauId} categorieKey={categorieKey} onFin={n => { setNombreQ(n); setEcran('resume'); }}/>}
      {ecran==='resume'    && <Resume t={t} langue={langue} nombreQ={nombreQ} onChanger={niv => { setNiveauId(niv); setEcran('choix'); }} onAccueil={() => setEcran('accueil')}/>}
    </SafeAreaView>
  );
}

// ══════════════════════════════
//  STYLES
// ══════════════════════════════
const s = StyleSheet.create({
  fond:{flex:1,backgroundColor:'#0E0A14'},
  ecran:{flex:1,backgroundColor:'#0E0A14'},
  ecranC:{padding:20,paddingBottom:40},
  centre:{flex:1,alignItems:'center',justifyContent:'center',padding:28,backgroundColor:'#0E0A14'},
  bigE:{fontSize:64,marginBottom:8},
  titre1:{fontSize:42,fontWeight:'800',color:'#F9F2E7',letterSpacing:-1,marginBottom:4},
  titre2:{fontSize:24,fontWeight:'700',color:'#F9F2E7',marginBottom:12,textAlign:'center'},
  sous:{fontSize:11,letterSpacing:3,color:'#F5A623',marginBottom:20,textAlign:'center'},
  desc:{fontSize:14,color:'rgba(249,242,231,0.5)',textAlign:'center',lineHeight:22,marginBottom:20,maxWidth:300},
  retour:{color:'rgba(249,242,231,0.5)',fontSize:15,marginBottom:16},
  label:{fontSize:11,letterSpacing:2,color:'#F5A623',marginBottom:8},
  iaBadge:{borderWidth:1,borderRadius:50,paddingVertical:4,paddingHorizontal:12,marginBottom:16},
  btnR:{backgroundColor:'#FF3D6B',borderRadius:50,paddingVertical:16,paddingHorizontal:32,width:'100%',maxWidth:320,alignItems:'center',elevation:8,marginBottom:4},
  btnRT:{color:'white',fontSize:15,fontWeight:'600'},
  btnV:{borderWidth:1,borderColor:'rgba(255,255,255,0.1)',borderRadius:50,paddingVertical:14,paddingHorizontal:32,width:'100%',maxWidth:320,alignItems:'center',marginTop:8},
  btnVT:{color:'rgba(249,242,231,0.5)',fontSize:14},
  btnFin:{backgroundColor:'rgba(255,255,255,0.06)',borderWidth:1,borderColor:'rgba(255,255,255,0.15)',borderRadius:50,paddingVertical:6,paddingHorizontal:14},
  btnFinT:{color:'rgba(249,242,231,0.6)',fontSize:12},
  langueBtn:{flexDirection:'row',alignItems:'center',gap:14,backgroundColor:'rgba(255,255,255,0.05)',borderWidth:1,borderColor:'rgba(255,255,255,0.1)',borderRadius:16,padding:16,width:'100%',maxWidth:300,marginBottom:10},
  langueNom:{fontSize:18,fontWeight:'600',color:'#F9F2E7'},
  langueTag:{position:'absolute',top:20,right:20,backgroundColor:'rgba(255,255,255,0.06)',borderWidth:1,borderColor:'rgba(255,255,255,0.1)',borderRadius:50,paddingVertical:4,paddingHorizontal:12},
  langueTagTxt:{color:'rgba(249,242,231,0.5)',fontSize:11},
  carteG:{backgroundColor:'rgba(255,255,255,0.05)',borderWidth:1,borderColor:'rgba(255,255,255,0.1)',borderRadius:20,padding:24,width:'100%',alignItems:'center',marginBottom:8},
  carteN:{fontSize:16,fontWeight:'600',color:'#F9F2E7',marginTop:8,marginBottom:4},
  carteD:{fontSize:12,color:'rgba(249,242,231,0.5)',textAlign:'center'},
  sep:{flexDirection:'row',alignItems:'center',gap:12,marginVertical:16,width:'100%'},
  ligne:{flex:1,height:1,backgroundColor:'rgba(255,255,255,0.1)'},
  ou:{color:'rgba(249,242,231,0.2)',fontSize:12,letterSpacing:2},
  joinBox:{backgroundColor:'rgba(255,255,255,0.05)',borderWidth:1,borderColor:'rgba(255,255,255,0.1)',borderRadius:16,padding:20,width:'100%'},
  input:{backgroundColor:'rgba(255,255,255,0.06)',borderWidth:1,borderColor:'rgba(255,255,255,0.1)',borderRadius:12,padding:14,color:'#F9F2E7',fontSize:22,fontWeight:'800',textAlign:'center',letterSpacing:6,marginVertical:12},
  codeBox:{backgroundColor:'rgba(255,255,255,0.05)',borderWidth:2,borderColor:'#FF3D6B',borderRadius:16,paddingVertical:16,paddingHorizontal:32,marginVertical:16},
  codeTxt:{fontSize:36,fontWeight:'800',color:'#F9F2E7',letterSpacing:8},
  niveauCard:{backgroundColor:'rgba(255,255,255,0.04)',borderWidth:1.5,borderColor:'rgba(255,255,255,0.1)',borderRadius:16,padding:16},
  niveauNom:{fontSize:16,fontWeight:'700',color:'#F9F2E7',marginBottom:4},
  niveauDesc:{fontSize:12,color:'rgba(249,242,231,0.4)',lineHeight:16},
  niveauBadge:{flexDirection:'row',alignItems:'center',gap:4,borderWidth:1,borderRadius:50,paddingVertical:3,paddingHorizontal:8},
  niveauBadgeTxt:{fontSize:10,fontWeight:'600'},
  catPill:{alignItems:'center',backgroundColor:'rgba(255,255,255,0.04)',borderWidth:1,borderColor:'rgba(255,255,255,0.08)',borderRadius:12,padding:10,width:'30%'},
  catPillActif:{backgroundColor:'rgba(255,61,107,0.15)',borderColor:'rgba(255,61,107,0.5)'},
  catNom:{fontSize:10,color:'rgba(249,242,231,0.4)',marginTop:4,textAlign:'center'},
  carteQ:{backgroundColor:'rgba(255,255,255,0.05)',borderWidth:1,borderRadius:24,padding:24,marginBottom:14,alignItems:'center'},
  repN:{flexDirection:'row',alignItems:'center',gap:14,backgroundColor:'rgba(255,255,255,0.03)',borderWidth:1,borderColor:'rgba(255,255,255,0.1)',borderRadius:16,padding:14},
  repC:{backgroundColor:'rgba(255,61,107,0.2)',borderColor:'#FF3D6B'},
  repP:{backgroundColor:'rgba(167,139,250,0.15)',borderColor:'rgba(167,139,250,0.5)'},
  repM:{backgroundColor:'rgba(16,217,160,0.15)',borderColor:'rgba(16,217,160,0.6)'},
  lettre:{width:28,height:28,borderRadius:8,backgroundColor:'rgba(255,255,255,0.06)',borderWidth:1,borderColor:'rgba(255,255,255,0.1)',alignItems:'center',justifyContent:'center'},
  msgBox:{backgroundColor:'rgba(255,255,255,0.04)',borderWidth:1,borderColor:'rgba(255,255,255,0.1)',borderRadius:16,padding:16,alignItems:'center'},
  msgTxt:{color:'rgba(249,242,231,0.5)',fontSize:13,textAlign:'center'},
  persoBox:{backgroundColor:'rgba(245,166,35,0.06)',borderWidth:1,borderColor:'rgba(245,166,35,0.3)',borderRadius:16,padding:16,marginBottom:10},
  persoInput:{backgroundColor:'rgba(255,255,255,0.06)',borderWidth:1,borderColor:'rgba(255,255,255,0.1)',borderRadius:12,padding:14,color:'#F9F2E7',fontSize:15,minHeight:80,textAlignVertical:'top'},
  messageFinal:{backgroundColor:'rgba(255,61,107,0.08)',borderWidth:1,borderColor:'rgba(255,61,107,0.2)',borderRadius:20,padding:24,width:'100%',alignItems:'center',marginBottom:20},
});
