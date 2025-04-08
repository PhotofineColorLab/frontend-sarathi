import { Order, OrderStatus, Product, User } from './types';

const API_URL = 'https://backend-sarathi.onrender.com/api';


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

    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      } else {
        throw new Error(`Login failed: ${response.status} ${response.statusText}`);
      }
    }

    const data = await response.json();
    
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
  
  if (!token) {
    throw new Error('No authentication token found');
  }
  
  try {
    console.log('Fetching staff members...');
    const response = await fetch(`${API_URL}/staff`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Fetch staff error response:', errorData);
      throw new Error(errorData.message || 'Failed to fetch staff members');
    }

    const data = await response.json();
    console.log(`Retrieved ${data.length} staff members`);
    
    // Ensure each staff member has an id property for client-side operations
    const normalizedStaff = data.map((staff: any) => {
      if (staff._id && !staff.id) {
        staff.id = staff._id;
      }
      return staff;
    });
    
    return normalizedStaff;
  } catch (error) {
    console.error('Fetch staff error:', error);
    throw error;
  }
};

export const createStaff = async (staffData: Omit<User, 'id' | 'createdAt'>) => {
  const token = localStorage.getItem('token');
  console.log('Creating staff with data:', staffData);
  console.log('Authorization token present:', !!token);
  
  try {
    const response = await fetch(`${API_URL}/staff`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(staffData),
    });

    const responseData = await response.json();
    console.log('Create staff response:', {
      status: response.status,
      statusText: response.statusText,
      data: responseData,
      headers: Object.fromEntries(response.headers.entries())
    });

    if (!response.ok) {
      console.error('Create staff error response:', {
        status: response.status,
        statusText: response.statusText,
        data: responseData,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      // Handle specific error cases
      if (response.status === 403) {
        throw new Error('You do not have permission to create staff members');
      }
      
      if (responseData.message === 'Missing required fields') {
        throw new Error(`Missing required fields: ${Object.entries(responseData.details)
          .filter(([_, present]) => !present)
          .map(([field]) => field)
          .join(', ')}`);
      }
      
      if (responseData.message === 'Invalid role specified') {
        throw new Error(`Invalid role: ${responseData.receivedRole}. Valid roles are: ${responseData.validRoles.join(', ')}`);
      }
      
      if (responseData.message === 'Validation error') {
        const validationErrors = Object.entries(responseData.details)
          .map(([field, error]: [string, any]) => `${field}: ${error.message}`)
          .join(', ');
        throw new Error(`Validation error: ${validationErrors}`);
      }
      
      if (responseData.message === 'Duplicate key error') {
        throw new Error(`A staff member with this ${responseData.field} already exists`);
      }
      
      throw new Error(responseData.message || responseData.error || 'Failed to create staff member');
    }

    return responseData;
  } catch (error) {
    console.error('Create staff error:', error);
    throw error;
  }
};

export const updateStaff = async (id: string, staffData: Partial<User>) => {
  const token = localStorage.getItem('token');
  console.log('Updating staff with ID:', id);
  console.log('Update data:', staffData);
  
  try {
    const response = await fetch(`${API_URL}/staff/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(staffData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Update staff error response:', errorData);
      throw new Error(errorData.message || 'Failed to update staff member');
    }

    return response.json();
  } catch (error) {
    console.error('Update staff error:', error);
    throw error;
  }
};

export const deleteStaff = async (id: string) => {
  const token = localStorage.getItem('token');
  console.log('Deleting staff with ID:', id);
  
  try {
    const response = await fetch(`${API_URL}/staff/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Delete staff error response:', errorData);
      throw new Error(errorData.message || 'Failed to delete staff member');
    }

    return response.json();
  } catch (error) {
    console.error('Delete staff error:', error);
    throw error;
  }
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
    
  console.log('Fetching orders from URL:', url);
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch orders');
  }

  const data = await response.json();
  console.log('Orders received from server:', data);
  return data;
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

// Attendance functions
export const recordAttendance = async (staffId: string, attendanceData: { date: string, isPresent: boolean, remarks?: string }) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/staff/${staffId}/attendance`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(attendanceData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to record attendance');
  }

  return response.json();
};

export const getStaffAttendance = async (staffId: string, startDate?: string, endDate?: string) => {
  const token = localStorage.getItem('token');
  
  let url = `${API_URL}/staff/${staffId}/attendance`;
  
  // Add date range parameters if provided
  if (startDate && endDate) {
    url += `?startDate=${startDate}&endDate=${endDate}`;
  }
  
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch staff attendance');
  }

  return response.json();
};

export const getAllStaffAttendanceByDate = async (date: string) => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/staff/attendance/date?date=${date}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch attendance for the specified date');
  }

  return response.json();
}; 