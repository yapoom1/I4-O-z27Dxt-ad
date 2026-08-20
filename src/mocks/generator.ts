// Procedural Mock Data Generator for High Performance Admin Testing
// Generates data deterministically to support 100k+ products, 1M+ customers, 500k+ orders without memory pressure.

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  category: string;
  status: 'published' | 'draft' | 'archived';
  salesCount: number;
  revenue: number;
  rating: number;
  image: string;
  created_at: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'VIP';
  spent: number;
  ordersCount: number;
  walletBalance: number;
  referrals: number;
  status: 'active' | 'suspended' | 'inactive';
  joined_at: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  total: number;
  itemsCount: number;
  status: 'delivered' | 'processing' | 'shipped' | 'cancelled' | 'refunded';
  paymentMethod: string;
  gateway: string;
  shippingMethod: string;
  date: string;
}

// Deterministic Pseudo-Random Generator based on seed (LCG)
export function getSeedValue(seed: number): number {
  const m = 0x80000000; // 2**31
  const a = 1103515245;
  const c = 12345;
  return (a * seed + c) % m;
}

// Array Select Helper
function selectItem<T>(arr: T[], seed: number): T {
  const val = Math.abs(getSeedValue(seed));
  return arr[val % arr.length];
}

// Generate single product by index
export function getProductAtIndex(index: number): Product {
  const categories = ['Electronics', 'Apparel', 'Home & Kitchen', 'Automotive', 'Health & Beauty', 'Sports & Outdoors', 'Office Products', 'Toys & Games'];
  const adjectives = ['Pro', 'Ultra', 'Premium', 'Essential', 'Smart', 'Wireless', 'Ergonomic', 'Eco-friendly', 'Super', 'Classic', 'Apex', 'Hyper'];
  const nouns = ['Monitor', 'Keyboard', 'Mouse', 'Desk', 'Chair', 'Speaker', 'Headphones', 'Router', 'Camera', 'Adapter', 'Stand', 'Backpack'];
  
  const seed = index + 10000;
  const name1 = selectItem(adjectives, seed + 1);
  const name2 = selectItem(nouns, seed + 2);
  const category = selectItem(categories, seed + 3);
  
  const name = `${name1} ${name2} v${(index % 9) + 1}`;
  const sku = `SKU-${category.slice(0, 3).toUpperCase()}-${200000 + (index % 799999)}`;
  
  const priceVal = Math.abs(getSeedValue(seed + 4)) % 1200;
  const price = parseFloat((12.99 + priceVal + (index % 100) / 100).toFixed(2));
  
  const stock = Math.abs(getSeedValue(seed + 5)) % 800;
  const salesCount = Math.abs(getSeedValue(seed + 6)) % 4000;
  const revenue = parseFloat((price * salesCount).toFixed(2));
  const rating = parseFloat((3.8 + (Math.abs(getSeedValue(seed + 7)) % 13) / 10).toFixed(1));
  const status = index % 17 === 0 ? 'archived' : index % 11 === 0 ? 'draft' : 'published';
  
  // Deterministic avatar photo index
  const imageId = (index % 30) + 1;
  const image = `https://picsum.photos/id/${10 + imageId}/150/150`;

  return {
    id: `PROD-${300000 + index}`,
    name,
    sku,
    price,
    stock,
    category,
    status,
    salesCount,
    revenue,
    rating: rating > 5.0 ? 5.0 : rating,
    image,
    created_at: new Date(2025, 0, 1 + (index % 520)).toISOString().split('T')[0]
  };
}

// Generate single customer by index
export function getCustomerAtIndex(index: number): Customer {
  const firstNames = ['John', 'Jane', 'Michael', 'Emily', 'William', 'Olivia', 'David', 'Sophia', 'Richard', 'Isabella', 'Robert', 'Mia', 'Charles', 'Charlotte'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez'];
  const tiers: ('Bronze' | 'Silver' | 'Gold' | 'VIP')[] = ['Bronze', 'Silver', 'Gold', 'VIP'];
  
  const seed = index + 50000;
  const first = selectItem(firstNames, seed + 1);
  const last = selectItem(lastNames, seed + 2);
  const name = `${first} ${last}`;
  const email = `${first.toLowerCase()}.${last.toLowerCase()}.${index}@example.com`;
  
  const tierVal = Math.abs(getSeedValue(seed + 3)) % 100;
  const tier = tierVal > 90 ? 'VIP' : tierVal > 70 ? 'Gold' : tierVal > 40 ? 'Silver' : 'Bronze';
  
  const ordersCount = Math.abs(getSeedValue(seed + 4)) % 120;
  const spentVal = Math.abs(getSeedValue(seed + 5)) % 5000;
  const spent = parseFloat((ordersCount * 15.5 + spentVal).toFixed(2));
  
  const walletBalance = index % 5 === 0 ? parseFloat((Math.abs(getSeedValue(seed + 6)) % 250).toFixed(2)) : 0;
  const referrals = index % 7 === 0 ? Math.abs(getSeedValue(seed + 7)) % 12 : 0;
  const status = index % 25 === 0 ? 'suspended' : index % 8 === 0 ? 'inactive' : 'active';
  
  return {
    id: `CUST-${100000 + index}`,
    name,
    email,
    tier,
    spent,
    ordersCount,
    walletBalance,
    referrals,
    status,
    joined_at: new Date(2024, 0, 1 + (index % 850)).toISOString().split('T')[0]
  };
}

// Generate single order by index
export function getOrderAtIndex(index: number): Order {
  const firstNames = ['John', 'Jane', 'Michael', 'Emily', 'William', 'Olivia', 'David', 'Sophia', 'Richard', 'Isabella'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis'];
  const statuses: ('delivered' | 'processing' | 'shipped' | 'cancelled' | 'refunded')[] = ['delivered', 'processing', 'shipped', 'cancelled', 'refunded'];
  const gateways = ['Stripe', 'Razorpay', 'PayPal', 'PhonePe', 'COD', 'UPI'];
  const payMethods = ['Credit Card', 'Net Banking', 'PayPal Balance', 'UPI Transfer', 'Cash on Delivery', 'G-Pay'];
  const deliveryOptions = ['Own Courier', 'Shiprocket', 'Delhivery', 'BlueDart', 'DTDC'];
  
  const seed = index + 90000;
  const customerName = `${selectItem(firstNames, seed + 1)} ${selectItem(lastNames, seed + 2)}`;
  const customerEmail = `${customerName.split(' ')[0].toLowerCase()}@example.com`;
  
  const totalVal = Math.abs(getSeedValue(seed + 3)) % 2500;
  const total = parseFloat((10.0 + totalVal + (index % 100) / 100).toFixed(2));
  const itemsCount = (index % 5) + 1;
  
  const status = selectItem(statuses, seed + 4);
  const gateIdx = Math.abs(getSeedValue(seed + 5)) % gateways.length;
  const gateway = gateways[gateIdx];
  const paymentMethod = payMethods[gateIdx];
  
  const shippingMethod = selectItem(deliveryOptions, seed + 6);
  
  // Date spread across the last 30 days
  const dateDiff = index % 30;
  const orderDate = new Date();
  orderDate.setDate(orderDate.getDate() - dateDiff);
  
  return {
    id: `ORD-${500000 + index}`,
    customerName,
    customerEmail,
    total,
    itemsCount,
    status,
    gateway,
    paymentMethod,
    shippingMethod,
    date: orderDate.toISOString().split('T')[0] + ' ' + orderDate.toTimeString().split(' ')[0]
  };
}

// Helper to filter/search/sort simulated slices of products
export function queryProducts(params: {
  offset: number;
  limit: number;
  search?: string;
  category?: string;
  status?: string;
  sortBy?: keyof Product;
  sortOrder?: 'asc' | 'desc';
}) {
  const totalCount = 100000; // 100k products limit
  const matches: Product[] = [];
  
  // If search/filter criteria is small or we just scan a viewport
  // For search in a massive dataset: simulate search by mapping index hash, or perform dynamic local search
  // To keep it high performance, if search is active, we mock search results by finding a subset of matching products
  const hasFilter = params.search || params.category || params.status;
  
  if (hasFilter) {
    // Return a deterministically selected set of results for filter queries
    // We scan up to 5000 items starting from 0 to mock realistic results
    let scanCount = 0;
    let idx = 0;
    while (matches.length < params.limit + params.offset && idx < 50000) {
      const p = getProductAtIndex(idx);
      let match = true;
      if (params.search && !p.name.toLowerCase().includes(params.search.toLowerCase()) && !p.sku.toLowerCase().includes(params.search.toLowerCase())) {
        match = false;
      }
      if (params.category && p.category !== params.category) {
        match = false;
      }
      if (params.status && p.status !== params.status) {
        match = false;
      }
      if (match) {
        matches.push(p);
      }
      idx++;
    }
  } else {
    // If no filter, we slice directly! This gives sub-1ms response
    for (let i = params.offset; i < Math.min(params.offset + params.limit, totalCount); i++) {
      matches.push(getProductAtIndex(i));
    }
  }

  // Sort if needed
  if (params.sortBy) {
    const key = params.sortBy;
    const order = params.sortOrder === 'desc' ? -1 : 1;
    matches.sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return (aVal - bVal) * order;
      }
      return String(aVal).localeCompare(String(bVal)) * order;
    });
  }

  return {
    items: matches.slice(params.offset, params.offset + params.limit),
    totalCount: hasFilter ? Math.min(matches.length * 20, 100000) : totalCount, // simulated count
  };
}

// Similar query for customers
export function queryCustomers(params: {
  offset: number;
  limit: number;
  search?: string;
  tier?: string;
  status?: string;
}) {
  const totalCount = 1000000; // 1M customers
  const matches: Customer[] = [];
  const hasFilter = params.search || params.tier || params.status;
  
  if (hasFilter) {
    let idx = 0;
    while (matches.length < params.limit + params.offset && idx < 50000) {
      const c = getCustomerAtIndex(idx);
      let match = true;
      if (params.search && !c.name.toLowerCase().includes(params.search.toLowerCase()) && !c.email.toLowerCase().includes(params.search.toLowerCase())) {
        match = false;
      }
      if (params.tier && c.tier !== params.tier) {
        match = false;
      }
      if (params.status && c.status !== params.status) {
        match = false;
      }
      if (match) {
        matches.push(c);
      }
      idx++;
    }
  } else {
    for (let i = params.offset; i < Math.min(params.offset + params.limit, totalCount); i++) {
      matches.push(getCustomerAtIndex(i));
    }
  }
  return {
    items: matches.slice(params.offset, params.offset + params.limit),
    totalCount: hasFilter ? Math.min(matches.length * 20, 1000000) : totalCount,
  };
}

// Similar query for orders
export function queryOrders(params: {
  offset: number;
  limit: number;
  search?: string;
  status?: string;
}) {
  const totalCount = 500000; // 500k orders
  const matches: Order[] = [];
  const hasFilter = params.search || params.status;
  
  if (hasFilter) {
    let idx = 0;
    while (matches.length < params.limit + params.offset && idx < 50000) {
      const o = getOrderAtIndex(idx);
      let match = true;
      if (params.search && !o.customerName.toLowerCase().includes(params.search.toLowerCase()) && !o.id.toLowerCase().includes(params.search.toLowerCase())) {
        match = false;
      }
      if (params.status && o.status !== params.status) {
        match = false;
      }
      if (match) {
        matches.push(o);
      }
      idx++;
    }
  } else {
    for (let i = params.offset; i < Math.min(params.offset + params.limit, totalCount); i++) {
      matches.push(getOrderAtIndex(i));
    }
  }
  return {
    items: matches.slice(params.offset, params.offset + params.limit),
    totalCount: hasFilter ? Math.min(matches.length * 20, 500000) : totalCount,
  };
}
