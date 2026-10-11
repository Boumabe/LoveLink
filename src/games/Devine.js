import { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { fbSet, fbListen } from '../services/fb';
import { T } from '../i18n';
import { s } from '../ui/gameStyles';
import { DEVINE_MOTS } from './shared';
import { ConnexionEcran } from '../screens/LiveSession';

// ══════════════════════════════════════════════════════════════
//  JEU : DEVINE
// ══════════════════════════════════════════════════════════════
export default function DevineJeu({langue,onRetour}){
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
  function ecouterPartie(code){
    const un=fbListen(`devine/${code}/gameState`,val=>{
      if(!val||val.phase!=='game')return;
      setMode(val.mode);setCategory(val.category);setSecretWord(val.secretWord||'');
      setTimerDuration(val.timerDuration||90);setTimeLeft(val.timerDuration||90);
      setScreen('game');startGameListeners(code,false);unsubAll();setTimerActive(true);
    });
    unsubRefs.current.push(un);
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
  if(screen==='lobby')return(<ConnexionEcran t={t} fbPath="devine" emoji="🔍" couleur="#10D9A0" onRetour={()=>{reset();onRetour();}} onConnecte={(code,j1)=>{setSessionCode(code);setIsJ1(j1);setScreen('setup');if(!j1)ecouterPartie(code);}}/>);
  return(
    <ScrollView style={s.ecran} contentContainerStyle={[s.ecranC,{paddingBottom:60}]}>
      <TouchableOpacity onPress={()=>{reset();onRetour();}} style={{marginBottom:8}}><Text style={s.retour}>{t.retour}</Text></TouchableOpacity>
      <View style={{alignItems:'center',marginBottom:16}}><Text style={{fontSize:28}}>🔍</Text><Text style={s.titre2}>{t.devineTitle}</Text></View>
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
