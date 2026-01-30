/**
 * Authentication Manager
 * Handles user authentication, token management, and session state
 */

const API_URL = 'http://localhost:3000/api';

class AuthManager {
  constructor() {
    this.user = null;
    this.accessToken = null;
    this.refreshToken = null;
    this.loadFromStorage();
  }

  /**
   * Load authentication state from localStorage
   */
  loadFromStorage() {
    const stored = localStorage.getItem('mini-notes-auth');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        this.user = data.user;
        this.accessToken = data.accessToken;
        this.refreshToken = data.refreshToken;
      } catch (error) {
        console.error('Failed to load auth state:', error);
        this.clearAuth();
      }
    }
  }

  /**
   * Save authentication state to localStorage
   */
  saveToStorage() {
    const data = {
      user: this.user,
      accessToken: this.accessToken,
      refreshToken: this.refreshToken
    };
    localStorage.setItem('mini-notes-auth', JSON.stringify(data));
  }

  /**
   * Clear authentication state
   */
  clearAuth() {
    this.user = null;
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('mini-notes-auth');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return this.accessToken !== null;
  }

  /**
   * Register new user
   * @param {string} username 
   * @param {string} email 
   * @param {string} password 
   * @param {boolean} tosAccepted 
   */
  async register(username, email, password, tosAccepted) {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username,
          email,
          password,
          tosAccepted
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Save tokens and user info
      this.user = data.user;
      this.accessToken = data.accessToken;
      this.refreshToken = data.refreshToken;
      this.saveToStorage();

      return { success: true, user: data.user };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Login user
   * @param {string} email 
   * @param {string} password 
   */
  async login(email, password) {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      // Save tokens and user info
      this.user = data.user;
      this.accessToken = data.accessToken;
      this.refreshToken = data.refreshToken;
      this.saveToStorage();

      return { success: true, user: data.user, needsTosUpdate: data.user.needsTosUpdate };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Logout user
   */
  logout() {
    this.clearAuth();
    window.location.reload();
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken() {
    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refreshToken: this.refreshToken })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      this.accessToken = data.accessToken;
      this.refreshToken = data.refreshToken;
      this.saveToStorage();

      return true;
    } catch (error) {
      console.error('Token refresh error:', error);
      this.clearAuth();
      return false;
    }
  }

  /**
   * Get current user info from server
   */
  async getCurrentUser() {
    try {
      const response = await this.authenticatedFetch(`${API_URL}/auth/me`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error('Failed to get user');
      }

      this.user = data.user;
      this.saveToStorage();

      return { success: true, user: data.user };
    } catch (error) {
      console.error('Get user error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Make authenticated fetch request
   * Automatically adds Authorization header and handles token refresh
   */
  async authenticatedFetch(url, options = {}) {
    // Add Authorization header
    options.headers = {
      ...options.headers,
      'Authorization': `Bearer ${this.accessToken}`
    };

    let response = await fetch(url, options);

    // If token expired, try to refresh
    if (response.status === 401) {
      const refreshed = await this.refreshAccessToken();
      if (refreshed) {
        // Retry with new token
        options.headers['Authorization'] = `Bearer ${this.accessToken}`;
        response = await fetch(url, options);
      } else {
        // Refresh failed, redirect to login
        this.clearAuth();
        window.location.hash = '#login';
        throw new Error('Session expired. Please login again.');
      }
    }

    return response;
  }

  /**
   * Delete account
   * @param {boolean} deleteNotes - Whether to delete notes or anonymize them
   */
  async deleteAccount(deleteNotes = true) {
    try {
      const response = await this.authenticatedFetch(`${API_URL}/account`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ deleteNotes })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Account deletion failed');
      }

      this.clearAuth();
      return { success: true, message: data.message };
    } catch (error) {
      console.error('Delete account error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Export user data
   */
  async exportData() {
    try {
      const response = await this.authenticatedFetch(`${API_URL}/account/export`);

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const data = await response.json();

      // Create download link
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mini-notes-export-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      return { success: true };
    } catch (error) {
      console.error('Export error:', error);
      return { success: false, error: error.message };
    }
  }
}

// Export singleton instance
export const authManager = new AuthManager();
