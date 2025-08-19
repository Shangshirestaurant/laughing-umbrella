/* Clean app.js: chips first, then dishes; header has two mode buttons */
const ALLERGENS = [{"code": "GL", "name": "Gluten"}, {"code": "NU", "name": "Nuts"}, {"code": "PE", "name": "Peanuts"}, {"code": "SE", "name": "Sesame"}, {"code": "SO", "name": "Soy"}, {"code": "EG", "name": "Eggs"}, {"code": "MI", "name": "Milk"}, {"code": "FI", "name": "Fish"}, {"code": "CR", "name": "Crustaceans"}, {"code": "MO", "name": "Molluscs"}, {"code": "MR", "name": "Mushrooms"}, {"code": "ON", "name": "Onion"}, {"code": "GA", "name": "Garlic"}, {"code": "CE", "name": "Celery"}, {"code": "MU", "name": "Mustard"}];
const MENU = [{"name": "Amuse Bouche", "allergens": ["SE"], "description": "with spicy sauce"}, {"name": "Aromatic Crispy Duck Salad", "allergens": ["GL"], "description": ""}, {"name": "Baked venison puff", "allergens": ["SE"], "description": ""}, {"name": "Black Truffle Vegetable Spring Roll", "allergens": ["GL", "MR"], "description": "v"}, {"name": "Braised Fish Maw with Japanese Shitake Mushroom in Superior Oyster Sauce", "allergens": ["CR", "GL", "MR", "SO"], "description": ""}, {"name": "Braised Pork Belly", "allergens": ["GL", "SO"], "description": ""}, {"name": "Braised South African Kippin Abalone in Superior Oyster Sauce", "allergens": ["CR", "GL", "MR", "SO"], "description": ""}, {"name": "Chopped pepper lamb dumpling", "allergens": ["CR"], "description": "pink"}, {"name": "Claypot Silken Egg Tofu with Vegetables", "allergens": ["EG", "MR", "ON", "SO"], "description": "V"}, {"name": "Crispy Aromatic Duck Salad", "allergens": ["NU", "ON", "SO"], "description": ""}, {"name": "Crispy Duck Salad", "allergens": ["GL"], "description": ""}, {"name": "Crispy Pork Belly", "allergens": ["MU"], "description": "On the side"}, {"name": "Deep Fried Dim Sum Assortment", "allergens": ["GL"], "description": ""}, {"name": "Deep Fried King Scallop with Minced Prawns in Teriyaki Sauce", "allergens": ["CR", "EG", "GA", "GL", "ON", "SO"], "description": ""}, {"name": "Duck Soup", "allergens": ["GL", "MR", "SE", "SO"], "description": ""}, {"name": "Five Spice Crispy Corn Fed Chicken Parcel with Thai Basil", "allergens": ["GA"], "description": ""}, {"name": "Golden Egg Fried Rice", "allergens": ["EG"], "description": ""}, {"name": "Golden Fried Soft Shell Crab with Chilli", "allergens": ["EG", "GL"], "description": ""}, {"name": "Grilled Chilean Sea Bass in Honey", "allergens": ["GL", "SO"], "description": ""}, {"name": "Ham&Cheese Sandwich", "allergens": ["MI"], "description": "Canapé"}, {"name": "Home-made Salt and Pepper Crispy Tofu", "allergens": ["GA", "GL"], "description": "v"}, {"name": "Hot and Sour Soup with Seafood", "allergens": ["CR", "MR", "MU"], "description": ""}, {"name": "Kung Pao Prawn with Cashew", "allergens": ["CR", "GL", "NU", "ON", "SO"], "description": ""}, {"name": "Legendary Peking Duck", "allergens": ["GL"], "description": ""}, {"name": "Legendary Peking Duck 3rd Course", "allergens": ["NU"], "description": ""}, {"name": "Lobster with Ginger and Spring Onion", "allergens": ["CR", "ON"], "description": ""}, {"name": "Mapo Tofu", "allergens": ["MR", "MU", "ON"], "description": "with Minced Beef"}, {"name": "Matcha Financier", "allergens": ["NU"], "description": "Almond"}, {"name": "Norwegian King Crab", "allergens": ["CR", "GA", "GL"], "description": "Pan-fried with Chilli and Garlic"}, {"name": "Norwegian King Crab", "allergens": ["CR", "EG", "GL", "ON"], "description": "Steamed with Chinese Rice Wine and Egg White"}, {"name": "Peach Melba", "allergens": ["EG", "MI"], "description": ""}, {"name": "Pumpkin ball", "allergens": ["MR"], "description": ""}, {"name": "Pumpkin ball", "allergens": ["NU"], "description": "Deep Fried Dim Sum Platter"}, {"name": "Rack of Lamb with Chef's Special Sauce", "allergens": ["MI", "ON"], "description": ""}, {"name": "Salt and Pepper Estonian Quail", "allergens": ["EG", "GA", "ON"], "description": ""}, {"name": "Sizzling Taiwanese Three Cups Chicken", "allergens": ["GA", "GL", "ON", "SO"], "description": ""}, {"name": "Slow Cooked Japanese Wagyu with Black Truffle Sauce", "allergens": ["GL", "ON", "SO"], "description": ""}, {"name": "Special Pork Fried Rice with XO Sauce", "allergens": ["CR", "EG", "GA", "ON", "SE"], "description": ""}, {"name": "Special Pork Rice", "allergens": ["GL"], "description": ""}, {"name": "Spicy Singapore Noodles with Seafood", "allergens": ["CR", "EG", "GL", "MR", "ON", "SO"], "description": ""}, {"name": "Spinach dumpling", "allergens": ["CR"], "description": "green"}, {"name": "Steamed Dim Sum Platter", "allergens": ["GL"], "description": ""}, {"name": "Steamed Vegetarian Dim Sum Platter", "allergens": ["GL", "MR"], "description": ""}, {"name": "Steamed Vegetarian Dim Sum Platter", "allergens": ["MI"], "description": "Green: black truffle edamame dumplings"}, {"name": "Steamed Vegetarian Dim Sum Platter", "allergens": ["CE"], "description": "Orange: spicy vegetable dumplings"}, {"name": "Stir Fried Squid with Pepper, Chilli, and Garlic", "allergens": ["CR", "EG", "GA", "ON"], "description": ""}, {"name": "Stir Fry Lamian with Angus Beef", "allergens": ["EG", "GL", "MR", "SO"], "description": ""}, {"name": "Stir-fry Angus Tenderloin Beef with Black Pepper Sauce", "allergens": ["GA", "GL", "MI", "ON", "SO"], "description": ""}, {"name": "Stir-Fry Asparagus with Lily Bulbs, Water Chestnut, and Yellow Fungus", "allergens": ["MR"], "description": "V"}, {"name": "Sweet and Sour Iberico Pork with Pineapple", "allergens": ["GL", "ON"], "description": ""}, {"name": "Sweet Corn Soup with Chicken", "allergens": ["EG"], "description": ""}, {"name": "Tobiko scallop siew mai", "allergens": ["CR"], "description": "yellow"}, {"name": "Vegetable spring roll", "allergens": ["MR"], "description": ""}, {"name": "Venison Puff", "allergens": ["MI"], "description": "Deep fried Dim Sum"}, {"name": "Wasabi Blanch", "allergens": ["MI"], "description": ""}, {"name": "Wasabi Blanch", "allergens": ["NU"], "description": "Almond"}, {"name": "Wasabi Blanch", "allergens": ["EG"], "description": "Egg yolk on the ice cream"}, {"name": "XO Sauce king crab dumpling", "allergens": ["GA", "SE"], "description": "red"}];

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
    (d.allergens||[]).forEach(code => {
      const a = ALLERGENS.find(x => x.code === code);
      const s = document.createElement('span');
      s.className='badge';
      s.textContent = a ? a.name : code;
      badges.appendChild(s);
    });
    const price = node.querySelector('.price'); if(price) price.textContent='';
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
