import { Product, Order, User, OrderStatus, ProductCategory } from './types';

// Helper to generate random IDs
const generateId = () => Math.random().toString(36).substring(2, 11);

// Helper to create dates
const daysAgo = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

// Demo Products
export const products: Product[] = [
  {
    id: 'p1',
    name: 'Ceiling Fan - Premium',
    description: 'High-quality ceiling fan with 3-speed settings and remote control',
    price: 129.99,
    category: 'fans',
    stock: 25,
    image: 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?q=80&w=500&auto=format&fit=crop',
    createdAt: daysAgo(120),
    updatedAt: daysAgo(30),
  },
  {
    id: 'p2',
    name: 'LED Panel Light 24W',
    description: 'Energy-efficient LED panel light for residential and commercial use',
    price: 49.99,
    category: 'lights',
    stock: 50,
    image: 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?q=80&w=500&auto=format&fit=crop',
    createdAt: daysAgo(90),
    updatedAt: daysAgo(15),
  },
  {
    id: 'p3',
    name: 'Modular Switch 6-Gang',
    description: 'Premium modular switch plate with 6 switches',
    price: 22.50,
    category: 'switches',
    stock: 100,
    image: 'https://images.unsplash.com/photo-1558449028-b53a39d100fc?q=80&w=500&auto=format&fit=crop',
    createdAt: daysAgo(60),
    updatedAt: daysAgo(10),
  },
  {
    id: 'p4',
    name: 'USB Wall Socket',
    description: 'Wall socket with built-in USB charging ports',
    price: 35.99,
    category: 'sockets',
    stock: 75,
    image: 'https://images.unsplash.com/photo-1544946632-8ad7dbb26817?q=80&w=500&auto=format&fit=crop',
    createdAt: daysAgo(45),
    updatedAt: daysAgo(5),
  },
  {
    id: 'p5',
    name: 'Premium Copper Wire 2.5mm - 100m',
    description: 'High-grade copper wire for residential electrical installations',
    price: 89.99,
    category: 'wires',
    stock: 30,
    image: 'https://images.unsplash.com/photo-1569335468885-d7d1a914631c?q=80&w=500&auto=format&fit=crop',
    createdAt: daysAgo(30),
    updatedAt: daysAgo(3),
  },
  {
    id: 'p6',
    name: 'PVC Conduit 20mm - 3m',
    description: 'Durable PVC conduit for wire protection',
    price: 12.99,
    category: 'conduits',
    stock: 150,
    image: 'https://images.unsplash.com/photo-1621619080560-2487aa4f949a?q=80&w=500&auto=format&fit=crop',
    createdAt: daysAgo(25),
    updatedAt: daysAgo(1),
  },
  {
    id: 'p7',
    name: 'MCB Single Pole 32A',
    description: 'Miniature Circuit Breaker for electrical protection',
    price: 18.50,
    category: 'mcbs',
    stock: 80,
    image: 'https://images.unsplash.com/photo-1647427060118-4911c9821b82?q=80&w=500&auto=format&fit=crop',
    createdAt: daysAgo(20),
    updatedAt: daysAgo(2),
  },
  {
    id: 'p8',
    name: 'Distribution Panel 8-Way',
    description: '8-way distribution panel for residential use',
    price: 79.99,
    category: 'panels',
    stock: 15,
    image: 'https://images.unsplash.com/photo-1647427060118-4911c9821b82?q=80&w=500&auto=format&fit=crop',
    createdAt: daysAgo(15),
    updatedAt: daysAgo(1),  
  },
  {
    id: 'p9',
    name: 'Recessed LED Downlight',
    description: 'Energy-efficient recessed LED downlight for ceilings',
    price: 15.50,
    category: 'lights',
    stock: 120,
    image: 'https://images.unsplash.com/photo-1616687588231-729931354178?q=80&w=500&auto=format&fit=crop',
    createdAt: daysAgo(100),
    updatedAt: daysAgo(20),
},
{
    id: 'p10',
    name: 'Solar Panel 300W',
    description: 'High-efficiency 300W solar panel for renewable energy systems',
    price: 250.00,
    category: 'panels',
    stock: 20,
    image: 'https://images.unsplash.com/photo-1617255100062-817926b4850c?q=80&w=500&auto=format&fit=crop',
    createdAt: daysAgo(80),
    updatedAt: daysAgo(18),
},
{
    id: 'p11',
    name: 'Solar Inverter 3kW',
    description: '3kW solar inverter for converting DC to AC power',
    price: 450.00,
    category: 'tools',
    stock: 10,
    image: 'https://images.unsplash.com/photo-1632354961919-8664b4c75949?q=80&w=500&auto=format&fit=crop',
    createdAt: daysAgo(70),
    updatedAt: daysAgo(16),
},
{
    id: 'p12',
    name: 'Electrical Junction Box',
    description: 'Durable electrical junction box for safe wire connections',
    price: 8.99,
    category: 'panels',
    stock: 200,
    image: 'https://images.unsplash.com/photo-1635368310069-b14197479717?q=80&w=500&auto=format&fit=crop',
    createdAt: daysAgo(55),
    updatedAt: daysAgo(12),
},
{
    id: 'p13',
    name: 'Insulated Screwdriver Set',
    description: 'Set of insulated screwdrivers for electrical work',
    price: 29.99,
    category: 'tools',
    stock: 40,
    image: 'https://images.unsplash.com/photo-1591605342672-ad94e82b39b5?q=80&w=500&auto=format&fit=crop',
    createdAt: daysAgo(40),
    updatedAt: daysAgo(8),
},
{
    id: 'p14',
    name: 'Digital Multimeter',
    description: 'Digital multimeter for measuring voltage, current, and resistance',
    price: 39.99,
    category: 'tools',
    stock: 35,
    image: 'https://images.unsplash.com/photo-1616496924298-6e5494d4d295?q=80&w=500&auto=format&fit=crop',
    createdAt: daysAgo(35),
    updatedAt: daysAgo(6),
},
{
    id: 'p15',
    name: 'Cable Ties - Pack of 100',
    description: 'Pack of 100 durable cable ties for wire management',
    price: 5.50,
    category: 'accessories',
    stock: 300,
    image: 'https://images.unsplash.com/photo-1614066060098-b8089453982e?q=80&w=500&auto=format&fit=crop',
    createdAt: daysAgo(28),
    updatedAt: daysAgo(4),
},
{
    id: 'p16',
    name: 'LED Flood Light 50W',
    description: 'High-intensity 50W LED flood light for outdoor use',
    price: 59.99,
    category: 'lights',
    stock: 60,
    image: 'https://images.unsplash.com/photo-1613093206014-7f15b819280d?q=80&w=500&auto=format&fit=crop',
    createdAt: daysAgo(22),
    updatedAt: daysAgo(2),
},
{
    id: 'p17',
    name: 'Electrical Tape - Black',
    description: 'Roll of black electrical insulation tape',
    price: 2.99,
    category: 'accessories',
    stock: 500,
    image: 'https://images.unsplash.com/photo-1611802953258-2923188d2272?q=80&w=500&auto=format&fit=crop',
    createdAt: daysAgo(18),
    updatedAt: daysAgo(1),
},
{
    id: 'p18',
    name: 'Extension Cord 10m',
    description: '10-meter extension cord with multiple sockets',
    price: 19.99,
    category: 'accessories',
    stock: 90,
    image: 'https://images.unsplash.com/photo-1620839217835-1f95383f940d?q=80&w=500&auto=format&fit=crop',
    createdAt: daysAgo(12),
    updatedAt: daysAgo(1),
}
];

// Demo Staff
export const staffMembers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@electrical.com',
    role: 'admin',
    phone: '+1 (555) 123-4567',
    password: 'admin123', // Adding default password
    createdAt: daysAgo(365),
  },
  {
    id: '2',
    name: 'Staff User',
    email: 'staff@electrical.com',
    role: 'staff',
    phone: '+1 (555) 987-6543',
    password: 'staff123', // Adding default password
    createdAt: daysAgo(180),
  },
  {
    id: '3',
    name: 'John Smith',
    email: 'john@electrical.com',
    role: 'staff',
    phone: '+1 (555) 234-5678',
    password: 'john123', // Adding default password
    createdAt: daysAgo(90),
  },
  {
    id: '4',
    name: 'Sarah Johnson',
    email: 'sarah@electrical.com',
    role: 'admin',
    phone: '+1 (555) 345-6789',
    password: 'sarah123', // Adding default password
    createdAt: daysAgo(60),
  },
  {
    id: '5',
    name: 'Michael Davis',
    email: 'michael@electrical.com',
    role: 'staff',
    phone: '+1 (555) 456-7890',
    password: 'michael123', // Adding default password
    createdAt: daysAgo(45),
  },
];

// Demo Orders
export const orders: Order[] = [
  {
    id: 'o1',
    customerName: 'Acme Construction',
    customerEmail: 'info@acmeconstruction.com',
    customerPhone: '+1 (555) 111-2222',
    items: [
      {
        id: 'oi1',
        productId: 'p1',
        productName: 'Ceiling Fan - Premium',
        quantity: 3,
        price: 129.99,
      },
      {
        id: 'oi2',
        productId: 'p2',
        productName: 'LED Panel Light 24W',
        quantity: 10,
        price: 49.99,
      },
    ],
    total: 889.87,
    status: 'pending',
    notes: 'Urgent order, needed by end of week',
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
    createdBy: '1',
  },
  {
    id: 'o2',
    customerName: 'BuildRight Contractors',
    customerEmail: 'orders@buildright.com',
    customerPhone: '+1 (555) 333-4444',
    items: [
      {
        id: 'oi3',
        productId: 'p3',
        productName: 'Modular Switch 6-Gang',
        quantity: 15,
        price: 22.50,
      },
      {
        id: 'oi4',
        productId: 'p4',
        productName: 'USB Wall Socket',
        quantity: 8,
        price: 35.99,
      },
      {
        id: 'oi5',
        productId: 'p5',
        productName: 'Premium Copper Wire 2.5mm - 100m',
        quantity: 2,
        price: 89.99,
      },
    ],
    total: 655.39,
    status: 'dc',
    createdAt: daysAgo(5),
    updatedAt: daysAgo(3),
    createdBy: '2',
  },
  {
    id: 'o3',
    customerName: 'HomeServe Electricals',
    customerEmail: 'purchases@homeserve.com',
    customerPhone: '+1 (555) 555-6666',
    items: [
      {
        id: 'oi6',
        productId: 'p6',
        productName: 'PVC Conduit 20mm - 3m',
        quantity: 20,
        price: 12.99,
      },
      {
        id: 'oi7',
        productId: 'p7',
        productName: 'MCB Single Pole 32A',
        quantity: 6,
        price: 18.50,
      },
      {
        id: 'oi8',
        productId: 'p8',
        productName: 'Distribution Panel 8-Way',
        quantity: 1,
        price: 79.99,
      },
    ],
    total: 380.79,
    status: 'invoice',
    createdAt: daysAgo(8),
    updatedAt: daysAgo(5),
    createdBy: '3',
  },
  {
    id: 'o4',
    customerName: 'EcoSmart Solutions',
    customerEmail: 'procurement@ecosmart.com',
    customerPhone: '+1 (555) 777-8888',
    items: [
      {
        id: 'oi9',
        productId: 'p2',
        productName: 'LED Panel Light 24W',
        quantity: 30,
        price: 49.99,
      },
    ],
    total: 1499.70,
    status: 'dispatched',
    notes: 'Bulk order for commercial project',
    createdAt: daysAgo(12),
    updatedAt: daysAgo(7),
    createdBy: '1',
  },
  {
    id: 'o5',
    customerName: 'Reeves Renovations',
    customerEmail: 'contact@reevesreno.com',
    customerPhone: '+1 (555) 999-0000',
    items: [
      {
        id: 'oi10',
        productId: 'p1',
        productName: 'Ceiling Fan - Premium',
        quantity: 2,
        price: 129.99,
      },
      {
        id: 'oi11',
        productId: 'p4',
        productName: 'USB Wall Socket',
        quantity: 5,
        price: 35.99,
      },
    ],
    total: 439.93,
    status: 'pending',
    createdAt: daysAgo(1),
    updatedAt: daysAgo(1),
    createdBy: '2',
  },
  {
    id: 'o6',
    customerName: 'BrightLight Installations',
    customerEmail: 'sales@brightlight.com',
    customerPhone: '+1 (555) 123-4567',
    items: [
        {
            id: 'oi12',
            productId: 'p9',
            productName: 'Recessed LED Downlight',
            quantity: 25,
            price: 15.50
        },
        {
            id: 'oi13',
            productId: 'p3',
            productName: 'Modular Switch 6-Gang',
            quantity: 5,
            price: 22.50
        }
    ],
    total: 500.00,
    status: 'dc',
    createdAt: daysAgo(6),
    updatedAt: daysAgo(4),
    createdBy: '3'
},
{
    id: 'o7',
    customerName: 'CityWide Electrical',
    customerEmail: 'orders@citywide.net',
    customerPhone: '+1 (555) 678-9012',
    items: [
        {
            id: 'oi14',
            productId: 'p5',
            productName: 'Premium Copper Wire 2.5mm - 100m',
            quantity: 5,
            price: 89.99
        },
        {
            id: 'oi15',
            productId: 'p6',
            productName: 'PVC Conduit 20mm - 3m',
            quantity: 50,
            price: 12.99
        }
    ],
    total: 1100.45,
    status: 'dispatched',
    createdAt: daysAgo(10),
    updatedAt: daysAgo(8),
    createdBy: '1'
},
{
    id: 'o8',
    customerName: 'PowerUp Solutions',
    customerEmail: 'info@powerupsolutions.com',
    customerPhone: '+1 (555) 234-5678',
    items: [
        {
            id: 'oi16',
            productId: 'p7',
            productName: 'MCB Single Pole 32A',
            quantity: 10,
            price: 18.50
        },
        {
            id: 'oi17',
            productId: 'p8',
            productName: 'Distribution Panel 8-Way',
            quantity: 2,
            price: 79.99
        }
    ],
    total: 344.98,
    status: 'pending',
    createdAt: daysAgo(3),
    updatedAt: daysAgo(3),
    createdBy: '2'
},
{
    id: 'o9',
    customerName: 'Solaris Energy',
    customerEmail: 'sales@solarisenergy.com',
    customerPhone: '+1 (555) 789-0123',
    items: [
        {
            id: 'oi18',
            productId: 'p10',
            productName: 'Solar Panel 300W',
            quantity: 4,
            price: 250.00
        },
        {
            id: 'oi19',
            productId: 'p11',
            productName: 'Solar Inverter 3kW',
            quantity: 1,
            price: 450.00
        }
    ],
    total: 1450.00,
    status: 'invoice',
    createdAt: daysAgo(7),
    updatedAt: daysAgo(6),
    createdBy: '3'
},
{
    id: 'o10',
    customerName: 'Voltage Electricals',
    customerEmail: 'contact@voltage.net',
    customerPhone: '+1 (555) 345-6789',
    items: [
        {
            id: 'oi20',
            productId: 'p4',
            productName: 'USB Wall Socket',
            quantity: 12,
            price: 35.99
        },
        {
            id: 'oi21',
            productId: 'p9',
            productName: 'Recessed LED Downlight',
            quantity: 10,
            price: 15.50
        }
    ],
    total: 586.88,
    status: 'dispatched',
    createdAt: daysAgo(9),
    updatedAt: daysAgo(7),
    createdBy: '1'
},
{
    id: 'o11',
    customerName: 'Spark Electrical Supply',
    customerEmail: 'orders@sparksupply.com',
    customerPhone: '+1 (555) 456-7890',
    items: [
        {
            id: 'oi22',
            productId: 'p1',
            productName: 'Ceiling Fan - Premium',
            quantity: 5,
            price: 129.99
        },
        {
            id: 'oi23',
            productId: 'p2',
            productName: 'LED Panel Light 24W',
            quantity: 5,
            price: 49.99
        }
    ],
    total: 900.00,
    status: 'invoice',
    createdAt: daysAgo(4),
    updatedAt: daysAgo(2),
    createdBy: '2'
},
{
    id: 'o12',
    customerName: 'WireCraft Solutions',
    customerEmail: 'sales@wirecraft.com',
    customerPhone: '+1 (555) 567-8901',
    items: [
        {
            id: 'oi24',
            productId: 'p5',
            productName: 'Premium Copper Wire 2.5mm - 100m',
            quantity: 3,
            price: 89.99
        },
        {
            id: 'oi25',
            productId: 'p6',
            productName: 'PVC Conduit 20mm - 3m',
            quantity: 30,
            price: 12.99
        }
    ],
    total: 659.94,
    status: 'dc',
    createdAt: daysAgo(11),
    updatedAt: daysAgo(9),
    createdBy: '3'
},
{
    id: 'o13',
    customerName: 'Circuit City Ltd',
    customerEmail: 'purchases@circuitcity.com',
    customerPhone: '+1 (555) 678-9012',
    items: [
        {
            id: 'oi26',
            productId: 'p7',
            productName: 'MCB Single Pole 32A',
            quantity: 8,
            price: 18.50
        },
        {
            id: 'oi27',
            productId: 'p8',
            productName: 'Distribution Panel 8-Way',
            quantity: 3,
            price: 79.99
        }
    ],
    total: 394.47,
    status: 'invoice',
    createdAt: daysAgo(5),
    updatedAt: daysAgo(3),
    createdBy: '1'
},
{
    id: 'o14',
    customerName: 'Electronix Installations',
    customerEmail: 'contact@electronix.net',
    customerPhone: '+1 (555) 789-0123',
    items: [
        {
            id: 'oi28',
            productId: 'p9',
            productName: 'Recessed LED Downlight',
            quantity: 15,
            price: 15.50
        },
        {
            id: 'oi29',
            productId: 'p3',
            productName: 'Modular Switch 6-Gang',
            quantity: 10,
            price: 22.50
        }
    ],
    total: 457.50,
    status: 'pending',
    createdAt: daysAgo(2),
    updatedAt: daysAgo(2),
    createdBy: '2'
}
];

// CRUD operations for products
export const getProducts = () => [...products];

export const getProduct = (id: string) => {
  return products.find(product => product.id === id);
};

export const addProduct = (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
  const newProduct = {
    ...product,
    id: generateId(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  products.push(newProduct);
  return newProduct;
};

export const updateProduct = (id: string, updates: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>) => {
  const index = products.findIndex(product => product.id === id);
  if (index !== -1) {
    products[index] = {
      ...products[index],
      ...updates,
      updatedAt: new Date(),
    };
    return products[index];
  }
  return null;
};

export const deleteProduct = (id: string) => {
  const index = products.findIndex(product => product.id === id);
  if (index !== -1) {
    const [removedProduct] = products.splice(index, 1);
    return removedProduct;
  }
  return null;
};

// // CRUD operations for orders
export const getOrders = () => [...orders];

export const getOrdersByStatus = (status: OrderStatus) => {
  return orders.filter(order => order.status === status);
};

export const getOrder = (id: string) => {
  return orders.find(order => order.id === id);
};

export const addOrder = (order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => {
  const newOrder = {
    ...order,
    id: generateId(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  orders.push(newOrder);
  return newOrder;
};

export const updateOrder = (id: string, updates: Partial<Omit<Order, 'id' | 'createdAt' | 'updatedAt'>>) => {
  const index = orders.findIndex(order => order.id === id);
  if (index !== -1) {
    orders[index] = {
      ...orders[index],
      ...updates,
      updatedAt: new Date(),
    };
    return orders[index];
  }
  return null;
};

export const deleteOrder = (id: string) => {
  const index = orders.findIndex(order => order.id === id);
  if (index !== -1) {
    const [removedOrder] = orders.splice(index, 1);
    return removedOrder;
  }
  return null;
};

// // CRUD operations for staff
export const getStaffMembers = () => [...staffMembers];

export const getStaffMember = (id: string) => {
  return staffMembers.find(staff => staff.id === id);
};

export const addStaffMember = (staff: Omit<User, 'id' | 'createdAt'>) => {
  const newStaff = {
    ...staff,
    id: generateId(),
    createdAt: new Date(),
  };
  staffMembers.push(newStaff);
  return newStaff;
};

export const updateStaffMember = (id: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>) => {
  const index = staffMembers.findIndex(staff => staff.id === id);
  if (index !== -1) {
    staffMembers[index] = {
      ...staffMembers[index],
      ...updates,
    };
    return staffMembers[index];
  }
  return null;
};

export const deleteStaffMember = (id: string) => {
  const index = staffMembers.findIndex(staff => staff.id === id);
  if (index !== -1) {
    const [removedStaff] = staffMembers.splice(index, 1);
    return removedStaff;
  }
  return null;
};

// Authentication function
export const authenticateUser = (email: string, password: string) => {
  // First check localStorage for staff members
  let localStaffList: User[] = [];
  const staffListString = localStorage.getItem('staffList');
  
  if (staffListString) {
    try {
      localStaffList = JSON.parse(staffListString);
    } catch (error) {
      console.error('Failed to parse staff list from localStorage', error);
    }
  }
  
  // Check if user exists in localStorage staff list
  let user = localStaffList.find(
    staff => staff.email === email && staff.password === password
  );
  
  // If not found in localStorage, check the default staff members
  if (!user) {
    user = staffMembers.find(
      staff => staff.email === email && staff.password === password
    );
  }
  
  return user;
};

// // Analytics data
export const getAnalytics = () => {
  const totalOrders = orders.length;
  const totalSales = orders.reduce((sum, order) => sum + order.total, 0);
  const averageOrderValue = totalSales / totalOrders;
  const pendingOrders = orders.filter(order => order.status === 'pending').length;

  return {
    totalOrders,
    totalSales,
    averageOrderValue,
    pendingOrders,
  };
};

export const getSalesByCategory = (): { category: ProductCategory; amount: number }[] => {
  const categories: { [key in ProductCategory]?: number } = {};
  
  orders.forEach(order => {
    order.items.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        const { category } = product;
        const amount = item.price * item.quantity;
        categories[category] = (categories[category] || 0) + amount;
      }
    });
  });
  
  return Object.entries(categories).map(([category, amount]) => ({
    category: category as ProductCategory,
    amount: Number(amount.toFixed(2)),
  })).sort((a, b) => b.amount - a.amount);
};

export const getSalesByPeriod = () => {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();
  
  const salesByDate: { [date: string]: number } = {};
  
  // Initialize all dates with 0
  last7Days.forEach(date => {
    salesByDate[date] = 0;
  });
  
  // Sum up sales for each date
  orders.forEach(order => {
    const orderDate = order.createdAt.toISOString().split('T')[0];
    if (last7Days.includes(orderDate)) {
      salesByDate[orderDate] += order.total;
    }
  });
  
  return Object.entries(salesByDate).map(([date, amount]) => ({
    date,
    amount: Number(amount.toFixed(2)),
  }));
};