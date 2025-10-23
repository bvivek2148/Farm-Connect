// Admin Dashboard API Helper Functions
// Real API calls for user, product, and order management

const getAuthHeaders = () => {
  const token = localStorage.getItem('farmConnectToken');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

// User Management APIs
export const updateUser = async (userId: number, userData: any) => {
  const response = await fetch(`/api/admin/users/${userId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(userData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update user');
  }
  
  return response.json();
};

export const deleteUser = async (userId: number) => {
  const response = await fetch(`/api/admin/users/${userId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete user');
  }
  
  return response.json();
};

// Product Management APIs
export const createProduct = async (productData: any) => {
  const response = await fetch('/api/admin/products', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(productData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create product');
  }
  
  return response.json();
};

export const updateProduct = async (productId: number, productData: any) => {
  const response = await fetch(`/api/admin/products/${productId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(productData),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update product');
  }
  
  return response.json();
};

export const deleteProduct = async (productId: number) => {
  const response = await fetch(`/api/admin/products/${productId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete product');
  }
  
  return response.json();
};

// Order Management APIs
export const fetchOrders = async () => {
  const response = await fetch('/api/admin/orders', {
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch orders');
  }
  
  return response.json();
};
