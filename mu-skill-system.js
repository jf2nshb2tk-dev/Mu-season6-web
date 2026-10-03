(() => {
"use strict";
if(window.MUSkillSystem||!window.MUGameData)return;
const STORE="mu-s6-skill-hotkeys-v1";
const cooldowns=new Map();
let selected=null,mobileArmed=false,castSeq=0;
const getClass=()=>window.MUClassSystem?.activeId||"dw";
const classSkills=()=>MUGameData.skillsForClass(getClass());
function defaults(){return classSkills().slice(0,5).map(s=>s.id)}
function loadHotkeys(){
 try{const x=JSON.parse(localStorage.getItem(STORE)||"null");if(Array.isArray(x)){const allowed=new Set(classSkills().map(s=>s.id));const good=x.filter(id=>allowed.has(id)).slice(0,5);if(good.length)return good.concat(defaults().filter(id=>!good.includes(id))).slice(0,5)}}catch(_){}
 return defaults();
}
let hotkeys=loadHotkeys();
selected=hotkeys[0]||classSkills()[0]?.id||null;

function save(){try{localStorage.setItem(STORE,JSON.stringify(hotkeys))}catch(_){}}
function skill(id){return MUGameData.skills[Number(id)]||null}
function select(id,arm=false){
 id=Number(id);if(!classSkills().some(s=>s.id===id))return false;
 selected=id;if(arm)mobileArmed=true;
 window.dispatchEvent(new CustomEvent("mu-skill-select",{detail:{skill:skill(id),skillId:id,mobileArmed}}));return true;
}
function assign(slot,id){slot=Math.max(0,Math.min(4,slot|0));id=Number(id);if(!skill(id))return false;hotkeys[slot]=id;save();window.dispatchEvent(new Event("mu-skill-hotkeys"));return true}
function cooldownLeft(id){return Math.max(0,(cooldowns.get(Number(id))||0)-performance.now())}
let castingUntil=0;
function canCast(s){if(!s)return"No skill";if(!window.MUWorld?.ready||!window.MUSkillEffects?.ready)return"Cargando poderes";if(MUWorld.blocked)return"Cerrá la ventana para usar el poder";if(performance.now()<castingUntil)return"Lanzando poder";const p=MUWorld.player;if(s.damage>0&&MUWorld.isSafe(p.x,p.y))return"Zona segura: salí de Lorencia para atacar";if(cooldownLeft(s.id)>0)return"Cooldown";if(playerStats.mana<s.mana)return"Sin mana";return""}
function castAt(clientX,clientY,source="mouse"){
 const s=skill(selected);const reason=canCast(s);if(reason){window.dispatchEvent(new CustomEvent("mu-skill-error",{detail:{reason,skill:s}}));return false}
 const from={...MUWorld.player},target=window.MUCombat?.findScreenTarget(clientX,clientY,95)||null;
 const to=s.damage===0?{...from}:target?{x:target.x,y:target.y,z:target.z}:MUWorld.pick(clientX,clientY);
 const range=["melee","combo"].includes(s.kind)?4:22;
 const invalid=!to?"Apuntá al terreno":s.damage>0&&MUWorld.isSafe(to.x,to.y)?"El objetivo está en zona segura":Math.hypot(to.x-from.x,to.y-from.y)>range?"Objetivo fuera de alcance":"";
 if(invalid){window.dispatchEvent(new CustomEvent("mu-skill-error",{detail:{reason:invalid,skill:s}}));return false}
 const now=performance.now(),castId=++castSeq,profile=MUSkillEffects.profile(s);
 playerStats.mana=Math.max(0,playerStats.mana-s.mana);cooldowns.set(s.id,now+s.cooldown);castingUntil=now+profile.duration;
 try{updateMuHudUI()}catch(_){}
 const detail={castId,skillId:s.id,skill:s,source,screenX:clientX,screenY:clientY,targetId:target?.id||null,timestamp:now,from,to,action:profile.action,duration:profile.duration,impactMs:profile.impactMs};
 MUWorld.cast(detail);
 window.dispatchEvent(new CustomEvent("mu-skill-cast",{detail}));
 window.dispatchEvent(new CustomEvent("mu-skill-effect",{detail}));
 setTimeout(()=>{
   if(s.damage>0)window.dispatchEvent(new CustomEvent("mu-skill-hit",{detail:{...detail,damage:s.damage,radius:s.kind==="area"?3.2:1.5}}));
   else window.dispatchEvent(new CustomEvent("mu-skill-support",{detail}));
 },profile.impactMs);
 mobileArmed=false;window.dispatchEvent(new CustomEvent("mu-skill-select",{detail:{skill:s,skillId:s.id,mobileArmed}}));return true;
}
function cancel(){mobileArmed=false;window.dispatchEvent(new CustomEvent("mu-skill-select",{detail:{skill:skill(selected),skillId:selected,mobileArmed}}))}
function arm(){mobileArmed=true;window.dispatchEvent(new CustomEvent("mu-skill-select",{detail:{skill:skill(selected),skillId:selected,mobileArmed}}))}

window.addEventListener("keydown",e=>{if(e.repeat)return;const n=Number(e.key);if(n>=1&&n<=5&&hotkeys[n-1]){e.preventDefault();select(hotkeys[n-1],false)}});
const gameCanvas=document.querySelector("canvas");
if(gameCanvas){
 gameCanvas.addEventListener("contextmenu",e=>{e.preventDefault();castAt(e.clientX,e.clientY,"mouse")});
 gameCanvas.addEventListener("pointerdown",e=>{
   if(e.button===2){e.preventDefault();e.stopImmediatePropagation();return}
   if(!mobileArmed||!(e.pointerType==="touch"||e.pointerType==="pen"))return;
   e.preventDefault();e.stopImmediatePropagation();castAt(e.clientX,e.clientY,"touch");
 },true);
}
window.MUSkillSystem={get selected(){return selected},get selectedSkill(){return skill(selected)},get hotkeys(){return [...hotkeys]},get mobileArmed(){return mobileArmed},classSkills,select,assign,castAt,arm,cancel,cooldownLeft,canCast};
})();
