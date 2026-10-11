import { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { fbSet, fbListen } from '../services/fb';
import { T } from '../i18n';
import { s } from '../ui/gameStyles';
import { VERITE_DEFI } from './shared';
import { ConnexionEcran } from '../screens/LiveSession';

// ══════════════════════════════════════════════════════════════
//  JEU : VÉRITÉ OU DÉFI
// ══════════════════════════════════════════════════════════════
export default function VeriteDefiJeu({langue,onRetour}){
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
