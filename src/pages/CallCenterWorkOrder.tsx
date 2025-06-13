
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowDown, Plus, Search, ClipboardList, CheckCircle, Clock, Calendar, Phone } from "lucide-react";
import { Link } from "react-router-dom";

interface WorkOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  propertyNumber: string;
  address: string;
  customerComplaint: string;
  bookingDate: string;
  callCenterNotes: string;
  sapNumber: string;
  technician: string;
  status: 'pending' | 'assigned' | 'in-progress' | 'completed';
  createdAt: string;
}

const CallCenterWorkOrder = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<WorkOrder[]>([
    {
      id: '1',
      orderNumber: 'CAS202506024421001',
      customerName: 'محمد قاسم',
      propertyNumber: '12345',
      address: 'المدينة البريطانية، طريق برنهام هيلز',
      customerComplaint: 'تكييف لا يبرد',
      bookingDate: '10/06/2025',
      callCenterNotes: 'العميل متاح من 9 صباحاً حتى 5 مساءً',
      sapNumber: 'SAP789123',
      technician: 'أحمد محمود',
      status: 'completed',
      createdAt: '10/06/2025'
    }
  ]);

  const [newOrder, setNewOrder] = useState({
    orderNumber: '',
    customerName: '',
    propertyNumber: '',
    address: '',
    customerComplaint: '',
    bookingDate: '',
    callCenterNotes: '',
    sapNumber: '',
    technician: ''
  });

  const technicians = ['أحمد محمود', 'محمد علي', 'خالد حسن', 'عمر سعد'];

  const handleCreateOrder = () => {
    if (!newOrder.orderNumber || !newOrder.customerName || !newOrder.address) {
      toast({
        title: "خطأ",
        description: "يرجى ملء الحقول المطلوبة (رقم الطلب، اسم العميل، العنوان)",
        variant: "destructive"
      });
      return;
    }

    const order: WorkOrder = {
      id: Date.now().toString(),
      ...newOrder,
      status: 'assigned',
      createdAt: new Date().toLocaleDateString('ar-EG')
    };

    setOrders([order, ...orders]);
    setNewOrder({
      orderNumber: '',
      customerName: '',
      propertyNumber: '',
      address: '',
      customerComplaint: '',
      bookingDate: '',
      callCenterNotes: '',
      sapNumber: '',
      technician: ''
    });

    toast({
      title: "تم إنشاء الطلب بنجاح",
      description: `تم توزيع الطلب على الفني ${newOrder.technician}`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'في الانتظار';
      case 'assigned': return 'تم التوزيع';
      case 'in-progress': return 'قيد التنفيذ';
      case 'completed': return 'مكتمل';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-elaraby-gray">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="bg-elaraby-blue text-white p-2 rounded-lg">
                <Phone className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-elaraby-blue">الكول سنتر</h1>
                <p className="text-gray-600">إنشاء طلبات الصيانة</p>
              </div>
            </div>
            <Link to="/">
              <Button variant="outline">
                <ArrowDown className="h-4 w-4 ml-2" />
                العودة للرئيسية
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">إجمالي الطلبات</p>
                  <p className="text-2xl font-bold text-elaraby-blue">{orders.length}</p>
                </div>
                <ClipboardList className="h-8 w-8 text-elaraby-blue" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">قيد التنفيذ</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {orders.filter(o => o.status === 'in-progress').length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
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
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">الفنيين النشطين</p>
                  <p className="text-2xl font-bold text-blue-600">{technicians.length}</p>
                </div>
                <Phone className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Create New Order */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                إنشاء طلب صيانة جديد
              </CardTitle>
              <CardDescription>
                أضف طلب صيانة جديد ووزعه على أحد الفنيين
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="orderNumber">رقم الطلب *</Label>
                  <Input
                    id="orderNumber"
                    value={newOrder.orderNumber}
                    onChange={(e) => setNewOrder({...newOrder, orderNumber: e.target.value})}
                    placeholder="أدخل رقم الطلب"
                  />
                </div>
                <div>
                  <Label htmlFor="customerName">اسم العميل *</Label>
                  <Input
                    id="customerName"
                    value={newOrder.customerName}
                    onChange={(e) => setNewOrder({...newOrder, customerName: e.target.value})}
                    placeholder="أدخل اسم العميل"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="propertyNumber">رقم العقار</Label>
                  <Input
                    id="propertyNumber"
                    value={newOrder.propertyNumber}
                    onChange={(e) => setNewOrder({...newOrder, propertyNumber: e.target.value})}
                    placeholder="أدخل رقم العقار"
                  />
                </div>
                <div>
                  <Label htmlFor="sapNumber">رقم SAP</Label>
                  <Input
                    id="sapNumber"
                    value={newOrder.sapNumber}
                    onChange={(e) => setNewOrder({...newOrder, sapNumber: e.target.value})}
                    placeholder="أدخل رقم SAP"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="address">العنوان *</Label>
                <Input
                  id="address"
                  value={newOrder.address}
                  onChange={(e) => setNewOrder({...newOrder, address: e.target.value})}
                  placeholder="أدخل عنوان العميل"
                />
              </div>
              
              <div>
                <Label htmlFor="customerComplaint">شكوى العميل</Label>
                <Textarea
                  id="customerComplaint"
                  value={newOrder.customerComplaint}
                  onChange={(e) => setNewOrder({...newOrder, customerComplaint: e.target.value})}
                  placeholder="اكتب شكوى العميل"
                />
              </div>

              <div>
                <Label htmlFor="bookingDate">تاريخ الحجز</Label>
                <Input
                  id="bookingDate"
                  type="date"
                  value={newOrder.bookingDate}
                  onChange={(e) => setNewOrder({...newOrder, bookingDate: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="callCenterNotes">ملاحظات الكول سنتر</Label>
                <Textarea
                  id="callCenterNotes"
                  value={newOrder.callCenterNotes}
                  onChange={(e) => setNewOrder({...newOrder, callCenterNotes: e.target.value})}
                  placeholder="اكتب ملاحظات الكول سنتر"
                />
              </div>
              
              <div>
                <Label htmlFor="technician">الفني المختص *</Label>
                <Select onValueChange={(value) => setNewOrder({...newOrder, technician: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الفني" />
                  </SelectTrigger>
                  <SelectContent>
                    {technicians.map((tech) => (
                      <SelectItem key={tech} value={tech}>{tech}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button onClick={handleCreateOrder} className="w-full">
                إنشاء وتوزيع الطلب
              </Button>
            </CardContent>
          </Card>

          {/* Orders List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <ClipboardList className="h-5 w-5" />
                  طلبات الصيانة
                </span>
                <div className="flex items-center gap-2">
                  <Input placeholder="بحث..." className="w-40" />
                  <Button size="sm" variant="outline">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {orders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-elaraby-blue">#{order.orderNumber}</h4>
                        <p className="text-sm text-gray-600">{order.customerName}</p>
                      </div>
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusText(order.status)}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>🏠 رقم العقار: {order.propertyNumber}</p>
                      <p>📍 {order.address}</p>
                      <p>📝 الشكوى: {order.customerComplaint}</p>
                      <p>📅 تاريخ الحجز: {order.bookingDate}</p>
                      <p>💻 SAP: {order.sapNumber}</p>
                      <p>👨‍🔧 {order.technician}</p>
                    </div>
                    
                    {order.callCenterNotes && (
                      <p className="text-sm bg-blue-50 p-2 rounded mt-2">
                        <strong>ملاحظات الكول سنتر:</strong> {order.callCenterNotes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CallCenterWorkOrder;
