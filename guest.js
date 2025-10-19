
// Guest Mode controller — stable overlay
// Author: ChatGPT
// Password to exit guest mode:
const STAFF_PASSWORD = "shangshi";

(function(){
  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  const els = {
    body: document.body,
    guestToggle: $("#guestToggle"),
    guestBadge: $("#guestBadge"),
    grid: $("#grid"),
    chips: $("#chips"),
    pickedBtn: $("#pickedBtn"),
    pickedCount: $("#pickedCount"),
    pickedModal: $("#pickedModal"),
    pickedClose: $("#pickedClose"),
    pickedList: $("#pickedList"),
    pickedClear: $("#pickedClear"),
    pickedCopy: $("#pickedCopy"),
    resetBtn: $("#resetBtn"),
    addBtn: $("#addDishBtn"),
  };

  const state = {
    guest: false,
    picked: new Map(), // key -> { name, nodeRef }
  };


  // --- Password Modal for exiting Guest Mode ---
  function ensurePasswordModal(){
    if(document.getElementById("gmPwdModal")) return;
    const modal = document.createElement("div");
    modal.className = "modal hidden";
    modal.id = "gmPwdModal";
    modal.setAttribute("aria-hidden","true");
    modal.innerHTML = `<div class="modal-content" role="dialog" aria-modal="true" aria-labelledby="gmPwdTitle">
      <button class="modal-close" id="gmPwdClose" aria-label="Close">
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <div class="modal-head"><h3 id="gmPwdTitle">Staff Access</h3></div>
      <div class="modal-content-inner">
        <label class="field wide"><span class="lbl">Enter staff password</span>
          <input type="password" id="gmPwdInput" placeholder="••••••••" autocomplete="current-password"/>
        </label>
      </div>
      <div class="form-actions">
        <button class="btn btn-secondary" id="gmPwdCancel">Cancel</button>
        <button class="btn btn-primary" id="gmPwdSubmit">Unlock</button>
      </div>
    </div>`;
    document.body.appendChild(modal);
    // bindings
    document.getElementById("gmPwdClose").addEventListener("click", closePwdModal);
    document.getElementById("gmPwdCancel").addEventListener("click", closePwdModal);
    document.getElementById("gmPwdSubmit").addEventListener("click", submitPwdModal);
    document.addEventListener("keydown", (e)=>{ if(e.key === "Escape") closePwdModal(); });
  }
  function openPwdModal(){
    ensurePasswordModal();
    const m = document.getElementById("gmPwdModal");
    m?.classList.remove("hidden");
    const input = document.getElementById("gmPwdInput");
    if(input){ input.value=""; setTimeout(()=> input.focus(), 10); }
  }
  function closePwdModal(){
    const m = document.getElementById("gmPwdModal");
    m?.classList.add("hidden");
    // Re-check the toggle visually if we didn't exit
    if(state.guest && els.guestToggle) els.guestToggle.checked = true;
  }
  function submitPwdModal(){
    const input = document.getElementById("gmPwdInput");
    const pass = input ? input.value : "";
    if(pass === STAFF_PASSWORD){
      // proceed to exit guest mode
      state.guest = true; // force different path in setGuestMode
      closePwdModal();
      actuallySetGuestMode(false);
    } else {
      alert("Incorrect password.");
    }
  }

  // --- Utilities ---
  function getActiveAllergenCodes(){
    const chips = els.chips ? $$(".chip.active", els.chips) : [];
    return chips.map(ch => {
      const b = ch.querySelector("b");
      const raw = (b ? b.textContent : ch.textContent).trim();
      const code = raw.split(/\s+/)[0].replace(/[^A-Za-z]/g,"").toUpperCase();
      return code;
    }).filter(Boolean);
  }

  function updatePickedUI(){
    if(els.pickedCount) els.pickedCount.textContent = String(state.picked.size);
    const pill = $("#guestAllergyPill");
    const codes = getActiveAllergenCodes();
    if(pill) pill.textContent = codes.length ? `Allergies: ${codes.join(", ")}` : "Allergies: none";

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
      if(nodeRef && nodeRef.classList) nodeRef.classList.remove("gm-selected");
    }
    state.picked.clear();
  }

  function blockStaffPopup(e){
    if(!state.guest) return;
    // Ignore clicks on form controls or our modals/toggles
    const ctl = e.target.closest('input,button,select,textarea,label,.modal,.gm-switch');
    if(ctl) return;

    let el = e.target.closest('[data-dish],[data-dish-id],.card,.dish-card,.grid-item,.dish,.item');
    if(!el && els.grid){
      let cur = e.target;
      while(cur && cur !== els.grid){
        if(cur.parentElement === els.grid){ el = cur; break; }
        cur = cur.parentElement;
      }
    }
    if(!el) return;

    // Toggle selection
    const titleEl = el.querySelector("h1,h2,h3,h4,.title,.name");
    const key = el.getAttribute("data-dish-id") || el.getAttribute("data-dish") || (titleEl ? titleEl.textContent.trim() : el.textContent.trim()).slice(0,120);

    if(state.picked.has(key)){
      state.picked.delete(key);
      el.classList.remove("gm-selected");
    } else {
      state.picked.set(key, { name: key, nodeRef: el });
      el.classList.add("gm-selected");
    }
    updatePickedUI();

    // Block underlying staff handlers
    e.stopImmediatePropagation?.();
    e.stopPropagation();
    e.preventDefault();
  }

  function setGuestMode(on){
    if(on === state.guest) return;
    if(!on){
      // Show password modal instead of prompt (more reliable)
      openPwdModal();
      return;
    }
    actuallySetGuestMode(on);
  }
    }
    state.guest = on;
    els.body.classList.toggle("guest", on);
    if(els.guestToggle) els.guestToggle.checked = on;
    if(els.guestBadge) els.guestBadge.hidden = !on;

    if(els.addBtn) els.addBtn.style.display = on ? "none" : "";

    if(!on){
      clearPicks();
      updatePickedUI();
    }
    try{ localStorage.setItem("gm_guest", on ? "1" : "0"); }catch(e){}
  }

  function restore(){
    const v = (typeof localStorage !== "undefined") ? localStorage.getItem("gm_guest") : null;
    if(v === "1"){
      state.guest = false; // force edge where setGuestMode will actually toggle
      setGuestMode(true);
    } else {
      setGuestMode(false);
    }
  }

  function openPicked(){ els.pickedModal?.classList?.remove("hidden"); }
  function closePicked(){ els.pickedModal?.classList?.add("hidden"); }
  function copySummary(){
    const codes = getActiveAllergenCodes();
    const names = Array.from(state.picked.keys());
    const text = `Guest allergies: ${codes.join(", ") || "none"}\nPicks (${names.length}):\n- ` + names.join("\n- ");
    (navigator.clipboard?.writeText(text) || Promise.reject()).then(()=>{
      alert("Copied to clipboard.");
    }).catch(()=>{
      prompt("Copy the text below:", text);
    });
  }

  // --- Bindings ---
  function bind(){
    els.guestToggle = els.guestToggle || $("#guestToggle");
    els.guestBadge  = els.guestBadge  || $("#guestBadge");
    els.grid        = els.grid        || $("#grid");
    els.pickedBtn   = els.pickedBtn   || $("#pickedBtn");
    els.pickedCount = els.pickedCount || $("#pickedCount");
    els.pickedModal = els.pickedModal || $("#pickedModal");
    els.pickedClose = els.pickedClose || $("#pickedClose");
    els.pickedList  = els.pickedList  || $("#pickedList");
    els.pickedClear = els.pickedClear || $("#pickedClear");
    els.pickedCopy  = els.pickedCopy  || $("#pickedCopy");
    els.resetBtn    = els.resetBtn    || $("#resetBtn");
    els.addBtn      = els.addBtn      || $("#addDishBtn");
    els.chips       = els.chips       || $("#chips");

    // Toggle
    els.guestToggle?.addEventListener("change", (e)=> setGuestMode(e.target.checked));
    // Selection + block staff modal
    document.addEventListener("click", blockStaffPopup, true);
    // Dock + modal
    els.pickedBtn?.addEventListener("click", openPicked);
    els.pickedClose?.addEventListener("click", closePicked);
    els.pickedClear?.addEventListener("click", ()=>{ clearPicks(); updatePickedUI(); });
    els.pickedCopy?.addEventListener("click", copySummary);
    // Reset must clear guest picks too
    els.resetBtn?.addEventListener("click", ()=>{ clearPicks(); updatePickedUI(); });

    // React to chips changing (MutationObserver) to keep pill current
    if(els.chips){
      const mo = new MutationObserver(updatePickedUI);
      mo.observe(els.chips, {subtree:true, attributes:true, attributeFilter:["class"]});
    }
  }

  // DOM ready (defer-safe)
  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", ()=>{ bind(); restore(); updatePickedUI(); });
  } else {
    bind(); restore(); updatePickedUI();
  }
})();
