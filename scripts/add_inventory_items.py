from pathlib import Path

p=Path('index.html')
s=p.read_text(encoding='utf-8')

if 'const MU_ITEM_DEFS=' in s:
    print('Functional inventory already present')
    raise SystemExit(0)

css_anchor='#muInvEmptyLabel{position:absolute;left:15px;top:340px;width:160px;text-align:center;color:#8e8369;font:9px Arial;pointer-events:none}\n'
css_add=r'''#muInvEmptyLabel{position:absolute;left:15px;top:340px;width:160px;text-align:center;color:#8e8369;font:9px Arial;pointer-events:none}
.muInvItem{position:absolute;z-index:6;box-sizing:border-box;border:1px solid transparent;border-radius:2px;touch-action:none;user-select:none;cursor:pointer;filter:drop-shadow(0 1px 2px #000);overflow:visible}
.muInvItem.selected{border-color:#d5b85f;box-shadow:0 0 5px #d5b85f88,inset 0 0 5px #000}
.muInvItem img{position:absolute;inset:1px;width:calc(100% - 2px);height:calc(100% - 2px);object-fit:contain;image-rendering:auto;pointer-events:none}
.muInvItemCount{position:absolute;right:1px;bottom:0;color:#fff;font:bold 9px Arial;text-shadow:1px 1px 2px #000,-1px -1px 2px #000;pointer-events:none}
.muEquipRenderedItem{position:absolute;z-index:8;box-sizing:border-box;touch-action:none;cursor:pointer;filter:drop-shadow(0 1px 2px #000)}
.muEquipRenderedItem img{width:100%;height:100%;object-fit:contain;pointer-events:none}
#muInvTooltip{display:none;position:fixed;z-index:22;width:184px;box-sizing:border-box;padding:9px 10px;background:linear-gradient(180deg,#15130ff6,#030303fa);border:1px solid #9a8047;border-radius:7px;box-shadow:0 7px 24px #000e,inset 0 0 0 1px #211b10;color:#d8d2c3;font:10px/1.35 Arial,sans-serif;pointer-events:auto}
#muInvTooltip.open{display:block}
#muInvTooltipName{color:#f1d477;font:bold 11px Arial;text-align:center;margin-bottom:5px;text-shadow:1px 1px 2px #000}
#muInvTooltipBody{white-space:pre-line;color:#c9c1ae;min-height:24px}
#muInvTooltipReq{color:#d7a66b;margin-top:5px}
#muInvTooltipAction{display:none;width:100%;height:25px;margin-top:8px;border:1px solid #806b3e;border-radius:4px;background:#151109;color:#ead18a;font:bold 9px Arial}
#muInvTooltipAction:disabled{opacity:.42;color:#9b9485}#muInvTooltipAction:not(:disabled):active{background:#382d17}
#muInvDragGhost{display:none;position:fixed;z-index:30;pointer-events:none;opacity:.82;transform:translate(-50%,-50%);filter:drop-shadow(0 3px 5px #000)}
#muInvDragGhost img{width:100%;height:100%;object-fit:contain}
'''
if s.count(css_anchor)!=1: raise SystemExit('inventory CSS anchor mismatch')
s=s.replace(css_anchor,css_add,1)

html_anchor='''  <button id="muInventoryClose" aria-label="Cerrar inventario"></button>\n</div>\n\n\n<div id="muCharacter"'''
html_repl='''  <button id="muInventoryClose" aria-label="Cerrar inventario"></button>\n</div>\n<div id="muInvTooltip"><div id="muInvTooltipName"></div><div id="muInvTooltipBody"></div><div id="muInvTooltipReq"></div><button id="muInvTooltipAction"></button></div>\n<div id="muInvDragGhost"><img></div>\n\n<div id="muCharacter"'''
if s.count(html_anchor)!=1: raise SystemExit('inventory HTML anchor mismatch')
s=s.replace(html_anchor,html_repl,1)

state_anchor='let inventoryOpen=false,characterOpen=false,lastMuUiUpdate=0;'
state_code=r'''const ITEM_DIR="assets/Item/";
const MU_ITEM_DEFS={
 staff01:{name:"Skull Staff",model:"Staff01.bmd",kind:"weapon",equip:"weaponR",w:1,h:3,level:6,dmgMin:3,dmgMax:4,magic:6,reqStr:40,desc:"Bastón básico de Dark Wizard."},
 healSmall:{name:"Small Healing Potion",model:"Potion02.bmd",kind:"consumable",w:1,h:1,stack:255,desc:"Poción de curación pequeña."},
 bless:{name:"Jewel of Bless",model:"Jewel01.bmd",kind:"jewel",w:1,h:1,stack:255,desc:"Joya usada para mejorar ítems."},
 soul:{name:"Jewel of Soul",model:"Jewel02.bmd",kind:"jewel",w:1,h:1,stack:255,desc:"Joya usada para mejorar ítems."},
 town:{name:"Town Portal Scroll",model:"Scroll01.bmd",kind:"scroll",w:1,h:1,stack:255,desc:"Pergamino de regreso a la ciudad."},
 lightning:{name:"Pendant of Lightning",model:"Necklace01.bmd",kind:"accessory",equip:"amulet",w:1,h:1,desc:"Collar original de MU para la ranura de pendiente."}
};
const MU_INV_DEFAULT=[
 {uid:"staff-demo",def:"staff01",slot:0,count:1,place:"grid"},
 {uid:"heal-demo",def:"healSmall",slot:1,count:10,place:"grid"},
 {uid:"bless-demo",def:"bless",slot:2,count:3,place:"grid"},
 {uid:"soul-demo",def:"soul",slot:3,count:2,place:"grid"},
 {uid:"town-demo",def:"town",slot:4,count:5,place:"grid"},
 {uid:"neck-demo",def:"lightning",slot:5,count:1,place:"grid"}
];
let muInventoryItems=[],muEquipped={weaponR:null,amulet:null},muItemIcons={},muInvSelected=null,muInvDrag=null;
let inventoryOpen=false,characterOpen=false,lastMuUiUpdate=0;
function loadMuInventoryState(){
 try{const x=JSON.parse(localStorage.getItem("mu-s6-inventory-v1")||"null");if(x&&Array.isArray(x.items)){muInventoryItems=x.items;muEquipped=Object.assign({weaponR:null,amulet:null},x.equipped||{});return}}catch(e){}
 muInventoryItems=MU_INV_DEFAULT.map(x=>({...x}));
}
function saveMuInventoryState(){try{localStorage.setItem("mu-s6-inventory-v1",JSON.stringify({items:muInventoryItems,equipped:muEquipped}))}catch(e){}}
async function loadMuItemIconManifest(){try{const r=await fetch(ITEM_DIR+"item-icons.json",{cache:"no-store"});if(r.ok)muItemIcons=await r.json()}catch(e){console.warn("item-icons",e)}}
async function muItemIconUrl(model){
 const file=muItemIcons[model]||muItemIcons[model.toLowerCase()]||null;
 if(!file)return "";
 try{const r=await fetch(ITEM_DIR+file,{cache:"no-store"});if(!r.ok)return "";const b=new Uint8Array(await r.arrayBuffer()),c=file.toLowerCase().endsWith(".ozt")?objectOzt(b):await objectOzj(b);return c.toDataURL("image/png")}catch(e){console.warn("item icon",model,file,e);return ""}
}
'''
if s.count(state_anchor)!=1: raise SystemExit('inventory state anchor mismatch')
s=s.replace(state_anchor,state_code,1)

fn_anchor='function setInventoryOpen(v){'
fn_code=r'''function muItemDef(item){return MU_ITEM_DEFS[item.def]}
function muItemCells(item,slot=item.slot){const d=muItemDef(item),out=[];for(let yy=0;yy<d.h;yy++)for(let xx=0;xx<d.w;xx++)out.push(slot+yy*8+xx);return out}
function muCanPlace(item,slot,ignoreUid=item.uid){
 const d=muItemDef(item),x=slot%8,y=Math.floor(slot/8);if(x+d.w>8||y+d.h>8)return false;
 const cells=new Set(muItemCells(item,slot));
 for(const o of muInventoryItems){if(o.uid===ignoreUid||o.place!=="grid")continue;for(const c of muItemCells(o))if(cells.has(c))return false}
 return true;
}
function muFirstFreeSlot(item){for(let i=0;i<64;i++)if(muCanPlace(item,i))return i;return -1}
function muItemRequirementText(d){const a=[];if(d.level)a.push("Nivel del ítem "+d.level);if(d.reqStr)a.push("Fuerza requerida "+d.reqStr);return a.join(" · ")}
function muCanEquip(item){const d=muItemDef(item);if(!d.equip)return false;if(d.reqStr&&playerStats.strength<d.reqStr)return false;return true}
function muEquipmentStats(){let dm=0,dx=0,mg=0;for(const uid of Object.values(muEquipped)){const it=muInventoryItems.find(x=>x.uid===uid);if(!it)continue;const d=muItemDef(it);dm+=d.dmgMin||0;dx+=d.dmgMax||0;mg+=d.magic||0}return{dmgMin:dm,dmgMax:dx,magic:mg}}
function closeMuItemTooltip(){const t=$("#muInvTooltip");t.classList.remove("open");muInvSelected=null;for(const e of document.querySelectorAll(".muInvItem.selected"))e.classList.remove("selected")}
function openMuItemTooltip(item,el){
 const d=muItemDef(item),tip=$("#muInvTooltip"),act=$("#muInvTooltipAction");muInvSelected=item.uid;
 for(const e of document.querySelectorAll(".muInvItem.selected"))e.classList.toggle("selected",e.dataset.uid===item.uid);
 $("#muInvTooltipName").textContent=d.name;
 let body=d.desc||"";if(d.kind==="weapon")body+="\nDaño "+d.dmgMin+" ~ "+d.dmgMax+" · Poder mágico +"+d.magic;if(item.count>1)body+="\nCantidad: "+item.count;
 $("#muInvTooltipBody").textContent=body;$("#muInvTooltipReq").textContent=muItemRequirementText(d);
 act.style.display="none";act.disabled=false;act.dataset.uid=item.uid;
 if(d.kind==="consumable"){act.style.display="block";act.textContent="USAR"}
 else if(d.equip){act.style.display="block";if(item.place==="equip"){act.textContent="DESEQUIPAR"}else{act.textContent=muCanEquip(item)?"EQUIPAR":"REQUISITOS NO CUMPLIDOS";act.disabled=!muCanEquip(item)}}
 tip.classList.add("open");
 const r=el.getBoundingClientRect(),tw=184,th=tip.offsetHeight||110;let left=r.left-tw-8;if(left<5)left=Math.min(innerWidth-tw-5,r.right+8);let top=Math.max(5,Math.min(innerHeight-th-5,r.top));tip.style.left=left+"px";tip.style.top=top+"px";
}
function muUseItem(uid){const item=muInventoryItems.find(x=>x.uid===uid);if(!item)return;const d=muItemDef(item);if(d.kind!=="consumable")return;playerStats.life=Math.min(playerStats.lifeMax,playerStats.life+25);item.count--;if(item.count<=0)muInventoryItems=muInventoryItems.filter(x=>x.uid!==uid);saveMuInventoryState();renderMuInventoryItems();updateMuHudUI();closeMuItemTooltip()}
function muEquipItem(uid){const item=muInventoryItems.find(x=>x.uid===uid);if(!item)return;const d=muItemDef(item);if(!d.equip||!muCanEquip(item))return;const old=muEquipped[d.equip];if(old&&old!==uid){const oldItem=muInventoryItems.find(x=>x.uid===old);if(oldItem){const free=muFirstFreeSlot(oldItem);if(free<0)return;oldItem.place="grid";oldItem.slot=free}}
 item.place="equip";item.slot=-1;muEquipped[d.equip]=uid;saveMuInventoryState();renderMuInventoryItems();updateMuCharacterUI();closeMuItemTooltip()}
function muUnequipItem(uid){const item=muInventoryItems.find(x=>x.uid===uid);if(!item)return;const d=muItemDef(item),free=muFirstFreeSlot(item);if(free<0)return;item.place="grid";item.slot=free;if(d.equip&&muEquipped[d.equip]===uid)muEquipped[d.equip]=null;saveMuInventoryState();renderMuInventoryItems();updateMuCharacterUI();closeMuItemTooltip()}
function muMoveItem(uid,slot){
 const item=muInventoryItems.find(x=>x.uid===uid);if(!item||item.place!=="grid")return;const d=muItemDef(item);
 const hit=muInventoryItems.find(o=>o.uid!==uid&&o.place==="grid"&&muItemCells(o).includes(slot));
 if(hit&&d.stack&&hit.def===item.def&&muItemDef(hit).w===1&&muItemDef(hit).h===1){const room=d.stack-hit.count,take=Math.min(room,item.count);if(take>0){hit.count+=take;item.count-=take;if(item.count<=0)muInventoryItems=muInventoryItems.filter(x=>x.uid!==uid);saveMuInventoryState();renderMuInventoryItems();return}}
 if(!muCanPlace(item,slot))return;item.slot=slot;saveMuInventoryState();renderMuInventoryItems();
}
function muAttachItemPointer(el,item){
 el.addEventListener("pointerdown",e=>{e.preventDefault();e.stopPropagation();muInvDrag={uid:item.uid,x:e.clientX,y:e.clientY,moved:false,el};try{el.setPointerCapture(e.pointerId)}catch(_){} });
 el.addEventListener("pointermove",e=>{if(!muInvDrag||muInvDrag.uid!==item.uid)return;const d=Math.hypot(e.clientX-muInvDrag.x,e.clientY-muInvDrag.y);if(d>7){muInvDrag.moved=true;const g=$("#muInvDragGhost"),img=g.querySelector("img"),r=el.getBoundingClientRect();g.style.display="block";g.style.width=r.width+"px";g.style.height=r.height+"px";g.style.left=e.clientX+"px";g.style.top=e.clientY+"px";img.src=el.querySelector("img")?.src||""}});
 el.addEventListener("pointerup",e=>{if(!muInvDrag||muInvDrag.uid!==item.uid)return;const drag=muInvDrag;muInvDrag=null;$("#muInvDragGhost").style.display="none";if(drag.moved&&item.place==="grid"){const target=document.elementFromPoint(e.clientX,e.clientY)?.closest?.(".muInvCell");if(target)muMoveItem(item.uid,Number(target.dataset.slot));else renderMuInventoryItems()}else openMuItemTooltip(item,el)});
 el.addEventListener("pointercancel",()=>{muInvDrag=null;$("#muInvDragGhost").style.display="none";renderMuInventoryItems()});
}
async function renderMuInventoryItems(){
 const grid=$("#muInventoryGrid");for(const e of grid.querySelectorAll(".muInvItem"))e.remove();for(const e of muInventory.querySelectorAll(".muEquipRenderedItem"))e.remove();
 $("#muInvEmptyLabel").style.display=muInventoryItems.some(x=>x.place==="grid")?"none":"block";
 for(const item of muInventoryItems){const d=muItemDef(item),el=document.createElement("div"),img=document.createElement("img");img.alt=d.name;el.dataset.uid=item.uid;el.appendChild(img);if(item.count>1){const n=document.createElement("span");n.className="muInvItemCount";n.textContent=item.count;el.appendChild(n)}
   if(item.place==="grid"){el.className="muInvItem";el.style.left=((item.slot%8)*20)+"px";el.style.top=(Math.floor(item.slot/8)*20)+"px";el.style.width=(d.w*20)+"px";el.style.height=(d.h*20)+"px";grid.appendChild(el)}
   else{el.className="muEquipRenderedItem";const pos=d.equip==="amulet"?{l:54,t:87,w:28,h:28}:{l:15,t:87,w:46,h:66};el.style.left=pos.l+"px";el.style.top=pos.t+"px";el.style.width=pos.w+"px";el.style.height=pos.h+"px";muInventory.appendChild(el)}
   muAttachItemPointer(el,item);muItemIconUrl(d.model).then(u=>{if(u)img.src=u});
 }
}
async function initInventoryItems(){loadMuInventoryState();await loadMuItemIconManifest();await renderMuInventoryItems()}
$("#muInvTooltipAction").addEventListener("click",e=>{e.preventDefault();e.stopPropagation();const uid=e.currentTarget.dataset.uid,item=muInventoryItems.find(x=>x.uid===uid);if(!item)return;const d=muItemDef(item);if(d.kind==="consumable")muUseItem(uid);else if(item.place==="equip")muUnequipItem(uid);else muEquipItem(uid)});
window.addEventListener("pointerdown",e=>{if(!inventoryOpen)return;if(!e.target.closest?.("#muInventory")&&!e.target.closest?.("#muInvTooltip"))closeMuItemTooltip()},{capture:true});
function setInventoryOpen(v){'''
if s.count(fn_anchor)!=1: raise SystemExit('setInventoryOpen anchor mismatch')
s=s.replace(fn_anchor,fn_code,1)

# close tooltip when inventory closes
close_anchor=''' }else{\n   muInventory.classList.remove("open");muInventoryBtn.classList.remove("active");document.body.classList.remove("mu-inventory-open");\n }\n}'''
close_repl=''' }else{\n   closeMuItemTooltip();muInventory.classList.remove("open");muInventoryBtn.classList.remove("active");document.body.classList.remove("mu-inventory-open");\n }\n}'''
if s.count(close_anchor)<1: raise SystemExit('inventory close anchor mismatch')
s=s.replace(close_anchor,close_repl,1)

# Equipment bonuses in character panel.
stat_anchor='const dmgMin=Math.floor(str/8),dmgMax=Math.floor(str/4),magicMin=Math.floor(ene/9),magicMax=Math.floor(ene/4),def=Math.floor(agi/3),rate=Math.floor(agi/3),speed=Math.floor(agi/15);'
stat_repl='const eq=muEquipmentStats(),dmgMin=Math.floor(str/8)+eq.dmgMin,dmgMax=Math.floor(str/4)+eq.dmgMax,magicMin=Math.floor(ene/9)+eq.magic,magicMax=Math.floor(ene/4)+eq.magic,def=Math.floor(agi/3),rate=Math.floor(agi/3),speed=Math.floor(agi/15);'
if s.count(stat_anchor)!=1: raise SystemExit('character stats anchor mismatch')
s=s.replace(stat_anchor,stat_repl,1)

# Initialize cells then inventory item layer.
init_anchor=''' const cellUrl=await uiAssetUrl("newui_item_box.OZT"),grid=$("#muInventoryGrid");\n for(let i=0;i<64;i++){const c=document.createElement("div");c.className="muInvCell";c.style.backgroundImage='url("'+cellUrl+'")';c.dataset.slot=i;grid.appendChild(c)}\n document.body.classList.add("mu-ui-ready");resizeMuInterface();updateMuHudUI();'''
init_repl=''' const cellUrl=await uiAssetUrl("newui_item_box.OZT"),grid=$("#muInventoryGrid");\n for(let i=0;i<64;i++){const c=document.createElement("div");c.className="muInvCell";c.style.backgroundImage='url("'+cellUrl+'")';c.dataset.slot=i;grid.appendChild(c)}\n await initInventoryItems();\n document.body.classList.add("mu-ui-ready");resizeMuInterface();updateMuHudUI();'''
if s.count(init_anchor)!=1: raise SystemExit('inventory init anchor mismatch')
s=s.replace(init_anchor,init_repl,1)

p.write_text(s,encoding='utf-8')
print('Functional MU inventory patched')
