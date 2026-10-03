/* Functional MU Season 6 inventory - original client Item assets */
const ITEM_DIR="assets/Item/";
const MU_INV_STORAGE="mu-s6-inventory-v1";

async function getItemBytes(name){
  const r=await fetch(ITEM_DIR+name,{cache:"no-store"});
  if(!r.ok)throw new Error("Item/"+name+" HTTP "+r.status);
  return new Uint8Array(await r.arrayBuffer());
}
function muItemAssetName(path){
  const f=path.split(String.fromCharCode(92)).join("/").split("/").pop();
  const dot=f.lastIndexOf("."),base=dot<0?f:f.slice(0,dot),ext=(dot<0?"":f.slice(dot+1)).toLowerCase();
  return base+(ext==="tga"?".OZT":".OZJ");
}
const muItemCanvasCache=new Map(),muItemTexCache=new Map(),muItemIconCache=new Map();
async function itemTextureCanvas(path){
  const asset=muItemAssetName(path),key=asset.toLowerCase();
  if(muItemCanvasCache.has(key))return muItemCanvasCache.get(key);
  const promise=(async()=>{const b=await getItemBytes(asset);return asset.toLowerCase().endsWith(".ozt")?objectOzt(b):await objectOzj(b)})();
  muItemCanvasCache.set(key,promise);return promise;
}
async function itemTexture(path){
  const asset=muItemAssetName(path),key=asset.toLowerCase();
  if(muItemTexCache.has(key))return muItemTexCache.get(key);
  const promise=(async()=>playerRepeatTex(await itemTextureCanvas(path)))();
  muItemTexCache.set(key,promise);return promise;
}

function muCompileIconProgram(g,vs,fs){
  const sh=(t,src)=>{const x=g.createShader(t);g.shaderSource(x,src);g.compileShader(x);if(!g.getShaderParameter(x,g.COMPILE_STATUS))throw new Error(g.getShaderInfoLog(x));return x};
  const p=g.createProgram();g.attachShader(p,sh(g.VERTEX_SHADER,vs));g.attachShader(p,sh(g.FRAGMENT_SHADER,fs));g.linkProgram(p);
  if(!g.getProgramParameter(p,g.LINK_STATUS))throw new Error(g.getProgramInfoLog(p));return p;
}
let muIconGLState=null;
function muGetIconGL(){
  if(muIconGLState)return muIconGLState;
  const canvas=document.createElement("canvas");canvas.width=canvas.height=96;
  const g=canvas.getContext("webgl2",{alpha:true,antialias:true,preserveDrawingBuffer:true,premultipliedAlpha:false});
  if(!g)throw new Error("WebGL2 icon renderer no disponible");
  const vs=`#version 300 es
precision highp float;
layout(location=0)in vec3 aPos;layout(location=1)in vec3 aN;layout(location=2)in vec2 aUV;
uniform vec4 uQ;uniform vec3 uCenter;uniform float uScale;out vec2 vUV;out vec3 vN;
vec3 qr(vec4 q,vec3 v){return v+2.0*cross(q.xyz,cross(q.xyz,v)+q.w*v);}
void main(){vec3 p=qr(uQ,aPos)-uCenter;p*=uScale;vN=normalize(qr(uQ,aN));vUV=aUV;gl_Position=vec4(p.x,p.z,clamp(-p.y*.18,-.92,.92),1.0);}`;
  const fs=`#version 300 es
precision highp float;in vec2 vUV;in vec3 vN;uniform sampler2D uTex;out vec4 o;
void main(){vec4 c=texture(uTex,vUV);float mx=max(max(c.r,c.g),c.b),mn=min(min(c.r,c.g),c.b);if(c.a<.08||(mx<.025&&mx-mn<.015))discard;float d=.60+.55*max(dot(normalize(vN),normalize(vec3(.4,.65,.8))),0.0);o=vec4(c.rgb*d,c.a);}`;
  const prog=muCompileIconProgram(g,vs,fs);
  muIconGLState={canvas,g,prog,uQ:g.getUniformLocation(prog,"uQ"),uCenter:g.getUniformLocation(prog,"uCenter"),uScale:g.getUniformLocation(prog,"uScale"),uTex:g.getUniformLocation(prog,"uTex")};
  return muIconGLState;
}
async function muItemIconUrl(def){
  if(muItemIconCache.has(def.id))return muItemIconCache.get(def.id);
  const promise=(async()=>{
    const meshes=parseBmd(await getItemBytes(def.model),null,0).filter(m=>m.data.length&&!/shadow/i.test(m.texture));
    if(!meshes.length)throw new Error("Item sin malla "+def.model);
    try{
      const st=muGetIconGL(),g=st.g,q=quatEuler([-.43,.08,.34]);
      let mn=[Infinity,Infinity,Infinity],mx=[-Infinity,-Infinity,-Infinity];
      for(const m of meshes)for(let i=0;i<m.data.length;i+=8){const v=quatRot(q,[m.data[i],m.data[i+1],m.data[i+2]]);for(let a=0;a<3;a++){mn[a]=Math.min(mn[a],v[a]);mx[a]=Math.max(mx[a],v[a])}}
      const center=[(mn[0]+mx[0])*.5,(mn[1]+mx[1])*.5,(mn[2]+mx[2])*.5];
      const span=Math.max(mx[0]-mn[0],mx[2]-mn[2],1),scale=1.62/span;
      g.viewport(0,0,96,96);g.clearColor(0,0,0,0);g.clear(g.COLOR_BUFFER_BIT|g.DEPTH_BUFFER_BIT);g.enable(g.DEPTH_TEST);g.disable(g.CULL_FACE);g.enable(g.BLEND);g.blendFunc(g.SRC_ALPHA,g.ONE_MINUS_SRC_ALPHA);
      g.useProgram(st.prog);g.uniform4fv(st.uQ,q);g.uniform3fv(st.uCenter,center);g.uniform1f(st.uScale,scale);g.uniform1i(st.uTex,0);g.activeTexture(g.TEXTURE0);
      for(const m of meshes){
        const vao=g.createVertexArray();g.bindVertexArray(vao);const vb=g.createBuffer();g.bindBuffer(g.ARRAY_BUFFER,vb);g.bufferData(g.ARRAY_BUFFER,m.data,g.STATIC_DRAW);
        g.enableVertexAttribArray(0);g.vertexAttribPointer(0,3,g.FLOAT,false,32,0);g.enableVertexAttribArray(1);g.vertexAttribPointer(1,3,g.FLOAT,false,32,12);g.enableVertexAttribArray(2);g.vertexAttribPointer(2,2,g.FLOAT,false,32,24);
        const cv=await itemTextureCanvas(m.texture),tex=g.createTexture();g.bindTexture(g.TEXTURE_2D,tex);g.pixelStorei(g.UNPACK_FLIP_Y_WEBGL,false);g.texImage2D(g.TEXTURE_2D,0,g.RGBA,g.RGBA,g.UNSIGNED_BYTE,cv);
        g.texParameteri(g.TEXTURE_2D,g.TEXTURE_MIN_FILTER,g.LINEAR);g.texParameteri(g.TEXTURE_2D,g.TEXTURE_MAG_FILTER,g.LINEAR);g.texParameteri(g.TEXTURE_2D,g.TEXTURE_WRAP_S,g.CLAMP_TO_EDGE);g.texParameteri(g.TEXTURE_2D,g.TEXTURE_WRAP_T,g.CLAMP_TO_EDGE);
        g.drawArrays(g.TRIANGLES,0,m.data.length/8);g.deleteTexture(tex);g.deleteBuffer(vb);g.deleteVertexArray(vao);
      }
      g.finish();return st.canvas.toDataURL("image/png");
    }catch(e){
      console.warn("Icon renderer",def.id,e);return (await itemTextureCanvas(meshes[0].texture)).toDataURL("image/png");
    }
  })();
  muItemIconCache.set(def.id,promise);return promise;
}

const MU_ITEM_DEFS={
  staff01:{id:"staff01",name:"Skull Staff",model:"Staff01.bmd",w:1,h:3,equip:["weaponR"],type:"Staff",damage:[3,4],magic:6,requirement:"Strength 40",className:"Dark Wizard",stackMax:1},
  hpSmall:{id:"hpSmall",name:"Small Healing Potion",model:"Potion02.bmd",w:1,h:1,type:"Potion",description:"Recupera vida.",stackMax:255},
  mpSmall:{id:"mpSmall",name:"Small Mana Potion",model:"Potion05.bmd",w:1,h:1,type:"Potion",description:"Recupera mana.",stackMax:255},
  bless:{id:"bless",name:"Jewel of Bless",model:"Jewel01.bmd",w:1,h:1,type:"Jewel",description:"Joya de mejora de objetos.",stackMax:1},
  soul:{id:"soul",name:"Jewel of Soul",model:"Jewel02.bmd",w:1,h:1,type:"Jewel",description:"Joya de mejora de objetos.",stackMax:1}
};
let muInventoryItems=[],muEquipment={helper:null,helm:null,wing:null,weaponR:null,armor:null,weaponL:null,gloves:null,pants:null,boots:null,amulet:null,ringR:null,ringL:null};
let muSelectedSource=null,muEquipmentRevision=0,muNoticeTimer=0;
function muDefaultInventory(){return[
  {uid:1,id:"staff01",qty:1,slot:0},
  {uid:2,id:"hpSmall",qty:15,slot:2},
  {uid:3,id:"mpSmall",qty:15,slot:3},
  {uid:4,id:"bless",qty:1,slot:10},
  {uid:5,id:"soul",qty:1,slot:11}
]}
function muLoadInventory(){
  try{
    const x=JSON.parse(localStorage.getItem(MU_INV_STORAGE)||"null");
    if(x&&Array.isArray(x.items)&&x.equipment){
      muInventoryItems=x.items.filter(i=>MU_ITEM_DEFS[i.id]);
      for(const k of Object.keys(muEquipment))muEquipment[k]=x.equipment[k]&&MU_ITEM_DEFS[x.equipment[k].id]?x.equipment[k]:null;
      return;
    }
  }catch(e){console.warn("Inventory save",e)}
  muInventoryItems=muDefaultInventory();
}
function muSaveInventory(){try{localStorage.setItem(MU_INV_STORAGE,JSON.stringify({items:muInventoryItems,equipment:muEquipment}))}catch(e){}}
function muDef(item){return item?MU_ITEM_DEFS[item.id]:null}
function muGridItemAt(cell,ignore=[]){
  const skip=new Set(ignore),tr=Math.floor(cell/8),tc=cell%8;
  for(const it of muInventoryItems){
    if(skip.has(it.uid))continue;const d=muDef(it),r=Math.floor(it.slot/8),c=it.slot%8;
    if(tc>=c&&tc<c+d.w&&tr>=r&&tr<r+d.h)return it;
  }
  return null;
}
function muCanPlace(item,cell,ignore=[]){
  const d=muDef(item),r=Math.floor(cell/8),c=cell%8;if(c+d.w>8||r+d.h>8)return false;
  for(let yy=0;yy<d.h;yy++)for(let xx=0;xx<d.w;xx++)if(muGridItemAt((r+yy)*8+c+xx,ignore))return false;
  return true;
}
function muGetSource(src){
  if(!src)return null;
  if(src.kind==="grid")return muInventoryItems.find(i=>i.uid===src.uid)||null;
  if(src.kind==="equip")return muEquipment[src.slot]||null;
  return null;
}
function muDetach(src,item){
  if(src.kind==="grid")muInventoryItems=muInventoryItems.filter(i=>i.uid!==item.uid);
  else if(src.kind==="equip")muEquipment[src.slot]=null;
}
function muAttachGrid(item,cell){item.slot=cell;if(!muInventoryItems.some(i=>i.uid===item.uid))muInventoryItems.push(item)}
function muAttachEquip(item,slot){delete item.slot;muEquipment[slot]=item}
function muInventoryNotice(msg){
  const el=document.querySelector("#muInventoryNotice");if(!el)return;el.textContent=msg;clearTimeout(muNoticeTimer);muNoticeTimer=setTimeout(()=>{if(el.textContent===msg)el.textContent=""},1400);
}
function muMarkEquipmentChange(slot){if(slot==="weaponR"||slot==="weaponL")muEquipmentRevision++}
function muMoveItem(src,dst){
  const item=muGetSource(src);if(!item)return false;const d=muDef(item);
  if(dst.kind==="equip"){
    if(!d.equip||!d.equip.includes(dst.slot)){muInventoryNotice("Ese ítem no va en esa ranura");return false}
    if(src.kind==="equip"&&src.slot===dst.slot)return true;
    const old=muEquipment[dst.slot];
    if(old){
      if(src.kind==="grid"){
        const sourceCell=item.slot;if(!muCanPlace(old,sourceCell,[item.uid])){muInventoryNotice("No hay espacio para intercambiar");return false}
        muDetach(src,item);muEquipment[dst.slot]=item;delete item.slot;old.slot=sourceCell;muInventoryItems.push(old);muMarkEquipmentChange(dst.slot);
      }else{
        const od=muDef(old);if(!od.equip||!od.equip.includes(src.slot)){muInventoryNotice("No se pueden intercambiar");return false}
        muEquipment[src.slot]=old;muEquipment[dst.slot]=item;muMarkEquipmentChange(src.slot);muMarkEquipmentChange(dst.slot);
      }
    }else{
      muDetach(src,item);muAttachEquip(item,dst.slot);muMarkEquipmentChange(dst.slot);if(src.kind==="equip")muMarkEquipmentChange(src.slot);
    }
  }else if(dst.kind==="grid"){
    const cell=dst.cell,target=muGridItemAt(cell,[item.uid]);
    if(target&&target.uid!==item.uid&&target.id===item.id&&d.stackMax>1){
      const room=d.stackMax-target.qty,add=Math.min(room,item.qty);if(add<=0){muInventoryNotice("Stack completo");return false}
      target.qty+=add;item.qty-=add;if(item.qty<=0)muDetach(src,item);muInventoryNotice("Stack "+target.qty);if(src.kind==="equip")muMarkEquipmentChange(src.slot);
    }else if(target&&target.uid!==item.uid){
      if(src.kind!=="grid"){muInventoryNotice("Casilla ocupada");return false}
      const a=item.slot,b=target.slot;if(!muCanPlace(item,b,[item.uid,target.uid])||!muCanPlace(target,a,[item.uid,target.uid])){muInventoryNotice("No entra ahí");return false}
      item.slot=b;target.slot=a;
    }else{
      if(!muCanPlace(item,cell,[item.uid])){muInventoryNotice("No entra ahí");return false}
      muDetach(src,item);muAttachGrid(item,cell);if(src.kind==="equip")muMarkEquipmentChange(src.slot);
    }
  }
  muSelectedSource=null;muSaveInventory();renderMuInventory();return true;
}
function muTooltipHtml(item){
  const d=muDef(item);let h='<div class="muTipName">'+d.name+(item.qty>1?' x'+item.qty:'')+'</div><div>'+d.type+'</div>';
  if(d.damage)h+='<div class="muTipBlue">Damage '+d.damage[0]+' ~ '+d.damage[1]+'</div>';
  if(d.magic)h+='<div class="muTipBlue">Magic Power +'+d.magic+'%</div>';
  if(d.description)h+='<div class="muTipGreen">'+d.description+'</div>';
  if(d.requirement)h+='<div class="muTipReq">Requires '+d.requirement+'</div>';
  if(d.className)h+='<div class="muTipReq">'+d.className+'</div>';
  h+='<div class="muTipHint">Tocá y luego tocá otra casilla · también podés arrastrar</div>';return h;
}
function muShowTooltip(item,x,y){
  const t=document.querySelector("#muItemTooltip");if(!t)return;t.innerHTML=muTooltipHtml(item);t.classList.add("open");
  const w=180,h=115;t.style.left=Math.max(6,Math.min(innerWidth-w-6,(x||innerWidth*.5)+10))+"px";t.style.top=Math.max(6,Math.min(innerHeight-h-6,(y||innerHeight*.5)-25))+"px";
}
function muHideTooltip(){const t=document.querySelector("#muItemTooltip");if(t)t.classList.remove("open")}
function muSourceFromEl(el){return el.dataset.source==="equip"?{kind:"equip",slot:el.dataset.equip}:{kind:"grid",uid:+el.dataset.uid}}
function muTargetAtPoint(x,y){
  const el=document.elementFromPoint(x,y);if(!el)return null;
  const eq=el.closest?.(".muEquipDrop");if(eq)return{kind:"equip",slot:eq.dataset.equip};
  const itel=el.closest?.(".muInvItem");if(itel){const src=muSourceFromEl(itel),it=muGetSource(src);return src.kind==="equip"?{kind:"equip",slot:src.slot}:{kind:"grid",cell:it?.slot??0}}
  const cell=el.closest?.(".muInvCell");if(cell)return{kind:"grid",cell:+cell.dataset.slot};return null;
}
function muMakeItemElement(item,src){
  const d=muDef(item),el=document.createElement("div");el.className="muInvItem";el.dataset.uid=item.uid;el.dataset.source=src.kind;el.dataset.equip=src.slot||"";el.title=d.name;
  if(src.kind==="grid"){
    const r=Math.floor(item.slot/8),c=item.slot%8;el.style.left=(c*20)+"px";el.style.top=(r*20)+"px";el.style.width=(d.w*20)+"px";el.style.height=(d.h*20)+"px";
  }
  if(item.qty>1){const q=document.createElement("span");q.className="muInvQty";q.textContent=item.qty;el.appendChild(q)}
  if(muSelectedSource&&JSON.stringify(muSelectedSource)===JSON.stringify(src))el.classList.add("muSelected");
  muItemIconUrl(d).then(url=>{if(el.isConnected)el.style.backgroundImage='url("'+url+'")'}).catch(e=>console.warn("Item icon",d.id,e));
  let pd=null,ghost=null,dragging=false;
  el.addEventListener("pointerenter",e=>muShowTooltip(item,e.clientX,e.clientY));
  el.addEventListener("pointerleave",()=>{if(!muSelectedSource)muHideTooltip()});
  el.addEventListener("pointerdown",e=>{e.preventDefault();e.stopPropagation();pd={id:e.pointerId,x:e.clientX,y:e.clientY};el.setPointerCapture?.(e.pointerId);muShowTooltip(item,e.clientX,e.clientY)});
  el.addEventListener("pointermove",e=>{
    if(!pd||e.pointerId!==pd.id)return;const dist=Math.hypot(e.clientX-pd.x,e.clientY-pd.y);
    if(dist>7&&!dragging){dragging=true;el.classList.add("muDragging");ghost=document.createElement("div");ghost.className="muDragGhost";if(el.style.backgroundImage)ghost.style.backgroundImage=el.style.backgroundImage;document.body.appendChild(ghost)}
    if(ghost){ghost.style.left=e.clientX+"px";ghost.style.top=e.clientY+"px"}
  });
  const finish=e=>{
    if(!pd||e.pointerId!==pd.id)return;e.preventDefault();e.stopPropagation();if(ghost)ghost.remove();el.classList.remove("muDragging");const srcNow=muSourceFromEl(el);
    if(dragging){const dst=muTargetAtPoint(e.clientX,e.clientY);if(dst)muMoveItem(srcNow,dst)}
    else if(muSelectedSource){
      if(JSON.stringify(muSelectedSource)===JSON.stringify(srcNow)){
        if(d.equip?.length)muMoveItem(srcNow,{kind:"equip",slot:d.equip[0]});else{muSelectedSource=null;renderMuInventory();muHideTooltip()}
      }else{
        const selected=muGetSource(muSelectedSource);if(selected){if(srcNow.kind==="grid")muMoveItem(muSelectedSource,{kind:"grid",cell:item.slot});else muMoveItem(muSelectedSource,{kind:"equip",slot:srcNow.slot})}
      }
    }else{muSelectedSource=srcNow;renderMuInventory();muShowTooltip(item,e.clientX,e.clientY)}
    pd=null;dragging=false;
  };
  el.addEventListener("pointerup",finish);el.addEventListener("pointercancel",()=>{if(ghost)ghost.remove();el.classList.remove("muDragging");pd=null;dragging=false});return el;
}
function renderMuInventory(){
  const grid=document.querySelector("#muInventoryGrid"),layer=document.querySelector("#muEquipmentLayer");if(!grid||!layer)return;
  for(const x of grid.querySelectorAll(".muInvItem"))x.remove();
  for(const z of layer.querySelectorAll(".muEquipDrop")){
    for(const x of z.querySelectorAll(".muInvItem"))x.remove();
    z.classList.toggle("muDropReady",!!muSelectedSource&&!!muDef(muGetSource(muSelectedSource))?.equip?.includes(z.dataset.equip));
  }
  for(const it of muInventoryItems)grid.appendChild(muMakeItemElement(it,{kind:"grid",uid:it.uid}));
  for(const [slot,it] of Object.entries(muEquipment))if(it){const z=layer.querySelector('[data-equip="'+slot+'"]');if(z)z.appendChild(muMakeItemElement(it,{kind:"equip",slot}))}
  const empty=document.querySelector("#muInvEmptyLabel");if(empty)empty.style.display=muInventoryItems.length?"none":"block";
}
async function initMuInventorySystem(){
  muLoadInventory();const grid=document.querySelector("#muInventoryGrid"),layer=document.querySelector("#muEquipmentLayer");if(!grid||!layer)return;
  grid.addEventListener("pointerup",e=>{if(!muSelectedSource)return;const c=e.target.closest?.(".muInvCell");if(c){e.preventDefault();e.stopPropagation();muMoveItem(muSelectedSource,{kind:"grid",cell:+c.dataset.slot})}});
  for(const z of layer.querySelectorAll(".muEquipDrop"))z.addEventListener("pointerup",e=>{if(!muSelectedSource||e.target.closest?.(".muInvItem"))return;e.preventDefault();e.stopPropagation();muMoveItem(muSelectedSource,{kind:"equip",slot:z.dataset.equip})});
  renderMuInventory();Promise.all(Object.values(MU_ITEM_DEFS).map(d=>muItemIconUrl(d).catch(()=>null))).then(renderMuInventory);
}

let muHeldItemScene={renders:[],instanceBuffer:null,instanceData:null,handIndex:-1,defId:null},muHeldVisualRevision=-1,muHeldBuildBusy=false;
async function muBuildHeldItemVisual(def){
  const meshes=parseBmd(await getItemBytes(def.model),null,0),idata=new Float32Array([0,0,0,.85,0,0,0,1]);
  const inst=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,inst);gl.bufferData(gl.ARRAY_BUFFER,idata,gl.DYNAMIC_DRAW);const renders=[];
  for(const m of meshes){
    if(!m.data.length||/shadow/i.test(m.texture))continue;const vao=gl.createVertexArray();gl.bindVertexArray(vao);const vb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,vb);gl.bufferData(gl.ARRAY_BUFFER,m.data,gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,32,0);gl.enableVertexAttribArray(1);gl.vertexAttribPointer(1,3,gl.FLOAT,false,32,12);gl.enableVertexAttribArray(2);gl.vertexAttribPointer(2,2,gl.FLOAT,false,32,24);
    gl.bindBuffer(gl.ARRAY_BUFFER,inst);gl.enableVertexAttribArray(3);gl.vertexAttribPointer(3,4,gl.FLOAT,false,32,0);gl.vertexAttribDivisor(3,1);gl.enableVertexAttribArray(4);gl.vertexAttribPointer(4,4,gl.FLOAT,false,32,16);gl.vertexAttribDivisor(4,1);
    renders.push({vao,count:m.data.length/8,n:1,tex:await itemTexture(m.texture)});
  }
  return{renders,instanceBuffer:inst,instanceData:idata,handIndex:-1,defId:def.id};
}
function muFindRightHandIndex(playerScene){
  if(!playerScene?.rig?.bones)return-1;const names=playerScene.rig.bones.map((b,i)=>({i,n:(b.name||"").toLowerCase()}));
  for(const re of [/r[ _.-]*hand/,/right[ _.-]*hand/,/hand[ _.-]*r/]){const q=names.find(x=>re.test(x.n));if(q)return q.i}
  const hands=names.filter(x=>x.n.includes("hand"));return hands.length?hands[hands.length-1].i:-1;
}
function muEquipmentVisualTick(playerScene){
  if(!playerScene?.rig)return;
  if(!muHeldBuildBusy&&muHeldVisualRevision!==muEquipmentRevision){
    muHeldVisualRevision=muEquipmentRevision;const it=muEquipment.weaponR,def=muDef(it);
    if(!def){muHeldItemScene={renders:[],instanceBuffer:null,instanceData:null,handIndex:-1,defId:null}}
    else{
      muHeldBuildBusy=true;muBuildHeldItemVisual(def).then(x=>{x.handIndex=muFindRightHandIndex(playerScene);muHeldItemScene=x;console.log("MU equipped visual",def.name,"bone",x.handIndex,playerScene.rig?.bones?.[x.handIndex]?.name)}).catch(e=>console.warn("Held item",e)).finally(()=>muHeldBuildBusy=false);
    }
  }
  if(!muHeldItemScene.instanceBuffer||muHeldItemScene.handIndex<0||!playerScene.currentBones||!playerScene.instanceData)return;
  const hand=playerScene.currentBones[muHeldItemScene.handIndex];if(!hand)return;const pd=playerScene.instanceData,pq=[pd[4],pd[5],pd[6],pd[7]],ps=pd[3];
  const hp=[hand.p[0]*ps,hand.p[1]*ps,hand.p[2]*ps],rp=quatRot(pq,hp),pos=[pd[0]+rp[0],pd[1]+rp[1],pd[2]+rp[2]],q=quatMul(pq,hand.q),d=muHeldItemScene.instanceData;
  d[0]=pos[0];d[1]=pos[1];d[2]=pos[2];d[3]=ps;d[4]=q[0];d[5]=q[1];d[6]=q[2];d[7]=q[3];gl.bindBuffer(gl.ARRAY_BUFFER,muHeldItemScene.instanceBuffer);gl.bufferSubData(gl.ARRAY_BUFFER,0,d);
}
function muDrawHeldItem(){
  if(!muHeldItemScene.renders.length)return;gl.uniform1i(objBlackKey,1);
  for(const r of muHeldItemScene.renders){gl.bindTexture(gl.TEXTURE_2D,r.tex);gl.bindVertexArray(r.vao);gl.drawArraysInstanced(gl.TRIANGLES,0,r.count,1)}
  gl.uniform1i(objBlackKey,0);
}
