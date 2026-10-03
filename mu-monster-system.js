(() => {
"use strict";
if(window.MUMonsters)return;
const state={assetsReady:false,active:new Map(),manifest:null};
fetch("assets/Monster/manifest.json",{cache:"no-store"})
 .then(r=>{if(!r.ok)throw new Error("Monster assets not imported yet");return r.json()})
 .then(m=>{state.assetsReady=true;state.manifest=m;window.dispatchEvent(new CustomEvent("mu-monster-assets-ready",{detail:m}))})
 .catch(()=>{});
window.MUMonsters=state;
})();
