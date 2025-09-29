// app.js

// -----------------------------
// Helpers
// -----------------------------
const qs = (s, el=document) => el.querySelector(s);
const qsa = (s, el=document) => [...el.querySelectorAll(s)];
const money = n => "₹" + (Math.round(n)).toLocaleString("en-IN");

// Deterministic PRNG from string seed
function seedPRNG(seed) {
  let h = 2166136261 >>> 0;
  for (let i=0;i<seed.length;i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); }
  return function() {
    h += h << 13; h ^= h >>> 7; h += h << 3; h ^= h >>> 17; h += h << 5;
    return ((h >>> 0) / 4294967296);
  };
}

// Validators
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRe = /^[0-9+\-\s]{7,15}$/;
const vpaRe = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;

function luhnCheck(num) {
  const s = num.replace(/\s+/g,'');
  if (!/^\d{13,19}$/.test(s)) return false;
  let sum = 0, dbl = false;
  for (let i=s.length-1;i>=0;i--) {
    let d = +s[i];
    if (dbl) { d*=2; if (d>9) d-=9; }
    sum += d; dbl = !dbl;
  }
  return (sum % 10) === 0;
}
function formatCardNumber(val) { return val.replace(/\D+/g,'').slice(0,16).replace(/(\d{4})(?=\d)/g, '$1 '); }
function monthYearValid(mmYY){
  if(!/^\d{2}\/\d{2}$/.test(mmYY)) return false;
  const [mm,yy]=mmYY.split('/').map(n=>+n);
  if(mm<1||mm>12) return false;
  const year = 2000+yy;
  const exp = new Date(year, mm, 0, 23,59,59,999);
  return exp >= new Date();
}

// -----------------------------
// Data
// -----------------------------
const MOVIES = [
  { id:"mv001", title:"Nebula Drift", genre:["Sci‑Fi","Action"], duration:142, rating:"U/A 13+", languages:["English","Hindi","Telugu"], formats:["2D","3D","IMAX"], tagline:"Across the void, destiny waits." },
  { id:"mv002", title:"Monsoon Rhapsody", genre:["Drama","Romance"], duration:128, rating:"U", languages:["Hindi","Tamil","Telugu","English"], formats:["2D"], tagline:"Love poured with the rain." },
  { id:"mv003", title:"Crimson Alley", genre:["Thriller","Mystery"], duration:117, rating:"A", languages:["Hindi","English","Tamil"], formats:["2D","IMAX"], tagline:"Every shadow hides a clue." },
  { id:"mv004", title:"Pixel Pioneers", genre:["Adventure","Comedy"], duration:109, rating:"U/A 7+", languages:["English","Hindi"], formats:["2D","3D"], tagline:"Game on, world!" },
  { id:"mv005", title:"Echoes of Deccan", genre:["Drama"], duration:134, rating:"U/A 16+", languages:["Telugu","Hindi","Tamil"], formats:["2D"], tagline:"Roots, roads, revelations." },
  { id:"mv006", title:"Skyline Siege", genre:["Action"], duration:125, rating:"U/A 13+", languages:["English","Hindi","Tamil","Telugu"], formats:["IMAX","3D","2D"], tagline:"Hold the horizon." },
];

const CINEMAS = [
  { id:"cn001", city:"Hyderabad", name:"CineX Platinum Mall", address:"Road No. 36, Jubilee Hills, Hyderabad",
    screens:[ { id:"scr1", name:"Screen 1", layout:"standard", showtimes:["10:00 AM","1:30 PM","5:00 PM","8:30 PM"] },
              { id:"scr2", name:"Audi 2", layout:"standard", showtimes:["9:15 AM","12:00 PM","3:45 PM","7:20 PM","10:55 PM"] } ] },
  { id:"cn002", city:"Hyderabad", name:"Galaxy 70mm", address:"Hitech City, Madhapur, Hyderabad",
    screens:[ { id:"scr3", name:"Laser 3D", layout:"premium", showtimes:["11:00 AM","2:15 PM","6:10 PM","9:40 PM"] } ] },
  { id:"cn003", city:"Bengaluru", name:"CineX Orion", address:"Brigade Gateway, Rajajinagar, Bengaluru",
    screens:[ { id:"scr4", name:"IMAX", layout:"premium", showtimes:["10:30 AM","2:00 PM","5:30 PM","9:00 PM"] },
              { id:"scr5", name:"Audi Gold", layout:"standard", showtimes:["11:45 AM","3:30 PM","7:15 PM"] } ] },
  { id:"cn004", city:"Mumbai", name:"Seaside Multiplex", address:"Marine Drive, Mumbai",
    screens:[ { id:"scr6", name:"Screen A", layout:"standard", showtimes:["9:50 AM","1:10 PM","4:40 PM","8:10 PM","11:25 PM"] } ] },
  { id:"cn005", city:"Delhi NCR", name:"Metro CineX", address:"Connaught Place, New Delhi",
    screens:[ { id:"scr7", name:"VIP Luxe", layout:"premium", showtimes:["10:05 AM","1:35 PM","5:05 PM","8:45 PM"] } ] },
  { id:"cn006", city:"Chennai", name:"Marina Screens", address:"Besant Nagar, Chennai",
    screens:[ { id:"scr8", name:"Dolby Vision", layout:"premium", showtimes:["10:20 AM","1:20 PM","4:20 PM","7:50 PM"] } ] },
];

const PRICING = { VIP: 380, PRIME: 260, REGULAR: 190, CONV_FLAT: 30, CONV_RATE: 0.02 };
const COUPONS = {
  "WELCOME50": { type:"flat", value:50, note:"Flat ₹50 off" },
  "STUDENT10": { type:"percent", value:10, cap:200, note:"10% off up to ₹200" },
  "FESTIVE20": { type:"percent", value:20, cap:120, note:"20% off up to ₹120" },
};

// -----------------------------
// State
// -----------------------------
const state = {
  city: "Hyderabad",
  langFilter: "All",
  search: "",
  movieId: null,
  cinemaId: null,
  screenId: null,
  date: null,
  time: null,
  selectedSeats: [],
  adult: 1,
  child: 0,
  coupon: null,
  discount: 0,
  base: 0,
  conv: 0,
  total: 0,
  customer: { name:"", email:"", phone:"" },
  langFmt: "English • 2D",
  payMethod: null,
  lastBooking: null,
};

// -----------------------------
// Element references
// -----------------------------
const moviesList = qs("#moviesList");
const searchInput = qs("#searchInput");
const citySelect = qs("#citySelect");
const langSelect = qs("#langSelect");
const cinemaSelect = qs("#cinemaSelect");
const screenSelect = qs("#screenSelect");
const showtimesWrap = qs("#showtimes");
const dateInput = qs("#dateInput");
const seatGrid = qs("#seatGrid");
const baseFare = qs("#baseFare");
const convFee = qs("#convFee");
const discountAmt = qs("#discountAmt");
const grandTotal = qs("#grandTotal");
const footerTotal = qs("#footerTotal");
const payNow = qs("#payNow");
const footerPay = qs("#footerPay");

const payModal = qs("#payModal");
const payTabs = qs("#payTabs");
const payForms = qs("#payForms");
const closePay = qs("#closePay");
const pvMovie = qs("#pvMovie");
const pvCinema = qs("#pvCinema");
const pvDT = qs("#pvDT");
const pvSeats = qs("#pvSeats");
const pvTickets = qs("#pvTickets");
const pvName = qs("#pvName");
const pvTotal = qs("#pvTotal");
const spinner = qs("#spinner");
const payStatus = qs("#payStatus");
const couponInput = qs("#couponInput");

const confirmView = qs("#confirmView");
const bkId = qs("#bkId");
const bkMovie = qs("#bkMovie");
const bkRating = qs("#bkRating");
const bkLangFmt = qs("#bkLangFmt");
const bkMeta = qs("#bkMeta");
const bkCinema = qs("#bkCinema");
const bkScreen = qs("#bkScreen");
const bkAddr = qs("#bkAddr");
const bkDate = qs("#bkDate");
const bkTime = qs("#bkTime");
const bkSeats = qs("#bkSeats");
const bkTickets = qs("#bkTickets");
const bkName = qs("#bkName");
const bkEmail = qs("#bkEmail");
const bkPhone = qs("#bkPhone");
const bkPayMethod = qs("#bkPayMethod");
const bkPrice = qs("#bkPrice");
const bkFee = qs("#bkFee");
const bkDisc = qs("#bkDisc");
const bkTotal = qs("#bkTotal");
const qrCanvas = qs("#qrCanvas");
const downloadPng = qs("#downloadPng");
const printTicket = qs("#printTicket");

// -----------------------------
// Rendering: Movies
// -----------------------------
function movieMatches(m) {
  if (state.langFilter !== "All" && !m.languages.includes(state.langFilter)) return false;
  const s = state.search.trim().toLowerCase();
  if (!s) return true;
  return m.title.toLowerCase().includes(s)
      || m.genre.join(" ").toLowerCase().includes(s)
      || m.languages.join(" ").toLowerCase().includes(s)
      || m.formats.join(" ").toLowerCase().includes(s);
}

function renderMovies() {
  moviesList.innerHTML = "";
  MOVIES.filter(movieMatches).forEach(m => {
    const card = document.createElement("div");
    card.className = "movie";
    card.setAttribute("role","listitem");
    card.innerHTML = `
      <div class="poster">
        <span class="tag">${m.rating}</span>
      </div>
      <div class="m-info">
        <h4>${m.title}</h4>
        <div class="meta">
          <span>${m.genre.join(" • ")}</span>
          <span>• ${m.duration} min</span>
          <span>• ${m.languages.join(", ")}</span>
          <span>• ${m.formats.join(", ")}</span>
        </div>
        <div class="actions">
          <button class="btn" data-act="details" data-id="${m.id}">Details</button>
          <button class="btn primary" data-act="select" data-id="${m.id}">Select</button>
        </div>
        <p class="sub" style="margin-top:6px;">${m.tagline}</p>
      </div>
    `;
    moviesList.appendChild(card);
  });
}

// -----------------------------
// Rendering: Cinemas/Screens/Showtimes
// -----------------------------
function getCityCinemas() { return CINEMAS.filter(c => c.city === state.city); }

function renderCinemas() {
  cinemaSelect.innerHTML = "";
  const arr = getCityCinemas();
  arr.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c.id; opt.textContent = c.name;
    cinemaSelect.appendChild(opt);
  });
  if (arr.length) {
    state.cinemaId = state.cinemaId && arr.some(c=>c.id===state.cinemaId) ? state.cinemaId : arr[0].id;
  } else {
    state.cinemaId = null;
  }
  renderScreens();
}

function renderScreens() {
  screenSelect.innerHTML = "";
  const c = CINEMAS.find(x=>x.id===state.cinemaId);
  if (!c) return;
  c.screens.forEach(s=>{
    const opt = document.createElement("option");
    opt.value = s.id; opt.textContent = s.name;
    screenSelect.appendChild(opt);
  });
  state.screenId = state.screenId && c.screens.some(s=>s.id===state.screenId) ? state.screenId : c.screens[0].id;
  renderShowtimes();
}

function renderShowtimes() {
  showtimesWrap.innerHTML="";
  const c = CINEMAS.find(x=>x.id===state.cinemaId);
  const s = c?.screens.find(y=>y.id===state.screenId);
  (s?.showtimes||[]).forEach(t=>{
    const b = document.createElement("button");
    b.className = "slot" + (state.time===t ? " active": "");
    b.textContent = t; b.type="button"; b.dataset.t=t;
    showtimesWrap.appendChild(b);
  });
}

function setDefaultDate() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth()+1).padStart(2,'0');
  const dd = String(today.getDate()).padStart(2,'0');
  dateInput.value = `${yyyy}-${mm}-${dd}`;
  state.date = dateInput.value;
}

// -----------------------------
// Rendering: Seats
// -----------------------------
function seatCategory(rowIdx) {
  if (rowIdx <= 2) return "VIP";
  if (rowIdx <= 6) return "PRIME";
  return "REGULAR";
}
function seatPriceByCat(cat) { if (cat==="VIP") return PRICING.VIP; if (cat==="PRIME") return PRICING.PRIME; return PRICING.REGULAR; }
function seatLabel(row, col) { const letter = String.fromCharCode(65 + row); return letter + (col+1); }

function soldSetForShow() {
  const key = [state.cinemaId, state.screenId, state.date, state.time].join("|");
  const rnd = seedPRNG(key);
  const sold = new Set();
  const rows = 10, cols = 12;
  const total = rows*cols;
  const soldCount = Math.floor(0.18 * total) + Math.floor(rnd()*10);
  while (sold.size < soldCount) {
    const r = Math.floor(rnd()*rows);
    const c = Math.floor(rnd()*cols);
    sold.add(`${r}-${c}`);
  }
  return sold;
}

function renderSeats() {
  seatGrid.innerHTML = "";
  if (!state.movieId || !state.cinemaId || !state.screenId || !state.date || !state.time) return;
  const soldSet = soldSetForShow();
  const rows = 10, cols = 12;
  for (let r=0;r<rows;r++){
    for (let c=0;c<cols;c++){
      const cat = seatCategory(r);
      const seatId = `${r}-${c}`;
      const el = document.createElement("div");
      el.className = `seat ${cat.toLowerCase()}`;
      if (soldSet.has(seatId)) el.classList.add("sold");
      if (state.selectedSeats.some(s=>s.r===r && s.c===c)) el.classList.add("chosen");
      el.title = `${seatLabel(r,c)} • ${cat} • ${money(seatPriceByCat(cat))}`;
      el.dataset.r = r; el.dataset.c = c; el.dataset.cat = cat;
      seatGrid.appendChild(el);
    }
  }
}

// -----------------------------
// Pricing and Summary
// -----------------------------
function ticketsSelectedCount() { return state.adult + state.child; }

function calcPricing() {
  const seatSum = state.selectedSeats.reduce((acc,s)=> acc + seatPriceByCat(s.cat), 0);
  state.base = seatSum;

  const convPerTicket = PRICING.CONV_FLAT + (PRICING.CONV_RATE * (state.base / Math.max(1, ticketsSelectedCount())));
  state.conv = Math.round(convPerTicket * ticketsSelectedCount());

  let discount = 0;
  if (state.coupon && COUPONS[state.coupon]) {
    const rule = COUPONS[state.coupon];
    if (rule.type === "flat") discount = rule.value;
    if (rule.type === "percent") {
      discount = (rule.value/100) * (state.base + state.conv);
      if (rule.cap) discount = Math.min(discount, rule.cap);
    }
  }
  state.discount = Math.round(discount);
  state.total = Math.max(0, Math.round(state.base + state.conv - state.discount));

  baseFare.textContent = money(state.base);
  convFee.textContent = money(state.conv);
  discountAmt.textContent = "-" + money(state.discount);
  grandTotal.textContent = money(state.total);
  footerTotal.textContent = money(state.total);

  const ready = Boolean(
    state.movieId && state.cinemaId && state.screenId && state.date && state.time &&
    ticketsSelectedCount() > 0 &&
    state.selectedSeats.length === ticketsSelectedCount() &&
    state.customer.name && emailRe.test(state.customer.email) && phoneRe.test(state.customer.phone)
  );
  payNow.disabled = !ready;
  footerPay.disabled = !ready;
}

// -----------------------------
// Offers
// -----------------------------
qs("#offersBtn").addEventListener("click", ()=>{
  const list = Object.entries(COUPONS).map(([k,v]) => `${k}: ${v.note || JSON.stringify(v)}`).join("\n");
  alert("Available Offers:\n" + list);
});
qs("#applyCoupon").addEventListener("click", ()=>{
  const code = couponInput.value.trim().toUpperCase();
  if (!code) { state.coupon=null; state.discount=0; calcPricing(); return; }
  if (!COUPONS[code]) { alert("Invalid code"); return; }
  state.coupon = code; calcPricing();
});

// -----------------------------
// Payment Modal
// -----------------------------
function updatePreview() {
  const m = MOVIES.find(x=>x.id===state.movieId);
  const c = CINEMAS.find(x=>x.id===state.cinemaId);
  const s = c?.screens.find(y=>y.id===state.screenId);
  pvMovie.textContent = m ? m.title : '—';
  pvCinema.textContent = c ? c.name + ' • ' + (s?.name||'') : '—';
  pvDT.textContent = (state.date||'—') + ' • ' + (state.time||'—');
  pvSeats.textContent = state.selectedSeats.map(seat=>seatLabel(seat.r, seat.c)).join(', ') || '—';
  pvTickets.textContent =
    `${state.adult} Adult${state.adult !== 1 ? 's' : ''}` +
    (state.child ? ', ' + state.child + ' Child' + (state.child !== 1 ? 'ren' : '') : '');
  pvName.textContent = state.customer.name || '—';
  pvTotal.textContent = money(state.total);
}
function openPayment() { updatePreview(); payModal.classList.add("active"); payModal.setAttribute("aria-hidden","false"); }
function closePayment() { payModal.classList.remove("active"); payModal.setAttribute("aria-hidden","true"); }
payNow.addEventListener("click", openPayment);
footerPay.addEventListener("click", openPayment);
closePay.addEventListener("click", closePayment);

payTabs.addEventListener("click", (e)=>{
  const b = e.target.closest(".tab"); if (!b) return;
  qsa(".tab", payTabs).forEach(t=>t.classList.remove("active"));
  b.classList.add("active");
  const pane = b.dataset.tab;
  qsa("[data-pane]", payForms).forEach(p=>{
    p.classList.toggle("hidden", p.dataset.pane !== pane);
  });
  state.payMethod = pane;
});

// Card
const cardNumber = qs("#cardNumber");
const cardName = qs("#cardName");
const cardExp = qs("#cardExp");
const cardCVV = qs("#cardCVV");
cardNumber.addEventListener("input", ()=> cardNumber.value = formatCardNumber(cardNumber.value));
cardExp.addEventListener("input", ()=>{
  let v = cardExp.value.replace(/[^\d]/g,'').slice(0,4);
  if (v.length>=3) v = v.slice(0,2) + "/" + v.slice(2);
  cardExp.value = v;
});
qs("#payCard").addEventListener("click", async ()=>{
  if (!luhnCheck(cardNumber.value)) return alert("Invalid card number");
  if (!cardName.value.trim()) return alert("Enter name on card");
  if (!monthYearValid(cardExp.value)) return alert("Invalid expiry");
  if (!/^\d{3,4}$/.test(cardCVV.value)) return alert("Invalid CVV");
  state.payMethod = "Card";
  await simulatePayment();
});

// UPI
const upiVpa = qs("#upiVpa");
qs("#payUpi").addEventListener("click", async ()=>{
  if (!vpaRe.test(upiVpa.value.trim())) return alert("Invalid UPI ID");
  state.payMethod = "UPI";
  await simulatePayment();
});

// Wallet
let walletChoice = null;
qsa('[data-wallet]').forEach(btn => {
  btn.addEventListener('click', () => {
    qsa('[data-wallet]').forEach(b => b.classList.remove('primary'));
    btn.classList.add('primary');
    walletChoice = btn.getAttribute('data-wallet');
  });
});
qs('#payWallet').addEventListener('click', async () => {
  if (!walletChoice) return alert('Please select a wallet');
  state.payMethod = 'Wallet: ' + walletChoice;
  await simulatePayment();
});

// NetBanking
const bankSelect = qs('#bankSelect');
qs('#payNetbank').addEventListener('click', async () => {
  if (!bankSelect.value) return alert('Please choose a bank');
  state.payMethod = 'NetBanking: ' + bankSelect.value;
  await simulatePayment();
});

// -----------------------------
// Payment simulation
// -----------------------------
async function simulatePayment() {
  payStatus.textContent = 'Processing payment…';
  spinner.classList.remove('hidden');
  await new Promise(res=>setTimeout(res, 1200 + Math.random()*800));
  spinner.classList.add('hidden');
  payStatus.textContent = 'Payment authorized. Generating ticket…';
  await new Promise(res=>setTimeout(res, 700));
  finalizeBooking();
}

// -----------------------------
// Booking id and QR
// -----------------------------
function generateBookingId() {
  const base = [state.movieId, state.cinemaId, state.screenId, state.date, state.time, Date.now()].join('|');
  const rnd = seedPRNG(base);
  let id = ''; const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  for (let i=0;i<10;i++) id += alphabet[Math.floor(rnd()*alphabet.length)];
  return id;
}

function drawPseudoQR(canvas, textSeed) {
  const ctx = canvas.getContext('2d');
  const size = canvas.width;
  ctx.fillStyle = '#0b0b12';
  ctx.fillRect(0,0,size,size);
  const rnd = seedPRNG(textSeed);
  const cells = 35; const cell = Math.floor(size / cells);
  function finder(x,y){
    ctx.fillStyle = '#e5e7eb'; ctx.fillRect(x,y,cell*7,cell*7);
    ctx.fillStyle = '#111827'; ctx.fillRect(x+cell,y+cell,cell*5,cell*5);
    ctx.fillStyle = '#e5e7eb'; ctx.fillRect(x+cell*2,y+cell*2,cell*3,cell*3);
  }
  finder(cell,cell);
  finder(size - cell*8, cell);
  finder(cell, size - cell*8);
  for (let r=0;r<cells;r++){
    for (let c=0;c<cells;c++){
      if ((r<8 && c<8) || (r<8 && c>cells-9) || (r>cells-9 && c<8)) continue;
      const v = rnd();
      if (v > 0.55) {
        ctx.fillStyle = v > 0.85 ? '#8b5cf6' : '#e5e7eb';
        ctx.fillRect(c*cell, r*cell, cell-1, cell-1);
      }
    }
  }
  ctx.globalAlpha = 0.06; ctx.fillStyle = '#06b6d4'; ctx.fillRect(0,0,size,size); ctx.globalAlpha = 1;
}

// -----------------------------
// Finalize booking
// -----------------------------
function finalizeBooking() {
  const m = MOVIES.find(x=>x.id===state.movieId);
  const c = CINEMAS.find(x=>x.id===state.cinemaId);
  const s = c?.screens.find(y=>y.id===state.screenId);
  const id = generateBookingId();
  const seatLabels = state.selectedSeats.map(seat=>seatLabel(seat.r, seat.c));
  const booking = {
    id,
    movie: m?.title || '',
    rating: m?.rating || '',
    genre: m?.genre.join(' • ') || '',
    duration: m?.duration || 0,
    cinema: c?.name || '',
    screen: s?.name || '',
    address: c?.address || '',
    date: state.date,
    time: state.time,
    seats: seatLabels,
    adult: state.adult,
    child: state.child,
    name: state.customer.name,
    email: state.customer.email,
    phone: state.customer.phone,
    langFmt: state.langFmt,
    payMethod: state.payMethod || '—',
    price: { base: state.base, conv: state.conv, discount: state.discount, total: state.total }
  };
  // Persist
  localStorage.setItem('cinex:lastBooking', JSON.stringify(booking));
  state.lastBooking = booking;

  // Populate confirmation
  bkId.textContent = booking.id;
  bkMovie.textContent = booking.movie;
  bkRating.textContent = booking.rating;
  bkLangFmt.textContent = booking.langFmt;
  bkMeta.textContent = `${booking.genre} • ${booking.duration} min`;
  bkCinema.textContent = booking.cinema;
  bkScreen.textContent = booking.screen;
  bkAddr.textContent = booking.address;
  bkDate.textContent = booking.date;
  bkTime.textContent = booking.time;
  bkSeats.textContent = booking.seats.join(', ');
  bkTickets.textContent =
    `${booking.adult} Adult${booking.adult !== 1 ? 's' : ''}` +
    (booking.child ? ', ' + booking.child + ' Child' + (booking.child !== 1 ? 'ren' : '') : '');
  bkName.textContent = booking.name;
  bkEmail.textContent = booking.email;
  bkPhone.textContent = booking.phone;
  bkPayMethod.textContent = booking.payMethod;
  bkPrice.textContent = money(booking.price.base);
  bkFee.textContent = money(booking.price.conv);
  bkDisc.textContent = '-' + money(booking.price.discount);
  bkTotal.textContent = money(booking.price.total);

  // QR-like code
  drawPseudoQR(qrCanvas, [ booking.id, booking.movie, booking.cinema, booking.date, booking.time, booking.seats.join(',') ].join('|'));

  // Close modal and show confirmation
  closePayment();
  confirmView.style.display = 'grid';
  confirmView.scrollIntoView({behavior:'smooth', block:'start'});
}

// -----------------------------
// Ticket Download / Print / Resume
// -----------------------------
downloadPng.addEventListener('click', ()=>{
  const can = document.createElement('canvas');
  const W = 900, H = 500;
  can.width = W; can.height = H;
  const ctx = can.getContext('2d');

  // BG
  const grad = ctx.createLinearGradient(0,0,W,H);
  grad.addColorStop(0, '#0b0b12');
  grad.addColorStop(1, '#1a2440');
  ctx.fillStyle = grad;
  ctx.fillRect(0,0,W,H);

  // Title
  ctx.fillStyle = '#e5e7eb';
  ctx.font = '700 28px Inter, system-ui, sans-serif';
  ctx.fillText('CineX — Movie Ticket', 24, 46);

  // Details
  const lines = [
    `Booking ID: ${bkId.textContent}`,
    `Movie: ${bkMovie.textContent} (${bkRating.textContent})`,
    `Lang/Format: ${bkLangFmt.textContent}`,
    `Cinema: ${bkCinema.textContent} • ${bkScreen.textContent}`,
    `Address: ${bkAddr.textContent}`,
    `Date/Time: ${bkDate.textContent} • ${bkTime.textContent}`,
    `Seats: ${bkSeats.textContent}`,
    `Tickets: ${bkTickets.textContent}`,
    `Paid: ${bkTotal.textContent} (Base ${bkPrice.textContent}, Fee ${bkFee.textContent}, Disc ${bkDisc.textContent})`,
    `Name: ${bkName.textContent} • Email: ${bkEmail.textContent} • Phone: ${bkPhone.textContent}`,
  ];
  ctx.font = '400 16px Inter, system-ui, sans-serif';
  let y = 84;
  lines.forEach(line => { ctx.fillText(line, 24, y); y += 26; });

  // Copy QR canvas
  ctx.fillStyle = '#111827';
  ctx.fillRect(W-24-180, 24, 180, 180);
  ctx.drawImage(qrCanvas, W-24-170, 34, 160, 160);

  // Download
  const a = document.createElement('a');
  a.download = `CineX_Ticket_${bkId.textContent}.png`;
  a.href = can.toDataURL('image/png');
  a.click();
  a.remove();
});

printTicket.addEventListener('click', ()=> window.print());

qs('#resumeBtn').addEventListener('click', ()=>{
  const raw = localStorage.getItem('cinex:lastBooking');
  if (!raw) return alert('No previous booking found');
  try{
    state.lastBooking = JSON.parse(raw);
    const b = state.lastBooking;
    bkId.textContent = b.id;
    bkMovie.textContent = b.movie;
    bkRating.textContent = b.rating;
    bkLangFmt.textContent = b.langFmt;
    bkMeta.textContent = `${b.genre} • ${b.duration} min`;
    bkCinema.textContent = b.cinema;
    bkScreen.textContent = b.screen;
    bkAddr.textContent = b.address;
    bkDate.textContent = b.date;
    bkTime.textContent = b.time;
    bkSeats.textContent = b.seats.join(', ');
    bkTickets.textContent =
      `${b.adult} Adult${b.adult !== 1 ? 's' : ''}` +
      (b.child ? ', ' + b.child + ' Child' + (b.child !== 1 ? 'ren' : '') : '');
    bkName.textContent = b.name;
    bkEmail.textContent = b.email;
    bkPhone.textContent = b.phone;
    bkPayMethod.textContent = b.payMethod;
    bkPrice.textContent = money(b.price.base);
    bkFee.textContent = money(b.price.conv);
    bkDisc.textContent = '-' + money(b.price.discount);
    bkTotal.textContent = money(b.price.total);
    drawPseudoQR(qrCanvas, [ b.id, b.movie, b.cinema, b.date, b.time, b.seats.join(',') ].join('|'));
    confirmView.style.display = 'grid';
    confirmView.scrollIntoView({behavior:'smooth', block:'start'});
  } catch(e){ alert('Failed to load previous booking'); }
});

// -----------------------------
// Inputs and Interactions
// -----------------------------
searchInput.addEventListener('input', ()=>{ state.search = searchInput.value; renderMovies(); });
citySelect.addEventListener('change', ()=>{ state.city = citySelect.value; renderCinemas(); renderSeats(); calcPricing(); });
langSelect.addEventListener('change', ()=>{ state.langFilter = langSelect.value; renderMovies(); });
qs('#langFormat').addEventListener('change', (e)=>{ state.langFmt = e.target.value; });

qs('#clearFilters').addEventListener('click', ()=>{
  state.search=''; searchInput.value='';
  state.langFilter='All'; langSelect.value='All';
  renderMovies();
});
qs('#scrollMovies').addEventListener('click', ()=> qs('#moviesCard').scrollIntoView({behavior:'smooth', block:'start'}));

// Movies list actions
moviesList.addEventListener('click', (e)=>{
  const btn = e.target.closest('button[data-act]');
  if(!btn) return;
  const id = btn.dataset.id;
  const m = MOVIES.find(x=>x.id===id);
  if(btn.dataset.act==='details'){
    alert(`${m.title}\n\nGenre: ${m.genre.join(', ')}\nDuration: ${m.duration} min\nRating: ${m.rating}\nLanguages: ${m.languages.join(', ')}\nFormats: ${m.formats.join(', ')}\n\n${m.tagline}`);
  }
  if(btn.dataset.act==='select'){
    state.movieId = id;
    state.selectedSeats = [];
    state.time = null;
    renderSeats();
    calcPricing();
    qs('#selectionCard').scrollIntoView({behavior:'smooth', block:'start'});
  }
});

// Cinema, screen, date, time
cinemaSelect.addEventListener('change', ()=>{ state.cinemaId = cinemaSelect.value; renderScreens(); renderSeats(); calcPricing(); });
screenSelect.addEventListener('change', ()=>{ state.screenId = screenSelect.value; renderShowtimes(); renderSeats(); calcPricing(); });
dateInput.addEventListener('change', ()=>{ state.date = dateInput.value; renderSeats(); calcPricing(); });
showtimesWrap.addEventListener('click', (e)=>{
  const b = e.target.closest('.slot'); if(!b) return;
  state.time = b.dataset.t;
  qsa('.slot', showtimesWrap).forEach(x=>x.classList.remove('active'));
  b.classList.add('active');
  state.selectedSeats = [];
  renderSeats();
  calcPricing();
});

// Seats
seatGrid.addEventListener('click', (e)=>{
  const el = e.target.closest('.seat'); if(!el || el.classList.contains('sold')) return;
  const r = +el.dataset.r, c = +el.dataset.c, cat = el.dataset.cat;
  const idx = state.selectedSeats.findIndex(s=>s.r===r && s.c===c);
  const limit = ticketsSelectedCount();
  if (idx>=0){
    state.selectedSeats.splice(idx,1);
    el.classList.remove('chosen');
  } else {
    if (state.selectedSeats.length >= limit) {
      alert(`Seat limit reached (${limit}). Increase ticket count or deselect a seat.`);
      return;
    }
    state.selectedSeats.push({r,c,cat});
    el.classList.add('chosen');
  }
  calcPricing();
});

// Customer details
qs('#custName').addEventListener('input', e=>{ state.customer.name = e.target.value.trim(); calcPricing(); });
qs('#custEmail').addEventListener('input', e=>{ state.customer.email = e.target.value.trim(); calcPricing(); });
qs('#custPhone').addEventListener('input', e=>{ state.customer.phone = e.target.value.trim(); calcPricing(); });

// Ticket counts
qs('#adultCount').addEventListener('input', e=>{
  state.adult = Math.max(0, parseInt(e.target.value||'0',10));
  while (state.selectedSeats.length > ticketsSelectedCount()) state.selectedSeats.pop();
  renderSeats();
  calcPricing();
});
qs('#childCount').addEventListener('input', e=>{
  state.child = Math.max(0, parseInt(e.target.value||'0',10));
  while (state.selectedSeats.length > ticketsSelectedCount()) state.selectedSeats.pop();
  renderSeats();
  calcPricing();
});

// Reset
qs('#resetAll').addEventListener('click', ()=>{
  state.movieId = null;
  state.cinemaId = getCityCinemas()[0]?.id || null;
  state.screenId = null;
  state.date = dateInput.value;
  state.time = null;
  state.selectedSeats = [];
  state.adult = 1; state.child = 0;
  qs('#adultCount').value = 1;
  qs('#childCount').value = 0;
  state.customer = { name:'', email:'', phone:'' };
  qsa('#custName, #custEmail, #custPhone').forEach(i=> i.value='');
  state.coupon = null; couponInput.value = '';
  state.discount = 0;
  state.langFmt = 'English • 2D';
  qs('#langFormat').value = state.langFmt;
  renderMovies();
  renderCinemas();
  setDefaultDate();
  renderShowtimes();
  renderSeats();
  calcPricing();
  confirmView.style.display = 'none';
  window.scrollTo({top:0, behavior:'smooth'});
});

// -----------------------------
// Initial render
// -----------------------------
renderMovies();
renderCinemas();
setDefaultDate();
renderShowtimes();
renderSeats();
calcPricing();
