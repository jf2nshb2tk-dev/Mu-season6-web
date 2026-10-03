from pathlib import Path

p=Path('index.html')
s=p.read_text()

if 'functional-inventory.css?v=1' not in s:
    s=s.replace('</head>','<link rel="stylesheet" href="functional-inventory.css?v=1">\n</head>',1)

old='''  <div id="muInventoryGrid"></div><img id="muInvMoney" class="muInvBg"><div id="muZen">0 Zen</div><div id="muInvEmptyLabel">Inventario vacío</div>\n  <button id="muInventoryClose" aria-label="Cerrar inventario"></button>'''
new='''  <div id="muEquipmentLayer">\n    <div id="muDropHelper" class="muEquipDrop" data-equip="helper"></div><div id="muDropHelm" class="muEquipDrop" data-equip="helm"></div><div id="muDropWing" class="muEquipDrop" data-equip="wing"></div>\n    <div id="muDropWeaponR" class="muEquipDrop" data-equip="weaponR"></div><div id="muDropArmor" class="muEquipDrop" data-equip="armor"></div><div id="muDropWeaponL" class="muEquipDrop" data-equip="weaponL"></div>\n    <div id="muDropGloves" class="muEquipDrop" data-equip="gloves"></div><div id="muDropPants" class="muEquipDrop" data-equip="pants"></div><div id="muDropBoots" class="muEquipDrop" data-equip="boots"></div>\n    <div id="muDropAmulet" class="muEquipDrop" data-equip="amulet"></div><div id="muDropRingR" class="muEquipDrop" data-equip="ringR"></div><div id="muDropRingL" class="muEquipDrop" data-equip="ringL"></div>\n  </div>\n  <div id="muInventoryGrid"></div><img id="muInvMoney" class="muInvBg"><div id="muZen">0 Zen</div><div id="muInvEmptyLabel">Inventario vacío</div><div id="muInventoryNotice"></div>\n  <button id="muInventoryClose" aria-label="Cerrar inventario"></button>'''
if 'id="muEquipmentLayer"' not in s:
    if old not in s: raise SystemExit('Inventory HTML anchor missing')
    s=s.replace(old,new,1)

if 'id="muItemTooltip"' not in s:
    anchor='''</div>\n\n\n<div id="muCharacter" role="dialog" aria-label="Personaje">'''
    if anchor not in s: raise SystemExit('Character HTML anchor missing')
    s=s.replace(anchor,'''</div>\n<div id="muItemTooltip"></div>\n\n\n<div id="muCharacter" role="dialog" aria-label="Personaje">''',1)

init_old=''' const cellUrl=await uiAssetUrl("newui_item_box.OZT"),grid=$("#muInventoryGrid");\n for(let i=0;i<64;i++){const c=document.createElement("div");c.className="muInvCell";c.style.backgroundImage='url("'+cellUrl+'")';c.dataset.slot=i;grid.appendChild(c)}\n document.body.classList.add("mu-ui-ready");resizeMuInterface();updateMuHudUI();'''
init_new=''' const cellUrl=await uiAssetUrl("newui_item_box.OZT"),grid=$("#muInventoryGrid");\n for(let i=0;i<64;i++){const c=document.createElement("div");c.className="muInvCell";c.style.backgroundImage='url("'+cellUrl+'")';c.dataset.slot=i;grid.appendChild(c)}\n await initMuInventorySystem();\n document.body.classList.add("mu-ui-ready");resizeMuInterface();updateMuHudUI();'''
if 'await initMuInventorySystem();' not in s:
    if init_old not in s: raise SystemExit('Interface init anchor missing')
    s=s.replace(init_old,init_new,1)

anim_old='''   const bones=samplePlayerRig(playerScene.rig,nextAction,playerScene.animTime).bones;\n   for(const r of playerScene.renders){'''
anim_new='''   const bones=samplePlayerRig(playerScene.rig,nextAction,playerScene.animTime).bones;\n   playerScene.currentBones=bones;\n   for(const r of playerScene.renders){'''
if 'playerScene.currentBones=bones;' not in s:
    if anim_old not in s: raise SystemExit('Animation anchor missing')
    s=s.replace(anim_old,anim_new,1)

frame_old='''   updateFreeCamera(dt);\n   updatePlayerAnimation(dt);\n   const f=cameraForward(),eye=[camX,camY,camZ];'''
frame_new='''   updateFreeCamera(dt);\n   updatePlayerAnimation(dt);\n   if(playerReady)muEquipmentVisualTick(playerScene);\n   const f=cameraForward(),eye=[camX,camY,camZ];'''
if 'muEquipmentVisualTick(playerScene);' not in s:
    if frame_old not in s: raise SystemExit('Frame anchor missing')
    s=s.replace(frame_old,frame_new,1)

render1='''     for(const r of playerScene.renders){\n       gl.bindTexture(gl.TEXTURE_2D,r.tex);gl.bindVertexArray(r.vao);\n       gl.drawArraysInstanced(gl.TRIANGLES,0,r.count,r.n);\n     }\n     gl.disable(gl.BLEND);gl.enable(gl.CULL_FACE);'''
render1_new='''     for(const r of playerScene.renders){\n       gl.bindTexture(gl.TEXTURE_2D,r.tex);gl.bindVertexArray(r.vao);\n       gl.drawArraysInstanced(gl.TRIANGLES,0,r.count,r.n);\n     }\n     muDrawHeldItem();\n     gl.disable(gl.BLEND);gl.enable(gl.CULL_FACE);'''
if render1 in s:s=s.replace(render1,render1_new,1)

render2='''     for(const r of playerScene.renders){gl.bindTexture(gl.TEXTURE_2D,r.tex);gl.bindVertexArray(r.vao);gl.drawArraysInstanced(gl.TRIANGLES,0,r.count,r.n)}\n     gl.disable(gl.BLEND);gl.enable(gl.CULL_FACE);'''
render2_new='''     for(const r of playerScene.renders){gl.bindTexture(gl.TEXTURE_2D,r.tex);gl.bindVertexArray(r.vao);gl.drawArraysInstanced(gl.TRIANGLES,0,r.count,r.n)}\n     muDrawHeldItem();\n     gl.disable(gl.BLEND);gl.enable(gl.CULL_FACE);'''
if render2 in s:s=s.replace(render2,render2_new,1)
if s.count('muDrawHeldItem();')<2:raise SystemExit('Held-item render anchors missing')

bottom_old=''' requestAnimationFrame(frame);\n}\ninitMuInterface().catch(e=>console.warn("MU Interface",e));\nmain().catch(fail);\n</script>'''
bottom_new=''' requestAnimationFrame(frame);\n}\n</script>\n<script src="functional-inventory.js?v=1"></script>\n<script>\ninitMuInterface().catch(e=>console.warn("MU Interface",e));\nmain().catch(fail);\n</script>'''
if 'functional-inventory.js?v=1' not in s:
    if bottom_old not in s: raise SystemExit('Bottom script anchor missing')
    s=s.replace(bottom_old,bottom_new,1)

p.write_text(s)
print('Functional inventory integration patched')
