(() => {
"use strict";
if(window.MUMonsters)return;

const MONSTER_DIR="assets/Monster/";
const state={assetsReady:false,ready:false,manifest:null,groups:[],active:new Map(),failed:[],lastFrame:performance.now()};
const modelDefs=[
 {key:"bull",name:"Bull Fighter",model:"Monster01.bmd",hp:95,scale:.86,spawns:[[141.5,120.5],[145.2,126.2]]},
 {key:"hound",name:"Hound",model:"Monster02.bmd",hp:75,scale:.84,spawns:[[143.8,123.0],[140.0,128.2]]},
 {key:"budge",name:"Budge Dragon",model:"Monster03.bmd",hp:120,scale:.82,spawns:[[146.0,121.0]]},
 {key:"spider",name:"Spider",model:"Monster10.bmd",hp:55,scale:.82,spawns:[[137.2,119.0],[145.5,129.0]]}
];
const texCache=new Map();
let lowerFiles=new Map(),heightMap=null,overlay=null,ctx=null,damagePops=[];

function exactFile(name){return lowerFiles.get(String(name).toLowerCase())||name}
async function monsterBytes(name){
 const file=exactFile(name),r=await fetch(MONSTER_DIR+file,{cache:"no-store"});
 if(!r.ok)throw new Error("Monster/"+file+" HTTP "+r.status);
 return new Uint8Array(await r.arrayBuffer());
}
async function monsterTexture(path){
 const f=String(path||"").replaceAll("\\","/").split("/").pop(),dot=f.lastIndexOf("."),base=dot<0?f:f.slice(0,dot),ext=(dot<0?"":f.slice(dot+1)).toLowerCase();
 let asset=base+(ext==="tga"?".OZT":".OZJ"),exact=lowerFiles.get(asset.toLowerCase());
 if(!exact&&ext!=="tga")exact=lowerFiles.get((base+".OZT").toLowerCase());
 exact=exact||asset;
 const key=exact.toLowerCase();if(texCache.has(key))return texCache.get(key);
 const p=(async()=>{const b=await monsterBytes(exact),cv=exact.toLowerCase().endsWith(".ozt")?objectOzt(b):await objectOzj(b);return playerRepeatTex(cv)})();
 texCache.set(key,p);return p;
}
function terrainHeightAt(x,y){
 if(!heightMap)return 2;
 x=Math.max(0,Math.min(254.999999,x));y=Math.max(0,Math.min(254.999999,y));
 const ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy,d=heightMap.data;
 const h00=(d[iy*256+ix]||0)*1.5,h10=(d[iy*256+ix+1]||0)*1.5,h01=(d[(iy+1)*256+ix]||0)*1.5,h11=(d[(iy+1)*256+ix+1]||0)*1.5;
 return (h00+(h10-h00)*fx)+((h01+(h11-h01)*fx)-(h00+(h10-h00)*fx))*fy+2;
}
function ensureOverlay(){
 if(overlay)return;
 overlay=document.createElement("canvas");overlay.id="muMonsterOverlay";
 Object.assign(overlay.style,{position:"fixed",inset:"0",width:"100vw",height:"100vh",pointerEvents:"none",zIndex:"7"});
 document.body.appendChild(overlay);ctx=overlay.getContext("2d");
}
function resizeOverlay(){
 ensureOverlay();const d=Math.min(devicePixelRatio||1,1.5),w=Math.max(1,Math.floor(innerWidth*d)),h=Math.max(1,Math.floor(innerHeight*d));
 if(overlay.width!==w||overlay.height!==h){overlay.width=w;overlay.height=h;ctx.setTransform(d,0,0,d,0,0)}
}
function project(m,vp){
 if(!vp)return null;
 const wx=(m.x*100-12750)*.025,wy=m.z*.025+3.7*m.scale,wz=(m.y*100-12750)*.025;
 const cx=vp[0]*wx+vp[4]*wy+vp[8]*wz+vp[12],cy=vp[1]*wx+vp[5]*wy+vp[9]*wz+vp[13],cw=vp[3]*wx+vp[7]*wy+vp[11]*wz+vp[15];
 if(cw<=.02)return null;const nx=cx/cw,ny=cy/cw;if(nx<-1.25||nx>1.25||ny<-1.25||ny>1.25)return null;
 return{x:(nx*.5+.5)*innerWidth,y:(1-(ny*.5+.5))*innerHeight};
}
function makeVao(data,inst){
 const vao=gl.createVertexArray();gl.bindVertexArray(vao);const vb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,vb);gl.bufferData(gl.ARRAY_BUFFER,data,gl.DYNAMIC_DRAW);
 gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,32,0);gl.enableVertexAttribArray(1);gl.vertexAttribPointer(1,3,gl.FLOAT,false,32,12);gl.enableVertexAttribArray(2);gl.vertexAttribPointer(2,2,gl.FLOAT,false,32,24);
 gl.bindBuffer(gl.ARRAY_BUFFER,inst);gl.enableVertexAttribArray(3);gl.vertexAttribPointer(3,4,gl.FLOAT,false,32,0);gl.vertexAttribDivisor(3,1);gl.enableVertexAttribArray(4);gl.vertexAttribPointer(4,4,gl.FLOAT,false,32,16);gl.vertexAttribDivisor(4,1);
 return{vao,vb};
}
async function buildGroup(def){
 const raw=await monsterBytes(def.model);let rig=null,bones=null;
 try{rig=parsePlayerRig(raw);if(rig.actions.length)bones=samplePlayerRig(rig,0,0).bones}catch(e){console.warn("Monster rig",def.model,e)}
 const meshes=parseBmd(raw,bones,0),mobs=[];
 for(let i=0;i<def.spawns.length;i++){
   const [x,y]=def.spawns[i],m=MUCombat.registerMonster({id:def.key+"-"+(i+1),name:def.name,hp:def.hp,maxHp:def.hp,hitRadius:52,x,y,z:terrainHeightAt(x,y),spawnX:x,spawnY:y,scale:def.scale,respawnAt:0});
   m.model=def.model;mobs.push(m);state.active.set(m.id,m);
 }
 const idata=new Float32Array(mobs.length*8),inst=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,inst);gl.bufferData(gl.ARRAY_BUFFER,idata,gl.DYNAMIC_DRAW);
 const renders=[];
 for(const m of meshes){
   if(!m.data.length||/shadow/i.test(m.texture))continue;const v=makeVao(m.data,inst);
   renders.push({vao:v.vao,vb:v.vb,count:m.data.length/8,raw:m.raw,skinData:m.data,tex:await monsterTexture(m.texture)});
 }
 return{def,rig,meshes,renders,mobs,instanceBuffer:inst,instanceData:idata,animTime:0};
}
function updateGroup(g,dt,now){
 if(g.rig?.actions?.length){
   g.animTime+=dt*7;const bones=samplePlayerRig(g.rig,0,g.animTime).bones;
   for(const r of g.renders){r.skinData=skinRawMesh(r.raw,bones,r.skinData);gl.bindBuffer(gl.ARRAY_BUFFER,r.vb);gl.bufferSubData(gl.ARRAY_BUFFER,0,r.skinData)}
 }
 let o=0;
 for(const m of g.mobs){
   if(!m.alive&&m.respawnAt&&now>=m.respawnAt){m.hp=m.maxHp;m.alive=true;m.respawnAt=0;m.x=m.spawnX;m.y=m.spawnY;m.z=terrainHeightAt(m.x,m.y)}
   const q=quatEuler([0,0,Math.PI*.75]);
   g.instanceData[o++]=m.x*100;g.instanceData[o++]=m.y*100;g.instanceData[o++]=m.z;g.instanceData[o++]=m.alive?m.scale:0;
   g.instanceData[o++]=q[0];g.instanceData[o++]=q[1];g.instanceData[o++]=q[2];g.instanceData[o++]=q[3];
 }
 gl.bindBuffer(gl.ARRAY_BUFFER,g.instanceBuffer);gl.bufferSubData(gl.ARRAY_BUFFER,0,g.instanceData);
}
function drawOverlay(vp,now){
 resizeOverlay();ctx.clearRect(0,0,innerWidth,innerHeight);ctx.font="bold 10px Arial";ctx.textAlign="center";
 for(const m of state.active.values()){
   if(!m.alive){m.screenX=m.screenY=null;continue}const p=project(m,vp);if(!p){m.screenX=m.screenY=null;continue}
   m.screenX=p.x;m.screenY=p.y;const ratio=Math.max(0,Math.min(1,m.hp/m.maxHp)),w=54,y=p.y-9;
   ctx.fillStyle="rgba(0,0,0,.72)";ctx.fillRect(p.x-w/2-1,y-1,w+2,7);ctx.fillStyle="#821b16";ctx.fillRect(p.x-w/2,y,w,5);ctx.fillStyle="#d94a31";ctx.fillRect(p.x-w/2,y,w*ratio,5);
   ctx.fillStyle="#f1dfad";ctx.shadowColor="#000";ctx.shadowBlur=2;ctx.fillText(m.name,p.x,y-4);ctx.shadowBlur=0;
 }
 for(let i=damagePops.length-1;i>=0;i--){const d=damagePops[i],age=now-d.born;if(age>750){damagePops.splice(i,1);continue}ctx.globalAlpha=1-age/750;ctx.fillStyle="#ffd55f";ctx.font="bold 13px Arial";ctx.fillText("-"+d.damage,d.x,d.y-age*.035);ctx.globalAlpha=1}
}
function draw(vp,now){
 if(!state.ready||!vp)return;const dt=Math.min(.05,(now-state.lastFrame)/1000||0);state.lastFrame=now;
 for(const g of state.groups)updateGroup(g,dt,now);
 gl.useProgram(objProg);gl.uniformMatrix4fv(objVP,false,vp);gl.uniform1i(objSampler,0);gl.uniform1i(objBlackKey,0);gl.uniform1i(objHideObject,0);gl.disable(gl.CULL_FACE);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.activeTexture(gl.TEXTURE0);
 for(const g of state.groups)for(const r of g.renders){gl.bindTexture(gl.TEXTURE_2D,r.tex);gl.bindVertexArray(r.vao);gl.drawArraysInstanced(gl.TRIANGLES,0,r.count,g.mobs.length)}
 gl.disable(gl.BLEND);gl.enable(gl.CULL_FACE);drawOverlay(vp,now);
}
async function init(){
 try{
   const r=await fetch(MONSTER_DIR+"manifest.json",{cache:"no-store"});if(!r.ok)throw new Error("Monster manifest HTTP "+r.status);state.manifest=await r.json();state.assetsReady=true;
   lowerFiles=new Map(state.manifest.files.map(f=>[f.toLowerCase(),f]));
   heightMap=decodeHeightOZB(await getBytes("TerrainHeight.OZB"));
   for(const def of modelDefs){try{state.groups.push(await buildGroup(def))}catch(e){state.failed.push(def.model);console.warn("Monster omitted",def.model,e)}}
   state.ready=state.groups.length>0;ensureOverlay();window.dispatchEvent(new CustomEvent("mu-monsters-ready",{detail:{groups:state.groups.length,monsters:state.active.size,failed:state.failed}}));
 }catch(e){console.warn("MU monsters",e)}
}
window.addEventListener("mu-monster-damage",e=>{const m=e.detail?.monster;if(!m||!Number.isFinite(m.screenX))return;damagePops.push({x:m.screenX,y:m.screenY-22,damage:e.detail.damage,born:performance.now()})});
window.addEventListener("mu-monster-dead",e=>{const m=e.detail?.monster;if(m)m.respawnAt=performance.now()+6500});

// The game loop lives inside main(), so hook only its named RAF callback without touching movement/camera code.
const nativeRAF=window.requestAnimationFrame.bind(window);
window.requestAnimationFrame=function(cb){
 if(typeof cb==="function"&&cb.name==="frame")return nativeRAF(t=>{cb(t);if(state.ready){let vp=null;try{vp=gl.getUniform(objProg,objVP)}catch(_){}if(vp)draw(vp,t)}});
 return nativeRAF(cb);
};
window.MUMonsters=state;
init();
})();
