
/* Failsafe app.js: inline MENU + robust init + status banner */
const ALLERGENS = [
  {code:"GL",name:"Gluten"},
  {code:"NU",name:"Nuts"},
  {code:"PE",name:"Peanuts"},
  {code:"SE",name:"Sesame"},
  {code:"SO",name:"Soy"},
  {code:"EG",name:"Eggs"},
  {code:"MI",name:"Milk"},
  {code:"FI",name:"Fish"},
  {code:"CR",name:"Crustaceans"},
  {code:"MO",name:"Molluscs"},
  {code:"MR",name:"Mushrooms"},
  {code:"ON",name:"Onion"},
  {code:"GA",name:"Garlic"},
  {code:"CE",name:"Celery"},
  {code:"MU",name:"Mustard"}
];
const ALLERGENS_MAP = Object.fromEntries(ALLERGENS.map(a => [a.code, a.name]));
const MENU = [{"name": "Amuse Bouche", "allergens": [], "description": ""}, {"name": "Aromatic Crispy Duck Salad", "allergens": [], "description": ""}, {"name": "Baked venison puff", "allergens": [], "description": ""}, {"name": "Black Truffle Vegetable Spring Roll (v)", "allergens": [], "description": ""}, {"name": "Braised Fish Maw with Japanese Shitake Mushroom in Superior Oyster Sauce", "allergens": [], "description": ""}, {"name": "Braised Pork Belly", "allergens": [], "description": ""}, {"name": "Braised South African Kippin Abalone in Superior Oyster Sauce", "allergens": [], "description": ""}, {"name": "Chopped pepper lamb dumpling (pink)", "allergens": [], "description": ""}, {"name": "Claypot Silken Egg Tofu with Vegetables (V)", "allergens": [], "description": ""}, {"name": "Crispy Aromatic Duck Salad", "allergens": [], "description": ""}, {"name": "Crispy Duck Salad", "allergens": [], "description": ""}, {"name": "Crispy Pork Belly", "allergens": [], "description": ""}, {"name": "Deep Fried Dim Sum Assortment", "allergens": [], "description": ""}, {"name": "Deep Fried King Scallop with Minced Prawns in Teriyaki Sauce", "allergens": [], "description": ""}, {"name": "Duck Soup", "allergens": [], "description": ""}, {"name": "Five Spice Crispy Corn Fed Chicken Parcel with Thai Basil", "allergens": [], "description": ""}, {"name": "Golden Egg Fried Rice", "allergens": [], "description": ""}, {"name": "Golden Fried Soft Shell Crab with Chilli", "allergens": [], "description": ""}, {"name": "Grilled Chilean Sea Bass in Honey", "allergens": [], "description": ""}, {"name": "Ham&Cheese Sandwich", "allergens": [], "description": ""}, {"name": "Home-made Salt and Pepper Crispy Tofu (v)", "allergens": [], "description": ""}, {"name": "Hot and Sour Soup with Seafood", "allergens": [], "description": ""}, {"name": "Kung Pao Prawn with Cashew", "allergens": [], "description": ""}, {"name": "Legendary Peking Duck", "allergens": [], "description": ""}, {"name": "Legendary Peking Duck 3rd Course", "allergens": [], "description": ""}, {"name": "Lobster with Ginger and Spring Onion", "allergens": [], "description": ""}, {"name": "Mapo Tofu (with Minced Beef)", "allergens": [], "description": ""}, {"name": "Matcha Financier", "allergens": [], "description": ""}, {"name": "Norwegian King Crab (Pan-fried with Chilli and Garlic)", "allergens": [], "description": ""}, {"name": "Norwegian King Crab (Steamed with Chinese Rice Wine and Egg White)", "allergens": [], "description": ""}, {"name": "Peach Melba", "allergens": [], "description": ""}, {"name": "Pumpkin ball", "allergens": [], "description": ""}, {"name": "Rack of Lamb with Chef's Special Sauce", "allergens": [], "description": ""}, {"name": "Salt and Pepper Estonian Quail", "allergens": [], "description": ""}, {"name": "Sizzling Taiwanese Three Cups Chicken", "allergens": [], "description": ""}, {"name": "Slow Cooked Japanese Wagyu with Black Truffle Sauce", "allergens": [], "description": ""}, {"name": "Special Pork Fried Rice with XO Sauce", "allergens": [], "description": ""}, {"name": "Special Pork Rice", "allergens": [], "description": ""}, {"name": "Spicy Singapore Noodles with Seafood", "allergens": [], "description": ""}, {"name": "Spinach dumpling (green)", "allergens": [], "description": ""}, {"name": "Steamed Dim Sum Platter", "allergens": [], "description": ""}, {"name": "Steamed Vegetarian Dim Sum Platter", "allergens": [], "description": ""}, {"name": "Stir Fried Squid with Pepper, Chilli, and Garlic", "allergens": [], "description": ""}, {"name": "Stir Fry Lamian with Angus Beef", "allergens": [], "description": ""}, {"name": "Stir-fry Angus Tenderloin Beef with Black Pepper Sauce", "allergens": [], "description": ""}, {"name": "Stir-Fry Asparagus with Lily Bulbs, Water Chestnut, and Yellow Fungus (V)", "allergens": [], "description": ""}, {"name": "Sweet and Sour Iberico Pork with Pineapple", "allergens": [], "description": ""}, {"name": "Sweet Corn Soup with Chicken", "allergens": [], "description": ""}, {"name": "Tobiko scallop siew mai (yellow)", "allergens": [], "description": ""}, {"name": "Vegetable spring roll", "allergens": [], "description": ""}, {"name": "Venison Puff", "allergens": [], "description": ""}, {"name": "Wasabi Blanch", "allergens": [], "description": ""}, {"name": "XO Sauce king crab dumpling (red)", "allergens": [], "description": ""}];

const PRESETS = [
  {id:"gf",   name:"Gluten‑free",     codes:["GL"]},
  {id:"nf",   name:"Nut‑free",        codes:["NU","PE"]},
  {id:"df",   name:"Dairy‑free",      codes:["MI"]},
  {id:"sf",   name:"Shellfish‑free",  codes:["CR","MO"]},
  {id:"ef",   name:"Egg‑free",        codes:["EG"]},
  {id:"soyf", name:"Soy‑free",        codes:["SO"]},
  {id:"onf",  name:"Onion‑free",      codes:["ON"]},
  {id:"garf", name:"Garlic‑free",     codes:["GA"]},
  {id:"sef",  name:"Sesame‑free",     codes:["SE"]},
  {id:"fif",  name:"Fish‑free",       codes:["FI"]},
  {id:"mrf",  name:"Mushroom‑free",   codes:["MR"]},
  {id:"cef",  name:"Celery‑free",     codes:["CE"]},
  {id:"muf",  name:"Mustard‑free",    codes:["MU"]}
];

const state = { mode: 'SAFE', avoid: new Set() };

const els = {
  chips: document.getElementById('allergenChips'),
  grid: document.getElementById('dishGrid'),
  cardTmpl: document.getElementById('dishCardTmpl'),
  modeSafe: document.getElementById('modeSafe'),
  modeContains: document.getElementById('modeContains'),
  presetBtn: document.getElementById('presetBtn'),
  presetPanel: document.getElementById('presetPanel'),
  status: document.getElementById('appStatus')
};

function note(msg){
  if (els.status){ els.status.style.display='block'; els.status.textContent = 'Note: ' + msg; }
  console.warn(msg);
}

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

function syncChips(){
  if(!els.chips) return;
  els.chips.querySelectorAll('.chip').forEach(btn => {
    const code = btn.dataset.code;
    const on = state.avoid.has(code);
    btn.classList.toggle('on', on);
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
  });
}

function isAllowed(dish){
  const dAll = Array.isArray(dish.allergens) ? dish.allergens : [];
  const hasAny = dAll.some(c => state.avoid.has(c));
  if(state.mode === 'SAFE') return !hasAny;
  return state.avoid.size ? hasAny : true;
}

function render(){
  if(!els.grid) { note('Missing #dishGrid container.'); return; }
  els.grid.innerHTML = '';
  if(!Array.isArray(MENU) || MENU.length === 0){
    note('MENU is empty or failed to inline.');
    const p = document.createElement('p'); p.className='empty'; p.textContent='No menu data loaded.'; els.grid.appendChild(p);
    return;
  }
  const filtered = MENU.filter(isAllowed);
  if(!filtered.length){
    const p = document.createElement('p');
    p.className='empty';
    p.textContent = 'No dishes match the current selection.';
    els.grid.appendChild(p);
    return;
  }
  filtered.forEach(d => {
    const node = els.cardTmpl && els.cardTmpl.content ? els.cardTmpl.content.firstElementChild.cloneNode(true) : document.createElement('article');
    node.classList.add('card');
    const title = node.querySelector('.card-title') || node.appendChild(document.createElement('h3'));
    title.className = 'card-title';
    title.textContent = d.name;
    const desc = node.querySelector('.card-desc') || node.appendChild(document.createElement('p'));
    desc.className = 'card-desc';
    desc.textContent = d.description || '';
    let badges = node.querySelector('.badges');
    if(!badges){ badges = document.createElement('div'); badges.className='badges'; node.appendChild(badges); }
    badges.innerHTML='';
    (d.allergens||[]).forEach(code => {
      const s = document.createElement('span');
      s.className='badge';
      s.textContent = code;
      s.title = ALLERGENS_MAP[code] || code;
      badges.appendChild(s);
    });
    els.grid.appendChild(node);
  });
}

function buildPresetsPanel(){
  if(!els.presetPanel) return;
  els.presetPanel.innerHTML = '';
  const h = document.createElement('h4'); h.textContent = 'Presets';
  const ul = document.createElement('div'); ul.className='preset-list';
  PRESETS.forEach(p => {
    const b = document.createElement('button');
    b.textContent = p.name;
    b.addEventListener('click', () => {
      state.avoid = new Set(p.codes);
      syncChips();
      render();
      togglePresets(false);
    });
    ul.appendChild(b);
  });
  const actions = document.createElement('div'); actions.className='preset-actions';
  const clear = document.createElement('button'); clear.textContent='Clear'; clear.addEventListener('click', ()=>{ state.avoid.clear(); syncChips(); render(); togglePresets(false); });
  const all = document.createElement('button'); all.textContent='Select all'; all.addEventListener('click', ()=>{ state.avoid = new Set(ALLERGENS.map(a=>a.code)); syncChips(); render(); togglePresets(false); });
  actions.append(clear, all);
  els.presetPanel.append(h, ul, actions);
}

function togglePresets(forceState){
  if(!els.presetPanel || !els.presetBtn) return;
  const open = (typeof forceState === 'boolean') ? forceState : els.presetPanel.hasAttribute('hidden');
  if(open){ els.presetPanel.removeAttribute('hidden'); els.presetBtn.setAttribute('aria-expanded','true'); }
  else    { els.presetPanel.setAttribute('hidden',''); els.presetBtn.setAttribute('aria-expanded','false'); }
}

function buildLegend(){
  const body = document.querySelector('#allergenLegend .legend-body .legend-row');
  if(!body) return;
  body.innerHTML = '';
  ALLERGENS.forEach(a => {
    const chip = document.createElement('div');
    chip.className = 'legend-chip';
    const code = document.createElement('span');
    code.className = 'code';
    code.textContent = a.code;
    const name = document.createElement('span');
    name.textContent = a.name;
    chip.append(code, name);
    body.appendChild(chip);
  });
  const toggle = document.getElementById('legendToggle');
  const panel = document.querySelector('#allergenLegend .legend-body');
  if(toggle && panel){
    toggle.addEventListener('click', ()=>{
      const open = panel.hasAttribute('hidden');
      if(open){ panel.removeAttribute('hidden'); toggle.setAttribute('aria-expanded','true'); }
      else { panel.setAttribute('hidden',''); toggle.setAttribute('aria-expanded','false'); }
    });
  }
}

function init(){
  try{
    if(!els.chips){ note('Missing chips row (#allergenChips).'); }
    else {
      els.chips.innerHTML='';
      ALLERGENS.forEach(a => els.chips.appendChild(makeChip(a)));
    }
    if(els.modeSafe) els.modeSafe.addEventListener('click',()=>{ state.mode='SAFE'; els.modeSafe.classList.add('active'); if(els.modeContains) els.modeContains.classList.remove('active'); render(); });
    if(els.modeContains) els.modeContains.addEventListener('click',()=>{ state.mode='CONTAINS'; els.modeContains.classList.add('active'); if(els.modeSafe) els.modeSafe.classList.remove('active'); render(); });
    buildPresetsPanel();
    if(els.presetBtn) els.presetBtn.addEventListener('click', ()=> togglePresets());
    document.addEventListener('click', (e)=>{
      if(!els.presetPanel || els.presetPanel.hasAttribute('hidden')) return;
      if(e.target === els.presetBtn || els.presetPanel.contains(e.target)) return;
      togglePresets(false);
    });
    render();
    (function(){
      const row = document.getElementById('allergenChips');
      const prev = document.getElementById('chipsPrev');
      const next = document.getElementById('chipsNext');
      if(!row) return;
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
  }catch(e){
    note('Init error: ' + (e && e.message ? e.message : e));
    console.error(e);
  }
}

document.addEventListener('DOMContentLoaded', ()=>{ init(); buildLegend(); });
