export const STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

const CUSTOMERS = [
  'Northwind Traders', 'Contoso Ltd', 'Fabrikam', 'Adventure Works', 'Tailspin Toys',
  'Litware', 'Woodgrove Bank', 'Proseware', 'Wide World Importers', 'Fourth Coffee',
];

const COUNTRIES = [
  'India', 'United States', 'United Kingdom', 'Germany',
  'Singapore', 'Australia', 'United Arab Emirates', 'Canada',
];

// [product, category, unit price]
const PRODUCTS = [
  ['Laptop Pro 14', 'Electronics', 1299],
  ['4K Monitor 27"', 'Electronics', 389],
  ['Webcam HD', 'Electronics', 89],
  ['Wireless Mouse', 'Accessories', 29],
  ['Mechanical Keyboard', 'Accessories', 109],
  ['USB-C Dock', 'Accessories', 179],
  ['Office Chair', 'Furniture', 249],
  ['Standing Desk', 'Furniture', 549],
  ['Noise-Cancelling Headset', 'Audio', 199],
  ['Conference Speaker', 'Audio', 149],
];

// Seeded random numbers so the sample data is identical on every load.
function seededRandom(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createSampleOrders(count) {
  const random = seededRandom(42);
  const pick = (list) => list[Math.floor(random() * list.length)];
  const start = Date.UTC(2026, 0, 1);
  const dayMs = 24 * 60 * 60 * 1000;

  return Array.from({ length: count }, (_, i) => {
    const [product, category, unitPrice] = pick(PRODUCTS);
    return {
      orderId: `ORD-${10001 + i}`,
      orderDate: new Date(start + Math.floor(random() * 290) * dayMs).toISOString().slice(0, 10),
      customer: pick(CUSTOMERS),
      country: pick(COUNTRIES),
      product,
      category,
      quantity: 1 + Math.floor(random() * 20),
      unitPrice,
      status: pick(STATUSES),
    };
  });
}
