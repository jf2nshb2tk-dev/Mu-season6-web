/* Original client OZJ/OZT textures, animated in world space with depth testing.
 * PlayerAction numbers: Client.Main/Models/PlayerAction.cs (bernatvadell/muonline).
 * Effect trajectories are the web implementation, not the native client's effect engine.
 */
(() => {
"use strict";
const textures=new Map(),active=[],state={ready:false,failed:[],active};
const files=['Fire01.OZJ','Fire02.OZJ','Fire03.OZJ','Flame01.OZJ','inferno.OZJ','lightning.OZJ','JointThunder01.OZJ','JointLaser01.OZJ','JointSpirit01.OZJ','energy01.OZJ','Shiny01.OZJ','Magic_Circle1.OZJ','Shockwave.OZJ','SwordEff.OZJ','snowseff01.OZJ','smoke01.OZJ','Explotion01.OZJ','flareBlue.OZJ','flareRed.OZJ'];
const actions={6:151,10:154,12:152,14:153,15:151,16:147,18:186,19:60,20:61,21:62,22:63,23:64,24:50,26:150,27:150,28:150,30:172,40:153,41:65,42:66,43:71,47:70,48:67,51:50,52:50,53:150,55:60,56:148,57:65,59:71,60:80,61:80,62:87,63:81,64:147,65:80,66:80,77:150,78:80,214:168,215:160,216:164,217:147,218:147,219:156,220:156,221:156,222:156,223:172,224:172,225:172,230:185,235:178,236:184,237:183,260:247,261:248,262:249,263:250,264:253,265:252,266:255,267:256,268:147,269:247,270:254};
function profile(s){
 if(s.basic)return{mode:s.kind==="ranged"?"arrows":"slash",texture:s.kind==="ranged"?"JointLaser01.OZJ":"SwordEff.OZJ",color:[1,.85,.55],action:s.action,duration:420,impactMs:210,life:450};
 const p={mode:'projectile',texture:'energy01.OZJ',color:[.6,.7,1],action:actions[s.id]??146,duration:560,impactMs:320,life:850};
 if(/Poison|Decay|Pollution|Weakness|Enervation/.test(s.name)){p.texture='smoke01.OZJ';p.color=[.3,1,.18];p.mode='cloud'}
 else if(/Lightning|Thunder/.test(s.name)){p.texture='JointThunder01.OZJ';p.color=[.55,.75,1];p.mode='beam'}
 else if(/Ice/.test(s.name)){p.texture='snowseff01.OZJ';p.color=[.45,.85,1]}
 else if(/Fire|Flame|Inferno|Hellfire|Meteorite|Cometfall|Explosion|Phoenix/.test(s.name)){p.texture='Fire01.OZJ';p.color=[1,.6,.25]}
 else if(/Evil Spirit|Requiem|Drain|Sleep|Blind/.test(s.name)){p.texture='JointSpirit01.OZJ';p.color=[.8,.35,1]}
 else if(/Aqua|Power Wave|Force Wave/.test(s.name)){p.texture='JointLaser01.OZJ';p.color=[.3,.7,1];p.mode='beam'}
 if(s.kind==='area'){p.mode='area';p.texture=/Ice/.test(s.name)?'snowseff01.OZJ':/Inferno|Hellfire|Fire/.test(s.name)?'inferno.OZJ':'Shockwave.OZJ';p.life=1100}
 if(s.kind==='melee'||s.kind==='combo'){p.mode='slash';p.texture='SwordEff.OZJ';p.color=[1,.75,.4];p.impactMs=240;p.duration=460}
 if(s.kind==='ranged'){p.mode='arrows';p.texture='JointLaser01.OZJ';p.color=[.7,1,.7]}
 if(s.damage===0){p.mode='aura';p.texture='Magic_Circle1.OZJ';p.color=s.id===26?[.3,1,.4]:[.4,.65,1];p.life=1200}
 if(s.id===2||s.id===13)p.mode='meteor';
 return p;
}
const vs=`#version 300 es
precision highp float;
layout(location=0)in vec2 aCorner;
uniform mat4 uVP;uniform vec3 uCenter,uRight,uUp;uniform vec2 uSize;uniform float uAngle;
out vec2 vUV;
void main(){float c=cos(uAngle),s=sin(uAngle);vec2 p=mat2(c,s,-s,c)*aCorner;gl_Position=uVP*vec4(uCenter+uRight*p.x*uSize.x+uUp*p.y*uSize.y,1.);vUV=aCorner+.5;}`;
const fs=`#version 300 es
precision highp float;
in vec2 vUV;uniform sampler2D uTex;uniform vec3 uTint;uniform float uAlpha;out vec4 o;
void main(){vec4 c=texture(uTex,vUV);o=vec4(c.rgb*uTint,c.a*uAlpha);}`;
let progFX,vao,loc={};
async function init(){
 try{
  progFX=program(vs,fs);for(const n of ['VP','Center','Right','Up','Size','Angle','Tex','Tint','Alpha'])loc[n]=gl.getUniformLocation(progFX,'u'+n);
  vao=gl.createVertexArray();gl.bindVertexArray(vao);const vb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,vb);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-.5,-.5,.5,-.5,.5,.5,-.5,-.5,.5,.5,-.5,.5]),gl.STATIC_DRAW);gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,2,gl.FLOAT,false,0,0);
  await Promise.all(files.map(async name=>{try{const r=await fetch('assets/Effect/'+name);if(!r.ok)throw new Error(name+' '+r.status);const b=new Uint8Array(await r.arrayBuffer()),c=await objectOzj(b),tex=playerRepeatTex(c);gl.bindTexture(gl.TEXTURE_2D,tex);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);textures.set(name,tex)}catch(e){state.failed.push(name);console.warn('MU effect',e)}}));
  state.ready=textures.size>0;
 }catch(e){console.warn('MU effect renderer',e)}
}
const world=p=>[(p.x-127.5)*2.5,p.z*.025,(p.y-127.5)*2.5];
const mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
function draw(vp,now,eye,look){
 if(!state.ready||!active.length)return;
 const f=look.map((v,i)=>v-eye[i]),fl=Math.hypot(...f);for(let i=0;i<3;i++)f[i]/=fl;
 const rl=Math.hypot(f[0],f[2])||1,right=[-f[2]/rl,0,f[0]/rl],up=[right[1]*f[2]-right[2]*f[1],right[2]*f[0]-right[0]*f[2],right[0]*f[1]-right[1]*f[0]];
 gl.useProgram(progFX);gl.uniformMatrix4fv(loc.VP,false,vp);gl.uniform1i(loc.Tex,0);gl.activeTexture(gl.TEXTURE0);gl.bindVertexArray(vao);gl.disable(gl.CULL_FACE);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE);gl.depthMask(false);
 function sprite(tex,c,w,h,alpha,tint,angle=0,ground=false){
  gl.bindTexture(gl.TEXTURE_2D,textures.get(tex)||textures.get('Shiny01.OZJ')||textures.values().next().value);gl.uniform3fv(loc.Center,c);gl.uniform3fv(loc.Right,ground?[1,0,0]:right);gl.uniform3fv(loc.Up,ground?[0,0,1]:up);gl.uniform2f(loc.Size,w,h);gl.uniform1f(loc.Angle,angle);gl.uniform3fv(loc.Tint,tint);gl.uniform1f(loc.Alpha,Math.max(0,alpha));gl.drawArrays(gl.TRIANGLES,0,6);
 }
 for(let i=active.length-1;i>=0;i--){
  const e=active[i],age=now-e.timestamp,p=e.profile;if(age>p.life){active.splice(i,1);continue}if(age<0)continue;
  const start=world(e.from),end=world(e.to);start[1]+=2.4;end[1]+=1.7;
  const flight=Math.max(0,Math.min(1,(age-100)/(p.impactMs-100))),fade=Math.max(0,1-(age-p.impactMs)/(p.life-p.impactMs));
  sprite('Shiny01.OZJ',start,2,2,Math.max(0,1-age/350),p.color,age*.003);
  if(p.mode==='aura'){
   const base=world(e.from);base[1]+=.18;const pulse=1+Math.sin(age*.012)*.12;sprite(p.texture,base,7*pulse,7*pulse,Math.sin(age/p.life*Math.PI)*.75,p.color,age*.001,true);
   for(let j=0;j<6;j++){const a=j*Math.PI/3+age*.004,c=[base[0]+Math.cos(a)*1.8,base[1]+(age*.007+j*.6)%4,base[2]+Math.sin(a)*1.8];sprite('Shiny01.OZJ',c,1,1,fade*.7,p.color)}
  }else if(p.mode==='area'||p.mode==='cloud'){
   const base=world(e.to);base[1]+=.2;const radius=2+Math.min(age/350,1)*6;sprite(p.texture,base,radius,radius,fade*.65,p.color,age*.001,true);
   for(let j=0;j<8;j++){const a=j*Math.PI/4+age*.002,c=[base[0]+Math.cos(a)*radius*.35,base[1]+1+(age*.003+j*.3)%2,base[2]+Math.sin(a)*radius*.35];sprite(p.mode==='cloud'?'smoke01.OZJ':p.texture,c,2.5,3.5,fade*.65,p.color,a)}
  }else if(p.mode==='beam'){
   if(age>=100&&age<p.impactMs+160)for(let j=0;j<=20;j++){const c=mix(start,end,j/20);c[1]+=Math.sin(j*2+Math.floor(age/45))*.25;sprite(p.texture,c,.8,1.6,fade,p.color,j*.5)}
  }else if(p.mode==='slash'){
   const c=mix(start,end,.55);sprite(p.texture,c,5,5,Math.sin(Math.min(1,age/460)*Math.PI),p.color,age*.012);
  }else if(age>=100&&age<=p.impactMs){
   const source=p.mode==='meteor'?[end[0]-2,end[1]+13,end[2]-2]:start;
   const count=p.mode==='arrows'&&(e.skillId===24||e.skillId===235)?3:1;
   for(let j=0;j<count;j++){const c=mix(source,end,flight);c[0]+=(j-(count-1)/2)*Math.sin(flight*Math.PI)*1.2;
    for(let k=4;k>=0;k--){const trail=mix(source,c,Math.max(0,1-k*.035)),tex=p.texture==='Fire01.OZJ'?['Fire01.OZJ','Fire02.OZJ','Fire03.OZJ'][Math.floor(age/65)%3]:p.texture;sprite(tex,trail,2-k*.18,2-k*.18,1-k*.16,p.color,age*.006)}
   }
  }
  if(age>=p.impactMs&&p.mode!=='aura')sprite('Explotion01.OZJ',end,2+(1-fade)*4,2+(1-fade)*4,fade*.85,p.color,age*.001);
 }
 gl.depthMask(true);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.disable(gl.BLEND);gl.enable(gl.CULL_FACE);
}
window.addEventListener('mu-skill-effect',e=>{if(!e.detail.from||!e.detail.to)return;if(active.length>=32)active.shift();active.push({...e.detail,profile:profile(e.detail.skill)})});
window.MUSkillEffects=Object.assign(state,{profile,draw});
init();
})();
