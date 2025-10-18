
// ===== Shang Shi Menu (clean baseline) =====
// Glass tints for presets
const allergenClassMap = {
  "CE": "chip-ce",
  "CR": "chip-cr",
  "EG": "chip-eg",
  "FI": "chip-fi",
  "GA": "chip-ga",
  "GL": "chip-gl",
  "MO": "chip-mo",
  "MR": "chip-mr",
  "MU": "chip-mu",
  "MI": "chip-mi",
  "NU": "chip-nu",
  "ON": "chip-on",
  "SE": "chip-se",
  "SO": "chip-so",
  "HO": "chip-ho",
};

const LEGEND = {
  CE:"Celery", GL:"Gluten", CR:"Crustaceans", EG:"Eggs", FI:"Fish", MO:"Molluscs", MI:"Milk",
  MU:"Mustard", NU:"Nuts", SE:"Sesame", SO:"Soya", GA:"Garlic", ON:"Onion", MR:"Mushrooms", HO:"Honey"
};

let data = [];
let selectedAllergens = new Set();
let selectedCategory = null;
const EXTRA_CATEGORIES = ["Sauces","Sides"];
const CATEGORY_ORDER = ["Starters","Mains","Desserts","Sauces","Sides"];

let showUnsafeOnly = JSON.parse(localStorage.getItem("show-unsafe-only")||"false");
const els = {
  grid: document.getElementById('grid'),
  chips: document.getElementById('chips'),
  cat: document.getElementById('categories'),
  result: document.getElementById('resultCount'),
  active: document.getElementById('activeFilter'),
  filterPanel: document.getElementById('filterPanel'),
  categoryPanel: document.getElementById('categoryPanel'),
  filterToggle: document.getElementById('filterToggle'),
  categoryToggle: document.getElementById('categoryToggle'),
  resetBtn: document.getElementById('resetBtn')
};

// Load
async function loadMenu(){ const r = await fetch('./menu.json', {cache:'no-store'}); return r.ok ? r.json() : []; }

// --- Normalization helpers ---
const NORM = s => String(s ?? '').trim().toUpperCase();
function normalizeData(arr){
  return (arr||[]).map(d => ({
    ...d,
    allergens: Array.from(new Set((d.allergens||[]).map(NORM).filter(Boolean)))
  }));
}
// Uppercase-key legend for consistent chips
const LEGEND_UC = Object.fromEntries(Object.entries(LEGEND).map(([k,v]) => [k.toUpperCase(), v]));


// Build chips
function renderAllergenChips(){
  els.chips.innerHTML = '';
  const codes = Array.from(Object.keys(LEGEND_UC)).filter(c => data.some(d => (d.allergens||[]).includes(c)));
  codes.forEach(code => {
    const btn = document.createElement('button');
    btn.className = 'chip';
    btn.dataset.code = NORM(code);
    btn.innerHTML = `<b>${code}</b> ${LEGEND[code] || code}`; // Dock shows code + full name
    btn.addEventListener('click', () => {
      const UC = NORM(code);
      if (selectedAllergens.has(UC)){ selectedAllergens.delete(UC); btn.classList.remove('active'); }
      else { selectedAllergens.add(UC); btn.classList.add('active'); }
      refresh();
initResetEnhance();
ensureDockUnsafeToggle();
    }, {passive:true});
    els.chips.appendChild(btn);
  });
}

function renderCategoryChips(){
  const _catIndex = (c)=>{const i=CATEGORY_ORDER.indexOf(c||"");return i===-1?999:i;};
  els.cat.innerHTML = '';
  let categories = Array.from(new Set([...(EXTRA_CATEGORIES||[]), ...data.map(d => d.category)])).filter(Boolean);
  categories = categories.sort((a,b)=>_catIndex(a)-_catIndex(b) || String(a).localeCompare(String(b)));
  categories.forEach(cat => {
    const key = cat.toLowerCase().replace(/\s+/g,'');
    const btn = document.createElement('button');
    btn.className = `chip category chip-${key}`;
    btn.textContent = cat;
    btn.addEventListener('click', () => {
      if (selectedCategory === cat){ selectedCategory = null; btn.classList.remove('active'); }
      else { selectedCategory = cat; [...els.cat.children].forEach(c=>c.classList.remove('active')); btn.classList.add('active'); }
      refresh();
    }, {passive:true});
    els.cat.appendChild(btn);
  });
}

// Cards
function card(item){
  const a = document.createElement('article');
  a.className = 'card';
  a.setAttribute('data-category', item.category||'');
  a.setAttribute('data-allergens', JSON.stringify(item.allergens||[]));

  const labels = document.createElement('div');
  ensureContainsPill(labels, item);
  labels.className = 'labels';

  const key = (item.category||'').toLowerCase().replace(/\s+/g,'');
  const cPill = document.createElement('span');
  cPill.className = `pill pill-${key || 'mains'}`;
  cPill.textContent = item.category || 'Dish';
  labels.appendChild(cPill);

  // SAFE only if allergens selected and dish safe
  if (selectedAllergens.size){
    const al = (item.allergens || []).map(NORM);
    const ok = [...selectedAllergens].every(x => !al.includes(x));
    if (ok){
      const s = document.createElement('span');
      s.className = 'safe-pill';
      s.textContent = 'SAFE';
      labels.appendChild(s);
    }
  }

  const h = document.createElement('h3'); h.textContent = item.name;

  const p = document.createElement('p'); p.className = 'desc'; p.textContent = item.description || '';

  const badges = document.createElement('div'); badges.className = 'badges';
  (item.allergens || []).forEach(code => {
    const b = document.createElement('span'); b.className = 'badge';
    b.textContent = code;             // cards show code only
    b.title = LEGEND[code] || code;   // tooltip
    badges.appendChild(b);
  });

  a.append(labels, h, p, badges);
  return a;
}

// Filtering
function isSafe(item){
  const A = item.allergens || [];
  return !selectedAllergens.size || [...selectedAllergens].every(x => !A.includes(x));
}
function inCategory(item){ return !selectedCategory || item.category === selectedCategory; }

function renderGrid(){
  els.grid.innerHTML = '';
  const orderIndex = (c) => {
    const i = CATEGORY_ORDER.indexOf(c || '');
    return i === -1 ? 999 : i;
  };
  const items = data
    .filter(d => visible(d))
    .sort((a,b) => orderIndex(a.category) - orderIndex(b.category) || String(a.name).localeCompare(String(b.name)));
  items.forEach(d => els.grid.appendChild(card(d)));
  els.result.textContent = `${items.length} dishes`;
}

function updateMeta(){
  const parts = [];
  if (selectedAllergens.size) parts.push(`SAFE from: ${[...selectedAllergens].join(', ')}`);
  if (selectedCategory) parts.push(selectedCategory);
  els.active && (els.active.textContent = parts.length ? parts.join(' • ') : 'No filters active');
  // dock highlight
  if (els.filterToggle) els.filterToggle.dataset.active = selectedAllergens.size ? 'true' : 'false';
  if (els.categoryToggle) els.categoryToggle.dataset.active = selectedCategory ? 'true' : 'false';
}

function toggle(panelBtn, panelEl){
  const open = panelEl.classList.toggle('open');
  panelBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  // Close the other
  if (panelEl === els.filterPanel && els.categoryPanel){ els.categoryPanel.classList.remove('open'); els.categoryToggle && els.categoryToggle.setAttribute('aria-expanded','false'); }
  if (panelEl === els.categoryPanel && els.filterPanel){ els.filterPanel.classList.remove('open'); els.filterToggle && els.filterToggle.setAttribute('aria-expanded','false'); }
}

function clearAll(){
  selectedAllergens.clear();
  selectedCategory = null;
  // clear chip actives
  [...(els.chips?.children || [])].forEach(c => c.classList.remove('active'));
  [...(els.cat?.children || [])].forEach(c => c.classList.remove('active'));
  // spin icon briefly
  if (els.resetBtn){
    els.resetBtn.classList.add('spin');
    setTimeout(()=> els.resetBtn.classList.remove('spin'), 420);
  }
  refresh();
  // close panels
  els.filterPanel && els.filterPanel.classList.remove('open');
  els.categoryPanel && els.categoryPanel.classList.remove('open');
  els.filterToggle && els.filterToggle.setAttribute('aria-expanded','false');
  els.categoryToggle && els.categoryToggle.setAttribute('aria-expanded','false');
}

function refresh(){ renderGrid(); updateMeta(); updateResetState(); }

function updateResetState(){
  try{
    const active = (selectedAllergens && selectedAllergens.size>0) || !!selectedCategory;
    if (els && els.resetBtn){ els.resetBtn.classList.toggle('active', !!active); }
  }catch(e){ /* no-op */ }
}

// Theme toggle kept minimal
(function theme(){
  const btn = document.getElementById('themeToggle');
  if (!btn) return;
  if (localStorage.getItem('theme') === 'light'){ document.body.classList.add('light'); btn.textContent = '☀️'; }
  btn.addEventListener('click', () => {
    document.body.classList.toggle('light');
    const L = document.body.classList.contains('light');
    localStorage.setItem('theme', L ? 'light' : 'dark');
    btn.textContent = L ? '☀️' : '🌙';
  }, {passive:true});
})();

// Init
(async function(){
  data = normalizeData(await loadMenu());
  renderAllergenChips();
  renderCategoryChips();
  refresh();

  if (els.filterToggle && els.filterPanel) els.filterToggle.addEventListener('click', () => toggle(els.filterToggle, els.filterPanel), {passive:true});
  if (els.categoryToggle && els.categoryPanel) els.categoryToggle.addEventListener('click', () => toggle(els.categoryToggle, els.categoryPanel), {passive:true});
  if (els.resetBtn) els.resetBtn.addEventListener('click', clearAll, {passive:true});
})();
function sanitizeAllergen(x){ if(x==null) return ""; let s=String(x).trim(); s=s.replace(/^[\[\\"']+|[\]\\"']+$/g,""); s=s.replace(/[,]/g,"").trim(); return s; }

/*__CARD_CLICK_TO_MODAL__*/
document.addEventListener("DOMContentLoaded", () => {
  if(!document.getElementById("dishModal")){
    const m=document.createElement("div");
    m.id="dishModal"; m.className="modal hidden";
    m.innerHTML='<div class="modal-content"><button class="modal-close" aria-label="Close">×</button><div class="modal-head"><h2 id="modalTitle"></h2><span id="modalCat" class="pill-category"></span></div><p id="modalDesc"></p><div id="modalAllergens" class="badges"></div></div>';
    document.body.appendChild(m);
  }
  const grid=document.getElementById("grid")||document;
  grid.addEventListener("click",(e)=>{
    const card=e.target.closest&&e.target.closest(".card"); if(!card) return;
    const nameNode=card.querySelector&&card.querySelector("h1,h2,h3,.title");
    const name=nameNode?nameNode.textContent.trim():card.getAttribute("data-name")||"Dish";
    let dish=null;
    try{ if(typeof menuData!=="undefined" && Array.isArray(menuData)) dish=menuData.find(d=>d.name===name)||null; }catch{}
    if(!dish){ dish={ name, description:(card.querySelector(".desc,.description")||{}).textContent||card.getAttribute("data-desc")||"", category:(card.querySelector(".pill,.pill-category,.label")||{}).textContent||card.getAttribute("data-category")||"", allergens:Array.from(card.querySelectorAll(".badge,.chip,.tag,.allergen,.allergens span")).map(n=>sanitizeAllergen(n.textContent.split("•")[0])) }; }
    document.getElementById("modalTitle").textContent=dish.name;
    document.getElementById("modalDesc").textContent=dish.description||"No description available.";
    const cat=document.getElementById("modalCat"); if(dish.category){cat.textContent=dish.category; cat.style.display="inline-block";} else {cat.style.display="none";}
    const wrap=document.getElementById("modalAllergens"); wrap.innerHTML="";
    (dish.allergens||[]).forEach(code=>{ const chip=document.createElement("span"); chip.className="chip"; const cls=(allergenClassMap&&allergenClassMap[code])?allergenClassMap[code]:null; if(cls) chip.classList.add(cls); chip.textContent=code; wrap.appendChild(chip); });
    document.getElementById("dishModal").classList.remove("hidden");
  }, {passive:true});
  document.addEventListener("click",(e)=>{ if(e.target.matches(".modal-close") || e.target.id==="dishModal"){ document.getElementById("dishModal").classList.add("hidden"); } }, {passive:true});
});

/*__TINT_PRESETS_OBSERVER__*/
document.addEventListener("DOMContentLoaded", () => {
  function tint(){ const p=document.getElementById("chips"); if(!p) return;
    p.querySelectorAll(".chip").forEach(ch=>{ const raw=(ch.textContent||"").trim(); const code=sanitizeAllergen((raw.split(/\s+/)[0]||raw)); const cls=allergenClassMap[code]||allergenClassMap[(code||"").toUpperCase()]||null; if(cls) ch.classList.add(cls); });
  }
  tint(); const p=document.getElementById("chips"); if(p) new MutationObserver(tint).observe(p,{childList:true,subtree:true});
});


// ===== Add Dish: modal + JSON export =====
function getCurrentCategories(){
  const s=new Set(); (data||[]).forEach(d=>{ if(d.category) s.add(d.category); }); return Array.from(s);
}
function openAddDish(){
  const list=document.getElementById('categoryList');
  if(list){ list.innerHTML=''; const cs=getCurrentCategories().concat(EXTRA_CATEGORIES||[]);
    Array.from(new Set(cs)).forEach(c=>{ const o=document.createElement('option'); o.value=c; list.appendChild(o); });
  }
  const wrap=document.getElementById('allergenChecklist');
  if(wrap && !wrap.dataset.ready){
    Object.keys(LEGEND||{}).forEach(code=>{ const lab=document.createElement('label'); lab.innerHTML='<input type="checkbox" name="allergen" value="'+code+'"> <span>'+code+'</span>'; wrap.appendChild(lab); });
    wrap.dataset.ready='1';
  } else if (wrap){
    wrap.querySelectorAll('input[type=checkbox]').forEach(cb=>cb.checked=false);
  }
  ['dishName','dishCategory','dishDesc'].forEach(id=>{ const el=document.getElementById(id); if(el) el.value=''; });
  document.getElementById('addDishModal').classList.remove('hidden'); document.body.classList.add('no-scroll');
}
function closeAddDish(){ document.getElementById('addDishModal').classList.add('hidden'); document.body.classList.remove('no-scroll'); }
function saveDishToMemory(){
  const name=(document.getElementById('dishName')?.value||'').trim();
  const category=(document.getElementById('dishCategory')?.value||'').trim()||'Uncategorized';
  const description=(document.getElementById('dishDesc')?.value||'').trim();
  const allergens=Array.from(document.querySelectorAll('#allergenChecklist input[name=allergen]:checked')).map(x=>x.value);
  if(!name){ alert('Dish name is required.'); return; }
  data.push({ name, allergens, description, category });
  if (typeof renderCategoryChips==='function') renderCategoryChips();
  if (typeof refresh==='function') refresh();
  closeAddDish();
}
function ensurePendingDishCommitted(){
  const modal=document.getElementById('addDishModal'); if(!modal || modal.classList.contains('hidden')) return;
  const name=(document.getElementById('dishName')?.value||'').trim(); if(!name) return;
  const category=(document.getElementById('dishCategory')?.value||'').trim()||'Uncategorized';
  const description=(document.getElementById('dishDesc')?.value||'').trim();
  const allergens=Array.from(document.querySelectorAll('#allergenChecklist input[name=allergen]:checked')).map(x=>x.value);
  const exists=(data||[]).some(d=> (d.name||'').trim().toLowerCase()===name.toLowerCase() && (d.category||'')===category);
  if(!exists){ data.push({ name, allergens, description, category }); if (typeof renderCategoryChips==='function') renderCategoryChips(); if (typeof refresh==='function') refresh(); }
}
function downloadMenuJson(){
  ensurePendingDishCommitted();
  try{
    const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a'); a.href=url; a.download='menu.json'; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1500);
  }catch(e){ console.error(e); alert('Could not generate file.'); }
}
document.addEventListener('DOMContentLoaded', () => {
  const addBtn=document.getElementById('addDishBtn');
  const modal=document.getElementById('addDishModal');
  if(addBtn && modal){
    addBtn.addEventListener('click', openAddDish, {passive:true});
    document.getElementById('addDishClose').addEventListener('click', closeAddDish, {passive:true});
    modal.addEventListener('click', (e)=>{ if(e.target===modal) closeAddDish(); }, {passive:true});
    const saveBtn=document.getElementById('saveDishBtn'); if(saveBtn) saveBtn.addEventListener('click', saveDishToMemory, {passive:true});
    const dlBtn=document.getElementById('downloadJsonBtn'); if(dlBtn) dlBtn.addEventListener('click', downloadMenuJson, {passive:true});
  }
  document.addEventListener('keydown', (e)=>{ if(e.key==='Escape'){ const m=document.getElementById('addDishModal'); if(m && !m.classList.contains('hidden')) closeAddDish(); }}, {passive:true});
});


/* Decide visibility given current mode and selections */
function visible(d){
  // If no allergens are selected, just respect category filters
  if(!selectedAllergens || selectedAllergens.size===0){
    return inCategory(d);
  }
  // Safe when none of the selected allergens are present
  const hasAny = (d.allergens||[]).some(a => selectedAllergens.has(String(a).toUpperCase()));
  return showUnsafeOnly ? (hasAny && inCategory(d)) : (!hasAny && inCategory(d));
}


function ensureContainsPill(labels, item){
  const anySel = selectedAllergens && selectedAllergens.size > 0;
  const allergens = (item.allergens || []).map(a => String(a).toUpperCase());
  const has = anySel && allergens.some(a => selectedAllergens.has(a));
  let pill = labels.querySelector('.contains-pill');
  if (showUnsafeOnly && has){
    if(!pill){
      pill = document.createElement('span');
      pill.className = 'contains-pill';
      pill.textContent = 'Contains';
      labels.appendChild(pill);
    }
  } else if (pill){
    pill.remove();
  }
}


function initUnsafeDockToggle(){
  const t = document.getElementById('unsafeToggle');
  if(!t) return;
  t.setAttribute('aria-pressed', String(showUnsafeOnly));
  document.body.classList.toggle('show-unsafe-only', !!showUnsafeOnly);
  t.addEventListener('click', () => {
    showUnsafeOnly = !showUnsafeOnly;
    localStorage.setItem('show-unsafe-only', JSON.stringify(showUnsafeOnly));
    t.setAttribute('aria-pressed', String(showUnsafeOnly));
    document.body.classList.toggle('show-unsafe-only', !!showUnsafeOnly);
    refresh();
  }, {passive:true});
}

function ensureDockUnsafeToggle(){
  let t = document.getElementById('unsafeToggle');
  if (!t){
    const dockInner = document.querySelector('.dock-inner');
    if (dockInner){
      t = document.createElement('button');
      t.id = 'unsafeToggle';
      t.className = 'ios-toggle';
      t.type = 'button';
      t.title = 'Show dishes that CONTAIN selected allergen(s)';
      t.setAttribute('aria-pressed','false');
      const knob = document.createElement('span');
      knob.className = 'knob';
      t.appendChild(knob);
      dockInner.insertBefore(t, dockInner.firstChild);
    }
  }
  initUnsafeDockToggle();
}


function resetToSafeAndClearFilters(){
  try{
    if (typeof selectedAllergens !== 'undefined' && selectedAllergens.clear) selectedAllergens.clear();
    // clear any active state on chips
    const chipsRoot = document.querySelector('#chips, .chips');
    if (chipsRoot){
      chipsRoot.querySelectorAll('.chip').forEach(ch => {
        ch.classList.remove('active');
        ch.setAttribute && ch.setAttribute('aria-pressed','false');
      });
    }
    // force SAFE mode
    showUnsafeOnly = false;
    localStorage.setItem('show-unsafe-only', 'false');
    const t = document.getElementById('unsafeToggle');
    if (t) t.setAttribute('aria-pressed','false');
    document.body.classList.remove('show-unsafe-only');
    refresh();
  }catch(e){/*noop*/}
}

function initResetEnhance(){
  const btn = document.getElementById('resetBtn');
  if (!btn || btn.dataset.resetEnhanced==='1') return;
  btn.dataset.resetEnhanced='1';
  btn.addEventListener('click', () => { resetToSafeAndClearFilters(); }, {passive:true});
}


// === r5 Guest Mode & Dock polish (safe) ===
(function(){
  function $(s, r){ return (r||document).querySelector(s); }
  function on(el, ev, fn, opts){ if (el) el.addEventListener(ev, fn, opts||false); }

  var body = document.body;
  var guestBtn = $('#guestToggle');
  var grid = $('#grid') || document;
  var filterBtn = $('#filterToggle');
  var catBtn = $('#categoryToggle');
  var resetBtn = $('#resetBtn');
  var viewPicksBtn = $('#viewPicksBtn');

  var gxModal = $('#guestExitModal'), gxInput = $('#gxInput');
  var gxOK = $('#gxOK'), gxCancel = $('#gxCancel'), gxCancel2 = $('#gxCancel2');

  function isGuest(){ try{ return localStorage.getItem('guestMode')==='1'; }catch(e){ return false; } }
  function setGuest(on){
    try{ on ? localStorage.setItem('guestMode','1') : localStorage.removeItem('guestMode'); }catch(e){}
    if (on) body.classList.add('guest'); else body.classList.remove('guest');
    if (guestBtn){ if (on){ guestBtn.classList.add('active'); guestBtn.setAttribute('aria-pressed','true'); } else { guestBtn.classList.remove('active'); guestBtn.setAttribute('aria-pressed','false'); } }
    if (on) attachGuestHandlers(); else detachGuestHandlers();
  }

  // init
  setGuest(isGuest());

  // Toggle guest (leaving needs PIN)
  on(guestBtn, 'click', function(e){
    if (!isGuest()){ setGuest(true); return; }
    if (gxModal){ gxModal.classList.remove('hidden'); setTimeout(function(){ gxInput && gxInput.focus(); }, 0); }
    e.preventDefault(); e.stopPropagation();
  });

  function expectedPIN(){ 
    var v = (localStorage.getItem('staffPIN') || '0000'); 
    return (v||'').replace(/\s+/g,'');
  }
  function tryExitGuest(){
    var given = (gxInput && gxInput.value || '').replace(/\s+/g,'');
    if (given === expectedPIN()){ setGuest(false); gxModal && gxModal.classList.add('hidden'); }
    else {
      if (gxInput){ gxInput.value=''; gxInput.style.outline='2px solid #ff6b6b'; setTimeout(function(){ gxInput.style.outline=''; }, 220); gxInput.focus(); }
    }
  }
  on(gxOK, 'click', tryExitGuest);
  on(gxCancel, 'click', function(){ gxModal && gxModal.classList.add('hidden'); });
  on(gxCancel2, 'click', function(){ gxModal && gxModal.classList.add('hidden'); });
  on(gxInput, 'keydown', function(e){ if (e.key==='Enter'){ tryExitGuest(); } });

  // Guest picks (session-scoped)
  function getPicks(){ try{ return JSON.parse(sessionStorage.getItem('guestPicks')||'[]'); }catch(e){ return []; } }
  function setPicks(arr){ try{ sessionStorage.setItem('guestPicks', JSON.stringify(arr)); }catch(e){} }

  function dishNameFromCard(card){
    var h = card.querySelector('h3') || card.querySelector('[data-title]');
    return h ? (h.textContent||'').trim() : '';
  }

  function guestClickHandler(e){
    if (!isGuest()) return;
    var card = e.target && e.target.closest ? e.target.closest('.card') : null;
    if (!card) return;
    e.preventDefault(); e.stopPropagation(); // block staff modal
    var name = dishNameFromCard(card);
    if (!name) return;
    var picks = getPicks();
    var i = picks.indexOf(name);
    if (i>=0){ picks.splice(i,1); card.classList.remove('guest-picked'); }
    else { picks.push(name); card.classList.add('guest-picked'); }
    setPicks(picks);
  }

  function attachGuestHandlers(){
    if (!grid) return;
    grid.addEventListener('click', guestClickHandler, true);
    // restore outlines
    var picks = getPicks();
    var cards = document.querySelectorAll('.card');
    for (var k=0;k<cards.length;k++){
      var c = cards[k];
      var nm = dishNameFromCard(c);
      if (picks.indexOf(nm)>=0) c.classList.add('guest-picked');
    }
  }
  function detachGuestHandlers(){
    if (!grid) return;
    grid.removeEventListener('click', guestClickHandler, true);
  }

  // Reset clears guest picks
  on(resetBtn, 'click', function(){
    try{ sessionStorage.removeItem('guestPicks'); }catch(e){}
    var sel = document.querySelectorAll('.card.guest-picked');
    for (var i=0;i<sel.length;i++){ sel[i].classList.remove('guest-picked'); }
  });

  // Staff: view picks summary
  on(viewPicksBtn, 'click', function(){
    if (isGuest()) return;
    var picks = getPicks();
    if (!picks.length){ alert('No guest selections yet.'); return; }
    var lines = [];
    for (var p=0;p<picks.length;p++){
      var name = picks[p];
      var card;
      var cards = document.querySelectorAll('.card');
      for (var k=0;k<cards.length;k++){
        var t = dishNameFromCard(cards[k]);
        if (t===name){ card = cards[k]; break; }
      }
      if (!card){ lines.push('• '+name); continue; }
      var cat = (card.querySelector('[data-cat]') && card.querySelector('[data-cat]').getAttribute('data-cat')) || (card.querySelector('.pill') && card.querySelector('.pill').textContent.trim()) || 'Unknown';
      var chips = card.querySelectorAll('.badge, .chip, [data-allergen]');
      var codes = [];
      for (var c=0;c<chips.length;c++){ var txt = (chips[c].textContent||'').trim(); if (txt) codes.push(txt); }
      lines.push('• '+name+'\\n   Category: '+cat+'\\n   Allergens: '+(codes.join(', ')||'—'));
    }
    alert('Guest selections:\\n\\n'+lines.join('\\n\\n'));
  });

  // Keep frosted state synced if your code toggles aria-expanded
  function sync(btn){ if (!btn) return; btn.setAttribute('data-active', btn.getAttribute('aria-expanded')==='true'); }
  on(filterBtn, 'click', function(){ setTimeout(function(){ sync(filterBtn); },0); }, true);
  on(catBtn, 'click', function(){ setTimeout(function(){ sync(catBtn); },0); }, true);
  sync(filterBtn); sync(catBtn);
})();



// r8: Guest counter (numeric), green glow, single-modal, robust picks source
(function(){
  function $(s, r){ return (r||document).querySelector(s); }
  function on(el, ev, fn, opts){ if (el) el.addEventListener(ev, fn, opts||false); }
  function isGuest(){ try{ return localStorage.getItem('guestMode')==='1'; }catch(e){ return false; } }
  function setGuest(on){
    try{ on ? localStorage.setItem('guestMode','1') : localStorage.removeItem('guestMode'); }catch(e){}
    guestMode = !!on;
    if (guestBtn){ guestBtn.classList.toggle('guest-on', guestMode); guestBtn.setAttribute('aria-pressed', guestMode?'true':'false'); }
  }
  function norm(s){ return (s||'').replace(/\s+/g,' ').trim(); }

  var guestBtn = $('#guestToggle');
  var viewBtn = $('#viewPicksBtn');
  var resetBtn = $('#resetBtn');
  var grid = $('#grid') || document;

  var guestMode = isGuest();
  if (guestBtn){ guestBtn.classList.toggle('guest-on', guestMode); guestBtn.setAttribute('aria-pressed', guestMode?'true':'false'); }

  // ---- Picks: sessionStorage + DOM fallback ----
  function getPicks(){ try{ return JSON.parse(sessionStorage.getItem('guestPicks')||'[]'); }catch(e){ return []; } }
  function setPicks(arr){ try{ sessionStorage.setItem('guestPicks', JSON.stringify(arr)); }catch(e){} }
  function getPicksRobust(){
    var arr = getPicks();
    if (arr.length) return arr;
    // fallback: read from DOM outlines
    var names = [];
    var cards = document.querySelectorAll('.card.guest-picked');
    for (var i=0;i<cards.length;i++){
      var t = cards[i].querySelector('h3') || cards[i].querySelector('[data-title]');
      var key = t ? norm(t.textContent) : (cards[i].dataset.id||'');
      if (key) names.push(key);
    }
    return names;
  }

  // ---- Counter (pure number badge) ----
  function updateCount(bump){
    if (!viewBtn) return;
    var n = getPicksRobust().length;
    viewBtn.setAttribute('data-count', String(n));
    if (bump){ viewBtn.classList.remove('bump'); void viewBtn.offsetWidth; viewBtn.classList.add('bump'); setTimeout(function(){ viewBtn.classList.remove('bump'); }, 180); }
  }
  updateCount(false);

  // ---- Guest toggle (PIN only when leaving guest) ----
  on(guestBtn, 'click', function(){
    if (!guestMode){ setGuest(true); return; }
    var pin = prompt('Enter staff PIN to exit guest mode:');
    if (pin === '0000'){ setGuest(false); } else if (pin !== null) { alert('Incorrect PIN'); }
  });

  // ---- Intercept card clicks in guest mode only ----
  on(grid, 'click', function(e){
    if (!guestMode) return;
    var card = e.target && e.target.closest ? e.target.closest('.card') : null;
    if (!card) return;
    e.preventDefault(); e.stopPropagation();
    var t = card.querySelector('h3') || card.querySelector('[data-title]');
    var key = t ? norm(t.textContent) : (card.dataset.id||'');
    if (!key) return;
    var arr = getPicks();
    var i = arr.indexOf(key);
    if (i>=0){ arr.splice(i,1); card.classList.remove('guest-picked'); }
    else { arr.push(key); card.classList.add('guest-picked'); }
    setPicks(arr); updateCount(true);
  }, true);

  // ---- Restore outlines on load if guest ----
  if (guestMode){
    var arr = getPicks();
    var cards = document.querySelectorAll('.card');
    for (var i=0;i<cards.length;i++){
      var t = cards[i].querySelector('h3') || cards[i].querySelector('[data-title]');
      var key = t ? norm(t.textContent) : (cards[i].dataset.id||'');
      if (arr.indexOf(key)>=0) cards[i].classList.add('guest-picked');
    }
  }

  // ---- Reset clears guest picks and counter ----
  on(resetBtn, 'click', function(){
    try{ sessionStorage.removeItem('guestPicks'); }catch(e){}
    var sel = document.querySelectorAll('.card.guest-picked');
    for (var i=0;i<sel.length;i++){ sel[i].classList.remove('guest-picked'); }
    updateCount(false);
  });

  // ---- View Picks modal (single source of truth; not the PIN modal) ----
  var gpModal = $('#guestPicksModal');
  var gpBody  = $('#guestPicksBody');
  var gpClose = $('#guestPicksClose');
  var gpShowOnly = $('#showOnlyGuest');
  var gpCopy = $('#copyGuest');
  var gpClear = $('#clearGuest');

  function openGuestPicks(){
    if (guestMode) return; // guests can't open staff view
    if (!gpModal) return;
    var picks = getPicksRobust();
    gpBody.innerHTML = '';
    if (!picks.length){
      gpBody.innerHTML = '<div class="picks-empty">No guest selections yet.</div>';
    } else {
      var cards = document.querySelectorAll('.card');
      for (var p=0;p<picks.length;p++){
        var name = picks[p], card=null;
        for (var i=0;i<cards.length;i++){
          var t = cards[i].querySelector('h3') || cards[i].querySelector('[data-title]');
          if (t && norm(t.textContent)===name){ card = cards[i]; break; }
        }
        var cat = (card && card.querySelector('[data-cat]') && card.querySelector('[data-cat]').getAttribute('data-cat')) ||
                  (card && card.querySelector('.pill') && card.querySelector('.pill').textContent.trim()) || '—';
        var chips = card ? card.querySelectorAll('.badge, .chip, [data-allergen]') : [];
        var codes = []; for (var k=0;k<chips.length;k++){ var txt=(chips[k].textContent||'').trim(); if (txt) codes.push(txt); }
        var row = document.createElement('div'); row.className='picks-row';
        row.innerHTML = '<div><div class="title">'+name+'</div><div class="meta">Category: '+cat+'</div></div>' +
                        '<div class="meta">'+ (codes.length? codes.map(function(c){return '<span class="chip">'+c+'</span>';}).join(' ') : '<span class="meta">No allergens</span>') +'</div>';
        gpBody.appendChild(row);
      }
    }
    gpModal.classList.remove('hidden');
  }

  on(viewBtn, 'click', function(e){ e.preventDefault(); e.stopPropagation(); openGuestPicks(); }, true);
  on(gpClose, 'click', function(){ gpModal.classList.add('hidden'); });
  on(gpModal, 'click', function(e){ if (e.target === gpModal) gpModal.classList.add('hidden'); });

  on(gpShowOnly, 'click', function(){
    var picks = new Set(getPicksRobust());
    var cards = document.querySelectorAll('.card');
    for (var i=0;i<cards.length;i++){
      var t = cards[i].querySelector('h3') || cards[i].querySelector('[data-title]');
      var nm = t ? norm(t.textContent) : (cards[i].dataset.id||'');
      cards[i].style.display = picks.has(nm) ? '' : 'none';
    }
  });
  on(gpCopy, 'click', function(){
    var picks = getPicksRobust(); if (!picks.length) return;
    var lines = [];
    var cards = document.querySelectorAll('.card');
    for (var p=0;p<picks.length;p++){
      var name = picks[p], card=null;
      for (var i=0;i<cards.length;i++){
        var t = cards[i].querySelector('h3') || cards[i].querySelector('[data-title]');
        if (t && norm(t.textContent)===name){ card = cards[i]; break; }
      }
      var cat = (card && card.querySelector('[data-cat]') && card.querySelector('[data-cat]').getAttribute('data-cat')) ||
                (card && card.querySelector('.pill') && card.querySelector('.pill').textContent.trim()) || '—';
      var chips = card ? card.querySelectorAll('.badge, .chip, [data-allergen]') : [];
      var codes = []; for (var k=0;k<chips.length;k++){ var txt=(chips[k].textContent||'').trim(); if (txt) codes.push(txt); }
      lines.push(name+' | '+cat+' | '+(codes.join(', ')||'—'));
    }
    var txt = lines.join('\\n');
    if (navigator.clipboard && navigator.clipboard.writeText){ navigator.clipboard.writeText(txt); }
  });
  on(gpClear, 'click', function(){
    try{ sessionStorage.removeItem('guestPicks'); }catch(e){};
    var sel = document.querySelectorAll('.card.guest-picked');
    for (var i=0;i<sel.length;i++){ sel[i].classList.remove('guest-picked'); }
    updateCount(false); gpModal.classList.add('hidden');
  });
})();


// r12b: harden Guest toggle + Picks button wiring
(function () {
  function $(s, r) { return (r || document).querySelector(s); }
  function on(el, ev, fn, opts) { if (el) el.addEventListener(ev, fn, opts || false); }
  function isGuest() { try { return localStorage.getItem('guestMode') === '1'; } catch (e) { return false; } }
  function setGuest(on) {
    try { on ? localStorage.setItem('guestMode', '1') : localStorage.removeItem('guestMode'); } catch (e) {}
    document.body.classList.toggle('guest', !!on);
    var btn = $('#guestToggle');
    if (btn) {
      btn.classList.toggle('guest-on', !!on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    }
    console.log('[guest] mode =', !!on);
  }
  setGuest(isGuest());

  var guestBtn = $('#guestToggle');
  on(guestBtn, 'click', function (e) {
    console.log('[guestToggle] click');
    if (!isGuest()) {
      e.preventDefault(); e.stopPropagation();
      setGuest(true);
    }
  }, true);

  var viewBtn = $('#viewPicksBtn');
  var gpModal = $('#guestPicksModal');
  var gpBody  = $('#guestPicksBody');
  var gpClose = $('#guestPicksClose');

  function norm(s){ return (s || '').replace(/\s+/g, ' ').trim(); }
  function getPicks(){ try { return JSON.parse(sessionStorage.getItem('guestPicks') || '[]'); } catch (e) { return []; } }

  function renderPicks(readOnly) {
    if (!gpBody) return;
    var picks = getPicks();
    gpBody.innerHTML = '';
    if (!picks.length) {
      gpBody.innerHTML = '<div class="picks-empty">No guest selections yet.</div>';
      return;
    }
    var cards = document.querySelectorAll('.card');
    picks.forEach(function(name){
      var card = Array.from(cards).find(function(c){
        var t = c.querySelector('h3') || c.querySelector('[data-title]');
        return t && norm(t.textContent) === name;
      });
      var cat = (card && card.querySelector('[data-cat]') && card.querySelector('[data-cat]').getAttribute('data-cat')) ||
                (card && card.querySelector('.pill') && norm(card.querySelector('.pill').textContent)) || '—';
      var chips = card ? card.querySelectorAll('.badge, .chip, [data-allergen]') : [];
      var codes = []; chips.forEach(function(ch){ var txt = norm(ch.textContent); if (txt) codes.push(txt); });
      var row = document.createElement('div'); row.className = 'picks-row';
      row.innerHTML = '<div><div class="title">'+name+'</div><div class="meta">Category: '+cat+'</div></div>' +
                      '<div class="meta">'+(codes.length ? codes.map(function(c){return '<span class="chip">'+c+'</span>';}).join(' ') : '<span class="meta">No allergens</span>')+'</div>';
      gpBody.appendChild(row);
    });

    if (readOnly) {
      ['showOnlyGuest','copyGuest','clearGuest'].forEach(function(id){
        var el = document.getElementById(id);
        if (el) { el.disabled = true; el.classList.add('disabled'); }
      });
    }
  }

  on(viewBtn, 'click', function (e) {
    console.log('[viewPicksBtn] click');
    e.preventDefault(); e.stopPropagation();
    if (!gpModal) {
      console.warn('Guest Picks modal markup missing (#guestPicksModal)');
      return;
    }
    var readOnly = isGuest();
    renderPicks(readOnly);
    gpModal.classList.remove('hidden');
  }, true);

  on(gpClose, 'click', function(){ if (gpModal) gpModal.classList.add('hidden'); });
  on(gpModal, 'click', function(e){ if (e.target === gpModal) gpModal.classList.add('hidden'); });

  var countEl = document.getElementById('guestPicksCount');
  function syncCount() { if (countEl) countEl.textContent = String(getPicks().length); }
  syncCount();
  document.addEventListener('menu:rendered', syncCount);
  window.addEventListener('storage', function(e){ if (e.key === 'guestPicks') syncCount(); });
})();
