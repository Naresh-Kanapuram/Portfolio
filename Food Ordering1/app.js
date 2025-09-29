/* Utilities */
const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);

const state = {
  cat: 'All',
  search: '',
  sort: 'default',
  filter: { free: false, disc: false, vegOnly: false },
  cart: [],
  coupon: null,
  lastOrder: null,
  trackingTimer: null
};

function formatRs(x){ return `₹${x.toFixed(0)}`; }

/* Luhn algorithm for card number validation (client-side check) */
function luhnValid(numStr){
  const s = (numStr || '').replace(/\D/g, '');
  if(!s) return false;
  let sum = 0, alt = false;
  for(let i=s.length-1;i>=0;i--){
    let d = parseInt(s[i],10);
    if(alt){ d *= 2; if(d>9) d -= 9; }
    sum += d;
    alt = !alt;
  }
  return (sum % 10) === 0;
}

/* Simple toast */
let toastTO = null;
function showToast(msg){
  const el = $('#toast');
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(toastTO);
  toastTO = setTimeout(()=> el.classList.add('hidden'), 2200);
}

/* Overlay handling (for cart drawer) */
function openOverlay(){
  const ov = $('#overlay');
  ov.classList.remove('hidden');
  ov.setAttribute('aria-hidden','false');
}
function closeOverlay(){
  const ov = $('#overlay');
  ov.classList.add('hidden');
  ov.setAttribute('aria-hidden','true');
}

/* Veg/Non-veg marker */
function vegBadge(isVeg){
  return `<span class="badge-dot" title="${isVeg ? 'Vegetarian' : 'Non‑Vegetarian'}">
    ${isVeg ? '<span class="veg"></span>' : '<span class="nonveg"></span>'}
  </span>`;
}

function priceBlock(p){
  const price = p.price;
  const mrp = p.mrp;
  const off = Math.max(0, Math.round((1 - price/mrp) * 100));
  return `<div class="price-wrap">
    <span class="price">${formatRs(price)}</span>
    <span class="mrp">${formatRs(mrp)}</span>
    <span class="off">-${off}%</span>
  </div>`;
}

function card(p){
  return `<article class="card" role="listitem">
    <img src="assets/images/${p.img}" class="card-img" alt="${p.name}"/>
    <div class="card-body">
      <div class="row-flex">
        <span class="title">${p.name}</span>
        ${vegBadge(p.veg)}
      </div>
      <div class="subtitle">${p.cat} • ⭐ ${p.rating.toFixed(1)}</div>
      ${priceBlock(p)}
      <div class="badges">
        ${p.tags.slice(0,3).map(t=>`<span class="tag">${t}</span>`).join('')}
        ${p.discount >= 15 ? '<span class="tag">Deal</span>' : ''}
        ${p.price >= p.freeDeliveryAbove ? '<span class="tag">Free Delivery</span>' : ''}
      </div>
      <button class="add-btn" data-id="${p.id}">Add to Cart</button>
    </div>
  </article>`;
}

/* Filtering + sorting */
function getFiltered(){
  const {cat, search, filter} = state;
  let arr = PRODUCTS.slice();

  if(cat !== 'All'){
    if(cat === 'Veg') arr = arr.filter(p=>p.veg === true);
    else if(cat === 'Non-Veg') arr = arr.filter(p=>p.veg === false);
    else arr = arr.filter(p=>p.cat === cat);
  }
  if(search){
    const s = search.toLowerCase();
    arr = arr.filter(p =>
      p.name.toLowerCase().includes(s) ||
      p.cat.toLowerCase().includes(s) ||
      p.tags.join(' ').toLowerCase().includes(s)
    );
  }
  if(filter.free) arr = arr.filter(p => p.price >= p.freeDeliveryAbove);
  if(filter.disc) arr = arr.filter(p => p.discount >= 15);
  if(filter.vegOnly) arr = arr.filter(p => p.veg);

  return sortItems(arr);
}

function sortItems(arr){
  const s = state.sort;
  if(s === 'price-asc') arr.sort((a,b)=>a.price-b.price);
  if(s === 'price-desc') arr.sort((a,b)=>b.price-a.price);
  if(s === 'discount-desc') arr.sort((a,b)=>b.discount-a.discount);
  if(s === 'rating-desc') arr.sort((a,b)=>b.rating-a.rating);
  return arr;
}

/* Render main grid */
function renderGrid(){
  const grid = $('#productGrid');
  const items = getFiltered();
  grid.innerHTML = items.map(card).join('');
  $('#emptyState').classList.toggle('hidden', items.length>0);
}

/* Recommended strip (top rated or tagged recommended) */
function getRecommended(){
  const top = PRODUCTS.filter(p=>p.tags.includes('recommended') || p.rating>=4.5);
  return sortItems(top).slice(0, 12);
}
function renderRecommended(){
  const strip = $('#recommendStrip');
  strip.innerHTML = getRecommended().map(p => `
    <div class="card" style="min-width:260px">
      <img src="assets/images/${p.img}" alt="${p.name}" class="card-img"/>
      <div class="card-body">
        <div class="row-flex">
          <span class="title">${p.name}</span>${vegBadge(p.veg)}
        </div>
        ${priceBlock(p)}
        <button class="add-btn" data-id="${p.id}">Add</button>
      </div>
    </div>
  `).join('');
}

/* Cart helpers */
function findInCart(id){ return state.cart.find(it=>it.id===id); }
function cartCount(){ return state.cart.reduce((s, it)=>s+it.qty, 0); }
function calcSubtotal(){
  return state.cart.reduce((s, it)=>{
    const p = PRODUCTS.find(pp=>pp.id===it.id);
    return s + p.price*it.qty;
  }, 0);
}
function calcDiscount(subtotal){
  if(!state.coupon) return 0;
  const c = COUPONS[state.coupon];
  if(!c || subtotal < (c.min||0)) return 0;
  if(c.type==='flat') return Math.min(c.value, subtotal);
  if(c.type==='percent') return Math.min(Math.round(subtotal*c.value/100), c.cap||Infinity);
  return 0;
}
function calcDelivery(subtotal, afterDisc){
  if(state.coupon && COUPONS[state.coupon]?.type==='deliveryFree' && afterDisc >= (COUPONS[state.coupon].min||0)) return 0;
  if(afterDisc >= DELIVERY.freeAbove) return 0;
  return DELIVERY.baseFee;
}
function updateSummary(){
  const sub = calcSubtotal();
  const disc = calcDiscount(sub);
  const totalPre = Math.max(0, sub - disc);
  const dlv = calcDelivery(sub, totalPre);
  const total = totalPre + dlv;

  $('#subtotalVal').textContent = formatRs(sub);
  $('#discountVal').textContent = `-`+formatRs(disc);
  $('#deliveryVal').textContent = formatRs(dlv);
  $('#totalVal').textContent = formatRs(total);
  $('#cartCount').textContent = cartCount();
  saveCart();
}

function renderCart(){
  const c = $('#cartItems');
  if(state.cart.length===0){
    c.innerHTML = `<div class="empty">Cart is empty</div>`;
  }else{
    c.innerHTML = state.cart.map(it=>{
      const p = PRODUCTS.find(pp=>pp.id===it.id);
      const line = p.price * it.qty;
      return `<div class="cart-item" data-id="${it.id}">
        <img src="assets/images/${p.img}" alt="${p.name}"/>
        <div>
          <div class="row-flex">
            <div class="title">${p.name}</div>
            ${vegBadge(p.veg)}
          </div>
          <div class="subtitle">Line: ${formatRs(line)}</div>
          <div class="qty">
            <button class="qty-dec" aria-label="Decrease">−</button>
            <span>${it.qty}</span>
            <button class="qty-inc" aria-label="Increase">+</button>
            <button class="icon-btn remove-item" style="margin-left:auto">Remove</button>
          </div>
        </div>
        <div class="price">${formatRs(p.price)}</div>
      </div>`;
    }).join('');
  }
  updateSummary();
}

/* Cart drawer */
function openCart(){
  $('#cartDrawer').classList.add('open');
  $('#cartDrawer').setAttribute('aria-hidden','false');
  openOverlay();
}
function closeCart(){
  $('#cartDrawer').classList.remove('open');
  $('#cartDrawer').setAttribute('aria-hidden','true');
  closeOverlay();
}

/* Storage */
function saveCart(){
  try{
    localStorage.setItem('zb_cart', JSON.stringify({cart: state.cart, coupon: state.coupon}));
  }catch(e){}
}
function loadCart(){
  try{
    const raw = localStorage.getItem('zb_cart');
    if(raw){
      const obj = JSON.parse(raw);
      state.cart = Array.isArray(obj.cart) ? obj.cart : [];
      state.coupon = obj.coupon || null;
      if(state.coupon) $('#couponInput').value = state.coupon;
    }
  }catch(e){}
}

function saveOrder(){
  try{
    localStorage.setItem('zb_lastOrder', JSON.stringify(state.lastOrder));
  }catch(e){}
}
function loadOrder(){
  try{
    const raw = localStorage.getItem('zb_lastOrder');
    if(raw){
      state.lastOrder = JSON.parse(raw);
    }
  }catch(e){}
}

/* Apply coupon */
function applyCoupon(code){
  const k = (code||'').trim().toUpperCase();
  if(!k){ showToast('Enter a coupon'); return; }
  if(!COUPONS[k]){ showToast('Invalid coupon'); return; }
  state.coupon = k;
  showToast(`Applied ${k}`);
  updateSummary();
}

/* Add/remove/qty */
function addToCart(id, qty=1){
  const prod = PRODUCTS.find(p=>p.id===id);
  if(!prod) return;
  const ex = findInCart(id);
  if(ex) ex.qty += qty;
  else state.cart.push({id, qty});
  renderCart();
  showToast(`${prod.name} added`);
}
function changeQty(id, delta){
  const ex = findInCart(id);
  if(!ex) return;
  ex.qty += delta;
  if(ex.qty <= 0){
    state.cart = state.cart.filter(it=>it.id!==id);
    showToast('Removed from cart');
  }
  renderCart();
}
function removeFromCart(id){
  const ex = findInCart(id);
  if(!ex) return;
  state.cart = state.cart.filter(it=>it.id!==id);
  renderCart();
  showToast('Removed from cart');
}

/* Checkout + Payment */
function setPayMode(mode){
  const showCard = mode === 'CARD';
  const showUpi = mode === 'UPI';
  $('#cardFields').classList.toggle('hidden', !showCard);
  $('#upiFields').classList.toggle('hidden', !showUpi);
}

function validExpiry(mmYY){
  const m = (mmYY||'').trim().split('/');
  if(m.length!==2) return false;
  const mm = parseInt(m[0],10), yy = parseInt(m[1],10);
  if(isNaN(mm) || isNaN(yy) || mm<1 || mm>12) return false;
  const now = new Date();
  const curYY = now.getFullYear() % 100;
  const curMM = now.getMonth() + 1;
  if(yy < curYY) return false;
  if(yy === curYY && mm < curMM) return false;
  return true;
}

function validUPI(u){
  return /^[a-zA-Z0-9.\-_]{2,}@[a-zA-Z]{2,}$/.test((u||'').trim());
}

/* Timeline */
function renderTrackingTimeline(index){
  const wrap = $('#trackingTimeline');
  wrap.innerHTML = TRACK_STATES.map((st, i)=>`
    <div class="step ${i<=index ? 'done':''}">
      <div class="dot"></div>
      <div>
        <div class="title">${st.label}</div>
        <div class="txt">${i<=index ? 'Completed' : 'Pending'}</div>
      </div>
    </div>
  `).join('');
}

function startLiveTracking(){
  if(!state.lastOrder) return;
  if(state.trackingTimer) return;
  const advance = ()=>{
    if(!state.lastOrder) return;
    let idx = state.lastOrder.statusIndex || 0;
    if(idx >= TRACK_STATES.length-1){
      clearInterval(state.trackingTimer);
      state.trackingTimer = null;
      showToast('Delivered');
      return;
    }
    idx += 1;
    state.lastOrder.statusIndex = idx;
    renderTrackingTimeline(idx);
    saveOrder();
    if(idx >= TRACK_STATES.length-1){
      clearInterval(state.trackingTimer);
      state.trackingTimer = null;
    }
  };
  state.trackingTimer = setInterval(advance, 5000);
}

/* Open/close checkout modal */
function openCheckout(){
  if(state.cart.length===0){ showToast('Cart is empty'); return; }
  const dlg = $('#checkoutModal');
  dlg.showModal();
}
function closeCheckout(){
  const dlg = $('#checkoutModal');
  if(dlg.open) dlg.close();
}

/* Order confirm modal */
function openConfirm(){
  const dlg = $('#orderConfirmModal');
  dlg.showModal();
}
function closeConfirm(){
  const dlg = $('#orderConfirmModal');
  if(dlg.open) dlg.close();
}

/* Place order flow */
function placeOrder(formEv){
  formEv.preventDefault();
  const name = $('#nameInput').value.trim();
  const phone = $('#phoneInput').value.trim();
  const addr = $('#addrInput').value.trim();
  const pin = $('#pinInput').value.trim();
  if(!name || !phone || !addr || !pin){ showToast('Fill all details'); return; }
  const pay = [...document.querySelectorAll('input[name="pay"]')].find(r=>r.checked)?.value || 'CARD';

  if(pay === 'CARD'){
    const num = $('#cardNumber').value;
    const exp = $('#cardExpiry').value;
    const cvv = $('#cardCVV').value;
    if(!luhnValid(num)){ showToast('Card number invalid'); return; }
    if(!validExpiry(exp)){ showToast('Expiry invalid'); return; }
    if(!/^\d{3,4}$/.test(cvv)){ showToast('CVV invalid'); return; }
  }else if(pay === 'UPI'){
    const upi = $('#upiId').value;
    if(!validUPI(upi)){ showToast('UPI ID invalid'); return; }
  }

  // Simulate processing
  $('#placeOrderBtn').disabled = true;
  setTimeout(()=>{
    $('#placeOrderBtn').disabled = false;
    confirmOrder(name);
  }, 800);
}

function confirmOrder(customerName){
  const sub = calcSubtotal();
  const disc = calcDiscount(sub);
  const totalPre = Math.max(0, sub - disc);
  const dlv = calcDelivery(sub, totalPre);
  const total = totalPre + dlv;

  const id = 'ZB-' + Date.now().toString(36).toUpperCase().slice(-6);
  const etaMin = 35 + Math.floor(Math.random()*20);
  const etaText = `${etaMin} mins`;

  state.lastOrder = {
    id, etaMin, etaText,
    at: Date.now(),
    statusIndex: 0,
    items: state.cart.map(x=>({...x})),
    total, customerName
  };
  saveOrder();

  // Update confirm modal UI
  $('#orderIdText').textContent = id;
  $('#etaText').textContent = etaText;
  renderTrackingTimeline(0);

  // Reset cart and close drawers/modals
  state.cart = [];
  state.coupon = null;
  $('#couponInput').value = '';
  renderCart();
  closeCheckout();
  closeCart();

  // Show confirmation
  openConfirm();
  showToast('Order confirmed');

  // Auto-advance first step after a short delay
  setTimeout(()=>{
    if(!state.lastOrder) return;
    state.lastOrder.statusIndex = 1;
    renderTrackingTimeline(1);
    saveOrder();
  }, 3000);
}

/* UI bindings */
function bindEvents(){
  // Category buttons
  $$('.cat-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      $$('.cat-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      state.cat = btn.dataset.cat;
      renderGrid();
    });
  });

  // Search
  $('#searchInput').addEventListener('input', (e)=>{
    state.search = e.target.value;
    renderGrid();
  });

  // Sort
  $('#sortSelect').addEventListener('change', (e)=>{
    state.sort = e.target.value;
    renderGrid();
  });

  // Filters
  $('#filterFreeDelivery').addEventListener('change', e=>{
    state.filter.free = e.target.checked;
    renderGrid();
  });
  $('#filterDiscounted').addEventListener('change', e=>{
    state.filter.disc = e.target.checked;
    renderGrid();
  });
  $('#filterVegOnly').addEventListener('change', e=>{
    state.filter.vegOnly = e.target.checked;
    renderGrid();
  });

  // Recommend strip scroll
  $('#recLeft').addEventListener('click', ()=>{
    $('#recommendStrip').scrollBy({left: -300, behavior:'smooth'});
  });
  $('#recRight').addEventListener('click', ()=>{
    $('#recommendStrip').scrollBy({left: 300, behavior:'smooth'});
  });

  // Cart open/close
  $('#openCartBtn').addEventListener('click', openCart);
  $('#closeCartBtn').addEventListener('click', closeCart);
  $('#overlay').addEventListener('click', closeCart);

  // Delegated clicks for product grid + recommend strip + cart
  document.addEventListener('click', (e)=>{
    // Add to cart
    const addBtn = e.target.closest('.add-btn');
    if(addBtn && addBtn.dataset.id){
      addToCart(addBtn.dataset.id, 1);
      return;
    }

    // Qty and remove inside cart
    const cartItem = e.target.closest('.cart-item');
    if(cartItem){
      const id = cartItem.dataset.id;
      if(e.target.closest('.qty-inc')){
        changeQty(id, +1);
        return;
      }
      if(e.target.closest('.qty-dec')){
        changeQty(id, -1);
        return;
      }
      if(e.target.closest('.remove-item')){
        removeFromCart(id);
        return;
      }
    }

    // Apply coupon
    if(e.target.id === 'applyCouponBtn'){
      applyCoupon($('#couponInput').value);
      return;
    }

    // Checkout open
    if(e.target.id === 'checkoutBtn'){
      openCheckout();
      return;
    }

    // Back from checkout to cart
    if(e.target.id === 'backToCart'){
      closeCheckout();
      openCart();
      return;
    }

    // Close checkout modal X
    if(e.target.id === 'closeCheckout'){
      closeCheckout();
      return;
    }

    // Confirm modal controls
    if(e.target.id === 'closeConfirm'){
      closeConfirm();
      return;
    }
    if(e.target.id === 'newOrderBtn'){
      closeConfirm();
      showToast('Start a new order');
      return;
    }
    if(e.target.id === 'trackLiveBtn'){
      startLiveTracking();
      showToast('Live tracking started');
      return;
    }
  });

  // Payment mode toggle
  $$('input[name="pay"]').forEach(r=>{
    r.addEventListener('change', ()=>{
      setPayMode(r.value);
    });
  });

  // Checkout submit
  $('#checkoutForm').addEventListener('submit', placeOrder);

  // Close confirm on Esc is handled by dialog, no extra code needed
}

/* Init */
function init(){
  loadCart();
  loadOrder();
  renderRecommended();
  renderGrid();
  renderCart();
  setPayMode('CARD'); // default

  // If there is a last order and user opens confirm later, keep status when opened again
  if(state.lastOrder){
    $('#orderIdText').textContent = state.lastOrder.id || '';
    $('#etaText').textContent = state.lastOrder.etaText || '';
    renderTrackingTimeline(state.lastOrder.statusIndex || 0);
  }

  bindEvents();
}

document.addEventListener('DOMContentLoaded', init);
