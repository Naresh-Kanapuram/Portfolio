/* Product catalog */
const PRODUCTS = [
  // Veg
  { id: 'veg-001', name: 'Veg Biryani', cat: 'Meals', veg: true, price: 199, mrp: 249, discount: 20, rating: 4.5, freeDeliveryAbove: 499, img: 'veg_biryani.jpeg', tags: ['spicy','rice','hyderabadi','recommended'] },
  { id: 'veg-002', name: 'Masala Dosa', cat: 'Tiffins', veg: true, price: 99, mrp: 129, discount: 23, rating: 4.4, freeDeliveryAbove: 499, img: 'masala_dosa.jpeg', tags: ['south-indian','crispy','tiffin','recommended'] },
  { id: 'veg-003', name: 'Idli Sambar', cat: 'Tiffins', veg: true, price: 69, mrp: 89, discount: 22, rating: 4.2, freeDeliveryAbove: 499, img: 'idli.jpeg', tags: ['soft','light','south-indian'] },
  { id: 'veg-004', name: 'Paneer Butter Masala', cat: 'Meals', veg: true, price: 229, mrp: 279, discount: 18, rating: 4.6, freeDeliveryAbove: 499, img: 'paneer_butter_masala.jpeg', tags: ['gravy','north-indian','creamy','recommended'] },
  { id: 'veg-005', name: 'Veg Thali', cat: 'Meals', veg: true, price: 179, mrp: 219, discount: 18, rating: 4.1, freeDeliveryAbove: 499, img: 'veg_thali.jpeg', tags: ['combo','full-meal'] },
  { id: 'veg-006', name: 'Samosa (2 pc)', cat: 'Snacks', veg: true, price: 49, mrp: 59, discount: 17, rating: 4.0, freeDeliveryAbove: 499, img: 'samosa.jpeg', tags: ['snack','fried'] },
  { id: 'veg-007', name: 'Pav Bhaji', cat: 'Snacks', veg: true, price: 129, mrp: 159, discount: 19, rating: 4.3, freeDeliveryAbove: 499, img: 'pav_bhaji.jpeg', tags: ['buttery','street','mumbai'] },
  { id: 'veg-008', name: 'Margherita Pizza', cat: 'Snacks', veg: true, price: 239, mrp: 299, discount: 20, rating: 4.2, freeDeliveryAbove: 499, img: 'margherita.jpeg', tags: ['cheesy','italian'] },
  { id: 'veg-009', name: 'Gulab Jamun', cat: 'Snacks', veg: true, price: 79, mrp: 99, discount: 20, rating: 4.4, freeDeliveryAbove: 499, img: 'gulab_jamun.jpeg', tags: ['dessert','sweet'] },

  // Non-Veg
  { id: 'nv-001', name: 'Chicken Biryani', cat: 'Meals', veg: false, price: 249, mrp: 299, discount: 17, rating: 4.7, freeDeliveryAbove: 499, img: 'chicken_biryani.jpeg', tags: ['spicy','hyderabadi','recommended'] },
  { id: 'nv-002', name: 'Butter Chicken', cat: 'Meals', veg: false, price: 279, mrp: 339, discount: 18, rating: 4.6, freeDeliveryAbove: 499, img: 'butter_chicken.jpeg', tags: ['gravy','north-indian','creamy'] },
  { id: 'nv-003', name: 'Egg Curry', cat: 'Meals', veg: false, price: 169, mrp: 199, discount: 15, rating: 4.2, freeDeliveryAbove: 499, img: 'egg_curry.jpeg', tags: ['protein','mild'] },
  { id: 'nv-004', name: 'Fish Fry', cat: 'Snacks', veg: false, price: 199, mrp: 239, discount: 17, rating: 4.1, freeDeliveryAbove: 499, img: 'fish_fry.jpeg', tags: ['coastal','crispy'] },
  { id: 'nv-005', name: 'Grilled Chicken', cat: 'Snacks', veg: false, price: 229, mrp: 279, discount: 18, rating: 4.3, freeDeliveryAbove: 499, img: 'grilled_chicken.jpeg', tags: ['healthy','protein'] },

  // Ice Creams
  { id: 'ic-001', name: 'Vanilla Scoop', cat: 'Ice Creams', veg: true, price: 79, mrp: 99, discount: 20, rating: 4.1, freeDeliveryAbove: 499, img: 'vanilla.jpeg', tags: ['dessert','classic'] },
  { id: 'ic-002', name: 'Butterscotch Cup', cat: 'Ice Creams', veg: true, price: 89, mrp: 109, discount: 18, rating: 4.3, freeDeliveryAbove: 499, img: 'butterscotch.jpeg', tags: ['dessert','nutty'] },
  { id: 'ic-003', name: 'Chocolate Sundae', cat: 'Ice Creams', veg: true, price: 129, mrp: 159, discount: 19, rating: 4.5, freeDeliveryAbove: 499, img: 'choco_sundae.jpeg', tags: ['dessert','rich','recommended'] },

  // Beverages
  { id: 'bev-001', name: 'Masala Chai', cat: 'Beverages', veg: true, price: 39, mrp: 49, discount: 20, rating: 4.2, freeDeliveryAbove: 499, img: 'masala_chai.jpeg', tags: ['tea','hot'] },
  { id: 'bev-002', name: 'Cold Coffee', cat: 'Beverages', veg: true, price: 99, mrp: 129, discount: 23, rating: 4.4, freeDeliveryAbove: 499, img: 'cold_coffee.jpeg', tags: ['coffee','cold'] },
  { id: 'bev-003', name: 'Sweet Lassi', cat: 'Beverages', veg: true, price: 79, mrp: 99, discount: 20, rating: 4.3, freeDeliveryAbove: 499, img: 'lassi.jpeg', tags: ['punjabi','yogurt'] },
];

/* Coupons */
const COUPONS = {
  'WELCOME50': { type: 'flat', value: 50, min: 199 },
  'FESTIVE20': { type: 'percent', value: 20, min: 399, cap: 150 },
  'FREEDLV': { type: 'deliveryFree', value: 1, min: 299 }
};

/* Delivery fee policy */
const DELIVERY = {
  baseFee: 39,
  freeAbove: 499
};

/* Tracking states */
const TRACK_STATES = [
  { code: 'CONF', label: 'Order Confirmed' },
  { code: 'PREP', label: 'Preparing' },
  { code: 'OUT',  label: 'Out for Delivery' },
  { code: 'DLVD', label: 'Delivered' }
];
