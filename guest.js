const STORAGE_KEY = 'guestSelection';
const selection = new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'));
const $ = sel => document.querySelector(sel);
const slug = s => String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
const idOf = d => d.id || slug(d.name);
let DATA = [];
function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify([...selection])); updateCount(); renderDrawer(); }
function updateCount(){ $('#selCount').textContent = String(selection.size); }
function toggle(id){ if (selection.has(id)) selection.delete(id); else selection.add(id); save(); const card = document.querySelector(`[data-id="${id}"]`); if (card){ card.classList.toggle('selected', selection.has(id)); } }
function card(d){
  const a = document.createElement('article'); a.className='card'; const id = idOf(d); a.dataset.id = id;
  a.innerHTML = `<div class="select-chip">✓</div><h3>${d.name}</h3>${d.description?`<p>${d.description}</p>`:''}${d.price?`<div class="price">${d.price}</div>`:''}<div>${(d.allergens||[]).map(c=>`<span class="chip">${c}</span>`).join('')}</div>`;
  a.addEventListener('click', ()=>toggle(id), {passive:true});
  a.querySelector('.select-chip').addEventListener('click', (e)=>{ e.stopPropagation(); toggle(id); }, {passive:true});
  a.classList.toggle('selected', selection.has(id)); return a;
}
function render(){ const grid = $('#grid'); grid.innerHTML=''; DATA.forEach(d=>grid.appendChild(card(d))); }
function renderDrawer(){
  const ul = $('#selectionList'); ul.innerHTML='';
  [...selection].forEach(id => { const d = DATA.find(x=>idOf(x)===id); const li = document.createElement('li');
    li.innerHTML = `<span>${d?.name||id}</span><button class="guest-btn" style="height:30px;padding:0 10px;">Remove</button>`;
    li.querySelector('button').onclick = ()=>toggle(id); ul.appendChild(li); });
}
async function boot(){
  updateCount();
  $('#toggleDrawer').onclick = ()=> $('#selectionDrawer').classList.add('open');
  $('#closeDrawer').onclick = ()=> $('#selectionDrawer').classList.remove('open');
  $('#clearSel').onclick = ()=> { selection.clear(); save(); render(); };
  const res = await fetch('./menu.json'); DATA = await res.json(); DATA.forEach(d=>{ if(!d.id) d.id = idOf(d); });
  render(); renderDrawer();
}
document.addEventListener('DOMContentLoaded', boot);
