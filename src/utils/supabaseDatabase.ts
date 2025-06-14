
import { supabase } from "@/integrations/supabase/client";

export interface User {
  id: string;
  name: string;
  phone: string;
  role: 'admin' | 'technician' | 'call_center';
  status: 'pending' | 'approved' | 'rejected';
  password: string;
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  approvedAt?: string;
}

export interface RegistrationRequest {
  name: string;
  phone: string;
  password: string;
  role: 'technician' | 'call_center';
}

export const supabaseDB = {
  // إضافة طلب تسجيل جديد
  async addRegistrationRequest(data: RegistrationRequest): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('registration_requests')
        .insert([{
          name: data.name,
          phone: data.phone,
          password: data.password,
          role: data.role,
          status: 'pending'
        }]);

      return !error;
    } catch (error) {
      console.error('Error adding registration request:', error);
      return false;
    }
  },

  // التحقق من وجود رقم الهاتف
  async isPhoneRegistered(phone: string): Promise<boolean> {
    try {
      // البحث في طلبات التسجيل
      const { data: requests } = await supabase
        .from('registration_requests')
        .select('phone')
        .eq('phone', phone)
        .single();

      if (requests) return true;

      // البحث في المستخدمين المعتمدين
      const { data: approved } = await supabase
        .from('approved_users')
        .select('phone')
        .eq('phone', phone)
        .single();

      return !!approved;
    } catch (error) {
      return false;
    }
  },

  // جلب طلبات التسجيل
  async getRegistrationRequests(): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('registration_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data?.map(item => ({
        id: item.id,
        name: item.name,
        phone: item.phone,
        role: item.role as 'technician' | 'call_center',
        status: item.status as 'pending' | 'approved' | 'rejected',
        password: item.password,
        createdAt: item.created_at,
        reviewedAt: item.reviewed_at,
        reviewedBy: item.reviewed_by
      })) || [];
    } catch (error) {
      console.error('Error fetching registration requests:', error);
      return [];
    }
  },

  // جلب المستخدمين المعتمدين
  async getApprovedUsers(): Promise<User[]> {
    try {
      const { data, error } = await supabase
        .from('approved_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data?.map(item => ({
        id: item.id,
        name: item.name,
        phone: item.phone,
        role: item.role as 'admin' | 'technician' | 'call_center',
        status: 'approved' as const,
        password: item.password,
        createdAt: item.created_at,
        approvedAt: item.approved_at
      })) || [];
    } catch (error) {
      console.error('Error fetching approved users:', error);
      return [];
    }
  },

  // تحديث حالة المستخدم (قبول أو رفض)
  async updateUserStatus(requestId: string, status: 'approved' | 'rejected'): Promise<boolean> {
    try {
      if (status === 'approved') {
        // جلب بيانات الطلب
        const { data: request, error: fetchError } = await supabase
          .from('registration_requests')
          .select('*')
          .eq('id', requestId)
          .single();

        if (fetchError || !request) {
          console.error('Error fetching request:', fetchError);
          return false;
        }

        // إضافة المستخدم للمستخدمين المعتمدين
        const { error: insertError } = await supabase
          .from('approved_users')
          .insert([{
            name: request.name,
            phone: request.phone,
            password: request.password,
            role: request.role
          }]);

        if (insertError) {
          console.error('Error inserting approved user:', insertError);
          return false;
        }
      }

      // تحديث حالة الطلب
      const { error: updateError } = await supabase
        .from('registration_requests')
        .update({ 
          status,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', requestId);

      return !updateError;
    } catch (error) {
      console.error('Error updating user status:', error);
      return false;
    }
  },

  // حذف مستخدم
  async deleteUser(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('approved_users')
        .delete()
        .eq('id', userId);

      return !error;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  },

  // التحقق من بيانات تسجيل الدخول
  async validateLogin(phone: string, password: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('approved_users')
        .select('*')
        .eq('phone', phone)
        .eq('password', password)
        .single();

      if (error || !data) return null;

      return {
        id: data.id,
        name: data.name,
        phone: data.phone,
        role: data.role as 'admin' | 'technician' | 'call_center',
        status: 'approved' as const,
        password: data.password,
        createdAt: data.created_at,
        approvedAt: data.approved_at
      };
    } catch (error) {
      console.error('Error validating login:', error);
      return null;
    }
  }
};
