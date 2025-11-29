const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://10.10.10.1:8000';

interface AuthResponse {
  access: string;
  refresh: string;
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
  };
}

interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

class ApiService {
  private getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    }
    return null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw {
        message: error.detail || 'Request failed',
        errors: error,
      } as ApiError;
    }

    return response.json();
  }

  async login(email: string, password: string, rememberMe: boolean = false): Promise<AuthResponse> {
    const data = await this.request<AuthResponse>('/api/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (data.access) {
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
    }

    return data;
  }

  async register(
    email: string,
    firstName: string,
    lastName: string,
    password: string
  ): Promise<AuthResponse> {
    const data = await this.request<AuthResponse>('/api/auth/registration/', {
      method: 'POST',
      body: JSON.stringify({
        email,
        first_name: firstName,
        last_name: lastName,
        password1: password,
        password2: password,
      }),
    });

    if (data.access) {
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
    }

    return data;
  }

  async logout(): Promise<void> {
    try {
      const refresh = localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token');

      await this.request('/api/auth/logout/', {
        method: 'POST',
        body: refresh ? JSON.stringify({ refresh }) : undefined,
      });
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      sessionStorage.removeItem('access_token');
      sessionStorage.removeItem('refresh_token');
    }
  }

  async getUser(): Promise<AuthResponse['user']> {
    return this.request('/api/auth/user/');
  }

  async googleLogin(code: string): Promise<AuthResponse> {
    const data = await this.request<AuthResponse>('/api/auth/google/', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });

    if (data.access) {
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
    }

    return data;
  }
}

export const api = new ApiService();
export type { AuthResponse, ApiError };