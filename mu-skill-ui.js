(() => {
"use strict";
if(window.MUSkillUI||!window.MUSkillSystem)return;
const hud=document.querySelector("#muHud");if(!hud)return;
const css=document.createElement("style");
css.textContent=`
#muSkillHotkeys{position:absolute;left:222px;top:0;width:160px;height:38px;display:flex;z-index:5;pointer-events:auto}
.muSkillSlot,#muCurrentSkill,.muSkillListCell{position:relative;width:32px;height:38px;box-sizing:border-box;border:0;padding:0;background:transparent center/32px 38px no-repeat;touch-action:manipulation}
.muSkillIcon{position:absolute;left:6px;top:5px;width:20px;height:28px;background-repeat:no-repeat;background-size:256px 256px;image-rendering:auto;pointer-events:none}
.muSkillKey{position:absolute;right:2px;bottom:1px;color:#f5e6ad;font:bold 8px Arial;text-shadow:1px 1px 2px #000;z-index:2;pointer-events:none}
.muSkillCd{display:none;position:absolute;inset:3px;background:#0009;color:#fff;font:bold 9px/32px Arial;text-align:center;z-index:3;pointer-events:none}
.muSkillSlot.selected .muSkillIcon,#muCurrentSkill.selected .muSkillIcon{filter:brightness(1.32)}
#muCurrentSkill{position:absolute;left:384px;top:0;z-index:5;pointer-events:auto}
#muSkillList{display:none;position:absolute;left:214px;bottom:45px;width:224px;padding:4px;z-index:7;grid-template-columns:repeat(7,32px);gap:0;background:#050504cc;border:1px solid #776239;box-shadow:0 5px 18px #000;pointer-events:auto}
#muSkillList.open{display:grid}.muSkillListCell{width:32px;height:38px}
#muSkillTooltip{display:none;position:fixed;z-index:60;pointer-events:none;background:#030303e8;border:1px solid #6d5b36;color:#e9d89f;padding:4px 7px;border-radius:3px;font:10px Arial;text-shadow:1px 1px 2px #000;white-space:nowrap}
#muSkillTooltip.open{display:block}
#muSkillCastHint{display:none;position:fixed;z-index:12;left:50%;transform:translateX(-50%);bottom:calc(52px * var(--mu-ui-scale,1) + 8px);padding:3px 7px;background:#030303c9;border:1px solid #7d6633;color:#f0dc94;font:bold 9px Arial;pointer-events:none}
#muSkillCastHint.open{display:block}
`;
document.head.appendChild(css);
const hk=document.createElement("div");hk.id="muSkillHotkeys";hud.appendChild(hk);
const current=document.createElement("button");current.id="muCurrentSkill";current.type="button";hud.appendChild(current);
const list=document.createElement("div");list.id="muSkillList";hud.appendChild(list);
const tip=document.createElement("div");tip.id="muSkillTooltip";document.body.appendChild(tip);
const hint=document.createElement("div");hint.id="muSkillCastHint";hint.textContent="Tocá el terreno para usar el skill";document.body.appendChild(hint);
let boxUrl="",boxUseUrl="",atlasUrls={};

function iconEl(skill){
 const spec=MUGameData.iconSpec(skill.id),i=document.createElement("span");i.className="muSkillIcon";
 i.style.backgroundImage='url("'+(atlasUrls[spec.atlas]||"")+'")';
 i.style.backgroundPosition=(-spec.x)+"px "+(-spec.y)+"px";return i;
}
function decorate(btn,skill,key,use=false){
 btn.innerHTML="";btn.style.backgroundImage='url("'+(use?boxUseUrl:boxUrl)+'")';
 if(!skill)return;btn.dataset.skill=skill.id;btn.appendChild(iconEl(skill));
 if(key){const k=document.createElement("span");k.className="muSkillKey";k.textContent=key;btn.appendChild(k)}
 const cd=document.createElement("span");cd.className="muSkillCd";btn.appendChild(cd);
 btn.onpointerenter=e=>showTip(skill,e.clientX,e.clientY);btn.onpointerleave=hideTip;
}
function showTip(s,x,y){tip.textContent=s.name+" · "+s.mana+" MP";tip.style.left=Math.min(innerWidth-150,x+8)+"px";tip.style.top=Math.max(4,y-28)+"px";tip.classList.add("open")}
function hideTip(){tip.classList.remove("open")}
function render(){
 const hot=MUSkillSystem.hotkeys,sel=MUSkillSystem.selected;hk.innerHTML="";
 hot.forEach((id,n)=>{const b=document.createElement("button");b.type="button";b.className="muSkillSlot"+(id===sel?" selected":"");decorate(b,MUGameData.skills[id],String(n+1),id===sel);
   b.addEventListener("click",e=>{e.stopPropagation();MUSkillSystem.select(id,e.pointerType==="touch"||matchMedia("(pointer:coarse)").matches);render()});hk.appendChild(b)});
 decorate(current,MUSkillSystem.selectedSkill,"",true);current.classList.toggle("selected",true);
 hint.classList.toggle("open",MUSkillSystem.mobileArmed);
}
function renderList(){
 list.innerHTML="";for(const s of MUSkillSystem.classSkills()){
  const b=document.createElement("button");b.type="button";b.className="muSkillListCell";decorate(b,s,"",s.id===MUSkillSystem.selected);
  b.addEventListener("click",e=>{e.stopPropagation();MUSkillSystem.select(s.id,e.pointerType==="touch"||matchMedia("(pointer:coarse)").matches);list.classList.remove("open");render()});list.appendChild(b)
 }
}
current.addEventListener("click",e=>{e.stopPropagation();renderList();list.classList.toggle("open")});
document.addEventListener("pointerdown",e=>{if(!list.contains(e.target)&&e.target!==current)list.classList.remove("open")});
window.addEventListener("mu-skill-select",render);window.addEventListener("mu-skill-hotkeys",render);
window.addEventListener("mu-skill-error",e=>{const r=e.detail?.reason;if(!r)return;tip.textContent=r;tip.style.left="50%";tip.style.top="55%";tip.style.transform="translate(-50%,-50%)";tip.classList.add("open");setTimeout(()=>{hideTip();tip.style.transform=""},700)});
function tick(){
 for(const b of [...hk.querySelectorAll(".muSkillSlot"),current]){
   const id=Number(b.dataset.skill),s=MUGameData.skills[id],cd=b.querySelector(".muSkillCd");if(!s||!cd)continue;
   const left=MUSkillSystem.cooldownLeft(id);if(left>0){cd.style.display="block";cd.textContent=(left/1000).toFixed(1)}else cd.style.display="none";
 }requestAnimationFrame(tick)
}
Promise.all([
 uiAssetUrl("newui_skillbox.OZJ"),uiAssetUrl("newui_skillbox2.OZJ"),
 uiAssetUrl("newui_skill.OZJ"),uiAssetUrl("newui_skill2.OZJ"),uiAssetUrl("newui_skill3.OZJ")
]).then(([a,b,c,d,e])=>{boxUrl=a;boxUseUrl=b;atlasUrls={"newui_skill.OZJ":c,"newui_skill2.OZJ":d,"newui_skill3.OZJ":e};render();renderList()}).catch(e=>console.warn("MU skill UI",e));
requestAnimationFrame(tick);
window.MUSkillUI={render,open(){renderList();list.classList.add("open")},close(){list.classList.remove("open")}};
})();
