
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
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        return null;
      }

      // Get user details from approved_users table
      const { data: userData, error } = await supabase
        .from('approved_users')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (error || !userData) {
        console.error('Error fetching user data:', error);
        return null;
      }

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
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  },

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return !!session?.user;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  }
};
