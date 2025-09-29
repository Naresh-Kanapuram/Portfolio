// script.js

/* Helpers */
const $ = (q, c = document) => c.querySelector(q);
const $$ = (q, c = document) => [...c.querySelectorAll(q)];
const fmt = n => "₹" + Number(n || 0).toLocaleString("en-IN");
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

/* Persistent State */
let state = {
  view: "grid",
  page: 1,
  pageSize: 12,
  cat: "all",
  brand: "all",
  sort: "featured",
  query: "",
  cart: JSON.parse(localStorage.getItem("nm_cart") || "[]"),
  wishlist: JSON.parse(localStorage.getItem("nm_wishlist") || "[]"),
  lastOrder: JSON.parse(localStorage.getItem("nm_last_order") || "null"),
  trackingTimer: null,
  heroIndex: 0,
};

function saveCart() {
  localStorage.setItem("nm_cart", JSON.stringify(state.cart));
  updateCartCount();
}
function saveWishlist() {
  localStorage.setItem("nm_wishlist", JSON.stringify(state.wishlist));
  updateWishlistCount();
}
function saveLastOrder(order) {
  state.lastOrder = order;
  localStorage.setItem("nm_last_order", JSON.stringify(order));
}

/* Toasts */
function toast(msg, type = "ok", t = 2200) {
  const wrap = $("#toasts");
  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.innerHTML = `<i class="fa-solid ${type==='ok'?'fa-circle-check':type==='warn'?'fa-circle-exclamation':'fa-circle-xmark'}"></i><span>${msg}</span>`;
  wrap.appendChild(el);
  setTimeout(() => {
    el.style.opacity = "0";
    setTimeout(() => el.remove(), 240);
  }, t);
}

/* Ratings */
function stars(rating = 0) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return `${"★".repeat(full)}${half ? "½" : ""}${"☆".repeat(empty)}`;
}

/* Build brand filter */
function buildBrandFilter() {
  const sel = $("#filterBrand");
  sel.innerHTML = `<option value="all">All Brands</option>` + BRANDS.map(b => `<option value="${b}">${b}</option>`).join("");
}

/* Skeletons */
function showSkeleton() {
  const grid = $("#skeletonGrid");
  grid.innerHTML = "";
  grid.classList.remove("hidden");
  for (let i = 0; i < 8; i++) {
    const card = document.createElement("div");
    card.className = "card";
    card.style.height = "360px";
    grid.appendChild(card);
  }
  grid.classList.add("skeleton");
  grid.style.display = "grid";
}
function hideSkeleton() {
  const grid = $("#skeletonGrid");
  grid.classList.remove("skeleton");
  grid.style.display = "none";
}

/* Filtering, sorting, paging */
function filteredProducts() {
  let list = PRODUCTS.slice();

  if (state.cat !== "all") {
    list = list.filter(p => p.category === state.cat);
  }
  if (state.brand !== "all") {
    list = list.filter(p => p.brand === state.brand);
  }
  if (state.query.trim()) {
    const q = state.query.trim().toLowerCase();
    list = list.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      (p.desc || "").toLowerCase().includes(q)
    );
  }

  switch (state.sort) {
    case "price-asc": list.sort((a,b)=> a.price - b.price); break;
    case "price-desc": list.sort((a,b)=> b.price - a.price); break;
    case "rating-desc": list.sort((a,b)=> b.rating - a.rating); break;
    case "newest": list.sort((a,b)=> (b.newest||0) - (a.newest||0)); break;
    default: { // featured
      list.sort((a,b)=> Number((b.tags||[]).includes("bestseller")) - Number((a.tags||[]).includes("bestseller")));
    }
  }

  return list;
}

/* Render products */
function productCard(p) {
  const inWish = state.wishlist.includes(p.id);
  return `
  <div class="card" data-id="${p.id}">
    <div class="card-media">
      <img src="${p.img}" alt="${p.title}">
      <div class="card-tags">
        ${(p.tags||[]).map(t=>`<span class="tag">${t}</span>`).join("")}
      </div>
    </div>
    <div class="card-body">
      <div class="card-title">${p.title}</div>
      <div class="card-meta">
        <span>${p.brand}</span>
        <span class="rating" title="${p.rating}">${stars(p.rating)}</span>
      </div>
      <div class="price">
        <span class="curr">${fmt(p.price)}</span>
        <span class="mrp">${fmt(p.mrp)}</span>
        <span class="off">${Math.round(100 - (p.price/p.mrp)*100)}% off</span>
      </div>
    </div>
    <div class="card-actions">
      <button class="btn add-cart"><i class="fa-solid fa-cart-plus"></i> Add</button>
      <button class="btn btn-ghost quick-view"><i class="fa-regular fa-eye"></i> View</button>
      <button class="icon-btn wish ${inWish?'active':''}" title="Wishlist">
        <i class="${inWish?'fa-solid':'fa-regular'} fa-heart"></i>
      </button>
    </div>
  </div>`;
}

function renderProducts(append = false) {
  const grid = $("#productsGrid");
  const all = filteredProducts();
  const start = 0;
  const end = state.page * state.pageSize;
  const pageItems = all.slice(start, end);

  const cards = pageItems.map(productCard).join("");
  if (!append) grid.innerHTML = "";
  grid.insertAdjacentHTML("beforeend", cards);

  // Toggle Load More
  $("#loadMore").style.display = end < all.length ? "inline-flex" : "none";

  // Handle list view class
  if (state.view === "list") {
    grid.style.gridTemplateColumns = "1fr";
  } else {
    grid.style.removeProperty("grid-template-columns");
  }
}

/* Category chips and tiles */
function bindCategoryFilters() {
  $$(".cat-chip").forEach(btn => {
    btn.addEventListener("click", () => {
      state.cat = btn.dataset.cat || "all";
      $("#filterCategory").value = state.cat;
      state.page = 1;
      showSkeleton();
      setTimeout(() => {
        hideSkeleton();
        renderProducts(false);
      }, 400);
    });
  });
  $$(".tile").forEach(t => {
    t.addEventListener("click", () => {
      state.cat = t.dataset.cat;
      $("#filterCategory").value = state.cat;
      state.page = 1;
      showSkeleton();
      setTimeout(() => {
        hideSkeleton();
        renderProducts(false);
        window.scrollTo({ top: $("#featured").offsetTop - 60, behavior: "smooth" });
      }, 350);
    });
  });
  $$(".ft-cat").forEach(a => {
    a.addEventListener("click", () => {
      state.cat = a.dataset.cat;
      $("#filterCategory").value = state.cat;
      state.page = 1;
      renderProducts(false);
    });
  });
}

/* Header counts */
function updateCartCount() {
  $("#cartCount").textContent = state.cart.reduce((s,i)=> s + i.qty, 0);
}
function updateWishlistCount() {
  $("#wishlistCount").textContent = state.wishlist.length;
}

/* Cart operations */
function addToCart(id, qty = 1) {
  const p = PRODUCTS.find(x=> x.id === id);
  if (!p) return;
  const i = state.cart.find(x=> x.id === id);
  if (i) i.qty = clamp(i.qty + qty, 1, 99);
  else state.cart.push({ id, qty: clamp(qty, 1, 99) });
  saveCart();
  toast("Added to cart");
  renderCartDrawer();
}
function removeFromCart(id) {
  state.cart = state.cart.filter(x=> x.id !== id);
  saveCart();
  renderCartDrawer();
}
function setQty(id, qty) {
  const it = state.cart.find(x=> x.id === id);
  if (!it) return;
  it.qty = clamp(qty, 1, 99);
  saveCart();
  renderCartDrawer();
}

/* Wishlist */
function toggleWishlist(id) {
  if (state.wishlist.includes(id)) {
    state.wishlist = state.wishlist.filter(x=> x !== id);
    toast("Removed from wishlist", "warn");
  } else {
    state.wishlist.push(id);
    toast("Added to wishlist");
  }
  saveWishlist();
  renderWishlistDrawer();
  // update card heart state
  $$(".card[data-id='"+id+"'] .wish i").forEach(el => {
    el.classList.toggle("fa-solid");
    el.classList.toggle("fa-regular");
  });
}

/* Drawers and modals */
function openDrawer(sel) { const el = $(sel); el.classList.add("show"); el.setAttribute("aria-hidden","false"); }
function closeDrawer(sel) { const el = $(sel); el.classList.remove("show"); el.setAttribute("aria-hidden","true"); }
function openModal(sel) { const m = $(sel); m.classList.add("show"); m.setAttribute("aria-hidden","false"); }
function closeModal(sel) { const m = $(sel); m.classList.remove("show"); m.setAttribute("aria-hidden","true"); }

function bindDismiss() {
  $$("[data-close]").forEach(btn => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-close");
      if (!target) return;
      const el = $(target);
      if (!el) return;
      if (el.classList.contains("drawer")) closeDrawer(target);
      else closeModal(target);
    });
  });
}

/* Cart Drawer UI */
function renderCartDrawer() {
  const body = $("#cartItems");
  const summary = calcCartTotals();
  if (state.cart.length === 0) {
    body.innerHTML = `<div class="cart-item" style="display:grid;place-items:center;height:120px">Cart is empty</div>`;
  } else {
    body.innerHTML = state.cart.map(ci => {
      const p = PRODUCTS.find(x=> x.id === ci.id);
      return `
      <div class="cart-item" data-id="${ci.id}">
        <img src="${p.img}" alt="${p.title}">
        <div>
          <div class="card-title">${p.title}</div>
          <div class="price"><span class="curr">${fmt(p.price)}</span> <span class="mrp">${fmt(p.mrp)}</span></div>
          <div class="qty">
            <button class="dec">-</button>
            <input class="qinput" type="number" min="1" max="99" value="${ci.qty}">
            <button class="inc">+</button>
          </div>
        </div>
        <div>
          <div>${fmt(p.price * ci.qty)}</div>
          <button class="icon-btn remove" title="Remove"><i class="fa-solid fa-trash"></i></button>
        </div>
      </div>`;
    }).join("");
  }
  $("#cartSubtotal").textContent = fmt(summary.subtotal);
  $("#cartShipping").textContent = fmt(summary.shipping);
  $("#cartDiscount").textContent = "-"+fmt(summary.discount);
  $("#cartTotal").textContent = fmt(summary.total);
}

function calcCartTotals() {
  const subtotal = state.cart.reduce((s, it) => {
    const p = PRODUCTS.find(x=> x.id === it.id);
    return s + (p ? p.price * it.qty : 0);
  }, 0);
  const shipping = subtotal > 0 && subtotal < 999 ? 99 : 0;
  const discount = subtotal >= 5000 ? Math.round(subtotal * 0.05) : 0;
  const total = subtotal + shipping - discount;
  return { subtotal, shipping, discount, total };
}

/* Wishlist Drawer UI */
function renderWishlistDrawer() {
  const body = $("#wishlistItems");
  if (state.wishlist.length === 0) {
    body.innerHTML = `<div class="cart-item" style="display:grid;place-items:center;height:120px">Wishlist is empty</div>`;
  } else {
    body.innerHTML = state.wishlist.map(id => {
      const p = PRODUCTS.find(x=> x.id === id);
      return `
      <div class="cart-item" data-id="${id}">
        <img src="${p.img}" alt="${p.title}">
        <div>
          <div class="card-title">${p.title}</div>
          <div class="price"><span class="curr">${fmt(p.price)}</span> <span class="mrp">${fmt(p.mrp)}</span></div>
          <div class="qty">
            <button class="btn add-wish-cart"><i class="fa-solid fa-cart-plus"></i> Add to cart</button>
          </div>
        </div>
        <div>
          <button class="icon-btn remove-wish" title="Remove"><i class="fa-solid fa-xmark"></i></button>
        </div>
      </div>`;
    }).join("");
  }
}

/* Quick View */
function openQuickView(p) {
  $("#qvImg").src = p.images?.[0] || p.img;
  $("#qvTitle").textContent = p.title;
  $("#qvRating").textContent = stars(p.rating);
  $("#qvPrice").textContent = fmt(p.price);
  $("#qvMRP").textContent = fmt(p.mrp);
  $("#qvOff").textContent = `${Math.round(100 - (p.price/p.mrp)*100)}% off`;
  $("#qvDesc").textContent = p.desc || "";
  $("#qvMeta").innerHTML = Object.entries(p.specs || {}).map(([k,v]) => `<span class="tag">${k}: ${Array.isArray(v)? v.join(", "): v}</span>`).join(" ");
  // thumbs
  const thumbs = p.images?.length ? p.images : [p.img];
  const wrap = $("#qvThumbs");
  wrap.innerHTML = thumbs.map((u,i)=> `<img src="${u}" data-src="${u}" class="${i===0?'active':''}">`).join("");
  wrap.querySelectorAll("img").forEach(img=>{
    img.addEventListener("click", ()=>{
      wrap.querySelectorAll("img").forEach(x=> x.classList.remove("active"));
      img.classList.add("active");
      $("#qvImg").src = img.dataset.src;
    });
  });
  // actions
  $("#qvAddToCart").onclick = () => addToCart(p.id, 1);
  $("#qvWishlist").onclick = () => toggleWishlist(p.id);

  openModal("#quickView");
}

/* Hero Carousel */
function renderHero() {
  const car = $("#heroCarousel");
  const dots = $("#heroDots");
  car.innerHTML = HERO_SLIDES.map((s, i) => `
    <div class="carousel-slide ${i===state.heroIndex?'is-active':''}" data-index="${i}">
      <img src="${s.img}" alt="${s.title}">
      <div class="hero-overlay" style="position:absolute;left:0;right:0;bottom:0;padding:14px;background:linear-gradient(180deg,transparent,rgba(10,16,32,.9));">
        <div style="font-weight:600">${s.title}</div>
        <div style="color:#a7b7dd">${s.subtitle}</div>
        <div style="margin-top:8px">
          <button class="btn btn-neon hero-cta" data-cat="${s.cta.cat}"><i class="fa-solid fa-bolt"></i> ${s.cta.text}</button>
        </div>
      </div>
    </div>
  `).join("");
  dots.innerHTML = HERO_SLIDES.map((_,i)=> `<button class="carousel-dot ${i===state.heroIndex?'is-active':''}" data-i="${i}" aria-label="Go to slide ${i+1}"></button>`).join("");

  // CTA bindings
  $$(".hero-cta", car).forEach(btn=>{
    btn.addEventListener("click", ()=>{
      state.cat = btn.dataset.cat;
      $("#filterCategory").value = state.cat;
      state.page = 1;
      renderProducts(false);
      window.scrollTo({ top: $("#featured").offsetTop - 60, behavior: "smooth" });
    });
  });
}
function heroNext() {
  state.heroIndex = (state.heroIndex + 1) % HERO_SLIDES.length;
  renderHero();
}
function heroPrev() {
  state.heroIndex = (state.heroIndex - 1 + HERO_SLIDES.length) % HERO_SLIDES.length;
  renderHero();
}
function bindHeroControls() {
  $("#heroNext").addEventListener("click", heroNext);
  $("#heroPrev").addEventListener("click", heroPrev);
  $("#heroDots").addEventListener("click", e=>{
    const b = e.target.closest(".carousel-dot");
    if (!b) return;
    state.heroIndex = Number(b.dataset.i || 0);
    renderHero();
  });
  // auto-advance
  setInterval(heroNext, 5000);
}

/* Search */
function bindSearch() {
  $("#searchForm").addEventListener("submit", e => {
    e.preventDefault();
    state.query = $("#searchInput").value || "";
    state.page = 1;
    renderProducts(false);
  });
}

/* Filters */
function bindFilters() {
  $("#filterCategory").addEventListener("change", e => {
    state.cat = e.target.value;
    state.page = 1;
    renderProducts(false);
  });
  $("#filterBrand").addEventListener("change", e => {
    state.brand = e.target.value;
    state.page = 1;
    renderProducts(false);
  });
  $("#sortBy").addEventListener("change", e => {
    state.sort = e.target.value;
    state.page = 1;
    renderProducts(false);
  });
  $("#gridView").addEventListener("click", ()=>{
    state.view = "grid";
    $("#gridView").classList.add("is-active");
    $("#listView").classList.remove("is-active");
    renderProducts(false);
  });
  $("#listView").addEventListener("click", ()=>{
    state.view = "list";
    $("#listView").classList.add("is-active");
    $("#gridView").classList.remove("is-active");
    renderProducts(false);
  });
  $("#loadMore").addEventListener("click", ()=>{
    state.page += 1;
    renderProducts(true);
  });
}

/* Products interactions: delegation */
function bindProductGridActions() {
  $("#productsGrid").addEventListener("click", e=>{
    const card = e.target.closest(".card");
    if (!card) return;
    const id = card.dataset.id;

    if (e.target.closest(".add-cart")) {
      addToCart(id, 1);
    } else if (e.target.closest(".quick-view")) {
      const p = PRODUCTS.find(x=> x.id === id);
      if (p) openQuickView(p);
    } else if (e.target.closest(".wish")) {
      toggleWishlist(id);
      const btn = e.target.closest(".wish");
      btn.classList.toggle("active");
    }
  });
}

/* Cart drawer bindings */
function bindCartDrawer() {
  $("#cartBtn").addEventListener("click", ()=> {
    renderCartDrawer();
    openDrawer("#cartDrawer");
  });
  $("#wishlistBtn").addEventListener("click", ()=> {
    renderWishlistDrawer();
    openDrawer("#wishlistDrawer");
  });

  $("#cartItems").addEventListener("click", e=>{
    const item = e.target.closest(".cart-item");
    if (!item) return;
    const id = item.dataset.id;

    if (e.target.closest(".inc")) {
      const inp = item.querySelector(".qinput");
      setQty(id, Number(inp.value) + 1);
    }
    if (e.target.closest(".dec")) {
      const inp = item.querySelector(".qinput");
      setQty(id, Number(inp.value) - 1);
    }
    if (e.target.closest(".remove")) {
      removeFromCart(id);
    }
  });
  $("#cartItems").addEventListener("change", e=>{
    const input = e.target.closest(".qinput");
    if (!input) return;
    const wrap = e.target.closest(".cart-item");
    if (!wrap) return;
    const id = wrap.dataset.id;
    setQty(id, Number(input.value || 1));
  });

  $("#wishlistItems").addEventListener("click", e=>{
    const row = e.target.closest(".cart-item");
    if (!row) return;
    const id = row.dataset.id;
    if (e.target.closest(".add-wish-cart")) {
      addToCart(id, 1);
    }
    if (e.target.closest(".remove-wish")) {
      toggleWishlist(id);
      renderWishlistDrawer();
    }
  });
}

/* Checkout */
function openCheckout() {
  if (state.cart.length === 0) {
    toast("Cart is empty", "warn");
    return;
  }
  renderCheckoutSummary();
  openModal("#checkoutModal");
}

function renderCheckoutSummary() {
  const body = $("#coItems");
  body.innerHTML = state.cart.map(ci=>{
    const p = PRODUCTS.find(x=> x.id === ci.id);
    return `
      <div class="cart-item">
        <img src="${p.img}" alt="${p.title}">
        <div>
          <div class="card-title">${p.title}</div>
          <div class="price"><span class="curr">${fmt(p.price)}</span> × ${ci.qty}</div>
        </div>
        <div>${fmt(p.price * ci.qty)}</div>
      </div>`;
  }).join("");
  const s = calcCartTotals();
  $("#coSubtotal").textContent = fmt(s.subtotal);
  $("#coShipping").textContent = fmt(s.shipping);
  $("#coDiscount").textContent = "-"+fmt(s.discount);
  $("#coTotal").textContent = fmt(s.total);
}

function bindCheckout() {
  $("#checkoutBtn").addEventListener("click", openCheckout);
  $("#placeOrder").addEventListener("click", () => {
    // Validate forms
    const ship = $("#shippingForm");
    const pay = $("#paymentForm");
    const shipData = Object.fromEntries(new FormData(ship).entries());
    const payData = Object.fromEntries(new FormData(pay).entries());

    const requiredShip = ["name","phone","email","address","city","pincode","state","country"];
    for (const k of requiredShip) {
      if (!shipData[k] || String(shipData[k]).trim()==="") {
        toast("Please complete shipping details", "err");
        return;
      }
    }
    const requiredPay = ["cardName","cardNumber","expMonth","expYear","cvc"];
    for (const k of requiredPay) {
      if (!payData[k] || String(payData[k]).trim()==="") {
        toast("Please complete payment details", "err");
        return;
      }
    }
    // Very simple fake validation
    const card = payData.cardNumber.replace(/\s|-/g,"");
    if (!/^\d{12,19}$/.test(card)) {
      toast("Enter a valid test card number", "err");
      return;
    }

    // Create order
    const now = Date.now();
    const orderId = "NM" + now.toString(36).toUpperCase();
    const eta = new Date(now + 4*24*60*60*1000); // +4 days
    const items = state.cart.map(ci=>{
      const p = PRODUCTS.find(x=> x.id === ci.id);
      return { id: ci.id, title: p.title, price: p.price, qty: ci.qty, img: p.img };
    });
    const totals = calcCartTotals();
    const order = {
      id: orderId,
      createdAt: now,
      eta: eta.toDateString(),
      statusIndex: 0,
      statusList: ["Order Placed","Packed","Shipped","Out for Delivery","Delivered"],
      items,
      totals,
      shipping: shipData,
    };
    saveLastOrder(order);

    // Clear cart
    state.cart = [];
    saveCart();
    renderCartDrawer();

    // Close checkout, open confirm
    closeModal("#checkoutModal");
    $("#ocOrderId").textContent = orderId;
    $("#ocEta").textContent = order.eta;
    openModal("#orderConfirm");
  });

  $("#goTrack").addEventListener("click", () => {
    closeModal("#orderConfirm");
    openTracking(state.lastOrder?.id);
  });
}

/* Tracking */
function openTracking(orderId) {
  const order = state.lastOrder && state.lastOrder.id === orderId ? state.lastOrder : null;
  if (!order) {
    toast("No recent order found", "warn");
    return;
  }
  renderTracking(order);
  openModal("#orderTracking");

  // Simulate progress if not delivered
  if (order.statusIndex < order.statusList.length - 1) {
    if (state.trackingTimer) clearInterval(state.trackingTimer);
    state.trackingTimer = setInterval(() => {
      const o = state.lastOrder;
      if (!o) return clearInterval(state.trackingTimer);
      if (o.statusIndex >= o.statusList.length - 1) {
        clearInterval(state.trackingTimer);
        return;
      }
      o.statusIndex += 1;
      const logEntry = { t: new Date().toLocaleString(), msg: o.statusList[o.statusIndex] };
      o.logs = (o.logs || []).concat(logEntry);
      saveLastOrder(o);
      renderTracking(o);
      if (o.statusIndex >= o.statusList.length - 1) clearInterval(state.trackingTimer);
    }, 4000);
  }
}

function renderTracking(order) {
  $("#trkOrderId").textContent = order.id;
  $("#trkEta").textContent = order.eta;
  $("#trkStatus").textContent = order.statusList[order.statusIndex];

  const steps = $$(".timeline .step", $("#orderTracking"));
  steps.forEach((s, i) => {
    s.classList.toggle("active", i <= order.statusIndex);
  });

  const log = $("#trkLog");
  log.innerHTML = (order.logs || [{ t: new Date(order.createdAt).toLocaleString(), msg: "Order Placed" }])
    .map(x=> `<div class="log-item"><strong>${x.msg}</strong><br><span>${x.t}</span></div>`).join("");
}

/* Global events and utilities */
function bindGlobal() {
  // Modals: click backdrop to close
  $$(".modal").forEach(m => {
    m.addEventListener("click", e => {
      if (e.target === m) closeModal("#" + m.id);
    });
  });

  // Hamburger toggles category bar on small screens
  $("#hamburger").addEventListener("click", ()=>{
    const nav = $("#categoryNav");
    const isShown = nav.style.display !== "none";
    nav.style.display = isShown ? "none" : "block";
  });

  // Footer year
  $("#year").textContent = new Date().getFullYear();
}

/* Background particles animation */
function startParticles() {
  const canvas = $("#bg-particles");
  const ctx = canvas.getContext("2d");
  let W = canvas.width = window.innerWidth * devicePixelRatio;
  let H = canvas.height = window.innerHeight * devicePixelRatio;
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  ctx.scale(1,1);

  const count = clamp(Math.floor(window.innerWidth / 18), 40, 140);
  const parts = new Array(count).fill(0).map(()=> ({
    x: Math.random() * W,
    y: Math.random() * H,
    r: Math.random() * 2 + 0.5,
    vx: (Math.random() - 0.5) * 0.25,
    vy: (Math.random() - 0.5) * 0.25,
  }));

  function draw(ts) {
    ctx.clearRect(0,0,W,H);
    ctx.globalAlpha = 0.7;
    parts.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
      ctx.beginPath();
      ctx.fillStyle = "#6cf6ff";
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fill();
    });
    // soft connections
    ctx.globalAlpha = 0.08;
    for (let i=0;i<parts.length;i++){
      for (let j=i+1;j<parts.length;j++){
        const a = parts[i], b = parts[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d2 = dx*dx + dy*dy;
        if (d2 < (90*devicePixelRatio)**2) {
          ctx.beginPath();
          ctx.strokeStyle = "#b46bff";
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);

  window.addEventListener("resize", ()=>{
    W = canvas.width = window.innerWidth * devicePixelRatio;
    H = canvas.height = window.innerHeight * devicePixelRatio;
  });
}

/* Newsletter */
function bindNewsletter() {
  $("#newsletterForm").addEventListener("submit", e=>{
    e.preventDefault();
    toast("Subscribed successfully");
    e.target.reset();
  });
}

/* Hook everything up */
function init() {
  buildBrandFilter();
  bindCategoryFilters();
  bindFilters();
  bindSearch();
  bindProductGridActions();
  bindCartDrawer();
  bindCheckout();
  bindGlobal();
  bindHeroControls();
  bindDismiss();
  startParticles();

  showSkeleton();
  setTimeout(() => {
    hideSkeleton();
    renderHero();
    renderProducts(false);
  }, 500);

  updateCartCount();
  updateWishlistCount();
}

document.addEventListener("DOMContentLoaded", init);

/* Expose track open if needed elsewhere */
window.NM = { openTracking, addToCart, toggleWishlist };
