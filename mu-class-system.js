(() => {
"use strict";
if(window.MUClassSystem||!window.MUGameData)return;
const STORE="mu-s6-class-v1";
const classes=MUGameData.classes;
let activeId=localStorage.getItem(STORE);
if(!classes[activeId])activeId="dw";

function applyStats(){
  const c=classes[activeId],s=c.stats;
  playerStats.className=c.name;
  if(!playerStats.name||playerStats.name==="DarkWizard")playerStats.name=c.name.replace(/\s+/g,"");
  playerStats.strength=s.strength;playerStats.dexterity=s.dexterity;playerStats.vitality=s.vitality;playerStats.energy=s.energy;
  playerStats.lifeMax=s.life;playerStats.life=s.life;
  playerStats.manaMax=s.mana;playerStats.mana=s.mana;
  playerStats.agMax=100;playerStats.ag=Math.min(playerStats.ag||100,100);
}
applyStats();

buildPlayer=async function(height){
 const c=classes[activeId],n=String(c.model).padStart(2,"0");
 const models=["HelmClass"+n+".bmd","ArmorClass"+n+".bmd","PantClass"+n+".bmd","GloveClass"+n+".bmd","BootClass"+n+".bmd"];
 const playerBytes=await getPlayerBytes("player.bmd"),rig=parsePlayerRig(playerBytes);
 const idlePose=samplePlayerRig(rig,1,0).bones;
 const spawnTileX=138,spawnTileY=124,spawnZ=(height.data[spawnTileY*256+spawnTileX]||0)*1.5+2;
 const facing=quatEuler([0,0,Math.PI*.25]);
 const idata=new Float32Array([spawnTileX*100,spawnTileY*100,spawnZ,.85,facing[0],facing[1],facing[2],facing[3]]);
 const inst=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,inst);gl.bufferData(gl.ARRAY_BUFFER,idata,gl.DYNAMIC_DRAW);
 const renders=[];let meshesLoaded=0;
 for(const model of models){
   const meshes=parseBmd(await getPlayerBytes(model),idlePose,0);
   for(const m of meshes){
     if(!m.data.length||/shadow/i.test(m.texture))continue;
     const vao=gl.createVertexArray();gl.bindVertexArray(vao);
     const vb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,vb);gl.bufferData(gl.ARRAY_BUFFER,m.data,gl.DYNAMIC_DRAW);
     gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,32,0);
     gl.enableVertexAttribArray(1);gl.vertexAttribPointer(1,3,gl.FLOAT,false,32,12);
     gl.enableVertexAttribArray(2);gl.vertexAttribPointer(2,2,gl.FLOAT,false,32,24);
     gl.bindBuffer(gl.ARRAY_BUFFER,inst);
     gl.enableVertexAttribArray(3);gl.vertexAttribPointer(3,4,gl.FLOAT,false,32,0);gl.vertexAttribDivisor(3,1);
     gl.enableVertexAttribArray(4);gl.vertexAttribPointer(4,4,gl.FLOAT,false,32,16);gl.vertexAttribDivisor(4,1);
     renders.push({vao,vb,count:m.data.length/8,n:1,tex:await playerTexture(m.texture),raw:m.raw,skinData:m.data});
     meshesLoaded++;
   }
 }
 return{renders,parts:models.length,meshes:meshesLoaded,tile:[spawnTileX,spawnTileY],tilePos:[spawnTileX,spawnTileY],instanceBuffer:inst,instanceData:idata,facing:.25*Math.PI,rig,animAction:1,animTime:0,animName:"IDLE",moveAmount:0,classId:activeId};
};

const css=document.createElement("style");
css.textContent=`
#muClassPickerButton{position:absolute;left:103px;top:392px;width:67px;height:25px;z-index:4;border:1px solid #887343;background:#090806d9;color:#e4cc86;border-radius:3px;font:bold 9px Arial;touch-action:manipulation}
#muClassPicker{display:none;position:fixed;z-index:40;left:50%;top:50%;transform:translate(-50%,-50%);width:min(420px,88vw);padding:12px;background:#070706f2;border:1px solid #8c7440;box-shadow:0 12px 45px #000;border-radius:6px;font-family:Arial;color:#ddd}
#muClassPicker.open{display:block}#muClassPicker h3{margin:0 0 9px;text-align:center;color:#e3cb83;font-size:14px}
#muClassGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:5px}
.muClassChoice{min-height:47px;text-align:left;border:1px solid #4c432e;background:#11100d;color:#ddd;border-radius:4px;padding:5px 8px;font:11px Arial}
.muClassChoice b{display:block;color:#e8d18d;margin-bottom:2px}.muClassChoice.current{border-color:#d5b85e;box-shadow:inset 0 0 8px #a77b2444}
#muClassPickerClose{display:block;margin:10px auto 0;border:1px solid #6b5c3a;background:#111;color:#d9c68e;border-radius:3px;padding:5px 18px}
`;
document.head.appendChild(css);

const picker=document.createElement("div");picker.id="muClassPicker";
picker.innerHTML='<h3>Clase del personaje</h3><div id="muClassGrid"></div><button id="muClassPickerClose">Cerrar</button>';
document.body.appendChild(picker);
const grid=picker.querySelector("#muClassGrid");
for(const c of Object.values(classes)){
  const b=document.createElement("button");b.className="muClassChoice"+(c.id===activeId?" current":"");
  b.innerHTML="<b>"+c.name+"</b>"+c.evolutions.join(" → ");
  b.addEventListener("click",()=>setClass(c.id));grid.appendChild(b);
}
picker.querySelector("#muClassPickerClose").addEventListener("click",()=>picker.classList.remove("open"));
const char=document.querySelector("#muCharacter");
if(char){
 const b=document.createElement("button");b.id="muClassPickerButton";b.textContent="CLASE";
 b.addEventListener("click",e=>{e.stopPropagation();picker.classList.add("open")});char.appendChild(b);
}
window.addEventListener("keydown",e=>{if(e.code==="F7"){e.preventDefault();picker.classList.toggle("open")}});

function setClass(id){
 if(!classes[id]||id===activeId){picker.classList.remove("open");return}
 localStorage.setItem(STORE,id);
 localStorage.removeItem("mu-s6-skill-hotkeys-v1");
 location.reload();
}
window.MUClassSystem={get activeId(){return activeId},get active(){return classes[activeId]},setClass,open(){picker.classList.add("open")}};
})();
