from pathlib import Path

p = Path('index.html')
s = p.read_text(encoding='utf-8')

old_list = '''const LORENCIA_NPCS=[
 {id:251,name:"Hanzo the Blacksmith",x:118,y:113,dir:3,model:"Smith01.bmd"},
 {id:254,name:"Pasi the Mage",x:116,y:141,dir:3,model:"Wizard01.bmd"}
];'''
new_list = '''const LORENCIA_NPCS=[
 {id:251,name:"Hanzo the Blacksmith",x:118,y:113,dir:3,model:"Smith01.bmd"},
 {id:254,name:"Pasi the Mage",x:116,y:141,dir:3,model:"Wizard01.bmd"},
 {id:253,name:"Amy the Potion Girl",x:127,y:86,dir:3,skeleton:"Girl01.bmd",parts:["GirlHead01.bmd","GirlUpper01.bmd","GirlLower01.bmd"]},
 {id:255,name:"Lumen the Barmaid",x:123,y:135,dir:3,skeleton:"Female01.bmd",parts:["FemaleHead02.bmd","FemaleUpper02.bmd","FemaleLower02.bmd","FemaleBoots02.bmd"]}
];'''

if old_list in s:
    s = s.replace(old_list, new_list, 1)
elif 'Amy the Potion Girl' not in s or 'Lumen the Barmaid' not in s:
    raise SystemExit('LORENCIA_NPCS block did not match current main')

start = s.index('async function buildLorenciaNPCs(height){')
end = s.index('\n\nasync function buildPlayer(height){', start)
new_builder = r'''async function buildLorenciaNPCs(height){
 const renders=[],npcs=[],failed=[];
 for(const spec of LORENCIA_NPCS){
  try{
   let meshes=[];
   if(spec.parts){
     // Original client LinkParentAnimation behavior: the female merchant body parts
     // use the animation/skeleton from Girl01/Female01 and are skinned by bone name.
     const base=parseBmd(await getNpcBytes(spec.skeleton),null,0),shared=base.skeleton;
     for(const part of spec.parts){
       const pm=parseBmd(await getNpcBytes(part),shared,0);
       meshes.push(...pm);
     }
   }else{
     meshes=parseBmd(await getNpcBytes(spec.model),null,0);
   }
   const tx=Math.max(0,Math.min(255,spec.x)),ty=Math.max(0,Math.min(255,spec.y));
   const z=(height.data[ty*256+tx]||0)*1.5+2;
   const q=npcDirectionQuat(spec.dir),scale=spec.scale||1,idata=new Float32Array([spec.x*100,spec.y*100,z,scale,q[0],q[1],q[2],q[3]]);
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
}'''
s = s[:start] + new_builder + s[end:]

p.write_text(s, encoding='utf-8')
print('Lorencia NPCs updated: Hanzo + Pasi + Amy + Lumen')
