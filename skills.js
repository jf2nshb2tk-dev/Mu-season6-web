(() => {
  'use strict';
  if (window.MUSkills) return;

  const SKILLS = {
    energyBall: { id: 'energyBall', slot: 1, name: 'Energy Ball', mana: 8, cooldown: 450, damage: 18, radius: 24, color: '#7fd8ff', accent: '#d9f6ff' },
    fireBall:   { id: 'fireBall', slot: 2, name: 'Fire Ball', mana: 14, cooldown: 700, damage: 28, radius: 40, color: '#ff8a35', accent: '#ffe08a' },
    powerWave:  { id: 'powerWave', slot: 3, name: 'Power Wave', mana: 20, cooldown: 1000, damage: 34, radius: 70, color: '#b48cff', accent: '#f1dcff' }
  };

  const slotToId = { 1: 'energyBall', 2: 'fireBall', 3: 'powerWave' };
  let selectedId = 'energyBall';
  let mobileArmed = false;
  let castSeq = 0;
  const cooldownUntil = new Map();
  const projectiles = [];
  const impacts = [];
  const waves = [];

  let gameCanvas = null;
  try {
    if (typeof canvas !== 'undefined' && canvas instanceof HTMLCanvasElement) gameCanvas = canvas;
  } catch (_) {}
  if (!gameCanvas) gameCanvas = document.querySelector('canvas');
  if (!gameCanvas) {
    console.warn('[MU Skills] Game canvas not found.');
    return;
  }

  const css = document.createElement('style');
  css.id = 'muSkillsStyle';
  css.textContent = `
    #muSkillFx{position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:45}
    #muSkillBar{position:fixed;left:50%;bottom:108px;transform:translateX(-50%);z-index:130;display:flex;gap:7px;align-items:flex-end;user-select:none;-webkit-user-select:none;touch-action:none;font-family:Arial,sans-serif}
    #muSkillBar .mu-skill{position:relative;width:58px;height:58px;border:1px solid #8b7a49;border-radius:7px;background:linear-gradient(#19170f,#060606);box-shadow:0 0 0 1px #000,0 3px 10px #000b;overflow:hidden;color:#eee;padding:0;cursor:pointer}
    #muSkillBar .mu-skill.selected{border-color:#ead47d;box-shadow:0 0 0 1px #4b3e17,0 0 12px #d9bf4b77,0 3px 10px #000c}
    #muSkillBar .mu-skill .icon{position:absolute;inset:5px 5px 16px;border-radius:50%;display:grid;place-items:center;font-weight:900;font-size:17px;text-shadow:0 1px 3px #000;background:radial-gradient(circle at 38% 35%,var(--accent),var(--skill) 38%,#0b1020 74%);box-shadow:inset 0 0 8px #fff5}
    #muSkillBar .mu-skill[data-skill="fireBall"] .icon{background:radial-gradient(circle at 38% 35%,#fff1ad,#ff7b24 38%,#451008 74%)}
    #muSkillBar .mu-skill[data-skill="powerWave"] .icon{background:radial-gradient(circle at 38% 35%,#f5dcff,#9d67ff 38%,#1b113b 74%)}
    #muSkillBar .key{position:absolute;left:4px;top:3px;font-size:10px;font-weight:700;color:#fff;text-shadow:0 1px 2px #000;z-index:2}
    #muSkillBar .mana{position:absolute;left:0;right:0;bottom:1px;font-size:9px;text-align:center;color:#72c8ff;text-shadow:0 1px 2px #000;z-index:3}
    #muSkillBar .cooldown{position:absolute;inset:0;background:#000b;display:none;place-items:center;color:white;font-weight:800;font-size:14px;z-index:4}
    #muSkillBar .cooldown.active{display:grid}
    #muSkillHint{position:fixed;left:50%;bottom:84px;transform:translateX(-50%);z-index:129;color:#e9e0bd;background:#080806c7;border:1px solid #665c3e;border-radius:5px;padding:4px 8px;font:11px/1.2 Arial,sans-serif;white-space:nowrap;pointer-events:none;text-shadow:0 1px 2px #000}
    #muSkillHint.armed{color:#fff4a7;border-color:#c9a84a;box-shadow:0 0 8px #d9b54966}
    #muSkillToast{position:fixed;left:50%;top:27%;transform:translate(-50%,-50%);z-index:180;color:#fff5b1;font:bold 14px Arial,sans-serif;text-shadow:0 2px 4px #000;background:#080806cc;border:1px solid #76632e;border-radius:5px;padding:6px 10px;opacity:0;pointer-events:none;transition:opacity .12s}
    @media (max-width:700px){#muSkillBar{bottom:116px;gap:5px}#muSkillBar .mu-skill{width:54px;height:54px}#muSkillHint{bottom:91px;font-size:10px}}
  `;
  document.head.appendChild(css);

  const fxCanvas = document.createElement('canvas');
  fxCanvas.id = 'muSkillFx';
  document.body.appendChild(fxCanvas);
  const ctx = fxCanvas.getContext('2d');
  let dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

  function resizeFx() {
    dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    fxCanvas.width = Math.round(innerWidth * dpr);
    fxCanvas.height = Math.round(innerHeight * dpr);
    fxCanvas.style.width = innerWidth + 'px';
    fxCanvas.style.height = innerHeight + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resizeFx();
  window.addEventListener('resize', resizeFx, { passive: true });

  const bar = document.createElement('div');
  bar.id = 'muSkillBar';
  const hint = document.createElement('div');
  hint.id = 'muSkillHint';
  const toast = document.createElement('div');
  toast.id = 'muSkillToast';
  document.body.append(bar, hint, toast);

  const buttons = new Map();
  Object.values(SKILLS).forEach(skill => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'mu-skill';
    btn.dataset.skill = skill.id;
    btn.style.setProperty('--skill', skill.color);
    btn.style.setProperty('--accent', skill.accent);
    btn.title = `${skill.name} · ${skill.mana} MP`;
    btn.innerHTML = `<span class="key">${skill.slot}</span><span class="icon">${skill.slot}</span><span class="mana">${skill.mana} MP</span><span class="cooldown"></span>`;
    btn.addEventListener('pointerdown', e => {
      e.preventDefault();
      e.stopPropagation();
      select(skill.id, true);
      if (e.pointerType === 'touch' || e.pointerType === 'pen') {
        mobileArmed = true;
        updateHint();
      }
    });
    bar.appendChild(btn);
    buttons.set(skill.id, btn);
  });

  let toastTimer = 0;
  function showToast(text) {
    toast.textContent = text;
    toast.style.opacity = '1';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.style.opacity = '0'; }, 900);
  }

  function updateHint() {
    hint.classList.toggle('armed', mobileArmed);
    hint.textContent = mobileArmed
      ? `${SKILLS[selectedId].name}: toca el terreno para lanzar`
      : 'PC: 1/2/3 + clic derecho · Móvil: toca skill y luego terreno';
  }

  function select(id, quiet = false) {
    if (!SKILLS[id]) return false;
    selectedId = id;
    buttons.forEach((btn, key) => btn.classList.toggle('selected', key === id));
    if (!quiet) showToast(SKILLS[id].name);
    updateHint();
    window.dispatchEvent(new CustomEvent('mu-skill-select', { detail: { skillId: id, skill: { ...SKILLS[id] } } }));
    return true;
  }

  function getMana() {
    try {
      if (typeof playerStats !== 'undefined' && Number.isFinite(playerStats.mp)) return playerStats.mp;
    } catch (_) {}
    return Infinity;
  }

  function spendMana(amount) {
    try {
      if (typeof playerStats !== 'undefined' && Number.isFinite(playerStats.mp)) {
        playerStats.mp = Math.max(0, playerStats.mp - amount);
        if (typeof updateMuHudUI === 'function') updateMuHudUI();
      }
    } catch (_) {}
  }

  function cooldownLeft(id, now = performance.now()) {
    return Math.max(0, (cooldownUntil.get(id) || 0) - now);
  }

  function canvasContains(clientX, clientY) {
    const r = gameCanvas.getBoundingClientRect();
    return clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom;
  }

  function startPoint() {
    const r = gameCanvas.getBoundingClientRect();
    return { x: r.left + r.width * 0.5, y: r.top + r.height * 0.58 };
  }

  function normalizedPoint(x, y) {
    const r = gameCanvas.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(1, (x - r.left) / Math.max(1, r.width))),
      y: Math.max(0, Math.min(1, (y - r.top) / Math.max(1, r.height)))
    };
  }

  function emitHit(skill, x, y, castId, source) {
    const n = normalizedPoint(x, y);
    const detail = {
      castId,
      source,
      skillId: skill.id,
      skill: { ...skill },
      damage: skill.damage,
      radius: skill.radius,
      screenX: x,
      screenY: y,
      normalizedX: n.x,
      normalizedY: n.y,
      timestamp: performance.now()
    };
    window.dispatchEvent(new CustomEvent('mu-skill-hit', { detail }));
  }

  function castAtScreen(x, y, source = 'api') {
    const skill = SKILLS[selectedId];
    if (!skill || !canvasContains(x, y)) return false;

    const now = performance.now();
    const left = cooldownLeft(skill.id, now);
    if (left > 0) {
      showToast(`${skill.name}: ${(left / 1000).toFixed(1)}s`);
      return false;
    }
    if (getMana() < skill.mana) {
      showToast('Sin mana');
      return false;
    }

    spendMana(skill.mana);
    cooldownUntil.set(skill.id, now + skill.cooldown);
    const from = startPoint();
    const castId = ++castSeq;
    const distance = Math.hypot(x - from.x, y - from.y);
    const duration = Math.max(170, Math.min(520, 160 + distance * 0.38));

    const castDetail = {
      castId,
      source,
      skillId: skill.id,
      skill: { ...skill },
      fromScreenX: from.x,
      fromScreenY: from.y,
      screenX: x,
      screenY: y,
      normalized: normalizedPoint(x, y),
      timestamp: now
    };
    window.dispatchEvent(new CustomEvent('mu-skill-cast', { detail: castDetail }));

    if (skill.id === 'powerWave') {
      waves.push({ skill, castId, source, sx: from.x, sy: from.y, tx: x, ty: y, born: now, duration: 420, hit: false });
    } else {
      projectiles.push({ skill, castId, source, sx: from.x, sy: from.y, tx: x, ty: y, born: now, duration, hit: false });
    }
    return true;
  }

  function impact(skill, x, y, now) {
    impacts.push({ skill, x, y, born: now, duration: skill.id === 'fireBall' ? 460 : 330 });
  }

  function drawProjectile(p, now) {
    const t = Math.max(0, Math.min(1, (now - p.born) / p.duration));
    const ease = 1 - Math.pow(1 - t, 2);
    const x = p.sx + (p.tx - p.sx) * ease;
    const y = p.sy + (p.ty - p.sy) * ease - Math.sin(Math.PI * t) * 20;
    const skill = p.skill;
    const trailX = p.sx + (p.tx - p.sx) * Math.max(0, ease - 0.06);
    const trailY = p.sy + (p.ty - p.sy) * Math.max(0, ease - 0.06) - Math.sin(Math.PI * Math.max(0, t - 0.06)) * 20;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = skill.color;
    ctx.lineWidth = skill.id === 'fireBall' ? 7 : 5;
    ctx.globalAlpha = 0.5;
    ctx.beginPath(); ctx.moveTo(trailX, trailY); ctx.lineTo(x, y); ctx.stroke();

    const radius = skill.id === 'fireBall' ? 12 : 9;
    const g = ctx.createRadialGradient(x - 2, y - 3, 1, x, y, radius * 2.2);
    g.addColorStop(0, '#ffffff');
    g.addColorStop(0.22, skill.accent);
    g.addColorStop(0.55, skill.color);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.globalAlpha = 1;
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x, y, radius * 2.2, 0, Math.PI * 2); ctx.fill();

    if (skill.id === 'fireBall') {
      for (let i = 0; i < 4; i++) {
        const a = now * 0.012 + i * 1.57;
        ctx.globalAlpha = 0.7;
        ctx.fillStyle = skill.accent;
        ctx.beginPath(); ctx.arc(x + Math.cos(a) * 10, y + Math.sin(a) * 7, 2, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.restore();

    if (t >= 1 && !p.hit) {
      p.hit = true;
      impact(skill, p.tx, p.ty, now);
      emitHit(skill, p.tx, p.ty, p.castId, p.source);
    }
    return t < 1;
  }

  function drawWave(w, now) {
    const t = Math.max(0, Math.min(1, (now - w.born) / w.duration));
    const dx = w.tx - w.sx, dy = w.ty - w.sy;
    const len = Math.max(1, Math.hypot(dx, dy));
    const ux = dx / len, uy = dy / len;
    const travel = Math.min(len, 70 + len * t);
    const cx = w.sx + ux * travel;
    const cy = w.sy + uy * travel;
    const angle = Math.atan2(dy, dx);

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = w.skill.color;
    ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      ctx.globalAlpha = (1 - t) * (0.85 - i * 0.18);
      ctx.lineWidth = 7 - i * 1.5;
      const spread = 28 + i * 11 + t * 36;
      ctx.beginPath();
      ctx.arc(0, 0, spread, -0.82, 0.82);
      ctx.stroke();
    }
    ctx.restore();

    if (t >= 0.72 && !w.hit) {
      w.hit = true;
      impact(w.skill, w.tx, w.ty, now);
      emitHit(w.skill, w.tx, w.ty, w.castId, w.source);
    }
    return t < 1;
  }

  function drawImpact(i, now) {
    const t = Math.max(0, Math.min(1, (now - i.born) / i.duration));
    const r = 8 + i.skill.radius * (0.35 + 0.65 * t);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.globalAlpha = 1 - t;
    ctx.strokeStyle = i.skill.color;
    ctx.lineWidth = Math.max(1, 5 * (1 - t));
    ctx.beginPath(); ctx.arc(i.x, i.y, r, 0, Math.PI * 2); ctx.stroke();
    if (i.skill.id === 'fireBall') {
      ctx.fillStyle = i.skill.color;
      ctx.globalAlpha = (1 - t) * 0.23;
      ctx.beginPath(); ctx.arc(i.x, i.y, r * 0.78, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
    return t < 1;
  }

  function updateCooldownUI(now) {
    buttons.forEach((btn, id) => {
      const skill = SKILLS[id];
      const left = cooldownLeft(id, now);
      const el = btn.querySelector('.cooldown');
      if (left > 0) {
        el.classList.add('active');
        el.textContent = left > 950 ? `${Math.ceil(left / 1000)}` : `${(left / 1000).toFixed(1)}`;
        btn.style.setProperty('--cd', `${Math.min(1, left / skill.cooldown)}`);
      } else {
        el.classList.remove('active');
        el.textContent = '';
      }
    });
  }

  function frame(now) {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (let i = projectiles.length - 1; i >= 0; i--) if (!drawProjectile(projectiles[i], now)) projectiles.splice(i, 1);
    for (let i = waves.length - 1; i >= 0; i--) if (!drawWave(waves[i], now)) waves.splice(i, 1);
    for (let i = impacts.length - 1; i >= 0; i--) if (!drawImpact(impacts[i], now)) impacts.splice(i, 1);
    updateCooldownUI(now);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  window.addEventListener('keydown', e => {
    if (e.repeat) return;
    const id = slotToId[e.key];
    if (!id) return;
    const active = document.activeElement;
    if (active && /^(INPUT|TEXTAREA|SELECT)$/.test(active.tagName)) return;
    select(id);
  });

  gameCanvas.addEventListener('contextmenu', e => {
    e.preventDefault();
    mobileArmed = false;
    updateHint();
    castAtScreen(e.clientX, e.clientY, 'mouse');
  });

  gameCanvas.addEventListener('pointerdown', e => {
    if (!mobileArmed || (e.pointerType !== 'touch' && e.pointerType !== 'pen')) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    const ok = castAtScreen(e.clientX, e.clientY, 'touch');
    if (ok) mobileArmed = false;
    updateHint();
  }, true);

  select(selectedId, true);
  updateHint();

  window.MUSkills = {
    skills: SKILLS,
    select,
    castAtScreen,
    get selected() { return selectedId; },
    get mobileTargeting() { return mobileArmed; },
    cancelTargeting() { mobileArmed = false; updateHint(); },
    onDamage(handler) {
      if (typeof handler !== 'function') return () => {};
      const fn = e => handler(e.detail);
      window.addEventListener('mu-skill-hit', fn);
      return () => window.removeEventListener('mu-skill-hit', fn);
    }
  };

  console.info('[MU Skills] Dark Wizard pilot ready: Energy Ball, Fire Ball, Power Wave.');
})();
