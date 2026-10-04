(() => {
"use strict";
if(window.MUSkillSystem||!window.MUGameData)return;
const STORE="mu-s6-skill-hotkeys-v1";
const cooldowns=new Map();
let selected=null,mobileArmed=false,basicArmed=false,castSeq=0;
const getClass=()=>window.MUClassSystem?.activeId||"dw";
const classSkills=()=>MUGameData.skillsForClass(getClass());
function defaults(){return classSkills().slice(0,4).map(s=>s.id)}
function loadHotkeys(){
 try{const x=JSON.parse(localStorage.getItem(STORE)||"null");if(Array.isArray(x)){const allowed=new Set(classSkills().map(s=>s.id));const good=x.filter(id=>allowed.has(id)).slice(0,4);if(good.length)return good.concat(defaults().filter(id=>!good.includes(id))).slice(0,4)}}catch(_){}
 return defaults();
}
let hotkeys=loadHotkeys();
selected=hotkeys[0]||classSkills()[0]?.id||null;

function save(){try{localStorage.setItem(STORE,JSON.stringify(hotkeys))}catch(_){}}
function skill(id){return MUGameData.skills[Number(id)]||null}
function select(id,arm=false){
 id=Number(id);if(!classSkills().some(s=>s.id===id))return false;
 selected=id;mobileArmed=arm;basicArmed=false;
 window.dispatchEvent(new CustomEvent("mu-skill-select",{detail:{skill:skill(id),skillId:id,mobileArmed}}));return true;
}
function assign(slot,id){
 id=Number(id);if(!Number.isInteger(slot)||slot<0||slot>3||!classSkills().some(s=>s.id===id))return false;
 const other=hotkeys.indexOf(id);if(other>=0&&other!==slot)hotkeys[other]=hotkeys[slot];
 hotkeys[slot]=id;save();window.dispatchEvent(new Event("mu-skill-hotkeys"));return true;
}
function cooldownLeft(id){return Math.max(0,(cooldowns.get(Number(id))||0)-performance.now())}
let castingUntil=0;
function canCast(s){if(!s)return"No skill";if(!window.MUWorld?.ready||!window.MUSkillEffects?.ready)return"Cargando poderes";if(MUWorld.blocked||window.MUSkillUI?.isOpen)return"Cerrá la ventana para usar el poder";if(performance.now()<castingUntil)return"Lanzando poder";const p=MUWorld.player;if(s.damage>0&&MUWorld.isSafe(p.x,p.y))return"Zona segura: salí de Lorencia para atacar";if(cooldownLeft(s.id)>0)return"Cooldown";if(playerStats.mana<s.mana)return"Sin mana";return""}
function performCast(s,clientX,clientY,source="mouse",forcedTarget=null){
const reason=canCast(s);if(reason){window.dispatchEvent(new CustomEvent("mu-skill-error",{detail:{reason,skill:s}}));return false}
 const profile=MUSkillEffects.profile(s);
 const from={...MUWorld.player},target=forcedTarget||window.MUCombat?.findScreenTarget(clientX,clientY,95)||null;
 const to=profile.origin==="self"&&(s.damage===0||s.kind==="area")?{...from}:target?{x:target.x,y:target.y,z:target.z}:MUWorld.pick(clientX,clientY);
 const range=s.range||(["melee","combo"].includes(s.kind)?4:22);
 const invalid=!to?"Apuntá al terreno":s.damage>0&&MUWorld.isSafe(to.x,to.y)?"El objetivo está en zona segura":Math.hypot(to.x-from.x,to.y-from.y)>range?"Objetivo fuera de alcance":"";
 if(invalid){window.dispatchEvent(new CustomEvent("mu-skill-error",{detail:{reason:invalid,skill:s}}));return false}
 const now=performance.now(),castId=++castSeq;
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
 mobileArmed=false;basicArmed=false;window.dispatchEvent(new CustomEvent("mu-skill-select",{detail:{skill:s,skillId:s.id,mobileArmed}}));return true;
}
function basicSkill(){return{id:0,name:"Ataque básico",mana:0,cooldown:480,damage:8,kind:getClass()==="elf"?"ranged":"melee",range:getClass()==="elf"?12:3,action:getClass()==="elf"?50:getClass()==="rf"?38:39,basic:true}}
function castAt(x,y,source="mouse"){return performCast(skill(selected),x,y,source)}
function basicAt(x,y,source="button"){return performCast(basicSkill(),x,y,source)}
function cancel(){mobileArmed=false;basicArmed=false;window.dispatchEvent(new CustomEvent("mu-skill-select",{detail:{skill:skill(selected),skillId:selected,mobileArmed}}))}
function arm(basic=false){mobileArmed=true;basicArmed=basic;window.dispatchEvent(new CustomEvent("mu-skill-select",{detail:{skill:basic?basicSkill():skill(selected),skillId:basic?0:selected,mobileArmed}}))}
function nearest(s){
 const p=window.MUWorld?.player;if(!p)return null;
 const range=s.range||(["melee","combo"].includes(s.kind)?4:22);let best=null,dist=range;
 for(const m of window.MUCombat?.monsters.values()||[]){
  if(!m.alive||!Number.isFinite(m.screenX)||!Number.isFinite(m.screenY)||m.screenX<0||m.screenY<0||m.screenX>innerWidth||m.screenY>innerHeight||MUWorld.isSafe(m.x,m.y))continue;
  const d=Math.hypot(m.x-p.x,m.y-p.y);if(d<=dist){best=m;dist=d}
 }return best;
}
function use(basic=false){
 const s=basic?basicSkill():skill(selected),reason=canCast(s);
 if(reason){window.dispatchEvent(new CustomEvent("mu-skill-error",{detail:{reason,skill:s}}));return false}
 if(MUSkillEffects.profile(s).origin==="self"&&(s.damage===0||s.kind==="area"))return performCast(s,0,0,"button");
 const target=nearest(s);
 if(target)return performCast(s,target.screenX,target.screenY,"button",target);
 arm(basic);return false;
}
function useSlot(slot){if(!hotkeys[slot])return false;select(hotkeys[slot]);return use(false)}
window.addEventListener("keydown",e=>{
 if(e.repeat||e.ctrlKey||e.metaKey||e.altKey||/INPUT|TEXTAREA|SELECT/.test(e.target?.tagName)||e.target?.isContentEditable||window.MUSkillUI?.isOpen)return;
 const n=Number(e.key);if(n>=1&&n<=4&&hotkeys[n-1]){e.preventDefault();useSlot(n-1)}
 if(e.code==="KeyF"){e.preventDefault();use(true)}
});
const gameCanvas=document.querySelector("canvas");
if(gameCanvas){
 gameCanvas.addEventListener("contextmenu",e=>{e.preventDefault();castAt(e.clientX,e.clientY,"mouse")});
 gameCanvas.addEventListener("pointerdown",e=>{
   if(e.button===2){e.preventDefault();e.stopImmediatePropagation();return}
   if(!mobileArmed||e.button!==0)return;
   e.preventDefault();e.stopImmediatePropagation();
   if(basicArmed)basicAt(e.clientX,e.clientY,e.pointerType);else castAt(e.clientX,e.clientY,e.pointerType);
 },true);
}
window.MUSkillSystem={get selected(){return selected},get selectedSkill(){return skill(selected)},get hotkeys(){return [...hotkeys]},get mobileArmed(){return mobileArmed},get basicArmed(){return basicArmed},classSkills,select,assign,castAt,basicAt,basicSkill,useSlot,useBasic:()=>use(true),arm,cancel,cooldownLeft,canCast};
})();
