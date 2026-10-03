(() => {
"use strict";
if(window.MUCombat)return;
const monsters=new Map();
let nextId=1;
function registerMonster(monster){
 const m=Object.assign({id:"mob-"+nextId++,name:"Monster",hp:100,maxHp:100,alive:true,screenX:null,screenY:null,hitRadius:42,defense:0},monster||{});
 m.maxHp=Math.max(1,Number(m.maxHp||m.hp||100));m.hp=Math.max(0,Math.min(m.maxHp,Number(m.hp||m.maxHp)));m.alive=m.hp>0;
 monsters.set(m.id,m);window.dispatchEvent(new CustomEvent("mu-monster-register",{detail:m}));return m;
}
function removeMonster(id){const m=monsters.get(id);if(!m)return false;monsters.delete(id);window.dispatchEvent(new CustomEvent("mu-monster-remove",{detail:m}));return true}
function findScreenTarget(x,y,radius=80){
 let best=null,bd=radius;
 for(const m of monsters.values()){
  if(!m.alive||!Number.isFinite(m.screenX)||!Number.isFinite(m.screenY))continue;
  const d=Math.hypot(x-m.screenX,y-m.screenY);
  if(d<=Math.max(radius,m.hitRadius||0)&&d<bd){best=m;bd=d}
 }
 return best;
}
function damage(id,amount,meta={}){
 const m=monsters.get(id);if(!m||!m.alive)return 0;
 const raw=Math.max(0,Number(amount)||0),dealt=Math.max(1,Math.round(raw-(m.defense||0)*.18));
 m.hp=Math.max(0,m.hp-dealt);m.alive=m.hp>0;
 window.dispatchEvent(new CustomEvent("mu-monster-damage",{detail:{monster:m,damage:dealt,...meta}}));
 if(!m.alive)window.dispatchEvent(new CustomEvent("mu-monster-dead",{detail:{monster:m,...meta}}));
 return dealt;
}
window.addEventListener("mu-skill-hit",e=>{
 const d=e.detail||{};let target=d.targetId?monsters.get(d.targetId):null;
 if(!target&&Number.isFinite(d.screenX)&&Number.isFinite(d.screenY))target=findScreenTarget(d.screenX,d.screenY,d.radius||80);
 if(target)damage(target.id,d.damage||1,{skillId:d.skillId,castId:d.castId});
});
window.MUCombat={monsters,registerMonster,removeMonster,findScreenTarget,damage,clear(){for(const id of [...monsters.keys()])removeMonster(id)}};
})();
