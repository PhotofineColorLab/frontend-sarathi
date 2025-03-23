import { Order, OrderStatus, Product, User } from './types';

const API_URL = import.meta.env.VITE_API_URL || 'https://backend-sarathi.onrender.com/api';

// Auth functions
export const loginStaff = async (email: string, password: string) => {
  try {
    const response = await fetch(`${API_URL}/staff/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    // First check if response is ok
    if (!response.ok) {
      // Try to parse error message if possible
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      } else {
        // If not JSON, use status text
        throw new Error(`Login failed: ${response.status} ${response.statusText}`);
      }
    }

    // Parse response data
    const data = await response.json();
    
    // Store token in localStorage
    if (data && data.token) {
      localStorage.setItem('token', data.token);
      return data;
    } else {
      throw new Error('Invalid response format from server');
    }
  } catch (error: any) {
    console.error('Login error:', error);
    throw error;
  }
};

export const logoutStaff = () => {
  localStorage.removeItem('token');
};

// Staff management functions
export const fetchStaff = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/staff`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch staff members');
  }

  return response.json();
};

export const createStaff = async (staffData: Omit<User, 'id' | 'createdAt'>) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/staff`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(staffData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create staff member');
  }

  return response.json();
};

export const updateStaff = async (id: string, staffData: Partial<User>) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/staff/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(staffData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update staff member');
  }

  return response.json();
};

export const deleteStaff = async (id: string) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/staff/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete staff member');
  }

  return response.json();
};

// Product functions
export const fetchProducts = async (category?: string) => {
  const token = localStorage.getItem('token');
  const url = category 
    ? `${API_URL}/products/category/${category}`
    : `${API_URL}/products`;
    
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }

  return response.json();
};

export const createProduct = async (productData: Omit<Product, 'id' | '_id' | 'createdAt' | 'updatedAt'>) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/products`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(productData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create product');
  }

  return response.json();
};

export const updateProduct = async (id: string, productData: Partial<Product>) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/products/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(productData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update product');
  }

  return response.json();
};

export const deleteProduct = async (id: string) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/products/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete product');
  }

  return response.json();
};

// Order functions
export const fetchOrders = async (status?: string) => {
  const token = localStorage.getItem('token');
  const url = status 
    ? `${API_URL}/orders/status/${status}`
    : `${API_URL}/orders`;
    
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch orders');
  }

  return response.json();
};

export const fetchOrdersByDateRange = async (startDate: Date, endDate: Date) => {
  const token = localStorage.getItem('token');
  
  // Format dates as ISO strings for the URL
  const start = startDate.toISOString().split('T')[0];
  const end = endDate.toISOString().split('T')[0];
  
  const url = `${API_URL}/orders/date-range/${start}/${end}`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch orders by date range');
  }

  return response.json();
};

export const fetchOrdersByAssignedTo = async (staffId: string) => {
  const token = localStorage.getItem('token');
  
  const url = `${API_URL}/orders/assigned/${staffId}`;
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch assigned orders');
  }

  return response.json();
};

export const createOrder = async (formData: FormData) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      // Don't set Content-Type here, let the browser set it with the boundary for FormData
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create order');
  }

  return response.json();
};

export const updateOrder = async (id: string, orderData: Partial<Order>) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/orders/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(orderData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update order');
  }

  return response.json();
};

export const updateOrderWithImage = async (id: string, formData: FormData) => {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_URL}/orders/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      // Don't set Content-Type here, let the browser set it with the boundary for FormData
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update order');
  }

  return response.json();
};

export const markOrderAsPaid = async (id: string) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/orders/${id}/paid`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ 
      isPaid: true, 
      paidAt: new Date() 
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to mark order as paid');
  }

  return response.json();
};

export const deleteOrder = async (id: string) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/orders/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete order');
  }

  return response.json();
}; 