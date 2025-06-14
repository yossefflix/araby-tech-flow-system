
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { Plus, ArrowDown, User, FileText } from "lucide-react";
import { supabaseDB } from "@/utils/supabaseDatabase";
import { useEffect } from "react";

const CallCenterWorkOrder = () => {
  const { toast } = useToast();
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    orderNumber: '',
    customerName: '',
    propertyNumber: '',
    address: '',
    customerComplaint: '',
    bookingDate: '',
    callCenterNotes: '',
    sapNumber: '',
    assignedTechnician: ''
  });

  useEffect(() => {
    loadTechnicians();
  }, []);

  // Get approved technicians from Supabase
  const loadTechnicians = async () => {
    console.log('Loading technicians from Supabase...');
    const approvedUsers = await supabaseDB.getApprovedUsers();
    const approvedTechnicians = approvedUsers.filter(user => 
      user.role === 'technician'
    );
    console.log('Approved technicians:', approvedTechnicians);
    setTechnicians(approvedTechnicians);
  };

  const generateOrderNumber = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const time = String(Date.now()).slice(-6);
    return `CAS${year}${month}${day}${time}`;
  };

  const handleGenerateOrderNumber = () => {
    const orderNumber = generateOrderNumber();
    setFormData({...formData, orderNumber});
  };

  const handleSubmit = () => {
    if (!formData.orderNumber || !formData.customerName || !formData.customerComplaint || !formData.assignedTechnician) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive"
      });
      return;
    }

    // Get current user
    const currentUserStr = localStorage.getItem('currentUser');
    const currentUser = currentUserStr ? JSON.parse(currentUserStr) : null;

    // Create work order
    const workOrder = {
      id: formData.orderNumber,
      ...formData,
      status: 'pending',
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.name || 'Unknown'
    };

    console.log('Creating work order:', workOrder);

    // Save to localStorage (in a real app, this would go to Supabase work_orders table)
    const existingOrders = JSON.parse(localStorage.getItem('workOrders') || '[]');
    existingOrders.push(workOrder);
    localStorage.setItem('workOrders', JSON.stringify(existingOrders));

    toast({
      title: "تم إنشاء الطلب بنجاح",
      description: `تم إنشاء طلب رقم: ${formData.orderNumber}`,
    });

    // Reset form
    setFormData({
      orderNumber: '',
      customerName: '',
      propertyNumber: '',
      address: '',
      customerComplaint: '',
      bookingDate: '',
      callCenterNotes: '',
      sapNumber: '',
      assignedTechnician: ''
    });
  };

  return (
    <div className="min-h-screen bg-elaraby-gray">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="bg-green-600 text-white p-2 rounded-lg">
                <Plus className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-elaraby-blue">إضافة طلب صيانة</h1>
                <p className="text-gray-600">إنشاء طلب صيانة جديد</p>
              </div>
            </div>
            <Link to="/call-center">
              <Button variant="outline">
                <ArrowDown className="h-4 w-4 ml-2" />
                العودة للكول سنتر
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                بيانات طلب الصيانة
              </CardTitle>
              <CardDescription>
                املأ جميع البيانات المطلوبة لإنشاء طلب صيانة جديد
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Order Number */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="orderNumber">رقم الطلب *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="orderNumber"
                      value={formData.orderNumber}
                      onChange={(e) => setFormData({...formData, orderNumber: e.target.value})}
                      placeholder="CAS202512250001"
                      className="text-right"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleGenerateOrderNumber}
                      className="whitespace-nowrap"
                    >
                      توليد تلقائي
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="sapNumber">رقم SAP</Label>
                  <Input
                    id="sapNumber"
                    value={formData.sapNumber}
                    onChange={(e) => setFormData({...formData, sapNumber: e.target.value})}
                    placeholder="أدخل رقم SAP"
                    className="text-right"
                  />
                </div>
              </div>

              {/* Customer Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerName">اسم العميل *</Label>
                  <Input
                    id="customerName"
                    value={formData.customerName}
                    onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                    placeholder="أدخل اسم العميل"
                    className="text-right"
                  />
                </div>
                <div>
                  <Label htmlFor="propertyNumber">رقم العقار</Label>
                  <Input
                    id="propertyNumber"
                    value={formData.propertyNumber}
                    onChange={(e) => setFormData({...formData, propertyNumber: e.target.value})}
                    placeholder="أدخل رقم العقار"
                    className="text-right"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <Label htmlFor="address">العنوان</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="أدخل العنوان بالتفصيل"
                  className="text-right"
                />
              </div>

              {/* Customer Complaint */}
              <div>
                <Label htmlFor="customerComplaint">شكوى العميل *</Label>
                <Textarea
                  id="customerComplaint"
                  value={formData.customerComplaint}
                  onChange={(e) => setFormData({...formData, customerComplaint: e.target.value})}
                  placeholder="اكتب تفاصيل شكوى العميل..."
                  rows={4}
                  className="text-right"
                />
              </div>

              {/* Booking Date */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bookingDate">تاريخ الحجز</Label>
                  <Input
                    id="bookingDate"
                    type="datetime-local"
                    value={formData.bookingDate}
                    onChange={(e) => setFormData({...formData, bookingDate: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="assignedTechnician">الفني المكلف *</Label>
                  <Select onValueChange={(value) => setFormData({...formData, assignedTechnician: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الفني المكلف" />
                    </SelectTrigger>
                    <SelectContent>
                      {technicians.length > 0 ? (
                        technicians.map((technician) => (
                          <SelectItem key={technician.id} value={technician.name}>
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              {technician.name} - {technician.phone}
                            </div>
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-technicians" disabled>
                          لا يوجد فنيون متاحون
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Call Center Notes */}
              <div>
                <Label htmlFor="callCenterNotes">ملاحظات الكول سنتر</Label>
                <Textarea
                  id="callCenterNotes"
                  value={formData.callCenterNotes}
                  onChange={(e) => setFormData({...formData, callCenterNotes: e.target.value})}
                  placeholder="أي ملاحظات إضافية من الكول سنتر..."
                  rows={3}
                  className="text-right"
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 ml-2" />
                  إنشاء الطلب
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setFormData({
                    orderNumber: '',
                    customerName: '',
                    propertyNumber: '',
                    address: '',
                    customerComplaint: '',
                    bookingDate: '',
                    callCenterNotes: '',
                    sapNumber: '',
                    assignedTechnician: ''
                  })}
                >
                  مسح الحقول
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CallCenterWorkOrder;
