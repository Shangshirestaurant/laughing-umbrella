/* Rebuilt app.js (clean) — chips first, then dishes; menu inlined */
const ALLERGENS = [{"code": "GL", "name": "Gluten"}, {"code": "NU", "name": "Nuts"}, {"code": "PE", "name": "Peanuts"}, {"code": "SE", "name": "Sesame"}, {"code": "SO", "name": "Soy"}, {"code": "EG", "name": "Eggs"}, {"code": "Mi", "name": "Milk"}, {"code": "Fl", "name": "Fish"}, {"code": "CR", "name": "Crustaceans"}, {"code": "MO", "name": "Molluscs"}, {"code": "MR", "name": "Mushrooms"}, {"code": "ON", "name": "Onion"}, {"code": "GA", "name": "Garlic"}, {"code": "CE", "name": "Celery"}, {"code": "MU", "name": "Mustard"}];
const MENU = [{"name": "Prawn Har Gow", "price": 9.5, "allergens": ["CR", "GL", "SO"], "description": "Transparent prawn dumplings with bamboo shoots."}, {"name": "Char Siu Pork", "price": 18.0, "allergens": ["GL", "SO"], "description": "Honey-glazed roasted pork with five-spice."}, {"name": "Steamed Grouper", "price": 26.0, "allergens": ["Fl", "SO"], "description": "Ginger-scallion sauce, light soy."}, {"name": "Mapo Tofu", "price": 16.0, "allergens": ["SO"], "description": "Silken tofu, Szechuan pepper, chili oil."}, {"name": "Seasonal Greens", "price": 8.5, "allergens": [], "description": "Stir-fried with garlic."}, {"name": "Egg Tart", "price": 7.0, "allergens": ["EG", "Mi", "GL"], "description": "Buttery crust, silky custard."}, {"name": "Shiitake & Truffle Dumpling", "price": 11.0, "allergens": ["MR", "GL", "SO"], "description": "Forest mushroom medley."}];

const state = {
  mode: 'SAFE',         // SAFE (exclude) or CONTAINS
  avoid: new Set()
};

const els = {
  chips: document.getElementById('allergenChips'),
  grid: document.getElementById('dishGrid'),
  cardTmpl: document.getElementById('dishCardTmpl'),
  modeSafe: document.getElementById('modeSafe'),
  modeContains: document.getElementById('modeContains')
};

function makeChip(a){
  const b = document.createElement('button');
  b.className = 'chip';
  b.textContent = a.name;
  b.dataset.code = a.code;
  b.setAttribute('aria-pressed','false');
  b.addEventListener('click', () => {
    if(state.avoid.has(a.code)){ state.avoid.delete(a.code); b.classList.remove('on'); b.setAttribute('aria-pressed','false'); }
    else { state.avoid.add(a.code); b.classList.add('on'); b.setAttribute('aria-pressed','true'); }
    render();
  });
  return b;
}

function isAllowed(dish){
  const dAll = Array.isArray(dish.allergens) ? dish.allergens : [];
  const hasAny = dAll.some(c => state.avoid.has(c));
  if(state.mode === 'SAFE') return !hasAny;
  // CONTAINS
  return state.avoid.size ? hasAny : true;
}

function render(){
  // grid
  els.grid.innerHTML = '';
  const filtered = MENU.filter(isAllowed);
  if(!filtered.length){
    const p = document.createElement('p');
    p.className='empty';
    p.textContent = 'No dishes match the current selection.';
    els.grid.appendChild(p);
    return;
  }
  filtered.forEach(d => {
    const node = els.cardTmpl.content.firstElementChild.cloneNode(true);
    node.querySelector('.card-title').textContent = d.name;
    node.querySelector('.card-desc').textContent = d.description || '';
    const badges = node.querySelector('.badges');
    (d.allergens||[]).forEach(code=>{
      const a = ALLERGENS.find(x=>x.code===code);
      const s = document.createElement('span');
      s.className='badge';
      s.textContent = a ? a.name : code;
      badges.appendChild(s);
    });
    // hide price area (we don't use prices)
    const price = node.querySelector('.price'); if(price) price.textContent='';
    els.grid.appendChild(node);
  });
}

function init(){
  // Build chips row first
  els.chips.innerHTML='';
  ALLERGENS.forEach(a => els.chips.appendChild(makeChip(a)));

  // Mode tabs
  if(els.modeSafe) els.modeSafe.addEventListener('click',()=>{ state.mode='SAFE'; els.modeSafe.classList.add('active'); if(els.modeContains) els.modeContains.classList.remove('active'); render(); });
  if(els.modeContains) els.modeContains.addEventListener('click',()=>{ state.mode='CONTAINS'; els.modeContains.classList.add('active'); if(els.modeSafe) els.modeSafe.classList.remove('active'); render(); });

  // First render
  render();

  // Chips arrows
  (function(){
    const bar = document.getElementById('selector');
    const row = document.getElementById('allergenChips');
    const prev = document.getElementById('chipsPrev');
    const next = document.getElementById('chipsNext');
    if(!bar || !row) return;
    function updateArrows(){
      const can = row.scrollWidth > row.clientWidth + 2;
      if(!prev||!next) return;
      if(!can){ prev.hidden = true; next.hidden = true; return; }
      prev.hidden = row.scrollLeft <= 2;
      next.hidden = Math.ceil(row.scrollLeft + row.clientWidth) >= row.scrollWidth - 2;
    }
    function nudge(dir){ row.scrollBy({left: Math.round(row.clientWidth*0.7)*dir, behavior:'smooth'}); }
    if(prev) prev.addEventListener('click',()=>nudge(-1));
    if(next) next.addEventListener('click',()=>nudge(+1));
    row.addEventListener('scroll', updateArrows, {passive:true});
    window.addEventListener('resize', updateArrows);
    setTimeout(updateArrows, 0);
  })();
}

document.addEventListener('DOMContentLoaded', init);
