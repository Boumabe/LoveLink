import { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, StyleSheet,
  SafeAreaView, StatusBar, TextInput, ActivityIndicator,
  KeyboardAvoidingView, Platform
} from 'react-native';

const FB_URL = "https://lovelink-a8e75-default-rtdb.firebaseio.com";
const API_URL = "/api/question";
async function fbSet(p,v){await fetch(`${FB_URL}/${p}.json`,{method:'PUT',body:JSON.stringify(v)});}
async function fbGet(p){const r=await fetch(`${FB_URL}/${p}.json`);return r.json();}
async function fbPush(p,v){await fetch(`${FB_URL}/${p}.json`,{method:'POST',body:JSON.stringify(v)});}
function fbListen(p,cb,ms=1500){const id=setInterval(async()=>{try{cb(await fbGet(p));}catch(e){}},ms);return()=>clearInterval(id);}
const genCode=()=>Math.random().toString(36).substring(2,8).toUpperCase();
const LETTRES=['A','B','C','D'];

const LANGUES=[
  {id:'fr',drapeau:'🇫🇷',nom:'Français'},
  {id:'en',drapeau:'🇬🇧',nom:'English'},
  {id:'es',drapeau:'🇪🇸',nom:'Español'},
  {id:'ht',drapeau:'🇭🇹',nom:'Kreyòl Ayisyen'},
];

const T={
  fr:{
    appName:'LoveLink',tagline:'Connectez-vous autrement',langue:'🌍 Langue',
    divertir:'Se Divertir',divertirDesc:'Jeux, défis et surprises',
    couple:'En Couple',coupleDesc:'Explorez votre complicité',
    retour:'← Retour',commencer:'Commencer →',
    creerSession:'Créer une session',creerDesc:'Génère un code pour ton partenaire',
    entrerCode:'ENTRER UN CODE',placeholder:'Ex: ABC123',rejoindre:'Rejoindre →',
    connectes:'Connectés ! 🎉',attente:'En attente...',partagerCode:'Partage ce code :',
    debutSession:'🚀 Démarrer →',
    divertirTitle:'Que voulez-vous jouer ?',
    quiz:'Quiz Couples',quizDesc:'Questions IA dans votre langue',
    devine:'Devine !',devineDesc:'Oui/Non pour trouver le mot',
    verite:'Vérité ou Défi',veriteDesc:'Questions intimes et défis amusants',
    generating:'✨ L\'IA génère...',choixReponse:'💭 Choisis ta réponse',
    attentePartner:'⏳ En attente de ton partenaire...',
    memeReponse:'💞 Vous pensez pareil !',parlezEnsemble:'🗣️ Parlez-en ensemble !',
    questionSuivante:'Question suivante →',resume:'Résumé →',
    autreReponse:'✏️ Ma propre réponse',valider:'Valider →',ecrireTa:'Écris ta réponse...',
    sessionTerminee:'Session terminée !',questionsExplo:'questions explorées 🥰',
    continuer:'Rejouer ?',accueil:'← Accueil',
    veriteTitre:'Vérité ou Défi',veriteSubtitle:'Oserez-vous ?',
    veriteLabel:'VÉRITÉ',defiLabel:'DÉFI',
    tourDe:'Tour de',choisit:'choisit...',attentChoix:'attend...',
    reponduBtn:'✅ Répondu / Fait !',passerBtn:'⏭️ Passer',
    niveaux:['🌸 Doux','🔥 Intense','🍑 Adulte 🔞'],
    devineTitle:'Devine !',createSession:'Créer une session',joinSession:'Rejoindre',
    codePlaceholder:'Code de session',waitingPartner:'En attente...',
    shareCode:'Partage ce code :',chooseMode:'Choisir le mode',
    modeIA:'🤖 L\'IA choisit',modeManuel:'🧠 Je pense à quelque chose',modePerso:'✏️ Je choisis un mot',
    modeIADesc:'L\'IA génère un mot — J1 voit, J2 devine',
    modeManuelDesc:'J1 pense à quelque chose — J2 pose des questions',
    modePersoDesc:'J1 entre un mot secret — J2 devine',
    chooseCategory:'Choisir une catégorie',enterWord:'Entre le mot secret',
    wordPlaceholder:'Ton mot secret...',
    youAreJ1:'Tu es J1 — Tu connais le mot',youAreJ2:'Tu es J2 — Tu vas deviner !',
    theWordIs:'Le mot secret :',keepSecret:'Ne le montre pas !',
    questionPlaceholder:'Pose ta question...',sendQuestion:'Envoyer →',
    answerYes:'✅ Oui',answerNo:'❌ Non',answerSometimes:'🤔 Parfois',
    waitingQuestion:'J2 prépare une question...',tryGuess:'Je devine !',
    guessBtnLabel:'Ma réponse :',guessPlaceholder:'Entre ta réponse...',
    confirmGuess:'Confirmer →',correctGuess:'🎉 Bravo ! Trouvé !',
    wrongGuess:'❌ Mauvaise réponse !',giveUp:'🏳️ Abandonner',
    giveUpConfirm:'Le mot était :',j2wins:'J2 a gagné !',j1wins:'J1 a gagné !',
    playAgain:'Rejouer →',questions:'questions',waitJ1:'Attends J1...',
    history:'Historique',chooseTimer:'Temps limite',
    sec90:'1 min 30',sec180:'3 min',sec360:'6 min',timeUp:'⏱️ Temps écoulé !',
    coupleTitle:'Mode Couple',coupleSubtitle:'10 questions pour révéler votre complicité',
    coupleHow:'L\'IA analyse vos réponses et détecte les zones à renforcer dans votre relation. Des exercices thérapeutiques personnalisés vous seront ensuite proposés.',
    question:'Question',sur:'sur',chacunRepond:'Répondez chacun de votre côté',
    analyseEnCours:'✨ Analyse en cours...',analyseDesc:'L\'IA examine vos réponses...',
    votreComplicite:'Votre Complicité',scoreLabel:'Score de complicité',
    faillePrincipale:'🔴 Zone principale à renforcer',failleSecondaire:'🟡 À surveiller aussi',
    exercicesTitle:'🌱 Exercices Recommandés',exercicesDesc:'Personnalisés pour votre couple',
    commencerExo:'Commencer →',duree:'Durée',etapes:'Étapes',etape:'Étape',
    exerciceSuivant:'Exercice suivant →',terminerSession:'Terminer',
    exoTermine:'✅ Exercice terminé !',bravoCouple:'Bravo à vous deux ! 💞',
    prochaine:'Question suivante →',minutes:'min',
  },
  en:{
    appName:'LoveLink',tagline:'Connect differently',langue:'🌍 Language',
    divertir:'Have Fun',divertirDesc:'Games, challenges and surprises',
    couple:'As a Couple',coupleDesc:'Explore your connection',
    retour:'← Back',commencer:'Start →',
    creerSession:'Create session',creerDesc:'Generate a code for your partner',
    entrerCode:'ENTER A CODE',placeholder:'Ex: ABC123',rejoindre:'Join →',
    connectes:'Connected! 🎉',attente:'Waiting...',partagerCode:'Share this code:',
    debutSession:'🚀 Start →',
    divertirTitle:'What do you want to play?',
    quiz:'Couples Quiz',quizDesc:'AI questions in your language',
    devine:'Guess It!',devineDesc:'Yes/No to find the word',
    verite:'Truth or Dare',veriteDesc:'Intimate questions and fun challenges',
    generating:'✨ AI generating...',choixReponse:'💭 Choose your answer',
    attentePartner:'⏳ Waiting for your partner...',
    memeReponse:'💞 You think alike!',parlezEnsemble:'🗣️ Talk about it!',
    questionSuivante:'Next question →',resume:'Summary →',
    autreReponse:'✏️ My own answer',valider:'Submit →',ecrireTa:'Write your answer...',
    sessionTerminee:'Session complete!',questionsExplo:'questions explored 🥰',
    continuer:'Play again?',accueil:'← Home',
    veriteTitre:'Truth or Dare',veriteSubtitle:'Do you dare?',
    veriteLabel:'TRUTH',defiLabel:'DARE',
    tourDe:'Turn of',choisit:'chooses...',attentChoix:'waiting...',
    reponduBtn:'✅ Done!',passerBtn:'⏭️ Skip',
    niveaux:['🌸 Soft','🔥 Intense','🍑 Adult 🔞'],
    devineTitle:'Guess It!',createSession:'Create session',joinSession:'Join',
    codePlaceholder:'Session code',waitingPartner:'Waiting...',
    shareCode:'Share this code:',chooseMode:'Choose mode',
    modeIA:'🤖 AI chooses',modeManuel:'🧠 I\'ll think of something',modePerso:'✏️ I choose a word',
    modeIADesc:'AI picks a word — J1 sees it, J2 guesses',
    modeManuelDesc:'J1 thinks of something — J2 asks questions',
    modePersoDesc:'J1 enters a secret word — J2 guesses',
    chooseCategory:'Choose a category',enterWord:'Enter the secret word',
    wordPlaceholder:'Your secret word...',
    youAreJ1:'You are J1 — You know the word',youAreJ2:'You are J2 — You will guess!',
    theWordIs:'The secret word:',keepSecret:'Don\'t show it!',
    questionPlaceholder:'Ask your question...',sendQuestion:'Send →',
    answerYes:'✅ Yes',answerNo:'❌ No',answerSometimes:'🤔 Sometimes',
    waitingQuestion:'J2 is preparing...',tryGuess:'Guess!',
    guessBtnLabel:'My answer:',guessPlaceholder:'Enter your answer...',
    confirmGuess:'Confirm →',correctGuess:'🎉 Correct! Found it!',
    wrongGuess:'❌ Wrong answer!',giveUp:'🏳️ Give up',
    giveUpConfirm:'The word was:',j2wins:'J2 wins!',j1wins:'J1 wins!',
    playAgain:'Play again →',questions:'questions',waitJ1:'Waiting for J1...',
    history:'History',chooseTimer:'Time limit',
    sec90:'1 min 30',sec180:'3 min',sec360:'6 min',timeUp:'⏱️ Time\'s up!',
    coupleTitle:'Couple Mode',coupleSubtitle:'10 questions to reveal your connection',
    coupleHow:'AI analyzes your answers and detects areas to strengthen. Personalized therapy exercises will then be suggested.',
    question:'Question',sur:'of',chacunRepond:'Each answers on their own side',
    analyseEnCours:'✨ Analyzing...',analyseDesc:'AI is examining your answers...',
    votreComplicite:'Your Connection',scoreLabel:'Connection score',
    faillePrincipale:'🔴 Main area to strengthen',failleSecondaire:'🟡 Also watch',
    exercicesTitle:'🌱 Recommended Exercises',exercicesDesc:'Personalized for your couple',
    commencerExo:'Start →',duree:'Duration',etapes:'Steps',etape:'Step',
    exerciceSuivant:'Next exercise →',terminerSession:'Finish',
    exoTermine:'✅ Exercise complete!',bravoCouple:'Well done both of you! 💞',
    prochaine:'Next question →',minutes:'min',
  },
  es:{
    appName:'LoveLink',tagline:'Conéctense diferente',langue:'🌍 Idioma',
    divertir:'Divertirse',divertirDesc:'Juegos, desafíos y sorpresas',
    couple:'En Pareja',coupleDesc:'Exploren su complicidad',
    retour:'← Volver',commencer:'Empezar →',
    creerSession:'Crear sesión',creerDesc:'Genera un código para tu pareja',
    entrerCode:'INGRESAR CÓDIGO',placeholder:'Ej: ABC123',rejoindre:'Unirse →',
    connectes:'¡Conectados! 🎉',attente:'Esperando...',partagerCode:'Comparte este código:',
    debutSession:'🚀 Iniciar →',
    divertirTitle:'¿Qué quieren jugar?',
    quiz:'Quiz de Parejas',quizDesc:'Preguntas IA en tu idioma',
    devine:'¡Adivina!',devineDesc:'Sí/No para encontrar la palabra',
    verite:'Verdad o Reto',veriteDesc:'Preguntas íntimas y retos divertidos',
    generating:'✨ La IA genera...',choixReponse:'💭 Elige tu respuesta',
    attentePartner:'⏳ Esperando a tu pareja...',
    memeReponse:'💞 ¡Piensan igual!',parlezEnsemble:'🗣️ ¡Háblalo juntos!',
    questionSuivante:'Siguiente pregunta →',resume:'Resumen →',
    autreReponse:'✏️ Mi propia respuesta',valider:'Enviar →',ecrireTa:'Escribe tu respuesta...',
    sessionTerminee:'¡Sesión terminada!',questionsExplo:'preguntas exploradas 🥰',
    continuer:'¿Jugar de nuevo?',accueil:'← Inicio',
    veriteTitre:'Verdad o Reto',veriteSubtitle:'¿Se atreven?',
    veriteLabel:'VERDAD',defiLabel:'RETO',
    tourDe:'Turno de',choisit:'elige...',attentChoix:'esperando...',
    reponduBtn:'✅ ¡Hecho!',passerBtn:'⏭️ Saltar',
    niveaux:['🌸 Suave','🔥 Intenso','🍑 Adulto 🔞'],
    devineTitle:'¡Adivina!',createSession:'Crear sesión',joinSession:'Unirse',
    codePlaceholder:'Código de sesión',waitingPartner:'Esperando...',
    shareCode:'Comparte este código:',chooseMode:'Elegir modo',
    modeIA:'🤖 La IA elige',modeManuel:'🧠 Yo pienso algo',modePerso:'✏️ Elijo una palabra',
    modeIADesc:'La IA elige una palabra — J1 la ve, J2 adivina',
    modeManuelDesc:'J1 piensa algo — J2 hace preguntas',
    modePersoDesc:'J1 ingresa una palabra secreta — J2 adivina',
    chooseCategory:'Elegir categoría',enterWord:'Ingresa la palabra secreta',
    wordPlaceholder:'Tu palabra secreta...',
    youAreJ1:'Eres J1 — Conoces la palabra',youAreJ2:'Eres J2 — ¡Vas a adivinar!',
    theWordIs:'La palabra secreta:',keepSecret:'¡No la muestres!',
    questionPlaceholder:'Haz tu pregunta...',sendQuestion:'Enviar →',
    answerYes:'✅ Sí',answerNo:'❌ No',answerSometimes:'🤔 A veces',
    waitingQuestion:'J2 prepara...',tryGuess:'¡Adivino!',
    guessBtnLabel:'Mi respuesta:',guessPlaceholder:'Ingresa tu respuesta...',
    confirmGuess:'Confirmar →',correctGuess:'🎉 ¡Correcto!',
    wrongGuess:'❌ ¡Incorrecto!',giveUp:'🏳️ Rendirse',
    giveUpConfirm:'La palabra era:',j2wins:'¡J2 gana!',j1wins:'¡J1 gana!',
    playAgain:'Jugar de nuevo →',questions:'preguntas',waitJ1:'Esperando J1...',
    history:'Historial',chooseTimer:'Tiempo límite',
    sec90:'1 min 30',sec180:'3 min',sec360:'6 min',timeUp:'⏱️ ¡Tiempo!',
    coupleTitle:'Modo Pareja',coupleSubtitle:'10 preguntas para revelar su conexión',
    coupleHow:'La IA analiza sus respuestas y detecta áreas a fortalecer. Luego se sugerirán ejercicios terapéuticos personalizados.',
    question:'Pregunta',sur:'de',chacunRepond:'Cada uno responde por su lado',
    analyseEnCours:'✨ Analizando...',analyseDesc:'La IA examina sus respuestas...',
    votreComplicite:'Su Complicidad',scoreLabel:'Puntuación de complicidad',
    faillePrincipale:'🔴 Área principal a fortalecer',failleSecondaire:'🟡 También vigilar',
    exercicesTitle:'🌱 Ejercicios Recomendados',exercicesDesc:'Personalizados para su pareja',
    commencerExo:'Iniciar →',duree:'Duración',etapes:'Pasos',etape:'Paso',
    exerciceSuivant:'Siguiente ejercicio →',terminerSession:'Terminar',
    exoTermine:'✅ ¡Ejercicio completado!',bravoCouple:'¡Bien hecho los dos! 💞',
    prochaine:'Siguiente pregunta →',minutes:'min',
  },
  ht:{
    appName:'LoveLink',tagline:'Konekte diferaman',langue:'🌍 Lang',
    divertir:'Amize Ou',divertirDesc:'Jwèt, defi ak sipriz',
    couple:'An Koup',coupleDesc:'Eksplore konplisite ou',
    retour:'← Tounen',commencer:'Kòmanse →',
    creerSession:'Kreye sesyon',creerDesc:'Jenere yon kòd pou patnè ou',
    entrerCode:'ANTRE KÒD LA',placeholder:'Egz: ABC123',rejoindre:'Rantre →',
    connectes:'Konekte! 🎉',attente:'Ap tann...',partagerCode:'Pataje kòd sa:',
    debutSession:'🚀 Kòmanse →',
    divertirTitle:'Kisa ou vle jwe?',
    quiz:'Jwèt Koup',quizDesc:'Kesyon IA nan lang ou',
    devine:'Devine!',devineDesc:'Wi/Non pou jwenn mo a',
    verite:'Verite oswa Defi',veriteDesc:'Kesyon entim ak defi amizan',
    generating:'✨ IA ap jenere...',choixReponse:'💭 Chwazi repons ou',
    attentePartner:'⏳ Ap tann patnè ou...',
    memeReponse:'💞 Nou panse menm bagay!',parlezEnsemble:'🗣️ Pale sou li ansanm!',
    questionSuivante:'Pwochen kesyon →',resume:'Rezime →',
    autreReponse:'✏️ Repons pa mwen',valider:'Voye →',ecrireTa:'Ekri repons ou...',
    sessionTerminee:'Sesyon fini!',questionsExplo:'kesyon eksplore 🥰',
    continuer:'Jwe ankò?',accueil:'← Akèy',
    veriteTitre:'Verite oswa Defi',veriteSubtitle:'Ou koze?',
    veriteLabel:'VERITE',defiLabel:'DEFI',
    tourDe:'Tou',choisit:'chwazi...',attentChoix:'ap tann...',
    reponduBtn:'✅ Fini!',passerBtn:'⏭️ Pase',
    niveaux:['🌸 Dou','🔥 Entans','🍑 Granmoun 🔞'],
    devineTitle:'Devine!',createSession:'Kreye sesyon',joinSession:'Rantre',
    codePlaceholder:'Kòd sesyon',waitingPartner:'Ap tann...',
    shareCode:'Pataje kòd sa:',chooseMode:'Chwazi mòd',
    modeIA:'🤖 IA chwazi',modeManuel:'🧠 Mwen panse yon bagay',modePerso:'✏️ Mwen chwazi yon mo',
    modeIADesc:'IA chwazi yon mo — J1 wè li, J2 devine',
    modeManuelDesc:'J1 panse yon bagay — J2 poze kesyon',
    modePersoDesc:'J1 antre yon mo sekrè — J2 devine',
    chooseCategory:'Chwazi kategori',enterWord:'Antre mo sekrè a',
    wordPlaceholder:'Mo sekrè ou...',
    youAreJ1:'Ou se J1 — Ou konnen mo a',youAreJ2:'Ou se J2 — Ou pral devine!',
    theWordIs:'Mo sekrè a:',keepSecret:'Pa montre l!',
    questionPlaceholder:'Poze kesyon ou...',sendQuestion:'Voye →',
    answerYes:'✅ Wi',answerNo:'❌ Non',answerSometimes:'🤔 Pafwa',
    waitingQuestion:'J2 ap prepare...',tryGuess:'Mwen devine!',
    guessBtnLabel:'Repons mwen:',guessPlaceholder:'Antre repons ou...',
    confirmGuess:'Konfime →',correctGuess:'🎉 Bravo! Jwenn li!',
    wrongGuess:'❌ Pa bon!',giveUp:'🏳️ Abandone',
    giveUpConfirm:'Mo a te:',j2wins:'J2 genyen!',j1wins:'J1 genyen!',
    playAgain:'Jwe ankò →',questions:'kesyon',waitJ1:'Tann J1...',
    history:'Istwa',chooseTimer:'Limit tan',
    sec90:'1 min 30',sec180:'3 minit',sec360:'6 minit',timeUp:'⏱️ Tan fini!',
    coupleTitle:'Mòd Koup',coupleSubtitle:'10 kesyon pou reveye konplisite ou',
    coupleHow:'IA analize repons nou yo epi detekte zòn pou ranfòse. Epi egzèsis terapi pèsonalize pral sijere.',
    question:'Kesyon',sur:'sou',chacunRepond:'Chak moun reponn bò pa l',
    analyseEnCours:'✨ Analiz...',analyseDesc:'IA ap egzamine repons nou yo...',
    votreComplicite:'Konplisite Nou',scoreLabel:'Nivo konplisite',
    faillePrincipale:'🔴 Zòn prensipal pou ranfòse',failleSecondaire:'🟡 Veye tou',
    exercicesTitle:'🌱 Egzèsis Rekòmande',exercicesDesc:'Pèsonalize pou koup nou',
    commencerExo:'Kòmanse →',duree:'Dire',etapes:'Etap',etape:'Etap',
    exerciceSuivant:'Pwochen egzèsis →',terminerSession:'Fini',
    exoTermine:'✅ Egzèsis fini!',bravoCouple:'Bravo nou de! 💞',
    prochaine:'Pwochen kesyon →',minutes:'min',
  },
};

const FAILLES={
  communication:{emoji:'🗣️',couleur:'#FF3D6B',fr:{nom:'Communication',desc:'Vous ne vous parlez pas vraiment'},en:{nom:'Communication',desc:'You don\'t truly talk'},es:{nom:'Comunicación',desc:'No se hablan de verdad'},ht:{nom:'Kominikasyon',desc:'Nou pa pale vrèman'}},
  intimite:{emoji:'💕',couleur:'#F5A623',fr:{nom:'Intimité',desc:'Distance émotionnelle ou physique'},en:{nom:'Intimacy',desc:'Emotional or physical distance'},es:{nom:'Intimidad',desc:'Distancia emocional o física'},ht:{nom:'Entimite',desc:'Distans emosyonèl oswa fizik'}},
  confiance:{emoji:'🔒',couleur:'#7C3AED',fr:{nom:'Confiance',desc:'Non-dits, jalousie ou secrets'},en:{nom:'Trust',desc:'Unspoken things or jealousy'},es:{nom:'Confianza',desc:'Cosas no dichas o celos'},ht:{nom:'Konfyans',desc:'Bagay ki pa di, jalouzi'}},
  vision:{emoji:'🔮',couleur:'#10D9A0',fr:{nom:'Vision Commune',desc:'Pas les mêmes objectifs de vie'},en:{nom:'Shared Vision',desc:'Different life goals'},es:{nom:'Visión Común',desc:'Objetivos de vida diferentes'},ht:{nom:'Vizyon Komen',desc:'Pa menm objektif lavi'}},
  conflits:{emoji:'⚡',couleur:'#3B82F6',fr:{nom:'Conflits',desc:'Escalade ou évitement des disputes'},en:{nom:'Conflicts',desc:'Escalation or avoidance'},es:{nom:'Conflictos',desc:'Escalada o evitación'},ht:{nom:'Konfli',desc:'Eskalad oswa evitasyon'}},
};

const QUESTIONS_COUPLE={
  fr:[
    {id:'q1',question:"Quand vous avez un problème, à qui le parlez-vous en premier ?",choix:["À mon partenaire toujours","À mon partenaire souvent","À des amis/famille d'abord","Je le garde pour moi"],poids:{communication:[0,0,2,3],confiance:[0,1,2,3]}},
    {id:'q2',question:"À quelle fréquence faites-vous des projets d'avenir ensemble ?",choix:["Très souvent","Parfois","Rarement","Presque jamais"],poids:{vision:[0,1,2,3]}},
    {id:'q3',question:"Lors d'un conflit, vous avez tendance à...",choix:["Chercher un compromis","Prendre du recul","Vous énerver","Éviter le sujet"],poids:{conflits:[0,1,2,3]}},
    {id:'q4',question:"Quand votre partenaire exprime quelque chose, vous vous sentez...",choix:["Toujours compris(e)","Souvent compris(e)","Parfois compris(e)","Rarement compris(e)"],poids:{communication:[0,1,2,3],intimite:[0,1,2,3]}},
    {id:'q5',question:"Dans votre couple, les câlins et gestes d'affection sont...",choix:["Fréquents et naturels","Présents mais pourraient être plus","Rares","Presque absents"],poids:{intimite:[0,1,2,3]}},
    {id:'q6',question:"À quelle fréquence avez-vous des conversations profondes ?",choix:["Plusieurs fois par semaine","Une fois par semaine","Rarement","Presque jamais"],poids:{communication:[0,1,2,3]}},
    {id:'q7',question:"Y a-t-il des sujets que vous évitez d'aborder ensemble ?",choix:["Non, je peux tout dire","Quelques petites choses","Plusieurs sujets importants","Beaucoup de sujets"],poids:{confiance:[0,1,2,3],communication:[0,0,1,2]}},
    {id:'q8',question:"Sur votre avenir commun, vous êtes...",choix:["Totalement alignés","Globalement d'accord","Sur quelques désaccords","Sur beaucoup de désaccords"],poids:{vision:[0,1,2,3]}},
    {id:'q9',question:"Comment qualifiez-vous votre connexion émotionnelle en ce moment ?",choix:["Très forte et présente","Bonne mais peut mieux faire","Un peu distante","Vraiment distante"],poids:{intimite:[0,1,2,3]}},
    {id:'q10',question:"Après une dispute, comment vous réconciliez-vous habituellement ?",choix:["Rapidement avec des mots doux","On en parle et on règle","L'un cède sans vraie résolution","Ça traîne longtemps"],poids:{conflits:[0,1,2,3]}},
  ],
  en:[
    {id:'q1',question:"When you have a problem, who do you talk to first?",choix:["My partner always","My partner often","Friends/family first","I keep it to myself"],poids:{communication:[0,0,2,3],confiance:[0,1,2,3]}},
    {id:'q2',question:"How often do you make future plans together?",choix:["Very often","Sometimes","Rarely","Almost never"],poids:{vision:[0,1,2,3]}},
    {id:'q3',question:"During a conflict, you tend to...",choix:["Seek a compromise","Step back","Get upset","Avoid the topic"],poids:{conflits:[0,1,2,3]}},
    {id:'q4',question:"When your partner expresses something, you feel...",choix:["Always understood","Often understood","Sometimes understood","Rarely understood"],poids:{communication:[0,1,2,3],intimite:[0,1,2,3]}},
    {id:'q5',question:"In your relationship, physical affection is...",choix:["Frequent and natural","Present but could be more","Rare","Almost absent"],poids:{intimite:[0,1,2,3]}},
    {id:'q6',question:"How often do you have deep conversations?",choix:["Several times a week","Once a week","Rarely","Almost never"],poids:{communication:[0,1,2,3]}},
    {id:'q7',question:"Are there topics you avoid bringing up together?",choix:["No, I can say everything","A few small things","Several important topics","Many topics"],poids:{confiance:[0,1,2,3],communication:[0,0,1,2]}},
    {id:'q8',question:"On your shared future, you are...",choix:["Totally aligned","Mostly in agreement","On some disagreements","On many disagreements"],poids:{vision:[0,1,2,3]}},
    {id:'q9',question:"How would you describe your emotional connection right now?",choix:["Very strong and present","Good but could be better","A bit distant","Really distant"],poids:{intimite:[0,1,2,3]}},
    {id:'q10',question:"After an argument, how do you usually reconcile?",choix:["Quickly with kind words","We talk and resolve it","One gives in without resolution","It drags on"],poids:{conflits:[0,1,2,3]}},
  ],
  es:[
    {id:'q1',question:"Cuando tienes un problema, ¿a quién se lo dices primero?",choix:["A mi pareja siempre","A mi pareja a menudo","A amigos/familia primero","Me lo guardo"],poids:{communication:[0,0,2,3],confiance:[0,1,2,3]}},
    {id:'q2',question:"¿Con qué frecuencia hacen planes de futuro juntos?",choix:["Muy seguido","A veces","Raramente","Casi nunca"],poids:{vision:[0,1,2,3]}},
    {id:'q3',question:"Durante un conflicto, tiendes a...",choix:["Buscar un compromiso","Tomar distancia","Enojarte","Evitar el tema"],poids:{conflits:[0,1,2,3]}},
    {id:'q4',question:"Cuando tu pareja expresa algo, te sientes...",choix:["Siempre comprendido/a","A menudo comprendido/a","A veces comprendido/a","Raramente comprendido/a"],poids:{communication:[0,1,2,3],intimite:[0,1,2,3]}},
    {id:'q5',question:"En tu relación, el afecto físico es...",choix:["Frecuente y natural","Presente pero podría ser más","Raro","Casi ausente"],poids:{intimite:[0,1,2,3]}},
    {id:'q6',question:"¿Con qué frecuencia tienen conversaciones profundas?",choix:["Varias veces por semana","Una vez por semana","Raramente","Casi nunca"],poids:{communication:[0,1,2,3]}},
    {id:'q7',question:"¿Hay temas que evitan traer a colación juntos?",choix:["No, puedo decir todo","Algunas cosas pequeñas","Varios temas importantes","Muchos temas"],poids:{confiance:[0,1,2,3],communication:[0,0,1,2]}},
    {id:'q8',question:"Sobre su futuro común, están...",choix:["Totalmente alineados","Generalmente de acuerdo","En algunos desacuerdos","En muchos desacuerdos"],poids:{vision:[0,1,2,3]}},
    {id:'q9',question:"¿Cómo describirías tu conexión emocional ahora mismo?",choix:["Muy fuerte y presente","Buena pero podría mejorar","Un poco distante","Realmente distante"],poids:{intimite:[0,1,2,3]}},
    {id:'q10',question:"Después de una pelea, ¿cómo se reconcilian habitualmente?",choix:["Rápidamente con palabras amables","Hablamos y resolvemos","Uno cede sin resolución","Se prolonga mucho"],poids:{conflits:[0,1,2,3]}},
  ],
  ht:[
    {id:'q1',question:"Lè ou gen yon pwoblèm, ak ki moun ou pale an premye?",choix:["Ak patnè mwen toujou","Ak patnè mwen souvan","Ak zanmi/fanmi an premye","Mwen kenbe l pou mwen"],poids:{communication:[0,0,2,3],confiance:[0,1,2,3]}},
    {id:'q2',question:"Ki frekans ou fè plan avni ansanm?",choix:["Trè souvan","Pafwa","Raman","Prèske janm"],poids:{vision:[0,1,2,3]}},
    {id:'q3',question:"Pandan yon konfli, ou gen tandans...",choix:["Chèche yon konpwomi","Pran distans","Fache","Evite sijè a"],poids:{conflits:[0,1,2,3]}},
    {id:'q4',question:"Lè patnè ou eksprime yon bagay, ou santi...",choix:["Toujou konprann","Souvan konprann","Pafwa konprann","Raman konprann"],poids:{communication:[0,1,2,3],intimite:[0,1,2,3]}},
    {id:'q5',question:"Nan relasyon ou a, kòlòn ak afeksyon fizik yo...",choix:["Frekant ak natirèl","Prezan men ta ka pi plis","Ra","Prèske absant"],poids:{intimite:[0,1,2,3]}},
    {id:'q6',question:"Ki frekans ou gen konvèsasyon pwofon?",choix:["Plizyè fwa pa semèn","Yon fwa pa semèn","Raman","Prèske janm"],poids:{communication:[0,1,2,3]}},
    {id:'q7',question:"Èske gen sijè ou evite abòde ansanm?",choix:["Non, mwen ka di tout bagay","Kèk ti bagay","Plizyè sijè enpòtan","Anpil sijè"],poids:{confiance:[0,1,2,3],communication:[0,0,1,2]}},
    {id:'q8',question:"Sou avni komen nou, nou...",choix:["Totalman aliye","Globalman dakò","Sou kèk dezakò","Sou anpil dezakò"],poids:{vision:[0,1,2,3]}},
    {id:'q9',question:"Kijan ou ka dekri koneksyon emosyonèl ou kounye a?",choix:["Trè fò ak prezan","Bon men ta ka pi bon","Yon ti jan lwen","Vrèman lwen"],poids:{intimite:[0,1,2,3]}},
    {id:'q10',question:"Apre yon diskisyon, kijan ou rekonsilye nòmalman?",choix:["Vit ak mo dou","Nou pale epi nou regle l","Youn sede san rezolisyon","Sa trennen lontan"],poids:{conflits:[0,1,2,3]}},
  ],
};

const EXERCICES={
  ecoute_active:{faille:'communication',duree:5,fr:{titre:"L'Écoute Active",emoji:'👂',description:'Parler sans être interrompu.',instructions:['J1 parle 3 minutes sur ce qu\'il ressent','J2 écoute sans interrompre, sans téléphone','J2 reformule : "Ce que j\'entends c\'est que tu ressens..."','J1 confirme ou corrige doucement','Inversez les rôles'],recompense:'💬 Maîtres de l\'Écoute'},en:{titre:"Active Listening",emoji:'👂',description:'Speaking without being interrupted.',instructions:['J1 speaks 3 min about how they feel','J2 listens without interrupting','J2 reflects: "What I hear is that you feel..."','J1 confirms or gently corrects','Switch roles'],recompense:'💬 Listening Masters'},es:{titre:"Escucha Activa",emoji:'👂',description:'Hablar sin ser interrumpido.',instructions:['J1 habla 3 min sobre lo que siente','J2 escucha sin interrumpir','J2 refleja: "Lo que escucho es que sientes..."','J1 confirma o corrige','Cambien roles'],recompense:'💬 Maestros de la Escucha'},ht:{titre:"Koute Aktif",emoji:'👂',description:'Pale san yo pa deranje ou.',instructions:['J1 pale 3 minit sou sa l santi','J2 koute san enteronp','J2 di: "Sa m tande se ke ou santi..."','J1 konfime oswa korije','Chanje wòl'],recompense:'💬 Mèt Koute'}},
  cnv:{faille:'communication',duree:4,fr:{titre:"Communication Non-Violente",emoji:'🕊️',description:'La formule qui désamorce tous les conflits.',instructions:['Pensez à un sujet de tension','J1 : "Quand tu [action], je ressens [émotion] parce que j\'ai besoin de [besoin]"','J2 écoute sans se défendre','J2 : "J\'entends que tu as besoin de... Je propose..."','Cherchez un compromis ensemble'],recompense:'🕊️ Diplomates de l\'Amour'},en:{titre:"Non-Violent Communication",emoji:'🕊️',description:'The formula that defuses conflicts.',instructions:['Think of a tension source','J1: "When you [action], I feel [emotion] because I need [need]"','J2 listens without defending','J2: "I hear you need... I propose..."','Find a compromise together'],recompense:'🕊️ Love Diplomats'},es:{titre:"Comunicación No Violenta",emoji:'🕊️',description:'La fórmula que desactiva conflictos.',instructions:['Piensen en una tensión','J1: "Cuando [acción], siento [emoción] porque necesito [necesidad]"','J2 escucha sin defenderse','J2: "Escucho que necesitas... Propongo..."','Busquen un compromiso'],recompense:'🕊️ Diplomáticos del Amor'},ht:{titre:"Kominikasyon San Vyolans",emoji:'🕊️',description:'Fòmil ki desamòse konfli.',instructions:['Panse a yon tansyon','J1: "Lè ou [aksyon], mwen santi [emosyon] paske mwen bezwen [bezwen]"','J2 koute san defann tèt li','J2: "Mwen tande ou bezwen... Mwen pwopòze..."','Chèche konpwomi'],recompense:'🕊️ Diplomatè Lanmou'}},
  baiser_gottman:{faille:'intimite',duree:1,fr:{titre:"Le Baiser de Gottman",emoji:'💋',description:'6 secondes pour transformer la connexion.',instructions:['Regardez-vous dans les yeux 3 secondes','Donnez-vous un baiser d\'exactement 6 secondes','Restez dans l\'instant présent','Recommencez 3 fois dans la journée'],recompense:'💋 Champions de l\'Intimité'},en:{titre:"The Gottman Kiss",emoji:'💋',description:'6 seconds to transform connection.',instructions:['Look each other in the eyes 3 seconds','Give each other a kiss of exactly 6 seconds','Stay in the present moment','Repeat 3 times throughout the day'],recompense:'💋 Intimacy Champions'},es:{titre:"El Beso de Gottman",emoji:'💋',description:'6 segundos para transformar la conexión.',instructions:['Mírence a los ojos 3 segundos','Dense un beso de exactamente 6 segundos','Permanezcan en el momento presente','Repitan 3 veces durante el día'],recompense:'💋 Campeones de la Intimidad'},ht:{titre:"Bo Gottman",emoji:'💋',description:'6 segonn pou transfòme koneksyon.',instructions:['Gade youn lòt nan je 3 segonn','Ba youn lòt yon bo egzakteman 6 segonn','Rete nan moman prezan','Repete 3 fwa pandan jounen'],recompense:'💋 Chanpyon Entimite'}},
  calin_20s:{faille:'intimite',duree:1,fr:{titre:"Le Câlin de l'Ocytocine",emoji:'🤗',description:'20 secondes pour libérer l\'hormone du lien.',instructions:['Serrez-vous dans les bras','Maintenez exactement 20 secondes','Respirez ensemble, synchronisez','Sentez la chaleur de l\'autre','Ne lâchez pas avant 20 secondes'],recompense:'🤗 Générateurs d\'Ocytocine'},en:{titre:"The Oxytocin Hug",emoji:'🤗',description:'20 seconds to release the bonding hormone.',instructions:['Hold each other in your arms','Maintain for exactly 20 seconds','Breathe together, synchronize','Feel the warmth of the other','Don\'t let go before 20 seconds'],recompense:'🤗 Oxytocin Generators'},es:{titre:"El Abrazo de Oxitocina",emoji:'🤗',description:'20 segundos para liberar la hormona del vínculo.',instructions:['Abrácense mutuamente','Mantengan exactamente 20 segundos','Respiren juntos, sincronicen','Sientan el calor del otro','No se suelten antes de 20 segundos'],recompense:'🤗 Generadores de Oxitocina'},ht:{titre:"Kòlòn Oksitosin",emoji:'🤗',description:'20 segonn pou libere òmòn lyen an.',instructions:['Anbrase youn lòt','Kenbe egzakteman 20 segonn','Respire ansanm, senkronize','Santi chalè lòt la','Pa lage anvan 20 segonn'],recompense:'🤗 Jenatè Oksitosin'}},
  inventaire_non_dits:{faille:'confiance',duree:5,fr:{titre:"L'Inventaire des Non-Dits",emoji:'🔓',description:'Libérer ce qui pèse sans blesser.',instructions:['Chacun écrit UN non-dit qui pèse','Pas de reproches — vérités douces seulement','Lisez-vous mutuellement à voix haute','L\'autre répond : "Merci de me le dire"','Aucun débat — juste recevoir'],recompense:'🔓 Libérateurs de Vérité'},en:{titre:"Unspoken Inventory",emoji:'🔓',description:'Releasing what weighs without hurting.',instructions:['Each writes ONE unspoken thing','No blame — gentle truths only','Read aloud to each other','The other responds: "Thank you for telling me"','No debate — just receive'],recompense:'🔓 Truth Liberators'},es:{titre:"Inventario de lo No Dicho",emoji:'🔓',description:'Liberar lo que pesa sin herir.',instructions:['Cada uno escribe UNA cosa no dicha','Sin reproches — solo verdades suaves','Léanse en voz alta','El otro responde: "Gracias por decirme"','Sin debate — solo recibir'],recompense:'🔓 Liberadores de Verdad'},ht:{titre:"Envantè Bagay Ki Pa Di",emoji:'🔓',description:'Libere sa ki peze san fè mal.',instructions:['Chak moun ekri YON bagay ki pa di','Pa reproch — verite dou sèlman','Li youn bay lòt a vwa wo','Lòt la reponn: "Mèsi pou m di mwen"','Pa deba — jis resevwa'],recompense:'🔓 Liberatè Verite'}},
  carte_reves:{faille:'vision',duree:10,fr:{titre:"La Carte des Rêves",emoji:'🗺️',description:'Construire votre avenir ensemble.',instructions:['Chacun liste 5 rêves pour les 5 prochaines années','Partagez vos listes à voix haute','Identifiez les rêves qui se complètent','Choisissez UN rêve commun et planifiez la 1ère étape','Nommez votre rêve commun'],recompense:'🗺️ Architectes d\'Avenir'},en:{titre:"Dream Map",emoji:'🗺️',description:'Build your future together.',instructions:['Each lists 5 dreams for next 5 years','Share lists aloud','Identify complementary dreams','Choose ONE common dream, plan first step','Name your common dream'],recompense:'🗺️ Future Architects'},es:{titre:"Mapa de Sueños",emoji:'🗺️',description:'Construir su futuro juntos.',instructions:['Cada uno lista 5 sueños para 5 años','Compartan listas en voz alta','Identifiquen sueños complementarios','Elijan UN sueño común, planifiquen primer paso','Nombren su sueño común'],recompense:'🗺️ Arquitectos del Futuro'},ht:{titre:"Kat Rèv",emoji:'🗺️',description:'Bati avni nou ansanm.',instructions:['Chak moun liste 5 rèv pou 5 ane','Pataje lis yo a vwa wo','Idantifye rèv ki konplete youn lòt','Chwazi YON rèv komen, planifye premye etap','Bay rèv komen non'],recompense:'🗺️ Achitèk Avni'}},
  pause_20_minutes:{faille:'conflits',duree:20,fr:{titre:"La Pause de Gottman",emoji:'⏸️',description:'Stop avant que ça dérape.',instructions:['Quand la tension monte, l\'un dit : "Pause"','Séparez-vous exactement 20 minutes','Chacun fait quelque chose de calme','Après 20 min : revenez et dites "Je t\'écoute"','Reprenez avec une voix douce'],recompense:'⏸️ Maîtres de la Pause'},en:{titre:"Gottman Pause",emoji:'⏸️',description:'Stop before things escalate.',instructions:['When tension rises, one says: "Pause"','Separate for exactly 20 minutes','Each does something calm','After 20 min: return and say "I\'m listening"','Resume with a soft voice'],recompense:'⏸️ Pause Masters'},es:{titre:"La Pausa de Gottman",emoji:'⏸️',description:'Para antes de que se desmadre.',instructions:['Cuando la tensión sube, uno dice: "Pausa"','Sepárense exactamente 20 minutos','Cada uno hace algo tranquilo','Después de 20 min: vuelvan y digan "Te escucho"','Retomen con voz suave'],recompense:'⏸️ Maestros de la Pausa'},ht:{titre:"Pòz Gottman",emoji:'⏸️',description:'Kanpe anvan bagay la depatcha.',instructions:['Lè tansyon an monte, youn di: "Pòz"','Separe egzakteman 20 minit','Chak moun fè yon bagay trankil','Apre 20 minit: retounen epi di "Mwen koute ou"','Rekòmanse ak yon vwa dou'],recompense:'⏸️ Mèt Pòz'}},
  xyz_gottman:{faille:'conflits',duree:5,fr:{titre:"La Formule XYZ",emoji:'🔢',description:'Exprimer une plainte sans attaquer.',instructions:['Pensez à un comportement gênant','"Dans la situation [X], quand tu fais [Y], je ressens [Z]"','Pas de "tu es...", "tu fais toujours..."','L\'autre écoute sans se défendre','Cherchez une solution concrète'],recompense:'🔢 Chirurgiens des Mots'},en:{titre:"The XYZ Formula",emoji:'🔢',description:'Express a complaint without attacking.',instructions:['Think of a bothersome behavior','"In situation [X], when you do [Y], I feel [Z]"','No "you are...", "you always..."','The other listens without defending','Find a concrete solution'],recompense:'🔢 Word Surgeons'},es:{titre:"La Fórmula XYZ",emoji:'🔢',description:'Expresar una queja sin atacar.',instructions:['Piensen en un comportamiento molesto','"En la situación [X], cuando haces [Y], siento [Z]"','Sin "eres...", "siempre..."','El otro escucha sin defenderse','Busquen solución concreta'],recompense:'🔢 Cirujanos de las Palabras'},ht:{titre:"Fòmil XYZ",emoji:'🔢',description:'Eksprime yon plent san atake.',instructions:['Panse a yon konpòtman ki deranje','"Nan sitiyasyon [X], lè ou fè [Y], mwen santi [Z]"','Pa "ou se...", "ou toujou..."','Lòt la koute san defann tèt li','Chèche yon solisyon konkrè'],recompense:'🔢 Chirirjyen Mo'}},
  douche_appreciation:{faille:'confiance',duree:3,fr:{titre:"La Douche d'Appréciation",emoji:'🌟',description:'Être inondé de ce qu\'on aime chez vous.',instructions:['J1 s\'assoit, yeux fermés','J2 dit 5 qualités admirées chez J1','J1 écoute en silence sans minimiser','J1 dit seulement "Merci"','Inversez les rôles'],recompense:'🌟 Rayonnants d\'Amour'},en:{titre:"Appreciation Shower",emoji:'🌟',description:'Being flooded with what is loved about you.',instructions:['J1 sits with eyes closed','J2 says 5 qualities truly admired in J1','J1 listens in silence without minimizing','J1 says only "Thank you"','Switch roles'],recompense:'🌟 Love Radiators'},es:{titre:"Ducha de Apreciación",emoji:'🌟',description:'Ser inundado con lo que se ama de ti.',instructions:['J1 se sienta con ojos cerrados','J2 dice 5 cualidades admiradas en J1','J1 escucha en silencio sin minimizar','J1 dice solo "Gracias"','Cambien roles'],recompense:'🌟 Radiadores de Amor'},ht:{titre:"Douch Apresyasyon",emoji:'🌟',description:'Yo inonde ou ak sa yo renmen nan ou.',instructions:['J1 chita je fèmen','J2 di 5 kalite admire nan J1','J1 koute an silans san minimize','J1 di sèlman "Mèsi"','Chanje wòl'],recompense:'🌟 Reyon Lanmou'}},
  respiration_reconnexion:{faille:'conflits',duree:2,fr:{titre:"Respiration de Reconnexion",emoji:'🫁',description:'Revenir au calme en 2 minutes.',instructions:['Asseyez-vous face à face','Inspirez ensemble 4 secondes','Retenez ensemble 2 secondes','Expirez ensemble 6 secondes','Répétez 5 fois avec contact visuel'],recompense:'🫁 Souffleurs de Paix'},en:{titre:"Reconnection Breathing",emoji:'🫁',description:'Return to calm in 2 minutes.',instructions:['Sit facing each other','Inhale together 4 seconds','Hold together 2 seconds','Exhale together 6 seconds','Repeat 5 times with eye contact'],recompense:'🫁 Peace Breathers'},es:{titre:"Respiración de Reconexión",emoji:'🫁',description:'Volver a la calma en 2 minutos.',instructions:['Siéntense frente a frente','Inhalen juntos 4 segundos','Retengan juntos 2 segundos','Exhalen juntos 6 segundos','Repitan 5 veces con contacto visual'],recompense:'🫁 Sopladores de Paz'},ht:{titre:"Respirasyon Rekoneksyon",emoji:'🫁',description:'Retounen nan kàm nan 2 minit.',instructions:['Chita fas a fas','Respire ansanm 4 segonn','Kenbe ansanm 2 segonn','Ekspire ansanm 6 segonn','Repete 5 fwa ak kontak je'],recompense:'🫁 Soflè Lapè'}},
};

function analyserReponsesCouple(repJ1,repJ2,langue){
  const questions=QUESTIONS_COUPLE[langue]||QUESTIONS_COUPLE.fr;
  const scores={communication:0,intimite:0,confiance:0,vision:0,conflits:0};
  questions.forEach((q,idx)=>{
    const r1=repJ1[idx]??0,r2=repJ2[idx]??0;
    const moy=Math.round((r1+r2)/2);
    Object.entries(q.poids).forEach(([f,pts])=>{scores[f]+=pts[moy]||0;});
  });
  const triees=Object.entries(scores).sort(([,a],[,b])=>b-a);
  const faille1=triees[0]?.[0]||'communication';
  const faille2=triees[1]?.[0]||'intimite';
  const total=Object.values(scores).reduce((a,b)=>a+b,0);
  const max=questions.length*3*2;
  const complicite=Math.max(10,Math.round(100-(total/max)*100));
  const exos=Object.values(EXERCICES);
  const ex1=exos.filter(e=>e.faille===faille1).slice(0,2);
  const ex2=exos.filter(e=>e.faille===faille2).slice(0,1);
  return{scores,faille1,faille2,complicite,exercices:[...ex1,...ex2]};
}

const FALLBACK=[
  {e:"💕",t:"Quelle est la chose que tu préfères faire avec moi ?",r:["Parler pendant des heures","Rire aux éclats","Se faire des câlins","Regarder des films ensemble"]},
  {e:"🌙",t:"Quel est le moment où tu penses le plus à moi ?",r:["Le matin au réveil","Le soir avant de dormir","Pendant une journée difficile","À tout moment"]},
  {e:"🌱",t:"Quelle valeur est la plus importante dans notre relation ?",r:["La confiance","L'honnêteté","Le respect","La communication"]},
];
const NIVEAUX={
  fr:[{id:'doux',emoji:'🌸',nom:'Se connaître',desc:'Questions douces',couleur:'#10D9A0'},{id:'intense',emoji:'🔥',nom:'Intense',desc:"À l'épreuve",couleur:'#F5A623'},{id:'dark',emoji:'🌑',nom:'Dark',desc:'Sombres et profondes',couleur:'#7C3AED'},{id:'coquin',emoji:'🍑',nom:'Coquin 🔞',desc:'Adultes seulement',couleur:'#FF3D6B'}],
  en:[{id:'doux',emoji:'🌸',nom:'Get to know',desc:'Sweet questions',couleur:'#10D9A0'},{id:'intense',emoji:'🔥',nom:'Intense',desc:'Put to the test',couleur:'#F5A623'},{id:'dark',emoji:'🌑',nom:'Dark',desc:'Deep and dark',couleur:'#7C3AED'},{id:'coquin',emoji:'🍑',nom:'Naughty 🔞',desc:'Adults only',couleur:'#FF3D6B'}],
  es:[{id:'doux',emoji:'🌸',nom:'Conocerse',desc:'Preguntas dulces',couleur:'#10D9A0'},{id:'intense',emoji:'🔥',nom:'Intenso',desc:'A prueba',couleur:'#F5A623'},{id:'dark',emoji:'🌑',nom:'Oscuro',desc:'Oscuras y profundas',couleur:'#7C3AED'},{id:'coquin',emoji:'🍑',nom:'Picante 🔞',desc:'Solo adultos',couleur:'#FF3D6B'}],
  ht:[{id:'doux',emoji:'🌸',nom:'Konnen youn lòt',desc:'Kesyon dou',couleur:'#10D9A0'},{id:'intense',emoji:'🔥',nom:'Entans',desc:'A leprèv',couleur:'#F5A623'},{id:'dark',emoji:'🌑',nom:'Nwa',desc:'Fon ak nwa',couleur:'#7C3AED'},{id:'coquin',emoji:'🍑',nom:'Koken 🔞',desc:'Granmoun sèlman',couleur:'#FF3D6B'}],
};
const CATS={
  fr:['💕 Complicité','🌙 Intimité','✈️ Distance','🔮 Rêves futurs','😂 Humour','🌱 Valeurs','💋 Séduction','🏠 Famille','🧳 Aventure'],
  en:['💕 Complicity','🌙 Intimacy','✈️ Distance','🔮 Future dreams','😂 Humor','🌱 Values','💋 Seduction','🏠 Family','🧳 Adventure'],
  es:['💕 Complicidad','🌙 Intimidad','✈️ Distancia','🔮 Sueños futuros','😂 Humor','🌱 Valores','💋 Seducción','🏠 Familia','🧳 Aventura'],
  ht:['💕 Konplisite','🌙 Entimite','✈️ Distans','🔮 Rèv pou demen','😂 Imè','🌱 Valè','💋 Sediksyon','🏠 Fanmi','🧳 Avanti'],
};
const VERITE_DEFI={
  fr:{
    doux:{verites:["Quelle est la chose que tu aimes le plus chez moi ?","Quel est ton souvenir préféré avec moi ?","Qu'est-ce qui t'a fait craquer pour moi au début ?","Quelle est ta plus grande peur dans notre relation ?","Si tu pouvais changer une chose dans notre couple, ce serait quoi ?","Quel est le moment où tu t'es senti(e) le plus proche de moi ?","Qu'est-ce que je fais qui te fait sourire sans que tu le dises ?"],defis:["Fais un câlin de 20 secondes à ton partenaire","Dis 3 choses que tu admires chez l'autre","Imite la façon dont l'autre parle","Dessine un portrait de l'autre en 60 secondes","Mimez votre premier rendez-vous","Faites-vous un massage des mains 2 minutes"]},
    intense:{verites:["Y a-t-il une chose que j'ai faite qui t'a blessé(e) et que tu n'as jamais dite ?","Qu'est-ce que tu n'arrives pas à me dire en face ?","As-tu déjà douté de notre relation ? Quand ?","Quelle est la chose dont tu as le plus peur concernant notre avenir ?","Qu'est-ce qui te manque dans notre relation ?","Qu'est-ce que tu refuses de me montrer de toi ?"],defis:["Regardez-vous dans les yeux 2 minutes en silence","Chacun dit UNE vérité jamais osée","Respirez synchronisés (4-2-6) 3 cycles","Dites à voix haute ce dont vous avez besoin EN CE MOMENT"]},
    adulte:{verites:["Quelle est ta fantaisie que tu n'as jamais osé me dire ?","Qu'est-ce qui t'attire physiquement le plus chez moi ?","Y a-t-il quelque chose que tu aimerais qu'on essaie ensemble ?","Qu'est-ce qui t'excite chez moi que tu gardes pour toi ?"],defis:["Donne un baiser de 6 secondes à ton partenaire","Dis 3 choses que tu adores physiquement chez l'autre","Câlin de 30 secondes en vous regardant dans les yeux"]},
  },
  en:{
    doux:{verites:["What's the thing you love most about me?","What is your favorite memory with me?","What made you fall for me at the beginning?","What is your biggest fear in our relationship?","If you could change one thing about us, what would it be?","When did you feel closest to me?","What do I do that makes you smile without you saying it?"],defis:["Give your partner a 20-second hug","Say 3 things you admire about each other","Imitate how the other person talks","Draw a portrait of the other in 60 seconds","Reenact your first date","Give each other a 2-minute hand massage"]},
    intense:{verites:["Is there something I did that hurt you that you've never said?","What can't you say to my face?","Have you ever doubted our relationship? When?","What are you most afraid of about our future?","What do you miss in our relationship?","What part of yourself do you refuse to show me?"],defis:["Look into each other's eyes 2 minutes in silence","Each say ONE truth never dared to say","Synchronized breathing (4-2-6) 3 cycles","Say out loud what you need RIGHT NOW"]},
    adulte:{verites:["What's a fantasy you've never dared tell me?","What attracts you most to me physically?","Is there something you'd like us to try together?","What excites you about me that you keep to yourself?"],defis:["Give your partner a 6-second kiss","Say 3 things you physically adore about each other","30-second hug while looking into each other's eyes"]},
  },
  es:{
    doux:{verites:["¿Cuál es la cosa que más amas de mí?","¿Cuál es tu recuerdo favorito conmigo?","¿Qué te enamoró de mí al principio?","¿Cuál es tu mayor miedo en nuestra relación?","Si pudieras cambiar una cosa en nuestra pareja, ¿cuál sería?","¿Cuándo te sentiste más cercano/a a mí?","¿Qué hago que te hace sonreír sin que lo digas?"],defis:["Dale un abrazo de 20 segundos a tu pareja","Digan 3 cosas que admiran del otro","Imita cómo habla la otra persona","Dibuja un retrato del otro en 60 segundos","Recreen su primera cita","Dense un masaje de manos de 2 minutos"]},
    intense:{verites:["¿Hay algo que hice que te lastimó y nunca dijiste?","¿Qué no puedes decirme de frente?","¿Alguna vez dudaste de nuestra relación? ¿Cuándo?","¿Qué es lo que más temes de nuestro futuro?","¿Qué te falta en nuestra relación?","¿Qué parte de ti te niegas a mostrarme?"],defis:["Mírence a los ojos 2 minutos en silencio","Cada uno diga UNA verdad nunca dicha","Respiración sincronizada (4-2-6) 3 ciclos","Digan en voz alta lo que necesitan AHORA MISMO"]},
    adulte:{verites:["¿Cuál es una fantasía que nunca te atreviste a contarme?","¿Qué es lo que más te atrae físicamente de mí?","¿Hay algo que te gustaría que intentáramos juntos?","¿Qué te excita de mí que guardas para ti?"],defis:["Dale un beso de 6 segundos a tu pareja","Digan 3 cosas que adoran físicamente del otro","Abrazo de 30 segundos mirándose a los ojos"]},
  },
  ht:{
    doux:{verites:["Kisa ou renmen plis nan mwen?","Ki souvni prefere ou ak mwen?","Kisa ki te fè ou tonbe pou mwen nan kòmansman?","Ki pi gwo pe ou nan relasyon nou an?","Si ou ta ka chanje yon bagay nan koup nou an, sa ta li?","Ki lè ou te santi pi pre mwen?","Kisa mwen fè ki fè ou souri san ou pa di l?"],defis:["Ba patnè ou yon kòlòn 20 segonn","Di 3 bagay ou admire nan lòt la","Imite fason lòt la pale","Fè yon pòtrè lòt la nan 60 segonn","Jwe premye randevou nou an ankò","Ba youn lòt yon masaj men 2 minit"]},
    intense:{verites:["Èske gen yon bagay mwen fè ki te blese ou epi ou pa janm di?","Kisa ou pa ka di mwen fas a fas?","Ou te janm doute relasyon nou an? Ki lè?","Kisa ou pi pè nan avni nou?","Kisa ki manke nan relasyon nou an?","Ki pati nan tèt ou ou refize montre mwen?"],defis:["Gade youn lòt nan je 2 minit an silans","Chak moun di YON verite li pa janm di","Respirasyon senkronize (4-2-6) 3 sik","Di a vwa wo sa ou bezwen KÈ KOULYE A"]},
    adulte:{verites:["Ki fantasmi ou pa janm koze di mwen?","Kisa ki atire ou plis nan mwen fizikman?","Èske gen yon bagay ou ta renmen nou eseye ansanm?","Kisa ki eksite ou nan mwen ke ou kenbe pou ou menm?"],defis:["Ba patnè ou yon bo 6 segonn","Di 3 bagay ou adore fizikman nan lòt la","Kòlòn 30 segonn gade youn lòt nan je"]},
  },
};
const DEVINE_MOTS={
  fr:{"📦 Objets":["téléphone","chaise","voiture","livre","miroir","parapluie","guitare","ordinateur","vélo"],"🐾 Animaux":["éléphant","requin","papillon","lion","perroquet","dauphin","girafe","pingouin","tigre"],"⭐ Célébrités":["Michael Jackson","Beyoncé","Cristiano Ronaldo","Rihanna","LeBron James","Taylor Swift"],"🗺️ Lieux":["Paris","New York","Tokyo","Tour Eiffel","Amazonie","Hollywood","Venise"],"🍕 Nourriture":["pizza","sushi","chocolat","mangue","croissant","ramen","tacos"]},
  en:{"📦 Objects":["phone","chair","car","book","mirror","umbrella","guitar","computer","bicycle"],"🐾 Animals":["elephant","shark","butterfly","lion","parrot","dolphin","giraffe","penguin","tiger"],"⭐ Celebrities":["Michael Jackson","Beyoncé","Cristiano Ronaldo","Rihanna","LeBron James","Taylor Swift"],"🗺️ Places":["Paris","New York","Tokyo","Eiffel Tower","Amazon","Hollywood","Venice"],"🍕 Food":["pizza","sushi","chocolate","mango","croissant","ramen","tacos"]},
  es:{"📦 Objetos":["teléfono","silla","coche","libro","espejo","paraguas","guitarra","computadora","bicicleta"],"🐾 Animales":["elefante","tiburón","mariposa","león","loro","delfín","jirafa","pingüino","tigre"],"⭐ Celebridades":["Michael Jackson","Beyoncé","Cristiano Ronaldo","Rihanna","LeBron James","Taylor Swift"],"🗺️ Lugares":["París","Nueva York","Tokio","Torre Eiffel","Amazonia","Hollywood","Venecia"],"🍕 Comida":["pizza","sushi","chocolate","mango","croissant","ramen","tacos"]},
  ht:{"📦 Objè":["telefòn","chèz","machin","liv","glas","parapli","gita","òdinatè","bisiklèt"],"🐾 Bèt":["elefan","reken","papiyon","lyon","pèwòch","dofin","jiraf","pengwen","tig"],"⭐ Selebrite":["Michael Jackson","Beyoncé","Cristiano Ronaldo","Rihanna","LeBron James","Taylor Swift"],"🗺️ Kote":["Pari","New York","Tokyo","Tou Eifèl","Amazoni","Hollywood","Veniz"],"🍕 Manje":["pizza","sushi","chokola","mango","kwasan","ramen","tacos"]},
};

async function genererQuestion(langue,categorie,niveau,historique=[]){
  try{
    const r=await fetch(API_URL,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({langue,categorie,niveau,historique})});
    const d=await r.json();
    if(d.ok&&d.question)return d.question;
    throw new Error();
  }catch(e){return FALLBACK[Math.floor(Math.random()*FALLBACK.length)];}
}
async function getHistorique(code){try{const d=await fbGet(`sessions/${code}/historique`);return d?Object.values(d):[];}catch(e){return[];}}
async function ajouterHistorique(code,texte){try{await fbPush(`sessions/${code}/historique`,texte);}catch(e){}}

// ══════════════════════════════════════════════════════════════
//  COMPOSANT CONNEXION GÉNÉRIQUE
// ══════════════════════════════════════════════════════════════
function ConnexionEcran({t,fbPath,emoji,couleur,onRetour,onConnecte}){
  const [code,setCode]=useState('');
  const [monCode]=useState(genCode());
  const [modeCreer,setModeCreer]=useState(false);
  const [connecte,setConnecte]=useState(false);
  const unsubRef=useRef(null);
  async function creer(){
    setModeCreer(true);
    await fbSet(`${fbPath}/${monCode}`,{j1:'ok',j2:null,ts:Date.now()});
    unsubRef.current=fbListen(`${fbPath}/${monCode}/j2`,val=>{
      if(val==='ok'){setConnecte(true);if(unsubRef.current)unsubRef.current();}
    });
  }
  async function rejoindre(){
    if(code.length<4)return;
    await fbSet(`${fbPath}/${code}/j2`,'ok');
    onConnecte(code,false);
  }
  useEffect(()=>()=>{if(unsubRef.current)unsubRef.current();},[]);
  if(modeCreer)return(
    <View style={s.centre}>
      <Text style={s.bigE}>{connecte?'🎉':'⏳'}</Text>
      <Text style={s.titre2}>{connecte?t.connectes:t.attente}</Text>
      {!connecte&&<><Text style={s.desc}>{t.partagerCode}</Text><View style={s.codeBox}><Text style={s.codeTxt}>{monCode}</Text></View><ActivityIndicator color={couleur} size="large" style={{marginTop:16}}/></>}
      {connecte&&<TouchableOpacity style={[s.btnR,{backgroundColor:couleur}]} onPress={()=>onConnecte(monCode,true)}><Text style={s.btnRT}>{t.debutSession}</Text></TouchableOpacity>}
      <TouchableOpacity style={[s.btnV,{marginTop:16}]} onPress={onRetour}><Text style={s.btnVT}>{t.retour}</Text></TouchableOpacity>
    </View>
  );
  return(
    <ScrollView style={s.ecran} contentContainerStyle={s.ecranC}>
      <TouchableOpacity onPress={onRetour}><Text style={s.retour}>{t.retour}</Text></TouchableOpacity>
      <View style={{alignItems:'center',marginBottom:20}}><Text style={{fontSize:34}}>{emoji}</Text></View>
      <TouchableOpacity style={[s.carteG,{borderColor:`${couleur}40`}]} onPress={creer}>
        <Text style={{fontSize:28}}>🔗</Text><Text style={s.carteN}>{t.creerSession}</Text><Text style={s.carteD}>{t.creerDesc}</Text>
      </TouchableOpacity>
      <View style={s.sep}><View style={s.ligne}/><Text style={s.ou}>OU</Text><View style={s.ligne}/></View>
      <View style={s.joinBox}>
        <Text style={s.label}>{t.entrerCode}</Text>
        <TextInput style={s.input} placeholder={t.placeholder} placeholderTextColor="rgba(249,242,231,0.3)" value={code} onChangeText={v=>setCode(v.toUpperCase())} maxLength={6} autoCapitalize="characters"/>
        <TouchableOpacity style={[s.btnR,{backgroundColor:couleur}]} onPress={rejoindre}><Text style={s.btnRT}>{t.rejoindre}</Text></TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// ══════════════════════════════════════════════════════════════
//  ÉCRAN CHOIX LANGUE
// ══════════════════════════════════════════════════════════════
function ChoixLangue({onChoisir}){
  return(
    <View style={s.centre}>
      <Text style={s.bigE}>💞</Text>
      <Text style={s.titre1}>LoveLink</Text>
      <Text style={[s.sous,{marginBottom:28}]}>Choose your language · Choisissez</Text>
      {LANGUES.map(l=>(
        <TouchableOpacity key={l.id} style={s.langueBtn} onPress={()=>onChoisir(l.id)}>
          <Text style={{fontSize:26}}>{l.drapeau}</Text>
          <Text style={s.langueNom}>{l.nom}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ══════════════════════════════════════════════════════════════
//  ÉCRAN ACCUEIL
// ══════════════════════════════════════════════════════════════
function Accueil({langue,onMode,onChangerLangue}){
  const t=T[langue]||T.fr;
  return(
    <ScrollView style={s.ecran} contentContainerStyle={[s.ecranC,{alignItems:'center',paddingTop:50}]}>
      <TouchableOpacity style={s.langueTag} onPress={onChangerLangue}><Text style={s.langueTagTxt}>{t.langue}</Text></TouchableOpacity>
      <Text style={[s.bigE,{fontSize:60}]}>💞</Text>
      <Text style={s.titre1}>LoveLink</Text>
      <Text style={[s.sous,{marginBottom:40}]}>{t.tagline.toUpperCase()}</Text>
      <TouchableOpacity onPress={()=>onMode('divertir')} style={[s.modeCard,{borderColor:'rgba(16,217,160,0.4)',backgroundColor:'rgba(16,217,160,0.06)'}]}>
        <View style={[s.modeIcon,{backgroundColor:'rgba(16,217,160,0.15)'}]}><Text style={{fontSize:34}}>🎮</Text></View>
        <View style={{flex:1}}><Text style={[s.modeNom,{color:'#10D9A0'}]}>{t.divertir}</Text><Text style={s.modeDesc}>{t.divertirDesc}</Text></View>
        <Text style={{color:'rgba(16,217,160,0.6)',fontSize:22}}>›</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={()=>onMode('couple')} style={[s.modeCard,{borderColor:'rgba(255,61,107,0.4)',backgroundColor:'rgba(255,61,107,0.06)'}]}>
        <View style={[s.modeIcon,{backgroundColor:'rgba(255,61,107,0.15)'}]}><Text style={{fontSize:34}}>💑</Text></View>
        <View style={{flex:1}}><Text style={[s.modeNom,{color:'#FF3D6B'}]}>{t.couple}</Text><Text style={s.modeDesc}>{t.coupleDesc}</Text></View>
        <Text style={{color:'rgba(255,61,107,0.6)',fontSize:22}}>›</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ══════════════════════════════════════════════════════════════
//  HUB DIVERTIR
// ══════════════════════════════════════════════════════════════
function HubDivertir({langue,onJeu,onRetour}){
  const t=T[langue]||T.fr;
  const jeux=[
    {id:'quiz',emoji:'💞',nom:t.quiz,desc:t.quizDesc,couleur:'#FF3D6B'},
    {id:'devine',emoji:'🔍',nom:t.devine,desc:t.devineDesc,couleur:'#10D9A0'},
    {id:'verite',emoji:'🔥',nom:t.verite,desc:t.veriteDesc,couleur:'#F5A623'},
  ];
  return(
    <ScrollView style={s.ecran} contentContainerStyle={[s.ecranC,{alignItems:'center',paddingTop:30}]}>
      <TouchableOpacity onPress={onRetour} style={{alignSelf:'flex-start',marginBottom:16}}><Text style={s.retour}>{t.retour}</Text></TouchableOpacity>
      <Text style={{fontSize:34,marginBottom:6}}>🎮</Text>
      <Text style={[s.titre2,{marginBottom:4}]}>{t.divertirTitle}</Text>
      <Text style={[s.sous,{marginBottom:24}]}>{t.divertir.toUpperCase()}</Text>
      {jeux.map(j=>(
        <TouchableOpacity key={j.id} onPress={()=>onJeu(j.id)} style={[s.jeuCard,{borderColor:`${j.couleur}40`}]}>
          <View style={[s.jeuEmoji,{backgroundColor:`${j.couleur}20`}]}><Text style={{fontSize:26}}>{j.emoji}</Text></View>
          <View style={{flex:1}}><Text style={[s.jeuNom,{color:j.couleur}]}>{j.nom}</Text><Text style={s.jeuDesc}>{j.desc}</Text></View>
          <Text style={{color:`${j.couleur}80`,fontSize:20}}>›</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

// ══════════════════════════════════════════════════════════════
//  JEU : QUIZ COUPLES
// ══════════════════════════════════════════════════════════════
function QuizJeu({langue,onRetour}){
  const t=T[langue]||T.fr;
  const niveaux=NIVEAUX[langue]||NIVEAUX.fr;
  const cats=CATS[langue]||CATS.fr;
  const [ecran,setEcran]=useState('connexion');
  const [session,setSession]=useState('');
  const [estJ1,setEstJ1]=useState(true);
  const [niveau,setNiveau]=useState(null);
  const [categorie,setCategorie]=useState(null);
  const [q,setQ]=useState(null);
  const [load,setLoad]=useState(false);
  const [choisi,setChoisi]=useState(null);
  const [choixP,setChoixP]=useState(null);
  const [num,setNum]=useState(1);
  const [modePerso,setModePerso]=useState(false);
  const [reponsePerso,setReponsePerso]=useState('');
  const unsubRef=useRef(null);
  const niv=niveaux.find(n=>n.id===niveau?.id)||niveaux[0];
  const maCle=estJ1?'rep1':'rep2';
  const pCle=estJ1?'rep2':'rep1';
  useEffect(()=>{
    if(ecran==='quiz'&&session){
      setLoad(true);setChoisi(null);setChoixP(null);setModePerso(false);setReponsePerso('');
      if(unsubRef.current)unsubRef.current();
      unsubRef.current=fbListen(`sessions/${session}/q${num}/${pCle}`,val=>{if(val!==null&&val!==undefined)setChoixP(val);});
      charger();
    }
    return()=>{if(unsubRef.current)unsubRef.current();};
  },[num,ecran,session]);
  async function charger(){
    if(estJ1){
      const hist=await getHistorique(session);
      const question=await genererQuestion(langue,categorie,niveau?.id||'doux',hist);
      await ajouterHistorique(session,question.t);
      await fbSet(`sessions/${session}/questions/q${num}`,question);
      setQ(question);setLoad(false);
    }else{
      let att=0;
      const poll=setInterval(async()=>{
        att++;const val=await fbGet(`sessions/${session}/questions/q${num}`);
        if(val){setQ(val);setLoad(false);clearInterval(poll);}
        if(att>40)clearInterval(poll);
      },1500);
    }
  }
  async function choisir(index,textePerso=null){
    if(choisi!==null)return;
    const valeur=textePerso?`perso:${textePerso}`:index;
    setChoisi(valeur);
    await fbSet(`sessions/${session}/q${num}/${maCle}`,valeur);
    setModePerso(false);
  }
  const lesDeux=choisi!==null&&choixP!==null;
  const memeReponse=lesDeux&&choisi===choixP;
  if(ecran==='connexion')return(<ConnexionEcran t={t} fbPath="sessions" emoji="💞" couleur="#FF3D6B" onRetour={onRetour} onConnecte={(code,j1)=>{setSession(code);setEstJ1(j1);setEcran('choixNiveau');}}/>);
  if(ecran==='choixNiveau')return(
    <ScrollView style={s.ecran} contentContainerStyle={s.ecranC}>
      <Text style={[s.titre2,{marginTop:8}]}>💞 {t.quiz}</Text>
      <Text style={s.label}>NIVEAU</Text>
      <View style={{gap:8,marginBottom:16}}>
        {niveaux.map(n=>(
          <TouchableOpacity key={n.id} style={[s.niveauCard,niveau?.id===n.id&&{borderColor:n.couleur,backgroundColor:`${n.couleur}15`}]} onPress={()=>setNiveau(n)}>
            <View style={{flexDirection:'row',alignItems:'center',gap:12}}>
              <Text style={{fontSize:26}}>{n.emoji}</Text>
              <View style={{flex:1}}><Text style={[s.niveauNom,niveau?.id===n.id&&{color:n.couleur}]}>{n.nom}</Text><Text style={s.niveauDesc}>{n.desc}</Text></View>
              {niveau?.id===n.id&&<Text style={{color:n.couleur,fontSize:16}}>✓</Text>}
            </View>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={s.label}>CATÉGORIE</Text>
      <View style={{flexDirection:'row',flexWrap:'wrap',gap:8,marginBottom:20}}>
        {cats.map(c=>{const actif=categorie===c;const parts=c.split(' ');return(<TouchableOpacity key={c} style={[s.catPill,actif&&s.catPillActif]} onPress={()=>setCategorie(c)}><Text style={{fontSize:16}}>{parts[0]}</Text><Text style={[s.catNom,actif&&{color:'#F9F2E7'}]}>{parts.slice(1).join(' ')}</Text></TouchableOpacity>);})}
      </View>
      <TouchableOpacity style={[s.btnR,(!niveau||!categorie)&&{opacity:0.4}]} onPress={()=>{if(niveau&&categorie)setEcran('quiz');}}><Text style={s.btnRT}>🚀 Lancer →</Text></TouchableOpacity>
    </ScrollView>
  );
  if(ecran==='quiz'){
    if(load||!q)return(<View style={s.centre}><ActivityIndicator color={niv.couleur} size="large"/><Text style={[s.desc,{marginTop:12}]}>{t.generating}</Text></View>);
    return(
      <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':'height'}>
        <ScrollView style={s.ecran} contentContainerStyle={s.ecranC}>
          <View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:12}}>
            <View style={[s.niveauBadge,{borderColor:`${niv.couleur}50`,backgroundColor:`${niv.couleur}15`}]}><Text style={{fontSize:11}}>{niv.emoji}</Text><Text style={[s.niveauBadgeTxt,{color:niv.couleur}]}>{niv.nom}</Text></View>
            <TouchableOpacity onPress={()=>setEcran('resume')} style={s.btnFin}><Text style={s.btnFinT}>{t.resume}</Text></TouchableOpacity>
          </View>
          <View style={[s.carteQ,{borderColor:`${niv.couleur}30`}]}>
            <Text style={{fontSize:38,marginBottom:6}}>{q.e}</Text>
            <Text style={{color:'#F9F2E7',fontSize:16,fontWeight:'600',textAlign:'center',lineHeight:24}}>{q.t}</Text>
          </View>
          {!modePerso&&(
            <View style={{gap:8,marginBottom:10}}>
              {(q.r||[]).map((r,i)=>{
                let st=[s.repN];
                if(lesDeux&&choisi===i&&choixP===i)st=[s.repN,s.repM];
                else if(choisi===i)st=[s.repN,s.repC];
                else if(lesDeux&&choixP===i)st=[s.repN,s.repP];
                return(<TouchableOpacity key={i} style={st} onPress={()=>choisir(i)} disabled={choisi!==null}><View style={[s.lettre,choisi===i&&{backgroundColor:niv.couleur}]}><Text style={{color:'#F9F2E7',fontSize:10,fontWeight:'700'}}>{LETTRES[i]}</Text></View><Text style={{color:'#F9F2E7',fontSize:13,flex:1}}>{r}</Text>{lesDeux&&choixP===i&&<Text style={{fontSize:13}}>👩</Text>}</TouchableOpacity>);
              })}
              {choisi===null&&(<TouchableOpacity style={[s.repN,{borderColor:'rgba(245,166,35,0.4)'}]} onPress={()=>setModePerso(true)}><View style={[s.lettre,{borderColor:'rgba(245,166,35,0.4)'}]}><Text style={{color:'#F5A623',fontSize:12}}>✏️</Text></View><Text style={{color:'#F5A623',fontSize:13,flex:1}}>{t.autreReponse}</Text></TouchableOpacity>)}
            </View>
          )}
          {modePerso&&choisi===null&&(
            <View style={s.persoBox}>
              <TextInput style={s.persoInput} placeholder={t.ecrireTa} placeholderTextColor="rgba(249,242,231,0.3)" value={reponsePerso} onChangeText={setReponsePerso} multiline autoFocus/>
              <View style={{flexDirection:'row',gap:8,marginTop:8}}>
                <TouchableOpacity style={[s.btnV,{flex:1,marginTop:0}]} onPress={()=>setModePerso(false)}><Text style={s.btnVT}>←</Text></TouchableOpacity>
                <TouchableOpacity style={[s.btnR,{flex:2,marginBottom:0}]} onPress={()=>{if(reponsePerso.trim())choisir(4,reponsePerso.trim());}}><Text style={s.btnRT}>{t.valider}</Text></TouchableOpacity>
              </View>
            </View>
          )}
          {!lesDeux&&<View style={s.msgBox}><Text style={s.msgTxt}>{choisi===null?t.choixReponse:t.attentePartner}</Text></View>}
          {lesDeux&&(<View style={[s.msgBox,{borderColor:memeReponse?'rgba(16,217,160,0.4)':'rgba(245,166,35,0.4)',backgroundColor:memeReponse?'rgba(16,217,160,0.08)':'rgba(245,166,35,0.08)'}]}><Text style={[s.msgTxt,{color:memeReponse?'#10D9A0':'#F5A623',fontWeight:'700',fontSize:14}]}>{memeReponse?t.memeReponse:t.parlezEnsemble}</Text></View>)}
          {lesDeux&&<TouchableOpacity style={[s.btnR,{marginTop:12,backgroundColor:niv.couleur}]} onPress={()=>setNum(n=>n+1)}><Text style={s.btnRT}>{t.questionSuivante}</Text></TouchableOpacity>}
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }
  return(<View style={s.centre}><Text style={s.bigE}>🎉</Text><Text style={s.titre2}>{t.sessionTerminee}</Text><Text style={s.desc}>{num-1} {t.questionsExplo}</Text><TouchableOpacity style={s.btnR} onPress={()=>{setNum(1);setEcran('choixNiveau');}}><Text style={s.btnRT}>{t.continuer}</Text></TouchableOpacity><TouchableOpacity style={s.btnV} onPress={onRetour}><Text style={s.btnVT}>{t.accueil}</Text></TouchableOpacity></View>);
}

// ══════════════════════════════════════════════════════════════
//  JEU : VÉRITÉ OU DÉFI
// ══════════════════════════════════════════════════════════════
function VeriteDefiJeu({langue,onRetour}){
  const t=T[langue]||T.fr;
  const data=VERITE_DEFI[langue]||VERITE_DEFI.fr;
  const [ecran,setEcran]=useState('connexion');
  const [session,setSession]=useState('');
  const [estJ1,setEstJ1]=useState(true);
  const [niveau,setNiveau]=useState('doux');
  const [tourActuel,setTourActuel]=useState(1);
  const [choix,setChoix]=useState(null);
  const [contenu,setContenu]=useState('');
  const unsubRef=useRef(null);
  const niveauData=data[niveau]||data.doux;
  const isMonTour=(estJ1&&tourActuel===1)||(!estJ1&&tourActuel===2);
  function startListeners(sess){
    if(unsubRef.current)unsubRef.current();
    unsubRef.current=fbListen(`verite/${sess}`,val=>{
      if(!val)return;
      if(val.tour!==undefined)setTourActuel(val.tour);
      if(val.choix!==undefined)setChoix(val.choix);
      if(val.contenu!==undefined)setContenu(val.contenu);
    });
  }
  useEffect(()=>()=>{if(unsubRef.current)unsubRef.current();},[]);
  async function fairChoix(type){
    const list=niveauData[type==='verite'?'verites':'defis'];
    const item=list[Math.floor(Math.random()*list.length)];
    setChoix(type);setContenu(item);
    await fbSet(`verite/${session}/choix`,type);
    await fbSet(`verite/${session}/contenu`,item);
  }
  async function suivant(){
    const next=tourActuel===1?2:1;
    setChoix(null);setContenu('');
    await fbSet(`verite/${session}/tour`,next);
    await fbSet(`verite/${session}/choix`,null);
    await fbSet(`verite/${session}/contenu`,'');
  }
  if(ecran==='connexion')return(<ConnexionEcran t={t} fbPath="verite" emoji="🔥" couleur="#F5A623" onRetour={onRetour} onConnecte={(code,j1)=>{setSession(code);setEstJ1(j1);if(j1){fbSet(`verite/${code}`,{j1:'ok',j2:'ok',tour:1,choix:null,contenu:''});}startListeners(code);setEcran('niveau');}}/>);
  if(ecran==='niveau')return(
    <ScrollView style={s.ecran} contentContainerStyle={s.ecranC}>
      <Text style={s.titre2}>🔥 {t.veriteTitre}</Text>
      <Text style={[s.label,{marginBottom:12}]}>NIVEAU</Text>
      {['doux','intense','adulte'].map((niv,i)=>(<TouchableOpacity key={niv} onPress={()=>setNiveau(niv)} style={[s.niveauCard,niveau===niv&&{borderColor:'#F5A623',backgroundColor:'rgba(245,166,35,0.12)'},{ marginBottom:10}]}><Text style={[s.niveauNom,niveau===niv&&{color:'#F5A623'}]}>{t.niveaux[i]}</Text></TouchableOpacity>))}
      <TouchableOpacity style={[s.btnR,{backgroundColor:'#F5A623',marginTop:12}]} onPress={()=>setEcran('jeu')}><Text style={s.btnRT}>🔥 {t.commencer}</Text></TouchableOpacity>
    </ScrollView>
  );
  const tourNom=tourActuel===1?'J1':'J2';
  return(
    <ScrollView style={s.ecran} contentContainerStyle={[s.ecranC,{alignItems:'center',paddingTop:20}]}>
      <View style={{backgroundColor:'rgba(245,166,35,0.12)',borderWidth:1,borderColor:'rgba(245,166,35,0.3)',borderRadius:50,paddingVertical:4,paddingHorizontal:14,marginBottom:24}}>
        <Text style={{color:'#F5A623',fontSize:12,fontWeight:'700'}}>{t.tourDe} {tourNom} {isMonTour?'🎯':`— ${t.attentChoix}`}</Text>
      </View>
      {isMonTour&&!choix&&(
        <>
          <Text style={[s.titre2,{marginBottom:20}]}>{t.veriteTitre}</Text>
          <View style={{flexDirection:'row',gap:14,marginBottom:20,width:'100%'}}>
            <TouchableOpacity onPress={()=>fairChoix('verite')} style={{flex:1,backgroundColor:'rgba(167,139,250,0.15)',borderWidth:2,borderColor:'#A78BFA',borderRadius:18,padding:22,alignItems:'center'}}>
              <Text style={{fontSize:30,marginBottom:6}}>🗣️</Text><Text style={{color:'#A78BFA',fontSize:14,fontWeight:'900',letterSpacing:1}}>{t.veriteLabel}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=>fairChoix('defi')} style={{flex:1,backgroundColor:'rgba(245,166,35,0.15)',borderWidth:2,borderColor:'#F5A623',borderRadius:18,padding:22,alignItems:'center'}}>
              <Text style={{fontSize:30,marginBottom:6}}>🎯</Text><Text style={{color:'#F5A623',fontSize:14,fontWeight:'900',letterSpacing:1}}>{t.defiLabel}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={s.btnV} onPress={()=>fairChoix(Math.random()>0.5?'verite':'defi')}><Text style={s.btnVT}>{t.passerBtn}</Text></TouchableOpacity>
        </>
      )}
      {!isMonTour&&!choix&&(<View style={{alignItems:'center'}}><Text style={{fontSize:44,marginBottom:10}}>⏳</Text><Text style={s.titre2}>{tourNom} {t.choisit}</Text><ActivityIndicator color="#F5A623" size="large" style={{marginTop:16}}/></View>)}
      {choix&&contenu&&(
        <View style={{width:'100%'}}>
          <View style={{backgroundColor:choix==='verite'?'rgba(167,139,250,0.12)':'rgba(245,166,35,0.12)',borderWidth:2,borderColor:choix==='verite'?'#A78BFA':'#F5A623',borderRadius:20,padding:22,marginBottom:18,alignItems:'center'}}>
            <Text style={{fontSize:10,color:choix==='verite'?'#A78BFA':'#F5A623',letterSpacing:3,marginBottom:10,fontWeight:'700'}}>{choix==='verite'?t.veriteLabel:t.defiLabel}</Text>
            <Text style={{fontSize:17,color:'#F9F2E7',fontWeight:'600',textAlign:'center',lineHeight:26}}>{contenu}</Text>
          </View>
          {isMonTour&&<TouchableOpacity style={[s.btnR,{backgroundColor:'#F5A623',marginBottom:8}]} onPress={suivant}><Text style={s.btnRT}>{t.reponduBtn}</Text></TouchableOpacity>}
          {!isMonTour&&<View style={s.msgBox}><Text style={s.msgTxt}>{t.attentePartner}</Text></View>}
          <TouchableOpacity onPress={onRetour} style={{alignItems:'center',marginTop:8}}><Text style={{color:'rgba(249,242,231,0.3)',fontSize:12}}>{t.accueil}</Text></TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

// ══════════════════════════════════════════════════════════════
//  JEU : DEVINE
// ══════════════════════════════════════════════════════════════
function DevineJeu({langue,onRetour}){
  const t=T[langue]||T.fr;
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
    if(timerActive&&timeLeft>0){timerRef.current=setInterval(()=>setTimeLeft(v=>v-1),1000);}
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
      if(!val||val.phase!=='game')return;
      setMode(val.mode);setCategory(val.category);setSecretWord(val.secretWord||'');
      setTimerDuration(val.timerDuration||90);setTimeLeft(val.timerDuration||90);
      setScreen('game');startGameListeners(code,false);unsubAll();setTimerActive(true);
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
    if(amJ1){const u=fbListen(`devine/${code}/currentQuestion`,val=>{if(val?.text)setPendingQ(val);});unsubRefs.current.push(u);}
    else{const u=fbListen(`devine/${code}/currentAnswer`,val=>{if(val?.answer){setHistory(h=>[...h,{q:val.q,answer:val.answer}]);setPendingQ(null);setQCount(c=>c+1);}});unsubRefs.current.push(u);}
    const u2=fbListen(`devine/${code}/gameState/winner`,val=>{if(val)setWinner(val);});
    const u3=fbListen(`devine/${code}/gameState/revealWord`,val=>{if(val){setRevealWord(val);setScreen('result');setTimerActive(false);unsubAll();}});
    unsubRefs.current.push(u2,u3);
  }
  async function sendQuestion(){if(!currentQ.trim())return;await fbSet(`devine/${sessionCode}/currentQuestion`,{text:currentQ.trim(),ts:Date.now()});setCurrentQ('');}
  async function sendAnswer(answer){
    if(!pendingQ)return;
    setHistory(h=>[...h,{q:pendingQ.text,answer}]);
    await fbSet(`devine/${sessionCode}/currentAnswer`,{q:pendingQ.text,answer,ts:Date.now()});
    await fbSet(`devine/${sessionCode}/currentQuestion`,null);setPendingQ(null);
  }
  async function sendGuess(){
    if(!guessInput.trim())return;
    const correct=guessInput.trim().toLowerCase()===secretWord.toLowerCase()||secretWord.toLowerCase().includes(guessInput.trim().toLowerCase());
    if(correct){setTimerActive(false);await fbSet(`devine/${sessionCode}/gameState/winner`,'j2');await fbSet(`devine/${sessionCode}/gameState/revealWord`,secretWord);setWinner('j2');setRevealWord(secretWord);setScreen('result');}
    else{setLastGuessResult('wrong');setGuessInput('');setGuessMode(false);}
  }
  async function giveUp(){setTimerActive(false);await fbSet(`devine/${sessionCode}/gameState/winner`,'j1');await fbSet(`devine/${sessionCode}/gameState/revealWord`,secretWord);setWinner('j1');setRevealWord(secretWord);setScreen('result');}
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
      <TouchableOpacity onPress={()=>{reset();onRetour();}} style={{marginBottom:8}}><Text style={s.retour}>{t.retour}</Text></TouchableOpacity>
      <View style={{alignItems:'center',marginBottom:16}}><Text style={{fontSize:28}}>🔍</Text><Text style={s.titre2}>{t.devineTitle}</Text></View>
      {screen==='lobby'&&(<View><TouchableOpacity style={[s.btnR,{backgroundColor:'#10D9A0'}]} onPress={createSession}><Text style={s.btnRT}>🔗 {t.createSession}</Text></TouchableOpacity><View style={s.sep}><View style={s.ligne}/><Text style={s.ou}>OU</Text><View style={s.ligne}/></View><View style={s.joinBox}><Text style={s.label}>{t.codePlaceholder.toUpperCase()}</Text><TextInput style={s.input} placeholder={t.codePlaceholder} placeholderTextColor="rgba(249,242,231,0.3)" value={codeInput} onChangeText={v=>setCodeInput(v.toUpperCase())} maxLength={6} autoCapitalize="characters"/><TouchableOpacity style={s.btnR} onPress={joinSession}><Text style={s.btnRT}>→ {t.joinSession}</Text></TouchableOpacity></View></View>)}
      {screen==='waiting'&&(<View style={{alignItems:'center'}}><Text style={s.bigE}>⏳</Text><Text style={s.desc}>{t.waitingPartner}</Text><View style={s.codeBox}><Text style={s.codeTxt}>{sessionCode}</Text></View><ActivityIndicator color="#10D9A0" size="large" style={{marginTop:16}}/></View>)}
      {screen==='setup'&&isJ1&&(
        <View>
          <Text style={s.titre2}>{t.chooseMode}</Text>
          {[{id:'ia',nom:t.modeIA,desc:t.modeIADesc,col:'#10D9A0'},{id:'manuel',nom:t.modeManuel,desc:t.modeManuelDesc,col:'#A78BFA'},{id:'perso',nom:t.modePerso,desc:t.modePersoDesc,col:'#F5A623'}].map(m=>(
            <TouchableOpacity key={m.id} onPress={()=>setMode(m.id)} style={[s.niveauCard,mode===m.id&&{borderColor:m.col,backgroundColor:`${m.col}15`},{marginBottom:10}]}>
              <Text style={[s.niveauNom,mode===m.id&&{color:m.col}]}>{m.nom}</Text><Text style={s.niveauDesc}>{m.desc}</Text>
            </TouchableOpacity>
          ))}
          {mode==='ia'&&(<View style={{marginBottom:12}}><Text style={[s.label,{marginTop:8}]}>{t.chooseCategory}</Text>{cats.map(cat=>(<TouchableOpacity key={cat} onPress={()=>setCategory(cat)} style={[s.niveauCard,category===cat&&{borderColor:'#10D9A0',backgroundColor:'rgba(16,217,160,0.12)'},{marginBottom:8}]}><Text style={[s.niveauNom,category===cat&&{color:'#10D9A0'}]}>{cat}</Text></TouchableOpacity>))}</View>)}
          {mode==='perso'&&(<View style={[s.joinBox,{marginBottom:12}]}><Text style={s.label}>{t.enterWord}</Text><TextInput style={s.input} placeholder={t.wordPlaceholder} placeholderTextColor="rgba(249,242,231,0.3)" value={customWord} onChangeText={setCustomWord} autoCapitalize="none"/></View>)}
          <Text style={[s.label,{marginBottom:8}]}>⏱️ {t.chooseTimer}</Text>
          <View style={{flexDirection:'row',gap:8,marginBottom:16}}>
            {[90,180,360].map(sec=>(<TouchableOpacity key={sec} onPress={()=>setTimerDuration(sec)} style={{flex:1,padding:11,borderRadius:12,backgroundColor:timerDuration===sec?'rgba(16,217,160,0.2)':'rgba(255,255,255,0.04)',borderWidth:1,borderColor:timerDuration===sec?'#10D9A0':'rgba(255,255,255,0.1)',alignItems:'center'}}><Text style={{color:timerDuration===sec?'#10D9A0':'rgba(249,242,231,0.5)',fontWeight:'700',fontSize:12}}>{sec===90?t.sec90:sec===180?t.sec180:t.sec360}</Text></TouchableOpacity>))}
          </View>
          <TouchableOpacity style={[s.btnR,{backgroundColor:'#10D9A0',opacity:(!mode||(mode==='ia'&&!category)||(mode==='perso'&&!customWord.trim()))?0.4:1}]} onPress={startGame}><Text style={s.btnRT}>🚀 Lancer →</Text></TouchableOpacity>
        </View>
      )}
      {screen==='setup'&&!isJ1&&(<View style={{alignItems:'center'}}><Text style={s.bigE}>⏳</Text><Text style={s.desc}>{t.waitJ1}</Text><ActivityIndicator color="#10D9A0" size="large" style={{marginTop:16}}/></View>)}
      {screen==='game'&&(
        <View>
          <View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:10,flexWrap:'wrap',gap:6}}>
            <View style={{backgroundColor:'rgba(255,255,255,0.06)',borderRadius:50,paddingVertical:3,paddingHorizontal:12}}><Text style={{color:'rgba(249,242,231,0.5)',fontSize:11}}>{isJ1?t.youAreJ1:t.youAreJ2}</Text></View>
            <View style={{backgroundColor:`${timerColor}18`,borderWidth:1,borderColor:`${timerColor}50`,borderRadius:50,paddingVertical:3,paddingHorizontal:12}}><Text style={{color:timerColor,fontSize:14,fontWeight:'900'}}>⏱️ {timeLeft}s</Text></View>
            <View style={{backgroundColor:'rgba(16,217,160,0.1)',borderRadius:50,paddingVertical:3,paddingHorizontal:12}}><Text style={{color:'#10D9A0',fontSize:11}}>{qCount} {t.questions}</Text></View>
          </View>
          <View style={{height:3,backgroundColor:'rgba(255,255,255,0.06)',borderRadius:2,marginBottom:12}}><View style={{height:3,backgroundColor:timerColor,borderRadius:2,width:`${timerPct*100}%`}}/></View>
          {timeLeft<=15&&timerActive&&(<View style={{backgroundColor:'rgba(255,61,107,0.12)',borderRadius:10,padding:8,marginBottom:10,alignItems:'center'}}><Text style={{color:'#FF3D6B',fontWeight:'700'}}>{t.timeUp}</Text></View>)}
          {isJ1&&secretWord&&(<View style={{backgroundColor:'rgba(16,217,160,0.08)',borderWidth:1,borderColor:'rgba(16,217,160,0.3)',borderRadius:14,padding:14,marginBottom:14,alignItems:'center'}}><Text style={{fontSize:10,color:'#10D9A0',letterSpacing:2,marginBottom:4}}>{t.theWordIs}</Text><Text style={{fontSize:22,fontWeight:'900',color:'#F9F2E7',letterSpacing:2}}>{secretWord.toUpperCase()}</Text><Text style={{fontSize:10,color:'rgba(249,242,231,0.3)',marginTop:4}}>{t.keepSecret}</Text></View>)}
          {isJ1&&pendingQ&&(<View style={{backgroundColor:'rgba(255,61,107,0.08)',borderWidth:1,borderColor:'rgba(255,61,107,0.3)',borderRadius:16,padding:16,marginBottom:14}}><Text style={{fontSize:16,color:'#F9F2E7',fontWeight:'600',marginBottom:12}}>"{pendingQ.text}"</Text><View style={{flexDirection:'row',gap:6}}>{['answerYes','answerNo','answerSometimes'].map(k=>(<TouchableOpacity key={k} onPress={()=>sendAnswer(t[k])} style={{flex:1,backgroundColor:k==='answerYes'?'rgba(16,217,160,0.15)':k==='answerNo'?'rgba(255,61,107,0.15)':'rgba(245,166,35,0.15)',borderWidth:1,borderColor:k==='answerYes'?'rgba(16,217,160,0.5)':k==='answerNo'?'rgba(255,61,107,0.5)':'rgba(245,166,35,0.5)',borderRadius:10,padding:10,alignItems:'center'}}><Text style={{color:'#F9F2E7',fontSize:11,fontWeight:'700'}}>{t[k]}</Text></TouchableOpacity>))}</View></View>)}
          {isJ1&&!pendingQ&&<View style={s.msgBox}><Text style={s.msgTxt}>💬 {t.waitingQuestion}</Text></View>}
          {!isJ1&&!guessMode&&(<View style={{marginBottom:12}}>{lastGuessResult==='wrong'&&(<View style={{backgroundColor:'rgba(255,61,107,0.1)',borderRadius:10,padding:8,marginBottom:8,alignItems:'center'}}><Text style={{color:'#FF3D6B',fontSize:12}}>{t.wrongGuess}</Text></View>)}<TextInput style={[s.persoInput,{marginBottom:8}]} placeholder={t.questionPlaceholder} placeholderTextColor="rgba(249,242,231,0.3)" value={currentQ} onChangeText={setCurrentQ} multiline/><View style={{flexDirection:'row',gap:8}}><TouchableOpacity style={[s.btnR,{flex:2,marginBottom:0,backgroundColor:'#10D9A0'}]} onPress={sendQuestion}><Text style={s.btnRT}>{t.sendQuestion}</Text></TouchableOpacity><TouchableOpacity style={{flex:1,backgroundColor:'rgba(167,139,250,0.15)',borderWidth:1,borderColor:'rgba(167,139,250,0.4)',borderRadius:50,padding:12,alignItems:'center'}} onPress={()=>setGuessMode(true)}><Text style={{color:'#A78BFA',fontSize:11,fontWeight:'700'}}>{t.tryGuess}</Text></TouchableOpacity></View></View>)}
          {!isJ1&&guessMode&&(<View style={{backgroundColor:'rgba(167,139,250,0.1)',borderWidth:1,borderColor:'rgba(167,139,250,0.4)',borderRadius:14,padding:14,marginBottom:12}}><Text style={{color:'#A78BFA',fontWeight:'700',fontSize:12,marginBottom:8}}>🎯 {t.guessBtnLabel}</Text><TextInput style={s.input} placeholder={t.guessPlaceholder} placeholderTextColor="rgba(249,242,231,0.3)" value={guessInput} onChangeText={setGuessInput} autoCapitalize="none"/><View style={{flexDirection:'row',gap:8}}><TouchableOpacity style={[s.btnR,{flex:2,marginBottom:0,backgroundColor:'#A78BFA'}]} onPress={sendGuess}><Text style={s.btnRT}>{t.confirmGuess}</Text></TouchableOpacity><TouchableOpacity style={[s.btnV,{flex:1,marginTop:0}]} onPress={()=>setGuessMode(false)}><Text style={s.btnVT}>←</Text></TouchableOpacity></View></View>)}
          {!isJ1&&(<TouchableOpacity onPress={giveUp} style={{alignItems:'center',marginBottom:10}}><Text style={{color:'rgba(249,242,231,0.3)',fontSize:11}}>{t.giveUp}</Text></TouchableOpacity>)}
          {history.length>0&&(<View style={{backgroundColor:'rgba(255,255,255,0.03)',borderWidth:1,borderColor:'rgba(255,255,255,0.07)',borderRadius:14,padding:12,maxHeight:160}}><Text style={[s.label,{marginBottom:8}]}>{t.history}</Text><ScrollView>{history.map((entry,i)=>(<View key={i} style={{marginBottom:6,paddingBottom:6,borderBottomWidth:i<history.length-1?1:0,borderBottomColor:'rgba(255,255,255,0.06)'}}><Text style={{fontSize:11,color:'rgba(249,242,231,0.4)',marginBottom:2}}>Q{i+1}. {entry.q}</Text><Text style={{fontSize:13,fontWeight:'700',color:entry.answer===t.answerYes?'#10D9A0':entry.answer===t.answerNo?'#FF3D6B':'#F5A623'}}>{entry.answer}</Text></View>))}</ScrollView></View>)}
        </View>
      )}
      {screen==='result'&&(<View style={{alignItems:'center',backgroundColor:'rgba(255,255,255,0.04)',borderWidth:1,borderColor:'rgba(255,255,255,0.1)',borderRadius:20,padding:28}}><Text style={{fontSize:50,marginBottom:10}}>{winner==='j2'?'🎉':'🏆'}</Text><Text style={{fontSize:20,fontWeight:'900',color:winner==='j2'?'#10D9A0':'#F5A623',marginBottom:8}}>{winner==='j2'?t.j2wins:t.j1wins}</Text><Text style={{color:'rgba(249,242,231,0.5)',fontSize:13,marginBottom:10}}>{winner==='j2'?t.correctGuess:t.giveUpConfirm}</Text><View style={{backgroundColor:'rgba(16,217,160,0.15)',borderWidth:2,borderColor:'rgba(16,217,160,0.4)',borderRadius:14,padding:14,marginBottom:16,alignItems:'center'}}><Text style={{fontSize:22,fontWeight:'900',color:'#10D9A0',letterSpacing:2}}>{(revealWord||secretWord).toUpperCase()}</Text></View><Text style={{color:'rgba(249,242,231,0.4)',fontSize:12,marginBottom:16}}>{qCount} {t.questions}</Text><TouchableOpacity style={[s.btnR,{backgroundColor:'#10D9A0'}]} onPress={reset}><Text style={s.btnRT}>{t.playAgain}</Text></TouchableOpacity></View>)}
    </ScrollView>
  );
}

// ══════════════════════════════════════════════════════════════
//  MODE COUPLE
// ══════════════════════════════════════════════════════════════
function ModeCouple({langue,onRetour}){
  const t=T[langue]||T.fr;
  const questions=QUESTIONS_COUPLE[langue]||QUESTIONS_COUPLE.fr;
  const [ecran,setEcran]=useState('intro');
  const [session,setSession]=useState('');
  const [estJ1,setEstJ1]=useState(true);
  const [qIndex,setQIndex]=useState(0);
  const [reponsesJ1,setReponsesJ1]=useState([]);
  const [reponsesJ2,setReponsesJ2]=useState([]);
  const [choisi,setChoisi]=useState(null);
  const [partnerRepondu,setPartnerRepondu]=useState(false);
  const [analyseResult,setAnalyseResult]=useState(null);
  const [exerciceIndex,setExerciceIndex]=useState(0);
  const [etapeIndex,setEtapeIndex]=useState(0);
  const unsubRef=useRef(null);
  const maCle=estJ1?'repJ1':'repJ2';
  const pCle=estJ1?'repJ2':'repJ1';
  const q=questions[qIndex];

  useEffect(()=>{
    if(ecran==='questions'&&session){
      setChoisi(null);setPartnerRepondu(false);
      if(unsubRef.current)unsubRef.current();
      unsubRef.current=fbListen(`couple/${session}/q${qIndex}/${pCle}`,val=>{
        if(val!==null&&val!==undefined)setPartnerRepondu(true);
      });
    }
    return()=>{if(unsubRef.current)unsubRef.current();};
  },[qIndex,ecran,session]);
  useEffect(()=>()=>{if(unsubRef.current)unsubRef.current();},[]);

  async function repondre(index){
    if(choisi!==null)return;
    setChoisi(index);
    await fbSet(`couple/${session}/q${qIndex}/${maCle}`,index);
    if(estJ1)setReponsesJ1(prev=>{const n=[...prev];n[qIndex]=index;return n;});
    else setReponsesJ2(prev=>{const n=[...prev];n[qIndex]=index;return n;});
  }

  async function prochaine(){
    if(qIndex>=questions.length-1){
      setEcran('analyse');
      try{
        let rJ1=[...reponsesJ1];
        let rJ2=[...reponsesJ2];
        for(let i=0;i<questions.length;i++){
          const val=await fbGet(`couple/${session}/q${i}/${pCle}`);
          if(estJ1){if(rJ2[i]===undefined)rJ2[i]=val??0;}
          else{if(rJ1[i]===undefined)rJ1[i]=val??0;}
        }
        const result=analyserReponsesCouple(rJ1,rJ2,langue);
        setAnalyseResult(result);
        await fbSet(`couple/${session}/analyse`,result);
        await new Promise(r=>setTimeout(r,1800));
        setEcran('resultats');
      }catch(e){
        const fallback=analyserReponsesCouple(Array(questions.length).fill(1),Array(questions.length).fill(1),langue);
        setAnalyseResult(fallback);setEcran('resultats');
      }
    }else{
      setQIndex(i=>i+1);
    }
  }

  // INTRO
  if(ecran==='intro')return(
    <ScrollView style={s.ecran} contentContainerStyle={[s.ecranC,{alignItems:'center',paddingTop:30}]}>
      <TouchableOpacity onPress={onRetour} style={{alignSelf:'flex-start',marginBottom:16}}><Text style={s.retour}>{t.retour}</Text></TouchableOpacity>
      <Text style={{fontSize:52,marginBottom:10}}>💑</Text>
      <Text style={[s.titre2,{textAlign:'center',marginBottom:6}]}>{t.coupleTitle}</Text>
      <Text style={[s.sous,{marginBottom:16}]}>{t.coupleSubtitle.toUpperCase()}</Text>
      <View style={{backgroundColor:'rgba(255,61,107,0.08)',borderWidth:1,borderColor:'rgba(255,61,107,0.2)',borderRadius:20,padding:20,width:'100%',marginBottom:24}}>
        <Text style={{color:'rgba(249,242,231,0.7)',fontSize:14,lineHeight:22,textAlign:'center'}}>{t.coupleHow}</Text>
      </View>
      <View style={{width:'100%',gap:10,marginBottom:20}}>
        {Object.values(FAILLES).map((f,idx)=>(
          <View key={idx} style={{flexDirection:'row',alignItems:'center',gap:10,backgroundColor:'rgba(255,255,255,0.04)',borderRadius:12,padding:12}}>
            <Text style={{fontSize:20}}>{f.emoji}</Text>
            <View><Text style={{color:'#F9F2E7',fontSize:13,fontWeight:'700'}}>{f[langue]?.nom||f.fr.nom}</Text><Text style={{color:'rgba(249,242,231,0.4)',fontSize:11}}>{f[langue]?.desc||f.fr.desc}</Text></View>
          </View>
        ))}
      </View>
      <TouchableOpacity style={[s.btnR,{backgroundColor:'#FF3D6B'}]} onPress={()=>setEcran('connexion')}><Text style={s.btnRT}>{t.commencer}</Text></TouchableOpacity>
    </ScrollView>
  );

  // CONNEXION
  if(ecran==='connexion')return(
    <ConnexionEcran t={t} fbPath="couple" emoji="💑" couleur="#FF3D6B" onRetour={()=>setEcran('intro')}
      onConnecte={(code,j1)=>{setSession(code);setEstJ1(j1);setEcran('questions');}}/>
  );

  // QUESTIONS
  if(ecran==='questions')return(
    <ScrollView style={s.ecran} contentContainerStyle={s.ecranC}>
      <View style={{marginBottom:16}}>
        <View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:6}}>
          <Text style={{color:'rgba(249,242,231,0.4)',fontSize:11}}>{t.question} {qIndex+1} {t.sur} {questions.length}</Text>
          <Text style={{color:'rgba(249,242,231,0.3)',fontSize:11}}>{t.chacunRepond}</Text>
        </View>
        <View style={{height:4,backgroundColor:'rgba(255,255,255,0.08)',borderRadius:2}}>
          <View style={{height:4,backgroundColor:'#FF3D6B',borderRadius:2,width:`${((qIndex+1)/questions.length)*100}%`}}/>
        </View>
      </View>
      <View style={{backgroundColor:'rgba(255,61,107,0.08)',borderWidth:1,borderColor:'rgba(255,61,107,0.25)',borderRadius:20,padding:22,marginBottom:18,alignItems:'center'}}>
        <Text style={{fontSize:13,color:'#FF3D6B',letterSpacing:2,marginBottom:10,fontWeight:'700'}}>💑 Q{qIndex+1}</Text>
        <Text style={{color:'#F9F2E7',fontSize:17,fontWeight:'600',textAlign:'center',lineHeight:26}}>{q.question}</Text>
      </View>
      <View style={{gap:8,marginBottom:14}}>
        {q.choix.map((c,i)=>(
          <TouchableOpacity key={i} style={[s.repN,choisi===i&&{backgroundColor:'rgba(255,61,107,0.2)',borderColor:'#FF3D6B'}]} onPress={()=>repondre(i)} disabled={choisi!==null}>
            <View style={[s.lettre,choisi===i&&{backgroundColor:'#FF3D6B'}]}><Text style={{color:'#F9F2E7',fontSize:10,fontWeight:'700'}}>{LETTRES[i]}</Text></View>
            <Text style={{color:'#F9F2E7',fontSize:14,flex:1}}>{c}</Text>
            {choisi===i&&<Text style={{fontSize:14}}>✓</Text>}
          </TouchableOpacity>
        ))}
      </View>
      {choisi===null&&<View style={s.msgBox}><Text style={s.msgTxt}>💭 {t.choixReponse}</Text></View>}
      {choisi!==null&&!partnerRepondu&&<View style={s.msgBox}><Text style={s.msgTxt}>{t.attentePartner}</Text></View>}
      {choisi!==null&&partnerRepondu&&(
        <TouchableOpacity style={[s.btnR,{backgroundColor:'#FF3D6B'}]} onPress={prochaine}>
          <Text style={s.btnRT}>{qIndex<questions.length-1?t.prochaine:'📊 Analyser →'}</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );

  // ANALYSE
  if(ecran==='analyse')return(
    <View style={s.centre}>
      <Text style={{fontSize:48,marginBottom:16}}>🔬</Text>
      <Text style={s.titre2}>{t.analyseEnCours}</Text>
      <Text style={s.desc}>{t.analyseDesc}</Text>
      <ActivityIndicator color="#FF3D6B" size="large" style={{marginTop:20}}/>
    </View>
  );

  // RÉSULTATS
  if(ecran==='resultats'&&analyseResult){
    const f1=FAILLES[analyseResult.faille1];
    const f2=FAILLES[analyseResult.faille2];
    const score=analyseResult.complicite;
    const scoreColor=score>=70?'#10D9A0':score>=40?'#F5A623':'#FF3D6B';
    return(
      <ScrollView style={s.ecran} contentContainerStyle={[s.ecranC,{alignItems:'center'}]}>
        <View style={{alignItems:'center',marginBottom:24,marginTop:10}}>
          <Text style={[s.sous,{marginBottom:8}]}>{t.votreComplicite.toUpperCase()}</Text>
          <View style={{width:110,height:110,borderRadius:55,backgroundColor:`${scoreColor}18`,borderWidth:3,borderColor:scoreColor,alignItems:'center',justifyContent:'center',marginBottom:8}}>
            <Text style={{fontSize:34,fontWeight:'900',color:scoreColor}}>{score}</Text>
            <Text style={{fontSize:10,color:scoreColor}}>/ 100</Text>
          </View>
          <Text style={{color:'rgba(249,242,231,0.4)',fontSize:12}}>{t.scoreLabel}</Text>
        </View>
        <View style={{width:'100%',gap:10,marginBottom:22}}>
          <Text style={[s.label,{marginBottom:6}]}>{t.faillePrincipale}</Text>
          {f1&&(<View style={{backgroundColor:`${f1.couleur}12`,borderWidth:1.5,borderColor:`${f1.couleur}60`,borderRadius:16,padding:16,flexDirection:'row',alignItems:'center',gap:12}}><Text style={{fontSize:26}}>{f1.emoji}</Text><View style={{flex:1}}><Text style={{color:f1.couleur,fontSize:15,fontWeight:'800'}}>{f1[langue]?.nom||f1.fr.nom}</Text><Text style={{color:'rgba(249,242,231,0.5)',fontSize:12}}>{f1[langue]?.desc||f1.fr.desc}</Text></View></View>)}
          <Text style={[s.label,{marginTop:8,marginBottom:6}]}>{t.failleSecondaire}</Text>
          {f2&&(<View style={{backgroundColor:`${f2.couleur}08`,borderWidth:1,borderColor:`${f2.couleur}40`,borderRadius:14,padding:14,flexDirection:'row',alignItems:'center',gap:10}}><Text style={{fontSize:22}}>{f2.emoji}</Text><View style={{flex:1}}><Text style={{color:f2.couleur,fontSize:13,fontWeight:'700'}}>{f2[langue]?.nom||f2.fr.nom}</Text><Text style={{color:'rgba(249,242,231,0.4)',fontSize:11}}>{f2[langue]?.desc||f2.fr.desc}</Text></View></View>)}
        </View>
        <Text style={[s.label,{marginBottom:4}]}>{t.exercicesTitle}</Text>
        <Text style={{color:'rgba(249,242,231,0.4)',fontSize:12,marginBottom:14}}>{t.exercicesDesc}</Text>
        <View style={{width:'100%',gap:10,marginBottom:20}}>
          {analyseResult.exercices.map((exo,i)=>{
            const tExo=exo[langue]||exo.fr;
            const f=FAILLES[exo.faille];
            return(<View key={i} style={{backgroundColor:`${f?.couleur||'#FF3D6B'}08`,borderWidth:1,borderColor:`${f?.couleur||'#FF3D6B'}30`,borderRadius:16,padding:16}}><View style={{flexDirection:'row',alignItems:'center',gap:10,marginBottom:4}}><Text style={{fontSize:24}}>{tExo.emoji}</Text><View style={{flex:1}}><Text style={{color:'#F9F2E7',fontSize:14,fontWeight:'700'}}>{tExo.titre}</Text><Text style={{color:'rgba(249,242,231,0.4)',fontSize:11}}>{exo.duree} {t.minutes} · {tExo.description}</Text></View></View></View>);
          })}
        </View>
        <TouchableOpacity style={[s.btnR,{backgroundColor:'#FF3D6B'}]} onPress={()=>{setExerciceIndex(0);setEtapeIndex(0);setEcran('exercice');}}><Text style={s.btnRT}>{t.commencerExo}</Text></TouchableOpacity>
        <TouchableOpacity style={s.btnV} onPress={onRetour}><Text style={s.btnVT}>{t.accueil}</Text></TouchableOpacity>
      </ScrollView>
    );
  }

  // EXERCICE
  if(ecran==='exercice'&&analyseResult){
    const exo=analyseResult.exercices[exerciceIndex];
    if(!exo)return(<View style={s.centre}><Text style={s.bigE}>🎉</Text><Text style={s.titre2}>{t.bravoCouple}</Text><TouchableOpacity style={s.btnR} onPress={onRetour}><Text style={s.btnRT}>{t.accueil}</Text></TouchableOpacity></View>);
    const tExo=exo[langue]||exo.fr;
    const f=FAILLES[exo.faille];
    const couleur=f?.couleur||'#FF3D6B';
    const totalEtapes=tExo.instructions.length;
    const isLast=etapeIndex>=totalEtapes-1;
    const isLastExo=exerciceIndex>=analyseResult.exercices.length-1;
    return(
      <ScrollView style={s.ecran} contentContainerStyle={[s.ecranC,{alignItems:'center',paddingTop:20}]}>
        <View style={{alignItems:'center',marginBottom:18}}>
          <Text style={{fontSize:40,marginBottom:6}}>{tExo.emoji}</Text>
          <Text style={[s.titre2,{textAlign:'center'}]}>{tExo.titre}</Text>
          <View style={{backgroundColor:`${couleur}18`,borderRadius:50,paddingVertical:3,paddingHorizontal:12,marginTop:4}}>
            <Text style={{color:couleur,fontSize:11}}>{exo.duree} {t.minutes} · {f?.[langue]?.nom||f?.fr.nom}</Text>
          </View>
        </View>
        <View style={{backgroundColor:'rgba(255,255,255,0.04)',borderRadius:14,padding:14,marginBottom:16,width:'100%'}}>
          <Text style={{color:'rgba(249,242,231,0.6)',fontSize:13,textAlign:'center',lineHeight:20}}>{tExo.description}</Text>
        </View>
        <View style={{width:'100%',marginBottom:18}}>
          <View style={{flexDirection:'row',justifyContent:'space-between',marginBottom:8}}>
            <Text style={s.label}>{t.etape} {etapeIndex+1} / {totalEtapes}</Text>
          </View>
          <View style={{height:3,backgroundColor:'rgba(255,255,255,0.08)',borderRadius:2,marginBottom:14}}>
            <View style={{height:3,backgroundColor:couleur,borderRadius:2,width:`${((etapeIndex+1)/totalEtapes)*100}%`}}/>
          </View>
          <View style={{backgroundColor:`${couleur}10`,borderWidth:1.5,borderColor:`${couleur}40`,borderRadius:16,padding:18,alignItems:'center'}}>
            <Text style={{color:'#F9F2E7',fontSize:16,fontWeight:'600',textAlign:'center',lineHeight:26}}>{tExo.instructions[etapeIndex]}</Text>
          </View>
        </View>
        {!isLast&&(<TouchableOpacity style={[s.btnR,{backgroundColor:couleur}]} onPress={()=>setEtapeIndex(i=>i+1)}><Text style={s.btnRT}>{t.etape} {etapeIndex+2} →</Text></TouchableOpacity>)}
        {isLast&&(
          <>
            <View style={{backgroundColor:`${couleur}12`,borderRadius:14,padding:14,marginBottom:14,alignItems:'center',width:'100%'}}>
              <Text style={{fontSize:20,marginBottom:4}}>{tExo.recompense}</Text>
              <Text style={{color:'rgba(249,242,231,0.5)',fontSize:12}}>{t.exoTermine}</Text>
            </View>
            {!isLastExo&&(<TouchableOpacity style={[s.btnR,{backgroundColor:couleur}]} onPress={()=>{setExerciceIndex(i=>i+1);setEtapeIndex(0);}}><Text style={s.btnRT}>{t.exerciceSuivant}</Text></TouchableOpacity>)}
            {isLastExo&&(<TouchableOpacity style={[s.btnR,{backgroundColor:'#FF3D6B'}]} onPress={onRetour}><Text style={s.btnRT}>{t.bravoCouple}</Text></TouchableOpacity>)}
            <TouchableOpacity style={s.btnV} onPress={onRetour}><Text style={s.btnVT}>{t.terminerSession}</Text></TouchableOpacity>
          </>
        )}
        <View style={{width:'100%',marginTop:18}}>
          <Text style={[s.label,{marginBottom:10}]}>{t.etapes}</Text>
          {tExo.instructions.map((step,i)=>(
            <View key={i} style={{flexDirection:'row',gap:10,marginBottom:10,opacity:i<etapeIndex?0.4:i===etapeIndex?1:0.5}}>
              <View style={{width:22,height:22,borderRadius:11,backgroundColor:i<=etapeIndex?couleur:'rgba(255,255,255,0.1)',alignItems:'center',justifyContent:'center',marginTop:1}}>
                <Text style={{color:'#fff',fontSize:10,fontWeight:'700'}}>{i<etapeIndex?'✓':i+1}</Text>
              </View>
              <Text style={{color:i===etapeIndex?'#F9F2E7':'rgba(249,242,231,0.4)',fontSize:13,flex:1,lineHeight:20}}>{step}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  }
  return null;
}

// ══════════════════════════════════════════════════════════════
//  APP PRINCIPALE
// ══════════════════════════════════════════════════════════════
export default function App(){
  const [langue,setLangue]=useState(null);
  const [ecran,setEcran]=useState('langue');
  const [jeu,setJeu]=useState(null);
  function allerAccueil(){setEcran('accueil');setJeu(null);}
  return(
    <SafeAreaView style={s.fond}>
      <StatusBar barStyle="light-content" backgroundColor="#0E0A14"/>
      {ecran==='langue'&&<ChoixLangue onChoisir={l=>{setLangue(l);setEcran('accueil');}}/>}
      {ecran==='accueil'&&<Accueil langue={langue} onMode={m=>setEcran(m==='divertir'?'hub':'couple')} onChangerLangue={()=>setEcran('langue')}/>}
      {ecran==='hub'&&<HubDivertir langue={langue} onJeu={id=>{setJeu(id);setEcran('jeu');}} onRetour={allerAccueil}/>}
      {ecran==='jeu'&&jeu==='quiz'&&<QuizJeu langue={langue} onRetour={()=>setEcran('hub')}/>}
      {ecran==='jeu'&&jeu==='devine'&&<DevineJeu langue={langue} onRetour={()=>setEcran('hub')}/>}
      {ecran==='jeu'&&jeu==='verite'&&<VeriteDefiJeu langue={langue} onRetour={()=>setEcran('hub')}/>}
      {ecran==='couple'&&<ModeCouple langue={langue} onRetour={allerAccueil}/>}
    </SafeAreaView>
  );
}

// ══════════════════════════════════════════════════════════════
//  STYLES
// ══════════════════════════════════════════════════════════════
const s=StyleSheet.create({
  fond:{flex:1,backgroundColor:'#0E0A14'},
  ecran:{flex:1,backgroundColor:'#0E0A14'},
  ecranC:{padding:20,paddingBottom:50},
  centre:{flex:1,alignItems:'center',justifyContent:'center',padding:28,backgroundColor:'#0E0A14'},
  bigE:{fontSize:64,marginBottom:8},
  titre1:{fontSize:40,fontWeight:'800',color:'#F9F2E7',letterSpacing:-1,marginBottom:4},
  titre2:{fontSize:22,fontWeight:'700',color:'#F9F2E7',marginBottom:10,textAlign:'center'},
  sous:{fontSize:10,letterSpacing:3,color:'#F5A623',marginBottom:16,textAlign:'center'},
  desc:{fontSize:13,color:'rgba(249,242,231,0.5)',textAlign:'center',lineHeight:20,marginBottom:16,maxWidth:300},
  retour:{color:'rgba(249,242,231,0.5)',fontSize:14,marginBottom:14},
  label:{fontSize:10,letterSpacing:2,color:'#F5A623',marginBottom:6},
  btnR:{backgroundColor:'#FF3D6B',borderRadius:50,paddingVertical:15,paddingHorizontal:28,width:'100%',maxWidth:320,alignItems:'center',elevation:6,marginBottom:4},
  btnRT:{color:'white',fontSize:14,fontWeight:'700'},
  btnV:{borderWidth:1,borderColor:'rgba(255,255,255,0.1)',borderRadius:50,paddingVertical:13,paddingHorizontal:28,width:'100%',maxWidth:320,alignItems:'center',marginTop:8},
  btnVT:{color:'rgba(249,242,231,0.5)',fontSize:13},
  btnFin:{backgroundColor:'rgba(255,255,255,0.06)',borderWidth:1,borderColor:'rgba(255,255,255,0.15)',borderRadius:50,paddingVertical:5,paddingHorizontal:12},
  btnFinT:{color:'rgba(249,242,231,0.6)',fontSize:11},
  langueBtn:{flexDirection:'row',alignItems:'center',gap:14,backgroundColor:'rgba(255,255,255,0.05)',borderWidth:1,borderColor:'rgba(255,255,255,0.1)',borderRadius:16,padding:14,width:'100%',maxWidth:300,marginBottom:10},
  langueNom:{fontSize:17,fontWeight:'600',color:'#F9F2E7'},
  langueTag:{position:'absolute',top:20,right:20,backgroundColor:'rgba(255,255,255,0.06)',borderWidth:1,borderColor:'rgba(255,255,255,0.1)',borderRadius:50,paddingVertical:4,paddingHorizontal:10},
  langueTagTxt:{color:'rgba(249,242,231,0.5)',fontSize:10},
  modeCard:{flexDirection:'row',alignItems:'center',gap:14,borderWidth:1,borderRadius:20,padding:18,width:'100%',maxWidth:340,marginBottom:14},
  modeIcon:{width:58,height:58,borderRadius:16,alignItems:'center',justifyContent:'center'},
  modeNom:{fontSize:18,fontWeight:'800',marginBottom:3},
  modeDesc:{fontSize:12,color:'rgba(249,242,231,0.4)'},
  jeuCard:{flexDirection:'row',alignItems:'center',gap:12,backgroundColor:'rgba(255,255,255,0.04)',borderWidth:1,borderRadius:18,padding:14,width:'100%',maxWidth:340,marginBottom:12},
  jeuEmoji:{width:50,height:50,borderRadius:14,alignItems:'center',justifyContent:'center'},
  jeuNom:{fontSize:15,fontWeight:'700',marginBottom:3},
  jeuDesc:{fontSize:11,color:'rgba(249,242,231,0.4)'},
  carteG:{backgroundColor:'rgba(255,255,255,0.05)',borderWidth:1,borderColor:'rgba(255,255,255,0.1)',borderRadius:18,padding:22,width:'100%',alignItems:'center',marginBottom:8},
  carteN:{fontSize:15,fontWeight:'600',color:'#F9F2E7',marginTop:6,marginBottom:3},
  carteD:{fontSize:11,color:'rgba(249,242,231,0.4)',textAlign:'center'},
  sep:{flexDirection:'row',alignItems:'center',gap:10,marginVertical:14,width:'100%'},
  ligne:{flex:1,height:1,backgroundColor:'rgba(255,255,255,0.1)'},
  ou:{color:'rgba(249,242,231,0.2)',fontSize:11,letterSpacing:2},
  joinBox:{backgroundColor:'rgba(255,255,255,0.05)',borderWidth:1,borderColor:'rgba(255,255,255,0.1)',borderRadius:14,padding:18,width:'100%'},
  input:{backgroundColor:'rgba(255,255,255,0.06)',borderWidth:1,borderColor:'rgba(255,255,255,0.1)',borderRadius:10,padding:12,color:'#F9F2E7',fontSize:20,fontWeight:'800',textAlign:'center',letterSpacing:5,marginVertical:10},
  codeBox:{backgroundColor:'rgba(255,255,255,0.05)',borderWidth:2,borderColor:'#FF3D6B',borderRadius:14,paddingVertical:14,paddingHorizontal:28,marginVertical:14},
  codeTxt:{fontSize:32,fontWeight:'800',color:'#F9F2E7',letterSpacing:7},
  niveauCard:{backgroundColor:'rgba(255,255,255,0.04)',borderWidth:1.5,borderColor:'rgba(255,255,255,0.1)',borderRadius:14,padding:14},
  niveauNom:{fontSize:15,fontWeight:'700',color:'#F9F2E7',marginBottom:3},
  niveauDesc:{fontSize:11,color:'rgba(249,242,231,0.4)'},
  niveauBadge:{flexDirection:'row',alignItems:'center',gap:4,borderWidth:1,borderRadius:50,paddingVertical:2,paddingHorizontal:8},
  niveauBadgeTxt:{fontSize:10,fontWeight:'600'},
  catPill:{alignItems:'center',backgroundColor:'rgba(255,255,255,0.04)',borderWidth:1,borderColor:'rgba(255,255,255,0.08)',borderRadius:10,padding:8,width:'30%'},
  catPillActif:{backgroundColor:'rgba(255,61,107,0.15)',borderColor:'rgba(255,61,107,0.5)'},
  catNom:{fontSize:9,color:'rgba(249,242,231,0.4)',marginTop:3,textAlign:'center'},
  carteQ:{backgroundColor:'rgba(255,255,255,0.05)',borderWidth:1,borderRadius:20,padding:20,marginBottom:12,alignItems:'center'},
  repN:{flexDirection:'row',alignItems:'center',gap:12,backgroundColor:'rgba(255,255,255,0.03)',borderWidth:1,borderColor:'rgba(255,255,255,0.1)',borderRadius:14,padding:13},
  repC:{backgroundColor:'rgba(255,61,107,0.2)',borderColor:'#FF3D6B'},
  repP:{backgroundColor:'rgba(167,139,250,0.15)',borderColor:'rgba(167,139,250,0.5)'},
  repM:{backgroundColor:'rgba(16,217,160,0.15)',borderColor:'rgba(16,217,160,0.6)'},
  lettre:{width:26,height:26,borderRadius:7,backgroundColor:'rgba(255,255,255,0.06)',borderWidth:1,borderColor:'rgba(255,255,255,0.1)',alignItems:'center',justifyContent:'center'},
  msgBox:{backgroundColor:'rgba(255,255,255,0.04)',borderWidth:1,borderColor:'rgba(255,255,255,0.1)',borderRadius:14,padding:14,alignItems:'center'},
  msgTxt:{color:'rgba(249,242,231,0.5)',fontSize:13,textAlign:'center'},
  persoBox:{backgroundColor:'rgba(245,166,35,0.06)',borderWidth:1,borderColor:'rgba(245,166,35,0.3)',borderRadius:14,padding:14,marginBottom:8},
  persoInput:{backgroundColor:'rgba(255,255,255,0.06)',borderWidth:1,borderColor:'rgba(255,255,255,0.1)',borderRadius:10,padding:12,color:'#F9F2E7',fontSize:14,minHeight:70,textAlignVertical:'top'},
});
