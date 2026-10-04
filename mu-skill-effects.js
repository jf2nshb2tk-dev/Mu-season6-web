/* Original client OZJ/OZT textures, animated in world space with depth testing.
 * PlayerAction numbers: Client.Main/Models/PlayerAction.cs (bernatvadell/muonline).
 * Effect trajectories are the web implementation, not the native client's effect engine.
 */
(() => {
"use strict";
const textures=new Map(),models=new Map(),active=[],state={ready:false,failed:[],active};
// Explicit IDs prevent a skill's class/kind from replacing its intended visual.
// Native references: MuMain ZzzCharacter/ZzzOpenData; BMDs from this client's Data/Skill.
const palette={fire:[1,.62,.28],ice:[.5,.85,1],energy:[.45,.7,1],poison:[.45,1,.25],spirit:[.8,.4,1],gold:[1,.85,.5],heal:[.35,1,.55],red:[1,.3,.22]};
// id, effect, texture, palette, action, origin, optional original BMD
const definitions=[
[1,'cloud','smoke01','poison',146,'target','Poison01'],
[2,'meteor','Fire01','fire',146,'target','Stone01'],
[3,'lightning','JointThunder01','energy',146,'target'],
[4,'projectile','Fire01','fire',146,'target','Fire01'],
[5,'flame','Flame01','fire',146,'target'],
[6,'teleport','Magic_Ground2','energy',151,'self'],
[7,'ice','snowseff01','ice',146,'target','Ice01'],
[8,'twister','smoke01','energy',146,'target','Storm01'],
[9,'spirits','JointSpirit01','spirit',146,'self'],
[10,'hellfire','inferno','fire',154,'self','Circle01'],
[11,'wave','JointLaser01','energy',146,'target','Magic01'],
[12,'beam','JointLaser01','energy',152,'target'],
[13,'comets','Fire01','fire',146,'target','Blast01'],
[14,'inferno','inferno','fire',153,'self','Inferno01'],
[15,'teleport','Magic_Ground2','spirit',151,'self'],
[16,'shield','Shiny01','energy',147,'self','Protect01'],
[17,'projectile','energy01','energy',146,'target'],
[18,'shield','Shiny01','gold',186,'self','Protect02'],
[19,'slash','SwordEff','gold',60,'target'],
[20,'thrust','JointLaser01','gold',61,'target'],
[21,'uppercut','SwordEff','gold',62,'target'],
[22,'spin','SwordEff','gold',63,'self'],
[23,'slash','SwordEff','gold',64,'target'],
[24,'arrows','JointLaser01','gold',50,'target','Arrow01'],
[26,'heal','Shiny01','heal',150,'self'],
[27,'shield','Shiny01','energy',150,'self','Protect01'],
[28,'buff','SwordEff','red',150,'self'],
[30,'summon','Magic_Ground2','gold',172,'self'],
[38,'decay','smoke01','poison',146,'target','Fire01'],
[39,'blizzard','snowseff01','ice',146,'target','blizzard'],
[40,'nova','energy01','gold',73,'self'],
[41,'spin','SwordEff','gold',65,'self'],
[42,'quake','Shockwave','gold',66,'target','GroundStone'],
[43,'thrust','SwordEff','energy',71,'target','deathsp_eff'],
[47,'thrust','JointLaser01','gold',70,'target','RidingSpear01'],
[48,'buff','Shiny01','red',67,'self'],
[51,'arrows','snowseff01','ice',50,'target','ArrowV01'],
[52,'arrows','JointLaser01','energy',50,'target','ArrowLaser01'],
[53,'buff','smoke01','heal',150,'self'],
[55,'spin','SwordEff','fire',65,'self','SwordForce'],
[56,'fan','JointLaser01','energy',145,'target','Magic02'],
[57,'spiral','SwordEff','energy',65,'self'],
[59,'combo','SwordEff','gold',71,'target','combo'],
[60,'wave','JointLaser01','gold',80,'target','WaveForce'],
[61,'burst','Fire01','fire',80,'target','Fire01'],
[62,'quake','Shockwave','gold',87,'self','EarthQuake01'],
[63,'teleport','Magic_Ground2','gold',81,'self','Circle02'],
[64,'buff','Shiny01','gold',147,'self','DarkLordSkill'],
[65,'lightning','JointThunder01','energy',152,'target'],
[66,'projectile','energy01','gold',80,'target','airforce'],
[77,'buff','JointLaser01','gold',150,'self','ArrowNature01'],
[78,'scream','Fire01','fire',80,'target','darkfirescrem02'],
[214,'drain','JointSpirit01','red',168,'target'],
[215,'chain','JointThunder01','energy',160,'target'],
[216,'orb','energy01','energy',164,'target'],
[217,'shield','Shiny01','spirit',147,'self','Protect02'],
[218,'buff','Flame01','red',147,'self'],
[219,'curse','JointSpirit01','spirit',156,'target'],
[220,'curse','smoke01','spirit',156,'target'],
[221,'curse','smoke01','poison',156,'target'],
[222,'curse','JointSpirit01','red',156,'target'],
[223,'explosion','Fire01','fire',172,'target','summon_sahamutt'],
[224,'requiem','JointSpirit01','spirit',172,'target','summon_neil'],
[225,'pollution','smoke01','poison',172,'target','summon_lagul'],
[230,'shock','JointThunder01','energy',185,'self'],
[235,'arrows','JointLaser01','gold',178,'target','ArrowDouble01'],
[236,'flamestrike','Flame01','fire',184,'target','Effect/FlameStrike.bmd'],
[237,'storm','JointThunder01','energy',183,'target'],
[260,'punch','Shiny01','gold',247,'target'],
[261,'uppercut','SwordEff','red',248,'target'],
[262,'combo','Shiny01','fire',249,'target'],
[263,'darkside','JointSpirit01','spirit',250,'target'],
[264,'roar','Shockwave','gold',253,'self','dragonhead'],
[265,'kick','SwordEff','energy',252,'target'],
[266,'buff','Shiny01','red',255,'self'],
[267,'heal','Shiny01','heal',256,'self'],
[268,'shield','Shiny01','gold',147,'self','Protect01'],
[269,'punch','Shockwave','red',247,'target'],
[270,'phoenix','Fire01','fire',254,'target']
];
const profiles=new Map(definitions.map(([id,mode,texture,color,action,origin,model])=>[id,{id,mode,texture:texture+'.OZJ',color:palette[color],action,origin,model:model?(model.includes('/')?model:'Skill/'+model+'.bmd'):null,
 duration:id===40?1100:650,releaseMs:id===40?650:150,impactMs:id===40?850:400,life:id===40?1700:1200}]));
function profile(s){
 if(s.basic)return{mode:s.kind==='ranged'?'arrows':'slash',texture:s.kind==='ranged'?'JointLaser01.OZJ':'SwordEff.OZJ',color:palette.gold,action:s.action,origin:'target',duration:420,releaseMs:90,impactMs:210,life:500};
 const p=profiles.get(s.id);if(!p)throw new Error('Missing skill visual '+s.id);return p;
}
for(const p of profiles.values()){
 if(['slash','thrust','uppercut','punch','kick','combo','darkside','spin','spiral'].includes(p.mode))Object.assign(p,{duration:500,releaseMs:110,impactMs:270,life:780});
 if(p.mode==='arrows')Object.assign(p,{duration:520,releaseMs:130,impactMs:340,life:850});
}
const files=[...new Set([...profiles.values()].map(p=>p.texture).concat(['Shiny01.OZJ','Shockwave.OZJ','Magic_Ground2.OZJ','smoke01.OZJ','Explotion01.OZJ','JointThunder01.OZJ']))];
const vs=`#version 300 es
precision highp float;
layout(location=0)in vec2 aCorner;
uniform mat4 uVP;uniform vec3 uCenter,uRight,uUp;uniform vec2 uSize;uniform vec4 uUVRect;uniform float uAngle;
out vec2 vUV;
void main(){float c=cos(uAngle),s=sin(uAngle);vec2 p=mat2(c,s,-s,c)*aCorner;gl_Position=uVP*vec4(uCenter+uRight*p.x*uSize.x+uUp*p.y*uSize.y,1.);vUV=uUVRect.xy+vec2(aCorner.x+.5,.5-aCorner.y)*uUVRect.zw;}`;
const fs=`#version 300 es
precision highp float;
in vec2 vUV;uniform sampler2D uTex;uniform vec3 uTint;uniform float uAlpha;out vec4 o;
void main(){vec4 c=texture(uTex,vUV);o=vec4(c.rgb*uTint,c.a*uAlpha);}`;
let progFX,vao,loc={};
async function init(){
 try{
  progFX=program(vs,fs);for(const n of ['VP','Center','Right','Up','Size','UVRect','Angle','Tex','Tint','Alpha'])loc[n]=gl.getUniformLocation(progFX,'u'+n);
  vao=gl.createVertexArray();gl.bindVertexArray(vao);const vb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,vb);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-.5,-.5,.5,-.5,.5,.5,-.5,-.5,.5,.5,-.5,.5]),gl.STATIC_DRAW);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
  await Promise.all(files.map(async name=>{try{const r=await fetch('assets/Effect/'+name);if(!r.ok)throw new Error(name+' '+r.status);const b=new Uint8Array(await r.arrayBuffer()),c=await objectOzj(b),tex=playerRepeatTex(c);gl.bindTexture(gl.TEXTURE_2D,tex);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);textures.set(name,tex)}catch(e){state.failed.push(name);console.warn('MU effect',e)}}));
  await loadModels();
  state.ready=files.every(f=>textures.has(f));

 }catch(e){console.warn('MU effect renderer',e)}
}
// Original BMD geometry, bone animation and textures. Resource paths are validated
// at build time in mu-skill-model-assets.json, including case-sensitive filenames.
let modelProgram,modelLoc={};
async function loadModels(){
 const response=await fetch('mu-skill-model-assets.json?v=skill-fx3');if(!response.ok)throw Error('Skill model manifest');const manifest=await response.json();
 modelProgram=program(`#version 300 es
 precision highp float;layout(location=0)in vec3 aPos;layout(location=2)in vec2 aUV;
 uniform mat4 uVP;uniform vec3 uCenter,uOffset;uniform float uScale,uAngle;out vec2 vUV;
 void main(){vec3 p=(aPos-uOffset)*uScale;float c=cos(uAngle),s=sin(uAngle);gl_Position=uVP*vec4(uCenter+vec3(p.x*c-p.y*s,p.z,p.x*s+p.y*c),1.);vUV=aUV;}`,fs);
 for(const n of ['VP','Center','Offset','Scale','Angle','Tex','Tint','Alpha'])modelLoc[n]=gl.getUniformLocation(modelProgram,'u'+n);
 const cache=new Map();
 async function texture(path){if(!cache.has(path))cache.set(path,(async()=>{const r=await fetch('assets/'+path);if(!r.ok)throw Error(path);const bytes=new Uint8Array(await r.arrayBuffer());return playerRepeatTex(/\.ozt$/i.test(path)?objectOzt(bytes):await objectOzj(bytes))})());return cache.get(path)}
 const entries=Object.entries(manifest);let next=0;
 async function worker(){while(next<entries.length){const [path,entry]=entries[next++];try{
  const r=await fetch('assets/'+path);if(!r.ok)throw Error(path);const raw=new Uint8Array(await r.arrayBuffer()),rig=parsePlayerRig(raw),meshes=parseBmd(raw),lo=[Infinity,Infinity,Infinity],hi=[-Infinity,-Infinity,-Infinity];
  // Include animated poses so collapsing/expanding meshes keep a stable scale.
  for(let frame=0;frame<Math.max(1,rig.actions[0]?.nk||1);frame+=2){const bones=samplePlayerRig(rig,0,frame).bones;for(const m of meshes){const d=skinRawMesh(m.raw,bones);for(let i=0;i<d.length;i+=8)for(let j=0;j<3;j++){lo[j]=Math.min(lo[j],d[i+j]);hi[j]=Math.max(hi[j],d[i+j])}}}
  const offset=[(lo[0]+hi[0])/2,(lo[1]+hi[1])/2,lo[2]],extent=Math.max(...hi.map((v,i)=>v-lo[i]),1),renders=[];
  for(const m of meshes){if(!m.data.length)continue;const tex=await texture(entry.textures[m.texture]),vao=gl.createVertexArray(),vb=gl.createBuffer();gl.bindVertexArray(vao);gl.bindBuffer(gl.ARRAY_BUFFER,vb);gl.bufferData(gl.ARRAY_BUFFER,m.data,gl.DYNAMIC_DRAW);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,32,0);gl.enableVertexAttribArray(2);gl.vertexAttribPointer(2,2,gl.FLOAT,false,32,24);renders.push({vao,vb,tex,raw:m.raw,data:m.data})}
  models.set(path,{rig,renders,offset,extent,lastFrame:-1});
 }catch(e){state.failed.push(path);console.warn('MU skill model',path,e)}}}
 await Promise.all(Array.from({length:4},worker));
}
function drawModel(path,center,size,angle,alpha,color,age,vp){
 const m=models.get(path);if(!m||alpha<=0)return;
 const solid=/summon_|Stone|dragonhead/.test(path);if(solid)gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
 const clip=m.rig.actions[0],frame=Math.floor(Math.max(0,age)*.012*10)/10;
 if(clip?.nk>1&&frame!==m.lastFrame){const bones=samplePlayerRig(m.rig,0,frame).bones;for(const r of m.renders){skinRawMesh(r.raw,bones,r.data);gl.bindBuffer(gl.ARRAY_BUFFER,r.vb);gl.bufferSubData(gl.ARRAY_BUFFER,0,r.data)}m.lastFrame=frame}
 gl.useProgram(modelProgram);gl.uniformMatrix4fv(modelLoc.VP,false,vp);gl.uniform3fv(modelLoc.Center,center);gl.uniform3fv(modelLoc.Offset,m.offset);gl.uniform1f(modelLoc.Scale,size/m.extent);gl.uniform1f(modelLoc.Angle,angle);gl.uniform1i(modelLoc.Tex,0);gl.uniform3fv(modelLoc.Tint,solid?[1,1,1]:color);gl.uniform1f(modelLoc.Alpha,Math.max(0,alpha));
 for(const r of m.renders){gl.bindVertexArray(r.vao);gl.bindTexture(gl.TEXTURE_2D,r.tex);gl.drawArrays(gl.TRIANGLES,0,r.data.length/8)}
 if(solid)gl.blendFunc(gl.SRC_ALPHA,gl.ONE);
}

const world=p=>[(p.x-127.5)*2.5,p.z*.025,(p.y-127.5)*2.5];
const mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
function draw(vp,now,eye,look){
 if(!state.ready||!active.length)return;
 const f=look.map((v,i)=>v-eye[i]),fl=Math.hypot(...f);for(let i=0;i<3;i++)f[i]/=fl;
 const rl=Math.hypot(f[0],f[2])||1,right=[-f[2]/rl,0,f[0]/rl],up=[right[1]*f[2]-right[2]*f[1],right[2]*f[0]-right[0]*f[2],right[0]*f[1]-right[1]*f[0]];
 gl.useProgram(progFX);gl.uniformMatrix4fv(loc.VP,false,vp);gl.uniform1i(loc.Tex,0);gl.activeTexture(gl.TEXTURE0);gl.bindVertexArray(vao);gl.disable(gl.CULL_FACE);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);gl.depthMask(false);
 function sprite(tex,c,w,h,alpha,tint,angle=0,ground=false){
  // Fire01 and Explotion01 are atlases, not single sprites. Never sample the
  // unused white cells at the bottom of Explotion01.
  const frame=tex==='Fire01.OZJ'?Math.floor(now/85)%4:tex==='Explotion01.OZJ'?Math.min(9,Math.floor(currentImpactAge/65)):0;
  gl.uniform4fv(loc.UVRect,tex==='Fire01.OZJ'?[frame/4,0,.25,1]:tex==='Explotion01.OZJ'?[(frame%4)/4,Math.floor(frame/4)/4,.25,.25]:[0,0,1,1]);
  gl.bindTexture(gl.TEXTURE_2D,textures.get(tex)||textures.get('Shiny01.OZJ')||textures.values().next().value);gl.uniform3fv(loc.Center,c);gl.uniform3fv(loc.Right,ground?[1,0,0]:right);gl.uniform3fv(loc.Up,ground?[0,0,1]:up);gl.uniform2f(loc.Size,w,h);gl.uniform1f(loc.Angle,angle);gl.uniform3fv(loc.Tint,tint);gl.uniform1f(loc.Alpha,Math.max(0,alpha));gl.drawArrays(gl.TRIANGLES,0,6);
 }
 let currentImpactAge=0;
 const segment=(tex,a,b,width,alpha,color)=>{
  if(tex==='Fire01.OZJ')gl.uniform4f(loc.UVRect,(Math.floor(now/85)%4)/4,0,.25,1);else gl.uniform4f(loc.UVRect,0,0,1,1);
  const d=b.map((v,i)=>v-a[i]),len=Math.hypot(...d);if(len<.001)return;
  const axis=d.map(v=>v/len),cross=[axis[1]*f[2]-axis[2]*f[1],axis[2]*f[0]-axis[0]*f[2],axis[0]*f[1]-axis[1]*f[0]],n=Math.hypot(...cross)||1;
  gl.uniform3fv(loc.Center,mix(a,b,.5));gl.uniform3fv(loc.Right,axis);gl.uniform3fv(loc.Up,cross.map(v=>v/n));gl.uniform2f(loc.Size,len,width);gl.uniform1f(loc.Angle,0);gl.uniform3fv(loc.Tint,color);gl.uniform1f(loc.Alpha,Math.max(0,alpha));gl.bindTexture(gl.TEXTURE_2D,textures.get(tex));gl.drawArrays(gl.TRIANGLES,0,6);
 };
 for(let i=active.length-1;i>=0;i--){
  const e=active[i],age=now-e.timestamp,p=e.profile;if(age>=p.life){active.splice(i,1);continue}if(age<0)continue;
  const base=world(p.origin==='self'?e.from:e.to);base[1]+=.12;
  if(!e.launch&&age>=p.releaseMs)e.launch=window.MUWorld?.socket?.(42)||{...e.from,z:e.from.z+96};
  const start=world(e.launch||{...e.from,z:e.from.z+96}),end=world(e.to);end[1]+=1.7;
  const t=Math.max(0,Math.min(1,(age-p.releaseMs)/(p.impactMs-p.releaseMs))),u=Math.max(0,(age-p.impactMs)/(p.life-p.impactMs)),fade=1-Math.min(1,u),released=age>=p.releaseMs,hit=age>=p.impactMs;
  currentImpactAge=Math.max(0,age-p.impactMs);
  const pulse=Math.sin(Math.min(1,age/p.life)*Math.PI),dir=end.map((v,j)=>v-start[j]),len=Math.hypot(dir[0],dir[2])||1,forward=[dir[0]/len,0,dir[2]/len],side=[-forward[2],0,forward[0]],angle=Math.atan2(forward[0],forward[2]);
  const add=(a,b,k=1)=>a.map((v,j)=>v+b[j]*k);
  const ball=(c,size=1.5,alpha=fade,tex=p.texture)=>sprite(tex,c,size,size,alpha,p.color,age*.002);
  const ring=(c,size,alpha=fade,tex='Shockwave.OZJ')=>sprite(tex,c,size,size,alpha,p.color,age*.0006,true);
  const mesh=(c,size=4,rotation=angle,alpha=fade)=>{drawModel(p.model,c,size,rotation,alpha,p.color,age-p.releaseMs,vp);gl.useProgram(progFX);gl.bindVertexArray(vao)};
  const bolt=(a,b,seed=0)=>{let prev=a;for(let j=1;j<=12;j++){const c=mix(a,b,j/12);if(j<12){const jitter=Math.sin(j*79+Math.floor(age/65)*17+seed)*.35;c[0]+=jitter;c[1]+=Math.cos(j*43+seed+Math.floor(age/65))*.35;c[2]-=jitter}segment('JointThunder01.OZJ',prev,c,.45,fade,p.color);prev=c}};
  const particles=(center,count=10,radius=3,tex=p.texture)=>{for(let j=0;j<count;j++){const a=j*2.399+age*.001,c=[center[0]+Math.cos(a)*radius,center[1]+.6+((age*.004+j*.37)%2.5),center[2]+Math.sin(a)*radius];ball(c,1.3,fade*.65,tex)}};
  // The release glow is confined to the windup; no universal explosion on impact.
  if(age<p.releaseMs)ball(start,1+age/p.releaseMs,.5,'Shiny01.OZJ');
  if(!released)continue;
  switch(p.mode){
  case 'projectile':case 'wave':case 'burst':case 'orb':case 'phoenix':{
   if(!hit){const c=mix(start,end,t);mesh(c,p.mode==='wave'?3:1.6);for(let j=0;j<5;j++)ball(mix(start,end,Math.max(0,t-j*.05)),1.5-j*.18,(1-j*.16));
    if(p.mode==='phoenix')for(const sign of [-1,1])segment(p.texture,c,add(add(c,side,sign*2.8),forward,-1),1.2,1,p.color);
    if(p.mode==='orb')for(let j=0;j<3;j++)bolt(c,add(c,[Math.cos(j*2+age*.01),Math.sin(age*.01),Math.sin(j*2+age*.01)],1.7),j);
   }else{ball(end,1.5+u*3,fade*.8);if(p.mode==='burst')particles(end,7,2);if(p.mode==='orb')bolt(end,add(end,[0,3,0]));}break;
  }
  case 'meteor':case 'comets':case 'blizzard':{
   const count=p.mode==='meteor'?1:p.mode==='comets'?3:9;
   for(let j=0;j<count;j++){const a=j*2.399,r=j===0?0:2.6,ground=[end[0]+Math.cos(a)*r,base[1],end[2]+Math.sin(a)*r],fall=[ground[0]-2,ground[1]+12,ground[2]-1],ft=Math.min(1,Math.max(0,t*1.35-j*.04)),c=mix(fall,ground,ft);if(ft<1){mesh(c,p.mode==='blizzard'?2:2.8,angle+j);segment(p.texture,add(c,[1,4,.5]),c,1.2,fade,p.color)}else{ball(add(ground,[0,1,0]),2+u*2);if(p.mode==='blizzard')mesh(ground,2,angle+j)}}break;
  }
  case 'flame':case 'flamestrike':{
   if(p.mode==='flamestrike'){mesh(mix(start,end,.45),8);for(let j=0;j<7;j++)ball(add(mix(start,end,j/6),[0,Math.sin(age*.01+j)*.4,0]),2,fade)}
   else{for(let j=0;j<7;j++){const a=j*2.399,c=[base[0]+Math.cos(a)*.9,base[1]+1.3+(j%3)*.4,base[2]+Math.sin(a)*.9];sprite(p.texture,c,1.8,3.5+Math.sin(age*.02+j)*.7,fade,p.color)}}break;
  }
  case 'cloud':case 'decay':case 'pollution':particles(base,12,2.8);ring(base,6,fade*.35,'Magic_Ground2.OZJ');mesh(base,p.mode==='pollution'?5:3,age*.001,fade*.5);break;
  case 'ice':mesh(base,4,0);particles(base,6,1.2);break;
  case 'twister':{const c=mix(start,end,t);c[1]=base[1];mesh(c,6,age*.008);for(let j=0;j<12;j++){const a=j*2+age*.015,r=.3+j*.13;ball([c[0]+Math.cos(a)*r,c[1]+j*.3,c[2]+Math.sin(a)*r],1,fade*.35)}break}
  case 'lightning':case 'beam':case 'chain':case 'drain':{
   if(p.mode==='beam'){segment(p.texture,start,end,1.6,fade,p.color);segment(p.texture,start,end,.45,fade,[1,1,1])}
   else if(p.mode==='drain'){for(let j=0;j<12;j++){const phase=(age*.0015+j/12)%1,c=mix(end,start,phase);c[1]+=Math.sin(phase*Math.PI)*1.3;ball(c,.6,fade)}}
   else{bolt(start,end);if(p.mode==='chain')for(const m of e.chain||[]){const c=world(m);c[1]+=1.7;bolt(end,c,3)}}ball(end,2,fade*.8,'Shiny01.OZJ');break;
  }
  case 'spirits':for(let j=0;j<4;j++){const a=j*Math.PI/2;for(let k=0;k<10;k++){const r=Math.max(0,(age-p.releaseMs)*.012-k*.4),c=[start[0]+Math.cos(a)*r,start[1]+Math.sin(r*.5)*.5,start[2]+Math.sin(a)*r];ball(c,1.3-k*.08,fade*(1-k*.08))}}break;
  case 'arrows':case 'fan':case 'scream':{
   const count=p.mode==='fan'?5:p.mode==='scream'||e.skillId===24?3:e.skillId===235?5:1;
   for(let j=0;j<count;j++){const offset=(j-(count-1)/2)*.9,dest=add(end,side,offset),c=mix(start,dest,t);if(!hit){mesh(c,p.mode==='arrows'?2.2:3);segment(p.texture,add(c,forward,-2),c,p.mode==='arrows'?.25:1,fade,p.color)}else ball(dest,1.3,fade*.5,'Shiny01.OZJ')}break;
  }
  case 'slash':case 'uppercut':case 'thrust':case 'punch':case 'kick':case 'combo':case 'darkside':{
   const c=mix(start,end,.65),sw=Math.sin(Math.min(1,t)*Math.PI),count=p.mode==='combo'?3:p.mode==='darkside'?4:1;
   for(let j=0;j<count;j++){const q=Math.max(0,Math.min(1,(age-p.releaseMs-j*65)/250)),alpha=Math.sin(q*Math.PI);if(p.mode==='thrust')segment(p.texture,start,mix(start,end,q),.8,alpha,p.color);else sprite(p.texture,add(c,side,(j-(count-1)/2)*.7),p.mode==='punch'?2:4,p.mode==='uppercut'?5:2.5,alpha,p.color,(p.mode==='uppercut'?-1:1)*q*2+j*1.1)}
   if(p.model)mesh(c,4);if(hit)ball(end,1.6,fade*.4,'Shiny01.OZJ');break;
  }
  case 'spin':case 'spiral':{for(let j=0;j<3;j++){const a=age*.013+j*Math.PI*2/3,c=[base[0]+Math.cos(a)*2,base[1]+1.4+(p.mode==='spiral'?j*.7:0),base[2]+Math.sin(a)*2];sprite(p.texture,c,4,1.5,fade,p.color,a,true)}mesh(base,5,age*.01);break}
  case 'quake':case 'roar':if(hit){ring(base,2+u*12);mesh(base,p.mode==='roar'?5:7);particles(base,9,1+u*4,'smoke01.OZJ')}break;
  case 'hellfire':case 'inferno':case 'nova':{
   ring(base,6+u*8,pulse,'Magic_Ground2.OZJ');mesh(base,p.mode==='inferno'?9:7,age*.001);
   if(hit)for(let j=0;j<12;j++){const a=j*Math.PI/6,r=p.mode==='hellfire'?2.5:p.mode==='nova'?u*13:3+u*3,c=[base[0]+Math.cos(a)*r,base[1]+1.4,base[2]+Math.sin(a)*r];ball(c,p.mode==='nova'?1.8:3,fade)}break;
  }
  case 'shield':for(let j=0;j<8;j++){const a=age*.003+j*Math.PI/4;ball([base[0]+Math.cos(a)*1.6,base[1]+2+Math.sin(a*2)*.6,base[2]+Math.sin(a)*1.6],.9,pulse)}mesh(add(base,[0,1,0]),4,age*.002,pulse*.6);break;
  case 'buff':case 'heal':case 'teleport':case 'summon':{
   ring(base,5,pulse,'Magic_Ground2.OZJ');particles(base,8,1.3,p.mode==='buff'?p.texture:'Shiny01.OZJ');mesh(base,4,age*.001,pulse);
   if(p.mode==='heal')for(let j=0;j<4;j++){const c=add(base,[Math.cos(j*1.57),1+(age*.004+j*.7)%3,Math.sin(j*1.57)]);segment('Shiny01.OZJ',add(c,[-.3,0,0]),add(c,[.3,0,0]),.22,pulse,p.color);segment('Shiny01.OZJ',add(c,[0,-.4,0]),add(c,[0,.4,0]),.22,pulse,p.color)}
   if(p.mode==='teleport')for(let j=0;j<4;j++)ring(add(base,[0,j*.8,0]),4*(1-j*.12),pulse);break;
  }
  case 'curse':{const c=add(base,[0,3.5,0]);ring(base,4,pulse,'Magic_Ground2.OZJ');for(let j=0;j<4;j++){const a=age*.004+j*Math.PI/2;ball(add(c,[Math.cos(a),Math.sin(a*2)*.3,Math.sin(a)]),.8,pulse)}break}
  case 'explosion':case 'requiem':{mesh(base,5,angle,pulse);ring(base,6,pulse,'Magic_Ground2.OZJ');if(hit){particles(base,10,2.5);if(p.mode==='explosion')ball(add(base,[0,2,0]),4+u*3,fade,'Explotion01.OZJ');else for(let j=0;j<5;j++)segment(p.texture,add(base,[Math.cos(j)*2,0,Math.sin(j)*2]),add(base,[0,5,0]),.6,fade,p.color)}break}
  case 'shock':case 'storm':{ring(base,7,fade*.4);for(let j=0;j<6;j++){const a=j*Math.PI/3,c=[base[0]+Math.cos(a)*3,base[1],base[2]+Math.sin(a)*3];bolt(add(c,[0,p.mode==='storm'?9:3,0]),p.mode==='storm'?c:add(base,[0,1.5,0]),j)}break}
  }
 }
 gl.depthMask(true);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.disable(gl.BLEND);gl.enable(gl.CULL_FACE);
}
window.addEventListener('mu-skill-effect',e=>{if(!e.detail.from||!e.detail.to)return;if(active.length>=32)active.shift();active.push({...e.detail,profile:profile(e.detail.skill),chain:[...(window.MUCombat?.monsters.values()||[])].filter(m=>m.alive&&m.id!==e.detail.targetId&&!window.MUWorld?.isSafe(m.x,m.y)&&Math.hypot(m.x-e.detail.to.x,m.y-e.detail.to.y)<5).slice(0,2).map(m=>({x:m.x,y:m.y,z:m.z}))})});
window.MUSkillEffects=Object.assign(state,{profile,draw});
init();
})();
