from pathlib import Path

p=Path('index.html')
s=p.read_text(encoding='utf-8')

if 'const NPC_INTERACT_RANGE=' in s:
    print('NPC interaction already present')
    raise SystemExit(0)

# CSS
anchor='#rotate{display:none;position:fixed;inset:0;z-index:20;background:#050505;color:#e2c577;align-items:center;justify-content:center;text-align:center;padding:28px;font-size:20px;font-weight:700}'
css=anchor+'''\n#npcAction{display:none;position:fixed;z-index:9;left:50%;transform:translateX(-50%);bottom:max(52px,calc(env(safe-area-inset-bottom) + 44px));min-width:170px;height:42px;padding:0 16px;border:1px solid #d0b76f;background:#0b0906e8;color:#efd98e;border-radius:10px;font-weight:900;font-size:13px;box-shadow:0 3px 16px #000b;touch-action:manipulation}\n#npcAction:active{transform:translateX(-50%) scale(.97);background:#332b18}\n#npcNameplate{display:none;position:fixed;z-index:8;transform:translate(-50%,-115%);padding:4px 8px;background:#050505d9;border:1px solid #9c844a;border-radius:6px;color:#f2df9f;font-size:11px;font-weight:800;pointer-events:none;white-space:nowrap;box-shadow:0 2px 9px #000b}\n#npcDialog{display:none;position:fixed;z-index:15;left:50%;top:50%;transform:translate(-50%,-50%);width:min(360px,72vw);background:linear-gradient(#15120df5,#050505f7);border:1px solid #c6a85b;border-radius:12px;padding:16px 17px 14px;box-shadow:0 12px 44px #000;touch-action:manipulation}\n#npcDialog.open{display:block}\n#npcDialogName{color:#f0d57d;font-size:18px;font-weight:900;margin-bottom:3px}\n#npcDialogRole{color:#c9b98b;font-size:12px;margin-bottom:12px}\n#npcDialogText{color:#eee;font-size:13px;line-height:1.45;min-height:38px}\n#npcDialogActions{display:flex;justify-content:flex-end;margin-top:14px}\n#npcClose{height:36px;min-width:90px;border:1px solid #a88c4d;background:#0d0b08;color:#ead28a;border-radius:8px;font-weight:800}\n#npcClose:active{background:#332b18}\n'''
if anchor not in s: raise SystemExit('CSS anchor not found')
s=s.replace(anchor,css,1)
s=s.replace('@media (orientation:portrait){#rotate{display:flex}#gl,#hud,#hint,#joyBase,#camButtons{visibility:hidden}}','@media (orientation:portrait){#rotate{display:flex}#gl,#hud,#hint,#joyBase,#camButtons,#npcAction,#npcNameplate,#npcDialog{visibility:hidden}}',1)

# HTML
anchor='''</div>\n<div id="error"></div><div id="rotate">Gir&aacute; el iPhone<br>MU Season 6 Web se juega en horizontal</div>'''
html='''</div>\n<button id="npcAction">HABLAR</button>\n<div id="npcNameplate"></div>\n<div id="npcDialog">\n  <div id="npcDialogName"></div>\n  <div id="npcDialogRole"></div>\n  <div id="npcDialogText"></div>\n  <div id="npcDialogActions"><button id="npcClose">CERRAR</button></div>\n</div>\n<div id="error"></div><div id="rotate">Gir&aacute; el iPhone<br>MU Season 6 Web se juega en horizontal</div>'''
if anchor not in s: raise SystemExit('HTML anchor not found')
s=s.replace(anchor,html,1)

# DOM refs
anchor='const joyBase=$("#joyBase"),joyKnob=$("#joyKnob"),camUp=$("#camUp"),camDown=$("#camDown"),camHome=$("#camHome"),controlMode=$("#controlMode"),camSpeed=$("#camSpeed");'
new=anchor+'\nconst npcAction=$("#npcAction"),npcNameplate=$("#npcNameplate"),npcDialog=$("#npcDialog"),npcDialogName=$("#npcDialogName"),npcDialogRole=$("#npcDialogRole"),npcDialogText=$("#npcDialogText"),npcClose=$("#npcClose");'
if anchor not in s: raise SystemExit('DOM refs anchor not found')
s=s.replace(anchor,new,1)

# Store exact NPC ground Z for projection/touch targeting.
anchor='''   const z=(height.data[ty*256+tx]||0)*1.5+2;\n   const q=npcDirectionQuat(spec.dir),scale=spec.scale||1,idata=new Float32Array([spec.x*100,spec.y*100,z,scale,q[0],q[1],q[2],q[3]]);'''
new='''   const z=(height.data[ty*256+tx]||0)*1.5+2;\n   spec.z=z;\n   const q=npcDirectionQuat(spec.dir),scale=spec.scale||1,idata=new Float32Array([spec.x*100,spec.y*100,z,scale,q[0],q[1],q[2],q[3]]);'''
if anchor not in s: raise SystemExit('NPC Z anchor not found')
s=s.replace(anchor,new,1)

# State + interaction helpers after ATT constants.
anchor='const ATT_SAFE=0x01,ATT_NOMOVE=0x04,ATT_NOGROUND=0x08;'
helpers=anchor+r'''
 const NPC_INTERACT_RANGE=4.2;
 let nearbyNpc=null,selectedNpc=null,npcDialogOpen=false,currentVP=null;
 function npcShortName(n){return (n?.name||"NPC").split(" the ")[0]}
 function npcRole(n){
   if(!n)return"";
   if(n.id===251)return"Herrero de Lorencia";
   if(n.id===254)return"Mago de Lorencia";
   if(n.id===253)return"Vendedora de pociones";
   if(n.id===255)return"Tabernera de Lorencia";
   return"Habitante de Lorencia";
 }
 function npcSpeech(n){
   if(!n)return"";
   if(n.id===251)return"Puedo ayudarte con armas, armaduras y equipo.";
   if(n.id===254)return"Aquí encontrarás artículos para magos y aventureros.";
   if(n.id===253)return"Tengo pociones y suministros para tu viaje.";
   if(n.id===255)return"Bienvenido a la taberna de Lorencia.";
   return"Hola, aventurero.";
 }
 function npcDistance(n){
   if(!playerReady||!playerScene.tilePos)return 999;
   return Math.hypot(playerScene.tilePos[0]-n.x,playerScene.tilePos[1]-n.y);
 }
 function nearestInteractNpc(){
   if(!npcsReady||!npcScene.npcs?.length)return null;
   let best=null,bd=NPC_INTERACT_RANGE;
   for(const n of npcScene.npcs){const d=npcDistance(n);if(d<bd){bd=d;best=n}}
   return best;
 }
 function projectNpc(n,vp){
   if(!vp||!n||n.z==null)return null;
   const wx=(n.x*100-MU_CENTER)*MU_SF,wy=n.z*MU_SF+2.05,wz=(n.y*100-MU_CENTER)*MU_SF;
   const cx=vp[0]*wx+vp[4]*wy+vp[8]*wz+vp[12];
   const cy=vp[1]*wx+vp[5]*wy+vp[9]*wz+vp[13];
   const cw=vp[3]*wx+vp[7]*wy+vp[11]*wz+vp[15];
   if(cw<=.02)return null;
   const nx=cx/cw,ny=cy/cw;
   if(nx<-1.25||nx>1.25||ny<-1.25||ny>1.25)return null;
   return{x:(nx*.5+.5)*innerWidth,y:(1-(ny*.5+.5))*innerHeight};
 }
 function openNpcDialog(n){
   if(!n||npcDistance(n)>NPC_INTERACT_RANGE+.8)return;
   selectedNpc=n;npcDialogOpen=true;nearbyNpc=n;
   joyX=joyY=0;joyKnob.style.transform="translate(0px,0px)";
   if(playerScene)playerScene.moveAmount=0;
   npcDialogName.textContent=npcShortName(n);
   npcDialogRole.textContent=npcRole(n);
   npcDialogText.textContent=npcSpeech(n);
   npcDialog.classList.add("open");npcAction.style.display="none";npcNameplate.style.display="none";
 }
 function closeNpcDialog(){
   npcDialogOpen=false;selectedNpc=null;npcDialog.classList.remove("open");
 }
 function updateNpcInteractionUI(vp){
   if(npcDialogOpen){npcAction.style.display="none";npcNameplate.style.display="none";return}
   nearbyNpc=nearestInteractNpc();
   if(!nearbyNpc){npcAction.style.display="none";npcNameplate.style.display="none";return}
   const nm=npcShortName(nearbyNpc);
   npcAction.textContent="HABLAR · "+nm;npcAction.style.display="block";
   const p=projectNpc(nearbyNpc,vp);
   if(p){npcNameplate.textContent=nm; npcNameplate.style.left=p.x+"px";npcNameplate.style.top=p.y+"px";npcNameplate.style.display="block"}
   else npcNameplate.style.display="none";
 }
 function tryTapNpc(e){
   if(npcDialogOpen||!currentVP||!npcsReady)return false;
   let best=null,bd=72;
   for(const n of npcScene.npcs){
     if(npcDistance(n)>NPC_INTERACT_RANGE+.8)continue;
     const p=projectNpc(n,currentVP);if(!p)continue;
     const d=Math.hypot(e.clientX-p.x,e.clientY-p.y);
     if(d<bd){bd=d;best=n}
   }
   if(best){openNpcDialog(best);return true}return false;
 }
 npcAction.addEventListener("click",e=>{e.stopPropagation();if(nearbyNpc)openNpcDialog(nearbyNpc)});
 npcClose.addEventListener("click",e=>{e.stopPropagation();closeNpcDialog()});
'''
if anchor not in s: raise SystemExit('ATT anchor not found')
s=s.replace(anchor,helpers,1)

# Stop movement while dialog is open.
anchor='function updatePlayerMovement(dt){\n   if(!playerReady||!playerScene.instanceBuffer||!playerScene.instanceData)return;'
new='function updatePlayerMovement(dt){\n   if(npcDialogOpen)return;\n   if(!playerReady||!playerScene.instanceBuffer||!playerScene.instanceData)return;'
if anchor not in s: raise SystemExit('movement anchor not found')
s=s.replace(anchor,new,1)

# Keep VP for touch picking and refresh interaction UI every frame.
anchor='''   const vp=mul(perspective(.72,canvas.width/canvas.height,.1,1800),lookAt(eye,look,[0,1,0]));\n   gl.useProgram(prog);'''
new='''   const vp=mul(perspective(.72,canvas.width/canvas.height,.1,1800),lookAt(eye,look,[0,1,0]));\n   currentVP=vp;updateNpcInteractionUI(vp);\n   gl.useProgram(prog);'''
if anchor not in s: raise SystemExit('VP anchor not found')
s=s.replace(anchor,new,1)

# Tap-vs-drag detection on canvas.
anchor='let lookDrag=false,lookPointer=-1,lastX=0,lastY=0,lastT=performance.now(),frames=0,lastFrameT=performance.now();'
new='let lookDrag=false,lookPointer=-1,lastX=0,lastY=0,lookStartX=0,lookStartY=0,lastT=performance.now(),frames=0,lastFrameT=performance.now();'
if anchor not in s: raise SystemExit('look state anchor not found')
s=s.replace(anchor,new,1)

anchor=''' canvas.addEventListener("pointerdown",e=>{\n   lookDrag=true;lookPointer=e.pointerId;lastX=e.clientX;lastY=e.clientY;canvas.setPointerCapture(e.pointerId);\n });'''
new=''' canvas.addEventListener("pointerdown",e=>{\n   if(npcDialogOpen)return;\n   lookDrag=true;lookPointer=e.pointerId;lastX=e.clientX;lastY=e.clientY;lookStartX=e.clientX;lookStartY=e.clientY;canvas.setPointerCapture(e.pointerId);\n });'''
if anchor not in s: raise SystemExit('pointerdown anchor not found')
s=s.replace(anchor,new,1)

anchor='const stopLook=e=>{if(e.pointerId===lookPointer){lookDrag=false;lookPointer=-1}};\n canvas.addEventListener("pointerup",stopLook);canvas.addEventListener("pointercancel",stopLook);'
new='''const stopLook=e=>{\n   if(e.pointerId===lookPointer){\n     const wasTap=Math.hypot(e.clientX-lookStartX,e.clientY-lookStartY)<12;\n     lookDrag=false;lookPointer=-1;\n     if(wasTap)tryTapNpc(e);\n   }\n };\n canvas.addEventListener("pointerup",stopLook);canvas.addEventListener("pointercancel",e=>{if(e.pointerId===lookPointer){lookDrag=false;lookPointer=-1}});'''
if anchor not in s: raise SystemExit('stopLook anchor not found')
s=s.replace(anchor,new,1)

# Escape closes dialog on desktop.
anchor='window.addEventListener("keydown",e=>keys.add(e.code));'
if anchor in s:
    s=s.replace(anchor,'window.addEventListener("keydown",e=>{if(e.code==="Escape"&&npcDialogOpen){closeNpcDialog();return}keys.add(e.code)});',1)

p.write_text(s,encoding='utf-8')
print('NPC interaction added: proximity button, tap targeting, dialog and movement lock')
