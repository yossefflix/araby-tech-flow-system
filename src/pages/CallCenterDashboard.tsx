
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { Phone, Search, CheckCircle, Upload, Eye, ArrowDown, Plus } from "lucide-react";

interface WorkOrder {
  id: string;
  customerName: string;
  address: string;
  propertyNumber: string;
  customerComplaint: string;
  bookingDate: string;
  assignedTechnician: string;
  status: string;
  createdAt: string;
  createdBy: string;
  sapNumber?: string;
  callCenterNotes?: string;
}

const CallCenterDashboard = () => {
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Get work orders from localStorage
    const workOrders = JSON.parse(localStorage.getItem('workOrders') || '[]');
    setOrders(workOrders);
  }, []);

  const filteredOrders = orders.filter(order =>
    order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'في انتظار التنفيذ';
      case 'in-progress': return 'قيد التنفيذ';
      case 'completed': return 'مكتمل';
      default: return status;
    }
  };

  const handleRefresh = () => {
    const workOrders = JSON.parse(localStorage.getItem('workOrders') || '[]');
    setOrders(workOrders);
  };

  return (
    <div className="min-h-screen bg-elaraby-gray">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="bg-green-600 text-white p-2 rounded-lg">
                <Phone className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-elaraby-blue">الكول سنتر</h1>
                <p className="text-gray-600">مراجعة ومتابعة الطلبات</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleRefresh} variant="outline">
                تحديث
              </Button>
              <Link to="/call-center-work-order">
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة طلب جديد
                </Button>
              </Link>
              <Link to="/">
                <Button variant="outline">
                  <ArrowDown className="h-4 w-4 ml-2" />
                  العودة للرئيسية
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">في انتظار التنفيذ</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {orders.filter(o => o.status === 'pending').length}
                  </p>
                </div>
                <Eye className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">قيد التنفيذ</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {orders.filter(o => o.status === 'in-progress').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">مكتملة</p>
                  <p className="text-2xl font-bold text-green-600">
                    {orders.filter(o => o.status === 'completed').length}
                  </p>
                </div>
                <Upload className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Orders List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  طلبات الصيانة
                </span>
                <div className="flex items-center gap-2">
                  <Input 
                    placeholder="بحث..." 
                    className="w-40" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Button size="sm" variant="outline">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {filteredOrders.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>لا توجد طلبات حالياً</p>
                  </div>
                ) : (
                  filteredOrders.map((order) => (
                    <div 
                      key={order.id} 
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-elaraby-blue">#{order.id}</h4>
                          <p className="text-sm text-gray-600">{order.customerName}</p>
                        </div>
                        <Badge className={getStatusColor(order.status)}>
                          {getStatusText(order.status)}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>👨‍🔧 {order.assignedTechnician}</p>
                        <p>📅 {new Date(order.createdAt).toLocaleDateString('ar-EG')}</p>
                        <p>📝 {order.customerComplaint.substring(0, 50)}...</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Order Details */}
          <Card>
            <CardHeader>
              <CardTitle>تفاصيل الطلب</CardTitle>
              <CardDescription>
                {selectedOrder ? `طلب رقم: #${selectedOrder.id}` : 'اختر طلباً لعرض التفاصيل'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedOrder ? (
                <div className="space-y-4">
                  {/* Customer Info */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">بيانات العميل</h4>
                    <div className="text-sm space-y-1">
                      <p><strong>الاسم:</strong> {selectedOrder.customerName}</p>
                      <p><strong>العنوان:</strong> {selectedOrder.address}</p>
                      {selectedOrder.propertyNumber && (
                        <p><strong>رقم العقار:</strong> {selectedOrder.propertyNumber}</p>
                      )}
                      {selectedOrder.sapNumber && (
                        <p><strong>رقم SAP:</strong> {selectedOrder.sapNumber}</p>
                      )}
                    </div>
                  </div>

                  {/* Work Details */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">تفاصيل العمل</h4>
                    <div className="text-sm space-y-2">
                      <p><strong>الفني المكلف:</strong> {selectedOrder.assignedTechnician}</p>
                      <p><strong>شكوى العميل:</strong></p>
                      <div className="bg-white p-2 rounded border">
                        {selectedOrder.customerComplaint}
                      </div>
                      {selectedOrder.bookingDate && (
                        <p><strong>تاريخ الحجز:</strong> {new Date(selectedOrder.bookingDate).toLocaleDateString('ar-EG')}</p>
                      )}
                      {selectedOrder.callCenterNotes && (
                        <>
                          <p><strong>ملاحظات الكول سنتر:</strong></p>
                          <div className="bg-white p-2 rounded border">
                            {selectedOrder.callCenterNotes}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">حالة الطلب</h4>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(selectedOrder.status)}>
                        {getStatusText(selectedOrder.status)}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        تم الإنشاء: {new Date(selectedOrder.createdAt).toLocaleDateString('ar-EG')}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>اختر طلباً من القائمة لعرض التفاصيل</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CallCenterDashboard;
