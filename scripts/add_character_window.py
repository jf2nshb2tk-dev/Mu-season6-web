from pathlib import Path

p=Path('index.html')
s=p.read_text(encoding='utf-8')
if 'id="muCharacter"' in s:
    print('character window already present')
    raise SystemExit(0)

css=r'''
/* MU Season 6 character window (190x429), matching the original UI frame. */
#muCharacter{display:none;position:fixed;z-index:14;left:0;top:0;width:190px;height:429px;transform-origin:left top;touch-action:manipulation;user-select:none;color:#eee;font-family:Arial,sans-serif;filter:drop-shadow(0 7px 14px #000c)}
#muCharacter.open{display:block}
.muCharBg{position:absolute;pointer-events:none;object-fit:fill}
#muCharBackdrop{left:0;top:0;width:190px;height:429px;opacity:.72}
#muCharTop{left:0;top:0;width:190px;height:64px}#muCharLeft{left:0;top:64px;width:21px;height:320px}#muCharRight{left:169px;top:64px;width:21px;height:320px}#muCharBottom{left:0;top:384px;width:190px;height:45px}
#muCharTitle{position:absolute;left:0;top:9px;width:190px;text-align:center;color:#e6d3a1;font:bold 12px Arial;text-shadow:1px 1px 2px #000;pointer-events:none}
#muCharName{position:absolute;left:18px;top:31px;width:154px;text-align:center;color:#f0d57d;font:bold 11px Arial;text-shadow:1px 1px 2px #000;pointer-events:none}
#muCharClass{position:absolute;left:18px;top:45px;width:154px;text-align:center;color:#bfb69f;font:9px Arial;text-shadow:1px 1px 2px #000;pointer-events:none}
#muCharSummary{position:absolute;left:13px;top:66px;width:164px;height:44px;box-sizing:border-box;padding:5px 8px;background:#0505059c;border:1px solid #5d5136;border-radius:4px;box-shadow:inset 0 0 9px #000;color:#ddd;font:9px/1.45 Arial;pointer-events:none}
#muCharSummary b{color:#ead08a;font-weight:700}#muCharPoints{float:right;color:#e7c86e;font-weight:700}
.muCharStatBox{position:absolute;left:11px;width:170px;height:21px;box-sizing:border-box;background-repeat:no-repeat;background-size:170px 21px;color:#ddd;font:10px/21px Arial;text-shadow:1px 1px 2px #000}
#muCharStrength{top:120px}#muCharAgility{top:175px}#muCharVitality{top:240px}#muCharEnergy{top:295px}
.muCharStatLabel{position:absolute;left:8px;top:0;color:#d7caa8;font-weight:700}.muCharStatValue{position:absolute;right:29px;top:0;color:#fff;font-weight:700;text-align:right;min-width:32px}
.muCharPlus{position:absolute;right:5px;top:2px;width:16px;height:15px;padding:0;border:0;background-color:transparent;background-repeat:no-repeat;background-position:0 0;background-size:16px auto;touch-action:manipulation}
.muCharPlus:active:not(:disabled){filter:brightness(1.35);transform:scale(.94)}.muCharPlus:disabled{opacity:.28;filter:grayscale(1);pointer-events:none}
.muCharDetail{position:absolute;left:18px;width:154px;color:#a9a18e;font:9px/1.35 Arial;text-shadow:1px 1px 2px #000;pointer-events:none}
#muCharStrengthDetail{top:145px}#muCharAgilityDetail{top:200px}#muCharVitalityDetail{top:265px}#muCharEnergyDetail{top:320px}
#muCharCombat{position:absolute;left:15px;top:347px;width:160px;padding-top:5px;border-top:1px solid #5c5035;color:#c8bda3;font:9px/1.45 Arial;pointer-events:none}
#muCharacterClose{position:absolute;left:13px;top:391px;width:36px;height:29px;border:0;background-color:transparent;background-repeat:no-repeat;background-position:left top;background-size:36px auto;padding:0;touch-action:manipulation}
#muCharacterClose:active{filter:brightness(1.35)}
body.mu-character-open #camButtons{opacity:.22;pointer-events:none}body.mu-character-open #joyBase{opacity:.22;pointer-events:none}
'''
anchor='/* PHONE_ONLY_MU_HUD_LAYOUT */'
if s.count(anchor)!=1: raise SystemExit('phone HUD CSS anchor mismatch '+str(s.count(anchor)))
s=s.replace(anchor,css+'\n'+anchor,1)

html=r'''
<div id="muCharacter" role="dialog" aria-label="Personaje">
  <img id="muCharBackdrop" class="muCharBg"><img id="muCharTop" class="muCharBg"><img id="muCharLeft" class="muCharBg"><img id="muCharRight" class="muCharBg"><img id="muCharBottom" class="muCharBg">
  <div id="muCharTitle">PERSONAJE</div><div id="muCharName">DarkWizard</div><div id="muCharClass">Dark Wizard</div>
  <div id="muCharSummary"><span>Nivel <b id="muCharLevel">1</b></span><span id="muCharPoints">Puntos 0</span><br><span>EXP <b id="muCharExp">0 / 1000</b></span></div>
  <div id="muCharStrength" class="muCharStatBox"><span class="muCharStatLabel">Fuerza</span><span id="muCharStrValue" class="muCharStatValue">18</span><button class="muCharPlus" data-stat="strength" aria-label="Subir fuerza"></button></div>
  <div id="muCharStrengthDetail" class="muCharDetail">Daño físico 2 ~ 4</div>
  <div id="muCharAgility" class="muCharStatBox"><span class="muCharStatLabel">Agilidad</span><span id="muCharAgiValue" class="muCharStatValue">18</span><button class="muCharPlus" data-stat="dexterity" aria-label="Subir agilidad"></button></div>
  <div id="muCharAgilityDetail" class="muCharDetail">Defensa 6 · Tasa 6 · Velocidad 1</div>
  <div id="muCharVitality" class="muCharStatBox"><span class="muCharStatLabel">Vitalidad</span><span id="muCharVitValue" class="muCharStatValue">15</span><button class="muCharPlus" data-stat="vitality" aria-label="Subir vitalidad"></button></div>
  <div id="muCharVitalityDetail" class="muCharDetail">Vida 100</div>
  <div id="muCharEnergy" class="muCharStatBox"><span class="muCharStatLabel">Energía</span><span id="muCharEneValue" class="muCharStatValue">30</span><button class="muCharPlus" data-stat="energy" aria-label="Subir energía"></button></div>
  <div id="muCharEnergyDetail" class="muCharDetail">Daño mágico 3 ~ 7 · Mana 120</div>
  <div id="muCharCombat">Ataque: <span id="muCharAttack">2 ~ 4</span><br>Defensa: <span id="muCharDefense">6</span> · Velocidad: <span id="muCharSpeed">1</span></div>
  <button id="muCharacterClose" aria-label="Cerrar personaje"></button>
</div>
'''
anchor='<div id="error"></div><div id="rotate">'
if s.count(anchor)!=1: raise SystemExit('character HTML anchor mismatch '+str(s.count(anchor)))
s=s.replace(anchor,html+'\n'+anchor,1)

old='muExpFill=$("#muExpFill"),muZen=$("#muZen");'
new='muExpFill=$("#muExpFill"),muZen=$("#muZen"),muCharacter=$("#muCharacter"),muCharacterClose=$("#muCharacterClose");'
if s.count(old)!=1: raise SystemExit('DOM refs mismatch '+str(s.count(old)))
s=s.replace(old,new,1)

old='const playerStats={level:1,life:100,lifeMax:100,mana:120,manaMax:120,ag:100,agMax:100,sd:0,sdMax:0,exp:0,expMax:1000,zen:0};\nlet inventoryOpen=false,lastMuUiUpdate=0;'
new='const playerStats={name:"DarkWizard",className:"Dark Wizard",level:1,life:100,lifeMax:100,mana:120,manaMax:120,ag:100,agMax:100,sd:0,sdMax:0,exp:0,expMax:1000,zen:0,statPoints:0,strength:18,dexterity:18,vitality:15,energy:30};\nlet inventoryOpen=false,characterOpen=false,lastMuUiUpdate=0;'
if s.count(old)!=1: raise SystemExit('playerStats state mismatch '+str(s.count(old)))
s=s.replace(old,new,1)

old='muInventory.style.transform="scale("+invScale+")";muInventory.style.left=Math.max(4,innerWidth-190*invScale-8)+"px";muInventory.style.top=Math.max(4,(innerHeight-429*invScale)/2)+"px";'
new=old+'\n const charScale=Math.max(.60,Math.min(1,(innerHeight-12)/429));\n muCharacter.style.transform="scale("+charScale+")";muCharacter.style.left=Math.max(4,8)+"px";muCharacter.style.top=Math.max(4,(innerHeight-429*charScale)/2)+"px";'
if s.count(old)!=1: raise SystemExit('resize inventory anchor mismatch '+str(s.count(old)))
s=s.replace(old,new,1)

old=''' if(inventoryOpen){
   window.dispatchEvent(new Event("mu-ui-window-opening"));
   stopPlayerUiMovement();muInventory.classList.add("open");muInventoryBtn.classList.add("active");document.body.classList.add("mu-inventory-open");'''
new=''' if(inventoryOpen){
   if(characterOpen)setCharacterOpen(false);
   window.dispatchEvent(new Event("mu-ui-window-opening"));
   stopPlayerUiMovement();muInventory.classList.add("open");muInventoryBtn.classList.add("active");document.body.classList.add("mu-inventory-open");'''
if s.count(old)!=1: raise SystemExit('inventory opening anchor mismatch '+str(s.count(old)))
s=s.replace(old,new,1)

anchor='''}
function updateMuHudUI(t=0,tilePos=null){'''
block=r'''}
function updateMuCharacterUI(){
 const str=playerStats.strength,agi=playerStats.dexterity,vit=playerStats.vitality,ene=playerStats.energy;
 const dmgMin=Math.floor(str/8),dmgMax=Math.floor(str/4),magicMin=Math.floor(ene/9),magicMax=Math.floor(ene/4),def=Math.floor(agi/3),rate=Math.floor(agi/3),speed=Math.floor(agi/15);
 $("#muCharName").textContent=playerStats.name;$("#muCharClass").textContent=playerStats.className;$("#muCharLevel").textContent=playerStats.level;$("#muCharPoints").textContent="Puntos "+playerStats.statPoints;$("#muCharExp").textContent=playerStats.exp+" / "+playerStats.expMax;
 $("#muCharStrValue").textContent=str;$("#muCharAgiValue").textContent=agi;$("#muCharVitValue").textContent=vit;$("#muCharEneValue").textContent=ene;
 $("#muCharStrengthDetail").textContent="Daño físico "+dmgMin+" ~ "+dmgMax;
 $("#muCharAgilityDetail").textContent="Defensa "+def+" · Tasa "+rate+" · Velocidad "+speed;
 $("#muCharVitalityDetail").textContent="Vida "+playerStats.lifeMax;
 $("#muCharEnergyDetail").textContent="Daño mágico "+magicMin+" ~ "+magicMax+" · Mana "+playerStats.manaMax;
 $("#muCharAttack").textContent=dmgMin+" ~ "+dmgMax;$("#muCharDefense").textContent=def;$("#muCharSpeed").textContent=speed;
 for(const b of document.querySelectorAll(".muCharPlus"))b.disabled=playerStats.statPoints<=0;
}
function spendCharacterPoint(stat){
 if(playerStats.statPoints<=0||!(stat in playerStats))return;
 playerStats[stat]++;playerStats.statPoints--;
 if(stat==="vitality"){playerStats.lifeMax+=2;playerStats.life=playerStats.lifeMax}
 if(stat==="energy"){playerStats.manaMax+=2;playerStats.mana=playerStats.manaMax}
 updateMuCharacterUI();updateMuHudUI(0,typeof playerScene!=="undefined"&&playerScene?playerScene.tilePos:null);
}
function setCharacterOpen(v){
 characterOpen=!!v;
 if(characterOpen){
   if(inventoryOpen)setInventoryOpen(false);
   window.dispatchEvent(new Event("mu-ui-window-opening"));stopPlayerUiMovement();updateMuCharacterUI();
   muCharacter.classList.add("open");muCharBtn.classList.add("active");document.body.classList.add("mu-character-open");
 }else{
   muCharacter.classList.remove("open");muCharBtn.classList.remove("active");document.body.classList.remove("mu-character-open");
 }
}
function updateMuHudUI(t=0,tilePos=null){'''
if s.count(anchor)!=1: raise SystemExit('character function anchor mismatch '+str(s.count(anchor)))
s=s.replace(anchor,block,1)

old='muHudInfo.textContent="Nivel "+playerStats.level+" · EXP "+Math.floor(ep*100)+"% · "+pos;'
new=old+'\n if(characterOpen)updateMuCharacterUI();'
if s.count(old)!=1: raise SystemExit('HUD char refresh anchor mismatch '+str(s.count(old)))
s=s.replace(old,new,1)

old='''  muInvBackdrop:"newui_msgbox_back.OZJ",muInvTop:"newui_item_back04.OZT",muInvLeft:"newui_item_back02-L.OZT",muInvRight:"newui_item_back02-R.OZT",muInvBottom:"newui_item_back03.OZT",'''
new=old+'''\n  muCharBackdrop:"newui_msgbox_back.OZJ",muCharTop:"newui_item_back04.OZT",muCharLeft:"newui_item_back02-L.OZT",muCharRight:"newui_item_back02-R.OZT",muCharBottom:"newui_item_back03.OZT",'''
if s.count(old)!=1: raise SystemExit('character image map anchor mismatch '+str(s.count(old)))
s=s.replace(old,new,1)

old='setUiBackground("muInventoryClose","newui_exit_00.OZT")'
new=old+',\n setUiBackground("muCharacterClose","newui_exit_00.OZT")'
if s.count(old)!=1: raise SystemExit('character close asset anchor mismatch '+str(s.count(old)))
s=s.replace(old,new,1)

old=''' ]);
 const grid=$("#muInventoryGrid");'''
new=''' ]);
 const charTextbox=await uiAssetUrl("newui_cha_textbox02.OZT"),charPlus=await uiAssetUrl("newui_chainfo_btn_level.OZT");
 for(const el of document.querySelectorAll(".muCharStatBox"))el.style.backgroundImage='url("'+charTextbox+'")';
 for(const el of document.querySelectorAll(".muCharPlus"))el.style.backgroundImage='url("'+charPlus+'")';
 const grid=$("#muInventoryGrid");'''
if s.count(old)!=1: raise SystemExit('character original asset injection mismatch '+str(s.count(old)))
s=s.replace(old,new,1)

old='muCharBtn.addEventListener("click",e=>{e.preventDefault();e.stopPropagation();statusEl.textContent="Ventana de personaje · siguiente bloque"});'
new='muCharBtn.addEventListener("click",e=>{e.preventDefault();e.stopPropagation();setCharacterOpen(!characterOpen)});\n muCharacterClose.addEventListener("click",e=>{e.preventDefault();e.stopPropagation();setCharacterOpen(false)});\n for(const b of document.querySelectorAll(".muCharPlus"))b.addEventListener("click",e=>{e.preventDefault();e.stopPropagation();spendCharacterPoint(b.dataset.stat)});'
if s.count(old)!=1: raise SystemExit('char button listener mismatch '+str(s.count(old)))
s=s.replace(old,new,1)

old='if(inventoryOpen)setInventoryOpen(false);'
new=old+'\n if(characterOpen)setCharacterOpen(false);'
# only first occurrence should be openNpcDialog; setCharacterOpen contains same text later, so target context instead
ctx='''function openNpcDialog(n){
 if(!n||npcDistance(n)>NPC_INTERACT_RANGE+.8)return;
 if(inventoryOpen)setInventoryOpen(false);'''
ctxnew=ctx+'\n if(characterOpen)setCharacterOpen(false);'
if s.count(ctx)!=1: raise SystemExit('NPC open window anchor mismatch '+str(s.count(ctx)))
s=s.replace(ctx,ctxnew,1)

old='if(npcDialogOpen||inventoryOpen){if(playerScene)playerScene.moveAmount=0;return;}'
new='if(npcDialogOpen||inventoryOpen||characterOpen){if(playerScene)playerScene.moveAmount=0;return;}'
if s.count(old)!=1: raise SystemExit('movement block mismatch '+str(s.count(old)))
s=s.replace(old,new,1)

old='canvas.addEventListener("pointerdown",e=>{\n   if(npcDialogOpen)return;'
new='canvas.addEventListener("pointerdown",e=>{\n   if(npcDialogOpen||inventoryOpen||characterOpen)return;'
if s.count(old)!=1: raise SystemExit('canvas pointer block mismatch '+str(s.count(old)))
s=s.replace(old,new,1)

old='''window.addEventListener("keydown",e=>{
 if(e.code==="KeyI"){e.preventDefault();setInventoryOpen(!inventoryOpen);return}
 if(e.code==="Escape"&&inventoryOpen){e.preventDefault();setInventoryOpen(false);return}
 keys.add(e.code);'''
new='''window.addEventListener("keydown",e=>{
 if(e.code==="KeyI"){e.preventDefault();setInventoryOpen(!inventoryOpen);return}
 if(e.code==="KeyC"){e.preventDefault();setCharacterOpen(!characterOpen);return}
 if(e.code==="Escape"&&(inventoryOpen||characterOpen)){e.preventDefault();if(inventoryOpen)setInventoryOpen(false);if(characterOpen)setCharacterOpen(false);return}
 keys.add(e.code);'''
if s.count(old)!=1: raise SystemExit('keyboard window anchor mismatch '+str(s.count(old)))
s=s.replace(old,new,1)

# Hide NPC interaction affordances while a UI window is open.
old='if(npcDialogOpen){npcAction.style.display="none";npcNameplate.style.display="none";return;}'
new='if(npcDialogOpen||inventoryOpen||characterOpen){npcAction.style.display="none";npcNameplate.style.display="none";return;}'
if old in s:s=s.replace(old,new,1)

old='@media (orientation:portrait){#muHud,#muHudInfo,#muInventory{visibility:hidden!important}}'
new='@media (orientation:portrait){#muHud,#muHudInfo,#muInventory,#muCharacter{visibility:hidden!important}}'
if s.count(old)!=1: raise SystemExit('portrait UI anchor mismatch '+str(s.count(old)))
s=s.replace(old,new,1)

p.write_text(s,encoding='utf-8')
print('Season 6 character window patched')
