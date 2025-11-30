// Динамически определяем API URL на основе текущего домена
const getApiUrl = (): string => {
  // Server-side rendering - используем переменную окружения
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  }

  // Client-side - используем тот же домен что и frontend, но порт 8000
  const hostname = window.location.hostname;
  const protocol = window.location.protocol;

  // Формируем API URL с тем же доменом и портом 8000
  return `${protocol}//${hostname}:8000`;
};

const API_URL = getApiUrl();

interface AuthResponse {
  access: string;
  refresh: string;
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    has_password?: boolean;
    auth_provider?: 'email' | 'google' | null;
  };
}

interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
}

class ApiService {
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    // Read token from localStorage instead of cookies
    return localStorage.getItem('access_token');
  }

  private setTokens(access: string, refresh: string): void {
    if (typeof window === 'undefined') return;
    console.log(access, refresh);
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
  }

  private clearTokens(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add JWT token from localStorage to Authorization header
    const authToken = this.getAuthToken();
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: 'omit',  // Don't send cookies - using localStorage instead
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

    // Save tokens to localStorage
    this.setTokens(data.access, data.refresh);

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

    // Save tokens to localStorage
    this.setTokens(data.access, data.refresh);

    return data;
  }

  async logout(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await this.request('/api/auth/logout/', {
          method: 'POST',
          body: JSON.stringify({ refresh: refreshToken }),
        });
      }
    } finally {
      // Always clear tokens from localStorage, even if logout request fails
      this.clearTokens();
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

    // Save tokens to localStorage
    this.setTokens(data.access, data.refresh);

    return data;
  }

  async updateProfile(firstName: string, lastName: string): Promise<AuthResponse['user']> {
    return this.request('/api/auth/update-profile/', {
      method: 'PATCH',
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
      }),
    });
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<{ message: string }> {
    return this.request('/api/auth/change-password/', {
      method: 'POST',
      body: JSON.stringify({
        old_password: oldPassword,
        new_password: newPassword,
      }),
    });
  }

  async setPassword(newPassword: string): Promise<{ message: string }> {
    return this.request('/api/auth/set-password/', {
      method: 'POST',
      body: JSON.stringify({
        new_password: newPassword,
      }),
    });
  }

  async updateEmail(newEmail: string, password: string): Promise<AuthResponse['user']> {
    return this.request('/api/auth/update-email/', {
      method: 'PATCH',
      body: JSON.stringify({
        new_email: newEmail,
        password: password,
      }),
    });
  }
}

export const api = new ApiService();
export type { AuthResponse, ApiError };