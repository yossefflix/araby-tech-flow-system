
import { supabase } from "@/integrations/supabase/client";

export interface CurrentUser {
  id: string;
  name: string;
  phone: string;
  role: 'admin' | 'technician' | 'call_center';
}

export const authUtils = {
  // Clean up authentication state
  cleanupAuthState(): void {
    // Remove all Supabase auth keys from localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    
    // Remove from sessionStorage as well
    Object.keys(sessionStorage || {}).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
  },

  // Login user with phone and password
  async loginUser(phone: string, password: string): Promise<{ user: CurrentUser | null, error: string | null }> {
    try {
      console.log('Attempting login for phone:', phone);
      
      // Find user in approved_users table
      const { data: userData, error: userError } = await supabase
        .from('approved_users')
        .select('*')
        .eq('phone', phone)
        .eq('password', password)
        .single();

      if (userError || !userData) {
        console.log('User not found or invalid credentials:', userError);
        return { 
          user: null, 
          error: 'رقم الهاتف أو كلمة المرور غير صحيحة، أو أن حسابك غير معتمد' 
        };
      }

      console.log('User found in approved_users:', userData);

      const currentUser: CurrentUser = {
        id: userData.id,
        name: userData.name,
        phone: userData.phone,
        role: userData.role as 'admin' | 'technician' | 'call_center'
      };

      // Store user data in localStorage for session management
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      console.log('User logged in successfully:', currentUser);

      return { user: currentUser, error: null };

    } catch (error) {
      console.error('Login error:', error);
      return { 
        user: null, 
        error: 'حدث خطأ في النظام' 
      };
    }
  },

  // Get current user
  async getCurrentUser(): Promise<CurrentUser | null> {
    try {
      console.log('Getting current user...');
      
      // Get user from localStorage
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        console.log('User found in localStorage:', user);
        return user;
      }

      console.log('No user found in localStorage');
      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  // Sign out user
  async signOut(): Promise<void> {
    try {
      console.log('Signing out user...');
      this.cleanupAuthState();
      localStorage.removeItem('currentUser');
      console.log('User signed out successfully');
      // Force page refresh for clean state
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
      // Force refresh even if signout fails
      window.location.href = '/';
    }
  },

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      const isAuth = !!user;
      console.log('Authentication check:', isAuth);
      return isAuth;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  }
};
