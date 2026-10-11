import { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { fbSet, fbGet, fbListen } from '../services/fb';
import { T } from '../i18n';
import { s } from '../ui/gameStyles';
import { LETTRES, NIVEAUX, CATS, genererQuestion, getHistorique, ajouterHistorique } from './shared';
import { ConnexionEcran } from '../screens/LiveSession';

// ══════════════════════════════════════════════════════════════
//  JEU : QUIZ COUPLES
// ══════════════════════════════════════════════════════════════
export default function QuizJeu({langue,onRetour}){
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
