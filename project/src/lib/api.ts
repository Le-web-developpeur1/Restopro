const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class ApiClient {
  private getHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers
      }
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Erreur réseau' }));
      throw new Error(error.error || 'Une erreur est survenue');
    }

    return response.json();
  }

  // Auth
  async hasAdmin() {
    return this.request<{ hasAdmin: boolean }>('/auth/has-admin');
  }

  async setupAdmin(data: { email: string; password: string; full_name: string }) {
    return this.request('/auth/setup-admin', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async login(email: string, password: string) {
    return this.request<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  async getProfile() {
    return this.request('/auth/me');
  }

  // Products
  async getProducts() {
    return this.request('/products');
  }

  async createProduct(data: any) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateProduct(id: string, data: any) {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteProduct(id: string) {
    return this.request(`/products/${id}`, { method: 'DELETE' });
  }

  // Categories
  async getCategories() {
    return this.request('/categories');
  }

  async createCategory(data: any) {
    return this.request('/categories', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateCategory(id: string, data: any) {
    return this.request(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteCategory(id: string) {
    return this.request(`/categories/${id}`, { method: 'DELETE' });
  }

  // Orders
  async getOrders() {
    return this.request('/orders');
  }

  async getOrder(id: string) {
    return this.request(`/orders/${id}`);
  }

  async createOrder(data: any) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateOrder(id: string, data: any) {
    return this.request(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async getDashboardStats() {
    return this.request('/orders/stats/dashboard');
  }

  // Users
  async getUsers() {
    return this.request('/users');
  }

  async getUser(id: string) {
    return this.request(`/users/${id}`);
  }

  async createUser(data: any) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateUser(id: string, data: any) {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteUser(id: string) {
    return this.request(`/users/${id}`, { method: 'DELETE' });
  }

  // Settings
  async getRestaurantInfo() {
    return this.request('/settings/restaurant');
  }

  async uploadLogo(file: File) {
    const formData = new FormData();
    formData.append('logo', file);

    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_URL}/settings/upload-logo`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Erreur réseau' }));
      throw new Error(error.error || 'Une erreur est survenue');
    }

    return response.json();
  }

  async updateRestaurantInfo(data: any) {
    return this.request('/settings/restaurant', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async updateProfile(data: any) {
    return this.request('/settings/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async changePassword(data: any) {
    return this.request('/settings/password', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }
}

export const api = new ApiClient();
