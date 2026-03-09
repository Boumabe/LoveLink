import { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, StatusBar, TextInput,
  Alert, ActivityIndicator
} from 'react-native';

// ══════════════════════════════
//  FIREBASE REST API
// ══════════════════════════════
const FB_URL = "https://lovelink-a8e75-default-rtdb.firebaseio.com";
async function fbSet(path, value) {
  await fetch(`${FB_URL}/${path}.json`, { method:'PUT', body:JSON.stringify(value) });
}
async function fbGet(path) {
  const r = await fetch(`${FB_URL}/${path}.json`);
  return await r.json();
}
function fbListen(path, cb, ms=1500) {
  const id = setInterval(async () => { try { cb(await fbGet(path)); } catch(e){} }, ms);
  return () => clearInterval(id);
}

// ══════════════════════════════
//  GEMINI
// ══════════════════════════════
const GEMINI_KEY = "AIzaSyCUYRxTTYwlS1NkO3JkWmdw_WtpMzEF-wc";

// ══════════════════════════════
//  LANGUES
// ══════════════════════════════
const LANGUES = [
  { id:'fr', drapeau:'🇫🇷', nom:'Français',         langue:'français' },
  { id:'en', drapeau:'🇬🇧', nom:'English',          langue:'English' },
  { id:'es', drapeau:'🇪🇸', nom:'Español',          langue:'español' },
  { id:'ht', drapeau:'🇭🇹', nom:'Kreyòl Ayisyen',   langue:'créole haïtien' },
];

// ══════════════════════════════
//  TEXTES UI PAR LANGUE
// ══════════════════════════════
const T = {
  fr: {
    tagline: 'QUIZ DES COUPLES',
    desc: 'Questions infinies par IA 🧠\nChoisissez votre niveau ensemble 🔥',
    jouerCouple: '💑  Jouer en couple →',
    modeRencontre: '🌍  Mode Rencontre',
    seConnecter: 'Se connecter',
    creerSession: 'Créer une session',
    creerDesc: 'Génère un code pour inviter ton partenaire',
    entrerCode: 'ENTRER UN CODE',
    placeholder: 'Ex: ABC123',
    rejoindre: 'Rejoindre →',
    connectes: 'Connectés !',
    attente: 'En attente...',
    partagerCode: 'Partage ce code à ton partenaire :',
    instructions: 'Il/elle entre ce code dans LoveLink',
    commencer: '🚀  Choisir le niveau →',
    retour: '← Retour',
    choisirEnsemble: 'Choisissez ensemble 💞',
    niveauIntensité: "NIVEAU D'INTENSITÉ",
    categorie: 'CATÉGORIE',
    lancerQuiz: '🚀 Lancer le quiz →',
    partnerChoosing: 'Ton partenaire choisit\nle niveau...',
    generating: '✨ Gemini génère une question',
    choixReponse: '💭 Choisis ta réponse',
    attentePartner: '⏳ En attente de ton partenaire...',
    memeReponse: '💞 Vous pensez pareil !',
    parlezEnsemble: '🗣️ Parlez-en ensemble !',
    complicite: 'Belle complicité 💕',
    differences: 'Vos différences vous enrichissent ✨',
    questionSuivante: 'Question suivante →',
    resume: 'Résumé →',
    sessionTerminee: 'Session terminée !',
    questionsExplo: 'questions explorées ensemble 🥰',
    continuer: 'CONTINUER AVEC UN AUTRE NIVEAU ?',
    accueil: '← Accueil',
    nouvelleSession: '🔄 Nouvelle session',
  },
  en: {
    tagline: 'COUPLES QUIZ',
    desc: 'Infinite AI questions 🧠\nChoose your level together 🔥',
    jouerCouple: '💑  Play as a couple →',
    modeRencontre: '🌍  Meet Mode',
    seConnecter: 'Connect',
    creerSession: 'Create a session',
    creerDesc: 'Generate a code to invite your partner',
    entrerCode: 'ENTER A CODE',
    placeholder: 'Ex: ABC123',
    rejoindre: 'Join →',
    connectes: 'Connected!',
    attente: 'Waiting...',
    partagerCode: 'Share this code with your partner:',
    instructions: 'They enter this code in LoveLink',
    commencer: '🚀  Choose level →',
    retour: '← Back',
    choisirEnsemble: 'Choose together 💞',
    niveauIntensité: 'INTENSITY LEVEL',
    categorie: 'CATEGORY',
    lancerQuiz: '🚀 Start quiz →',
    partnerChoosing: 'Your partner is choosing\nthe level...',
    generating: '✨ Gemini generates a question',
    choixReponse: '💭 Choose your answer',
    attentePartner: '⏳ Waiting for your partner...',
    memeReponse: '💞 You think alike!',
    parlezEnsemble: '🗣️ Talk about it together!',
    complicite: 'Great connection 💕',
    differences: 'Your differences enrich you ✨',
    questionSuivante: 'Next question →',
    resume: 'Summary →',
    sessionTerminee: 'Session complete!',
    questionsExplo: 'questions explored together 🥰',
    continuer: 'CONTINUE WITH ANOTHER LEVEL?',
    accueil: '← Home',
    nouvelleSession: '🔄 New session',
  },
  es: {
    tagline: 'QUIZ DE PAREJAS',
    desc: 'Preguntas infinitas por IA 🧠\nElijan su nivel juntos 🔥',
    jouerCouple: '💑  Jugar en pareja →',
    modeRencontre: '🌍  Modo Encuentro',
    seConnecter: 'Conectarse',
    creerSession: 'Crear sesión',
    creerDesc: 'Genera un código para invitar a tu pareja',
    entrerCode: 'INGRESAR CÓDIGO',
    placeholder: 'Ej: ABC123',
    rejoindre: 'Unirse →',
    connectes: '¡Conectados!',
    attente: 'Esperando...',
    partagerCode: 'Comparte este código con tu pareja:',
    instructions: 'Ella/él ingresa este código en LoveLink',
    commencer: '🚀  Elegir nivel →',
    retour: '← Volver',
    choisirEnsemble: 'Elijan juntos 💞',
    niveauIntensité: 'NIVEL DE INTENSIDAD',
    categorie: 'CATEGORÍA',
    lancerQuiz: '🚀 Iniciar quiz →',
    partnerChoosing: 'Tu pareja está eligiendo\nel nivel...',
    generating: '✨ Gemini genera una pregunta',
    choixReponse: '💭 Elige tu respuesta',
    attentePartner: '⏳ Esperando a tu pareja...',
    memeReponse: '💞 ¡Piensan igual!',
    parlezEnsemble: '🗣️ ¡Háblalo juntos!',
    complicite: 'Gran complicidad 💕',
    differences: 'Sus diferencias los enriquecen ✨',
    questionSuivante: 'Siguiente pregunta →',
    resume: 'Resumen →',
    sessionTerminee: '¡Sesión terminada!',
    questionsExplo: 'preguntas exploradas juntos 🥰',
    continuer: '¿CONTINUAR CON OTRO NIVEL?',
    accueil: '← Inicio',
    nouvelleSession: '🔄 Nueva sesión',
  },
  ht: {
    tagline: 'JWÈT KÈ POU KOUP',
    desc: 'Kesyon san limit pa IA 🧠\nChwazi nivo nou ansanm 🔥',
    jouerCouple: '💑  Jwe an koup →',
    modeRencontre: '🌍  Mòd Rankontre',
    seConnecter: 'Konekte',
    creerSession: 'Kreye sesyon',
    creerDesc: 'Jenere yon kòd pou envite patnè ou',
    entrerCode: 'ANTRE KÒD LA',
    placeholder: 'Egz: ABC123',
    rejoindre: 'Rantre →',
    connectes: 'Konekte!',
    attente: 'Ap tann...',
    partagerCode: 'Pataje kòd sa ak patnè ou:',
    instructions: 'Li antre kòd sa nan LoveLink',
    commencer: '🚀  Chwazi nivo →',
    retour: '← Tounen',
    choisirEnsemble: 'Chwazi ansanm 💞',
    niveauIntensité: 'NIVO ENTANSITE',
    categorie: 'KATEGORI',
    lancerQuiz: '🚀 Kòmanse jwèt →',
    partnerChoosing: 'Patnè ou ap chwazi\nnivo a...',
    generating: '✨ Gemini ap kreye yon kesyon',
    choixReponse: '💭 Chwazi repons ou',
    attentePartner: '⏳ Ap tann patnè ou...',
    memeReponse: '💞 Nou panse menm bagay!',
    parlezEnsemble: '🗣️ Pale sou li ansanm!',
    complicite: 'Bèl konplisite 💕',
    differences: 'Diferans nou yo fè nou pi rich ✨',
    questionSuivante: 'Pwochen kesyon →',
    resume: 'Rezime →',
    sessionTerminee: 'Sesyon fini!',
    questionsExplo: 'kesyon eksplore ansanm 🥰',
    continuer: 'KONTINYE AK YON LÒT NIVO?',
    accueil: '← Akèy',
    nouvelleSession: '🔄 Nouvo sesyon',
  },
};

// ══════════════════════════════
//  NIVEAUX
// ══════════════════════════════
const NIVEAUX = {
  fr: [
    { id:'doux',    emoji:'🌸', nom:'Se connaître',  desc:'Questions douces et tendres',           couleur:'#10D9A0', prompt:'questions douces, tendres, romantiques pour mieux se connaître. Rien de sexuel.' },
    { id:'intense', emoji:'🔥', nom:'Intense',        desc:'Mettre le couple à l\'épreuve',          couleur:'#F5A623', prompt:'questions intenses qui mettent le couple à l\'épreuve, révèlent des vérités cachées.' },
    { id:'dark',    emoji:'🌑', nom:'Dark',           desc:'Questions sombres et philosophiques',    couleur:'#7C3AED', prompt:'questions sombres, philosophiques sur les peurs, secrets et zones d\'ombre du couple.' },
    { id:'coquin',  emoji:'🍑', nom:'Coquin 🔞',     desc:'Sexuel et intense — adultes seulement',  couleur:'#FF3D6B', prompt:'questions très sexuelles, coquines et intenses pour adultes. Fantasmes, désirs explicites.' },
  ],
  en: [
    { id:'doux',    emoji:'🌸', nom:'Get to know',   desc:'Sweet and tender questions',             couleur:'#10D9A0', prompt:'sweet, tender, romantic questions to better know each other. Nothing sexual.' },
    { id:'intense', emoji:'🔥', nom:'Intense',        desc:'Put the couple to the test',             couleur:'#F5A623', prompt:'intense questions that test the couple, reveal hidden truths.' },
    { id:'dark',    emoji:'🌑', nom:'Dark',           desc:'Dark and philosophical questions',       couleur:'#7C3AED', prompt:'dark, philosophical questions about fears, secrets and shadows of the couple.' },
    { id:'coquin',  emoji:'🍑', nom:'Naughty 🔞',    desc:'Sexual and intense — adults only',       couleur:'#FF3D6B', prompt:'very sexual, naughty and intense questions for adults. Explicit fantasies and desires.' },
  ],
  es: [
    { id:'doux',    emoji:'🌸', nom:'Conocerse',      desc:'Preguntas dulces y tiernas',             couleur:'#10D9A0', prompt:'preguntas dulces, tiernas, románticas para conocerse mejor. Nada sexual.' },
    { id:'intense', emoji:'🔥', nom:'Intenso',        desc:'Poner la pareja a prueba',               couleur:'#F5A623', prompt:'preguntas intensas que ponen a prueba la pareja, revelan verdades ocultas.' },
    { id:'dark',    emoji:'🌑', nom:'Oscuro',         desc:'Preguntas oscuras y filosóficas',         couleur:'#7C3AED', prompt:'preguntas oscuras, filosóficas sobre miedos, secretos del amor.' },
    { id:'coquin',  emoji:'🍑', nom:'Picante 🔞',    desc:'Sexual e intenso — solo adultos',        couleur:'#FF3D6B', prompt:'preguntas muy sexuales, picantes e intensas para adultos. Fantasías explícitas.' },
  ],
  ht: [
    { id:'doux',    emoji:'🌸', nom:'Konnen youn lòt', desc:'Kesyon dou ak tandr',                  couleur:'#10D9A0', prompt:'kesyon dou, tandr, womantik pou pi byen konnen youn lòt. Pa gen seksyèl.' },
    { id:'intense', emoji:'🔥', nom:'Entans',          desc:'Mete koup la à leprèv',                 couleur:'#F5A623', prompt:'kesyon entans ki teste koup la, ki revele verite kache.' },
    { id:'dark',    emoji:'🌑', nom:'Nwa',             desc:'Kesyon fon ak filozofik',                couleur:'#7C3AED', prompt:'kesyon nwa, filozofik sou laperèz, sekrè ak pati kache nan renmen.' },
    { id:'coquin',  emoji:'🍑', nom:'Koken 🔞',       desc:'Seksyèl ak entans — granmoun sèlman',   couleur:'#FF3D6B', prompt:'kesyon trè seksyèl, koken ak entans pou granmoun. Fantezi eksplisit.' },
  ],
};

// ══════════════════════════════
//  CATÉGORIES PAR LANGUE
// ══════════════════════════════
const CATS = {
  fr: ['💕 Complicité','🌙 Intimité','✈️ Distance','🔮 Rêves futurs','😂 Humour','🌱 Valeurs','💋 Séduction','🍑 Sexuel','🏠 Famille','🧳 Aventure'],
  en: ['💕 Complicity','🌙 Intimacy','✈️ Distance','🔮 Future dreams','😂 Humor','🌱 Values','💋 Seduction','🍑 Sexual','🏠 Family','🧳 Adventure'],
  es: ['💕 Complicidad','🌙 Intimidad','✈️ Distancia','🔮 Sueños futuros','😂 Humor','🌱 Valores','💋 Seducción','🍑 Sexual','🏠 Familia','🧳 Aventura'],
  ht: ['💕 Konplisite','🌙 Entimite','✈️ Distans','🔮 Rèv','😂 Imò','🌱 Valè','💋 Sediksyon','🍑 Seksyèl','🏠 Fanmi','🧳 Avanti'],
};

const LETTRES = ['A','B','C','D'];
const genCode = () => Math.random().toString(36).substring(2,8).toUpperCase();
const historiqueQ = [];

async function genQuestion(cat, niveauPrompt, langue) {
  const hist = historiqueQ.slice(-20).join(' | ');
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
      { method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          contents:[{parts:[{text:`Tu es expert en relations amoureuses. Génère UNE question originale pour la catégorie "${cat}". Niveau: ${niveauPrompt}. Langue de la réponse: ${langue}. NE RÉPÈTE JAMAIS ces questions: ${hist||'aucune'}. Réponds UNIQUEMENT en JSON sans markdown: {"emoji":"💕","categorie":"${cat}","texte":"Question ?","reponses":["A","B","C","D"]}`}]}],
          generationConfig:{temperature:1.2, maxOutputTokens:200}
        })
      }
    );
    const d = await res.json();
    const t = d.candidates[0].content.parts[0].text.replace(/```json|```|\n/g,'').trim();
    const q = JSON.parse(t);
    historiqueQ.push(q.texte);
    return q;
  } catch(e) {
    return { emoji:'💕', categorie:cat, texte:'Quel est ton souvenir préféré avec moi ?', reponses:['Notre premier rendez-vous','Un voyage','Un fou rire','Un moment calme'] };
  }
}

// ══════════════════════════════
//  ÉCRAN LANGUE
// ══════════════════════════════
function ChoixLangue({ onChoisir }) {
  return (
    <View style={s.centre}>
      <Text style={s.bigE}>💞</Text>
      <Text style={s.titre1}>LoveLink</Text>
      <Text style={[s.sous,{marginBottom:30}]}>Choose your language · Choisissez votre langue</Text>
      {LANGUES.map(l => (
        <TouchableOpacity key={l.id} style={s.langueBtn} onPress={() => onChoisir(l.id)}>
          <Text style={{fontSize:28}}>{l.drapeau}</Text>
          <Text style={s.langueNom}>{l.nom}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ══════════════════════════════
//  ÉCRAN ACCUEIL
// ══════════════════════════════
function Accueil({ t, onCouple, onRencontre, onChangerLangue }) {
  return (
    <View style={s.centre}>
      <TouchableOpacity style={s.langueTag} onPress={onChangerLangue}>
        <Text style={s.langueTagTxt}>🌍 Langue</Text>
      </TouchableOpacity>
      <Text style={s.bigE}>💞</Text>
      <Text style={s.titre1}>LoveLink</Text>
      <Text style={s.sous}>{t.tagline}</Text>
      <Text style={s.desc}>{t.desc}</Text>
      <TouchableOpacity style={s.btnR} onPress={onCouple}>
        <Text style={s.btnRT}>{t.jouerCouple}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={s.btnV} onPress={onRencontre}>
        <Text style={s.btnVT}>{t.modeRencontre}</Text>
      </TouchableOpacity>
    </View>
  );
}

// ══════════════════════════════
//  ÉCRAN CONNEXION
// ══════════════════════════════
function Connexion({ t, onRetour, onDemarrer }) {
  const [mode, setMode] = useState(null);
  const [code, setCode] = useState('');
  const [monCode] = useState(genCode());
  const [connecte, setConnecte] = useState(false);
  const unsubRef = useRef(null);

  async function creer() {
    setMode('creer');
    await fbSet(`sessions/${monCode}`, {j1:'ok',j2:null,ts:Date.now()});
    unsubRef.current = fbListen(`sessions/${monCode}/j2`, val => {
      if(val==='ok'){setConnecte(true); if(unsubRef.current) unsubRef.current();}
    });
  }
  async function rejoindre() {
    if(code.length<4){Alert.alert('!',t.entrerCode); return;}
    await fbSet(`sessions/${code}/j2`,'ok');
    onDemarrer(code, false);
  }
  useEffect(()=>()=>{if(unsubRef.current)unsubRef.current();},[]);

  if(mode==='creer') return (
    <View style={s.centre}>
      <Text style={s.bigE}>{connecte?'🎉':'⏳'}</Text>
      <Text style={s.titre2}>{connecte?t.connectes:t.attente}</Text>
      {!connecte && <>
        <Text style={s.desc}>{t.partagerCode}</Text>
        <View style={s.codeBox}><Text style={s.codeTxt}>{monCode}</Text></View>
        <Text style={s.desc}>{t.instructions}</Text>
        <ActivityIndicator color="#FF3D6B" size="large" style={{marginTop:16}}/>
      </>}
      {connecte && <TouchableOpacity style={s.btnR} onPress={()=>onDemarrer(monCode,true)}>
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
        <TextInput style={s.input} placeholder={t.placeholder}
          placeholderTextColor="rgba(249,242,231,0.3)" value={code}
          onChangeText={v=>setCode(v.toUpperCase())} maxLength={6} autoCapitalize="characters"/>
        <TouchableOpacity style={s.btnR} onPress={rejoindre}>
          <Text style={s.btnRT}>{t.rejoindre}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// ══════════════════════════════
//  ÉCRAN CHOIX NIVEAU + CATÉGORIE
// ══════════════════════════════
function ChoixNiveau({ t, langue, sessionCode, estJ1, onDemarrer }) {
  const [niveau, setNiveau] = useState(null);
  const [categorie, setCategorie] = useState(null);
  const niveaux = NIVEAUX[langue] || NIVEAUX.fr;
  const cats = CATS[langue] || CATS.fr;
  const unsubRef = useRef(null);

  useEffect(()=>{
    if(!estJ1){
      unsubRef.current = fbListen(`sessions/${sessionCode}/config`, val=>{
        if(val?.niveau && val?.categorie && val?.confirme){
          onDemarrer(val.niveau, val.categorie);
          if(unsubRef.current) unsubRef.current();
        }
      });
      return()=>{if(unsubRef.current)unsubRef.current();};
    }
  },[]);

  async function confirmer() {
    if(!niveau||!categorie){Alert.alert('!','Choisissez un niveau et une catégorie'); return;}
    await fbSet(`sessions/${sessionCode}/config`,{niveau:niveau.id, categorie, confirme:true});
    onDemarrer(niveau.id, categorie);
  }

  if(!estJ1) return (
    <View style={s.centre}>
      <Text style={s.bigE}>⏳</Text>
      <Text style={s.titre2}>{t.partnerChoosing}</Text>
      <ActivityIndicator color="#FF3D6B" size="large" style={{marginTop:20}}/>
    </View>
  );

  return (
    <ScrollView style={s.ecran} contentContainerStyle={s.ecranC}>
      <Text style={[s.titre2,{marginTop:10}]}>{t.choisirEnsemble}</Text>

      <Text style={s.label}>{t.niveauIntensité}</Text>
      <View style={{gap:10,marginBottom:20}}>
        {niveaux.map(n=>(
          <TouchableOpacity key={n.id}
            style={[s.niveauCard, niveau?.id===n.id&&{borderColor:n.couleur,backgroundColor:`${n.couleur}15`}]}
            onPress={()=>setNiveau(n)}>
            <View style={{flexDirection:'row',alignItems:'center',gap:12}}>
              <Text style={{fontSize:32}}>{n.emoji}</Text>
              <View style={{flex:1}}>
                <Text style={[s.niveauNom, niveau?.id===n.id&&{color:n.couleur}]}>{n.nom}</Text>
                <Text style={s.niveauDesc}>{n.desc}</Text>
              </View>
              {niveau?.id===n.id&&<Text style={{color:n.couleur,fontSize:20}}>✓</Text>}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={s.label}>{t.categorie}</Text>
      <View style={{flexDirection:'row',flexWrap:'wrap',gap:10,marginBottom:24}}>
        {cats.map(c=>{
          const actif = categorie===c;
          const emoji = c.split(' ')[0];
          const nom = c.split(' ').slice(1).join(' ');
          return (
            <TouchableOpacity key={c} style={[s.catPill,actif&&s.catPillActif]} onPress={()=>setCategorie(c)}>
              <Text style={{fontSize:20}}>{emoji}</Text>
              <Text style={[s.catNom,actif&&{color:'#F9F2E7'}]}>{nom}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity style={[s.btnR,(!niveau||!categorie)&&{opacity:0.4}]} onPress={confirmer}>
        <Text style={s.btnRT}>{t.lancerQuiz}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ══════════════════════════════
//  ÉCRAN QUIZ
// ══════════════════════════════
function Quiz({ t, langue, sessionCode, estJ1, niveauId, categorieKey, onFin }) {
  const [q, setQ] = useState(null);
  const [load, setLoad] = useState(true);
  const [choisi, setChoisi] = useState(null);
  const [choixP, setChoixP] = useState(null);
  const [num, setNum] = useState(1);
  const unsubRef = useRef(null);

  const maCle = estJ1?'rep1':'rep2';
  const pCle  = estJ1?'rep2':'rep1';
  const niveaux = NIVEAUX[langue]||NIVEAUX.fr;
  const niveau = niveaux.find(n=>n.id===niveauId)||niveaux[0];

  useEffect(()=>{
    setLoad(true); setChoisi(null); setChoixP(null);
    if(unsubRef.current) unsubRef.current();
    unsubRef.current = fbListen(`sessions/${sessionCode}/q${num}/${pCle}`, val=>{
      if(val!==null) setChoixP(val);
    });
    charger();
    return()=>{if(unsubRef.current)unsubRef.current();};
  },[num]);

  async function charger(){
    const question = await genQuestion(categorieKey, niveau.prompt, niveau.langue||langue);
    if(estJ1){
      await fbSet(`sessions/${sessionCode}/questions/q${num}`, question);
      setQ(question); setLoad(false);
    } else {
      const poll = setInterval(async()=>{
        const val = await fbGet(`sessions/${sessionCode}/questions/q${num}`);
        if(val){setQ(val);setLoad(false);clearInterval(poll);}
      },1500);
    }
  }

  async function choisir(i){
    if(choisi!==null) return;
    setChoisi(i);
    await fbSet(`sessions/${sessionCode}/q${num}/${maCle}`,i);
  }

  const lesDeux = choisi!==null && choixP!==null;
  const memeReponse = lesDeux && choisi===choixP;

  if(load||!q) return (
    <View style={s.centre}>
      <ActivityIndicator color={niveau.couleur} size="large"/>
      <Text style={[s.desc,{marginTop:16}]}>{t.generating} {niveau.emoji}...</Text>
    </View>
  );

  return (
    <ScrollView style={s.ecran} contentContainerStyle={s.ecranC}>
      <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
        <View style={{flexDirection:'row',alignItems:'center',gap:6}}>
          <View style={s.av}><Text>🧑</Text></View>
          <View style={[s.av,{backgroundColor:'rgba(167,139,250,0.2)',marginLeft:-10}]}><Text>👩</Text></View>
          <View style={[s.niveauBadge,{borderColor:`${niveau.couleur}50`,backgroundColor:`${niveau.couleur}15`}]}>
            <Text style={{fontSize:12}}>{niveau.emoji}</Text>
            <Text style={[s.niveauBadgeTxt,{color:niveau.couleur}]}>{niveau.nom}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={()=>onFin(num)} style={s.btnFin}>
          <Text style={s.btnFinT}>{t.resume}</Text>
        </TouchableOpacity>
      </View>

      <Text style={{color:'rgba(249,242,231,0.3)',fontSize:12,marginBottom:14,textAlign:'center'}}>
        Q{num} · {categorieKey}
      </Text>

      <View style={[s.carteQ,{borderColor:`${niveau.couleur}30`}]}>
        <View style={[s.iaBadge,{borderColor:`${niveau.couleur}40`,backgroundColor:`${niveau.couleur}10`}]}>
          <Text style={{color:niveau.couleur,fontSize:11}}>✨ Gemini IA · {niveau.emoji} {niveau.nom}</Text>
        </View>
        <Text style={{fontSize:48,marginBottom:8}}>{q.emoji}</Text>
        <Text style={{color:'#F5A623',fontSize:11,letterSpacing:1,marginBottom:12}}>{q.categorie}</Text>
        <Text style={{color:'#F9F2E7',fontSize:18,fontWeight:'600',textAlign:'center',lineHeight:28}}>{q.texte}</Text>
      </View>

      <View style={{gap:9,marginBottom:14}}>
        {q.reponses.map((r,i)=>{
          let st=s.repN;
          if(lesDeux&&choisi===i&&choixP===i) st={...s.repN,...s.repM};
          else if(choisi===i) st={...s.repN,...s.repC};
          else if(lesDeux&&choixP===i) st={...s.repN,...s.repP};
          return (
            <TouchableOpacity key={i} style={st} onPress={()=>choisir(i)} disabled={choisi!==null}>
              <View style={[s.lettre,choisi===i&&{backgroundColor:niveau.couleur,borderColor:niveau.couleur}]}>
                <Text style={{color:'#F9F2E7',fontSize:11,fontWeight:'700'}}>{LETTRES[i]}</Text>
              </View>
              <Text style={{color:'#F9F2E7',fontSize:14,flex:1,lineHeight:20}}>{r}</Text>
              {lesDeux&&choixP===i&&<Text style={{fontSize:18}}>👩</Text>}
            </TouchableOpacity>
          );
        })}
      </View>

      {!lesDeux&&<View style={s.msgBox}>
        <Text style={s.msgTxt}>{choisi===null?t.choixReponse:t.attentePartner}</Text>
      </View>}

      {lesDeux&&<View style={[s.msgBox,{
        borderColor:memeReponse?'rgba(16,217,160,0.4)':'rgba(245,166,35,0.4)',
        backgroundColor:memeReponse?'rgba(16,217,160,0.08)':'rgba(245,166,35,0.08)'
      }]}>
        <Text style={[s.msgTxt,{color:memeReponse?'#10D9A0':'#F5A623',fontWeight:'700',fontSize:15}]}>
          {memeReponse?t.memeReponse:t.parlezEnsemble}
        </Text>
        <Text style={[s.msgTxt,{marginTop:6,fontSize:12}]}>
          {memeReponse?t.complicite:t.differences}
        </Text>
      </View>}

      {lesDeux&&<TouchableOpacity style={[s.btnR,{marginTop:16,backgroundColor:niveau.couleur}]}
        onPress={()=>setNum(n=>n+1)}>
        <Text style={s.btnRT}>{t.questionSuivante}</Text>
      </TouchableOpacity>}
    </ScrollView>
  );
}

// ══════════════════════════════
//  RÉSUMÉ
// ══════════════════════════════
function Resume({ t, langue, nombreQ, onChanger, onAccueil }) {
  const niveaux = NIVEAUX[langue]||NIVEAUX.fr;
  return (
    <ScrollView style={s.ecran} contentContainerStyle={[s.ecranC,{alignItems:'center'}]}>
      <Text style={[s.bigE,{marginTop:20}]}>💞</Text>
      <Text style={s.titre2}>{t.sessionTerminee}</Text>
      <Text style={s.desc}>{nombreQ} {t.questionsExplo}</Text>
      <View style={s.messageFinal}>
        <Text style={{fontSize:32,marginBottom:12}}>💌</Text>
        <Text style={{color:'#F9F2E7',fontSize:15,textAlign:'center',lineHeight:24,fontWeight:'500'}}>
          Chaque question vous rapproche,{'\n'}même à des milliers de kilomètres.
        </Text>
      </View>
      <Text style={[s.label,{marginBottom:12}]}>{t.continuer}</Text>
      {niveaux.map(n=>(
        <TouchableOpacity key={n.id} style={[s.btnR,{backgroundColor:n.couleur,marginBottom:10}]}
          onPress={()=>onChanger(n.id)}>
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

  function choisirLangue(l) { setLangue(l); setEcran('accueil'); }
  function demarrer(code,j1){ setSession(code); setEstJ1(j1); setEcran('choix'); }
  function lancerQuiz(niv,cat){ setNiveauId(niv); setCategorieKey(cat); setEcran('quiz'); }
  function changerNiveau(niv){ setNiveauId(niv); setEcran('choix'); }

  return (
    <SafeAreaView style={s.fond}>
      <StatusBar barStyle="light-content" backgroundColor="#0E0A14"/>
      {ecran==='langue'    && <ChoixLangue onChoisir={choisirLangue}/>}
      {ecran==='accueil'   && <Accueil t={t} onCouple={()=>setEcran('connexion')} onRencontre={()=>setEcran('rencontre')} onChangerLangue={()=>setEcran('langue')}/>}
      {ecran==='connexion' && <Connexion t={t} onRetour={()=>setEcran('accueil')} onDemarrer={demarrer}/>}
      {ecran==='choix'     && <ChoixNiveau t={t} langue={langue} sessionCode={session} estJ1={estJ1} onDemarrer={lancerQuiz}/>}
      {ecran==='quiz'      && <Quiz t={t} langue={langue} sessionCode={session} estJ1={estJ1} niveauId={niveauId} categorieKey={categorieKey} onFin={n=>{setNombreQ(n);setEcran('resume');}}/>}
      {ecran==='resume'    && <Resume t={t} langue={langue} nombreQ={nombreQ} onChanger={changerNiveau} onAccueil={()=>setEcran('accueil')}/>}
      {ecran==='rencontre' && <View style={s.centre}><Text style={s.bigE}>🌍</Text><TouchableOpacity style={s.btnV} onPress={()=>setEcran('accueil')}><Text style={s.btnVT}>{t.retour}</Text></TouchableOpacity></View>}
    </SafeAreaView>
  );
}

// ══════════════════════════════
//  STYLES
// ══════════════════════════════
const s = StyleSheet.create({
  fond:   {flex:1,backgroundColor:'#0E0A14'},
  ecran:  {flex:1,backgroundColor:'#0E0A14'},
  ecranC: {padding:20,paddingBottom:40},
  centre: {flex:1,alignItems:'center',justifyContent:'center',padding:28,backgroundColor:'#0E0A14'},
  bigE:   {fontSize:64,marginBottom:8},
  titre1: {fontSize:42,fontWeight:'800',color:'#F9F2E7',letterSpacing:-1,marginBottom:4},
  titre2: {fontSize:24,fontWeight:'700',color:'#F9F2E7',marginBottom:12,textAlign:'center'},
  sous:   {fontSize:11,letterSpacing:3,color:'#F5A623',marginBottom:20,textAlign:'center'},
  desc:   {fontSize:14,color:'rgba(249,242,231,0.5)',textAlign:'center',lineHeight:22,marginBottom:20,maxWidth:300},
  retour: {color:'rgba(249,242,231,0.5)',fontSize:15,marginBottom:16},
  label:  {fontSize:11,letterSpacing:2,color:'#F5A623',marginBottom:8},
  btnR:   {backgroundColor:'#FF3D6B',borderRadius:50,paddingVertical:16,paddingHorizontal:32,width:'100%',maxWidth:320,alignItems:'center',elevation:8,marginBottom:4},
  btnRT:  {color:'white',fontSize:15,fontWeight:'600'},
  btnV:   {borderWidth:1,borderColor:'rgba(255,255,255,0.1)',borderRadius:50,paddingVertical:14,paddingHorizontal:32,width:'100%',maxWidth:320,alignItems:'center',marginTop:8},
  btnVT:  {color:'rgba(249,242,231,0.5)',fontSize:14},
  btnFin: {backgroundColor:'rgba(255,255,255,0.06)',borderWidth:1,borderColor:'rgba(255,255,255,0.15)',borderRadius:50,paddingVertical:6,paddingHorizontal:14},
  btnFinT:{color:'rgba(249,242,231,0.6)',fontSize:12},
  langueBtn: {flexDirection:'row',alignItems:'center',gap:14,backgroundColor:'rgba(255,255,255,0.05)',borderWidth:1,borderColor:'rgba(255,255,255,0.1)',borderRadius:16,padding:16,width:'100%',maxWidth:300,marginBottom:10},
  langueNom: {fontSize:18,fontWeight:'600',color:'#F9F2E7'},
  langueTag: {position:'absolute',top:20,right:20,backgroundColor:'rgba(255,255,255,0.06)',borderWidth:1,borderColor:'rgba(255,255,255,0.1)',borderRadius:50,paddingVertical:4,paddingHorizontal:12},
  langueTagTxt:{color:'rgba(249,242,231,0.5)',fontSize:11},
  carteG: {backgroundColor:'rgba(255,255,255,0.05)',borderWidth:1,borderColor:'rgba(255,255,255,0.1)',borderRadius:20,padding:24,width:'100%',alignItems:'center',marginBottom:8},
  carteN: {fontSize:16,fontWeight:'600',color:'#F9F2E7',marginTop:8,marginBottom:4},
  carteD: {fontSize:12,color:'rgba(249,242,231,0.5)',textAlign:'center'},
  sep:    {flexDirection:'row',alignItems:'center',gap:12,marginVertical:16,width:'100%'},
  ligne:  {flex:1,height:1,backgroundColor:'rgba(255,255,255,0.1)'},
  ou:     {color:'rgba(249,242,231,0.2)',fontSize:12,letterSpacing:2},
  joinBox:{backgroundColor:'rgba(255,255,255,0.05)',borderWidth:1,borderColor:'rgba(255,255,255,0.1)',borderRadius:16,padding:20,width:'100%'},
  input:  {backgroundColor:'rgba(255,255,255,0.06)',borderWidth:1,borderColor:'rgba(255,255,255,0.1)',borderRadius:12,padding:14,color:'#F9F2E7',fontSize:22,fontWeight:'800',textAlign:'center',letterSpacing:6,marginVertical:12},
  codeBox:{backgroundColor:'rgba(255,255,255,0.05)',borderWidth:2,borderColor:'#FF3D6B',borderRadius:16,paddingVertical:16,paddingHorizontal:32,marginVertical:16},
  codeTxt:{fontSize:36,fontWeight:'800',color:'#F9F2E7',letterSpacing:8},
  av:     {width:40,height:40,borderRadius:20,backgroundColor:'rgba(255,61,107,0.2)',alignItems:'center',justifyContent:'center',borderWidth:2,borderColor:'#0E0A14'},
  niveauCard:    {backgroundColor:'rgba(255,255,255,0.04)',borderWidth:1.5,borderColor:'rgba(255,255,255,0.1)',borderRadius:16,padding:16},
  niveauNom:     {fontSize:16,fontWeight:'700',color:'#F9F2E7',marginBottom:4},
  niveauDesc:    {fontSize:12,color:'rgba(249,242,231,0.4)',lineHeight:16},
  niveauBadge:   {flexDirection:'row',alignItems:'center',gap:4,borderWidth:1,borderRadius:50,paddingVertical:3,paddingHorizontal:8},
  niveauBadgeTxt:{fontSize:10,fontWeight:'600'},
  catPill:       {alignItems:'center',backgroundColor:'rgba(255,255,255,0.04)',borderWidth:1,borderColor:'rgba(255,255,255,0.08)',borderRadius:12,padding:10,width:'30%'},
  catPillActif:  {backgroundColor:'rgba(255,61,107,0.15)',borderColor:'rgba(255,61,107,0.5)'},
  catNom:        {fontSize:10,color:'rgba(249,242,231,0.4)',marginTop:4,textAlign:'center'},
  carteQ: {backgroundColor:'rgba(255,255,255,0.05)',borderWidth:1,borderColor:'rgba(255,255,255,0.1)',borderRadius:24,padding:24,marginBottom:14,alignItems:'center'},
  iaBadge:{borderWidth:1,borderRadius:50,paddingVertical:4,paddingHorizontal:12,marginBottom:14},
  repN:   {flexDirection:'row',alignItems:'center',gap:14,backgroundColor:'rgba(255,255,255,0.03)',borderWidth:1,borderColor:'rgba(255,255,255,0.1)',borderRadius:16,padding:14},
  repC:   {backgroundColor:'rgba(255,61,107,0.2)',borderColor:'#FF3D6B'},
  repP:   {backgroundColor:'rgba(167,139,250,0.15)',borderColor:'rgba(167,139,250,0.5)'},
  repM:   {backgroundColor:'rgba(16,217,160,0.15)',borderColor:'rgba(16,217,160,0.6)'},
  lettre: {width:28,height:28,borderRadius:8,backgroundColor:'rgba(255,255,255,0.06)',borderWidth:1,borderColor:'rgba(255,255,255,0.1)',alignItems:'center',justifyContent:'center'},
  msgBox: {backgroundColor:'rgba(255,255,255,0.04)',borderWidth:1,borderColor:'rgba(255,255,255,0.1)',borderRadius:16,padding:16,alignItems:'center'},
  msgTxt: {color:'rgba(249,242,231,0.5)',fontSize:13,textAlign:'center'},
  messageFinal:{backgroundColor:'rgba(255,61,107,0.08)',borderWidth:1,borderColor:'rgba(255,61,107,0.2)',borderRadius:20,padding:24,width:'100%',alignItems:'center',marginBottom:20},
});
