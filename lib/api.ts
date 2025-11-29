const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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
  private getCsrfToken(): string | null {
    if (typeof document === 'undefined') return null;
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'csrftoken') {
        return value;
      }
    }
    return null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add CSRF token for state-changing methods
    const csrfToken = this.getCsrfToken();
    if (csrfToken && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method || 'GET')) {
      headers['X-CSRFToken'] = csrfToken;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include',  // Automatically sends httpOnly cookies
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

    // Tokens are now in httpOnly cookies - no need to store in localStorage

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

    // Tokens are now in httpOnly cookies - no need to store in localStorage

    return data;
  }

  async logout(): Promise<void> {
    await this.request('/api/auth/logout/', {
      method: 'POST',
    });
    // Backend will clear httpOnly cookies automatically
  }

  async getUser(): Promise<AuthResponse['user']> {
    return this.request('/api/auth/user/');
  }

  async googleLogin(code: string): Promise<AuthResponse> {
    const data = await this.request<AuthResponse>('/api/auth/google/', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });

    // Tokens are now in httpOnly cookies - no need to store in localStorage

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