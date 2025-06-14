
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
      
      // Clean up any existing auth state first
      this.cleanupAuthState();
      
      // Try to sign out any existing session
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        console.log('No existing session to sign out');
      }

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

      // Create a simple email for auth
      const tempEmail = `${userData.phone}@company.local`;
      
      // Try to sign in
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: tempEmail,
        password: password
      });

      if (authError) {
        console.log('Auth sign in failed, trying to create user:', authError);
        
        // If sign in fails, create the user
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: tempEmail,
          password: password,
          options: {
            data: {
              name: userData.name,
              phone: userData.phone,
              role: userData.role,
              user_id: userData.id
            }
          }
        });

        if (signUpError) {
          console.error('Sign up error:', signUpError);
          return { 
            user: null, 
            error: 'حدث خطأ في تسجيل الدخول' 
          };
        }
        
        console.log('User created successfully:', signUpData);
      } else {
        console.log('User signed in successfully:', authData);
      }

      const currentUser: CurrentUser = {
        id: userData.id,
        name: userData.name,
        phone: userData.phone,
        role: userData.role as 'admin' | 'technician' | 'call_center'
      };

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
      console.log('Getting current user session...');
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        console.log('No session or user found');
        return null;
      }

      console.log('Session user found:', session.user);

      // Get user details from approved_users table by phone
      const email = session.user.email;
      if (email && email.includes('@company.local')) {
        const phone = email.replace('@company.local', '');
        console.log('Trying to find user by phone:', phone);
        
        const { data: userData, error } = await supabase
          .from('approved_users')
          .select('*')
          .eq('phone', phone)
          .single();
          
        if (error || !userData) {
          console.error('Error fetching user by phone:', error);
          return null;
        }
        
        console.log('User found by phone:', userData);
        return {
          id: userData.id,
          name: userData.name,
          phone: userData.phone,
          role: userData.role as 'admin' | 'technician' | 'call_center'
        };
      }

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
      await supabase.auth.signOut({ scope: 'global' });
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
      const { data: { session } } = await supabase.auth.getSession();
      const isAuth = !!session?.user;
      console.log('Authentication check:', isAuth);
      return isAuth;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  }
};
