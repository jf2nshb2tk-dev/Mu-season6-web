from pathlib import Path

p=Path('index.html')
s=p.read_text(encoding='utf-8')

MARK='/* PHONE_ONLY_MU_HUD_LAYOUT */'
if MARK in s:
    print('phone HUD layout already present')
    raise SystemExit(0)

css=r'''
/* PHONE_ONLY_MU_HUD_LAYOUT */
/* Phone layout only: desktop keeps the complete original Season 6 HUD. */
#muMobileButtons{display:none}
body.mu-phone-hud #muHudMenu1{clip-path:inset(0 0 0 150px)}
body.mu-phone-hud #muHudMenu3{clip-path:inset(0 153px 0 0)}
body.mu-phone-hud #muMobileButtons{
 display:flex;position:fixed;z-index:13;
 right:max(8px,env(safe-area-inset-right));top:max(8px,env(safe-area-inset-top));
 gap:4px;align-items:center;justify-content:flex-end;pointer-events:auto;
}
body.mu-phone-hud #muMobileButtons .muHudBtn{
 position:relative!important;left:auto!important;right:auto!important;top:auto!important;
 width:40px;height:42px;flex:0 0 40px;
 background-size:40px 176px;background-position:center 0;
 filter:drop-shadow(0 2px 5px #000c);
}
body.mu-phone-hud #muMobileButtons .muHudBtn:active{background-position:center -44px;transform:scale(.95)}
body.mu-phone-hud #joyBase{
 z-index:12;margin:0;border-color:#d0b76faa;background:#090909cc;
 box-shadow:0 1px 8px #000b;touch-action:none;
}
body.mu-phone-hud #joyKnob{background:#d0b76fe6;box-shadow:0 1px 6px #000}
body.mu-phone-hud #hint{bottom:max(66px,calc(env(safe-area-inset-bottom) + 66px))}
body.mu-phone-hud #npcAction{bottom:max(108px,calc(env(safe-area-inset-bottom) + 108px))}
'''
anchor='@media (orientation:portrait){#muHud,#muHudInfo,#muInventory{visibility:hidden!important}}'
if anchor not in s:
    raise SystemExit('phone CSS anchor not found')
s=s.replace(anchor,css+'\n'+anchor,1)

html='<div id="muMobileButtons" aria-label="Accesos MU móvil"></div>\n'
anchor='<div id="muHudInfo">Nivel 1 · EXP 0% · 138,124</div>'
if anchor not in s:
    raise SystemExit('mobile buttons HTML anchor not found')
s=s.replace(anchor,html+anchor,1)

old='''function resizeMuInterface(){
 const scale=Math.max(.62,Math.min(1.35,innerWidth/700));
 muHud.style.setProperty("--mu-ui-scale",scale);muHud.style.transform="scale("+scale+")";muHud.style.left=((innerWidth-640*scale)/2)+"px";muHudInfo.style.bottom=Math.ceil(51*scale+2)+"px";
 const invScale=Math.max(.60,Math.min(1,(innerHeight-12)/429));
 muInventory.style.transform="scale("+invScale+")";muInventory.style.left=Math.max(4,innerWidth-190*invScale-8)+"px";muInventory.style.top=Math.max(4,(innerHeight-429*invScale)/2)+"px";
}'''
new=r'''function isPhoneMuHud(){
 return matchMedia("(pointer:coarse)").matches&&Math.max(innerWidth,innerHeight)<=1000&&Math.min(innerWidth,innerHeight)<=600;
}
function resizeMuInterface(){
 const phone=isPhoneMuHud();
 document.body.classList.toggle("mu-phone-hud",phone);
 // Desktop keeps the original 640-wide MU scaling. Phone uses the compact tuned scale.
 const scale=phone?Math.max(.62,Math.min(1.35,innerWidth/700)):Math.max(.66,Math.min(1.5,innerWidth/640));
 const hudLeft=(innerWidth-640*scale)/2;
 muHud.style.setProperty("--mu-ui-scale",scale);muHud.style.transform="scale("+scale+")";muHud.style.left=hudLeft+"px";muHudInfo.style.bottom=Math.ceil(51*scale+2)+"px";
 const mobileButtons=$("#muMobileButtons"),buttons=[muCashBtn,muCharBtn,muInventoryBtn,muFriendBtn,muMenuBtn];
 if(phone){
   for(const b of buttons)if(b.parentNode!==mobileButtons)mobileButtons.appendChild(b);
   // Q/W/E/R occupies roughly x=0..150 in the original 640 HUD. Put the joystick in its centre.
   const joySize=Math.round(58*scale),knobSize=Math.round(24*scale);
   joyBase.style.width=joySize+"px";joyBase.style.height=joySize+"px";
   joyBase.style.left=Math.round(hudLeft+75*scale-joySize/2)+"px";
   joyBase.style.bottom="0px";
   joyBase.style.borderRadius="50%";
   joyKnob.style.width=knobSize+"px";joyKnob.style.height=knobSize+"px";
   joyKnob.style.left=Math.round((joySize-knobSize)/2)+"px";joyKnob.style.top=Math.round((joySize-knobSize)/2)+"px";
 }else{
   for(const b of buttons)if(b.parentNode!==muHud)muHud.appendChild(b);
   for(const prop of ["width","height","left","bottom","border-radius"])joyBase.style.removeProperty(prop);
   for(const prop of ["width","height","left","top"])joyKnob.style.removeProperty(prop);
 }
 const invScale=Math.max(.60,Math.min(1,(innerHeight-12)/429));
 muInventory.style.transform="scale("+invScale+")";muInventory.style.left=Math.max(4,innerWidth-190*invScale-8)+"px";muInventory.style.top=Math.max(4,(innerHeight-429*invScale)/2)+"px";
}'''
if old not in s:
    raise SystemExit('resizeMuInterface current tuned block not found')
s=s.replace(old,new,1)

p.write_text(s,encoding='utf-8')
print('phone-only MU HUD layout applied')
