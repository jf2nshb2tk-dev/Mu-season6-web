from pathlib import Path
p=Path('index.html')
s=p.read_text(encoding='utf-8')

old='''function stopPlayerUiMovement(){
 joyX=joyY=0;if(joyKnob)joyKnob.style.transform="translate(0px,0px)";
 if(typeof playerScene!=="undefined"&&playerScene)playerScene.moveAmount=0;
}'''
new='''function stopPlayerUiMovement(){
 if(joyKnob)joyKnob.style.transform="translate(0px,0px)";
 window.dispatchEvent(new Event("mu-ui-stop-movement"));
}'''
if s.count(old)!=1: raise SystemExit('stopPlayerUiMovement mismatch '+str(s.count(old)))
s=s.replace(old,new,1)

old=''' if(inventoryOpen){
   if(typeof closeNpcDialog==="function"&&npcDialogOpen)closeNpcDialog();
   stopPlayerUiMovement();muInventory.classList.add("open");muInventoryBtn.classList.add("active");document.body.classList.add("mu-inventory-open");'''
new=''' if(inventoryOpen){
   window.dispatchEvent(new Event("mu-ui-window-opening"));
   stopPlayerUiMovement();muInventory.classList.add("open");muInventoryBtn.classList.add("active");document.body.classList.add("mu-inventory-open");'''
if s.count(old)!=1: raise SystemExit('inventory open mismatch '+str(s.count(old)))
s=s.replace(old,new,1)

s=s.replace('function updateMuHudUI(t=0){','function updateMuHudUI(t=0,tilePos=null){',1)
old=''' const pos=(typeof playerReady!=="undefined"&&playerReady&&playerScene.tilePos)?Math.floor(playerScene.tilePos[0])+","+Math.floor(playerScene.tilePos[1]):"--,--";'''
new=''' const pos=tilePos?Math.floor(tilePos[0])+","+Math.floor(tilePos[1]):"--,--";'''
if s.count(old)!=1: raise SystemExit('HUD position mismatch '+str(s.count(old)))
s=s.replace(old,new,1)

old=''' npcAction.addEventListener("click",e=>{e.stopPropagation();if(nearbyNpc)openNpcDialog(nearbyNpc)});
 npcClose.addEventListener("click",e=>{e.stopPropagation();closeNpcDialog()});'''
new=''' npcAction.addEventListener("click",e=>{e.stopPropagation();if(nearbyNpc)openNpcDialog(nearbyNpc)});
 npcClose.addEventListener("click",e=>{e.stopPropagation();closeNpcDialog()});
 window.addEventListener("mu-ui-window-opening",()=>{if(npcDialogOpen)closeNpcDialog()});
 window.addEventListener("mu-ui-stop-movement",()=>{joyX=joyY=0;joyPointer=-1;if(playerScene)playerScene.moveAmount=0;joyKnob.style.transform="translate(0px,0px)"});'''
if s.count(old)!=1: raise SystemExit('NPC listener mismatch '+str(s.count(old)))
s=s.replace(old,new,1)

old='''function updatePlayerMovement(dt){
   if(npcDialogOpen||inventoryOpen)return;'''
new='''function updatePlayerMovement(dt){
   if(npcDialogOpen||inventoryOpen){if(playerScene)playerScene.moveAmount=0;return;}'''
if s.count(old)!=1: raise SystemExit('movement mismatch '+str(s.count(old)))
s=s.replace(old,new,1)

old='currentVP=vp;updateNpcInteractionUI(vp);updateMuHudUI(t);'
new='currentVP=vp;updateNpcInteractionUI(vp);updateMuHudUI(t,playerReady?playerScene.tilePos:null);'
if s.count(old)!=1: raise SystemExit('frame HUD mismatch '+str(s.count(old)))
s=s.replace(old,new,1)

p.write_text(s,encoding='utf-8')
print('HUD/inventory state integration fixed')
