from pathlib import Path

p = Path('index.html')
s = p.read_text(encoding='utf-8')

# Correct the two first Lorencia NPC placements if the renderer is already installed.
if 'const LORENCIA_NPCS=' in s:
    old_hanzo = '{id:251,name:"Hanzo the Blacksmith",x:116,y:141,dir:3,model:"Smith01.bmd"}'
    old_pasi = '{id:254,name:"Pasi the Mage",x:118,y:113,dir:3,model:"Wizard01.bmd"}'
    new_hanzo = '{id:251,name:"Hanzo the Blacksmith",x:118,y:113,dir:3,model:"Smith01.bmd"}'
    new_pasi = '{id:254,name:"Pasi the Mage",x:116,y:141,dir:3,model:"Wizard01.bmd"}'
    changed = False
    if old_hanzo in s:
        s = s.replace(old_hanzo, new_hanzo, 1)
        changed = True
    if old_pasi in s:
        s = s.replace(old_pasi, new_pasi, 1)
        changed = True
    if changed:
        p.write_text(s, encoding='utf-8')
        print('Lorencia NPC positions corrected: Hanzo <-> Pasi')
    else:
        print('NPC renderer already present and positions already corrected')
    raise SystemExit(0)

# NPC asset loader
anchor = '''async function getObjectBytes(name){
 const r=await fetch(OBJECT1+name,{cache:"no-store"});
 if(!r.ok) throw new Error(name+" HTTP "+r.status);
 return new Uint8Array(await r.arrayBuffer());
}'''
insert = anchor + '''
const NPC_DIR="assets/NPC/";
async function getNpcBytes(name){
 const r=await fetch(NPC_DIR+name,{cache:"no-store"});
 if(!r.ok) throw new Error("NPC/"+name+" HTTP "+r.status);
 return new Uint8Array(await r.arrayBuffer());
}'''
if s.count(anchor) != 1:
    raise SystemExit(f'getObjectBytes anchor mismatch: {s.count(anchor)}')
s = s.replace(anchor, insert, 1)

# Texture loader from original NPC folder
anchor = 'const OBJ_VS=`#version 300 es'
npc_tex = '''const npcTexCache=new Map();
async function npcTexture(path){
 const f=path.split(String.fromCharCode(92)).join("/").split("/").pop(),dot=f.lastIndexOf("."),base=dot<0?f:f.slice(0,dot),ext=(dot<0?"":f.slice(dot+1)).toLowerCase(),asset=base+(ext==="tga"?".OZT":".OZJ"),key=asset.toLowerCase();
 if(npcTexCache.has(key))return npcTexCache.get(key);
 const promise=(async()=>{try{
   const bytes=await getNpcBytes(asset),cv=asset.toLowerCase().endsWith(".ozt")?objectOzt(bytes):await objectOzj(bytes);
   return playerRepeatTex(cv);
 }catch(e){
   console.warn("NPC texture",asset,e);
   const cv=document.createElement("canvas");cv.width=cv.height=2;const x=cv.getContext("2d");x.fillStyle="#a58c73";x.fillRect(0,0,2,2);return playerRepeatTex(cv);
 }})();
 npcTexCache.set(key,promise);return promise;
}

'''
if s.count(anchor) != 1:
    raise SystemExit(f'OBJ_VS anchor mismatch: {s.count(anchor)}')
s = s.replace(anchor, npc_tex + anchor, 1)

# First verified original Lorencia NPC block: Hanzo + Pasi.
anchor = 'async function buildPlayer(height){'
npc_builder = r'''const LORENCIA_NPCS=[
 {id:251,name:"Hanzo the Blacksmith",x:118,y:113,dir:3,model:"Smith01.bmd"},
 {id:254,name:"Pasi the Mage",x:116,y:141,dir:3,model:"Wizard01.bmd"}
];
function npcDirectionQuat(dir){
 const mapAngle=Math.PI-(dir&7)*Math.PI*.25;
 return quatEuler([0,0,mapAngle+Math.PI*.5]);
}
async function buildLorenciaNPCs(height){
 const renders=[],npcs=[],failed=[];
 for(const spec of LORENCIA_NPCS){
  try{
   const meshes=parseBmd(await getNpcBytes(spec.model),null,0);
   const tx=Math.max(0,Math.min(255,spec.x)),ty=Math.max(0,Math.min(255,spec.y));
   const z=(height.data[ty*256+tx]||0)*1.5+2;
   const q=npcDirectionQuat(spec.dir),idata=new Float32Array([spec.x*100,spec.y*100,z,1,q[0],q[1],q[2],q[3]]);
   const inst=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,inst);gl.bufferData(gl.ARRAY_BUFFER,idata,gl.STATIC_DRAW);
   for(const m of meshes){
    if(!m.data.length||/shadow/i.test(m.texture))continue;
    const vao=gl.createVertexArray();gl.bindVertexArray(vao);
    const vb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,vb);gl.bufferData(gl.ARRAY_BUFFER,m.data,gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);gl.vertexAttribPointer(0,3,gl.FLOAT,false,32,0);
    gl.enableVertexAttribArray(1);gl.vertexAttribPointer(1,3,gl.FLOAT,false,32,12);
    gl.enableVertexAttribArray(2);gl.vertexAttribPointer(2,2,gl.FLOAT,false,32,24);
    gl.bindBuffer(gl.ARRAY_BUFFER,inst);
    gl.enableVertexAttribArray(3);gl.vertexAttribPointer(3,4,gl.FLOAT,false,32,0);gl.vertexAttribDivisor(3,1);
    gl.enableVertexAttribArray(4);gl.vertexAttribPointer(4,4,gl.FLOAT,false,32,16);gl.vertexAttribDivisor(4,1);
    renders.push({vao,count:m.data.length/8,n:1,tex:await npcTexture(m.texture),npc:spec});
   }
   npcs.push(spec);
  }catch(e){failed.push(spec.name);console.warn("NPC omitido",spec.name,e)}
 }
 return{renders,npcs,count:npcs.length,failed};
}

'''
if s.count(anchor) != 1:
    raise SystemExit(f'buildPlayer anchor mismatch: {s.count(anchor)}')
s = s.replace(anchor, npc_builder + anchor, 1)

# Scene state
old = 'let objectScene={renders:[],instances:0,failed:0},playerScene={renders:[],parts:0,meshes:0,tile:[138,124]},objectsReady=false,playerReady=false;'
new = 'let objectScene={renders:[],instances:0,failed:0},npcScene={renders:[],npcs:[],count:0,failed:[]},playerScene={renders:[],parts:0,meshes:0,tile:[138,124]},objectsReady=false,npcsReady=false,playerReady=false;'
if s.count(old) != 1:
    raise SystemExit(f'scene state mismatch: {s.count(old)}')
s = s.replace(old, new, 1)

# Ready status. Keep this tolerant because the status text changed during terrain fixes.
status_candidates = [
    'if(objectsReady&&playerReady)statusEl.textContent="Lorencia · "+objectScene.instances+" objetos · blends MU + Bridge01 corregidos · PJ/cámara OK · ATT";',
    'if(objectsReady&&playerReady)statusEl.textContent="Lorencia · "+objectScene.instances+" objetos · Bridge01 pivot normalizado · PJ/cámara OK · ATT";'
]
found = next((x for x in status_candidates if x in s), None)
if not found:
    raise SystemExit('refresh all-ready status anchor not found')
s = s.replace(found, 'if(objectsReady&&playerReady&&npcsReady)statusEl.textContent="Lorencia · "+objectScene.instances+" objetos · "+npcScene.count+" NPC originales · PJ/cámara/ATT OK";', 1)

# Build after player
anchor = 'buildPlayer(height).then(x=>{playerScene=x;playerReady=true;resetCameraToPlayer();refreshStatus();}).catch(e=>{console.warn("Player",e);statusEl.textContent="Lorencia lista · error cargando personaje";});'
repl = anchor + '\n buildLorenciaNPCs(height).then(x=>{npcScene=x;npcsReady=true;refreshStatus();}).catch(e=>{console.warn("NPC",e);npcsReady=true;refreshStatus();});'
if s.count(anchor) != 1:
    raise SystemExit(f'buildPlayer call mismatch: {s.count(anchor)}')
s = s.replace(anchor, repl, 1)

# Draw NPCs in same object program before player
anchor = '''     // Player textures contain legitimate near-black clothing; never treat black as transparency.
     gl.uniform1i(objBlackKey,0);
     for(const r of playerScene.renders){'''
repl = '''     // NPC/player textures contain legitimate dark clothing; never black-key them.
     gl.uniform1i(objBlackKey,0);
     for(const r of npcScene.renders){
       gl.bindTexture(gl.TEXTURE_2D,r.tex);gl.bindVertexArray(r.vao);
       gl.drawArraysInstanced(gl.TRIANGLES,0,r.count,r.n);
     }
     for(const r of playerScene.renders){'''
if s.count(anchor) != 1:
    raise SystemExit(f'primary render anchor mismatch: {s.count(anchor)}')
s = s.replace(anchor, repl, 1)

# Draw even if Object1 is still loading
anchor = '''   } else if(playerScene.renders.length){
     gl.useProgram(objProg);gl.uniformMatrix4fv(objVP,false,vp);gl.uniform1i(objSampler,0);gl.uniform1i(objBlackKey,0);gl.disable(gl.CULL_FACE);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.activeTexture(gl.TEXTURE0);
     for(const r of playerScene.renders){gl.bindTexture(gl.TEXTURE_2D,r.tex);gl.bindVertexArray(r.vao);gl.drawArraysInstanced(gl.TRIANGLES,0,r.count,r.n)}'''
repl = '''   } else if(playerScene.renders.length||npcScene.renders.length){
     gl.useProgram(objProg);gl.uniformMatrix4fv(objVP,false,vp);gl.uniform1i(objSampler,0);gl.uniform1i(objBlackKey,0);gl.disable(gl.CULL_FACE);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.activeTexture(gl.TEXTURE0);
     for(const r of npcScene.renders){gl.bindTexture(gl.TEXTURE_2D,r.tex);gl.bindVertexArray(r.vao);gl.drawArraysInstanced(gl.TRIANGLES,0,r.count,r.n)}
     for(const r of playerScene.renders){gl.bindTexture(gl.TEXTURE_2D,r.tex);gl.bindVertexArray(r.vao);gl.drawArraysInstanced(gl.TRIANGLES,0,r.count,r.n)}'''
if s.count(anchor) != 1:
    raise SystemExit(f'fallback render anchor mismatch: {s.count(anchor)}')
s = s.replace(anchor, repl, 1)

p.write_text(s, encoding='utf-8')
print('Lorencia NPC renderer patched: Hanzo + Pasi')
