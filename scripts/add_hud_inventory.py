from pathlib import Path

p=Path('index.html')
s=p.read_text(encoding='utf-8')
if 'id="muHud"' in s:
    print('MU HUD already present')
    raise SystemExit(0)

css=r'''
/* Original MU Season 6 bottom HUD / inventory, adapted to landscape mobile. */
#muHud{display:none;position:fixed;z-index:8;left:0;bottom:max(0px,env(safe-area-inset-bottom));width:640px;height:51px;transform-origin:left bottom;pointer-events:none;user-select:none;filter:drop-shadow(0 -2px 6px #000b)}
body.mu-ui-ready #muHud{display:block}
.muHudBase{position:absolute;top:0;height:51px;width:auto;pointer-events:none}
#muHudMenu1{left:0;width:256px}#muHudMenu2{left:256px;width:128px}#muHudMenu3{left:384px;width:256px}
.muGauge{position:absolute;top:3px;height:39px;pointer-events:none}.muGauge img{position:absolute;inset:0;width:100%;height:39px;object-fit:fill}
#muHpGauge{left:158px;width:45px}#muSdGauge{left:204px;width:16px;top:2px}#muAgGauge{left:420px;width:16px;top:2px}#muMpGauge{left:437px;width:45px}
.muHudNum{position:absolute;top:31px;color:#fff;font:700 8px/1 Arial,sans-serif;text-shadow:1px 1px 2px #000;pointer-events:none;text-align:right;white-space:nowrap}
#muHpNum{left:172px;width:31px}#muSdNum{left:205px;width:24px}#muAgNum{left:410px;width:28px}#muMpNum{left:448px;width:34px}
#muExpTrack{position:absolute;left:0;top:42px;width:640px;height:7px;overflow:hidden;pointer-events:none}
#muExpFill{height:2px;margin-top:4px;width:0;background:linear-gradient(90deg,#d49718,#fff2a0);box-shadow:0 0 3px #f0b526}
.muHudBtn{position:absolute;top:0;width:30px;height:41px;padding:0;border:0;background-color:transparent;background-repeat:no-repeat;background-position:center 0;background-size:38px 168px;pointer-events:auto;touch-action:manipulation;outline:none}
.muHudBtn:active{background-position:center -42px}.muHudBtn.active{filter:brightness(1.28)}
#muCashBtn{left:489px}#muCharBtn{left:519px}#muInventoryBtn{left:549px}#muFriendBtn{left:579px}#muMenuBtn{left:609px}
#muHudInfo{display:none;position:fixed;z-index:8;left:50%;bottom:max(54px,calc(env(safe-area-inset-bottom) + 54px));transform:translateX(-50%);padding:2px 8px;color:#ead08a;background:#030303a8;border:1px solid #76633c88;border-radius:4px;font:700 9px/1.25 Arial,sans-serif;text-shadow:1px 1px 2px #000;pointer-events:none;white-space:nowrap}
body.mu-ui-ready #muHudInfo{display:block}
body.mu-ui-ready #joyBase{bottom:max(78px,calc(env(safe-area-inset-bottom) + 78px))}
body.mu-ui-ready #camButtons{bottom:max(78px,calc(env(safe-area-inset-bottom) + 78px))}
body.mu-ui-ready #hint{bottom:max(62px,calc(env(safe-area-inset-bottom) + 62px))}
body.mu-ui-ready #npcAction{bottom:max(104px,calc(env(safe-area-inset-bottom) + 104px))}

#muInventory{display:none;position:fixed;z-index:14;left:0;top:0;width:190px;height:429px;transform-origin:left top;touch-action:manipulation;user-select:none;color:#eee;font-family:Arial,sans-serif;filter:drop-shadow(0 7px 14px #000c)}
#muInventory.open{display:block}
.muInvBg{position:absolute;pointer-events:none;object-fit:fill}
#muInvBackdrop{left:0;top:0;width:190px;height:429px;opacity:.72}
#muInvTop{left:0;top:0;width:190px;height:64px}#muInvLeft{left:0;top:64px;width:21px;height:320px}#muInvRight{left:169px;top:64px;width:21px;height:320px}#muInvBottom{left:0;top:384px;width:190px;height:45px}
#muInvTitle{position:absolute;left:0;top:11px;width:190px;text-align:center;color:#e6d3a1;font:bold 12px Arial;text-shadow:1px 1px 2px #000;pointer-events:none}
.muEquipSlot{position:absolute;object-fit:fill;pointer-events:none;opacity:.94}
#muEqHelper{left:15px;top:44px;width:46px;height:46px}#muEqHelm{left:75px;top:44px;width:46px;height:46px}#muEqWing{left:120px;top:44px;width:61px;height:46px}
#muEqWeaponR{left:15px;top:87px;width:46px;height:66px}#muEqArmor{left:75px;top:87px;width:46px;height:66px}#muEqWeaponL{left:135px;top:87px;width:46px;height:66px}
#muEqGloves{left:15px;top:150px;width:46px;height:46px}#muEqPants{left:75px;top:150px;width:46px;height:46px}#muEqBoots{left:135px;top:150px;width:46px;height:46px}
#muEqAmulet{left:54px;top:87px;width:28px;height:28px}#muEqRingR{left:54px;top:150px;width:28px;height:28px}#muEqRingL{left:114px;top:150px;width:28px;height:28px}
#muInventoryGrid{position:absolute;left:15px;top:200px;width:160px;height:160px;display:grid;grid-template-columns:repeat(8,20px);grid-template-rows:repeat(8,20px);overflow:hidden}
.muInvCell{width:20px;height:20px;background-repeat:no-repeat;background-size:21px 21px;background-position:left top;box-sizing:border-box}
#muInvMoney{left:11px;top:364px;width:170px;height:26px}
#muZen{position:absolute;left:20px;top:371px;width:150px;text-align:right;color:#f1d676;font:bold 10px Arial;text-shadow:1px 1px 2px #000;pointer-events:none}
#muInventoryClose{position:absolute;left:13px;top:391px;width:36px;height:29px;border:0;background-color:transparent;background-repeat:no-repeat;background-position:left top;background-size:36px auto;padding:0;touch-action:manipulation}
#muInventoryClose:active{filter:brightness(1.35)}
#muInvEmptyLabel{position:absolute;left:15px;top:340px;width:160px;text-align:center;color:#8e8369;font:9px Arial;pointer-events:none}
body.mu-inventory-open #camButtons{opacity:.22;pointer-events:none}body.mu-inventory-open #joyBase{opacity:.22;pointer-events:none}
@media (orientation:portrait){#muHud,#muHudInfo,#muInventory{visibility:hidden!important}}
'''
anchor='\n@media (orientation:portrait){#rotate{display:flex}'
if anchor not in s: raise SystemExit('CSS media anchor missing')
s=s.replace(anchor,'\n'+css+anchor,1)

html=r'''
<div id="muHud" aria-label="MU Season 6 HUD">
  <img id="muHudMenu1" class="muHudBase"><img id="muHudMenu2" class="muHudBase"><img id="muHudMenu3" class="muHudBase">
  <div id="muHpGauge" class="muGauge"><img id="muHpImg"></div><div id="muSdGauge" class="muGauge"><img id="muSdImg"></div>
  <div id="muAgGauge" class="muGauge"><img id="muAgImg"></div><div id="muMpGauge" class="muGauge"><img id="muMpImg"></div>
  <div id="muHpNum" class="muHudNum">100</div><div id="muSdNum" class="muHudNum">0</div><div id="muAgNum" class="muHudNum">100</div><div id="muMpNum" class="muHudNum">120</div>
  <div id="muExpTrack"><div id="muExpFill"></div></div>
  <button id="muCashBtn" class="muHudBtn" aria-label="Tienda"></button><button id="muCharBtn" class="muHudBtn" aria-label="Personaje"></button>
  <button id="muInventoryBtn" class="muHudBtn" aria-label="Inventario"></button><button id="muFriendBtn" class="muHudBtn" aria-label="Amigos"></button><button id="muMenuBtn" class="muHudBtn" aria-label="Menú"></button>
</div>
<div id="muHudInfo">Nivel 1 · EXP 0% · 138,124</div>
<div id="muInventory" role="dialog" aria-label="Inventario">
  <img id="muInvBackdrop" class="muInvBg"><img id="muInvTop" class="muInvBg"><img id="muInvLeft" class="muInvBg"><img id="muInvRight" class="muInvBg"><img id="muInvBottom" class="muInvBg">
  <div id="muInvTitle">INVENTARIO</div>
  <img id="muEqHelper" class="muEquipSlot"><img id="muEqHelm" class="muEquipSlot"><img id="muEqWing" class="muEquipSlot">
  <img id="muEqWeaponR" class="muEquipSlot"><img id="muEqArmor" class="muEquipSlot"><img id="muEqWeaponL" class="muEquipSlot">
  <img id="muEqGloves" class="muEquipSlot"><img id="muEqPants" class="muEquipSlot"><img id="muEqBoots" class="muEquipSlot">
  <img id="muEqAmulet" class="muEquipSlot"><img id="muEqRingR" class="muEquipSlot"><img id="muEqRingL" class="muEquipSlot">
  <div id="muInventoryGrid"></div><img id="muInvMoney" class="muInvBg"><div id="muZen">0 Zen</div><div id="muInvEmptyLabel">Inventario vacío</div>
  <button id="muInventoryClose" aria-label="Cerrar inventario"></button>
</div>
'''
anchor='<div id="error"></div><div id="rotate">'
if anchor not in s: raise SystemExit('HTML insert anchor missing')
s=s.replace(anchor,html+'\n'+anchor,1)

old='const npcAction=$("#npcAction"),npcNameplate=$("#npcNameplate"),npcDialog=$("#npcDialog"),npcDialogName=$("#npcDialogName"),npcDialogRole=$("#npcDialogRole"),npcDialogText=$("#npcDialogText"),npcClose=$("#npcClose");'
new=old+'\nconst muHud=$("#muHud"),muHudInfo=$("#muHudInfo"),muInventory=$("#muInventory"),muInventoryBtn=$("#muInventoryBtn"),muInventoryClose=$("#muInventoryClose"),muCharBtn=$("#muCharBtn"),muCashBtn=$("#muCashBtn"),muFriendBtn=$("#muFriendBtn"),muMenuBtn=$("#muMenuBtn"),muHpImg=$("#muHpImg"),muMpImg=$("#muMpImg"),muAgImg=$("#muAgImg"),muSdImg=$("#muSdImg"),muHpNum=$("#muHpNum"),muMpNum=$("#muMpNum"),muAgNum=$("#muAgNum"),muSdNum=$("#muSdNum"),muExpFill=$("#muExpFill"),muZen=$("#muZen");'
if s.count(old)!=1: raise SystemExit('JS DOM anchor mismatch')
s=s.replace(old,new,1)

js=r'''
const UI_DIR="assets/Interface/",uiAssetCache=new Map();
async function uiAssetUrl(name){
 if(uiAssetCache.has(name))return uiAssetCache.get(name);
 const promise=(async()=>{
   const r=await fetch(UI_DIR+name,{cache:"no-store"});if(!r.ok)throw new Error("Interface/"+name+" HTTP "+r.status);
   const b=new Uint8Array(await r.arrayBuffer()),c=name.toLowerCase().endsWith(".ozt")?objectOzt(b):await objectOzj(b);
   return c.toDataURL("image/png");
 })();uiAssetCache.set(name,promise);return promise;
}
async function setUiImage(id,name){const el=$("#"+id);if(el)el.src=await uiAssetUrl(name)}
async function setUiBackground(id,name){const el=$("#"+id);if(el)el.style.backgroundImage='url("'+await uiAssetUrl(name)+'")'}
const playerStats={level:1,life:100,lifeMax:100,mana:120,manaMax:120,ag:100,agMax:100,sd:0,sdMax:0,exp:0,expMax:1000,zen:0};
let inventoryOpen=false,lastMuUiUpdate=0;
function resizeMuInterface(){
 const scale=Math.max(.66,Math.min(1.5,innerWidth/640));
 muHud.style.setProperty("--mu-ui-scale",scale);muHud.style.transform="scale("+scale+")";muHud.style.left=((innerWidth-640*scale)/2)+"px";
 const invScale=Math.max(.60,Math.min(1,(innerHeight-12)/429));
 muInventory.style.transform="scale("+invScale+")";muInventory.style.left=Math.max(4,innerWidth-190*invScale-8)+"px";muInventory.style.top=Math.max(4,(innerHeight-429*invScale)/2)+"px";
}
function stopPlayerUiMovement(){
 joyX=joyY=0;if(joyKnob)joyKnob.style.transform="translate(0px,0px)";
 if(typeof playerScene!=="undefined"&&playerScene)playerScene.moveAmount=0;
}
function setInventoryOpen(v){
 inventoryOpen=!!v;
 if(inventoryOpen){
   if(typeof closeNpcDialog==="function"&&npcDialogOpen)closeNpcDialog();
   stopPlayerUiMovement();muInventory.classList.add("open");muInventoryBtn.classList.add("active");document.body.classList.add("mu-inventory-open");
 }else{
   muInventory.classList.remove("open");muInventoryBtn.classList.remove("active");document.body.classList.remove("mu-inventory-open");
 }
}
function updateMuHudUI(t=0){
 if(t&&t-lastMuUiUpdate<80)return;lastMuUiUpdate=t||performance.now();
 const ratio=(v,m)=>Math.max(0,Math.min(1,m>0?v/m:0));
 const hp=ratio(playerStats.life,playerStats.lifeMax),mp=ratio(playerStats.mana,playerStats.manaMax),ag=ratio(playerStats.ag,playerStats.agMax),sd=ratio(playerStats.sd,playerStats.sdMax);
 muHpImg.style.clipPath="inset("+((1-hp)*100)+"% 0 0 0)";muMpImg.style.clipPath="inset("+((1-mp)*100)+"% 0 0 0)";muAgImg.style.clipPath="inset("+((1-ag)*100)+"% 0 0 0)";muSdImg.style.clipPath="inset("+((1-sd)*100)+"% 0 0 0)";
 muHpNum.textContent=playerStats.life;muMpNum.textContent=playerStats.mana;muAgNum.textContent=playerStats.ag;muSdNum.textContent=playerStats.sd;
 const ep=ratio(playerStats.exp,playerStats.expMax);muExpFill.style.width=(ep*640)+"px";muZen.textContent=playerStats.zen.toLocaleString("es-AR")+" Zen";
 const pos=(typeof playerReady!=="undefined"&&playerReady&&playerScene.tilePos)?Math.floor(playerScene.tilePos[0])+","+Math.floor(playerScene.tilePos[1]):"--,--";
 muHudInfo.textContent="Nivel "+playerStats.level+" · EXP "+Math.floor(ep*100)+"% · "+pos;
}
async function initMuInterface(){
 const imgs={
  muHudMenu1:"newui_menu01.OZJ",muHudMenu2:"newui_menu02.OZJ",muHudMenu3:"partCharge1/newui_menu03.OZJ",
  muHpImg:"newui_menu_red.OZJ",muMpImg:"newui_menu_blue.OZJ",muAgImg:"newui_menu_AG.OZJ",muSdImg:"newui_menu_SD.OZJ",
  muInvBackdrop:"newui_msgbox_back.OZJ",muInvTop:"newui_item_back04.OZT",muInvLeft:"newui_item_back02-L.OZT",muInvRight:"newui_item_back02-R.OZT",muInvBottom:"newui_item_back03.OZT",
  muEqHelper:"newui_item_fairy.OZT",muEqHelm:"newui_item_cap.OZT",muEqWing:"newui_item_wing.OZT",muEqWeaponR:"newui_item_weapon(L).OZT",muEqArmor:"newui_item_upper.OZT",muEqWeaponL:"newui_item_weapon(R).OZT",
  muEqGloves:"newui_item_gloves.OZT",muEqPants:"newui_item_lower.OZT",muEqBoots:"newui_item_boots.OZT",muEqAmulet:"newui_item_necklace.OZT",muEqRingR:"newui_item_ring.OZT",muEqRingL:"newui_item_ring.OZT",muInvMoney:"newui_item_money.OZT"
 };
 await Promise.all(Object.entries(imgs).map(([id,n])=>setUiImage(id,n)));
 await Promise.all([
   setUiBackground("muCashBtn","partCharge1/newui_menu_Bt05.OZJ"),setUiBackground("muCharBtn","partCharge1/newui_menu_Bt01.OZJ"),setUiBackground("muInventoryBtn","partCharge1/newui_menu_Bt02.OZJ"),setUiBackground("muFriendBtn","partCharge1/newui_menu_Bt03.OZJ"),setUiBackground("muMenuBtn","partCharge1/newui_menu_Bt04.OZJ"),setUiBackground("muInventoryClose","newui_exit_00.OZT")
 ]);
 const cellUrl=await uiAssetUrl("newui_item_box.OZT"),grid=$("#muInventoryGrid");
 for(let i=0;i<64;i++){const c=document.createElement("div");c.className="muInvCell";c.style.backgroundImage='url("'+cellUrl+'")';c.dataset.slot=i;grid.appendChild(c)}
 document.body.classList.add("mu-ui-ready");resizeMuInterface();updateMuHudUI();
}
muInventoryBtn.addEventListener("click",e=>{e.preventDefault();e.stopPropagation();setInventoryOpen(!inventoryOpen)});
muInventoryClose.addEventListener("click",e=>{e.preventDefault();e.stopPropagation();setInventoryOpen(false)});
muCharBtn.addEventListener("click",e=>{e.preventDefault();e.stopPropagation();statusEl.textContent="Ventana de personaje · siguiente bloque"});
muCashBtn.addEventListener("click",e=>{e.preventDefault();e.stopPropagation()});muFriendBtn.addEventListener("click",e=>{e.preventDefault();e.stopPropagation()});muMenuBtn.addEventListener("click",e=>{e.preventDefault();e.stopPropagation()});
window.addEventListener("resize",resizeMuInterface,{passive:true});
'''
anchor='\nconst OBJ_VS=`#version 300 es'
if anchor not in s: raise SystemExit('UI JS insert anchor missing')
s=s.replace(anchor,'\n'+js+anchor,1)

# NPC modal and inventory are mutually exclusive.
old='function openNpcDialog(n){\n   if(!n||npcDistance(n)>NPC_INTERACT_RANGE+.8)return;'
new='function openNpcDialog(n){\n   if(!n||npcDistance(n)>NPC_INTERACT_RANGE+.8)return;\n   if(inventoryOpen)setInventoryOpen(false);'
if s.count(old)!=1: raise SystemExit('openNpcDialog anchor mismatch')
s=s.replace(old,new,1)

old='function updatePlayerMovement(dt){\n   if(npcDialogOpen)return;'
new='function updatePlayerMovement(dt){\n   if(npcDialogOpen||inventoryOpen)return;'
if s.count(old)!=1: raise SystemExit('movement anchor mismatch')
s=s.replace(old,new,1)

# Update original HUD values/coordinates from frame loop.
old='currentVP=vp;updateNpcInteractionUI(vp);'
new='currentVP=vp;updateNpcInteractionUI(vp);updateMuHudUI(t);'
if s.count(old)!=1: raise SystemExit('frame UI anchor mismatch')
s=s.replace(old,new,1)

old='window.addEventListener("keydown",e=>{keys.add(e.code);if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Space"].includes(e.code))e.preventDefault()},{passive:false});'
new='window.addEventListener("keydown",e=>{if(e.code==="KeyI"){e.preventDefault();setInventoryOpen(!inventoryOpen);return}if(e.code==="Escape"&&inventoryOpen){e.preventDefault();setInventoryOpen(false);return}keys.add(e.code);if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Space"].includes(e.code))e.preventDefault()},{passive:false});'
if s.count(old)!=1: raise SystemExit('keyboard anchor mismatch')
s=s.replace(old,new,1)

old='requestAnimationFrame(frame);\n}\nmain().catch(fail);'
new='requestAnimationFrame(frame);\n}\ninitMuInterface().catch(e=>console.warn("MU Interface",e));\nmain().catch(fail);'
if s.count(old)!=1: raise SystemExit('init anchor mismatch')
s=s.replace(old,new,1)

p.write_text(s,encoding='utf-8')
print('Original MU HUD + functional empty inventory patched')
