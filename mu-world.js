/* Shared terrain rules: the same ATT data drives spawning, combat and movement. */
(() => {
"use strict";
let flags=null,api=null;
// Bounds of the main connected SAFE region in this client's Lorencia ATT.
// Include unflagged courtyards inside town, not just individual SAFE tiles.
const town={left:95,right:173,top:88,bottom:167};
function flagsAt(x,y){
 if(!flags||!Number.isFinite(x)||!Number.isFinite(y)||x<1||y<1||x>=255||y>=255)return 13;
 return flags[Math.floor(y)*256+Math.floor(x)];
}
function isSafe(x,y){return !!(flagsAt(x,y)&1)||(x>=town.left&&x<=town.right&&y>=town.top&&y<=town.bottom)}
function canSpawn(x,y){
 if(!flags||isSafe(x,y)||flagsAt(x,y)&12)return false;
 for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)if(isSafe(x+dx,y+dy))return false;
 return true;
}
function findSpawn(x,y){
 for(let r=0;r<=40;r++)for(let dy=-r;dy<=r;dy++)for(let dx=-r;dx<=r;dx++){
  if(r&&Math.abs(dx)!==r&&Math.abs(dy)!==r)continue;
  const nx=Math.floor(x)+dx+.5,ny=Math.floor(y)+dy+.5;
  if(canSpawn(nx,ny))return [nx,ny];
 }
 throw new Error("No valid monster spawn outside Lorencia");
}
window.MUWorld={town,flagsAt,isSafe,canSpawn,findSpawn,
 get ready(){return !!api?.player()},get player(){return api?.player()||null},
 get blocked(){return !api||api.blocked()},
 heightAt:(x,y)=>api?.heightAt(x,y)||0,
 pick:(x,y)=>api?.pick(x,y)||null,
 cast:detail=>api?.cast(detail),
 configure(data,bridge){flags=data;api=bridge;window.dispatchEvent(new Event("mu-world-ready"))}
};
})();
