import { useState, useEffect, useRef, useCallback } from "react";
import { db } from "./firebase";
import { ref, onValue, set } from "firebase/database";

const FLOORS=[9,10,11,12,13,14],N=27;
const SYS=[
{id:"h",l:"HIDRAULICA",c:"#3B82F6",icon:"💧",items:["Agua quente","Agua fria","Esgoto pia","Esgoto vaso","Ralo","Chuveiro"]},
{id:"a",l:"AR-COND.",c:"#06B6D4",icon:"❄️",items:["Tubulacao cobre","Dreno","Protecao dreno"]},
{id:"s",l:"INCENDIO",c:"#EF4444",icon:"🔴",items:["Sprinklers","Tubulacao SPK","Pontos baixados"]},
{id:"e",l:"ELETRICA",c:"#F59E0B",icon:"⚡",items:["Corrugados","Fiacao","Fechamento","Det. fumaca","Voice Ann.","Wi-Fi"]},
{id:"r",l:"RENOV. AR",c:"#A855F7",icon:"🌬️",items:["Exaustao","Renovacao","Ponto 1","Ponto 2","Ponto 3"]},
{id:"g",l:"GESSO",c:"#94a3b8",icon:"🔲",items:["Perfilados","Nivelamento","Placas","Luminarias","Difusores","Sprinklers","Detectores","Juntas","Acabamento"]},
];
const TOTAL=SYS.reduce((a,s)=>a+s.items.length,0);
const DB_PATH="checklist/hilton_v1";
const PIN_EDITOR="hilton2026";
const chk=(data,f,u,k)=>!!(data[f]?.[u]?.[k]);
const unitDone=(data,f,u)=>SYS.reduce((a,s)=>a+s.items.filter((_,i)=>chk(data,f,u,s.id+i)).length,0);
const sysDone=(data,f,u,sid)=>{const s=SYS.find(x=>x.id===sid);return s?s.items.filter((_,i)=>chk(data,f,u,s.id+i)).length:0;};
const floorDone=(data,f)=>{let d=0;for(let u=1;u<=N;u++)d+=unitDone(data,f,u);return d;};
const pct=(done,tot)=>tot?Math.round(done/tot*100):0;

export default function App(){
const[data,setData]=useState({}),[floor,setFloor]=useState(9),[uid,setUid]=useState(1);
const[sid,setSid]=useState("h"),[tab,setTab]=useState("u"),[st,setSt]=useState("conectando..."),[stc,setStc]=useState("#888");
const[unlocked,setUnlocked]=useState(()=>sessionStorage.getItem("hilton_editor")==="1");
const[showPin,setShowPin]=useState(false),[pin,setPin]=useState(""),[pinErr,setPinErr]=useState(false);
const tm=useRef(null);

useEffect(()=>{
const dbRef=ref(db,DB_PATH);
const unsub=onValue(dbRef,(snap)=>{setData(snap.val()||{});setSt("sync");setStc("#22c55e");}
,()=>{setSt("erro");setStc("#ef4444");});
return()=>unsub();
},[]);

const save=useCallback((d)=>{setSt("salvando");setStc("#f59e0b");clearTimeout(tm.current);tm.current=setTimeout(()=>{set(ref(db,DB_PATH),d).then(()=>{setSt("salvo");setStc("#22c55e");}).catch(()=>{setSt("erro");setStc("#ef4444");});},500);},[]);

const tog=(k)=>{if(!unlocked)return;setData(p=>{const fObj=p[floor]||{},uObj=fObj[uid]||{},wasOn=!!uObj[k];let newU;if(wasOn){newU={...uObj};delete newU[k];}else{newU={...uObj,[k]:true};}const n={...p,[floor]:{...fObj,[uid]:newU}};save(n);return n;});};

const tryPin=()=>{if(pin===PIN_EDITOR){setUnlocked(true);sessionStorage.setItem("hilton_editor","1");setShowPin(false);setPin("");setPinErr(false);}else{setPinErr(true);setPin("");}};
const lock=()=>{setUnlocked(false);sessionStorage.removeItem("hilton_editor");};

const rp=pct(unitDone(data,floor,uid),TOTAL),fp=pct(floorDone(data,floor),N*TOTAL);
const gp=pct(FLOORS.reduce((a,f)=>a+floorDone(data,f),0),FLOORS.length*N*TOTAL),ac=SYS.find(s=>s.id===sid);

return(<div style={{minHeight:"100vh",background:"#08080f",color:"#ddd",fontFamily:"monospace",paddingBottom:60}}>

{showPin&&(<div style={{position:"fixed",inset:0,background:"#000a",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center"}} onClick={()=>{setShowPin(false);setPin("");setPinErr(false);}}>
<div style={{background:"#0d0d1a",border:"1px solid #2a2a4a",borderRadius:12,padding:28,width:280,textAlign:"center"}} onClick={e=>e.stopPropagation()}>
<div style={{fontSize:28,marginBottom:8}}>🔒</div>
<div style={{fontSize:13,fontWeight:700,color:"#fff",marginBottom:4}}>Modo Editor</div>
<div style={{fontSize:11,color:"#555",marginBottom:16}}>Digite o PIN para editar</div>
<input type="password" value={pin} onChange={e=>{setPin(e.target.value);setPinErr(false);}} onKeyDown={e=>e.key==="Enter"&&tryPin()} placeholder="••••••••" style={{width:"100%",padding:"10px 12px",background:"#1a1a30",border:`1px solid ${pinErr?"#ef4444":"#2a2a4a"}`,borderRadius:7,color:"#fff",fontSize:16,textAlign:"center",outline:"none",boxSizing:"border-box",fontFamily:"monospace"}} autoFocus/>
{pinErr&&<div style={{color:"#ef4444",fontSize:11,marginTop:6}}>PIN incorreto</div>}
<button onClick={tryPin} style={{marginTop:12,width:"100%",padding:"10px 0",background:"#6366f1",border:"none",borderRadius:7,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer"}}>Entrar</button>
<button onClick={()=>{setShowPin(false);setPin("");setPinErr(false);}} style={{marginTop:8,width:"100%",padding:"8px 0",background:"transparent",border:"1px solid #2a2a4a",borderRadius:7,color:"#555",fontSize:12,cursor:"pointer"}}>Cancelar</button>
</div></div>)}

<div style={{background:"#0d0d1a",borderBottom:"1px solid #1e1e35",padding:"14px 14px 10px",position:"sticky",top:0,zIndex:50}}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
<div><div style={{fontSize:8,color:"#444",letterSpacing:3}}>HILTON GARDEN INN · ITAPEMA</div>
<div style={{fontSize:16,fontWeight:900,color:"#fff"}}>CHECKLIST INFRA</div>
<div style={{fontSize:8,color:"#555"}}>Andares 9-14 · 27 un. · {TOTAL} itens/un.</div>
<div style={{fontSize:8,marginTop:3,display:"flex",alignItems:"center",gap:6}}>
<div style={{width:5,height:5,borderRadius:"50%",background:stc}}/>
<span style={{color:stc}}>{st}</span>
<span style={{marginLeft:4,fontSize:10,cursor:"pointer",padding:"2px 8px",borderRadius:4,border:"1px solid",borderColor:unlocked?"#22c55e":"#444",color:unlocked?"#22c55e":"#555",background:"transparent"}} onClick={unlocked?lock:()=>setShowPin(true)}>
{unlocked?"🔓 EDITOR":"🔒 LEITURA"}</span>
</div></div>
<div style={{background:"#111125",border:"1px solid #2a2a4a",borderRadius:8,padding:"6px 12px",textAlign:"center"}}>
<div style={{fontSize:24,fontWeight:900,color:gp===100?"#22c55e":"#f59e0b",lineHeight:1}}>{gp}%</div>
<div style={{fontSize:7,color:"#444",letterSpacing:2}}>GLOBAL</div></div></div>
<div style={{marginTop:8,height:3,background:"#1a1a30",borderRadius:2,overflow:"hidden"}}>
<div style={{width:`${gp}%`,height:"100%",background:gp===100?"#22c55e":"linear-gradient(90deg,#6366f1,#f59e0b)",transition:"width .5s"}}/></div>
<div style={{display:"flex",gap:6,marginTop:10}}>
{[["u","Unidade"],["o","Painel"]].map(([t,l])=>(<button key={t} onClick={()=>setTab(t)} style={{padding:"5px 12px",borderRadius:5,border:"1px solid",borderColor:tab===t?"#6366f1":"#1e1e35",background:tab===t?"#6366f1":"transparent",color:tab===t?"#fff":"#555",fontSize:9,letterSpacing:2,cursor:"pointer",fontFamily:"inherit"}}>{l}</button>))}</div></div>

{tab==="u"&&(<div style={{padding:"0 12px"}}>
<div style={{marginTop:14,marginBottom:10}}><div style={{fontSize:8,color:"#444",letterSpacing:3,marginBottom:8}}>ANDAR</div>
<div style={{display:"flex",gap:6}}>{FLOORS.map(f=>{const p=pct(floorDone(data,f),N*TOTAL),act=floor===f;return(<button key={f} onClick={()=>{setFloor(f);setUid(1);}} style={{flex:1,padding:"8px 0",borderRadius:7,border:"2px solid",borderColor:act?"#6366f1":p===100?"#22c55e55":"#1a1a30",background:act?"#6366f1":p===100?"#0b2016":"#0d0d1a",color:act?"#fff":p===100?"#22c55e":"#888",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{f}°</button>);})}</div></div>
<div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:8,color:"#444",letterSpacing:2}}>{floor}° ANDAR</span><span style={{fontSize:10,fontWeight:700,color:fp===100?"#22c55e":"#6366f1"}}>{fp}%</span></div>
<div style={{height:2,background:"#1a1a30",borderRadius:2,marginBottom:12,overflow:"hidden"}}><div style={{width:`${fp}%`,height:"100%",background:fp===100?"#22c55e":"#6366f1",transition:"width .4s"}}/></div>
<div style={{marginBottom:12}}><div style={{fontSize:8,color:"#444",letterSpacing:3,marginBottom:8}}>UNIDADE</div>
<div style={{display:"flex",flexWrap:"wrap",gap:5}}>{Array.from({length:N},(_,i)=>i+1).map(u=>{const done=unitDone(data,floor,u),p=pct(done,TOTAL),act=uid===u;return(<button key={u} onClick={()=>setUid(u)} style={{width:38,height:38,borderRadius:6,border:"2px solid",borderColor:act?"#6366f1":p===100?"#22c55e55":"#1a1a30",background:act?"#6366f1":p===100?"#0b2016":"#0d0d1a",color:act?"#fff":p===100?"#22c55e":done>0?"#f59e0b":"#555",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{u}</button>);})}</div></div>
<div style={{background:"#0d0d1a",border:"1px solid #1e1e35",borderRadius:8,padding:"10px 14px",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
<span style={{fontSize:16,fontWeight:900,color:"#fff"}}>{floor}° · Un. {uid}</span>
<span style={{fontSize:24,fontWeight:900,color:rp===100?"#22c55e":rp>60?"#f59e0b":"#ef4444"}}>{rp}%</span></div>
<div style={{height:3,background:"#1a1a30",borderRadius:2,marginBottom:12,overflow:"hidden"}}><div style={{width:`${rp}%`,height:"100%",background:rp===100?"#22c55e":"linear-gradient(90deg,#6366f1,#f59e0b)",transition:"width .4s"}}/></div>
<div style={{display:"flex",gap:5,overflowX:"auto",paddingBottom:5,marginBottom:12}}>
{SYS.map(s=>{const done=sysDone(data,floor,uid,s.id),p=pct(done,s.items.length),act=sid===s.id;return(<button key={s.id} onClick={()=>setSid(s.id)} style={{padding:"6px 10px",borderRadius:7,border:"1px solid",borderColor:act?s.c:"#1e1e35",background:act?`${s.c}22`:"#0d0d1a",color:act?s.c:"#555",fontSize:8,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap",display:"flex",alignItems:"center",gap:4,flexShrink:0}}><span>{s.icon}</span><span style={{fontWeight:700}}>{s.l}</span><span style={{background:p===100?"#22c55e22":"#fff1",color:p===100?"#22c55e":"#888",borderRadius:3,padding:"1px 4px",fontSize:7}}>{p}%</span></button>);})}</div>
{ac&&(<div style={{background:`${ac.c}0d`,border:`1px solid ${ac.c}30`,borderRadius:10,overflow:"hidden",marginBottom:20}}>
<div style={{padding:"10px 14px",borderBottom:`1px solid ${ac.c}20`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
<div style={{display:"flex",alignItems:"center",gap:6}}><span style={{fontSize:16}}>{ac.icon}</span><span style={{fontSize:10,fontWeight:700,color:ac.c,letterSpacing:2}}>{ac.l}</span></div>
<span style={{fontSize:18,fontWeight:800,color:pct(sysDone(data,floor,uid,ac.id),ac.items.length)===100?"#22c55e":ac.c}}>{pct(sysDone(data,floor,uid,ac.id),ac.items.length)}%</span></div>
{ac.items.map((lbl,i)=>{const k=ac.id+i,on=chk(data,floor,uid,k);return(<div key={k} onClick={()=>tog(k)} style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",borderBottom:i<ac.items.length-1?`1px solid ${ac.c}12`:"none",cursor:unlocked?"pointer":"default",background:on?`${ac.c}0a`:"transparent",opacity:unlocked?1:0.85}}>
<div style={{width:20,height:20,borderRadius:5,border:"2px solid",borderColor:on?ac.c:"#2a2a4a",background:on?ac.c:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{on&&<span style={{fontSize:10,color:"#fff",fontWeight:900}}>✓</span>}</div>
<span style={{fontSize:13,color:on?"#555":"#ccc",textDecoration:on?"line-through":"none"}}>{lbl}</span>
</div>);})}
</div>)}</div>)}
{tab==="o"&&(<div style={{padding:"16px 12px"}}>
<div style={{fontSize:8,color:"#444",letterSpacing:3,marginBottom:12}}>PAINEL GERAL - 6 ANDARES</div>
{FLOORS.map(f=>{const fp2=pct(floorDone(data,f),N*TOTAL);return(<div key={f} style={{marginBottom:14}}>
<div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 10px",background:"#0d0d1a",borderRadius:6,border:"1px solid #1e1e35",marginBottom:5}}>
<span style={{fontSize:13,fontWeight:900,color:"#fff"}}>{f}° ANDAR</span>
<span style={{fontSize:13,fontWeight:700,color:fp2===100?"#22c55e":fp2>60?"#f59e0b":fp2>0?"#f97316":"#333"}}>{fp2}%</span></div>
<div style={{height:2,background:"#1a1a30",borderRadius:1,marginBottom:6,overflow:"hidden"}}><div style={{width:`${fp2}%`,height:"100%",background:fp2===100?"#22c55e":"#6366f1"}}/></div>
<div style={{display:"flex",flexWrap:"wrap",gap:4}}>{Array.from({length:N},(_,i)=>i+1).map(u=>{const done=unitDone(data,f,u),p=pct(done,TOTAL);return(<button key={u} onClick={()=>{setFloor(f);setUid(u);setTab("u");}} style={{width:34,height:34,borderRadius:5,border:"1px solid",borderColor:p===100?"#22c55e44":"#1a1a30",background:p===100?"#0b2016":"#0d0d1a",color:p===100?"#22c55e":done>0?"#f59e0b":"#444",fontSize:10,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{u}</button>);})}</div>
</div>);})}
</div>)}
</div>);
}
