
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

export interface WorkOrder {
  id: string;
  customerName: string;
  phone?: string;
  address: string;
  propertyNumber?: string;
  customerComplaint?: string;
  bookingDate?: string;
  callCenterNotes?: string;
  sapNumber?: string;
  assignedTechnician?: string;
  acType?: string;
  status: string;
  createdAt: string;
  createdBy?: string;
  updatedAt: string;
}

export interface FileUploadResult {
  fileName: string;
  fileUrl: string;
  fileSize: number;
}

export interface WorkReport {
  id: string;
  orderId: string;
  acType?: string;
  equipmentModel1?: string;
  equipmentSerial1?: string;
  equipmentModel2?: string;
  equipmentSerial2?: string;
  warrantyStatus?: string;
  workDescription: string;
  partsUsed?: string;
  recommendations?: string;
  customerSignature?: string;
  photos: FileUploadResult[];
  videos: FileUploadResult[];
  submittedAt: string;
  technicianName: string;
}

// Helper function to safely convert Json to FileUploadResult
const convertJsonToFileUploadResult = (jsonArray: any): FileUploadResult[] => {
  if (!Array.isArray(jsonArray)) return [];
  
  return jsonArray.map((item: any) => ({
    fileName: item.fileName || '',
    fileUrl: item.fileUrl || '',
    fileSize: item.fileSize || 0
  }));
};

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
      // حذف المستخدم من جدول المستخدمين المعتمدين
      const { error: approvedError } = await supabase
        .from('approved_users')
        .delete()
        .eq('id', userId);

      if (approvedError) {
        console.error('Error deleting from approved_users:', approvedError);
        return false;
      }

      // حذف المستخدم من جدول طلبات التسجيل أيضاً إذا كان موجوداً
      const { error: requestError } = await supabase
        .from('registration_requests')
        .delete()
        .eq('id', userId);

      // لا نعتبر عدم وجود المستخدم في طلبات التسجيل خطأ
      if (requestError && !requestError.message.includes('No rows deleted')) {
        console.error('Error deleting from registration_requests:', requestError);
      }

      return true;
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
  },

  // إضافة طلب صيانة جديد
  async addWorkOrder(workOrder: Omit<WorkOrder, 'id' | 'createdAt' | 'updatedAt'>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('work_orders')
        .insert({
          customer_name: workOrder.customerName,
          phone: workOrder.phone,
          address: workOrder.address,
          property_number: workOrder.propertyNumber,
          customer_complaint: workOrder.customerComplaint,
          booking_date: workOrder.bookingDate,
          call_center_notes: workOrder.callCenterNotes,
          sap_number: workOrder.sapNumber,
          assigned_technician: workOrder.assignedTechnician,
          ac_type: workOrder.acType,
          status: workOrder.status || 'pending',
          created_by: workOrder.createdBy
        });

      if (error) {
        console.error('Error adding work order:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error adding work order:', error);
      return false;
    }
  },

  // جلب جميع طلبات الصيانة (فقط غير المكتملة لإدارة الطلبات)
  async getWorkOrders(): Promise<WorkOrder[]> {
    try {
      const { data, error } = await supabase
        .from('work_orders')
        .select('*')
        .neq('status', 'completed')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data?.map(item => ({
        id: item.id,
        customerName: item.customer_name,
        phone: item.phone,
        address: item.address,
        propertyNumber: item.property_number,
        customerComplaint: item.customer_complaint,
        bookingDate: item.booking_date,
        callCenterNotes: item.call_center_notes || '',
        sapNumber: item.sap_number,
        assignedTechnician: item.assigned_technician,
        acType: item.ac_type,
        status: item.status,
        createdAt: item.created_at,
        createdBy: item.created_by || '',
        updatedAt: item.updated_at
      })) || [];
    } catch (error) {
      console.error('Error fetching work orders:', error);
      return [];
    }
  },

  // جلب جميع طلبات الصيانة (للإحصائيات في الكول سنتر)
  async getAllWorkOrders(): Promise<WorkOrder[]> {
    try {
      const { data, error } = await supabase
        .from('work_orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data?.map(item => ({
        id: item.id,
        customerName: item.customer_name,
        phone: item.phone,
        address: item.address,
        propertyNumber: item.property_number,
        customerComplaint: item.customer_complaint,
        bookingDate: item.booking_date,
        callCenterNotes: item.call_center_notes || '',
        sapNumber: item.sap_number,
        assignedTechnician: item.assigned_technician,
        acType: item.ac_type,
        status: item.status,
        createdAt: item.created_at,
        createdBy: item.created_by || '',
        updatedAt: item.updated_at
      })) || [];
    } catch (error) {
      console.error('Error fetching all work orders:', error);
      return [];
    }
  },

  // جلب طلبات الصيانة المخصصة لفني معين
  async getWorkOrdersByTechnician(technicianName: string): Promise<WorkOrder[]> {
    try {
      console.log('Fetching orders for technician:', technicianName);
      const { data, error } = await supabase
        .from('work_orders')
        .select('*')
        .eq('assigned_technician', technicianName)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching technician work orders:', error);
        throw error;
      }

      console.log('Found orders for technician:', data?.length || 0);

      return data?.map(item => ({
        id: item.id,
        customerName: item.customer_name,
        phone: item.phone,
        address: item.address,
        propertyNumber: item.property_number,
        customerComplaint: item.customer_complaint,
        bookingDate: item.booking_date,
        callCenterNotes: item.call_center_notes || '',
        sapNumber: item.sap_number,
        assignedTechnician: item.assigned_technician,
        acType: item.ac_type,
        status: item.status,
        createdAt: item.created_at,
        createdBy: item.created_by || '',
        updatedAt: item.updated_at
      })) || [];
    } catch (error) {
      console.error('Error fetching technician work orders:', error);
      return [];
    }
  },

  // جلب طلب صيانة محدد
  async getWorkOrder(id: string): Promise<WorkOrder | null> {
    try {
      const { data, error } = await supabase
        .from('work_orders')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) return null;

      return {
        id: data.id,
        customerName: data.customer_name,
        phone: data.phone,
        address: data.address,
        propertyNumber: data.property_number,
        customerComplaint: data.customer_complaint,
        bookingDate: data.booking_date,
        callCenterNotes: data.call_center_notes || '',
        sapNumber: data.sap_number,
        assignedTechnician: data.assigned_technician,
        acType: data.ac_type,
        status: data.status,
        createdAt: data.created_at,
        createdBy: data.created_by || '',
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error('Error fetching work order:', error);
      return null;
    }
  },

  // تحديث حالة طلب الصيانة
  async updateWorkOrderStatus(id: string, status: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('work_orders')
        .update({ status })
        .eq('id', id);

      return !error;
    } catch (error) {
      console.error('Error updating work order status:', error);
      return false;
    }
  },

  // تحديث الفني المخصص لطلب الصيانة
  async updateWorkOrderTechnician(id: string, technicianName: string): Promise<boolean> {
    try {
      console.log('Updating work order technician:', { id, technicianName });
      
      const { error } = await supabase
        .from('work_orders')
        .update({ 
          assigned_technician: technicianName,
          status: 'pending'
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating work order technician:', error);
        return false;
      }

      console.log('Successfully updated work order technician');
      return true;
    } catch (error) {
      console.error('Error updating work order technician:', error);
      return false;
    }
  },

  // إضافة تقرير عمل
  async addWorkReport(workReport: Omit<WorkReport, 'id' | 'submittedAt'>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('work_reports')
        .insert({
          order_id: workReport.orderId,
          ac_type: workReport.acType,
          equipment_model1: workReport.equipmentModel1,
          equipment_serial1: workReport.equipmentSerial1,
          equipment_model2: workReport.equipmentModel2,
          equipment_serial2: workReport.equipmentSerial2,
          warranty_status: workReport.warrantyStatus,
          work_description: workReport.workDescription,
          parts_used: workReport.partsUsed,
          recommendations: workReport.recommendations,
          customer_signature: workReport.customerSignature,
          photos: workReport.photos,
          videos: workReport.videos,
          technician_name: workReport.technicianName
        });

      return !error;
    } catch (error) {
      console.error('Error adding work report:', error);
      return false;
    }
  },

  // جلب تقرير العمل لطلب محدد
  async getWorkReport(orderId: string): Promise<WorkReport | null> {
    try {
      const { data, error } = await supabase
        .from('work_reports')
        .select('*')
        .eq('order_id', orderId)
        .single();

      if (error || !data) return null;

      return {
        id: data.id,
        orderId: data.order_id,
        acType: data.ac_type,
        equipmentModel1: data.equipment_model1,
        equipmentSerial1: data.equipment_serial1,
        equipmentModel2: data.equipment_model2,
        equipmentSerial2: data.equipment_serial2,
        warrantyStatus: data.warranty_status,
        workDescription: data.work_description,
        partsUsed: data.parts_used,
        recommendations: data.recommendations,
        customerSignature: data.customer_signature,
        photos: convertJsonToFileUploadResult(data.photos),
        videos: convertJsonToFileUploadResult(data.videos),
        submittedAt: data.submitted_at,
        technicianName: data.technician_name
      };
    } catch (error) {
      console.error('Error fetching work report:', error);
      return null;
    }
  },

  // جلب جميع تقارير العمل
  async getWorkReports(): Promise<WorkReport[]> {
    try {
      const { data, error } = await supabase
        .from('work_reports')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (error) throw error;

      return data?.map(item => ({
        id: item.id,
        orderId: item.order_id,
        acType: item.ac_type,
        equipmentModel1: item.equipment_model1,
        equipmentSerial1: item.equipment_serial1,
        equipmentModel2: item.equipment_model2,
        equipmentSerial2: item.equipment_serial2,
        warrantyStatus: item.warranty_status,
        workDescription: item.work_description,
        partsUsed: item.parts_used,
        recommendations: item.recommendations,
        customerSignature: item.customer_signature,
        photos: convertJsonToFileUploadResult(item.photos),
        videos: convertJsonToFileUploadResult(item.videos),
        submittedAt: item.submitted_at,
        technicianName: item.technician_name
      })) || [];
    } catch (error) {
      console.error('Error fetching work reports:', error);
      return [];
    }
  },

  // رفع ملف Excel إلى Supabase Storage
  async uploadExcelFile(file: File): Promise<{ fileName: string; fileUrl: string } | null> {
    try {
      const fileName = `excel-uploads/${Date.now()}-${file.name}`;
      
      const { data, error } = await supabase.storage
        .from('work-files')
        .upload(fileName, file);

      if (error) {
        console.error('Error uploading Excel file:', error);
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('work-files')
        .getPublicUrl(data.path);

      return {
        fileName: data.path,
        fileUrl: publicUrl
      };
    } catch (error) {
      console.error('Error uploading Excel file:', error);
      return null;
    }
  }
};
