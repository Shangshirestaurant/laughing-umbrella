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

const state = {
  mode: 'SAFE',
  avoid: new Set(),
  search: ''
};

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
