// Spicy Route Supabase Authentication Service
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG, TABLES, ROLES } from '../config/supabase';

class SupabaseAuthService {
  constructor() {
    this.supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey, {
      auth: {
        flowType: 'implicit',        // Works on all mobile browsers (no localStorage PKCE verifier needed)
        detectSessionInUrl: true,    // Auto-detect tokens in URL hash after OAuth redirect
        persistSession: true,
        storage: window.localStorage
      }
    });
    this.currentUser = null;
    this.currentRole = null;
  }

  // Initialize and check for existing session
  async init() {
    const { data: { session } } = await this.supabase.auth.getSession();
    if (session) {
      this.currentUser = session.user;
      await this.loadUserRole();
    }
    return this.supabase;
  }

  // Load user role from database
  async loadUserRole() {
    if (!this.currentUser) return null;

    try {
      const { data, error } = await this.supabase
        .from(TABLES.USERS)
        .select('role')
        .eq('auth_id', this.currentUser.id)
        .single();

      if (error) throw error;
      this.currentRole = data?.role || null;
      return this.currentRole;
    } catch (error) {
      console.error('Failed to load user role:', error);
      return null;
    }
  }

  // Google Sign-In for all roles
  async signInWithGoogle() {
    try {
      const { data, error } = await this.supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) throw error;
      return { success: true, url: data.url };
    } catch (error) {
      console.error('Google Sign-In failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Email/Password Registration for all roles
  async registerWithEmail(email, password, name, role, additionalData = {}) {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            role: role,
            name: name,
            ...additionalData
          }
        }
      });

      if (error) throw error;
      return { success: true, message: 'Registration successful. Please confirm your email.' };
    } catch (error) {
      console.error('Email registration failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Email/Password Login for all roles
  async loginWithEmail(email, password) {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (error) throw error;

      this.currentUser = data.user;
      await this.loadUserRole();

      return { success: true, user: this.currentUser, role: this.currentRole };
    } catch (error) {
      console.error('Email login failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Logout
  async logout() {
    try {
      const { error } = await this.supabase.auth.signOut();
      if (error) throw error;

      this.currentUser = null;
      this.currentRole = null;
      return { success: true };
    } catch (error) {
      console.error('Logout failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Get current role
  getCurrentRole() {
    return this.currentRole;
  }

  // Check if user is authenticated
  isAuthenticated() {
    return this.currentUser !== null;
  }

  // Check if user has specific role
  hasRole(role) {
    return this.currentRole === role;
  }

  // Update user profile
  async updateProfile(updates) {
    try {
      if (!this.currentUser) {
        return { success: false, error: 'User not authenticated' };
      }

      const { data, error } = await this.supabase
        .from(TABLES.USERS)
        .update(updates)
        .eq('auth_id', this.currentUser.id)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Profile update failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Reset password
  async resetPassword(email) {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;
      return { success: true, message: 'Password reset email sent' };
    } catch (error) {
      console.error('Password reset failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Handle OAuth callback
  async handleOAuthCallback() {
    try {
      const { data, error } = await this.supabase.auth.getSession();
      
      if (error) throw error;
      
      if (data.session) {
        this.currentUser = data.session.user;
        
        // Ensure user has role metadata
        if (!this.currentUser.user_metadata?.role) {
          await this.supabase.auth.updateUser({
            data: { role: 'CUSTOMER' }
          });
        }
        
        await this.loadUserRole();
        return { success: true, user: this.currentUser, role: this.currentRole };
      }
      
      return { success: false, error: 'No session found' };
    } catch (error) {
      console.error('OAuth callback failed:', error);
      return { success: false, error: error.message };
    }
  }
}

// Create singleton instance
const supabaseAuthService = new SupabaseAuthService();
export default supabaseAuthService;