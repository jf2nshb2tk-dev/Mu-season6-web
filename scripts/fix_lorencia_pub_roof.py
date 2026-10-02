from pathlib import Path

p = Path('index.html')
s = p.read_text(encoding='utf-8')

# Shader: allow a complete per-render hide, used for the Lorencia pub roof.
old = 'precision highp float;in vec2 vUV;in vec3 vN;uniform sampler2D uObjTex;uniform int uBlackKey;out vec4 o;\nvoid main(){vec4 c=texture(uObjTex,vUV);float mx=max(max(c.r,c.g),c.b),mn=min(min(c.r,c.g),c.b);if(c.a<.12||(uBlackKey==1&&mx<.025&&mx-mn<.012))discard;float d=max(dot(normalize(vN),normalize(vec3(.45,.85,.25))),0.0);o=vec4(c.rgb*(.50+.62*d),c.a);}'
new = 'precision highp float;in vec2 vUV;in vec3 vN;uniform sampler2D uObjTex;uniform int uBlackKey;uniform int uHideObject;out vec4 o;\nvoid main(){if(uHideObject==1)discard;vec4 c=texture(uObjTex,vUV);float mx=max(max(c.r,c.g),c.b),mn=min(min(c.r,c.g),c.b);if(c.a<.12||(uBlackKey==1&&mx<.025&&mx-mn<.012))discard;float d=max(dot(normalize(vN),normalize(vec3(.45,.85,.25))),0.0);o=vec4(c.rgb*(.50+.62*d),c.a);}'
if old not in s:
    if 'uniform int uHideObject' not in s:
        raise SystemExit('OBJ_FS anchor not found')
else:
    s = s.replace(old, new, 1)

old = 'const objProg=program(OBJ_VS,OBJ_FS),objVP=gl.getUniformLocation(objProg,"uVP"),objSampler=gl.getUniformLocation(objProg,"uObjTex"),objBlackKey=gl.getUniformLocation(objProg,"uBlackKey");'
new = 'const objProg=program(OBJ_VS,OBJ_FS),objVP=gl.getUniformLocation(objProg,"uVP"),objSampler=gl.getUniformLocation(objProg,"uObjTex"),objBlackKey=gl.getUniformLocation(objProg,"uBlackKey"),objHideObject=gl.getUniformLocation(objProg,"uHideObject");'
if old in s:
    s = s.replace(old, new, 1)
elif 'objHideObject=gl.getUniformLocation' not in s:
    raise SystemExit('obj uniform anchor not found')

# Tag the exact roof object types used by the original Lorencia client.
old = 'renders.push({vao,count:m.data.length/8,n:list.length,tex:await objectTexture(m.texture),additive,model,meshIndex:m.meshIndex,texture:m.texture});'
new = 'const pubRoof=(mn==="housewall05.bmd"||mn==="housewall06.bmd");\n    renders.push({vao,count:m.data.length/8,n:list.length,tex:await objectTexture(m.texture),additive,pubRoof,model,meshIndex:m.meshIndex,texture:m.texture});'
if old in s:
    s = s.replace(old, new, 1)
elif 'pubRoof,model,meshIndex' not in s:
    raise SystemExit('render record anchor not found')

# Compute MU HeroTile exactly from Terrain.map Layer1. In Lorencia HeroTile 4 is the pub interior.
anchor = 'function frame(t){\n   resize();\n   const dt=Math.min(.05,(t-lastFrameT)/1000||0);lastFrameT=t;'
repl = 'function frame(t){\n   resize();\n   const dt=Math.min(.05,(t-lastFrameT)/1000||0);lastFrameT=t;\n   let heroTile=-1;\n   if(playerReady&&playerScene.tilePos){\n     const hx=Math.max(0,Math.min(255,Math.floor(playerScene.tilePos[0]))),hy=Math.max(0,Math.min(255,Math.floor(playerScene.tilePos[1])));\n     heroTile=mapping.layer1[hy*256+hx];\n   }\n   const hidePubRoof=heroTile===4;'
if anchor in s:
    s = s.replace(anchor, repl, 1)
elif 'const hidePubRoof=heroTile===4;' not in s:
    raise SystemExit('frame anchor not found')

# Apply hide only to HouseWall05/06 while the player is on HeroTile 4.
anchor = 'gl.uniform1i(objBlackKey,1);\n     let additiveMode=false;\n     for(const r of objectScene.renders){'
repl = 'gl.uniform1i(objBlackKey,1);gl.uniform1i(objHideObject,0);\n     let additiveMode=false;\n     for(const r of objectScene.renders){\n       gl.uniform1i(objHideObject,(hidePubRoof&&r.pubRoof)?1:0);'
if anchor in s:
    s = s.replace(anchor, repl, 1)
elif 'gl.uniform1i(objHideObject,(hidePubRoof&&r.pubRoof)?1:0);' not in s:
    raise SystemExit('object render loop anchor not found')

# Never hide NPCs or the player.
old = '// NPC/player textures contain legitimate dark clothing; never black-key them.\n     gl.uniform1i(objBlackKey,0);'
new = '// NPC/player textures contain legitimate dark clothing; never black-key them.\n     gl.uniform1i(objHideObject,0);gl.uniform1i(objBlackKey,0);'
if old in s:
    s = s.replace(old, new, 1)
elif 'gl.uniform1i(objHideObject,0);gl.uniform1i(objBlackKey,0);' not in s:
    raise SystemExit('NPC render anchor not found')

# Fallback render path also needs the new uniform initialized.
old = 'gl.useProgram(objProg);gl.uniformMatrix4fv(objVP,false,vp);gl.uniform1i(objSampler,0);gl.uniform1i(objBlackKey,0);gl.disable(gl.CULL_FACE);'
new = 'gl.useProgram(objProg);gl.uniformMatrix4fv(objVP,false,vp);gl.uniform1i(objSampler,0);gl.uniform1i(objBlackKey,0);gl.uniform1i(objHideObject,0);gl.disable(gl.CULL_FACE);'
if old in s:
    s = s.replace(old, new, 1)
elif 'gl.uniform1i(objHideObject,0);gl.disable(gl.CULL_FACE);' not in s:
    raise SystemExit('fallback render anchor not found')

p.write_text(s, encoding='utf-8')
print('Lorencia pub roof: HouseWall05/06 now hide on HeroTile 4')
# Trigger workflow after the workflow file exists.
