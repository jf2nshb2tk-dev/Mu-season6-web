const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const html=fs.readFileSync('index.html','utf8'),sandbox={console,TextDecoder,performance,Event,CustomEvent,EventTarget,setTimeout};sandbox.window=new EventTarget();const c=vm.createContext(sandbox);
vm.runInContext(html.slice(html.indexOf('function muDecrypt('),html.indexOf('async function objectOzj(')),c);
vm.runInContext(html.slice(html.indexOf('function parseTerrainAtt('),html.indexOf('function shader(')),c);
c.att=new Uint8Array(fs.readFileSync('assets/World1/EncTerrain1.att'));c.playerBytes=new Uint8Array(fs.readFileSync('assets/Player/player.bmd'));
vm.runInContext('var flags=parseTerrainAtt(att).flags;var rig=parsePlayerRig(playerBytes)',c);
vm.runInContext(fs.readFileSync('mu-world.js','utf8'),c);const world=c.window.MUWorld;c.MUWorld=world;
world.configure(c.flags,{player:()=>({x:138,y:124}),blocked:()=>false});
assert(world.isSafe(140,128),'unflagged courtyard must still be safe');
assert(!world.canSpawn(140,128));assert(!world.canSpawn(141.5,120.5));
for(const [x,y] of [[180.5,120.5],[183.5,126.5],[178.5,123.5],[180.5,130.5],[185.5,122.5],[177.5,119.5],[177.5,133.5]]){const p=world.findSpawn(x,y);assert(world.canSpawn(...p));assert(!(world.flagsAt(...p)&13))}
vm.runInContext(fs.readFileSync('mu-game-data.js','utf8'),c);c.MUGameData=c.window.MUGameData;
// Profile validation without creating a GL renderer.
const effects=fs.readFileSync('mu-skill-effects.js','utf8').replace('init();','');vm.runInContext(effects,c);
for(const s of Object.values(c.MUGameData.skills)){
 const p=c.window.MUSkillEffects.profile(s);assert(c.rig.actions[p.action]?.nk>1,`missing BMD action ${p.action} for ${s.name}`);
 const sample=vm.runInContext(`samplePlayerRig(rig,${p.action},2).bones`,c);assert(sample.every(b=>[...b.p,...b.q].every(Number.isFinite)),`invalid bones ${s.name}`);
 assert(fs.existsSync('assets/Effect/'+p.texture),`missing texture ${p.texture}`);assert(p.impactMs<p.duration);
}
vm.runInContext(fs.readFileSync('mu-combat.js','utf8'),c);c.MUCombat=c.window.MUCombat;
const safe=c.MUCombat.registerMonster({id:'safe',x:140,y:128,hp:100});assert.equal(c.MUCombat.damage('safe',20),0);assert.equal(safe.hp,100);
const a=c.MUCombat.registerMonster({id:'a',x:180.5,y:120.5,hp:100}),b=c.MUCombat.registerMonster({id:'b',x:181,y:120.5,hp:100});
c.window.dispatchEvent(new CustomEvent('mu-skill-hit',{detail:{from:{x:179,y:120},to:{x:180.5,y:120.5},skill:{kind:'area'},radius:3.2,damage:20}}));assert.equal(a.hp,80);assert.equal(b.hp,80);
const monsterSource=fs.readFileSync('mu-monster-system.js','utf8');
vm.runInContext(monsterSource.slice(monsterSource.indexOf('const modelDefs='),monsterSource.indexOf('const texCache='))+';var spawnDefs=modelDefs;',c);
const occupied=new Set(),spawns=[];
for(const def of c.spawnDefs)for(const seed of def.spawns){const p=world.findSpawn(...seed,occupied);const key=Math.floor(p[1])*256+Math.floor(p[0]);assert(!occupied.has(key));occupied.add(key);spawns.push(p);assert(world.canSpawn(...p));assert(!world.isSafe(...p))}
assert.equal(spawns.length,32);
for(const [x,y] of [[94,126],[175,126],[133,87],[133,169]])assert(spawns.filter(p=>Math.hypot(p[0]-x,p[1]-y)<12).length>=4,'each exit needs a visible nearby group');
const manifest=JSON.parse(fs.readFileSync('mu-skill-model-assets.json','utf8'));
for(const [file,def] of Object.entries(manifest)){
 c.effectBytes=new Uint8Array(fs.readFileSync('assets/'+file));
 const meshes=vm.runInContext('parseBmd(effectBytes)',c);assert(meshes.length,'empty model '+file);
 for(const mesh of meshes){assert(mesh.data.every(Number.isFinite),'nonfinite model '+file);assert(fs.existsSync('assets/'+def.textures[mesh.texture]),'missing model texture '+mesh.texture)}
}
assert.equal(c.window.MUSkillEffects.profile(c.MUGameData.skills[5]).mode,'flame');
assert.equal(c.window.MUSkillEffects.profile(c.MUGameData.skills[14]).origin,'self');
assert.equal(c.window.MUSkillEffects.profile(c.MUGameData.skills[219]).origin,'target');
console.log('PASS: 32 distinct reachable spawns across all four exits; city courtyards, all spawns, safe-zone damage, area hits, all skill textures/BMD action frames');
