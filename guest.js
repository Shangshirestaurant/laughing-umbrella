
// === Guest Mode overlay script (safe to include alongside existing app.js) ===
// You can change the staff password here:
const STAFF_PASSWORD = "shangshi"; // <-- edit if needed

(function(){
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  const state = {
    guest: false,
    picked: new Map(), // key: dish name, value: {name, nodeRef}
  };

  const els = {
    body: document.body,
    guestToggle: $("#guestToggle"),
    guestBadge: $("#guestBadge"),
    grid: $("#grid"),
    pickedBtn: $("#pickedBtn"),
    pickedCount: $("#pickedCount"),
    pickedModal: $("#pickedModal"),
    pickedClose: $("#pickedClose"),
    pickedList: $("#pickedList"),
    pickedClear: $("#pickedClear"),
    pickedCopy: $("#pickedCopy"),
    addBtn: $("#addDishBtn"),
    allergyPill: $("#guestAllergyPill"),
    chips: $("#chips"),
    resetBtn: $("#resetBtn"),
    headerEl: document.querySelector("header"),
    dockEl: document.querySelector(".dock, .dock-inner, footer")
  };

  // Read active allergen codes from chips (expects "<b>GL</b> Gluten" markup)
  function getActiveAllergenCodes(){
    if(!els.chips) return [];
    return $$(".chip.active", els.chips).map(ch => {
      const b = ch.querySelector("b");
      return (b ? b.textContent : ch.textContent).trim().split(/\s+/)[0].replace(/[^A-Z]/gi,"").toUpperCase();
    }).filter(Boolean);
  }

  function setGuestMode(on){
    if(on === state.guest) return;
    if(!on){
      // going from guest -> staff requires password
      const input = prompt("Enter staff password to exit Guest Mode:");
      if(input !== STAFF_PASSWORD){
        // revert UI toggle
        if(els.guestToggle) els.guestToggle.checked = true;
        alert("Incorrect password.");
        return;
      }
    }
    state.guest = on;
    els.body.classList.toggle("guest", on);
    if(els.guestToggle) els.guestToggle.checked = on;
    if(els.guestBadge) els.guestBadge.hidden = !on;

    // Hide add button via CSS (also guard by JS for robustness)
    if(els.addBtn) els.addBtn.style.display = on ? "none" : "";

    // Clear selections when switching off (to avoid lingering guest picks)
    if(!on) clearPicks();
    updatePickedUI();
    persist();
  }


  function ensureGuestUI(){
    // Toggle bar
    if(!$("#guestToggle")){
      const bar = document.createElement("div");
      bar.className = "guest-bar";
      bar.id = "guestBar";
      bar.innerHTML = `<label class="gm-switch">
        <input type="checkbox" id="guestToggle" aria-pressed="false">
        <span class="gm-slider"></span>
        <span class="gm-label">Guest Mode</span>
        <span class="gm-badge" id="guestBadge" hidden>GUEST</span>
      </label>`;
      (els.headerEl || document.body).appendChild(bar);
      els.guestToggle = $("#guestToggle");
      els.guestBadge = $("#guestBadge");
      els.guestToggle?.addEventListener("change", (e)=> setGuestMode(e.target.checked), {passive:true});
    }
    // Picked counter in dock
    if(!$("#pickedBtn")){
      const btn = document.createElement("button");
      btn.className = "filter-btn picked-counter-btn";
      btn.id = "pickedBtn";
      btn.setAttribute("aria-controls","pickedModal");
      btn.setAttribute("aria-label","Open picked dishes");
      btn.innerHTML = `<span id="pickedCount">0</span>`;
      (els.dockEl || document.body).appendChild(btn);
      els.pickedBtn = $("#pickedBtn");
      els.pickedCount = $("#pickedCount");
      els.pickedBtn?.addEventListener("click", openPicked, {passive:true});
    }
    // Picked modal
    if(!$("#pickedModal")){
      const modal = document.createElement("div");
      modal.className = "modal hidden";
      modal.id = "pickedModal";
      modal.setAttribute("aria-hidden","true");
      modal.innerHTML = `<div class="modal-content" role="dialog" aria-modal="true" aria-labelledby="pickedTitle">
        <button class="modal-close" id="pickedClose" aria-label="Close">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        <div class="modal-head"><h3 id="pickedTitle">Guest Picks</h3></div>
        <div class="modal-content-inner">
          <div class="labels"><span class="pill safe-pill" id="guestAllergyPill">Allergies: none</span></div>
          <div id="pickedList" class="picked-list"></div>
        </div>
        <div class="form-actions">
          <button class="btn btn-ghost" id="pickedClear">Clear picks</button>
          <button class="btn btn-primary" id="pickedCopy">Copy summary</button>
        </div>
      </div>`;
      document.body.appendChild(modal);
      els.pickedModal = $("#pickedModal");
      els.pickedClose = $("#pickedClose");
      els.pickedList = $("#pickedList");
      els.pickedClear = $("#pickedClear");
      els.pickedCopy = $("#pickedCopy");
      els.pickedClose?.addEventListener("click", closePicked, {passive:true});
      els.pickedClear?.addEventListener("click", ()=>{ clearPicks(); updatePickedUI(); }, {passive:true});
      els.pickedCopy?.addEventListener("click", copySummary, {passive:true});
    }
  }

  function persist(){
    try{ localStorage.setItem("gm_guest", state.guest ? "1" : "0"); }catch(e){}
  }
  function restore(){
    const v = localStorage.getItem("gm_guest");
    setGuestMode(v === "1");
  }

  function isCard(node){
    return node && node.classList && node.classList.contains("card");
  }

  // Toggle selection on card click (guest mode only)
  function onGridClick(e){
    if(!state.guest) return;
    let card = e.target.closest(".card");
    if(!isCard(card)) return;
    const title = card.querySelector("h3, h4, .title, .name");
    const name = title ? title.textContent.trim() : "Untitled dish";
    if(state.picked.has(name)){
      state.picked.delete(name);
      card.classList.remove("gm-selected");
    } else {
      state.picked.set(name, { name, nodeRef: card });
      card.classList.add("gm-selected");
    }
    updatePickedUI();
  }

  function updatePickedUI(){
    const count = state.picked.size;
    if(els.pickedCount) els.pickedCount.textContent = String(count);
    // Update pill with current allergies
    const codes = getActiveAllergenCodes();
    if(els.allergyPill){
      els.allergyPill.textContent = codes.length ? `Allergies: ${codes.join(", ")}` : "Allergies: none";
    }
    // Render modal list
    if(els.pickedList){
      els.pickedList.innerHTML = "";
      for(const {name} of state.picked.values()){
        const row = document.createElement("div");
        row.className = "picked-row";
        row.innerHTML = `<span class="name">${name}</span>
          <button class="remove" data-name="${name}">Remove</button>`;
        els.pickedList.appendChild(row);
      }
    }
  }

  function clearPicks(){
    for(const {nodeRef} of state.picked.values()){
      if(nodeRef) nodeRef.classList.remove("gm-selected");
    }
    state.picked.clear();
  }

  function openPicked(){ els.pickedModal?.classList.remove("hidden"); }
  function closePicked(){ els.pickedModal?.classList.add("hidden"); }

  function copySummary(){
    const codes = getActiveAllergenCodes();
    const names = Array.from(state.picked.keys());
    const text = `Guest allergies: ${codes.join(", ") || "none"}\nPicks (${names.length}):\n- ` + names.join("\n- ");
    navigator.clipboard?.writeText(text).then(()=>{
      alert("Copied guest picks to clipboard.");
    }).catch(()=>{
      // Fallback
      prompt("Copy the text below:", text);
    });
  }

  
  
  // Unified capture-phase handler:
  // - When in Guest Mode and a .card is clicked,
  //   toggle selection (gold glow + count), then block staff handlers.
  function captureSelectAndBlock(e){
    if(!state.guest) return;
    const card = e.target.closest && e.target.closest(".card");
    if(!card) return;

    // derive dish name
    const title = card.querySelector("h3, h4, .title, .name");
    const name = title ? title.textContent.trim() : "Untitled dish";

    if(state.picked.has(name)){
      // unselect
      state.picked.delete(name);
      card.classList.remove("gm-selected");
    } else {
      // select
      state.picked.set(name, { name, nodeRef: card });
      card.classList.add("gm-selected");
    }
    updatePickedUI();

    // now block the default/detail popups
    e.stopImmediatePropagation?.();
    e.stopPropagation();
    e.preventDefault();
  }
// Restore persisted guest mode on load
  restore();
  setTimeout(ensureGuestUI, 300);
  // Initial UI sync
  updatePickedUI();
})();
