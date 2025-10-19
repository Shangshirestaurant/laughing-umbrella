
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
    chips: $("#chips")
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

  
  // Capture-phase blocker to prevent staff dish popups while in Guest Mode
  function captureBlocker(e){
    if(!state.guest) return;
    const card = e.target.closest && e.target.closest(".card");
    if(card){
      // prevent any underlying handlers (like staff detail modals)
      e.stopImmediatePropagation?.();
      e.stopPropagation();
      e.preventDefault();
    }
  }

  // Event wiring
  els.guestToggle?.addEventListener("change", (e)=> setGuestMode(e.target.checked), {passive:true});
  els.grid?.addEventListener("click", captureBlocker, true);
els.grid?.addEventListener("click", onGridClick);
  document.addEventListener("click", captureBlocker, true);
  els.pickedBtn?.addEventListener("click", openPicked, {passive:true});
  els.pickedClose?.addEventListener("click", closePicked, {passive:true});
  els.pickedClear?.addEventListener("click", ()=>{ clearPicks(); updatePickedUI(); }, {passive:true});
  els.pickedList?.addEventListener("click", (e)=>{
    const btn = e.target.closest(".remove");
    if(!btn) return;
    const name = btn.getAttribute("data-name");
    if(state.picked.has(name)){
      const entry = state.picked.get(name);
      entry?.nodeRef?.classList?.remove("gm-selected");
      state.picked.delete(name);
      updatePickedUI();
    }
  });
  els.pickedCopy?.addEventListener("click", copySummary, {passive:true});

  // If chips change, reflect allergy pill text
  const chipsObserver = new MutationObserver(updatePickedUI);
  if(els.chips){
    chipsObserver.observe(els.chips, {attributes:true, subtree:true, attributeFilter:["class"]});
  }

  // Restore persisted guest mode on load
  restore();
  // Initial UI sync
  updatePickedUI();
})();
