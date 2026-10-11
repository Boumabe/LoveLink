import { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { fbSet, fbGet, fbListen } from '../services/fb';
import { T } from '../i18n';
import { s } from '../ui/gameStyles';
import { LETTRES, FAILLES, QUESTIONS_COUPLE, analyserReponsesCouple } from './shared';
import { ConnexionEcran } from '../screens/LiveSession';

// ══════════════════════════════════════════════════════════════
//  MODE COUPLE
// ══════════════════════════════════════════════════════════════
export default function ModeCouple({langue,onRetour}){
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
