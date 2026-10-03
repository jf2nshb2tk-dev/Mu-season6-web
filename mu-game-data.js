(() => {
"use strict";
if(window.MUGameData)return;

const classes={
  dw:{id:"dw",model:1,name:"Dark Wizard",evolutions:["Dark Wizard","Soul Master","Grand Master"],stats:{strength:18,dexterity:18,vitality:15,energy:30,life:100,mana:120},skills:[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,38,39,40]},
  dk:{id:"dk",model:2,name:"Dark Knight",evolutions:["Dark Knight","Blade Knight","Blade Master"],stats:{strength:28,dexterity:20,vitality:25,energy:10,life:130,mana:70},skills:[18,19,20,21,22,23,41,42,43,47,48,59]},
  elf:{id:"elf",model:3,name:"Fairy Elf",evolutions:["Fairy Elf","Muse Elf","High Elf"],stats:{strength:22,dexterity:25,vitality:20,energy:15,life:110,mana:90},skills:[24,26,27,28,30,51,52,53,77,235]},
  mg:{id:"mg",model:4,name:"Magic Gladiator",evolutions:["Magic Gladiator","Duel Master"],stats:{strength:26,dexterity:26,vitality:26,energy:26,life:125,mana:115},skills:[3,5,7,8,9,10,11,12,13,14,22,38,39,41,55,56,57,236,237]},
  dl:{id:"dl",model:5,name:"Dark Lord",evolutions:["Dark Lord","Lord Emperor"],stats:{strength:26,dexterity:20,vitality:20,energy:15,life:125,mana:90},skills:[60,61,62,63,64,65,66,78]},
  sum:{id:"sum",model:6,name:"Summoner",evolutions:["Summoner","Bloody Summoner","Dimension Master"],stats:{strength:21,dexterity:21,vitality:18,energy:23,life:105,mana:125},skills:[214,215,216,217,218,219,220,221,222,223,224,225,230]},
  rf:{id:"rf",model:7,name:"Rage Fighter",evolutions:["Rage Fighter","Fist Master"],stats:{strength:32,dexterity:27,vitality:25,energy:20,life:140,mana:80},skills:[260,261,262,263,264,265,266,267,268,269,270]}
};

const raw=[
[1,"Poison",9,620,15,"magic"],[2,"Meteorite",8,520,18,"magic"],[3,"Lightning",10,520,20,"magic"],[4,"Fire Ball",9,500,19,"magic"],[5,"Flame",12,620,23,"magic"],[6,"Teleport",20,850,0,"movement"],[7,"Ice",12,620,21,"magic"],[8,"Storm",16,760,27,"magic"],[9,"Evil Spirit",18,720,30,"magic"],[10,"Hellfire",22,900,36,"area"],[11,"Power Wave",12,540,22,"magic"],[12,"Aqua Beam",18,720,31,"magic"],[13,"Cometfall",20,760,34,"magic"],[14,"Inferno",24,920,39,"area"],[15,"Teleport Ally",25,900,0,"support"],[16,"Soul Barrier",24,1200,0,"buff"],[17,"Energy Ball",8,420,17,"magic"],
[18,"Defense",6,650,0,"buff"],[19,"Falling Slash",8,430,21,"melee"],[20,"Lunge",8,430,22,"melee"],[21,"Uppercut",9,460,23,"melee"],[22,"Cyclone",10,480,25,"melee"],[23,"Slash",9,450,24,"melee"],[24,"Triple Shot",10,470,23,"ranged"],[26,"Heal",12,700,0,"support"],[27,"Greater Defense",14,900,0,"buff"],[28,"Greater Damage",14,900,0,"buff"],[30,"Summon",22,1400,0,"summon"],
[38,"Decay",24,780,38,"magic"],[39,"Ice Storm",26,880,40,"area"],[40,"Nova",32,1200,50,"area"],[41,"Twisting Slash",12,520,30,"area"],[42,"Rageful Blow",18,700,38,"melee"],[43,"Death Stab",16,620,36,"melee"],[47,"Impale",15,620,34,"melee"],[48,"Swell Life",22,1100,0,"buff"],[51,"Ice Arrow",16,620,31,"ranged"],[52,"Penetration",18,650,34,"ranged"],[53,"Greater AG",20,1100,0,"buff"],[55,"Fire Slash",18,620,36,"melee"],[56,"Power Slash",20,700,39,"melee"],[57,"Spiral Slash",18,650,37,"melee"],[59,"Combo",20,700,48,"combo"],
[60,"Force Wave",12,500,24,"magic"],[61,"Fire Burst",18,650,35,"magic"],[62,"Earthquake",22,760,40,"area"],[63,"Party Teleport",28,1000,0,"support"],[64,"Critical Damage",20,1100,0,"buff"],[65,"Thunder Strike",18,650,36,"magic"],[66,"Force",14,540,28,"magic"],[77,"Infinity Arrow",22,1100,0,"buff"],[78,"Fire Scream",24,780,41,"area"],
[214,"Drain Life",16,600,30,"curse"],[215,"Chain Lightning",18,650,34,"magic"],[216,"Lightning Orb",16,600,31,"magic"],[217,"Damage Reflection",22,1000,0,"buff"],[218,"Berserker",24,1100,0,"buff"],[219,"Sleep",20,900,0,"curse"],[220,"Blind",20,900,0,"curse"],[221,"Weakness",20,900,0,"curse"],[222,"Enervation",20,900,0,"curse"],[223,"Explosion",24,800,42,"area"],[224,"Requiem",25,840,43,"area"],[225,"Pollution",26,900,45,"area"],[230,"Lightning Shock",24,760,40,"magic"],[235,"Multi Shot",22,700,38,"ranged"],[236,"Flame Strike",24,720,42,"magic"],[237,"Gigantic Storm",28,900,48,"area"],
[260,"Killing Blow",12,460,30,"melee"],[261,"Beast Uppercut",14,500,32,"melee"],[262,"Chain Drive",18,620,38,"combo"],[263,"Dark Side",20,700,40,"melee"],[264,"Dragon Roar",22,760,43,"area"],[265,"Dragon Kick",18,620,39,"melee"],[266,"Increase Attack",20,1050,0,"buff"],[267,"Increase Health",20,1050,0,"buff"],[268,"Increase Defense",20,1050,0,"buff"],[269,"Occupy",16,700,28,"melee"],[270,"Phoenix Shot",24,760,44,"ranged"]
];
const skills={};
for(const [id,name,mana,cooldown,damage,kind] of raw)skills[id]={id,name,mana,cooldown,damage,kind};

function iconSpec(id){
  if(id>=260)return{atlas:"newui_skill3.OZJ",x:((id-260)%12)*20,y:Math.floor((id-260)/12)*28,w:20,h:28};
  const special={214:[0,84],215:[20,84],216:[40,84],217:[60,84],218:[200,84],219:[80,84],220:[100,84],221:[160,84],222:[180,84],223:[120,84],224:[140,84],225:[220,84],230:[40,84],232:[140,56],233:[160,56],234:[180,56],235:[0,224],236:[20,224],237:[40,224],238:[60,224]};
  if(special[id])return{atlas:"newui_skill2.OZJ",x:special[id][0],y:special[id][1],w:20,h:28};
  if(id>=57)return{atlas:"newui_skill2.OZJ",x:((id-57)%8)*20,y:Math.floor((id-57)/8)*28,w:20,h:28};
  return{atlas:"newui_skill.OZJ",x:((id-1)%8)*20,y:Math.floor((id-1)/8)*28,w:20,h:28};
}
function skillsForClass(id){const c=classes[id]||classes.dw;return c.skills.map(x=>skills[x]).filter(Boolean)}
window.MUGameData={classes,skills,skillsForClass,iconSpec,skillCount:Object.keys(skills).length};
})();
