
// ============================================================
// CLOCK
// ============================================================
function updateClock() {
  const now = new Date();
  document.getElementById('clock').textContent = now.toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'});
}
setInterval(updateClock, 1000);
updateClock();

// ============================================================
// SESSION TIMER
// ============================================================
let timerRunning = false, timerSeconds = 0, timerInterval = null;
function toggleTimer() {
  timerRunning = !timerRunning;
  const label = timerRunning ? '⏸ Pause' : '▶ Start';
  const el    = document.getElementById('session-timer');
  // Sync both header and drawer buttons
  ['timer-btn','timer-btn-drawer'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) btn.textContent = timerRunning ? '⏸ Pause' : '▶ Timer';
  });
  if (timerRunning) {
    if (el) el.classList.add('running');
    timerInterval = setInterval(() => {
      timerSeconds++;
      const m = String(Math.floor(timerSeconds/60)).padStart(2,'0');
      const s = String(timerSeconds%60).padStart(2,'0');
      const txt = `⏱ ${m}:${s}`;
      if (el) el.textContent = txt;
      const d = document.getElementById('session-timer-drawer');
      if (d) d.textContent = txt;
    }, 1000);
  } else {
    if (el) el.classList.remove('running');
    clearInterval(timerInterval);
  }
}

// Also sync SFX button in drawer
const _origToggleSFX = window.toggleSFX;
window.toggleSFX = function() {
  if (_origToggleSFX) _origToggleSFX();
  // Sync drawer SFX btn
  setTimeout(() => {
    const mainBtn   = document.getElementById('sfx-btn');
    const drawerBtn = document.getElementById('sfx-btn-drawer');
    if (mainBtn && drawerBtn) drawerBtn.textContent = mainBtn.textContent;
  }, 50);
};

// ============================================================
// NAVIGATION
// ============================================================
function switchPanel(id) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('panel-' + id).classList.add('active');
  document.querySelectorAll(`.nav-btn[onclick*="'${id}'"]`).forEach(b => b.classList.add('active'));
}
function openNavDrawer() {
  document.getElementById('nav-drawer').classList.add('open');
  document.getElementById('nav-overlay').classList.add('open');
}
function closeNavDrawer() {
  document.getElementById('nav-drawer').classList.remove('open');
  document.getElementById('nav-overlay').classList.remove('open');
}

// ============================================================
// TOAST
// ============================================================
let toastTimer = null;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2800);
}

// ============================================================
// SFX
// ============================================================
let sfxEnabled = false;
let audioCtx = null;
function toggleSFX() {
  sfxEnabled = !sfxEnabled;
  document.getElementById('sfx-btn').textContent = sfxEnabled ? '🔊 SFX' : '🔇 SFX';
  if (sfxEnabled) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    sfxPlay('enable');
  }
}
function sfxPlay(type) {
  if (!sfxEnabled || !audioCtx) return;
  const ctx = audioCtx;
  const sounds = {
    dice: () => {
      [0, 60, 120].forEach((delay, i) => {
        const src = ctx.createOscillator();
        const gain = ctx.createGain();
        src.type = 'triangle';
        src.frequency.value = 300 + i * 150;
        gain.gain.setValueAtTime(0.15, ctx.currentTime + delay/1000);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay/1000 + 0.04);
        src.connect(gain); gain.connect(ctx.destination); src.start(ctx.currentTime + delay/1000); src.stop(ctx.currentTime + delay/1000 + 0.04);
      });
    },
    hit: () => {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.type = 'sawtooth'; osc.frequency.setValueAtTime(120, ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.4, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.connect(gain); gain.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + 0.2);
    },
    heal: () => {
      [261.63, 329.63, 392, 523.25].forEach((freq, i) => {
        const osc = ctx.createOscillator(); const gain = ctx.createGain();
        osc.type = 'sine'; osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.15, ctx.currentTime + i*0.08); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i*0.08 + 0.3);
        osc.connect(gain); gain.connect(ctx.destination); osc.start(ctx.currentTime + i*0.08); osc.stop(ctx.currentTime + i*0.08 + 0.3);
      });
    },
    crit: () => {
      [0, 100, 200].forEach((delay, i) => {
        const osc = ctx.createOscillator(); const gain = ctx.createGain();
        osc.type = 'square'; osc.frequency.value = 220 * Math.pow(1.5, i);
        gain.gain.setValueAtTime(0.2, ctx.currentTime + delay/1000); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay/1000 + 0.3);
        osc.connect(gain); gain.connect(ctx.destination); osc.start(ctx.currentTime + delay/1000); osc.stop(ctx.currentTime + delay/1000 + 0.3);
      });
    },
    enable: () => {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.type = 'sine'; osc.frequency.setValueAtTime(200, ctx.currentTime); osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.2, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain); gain.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + 0.35);
    },
    nextturn: () => {
      const osc = ctx.createOscillator(); const gain = ctx.createGain();
      osc.type = 'triangle'; osc.frequency.value = 800;
      gain.gain.setValueAtTime(0.2, ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
      osc.connect(gain); gain.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + 0.06);
    }
  };
  try { (sounds[type] || sounds.dice)(); } catch(e) {}
}

// ============================================================
// CHARACTER SHEET
// ============================================================
function getMod(score) { return Math.floor((score - 10) / 2); }
function fmtMod(m) { return m >= 0 ? `+${m}` : `${m}`; }

function updateMods() {
  ['str','dex','con','int','wis','cha'].forEach(ab => {
    const val = parseInt(document.getElementById(`stat-${ab}`).value) || 10;
    const mod = getMod(val);
    document.getElementById(`mod-${ab}`).textContent = fmtMod(mod);
  });
  // Auto-sync Initiative = DEX mod
  const dexMod = getMod(parseInt(document.getElementById('stat-dex')?.value) || 10);
  const initEl = document.getElementById('char-init');
  if (initEl) { initEl.value = dexMod >= 0 ? `+${dexMod}` : `${dexMod}`; }
  renderSaves();
  renderSkills();
  updateSpellStats();
}

function updateHPBar() {
  const cur = parseInt(document.getElementById('char-hp').value) || 0;
  const max = parseInt(document.getElementById('char-maxhp').value) || 1;
  const pct = Math.max(0, Math.min(100, (cur / max) * 100));
  const color = pct > 60 ? '#27ae60' : pct > 30 ? '#e67e22' : '#e74c3c';
  document.getElementById('char-hp-bar').style.width = pct + '%';
  document.getElementById('char-hp-bar').style.background = color;
}

function updatePoiseBar() {
  const cur = parseInt(document.getElementById('char-poise').value) || 0;
  const max = parseInt(document.getElementById('char-maxpoise').value) || 1;
  const pct = Math.max(0, Math.min(100, (cur / max) * 100));
  document.getElementById('char-poise-bar').style.width = pct + '%';
  document.getElementById('char-poise-txt').textContent = `${cur}/${max}`;
}

// ============================================================
// INLINE FORM HELPERS
// ============================================================
function toggleAddForm(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const isOpen = el.classList.contains('open');
  // Close all other open forms
  document.querySelectorAll('.add-form.open').forEach(f => f.classList.remove('open'));
  if (!isOpen) {
    el.classList.add('open');
    // Focus first input
    const first = el.querySelector('input, select, textarea');
    if (first) setTimeout(() => first.focus(), 80);
  }
}

// ============================================================
// POISE INLINE BOX
// ============================================================
function togglePoiseBox() {
  const box = document.getElementById('poise-hit-box');
  const isOpen = box.style.display !== 'none';
  box.style.display = isOpen ? 'none' : 'block';
  if (!isOpen) { document.getElementById('poise-dmg-val').value = ''; setTimeout(() => document.getElementById('poise-dmg-val').focus(), 50); }
}
function applyPoiseDmg() {
  const dmg = parseInt(document.getElementById('poise-dmg-val').value) || 0;
  if (!dmg) return;
  const cur = parseInt(document.getElementById('char-poise').value) || 0;
  const newVal = Math.max(0, cur - dmg);
  document.getElementById('char-poise').value = newVal;
  updatePoiseBar();
  document.getElementById('poise-hit-box').style.display = 'none';
  if (newVal <= 0) showToast('💥 STAGGERED! Kehilangan Bonus Action.');
  else showToast(`🛡 Poise −${dmg} → ${newVal}`);
}
// Keep old hitCharPoise as alias
function hitCharPoise() { togglePoiseBox(); }

// HP Popup
function openHPPopup(e) {
  const popup = document.getElementById('hp-popup');
  popup.classList.add('show');
  const isMobile = window.innerWidth <= 700;
  if (isMobile) {
    popup.style.left   = '10px';
    popup.style.right  = '10px';
    popup.style.top    = '60px';
    popup.style.width  = 'calc(100vw - 20px)';
  } else {
    const rect = e.target.getBoundingClientRect();
    popup.style.left  = Math.min(rect.left, window.innerWidth - 220) + 'px';
    popup.style.right = 'auto';
    popup.style.width = '200px';
    popup.style.top   = (rect.bottom + 6) + 'px';
  }
  document.getElementById('hp-popup-title').textContent = '⚔ ' + (document.getElementById('char-name').value || 'Character');
  document.getElementById('hp-popup-val').value = '';
  setTimeout(() => document.getElementById('hp-popup-val').focus(), 50);
  e.stopPropagation();
}
function closeHPPopup() { document.getElementById('hp-popup').classList.remove('show'); }
document.addEventListener('click', e => { if (!document.getElementById('hp-popup').contains(e.target)) closeHPPopup(); });

function applyHPChange(type) {
  const v = parseInt(document.getElementById('hp-popup-val').value) || 0;
  let cur = parseInt(document.getElementById('char-hp').value) || 0;
  const max = parseInt(document.getElementById('char-maxhp').value) || 1;
  if (type === 'damage') { cur = Math.max(0, cur - v); sfxPlay('hit'); showToast(`🗡 -${v} HP`); }
  else if (type === 'heal') { cur = Math.min(max, cur + v); sfxPlay('heal'); showToast(`💚 +${v} HP`); }
  else { cur = Math.max(0, Math.min(max, v)); }
  document.getElementById('char-hp').value = cur;
  updateHPBar();
  closeHPPopup();
}

function saveCharInfo() { showToast('✅ Character info tersimpan (session storage).'); }

// Conditions
let charConditions = [];
function addCharCondition(cond) {
  if (!cond || charConditions.includes(cond)) return;
  charConditions.push(cond);
  renderCharConditions();
}
function removeCharCondition(cond) {
  charConditions = charConditions.filter(c => c !== cond);
  renderCharConditions();
}
function renderCharConditions() {
  const el = document.getElementById('char-conditions');
  el.innerHTML = charConditions.map(c =>
    `<span class="cond-tag cond-${c}" onclick="removeCharCondition('${c}')" title="Click to remove">${c}</span>`
  ).join('');
}

// Death saves
let dsSuc = 0, dsFail = 0;
function renderDeathSaves() {
  ['success','fail'].forEach(type => {
    const el = document.getElementById(`ds-${type}`);
    const count = type === 'success' ? dsSuc : dsFail;
    el.innerHTML = [0,1,2].map(i =>
      `<div class="ds-pip ${i < count ? type : ''}" onclick="toggleDS('${type}',${i})"></div>`
    ).join('');
  });
  const status = document.getElementById('ds-status');
  if (dsFail >= 3) { status.textContent = '💀 DEAD'; status.style.color = 'var(--red3)'; }
  else if (dsSuc >= 3) { status.textContent = '💚 STABLE'; status.style.color = 'var(--green3)'; }
  else if (dsSuc > 0 || dsFail > 0) { status.textContent = `${dsSuc}✓  ${dsFail}✗ — Rolling...`; status.style.color = 'var(--gold2)'; }
  else { status.textContent = 'Stable'; status.style.color = 'var(--text3)'; }
}
function toggleDS(type, idx) {
  if (type === 'success') dsSuc = (dsSuc === idx + 1) ? idx : idx + 1;
  else dsFail = (dsFail === idx + 1) ? idx : idx + 1;
  renderDeathSaves();
}
function resetDeathSaves() { dsSuc = 0; dsFail = 0; renderDeathSaves(); }

// Saves
const SAVES_DEF = [
  { ab: 'str', name: 'Strength' },
  { ab: 'dex', name: 'Dexterity' },
  { ab: 'con', name: 'Constitution' },
  { ab: 'int', name: 'Intelligence' },
  { ab: 'wis', name: 'Wisdom' },
  { ab: 'cha', name: 'Charisma' },
];
let saveProficiency = {};
function renderSaves() {
  const prof = parseInt(document.getElementById('char-prof').value) || 2;
  const list = document.getElementById('saves-list');
  list.innerHTML = SAVES_DEF.map(s => {
    const abScore = parseInt(document.getElementById(`stat-${s.ab}`).value) || 10;
    const mod = getMod(abScore);
    const isProficient = saveProficiency[s.ab] || false;
    const total = mod + (isProficient ? prof : 0);
    return `<div class="save-row">
      <div class="prof-pip ${isProficient ? 'proficient' : ''}" onclick="toggleSaveProf('${s.ab}')" title="Toggle proficiency"></div>
      <span style="flex:1;font-size:0.8rem;color:var(--text2);">${s.name}</span>
      <span style="font-family:var(--mono);font-size:0.82rem;color:var(--gold2);min-width:28px;text-align:right;">${fmtMod(total)}</span>
      <button class="icon-btn" style="font-size:0.65rem;" onclick="quickRollSave('${s.ab}','${s.name} Save')" title="Quick roll">🎲</button>
    </div>`;
  }).join('');
}
function toggleSaveProf(ab) { saveProficiency[ab] = !saveProficiency[ab]; renderSaves(); }
function quickRollSave(ab, name) {
  const prof = parseInt(document.getElementById('char-prof').value) || 2;
  const score = parseInt(document.getElementById(`stat-${ab}`).value) || 10;
  const mod = getMod(score) + (saveProficiency[ab] ? prof : 0);
  const roll = Math.floor(Math.random() * 20) + 1;
  const total = roll + mod;
  const isCrit = roll === 20, isFail = roll === 1;
  document.getElementById('roll-result').style.display = '';
  document.getElementById('roll-result').textContent = total;
  document.getElementById('roll-result').style.color = isCrit ? '#58d68d' : isFail ? '#e74c3c' : 'var(--gold2)';
  document.getElementById('roll-detail').textContent = `${name}: ${roll} ${fmtMod(mod)} = ${total}${isCrit ? ' — CRIT!' : isFail ? ' — FAIL!' : ''}`;
  addToHistory(`${name}: ${roll}${fmtMod(mod)}=${total}`);
  sfxPlay(isCrit ? 'crit' : 'dice');
}

// Skills
const SKILLS_DEF = [
  { name:'Acrobatics', ab:'dex' }, { name:'Animal Handling', ab:'wis' },
  { name:'Arcana', ab:'int' }, { name:'Athletics', ab:'str' },
  { name:'Deception', ab:'cha' }, { name:'History', ab:'int' },
  { name:'Insight', ab:'wis' }, { name:'Intimidation', ab:'cha' },
  { name:'Investigation', ab:'int' }, { name:'Medicine', ab:'wis' },
  { name:'Nature', ab:'int' }, { name:'Perception', ab:'wis' },
  { name:'Performance', ab:'cha' }, { name:'Persuasion', ab:'cha' },
  { name:'Religion', ab:'int' }, { name:'Sleight of Hand', ab:'dex' },
  { name:'Stealth', ab:'dex' }, { name:'Survival', ab:'wis' },
];
let skillProf = {}, skillExpertise = {};
function renderSkills() {
  const prof = parseInt(document.getElementById('char-prof').value) || 2;
  const list = document.getElementById('skills-list');
  list.innerHTML = SKILLS_DEF.map(s => {
    const score = parseInt(document.getElementById(`stat-${s.ab}`).value) || 10;
    const mod = getMod(score);
    const bonus = skillExpertise[s.name] ? prof*2 : skillProf[s.name] ? prof : 0;
    const total = mod + bonus;
    const pipClass = skillExpertise[s.name] ? 'expertise' : skillProf[s.name] ? 'proficient' : '';
    return `<div class="skill-row">
      <div class="prof-pip ${pipClass}" onclick="cycleSkillProf('${s.name}')" title="Click to cycle: none → prof → expertise"></div>
      <span style="flex:1;font-size:0.76rem;color:var(--text2);">${s.name}</span>
      <span style="font-size:0.62rem;color:var(--text3);font-family:var(--display);letter-spacing:0.04em;">${s.ab.toUpperCase()}</span>
      <span style="font-family:var(--mono);font-size:0.8rem;color:var(--gold2);min-width:26px;text-align:right;">${fmtMod(total)}</span>
      <button class="icon-btn" style="font-size:0.6rem;" onclick="quickRollSkill('${s.name}','${s.ab}')" title="Roll">🎲</button>
    </div>`;
  }).join('');
}
function cycleSkillProf(skill) {
  if (skillExpertise[skill]) { skillExpertise[skill] = false; skillProf[skill] = false; }
  else if (skillProf[skill]) { skillExpertise[skill] = true; skillProf[skill] = false; }
  else { skillProf[skill] = true; }
  renderSkills();
}
function quickRollSkill(skill, ab) {
  const prof = parseInt(document.getElementById('char-prof').value) || 2;
  const score = parseInt(document.getElementById(`stat-${ab}`).value) || 10;
  const mod = getMod(score);
  const bonus = skillExpertise[skill] ? prof*2 : skillProf[skill] ? prof : 0;
  const total_mod = mod + bonus;
  const roll = Math.floor(Math.random() * 20) + 1;
  const total = roll + total_mod;
  const isCrit = roll === 20, isFail = roll === 1;
  document.getElementById('roll-result').style.display = '';
  document.getElementById('roll-result').textContent = total;
  document.getElementById('roll-result').style.color = isCrit ? '#58d68d' : isFail ? '#e74c3c' : 'var(--gold2)';
  document.getElementById('roll-detail').textContent = `${skill}: ${roll}${fmtMod(total_mod)}=${total}`;
  addToHistory(`${skill}: ${roll}${fmtMod(total_mod)}=${total}`);
  sfxPlay(isCrit ? 'crit' : 'dice');
  if (window.location.pathname || true) switchPanel('dice');
}

// Inspiration
let hasInspiration = false;
function toggleInspiration() {
  hasInspiration = !hasInspiration;
  const fill = document.getElementById('insp-fill');
  const icon = document.getElementById('insp-icon');
  const status = document.getElementById('inspiration-status');
  if (hasInspiration) {
    fill.style.fill = 'rgba(127,170,220,0.4)';
    document.getElementById('insp-outline').setAttribute('stroke','var(--gold)');
    icon.textContent = '◆';
    icon.style.color = 'var(--gold2)';
    status.textContent = 'Heroic Inspiration active!';
    status.style.color = 'var(--gold2)';
    showToast('⭐ Heroic Inspiration granted!');
  } else {
    fill.style.fill = 'rgba(127,170,220,0)';
    document.getElementById('insp-outline').setAttribute('stroke','var(--border2)');
    icon.textContent = '◇';
    icon.style.color = 'var(--text3)';
    status.textContent = 'Click diamond to toggle';
    status.style.color = 'var(--text3)';
    showToast('✦ Inspiration spent.');
  }
}

function shortRest() { showToast('☀ Short Rest! Warlock slot, Action Surge, Second Wind kembali.'); sfxPlay('heal'); }
function longRest() {
  // Restore all spell slots
  const cur = parseInt(document.getElementById('caster-level').value) || 1;
  const type = document.getElementById('caster-type').value;
  if (type !== 'none') {
    playerSpellSlots.forEach(s => { s.used = 0; s.pips = Array(s.max).fill(false); });
    renderSpellSlots();
  }
  // Restore HP
  const maxhp = document.getElementById('char-maxhp').value;
  document.getElementById('char-hp').value = maxhp;
  updateHPBar();
  showToast('🌙 Long Rest! HP penuh, semua slot kembali.');
  sfxPlay('heal');
}

// updateShieldAC
function updateShieldAC() {
  // Visual indicator only — actual AC is typed manually
  const hasShield = document.getElementById('char-shield').checked;
  showToast(hasShield ? '🛡 Shield equipped (+2 AC)' : '🛡 Shield unequipped');
}

// updateProfFromLevel
function updateProfFromLevel() {
  const lvl = parseInt(document.getElementById('char-level').value) || 1;
  const prof = lvl <= 4 ? 2 : lvl <= 8 ? 3 : lvl <= 12 ? 4 : lvl <= 16 ? 5 : 6;
  document.getElementById('char-prof').value = prof;
  updateMods();
}

// Weapons — new charsheet format
let weapons = [];
function addWeapon() {
  weapons.push({ id: Date.now(), name: '', atk: '', dmg: '', notes: '' });
  renderWeapons();
}
function renderWeapons() {
  const list = document.getElementById('weapons-list');
  if (!weapons.length) { list.innerHTML = '<div style="font-size:0.78rem;color:var(--text3);font-style:italic;">Belum ada weapon. Klik + Add.</div>'; return; }
  list.innerHTML = weapons.map(w => `
    <div class="weapon-row">
      <input value="${w.name}" placeholder="Longsword" style="background:transparent;border:none;color:var(--text);font-size:0.78rem;padding:0;width:100%;" oninput="weapons.find(x=>x.id===${w.id}).name=this.value">
      <input value="${w.atk}" placeholder="+5 / DC13" style="background:transparent;border:none;color:var(--gold2);font-size:0.78rem;text-align:center;font-family:var(--mono);padding:0;width:100%;" oninput="weapons.find(x=>x.id===${w.id}).atk=this.value">
      <input value="${w.dmg}" placeholder="1d8+3 Slash" style="background:transparent;border:none;color:var(--red3);font-size:0.78rem;text-align:center;font-family:var(--mono);padding:0;width:100%;" oninput="weapons.find(x=>x.id===${w.id}).dmg=this.value">
      <input value="${w.notes}" placeholder="Versatile (1d10)..." style="background:transparent;border:none;color:var(--text3);font-size:0.7rem;padding:0;width:100%;" oninput="weapons.find(x=>x.id===${w.id}).notes=this.value">
      <button class="icon-btn danger" onclick="weapons=weapons.filter(x=>x.id!==${w.id});renderWeapons()">✕</button>
    </div>`
  ).join('');
}

// updateShieldAC already defined above

// ============================================================
// INVENTORY WEAPONS
// ============================================================
let invWeapons = [];

function submitInvWeapon() {
  const name  = document.getElementById('iw-name').value.trim();
  if (!name) { document.getElementById('iw-name').focus(); return; }
  const atk   = document.getElementById('iw-atk').value.trim();
  const dmg   = document.getElementById('iw-dmg').value.trim();
  const dtype = document.getElementById('iw-dtype').value;
  const wtype = document.getElementById('iw-wtype').value;
  const range = document.getElementById('iw-range').value.trim();
  const notes = document.getElementById('iw-notes').value.trim();
  invWeapons.push({ id: Date.now(), name, atk, dmg, dtype, wtype, range, notes, expanded: false });
  // clear fields
  ['iw-name','iw-atk','iw-dmg','iw-range','iw-notes'].forEach(id => document.getElementById(id).value = '');
  toggleAddForm('inv-weapon-form');
  renderInvWeapons();
  showToast(`⚔ ${name} ditambahkan!`);
}

function toggleInvWeaponExpand(id) {
  const w = invWeapons.find(x => x.id === id);
  if (w) { w.expanded = !w.expanded; renderInvWeapons(); }
}

function deleteInvWeapon(id) {
  invWeapons = invWeapons.filter(x => x.id !== id);
  renderInvWeapons();
}

// Damage type color map
const DTYPE_COLORS = {
  Slashing:'#e07060', Piercing:'#f0a060', Bludgeoning:'#b09080',
  Fire:'#e05020', Cold:'#60c0e0', Lightning:'#e0e020',
  Thunder:'#9080e0', Poison:'#60c040', Psychic:'#e060c0',
  Radiant:'#f0f060', Necrotic:'#806080', Force:'#6080f0',
  Acid:'#80e040', Mixed:'#a0a0a0'
};

const WTYPE_ICONS = { Melee:'⚔', Ranged:'🏹', Thrown:'🎯', Spell:'✨' };

function renderInvWeapons() {
  const list = document.getElementById('inv-weapons-list');
  if (!list) return;
  if (!invWeapons.length) {
    list.innerHTML = `<div style="font-size:0.78rem;color:var(--text3);font-style:italic;text-align:center;padding:10px;">
      Belum ada weapon. Klik + Add untuk menambahkan senjata.
    </div>`;
    return;
  }

  list.innerHTML = invWeapons.map(w => {
    const dtColor = DTYPE_COLORS[w.dtype] || 'var(--text3)';
    const wtIcon  = WTYPE_ICONS[w.wtype] || '⚔';

    return `
    <div style="background:var(--bg3);border:1px solid var(--border2);border-left:3px solid ${dtColor};border-radius:3px;overflow:hidden;transition:border-color 0.2s;">

      <!-- Main row -->
      <div style="display:flex;align-items:center;gap:8px;padding:8px 10px;cursor:pointer;" onclick="toggleInvWeaponExpand(${w.id})">
        <span style="font-size:1rem;flex-shrink:0;">${wtIcon}</span>
        <div style="flex:1;min-width:0;">
          <div style="font-family:var(--display);font-size:0.8rem;color:var(--text);font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${w.name}</div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:2px;">
            ${w.atk ? `<span style="font-family:var(--mono);font-size:0.72rem;color:var(--gold2);">ATK ${w.atk}</span>` : ''}
            ${w.dmg ? `<span style="font-family:var(--mono);font-size:0.72rem;color:var(--red3);">${w.dmg}</span>` : ''}
            <span style="font-size:0.62rem;color:${dtColor};font-family:var(--display);letter-spacing:0.05em;">${w.dtype}</span>
          </div>
        </div>
        <span style="font-size:0.7rem;color:var(--text3);flex-shrink:0;">${w.expanded ? '▲' : '▼'}</span>
      </div>

      <!-- Expanded detail -->
      ${w.expanded ? `
      <div style="border-top:1px solid var(--border);padding:8px 10px;display:flex;flex-direction:column;gap:6px;">

        <!-- Editable fields -->
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
          <div class="npc-field">
            <label>Nama Senjata</label>
            <input value="${w.name}" style="font-family:var(--display);" oninput="invWeapons.find(x=>x.id===${w.id}).name=this.value;renderInvWeapons()">
          </div>
          <div class="npc-field">
            <label>Tipe</label>
            <select onchange="invWeapons.find(x=>x.id===${w.id}).wtype=this.value;renderInvWeapons()">
              ${['Melee','Ranged','Thrown','Spell'].map(t => `<option ${w.wtype===t?'selected':''}>${t}</option>`).join('')}
            </select>
          </div>
          <div class="npc-field">
            <label>ATK Bonus / Spell DC</label>
            <input value="${w.atk}" placeholder="+5 atau DC 14" style="font-family:var(--mono);" oninput="invWeapons.find(x=>x.id===${w.id}).atk=this.value">
          </div>
          <div class="npc-field">
            <label>Damage Dice</label>
            <input value="${w.dmg}" placeholder="2d6+4" style="font-family:var(--mono);" oninput="invWeapons.find(x=>x.id===${w.id}).dmg=this.value">
          </div>
          <div class="npc-field">
            <label>Damage Type</label>
            <select onchange="invWeapons.find(x=>x.id===${w.id}).dtype=this.value;renderInvWeapons()">
              ${Object.keys(DTYPE_COLORS).map(t => `<option ${w.dtype===t?'selected':''}>${t}</option>`).join('')}
            </select>
          </div>
          <div class="npc-field">
            <label>Range / Reach</label>
            <input value="${w.range}" placeholder="5 ft / 80/320 ft" oninput="invWeapons.find(x=>x.id===${w.id}).range=this.value">
          </div>
        </div>

        <!-- Notes - full width textarea -->
        <div class="npc-field">
          <label>📝 Notes & Properties</label>
          <textarea style="width:100%;min-height:70px;resize:vertical;font-size:0.8rem;line-height:1.5;" placeholder="Versatile (1d10), Finesse, Reach, Loading, Thrown (20/60)&#10;Silvered, +1d6 fire damage, Vorpal (nat 20 = decapitation)&#10;Special abilities, attunement bonuses, backstory..." oninput="invWeapons.find(x=>x.id===${w.id}).notes=this.value">${w.notes}</textarea>
        </div>

        <!-- Quick roll button -->
        <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;">
          <button class="btn" style="font-size:0.62rem;padding:5px 10px;" onclick="quickRollInvWeapon(${w.id})">🎲 Quick Attack Roll</button>
          <button class="btn" style="font-size:0.62rem;padding:5px 10px;" onclick="quickRollInvDmg(${w.id})">💥 Roll Damage</button>
          <div style="flex:1;"></div>
          <button class="btn red" style="font-size:0.6rem;padding:4px 8px;" onclick="deleteInvWeapon(${w.id})">🗑 Hapus</button>
        </div>

      </div>` : ''}
    </div>`;
  }).join('');
}

function quickRollInvWeapon(id) {
  const w = invWeapons.find(x => x.id === id); if (!w) return;
  sfxPlay('dice');
  const roll = Math.floor(Math.random() * 20) + 1;
  const atkNum = parseInt(w.atk) || 0;
  const total  = roll + atkNum;
  const isCrit = roll === 20, isFail = roll === 1;
  const label  = `${w.name} ATK: ${roll}${atkNum >= 0 ? '+' : ''}${atkNum}=${total}${isCrit ? ' 🌟 CRIT!' : isFail ? ' 💀 MISS!' : ''}`;
  showToast(label);
  // Log to dice history if on dice tab
  addToHistory(label);
  if (isCrit) sfxPlay('crit');
}

function quickRollInvDmg(id) {
  const w = invWeapons.find(x => x.id === id); if (!w) return;
  sfxPlay('dice');
  const expr = w.dmg.trim();
  if (!expr) { showToast('Isi damage dice dulu!'); return; }
  const m = expr.match(/^(\d+)d(\d+)([+-]\d+)?$/i);
  if (!m) { showToast(`Damage: ${expr}`); return; }
  const qty  = parseInt(m[1]), sides = parseInt(m[2]), mod = m[3] ? parseInt(m[3]) : 0;
  const rolls = Array.from({length: qty}, () => Math.floor(Math.random() * sides) + 1);
  const sum  = rolls.reduce((a,b) => a+b, 0) + mod;
  const dtColor = DTYPE_COLORS[w.dtype] || '';
  const label = `${w.name} DMG: [${rolls.join('+')}]${mod ? (mod>0?`+${mod}`:`${mod}`) : ''} = ${sum} ${w.dtype}`;
  showToast(label);
  addToHistory(label);
}



// ============================================================
// COINS + COIN WEIGHT TRACKER  (50 coins = 1 lb)
// ============================================================
function adjustCoin(type, delta) {
  const el = document.getElementById(`coin-${type}`);
  const cur = parseInt(el.value) || 0;
  el.value = Math.max(0, cur + delta);
  updateCoinWeight();
}

function updateCoinWeight() {
  const COIN_COLORS = {
    pp: '#e0c870', gp: 'var(--gold2)', ep: '#c0b8f0', sp: '#c8c8d8', cp: '#d0903a'
  };
  const COIN_NAMES = { pp: 'Platinum', gp: 'Gold', ep: 'Electrum', sp: 'Silver', cp: 'Copper' };

  const counts = {
    pp: parseInt(document.getElementById('coin-pp')?.value) || 0,
    gp: parseInt(document.getElementById('coin-gp')?.value) || 0,
    ep: parseInt(document.getElementById('coin-ep')?.value) || 0,
    sp: parseInt(document.getElementById('coin-sp')?.value) || 0,
    cp: parseInt(document.getElementById('coin-cp')?.value) || 0,
  };

  // 50 coins = 1 lb, 1 coin = 0.02 lb
  const weights = {};
  let totalCoins  = 0;
  let totalWeight = 0;
  Object.entries(counts).forEach(([type, qty]) => {
    const w = qty * 0.02; // = qty / 50
    weights[type] = w;
    totalCoins    += qty;
    totalWeight   += w;
  });
  totalWeight = Math.round(totalWeight * 100) / 100;

  // Update per-coin weight labels
  Object.entries(weights).forEach(([type, w]) => {
    const el = document.getElementById(`coin-${type}-weight`);
    if (el) el.textContent = w > 0 ? `${w.toFixed(2)} lb` : '—';
  });

  // Update totals
  const countEl  = document.getElementById('coin-total-count');
  const weightEl = document.getElementById('coin-total-weight');
  if (countEl)  countEl.textContent  = `${totalCoins.toLocaleString()} koin`;
  if (weightEl) weightEl.textContent = `${totalWeight.toFixed(2)} lb`;

  // --- Weight bar inside coins widget ---
  const maxWeight  = parseFloat(document.getElementById('enc-max-custom')?.value) || 100;
  const pct        = maxWeight > 0 ? Math.min(100, (totalWeight / maxWeight) * 100) : 0;
  const barColor   = pct <= 0 ? '#60c8ff' : pct <= 50 ? '#58d68d' : pct <= 75 ? '#e0d040' : pct <= 100 ? '#e09030' : '#e74c3c';
  const remaining  = maxWeight - totalWeight;

  const bar    = document.getElementById('coin-weight-bar');
  const pctLbl = document.getElementById('coin-weight-pct');
  const usedLbl   = document.getElementById('coin-weight-used-lbl');
  const remainLbl = document.getElementById('coin-weight-remain-lbl');

  if (bar)      { bar.style.width = pct + '%'; bar.style.background = barColor; }
  if (pctLbl)   pctLbl.textContent = `${pct.toFixed(1)}% dari max`;
  if (usedLbl)  usedLbl.textContent = `${totalWeight.toFixed(2)} lb digunakan`;
  if (remainLbl) {
    const remStr = remaining >= 0 ? `${remaining.toFixed(2)} lb tersisa` : `⛔ +${Math.abs(remaining).toFixed(2)} lb over`;
    remainLbl.textContent  = remStr;
    remainLbl.style.color  = remaining < 0 ? '#e74c3c' : 'var(--text3)';
  }

  // --- Breakdown bar per coin type ---
  const breakdown = document.getElementById('coin-weight-breakdown');
  if (breakdown && totalCoins > 0) {
    breakdown.innerHTML = Object.entries(counts)
      .filter(([, qty]) => qty > 0)
      .map(([type, qty]) => {
        const w    = weights[type];
        const share = totalWeight > 0 ? (w / totalWeight) * 100 : 0;
        const color = COIN_COLORS[type];
        return `<div style="display:flex;align-items:center;gap:6px;">
          <span style="font-family:var(--display);font-size:0.55rem;color:${color};width:22px;letter-spacing:0.06em;">${type.toUpperCase()}</span>
          <div style="flex:1;background:var(--bg3);border-radius:2px;height:6px;overflow:hidden;">
            <div style="height:100%;width:${share}%;background:${color};border-radius:2px;transition:width 0.3s;"></div>
          </div>
          <span style="font-family:var(--mono);font-size:0.58rem;color:${color};white-space:nowrap;">${qty} × 0.02 = ${w.toFixed(2)} lb</span>
        </div>`;
      }).join('');
  } else if (breakdown) {
    breakdown.innerHTML = '';
  }

  // Sync to main weight tracker
  updateEncumbrance();
}

// initial call deferred to after all arrays are initialized
// updateCoinWeight() called at bottom of script

// ============================================================
// SPELL LIST ENTRIES
// ============================================================
let spellEntries = [];
function addSpellEntry() {
  spellEntries.push({ id: Date.now(), level: '0', name: '', castTime: '1 Action', range: '', conc: false, ritual: false, material: false, notes: '' });
  renderSpellEntries();
}
function removeSpellEntry(id) {
  spellEntries = spellEntries.filter(s => s.id !== id);
  renderSpellEntries();
}
function renderSpellEntries() {
  const list = document.getElementById('spell-list-entries');
  if (!spellEntries.length) {
    list.innerHTML = '<div style="font-size:0.78rem;color:var(--text3);font-style:italic;padding:4px;">Belum ada spell. Klik + Add.</div>';
    return;
  }
  list.innerHTML = spellEntries.map(s => `
    <div class="spell-entry-row">
      <input value="${s.level}" placeholder="0" style="background:transparent;border:none;color:var(--purple3);font-size:0.78rem;text-align:center;font-family:var(--mono);padding:0;width:100%;" oninput="spellEntries.find(x=>x.id===${s.id}).level=this.value">
      <input value="${s.name}" placeholder="Fireball..." style="background:transparent;border:none;color:var(--text);font-size:0.78rem;padding:0;width:100%;" oninput="spellEntries.find(x=>x.id===${s.id}).name=this.value">
      <input value="${s.castTime}" placeholder="1 Action" style="background:transparent;border:none;color:var(--text2);font-size:0.72rem;padding:0;width:100%;" oninput="spellEntries.find(x=>x.id===${s.id}).castTime=this.value">
      <input value="${s.range}" placeholder="150 ft" style="background:transparent;border:none;color:var(--text2);font-size:0.72rem;padding:0;width:100%;" oninput="spellEntries.find(x=>x.id===${s.id}).range=this.value">
      <div style="display:flex;gap:3px;align-items:center;justify-content:center;">
        <label style="display:flex;align-items:center;gap:1px;font-size:0.62rem;cursor:pointer;color:${s.conc?'var(--gold2)':'var(--text3)'};" title="Concentration">
          <input type="checkbox" ${s.conc?'checked':''} onchange="spellEntries.find(x=>x.id===${s.id}).conc=this.checked;renderSpellEntries()" style="width:11px;height:11px;min-width:0;"> C
        </label>
        <label style="display:flex;align-items:center;gap:1px;font-size:0.62rem;cursor:pointer;color:${s.ritual?'var(--green3)':'var(--text3)'};" title="Ritual">
          <input type="checkbox" ${s.ritual?'checked':''} onchange="spellEntries.find(x=>x.id===${s.id}).ritual=this.checked;renderSpellEntries()" style="width:11px;height:11px;min-width:0;"> R
        </label>
        <label style="display:flex;align-items:center;gap:1px;font-size:0.62rem;cursor:pointer;color:${s.material?'var(--blue3)':'var(--text3)'};" title="Material">
          <input type="checkbox" ${s.material?'checked':''} onchange="spellEntries.find(x=>x.id===${s.id}).material=this.checked;renderSpellEntries()" style="width:11px;height:11px;min-width:0;"> M
        </label>
      </div>
      <button class="icon-btn danger" onclick="removeSpellEntry(${s.id})">✕</button>
    </div>`
  ).join('');
}


// ============================================================
// SPELLCASTING STATS (auto-compute from Character stats)
// ============================================================
function updateSpellStats() {
  const ability = document.getElementById('spell-ability')?.value;
  const abMap = { 'INT': 'int', 'WIS': 'wis', 'CHA': 'cha' };
  const ab = abMap[ability];
  if (!ab) {
    document.getElementById('spell-save-dc-display').textContent = '—';
    document.getElementById('spell-mod-display').textContent = '—';
    document.getElementById('spell-atk-display').textContent = '—';
    const dcEl = document.getElementById('char-spelldc');
    if (dcEl) dcEl.value = '—';
    return;
  }
  const score = parseInt(document.getElementById(`stat-${ab}`)?.value) || 10;
  const prof  = parseInt(document.getElementById('char-prof')?.value) || 2;
  const mod   = getMod(score);
  const dc    = 8 + prof + mod;
  const atk   = prof + mod;
  document.getElementById('spell-save-dc-display').textContent = dc;
  document.getElementById('spell-mod-display').textContent  = fmtMod(mod);
  document.getElementById('spell-atk-display').textContent  = fmtMod(atk);
  // Sync to Character tab
  const dcEl = document.getElementById('char-spelldc');
  if (dcEl) dcEl.value = dc;
}

// ============================================================
// DICE ROLLER
// ============================================================
let rollAdvMode = 'normal';
let rollHistoryArr = [];

function setAdv(mode) {
  rollAdvMode = mode;
  ['adv','norm','dis'].forEach(k => document.getElementById(`adv-${k}`).classList.remove('adv-sel'));
  const map = { advantage:'adv', normal:'norm', disadvantage:'dis' };
  document.getElementById(`adv-${map[mode]}`).classList.add('adv-sel');
}
setAdv('normal');

function rollDie(sides) {
  sfxPlay('dice');
  const qty = parseInt(document.getElementById('dice-qty').value) || 1;
  const mod = parseInt(document.getElementById('dice-mod').value) || 0;
  let rolls = [];
  let result, detail;
  if (rollAdvMode !== 'normal' && qty === 1) {
    const r1 = Math.floor(Math.random() * sides) + 1;
    const r2 = Math.floor(Math.random() * sides) + 1;
    result = rollAdvMode === 'advantage' ? Math.max(r1,r2) : Math.min(r1,r2);
    detail = `d${sides} [${r1}, ${r2}] ${rollAdvMode === 'advantage' ? '▲' : '▼'} = ${result}${mod !== 0 ? ` + ${mod} = ${result+mod}` : ''}`;
    result += mod;
  } else {
    for (let i = 0; i < qty; i++) rolls.push(Math.floor(Math.random() * sides) + 1);
    const sum = rolls.reduce((a,b)=>a+b,0);
    result = sum + mod;
    detail = `${qty}d${sides} [${rolls.join(', ')}]${mod !== 0 ? ` + ${mod}` : ''} = ${result}`;
  }
  showRollResult(result, detail, sides === 20 && rolls.length === 1 && (rolls[0] === 20 || rolls[0] === 1) ? rolls[0] : null);
}

function rollExpression() {
  sfxPlay('dice');
  const expr = document.getElementById('dice-expr').value.trim();
  if (!expr) return;
  try {
    const m = expr.match(/^(\d+)d(\d+)([+-]\d+)?$/i);
    if (!m) { showToast('Format: NdX atau NdX+M (misal: 2d6+3)'); return; }
    const qty = parseInt(m[1]), sides = parseInt(m[2]), mod2 = m[3] ? parseInt(m[3]) : 0;
    const rolls2 = [];
    for (let i = 0; i < qty; i++) rolls2.push(Math.floor(Math.random() * sides) + 1);
    const total2 = rolls2.reduce((a,b)=>a+b,0) + mod2;
    const detail2 = `${expr} [${rolls2.join(', ')}]${mod2 !== 0 ? ` + ${mod2}` : ''} = ${total2}`;
    showRollResult(total2, detail2);
  } catch(e) { showToast('Format tidak valid'); }
}

function showRollResult(result, detail, rawRoll) {
  const res = document.getElementById('roll-result');
  const det = document.getElementById('roll-detail');
  res.style.display = '';
  res.textContent = result;
  res.style.color = rawRoll === 20 ? '#58d68d' : rawRoll === 1 ? '#e74c3c' : 'var(--gold2)';
  det.textContent = detail + (rawRoll === 20 ? ' 🌟 NAT 20!' : rawRoll === 1 ? ' 💀 NAT 1!' : '');
  addToHistory(detail);
  if (rawRoll === 20) sfxPlay('crit');
}

function addToHistory(text) {
  rollHistoryArr.unshift(text);
  if (rollHistoryArr.length > 20) rollHistoryArr.pop();
  document.getElementById('roll-history').innerHTML = rollHistoryArr.map(r => `<div>${r}</div>`).join('');
}

function rollCustom() {
  // Focus the expression input on dice tab instead of using prompt
  switchPanel('dice');
  setTimeout(() => {
    const el = document.getElementById('dice-expr');
    if (el) { el.focus(); el.select(); }
  }, 100);
}

function rollAbilityCheck(ab, label) {
  sfxPlay('dice');
  const score = parseInt(document.getElementById(`stat-${ab}`).value) || 10;
  const mod = getMod(score);
  const roll = Math.floor(Math.random() * 20) + 1;
  const total = roll + mod;
  const isCrit = roll === 20, isFail = roll === 1;
  document.getElementById('roll-result').style.display = '';
  document.getElementById('roll-result').textContent = total;
  document.getElementById('roll-result').style.color = isCrit ? '#58d68d' : isFail ? '#e74c3c' : 'var(--gold2)';
  document.getElementById('roll-detail').textContent = `${label}: ${roll}${fmtMod(mod)}=${total}${isCrit ? ' 🌟 NAT 20!' : isFail ? ' 💀 NAT 1!' : ''}`;
  addToHistory(`${label}: ${roll}${fmtMod(mod)}=${total}`);
  if (isCrit) sfxPlay('crit');
}

function rollSave(ab, label) { rollAbilityCheck(ab, label); }

// ============================================================
// ============================================================
// CONCENTRATION TRACKER
// ============================================================
let concSpells = [];
let _concSaveTargetId = null;

function toggleConcCustom(boxId, val) {
  const box = document.getElementById(boxId);
  if (box) box.style.display = val === 'custom' ? 'block' : 'none';
}

function addConcSpellInline() {
  const nameEl = document.getElementById('conc-name-input');
  const durEl  = document.getElementById('conc-dur-input');
  const name   = nameEl.value.trim();
  if (!name) { nameEl.focus(); showToast('Masukkan nama spell dulu!'); return; }
  let durSec;
  if (durEl.value === 'custom') {
    durSec = parseInt(document.getElementById('conc-dur-custom')?.value) || 60;
  } else {
    durSec = parseInt(durEl.value) || 60;
  }
  concSpells.push({ id: Date.now(), spell: name, startTime: Date.now(), durSec });
  nameEl.value = '';
  durEl.value  = '60';
  const customBox = document.getElementById('conc-custom-1');
  if (customBox) customBox.style.display = 'none';
  startConcTimer();
  renderConc();
  showToast(`🌀 Concentrating on ${name}!`);
}

function addConcSpellInline2() {
  const nameEl = document.getElementById('conc-name-input2');
  const durEl  = document.getElementById('conc-dur-input2');
  const name   = nameEl.value.trim();
  if (!name) { nameEl.focus(); showToast('Masukkan nama spell dulu!'); return; }
  let durSec;
  if (durEl.value === 'custom') {
    durSec = parseInt(document.getElementById('conc-dur-custom2')?.value) || 60;
  } else {
    durSec = parseInt(durEl.value) || 60;
  }
  concSpells.push({ id: Date.now(), spell: name, startTime: Date.now(), durSec });
  nameEl.value = '';
  durEl.value  = '60';
  const customBox = document.getElementById('conc-custom-2');
  if (customBox) customBox.style.display = 'none';
  startConcTimer();
  renderConc();
  showToast(`🌀 Concentrating on ${name}!`);
}

// Keep old addConcSpell as alias for backwards compat
function addConcSpell() { addConcSpellInline(); }

function startConcTimer() {
  if (window._concInterval) return;
  window._concInterval = setInterval(renderConc, 1000);
}

function removeConcSpell(id) {
  const c = concSpells.find(x => x.id === id);
  concSpells = concSpells.filter(c => c.id !== id);
  if (c) showToast(`❌ ${c.spell} — konsentrasi selesai.`);
  closeConcDmgBox();
  renderConc();
}

// Open inline damage input box for a specific spell
function openConcSaveBox(id) {
  _concSaveTargetId = id;
  const box = document.getElementById('conc-dmg-box');
  if (box) {
    box.style.display = 'block';
    const inp = document.getElementById('conc-dmg-val');
    inp.value = '';
    inp.focus();
  }
}

function closeConcDmgBox() {
  _concSaveTargetId = null;
  const box = document.getElementById('conc-dmg-box');
  if (box) box.style.display = 'none';
}

function execConcSave() {
  const id = _concSaveTargetId;
  const c = concSpells.find(x => x.id === id);
  if (!c) { closeConcDmgBox(); return; }
  const dmg = parseInt(document.getElementById('conc-dmg-val').value) || 0;
  if (!dmg) { showToast('Masukkan jumlah damage!'); return; }
  const dc = Math.max(10, Math.floor(dmg / 2));
  const conScore = parseInt(document.getElementById('stat-con')?.value) || 10;
  const prof = parseInt(document.getElementById('char-prof')?.value) || 2;
  const mod = getMod(conScore) + (saveProficiency['con'] ? prof : 0);
  const roll = Math.floor(Math.random() * 20) + 1;
  const total = roll + mod;
  const success = total >= dc;
  const nat = roll === 20 ? ' 🌟 NAT 20!' : roll === 1 ? ' 💀 NAT 1!' : '';
  const msg = `Conc Save (${c.spell}): ${roll}${fmtMod(mod)}=${total} vs DC ${dc} → ${success ? '✅ HELD' : '💔 BROKEN'}${nat}`;
  addToHistory(msg);
  closeConcDmgBox();
  if (!success || roll === 1) {
    sfxPlay('hit');
    showToast(`💔 ${c.spell} TERPUTUS! (${roll}${fmtMod(mod)}=${total} vs DC ${dc})`);
    removeConcSpell(id);
  } else {
    sfxPlay('heal');
    showToast(`✅ Konsentrasi bertahan! (${roll}${fmtMod(mod)}=${total} vs DC ${dc})${nat}`);
  }
}

// Allow Enter key in damage input
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && _concSaveTargetId) execConcSave();
});

function renderConc() {
  ['my-conc-list','my-conc-list2'].forEach(listId => {
    const list = document.getElementById(listId);
    if (!list) return;
    if (!concSpells.length) {
      list.innerHTML = '<div style="color:var(--text3);font-size:0.78rem;font-style:italic;">Tidak ada spell aktif.</div>';
      return;
    }
    list.innerHTML = concSpells.map(c => {
      const elapsed = Math.floor((Date.now() - c.startTime) / 1000);
      const remaining = Math.max(0, c.durSec - elapsed);
      const pct = c.durSec > 0 ? ((c.durSec - elapsed) / c.durSec) * 100 : 0;
      const mins = Math.floor(remaining / 60), secs = remaining % 60;
      const timeStr = remaining > 0 ? `${mins}:${String(secs).padStart(2,'0')}` : '⏰ EXPIRED';
      const timeColor = remaining > 30 ? 'var(--green3)' : remaining > 0 ? 'var(--gold2)' : 'var(--red3)';
      const pipCount = Math.min(10, Math.ceil(c.durSec / 6));
      const activePips = Math.floor(pct / 100 * pipCount);
      const pips = Array.from({length: pipCount}, (_, i) =>
        `<div class="conc-pip ${i < activePips ? 'on' : ''}"></div>`
      ).join('');
      const isActive = _concSaveTargetId === c.id;
      return `<div style="background:var(--bg3);border:1px solid ${isActive ? 'rgba(192,57,43,0.6)' : 'rgba(127,170,220,0.3)'};border-radius:3px;padding:8px 10px;transition:border-color 0.2s;">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:5px;">
          <span style="font-family:var(--display);font-size:0.75rem;color:var(--gold2);flex:1;">🌀 ${c.spell}</span>
          <span style="font-family:var(--mono);font-size:0.8rem;color:${timeColor};min-width:42px;text-align:right;">${timeStr}</span>
        </div>
        <div style="display:flex;gap:2px;flex-wrap:wrap;margin-bottom:6px;">${pips}</div>
        <div style="display:flex;gap:4px;">
          <button class="btn red" style="flex:1;font-size:0.62rem;padding:4px;" onclick="openConcSaveBox(${c.id})">🎲 CON Save</button>
          <button class="btn" style="font-size:0.62rem;padding:4px 8px;" onclick="resetConcTimer(${c.id})" title="Reset timer">↺</button>
          <button class="icon-btn danger" style="font-size:0.6rem;" onclick="removeConcSpell(${c.id})">✕</button>
        </div>
      </div>`;
    }).join('');
  });
}

function resetConcTimer(id) {
  const c = concSpells.find(x => x.id === id);
  if (c) { c.startTime = Date.now(); renderConc(); showToast(`↺ Timer ${c.spell} direset`); }
}

// ============================================================
// SPELL SLOTS
// ============================================================
const FULL_SLOTS = [[],[2],[3,2],[4,3,2],[4,3,3,1],[4,3,3,2,1],[4,3,3,3,2,1],[4,3,3,3,2,1,1],[4,3,3,3,2,1,1,1],[4,3,3,3,2,1,1,1,1],[4,3,3,3,2,2,1,1,1],[4,3,3,3,2,2,2,1,1],[4,3,3,3,2,2,2,2,1],[4,3,3,3,2,2,2,2,1],[4,3,3,3,2,2,2,2,2],[4,3,3,3,2,2,2,2,2],[4,3,3,3,2,2,2,2,2],[4,3,3,3,2,2,2,2,2],[4,3,3,3,3,2,2,2,2],[4,3,3,3,3,2,2,2,2],[4,3,3,3,3,2,2,2,2]];
const HALF_SLOTS = [[],[],[],[2],[3,1],[3,2],[3,3],[3,3,1],[4,3,2],[4,3,2],[4,3,3,1],[4,3,3,2],[4,3,3,2,1],[4,3,3,2,1],[4,3,3,2,2],[4,3,3,2,2],[4,3,3,3,2,1],[4,3,3,3,2,1],[4,3,3,3,2,2],[4,3,3,3,3,2],[4,3,3,3,3,2]];
const WARLOCK_SLOTS = [[],[1],[2],[2],[2],[2],[2],[2],[2],[2],[2],[3],[3],[3],[3],[3],[3],[4],[4],[4],[4]];
const WARLOCK_LEVEL = [0,1,1,2,2,3,3,4,4,5,5,5,5,5,5,5,5,5,5,5,5];

let playerSpellSlots = [];

function setCasterType() {
  const type = document.getElementById('caster-type').value;
  const lv = Math.min(20, Math.max(1, parseInt(document.getElementById('caster-level').value) || 1));
  const customRow = document.getElementById('custom-slot-row');
  if (type === 'custom') {
    customRow.style.display = 'block';
    setTimeout(() => document.getElementById('custom-slot-input').focus(), 80);
    return; // wait for user to click Apply
  }
  customRow.style.display = 'none';
  let rawSlots = [];
  if (type === 'full') rawSlots = FULL_SLOTS[lv] || [];
  else if (type === 'half') rawSlots = HALF_SLOTS[lv] || [];
  else if (type === 'warlock') { rawSlots = WARLOCK_SLOTS[lv] || []; }
  else { playerSpellSlots = []; renderSpellSlots(); return; }

  if (type === 'warlock') {
    const slotLv = WARLOCK_LEVEL[lv];
    const num = rawSlots[0] || 0;
    playerSpellSlots = num > 0 ? [{ level: slotLv, max: num, used: 0, pips: Array(num).fill(false) }] : [];
  } else {
    playerSpellSlots = rawSlots.map((max, i) => ({ level: i+1, max, used: 0, pips: Array(max).fill(false) })).filter(s => s.max > 0);
  }
  renderSpellSlots();
}

function applyCustomSlots() {
  const val = document.getElementById('custom-slot-input').value.trim();
  if (!val) return;
  const rawSlots = val.split(',').map(x => parseInt(x.trim()) || 0).filter(x => x > 0);
  playerSpellSlots = rawSlots.map((max, i) => ({ level: i+1, max, used: 0, pips: Array(max).fill(false) }));
  document.getElementById('custom-slot-row').style.display = 'none';
  renderSpellSlots();
  showToast(`✨ Custom slots applied: ${rawSlots.join(', ')}`);
}

function toggleSlot(slotLevel, idx) {
  const slot = playerSpellSlots.find(s => s.level === slotLevel); if (!slot) return;
  slot.pips[idx] = !slot.pips[idx];
  slot.used = slot.pips.filter(Boolean).length;
  renderSpellSlots();
}

function renderSpellSlots() {
  const list = document.getElementById('spell-slots-list');
  if (!playerSpellSlots.length) {
    list.innerHTML = '<div style="color:var(--text3);font-size:0.78rem;font-style:italic;text-align:center;padding:8px;">Pilih caster type dan level di atas.</div>';
    return;
  }
  list.innerHTML = playerSpellSlots.map(slot => {
    if (!slot.pips) slot.pips = Array(slot.max).fill(false);
    const pips = Array.from({length: slot.max}, (_, i) => {
      const used = slot.pips[i] || false;
      return `<div class="ss-slot ${used ? 'used' : ''}" onclick="toggleSlot(${slot.level},${i})" title="${used ? 'Used — klik restore' : 'Available — klik use'}"></div>`;
    }).join('');
    const remaining = slot.max - slot.used;
    return `<div style="display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px solid var(--border);">
      <div style="font-family:var(--display);font-size:0.6rem;color:var(--text3);letter-spacing:0.06em;width:40px;flex-shrink:0;">LVL ${slot.level}</div>
      <div style="display:flex;gap:4px;flex-wrap:wrap;flex:1;">${pips}</div>
      <div style="font-family:var(--mono);font-size:0.7rem;color:${remaining > 0 ? 'var(--gold2)' : 'var(--text3)'};">${remaining}/${slot.max}</div>
    </div>`;
  }).join('');
}

function shortRestSpells() {
  const type = document.getElementById('caster-type').value;
  if (type === 'warlock') {
    playerSpellSlots.forEach(s => { s.used = 0; s.pips = Array(s.max).fill(false); });
    showToast('☀ Short Rest — Warlock Pact Magic kembali!');
    sfxPlay('heal'); renderSpellSlots();
  } else { showToast('ℹ Spell slots recover saat Long Rest.'); }
}

function longRestSpells() {
  playerSpellSlots.forEach(s => { s.used = 0; s.pips = Array(s.max).fill(false); });
  showToast('🌙 Long Rest — Semua spell slots kembali!');
  sfxPlay('heal'); renderSpellSlots();
}

// ============================================================
// PERSONAL INVENTORY
// ============================================================
let personalItems = [];

function addPersonalItem() { toggleAddForm('inv-item-form'); }

function submitInvItem() {
  const name = document.getElementById('ii-name').value.trim();
  if (!name) { document.getElementById('ii-name').focus(); return; }
  const qty    = parseInt(document.getElementById('ii-qty').value)    || 1;
  const weight = parseFloat(document.getElementById('ii-weight').value) || 0;
  const notes  = document.getElementById('ii-notes').value.trim();
  personalItems.push({ id: Date.now(), name, qty, weight, notes, expanded: false });
  document.getElementById('ii-name').value  = '';
  document.getElementById('ii-qty').value   = '1';
  document.getElementById('ii-weight').value = '0';
  document.getElementById('ii-notes').value = '';
  toggleAddForm('inv-item-form');
  renderPersonalInventory();
  showToast(`🎒 ${name} ditambahkan!`);
}

function toggleInvItemExpand(id) {
  const item = personalItems.find(x => x.id === id);
  if (item) { item.expanded = !item.expanded; renderPersonalInventory(); }
}

function deleteInvItem(id) {
  personalItems = personalItems.filter(x => x.id !== id);
  renderPersonalInventory();
  updateEncumbrance();
}

function renderPersonalInventory() {
  const list = document.getElementById('personal-inventory-list');
  if (!list) return;

  if (!personalItems.length) {
    list.innerHTML = `<div style="color:var(--text3);font-size:0.78rem;font-style:italic;text-align:center;padding:12px;">
      Inventory kosong. Klik + Item untuk menambahkan.
    </div>`;
    updateEncumbrance();
    return;
  }

  list.innerHTML = personalItems.map(item => {
    const totalWeight = (item.weight * item.qty).toFixed(1);
    return `
    <div style="background:var(--bg3);border:1px solid var(--border2);border-radius:3px;overflow:hidden;">

      <!-- Collapsed row -->
      <div style="display:flex;align-items:center;gap:8px;padding:8px 10px;cursor:pointer;" onclick="toggleInvItemExpand(${item.id})">
        <span style="font-size:1rem;flex-shrink:0;">📦</span>
        <div style="flex:1;min-width:0;">
          <div style="font-family:var(--display);font-size:0.8rem;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.name}</div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:2px;">
            <span style="font-family:var(--mono);font-size:0.7rem;color:var(--gold2);">×${item.qty}</span>
            ${item.weight > 0 ? `<span style="font-size:0.65rem;color:var(--text3);">${totalWeight} kg</span>` : ''}
            ${item.notes ? `<span style="font-size:0.68rem;color:var(--text2);font-style:italic;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:160px;">${item.notes}</span>` : ''}
          </div>
        </div>
        <!-- Quick qty adjust -->
        <div style="display:flex;align-items:center;gap:3px;flex-shrink:0;" onclick="event.stopPropagation()">
          <button class="icon-btn" style="font-size:0.8rem;padding:2px 6px;" onclick="adjustItemQty(${item.id},-1)">−</button>
          <span style="font-family:var(--mono);font-size:0.8rem;color:var(--gold2);min-width:20px;text-align:center;">${item.qty}</span>
          <button class="icon-btn" style="font-size:0.8rem;padding:2px 6px;" onclick="adjustItemQty(${item.id},1)">+</button>
        </div>
        <span style="font-size:0.7rem;color:var(--text3);flex-shrink:0;">${item.expanded ? '▲' : '▼'}</span>
      </div>

      <!-- Expanded detail -->
      ${item.expanded ? `
      <div style="border-top:1px solid var(--border);padding:10px;display:flex;flex-direction:column;gap:8px;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
          <div class="npc-field">
            <label>Nama Item</label>
            <input value="${item.name}" oninput="personalItems.find(x=>x.id===${item.id}).name=this.value;renderPersonalInventory()">
          </div>
          <div class="npc-field">
            <label>Quantity</label>
            <input type="number" value="${item.qty}" min="0" style="font-family:var(--mono);text-align:center;" oninput="const v=parseInt(this.value)||0;const it=personalItems.find(x=>x.id===${item.id});if(it){it.qty=v;if(v===0){personalItems=personalItems.filter(x=>x.id!==${item.id});showToast('🗑 Item dihapus (qty=0)');}renderPersonalInventory();updateEncumbrance();}">
          </div>
          <div class="npc-field">
            <label>Berat per item (lb)</label>
            <input type="number" value="${item.weight}" min="0" step="0.1" style="font-family:var(--mono);text-align:center;" oninput="personalItems.find(x=>x.id===${item.id}).weight=parseFloat(this.value)||0;renderPersonalInventory();updateEncumbrance()">
          </div>
          <div class="npc-field">
            <label>Total Berat</label>
            <div style="font-family:var(--mono);font-size:0.9rem;color:var(--text2);padding:6px 8px;background:var(--bg2);border:1px solid var(--border);border-radius:2px;">${totalWeight} lb</div>
          </div>
        </div>
        <div class="npc-field">
          <label>📝 Notes</label>
          <textarea style="width:100%;min-height:65px;resize:vertical;font-size:0.8rem;line-height:1.5;" placeholder="Deskripsi, efek, cara pakai, nilai jual...&#10;Contoh: Healing Potion — 2d4+2 HP, satu kali pakai" oninput="personalItems.find(x=>x.id===${item.id}).notes=this.value">${item.notes}</textarea>
        </div>
        <div style="display:flex;justify-content:flex-end;">
          <button class="btn red" style="font-size:0.6rem;padding:4px 10px;" onclick="deleteInvItem(${item.id})">🗑 Hapus Item</button>
        </div>
      </div>` : ''}
    </div>`;
  }).join('');

  // Update total weight on encumbrance tracker
  updateEncumbrance();
}

function adjustItemQty(id, delta) {
  const item = personalItems.find(x => x.id === id);
  if (!item) return;
  item.qty = Math.max(0, item.qty + delta);
  if (item.qty === 0) {
    personalItems = personalItems.filter(x => x.id !== id);
    showToast('🗑 Item dihapus (qty = 0)');
  }
  renderPersonalInventory();
  updateEncumbrance();
}
// ============================================================
let genItems = [];

function submitGenItem() {
  const name   = document.getElementById('gi-name').value.trim();
  if (!name) { document.getElementById('gi-name').focus(); return; }
  const qty    = parseInt(document.getElementById('gi-qty').value)    || 1;
  const weight = parseFloat(document.getElementById('gi-weight').value) || 0;
  const notes  = document.getElementById('gi-notes').value.trim();
  genItems.push({ id: Date.now(), name, qty, weight, notes, expanded: false });
  document.getElementById('gi-name').value   = '';
  document.getElementById('gi-qty').value    = '1';
  document.getElementById('gi-weight').value = '0';
  document.getElementById('gi-notes').value  = '';
  toggleAddForm('gen-item-form');
  renderGenItems();
  showToast(`🪙 ${name} ditambahkan!`);
}

function toggleGenItemExpand(id) {
  const item = genItems.find(x => x.id === id);
  if (item) { item.expanded = !item.expanded; renderGenItems(); }
}

function deleteGenItem(id) {
  genItems = genItems.filter(x => x.id !== id);
  renderGenItems();
  updateEncumbrance();
}

function adjustGenItemQty(id, delta) {
  const item = genItems.find(x => x.id === id);
  if (!item) return;
  item.qty = Math.max(0, item.qty + delta);
  if (item.qty === 0) {
    genItems = genItems.filter(x => x.id !== id);
    showToast('🗑 Item dihapus (qty = 0)');
  }
  renderGenItems();
  updateEncumbrance();
}

function renderGenItems() {
  const list = document.getElementById('gen-items-list');
  if (!list) return;

  if (!genItems.length) {
    list.innerHTML = `<div style="color:var(--text3);font-size:0.78rem;font-style:italic;text-align:center;padding:12px;">
      Belum ada item. Klik + Add untuk menambahkan.
    </div>`;
    updateEncumbrance();
    return;
  }

  list.innerHTML = genItems.map(item => {
    const totalWeight = (item.weight * item.qty).toFixed(1);
    return `
    <div style="background:var(--bg3);border:1px solid var(--border2);border-radius:3px;overflow:hidden;">
      <!-- Collapsed row -->
      <div style="display:flex;align-items:center;gap:8px;padding:8px 10px;cursor:pointer;" onclick="toggleGenItemExpand(${item.id})">
        <span style="font-size:1rem;flex-shrink:0;">🪙</span>
        <div style="flex:1;min-width:0;">
          <div style="font-family:var(--display);font-size:0.8rem;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.name}</div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:2px;">
            <span style="font-family:var(--mono);font-size:0.7rem;color:var(--gold2);">×${item.qty}</span>
            ${item.weight > 0 ? `<span style="font-size:0.65rem;color:var(--text3);">${totalWeight} lb</span>` : ''}
            ${item.notes ? `<span style="font-size:0.68rem;color:var(--text2);font-style:italic;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:150px;">${item.notes}</span>` : ''}
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:3px;flex-shrink:0;" onclick="event.stopPropagation()">
          <button class="icon-btn" style="font-size:0.8rem;padding:2px 6px;" onclick="adjustGenItemQty(${item.id},-1)">−</button>
          <span style="font-family:var(--mono);font-size:0.8rem;color:var(--gold2);min-width:20px;text-align:center;">${item.qty}</span>
          <button class="icon-btn" style="font-size:0.8rem;padding:2px 6px;" onclick="adjustGenItemQty(${item.id},1)">+</button>
        </div>
        <span style="font-size:0.7rem;color:var(--text3);flex-shrink:0;">${item.expanded ? '▲' : '▼'}</span>
      </div>

      ${item.expanded ? `
      <div style="border-top:1px solid var(--border);padding:10px;display:flex;flex-direction:column;gap:8px;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
          <div class="npc-field">
            <label>Nama Item</label>
            <input value="${item.name}" oninput="genItems.find(x=>x.id===${item.id}).name=this.value;renderGenItems()">
          </div>
          <div class="npc-field">
            <label>Quantity</label>
            <input type="number" value="${item.qty}" min="0" style="font-family:var(--mono);text-align:center;" oninput="genItems.find(x=>x.id===${item.id}).qty=parseInt(this.value)||0;renderGenItems();updateEncumbrance()">
          </div>
          <div class="npc-field">
            <label>Berat per item (lb)</label>
            <input type="number" value="${item.weight}" min="0" step="0.1" style="font-family:var(--mono);text-align:center;" oninput="genItems.find(x=>x.id===${item.id}).weight=parseFloat(this.value)||0;renderGenItems();updateEncumbrance()">
          </div>
          <div class="npc-field">
            <label>Total Berat</label>
            <div style="font-family:var(--mono);font-size:0.9rem;color:var(--text2);padding:6px 8px;background:var(--bg2);border:1px solid var(--border);border-radius:2px;">${totalWeight} lb</div>
          </div>
        </div>
        <div class="npc-field">
          <label>📝 Notes</label>
          <textarea style="width:100%;min-height:65px;resize:vertical;font-size:0.8rem;line-height:1.5;" placeholder="Efek, cara pakai, harga jual, jumlah penggunaan..." oninput="genItems.find(x=>x.id===${item.id}).notes=this.value">${item.notes}</textarea>
        </div>
        <div style="display:flex;justify-content:flex-end;">
          <button class="btn red" style="font-size:0.6rem;padding:4px 10px;" onclick="deleteGenItem(${item.id})">🗑 Hapus</button>
        </div>
      </div>` : ''}
    </div>`;
  }).join('');

  updateEncumbrance();
}



// ============================================================
// NOTES
// ============================================================
let sessionNotes = [];
function addSessionNote() {
  const num = sessionNotes.length + 1;
  sessionNotes.unshift({ id: Date.now(), num, title: `Session ${num}`, notes: '', open: true, date: new Date().toLocaleDateString('id-ID') });
  renderSessionNotes();
}
function renderSessionNotes() {
  const list = document.getElementById('session-notes-list');
  if (!sessionNotes.length) { list.innerHTML = '<div style="color:var(--text3);font-size:0.78rem;font-style:italic;text-align:center;padding:8px;">Klik + New Session untuk mulai mencatat.</div>'; return; }
  list.innerHTML = sessionNotes.map(s => `
    <div style="background:var(--bg3);border:1px solid var(--border);border-radius:3px;overflow:hidden;">
      <div style="display:flex;align-items:center;gap:6px;padding:7px 10px;cursor:pointer;background:rgba(127,170,220,0.04);" onclick="sessionNotes.find(x=>x.id===${s.id}).open=!sessionNotes.find(x=>x.id===${s.id}).open;renderSessionNotes()">
        <div style="flex:1;"><div style="font-family:var(--display);font-size:0.75rem;color:var(--gold2);">${s.title}</div><div style="font-size:0.6rem;color:var(--text3);">${s.date}</div></div>
        <input value="${s.title}" style="font-size:0.75rem;width:120px;background:transparent;border:none;color:var(--gold2);text-align:right;" onclick="event.stopPropagation()" oninput="sessionNotes.find(x=>x.id===${s.id}).title=this.value">
        <button class="icon-btn danger" onclick="event.stopPropagation();sessionNotes=sessionNotes.filter(x=>x.id!==${s.id});renderSessionNotes()">✕</button>
      </div>
      ${s.open ? `<div style="padding:8px;"><textarea style="width:100%;height:100px;resize:vertical;font-size:0.82rem;line-height:1.5;" placeholder="What happened this session..." oninput="sessionNotes.find(x=>x.id===${s.id}).notes=this.value">${s.notes}</textarea></div>` : ''}
    </div>`
  ).join('');
}

let quests = [];
function addQuest() { toggleAddForm('quest-form'); }
function submitQuest() {
  const name = document.getElementById('af-quest-name').value.trim();
  if (!name) { document.getElementById('af-quest-name').focus(); return; }
  const status = document.getElementById('af-quest-status').value;
  quests.push({ id: Date.now(), name, status, notes: '' });
  document.getElementById('af-quest-name').value = '';
  toggleAddForm('quest-form');
  renderQuests();
  showToast(`🗺 Quest ditambahkan: ${name}`);
}
function renderQuests() {
  const list = document.getElementById('quest-list');
  if (!quests.length) { list.innerHTML = '<div style="color:var(--text3);font-size:0.78rem;font-style:italic;">Belum ada quest.</div>'; return; }
  list.innerHTML = quests.map(q => {
    const statusColor = q.status === 'active' ? 'var(--gold2)' : q.status === 'complete' ? 'var(--green3)' : 'var(--text3)';
    return `<div style="display:flex;align-items:center;gap:6px;padding:5px 8px;background:var(--bg3);border:1px solid var(--border);border-radius:2px;">
      <select style="font-size:0.65rem;padding:1px 3px;color:${statusColor};" onchange="quests.find(x=>x.id===${q.id}).status=this.value;renderQuests()">
        <option value="active" ${q.status==='active'?'selected':''}>Active</option>
        <option value="complete" ${q.status==='complete'?'selected':''}>Done</option>
        <option value="failed" ${q.status==='failed'?'selected':''}>Failed</option>
      </select>
      <span style="flex:1;font-size:0.8rem;color:var(--text);${q.status==='complete'?'text-decoration:line-through;opacity:0.6;':''}">${q.name}</span>
      <button class="icon-btn danger" onclick="quests=quests.filter(x=>x.id!==${q.id});renderQuests()">✕</button>
    </div>`;
  }).join('');
}

let npcsMet = [];
function addNPCMet() { toggleAddForm('npc-form'); }
function submitNPC() {
  const name = document.getElementById('af-npc-name').value.trim();
  if (!name) { document.getElementById('af-npc-name').focus(); return; }
  const desc = document.getElementById('af-npc-desc').value.trim();
  const relation = document.getElementById('af-npc-rel').value;
  npcsMet.push({ id: Date.now(), name, desc, relation });
  document.getElementById('af-npc-name').value = '';
  document.getElementById('af-npc-desc').value = '';
  toggleAddForm('npc-form');
  renderNPCsMet();
  showToast(`👤 NPC ditambahkan: ${name}`);
}
function renderNPCsMet() {
  const list = document.getElementById('npc-met-list');
  if (!npcsMet.length) { list.innerHTML = '<div style="color:var(--text3);font-size:0.78rem;font-style:italic;">Belum ada NPC dicatat.</div>'; return; }
  list.innerHTML = npcsMet.map(n => {
    const relColors = { friendly:'var(--green3)', neutral:'var(--text3)', hostile:'var(--red3)' };
    return `<div style="display:flex;align-items:center;gap:6px;padding:5px 8px;background:var(--bg3);border:1px solid var(--border);border-radius:2px;">
      <select style="font-size:0.65rem;padding:1px 3px;" onchange="npcsMet.find(x=>x.id===${n.id}).relation=this.value;renderNPCsMet()">
        <option value="friendly" ${n.relation==='friendly'?'selected':''}>😊 Friendly</option>
        <option value="neutral" ${n.relation==='neutral'?'selected':''}>😐 Neutral</option>
        <option value="hostile" ${n.relation==='hostile'?'selected':''}>😠 Hostile</option>
      </select>
      <div style="flex:1;">
        <div style="font-family:var(--display);font-size:0.75rem;color:${relColors[n.relation]};">${n.name}</div>
        <div style="font-size:0.68rem;color:var(--text3);font-style:italic;">${n.desc}</div>
      </div>
      <button class="icon-btn danger" onclick="npcsMet=npcsMet.filter(x=>x.id!==${n.id});renderNPCsMet()">✕</button>
    </div>`;
  }).join('');
}

function clearScratchPad() {
  document.getElementById('scratch-pad').value = '';
  showToast('🗒 Scratch pad cleared.');
}

// ============================================================
// CLASS FEATURES REFERENCE (from DM screen)
// ============================================================
const classData = {
  fighter: {
    color:'#e07060', icon:'⚔',
    hd:'d10', armor:'All armor + shields', weapons:'Simple + Martial', saves:'STR, CON',
    features:[
      [1,'Fighting Style','Pilih 1: Archery (+2 ranged), Defense (+1 AC), Dueling (+2 dmg 1-hand), Great Weapon (+reroll 1-2), Protection, Two-Weapon.'],
      [1,'Second Wind','Bonus Action: regain 1d10 + level HP. 1× Short/Long Rest.'],
      [2,'Action Surge','Bonus Action: extra action this turn. Short/Long Rest recharge.'],
      [5,'Extra Attack','2× serangan. (3× Lv 11, 4× Lv 20)'],
      [9,'Indomitable','1× Long Rest: reroll failed saving throw.'],
    ]
  },
  rogue: {
    color:'#808080', icon:'🗡',
    hd:'d8', armor:'Light', weapons:'Simple + Hand crossbow, longsword, rapier, shortsword', saves:'DEX, INT',
    features:[
      [1,'Sneak Attack','+damage jika Adv ATAU ally adjacent (Finesse/Ranged). Lv1: 1d6, +1d6 per 2 levels.'],
      [2,'Cunning Action','Bonus Action: Dash, Disengage, atau Hide.'],
      [5,'Uncanny Dodge','Reaction: halve damage dari serangan yang terlihat.'],
      [7,'Evasion','DEX save: sukses = 0 dmg; gagal = ½ dmg.'],
      [11,'Reliable Talent','Setiap proficient skill check: minimum 10.'],
    ]
  },
  wizard: {
    color:'#6090e0', icon:'📖',
    hd:'d6', armor:'None', weapons:'Daggers, darts, slings, quarterstaffs, light crossbows', saves:'INT, WIS',
    spells:{ prep:'INT mod + Wizard level', ability:'INT', dc:'8 + prof + INT', atk:'prof + INT' },
    features:[
      [1,'Spellbook','Mulai 6 spells. Tiap level +2 gratis. Bisa copy dari scroll.'],
      [1,'Arcane Recovery','1× Long Rest, Short Rest: regain slots total ≤ half Wizard level. Max Lv 5.'],
      [2,'Arcane Tradition','Subclass: Abjuration, Conjuration, Divination, Enchantment, Evocation, Illusion, Necromancy, Transmutation.'],
    ]
  },
  cleric: {
    color:'#f0e060', icon:'✝',
    hd:'d8', armor:'Light + Medium + Shields (Heavy tergantung domain)', weapons:'Simple', saves:'WIS, CHA',
    spells:{ prep:'WIS mod + Cleric level', ability:'WIS', dc:'8 + prof + WIS', atk:'prof + WIS' },
    features:[
      [1,'Divine Domain','Subclass memberi domain spells, fitur unik, channel divinity uses.'],
      [2,'Channel Divinity','1× Short Rest (×2 Lv6). Turn Undead: flee on WIS save fail.'],
      [5,'Destroy Undead','Turn Undead langsung hancurkan CR rendah.'],
      [10,'Divine Intervention','1× Long Rest. Roll d100 vs Cleric level.'],
    ]
  },
  paladin: {
    color:'#d0a040', icon:'🛡',
    hd:'d10', armor:'All + shields', weapons:'Simple + Martial', saves:'WIS, CHA',
    spells:{ prep:'CHA mod + half Paladin level', ability:'CHA', dc:'8 + prof + CHA', atk:'prof + CHA' },
    features:[
      [1,'Lay on Hands','Pool = Lv × 5. Heal 1:1 atau cure disease (5 HP). Long Rest.'],
      [2,'Divine Smite','Setelah hit melee: expend slot → +2d8 radiant/slot level. Max 5d8.'],
      [5,'Extra Attack','2× serangan.'],
      [6,'Aura of Protection','Kamu & ally dalam 10ft: +CHA mod ke saving throws.'],
    ]
  },
  ranger: {
    color:'#50c080', icon:'🏹',
    hd:'d10', armor:'Light + Medium + Shields', weapons:'Simple + Martial', saves:'STR, DEX',
    spells:{ prep:'Spells Known', ability:'WIS', dc:'8 + prof + WIS', atk:'prof + WIS' },
    features:[
      [1,'Favored Enemy','+2 damage vs chosen type. Adv track/recall.'],
      [1,'Natural Explorer','Chosen terrain: doubled prof INT/WIS, no getting lost.'],
      [2,'Fighting Style','Archery, Defense, Dueling, Two-Weapon.'],
      [5,'Extra Attack','2× serangan.'],
    ]
  },
  barbarian: {
    color:'#e05020', icon:'🪓',
    hd:'d12', armor:'Unarmored: 10+DEX+CON. Light+Medium', weapons:'Simple + Martial', saves:'STR, CON',
    features:[
      [1,'Rage','Bonus Action: +damage (STR-based), resistance physical dmg. 2× Long Rest (scales up). Ends if no attack/hit.'],
      [1,'Unarmored Defense','No armor: AC = 10 + DEX mod + CON mod.'],
      [2,'Reckless Attack','Advantage on STR atk rolls this turn; enemies get Adv vs you.'],
      [2,'Danger Sense','Adv on DEX saves from visible effects.'],
      [5,'Extra Attack','2× serangan.'],
      [7,'Feral Instinct','Adv on initiative. Can rage to act if surprised (not flat-footed).'],
    ]
  },
  bard: {
    color:'#e8b030', icon:'🎵',
    hd:'d8', armor:'Light', weapons:'Simple + Hand crossbow, longsword, rapier, shortsword', saves:'DEX, CHA',
    spells:{ prep:'Spells Known', ability:'CHA', dc:'8 + prof + CHA', atk:'prof + CHA' },
    features:[
      [1,'Bardic Inspiration','Bonus Action: give ally 1d6 inspiration die to add to check/save/attack (scales). CHA mod × per Long Rest.'],
      [2,'Jack of All Trades','Add ½ prof to any ability check without prof.'],
      [2,'Song of Rest','During short rest: party heal extra HP (d6 → d12 scaling).'],
      [3,'Expertise','Double prof on 2 skills.'],
      [5,'Font of Inspiration','Recover Bardic Inspiration on Short Rest.'],
      [6,'Countercharm','Action: allies within 30ft have Adv on fear/charmed saves while you perform.'],
    ]
  },
  druid: {
    color:'#60b060', icon:'🌿',
    hd:'d8', armor:'Light + Medium + Shields (non-metal)', weapons:'Clubs, daggers, darts, javelins, maces, quarterstaffs, scimitars, sickles, slings, spears', saves:'INT, WIS',
    spells:{ prep:'WIS mod + Druid level', ability:'WIS', dc:'8 + prof + WIS', atk:'prof + WIS' },
    features:[
      [2,'Wild Shape','Transform into Beast (CR limit scales). Action or Bonus Action. Retain personality+class features.'],
      [2,'Druid Circle','Subclass.'],
      [18,'Timeless Body','Age at 1/10 rate.'],
      [20,'Beast Spells','Cast spells in Wild Shape (no V+S component issues).'],
    ]
  },
  monk: {
    color:'#80b0e0', icon:'👊',
    hd:'d8', armor:'Unarmored (10+DEX+WIS)', weapons:'Simple + Shortswords', saves:'STR, DEX',
    features:[
      [1,'Martial Arts','Unarmed/monk weapons: use DEX. Bonus Action unarmed strike.'],
      [2,'Ki','Ki points = Monk level. Flurry of Blows, Patient Defense, Step of the Wind (Bonus Action).'],
      [2,'Unarmored Movement','+10ft speed (scales).'],
      [3,'Deflect Missiles','Reaction: reduce ranged attack damage; can catch & throw back.'],
      [4,'Slow Fall','Reaction: reduce fall damage.'],
      [5,'Extra Attack','2× serangan.'],
      [5,'Stunning Strike','Spend 1 Ki after hit: CON save or Stunned until end of your next turn.'],
    ]
  },
  sorcerer: {
    color:'#9060d0', icon:'✨',
    hd:'d6', armor:'None', weapons:'Daggers, darts, slings, quarterstaffs, light crossbows', saves:'CON, CHA',
    spells:{ prep:'Spells Known', ability:'CHA', dc:'8 + prof + CHA', atk:'prof + CHA' },
    features:[
      [1,'Spellcasting','Sorcerer Spells Known — tidak perlu spellbook.'],
      [2,'Font of Magic','Sorcery Points = Sorc level. Convert to/from spell slots.'],
      [3,'Metamagic','Cara memodifikasi spells: Careful, Distant, Empowered, Extended, Heightened, Quickened, Subtle, Twinned.'],
    ]
  },
  warlock: {
    color:'#8040c0', icon:'😈',
    hd:'d8', armor:'Light', weapons:'Simple', saves:'WIS, CHA',
    spells:{ prep:'Spells Known', ability:'CHA', dc:'8 + prof + CHA', atk:'prof + CHA' },
    features:[
      [1,'Otherworldly Patron','Subclass: Archfey, Fiend, Great Old One, dll.'],
      [1,'Pact Magic','1–4 slots (max level). Short Rest recharge. Always highest slot.'],
      [2,'Eldritch Invocations','2+ invocations (scales). Permanent spell buffs, at-will spells, etc.'],
      [3,'Pact Boon','Blade (weapon), Chain (familiar), Tome (cantrips+ritual).'],
    ]
  }
};

function showClass(cls) {
  const d = classData[cls]; if (!d) return;
  const prof_bonus = '+prof';
  const spellInfo = d.spells ? `
    <div style="background:rgba(127,170,220,0.06);border:1px solid var(--border);padding:7px;border-radius:2px;margin-bottom:8px;">
      <div style="font-family:var(--display);font-size:0.58rem;color:var(--gold);letter-spacing:0.1em;margin-bottom:4px;">SPELLCASTING</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:3px;font-size:0.72rem;color:var(--text2);">
        <span><strong>Prepared:</strong> ${d.spells.prep}</span>
        <span><strong>Ability:</strong> ${d.spells.ability}</span>
        <span><strong>Save DC:</strong> ${d.spells.dc}</span>
        <span><strong>Atk Roll:</strong> ${d.spells.atk}</span>
      </div>
    </div>` : '';
  const featuresHtml = d.features.map(([lv, name, desc]) => `
    <div style="padding:5px 0;border-bottom:1px solid var(--border);">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:2px;">
        <span style="font-family:var(--mono);font-size:0.6rem;color:${d.color};background:rgba(255,255,255,0.05);padding:0 4px;border-radius:2px;">Lv ${lv}</span>
        <span style="font-family:var(--display);font-size:0.7rem;color:var(--text);">${name}</span>
      </div>
      <div style="font-size:0.75rem;color:var(--text2);line-height:1.5;">${desc}</div>
    </div>`
  ).join('');

  document.getElementById('class-info').innerHTML = `
    <div style="border-left:3px solid ${d.color};padding:8px 12px;background:rgba(255,255,255,0.02);margin-bottom:10px;border-radius:2px;">
      <div style="font-family:var(--display);font-size:0.9rem;color:${d.color};letter-spacing:0.08em;margin-bottom:4px;">${d.icon} ${cls.charAt(0).toUpperCase()+cls.slice(1)}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:3px;font-size:0.72rem;color:var(--text3);">
        <span><strong style="color:var(--text2);">HD:</strong> ${d.hd}</span>
        <span><strong style="color:var(--text2);">Saves:</strong> ${d.saves}</span>
        <span style="grid-column:span 2;"><strong style="color:var(--text2);">Armor:</strong> ${d.armor}</span>
      </div>
    </div>
    ${spellInfo}
    <div>${featuresHtml}</div>`;

  document.querySelectorAll('[id^="ctab-"]').forEach(b => b.style.borderColor = 'var(--border2)');
  const btn = document.getElementById(`ctab-${cls}`);
  if (btn) { btn.style.borderColor = d.color; btn.style.color = d.color; }
}

// ============================================================
// HOMEBREW — PARRY
// ============================================================
function parseRoll(expr) {
  const m = String(expr).match(/^(\d+)d(\d+)([+-]\d+)?$/i);
  if (!m) return parseInt(expr) || 0;
  const qty = parseInt(m[1]), sides = parseInt(m[2]), mod = m[3] ? parseInt(m[3]) : 0;
  let total = 0;
  for (let i = 0; i < qty; i++) total += Math.floor(Math.random() * sides) + 1;
  return total + mod;
}

function rollParry() {
  const atkMod = parseInt(document.getElementById('parry-atk-mod').value) || 0;
  const defMod = parseInt(document.getElementById('parry-def-mod').value) || 0;
  const dmgExpr = document.getElementById('parry-dmg').value || '1d8';
  const atkRoll = Math.floor(Math.random() * 20) + 1 + atkMod;
  const defRoll = Math.floor(Math.random() * 20) + 1 + defMod;
  const diff = defRoll - atkRoll;
  const dmg = parseRoll(dmgExpr);
  const box = document.getElementById('parry-result-box');
  let resultClass, label, desc;
  if (diff >= 4) {
    resultClass = 'parry-win'; label = '🛡 PARRY SUCCESS'; desc = `Damage 0. Attacker −5 Poise.`;
  } else if (diff >= -3) {
    const half = Math.floor(dmg / 2);
    resultClass = 'parry-close'; label = '⚔ PARTIAL BLOCK'; desc = `Damage ½ = ${half}. Defender −3 Poise.`;
  } else {
    resultClass = 'parry-lose'; label = '💥 PARRY FAILED'; desc = `Full damage = ${dmg}. Def Poise −${Math.floor(dmg/2)}.`;
  }
  box.className = `parry-result-box ${resultClass}`;
  box.innerHTML = `
    <div class="parry-result-label" style="color:${resultClass==='parry-win'?'var(--green3)':resultClass==='parry-close'?'var(--gold2)':'var(--red3)'};">${label}</div>
    <div class="parry-result-nums">Atk: ${atkRoll} | Def: ${defRoll}</div>
    <div style="font-size:0.72rem;color:var(--text2);margin-top:4px;">${desc}</div>`;
  sfxPlay(resultClass === 'parry-win' ? 'heal' : 'hit');
  addToHistory(`Parry: Atk ${atkRoll} vs Def ${defRoll} — ${label}`);
}

// ============================================================
// DURABILITY TRACKER
// ============================================================
let duraItems = [];
let _duraDmgTargetId = null;

function addDuraItem() { toggleAddForm('dura-form'); }
function submitDuraItem() {
  const name = document.getElementById('af-dura-name').value.trim();
  if (!name) { document.getElementById('af-dura-name').focus(); return; }
  const maxDur = parseInt(document.getElementById('af-dura-max').value) || 100;
  duraItems.push({ id: Date.now(), name, dur: maxDur, maxDur, owner: document.getElementById('char-name').value || 'Me' });
  document.getElementById('af-dura-name').value = '';
  document.getElementById('af-dura-max').value = '100';
  toggleAddForm('dura-form');
  renderPlayerDura();
  showToast(`🔧 Equipment ditambahkan: ${name}`);
}

function openDuraDmgBox(id) {
  _duraDmgTargetId = id;
  const item = duraItems.find(x => x.id === id);
  const box = document.getElementById('dura-dmg-box');
  document.getElementById('dura-dmg-target-label').textContent = item ? item.name.toUpperCase() : '';
  box.style.display = 'block';
  const inp = document.getElementById('dura-dmg-val');
  inp.value = '';
  setTimeout(() => inp.focus(), 50);
}
function closeDuraDmgBox() {
  _duraDmgTargetId = null;
  document.getElementById('dura-dmg-box').style.display = 'none';
}
function execDuraDmg() {
  const id = _duraDmgTargetId;
  const item = duraItems.find(x => x.id === id); if (!item) { closeDuraDmgBox(); return; }
  const dmg = parseInt(document.getElementById('dura-dmg-val').value) || 0;
  if (!dmg) return;
  item.dur = Math.max(0, item.dur - dmg);
  closeDuraDmgBox();
  if (item.dur === 0) showToast(`💔 ${item.name} BROKEN!`);
  else showToast(`💥 ${item.name} durability −${dmg} → ${item.dur}/${item.maxDur}`);
  renderPlayerDura();
}
function dmgDura(id) { openDuraDmgBox(id); }

function renderPlayerDura() {
  const list = document.getElementById('player-dura-list');
  const sel = document.getElementById('repair-select');
  if (!duraItems.length) { list.innerHTML = '<div style="color:var(--text3);font-size:0.78rem;font-style:italic;">Belum ada equipment. Klik + Item.</div>'; if (sel) sel.innerHTML = ''; return; }
  list.innerHTML = duraItems.map(item => {
    const pct = item.maxDur > 0 ? (item.dur / item.maxDur) * 100 : 0;
    const st = pct > 75 ? { label:'Pristine', cls:'pristine', barColor:'#27ae60' } :
               pct > 50 ? { label:'Damaged', cls:'damaged', barColor:'#e67e22' } :
               pct > 25 ? { label:'Worn', cls:'worn', barColor:'#e74c3c' } :
                          { label:'Broken', cls:'broken', barColor:'#8b1a1a' };
    return `<div style="background:var(--bg3);border:1px solid var(--border);border-left:3px solid ${st.barColor};border-radius:2px;padding:7px 10px;margin-bottom:4px;">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:5px;">
        <span style="font-family:var(--display);font-size:0.8rem;color:var(--text);flex:1;">${item.name}</span>
        <span class="dura-status ${st.cls}">${st.label}</span>
        <button class="icon-btn danger" onclick="duraItems=duraItems.filter(x=>x.id!==${item.id});renderPlayerDura()">✕</button>
      </div>
      <div style="display:flex;align-items:center;gap:8px;">
        <div class="dura-bar-wrap" style="flex:1;"><div class="dura-bar" style="width:${pct}%;background:${st.barColor};"></div></div>
        <span style="font-family:var(--mono);font-size:0.7rem;color:var(--text3);">${item.dur}/${item.maxDur}</span>
        <button class="icon-btn" style="font-size:0.6rem;" onclick="dmgDura(${item.id})" title="Take damage">💥</button>
      </div>
    </div>`;
  }).join('');
  if (sel) sel.innerHTML = duraItems.map(item => `<option value="${item.id}">${item.name}</option>`).join('');
}
function repairItem() {
  const id = parseInt(document.getElementById('repair-select').value);
  const amt = parseInt(document.getElementById('repair-amount').value) || 10;
  const item = duraItems.find(x => x.id === id); if (!item) return;
  item.dur = Math.min(item.maxDur, item.dur + amt);
  showToast(`🔧 ${item.name} repaired +${amt} durability.`);
  sfxPlay('heal');
  renderPlayerDura();
}

// ============================================================
// ============================================================
// CUSTOM RESOURCES TRACKER
// ============================================================
let customResources = [];

function submitResource() {
  const name = document.getElementById('af-res-name').value.trim();
  if (!name) { document.getElementById('af-res-name').focus(); return; }
  const max = parseInt(document.getElementById('af-res-max').value) || 3;
  const recharge = document.getElementById('af-res-recharge').value;
  customResources.push({ id: Date.now(), name, max, cur: max, recharge });
  document.getElementById('af-res-name').value = '';
  toggleAddForm('res-form');
  renderCustomResources();
  showToast(`✅ Resource "${name}" ditambahkan!`);
}

function renderCustomResources() {
  const list = document.getElementById('custom-resources-list');
  if (!list) return;
  if (!customResources.length) {
    list.innerHTML = '<div style="font-size:0.72rem;color:var(--text3);font-style:italic;text-align:center;padding:6px;">Belum ada resource. Klik + Add.</div>';
    return;
  }
  list.innerHTML = customResources.map(r => {
    const pct = r.max > 0 ? (r.cur / r.max) * 100 : 0;
    const barColor = pct > 60 ? 'var(--accent)' : pct > 25 ? '#e0a040' : 'var(--red3)';
    const pips = Array.from({length: Math.min(r.max, 10)}, (_, i) =>
      `<div onclick="toggleResPip(${r.id},${i})" style="width:18px;height:18px;border-radius:50%;border:1.5px solid var(--border2);background:${i < r.cur ? 'var(--accent)' : 'transparent'};cursor:pointer;transition:background 0.1s;flex-shrink:0;"></div>`
    ).join('');
    const rechargeLabel = {short:'☀ Short',long:'🌙 Long',turn:'⚡ Turn',manual:'✋ Manual'}[r.recharge] || r.recharge;
    return `<div style="background:var(--bg3);border:1px solid var(--border2);border-radius:3px;padding:7px 10px;">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:5px;">
        <span style="font-family:var(--display);font-size:0.72rem;color:var(--text);flex:1;">${r.name}</span>
        <span style="font-family:var(--mono);font-size:0.7rem;color:${barColor};">${r.cur}/${r.max}</span>
        <span style="font-size:0.55rem;color:var(--text3);background:var(--bg2);padding:1px 5px;border-radius:8px;border:1px solid var(--border);">${rechargeLabel}</span>
        <button class="icon-btn danger" onclick="customResources=customResources.filter(x=>x.id!==${r.id});renderCustomResources()" style="font-size:0.55rem;">✕</button>
      </div>
      <div style="display:flex;gap:3px;flex-wrap:wrap;margin-bottom:5px;">${pips}</div>
      <div style="display:flex;gap:4px;">
        <button class="btn" style="flex:1;font-size:0.58rem;padding:3px;" onclick="adjustRes(${r.id},-1)">− Use</button>
        <button class="btn green" style="flex:1;font-size:0.58rem;padding:3px;" onclick="adjustRes(${r.id},r.max-r.cur)" onclick="rechargeRes(${r.id})">↺ Recharge</button>
      </div>
    </div>`;
  }).join('');
}

function toggleResPip(id, idx) {
  const r = customResources.find(x => x.id === id); if (!r) return;
  r.cur = (r.cur === idx + 1) ? idx : idx + 1;
  renderCustomResources();
}

function adjustRes(id, delta) {
  const r = customResources.find(x => x.id === id); if (!r) return;
  r.cur = Math.max(0, Math.min(r.max, r.cur + delta));
  renderCustomResources();
}

function rechargeRes(id) {
  const r = customResources.find(x => x.id === id); if (!r) return;
  r.cur = r.max;
  renderCustomResources();
}

// Hook short/long rest to recharge resources
const _origShortRest = shortRest;
shortRest = function() {
  _origShortRest();
  customResources.filter(r => r.recharge === 'short').forEach(r => { r.cur = r.max; });
  renderCustomResources();
};
const _origLongRest = longRest;
longRest = function() {
  _origLongRest();
  customResources.filter(r => r.recharge === 'long' || r.recharge === 'short').forEach(r => { r.cur = r.max; });
  renderCustomResources();
};



// ============================================================
// TURN TRACKER
// ============================================================
let ttState = { action: false, bonus: false, reaction: false, round: 1 };

function toggleTurnItem(item) {
  ttState[item] = !ttState[item];
  const box = document.getElementById(`tt-${item}-box`);
  const status = document.getElementById(`tt-${item}-status`);
  const colors = { action: ['rgba(127,170,220,0.08)','rgba(127,170,220,0.4)'], bonus: ['rgba(52,152,219,0.08)','rgba(52,152,219,0.35)'], reaction: ['rgba(192,57,43,0.08)','rgba(192,57,43,0.35)'] };
  const [bgOn, borderOn] = colors[item];
  if (ttState[item]) {
    box.style.background = 'rgba(30,30,30,0.5)';
    box.style.borderColor = 'var(--border2)';
    box.style.opacity = '0.45';
    status.textContent = 'Used';
    status.style.color = 'var(--text3)';
  } else {
    box.style.background = bgOn;
    box.style.borderColor = borderOn;
    box.style.opacity = '1';
    status.textContent = 'Available';
    status.style.color = 'var(--green3)';
  }
  // Sync move max from character speed
  const spd = parseInt(document.getElementById('char-speed')?.value) || 30;
  document.getElementById('tt-move-max').textContent = spd;
}

function resetTurn() {
  ['action','bonus'].forEach(item => {
    if (ttState[item]) toggleTurnItem(item); // reset to available
    ttState[item] = false;
  });
  // Reset reaction only if used (stays used across turns, resets at your turn start)
  if (ttState.reaction) toggleTurnItem('reaction');
  ttState.reaction = false;
  document.getElementById('tt-move-used').value = 0;
  sfxPlay('nextturn');
  showToast('⏱ New turn — Action & Bonus Action restored!');
}

function adjustRound(delta) {
  ttState.round = Math.max(1, ttState.round + delta);
  document.getElementById('tt-round').textContent = ttState.round;
}

function resetCombat() {
  ttState = { action: false, bonus: false, reaction: false, round: 1 };
  ['action','bonus','reaction'].forEach(item => {
    const box = document.getElementById(`tt-${item}-box`);
    const status = document.getElementById(`tt-${item}-status`);
    const colors = { action:'rgba(127,170,220,0.4)', bonus:'rgba(52,152,219,0.35)', reaction:'rgba(192,57,43,0.35)' };
    const bgs = { action:'rgba(127,170,220,0.08)', bonus:'rgba(52,152,219,0.08)', reaction:'rgba(192,57,43,0.08)' };
    if (box) { box.style.background = bgs[item]; box.style.borderColor = colors[item]; box.style.opacity = '1'; }
    if (status) { status.textContent = 'Available'; status.style.color = 'var(--green3)'; }
  });
  document.getElementById('tt-round').textContent = 1;
  document.getElementById('tt-move-used').value = 0;
  showToast('⚔ Combat ended — all resources reset.');
}

// Status effect toggles
const seActive = {};
function toggleSE(id, label) {
  seActive[id] = !seActive[id];
  const btn = document.getElementById('se-' + id);
  if (!btn) return;
  if (seActive[id]) {
    btn.style.background = 'rgba(127,170,220,0.2)';
    btn.style.borderColor = 'var(--gold)';
    btn.style.color = 'var(--gold2)';
    showToast(`🔴 ${label} aktif`);
  } else {
    btn.style.background = '';
    btn.style.borderColor = '';
    btn.style.color = '';
    showToast(`✅ ${label} selesai`);
  }
}

// ============================================================
// SKILL ROLL WITH PROFICIENCY (reads from Character tab)
// ============================================================
function rollSkillCheck(skillName, ab) {
  sfxPlay('dice');
  const score = parseInt(document.getElementById(`stat-${ab}`)?.value) || 10;
  const prof  = parseInt(document.getElementById('char-prof')?.value) || 2;
  const mod   = getMod(score);
  // Look up proficiency/expertise from skill tracker
  const isProf = skillProf[skillName] || false;
  const isExp  = skillExpertise[skillName] || false;
  const bonus  = isExp ? prof * 2 : isProf ? prof : 0;
  const total_mod = mod + bonus;
  const roll = Math.floor(Math.random() * 20) + 1;
  const total = roll + total_mod;
  const isCrit = roll === 20, isFail = roll === 1;
  const profTag = isExp ? ' [Expertise]' : isProf ? ' [Proficient]' : '';
  document.getElementById('roll-result').style.display = '';
  document.getElementById('roll-result').textContent = total;
  document.getElementById('roll-result').style.color = isCrit ? '#58d68d' : isFail ? '#e74c3c' : 'var(--gold2)';
  document.getElementById('roll-detail').textContent = `${skillName}${profTag}: ${roll}${fmtMod(total_mod)}=${total}${isCrit?' 🌟 NAT 20!':isFail?' 💀 NAT 1!':''}`;
  addToHistory(`${skillName}${profTag}: ${roll}${fmtMod(total_mod)}=${total}`);
  if (isCrit) sfxPlay('crit');
  switchPanel('dice');
}

// ============================================================
// WEIGHT / CAPACITY TRACKER (lb, custom max, remaining)
// ============================================================
function updateEncumbrance() {
  // Custom max weight (user-settable)
  const maxWeight = parseFloat(document.getElementById('enc-max-custom')?.value) || 100;

  // Auto-sum all items from all 3 item lists
  const itemsWeight   = (personalItems   || []).reduce((s, i) => s + (i.weight || 0) * (i.qty || 1), 0);
  const genWeight     = (genItems        || []).reduce((s, i) => s + (i.weight || 0) * (i.qty || 1), 0);
  const playerInvWeight = (playerInvItems || []).reduce((s, i) => s + (i.weight || 0) * (i.qty || 1), 0);
  // Coin weight: 50 coins = 1 lb
  const pp = parseInt(document.getElementById('coin-pp')?.value) || 0;
  const gp = parseInt(document.getElementById('coin-gp')?.value) || 0;
  const ep = parseInt(document.getElementById('coin-ep')?.value) || 0;
  const sp = parseInt(document.getElementById('coin-sp')?.value) || 0;
  const cp = parseInt(document.getElementById('coin-cp')?.value) || 0;
  const coinWeight = (pp + gp + ep + sp + cp) / 50;
  const used     = Math.round((itemsWeight + genWeight + playerInvWeight + coinWeight) * 10) / 10;
  const remaining = Math.round((maxWeight - used) * 10) / 10;
  const pct      = maxWeight > 0 ? (used / maxWeight) * 100 : 0;

  // Color based on % used: 0%=blue, 1-50%=green, 51-75%=yellow, 76-100%=orange, >100%=red
  const getColor = (p) => {
    if (p <= 0)   return '#60c8ff';
    if (p <= 50)  return '#58d68d';
    if (p <= 75)  return '#e0d040';
    if (p <= 100) return '#e09030';
    return '#e74c3c';
  };
  const usedColor = getColor(pct);

  // Remaining color: mirror of used (lots remaining = blue/green, little = orange/red)
  const remPct = maxWeight > 0 ? (remaining / maxWeight) * 100 : 0;
  const remColor = remaining < 0 ? '#e74c3c' : getColor(100 - Math.min(100, pct));

  // Helper to update a set of display elements
  const updateSet = (suffix) => {
    const maxDisp  = document.getElementById(`enc-max-disp${suffix}`);
    const usedDisp = document.getElementById(`enc-used-disp${suffix}`);
    const remDisp  = document.getElementById(`enc-remaining-disp${suffix}`);
    const bar      = document.getElementById(`enc-bar${suffix}`);
    const overBar  = document.getElementById(`enc-overflow-bar${suffix}`);
    const status   = document.getElementById(`enc-status${suffix}`);
    if (maxDisp)  maxDisp.textContent  = maxWeight.toFixed(0);
    if (usedDisp) { usedDisp.textContent = used.toFixed(1); usedDisp.style.color = usedColor; }
    if (remDisp)  { remDisp.textContent  = remaining.toFixed(1); remDisp.style.color = remColor; }
    if (bar) {
      bar.style.width      = Math.min(100, pct) + '%';
      bar.style.background = usedColor;
    }
    if (overBar) {
      overBar.style.width = pct > 100 ? Math.min(30, pct - 100) + '%' : '0%';
    }
    if (status) {
      if (remaining < 0) {
        status.textContent = `⛔ Over Capacity! (${Math.abs(remaining).toFixed(1)} lb lebih)`;
        status.style.color = '#e74c3c';
      } else if (pct > 75) {
        status.textContent = `🟠 Hampir Penuh (${remaining.toFixed(1)} lb tersisa)`;
        status.style.color = '#e09030';
      } else if (pct > 50) {
        status.textContent = `🟡 Setengah Penuh (${remaining.toFixed(1)} lb tersisa)`;
        status.style.color = '#e0d040';
      } else if (pct > 0) {
        status.textContent = `✅ ${remaining.toFixed(1)} lb tersisa`;
        status.style.color = '#58d68d';
      } else {
        status.textContent = `✅ Capacity ${maxWeight} lb tersedia`;
        status.style.color = '#60c8ff';
      }
    }
  };

  updateSet('');   // equipment tab

  // Keep hidden enc-current in sync for backwards compat
  const encCur = document.getElementById('enc-current');
  if (encCur) encCur.value = used.toFixed(1);
}

// Hook updateMods to also refresh encumbrance
const _origUpdateMods = updateMods;
updateMods = function() {
  _origUpdateMods();
  updateEncumbrance();
  // also sync turn tracker speed
  const spd = parseInt(document.getElementById('char-speed')?.value) || 30;
  const ttMax = document.getElementById('tt-move-max');
  if (ttMax) ttMax.textContent = spd;
};



// ============================================================
// SPELL LOOKUP DATABASE (common spells)
// ============================================================
const SPELL_DB = [
  {n:'Fire Bolt',l:0,ct:'1 Action',r:'120 ft',c:false,sch:'Evocation',desc:'Ranged spell attack → 1d10 fire (scales: 2d10 Lv5, 3d10 Lv11, 4d10 Lv17).'},
  {n:'Eldritch Blast',l:0,ct:'1 Action',r:'120 ft',c:false,sch:'Evocation',desc:'Ranged spell attack → 1d10 force. +1 beam at Lv5/11/17. Invocations can add effects.'},
  {n:'Sacred Flame',l:0,ct:'1 Action',r:'60 ft',c:false,sch:'Evocation',desc:'DEX save → 1d8 radiant. No benefit from cover. Scales Lv5/11/17.'},
  {n:'Mage Hand',l:0,ct:'1 Action',r:'30 ft',c:false,sch:'Conjuration',desc:'Spectral hand, lift up to 10 lbs, manipulate objects. Lasts 1 min.'},
  {n:'Minor Illusion',l:0,ct:'1 Action',r:'30 ft',c:false,sch:'Illusion',desc:'Create sound or image. Investigation check vs spell save DC to disbelieve.'},
  {n:'Prestidigitation',l:0,ct:'1 Action',r:'10 ft',c:false,sch:'Transmutation',desc:'Minor magical tricks: light candle, clean, cool/warm, draw symbol, etc.'},
  {n:'Toll the Dead',l:0,ct:'1 Action',r:'60 ft',c:false,sch:'Necromancy',desc:'WIS save → 1d8 necrotic. If target is missing HP: 1d12 instead. Scales.'},
  {n:'Guidance',l:0,ct:'1 Action',r:'Touch',c:true,sch:'Divination',desc:'Concentration 1 min. Target adds 1d4 to one ability check before spell ends.'},
  {n:'Thunderwave',l:1,ct:'1 Action',r:'Self (15 ft cube)',c:false,sch:'Evocation',desc:'CON save → 2d8 thunder + pushed 10 ft. Fail: pushed and knocked prone.'},
  {n:'Healing Word',l:1,ct:'1 Bonus Action',r:'60 ft',c:false,sch:'Evocation',desc:'Heal 1d4 + Spellcasting mod. Upcast: +1d4/level. KEY: Bonus Action cast.'},
  {n:'Cure Wounds',l:1,ct:'1 Action',r:'Touch',c:false,sch:'Evocation',desc:'Heal 1d8 + Spellcasting mod. Upcast: +1d8/slot level.'},
  {n:'Shield',l:1,ct:'Reaction',r:'Self',c:false,sch:'Abjuration',desc:'Reaction when hit: +5 AC until start of your next turn (including triggering hit).'},
  {n:'Magic Missile',l:1,ct:'1 Action',r:'120 ft',c:false,sch:'Evocation',desc:'3 darts, each 1d4+1 force, auto-hit. Upcast: +1 dart/slot level.'},
  {n:'Hex',l:1,ct:'1 Bonus Action',r:'90 ft',c:true,sch:'Enchantment',desc:'Concentration 1h. Curse creature: +1d6 necrotic/hit; DisAdv on chosen ability checks. Moves on kill.'},
  {n:'Hunter\'s Mark',l:1,ct:'1 Bonus Action',r:'90 ft',c:true,sch:'Divination',desc:'Concentration 1h. +1d6 dmg vs marked target. Adv Perception/Survival to find it. Move on kill.'},
  {n:'Divine Smite',l:1,ct:'—',r:'Self',c:false,sch:'Evocation',desc:'Paladin only. On hit: expend slot → 2d8 + 1d8/level radiant (3d8 vs undead/fiend). Crit doubles.'},
  {n:'Burning Hands',l:1,ct:'1 Action',r:'Self (15 ft cone)',c:false,sch:'Evocation',desc:'DEX save → 3d6 fire. Upcast: +1d6/level.'},
  {n:'Bless',l:1,ct:'1 Action',r:'30 ft',c:true,sch:'Enchantment',desc:'Concentration 1 min. Up to 3 targets add 1d4 to attack rolls and saving throws.'},
  {n:'Sleep',l:1,ct:'1 Action',r:'90 ft',c:false,sch:'Enchantment',desc:'5d8 HP pool of creatures (lowest HP first) fall unconscious. No save. Upcast: +2d8/level.'},
  {n:'Misty Step',l:2,ct:'1 Bonus Action',r:'Self',c:false,sch:'Conjuration',desc:'Teleport up to 30 ft to an unoccupied space you can see.'},
  {n:'Hold Person',l:2,ct:'1 Action',r:'60 ft',c:true,sch:'Enchantment',desc:'Concentration 1 min. WIS save or humanoid is Paralyzed. Save at end of each turn.'},
  {n:'Shatter',l:2,ct:'1 Action',r:'60 ft',c:false,sch:'Evocation',desc:'10-ft sphere, CON save → 3d8 thunder. Inorganic objects DisAdv. Upcast: +1d8/level.'},
  {n:'Scorching Ray',l:2,ct:'1 Action',r:'120 ft',c:false,sch:'Evocation',desc:'3 ranged spell attacks → 2d6 fire each. Upcast: +1 ray/level.'},
  {n:'Invisibility',l:2,ct:'1 Action',r:'Touch',c:true,sch:'Illusion',desc:'Concentration 1h. Target invisible until attacks or casts. Upcast Lv3: 1 extra target/level.'},
  {n:'Mirror Image',l:2,ct:'1 Action',r:'Self',c:false,sch:'Illusion',desc:'3 duplicates, 1 min. When hit: d20 determines if duplicate hit instead (destroys it).'},
  {n:'Spiritual Weapon',l:2,ct:'1 Bonus Action',r:'60 ft',c:false,sch:'Evocation',desc:'1 min duration (no concentration!). Bonus action attack → 1d8+spellmod force. Upcast: +1d8/2 levels.'},
  {n:'Web',l:2,ct:'1 Action',r:'60 ft',c:true,sch:'Conjuration',desc:'Concentration 1h. 20-ft cube of webs. DEX save or Restrained. STR check to escape.'},
  {n:'Fireball',l:3,ct:'1 Action',r:'150 ft',c:false,sch:'Evocation',desc:'20-ft sphere, DEX save → 8d6 fire. Upcast: +1d6/level. Fills space. Ignites objects.'},
  {n:'Lightning Bolt',l:3,ct:'1 Action',r:'Self (100 ft line)',c:false,sch:'Evocation',desc:'100×5 ft line, DEX save → 8d6 lightning. Upcast: +1d6/level. Bounces off walls.'},
  {n:'Counterspell',l:3,ct:'Reaction',r:'60 ft',c:false,sch:'Abjuration',desc:'Interrupt spell ≤3rd level (auto). Spell ≥4th level: Spellcasting check DC 10+spell level.'},
  {n:'Hypnotic Pattern',l:3,ct:'1 Action',r:'120 ft',c:true,sch:'Illusion',desc:'Concentration 1 min. 30-ft cube, WIS save or Incapacitated and Speed 0. Best CC in tier 2.'},
  {n:'Dispel Magic',l:3,ct:'1 Action',r:'120 ft',c:false,sch:'Abjuration',desc:'End one effect ≤3rd on target. Higher level: Spellcasting ability check (DC 10+spell level).'},
  {n:'Spirit Guardians',l:3,ct:'1 Action',r:'Self (15 ft)',c:true,sch:'Conjuration',desc:'Concentration 10 min. Aura 15 ft: halves enemy speed. WIS save → 3d8 dmg (half on success).'},
  {n:'Mass Cure Wounds',l:5,ct:'1 Action',r:'60 ft',c:false,sch:'Evocation',desc:'Up to 6 creatures each heal 3d8 + Spellcasting mod. Upcast: +1d8/level.'},
  {n:'Banishment',l:4,ct:'1 Action',r:'60 ft',c:true,sch:'Abjuration',desc:'Concentration 1 min. CHA save or banished. Native plane: banished permanently at end.'},
  {n:'Greater Invisibility',l:4,ct:'1 Action',r:'Touch',c:true,sch:'Illusion',desc:'Concentration 1 min. Target stays invisible even when attacking. Hugely powerful.'},
  {n:'Polymorph',l:4,ct:'1 Action',r:'60 ft',c:true,sch:'Transmutation',desc:'WIS save or transform into beast. Uses beast HP pool. Concentration 1h.'},
  {n:'Ice Storm',l:4,ct:'1 Action',r:'300 ft',c:false,sch:'Evocation',desc:'20-ft radius, 40-ft high cylinder. 2d8 bludg + 4d6 cold. Area becomes difficult terrain.'},
  {n:'Wall of Fire',l:4,ct:'1 Action',r:'120 ft',c:true,sch:'Evocation',desc:'Concentration 1 min. 60-ft wall. DEX save or 5d8 fire passing through. One side only.'},
  {n:'Hold Monster',l:5,ct:'1 Action',r:'90 ft',c:true,sch:'Enchantment',desc:'Like Hold Person but works on any creature. WIS save or Paralyzed for 1 min.'},
  {n:'Cone of Cold',l:5,ct:'1 Action',r:'Self (60 ft cone)',c:false,sch:'Evocation',desc:'60-ft cone, CON save → 8d8 cold. Upcast: +1d8/level.'},
  {n:'Wall of Force',l:5,ct:'1 Action',r:'120 ft',c:true,sch:'Evocation',desc:'Concentration 10 min. Invisible wall, immune to all damage. Can form dome/sphere.'},
  {n:'Teleportation Circle',l:5,ct:'1 min ritual',r:'10 ft',c:false,sch:'Conjuration',desc:'Create portal to any permanent teleportation circle you know. Instant travel.'},
  {n:'Heal',l:6,ct:'1 Action',r:'60 ft',c:false,sch:'Evocation',desc:'Heal 70 HP, ends disease/blindness/deafness/conditions. Upcast: +10/level.'},
  {n:'Disintegrate',l:6,ct:'1 Action',r:'60 ft',c:false,sch:'Transmutation',desc:'DEX save → 10d6+40 force. Death = turn to dust. Also destroys objects.'},
  {n:'Chain Lightning',l:6,ct:'1 Action',r:'150 ft',c:false,sch:'Evocation',desc:'Primary: 10d8 lightning. Jump to 3 secondary targets: 5d8 each. DEX save halves.'},
  {n:'Finger of Death',l:7,ct:'1 Action',r:'60 ft',c:false,sch:'Necromancy',desc:'CON save → 7d8+30 necrotic. Death = rise as zombie under control permanently.'},
  {n:'Plane Shift',l:7,ct:'1 Action',r:'Touch',c:false,sch:'Conjuration',desc:'Teleport self + 8 willing creatures to another plane. Or: banish creature (CHA save).'},
  {n:'Power Word Kill',l:9,ct:'1 Action',r:'60 ft',c:false,sch:'Enchantment',desc:'If target has ≤100 HP: instant death. No save.'},
  {n:'Wish',l:9,ct:'1 Action',r:'Self',c:false,sch:'Conjuration',desc:'Most powerful spell. Duplicate any ≤8th level spell, or ask for anything. Stress risk.'},
  {n:'Time Stop',l:9,ct:'1 Action',r:'Self',c:false,sch:'Transmutation',desc:'Take 1d4+1 turns. Other creatures frozen. Ends if you affect another creature.'},
  {n:'Meteor Swarm',l:9,ct:'1 Action',r:'1 mile',c:false,sch:'Evocation',desc:'4 explosions, 40-ft sphere each. DEX save → 20d6 fire + 20d6 bludg (10d6+10d6 on success).'},
];

let spellFilterLevel = 'all';
let spellSearchTerm = '';

function setSpellFilter(level) {
  spellFilterLevel = level;
  ['all',0,1,2,3,4,5,6].forEach(l => {
    const btn = document.getElementById(`slv-${l}`);
    if (!btn) return;
    const active = l === level;
    btn.style.borderColor = active ? 'var(--gold)' : '';
    btn.style.color       = active ? 'var(--gold2)' : '';
    btn.style.background  = active ? 'rgba(127,170,220,0.12)' : '';
  });
  renderSpellLookup();
}

function searchSpells(term) {
  spellSearchTerm = term.toLowerCase().trim();
  renderSpellLookup();
}

function clearSpellSearch() {
  document.getElementById('spell-search-input').value = '';
  spellSearchTerm = '';
  renderSpellLookup();
}

function renderSpellLookup() {
  const results = document.getElementById('spell-lookup-results');
  if (!results) return;
  if (!spellSearchTerm && spellFilterLevel === 'all') {
    results.innerHTML = '<div style="color:var(--text3);font-size:0.75rem;font-style:italic;text-align:center;padding:12px;">Ketik nama spell atau pilih level untuk mencari.</div>';
    return;
  }
  let filtered = SPELL_DB.filter(s => {
    const matchName = !spellSearchTerm || s.n.toLowerCase().includes(spellSearchTerm);
    const matchLevel = spellFilterLevel === 'all' ? true :
                       spellFilterLevel === 6 ? s.l >= 6 :
                       s.l === spellFilterLevel;
    return matchName && matchLevel;
  });
  if (!filtered.length) {
    results.innerHTML = '<div style="color:var(--text3);font-size:0.75rem;font-style:italic;text-align:center;padding:12px;">Tidak ada hasil. Coba kata kunci lain.</div>';
    return;
  }
  const schColors = {Evocation:'#e08060',Conjuration:'#60c060',Divination:'#c0c060',Enchantment:'#e060c0',Illusion:'#a070e0',Abjuration:'#60a0e0',Necromancy:'#a06060',Transmutation:'#60d0c0'};
  results.innerHTML = filtered.map(s => {
    const lvlLabel = s.l === 0 ? 'Cantrip' : `Level ${s.l}`;
    const concMark = s.c ? '<span style="font-size:0.55rem;background:rgba(127,170,220,0.2);border:1px solid rgba(127,170,220,0.4);color:var(--gold2);padding:1px 4px;border-radius:3px;font-family:var(--display);letter-spacing:0.05em;">C</span>' : '';
    const schColor = schColors[s.sch] || 'var(--text3)';
    return `<div style="background:var(--bg3);border:1px solid var(--border);border-radius:3px;padding:7px 10px;">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px;flex-wrap:wrap;">
        <span style="font-family:var(--display);font-size:0.78rem;color:var(--text);flex:1;">${s.n}</span>
        ${concMark}
        <span style="font-size:0.58rem;color:${schColor};font-family:var(--display);letter-spacing:0.06em;">${s.sch}</span>
        <span style="font-family:var(--mono);font-size:0.62rem;color:var(--purple3);">${lvlLabel}</span>
      </div>
      <div style="display:flex;gap:10px;margin-bottom:4px;flex-wrap:wrap;">
        <span style="font-size:0.65rem;color:var(--text3);">⏱ ${s.ct}</span>
        <span style="font-size:0.65rem;color:var(--text3);">📍 ${s.r}</span>
      </div>
      <div style="font-size:0.72rem;color:var(--text2);line-height:1.5;">${s.desc}</div>
    </div>`;
  }).join('');
}

// ============================================================
// PLAYER HANDBOOK TABS (updated with multi)
// ============================================================
const HB_TABS = ['classes','subclass','species','feats','bg','equipment','multi','conditions','tips'];

function showHBTab(tab) {
  HB_TABS.forEach(s => {
    const el  = document.getElementById('hb-' + s);
    const btn = document.getElementById('hb-tab-' + s);
    if (el)  el.style.display = s === tab ? '' : 'none';
    if (btn) {
      btn.classList.toggle('active', s === tab);
      btn.style.borderColor = '';
      btn.style.color       = '';
      btn.style.background  = '';
    }
  });
  const activeBtn = document.getElementById('hb-tab-' + tab);
  if (activeBtn) activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  const content = document.getElementById('hb-content');
  if (content) content.scrollTop = 0;
  if (tab === 'subclass') filterSubclass('all');
}

const SC_CLASSES = ['all','barbarian','bard','cleric','druid','fighter','monk','paladin','ranger','rogue','sorcerer','warlock','wizard'];

function filterSubclass(cls) {
  SC_CLASSES.forEach(c => {
    const btn = document.getElementById('sc-btn-' + c);
    if (!btn) return;
    const active = c === cls;
    btn.style.borderColor = active ? 'var(--gold)' : '';
    btn.style.color       = active ? 'var(--gold2)' : '';
    btn.style.background  = active ? 'rgba(127,170,220,0.12)' : '';
  });
  document.querySelectorAll('.sc-card').forEach(card => {
    card.style.display = (cls === 'all' || card.dataset.class === cls) ? '' : 'none';
  });
}

// ============================================================
// ITEM REFERENCE TABS
// ============================================================
const IR_TABS = ['armor','weapons','gear','potions','magic','tools','mounts'];

function showIRTab(tab) {
  IR_TABS.forEach(t => {
    const el  = document.getElementById('ir-' + t);
    const btn = document.getElementById('ir-tab-' + t);
    if (el)  el.style.display = t === tab ? '' : 'none';
    if (btn) {
      btn.style.borderColor = t === tab ? 'var(--gold)' : '';
      btn.style.color       = t === tab ? 'var(--gold2)' : '';
      btn.style.background  = t === tab ? 'rgba(127,170,220,0.12)' : '';
    }
  });
  const activeBtn = document.getElementById('ir-tab-' + tab);
  if (activeBtn) activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  const content = document.getElementById('ir-content');
  if (content) content.scrollTop = 0;
}

showIRTab('armor');



// ============================================================
// WEIGHT TRACKER TOGGLE
// ============================================================
let weightTrackerOn = true;

function toggleWeightTracker() {
  weightTrackerOn = !weightTrackerOn;
  const body  = document.getElementById('wt-body');
  const knob  = document.getElementById('wt-toggle-knob');
  const btn   = document.getElementById('wt-toggle-btn');
  const label = document.getElementById('wt-toggle-label');
  if (weightTrackerOn) {
    if (body)  body.style.display  = '';
    if (knob)  knob.style.left     = '16px';
    if (btn)   { btn.style.background = 'var(--accent)'; btn.style.borderColor = 'var(--accent2)'; }
    if (label) { label.textContent = 'ON'; label.style.color = 'var(--accent2)'; }
    updateEncumbrance();
  } else {
    if (body)  body.style.display  = 'none';
    if (knob)  knob.style.left     = '2px';
    if (btn)   { btn.style.background = 'var(--border2)'; btn.style.borderColor = 'var(--border)'; }
    if (label) { label.textContent = 'OFF'; label.style.color = 'var(--text3)'; }
  }
}

// ============================================================
// PLAYER INVENTORY (panel-playerinv)
// ============================================================
let playerInvItems = [];

function submitPlayerInv() {
  const name   = document.getElementById('pi-name').value.trim();
  if (!name) { document.getElementById('pi-name').focus(); return; }
  const qty    = parseInt(document.getElementById('pi-qty').value)    || 1;
  const weight = parseFloat(document.getElementById('pi-weight').value) || 0;
  const notes  = document.getElementById('pi-notes').value.trim();
  playerInvItems.push({ id: Date.now(), name, qty, weight, notes, expanded: false });
  document.getElementById('pi-name').value   = '';
  document.getElementById('pi-qty').value    = '1';
  document.getElementById('pi-weight').value = '0';
  document.getElementById('pi-notes').value  = '';
  toggleAddForm('pinv-form');
  renderPlayerInv();
  showToast(`🗃 ${name} ditambahkan ke Inventory!`);
}

function togglePlayerInvExpand(id) {
  const item = playerInvItems.find(x => x.id === id);
  if (item) { item.expanded = !item.expanded; renderPlayerInv(); }
}

function deletePlayerInvItem(id) {
  playerInvItems = playerInvItems.filter(x => x.id !== id);
  renderPlayerInv();
  updateEncumbrance();
}

function adjustPlayerInvQty(id, delta) {
  const item = playerInvItems.find(x => x.id === id);
  if (!item) return;
  item.qty = Math.max(0, item.qty + delta);
  if (item.qty === 0) {
    playerInvItems = playerInvItems.filter(x => x.id !== id);
    showToast('🗑 Item dihapus (qty = 0)');
  }
  renderPlayerInv();
  updateEncumbrance();
}

function renderPlayerInv() {
  const list = document.getElementById('playerinv-list');
  if (!list) return;
  if (!playerInvItems.length) {
    list.innerHTML = `<div style="color:var(--text3);font-size:0.78rem;font-style:italic;text-align:center;padding:12px;">Inventory kosong. Klik + Add.</div>`;
    updateEncumbrance();
    return;
  }
  list.innerHTML = playerInvItems.map(item => {
    const totalWeight = (item.weight * item.qty).toFixed(1);
    return `
    <div style="background:var(--bg3);border:1px solid var(--border2);border-radius:3px;overflow:hidden;">
      <div style="display:flex;align-items:center;gap:8px;padding:8px 10px;cursor:pointer;" onclick="togglePlayerInvExpand(${item.id})">
        <span style="font-size:1rem;flex-shrink:0;">🗃</span>
        <div style="flex:1;min-width:0;">
          <div style="font-family:var(--display);font-size:0.8rem;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${item.name}</div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:2px;">
            <span style="font-family:var(--mono);font-size:0.7rem;color:var(--gold2);">×${item.qty}</span>
            ${item.weight > 0 ? `<span style="font-size:0.65rem;color:var(--text3);">${totalWeight} lb</span>` : ''}
            ${item.notes ? `<span style="font-size:0.68rem;color:var(--text2);font-style:italic;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:150px;">${item.notes}</span>` : ''}
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:3px;flex-shrink:0;" onclick="event.stopPropagation()">
          <button class="icon-btn" style="font-size:0.8rem;padding:2px 6px;" onclick="adjustPlayerInvQty(${item.id},-1)">−</button>
          <span style="font-family:var(--mono);font-size:0.8rem;color:var(--gold2);min-width:20px;text-align:center;">${item.qty}</span>
          <button class="icon-btn" style="font-size:0.8rem;padding:2px 6px;" onclick="adjustPlayerInvQty(${item.id},1)">+</button>
        </div>
        <span style="font-size:0.7rem;color:var(--text3);flex-shrink:0;">${item.expanded ? '▲' : '▼'}</span>
      </div>
      ${item.expanded ? `
      <div style="border-top:1px solid var(--border);padding:10px;display:flex;flex-direction:column;gap:8px;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
          <div class="npc-field">
            <label>Nama Item</label>
            <input value="${item.name}" oninput="playerInvItems.find(x=>x.id===${item.id}).name=this.value;renderPlayerInv()">
          </div>
          <div class="npc-field">
            <label>Quantity</label>
            <input type="number" value="${item.qty}" min="0" style="font-family:var(--mono);text-align:center;" oninput="const v=parseInt(this.value)||0;const it=playerInvItems.find(x=>x.id===${item.id});if(it){it.qty=v;if(v===0){playerInvItems=playerInvItems.filter(x=>x.id!==${item.id});showToast('🗑 Item dihapus');}renderPlayerInv();updateEncumbrance();}">
          </div>
          <div class="npc-field">
            <label>Berat per item (lb)</label>
            <input type="number" value="${item.weight}" min="0" step="0.1" style="font-family:var(--mono);text-align:center;" oninput="playerInvItems.find(x=>x.id===${item.id}).weight=parseFloat(this.value)||0;renderPlayerInv();updateEncumbrance()">
          </div>
          <div class="npc-field">
            <label>Total Berat</label>
            <div style="font-family:var(--mono);font-size:0.9rem;color:var(--text2);padding:6px 8px;background:var(--bg2);border:1px solid var(--border);border-radius:2px;">${totalWeight} lb</div>
          </div>
        </div>
        <div class="npc-field">
          <label>📝 Notes</label>
          <textarea style="width:100%;min-height:65px;resize:vertical;font-size:0.8rem;line-height:1.5;" placeholder="Deskripsi, kondisi, harga, dll..." oninput="playerInvItems.find(x=>x.id===${item.id}).notes=this.value">${item.notes}</textarea>
        </div>
        <div style="display:flex;justify-content:flex-end;">
          <button class="btn red" style="font-size:0.6rem;padding:4px 10px;" onclick="deletePlayerInvItem(${item.id})">🗑 Hapus</button>
        </div>
      </div>` : ''}
    </div>`;
  }).join('');
  updateEncumbrance();
}

// ============================================================
// CRIT TRACKER
// ============================================================
let critCount = 0;

function renderCritPips() {
  const container = document.getElementById('crit-pips');
  const countEl   = document.getElementById('crit-count');
  if (!container) return;
  const show = Math.min(critCount, 10);
  container.innerHTML = Array.from({length: show}, () =>
    `<div style="width:14px;height:14px;border-radius:50%;background:#e74c3c;border:1px solid #c0392b;flex-shrink:0;animation:critPop 0.2s ease;"></div>`
  ).join('');
  if (countEl) countEl.textContent = critCount;
}

function addCrit() {
  critCount++;
  renderCritPips();
  sfxPlay('crit');
  showToast(`🌟 CRIT #${critCount}!`);
}

function resetCrits() {
  critCount = 0;
  renderCritPips();
  showToast('🎲 Crit tracker reset.');
}

// ============================================================
// INITIALIZE — run all renders AFTER all variables declared
// ============================================================
const SAVE_KEY = 'playerscreen_v2';
// Pre-declare variables defined later in script (prevent TDZ errors in initAll/autoLoad)
let initEntries = [];
let initCurrentIdx = 0;
let reminders = [];
let reminderInterval = null;
let currentTheme = 'blue';
let milestones = [];
let companions = [];
(function initAll() {
  updateMods();
  renderSaves();
  renderSkills();
  renderDeathSaves();
  renderConc();
  renderSpellSlots();
  renderSpellEntries();
  renderPersonalInventory();
  renderInvWeapons();
  renderPlayerInv();
  renderSessionNotes();
  renderQuests();
  renderNPCsMet();
  renderWeapons();
  renderPlayerDura();
  renderCustomResources();
  renderCritPips();
  renderMilestones();
  renderCompanions();
  updateCoinWeight();
  updateEncumbrance();
  autoLoadOnStart();
})();

// ============================================================
// PRINT CHARACTER SHEET
// ============================================================
function printCharSheet() {
  // Collect all character data
  const get = (id) => {
    const el = document.getElementById(id);
    return el ? (el.type === 'checkbox' ? (el.checked ? '☑' : '☐') : el.value || '—') : '—';
  };
  const getMod = (id) => {
    const el = document.getElementById(id);
    return el ? el.textContent : '+0';
  };

  const name       = get('char-name');
  const charClass  = get('char-class');
  const subclass   = get('char-subclass');
  const race       = get('char-race');
  const bg         = get('char-bg');
  const level      = get('char-level');
  const xp         = get('char-xp');
  const alignment  = get('char-alignment');
  const hp         = get('char-hp');
  const maxhp      = get('char-maxhp');
  const temphp     = get('char-temphp');
  const ac         = get('char-ac');
  const speed      = get('char-speed');
  const prof       = get('char-prof');
  const passive    = get('char-passive');
  const spelldc    = get('char-spelldc');
  const init       = get('char-init');
  const hitdice    = get('char-hitdice');
  const poise      = get('char-poise');
  const maxpoise   = get('char-maxpoise');

  const stats = ['str','dex','con','int','wis','cha'].map(ab => ({
    ab: ab.toUpperCase(),
    val: get(`stat-${ab}`),
    mod: getMod(`mod-${ab}`)
  }));

  const appearance = get('char-appearance');
  const personality = get('char-personality');
  const ideals      = get('char-ideals');
  const bonds       = get('char-bonds');
  const flaws       = get('char-flaws');
  const backstory   = get('char-backstory');
  const languages   = get('char-languages');
  const classFeatures = get('char-class-features');
  const speciesTraits = get('char-species-traits');

  const coins = {
    pp: get('coin-pp'), gp: get('coin-gp'), ep: get('coin-ep'),
    sp: get('coin-sp'), cp: get('coin-cp')
  };

  const skillEls = document.querySelectorAll('#skill-list .skill-row');
  const skillRows = Array.from(skillEls).map(row => {
    const name = row.querySelector('.skill-name')?.textContent || '';
    const bonus = row.querySelector('.skill-bonus')?.textContent || '';
    const prof = row.querySelector('.skill-prof')?.textContent || '○';
    return `<tr><td>${prof}</td><td>${name}</td><td style="text-align:right;font-weight:700;">${bonus}</td></tr>`;
  }).join('');

  const weapons = invWeapons.map(w =>
    `<tr><td>${w.name}</td><td>${w.atk||'—'}</td><td>${w.dmg||'—'} ${w.dtype}</td><td style="font-size:0.65rem;color:#888;">${w.notes||'—'}</td></tr>`
  ).join('');

  const html = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<title>${name} — Character Sheet</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Georgia, serif; font-size: 11px; color: #1a1a2e; background: #fff; padding: 16px; }
  h1 { font-size: 20px; border-bottom: 2px solid #333; padding-bottom: 4px; margin-bottom: 8px; }
  h2 { font-size: 12px; text-transform: uppercase; letter-spacing: 0.08em; color: #444; margin: 10px 0 4px; border-bottom: 1px solid #ccc; padding-bottom: 2px; }
  .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; }
  .grid6 { display: grid; grid-template-columns: repeat(6,1fr); gap: 6px; text-align: center; }
  .stat-box { border: 1px solid #ccc; border-radius: 4px; padding: 5px 4px; text-align: center; }
  .stat-label { font-size: 8px; text-transform: uppercase; letter-spacing: 0.1em; color: #666; }
  .stat-val { font-size: 18px; font-weight: 700; line-height: 1.1; }
  .stat-mod { font-size: 13px; font-weight: 700; color: #333; }
  .info-box { border: 1px solid #ccc; border-radius: 3px; padding: 4px 6px; margin-bottom: 4px; }
  .info-label { font-size: 8px; text-transform: uppercase; color: #888; letter-spacing: 0.08em; }
  .info-val { font-size: 11px; font-weight: 600; }
  table { width: 100%; border-collapse: collapse; font-size: 10px; }
  th { background: #eee; padding: 2px 4px; text-align: left; font-size: 8px; text-transform: uppercase; letter-spacing: 0.06em; }
  td { padding: 2px 4px; border-bottom: 1px solid #f0f0f0; }
  .section { border: 1px solid #ddd; border-radius: 4px; padding: 8px; margin-bottom: 8px; }
  .textarea-val { font-size: 10px; color: #333; line-height: 1.5; white-space: pre-wrap; border: 1px solid #eee; padding: 4px; border-radius: 2px; min-height: 40px; background: #fafafa; }
  @media print {
    body { padding: 8px; }
    .no-print { display: none; }
    @page { margin: 10mm; size: A4; }
  }
</style>
</head>
<body>
<button class="no-print" onclick="window.print()" style="margin-bottom:12px;padding:6px 16px;background:#333;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:12px;">🖨 Print / Save PDF</button>
<h1>⚔ ${name}</h1>
<div class="section">
  <div class="grid3" style="margin-bottom:8px;">
    <div><div class="info-label">Class / Subclass</div><div class="info-val">${charClass} — ${subclass}</div></div>
    <div><div class="info-label">Species / Background</div><div class="info-val">${race} · ${bg}</div></div>
    <div><div class="info-label">Level / XP / Alignment</div><div class="info-val">Lv ${level} · ${xp} XP · ${alignment}</div></div>
  </div>
  <div class="grid6">
    ${stats.map(s => `<div class="stat-box"><div class="stat-label">${s.ab}</div><div class="stat-val">${s.val}</div><div class="stat-mod">${s.mod}</div></div>`).join('')}
  </div>
</div>

<div class="grid2">
  <div>
    <div class="section">
      <h2>Combat</h2>
      <div class="grid3">
        <div class="info-box"><div class="info-label">HP</div><div class="info-val">${hp} / ${maxhp} (+${temphp} THP)</div></div>
        <div class="info-box"><div class="info-label">AC</div><div class="info-val">${ac}</div></div>
        <div class="info-box"><div class="info-label">Speed</div><div class="info-val">${speed} ft</div></div>
        <div class="info-box"><div class="info-label">Prof Bonus</div><div class="info-val">+${prof}</div></div>
        <div class="info-box"><div class="info-label">Initiative</div><div class="info-val">${init}</div></div>
        <div class="info-box"><div class="info-label">Passive Perc</div><div class="info-val">${passive}</div></div>
        <div class="info-box"><div class="info-label">Hit Dice</div><div class="info-val">${hitdice}</div></div>
        <div class="info-box"><div class="info-label">Spell Save DC</div><div class="info-val">${spelldc}</div></div>
        <div class="info-box"><div class="info-label">Poise</div><div class="info-val">${poise} / ${maxpoise}</div></div>
      </div>
    </div>
    <div class="section">
      <h2>Weapons</h2>
      <table><tr><th>Name</th><th>ATK</th><th>Damage</th><th>Notes</th></tr>${weapons || '<tr><td colspan="4" style="color:#888;font-style:italic;">None</td></tr>'}</table>
    </div>
    <div class="section">
      <h2>Coins</h2>
      <div class="grid3">
        ${Object.entries(coins).map(([k,v]) => `<div class="info-box"><div class="info-label">${k.toUpperCase()}</div><div class="info-val">${v}</div></div>`).join('')}
      </div>
    </div>
  </div>
  <div>
    <div class="section">
      <h2>Skills</h2>
      <table><tr><th>P</th><th>Skill</th><th>Bonus</th></tr>${skillRows || '<tr><td colspan="3">—</td></tr>'}</table>
    </div>
  </div>
</div>

<div class="grid2">
  <div class="section">
    <h2>Class Features</h2>
    <div class="textarea-val">${classFeatures}</div>
  </div>
  <div class="section">
    <h2>Species Traits & Feats</h2>
    <div class="textarea-val">${speciesTraits}</div>
  </div>
</div>

<div class="section">
  <h2>Personality & Backstory</h2>
  <div class="grid2">
    <div>
      <div class="info-label" style="margin-bottom:2px;">Traits</div><div class="textarea-val" style="min-height:30px;">${personality}</div>
      <div class="info-label" style="margin:4px 0 2px;">Ideals</div><div class="textarea-val" style="min-height:25px;">${ideals}</div>
    </div>
    <div>
      <div class="info-label" style="margin-bottom:2px;">Bonds</div><div class="textarea-val" style="min-height:30px;">${bonds}</div>
      <div class="info-label" style="margin:4px 0 2px;">Flaws</div><div class="textarea-val" style="min-height:25px;">${flaws}</div>
    </div>
  </div>
  <div class="info-label" style="margin:4px 0 2px;">Backstory</div>
  <div class="textarea-val">${backstory}</div>
  <div class="info-label" style="margin:4px 0 2px;">Languages</div>
  <div class="textarea-val" style="min-height:20px;">${languages}</div>
</div>
</body></html>`;

  const win = window.open('', '_blank');
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}

// ============================================================
// 💾 SAVE / LOAD CHARACTER (LocalStorage)
// ============================================================

function getFieldVal(id) {
  const el = document.getElementById(id);
  if (!el) return null;
  if (el.type === 'checkbox') return el.checked;
  return el.value;
}
function setFieldVal(id, val) {
  const el = document.getElementById(id);
  if (!el) return;
  if (el.type === 'checkbox') el.checked = !!val;
  else el.value = val ?? '';
}

const CHAR_FIELDS = [
  'char-name','char-class','char-subclass','char-race','char-bg',
  'char-level','char-xp','char-alignment',
  'stat-str','stat-dex','stat-con','stat-int','stat-wis','stat-cha',
  'char-hp','char-maxhp','char-temphp','char-hitdice','char-hitdice-spent',
  'char-ac','char-shield','char-speed','char-size','char-passive',
  'char-poise','char-maxpoise','char-prof',
  'armor-light','armor-medium','armor-heavy','armor-shields',
  'char-weapon-prof','char-tool-prof',
  'char-class-features','char-species-traits','char-traits',
  'char-appearance','char-personality','char-ideals','char-bonds','char-flaws','char-backstory','char-languages',
  'scratch-pad',
  'coin-pp','coin-gp','coin-ep','coin-sp','coin-cp',
  'enc-max-custom',
  'spell-notes','spell-ability','caster-type','caster-level',
  'attune-1','attune-2','attune-3',
  'playerinv-notes',
];

// ============================================================
// 💾 EXPORT / IMPORT CHARACTER (File-based JSON)
// ============================================================

function buildSaveData() {
  const data = {
    v: 3,
    app: 'PlayerScreen-WarRoom',
    ts: Date.now(),
    charName: document.getElementById('char-name')?.value || 'Unknown',
    fields: {},
    weapons: weapons,
    invWeapons: invWeapons,
    personalItems: personalItems,
    playerInvItems: playerInvItems,
    genItems: genItems || [],
    customResources: customResources,
    spellEntries: spellEntries,
    playerSpellSlots: playerSpellSlots,
    sessionNotes: sessionNotes,
    quests: quests,
    npcsMet: npcsMet,
    milestones: milestones || [],
    companions: companions || [],
    duraItems: duraItems || [],
    charConditions: charConditions || [],
    skillProf: skillProf,
    skillExpertise: skillExpertise,
    critCount: critCount,
    theme: currentTheme || 'blue',
    deathSuccess: Array.from(document.querySelectorAll('#death-success .ds-pip')).map(p => p.classList.contains('on')),
    deathFail:    Array.from(document.querySelectorAll('#death-fail .ds-pip')).map(p => p.classList.contains('on')),
  };
  CHAR_FIELDS.forEach(id => { const v = getFieldVal(id); if (v !== null) data.fields[id] = v; });
  return data;
}

function applyLoadData(data) {
  Object.entries(data.fields || {}).forEach(([id, val]) => setFieldVal(id, val));
  if (data.weapons)         { weapons = data.weapons;                 renderWeapons(); }
  if (data.invWeapons)      { invWeapons = data.invWeapons;           renderInvWeapons(); }
  if (data.personalItems)   { personalItems = data.personalItems;     renderPersonalInventory(); }
  if (data.playerInvItems)  { playerInvItems = data.playerInvItems;   renderPlayerInv(); }
  if (data.genItems)        { genItems = data.genItems;               renderGenItems && renderGenItems(); }
  if (data.customResources) { customResources = data.customResources; renderCustomResources(); }
  if (data.spellEntries)    { spellEntries = data.spellEntries;       renderSpellEntries(); }
  if (data.playerSpellSlots){ playerSpellSlots = data.playerSpellSlots; renderSpellSlots(); }
  if (data.sessionNotes)    { sessionNotes = data.sessionNotes;       renderSessionNotes(); }
  if (data.quests)          { quests = data.quests;                   renderQuests(); }
  if (data.npcsMet)         { npcsMet = data.npcsMet;                 renderNPCsMet(); }
  if (data.milestones)      { milestones = data.milestones;           renderMilestones(); }
  if (data.companions)      { companions = data.companions;           renderCompanions(); }
  if (data.duraItems)       { duraItems = data.duraItems;             renderPlayerDura(); }
  if (data.charConditions)  { charConditions = data.charConditions;   renderCharConditions && renderCharConditions(); }
  if (data.skillProf)       { skillProf = data.skillProf; }
  if (data.skillExpertise)  { skillExpertise = data.skillExpertise;   renderSkills(); }
  if (data.critCount !== undefined) { critCount = data.critCount;     renderCritPips(); }
  if (data.theme)           applyTheme(data.theme);
  if (data.deathSuccess) document.querySelectorAll('#death-success .ds-pip').forEach((p,i) => { if (data.deathSuccess[i]) p.classList.add('on'); else p.classList.remove('on'); });
  if (data.deathFail)    document.querySelectorAll('#death-fail .ds-pip').forEach((p,i)    => { if (data.deathFail[i])    p.classList.add('on'); else p.classList.remove('on'); });
  updateMods();
  updateHPBar();
  updatePoiseBar();
  updateCoinWeight();
  updateEncumbrance();
}

// ── EXPORT ──────────────────────────────────────────────────
function exportCharacter() {
  const data     = buildSaveData();
  const json     = JSON.stringify(data, null, 2);
  const blob     = new Blob([json], { type: 'application/json' });
  const url      = URL.createObjectURL(blob);
  const charName = (data.charName || 'character').replace(/[^a-z0-9_\-]/gi, '_');
  const dateStr  = new Date().toISOString().slice(0,10);
  const filename = `${charName}_${dateStr}.psave`;

  const a = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);

  // Also save to localStorage as backup
  try { localStorage.setItem(SAVE_KEY, json); } catch(e) {}

  const btn = document.getElementById('export-btn');
  if (btn) {
    const orig = btn.innerHTML;
    btn.innerHTML = '✅ Exported!';
    setTimeout(() => { btn.innerHTML = orig; }, 2000);
  }
  showToast(`💾 "${filename}" didownload!`);
}

// ── IMPORT ──────────────────────────────────────────────────
let _pendingImportData = null;

function importCharacter(input) {
  const file = input.files[0];
  if (!file) return;
  // Reset input so same file can be re-selected
  input.value = '';

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      // Validate it's a player screen save
      if (!data.fields && !data.charName) {
        showToast('❌ File tidak valid — bukan file save Player Screen.');
        return;
      }
      _pendingImportData = data;
      // Show confirm modal with file info
      const charName = data.charName || data.fields?.['char-name'] || 'Unknown';
      const charClass = data.fields?.['char-class'] || '?';
      const charLevel = data.fields?.['char-level'] || '?';
      const savedDate = data.ts ? new Date(data.ts).toLocaleString('id-ID') : 'Tanggal tidak diketahui';
      const info = document.getElementById('import-modal-info');
      if (info) info.innerHTML = `
        <div style="display:flex;gap:10px;align-items:center;margin-bottom:6px;">
          <span style="font-size:1.5rem;">🧙</span>
          <div>
            <div style="font-family:var(--display);font-size:0.85rem;color:var(--gold2);">${charName}</div>
            <div style="font-size:0.72rem;color:var(--text3);">${charClass} · Level ${charLevel}</div>
          </div>
        </div>
        <div style="font-size:0.68rem;color:var(--text3);">📅 Disimpan: ${savedDate}</div>
        <div style="font-size:0.68rem;color:var(--text3);">📄 File: ${file.name}</div>
      `;
      // Show modal
      const modal = document.getElementById('import-modal');
      if (modal) modal.style.display = 'flex';
    } catch(err) {
      showToast('❌ Gagal baca file: ' + err.message);
    }
  };
  reader.readAsText(file);
}

function confirmImport() {
  if (!_pendingImportData) return;
  try {
    applyLoadData(_pendingImportData);
    const charName = _pendingImportData.charName || _pendingImportData.fields?.['char-name'] || 'Unknown';
    // Save to localStorage too
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(_pendingImportData)); } catch(e) {}
    showToast(`✅ "${charName}" berhasil di-load!`);
  } catch(err) {
    showToast('❌ Error loading data: ' + err.message);
  }
  cancelImport();
}

function cancelImport() {
  _pendingImportData = null;
  const modal = document.getElementById('import-modal');
  if (modal) modal.style.display = 'none';
}

// Legacy aliases so old references still work
function saveCharacter() { exportCharacter(); }
function loadCharacter() { showToast('Gunakan tombol 📂 Import untuk load file.'); }

// Auto-save to localStorage every 2 min + on unload (silent backup)
setInterval(() => {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(buildSaveData())); } catch(e) {}
}, 120000);
window.addEventListener('beforeunload', () => {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(buildSaveData())); } catch(e) {}
});

// Auto-load from localStorage on startup if save exists
function autoLoadOnStart() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return;
  try {
    const data = JSON.parse(raw);
    applyLoadData(data);
    const charName = data.charName || data.fields?.['char-name'] || '';
    if (charName) showToast(`📂 Auto-load: "${charName}"`);
  } catch(e) {
    // Silently fail — don't block startup
  }
}

// ============================================================
// 🎯 INITIATIVE TRACKER
// ============================================================

function rollInitiative() {
  const roll = Math.floor(Math.random() * 20) + 1;
  document.getElementById('init-roll').value = roll;
  sfxPlay('dice');
}

function submitInitEntry() {
  const name = document.getElementById('init-name').value.trim();
  if (!name) { document.getElementById('init-name').focus(); return; }
  const roll = parseInt(document.getElementById('init-roll').value) || 0;
  const type = document.getElementById('init-type').value;
  initEntries.push({ id: Date.now(), name, roll, type, hp: '', active: false });
  document.getElementById('init-name').value = '';
  document.getElementById('init-roll').value = '';
  toggleAddForm('init-form');
  renderInitiative();
  showToast(`⚔ ${name} (${roll}) ditambahkan!`);
}

function sortInitiative() {
  initEntries.sort((a, b) => b.roll - a.roll);
  initCurrentIdx = 0;
  renderInitiative();
}

function clearInitiative() {
  initEntries = [];
  initCurrentIdx = 0;
  renderInitiative();
}

function nextInitTurn() {
  if (!initEntries.length) return;
  initCurrentIdx = (initCurrentIdx + 1) % initEntries.length;
  renderInitiative();
  const cur = initEntries[initCurrentIdx];
  showToast(`⚔ Giliran: ${cur.name}`);
}

function removeInitEntry(id) {
  initEntries = initEntries.filter(e => e.id !== id);
  if (initCurrentIdx >= initEntries.length) initCurrentIdx = 0;
  renderInitiative();
}

function renderInitiative() {
  const list  = document.getElementById('init-list');
  const empty = document.getElementById('init-empty');
  if (!list) return;
  if (!initEntries.length) {
    list.innerHTML = '';
    if (empty) empty.style.display = '';
    return;
  }
  if (empty) empty.style.display = 'none';
  const typeColors = { player: '#7faadc', ally: '#58d68d', enemy: '#e74c3c' };
  const typeIcons  = { player: '🧙', ally: '💚', enemy: '💀' };
  list.innerHTML = initEntries.map((e, i) => {
    const isActive = i === initCurrentIdx;
    const color = typeColors[e.type] || 'var(--text)';
    return `<div style="display:flex;align-items:center;gap:6px;padding:6px 8px;border-radius:3px;border:1px solid ${isActive ? color : 'var(--border)'};background:${isActive ? `rgba(${e.type==='player'?'127,170,220':e.type==='ally'?'58,214,141':'231,76,60'},0.12)` : 'var(--bg3)'};transition:all 0.2s;">
      <span style="font-family:var(--mono);font-size:0.9rem;font-weight:700;color:${color};min-width:28px;text-align:center;${isActive?'text-shadow:0 0 8px '+color+';':''}">${e.roll}</span>
      <span style="font-size:0.85rem;flex-shrink:0;">${typeIcons[e.type]||'⚔'}</span>
      <span style="flex:1;font-size:0.8rem;color:${isActive?'var(--text)':'var(--text2)'};font-weight:${isActive?'700':'400'};">${e.name}</span>
      ${isActive ? '<span style="font-family:var(--display);font-size:0.55rem;color:'+color+';letter-spacing:0.08em;background:rgba(0,0,0,0.3);padding:1px 5px;border-radius:8px;">AKTIF</span>' : ''}
      <button class="icon-btn danger" style="font-size:0.65rem;" onclick="removeInitEntry(${e.id})">✕</button>
    </div>`;
  }).join('');
  // Add Next Turn button if entries exist
  list.innerHTML += `<button class="btn" onclick="nextInitTurn()" style="width:100%;margin-top:6px;font-size:0.65rem;padding:6px;border-color:var(--accent);color:var(--accent2);">⏭ Next Turn</button>`;
}

// ============================================================
// 🔔 REMINDER TIMERS
// ============================================================

function syncReminderPreset() {
  const val = document.getElementById('rm-preset').value;
  document.getElementById('rm-custom-row').style.display = val === 'custom' ? '' : 'none';
}

function submitReminder() {
  const name = document.getElementById('rm-name').value.trim();
  if (!name) { document.getElementById('rm-name').focus(); return; }
  const preset = document.getElementById('rm-preset').value;
  let seconds;
  if (preset === 'custom') {
    const rounds = parseInt(document.getElementById('rm-rounds').value) || 0;
    const secs   = parseInt(document.getElementById('rm-seconds').value) || 0;
    seconds = rounds * 6 + secs; // 1 round = 6 seconds in D&D
    if (seconds <= 0) { showToast('Masukkan durasi!'); return; }
  } else {
    seconds = parseInt(preset);
  }
  reminders.push({ id: Date.now(), name, total: seconds, remaining: seconds, done: false });
  document.getElementById('rm-name').value = '';
  toggleAddForm('reminder-form');
  if (!reminderInterval) reminderInterval = setInterval(tickReminders, 1000);
  renderReminders();
  showToast(`🔔 Timer "${name}" dimulai!`);
}

function tickReminders() {
  let anyActive = false;
  reminders.forEach(r => {
    if (!r.done) {
      r.remaining = Math.max(0, r.remaining - 1);
      if (r.remaining === 0 && !r.done) {
        r.done = true;
        showToast(`⏰ "${r.name}" SELESAI!`);
        sfxPlay('crit');
      } else if (!r.done) {
        anyActive = true;
      }
    }
  });
  renderReminders();
  if (!anyActive) { clearInterval(reminderInterval); reminderInterval = null; }
}

function removeReminder(id) {
  reminders = reminders.filter(r => r.id !== id);
  renderReminders();
}

function pauseResumeReminder(id) {
  const r = reminders.find(x => x.id === id);
  if (!r || r.done) return;
  r.paused = !r.paused;
  if (!r.paused && !reminderInterval) {
    reminderInterval = setInterval(tickReminders, 1000);
  }
  renderReminders();
}

function renderReminders() {
  const list  = document.getElementById('reminder-list');
  const empty = document.getElementById('reminder-empty');
  if (!list) return;
  if (!reminders.length) {
    list.innerHTML = '';
    if (empty) empty.style.display = '';
    return;
  }
  if (empty) empty.style.display = 'none';
  list.innerHTML = reminders.map(r => {
    const pct   = r.total > 0 ? (r.remaining / r.total) * 100 : 0;
    const barColor = r.done ? '#888' : pct > 50 ? 'var(--green2)' : pct > 20 ? '#e0c040' : 'var(--red3)';
    const mins  = Math.floor(r.remaining / 60);
    const secs  = r.remaining % 60;
    const label = r.done ? '✅ Done' : `${mins}:${String(secs).padStart(2,'0')}`;
    return `<div style="background:var(--bg3);border:1px solid var(--border${r.done?'':r.paused?'2':'2'});border-radius:3px;padding:7px 9px;opacity:${r.done?'0.55':'1'};">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:5px;">
        <span style="font-size:0.82rem;flex:1;color:var(--text);font-family:var(--display);font-size:0.7rem;">${r.name}</span>
        <span style="font-family:var(--mono);font-size:0.78rem;color:${barColor};font-weight:700;min-width:44px;text-align:right;">${label}</span>
        ${!r.done ? `<button class="icon-btn" style="font-size:0.7rem;" onclick="pauseResumeReminder(${r.id})">${r.paused?'▶':'⏸'}</button>` : ''}
        <button class="icon-btn danger" style="font-size:0.65rem;" onclick="removeReminder(${r.id})">✕</button>
      </div>
      <div style="background:var(--bg2);border-radius:2px;height:5px;overflow:hidden;">
        <div style="height:100%;width:${pct}%;background:${barColor};transition:width 0.9s,background 0.5s;border-radius:2px;"></div>
      </div>
    </div>`;
  }).join('');
}

// ============================================================
// 🎨 THEME SWITCHER
// ============================================================

const THEMES = {
  blue: {
    '--accent':  '#4a80d0',
    '--accent2': '#7faadc',
    '--gold':    '#4a80d0',
    '--gold2':   '#7faadc',
    '--gold3':   '#a0c4f0',
    '--purple2': '#7090c0',
    '--purple3': '#90b0e0',
  },
  red: {
    '--accent':  '#c0392b',
    '--accent2': '#e74c3c',
    '--gold':    '#c0392b',
    '--gold2':   '#e74c3c',
    '--gold3':   '#f1948a',
    '--purple2': '#922b21',
    '--purple3': '#e74c3c',
  },
  green: {
    '--accent':  '#1e8449',
    '--accent2': '#27ae60',
    '--gold':    '#1e8449',
    '--gold2':   '#27ae60',
    '--gold3':   '#58d68d',
    '--purple2': '#196f3d',
    '--purple3': '#2ecc71',
  },
  purple: {
    '--accent':  '#7d3c98',
    '--accent2': '#a855f7',
    '--gold':    '#7d3c98',
    '--gold2':   '#a855f7',
    '--gold3':   '#c39bd3',
    '--purple2': '#6c3483',
    '--purple3': '#c39bd3',
  },
  gold: {
    '--accent':  '#9a7d0a',
    '--accent2': '#d4af37',
    '--gold':    '#9a7d0a',
    '--gold2':   '#d4af37',
    '--gold3':   '#f7dc6f',
    '--purple2': '#7d6608',
    '--purple3': '#f4d03f',
  },
  dark: {
    '--accent':  '#555',
    '--accent2': '#888',
    '--gold':    '#555',
    '--gold2':   '#999',
    '--gold3':   '#bbb',
    '--purple2': '#444',
    '--purple3': '#aaa',
  },
};

function applyTheme(name) {
  const vars = THEMES[name];
  if (!vars) return;
  currentTheme = name;
  const root = document.documentElement;
  Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
  // Mark active button in picker
  document.querySelectorAll('.theme-opt').forEach(btn => {
    btn.style.opacity = btn.dataset.theme === name ? '1' : '0.55';
    btn.style.transform = btn.dataset.theme === name ? 'scale(1.04)' : 'scale(1)';
  });
  closeThemePicker();
  showToast(`🎨 Tema "${name}" aktif!`);
}

function openThemePicker() {
  const ov = document.getElementById('theme-overlay');
  if (ov) { ov.style.display = 'flex'; }
}

function closeThemePicker() {
  const ov = document.getElementById('theme-overlay');
  if (ov) ov.style.display = 'none';
}

// ============================================================
// 🏆 MILESTONE / ACHIEVEMENT TRACKER
// ============================================================

const MS_CAT = {
  combat:   { icon:'⚔', color:'#e07060' },
  story:    { icon:'📖', color:'#7faadc' },
  social:   { icon:'💬', color:'#58d68d' },
  explore:  { icon:'🗺', color:'#e0d040' },
  personal: { icon:'⭐', color:'#e0a030' },
  misc:     { icon:'📌', color:'#a0a0a0' },
};

function submitMilestone() {
  const title = document.getElementById('af-ms-title').value.trim();
  if (!title) { document.getElementById('af-ms-title').focus(); return; }
  const cat  = document.getElementById('af-ms-cat').value;
  const desc = document.getElementById('af-ms-desc').value.trim();
  milestones.unshift({ id: Date.now(), title, cat, desc,
    date: new Date().toLocaleDateString('id-ID', {day:'2-digit',month:'short',year:'numeric'}) });
  document.getElementById('af-ms-title').value = '';
  document.getElementById('af-ms-desc').value  = '';
  toggleAddForm('milestone-form');
  renderMilestones();
  sfxPlay('crit');
  showToast(`🏆 "${title}" dicatat!`);
}

function deleteMilestone(id) {
  milestones = milestones.filter(m => m.id !== id);
  renderMilestones();
}

function renderMilestones() {
  const list  = document.getElementById('milestone-list');
  const empty = document.getElementById('milestone-empty');
  const stats = document.getElementById('milestone-stats');
  if (!list) return;

  // Stats bar — count per category
  if (stats) {
    if (!milestones.length) { stats.innerHTML = ''; }
    else {
      const counts = {};
      milestones.forEach(m => counts[m.cat] = (counts[m.cat]||0) + 1);
      stats.innerHTML = Object.entries(counts).map(([cat, n]) => {
        const c = MS_CAT[cat] || MS_CAT.misc;
        return `<span style="font-size:0.65rem;background:rgba(0,0,0,0.2);border:1px solid ${c.color}40;color:${c.color};padding:2px 7px;border-radius:10px;font-family:var(--display);letter-spacing:0.06em;">${c.icon} ${n}</span>`;
      }).join('');
    }
  }

  if (!milestones.length) {
    list.innerHTML = '';
    if (empty) empty.style.display = '';
    return;
  }
  if (empty) empty.style.display = 'none';

  list.innerHTML = milestones.map(m => {
    const c = MS_CAT[m.cat] || MS_CAT.misc;
    return `<div style="background:var(--bg3);border:1px solid var(--border);border-left:3px solid ${c.color};border-radius:3px;padding:8px 10px;">
      <div style="display:flex;align-items:flex-start;gap:7px;">
        <span style="font-size:1.1rem;flex-shrink:0;margin-top:1px;">${c.icon}</span>
        <div style="flex:1;min-width:0;">
          <div style="font-family:var(--display);font-size:0.75rem;color:var(--text);font-weight:600;margin-bottom:2px;">${m.title}</div>
          ${m.desc ? `<div style="font-size:0.72rem;color:var(--text2);line-height:1.5;margin-bottom:3px;">${m.desc}</div>` : ''}
          <div style="font-size:0.6rem;color:var(--text3);">${m.date}</div>
        </div>
        <button class="icon-btn danger" style="font-size:0.65rem;flex-shrink:0;" onclick="deleteMilestone(${m.id})">✕</button>
      </div>
    </div>`;
  }).join('');
}

// ============================================================
// 🐾 COMPANION / FAMILIAR TRACKER
// ============================================================

const CP_TYPE_META = {
  familiar: { icon:'🔮', color:'#a855f7' },
  animal:   { icon:'🐺', color:'#58d68d' },
  summon:   { icon:'✨', color:'#7faadc' },
  npc:      { icon:'🧑', color:'#e0d040' },
  mount:    { icon:'🐴', color:'#e0a030' },
  other:    { icon:'⚔', color:'#aaa'    },
};

function submitCompanion() {
  const name = document.getElementById('cp-name').value.trim();
  if (!name) { document.getElementById('cp-name').focus(); return; }
  const hp    = parseInt(document.getElementById('cp-hp').value)    || 10;
  const maxhp = parseInt(document.getElementById('cp-maxhp').value) || 10;
  const ac    = parseInt(document.getElementById('cp-ac').value)    || 12;
  const speed = document.getElementById('cp-speed').value.trim()    || '30 ft';
  const type  = document.getElementById('cp-type').value;
  const notes = document.getElementById('cp-notes').value.trim();
  companions.push({ id: Date.now(), name, type, hp, maxhp, ac, speed, notes, expanded: false,
    str:10, dex:10, con:10, int:4, wis:12, cha:6, conditions:[] });
  ['cp-name','cp-notes'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('cp-hp').value    = '10';
  document.getElementById('cp-maxhp').value = '10';
  document.getElementById('cp-ac').value    = '12';
  document.getElementById('cp-speed').value = '30 ft';
  toggleAddForm('companion-form');
  renderCompanions();
  showToast(`🐾 ${name} bergabung!`);
}

function toggleCompanionExpand(id) {
  const c = companions.find(x => x.id === id);
  if (c) { c.expanded = !c.expanded; renderCompanions(); }
}

function deleteCompanion(id) {
  companions = companions.filter(x => x.id !== id);
  renderCompanions();
  showToast('🐾 Companion removed.');
}

function adjustCompHP(id, delta) {
  const c = companions.find(x => x.id === id); if (!c) return;
  c.hp = Math.max(0, Math.min(c.maxhp, c.hp + delta));
  if (c.hp === 0) showToast(`💀 ${c.name} jatuh! (0 HP)`);
  renderCompanions();
}

function renderCompanions() {
  const list  = document.getElementById('companion-list');
  const empty = document.getElementById('companion-empty');
  if (!list) return;

  if (!companions.length) {
    list.innerHTML = '';
    if (empty) empty.style.display = '';
    return;
  }
  if (empty) empty.style.display = 'none';

  list.innerHTML = companions.map(c => {
    const meta   = CP_TYPE_META[c.type] || CP_TYPE_META.other;
    const pct    = c.maxhp > 0 ? (c.hp / c.maxhp) * 100 : 0;
    const barClr = pct > 60 ? '#27ae60' : pct > 25 ? '#e67e22' : '#e74c3c';

    return `<div style="background:var(--bg3);border:1px solid var(--border2);border-left:3px solid ${meta.color};border-radius:3px;overflow:hidden;">

      <!-- Collapsed header -->
      <div style="display:flex;align-items:center;gap:8px;padding:8px 10px;cursor:pointer;" onclick="toggleCompanionExpand(${c.id})">
        <span style="font-size:1.1rem;flex-shrink:0;">${meta.icon}</span>
        <div style="flex:1;min-width:0;">
          <div style="font-family:var(--display);font-size:0.78rem;color:var(--text);font-weight:600;">${c.name}</div>
          <div style="font-size:0.65rem;color:var(--text3);">AC ${c.ac} · ${c.speed}</div>
        </div>
        <!-- HP quick adjust -->
        <div style="display:flex;align-items:center;gap:3px;flex-shrink:0;" onclick="event.stopPropagation()">
          <button class="icon-btn" style="font-size:0.8rem;padding:2px 6px;" onclick="adjustCompHP(${c.id},-1)">−</button>
          <div style="text-align:center;min-width:44px;">
            <div style="font-family:var(--mono);font-size:0.8rem;color:${barClr};font-weight:700;">${c.hp}/${c.maxhp}</div>
            <div style="background:var(--bg2);border-radius:2px;height:4px;overflow:hidden;margin-top:2px;">
              <div style="height:100%;width:${pct}%;background:${barClr};transition:width 0.3s;border-radius:2px;"></div>
            </div>
          </div>
          <button class="icon-btn" style="font-size:0.8rem;padding:2px 6px;" onclick="adjustCompHP(${c.id},1)">+</button>
        </div>
        <span style="font-size:0.7rem;color:var(--text3);flex-shrink:0;">${c.expanded ? '▲' : '▼'}</span>
      </div>

      <!-- Expanded detail -->
      ${c.expanded ? `
      <div style="border-top:1px solid var(--border);padding:10px;display:flex;flex-direction:column;gap:8px;">

        <!-- Ability Scores mini grid -->
        <div style="display:grid;grid-template-columns:repeat(6,1fr);gap:4px;text-align:center;">
          ${['str','dex','con','int','wis','cha'].map(ab => {
            const val = c[ab] || 10;
            const mod = Math.floor((val-10)/2);
            return `<div style="background:var(--bg2);border:1px solid var(--border);border-radius:2px;padding:4px 2px;">
              <div style="font-family:var(--display);font-size:0.5rem;color:var(--text3);letter-spacing:0.06em;">${ab.toUpperCase()}</div>
              <input type="number" value="${val}" min="1" max="30" style="width:100%;text-align:center;background:transparent;border:none;color:var(--gold2);font-family:var(--mono);font-size:0.8rem;padding:1px 0;" oninput="companions.find(x=>x.id===${c.id}).${ab}=parseInt(this.value)||10;renderCompanions()">
              <div style="font-size:0.6rem;color:var(--text2);">${mod>=0?'+':''}${mod}</div>
            </div>`;
          }).join('')}
        </div>

        <!-- Stats row -->
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;">
          <div class="npc-field" style="text-align:center;">
            <label>AC</label>
            <input type="number" value="${c.ac}" min="1" style="text-align:center;font-family:var(--mono);" oninput="companions.find(x=>x.id===${c.id}).ac=parseInt(this.value)||12;renderCompanions()">
          </div>
          <div class="npc-field" style="text-align:center;">
            <label>Max HP</label>
            <input type="number" value="${c.maxhp}" min="1" style="text-align:center;font-family:var(--mono);" oninput="companions.find(x=>x.id===${c.id}).maxhp=parseInt(this.value)||1;renderCompanions()">
          </div>
          <div class="npc-field" style="text-align:center;">
            <label>Speed</label>
            <input value="${c.speed}" style="text-align:center;font-size:0.8rem;" oninput="companions.find(x=>x.id===${c.id}).speed=this.value;renderCompanions()">
          </div>
        </div>

        <!-- HP bar full -->
        <div>
          <div style="display:flex;justify-content:space-between;margin-bottom:3px;">
            <span style="font-family:var(--display);font-size:0.55rem;color:var(--text3);">HP</span>
            <span style="font-family:var(--mono);font-size:0.7rem;color:${barClr};">${c.hp} / ${c.maxhp}</span>
          </div>
          <div style="background:var(--bg2);border-radius:3px;height:8px;overflow:hidden;">
            <div style="height:100%;width:${pct}%;background:${barClr};transition:width 0.3s;border-radius:3px;"></div>
          </div>
          <div style="display:flex;gap:4px;margin-top:5px;">
            <button class="btn red" style="flex:1;font-size:0.6rem;padding:4px;" onclick="adjustCompHP(${c.id},-5)">−5</button>
            <button class="btn red" style="flex:1;font-size:0.6rem;padding:4px;" onclick="adjustCompHP(${c.id},-1)">−1</button>
            <button class="btn green" style="flex:1;font-size:0.6rem;padding:4px;" onclick="adjustCompHP(${c.id},1)">+1</button>
            <button class="btn green" style="flex:1;font-size:0.6rem;padding:4px;" onclick="adjustCompHP(${c.id},5)">+5</button>
            <button class="btn" style="flex:1;font-size:0.6rem;padding:4px;" onclick="companions.find(x=>x.id===${c.id}).hp=companions.find(x=>x.id===${c.id}).maxhp;renderCompanions()">Full</button>
          </div>
        </div>

        <!-- Notes / Abilities -->
        <div class="npc-field">
          <label>Abilities & Notes</label>
          <textarea style="width:100%;min-height:70px;resize:vertical;font-size:0.8rem;line-height:1.5;" placeholder="Darkvision 60ft, Pack Tactics&#10;Bite: +4 to hit, 2d6+2 piercing&#10;Flyby: doesn't provoke OA..." oninput="companions.find(x=>x.id===${c.id}).notes=this.value">${c.notes}</textarea>
        </div>

        <div style="display:flex;justify-content:flex-end;">
          <button class="btn red" style="font-size:0.6rem;padding:4px 10px;" onclick="deleteCompanion(${c.id})">🗑 Remove</button>
        </div>
      </div>` : ''}
    </div>`;
  }).join('');
}

