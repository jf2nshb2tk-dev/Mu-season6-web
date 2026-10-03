from pathlib import Path
import re

p=Path('index.html')
s=p.read_text(encoding='utf-8')

start=s.find('/* PHONE_ONLY_MU_HUD_LAYOUT */')
end=s.find('@media (orientation:portrait){#muHud,#muHudInfo,#muInventory{visibility:hidden!important}}', start)
if start < 0 or end < 0:
    raise SystemExit('mobile HUD CSS block not found')

css=r'''/* PHONE_ONLY_MU_HUD_LAYOUT */
/* Phone layout only: desktop keeps the complete original Season 6 HUD. */
#muMobileButtons{display:none}
body.mu-phone-hud #muHud{bottom:8px!important;overflow:visible}
body.mu-phone-hud #muHudMenu1{clip-path:inset(0 0 0 150px)}
body.mu-phone-hud #muHudMenu3{clip-path:inset(0 153px 0 0)}
/* Ornamental caps hide the raw straight cuts made for the phone layout. */
body.mu-phone-hud #muHud::before,body.mu-phone-hud #muHud::after{
 content:"";position:absolute;z-index:11;top:2px;height:39px;width:13px;pointer-events:none;
 background:linear-gradient(180deg,#4b473f 0%,#171713 18%,#080808 72%,#312d25 100%);
 border-top:1px solid #8d825f;border-bottom:1px solid #4a412f;
 box-shadow:inset 0 0 0 1px #0b0a08,0 2px 5px #000b;
}
body.mu-phone-hud #muHud::before{left:146px;border-left:2px solid #756847;border-radius:12px 3px 3px 12px;transform:skewX(-5deg)}
body.mu-phone-hud #muHud::after{left:484px;border-right:2px solid #756847;border-radius:3px 12px 12px 3px;transform:skewX(5deg)}

/* Full-width EXP rail on phone. */
body.mu-phone-hud #muExpTrack{
 position:fixed!important;z-index:14!important;left:0!important;right:0!important;bottom:0!important;top:auto!important;
 width:100vw!important;height:9px!important;overflow:hidden!important;pointer-events:none!important;
 background:linear-gradient(180deg,#302a1b 0,#080807 28%,#020202 70%,#2b271c 100%);
 border-top:1px solid #8e7744;border-bottom:1px solid #3c3321;
 box-shadow:0 -2px 6px #000b,inset 0 1px 0 #b49b5b55;
}
body.mu-phone-hud #muExpFill{
 position:absolute!important;left:1px!important;bottom:2px!important;margin:0!important;height:3px!important;
 max-width:calc(100vw - 2px);border-radius:0 3px 3px 0;
 background:linear-gradient(90deg,#9c6410,#e2ac2e 55%,#fff0a0)!important;
 box-shadow:0 0 5px #f0b526aa!important;
}

/* Unified original MU menu icon bar. */
body.mu-phone-hud #muMobileButtons{
 display:flex;position:fixed;z-index:13;
 right:max(10px,env(safe-area-inset-right));top:max(10px,env(safe-area-inset-top));
 gap:0;align-items:center;justify-content:flex-end;pointer-events:auto;
 padding:4px 5px 4px;border:1px solid #756541;border-radius:12px;
 background:linear-gradient(180deg,#26231ce8 0%,#0a0907f2 38%,#030303f5 100%);
 box-shadow:0 3px 11px #000c,inset 0 0 0 1px #17140e,inset 0 1px 0 #c4a96844;
 overflow:hidden;
}
body.mu-phone-hud #muMobileButtons::before,body.mu-phone-hud #muMobileButtons::after{
 content:"";position:absolute;top:7px;bottom:7px;width:4px;pointer-events:none;opacity:.75;
 background:linear-gradient(#9f8751,#2a2417,#8c7748);
}
body.mu-phone-hud #muMobileButtons::before{left:1px;border-radius:4px 0 0 4px}
body.mu-phone-hud #muMobileButtons::after{right:1px;border-radius:0 4px 4px 0}
body.mu-phone-hud #muMobileButtons .muHudBtn{
 position:relative!important;left:auto!important;right:auto!important;top:auto!important;
 width:39px;height:41px;flex:0 0 39px;margin:0;
 background-size:39px 172px;background-position:center 0;
 filter:none;border-radius:5px!important;
 box-shadow:inset 1px 0 0 #5d503455,inset -1px 0 0 #0a0908;
}
body.mu-phone-hud #muMobileButtons .muHudBtn:first-of-type{border-radius:7px 4px 4px 7px!important}
body.mu-phone-hud #muMobileButtons .muHudBtn:last-of-type{border-radius:4px 7px 7px 4px!important}
body.mu-phone-hud #muMobileButtons .muHudBtn:active{background-position:center -43px;transform:scale(.94);filter:brightness(1.18)}

/* Larger joystick centred in the lower-left play area, independent from desktop. */
body.mu-phone-hud #joyBase{
 z-index:12;margin:0;border:2px solid #d0b76faa;background:radial-gradient(circle,#15130fc9 0,#090909d9 66%,#020202e8 100%);
 box-shadow:0 2px 12px #000c,inset 0 0 0 2px #8a764044;touch-action:none;
}
body.mu-phone-hud #joyKnob{background:radial-gradient(circle at 38% 32%,#e0c77e,#b99d52 72%,#6e5a2d);box-shadow:0 2px 7px #000,inset 0 1px 0 #fff7}
body.mu-phone-hud #hint{bottom:max(66px,calc(env(safe-area-inset-bottom) + 66px))}
body.mu-phone-hud #npcAction{bottom:max(108px,calc(env(safe-area-inset-bottom) + 108px))}

'''
s=s[:start]+css+s[end:]

# Replace only the current phone resize function, leaving desktop logic intact.
pattern=r'''function resizeMuInterface\(\)\{.*?\n\}\nfunction stopPlayerUiMovement\(\)\{'''
m=re.search(pattern,s,re.S)
if not m:
    raise SystemExit('resizeMuInterface block not found')
new=r'''function resizeMuInterface(){
 const phone=isPhoneMuHud();
 document.body.classList.toggle("mu-phone-hud",phone);
 // Desktop keeps the complete original 640-wide Season 6 HUD.
 const scale=phone?Math.max(.62,Math.min(1.35,innerWidth/700)):Math.max(.66,Math.min(1.5,innerWidth/640));
 const hudLeft=(innerWidth-640*scale)/2;
 muHud.style.setProperty("--mu-ui-scale",scale);muHud.style.transform="scale("+scale+")";muHud.style.left=hudLeft+"px";
 const mobileButtons=$("#muMobileButtons"),buttons=[muCashBtn,muCharBtn,muInventoryBtn,muFriendBtn,muMenuBtn],expTrack=$("#muExpTrack");
 if(phone){
   for(const b of buttons)if(b.parentNode!==mobileButtons)mobileButtons.appendChild(b);
   if(expTrack.parentNode!==document.body)document.body.appendChild(expTrack);
   // User-tuned phone position: roughly x=11%, y=78%, slightly larger than before.
   const joySize=Math.round(72*scale),knobSize=Math.round(30*scale);
   const joyCx=innerWidth*.11,joyCy=innerHeight*.78;
   joyBase.style.width=joySize+"px";joyBase.style.height=joySize+"px";
   joyBase.style.left=Math.round(joyCx-joySize/2)+"px";
   joyBase.style.top=Math.round(joyCy-joySize/2)+"px";
   joyBase.style.bottom="auto";joyBase.style.borderRadius="50%";
   joyKnob.style.width=knobSize+"px";joyKnob.style.height=knobSize+"px";
   joyKnob.style.left=Math.round((joySize-knobSize)/2)+"px";joyKnob.style.top=Math.round((joySize-knobSize)/2)+"px";
   muHudInfo.style.bottom=Math.ceil(51*scale+12)+"px";
 }else{
   for(const b of buttons)if(b.parentNode!==muHud)muHud.appendChild(b);
   if(expTrack.parentNode!==muHud)muHud.appendChild(expTrack);
   for(const prop of ["width","height","left","top","bottom","border-radius"])joyBase.style.removeProperty(prop);
   for(const prop of ["width","height","left","top"])joyKnob.style.removeProperty(prop);
   muHudInfo.style.bottom=Math.ceil(51*scale+2)+"px";
 }
 const invScale=Math.max(.60,Math.min(1,(innerHeight-12)/429));
 muInventory.style.transform="scale("+invScale+")";muInventory.style.left=Math.max(4,innerWidth-190*invScale-8)+"px";muInventory.style.top=Math.max(4,(innerHeight-429*invScale)/2)+"px";
}
function stopPlayerUiMovement(){'''
s=s[:m.start()]+new+s[m.end():]

old='const ep=ratio(playerStats.exp,playerStats.expMax);muExpFill.style.width=(ep*640)+"px";muZen.textContent=playerStats.zen.toLocaleString("es-AR")+" Zen";'
new='const ep=ratio(playerStats.exp,playerStats.expMax);muExpFill.style.width=isPhoneMuHud()?(ep*100)+"%":(ep*640)+"px";muZen.textContent=playerStats.zen.toLocaleString("es-AR")+" Zen";'
if old not in s:
    if new not in s: raise SystemExit('EXP width update anchor not found')
else:
    s=s.replace(old,new,1)

p.write_text(s,encoding='utf-8')
print('refined phone HUD layout applied')
