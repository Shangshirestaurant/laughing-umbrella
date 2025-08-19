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
  const res = await fetch('data/menu.json', { cache: 'no-store' });
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
  // sync chip UI
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

function isAllowed(dish){
  if(state.avoid.size === 0) return true;
  // Hide if dish contains ANY avoided allergen
  return !dish.allergens.some(code => state.avoid.has(code));
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
    // fallback sample if missing
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
  els.search.addEventListener('input', e => { state.search = e.target.value.trim(); render(); });
  els.presets.addEventListener('change', e => { if(e.target.value) applyPreset(e.target.value); });
  els.clear.addEventListener('click', () => {
    state.avoid.clear();
    document.querySelectorAll('.chip').forEach(ch => { ch.dataset.active='false'; ch.setAttribute('aria-checked','false'); });
    els.presets.value = '';
    els.search.value = '';
    state.search = '';
    render();
  });
}

document.addEventListener('DOMContentLoaded', init);
