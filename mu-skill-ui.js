(() => {
"use strict";
if(window.MUSkillUI||!window.MUSkillSystem)return;
const css=document.createElement('style');
css.textContent=`
#muCombatControls{position:fixed;z-index:10;right:max(14px,env(safe-area-inset-right));bottom:max(74px,calc(env(safe-area-inset-bottom) + 68px));width:144px;display:grid;grid-template-columns:repeat(2,64px);gap:8px;justify-content:center;user-select:none;touch-action:none}
#muOpenSkills{grid-column:1/-1;height:30px;border:1px solid #96783f;border-radius:5px;background:#12100ce8;color:#efdb9a;font:bold 11px Arial;letter-spacing:1.5px;touch-action:manipulation}
.muActionButton{position:relative;width:64px;height:64px;border:2px solid #876d38;border-radius:50%;background:radial-gradient(circle at 40% 25%,#423820,#0c0b08 70%);box-shadow:inset 0 0 0 3px #0b0907,0 3px 8px #000b;color:#efdda7;touch-action:manipulation;cursor:pointer;padding:0}
.muActionButton.selected{border-color:#e4c578;box-shadow:inset 0 0 10px #b1832344,0 0 9px #bc913744}.muActionButton:active{transform:scale(.95)}
.muSkillIcon{display:block;width:20px;height:28px;background-repeat:no-repeat;background-size:256px 256px;pointer-events:none}
.muActionButton .muSkillIcon{position:absolute;left:20px;top:13px;transform:scale(1.35)}
.muActionKey{position:absolute;right:3px;bottom:1px;min-width:16px;border-radius:9px;background:#080706;border:1px solid #756034;font:bold 10px/16px Arial;pointer-events:none}
.muActionCd{display:none;position:absolute;inset:2px;border-radius:50%;background:#080706bf;color:#fff;text-align:center;font:bold 14px/56px Arial;pointer-events:none}
.muActionButton.low-mana .muSkillIcon{filter:grayscale(.8);opacity:.45}
#muBasicAttack{grid-column:1/-1;justify-self:center;width:76px;height:76px;background:radial-gradient(circle at 40% 25%,#665129,#171107 72%);border-color:#c6a355}
#muBasicAttack svg{width:32px;height:32px;position:absolute;left:20px;top:10px;pointer-events:none}
#muBasicAttack .muBasicLabel{position:absolute;bottom:11px;left:0;right:0;font:bold 9px Arial;letter-spacing:.7px;pointer-events:none}
#muBasicAttack .muActionCd{line-height:68px}
#muSkillsBackdrop{display:none;position:fixed;inset:0;z-index:42;background:#0007;touch-action:none}
#muSkillsBackdrop.open{display:block}
#muSkillWindow{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:min(510px,calc(100vw - 28px));height:min(440px,calc(100dvh - 32px));display:flex;flex-direction:column;background:linear-gradient(135deg,#231d14f9,#0b0b0afc);border:2px solid #9e8146;border-radius:8px;box-shadow:0 10px 50px #000,inset 0 0 0 3px #070706;color:#e9dbb9;font-family:Arial;overflow:hidden;box-sizing:border-box}
#muSkillWindow header{display:flex;align-items:center;justify-content:space-between;padding:3px 6px 3px 16px;border-bottom:1px solid #67542f;background:#09090788;flex-shrink:0}
#muSkillWindow h2{margin:0;font:bold 16px Arial;color:#edd59b;letter-spacing:2px}
#muCloseSkills{width:44px;height:40px;background:transparent;border:0;color:#dcc18a;font-size:28px;cursor:pointer;touch-action:manipulation}
#muSkillAssignHint{font:11px/1.3 Arial;margin:8px 14px 6px;color:#bfae88}
#muAssignSlots{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;padding:0 12px 8px;flex-shrink:0}
.muAssignSlot{position:relative;min-height:50px;padding:6px 3px;border:1px solid #665231;border-radius:4px;background:#090907a8;color:#e0cca0;display:flex;align-items:center;gap:7px;font:10px Arial;text-align:left;touch-action:manipulation;cursor:pointer}
.muAssignSlot .muSkillIcon{flex-shrink:0;margin-left:5px}.muAssignSlot.active{border-color:#f0d28b;background:#4b3a1c99;box-shadow:inset 0 0 8px #d49b1833}
.muAssignSlot b{display:block;color:#fff0c2;font-size:11px;margin-bottom:3px}
#muSkillList{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;overflow:auto;overscroll-behavior:contain;touch-action:pan-y;padding:4px 12px 12px;min-height:0;flex:1;align-content:start}
.muSkillListCell{display:flex;align-items:center;gap:9px;min-height:54px;padding:7px;border:1px solid #51462f;border-radius:4px;background:#0c0c0bd9;color:#eee0bf;text-align:left;font:11px Arial;cursor:pointer;touch-action:manipulation}
.muSkillListCell .muSkillIcon{flex-shrink:0}.muSkillListCell small{display:block;color:#9cabbb;margin-top:4px;font-size:10px}.muSkillListCell.assigned{border-color:#b18c48;background:#332914d9}
#muSkillWindow footer{padding:7px 12px;border-top:1px solid #51462f;font:10px Arial;color:#b1a17e;flex-shrink:0}
#muSkillMessage{display:none;position:fixed;z-index:60;left:50%;bottom:80px;transform:translateX(-50%);max-width:75vw;padding:7px 12px;border:1px solid #8f7541;border-radius:5px;background:#0c0b08eb;color:#eedba3;font:12px Arial;text-align:center;pointer-events:none}
#muSkillMessage.open{display:block}
body.mu-skills-open #joyBase,body.mu-skills-open #muCombatControls{opacity:.2;pointer-events:none}
body.mu-inventory-open #muCombatControls,body.mu-character-open #muCombatControls{opacity:.2;pointer-events:none}
@media(max-height:500px){#muCombatControls{width:128px;grid-template-columns:repeat(2,56px);gap:6px;bottom:max(64px,calc(env(safe-area-inset-bottom) + 60px))}.muActionButton{width:56px;height:56px}.muActionButton .muSkillIcon{left:16px;top:10px;transform:scale(1.2)}.muActionCd{line-height:48px}#muBasicAttack{width:66px;height:66px}#muBasicAttack svg{left:15px;top:7px}#muBasicAttack .muBasicLabel{bottom:7px;font-size:8px}#muBasicAttack .muActionCd{line-height:58px}#muOpenSkills{height:26px;font-size:10px}#muSkillWindow{height:calc(100dvh - 20px)}#muSkillWindow header{padding-top:0;padding-bottom:0}#muCloseSkills{height:34px}#muSkillAssignHint{margin-top:5px}.muAssignSlot{min-height:42px}#muSkillList{grid-template-columns:repeat(4,minmax(0,1fr))}.muSkillListCell{padding:5px;gap:6px;font-size:10px}}
@media(max-width:540px){#muAssignSlots{gap:4px}.muAssignSlot{gap:3px;font-size:9px}#muSkillList{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(orientation:portrait){#muCombatControls,#muSkillsBackdrop,#muSkillMessage{visibility:hidden}}
`;
document.head.appendChild(css);
const controls=document.createElement('div');controls.id='muCombatControls';controls.setAttribute('aria-label','Controles de combate');
controls.innerHTML='<button id="muOpenSkills" type="button" aria-label="Abrir ventana de skills">SKILLS</button>';
document.body.appendChild(controls);
const backdrop=document.createElement('div');backdrop.id='muSkillsBackdrop';
backdrop.innerHTML='<section id="muSkillWindow" role="dialog" aria-modal="true" aria-labelledby="muSkillsTitle"><header><h2 id="muSkillsTitle">SKILLS</h2><button id="muCloseSkills" type="button" aria-label="Cerrar skills">×</button></header><p id="muSkillAssignHint">Elegí un botón y después el poder que querés asignarle.</p><div id="muAssignSlots"></div><div id="muSkillList"></div><footer>Se guarda automáticamente · Teclas 1–4: skills · F: ataque básico</footer></section>';
document.body.appendChild(backdrop);
const message=document.createElement('div');message.id='muSkillMessage';message.setAttribute('role','status');document.body.appendChild(message);
let isOpen=false,assignSlot=0,atlasUrls={},messageTimer=0,previousFocus=null;
const slotButtons=[];
function icon(s){const el=document.createElement('span');el.className='muSkillIcon';const spec=MUGameData.iconSpec(s.id);el.style.backgroundImage='url("'+(atlasUrls[spec.atlas]||'')+'")';el.style.backgroundPosition=(-spec.x)+'px '+(-spec.y)+'px';return el}
for(let i=0;i<4;i++){
 const b=document.createElement('button');b.type='button';b.className='muActionButton';b.dataset.slot=i;b.addEventListener('click',()=>MUSkillSystem.useSlot(i));controls.appendChild(b);slotButtons.push(b);
}
const basic=document.createElement('button');basic.id='muBasicAttack';basic.type='button';basic.className='muActionButton';basic.setAttribute('aria-label','Ataque básico, sin maná');basic.title='Ataque básico · F · Sin maná';
basic.innerHTML='<svg viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M8 24L24 8L26 3L21 5L5 21M5 18L14 27M9 23L3 29" stroke="#f5dea0" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 8L24 24M6 3L11 5L27 21M18 27L27 18M23 23L29 29" stroke="#ab8b4b" stroke-width="2" stroke-linecap="round"/></svg><span class="muBasicLabel">ATAQUE</span><span class="muActionCd"></span>';
basic.addEventListener('click',()=>MUSkillSystem.useBasic());controls.appendChild(basic);
function render(){
 MUSkillSystem.hotkeys.forEach((id,i)=>{
  const s=MUGameData.skills[id],b=slotButtons[i];if(!b||!s)return;
  b.replaceChildren(icon(s));const key=document.createElement('span');key.className='muActionKey';key.textContent=i+1;b.appendChild(key);const cd=document.createElement('span');cd.className='muActionCd';b.appendChild(cd);
  b.dataset.skill=id;b.title=s.name+' · '+s.mana+' MP';b.setAttribute('aria-label','Skill '+(i+1)+': '+s.name);b.classList.toggle('selected',id===MUSkillSystem.selected);
 });
 basic.classList.toggle('selected',MUSkillSystem.basicArmed);
 if(MUSkillSystem.mobileArmed)showMessage(MUSkillSystem.basicArmed?'Tocá un monstruo cercano para atacar.':'Tocá un monstruo o el terreno para lanzar el skill.',0);
 else if(!messageTimer)message.classList.remove('open');
 if(isOpen)renderWindow();
}
function renderWindow(){
 const slots=backdrop.querySelector('#muAssignSlots'),list=backdrop.querySelector('#muSkillList');slots.replaceChildren();list.replaceChildren();
 MUSkillSystem.hotkeys.forEach((id,i)=>{
  const s=MUGameData.skills[id],b=document.createElement('button');b.type='button';b.className='muAssignSlot'+(i===assignSlot?' active':'');b.setAttribute('aria-pressed',String(i===assignSlot));b.setAttribute('aria-label','Asignar botón '+(i+1));b.appendChild(icon(s));const text=document.createElement('span'),n=document.createElement('b');n.textContent='BOTÓN '+(i+1);text.appendChild(n);text.append(s.name);b.appendChild(text);b.onclick=()=>{assignSlot=i;renderWindow()};slots.appendChild(b);
 });
 for(const s of MUSkillSystem.classSkills()){
  const b=document.createElement('button'),assigned=MUSkillSystem.hotkeys.indexOf(s.id);b.type='button';b.className='muSkillListCell'+(assigned>=0?' assigned':'');b.dataset.skill=s.id;b.setAttribute('aria-label','Asignar '+s.name+' al botón '+(assignSlot+1));b.appendChild(icon(s));const text=document.createElement('span');text.textContent=s.name;const mp=document.createElement('small');mp.textContent=s.mana+' MP'+(assigned>=0?' · '+(assigned+1):'');text.appendChild(mp);b.appendChild(text);
  b.onclick=()=>{MUSkillSystem.assign(assignSlot,s.id);backdrop.querySelector('#muSkillAssignHint').textContent=s.name+' asignado al botón '+(assignSlot+1)+'.';backdrop.querySelector('.muAssignSlot.active')?.focus()};list.appendChild(b);
 }
}
function open(){
 if(isOpen)return;previousFocus=document.activeElement;
 if(typeof setInventoryOpen==='function')setInventoryOpen(false);if(typeof setCharacterOpen==='function')setCharacterOpen(false);
 window.dispatchEvent(new Event('mu-ui-window-opening'));window.dispatchEvent(new Event('mu-ui-stop-movement'));MUSkillSystem.cancel();
 isOpen=true;backdrop.classList.add('open');document.body.classList.add('mu-skills-open');renderWindow();backdrop.querySelector('#muCloseSkills').focus();
}
function close(){if(!isOpen)return;isOpen=false;backdrop.classList.remove('open');document.body.classList.remove('mu-skills-open');if(previousFocus?.isConnected)previousFocus.focus()}
function showMessage(text,ms=1600){clearTimeout(messageTimer);messageTimer=0;message.textContent=text;message.classList.add('open');if(ms)messageTimer=setTimeout(()=>{messageTimer=0;message.classList.remove('open')},ms)}
controls.querySelector('#muOpenSkills').onclick=()=>isOpen?close():open();backdrop.querySelector('#muCloseSkills').onclick=close;
backdrop.addEventListener('click',e=>{if(e.target===backdrop)close()});
window.addEventListener('mu-ui-window-opening',close);
window.addEventListener('mu-skill-select',render);window.addEventListener('mu-skill-hotkeys',render);
window.addEventListener('mu-skill-error',e=>showMessage(e.detail.reason));
window.addEventListener('keydown',e=>{
 if(/INPUT|TEXTAREA|SELECT/.test(e.target?.tagName)||e.ctrlKey||e.metaKey||e.altKey)return;
 if(e.code==='KeyK'&&!e.repeat){e.preventDefault();isOpen?close():open()}
 if(e.code==='Escape'){if(isOpen)close();else MUSkillSystem.cancel()}
 if(isOpen&&e.key==='Tab'){const b=[...backdrop.querySelectorAll('button')],i=b.indexOf(document.activeElement);e.preventDefault();b[(i+(e.shiftKey?-1:1)+b.length)%b.length].focus()}
});
function tick(){
 for(const b of [...slotButtons,basic]){
  const id=b===basic?0:Number(b.dataset.skill),cd=b.querySelector('.muActionCd');if(!cd)continue;
  const left=MUSkillSystem.cooldownLeft(id);cd.style.display=left>0?'block':'none';cd.textContent=left>0?(left/1000).toFixed(1):'';
  b.classList.toggle('low-mana',b!==basic&&playerStats.mana<(MUGameData.skills[id]?.mana||0));
 }requestAnimationFrame(tick);
}
window.MUSkillUI={render,open,close,get isOpen(){return isOpen}};
render();requestAnimationFrame(tick);
Promise.all(['newui_skill.OZJ','newui_skill2.OZJ','newui_skill3.OZJ'].map(async name=>{atlasUrls[name]=await uiAssetUrl(name)})).then(render).catch(e=>console.warn('MU skill icons',e));
})();
