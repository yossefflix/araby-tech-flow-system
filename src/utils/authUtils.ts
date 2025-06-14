
import { supabase } from "@/integrations/supabase/client";

export interface CurrentUser {
  id: string;
  name: string;
  phone: string;
  role: 'admin' | 'technician' | 'call_center';
}

export const authUtils = {
  // Get current user from Supabase session
  async getCurrentUser(): Promise<CurrentUser | null> {
    try {
      console.log('Getting current user session...');
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        console.log('No session or user found');
        return null;
      }

      console.log('Session user found:', session.user);

      // Get user details from approved_users table
      const { data: userData, error } = await supabase
        .from('approved_users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Error fetching user data from approved_users:', error);
        
        // If user not found by ID, try to find by email/phone
        const email = session.user.email;
        if (email && email.includes('@temp.local')) {
          const phone = email.replace('@temp.local', '');
          console.log('Trying to find user by phone:', phone);
          
          const { data: userByPhone, error: phoneError } = await supabase
            .from('approved_users')
            .select('*')
            .eq('phone', phone)
            .single();
            
          if (phoneError || !userByPhone) {
            console.error('Error fetching user by phone:', phoneError);
            return null;
          }
          
          console.log('User found by phone:', userByPhone);
          return {
            id: userByPhone.id,
            name: userByPhone.name,
            phone: userByPhone.phone,
            role: userByPhone.role as 'admin' | 'technician' | 'call_center'
          };
        }
        
        return null;
      }

      if (!userData) {
        console.log('No user data found');
        return null;
      }

      console.log('User data found:', userData);
      return {
        id: userData.id,
        name: userData.name,
        phone: userData.phone,
        role: userData.role as 'admin' | 'technician' | 'call_center'
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  // Sign out user
  async signOut(): Promise<void> {
    try {
      console.log('Signing out user...');
      await supabase.auth.signOut();
      console.log('User signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
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
