/* Allergen selector app (vanilla JS) */

const ALLERGENS = [
  { code: 'GL', name: 'Gluten' },
  { code: 'NU', name: 'Nuts' },
  { code: 'PE', name: 'Peanuts' },
  { code: 'SE', name: 'Sesame' },
  { code: 'SO', name: 'Soy' },
  { code: 'EG', name: 'Eggs' },
  { code: 'Mi', name: 'Milk' },
  { code: 'Fl', name: 'Fish' },
  { code: 'CR', name: 'Crustaceans' },
  { code: 'MO', name: 'Molluscs' },
  { code: 'LU', name: 'Lupin' },
  { code: 'SU', name: 'Sulfites' },
  { code: 'CE', name: 'Celery' },
  { code: 'MU', name: 'Mustard' },
  { code: 'GA', name: 'Garlic' },
  { code: 'ON', name: 'Onion' },
  { code: 'MR', name: 'Mushrooms' },
  { code: 'Cl', name: 'Awaiting' }
];

const PRESETS = {
  GLUTEN_FREE: ['GL'],
  NUT_FREE: ['NU','PE'],
  SHELLFISH_FREE: ['CR','MO'],
  MUSHROOM_FREE: ['MR'],
  DAIRY_FREE: ['Mi'],
  EGG_FREE: ['EG'],
  SOY_FREE: ['SO'],
  SESAME_FREE: ['SE']
};

const state = { mode: 'SAFE', selected: new Set(JSON.parse(localStorage.getItem('allergy.selected')||'[]')) };

const els = {
  chips: document.getElementById('allergenChips'),
  grid: document.getElementById('dishGrid'),
  cardTmpl: document.getElementById('dishCardTmpl'),
  search: document.getElementById('search'),
  presets: document.getElementById('presets'),
  clear: document.getElementById('clearFilters')
};

async function loadMenu(){
  const res = await fetch('menu.json', { cache: 'no-store' });
  if(!res.ok) throw new Error('Failed to load menu.json');
  return res.json();
}

function makeChip({code, name}){
  const el = document.createElement('button');
  el.className = 'chip';
  el.setAttribute('role', 'switch');
  el.setAttribute('aria-checked', 'false');
  el.dataset.code = code;
  el.textContent = name;
  el.addEventListener('click', () => toggleAvoid(code, el));
  return el;
}

function toggleAvoid(code, el){
  if(state.avoid.has(code)){
    state.avoid.delete(code);
    el.dataset.active = 'false';
    el.setAttribute('aria-checked','false');
  } else {
    state.avoid.add(code);
    el.dataset.active = 'true';
    el.setAttribute('aria-checked','true');
  }
  render();
}

function applyPreset(key){
  state.avoid = new Set(PRESETS[key] || []);
  document.querySelectorAll('.chip').forEach(ch => {
    const code = ch.dataset.code;
    const on = state.avoid.has(code);
    ch.dataset.active = on ? 'true' : 'false';
    ch.setAttribute('aria-checked', on ? 'true':'false');
  });
  render();
}

function matchesSearch(dish){
  if(!state.search) return true;
  const q = state.search.toLowerCase();
  return (dish.name.toLowerCase().includes(q) ||
          (dish.description||'').toLowerCase().includes(q));
}

// Mode-aware filter
function isAllowed(dish){
  if(state.avoid.size === 0) return true;
  if(state.mode === 'SAFE'){
    return !dish.allergens.some(code => state.avoid.has(code));
  } else {
    return dish.allergens.some(code => state.avoid.has(code));
  }
}

function renderDish(dish){
  const node = els.cardTmpl.content.firstElementChild.cloneNode(true);
  node.querySelector('.card-title').textContent = dish.name;
  node.querySelector('.card-desc').textContent = dish.description || '';
  node.querySelector('.price').textContent = dish.price ? `€${dish.price.toFixed(2)}` : '';
  const badges = node.querySelector('.badges');
  dish.allergens.forEach(code=>{
    const a = ALLERGENS.find(a=>a.code===code);
    const b = document.createElement('span');
    b.className = 'badge';
    b.textContent = a ? a.name : code;
    badges.appendChild(b);
  });
  return node;
}

let MENU = [];

function render(){
  els.grid.innerHTML = '';
  const filtered = MENU.filter(d => isAllowed(d) && matchesSearch(d));
  if(filtered.length === 0){
    const empty = document.createElement('p');
    empty.style.color = 'var(--muted)';
    empty.textContent = 'No dishes match the selected filters.';
    els.grid.appendChild(empty);
    return;
  }
  filtered.forEach(d => els.grid.appendChild(renderDish(d)));
}

async function init(){
  // Build chips
  ALLERGENS.forEach(a => els.chips.appendChild(makeChip(a)));

  // Load menu
  try {
    MENU = await loadMenu();
  } catch(e){
    console.warn(e);
    MENU = [
      { name:'Prawn Har Gow', price:9.50, allergens:['CR','GL','SO'], description:'Transparent prawn dumplings with bamboo shoots.'},
      { name:'Char Siu Pork', price:18.00, allergens:['GL','SO'], description:'Honey-glazed roasted pork with five-spice.'},
      { name:'Steamed Grouper', price:26.00, allergens:['Fl','SO'], description:'Ginger-scallion sauce, light soy.'},
      { name:'Mapo Tofu', price:16.00, allergens:['SO'], description:'Silken tofu, Szechuan pepper, chili oil.'},
      { name:'Seasonal Greens', price:8.50, allergens:[], description:'Stir-fried with garlic.'},
      { name:'Egg Tart', price:7.00, allergens:['EG','Mi','GL'], description:'Buttery crust, silky custard.'},
      { name:'Shiitake & Truffle Dumpling', price:11.00, allergens:['MR','GL','SO'], description:'Forest mushroom medley.'}
    ];
  }

  render();

  // Wire up controls
          document.querySelectorAll('.chip').forEach(ch => { ch.dataset.active='false'; ch.setAttribute('aria-checked','false'); });
    els.presets.value = '';
    els.search.value = '';
    state.search = '';
    render();
  });

  // Mode tabs
  const safe = document.getElementById('modeSafe');
  const contains = document.getElementById('modeContains');
  if(safe && contains){
    [safe, contains].forEach(btn => btn.addEventListener('click', () => {
      state.mode = btn.dataset.mode;
      safe.classList.toggle('active', state.mode==='SAFE');
      contains.classList.toggle('active', state.mode==='CONTAINS');
      render();
    }));
  }

  // Back to top
  const toTop = document.getElementById('toTop');
  if(toTop){
    toTop.addEventListener('click', () => window.scrollTo({top:0, behavior:'smooth'}));
  }
}

document.addEventListener('DOMContentLoaded', init);


// Header behavior: transparent at top -> glass on scroll
document.addEventListener('scroll', () => {
  const header = document.querySelector('.glass-header');
  if(!header) return;
  if(window.scrollY > 40){ header.classList.add('scrolled'); }
  else { header.classList.remove('scrolled'); }
}, { passive: true });

// Preset icon toggles select popover
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('presetToggle');
  const pop = document.getElementById('presetPopover');
  if(toggle && pop){
    toggle.addEventListener('click', (e)=>{
      const open = pop.hasAttribute('hidden') ? false : true;
      if(open){ pop.setAttribute('hidden',''); toggle.setAttribute('aria-expanded','false'); }
      else { pop.removeAttribute('hidden'); toggle.setAttribute('aria-expanded','true'); document.getElementById('presets').focus(); }
    });
    document.addEventListener('click',(e)=>{
      if(pop && !pop.hasAttribute('hidden')){
        const within = pop.contains(e.target) || toggle.contains(e.target);
        if(!within){ pop.setAttribute('hidden',''); toggle.setAttribute('aria-expanded','false'); }
      }
    });
  }
});


// === Chips overflow arrows ===
(function(){
  const bar = document.getElementById('selector');
  const row = document.getElementById('allergenChips');
  if(!bar || !row) return;
  const prev = document.getElementById('chipsPrev');
  const next = document.getElementById('chipsNext');

  function updateArrows(){
    const canScroll = row.scrollWidth > row.clientWidth + 2;
    if(!canScroll){ prev && (prev.hidden = true); next && (next.hidden = true); return; }
    prev && (prev.hidden = row.scrollLeft <= 2);
    const atEnd = Math.ceil(row.scrollLeft + row.clientWidth) >= row.scrollWidth - 2;
    next && (next.hidden = atEnd);
  }

  function scrollByAmount(dir){
    const amount = Math.round(row.clientWidth * 0.7);
    row.scrollBy({ left: dir * amount, behavior: 'smooth' });
  }

  prev && prev.addEventListener('click', ()=> scrollByAmount(-1));
  next && next.addEventListener('click', ()=> scrollByAmount(+1));
  row.addEventListener('scroll', updateArrows, {passive:true});
  window.addEventListener('resize', updateArrows);
  // Delay once to allow layout settle
  setTimeout(updateArrows, 0);
})();


const els = Object.assign({}, (typeof els==='object'? els:{}), {
  grid: document.getElementById('dishGrid'),
  cardTmpl: document.getElementById('dishCardTmpl'),
  allergyBtn: document.getElementById('allergyBtn'),
  allergyModal: document.getElementById('allergyModal'),
  allergyForm: document.getElementById('allergyForm'),
  allergyClose: document.getElementById('allergyClose'),
  allergyClear: document.getElementById('allergyClear'),
  allergyApply: document.getElementById('allergyApply'),
});

function openModal(){ if(!els.allergyModal) return; els.allergyModal.hidden = false; els.allergyBtn?.setAttribute('aria-expanded','true'); }
function closeModal(){ if(!els.allergyModal) return; els.allergyModal.hidden = true; els.allergyBtn?.setAttribute('aria-expanded','false'); }

function buildAllergyForm(){
  if(!els.allergyForm) return;
  els.allergyForm.innerHTML='';
  ALLERGENS.forEach(a => {
    const id = 'a_' + a.code;
    const lab = document.createElement('label');
    const cb = document.createElement('input');
    cb.type = 'checkbox'; cb.id = id; cb.value = a.code;
    cb.checked = state.selected.has(a.code);
    const span = document.createElement('span');
    span.textContent = `${a.code} — ${a.name}`;
    lab.append(cb, span);
    els.allergyForm.appendChild(lab);
  });
}

function applySelection(){
  if(els.allergyForm){
    const codes = Array.from(els.allergyForm.querySelectorAll('input[type="checkbox"]:checked')).map(i => i.value);
    state.selected = new Set(codes);
    localStorage.setItem('allergy.selected', JSON.stringify(codes));
  }
  render();
  closeModal();
}

function clearSelection(){
  state.selected.clear();
  localStorage.setItem('allergy.selected','[]');
  if(els.allergyForm){
    els.allergyForm.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
  }
  render();
}

function isDishSafe(dish){
  const dAll = Array.isArray(dish.allergens) ? dish.allergens : [];
  if(!state.selected || state.selected.size === 0) return true;
  return !dAll.some(c => state.selected.has(c));
}

function render(){
  if(!els.grid) return;
  els.grid.innerHTML = '';
  const data = Array.isArray(MENU)? MENU : [];
  const filtered = data.filter(isDishSafe);
  if(!filtered.length){
    const p = document.createElement('p'); p.className='empty'; p.textContent='No dishes match your allergy selection.'; els.grid.appendChild(p); return;
  }
  filtered.forEach(d => {
    const node = els.cardTmpl?.content?.firstElementChild?.cloneNode(true) || document.createElement('article');
    node.classList.add('card');
    const title = node.querySelector('.card-title') || node.appendChild(document.createElement('h3'));
    title.className='card-title'; title.textContent = d.name;
    const desc = node.querySelector('.card-desc') || node.appendChild(document.createElement('p'));
    desc.className='card-desc'; desc.textContent = d.description || '';
    let badges = node.querySelector('.badges'); if(!badges){ badges = document.createElement('div'); badges.className='badges'; node.appendChild(badges); }
    badges.innerHTML='';
    (d.allergens||[]).forEach(code => { const s=document.createElement('span'); s.className='badge'; s.textContent=code; s.title=ALLERGENS_MAP[code]||code; badges.appendChild(s); });
    const safe = isDishSafe(d);
    if(safe){
      const mark = document.createElement('div'); mark.className='safe-mark'; mark.title = (d.allergens||[]).length? 'Safe for your selected allergens' : 'No listed allergens'; mark.textContent='✓'; node.appendChild(mark);
    }
    els.grid.appendChild(node);
  });
}

function initAllergyUI(){
  buildAllergyForm();
  els.allergyBtn?.addEventListener('click', openModal);
  els.allergyClose?.addEventListener('click', closeModal);
  els.allergyApply?.addEventListener('click', applySelection);
  els.allergyClear?.addEventListener('click', clearSelection);
  els.allergyModal?.addEventListener('click', (e)=>{ if(e.target === els.allergyModal) closeModal(); });
  render();
}

document.addEventListener('DOMContentLoaded', initAllergyUI);
