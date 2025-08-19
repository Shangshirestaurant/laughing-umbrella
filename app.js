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

const MENU = [
  {
    "name": "Amuse Bouche",
    "allergens": [
      "SE"
    ],
    "description": "with spicy sauce"
  },
  {
    "name": "Aromatic Crispy Duck Salad",
    "allergens": [
      "GL"
    ],
    "description": ""
  },
  {
    "name": "Baked venison puff",
    "allergens": [
      "SE"
    ],
    "description": ""
  },
  {
    "name": "Black Truffle Vegetable Spring Roll",
    "allergens": [
      "GL",
      "MR"
    ],
    "description": "v"
  },
  {
    "name": "Braised Fish Maw with Japanese Shitake Mushroom in Superior Oyster Sauce",
    "allergens": [
      "CR",
      "GL",
      "MR",
      "SO"
    ],
    "description": ""
  },
  {
    "name": "Braised Pork Belly",
    "allergens": [
      "GL",
      "SO"
    ],
    "description": ""
  },
  {
    "name": "Braised South African Kippin Abalone in Superior Oyster Sauce",
    "allergens": [
      "CR",
      "GL",
      "MR",
      "SO"
    ],
    "description": ""
  },
  {
    "name": "Chopped pepper lamb dumpling",
    "allergens": [
      "CR"
    ],
    "description": "pink"
  },
  {
    "name": "Claypot Silken Egg Tofu with Vegetables",
    "allergens": [
      "EG",
      "MR",
      "ON",
      "SO"
    ],
    "description": "V"
  },
  {
    "name": "Crispy Aromatic Duck Salad",
    "allergens": [
      "NU",
      "ON",
      "SO"
    ],
    "description": ""
  },
  {
    "name": "Crispy Duck Salad",
    "allergens": [
      "GL"
    ],
    "description": ""
  },
  {
    "name": "Crispy Pork Belly",
    "allergens": [
      "MU"
    ],
    "description": "On the side"
  },
  {
    "name": "Deep Fried Dim Sum Assortment",
    "allergens": [
      "GL"
    ],
    "description": ""
  },
  {
    "name": "Deep Fried King Scallop with Minced Prawns in Teriyaki Sauce",
    "allergens": [
      "CR",
      "EG",
      "GA",
      "GL",
      "ON",
      "SO"
    ],
    "description": ""
  },
  {
    "name": "Duck Soup",
    "allergens": [
      "GL",
      "MR",
      "SE",
      "SO"
    ],
    "description": ""
  },
  {
    "name": "Five Spice Crispy Corn Fed Chicken Parcel with Thai Basil",
    "allergens": [
      "GA"
    ],
    "description": ""
  },
  {
    "name": "Golden Egg Fried Rice",
    "allergens": [
      "EG"
    ],
    "description": ""
  },
  {
    "name": "Golden Fried Soft Shell Crab with Chilli",
    "allergens": [
      "EG",
      "GL"
    ],
    "description": ""
  },
  {
    "name": "Grilled Chilean Sea Bass in Honey",
    "allergens": [
      "GL",
      "SO"
    ],
    "description": ""
  },
  {
    "name": "Ham&Cheese Sandwich",
    "allergens": [
      "MI"
    ],
    "description": "Canapé"
  },
  {
    "name": "Home-made Salt and Pepper Crispy Tofu",
    "allergens": [
      "GA",
      "GL"
    ],
    "description": "v"
  },
  {
    "name": "Hot and Sour Soup with Seafood",
    "allergens": [
      "CR",
      "MR",
      "MU"
    ],
    "description": ""
  },
  {
    "name": "Kung Pao Prawn with Cashew",
    "allergens": [
      "CR",
      "GL",
      "NU",
      "ON",
      "SO"
    ],
    "description": ""
  },
  {
    "name": "Legendary Peking Duck",
    "allergens": [
      "GL"
    ],
    "description": ""
  },
  {
    "name": "Legendary Peking Duck 3rd Course",
    "allergens": [
      "NU"
    ],
    "description": ""
  },
  {
    "name": "Lobster with Ginger and Spring Onion",
    "allergens": [
      "CR",
      "ON"
    ],
    "description": ""
  },
  {
    "name": "Mapo Tofu",
    "allergens": [
      "MR",
      "MU",
      "ON"
    ],
    "description": "with Minced Beef"
  },
  {
    "name": "Matcha Financier",
    "allergens": [
      "NU"
    ],
    "description": "Almond"
  },
  {
    "name": "Norwegian King Crab",
    "allergens": [
      "CR",
      "GA",
      "GL"
    ],
    "description": "Pan-fried with Chilli and Garlic"
  },
  {
    "name": "Norwegian King Crab",
    "allergens": [
      "CR",
      "EG",
      "GL",
      "ON"
    ],
    "description": "Steamed with Chinese Rice Wine and Egg White"
  },
  {
    "name": "Peach Melba",
    "allergens": [
      "EG",
      "MI"
    ],
    "description": ""
  },
  {
    "name": "Pumpkin ball",
    "allergens": [
      "MR"
    ],
    "description": ""
  },
  {
    "name": "Pumpkin ball",
    "allergens": [
      "NU"
    ],
    "description": "Deep Fried Dim Sum Platter"
  },
  {
    "name": "Rack of Lamb with Chef's Special Sauce",
    "allergens": [
      "MI",
      "ON"
    ],
    "description": ""
  },
  {
    "name": "Salt and Pepper Estonian Quail",
    "allergens": [
      "EG",
      "GA",
      "ON"
    ],
    "description": ""
  },
  {
    "name": "Sizzling Taiwanese Three Cups Chicken",
    "allergens": [
      "GA",
      "GL",
      "ON",
      "SO"
    ],
    "description": ""
  },
  {
    "name": "Slow Cooked Japanese Wagyu with Black Truffle Sauce",
    "allergens": [
      "GL",
      "ON",
      "SO"
    ],
    "description": ""
  },
  {
    "name": "Special Pork Fried Rice with XO Sauce",
    "allergens": [
      "CR",
      "EG",
      "GA",
      "ON",
      "SE"
    ],
    "description": ""
  },
  {
    "name": "Special Pork Rice",
    "allergens": [
      "GL"
    ],
    "description": ""
  },
  {
    "name": "Spicy Singapore Noodles with Seafood",
    "allergens": [
      "CR",
      "EG",
      "GL",
      "MR",
      "ON",
      "SO"
    ],
    "description": ""
  },
  {
    "name": "Spinach dumpling",
    "allergens": [
      "CR"
    ],
    "description": "green"
  },
  {
    "name": "Steamed Dim Sum Platter",
    "allergens": [
      "GL"
    ],
    "description": ""
  },
  {
    "name": "Steamed Vegetarian Dim Sum Platter",
    "allergens": [
      "GL",
      "MR"
    ],
    "description": ""
  },
  {
    "name": "Steamed Vegetarian Dim Sum Platter",
    "allergens": [
      "MI"
    ],
    "description": "Green: black truffle edamame dumplings"
  },
  {
    "name": "Steamed Vegetarian Dim Sum Platter",
    "allergens": [
      "CE"
    ],
    "description": "Orange: spicy vegetable dumplings"
  },
  {
    "name": "Stir Fried Squid with Pepper, Chilli, and Garlic",
    "allergens": [
      "CR",
      "EG",
      "GA",
      "ON"
    ],
    "description": ""
  },
  {
    "name": "Stir Fry Lamian with Angus Beef",
    "allergens": [
      "EG",
      "GL",
      "MR",
      "SO"
    ],
    "description": ""
  },
  {
    "name": "Stir-fry Angus Tenderloin Beef with Black Pepper Sauce",
    "allergens": [
      "GA",
      "GL",
      "MI",
      "ON",
      "SO"
    ],
    "description": ""
  },
  {
    "name": "Stir-Fry Asparagus with Lily Bulbs, Water Chestnut, and Yellow Fungus",
    "allergens": [
      "MR"
    ],
    "description": "V"
  },
  {
    "name": "Sweet and Sour Iberico Pork with Pineapple",
    "allergens": [
      "GL",
      "ON"
    ],
    "description": ""
  },
  {
    "name": "Sweet Corn Soup with Chicken",
    "allergens": [
      "EG"
    ],
    "description": ""
  },
  {
    "name": "Tobiko scallop siew mai",
    "allergens": [
      "CR"
    ],
    "description": "yellow"
  },
  {
    "name": "Vegetable spring roll",
    "allergens": [
      "MR"
    ],
    "description": ""
  },
  {
    "name": "Venison Puff",
    "allergens": [
      "MI"
    ],
    "description": "Deep fried Dim Sum"
  },
  {
    "name": "Wasabi Blanch",
    "allergens": [
      "MI"
    ],
    "description": ""
  },
  {
    "name": "Wasabi Blanch",
    "allergens": [
      "NU"
    ],
    "description": "Almond"
  },
  {
    "name": "Wasabi Blanch",
    "allergens": [
      "EG"
    ],
    "description": "Egg yolk on the ice cream"
  },
  {
    "name": "XO Sauce king crab dumpling",
    "allergens": [
      "GA",
      "SE"
    ],
    "description": "red"
  }
];



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
  ,
      { name:'Char Siu Pork', price:18.00, allergens:['GL','SO'], description:'Honey-glazed roasted pork with five-spice.'},
      { name:'Steamed Grouper', price:26.00, allergens:['Fl','SO'], description:'Ginger-scallion sauce, light soy.'},
      { name:'Mapo Tofu', price:16.00, allergens:['SO'], description:'Silken tofu, Szechuan pepper, chili oil.'},
      { name:'Seasonal Greens', price:8.50, allergens:[], description:'Stir-fried with garlic.'},
      { name:'Egg Tart', price:7.00, allergens:['EG','Mi','GL'], description:'Buttery crust, silky custard.'},
      { name:'Shiitake & Truffle Dumpling', price:11.00, allergens:['MR','GL','SO'], description:'Forest mushroom medley.'}
    ];
  }

  render();

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
