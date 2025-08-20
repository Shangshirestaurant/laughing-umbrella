/* Clean app.js generated from CSV */
const ALLERGENS = [{"code": "GL", "name": "Gluten"}, {"code": "NU", "name": "Nuts"}, {"code": "PE", "name": "Peanuts"}, {"code": "SE", "name": "Sesame"}, {"code": "SO", "name": "Soy"}, {"code": "EG", "name": "Eggs"}, {"code": "MI", "name": "Milk"}, {"code": "FI", "name": "Fish"}, {"code": "CR", "name": "Crustaceans"}, {"code": "MO", "name": "Molluscs"}, {"code": "MR", "name": "Mushrooms"}, {"code": "ON", "name": "Onion"}, {"code": "GA", "name": "Garlic"}, {"code": "CE", "name": "Celery"}, {"code": "MU", "name": "Mustard"}];
const ALLERGENS_MAP = Object.fromEntries(ALLERGENS.map(a => [a.code, a.name]));
const MENU = [{"name": "Amuse Bouche", "allergens": [], "description": ""}, {"name": "Aromatic Crispy Duck Salad", "allergens": [], "description": ""}, {"name": "Baked venison puff", "allergens": [], "description": ""}, {"name": "Black Truffle Vegetable Spring Roll (v)", "allergens": [], "description": ""}, {"name": "Braised Fish Maw with Japanese Shitake Mushroom in Superior Oyster Sauce", "allergens": [], "description": ""}, {"name": "Braised Pork Belly", "allergens": [], "description": ""}, {"name": "Braised South African Kippin Abalone in Superior Oyster Sauce", "allergens": [], "description": ""}, {"name": "Chopped pepper lamb dumpling (pink)", "allergens": [], "description": ""}, {"name": "Claypot Silken Egg Tofu with Vegetables (V)", "allergens": [], "description": ""}, {"name": "Crispy Aromatic Duck Salad", "allergens": [], "description": ""}, {"name": "Crispy Duck Salad", "allergens": [], "description": ""}, {"name": "Crispy Pork Belly", "allergens": [], "description": ""}, {"name": "Deep Fried Dim Sum Assortment", "allergens": [], "description": ""}, {"name": "Deep Fried King Scallop with Minced Prawns in Teriyaki Sauce", "allergens": [], "description": ""}, {"name": "Duck Soup", "allergens": [], "description": ""}, {"name": "Five Spice Crispy Corn Fed Chicken Parcel with Thai Basil", "allergens": [], "description": ""}, {"name": "Golden Egg Fried Rice", "allergens": [], "description": ""}, {"name": "Golden Fried Soft Shell Crab with Chilli", "allergens": [], "description": ""}, {"name": "Grilled Chilean Sea Bass in Honey", "allergens": [], "description": ""}, {"name": "Ham&Cheese Sandwich", "allergens": [], "description": ""}, {"name": "Home-made Salt and Pepper Crispy Tofu (v)", "allergens": [], "description": ""}, {"name": "Hot and Sour Soup with Seafood", "allergens": [], "description": ""}, {"name": "Kung Pao Prawn with Cashew", "allergens": [], "description": ""}, {"name": "Legendary Peking Duck", "allergens": [], "description": ""}, {"name": "Legendary Peking Duck 3rd Course", "allergens": [], "description": ""}, {"name": "Lobster with Ginger and Spring Onion", "allergens": [], "description": ""}, {"name": "Mapo Tofu (with Minced Beef)", "allergens": [], "description": ""}, {"name": "Matcha Financier", "allergens": [], "description": ""}, {"name": "Norwegian King Crab (Pan-fried with Chilli and Garlic)", "allergens": [], "description": ""}, {"name": "Norwegian King Crab (Steamed with Chinese Rice Wine and Egg White)", "allergens": [], "description": ""}, {"name": "Peach Melba", "allergens": [], "description": ""}, {"name": "Pumpkin ball", "allergens": [], "description": ""}, {"name": "Rack of Lamb with Chef's Special Sauce", "allergens": [], "description": ""}, {"name": "Salt and Pepper Estonian Quail", "allergens": [], "description": ""}, {"name": "Sizzling Taiwanese Three Cups Chicken", "allergens": [], "description": ""}, {"name": "Slow Cooked Japanese Wagyu with Black Truffle Sauce", "allergens": [], "description": ""}, {"name": "Special Pork Fried Rice with XO Sauce", "allergens": [], "description": ""}, {"name": "Special Pork Rice", "allergens": [], "description": ""}, {"name": "Spicy Singapore Noodles with Seafood", "allergens": [], "description": ""}, {"name": "Spinach dumpling (green)", "allergens": [], "description": ""}, {"name": "Steamed Dim Sum Platter", "allergens": [], "description": ""}, {"name": "Steamed Vegetarian Dim Sum Platter", "allergens": [], "description": ""}, {"name": "Stir Fried Squid with Pepper, Chilli, and Garlic", "allergens": [], "description": ""}, {"name": "Stir Fry Lamian with Angus Beef", "allergens": [], "description": ""}, {"name": "Stir-fry Angus Tenderloin Beef with Black Pepper Sauce", "allergens": [], "description": ""}, {"name": "Stir-Fry Asparagus with Lily Bulbs, Water Chestnut, and Yellow Fungus (V)", "allergens": [], "description": ""}, {"name": "Sweet and Sour Iberico Pork with Pineapple", "allergens": [], "description": ""}, {"name": "Sweet Corn Soup with Chicken", "allergens": [], "description": ""}, {"name": "Tobiko scallop siew mai (yellow)", "allergens": [], "description": ""}, {"name": "Vegetable spring roll", "allergens": [], "description": ""}, {"name": "Venison Puff", "allergens": [], "description": ""}, {"name": "Wasabi Blanch", "allergens": [], "description": ""}, {"name": "XO Sauce king crab dumpling (red)", "allergens": [], "description": ""}];

const state = { mode: 'SAFE', avoid: new Set() };

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
  return state.avoid.size ? hasAny : true;
}

function render(){
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
    (d.allergens||[]).forEach(code => { const s=document.createElement('span'); s.className='badge'; s.textContent=code; s.title=ALLERGENS_MAP[code]||code; badges.appendChild(s); });
    const price = node.querySelector('.price'); if(price) price.textContent='';
    // Safe mark: show if dish has no allergens; or when in SAFE mode with selections and dish passes
    const dAll = Array.isArray(d.allergens)? d.allergens : [];
    const hasCodes = dAll.length > 0;
    const conflicts = dAll.some(c => state.avoid && state.avoid.has && state.avoid.has(c));
    const passesSelection = (state.mode === 'SAFE') ? !conflicts : (state.avoid && state.avoid.size ? conflicts : true);
    if(!hasCodes || (state.avoid && state.avoid.size > 0 && passesSelection && state.mode === 'SAFE')){
      const mark = document.createElement('div');
      mark.className = 'safe-mark';
      mark.title = !hasCodes ? 'No listed allergens' : 'Safe for current selection';
      mark.textContent = '✓';
      node.appendChild(mark);
    }
    els.grid.appendChild(node);
  });
}

function init(){
  // Build chips
  els.chips.innerHTML='';
  ALLERGENS.forEach(a => els.chips.appendChild(makeChip(a)));

  // Mode buttons
  if(els.modeSafe) els.modeSafe.addEventListener('click',()=>{ state.mode='SAFE'; els.modeSafe.classList.add('active'); if(els.modeContains) els.modeContains.classList.remove('active'); render(); });
  if(els.modeContains) els.modeContains.addEventListener('click',()=>{ state.mode='CONTAINS'; els.modeContains.classList.add('active'); if(els.modeSafe) els.modeSafe.classList.remove('active'); render(); });

  // Initial render
  render();

  // Chips arrows + fades
  (function(){
    const bar = document.getElementById('selector');
    const row = document.getElementById('allergenChips');
    const prev = document.getElementById('chipsPrev');
    const next = document.getElementById('chipsNext');
    if(!bar || !row) return;
    function updateArrows(){
      const can = row.scrollWidth > row.clientWidth + 2;
      if(prev) prev.hidden = !can || row.scrollLeft <= 2;
      if(next) next.hidden = !can || Math.ceil(row.scrollLeft + row.clientWidth) >= row.scrollWidth - 2;
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
