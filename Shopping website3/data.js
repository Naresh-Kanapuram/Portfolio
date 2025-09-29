// data.js
// Product catalog with real sample images from Unsplash/Pexels (royalty‑free demo use)
// Licensing reminders: Unsplash/Pexels permit free usage; do not imply endorsement and avoid trademark/person misuse in production.

const PRODUCTS = [
  // Fashion
  {
    id: "F001",
    title: "Aurora Satin Midi Dress",
    brand: "NovaWear",
    category: "fashion",
    price: 2999, mrp: 4999, rating: 4.6, stock: 18, newest: 1726400000000,
    img: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1400&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1520975922215-c95de308c4ff?q=80&w=1400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1520975898341-ae2f734bacc9?q=80&w=1400&auto=format&fit=crop",
    ],
    desc: "Fluid satin with structured bodice and side slit for runway flair.",
    tags: ["new","bestseller","sale"],
    specs: { material:"Satin", color:"Midnight", sizes:["S","M","L"] }
  },
  {
    id: "F002",
    title: "Monochrome Oversized Hoodie",
    brand: "CoreLine",
    category: "fashion",
    price: 1599, mrp: 2299, rating: 4.5, stock: 42, newest: 1726300000000,
    img: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1400&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1516826957135-700dedea698c?q=80&w=1400&auto=format&fit=crop"
    ],
    desc: "Heavyweight fleece with kangaroo pocket and lined hood.",
    tags: ["new"],
    specs: { material:"Cotton Blend", color:"Charcoal", sizes:["M","L","XL"] }
  },
  {
    id: "F003",
    title: "Tailored Blazer (Slim Fit)",
    brand: "Linea",
    category: "fashion",
    price: 3499, mrp: 5999, rating: 4.7, stock: 20, newest: 1726000000000,
    img: "https://images.unsplash.com/photo-1520975661595-6453be3f7070?q=80&w=1400&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1520975661595-6453be3f7070?q=80&w=1400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1516826957135-700dedea698c?q=80&w=1400&auto=format&fit=crop"
    ],
    desc: "Sharp shoulders, breathable lining, and precision stitching.",
    tags: ["bestseller"],
    specs: { material:"Twill", color:"Navy", sizes:["S","M","L"] }
  },

  // Shoes
  {
    id: "S001",
    title: "Velocity Runner Pro",
    brand: "StrideFX",
    category: "shoes",
    price: 2799, mrp: 4599, rating: 4.6, stock: 25, newest: 1726500000000,
    img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1400&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1542291023-0b5e6e2c0397?q=80&w=1400&auto=format&fit=crop"
    ],
    desc: "Responsive midsole with breathable mesh and locked heel counter.",
    tags: ["new","sale"],
    specs: { color:"Black/Volt", sizes:["7","8","9","10"] }
  },
  {
    id: "S002",
    title: "Retro Court Low",
    brand: "Courtline",
    category: "shoes",
    price: 2199, mrp: 3299, rating: 4.4, stock: 38, newest: 1725600000000,
    img: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1400&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=1400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1400&auto=format&fit=crop"
    ],
    desc: "Classic cupsole with premium leather overlays and padded collar.",
    tags: ["bestseller"],
    specs: { color:"White/Gum", sizes:["6","7","8","9"] }
  },

  // Electronics (general)
  {
    id: "E001",
    title: "Noise‑Canceling Headphones X90",
    brand: "SonicAir",
    category: "electronics",
    price: 6999, mrp: 9999, rating: 4.7, stock: 35, newest: 1726550000000,
    img: "https://images.unsplash.com/photo-1518443844291-8bf62a6c21c1?q=80&w=1400&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1518443844291-8bf62a6c21c1?q=80&w=1400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1518441902112-f0d72987e00c?q=80&w=1400&auto=format&fit=crop"
    ],
    desc: "Hybrid ANC, 40mm drivers, 35h battery, low‑latency mode.",
    tags: ["new","bestseller"],
    specs: { codec:"AAC/aptX", charge:"USB‑C" }
  },
  {
    id: "E002",
    title: "Smartwatch Chrono S2",
    brand: "PulseOne",
    category: "electronics",
    price: 3499, mrp: 4999, rating: 4.5, stock: 55, newest: 1726001000000,
    img: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=1400&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=1400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?q=80&w=1400&auto=format&fit=crop"
    ],
    desc: "AMOLED display, SpO₂, GPS, 5ATM water resistance, 10‑day battery.",
    tags: ["sale"],
    specs: { size:"44mm", band:"Silicone" }
  },

  // Mobiles
  {
    id: "M001",
    title: "NovaPhone Edge 7",
    brand: "NovaTech",
    category: "mobiles",
    price: 29999, mrp: 34999, rating: 4.8, stock: 12, newest: 1726620000000,
    img: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1400&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1512499617640-c2f999098c80?q=80&w=1400&auto=format&fit=crop"
    ],
    desc: "120Hz OLED, 50MP OIS camera, 5000mAh with 65W fast charging.",
    tags: ["new","bestseller"],
    specs: { ram:"8GB", storage:"256GB", soc:"Octa‑core" }
  },
  {
    id: "M002",
    title: "Pixelon Lite 5G",
    brand: "Pixelon",
    category: "mobiles",
    price: 17999, mrp: 21999, rating: 4.5, stock: 24, newest: 1726100000000,
    img: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=1400&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=1400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1510557880182-3d4d3cba35ae?q=80&w=1400&auto=format&fit=crop"
    ],
    desc: "6.6” 120Hz LCD, 108MP triple camera, 5000mAh, clean UI.",
    tags: ["sale"],
    specs: { ram:"6GB", storage:"128GB", soc:"5G" }
  },

  // TVs
  {
    id: "T001",
    title: "VisionPro 55” 4K QLED",
    brand: "ViewPrime",
    category: "tvs",
    price: 42999, mrp: 59999, rating: 4.6, stock: 10, newest: 1726660000000,
    img: "https://images.unsplash.com/photo-1582281298056-2efc39b62b60?q=80&w=1400&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1582281298056-2efc39b62b60?q=80&w=1400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1593359677879-accb02d4aacc?q=80&w=1400&auto=format&fit=crop"
    ],
    desc: "Quantum dots, Dolby Vision/Atmos, 120Hz MEMC, bezel‑lite design.",
    tags: ["new"],
    specs: { size:"55-inch", os:"Google TV" }
  },
  {
    id: "T002",
    title: "CineStream 65” OLED",
    brand: "Cinestra",
    category: "tvs",
    price: 109999, mrp: 129999, rating: 4.9, stock: 6, newest: 1725605000000,
    img: "https://images.unsplash.com/photo-1517059224940-d4af9eec41e5?q=80&w=1400&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1517059224940-d4af9eec41e5?q=80&w=1400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1513366884920-516763aa9958?q=80&w=1400&auto=format&fit=crop"
    ],
    desc: "Self‑lit pixels, true blacks, cinematic HDR and gamer mode.",
    tags: ["bestseller"],
    specs: { size:"65-inch", os:"webOS" }
  },

  // Laptops
  {
    id: "L001",
    title: "ZenLite 14 (OLED)",
    brand: "ZenCore",
    category: "laptops",
    price: 69999, mrp: 84999, rating: 4.7, stock: 14, newest: 1726640000000,
    img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1400&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?q=80&w=1400&auto=format&fit=crop"
    ],
    desc: "13‑gen i7, 16GB, 1TB NVMe, Iris Xe, 1.2kg ultra‑thin build.",
    tags: ["new","bestseller"],
    specs: { cpu:"i7", ram:"16GB", storage:"1TB NVMe" }
  },
  {
    id: "L002",
    title: "CreatorBook 16 Pro",
    brand: "RenderX",
    category: "laptops",
    price: 119999, mrp: 139999, rating: 4.8, stock: 8, newest: 1725800000000,
    img: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1400&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?q=80&w=1400&auto=format&fit=crop"
    ],
    desc: "Ryzen 9 + RTX 4070, 32GB, 2TB NVMe, 240Hz IPS.",
    tags: ["sale"],
    specs: { cpu:"R9", ram:"32GB", gpu:"RTX 4070" }
  },

  // Home Appliances
  {
    id: "H001",
    title: "TurboWash Front Load 8kg",
    brand: "FreshHome",
    category: "home-appliances",
    price: 28999, mrp: 34999, rating: 4.5, stock: 15, newest: 1726625000000,
    img: "https://images.unsplash.com/photo-1585518410931-c28b5b3baddc?q=80&w=1400&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1585518410931-c28b5b3baddc?q=80&w=1400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1556909114-31d72407c88a?q=80&w=1400&auto=format&fit=crop"
    ],
    desc: "Inverter motor, 1400RPM, 15‑min quick wash, steam care.",
    tags: ["new"],
    specs: { capacity:"8kg", energy:"5 star" }
  },
  {
    id: "H002",
    title: "ChefX Power Blender",
    brand: "ChefX",
    category: "home-appliances",
    price: 3999, mrp: 5499, rating: 4.4, stock: 40, newest: 1726200000000,
    img: "https://images.unsplash.com/photo-1586201375761-83865001e31b?q=80&w=1400&auto=format&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1586201375761-83865001e31b?q=80&w=1400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1596040033229-a9821ebd058b?q=80&w=1400&auto=format&fit=crop"
    ],
    desc: "1200W metal blades, 6 presets, pulse and auto‑clean.",
    tags: ["bestseller"],
    specs: { power:"1200W", jars:"2" }
  },

  /* --- Add many more items for scale (excerpt shows pattern). For a 1000+ line project,
     duplicate category coverage with varied products to expand the catalog. --- */
];

// Hero slides
const HERO_SLIDES = [
  {
    img: "https://images.unsplash.com/photo-1520975661595-6453be3f7070?q=80&w=1600&auto=format&fit=crop",
    title: "Luxury Tailoring Days",
    subtitle: "Hand‑finished formalwear • Up to 60% Off",
    cta: { text: "Explore Fashion", cat: "fashion" }
  },
  {
    img: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1600&auto=format&fit=crop",
    title: "Flagship Phones Week",
    subtitle: "Cameras, speed and battery that amaze",
    cta: { text: "Shop Mobiles", cat: "mobiles" }
  },
  {
    img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1600&auto=format&fit=crop",
    title: "Creator Laptops Fest",
    subtitle: "Color‑accurate displays and pro GPUs",
    cta: { text: "Shop Laptops", cat: "laptops" }
  }
];

// Populate distinct brand filters at runtime
const BRANDS = [...new Set(PRODUCTS.map(p => p.brand))].sort();
