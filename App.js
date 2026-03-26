import { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, SafeAreaView, StatusBar, TextInput,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Modal
} from 'react-native';

// ══════════════════════════════════════════════
//  CONFIG
// ══════════════════════════════════════════════
const FB_URL = "https://lovelink-a8e75-default-rtdb.firebaseio.com";
const API_URL = "/api/question";

// ══════════════════════════════════════════════
//  FIREBASE
// ══════════════════════════════════════════════
async function fbSet(p,v){await fetch(`${FB_URL}/${p}.json`,{method:'PUT',body:JSON.stringify(v)});}
async function fbGet(p){const r=await fetch(`${FB_URL}/${p}.json`);return r.json();}
async function fbPush(p,v){await fetch(`${FB_URL}/${p}.json`,{method:'POST',body:JSON.stringify(v)});}
function fbListen(p,cb,ms=1500){const id=setInterval(async()=>{try{cb(await fbGet(p));}catch(e){}},ms);return()=>clearInterval(id);}
const genCode=()=>Math.random().toString(36).substring(2,8).toUpperCase();

// ══════════════════════════════════════════════
//  LANGUES
// ══════════════════════════════════════════════
const LANGUES=[
  {id:'fr',drapeau:'🇫🇷',nom:'Français'},
  {id:'en',drapeau:'🇬🇧',nom:'English'},
  {id:'es',drapeau:'🇪🇸',nom:'Español'},
  {id:'ht',drapeau:'🇭🇹',nom:'Kreyòl Ayisyen'},
];

// ══════════════════════════════════════════════
//  TRADUCTIONS GLOBALES + DESCRIPTIONS
// ══════════════════════════════════════════════
const TG={
  fr:{
    appName:'LoveLink',chooseGame:'Choisissez votre jeu 💞',
    langue:'🌍 Langue',retour:'← Retour',
    quiz:'Quiz Couples',quizDesc:'Questions générées par IA pour se connecter',
    quizHow:'💑 2 joueurs à distance · Répondez aux mêmes questions et découvrez ce que vous avez en commun · L\'IA génère des questions infinies dans votre langue',
    kay:'Kay',kayDesc:'Jeu de stratégie de pierres à deux',
    kayHow:'🪨 2 joueurs à distance · Chaque joueur a 5 casiers avec 4 pierres · Distribuez vos pierres de droite à gauche · Assemblez 4 pierres dans un casier pour les gagner · Le joueur avec le plus de pierres gagne la manche',
    devine:'Devine !',devineDesc:'Questions Oui/Non pour trouver le mot secret',
    devineHow:'🔍 2 joueurs à distance · J1 connaît le mot secret · J2 pose des questions auxquelles on répond Oui, Non ou Parfois · J2 doit deviner le mot avant la fin du temps · Choisissez l\'IA, votre propre mot ou laissez J1 choisir',
    howToPlay:'Comment jouer ?',close:'Fermer ×',
    iaActif:'🤖 IA active',iaNonDispo:'📚 Mode hors ligne',
  },
  en:{
    appName:'LoveLink',chooseGame:'Choose your game 💞',
    langue:'🌍 Language',retour:'← Back',
    quiz:'Couples Quiz',quizDesc:'AI-generated questions to connect',
    quizHow:'💑 2 players at distance · Answer the same questions and discover what you have in common · AI generates infinite questions in your language',
    kay:'Kay',kayDesc:'Two-player stone strategy game',
    kayHow:'🪨 2 players at distance · Each player has 5 pits with 4 stones · Distribute your stones right to left · Collect 4 stones in a pit to win them · The player with the most stones wins the round',
    devine:'Guess It!',devineDesc:'Yes/No questions to find the secret word',
    devineHow:'🔍 2 players at distance · J1 knows the secret word · J2 asks questions answered Yes, No or Sometimes · J2 must guess the word before time runs out · Choose AI, your own word, or let J1 pick',
    howToPlay:'How to play?',close:'Close ×',
    iaActif:'🤖 AI active',iaNonDispo:'📚 Offline mode',
  },
  es:{
    appName:'LoveLink',chooseGame:'Elige tu juego 💞',
    langue:'🌍 Idioma',retour:'← Volver',
    quiz:'Quiz de Parejas',quizDesc:'Preguntas generadas por IA para conectarse',
    quizHow:'💑 2 jugadores a distancia · Respondan las mismas preguntas y descubran lo que tienen en común · La IA genera preguntas infinitas en su idioma',
    kay:'Kay',kayDesc:'Juego de estrategia de piedras para dos',
    kayHow:'🪨 2 jugadores a distancia · Cada jugador tiene 5 casillas con 4 piedras · Distribuye tus piedras de derecha a izquierda · Reúne 4 piedras en una casilla para ganarlas · El jugador con más piedras gana la ronda',
    devine:'¡Adivina!',devineDesc:'Preguntas Sí/No para encontrar la palabra secreta',
    devineHow:'🔍 2 jugadores a distancia · J1 conoce la palabra secreta · J2 hace preguntas respondidas Sí, No o A veces · J2 debe adivinar la palabra antes de que se acabe el tiempo · Elige IA, tu propia palabra o deja que J1 elija',
    howToPlay:'¿Cómo jugar?',close:'Cerrar ×',
    iaActif:'🤖 IA activa',iaNonDispo:'📚 Modo sin conexión',
  },
  ht:{
    appName:'LoveLink',chooseGame:'Chwazi jwèt ou 💞',
    langue:'🌍 Lang',retour:'← Tounen',
    quiz:'Jwèt Koup',quizDesc:'Kesyon IA jenere pou konekte',
    quizHow:'💑 2 jwè adistans · Reponn menm kesyon yo epi dekouvri sa nou gen an komen · IA jenere kesyon san limit nan lang ou',
    kay:'Kay',kayDesc:'Jwèt estrateji wòch pou de moun',
    kayHow:'🪨 2 jwè adistans · Chak jwè gen 5 kaz ak 4 wòch · Distribye wòch ou yo de dwat a gòch · Rasanble 4 wòch nan yon kaz pou genyen yo · Jwè ki gen plis wòch genyen manche a',
    devine:'Devine!',devineDesc:'Kesyon Wi/Non pou jwenn mo sekrè a',
    devineHow:'🔍 2 jwè adistans · J1 konnen mo sekrè a · J2 poze kesyon yo reponn Wi, Non oswa Pafwa · J2 dwe devine mo a anvan tan fini · Chwazi IA, mo pa ou oswa kite J1 chwazi',
    howToPlay:'Kijan pou jwe?',close:'Fèmen ×',
    iaActif:'🤖 IA aktif',iaNonDispo:'📚 Mòd san entènèt',
  },
};

// ══════════════════════════════════════════════
//  TRADUCTIONS QUIZ
// ══════════════════════════════════════════════
const TQ={
  fr:{tagline:'QUIZ DES COUPLES',desc:'Questions générées par IA 💞\nDans votre langue, à l\'infini 🔥',jouerCouple:'💑  Jouer en couple →',seConnecter:'Se connecter',creerSession:'Créer une session',creerDesc:'Génère un code pour inviter ton partenaire',entrerCode:'ENTRER UN CODE',placeholder:'Ex: ABC123',rejoindre:'Rejoindre →',connectes:'Connectés !',attente:'En attente...',partagerCode:'Partage ce code à ton partenaire :',commencer:'🚀  Choisir le niveau →',retour:'← Retour',choisirEnsemble:'Choisissez ensemble 💞',niveauIntensite:"NIVEAU D'INTENSITÉ",categorie:'CATÉGORIE',lancerQuiz:'🚀 Lancer le quiz →',partnerChoosing:'Ton partenaire choisit\nle niveau...',generating:'✨ L\'IA génère une question...',choixReponse:'💭 Choisis ta réponse',attentePartner:'⏳ En attente de ton partenaire...',memeReponse:'💞 Vous pensez pareil !',parlezEnsemble:'🗣️ Parlez-en ensemble !',complicite:'Belle complicité 💕',differences:'Vos différences vous enrichissent ✨',questionSuivante:'Question suivante →',resume:'Résumé →',sessionTerminee:'Session terminée !',questionsExplo:'questions explorées ensemble 🥰',continuer:'CONTINUER AVEC UN AUTRE NIVEAU ?',accueil:'← Accueil',autreReponse:'✏️ Ma propre réponse',valider:'Valider →',ecrireTa:'Écris ta réponse...',iaActif:'🤖 IA active',iaNonDispo:'📚 Mode hors ligne'},
  en:{tagline:'COUPLES QUIZ',desc:'AI-generated questions 💞\nIn your language, forever 🔥',jouerCouple:'💑  Play as a couple →',seConnecter:'Connect',creerSession:'Create a session',creerDesc:'Generate a code to invite your partner',entrerCode:'ENTER A CODE',placeholder:'Ex: ABC123',rejoindre:'Join →',connectes:'Connected!',attente:'Waiting...',partagerCode:'Share this code with your partner:',commencer:'🚀  Choose level →',retour:'← Back',choisirEnsemble:'Choose together 💞',niveauIntensite:'INTENSITY LEVEL',categorie:'CATEGORY',lancerQuiz:'🚀 Start quiz →',partnerChoosing:'Your partner is choosing\nthe level...',generating:'✨ AI is generating a question...',choixReponse:'💭 Choose your answer',attentePartner:'⏳ Waiting for your partner...',memeReponse:'💞 You think alike!',parlezEnsemble:'🗣️ Talk about it together!',complicite:'Great connection 💕',differences:'Your differences enrich you ✨',questionSuivante:'Next question →',resume:'Summary →',sessionTerminee:'Session complete!',questionsExplo:'questions explored together 🥰',continuer:'CONTINUE WITH ANOTHER LEVEL?',accueil:'← Home',autreReponse:'✏️ My own answer',valider:'Submit →',ecrireTa:'Write your answer...',iaActif:'🤖 AI active',iaNonDispo:'📚 Offline mode'},
  es:{tagline:'QUIZ DE PAREJAS',desc:'Preguntas generadas por IA 💞\nEn tu idioma, infinitas 🔥',jouerCouple:'💑  Jugar en pareja →',seConnecter:'Conectarse',creerSession:'Crear sesión',creerDesc:'Genera un código para invitar a tu pareja',entrerCode:'INGRESAR CÓDIGO',placeholder:'Ej: ABC123',rejoindre:'Unirse →',connectes:'¡Conectados!',attente:'Esperando...',partagerCode:'Comparte este código con tu pareja:',commencer:'🚀  Elegir nivel →',retour:'← Volver',choisirEnsemble:'Elijan juntos 💞',niveauIntensite:'NIVEL DE INTENSIDAD',categorie:'CATEGORÍA',lancerQuiz:'🚀 Iniciar quiz →',partnerChoosing:'Tu pareja está eligiendo\nel nivel...',generating:'✨ La IA genera una pregunta...',choixReponse:'💭 Elige tu respuesta',attentePartner:'⏳ Esperando a tu pareja...',memeReponse:'💞 ¡Piensan igual!',parlezEnsemble:'🗣️ ¡Háblalo juntos!',complicite:'Gran complicidad 💕',differences:'Sus diferencias los enriquecen ✨',questionSuivante:'Siguiente pregunta →',resume:'Resumen →',sessionTerminee:'¡Sesión terminada!',questionsExplo:'preguntas exploradas juntos 🥰',continuer:'¿CONTINUAR CON OTRO NIVEL?',accueil:'← Inicio',autreReponse:'✏️ Mi propia respuesta',valider:'Enviar →',ecrireTa:'Escribe tu respuesta...',iaActif:'🤖 IA activa',iaNonDispo:'📚 Modo sin conexión'},
  ht:{tagline:'JWÈT KÈ POU KOUP',desc:'Kesyon jenere pa IA 💞\nNan lang ou, san limit 🔥',jouerCouple:'💑  Jwe an koup →',seConnecter:'Konekte',creerSession:'Kreye sesyon',creerDesc:'Jenere yon kòd pou envite patnè ou',entrerCode:'ANTRE KÒD LA',placeholder:'Egz: ABC123',rejoindre:'Rantre →',connectes:'Konekte!',attente:'Ap tann...',partagerCode:'Pataje kòd sa ak patnè ou:',commencer:'🚀  Chwazi nivo →',retour:'← Tounen',choisirEnsemble:'Chwazi ansanm 💞',niveauIntensite:'NIVO ENTANSITE',categorie:'KATEGORI',lancerQuiz:'🚀 Kòmanse jwèt →',partnerChoosing:'Patnè ou ap chwazi\nnivo a...',generating:'✨ IA ap kreye yon kesyon...',choixReponse:'💭 Chwazi repons ou',attentePartner:'⏳ Ap tann patnè ou...',memeReponse:'💞 Nou panse menm bagay!',parlezEnsemble:'🗣️ Pale sou li ansanm!',complicite:'Bèl konplisite 💕',differences:'Diferans nou yo fè nou pi rich ✨',questionSuivante:'Pwochen kesyon →',resume:'Rezime →',sessionTerminee:'Sesyon fini!',questionsExplo:'kesyon eksplore ansanm 🥰',continuer:'KONTINYE AK YON LÒT NIVO?',accueil:'← Akèy',autreReponse:'✏️ Repons pa mwen',valider:'Voye →',ecrireTa:'Ekri repons ou...',iaActif:'🤖 IA aktif',iaNonDispo:'📚 Mòd san entènèt'},
};

// ══════════════════════════════════════════════
//  TRADUCTIONS KAY
// ══════════════════════════════════════════════
const TK={
  fr:{title:'Kay',subtitle:'Jeu de stratégie à deux',player1:'Joueur 1',player2:'Joueur 2',yourTurn:'TON TOUR !',round:'Manche',gameOver:'Manche terminée !',wins:'gagne !',nextRound:'Manche suivante →',casesLeft:'cases',penalty:'perd une case !',restart:'Rejouer',tapToPlay:'Choisis un casier',tie:'Égalité !',champion:'est Champion ! 🏆',stoneColor:'Couleur des pierres',modeAuto:'⚡ Auto',modeManuel:'👆 Manuel',manuelHint:'Appuie sur le casier suivant',stonesLeft:'pierres en main',settings:'Paramètres',autoDesc:'Distribution automatique',manuelDesc:'Tu déposes chaque pierre',creerSession:'Créer une session',creerDesc:'Génère un code pour inviter ton partenaire',entrerCode:'ENTRER UN CODE',placeholder:'Ex: ABC123',rejoindre:'Rejoindre →',connectes:'Connectés !',attente:'En attente...',partagerCode:'Partage ce code :',commencer:'🚀 Commencer →',retour:'← Retour',waitingTurn:'En attente de ton adversaire...',},
  en:{title:'Kay',subtitle:'Two-player strategy game',player1:'Player 1',player2:'Player 2',yourTurn:'YOUR TURN!',round:'Round',gameOver:'Round over!',wins:'wins!',nextRound:'Next round →',casesLeft:'cases',penalty:'loses a case!',restart:'Play again',tapToPlay:'Choose a pit',tie:'Tie!',champion:'is Champion! 🏆',stoneColor:'Stone color',modeAuto:'⚡ Auto',modeManuel:'👆 Manual',manuelHint:'Tap the next pit',stonesLeft:'stones in hand',settings:'Settings',autoDesc:'Automatic distribution',manuelDesc:'You place each stone',creerSession:'Create a session',creerDesc:'Generate a code to invite your opponent',entrerCode:'ENTER A CODE',placeholder:'Ex: ABC123',rejoindre:'Join →',connectes:'Connected!',attente:'Waiting...',partagerCode:'Share this code:',commencer:'🚀 Start →',retour:'← Back',waitingTurn:'Waiting for your opponent...',},
  es:{title:'Kay',subtitle:'Juego de estrategia para dos',player1:'Jugador 1',player2:'Jugador 2',yourTurn:'¡TU TURNO!',round:'Ronda',gameOver:'¡Ronda terminada!',wins:'¡gana!',nextRound:'Siguiente ronda →',casesLeft:'casillas',penalty:'¡pierde una casilla!',restart:'Jugar de nuevo',tapToPlay:'Elige una casilla',tie:'¡Empate!',champion:'¡es Campeón! 🏆',stoneColor:'Color de piedras',modeAuto:'⚡ Auto',modeManuel:'👆 Manual',manuelHint:'Toca la casilla siguiente',stonesLeft:'piedras en mano',settings:'Ajustes',autoDesc:'Distribución automática',manuelDesc:'Colocas cada piedra',creerSession:'Crear sesión',creerDesc:'Genera un código para invitar a tu oponente',entrerCode:'INGRESAR CÓDIGO',placeholder:'Ej: ABC123',rejoindre:'Unirse →',connectes:'¡Conectados!',attente:'Esperando...',partagerCode:'Comparte este código:',commencer:'🚀 Empezar →',retour:'← Volver',waitingTurn:'Esperando a tu oponente...',},
  ht:{title:'Kay',subtitle:'Jwèt estrateji pou de moun',player1:'Jwè 1',player2:'Jwè 2',yourTurn:'SE VIRE OU!',round:'Manche',gameOver:'Manche fini!',wins:'genyen!',nextRound:'Pwochen manche →',casesLeft:'kaz',penalty:'pèdi yon kaz!',restart:'Jwe ankò',tapToPlay:'Chwazi yon kaz',tie:'Egalite!',champion:'se Chanpyon! 🏆',stoneColor:'Koulè wòch',modeAuto:'⚡ Otomatik',modeManuel:'👆 Manyèl',manuelHint:'Touche kaz suivant',stonesLeft:'wòch nan men',settings:'Paramèt',autoDesc:'Distribisyon otomatik',manuelDesc:'Ou mete chak wòch',creerSession:'Kreye sesyon',creerDesc:'Jenere yon kòd pou envite adversè ou',entrerCode:'ANTRE KÒD LA',placeholder:'Egz: ABC123',rejoindre:'Rantre →',connectes:'Konekte!',attente:'Ap tann...',partagerCode:'Pataje kòd sa:',commencer:'🚀 Kòmanse →',retour:'← Tounen',waitingTurn:'Ap tann adversè ou...',},
};

// ══════════════════════════════════════════════
//  TRADUCTIONS DEVINE
// ══════════════════════════════════════════════
const TD={
  fr:{title:'Devine !',subtitle:'Le jeu des questions',createSession:'Créer une session',joinSession:'Rejoindre',codePlaceholder:'Code de session',waitingPartner:'En attente de ton partenaire...',shareCode:'Partage ce code :',chooseMode:'Choisir le mode',modeIA:'🤖 L\'IA choisit',modeManuel:'🧠 Je pense à quelque chose',modeIADesc:'L\'IA génère un mot — J1 le voit, J2 devine',modeManuelDesc:'J1 pense à quelque chose — J2 pose des questions',modePersoDesc:'J1 choisit un mot — J2 devine',modePerso:'✏️ Je choisis un mot',chooseCategory:'Choisir une catégorie',enterWord:'Entre le mot secret',wordPlaceholder:'Ton mot secret...',youAreJ1:'Tu es J1 — Tu connais le mot',youAreJ2:'Tu es J2 — Tu vas deviner !',theWordIs:'Le mot secret est :',keepSecret:'Ne le montre pas à J2 !',questionPlaceholder:'Pose ta question...',sendQuestion:'Envoyer →',answerYes:'✅ Oui',answerNo:'❌ Non',answerSometimes:'🤔 Parfois',waitingQuestion:'J2 prépare une question...',waitingAnswer:'J1 répond...',tryGuess:'Je devine !',guessBtnLabel:'Ma réponse :',guessPlaceholder:'Entre ta réponse...',confirmGuess:'Confirmer →',correctGuess:'🎉 Bravo ! Tu as trouvé !',wrongGuess:'❌ Mauvaise réponse ! Continue...',giveUp:'🏳️ Abandonner',giveUpConfirm:'Le mot était :',j2wins:'J2 a gagné !',j1wins:'J1 a gagné !',playAgain:'Rejouer →',questions:'questions posées',back:'← Retour',waitJ1:'Attends que J1 soit prêt...',iAmReady:'Je suis prêt →',history:'Historique',q:'Q',chooseTimer:'Choisir le temps',sec90:'1 min 30',sec180:'3 minutes',sec360:'6 minutes',timeUp:'⏱️ Temps écoulé !',confirmWord:'Confirmer →'},
  en:{title:'Guess It!',subtitle:'The questions game',createSession:'Create session',joinSession:'Join',codePlaceholder:'Session code',waitingPartner:'Waiting for your partner...',shareCode:'Share this code:',chooseMode:'Choose mode',modeIA:'🤖 AI chooses',modeManuel:'🧠 I\'ll think of something',modeIADesc:'AI picks a word — J1 sees it, J2 guesses',modeManuelDesc:'J1 thinks of something — J2 asks questions',modePersoDesc:'J1 picks a word — J2 guesses',modePerso:'✏️ I choose a word',chooseCategory:'Choose a category',enterWord:'Enter the secret word',wordPlaceholder:'Your secret word...',youAreJ1:'You are J1 — You know the word',youAreJ2:'You are J2 — You will guess!',theWordIs:'The secret word is:',keepSecret:'Don\'t show J2!',questionPlaceholder:'Ask your question...',sendQuestion:'Send →',answerYes:'✅ Yes',answerNo:'❌ No',answerSometimes:'🤔 Sometimes',waitingQuestion:'J2 is preparing a question...',waitingAnswer:'J1 is answering...',tryGuess:'Guess!',guessBtnLabel:'My answer:',guessPlaceholder:'Enter your answer...',confirmGuess:'Confirm →',correctGuess:'🎉 Correct! You found it!',wrongGuess:'❌ Wrong! Keep going...',giveUp:'🏳️ Give up',giveUpConfirm:'The word was:',j2wins:'J2 wins!',j1wins:'J1 wins!',playAgain:'Play again →',questions:'questions asked',back:'← Back',waitJ1:'Wait for J1 to be ready...',iAmReady:'I\'m ready →',history:'History',q:'Q',chooseTimer:'Choose time',sec90:'1 min 30',sec180:'3 minutes',sec360:'6 minutes',timeUp:'⏱️ Time\'s up!',confirmWord:'Confirm →'},
  es:{title:'¡Adivina!',subtitle:'El juego de preguntas',createSession:'Crear sesión',joinSession:'Unirse',codePlaceholder:'Código de sesión',waitingPartner:'Esperando a tu pareja...',shareCode:'Comparte este código:',chooseMode:'Elegir modo',modeIA:'🤖 La IA elige',modeManuel:'🧠 Yo pienso algo',modeIADesc:'La IA elige una palabra — J1 la ve, J2 adivina',modeManuelDesc:'J1 piensa algo — J2 hace preguntas',modePersoDesc:'J1 elige una palabra — J2 adivina',modePerso:'✏️ Elijo una palabra',chooseCategory:'Elegir categoría',enterWord:'Ingresa la palabra secreta',wordPlaceholder:'Tu palabra secreta...',youAreJ1:'Eres J1 — Conoces la palabra',youAreJ2:'Eres J2 — ¡Vas a adivinar!',theWordIs:'La palabra secreta es:',keepSecret:'¡No se la muestres a J2!',questionPlaceholder:'Haz tu pregunta...',sendQuestion:'Enviar →',answerYes:'✅ Sí',answerNo:'❌ No',answerSometimes:'🤔 A veces',waitingQuestion:'J2 está preparando una pregunta...',waitingAnswer:'J1 está respondiendo...',tryGuess:'¡Adivino!',guessBtnLabel:'Mi respuesta:',guessPlaceholder:'Ingresa tu respuesta...',confirmGuess:'Confirmar →',correctGuess:'🎉 ¡Correcto!',wrongGuess:'❌ ¡Incorrecto! Continúa...',giveUp:'🏳️ Rendirse',giveUpConfirm:'La palabra era:',j2wins:'¡J2 gana!',j1wins:'¡J1 gana!',playAgain:'Jugar de nuevo →',questions:'preguntas hechas',back:'← Volver',waitJ1:'Espera a que J1 esté listo...',iAmReady:'Estoy listo →',history:'Historial',q:'P',chooseTimer:'Elegir tiempo',sec90:'1 min 30',sec180:'3 minutos',sec360:'6 minutos',timeUp:'⏱️ ¡Tiempo!',confirmWord:'Confirmar →'},
  ht:{title:'Devine!',subtitle:'Jwèt kesyon yo',createSession:'Kreye sesyon',joinSession:'Rantre',codePlaceholder:'Kòd sesyon',waitingPartner:'Ap tann patnè ou...',shareCode:'Pataje kòd sa:',chooseMode:'Chwazi mòd',modeIA:'🤖 IA chwazi',modeManuel:'🧠 Mwen panse yon bagay',modeIADesc:'IA chwazi yon mo — J1 wè li, J2 devine',modeManuelDesc:'J1 panse yon bagay — J2 poze kesyon',modePersoDesc:'J1 chwazi yon mo — J2 devine',modePerso:'✏️ Mwen chwazi yon mo',chooseCategory:'Chwazi kategori',enterWord:'Antre mo sekrè a',wordPlaceholder:'Mo sekrè ou...',youAreJ1:'Ou se J1 — Ou konnen mo a',youAreJ2:'Ou se J2 — Ou pral devine!',theWordIs:'Mo sekrè a se:',keepSecret:'Pa montre J2!',questionPlaceholder:'Poze kesyon ou...',sendQuestion:'Voye →',answerYes:'✅ Wi',answerNo:'❌ Non',answerSometimes:'🤔 Pafwa',waitingQuestion:'J2 ap prepare yon kesyon...',waitingAnswer:'J1 ap reponn...',tryGuess:'Mwen devine!',guessBtnLabel:'Repons mwen:',guessPlaceholder:'Antre repons ou...',confirmGuess:'Konfime →',correctGuess:'🎉 Bravo! Ou jwenn li!',wrongGuess:'❌ Pa bon! Kontinye...',giveUp:'🏳️ Abandone',giveUpConfirm:'Mo a te:',j2wins:'J2 genyen!',j1wins:'J1 genyen!',playAgain:'Jwe ankò →',questions:'kesyon poze',back:'← Tounen',waitJ1:'Tann J1 pare...',iAmReady:'Mwen pare →',history:'Istwa',q:'K',chooseTimer:'Chwazi tan',sec90:'1 min 30',sec180:'3 minit',sec360:'6 minit',timeUp:'⏱️ Tan fini!',confirmWord:'Konfime →'},
};

// ══════════════════════════════════════════════
//  DONNÉES QUIZ
// ══════════════════════════════════════════════
const FALLBACK=[
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

const NIVEAUX={
  fr:[{id:'doux',emoji:'🌸',nom:'Se connaître',desc:'Questions douces et tendres',couleur:'#10D9A0'},{id:'intense',emoji:'🔥',nom:'Intense',desc:"Mettre le couple à l'épreuve",couleur:'#F5A623'},{id:'dark',emoji:'🌑',nom:'Dark',desc:'Questions sombres et philosophiques',couleur:'#7C3AED'},{id:'coquin',emoji:'🍑',nom:'Coquin 🔞',desc:'Sexuel et intense — adultes seulement',couleur:'#FF3D6B'}],
  en:[{id:'doux',emoji:'🌸',nom:'Get to know',desc:'Sweet and tender questions',couleur:'#10D9A0'},{id:'intense',emoji:'🔥',nom:'Intense',desc:'Put the couple to the test',couleur:'#F5A623'},{id:'dark',emoji:'🌑',nom:'Dark',desc:'Dark and philosophical questions',couleur:'#7C3AED'},{id:'coquin',emoji:'🍑',nom:'Naughty 🔞',desc:'Sexual and intense — adults only',couleur:'#FF3D6B'}],
  es:[{id:'doux',emoji:'🌸',nom:'Conocerse',desc:'Preguntas dulces y tiernas',couleur:'#10D9A0'},{id:'intense',emoji:'🔥',nom:'Intenso',desc:'Poner la pareja a prueba',couleur:'#F5A623'},{id:'dark',emoji:'🌑',nom:'Oscuro',desc:'Preguntas oscuras y filosóficas',couleur:'#7C3AED'},{id:'coquin',emoji:'🍑',nom:'Picante 🔞',desc:'Sexual e intenso — solo adultos',couleur:'#FF3D6B'}],
  ht:[{id:'doux',emoji:'🌸',nom:'Konnen youn lòt',desc:'Kesyon dou ak tandr',couleur:'#10D9A0'},{id:'intense',emoji:'🔥',nom:'Entans',desc:'Mete koup la à leprèv',couleur:'#F5A623'},{id:'dark',emoji:'🌑',nom:'Nwa',desc:'Kesyon fon ak filozofik',couleur:'#7C3AED'},{id:'coquin',emoji:'🍑',nom:'Koken 🔞',desc:'Seksyèl — granmoun sèlman',couleur:'#FF3D6B'}],
};

const CATS={
  fr:['💕 Complicité','🌙 Intimité','✈️ Distance','🔮 Rêves futurs','😂 Humour','🌱 Valeurs','💋 Séduction','🏠 Famille','🧳 Aventure'],
  en:['💕 Complicity','🌙 Intimacy','✈️ Distance','🔮 Future dreams','😂 Humor','🌱 Values','💋 Seduction','🏠 Family','🧳 Adventure'],
  es:['💕 Complicidad','🌙 Intimidad','✈️ Distancia','🔮 Sueños futuros','😂 Humor','🌱 Valores','💋 Seducción','🏠 Familia','🧳 Aventura'],
  ht:['💕 Konplisite','🌙 Entimite','✈️ Distans','🔮 Rèv pou demen','😂 Imè','🌱 Valè','💋 Sediksyon','🏠 Fanmi','🧳 Avanti'],
};

const LETTRES=['A','B','C','D'];

async function genererQuestion(langue,categorie,niveau,historique=[]){
  try{const r=await fetch(API_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({langue,categorie,niveau,historique})});const d=await r.json();if(d.ok&&d.question)return d.question;throw new Error();}
  catch(e){const used=historique.slice(-10);const dispo=FALLBACK.filter(q=>!used.includes(q.t));const pool=dispo.length>0?dispo:FALLBACK;return pool[Math.floor(Math.random()*pool.length)];}
}
async function getHistorique(code){try{const d=await fbGet(`sessions/${code}/historique`);return d?Object.values(d):[];}catch(e){return[];}}
async function ajouterHistorique(code,texte){try{await fbPush(`sessions/${code}/historique`,texte);}catch(e){}}

// ══════════════════════════════════════════════
//  DONNÉES DEVINE
// ══════════════════════════════════════════════
const DEVINE_MOTS={
  fr:{"📦 Objets":["téléphone","chaise","voiture","livre","miroir","parapluie","montre","lunettes","clé","lampe","sac","guitare","ordinateur","vélo","bougie"],"🐾 Animaux":["éléphant","requin","papillon","lion","perroquet","dauphin","girafe","pingouin","tigre","koala","aigle","serpent","lapin","loup","panda"],"⭐ Célébrités":["Michael Jackson","Beyoncé","Cristiano Ronaldo","Oprah Winfrey","Leonardo DiCaprio","Rihanna","LeBron James","Taylor Swift","Barack Obama","Shakira"],"🗺️ Lieux":["Paris","New York","Tokyo","Pyramides d'Égypte","Tour Eiffel","Amazonie","Sahara","Hollywood","Venise","Machu Picchu"],"🍕 Nourriture":["pizza","sushi","chocolat","mangue","homard","croissant","ramen","tacos","glace","ananas"]},
  en:{"📦 Objects":["phone","chair","car","book","mirror","umbrella","watch","glasses","key","lamp","bag","guitar","computer","bicycle","candle"],"🐾 Animals":["elephant","shark","butterfly","lion","parrot","dolphin","giraffe","penguin","tiger","koala","eagle","snake","rabbit","wolf","panda"],"⭐ Celebrities":["Michael Jackson","Beyoncé","Cristiano Ronaldo","Oprah Winfrey","Leonardo DiCaprio","Rihanna","LeBron James","Taylor Swift","Barack Obama","Shakira"],"🗺️ Places":["Paris","New York","Tokyo","Egyptian Pyramids","Eiffel Tower","Amazon","Sahara","Hollywood","Venice","Machu Picchu"],"🍕 Food":["pizza","sushi","chocolate","mango","lobster","croissant","ramen","tacos","ice cream","pineapple"]},
  es:{"📦 Objetos":["teléfono","silla","coche","libro","espejo","paraguas","reloj","gafas","llave","lámpara","bolso","guitarra","computadora","bicicleta","vela"],"🐾 Animales":["elefante","tiburón","mariposa","león","loro","delfín","jirafa","pingüino","tigre","koala","águila","serpiente","conejo","lobo","panda"],"⭐ Celebridades":["Michael Jackson","Beyoncé","Cristiano Ronaldo","Oprah Winfrey","Leonardo DiCaprio","Rihanna","LeBron James","Taylor Swift","Barack Obama","Shakira"],"🗺️ Lugares":["París","Nueva York","Tokio","Pirámides de Egipto","Torre Eiffel","Amazonia","Sahara","Hollywood","Venecia","Machu Picchu"],"🍕 Comida":["pizza","sushi","chocolate","mango","langosta","croissant","ramen","tacos","helado","piña"]},
  ht:{"📦 Objè":["telefòn","chèz","machin","liv","glas","parapli","mont","linèt","kle","lanp","sak","gita","òdinatè","bisiklèt","bouji"],"🐾 Bèt":["elefan","reken","papiyon","lyon","pèwòch","dofin","jiraf","pengwen","tig","koala","èg","sèpan","lapen","loup","panda"],"⭐ Selebrite":["Michael Jackson","Beyoncé","Cristiano Ronaldo","Oprah Winfrey","Leonardo DiCaprio","Rihanna","LeBron James","Taylor Swift","Barack Obama","Shakira"],"🗺️ Kote":["Pari","New York","Tokyo","Piramid Ejip","Tou Eifèl","Amazoni","Sahara","Hollywood","Veniz","Machu Picchu"],"🍕 Manje":["pizza","sushi","chokola","mango","omaren","kwasan","ramen","tacos","krèm glas","anana"]},
};

// ══════════════════════════════════════════════
//  KAY — CONSTANTES
// ══════════════════════════════════════════════
const KAY_STONE_COLORS={
  rouge:{main:"#FF3D6B",glow:"#FF3D6B55"},or:{main:"#F5A623",glow:"#F5A62355"},
  violet:{main:"#A78BFA",glow:"#A78BFA55"},blanc:{main:"#F9F2E7",glow:"#F9F2E755"},
  rose:{main:"#FF6B9D",glow:"#FF6B9D55"},cyan:{main:"#10D9A0",glow:"#10D9A055"},
};
const KAY_MAX=5,KAY_INIT=4,KAY_END=4,KAY_DELAY=520,KAY_PAUSE_C=1400,KAY_PAUSE_CAP=800;
function kaySleep(ms){return new Promise(r=>setTimeout(r,ms));}
function kayInitBoard(n1,n2){return{p1:Array(n1).fill(KAY_INIT),p2:Array(n2).fill(KAY_INIT)};}
function kayTotal(b){return b.p1.reduce((a,v)=>a+v,0)+b.p2.reduce((a,v)=>a+v,0);}

// ══════════════════════════════════════════════
//  ÉCRAN : CHOIX LANGUE
// ══════════════════════════════════════════════
function ChoixLangue({onChoisir}){
  return(
    <View style={s.centre}>
      <Text style={s.bigE}>💞</Text>
      <Text style={s.titre1}>LoveLink</Text>
      <Text style={[s.sous,{marginBottom:30}]}>Choose your language · Choisissez</Text>
      {LANGUES.map(l=>(
        <TouchableOpacity key={l.id} style={s.langueBtn} onPress={()=>onChoisir(l.id)}>
          <Text style={{fontSize:28}}>{l.drapeau}</Text>
          <Text style={s.langueNom}>{l.nom}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ══════════════════════════════════════════════
//  ÉCRAN : ACCUEIL AVEC 3 JEUX + DESCRIPTIONS
// ══════════════════════════════════════════════
function Accueil({langue,onJeu,onChangerLangue}){
  const tg=TG[langue]||TG.fr;
  const [iaOk,setIaOk]=useState(null);
  const [modalJeu,setModalJeu]=useState(null);

  useEffect(()=>{
    fetch(API_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({langue:'fr',categorie:'test',niveau:'doux',historique:[]})})
      .then(r=>setIaOk(r.ok)).catch(()=>setIaOk(false));
  },[]);

  const jeux=[
    {id:'quiz',emoji:'💞',nom:tg.quiz,desc:tg.quizDesc,how:tg.quizHow,couleur:'#FF3D6B'},
    {id:'kay', emoji:'🪨',nom:tg.kay, desc:tg.kayDesc, how:tg.kayHow, couleur:'#F5A623'},
    {id:'devine',emoji:'🔍',nom:tg.devine,desc:tg.devineDesc,how:tg.devineHow,couleur:'#10D9A0'},
  ];

  return(
    <ScrollView style={s.ecran} contentContainerStyle={[s.ecranC,{alignItems:'center',paddingTop:40}]}>
      <TouchableOpacity style={s.langueTag} onPress={onChangerLangue}>
        <Text style={s.langueTagTxt}>{tg.langue}</Text>
      </TouchableOpacity>
      <Text style={s.bigE}>💞</Text>
      <Text style={s.titre1}>LoveLink</Text>
      {iaOk!==null&&(
        <View style={[s.iaBadge,{backgroundColor:iaOk?'rgba(16,217,160,0.1)':'rgba(245,166,35,0.1)',borderColor:iaOk?'rgba(16,217,160,0.4)':'rgba(245,166,35,0.4)',marginBottom:24}]}>
          <Text style={{color:iaOk?'#10D9A0':'#F5A623',fontSize:11}}>{iaOk?tg.iaActif:tg.iaNonDispo}</Text>
        </View>
      )}
      <Text style={[s.sous,{marginBottom:20}]}>{tg.chooseGame}</Text>
      {jeux.map(j=>(
        <View key={j.id} style={[s.jeuCard,{borderColor:`${j.couleur}40`}]}>
          <TouchableOpacity style={{flex:1,flexDirection:'row',alignItems:'center',gap:14}} onPress={()=>onJeu(j.id)}>
            <View style={[s.jeuEmoji,{backgroundColor:`${j.couleur}20`}]}>
              <Text style={{fontSize:30}}>{j.emoji}</Text>
            </View>
            <View style={{flex:1}}>
              <Text style={[s.jeuNom,{color:j.couleur}]}>{j.nom}</Text>
              <Text style={s.jeuDesc}>{j.desc}</Text>
            </View>
            <Text style={{color:`${j.couleur}80`,fontSize:20}}>›</Text>
          </TouchableOpacity>
          {/* Bouton "Comment jouer" */}
          <TouchableOpacity onPress={()=>setModalJeu(j)} style={{marginTop:10,paddingTop:10,borderTopWidth:1,borderTopColor:'rgba(255,255,255,0.06)',alignItems:'center'}}>
            <Text style={{color:`${j.couleur}aa`,fontSize:11,letterSpacing:1}}>ℹ️ {tg.howToPlay}</Text>
          </TouchableOpacity>
        </View>
      ))}

      {/* Modal description */}
      <Modal visible={!!modalJeu} transparent animationType="fade" onRequestClose={()=>setModalJeu(null)}>
        <View style={{flex:1,backgroundColor:'rgba(14,10,20,0.92)',alignItems:'center',justifyContent:'center',padding:24}}>
          {modalJeu&&(
            <View style={{backgroundColor:'#1A1225',borderWidth:1,borderColor:`${modalJeu.couleur}40`,borderRadius:24,padding:24,width:'100%',maxWidth:340}}>
              <View style={{flexDirection:'row',alignItems:'center',gap:12,marginBottom:16}}>
                <View style={{width:48,height:48,borderRadius:14,backgroundColor:`${modalJeu.couleur}20`,alignItems:'center',justifyContent:'center'}}>
                  <Text style={{fontSize:26}}>{modalJeu.emoji}</Text>
                </View>
                <Text style={{fontSize:20,fontWeight:'900',color:'#F9F2E7'}}>{modalJeu.nom}</Text>
              </View>
              <Text style={{color:'rgba(249,242,231,0.7)',fontSize:14,lineHeight:24}}>{modalJeu.how}</Text>
              <TouchableOpacity onPress={()=>setModalJeu(null)} style={[s.btnR,{marginTop:20,backgroundColor:modalJeu.couleur}]}>
                <Text style={s.btnRT}>{tg.close}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </ScrollView>
  );
}

// ══════════════════════════════════════════════
//  QUIZ — ÉCRANS
// ══════════════════════════════════════════════
function QuizConnexion({t,onRetour,onDemarrer}){
  const [mode,setMode]=useState(null);
  const [code,setCode]=useState('');
  const [monCode]=useState(genCode());
  const [connecte,setConnecte]=useState(false);
  const unsubRef=useRef(null);

  async function creer(){
    setMode('creer');
    await fbSet(`sessions/${monCode}`,{j1:'ok',j2:null,ts:Date.now()});
    unsubRef.current=fbListen(`sessions/${monCode}/j2`,val=>{if(val==='ok'){setConnecte(true);if(unsubRef.current)unsubRef.current();}});
  }
  async function rejoindre(){
    if(code.length<4){Alert.alert('!','Entre le code de ton partenaire');return;}
    await fbSet(`sessions/${code}/j2`,'ok');onDemarrer(code,false);
  }
  useEffect(()=>()=>{if(unsubRef.current)unsubRef.current();},[]);

  if(mode==='creer') return(
    <View style={s.centre}>
      <Text style={s.bigE}>{connecte?'🎉':'⏳'}</Text>
      <Text style={s.titre2}>{connecte?t.connectes:t.attente}</Text>
      {!connecte&&<><Text style={s.desc}>{t.partagerCode}</Text><View style={s.codeBox}><Text style={s.codeTxt}>{monCode}</Text></View><ActivityIndicator color="#FF3D6B" size="large" style={{marginTop:16}}/></>}
      {connecte&&<TouchableOpacity style={s.btnR} onPress={()=>onDemarrer(monCode,true)}><Text style={s.btnRT}>{t.commencer}</Text></TouchableOpacity>}
      <TouchableOpacity style={[s.btnV,{marginTop:20}]} onPress={onRetour}><Text style={s.btnVT}>{t.retour}</Text></TouchableOpacity>
    </View>
  );

  return(
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
        <TextInput style={s.input} placeholder={t.placeholder} placeholderTextColor="rgba(249,242,231,0.3)" value={code} onChangeText={v=>setCode(v.toUpperCase())} maxLength={6} autoCapitalize="characters"/>
        <TouchableOpacity style={s.btnR} onPress={rejoindre}><Text style={s.btnRT}>{t.rejoindre}</Text></TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function ChoixNiveau({t,langue,sessionCode,estJ1,onDemarrer}){
  const [niveau,setNiveau]=useState(null);
  const [categorie,setCategorie]=useState(null);
  const niveaux=NIVEAUX[langue]||NIVEAUX.fr;
  const cats=CATS[langue]||CATS.fr;
  const unsubRef=useRef(null);

  useEffect(()=>{
    if(!estJ1){
      unsubRef.current=fbListen(`sessions/${sessionCode}/config`,val=>{if(val?.niveau&&val?.categorie&&val?.confirme){onDemarrer(val.niveau,val.categorie);if(unsubRef.current)unsubRef.current();}});
      return()=>{if(unsubRef.current)unsubRef.current();};
    }
  },[]);

  async function confirmer(){
    if(!niveau||!categorie){Alert.alert('!','Choisissez un niveau et une catégorie');return;}
    await fbSet(`sessions/${sessionCode}/config`,{niveau:niveau.id,categorie,confirme:true});
    onDemarrer(niveau.id,categorie);
  }

  if(!estJ1) return(<View style={s.centre}><Text style={s.bigE}>⏳</Text><Text style={s.titre2}>{t.partnerChoosing}</Text><ActivityIndicator color="#FF3D6B" size="large" style={{marginTop:20}}/></View>);

  return(
    <ScrollView style={s.ecran} contentContainerStyle={s.ecranC}>
      <Text style={[s.titre2,{marginTop:10}]}>{t.choisirEnsemble}</Text>
      <Text style={s.label}>{t.niveauIntensite}</Text>
      <View style={{gap:10,marginBottom:20}}>
        {niveaux.map(n=>(
          <TouchableOpacity key={n.id} style={[s.niveauCard,niveau?.id===n.id&&{borderColor:n.couleur,backgroundColor:`${n.couleur}15`}]} onPress={()=>setNiveau(n)}>
            <View style={{flexDirection:'row',alignItems:'center',gap:12}}>
              <Text style={{fontSize:32}}>{n.emoji}</Text>
              <View style={{flex:1}}><Text style={[s.niveauNom,niveau?.id===n.id&&{color:n.couleur}]}>{n.nom}</Text><Text style={s.niveauDesc}>{n.desc}</Text></View>
              {niveau?.id===n.id&&<Text style={{color:n.couleur,fontSize:20}}>✓</Text>}
            </View>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={s.label}>{t.categorie}</Text>
      <View style={{flexDirection:'row',flexWrap:'wrap',gap:10,marginBottom:24}}>
        {cats.map(c=>{
          const actif=categorie===c;
          const parts=c.split(' ');
          return(<TouchableOpacity key={c} style={[s.catPill,actif&&s.catPillActif]} onPress={()=>setCategorie(c)}><Text style={{fontSize:20}}>{parts[0]}</Text><Text style={[s.catNom,actif&&{color:'#F9F2E7'}]}>{parts.slice(1).join(' ')}</Text></TouchableOpacity>);
        })}
      </View>
      <TouchableOpacity style={[s.btnR,(!niveau||!categorie)&&{opacity:0.4}]} onPress={confirmer}><Text style={s.btnRT}>{t.lancerQuiz}</Text></TouchableOpacity>
    </ScrollView>
  );
}

function Quiz({t,langue,sessionCode,estJ1,niveauId,categorieKey,onFin}){
  const [q,setQ]=useState(null);
  const [load,setLoad]=useState(true);
  const [choisi,setChoisi]=useState(null);
  const [choixP,setChoixP]=useState(null);
  const [num,setNum]=useState(1);
  const [modePerso,setModePerso]=useState(false);
  const [reponsePerso,setReponsePerso]=useState('');
  const unsubRef=useRef(null);
  const maCle=estJ1?'rep1':'rep2';
  const pCle=estJ1?'rep2':'rep1';
  const niveaux=NIVEAUX[langue]||NIVEAUX.fr;
  const niveau=niveaux.find(n=>n.id===niveauId)||niveaux[0];

  useEffect(()=>{
    setLoad(true);setChoisi(null);setChoixP(null);setModePerso(false);setReponsePerso('');
    if(unsubRef.current)unsubRef.current();
    unsubRef.current=fbListen(`sessions/${sessionCode}/q${num}/${pCle}`,val=>{if(val!==null&&val!==undefined)setChoixP(val);});
    charger();
    return()=>{if(unsubRef.current)unsubRef.current();};
  },[num]);

  async function charger(){
    if(estJ1){const hist=await getHistorique(sessionCode);const question=await genererQuestion(langue,categorieKey,niveauId,hist);await ajouterHistorique(sessionCode,question.t);await fbSet(`sessions/${sessionCode}/questions/q${num}`,question);setQ(question);setLoad(false);}
    else{let att=0;const poll=setInterval(async()=>{att++;const val=await fbGet(`sessions/${sessionCode}/questions/q${num}`);if(val){setQ(val);setLoad(false);clearInterval(poll);}if(att>40)clearInterval(poll);},1500);}
  }

  async function choisir(index,textePerso=null){
    if(choisi!==null)return;
    const valeur=textePerso?`perso:${textePerso}`:index;
    setChoisi(valeur);await fbSet(`sessions/${sessionCode}/q${num}/${maCle}`,valeur);setModePerso(false);
  }
  async function validerPerso(){if(!reponsePerso.trim())return;await choisir(4,reponsePerso.trim());}

  const lesDeux=choisi!==null&&choixP!==null;
  const memeReponse=lesDeux&&choisi===choixP;

  if(load||!q) return(<View style={s.centre}><ActivityIndicator color={niveau.couleur} size="large"/><Text style={[s.desc,{marginTop:16}]}>{t.generating}</Text></View>);

  return(
    <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':'height'}>
      <ScrollView style={s.ecran} contentContainerStyle={s.ecranC}>
        <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
          <View style={[s.niveauBadge,{borderColor:`${niveau.couleur}50`,backgroundColor:`${niveau.couleur}15`}]}>
            <Text style={{fontSize:12}}>{niveau.emoji}</Text>
            <Text style={[s.niveauBadgeTxt,{color:niveau.couleur}]}>{niveau.nom}</Text>
          </View>
          <TouchableOpacity onPress={()=>onFin(num)} style={s.btnFin}><Text style={s.btnFinT}>{t.resume}</Text></TouchableOpacity>
        </View>
        <Text style={{color:'rgba(249,242,231,0.3)',fontSize:11,marginBottom:14,textAlign:'center'}}>Q{num} · {categorieKey}</Text>
        <View style={[s.carteQ,{borderColor:`${niveau.couleur}30`}]}>
          <Text style={{fontSize:46,marginBottom:8}}>{q.e}</Text>
          <Text style={{color:'#F9F2E7',fontSize:18,fontWeight:'600',textAlign:'center',lineHeight:28}}>{q.t}</Text>
        </View>
        {!modePerso&&(
          <View style={{gap:9,marginBottom:10}}>
            {(q.r||[]).map((r,i)=>{
              let st=[s.repN];
              if(lesDeux&&choisi===i&&choixP===i)st=[s.repN,s.repM];
              else if(choisi===i)st=[s.repN,s.repC];
              else if(lesDeux&&choixP===i)st=[s.repN,s.repP];
              return(<TouchableOpacity key={i} style={st} onPress={()=>choisir(i)} disabled={choisi!==null}><View style={[s.lettre,choisi===i&&{backgroundColor:niveau.couleur,borderColor:niveau.couleur}]}><Text style={{color:'#F9F2E7',fontSize:11,fontWeight:'700'}}>{LETTRES[i]}</Text></View><Text style={{color:'#F9F2E7',fontSize:14,flex:1,lineHeight:20}}>{r}</Text>{lesDeux&&choixP===i&&<Text style={{fontSize:16}}>👩</Text>}</TouchableOpacity>);
            })}
            {choisi===null&&(<TouchableOpacity style={[s.repN,{borderColor:'rgba(245,166,35,0.4)',backgroundColor:'rgba(245,166,35,0.06)'}]} onPress={()=>setModePerso(true)}><View style={[s.lettre,{borderColor:'rgba(245,166,35,0.4)'}]}><Text style={{color:'#F5A623',fontSize:14}}>✏️</Text></View><Text style={{color:'#F5A623',fontSize:14,flex:1}}>{t.autreReponse}</Text></TouchableOpacity>)}
          </View>
        )}
        {modePerso&&choisi===null&&(<View style={s.persoBox}><TextInput style={s.persoInput} placeholder={t.ecrireTa} placeholderTextColor="rgba(249,242,231,0.3)" value={reponsePerso} onChangeText={setReponsePerso} multiline autoFocus/><View style={{flexDirection:'row',gap:10,marginTop:10}}><TouchableOpacity style={[s.btnV,{flex:1,marginTop:0}]} onPress={()=>setModePerso(false)}><Text style={s.btnVT}>← Retour</Text></TouchableOpacity><TouchableOpacity style={[s.btnR,{flex:1,marginBottom:0}]} onPress={validerPerso}><Text style={s.btnRT}>{t.valider}</Text></TouchableOpacity></View></View>)}
        {!lesDeux&&<View style={s.msgBox}><Text style={s.msgTxt}>{choisi===null?t.choixReponse:t.attentePartner}</Text></View>}
        {lesDeux&&(<View style={[s.msgBox,{borderColor:memeReponse?'rgba(16,217,160,0.4)':'rgba(245,166,35,0.4)',backgroundColor:memeReponse?'rgba(16,217,160,0.08)':'rgba(245,166,35,0.08)'}]}><Text style={[s.msgTxt,{color:memeReponse?'#10D9A0':'#F5A623',fontWeight:'700',fontSize:15}]}>{memeReponse?t.memeReponse:t.parlezEnsemble}</Text><Text style={[s.msgTxt,{marginTop:6,fontSize:12}]}>{memeReponse?t.complicite:t.differences}</Text></View>)}
        {lesDeux&&<TouchableOpacity style={[s.btnR,{marginTop:16,backgroundColor:niveau.couleur}]} onPress={()=>setNum(n=>n+1)}><Text style={s.btnRT}>{t.questionSuivante}</Text></TouchableOpacity>}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function QuizResume({t,langue,nombreQ,onChanger,onAccueil}){
  const niveaux=NIVEAUX[langue]||NIVEAUX.fr;
  return(
    <ScrollView style={s.ecran} contentContainerStyle={[s.ecranC,{alignItems:'center'}]}>
      <Text style={[s.bigE,{marginTop:20}]}>💞</Text>
      <Text style={s.titre2}>{t.sessionTerminee}</Text>
      <Text style={s.desc}>{nombreQ} {t.questionsExplo}</Text>
      <View style={s.messageFinal}><Text style={{fontSize:32,marginBottom:12}}>💌</Text><Text style={{color:'#F9F2E7',fontSize:15,textAlign:'center',lineHeight:24,fontWeight:'500'}}>Chaque question vous rapproche,{'\n'}même à des milliers de kilomètres. 💕</Text></View>
      <Text style={[s.label,{marginBottom:12}]}>{t.continuer}</Text>
      {niveaux.map(n=>(<TouchableOpacity key={n.id} style={[s.btnR,{backgroundColor:n.couleur,marginBottom:10}]} onPress={()=>onChanger(n.id)}><Text style={s.btnRT}>{n.emoji} {n.nom}</Text></TouchableOpacity>))}
      <TouchableOpacity style={s.btnV} onPress={onAccueil}><Text style={s.btnVT}>{t.accueil}</Text></TouchableOpacity>
    </ScrollView>
  );
}

// ══════════════════════════════════════════════
//  KAY — COMPOSANT PIT
// ══════════════════════════════════════════════
function KayPit({stones,isActive,isSelected,isLanding,isCaptured,isPaused,isNextManuel,onPress,disabled,player,color,p1Color,p2Color}){
  const border=player===1?p1Color:p2Color;
  let bg='rgba(255,255,255,0.03)',bc='rgba(255,255,255,0.07)',sc=1;
  if(isCaptured){bg=`${color.main}35`;bc=color.main;sc=1.08;}
  else if(isNextManuel){bg='rgba(255,255,255,0.18)';bc='rgba(255,255,255,0.7)';sc=1.1;}
  else if(isSelected){bg='rgba(255,255,255,0.14)';bc=border;sc=1.1;}
  else if(isLanding){bg=`${color.main}20`;bc=`${color.main}cc`;sc=1.06;}
  else if(isPaused){bg='rgba(255,255,255,0.12)';bc='rgba(255,255,255,0.5)';sc=1.05;}
  else if(isActive){bg='rgba(255,255,255,0.07)';bc='rgba(255,255,255,0.2)';}
  return(
    <TouchableOpacity onPress={disabled?null:onPress} activeOpacity={disabled?1:0.7}
      style={{width:52,height:52,borderRadius:26,backgroundColor:bg,borderWidth:1.5,borderColor:bc,transform:[{scale:sc}],alignItems:'center',justifyContent:'center',padding:6,overflow:'hidden'}}>
      <View style={{flexDirection:'row',flexWrap:'wrap',gap:2,justifyContent:'center',alignItems:'center'}}>
        {Array(Math.min(stones,9)).fill(0).map((_,i)=>(
          <View key={i} style={{width:stones>6?7:10,height:stones>6?7:10,borderRadius:5,backgroundColor:color.main,opacity:0.9}}/>
        ))}
      </View>
      <Text style={{position:'absolute',bottom:2,fontSize:10,fontWeight:'900',color:'rgba(249,242,231,0.6)',backgroundColor:'rgba(0,0,0,0.5)',borderRadius:5,paddingHorizontal:3,lineHeight:13}}>{stones}</Text>
    </TouchableOpacity>
  );
}

// ══════════════════════════════════════════════
//  KAY — JEU PRINCIPAL (avec Firebase distance)
// ══════════════════════════════════════════════
function KayGame({langue,onRetour}){
  const t=TK[langue]||TK.fr;
  const p1Color='#FF3D6B',p2Color='#10D9A0';

  // Connexion
  const [screen,setScreen]=useState('lobby');
  const [sessionCode,setSessionCode]=useState('');
  const [codeInput,setCodeInput]=useState('');
  const [isJ1,setIsJ1]=useState(true);

  // Jeu
  const [stoneKey,setStoneKey]=useState('or');
  const [isManuel,setIsManuel]=useState(false);
  const [showSettings,setShowSettings]=useState(false);
  const [p1Cases,setP1Cases]=useState(KAY_MAX);
  const [p2Cases,setP2Cases]=useState(KAY_MAX);
  const [board,setBoard]=useState(kayInitBoard(KAY_MAX,KAY_MAX));
  const [currentPlayer,setCurrentPlayer]=useState(1);
  const [scores,setScores]=useState({p1:0,p2:0});
  const [roundScores,setRoundScores]=useState({p1:0,p2:0});
  const [roundNum,setRoundNum]=useState(1);
  const [phase,setPhase]=useState('notif');
  const [roundWinner,setRoundWinner]=useState(null);
  const [selectedCase,setSelectedCase]=useState(null);
  const [landingPit,setLandingPit]=useState(null);
  const [capturedPit,setCapturedPit]=useState(null);
  const [pausedPit,setPausedPit]=useState(null);
  const [showNotif,setShowNotif]=useState(false);
  const [showCapture,setShowCapture]=useState(false);
  const [manuelStones,setManuelStones]=useState(0);
  const [nextValidPit,setNextValidPit]=useState(null);

  const animating=useRef(false);
  const manuelResolveRef=useRef(null);
  const unsubRefs=useRef([]);
  const color=KAY_STONE_COLORS[stoneKey];

  function unsubAll(){unsubRefs.current.forEach(f=>f());unsubRefs.current=[];}
  useEffect(()=>()=>unsubAll(),[]);

  // Notif tour auto-disparaît
  useEffect(()=>{
    if(showNotif){const timer=setTimeout(()=>{setShowNotif(false);},1800);return()=>clearTimeout(timer);}
  },[showNotif]);

  // ── LOBBY ──
  async function createSession(){
    const code=genCode();setSessionCode(code);setIsJ1(true);
    await fbSet(`kay/${code}`,{created:Date.now(),j2joined:false});
    setScreen('waiting');
    const u=fbListen(`kay/${code}/j2joined`,val=>{if(val===true){unsubAll();setScreen('game');initGame(code,true);}});
    unsubRefs.current.push(u);
  }

  async function joinSession(){
    const code=codeInput.trim().toUpperCase();
    if(code.length<4)return;
    setSessionCode(code);setIsJ1(false);
    await fbSet(`kay/${code}/j2joined`,true);
    setScreen('game');initGame(code,false);
  }

  // ── INIT JEU ──
  function initGame(code,amJ1){
    const first=Math.random()<0.5?1:2;
    if(amJ1){
      fbSet(`kay/${code}/gameState`,{
        board:kayInitBoard(KAY_MAX,KAY_MAX),
        currentPlayer:first,scores:{p1:0,p2:0},
        roundScores:{p1:0,p2:0},roundNum:1,
        p1Cases:KAY_MAX,p2Cases:KAY_MAX,
        phase:'notif',roundWinner:null,
      });
    }
    // Écouter le gameState Firebase
    const u=fbListen(`kay/${code}/gameState`,val=>{
      if(!val)return;
      setBoard(val.board||kayInitBoard(KAY_MAX,KAY_MAX));
      setCurrentPlayer(val.currentPlayer||1);
      setScores(val.scores||{p1:0,p2:0});
      setRoundScores(val.roundScores||{p1:0,p2:0});
      setRoundNum(val.roundNum||1);
      setP1Cases(val.p1Cases||KAY_MAX);
      setP2Cases(val.p2Cases||KAY_MAX);
      if(val.phase==='notif'&&val.phase!==phase){setShowNotif(true);}
      setPhase(val.phase||'selectCase');
      setRoundWinner(val.roundWinner||null);
      if(val.landingPit!==undefined)setLandingPit(val.landingPit);
      if(val.capturedPit!==undefined)setCapturedPit(val.capturedPit);
      if(val.showCapture!==undefined)setShowCapture(val.showCapture);
    });
    unsubRefs.current.push(u);

    // Écouter les actions de jeu
    const u2=fbListen(`kay/${code}/action`,val=>{
      if(!val)return;
      if(val.player&&val.index!==undefined&&!animating.current){
        executeAction(val.player,val.index,code);
        fbSet(`kay/${code}/action`,null);
      }
    });
    unsubRefs.current.push(u2);
  }

  // ── ACTION JOUEUR ──
  async function handlePitPress(player,index){
    if(screen!=='game')return;
    const myPlayer=isJ1?1:2;

    // Mode manuel
    if(phase==='playing'&&isManuel&&manuelResolveRef.current){
      const{resolve,targetP,targetI}=manuelResolveRef.current;
      if(targetP===player&&targetI===index){manuelResolveRef.current=null;resolve();}
      return;
    }

    if(animating.current)return;
    if(phase!=='selectCase')return;
    if(player!==myPlayer)return;
    if(player!==currentPlayer)return;
    if(board[`p${player}`][index]===0)return;

    // Envoyer l'action via Firebase pour que les deux joueurs la voient
    await fbSet(`kay/${sessionCode}/action`,{player,index,ts:Date.now()});
  }

  async function executeAction(player,index,code){
    if(animating.current)return;
    setSelectedCase({player,index});
    animating.current=true;
    await fbSet(`kay/${code||sessionCode}/gameState/phase`,'playing');
    await kaySleep(300);
    const b={p1:[...board.p1],p2:[...board.p2]};
    const rs={...roundScores};
    if(isManuel)await kayManuelDist(player,index,b,rs,code||sessionCode);
    else await kayAutoDist(player,index,b,rs,code||sessionCode);
  }

  function kayNextPos(g,p1Len,p2Len){
    const total=p1Len+p2Len;
    if(g>0&&g<p1Len)return g-1;
    if(g===0)return p1Len;
    if(g>=p1Len&&g<total-1)return g+1;
    return p1Len-1;
  }
  function kayGlobal(g,p1Len){return g<p1Len?{p:1,i:g}:{p:2,i:g-p1Len};}

  async function kayAutoDist(player,startIndex,b,rs,code){
    const p1Len=b.p1.length,p2Len=b.p2.length;
    let stones=b[`p${player}`][startIndex];
    b[`p${player}`][startIndex]=0;
    await fbSet(`kay/${code}/gameState/board`,{...b});
    setBoard({...b});setSelectedCase(null);
    await kaySleep(200);
    let gPos=player===1?startIndex:p1Len+startIndex;

    while(stones>0){
      const nextG=kayNextPos(gPos,p1Len,p2Len);gPos=nextG;
      const{p:tP,i:tI}=kayGlobal(gPos,p1Len);
      const wasEmpty=b[`p${tP}`][tI]===0;
      b[`p${tP}`][tI]++;stones--;
      setLandingPit({player:tP,index:tI});
      await fbSet(`kay/${code}/gameState/board`,{...b});
      setBoard({...b});
      await kaySleep(KAY_DELAY);setLandingPit(null);

      if(b[`p${tP}`][tI]===4){
        setCapturedPit({player:tP,index:tI});setShowCapture(true);
        rs[`p${player}`]+=4;b[`p${tP}`][tI]=0;
        setRoundScores({...rs});
        await fbSet(`kay/${code}/gameState/board`,{...b});
        setBoard({...b});
        await kaySleep(KAY_PAUSE_CAP);setCapturedPit(null);setShowCapture(false);
        if(stones===0){await kayFinishRound(player,b,rs,code);return;}
        continue;
      }
      if(stones===0){
        if(wasEmpty){await kayFinishRound(player,b,rs,code);return;}
        const sh=b[`p${tP}`][tI];
        if(sh>0){
          setPausedPit({player:tP,index:tI});
          await kaySleep(KAY_PAUSE_C);setPausedPit(null);
          stones=sh;b[`p${tP}`][tI]=0;
          await fbSet(`kay/${code}/gameState/board`,{...b});
          setBoard({...b});await kaySleep(200);
        }
      }
    }
    await kayFinishRound(player,b,rs,code);
  }

  async function kayManuelDist(player,startIndex,b,rs,code){
    const p1Len=b.p1.length,p2Len=b.p2.length;
    let stones=b[`p${player}`][startIndex];
    b[`p${player}`][startIndex]=0;
    await fbSet(`kay/${code}/gameState/board`,{...b});
    setBoard({...b});setSelectedCase(null);await kaySleep(200);
    let gPos=player===1?startIndex:p1Len+startIndex;
    await kayManuelLoop(player,gPos,stones,b,rs,p1Len,p2Len,code);
  }

  async function kayManuelLoop(player,gPos,stones,b,rs,p1Len,p2Len,code){
    if(stones===0){await kayFinishRound(player,b,rs,code);return;}
    const nextG=kayNextPos(gPos,p1Len,p2Len);
    const{p:nP,i:nI}=kayGlobal(nextG,p1Len);
    setNextValidPit({player:nP,index:nI});setManuelStones(stones);
    await new Promise(resolve=>{manuelResolveRef.current={resolve,targetP:nP,targetI:nI};});
    const wasEmpty=b[`p${nP}`][nI]===0;
    b[`p${nP}`][nI]++;stones--;
    setNextValidPit(null);setLandingPit({player:nP,index:nI});
    await fbSet(`kay/${code}/gameState/board`,{...b});
    setBoard({...b});setManuelStones(stones);
    await kaySleep(300);setLandingPit(null);
    if(b[`p${nP}`][nI]===4){
      setCapturedPit({player:nP,index:nI});setShowCapture(true);
      rs[`p${player}`]+=4;b[`p${nP}`][nI]=0;
      setRoundScores({...rs});
      await fbSet(`kay/${code}/gameState/board`,{...b});
      setBoard({...b});await kaySleep(KAY_PAUSE_CAP);
      setCapturedPit(null);setShowCapture(false);
      if(stones===0){await kayFinishRound(player,b,rs,code);return;}
      await kayManuelLoop(player,nextG,stones,b,rs,p1Len,p2Len,code);return;
    }
    if(stones===0){
      if(wasEmpty){await kayFinishRound(player,b,rs,code);return;}
      const sh=b[`p${nP}`][nI];
      if(sh>0){
        setPausedPit({player:nP,index:nI});await kaySleep(KAY_PAUSE_C);setPausedPit(null);
        stones=sh;b[`p${nP}`][nI]=0;
        await fbSet(`kay/${code}/gameState/board`,{...b});
        setBoard({...b});await kaySleep(200);
      }
    }
    await kayManuelLoop(player,nextG,stones,b,rs,p1Len,p2Len,code);
  }

  async function kayFinishRound(player,b,rs,code){
    setLandingPit(null);setPausedPit(null);setNextValidPit(null);setSelectedCase(null);setManuelStones(0);
    animating.current=false;
    const total=kayTotal(b);
    if(total<=KAY_END){
      const winner=rs.p1>rs.p2?1:rs.p2>rs.p1?2:0;
      const newScores={p1:scores.p1+(winner===1?1:0),p2:scores.p2+(winner===2?1:0)};
      await fbSet(`kay/${code}/gameState`,{
        board:b,currentPlayer:player,scores:newScores,
        roundScores:rs,roundNum,p1Cases,p2Cases,
        phase:'roundOver',roundWinner:winner,
      });
      return;
    }
    const next=player===1?2:1;
    await fbSet(`kay/${code}/gameState`,{
      board:b,currentPlayer:next,scores,
      roundScores:rs,roundNum,p1Cases,p2Cases,
      phase:'notif',roundWinner:null,
    });
  }

  async function startNextRound(winner){
    let n1=p1Cases,n2=p2Cases;
    if(winner===1)n2=Math.max(1,n2-1);else if(winner===2)n1=Math.max(1,n1-1);
    if(n1===0||n2===0){
      await fbSet(`kay/${sessionCode}/gameState/phase`,'gameOver');return;
    }
    const first=Math.random()<0.5?1:2;
    await fbSet(`kay/${sessionCode}/gameState`,{
      board:kayInitBoard(n1,n2),currentPlayer:first,
      scores,roundScores:{p1:0,p2:0},roundNum:roundNum+1,
      p1Cases:n1,p2Cases:n2,phase:'notif',roundWinner:null,
    });
  }

  async function kayRestart(){
    unsubAll();
    setScreen('lobby');setSessionCode('');setCodeInput('');setIsJ1(true);
    setBoard(kayInitBoard(KAY_MAX,KAY_MAX));setScores({p1:0,p2:0});setRoundScores({p1:0,p2:0});
    setRoundNum(1);setRoundWinner(null);setSelectedCase(null);setLandingPit(null);
    setCapturedPit(null);setPausedPit(null);setNextValidPit(null);setManuelStones(0);
    setShowCapture(false);animating.current=false;manuelResolveRef.current=null;
    setCurrentPlayer(1);setPhase('notif');setP1Cases(KAY_MAX);setP2Cases(KAY_MAX);
  }

  const myPlayer=isJ1?1:2;
  const activeColor=currentPlayer===1?p1Color:p2Color;
  const activeName=currentPlayer===1?t.player1:t.player2;
  const isMyTurn=currentPlayer===myPlayer&&phase==='selectCase';

  // ── LOBBY KAY ──
  if(screen==='lobby') return(
    <ScrollView style={s.ecran} contentContainerStyle={s.ecranC}>
      <TouchableOpacity onPress={onRetour} style={{marginBottom:8}}><Text style={s.retour}>{t.retour}</Text></TouchableOpacity>
      <View style={{alignItems:'center',marginBottom:24}}>
        <Text style={{fontSize:26}}>🪨</Text>
        <Text style={[s.titre1,{fontSize:22,marginBottom:2}]}>{t.title}</Text>
        <Text style={[s.sous,{marginBottom:0}]}>{t.subtitle.toUpperCase()}</Text>
      </View>
      <TouchableOpacity style={[s.btnR,{backgroundColor:'#F5A623'}]} onPress={createSession}>
        <Text style={s.btnRT}>🔗 {t.creerSession}</Text>
      </TouchableOpacity>
      <View style={s.sep}><View style={s.ligne}/><Text style={s.ou}>OU</Text><View style={s.ligne}/></View>
      <View style={s.joinBox}>
        <Text style={s.label}>{t.entrerCode}</Text>
        <TextInput style={s.input} placeholder={t.placeholder} placeholderTextColor="rgba(249,242,231,0.3)" value={codeInput} onChangeText={v=>setCodeInput(v.toUpperCase())} maxLength={6} autoCapitalize="characters"/>
        <TouchableOpacity style={s.btnR} onPress={joinSession}><Text style={s.btnRT}>{t.rejoindre}</Text></TouchableOpacity>
      </View>
    </ScrollView>
  );

  if(screen==='waiting') return(
    <View style={s.centre}>
      <Text style={s.bigE}>⏳</Text>
      <Text style={s.titre2}>{t.attente}</Text>
      <Text style={s.desc}>{t.partagerCode}</Text>
      <View style={s.codeBox}><Text style={s.codeTxt}>{sessionCode}</Text></View>
      <ActivityIndicator color="#F5A623" size="large" style={{marginTop:16}}/>
      <TouchableOpacity style={[s.btnV,{marginTop:20}]} onPress={kayRestart}><Text style={s.btnVT}>{t.retour}</Text></TouchableOpacity>
    </View>
  );

  // ── JEU KAY ──
  return(
    <ScrollView style={s.ecran} contentContainerStyle={[s.ecranC,{alignItems:'center',paddingBottom:60}]}>
      <TouchableOpacity onPress={kayRestart} style={{alignSelf:'flex-start',marginBottom:8}}>
        <Text style={s.retour}>{t.retour}</Text>
      </TouchableOpacity>

      {/* Notif tour */}
      {showNotif&&(
        <View style={{position:'absolute',top:0,left:0,right:0,bottom:0,backgroundColor:'rgba(14,10,20,0.92)',alignItems:'center',justifyContent:'center',zIndex:100}}>
          <Text style={{fontSize:52,marginBottom:8}}>{currentPlayer===1?'🔴':'🟢'}</Text>
          <Text style={{fontSize:28,fontWeight:'900',color:activeColor,marginBottom:10}}>{activeName}</Text>
          <View style={{backgroundColor:`${activeColor}22`,borderWidth:1,borderColor:`${activeColor}55`,borderRadius:50,paddingVertical:10,paddingHorizontal:28}}>
            <Text style={{fontSize:15,fontWeight:'700',color:'#F9F2E7',letterSpacing:3}}>{t.yourTurn}</Text>
          </View>
          {currentPlayer===myPlayer&&<Text style={{color:'rgba(249,242,231,0.5)',fontSize:12,marginTop:12}}>C'est toi ! 🎯</Text>}
        </View>
      )}

      {/* Flash capture */}
      {showCapture&&(
        <View style={{position:'absolute',top:'38%',alignSelf:'center',zIndex:50,backgroundColor:`${color.main}22`,borderWidth:2,borderColor:color.main,borderRadius:50,paddingVertical:10,paddingHorizontal:24}}>
          <Text style={{color:color.main,fontSize:20,fontWeight:'900'}}>+4 ✨</Text>
        </View>
      )}

      {/* Header */}
      <Text style={{fontSize:22,marginBottom:2}}>🪨</Text>
      <Text style={[s.titre1,{fontSize:20,marginBottom:2}]}>{t.title}</Text>
      <Text style={[s.sous,{marginBottom:14}]}>{t.subtitle.toUpperCase()}</Text>

      {/* Badge mon rôle */}
      <View style={{backgroundColor:`${myPlayer===1?p1Color:p2Color}18`,borderWidth:1,borderColor:`${myPlayer===1?p1Color:p2Color}40`,borderRadius:50,paddingVertical:3,paddingHorizontal:12,marginBottom:12}}>
        <Text style={{color:myPlayer===1?p1Color:p2Color,fontSize:11,fontWeight:'700'}}>
          {myPlayer===1?t.player1:t.player2} (moi)
        </Text>
      </View>

      {/* Scores */}
      <View style={{flexDirection:'row',gap:8,marginBottom:12,alignItems:'center'}}>
        <View style={[s.scoreBox,{borderColor:currentPlayer===1&&phase==='selectCase'?`${p1Color}55`:'rgba(255,255,255,0.08)'}]}>
          <Text style={{fontSize:9,color:p1Color,letterSpacing:1,marginBottom:2}}>{t.player1}</Text>
          <Text style={{fontSize:20,fontWeight:'900',color:'#F9F2E7'}}>{scores.p1}</Text>
          <Text style={{fontSize:9,color:'rgba(249,242,231,0.3)',marginTop:2}}>{p1Cases} 🪨</Text>
        </View>
        <View style={{alignItems:'center'}}>
          <Text style={{color:'rgba(249,242,231,0.2)',fontSize:10}}>{t.round} {roundNum}</Text>
          <Text style={{fontSize:13,fontWeight:'700',color:'rgba(249,242,231,0.5)',marginTop:3}}>{roundScores.p1} — {roundScores.p2}</Text>
        </View>
        <View style={[s.scoreBox,{borderColor:currentPlayer===2&&phase==='selectCase'?`${p2Color}55`:'rgba(255,255,255,0.08)'}]}>
          <Text style={{fontSize:9,color:p2Color,letterSpacing:1,marginBottom:2}}>{t.player2}</Text>
          <Text style={{fontSize:20,fontWeight:'900',color:'#F9F2E7'}}>{scores.p2}</Text>
          <Text style={{fontSize:9,color:'rgba(249,242,231,0.3)',marginTop:2}}>{p2Cases} 🪨</Text>
        </View>
      </View>

      {/* Plateau */}
      <View style={{backgroundColor:'rgba(255,255,255,0.03)',borderWidth:1,borderColor:'rgba(255,255,255,0.08)',borderRadius:24,padding:14,width:'100%',marginBottom:10}}>
        <Text style={{fontSize:9,color:p1Color,letterSpacing:2,textAlign:'center',marginBottom:7,opacity:0.8}}>
          {t.player1}{currentPlayer===1&&isMyTurn?' ● '+t.tapToPlay:''}
        </Text>
        <View style={{flexDirection:'row',gap:5,justifyContent:'center',marginBottom:4,flexWrap:'wrap'}}>
          {board.p1.map((stones,i)=>(
            <KayPit key={i} stones={stones} player={1} color={color} p1Color={p1Color} p2Color={p2Color}
              isActive={currentPlayer===1&&isMyTurn&&myPlayer===1}
              isSelected={selectedCase?.player===1&&selectedCase?.index===i}
              isLanding={landingPit?.player===1&&landingPit?.index===i}
              isCaptured={capturedPit?.player===1&&capturedPit?.index===i}
              isPaused={pausedPit?.player===1&&pausedPit?.index===i}
              isNextManuel={nextValidPit?.player===1&&nextValidPit?.index===i}
              onPress={()=>handlePitPress(1,i)} disabled={false}
            />
          ))}
        </View>
        <Text style={{textAlign:'center',paddingVertical:8,color:'rgba(249,242,231,0.1)',fontSize:11,letterSpacing:5}}>← ← ← ← ←</Text>
        <View style={{flexDirection:'row',gap:5,justifyContent:'center',marginBottom:4,flexWrap:'wrap'}}>
          {board.p2.map((stones,i)=>(
            <KayPit key={i} stones={stones} player={2} color={color} p1Color={p1Color} p2Color={p2Color}
              isActive={currentPlayer===2&&isMyTurn&&myPlayer===2}
              isSelected={selectedCase?.player===2&&selectedCase?.index===i}
              isLanding={landingPit?.player===2&&landingPit?.index===i}
              isCaptured={capturedPit?.player===2&&capturedPit?.index===i}
              isPaused={pausedPit?.player===2&&pausedPit?.index===i}
              isNextManuel={nextValidPit?.player===2&&nextValidPit?.index===i}
              onPress={()=>handlePitPress(2,i)} disabled={false}
            />
          ))}
        </View>
        <Text style={{fontSize:9,color:p2Color,letterSpacing:2,textAlign:'center',marginTop:7,opacity:0.8}}>
          {currentPlayer===2&&isMyTurn?t.tapToPlay+' ● ':''}{t.player2}
        </Text>
      </View>

      {/* Statut */}
      {phase==='selectCase'&&(
        <View style={{backgroundColor:`${activeColor}18`,borderWidth:1,borderColor:`${activeColor}40`,borderRadius:50,paddingVertical:4,paddingHorizontal:14,marginBottom:10}}>
          <Text style={{fontSize:11,color:activeColor,fontWeight:'700'}}>
            {isMyTurn?'🎯 '+t.tapToPlay:'⏳ '+t.waitingTurn}
          </Text>
        </View>
      )}
      {phase==='playing'&&isManuel&&manuelStones>0&&(
        <View style={{backgroundColor:'rgba(255,255,255,0.08)',borderWidth:1,borderColor:'rgba(255,255,255,0.2)',borderRadius:50,paddingVertical:4,paddingHorizontal:14,marginBottom:8}}>
          <Text style={{fontSize:11,color:'#F9F2E7',fontWeight:'700'}}>✊ {manuelStones} {t.stonesLeft}</Text>
        </View>
      )}

      {/* Fin de manche */}
      {phase==='roundOver'&&(
        <View style={{backgroundColor:'rgba(255,255,255,0.06)',borderWidth:1,borderColor:'rgba(255,255,255,0.12)',borderRadius:20,padding:22,width:'100%',alignItems:'center',marginBottom:10}}>
          <Text style={{fontSize:36,marginBottom:10}}>{roundWinner===0?'🤝':'🏆'}</Text>
          <Text style={{color:'#F9F2E7',fontSize:17,fontWeight:'700',marginBottom:8}}>{t.gameOver}</Text>
          <Text style={{color:roundWinner===1?p1Color:roundWinner===2?p2Color:'rgba(249,242,231,0.5)',fontSize:14,marginBottom:6}}>
            {roundWinner===0?t.tie:`${roundWinner===1?t.player1:t.player2} ${t.wins}`}
          </Text>
          {roundWinner!==0&&<Text style={{color:'rgba(249,242,231,0.35)',fontSize:11,marginBottom:14}}>{roundWinner===1?t.player2:t.player1} {t.penalty}</Text>}
          {isJ1&&<TouchableOpacity style={[s.btnR,{marginBottom:8}]} onPress={()=>startNextRound(roundWinner)}><Text style={s.btnRT}>{t.nextRound}</Text></TouchableOpacity>}
          {!isJ1&&<Text style={{color:'rgba(249,242,231,0.4)',fontSize:12,marginBottom:12}}>En attente de J1...</Text>}
          <TouchableOpacity style={s.btnV} onPress={kayRestart}><Text style={s.btnVT}>{t.restart}</Text></TouchableOpacity>
        </View>
      )}

      {/* Fin de jeu */}
      {phase==='gameOver'&&(
        <View style={{backgroundColor:'rgba(255,215,0,0.06)',borderWidth:1,borderColor:'rgba(255,215,0,0.25)',borderRadius:20,padding:28,width:'100%',alignItems:'center',marginBottom:10}}>
          <Text style={{fontSize:48,marginBottom:10}}>🏆</Text>
          <Text style={{color:'#FFD700',fontSize:20,fontWeight:'900',marginBottom:8}}>{scores.p1>scores.p2?t.player1:t.player2} {t.champion}</Text>
          <Text style={{color:'rgba(249,242,231,0.4)',fontSize:13,marginBottom:20}}>{scores.p1} — {scores.p2}</Text>
          <TouchableOpacity style={s.btnR} onPress={kayRestart}><Text style={s.btnRT}>{t.restart}</Text></TouchableOpacity>
        </View>
      )}

      {/* Paramètres */}
      <TouchableOpacity onPress={()=>setShowSettings(v=>!v)} style={{borderWidth:1,borderColor:'rgba(255,255,255,0.1)',borderRadius:50,paddingVertical:6,paddingHorizontal:16,marginTop:8}}>
        <Text style={{color:'rgba(249,242,231,0.4)',fontSize:11}}>⚙️ {t.settings}</Text>
      </TouchableOpacity>
      {showSettings&&(
        <View style={{backgroundColor:'rgba(255,255,255,0.04)',borderWidth:1,borderColor:'rgba(255,255,255,0.1)',borderRadius:20,padding:16,marginTop:10,width:'100%'}}>
          <Text style={[s.label,{marginBottom:8}]}>MODE</Text>
          <View style={{flexDirection:'row',gap:8,marginBottom:16}}>
            <TouchableOpacity onPress={()=>setIsManuel(false)} style={{flex:1,padding:10,borderRadius:12,backgroundColor:!isManuel?'rgba(245,166,35,0.2)':'rgba(255,255,255,0.04)',borderWidth:1,borderColor:!isManuel?'#F5A623':'rgba(255,255,255,0.1)',alignItems:'center'}}>
              <Text style={{color:!isManuel?'#F5A623':'rgba(249,242,231,0.5)',fontSize:12,fontWeight:'700'}}>{t.modeAuto}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=>setIsManuel(true)} style={{flex:1,padding:10,borderRadius:12,backgroundColor:isManuel?'rgba(167,139,250,0.2)':'rgba(255,255,255,0.04)',borderWidth:1,borderColor:isManuel?'#A78BFA':'rgba(255,255,255,0.1)',alignItems:'center'}}>
              <Text style={{color:isManuel?'#A78BFA':'rgba(249,242,231,0.5)',fontSize:12,fontWeight:'700'}}>{t.modeManuel}</Text>
            </TouchableOpacity>
          </View>
          <Text style={[s.label,{marginBottom:8}]}>🪨 {t.stoneColor}</Text>
          <View style={{flexDirection:'row',gap:8,flexWrap:'wrap'}}>
            {Object.entries(KAY_STONE_COLORS).map(([key,val])=>(
              <TouchableOpacity key={key} onPress={()=>setStoneKey(key)} style={{width:28,height:28,borderRadius:14,backgroundColor:val.main,borderWidth:stoneKey===key?2.5:2,borderColor:stoneKey===key?'white':'transparent'}}/>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

// ══════════════════════════════════════════════
//  DEVINE — JEU
// ══════════════════════════════════════════════
function DevineGame({langue,onRetour}){
  const t=TD[langue]||TD.fr;
  const cats=Object.keys(DEVINE_MOTS[langue]||DEVINE_MOTS.fr);

  const [screen,setScreen]=useState('lobby');
  const [sessionCode,setSessionCode]=useState('');
  const [codeInput,setCodeInput]=useState('');
  const [isJ1,setIsJ1]=useState(true);
  const [mode,setMode]=useState(null);
  const [category,setCategory]=useState(null);
  const [secretWord,setSecretWord]=useState('');
  const [customWord,setCustomWord]=useState('');
  const [timerDuration,setTimerDuration]=useState(90);
  const [timeLeft,setTimeLeft]=useState(90);
  const [timerActive,setTimerActive]=useState(false);
  const [history,setHistory]=useState([]);
  const [currentQ,setCurrentQ]=useState('');
  const [pendingQ,setPendingQ]=useState(null);
  const [qCount,setQCount]=useState(0);
  const [guessMode,setGuessMode]=useState(false);
  const [guessInput,setGuessInput]=useState('');
  const [lastGuessResult,setLastGuessResult]=useState(null);
  const [winner,setWinner]=useState(null);
  const [revealWord,setRevealWord]=useState('');
  const unsubRefs=useRef([]);
  const timerRef=useRef(null);

  function unsubAll(){unsubRefs.current.forEach(f=>f());unsubRefs.current=[];}
  useEffect(()=>()=>{unsubAll();if(timerRef.current)clearInterval(timerRef.current);},[]);

  useEffect(()=>{
    if(timerActive&&timeLeft>0){timerRef.current=setInterval(()=>setTimeLeft(t=>t-1),1000);}
    else if(timeLeft===0&&timerActive){setTimerActive(false);handleTimeUp();}
    return()=>clearInterval(timerRef.current);
  },[timerActive,timeLeft]);

  async function handleTimeUp(){
    await fbSet(`devine/${sessionCode}/gameState/winner`,'j1');
    await fbSet(`devine/${sessionCode}/gameState/revealWord`,secretWord||'?');
    setWinner('j1');setRevealWord(secretWord);setScreen('result');
  }

  async function createSession(){
    const code=genCode();setSessionCode(code);setIsJ1(true);
    await fbSet(`devine/${code}`,{created:Date.now(),j2joined:false});
    setScreen('waiting');
    const u=fbListen(`devine/${code}/j2joined`,val=>{if(val===true){unsubAll();setScreen('setup');}});
    unsubRefs.current.push(u);
  }

  async function joinSession(){
    const code=codeInput.trim().toUpperCase();if(code.length<4)return;
    setSessionCode(code);setIsJ1(false);
    await fbSet(`devine/${code}/j2joined`,true);setScreen('setup');
    const u=fbListen(`devine/${code}/gameState`,val=>{
      if(!val)return;
      if(val.phase==='game'){
        setMode(val.mode);setCategory(val.category);setSecretWord(val.secretWord||'');
        setTimerDuration(val.timerDuration||90);setTimeLeft(val.timerDuration||90);
        setScreen('game');startGameListeners(code,false);unsubAll();setTimerActive(true);
      }
    });
    unsubRefs.current.push(u);
  }

  async function startGame(){
    if(!mode)return;if(mode==='ia'&&!category)return;if(mode==='perso'&&!customWord.trim())return;
    let word='';
    if(mode==='ia'){const list=DEVINE_MOTS[langue]?.[category]||[];word=list[Math.floor(Math.random()*list.length)]||'?';}
    else if(mode==='perso'){word=customWord.trim();}
    setSecretWord(word);
    await fbSet(`devine/${sessionCode}/gameState`,{phase:'game',mode,category:category||'',secretWord:word,timerDuration,qCount:0,winner:null});
    setScreen('game');setTimeLeft(timerDuration);setTimerActive(true);
    startGameListeners(sessionCode,true);
  }

  function startGameListeners(code,amJ1){
    if(amJ1){const u=fbListen(`devine/${code}/currentQuestion`,val=>{if(val&&val.text)setPendingQ(val);});unsubRefs.current.push(u);}
    if(!amJ1){const u=fbListen(`devine/${code}/currentAnswer`,val=>{if(val&&val.answer){setHistory(h=>[...h,{q:val.q,answer:val.answer}]);setPendingQ(null);setQCount(c=>c+1);}});unsubRefs.current.push(u);}
    const u2=fbListen(`devine/${code}/gameState/winner`,val=>{if(val)setWinner(val);});
    const u3=fbListen(`devine/${code}/gameState/revealWord`,val=>{if(val){setRevealWord(val);setScreen('result');setTimerActive(false);unsubAll();}});
    unsubRefs.current.push(u2,u3);
  }

  async function sendQuestion(){if(!currentQ.trim())return;await fbSet(`devine/${sessionCode}/currentQuestion`,{text:currentQ.trim(),ts:Date.now()});setCurrentQ('');}
  async function sendAnswer(answer){if(!pendingQ)return;setHistory(h=>[...h,{q:pendingQ.text,answer}]);await fbSet(`devine/${sessionCode}/currentAnswer`,{q:pendingQ.text,answer,ts:Date.now()});await fbSet(`devine/${sessionCode}/currentQuestion`,null);setPendingQ(null);}

  async function sendGuess(){
    if(!guessInput.trim())return;
    const guess=guessInput.trim().toLowerCase();const word=secretWord.toLowerCase();
    const correct=guess===word||word.includes(guess)||guess.includes(word);
    if(correct){
      setTimerActive(false);
      await fbSet(`devine/${sessionCode}/gameState/winner`,'j2');
      await fbSet(`devine/${sessionCode}/gameState/revealWord`,secretWord||'?');
      setWinner('j2');setRevealWord(secretWord);setScreen('result');
    } else {setLastGuessResult('wrong');setGuessInput('');setGuessMode(false);}
  }

  async function giveUp(){
    setTimerActive(false);
    await fbSet(`devine/${sessionCode}/gameState/winner`,'j1');
    await fbSet(`devine/${sessionCode}/gameState/revealWord`,secretWord||'?');
    setWinner('j1');setRevealWord(secretWord);setScreen('result');
  }

  function reset(){
    unsubAll();if(timerRef.current)clearInterval(timerRef.current);
    setScreen('lobby');setSessionCode('');setCodeInput('');setIsJ1(true);
    setMode(null);setCategory(null);setSecretWord('');setCustomWord('');
    setTimerDuration(90);setTimeLeft(90);setTimerActive(false);
    setHistory([]);setCurrentQ('');setPendingQ(null);setQCount(0);
    setGuessMode(false);setGuessInput('');setLastGuessResult(null);setWinner(null);setRevealWord('');
  }

  const timerColor=timeLeft<=15?'#FF3D6B':timeLeft<=30?'#F5A623':'#10D9A0';
  const timerPct=timeLeft/timerDuration;

  return(
    <ScrollView style={s.ecran} contentContainerStyle={[s.ecranC,{paddingBottom:60}]}>
      <TouchableOpacity onPress={()=>{reset();onRetour();}} style={{marginBottom:8}}><Text style={s.retour}>{t.back}</Text></TouchableOpacity>
      <View style={{alignItems:'center',marginBottom:20}}>
        <Text style={{fontSize:30,marginBottom:4}}>🔍</Text>
        <Text style={[s.titre1,{fontSize:22}]}>{t.title}</Text>
        <Text style={[s.sous,{marginBottom:0}]}>{t.subtitle.toUpperCase()}</Text>
      </View>

      {/* LOBBY */}
      {screen==='lobby'&&(
        <View>
          <TouchableOpacity style={[s.btnR,{backgroundColor:'#10D9A0'}]} onPress={createSession}><Text style={s.btnRT}>🔗 {t.createSession}</Text></TouchableOpacity>
          <View style={s.sep}><View style={s.ligne}/><Text style={s.ou}>OU</Text><View style={s.ligne}/></View>
          <View style={s.joinBox}>
            <Text style={s.label}>{t.codePlaceholder.toUpperCase()}</Text>
            <TextInput style={s.input} placeholder={t.codePlaceholder} placeholderTextColor="rgba(249,242,231,0.3)" value={codeInput} onChangeText={v=>setCodeInput(v.toUpperCase())} maxLength={6} autoCapitalize="characters"/>
            <TouchableOpacity style={s.btnR} onPress={joinSession}><Text style={s.btnRT}>→ {t.joinSession}</Text></TouchableOpacity>
          </View>
        </View>
      )}

      {/* WAITING */}
      {screen==='waiting'&&(
        <View style={{alignItems:'center'}}>
          <Text style={s.bigE}>⏳</Text><Text style={s.desc}>{t.waitingPartner}</Text>
          <Text style={[s.label,{marginBottom:8}]}>{t.shareCode}</Text>
          <View style={s.codeBox}><Text style={s.codeTxt}>{sessionCode}</Text></View>
          <ActivityIndicator color="#10D9A0" size="large" style={{marginTop:16}}/>
        </View>
      )}

      {/* SETUP J1 */}
      {screen==='setup'&&isJ1&&(
        <View>
          <Text style={s.titre2}>{t.chooseMode}</Text>
          <TouchableOpacity onPress={()=>setMode('ia')} style={[s.niveauCard,mode==='ia'&&{borderColor:'#10D9A0',backgroundColor:'rgba(16,217,160,0.15)'},{ marginBottom:10}]}>
            <Text style={[s.niveauNom,mode==='ia'&&{color:'#10D9A0'}]}>{t.modeIA}</Text>
            <Text style={s.niveauDesc}>{t.modeIADesc}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={()=>setMode('manuel')} style={[s.niveauCard,mode==='manuel'&&{borderColor:'#A78BFA',backgroundColor:'rgba(167,139,250,0.15)'},{ marginBottom:10}]}>
            <Text style={[s.niveauNom,mode==='manuel'&&{color:'#A78BFA'}]}>{t.modeManuel}</Text>
            <Text style={s.niveauDesc}>{t.modeManuelDesc}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={()=>setMode('perso')} style={[s.niveauCard,mode==='perso'&&{borderColor:'#F5A623',backgroundColor:'rgba(245,166,35,0.15)'},{ marginBottom:16}]}>
            <Text style={[s.niveauNom,mode==='perso'&&{color:'#F5A623'}]}>{t.modePerso}</Text>
            <Text style={s.niveauDesc}>{t.modePersoDesc}</Text>
          </TouchableOpacity>
          {mode==='ia'&&(<View style={{marginBottom:16}}><Text style={s.label}>{t.chooseCategory}</Text>{cats.map(cat=>(<TouchableOpacity key={cat} onPress={()=>setCategory(cat)} style={[s.niveauCard,category===cat&&{borderColor:'#10D9A0',backgroundColor:'rgba(16,217,160,0.15)'},{ marginBottom:8}]}><Text style={[s.niveauNom,category===cat&&{color:'#10D9A0'}]}>{cat}</Text></TouchableOpacity>))}</View>)}
          {mode==='perso'&&(<View style={[s.joinBox,{marginBottom:16}]}><Text style={s.label}>{t.enterWord}</Text><TextInput style={s.input} placeholder={t.wordPlaceholder} placeholderTextColor="rgba(249,242,231,0.3)" value={customWord} onChangeText={setCustomWord} autoCapitalize="none"/></View>)}

          {/* Timer — 90 / 180 / 360 */}
          <Text style={[s.label,{marginBottom:8}]}>⏱️ {t.chooseTimer}</Text>
          <View style={{flexDirection:'row',gap:8,marginBottom:20}}>
            {[90,180,360].map(sec=>(
              <TouchableOpacity key={sec} onPress={()=>setTimerDuration(sec)} style={{flex:1,padding:12,borderRadius:12,backgroundColor:timerDuration===sec?'rgba(16,217,160,0.2)':'rgba(255,255,255,0.04)',borderWidth:1,borderColor:timerDuration===sec?'#10D9A0':'rgba(255,255,255,0.1)',alignItems:'center'}}>
                <Text style={{color:timerDuration===sec?'#10D9A0':'rgba(249,242,231,0.5)',fontWeight:'700',fontSize:13}}>{sec===90?t.sec90:sec===180?t.sec180:t.sec360}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={[s.btnR,{backgroundColor:'#10D9A0',opacity:(!mode||(mode==='ia'&&!category)||(mode==='perso'&&!customWord.trim()))?0.4:1}]} onPress={startGame}><Text style={s.btnRT}>🚀 Lancer →</Text></TouchableOpacity>
        </View>
      )}

      {/* SETUP J2 */}
      {screen==='setup'&&!isJ1&&(<View style={{alignItems:'center'}}><Text style={s.bigE}>⏳</Text><Text style={s.desc}>{t.waitJ1}</Text><ActivityIndicator color="#10D9A0" size="large" style={{marginTop:20}}/></View>)}

      {/* JEU */}
      {screen==='game'&&(
        <View>
          {/* Timer visuel */}
          <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:12,flexWrap:'wrap',gap:8}}>
            <View style={{backgroundColor:'rgba(255,255,255,0.06)',borderWidth:1,borderColor:'rgba(255,255,255,0.12)',borderRadius:50,paddingVertical:4,paddingHorizontal:14}}>
              <Text style={{color:'rgba(249,242,231,0.6)',fontSize:11}}>{isJ1?t.youAreJ1:t.youAreJ2}</Text>
            </View>
            <View style={{backgroundColor:`${timerColor}18`,borderWidth:1,borderColor:`${timerColor}50`,borderRadius:50,paddingVertical:4,paddingHorizontal:14}}>
              <Text style={{color:timerColor,fontSize:16,fontWeight:'900'}}>⏱️ {timeLeft}s</Text>
            </View>
            <View style={{backgroundColor:'rgba(16,217,160,0.1)',borderWidth:1,borderColor:'rgba(16,217,160,0.3)',borderRadius:50,paddingVertical:4,paddingHorizontal:14}}>
              <Text style={{color:'#10D9A0',fontSize:11}}>{qCount} {t.questions}</Text>
            </View>
          </View>

          {/* Barre timer */}
          <View style={{height:4,backgroundColor:'rgba(255,255,255,0.08)',borderRadius:2,marginBottom:14,overflow:'hidden'}}>
            <View style={{height:4,backgroundColor:timerColor,borderRadius:2,width:`${timerPct*100}%`}}/>
          </View>

          {timeLeft<=15&&timerActive&&(<View style={{backgroundColor:'rgba(255,61,107,0.15)',borderWidth:1,borderColor:'rgba(255,61,107,0.5)',borderRadius:12,padding:10,marginBottom:12,alignItems:'center'}}><Text style={{color:'#FF3D6B',fontWeight:'700',fontSize:14}}>⚠️ {t.timeUp}</Text></View>)}

          {isJ1&&secretWord&&(<View style={{backgroundColor:'rgba(16,217,160,0.08)',borderWidth:1,borderColor:'rgba(16,217,160,0.3)',borderRadius:16,padding:16,marginBottom:16,alignItems:'center'}}><Text style={{fontSize:11,color:'#10D9A0',letterSpacing:2,marginBottom:6}}>{t.theWordIs}</Text><Text style={{fontSize:26,fontWeight:'900',color:'#F9F2E7',letterSpacing:2}}>{secretWord.toUpperCase()}</Text><Text style={{fontSize:11,color:'rgba(249,242,231,0.3)',marginTop:6}}>{t.keepSecret}</Text></View>)}

          {isJ1&&pendingQ&&(<View style={{backgroundColor:'rgba(255,61,107,0.08)',borderWidth:1,borderColor:'rgba(255,61,107,0.3)',borderRadius:20,padding:20,marginBottom:16}}><Text style={{fontSize:11,color:'#FF3D6B',letterSpacing:2,marginBottom:10}}>Q#{qCount+1}</Text><Text style={{fontSize:17,color:'#F9F2E7',fontWeight:'600',marginBottom:16,lineHeight:24}}>"{pendingQ.text}"</Text><View style={{flexDirection:'row',gap:8}}>{['answerYes','answerNo','answerSometimes'].map(key=>(<TouchableOpacity key={key} onPress={()=>sendAnswer(t[key])} style={{flex:1,backgroundColor:key==='answerYes'?'rgba(16,217,160,0.15)':key==='answerNo'?'rgba(255,61,107,0.15)':'rgba(245,166,35,0.15)',borderWidth:1,borderColor:key==='answerYes'?'rgba(16,217,160,0.5)':key==='answerNo'?'rgba(255,61,107,0.5)':'rgba(245,166,35,0.5)',borderRadius:12,padding:12,alignItems:'center'}}><Text style={{color:'#F9F2E7',fontSize:12,fontWeight:'700'}}>{t[key]}</Text></TouchableOpacity>))}</View></View>)}
          {isJ1&&!pendingQ&&<View style={s.msgBox}><Text style={s.msgTxt}>💬 {t.waitingQuestion}</Text></View>}

          {!isJ1&&!guessMode&&(
            <View style={{marginBottom:16}}>
              {lastGuessResult==='wrong'&&(<View style={{backgroundColor:'rgba(255,61,107,0.1)',borderWidth:1,borderColor:'rgba(255,61,107,0.3)',borderRadius:12,padding:10,marginBottom:12,alignItems:'center'}}><Text style={{color:'#FF3D6B',fontSize:13}}>{t.wrongGuess}</Text></View>)}
              <TextInput style={[s.persoInput,{marginBottom:10}]} placeholder={t.questionPlaceholder} placeholderTextColor="rgba(249,242,231,0.3)" value={currentQ} onChangeText={setCurrentQ} multiline/>
              <View style={{flexDirection:'row',gap:8}}>
                <TouchableOpacity style={[s.btnR,{flex:2,marginBottom:0,backgroundColor:'#10D9A0'}]} onPress={sendQuestion}><Text style={s.btnRT}>{t.sendQuestion}</Text></TouchableOpacity>
                <TouchableOpacity style={{flex:1,backgroundColor:'rgba(167,139,250,0.15)',borderWidth:1,borderColor:'rgba(167,139,250,0.4)',borderRadius:50,padding:12,alignItems:'center'}} onPress={()=>setGuessMode(true)}><Text style={{color:'#A78BFA',fontSize:12,fontWeight:'700'}}>{t.tryGuess}</Text></TouchableOpacity>
              </View>
            </View>
          )}

          {!isJ1&&guessMode&&(
            <View style={{backgroundColor:'rgba(167,139,250,0.1)',borderWidth:1,borderColor:'rgba(167,139,250,0.4)',borderRadius:16,padding:16,marginBottom:16}}>
              <Text style={{fontSize:13,color:'#A78BFA',fontWeight:'700',marginBottom:10}}>🎯 {t.guessBtnLabel}</Text>
              <TextInput style={s.input} placeholder={t.guessPlaceholder} placeholderTextColor="rgba(249,242,231,0.3)" value={guessInput} onChangeText={setGuessInput} autoCapitalize="none"/>
              <View style={{flexDirection:'row',gap:8}}><TouchableOpacity style={[s.btnR,{flex:2,marginBottom:0,backgroundColor:'#A78BFA'}]} onPress={sendGuess}><Text style={s.btnRT}>{t.confirmGuess}</Text></TouchableOpacity><TouchableOpacity style={[s.btnV,{flex:1,marginTop:0}]} onPress={()=>setGuessMode(false)}><Text style={s.btnVT}>←</Text></TouchableOpacity></View>
            </View>
          )}

          {!isJ1&&(<TouchableOpacity onPress={giveUp} style={{alignItems:'center',marginBottom:12}}><Text style={{color:'rgba(249,242,231,0.3)',fontSize:12}}>{t.giveUp}</Text></TouchableOpacity>)}

          {history.length>0&&(
            <View style={{backgroundColor:'rgba(255,255,255,0.03)',borderWidth:1,borderColor:'rgba(255,255,255,0.07)',borderRadius:16,padding:14,maxHeight:200}}>
              <Text style={[s.label,{marginBottom:10}]}>{t.history}</Text>
              <ScrollView>
                {history.map((entry,i)=>(
                  <View key={i} style={{marginBottom:8,paddingBottom:8,borderBottomWidth:i<history.length-1?1:0,borderBottomColor:'rgba(255,255,255,0.06)'}}>
                    <Text style={{fontSize:12,color:'rgba(249,242,231,0.5)',marginBottom:3}}>{t.q}{i+1}. {entry.q}</Text>
                    <Text style={{fontSize:14,fontWeight:'700',color:entry.answer===t.answerYes?'#10D9A0':entry.answer===t.answerNo?'#FF3D6B':'#F5A623'}}>{entry.answer}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
      )}

      {/* RÉSULTAT */}
      {screen==='result'&&(
        <View style={{alignItems:'center',backgroundColor:'rgba(255,255,255,0.04)',borderWidth:1,borderColor:'rgba(255,255,255,0.1)',borderRadius:24,padding:32}}>
          <Text style={{fontSize:56,marginBottom:12}}>{winner==='j2'?'🎉':'🏆'}</Text>
          <Text style={{fontSize:22,fontWeight:'900',color:winner==='j2'?'#10D9A0':'#F5A623',marginBottom:8}}>{winner==='j2'?t.j2wins:t.j1wins}</Text>
          <Text style={{color:'rgba(249,242,231,0.5)',fontSize:14,marginBottom:12}}>{winner==='j2'?t.correctGuess:t.giveUpConfirm}</Text>
          <View style={{backgroundColor:'rgba(16,217,160,0.18)',borderWidth:2,borderColor:'rgba(16,217,160,0.5)',borderRadius:16,padding:16,marginBottom:20,alignItems:'center'}}>
            <Text style={{fontSize:28,fontWeight:'900',color:'#10D9A0',letterSpacing:3}}>{(revealWord||secretWord).toUpperCase()}</Text>
          </View>
          <Text style={{color:'rgba(249,242,231,0.4)',fontSize:12,marginBottom:20}}>{qCount} {t.questions}</Text>
          <TouchableOpacity style={[s.btnR,{backgroundColor:'#10D9A0'}]} onPress={reset}><Text style={s.btnRT}>{t.playAgain}</Text></TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

// ══════════════════════════════════════════════
//  APP PRINCIPALE
// ══════════════════════════════════════════════
export default function App(){
  const [langue,setLangue]=useState(null);
  const [ecran,setEcran]=useState('langue');
  const [jeuActif,setJeuActif]=useState(null);
  const [session,setSession]=useState(null);
  const [estJ1,setEstJ1]=useState(true);
  const [niveauId,setNiveauId]=useState('doux');
  const [categorieKey,setCategorieKey]=useState('');
  const [nombreQ,setNombreQ]=useState(0);

  const t=TQ[langue]||TQ.fr;

  function allerAccueil(){setEcran('accueil');setJeuActif(null);setSession(null);}

  return(
    <SafeAreaView style={s.fond}>
      <StatusBar barStyle="light-content" backgroundColor="#0E0A14"/>
      {ecran==='langue'&&<ChoixLangue onChoisir={l=>{setLangue(l);setEcran('accueil');}}/>}
      {ecran==='accueil'&&<Accueil langue={langue} onJeu={id=>{setJeuActif(id);setEcran('jeu');}} onChangerLangue={()=>setEcran('langue')}/>}
      {ecran==='jeu'&&jeuActif==='quiz'&&<QuizConnexion t={t} onRetour={allerAccueil} onDemarrer={(code,j1)=>{setSession(code);setEstJ1(j1);setEcran('quiz-choix');}}/>}
      {ecran==='quiz-choix'&&<ChoixNiveau t={t} langue={langue} sessionCode={session} estJ1={estJ1} onDemarrer={(niv,cat)=>{setNiveauId(niv);setCategorieKey(cat);setEcran('quiz-game');}}/>}
      {ecran==='quiz-game'&&<Quiz t={t} langue={langue} sessionCode={session} estJ1={estJ1} niveauId={niveauId} categorieKey={categorieKey} onFin={n=>{setNombreQ(n);setEcran('quiz-resume');}}/>}
      {ecran==='quiz-resume'&&<QuizResume t={t} langue={langue} nombreQ={nombreQ} onChanger={niv=>{setNiveauId(niv);setEcran('quiz-choix');}} onAccueil={allerAccueil}/>}
      {ecran==='jeu'&&jeuActif==='kay'&&<KayGame langue={langue} onRetour={allerAccueil}/>}
      {ecran==='jeu'&&jeuActif==='devine'&&<DevineGame langue={langue} onRetour={allerAccueil}/>}
    </SafeAreaView>
  );
}

// ══════════════════════════════════════════════
//  STYLES
// ══════════════════════════════════════════════
const s=StyleSheet.create({
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
  jeuCard:{backgroundColor:'rgba(255,255,255,0.04)',borderWidth:1,borderRadius:20,padding:16,width:'100%',maxWidth:340,marginBottom:12},
  jeuEmoji:{width:56,height:56,borderRadius:16,alignItems:'center',justifyContent:'center'},
  jeuNom:{fontSize:16,fontWeight:'700',marginBottom:4},
  jeuDesc:{fontSize:12,color:'rgba(249,242,231,0.4)',lineHeight:16},
  scoreBox:{borderWidth:1,borderRadius:50,paddingVertical:8,paddingHorizontal:12,alignItems:'center',minWidth:72},
});
