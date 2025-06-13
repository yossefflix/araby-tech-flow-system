
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowDown, Plus, Search, User, ClipboardList, CheckCircle, Clock } from "lucide-react";
import { Link } from "react-router-dom";

interface WorkOrder {
  id: string;
  customerName: string;
  address: string;
  phone: string;
  deviceType: string;
  issueDescription: string;
  technician: string;
  status: 'pending' | 'assigned' | 'in-progress' | 'completed';
  createdAt: string;
}

const AdminDashboard = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<WorkOrder[]>([
    {
      id: 'CAS202506024421001',
      customerName: 'محمد قاسم',
      address: 'المدينة البريطانية، طريق برنهام هيلز',
      phone: '729337925',
      deviceType: 'تكييف خارج الضمان',
      issueDescription: 'تكييف لا يبرد',
      technician: 'أحمد محمود',
      status: 'completed',
      createdAt: '10/06/2025'
    }
  ]);

  const [newOrder, setNewOrder] = useState({
    customerName: '',
    address: '',
    phone: '',
    deviceType: '',
    issueDescription: '',
    technician: ''
  });

  const technicians = ['أحمد محمود', 'محمد علي', 'خالد حسن', 'عمر سعد'];

  const handleCreateOrder = () => {
    if (!newOrder.customerName || !newOrder.address || !newOrder.phone) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive"
      });
      return;
    }

    const order: WorkOrder = {
      id: `CAS${Date.now()}`,
      ...newOrder,
      status: 'assigned',
      createdAt: new Date().toLocaleDateString('ar-EG')
    };

    setOrders([order, ...orders]);
    setNewOrder({
      customerName: '',
      address: '',
      phone: '',
      deviceType: '',
      issueDescription: '',
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
                <User className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-elaraby-blue">لوحة تحكم المدير</h1>
                <p className="text-gray-600">إدارة طلبات الصيانة</p>
              </div>
            </div>
            <Link to="/">
              <Button variant="outline">العودة للرئيسية</Button>
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
                <User className="h-8 w-8 text-blue-600" />
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
                  <Label htmlFor="customerName">اسم العميل *</Label>
                  <Input
                    id="customerName"
                    value={newOrder.customerName}
                    onChange={(e) => setNewOrder({...newOrder, customerName: e.target.value})}
                    placeholder="أدخل اسم العميل"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">رقم الهاتف *</Label>
                  <Input
                    id="phone"
                    value={newOrder.phone}
                    onChange={(e) => setNewOrder({...newOrder, phone: e.target.value})}
                    placeholder="أدخل رقم الهاتف"
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
                <Label htmlFor="deviceType">نوع الجهاز</Label>
                <Select onValueChange={(value) => setNewOrder({...newOrder, deviceType: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر نوع الجهاز" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="تكييف داخل الضمان">تكييف داخل الضمان</SelectItem>
                    <SelectItem value="تكييف خارج الضمان">تكييف خارج الضمان</SelectItem>
                    <SelectItem value="ثلاجة">ثلاجة</SelectItem>
                    <SelectItem value="غسالة">غسالة</SelectItem>
                    <SelectItem value="أخرى">أخرى</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="issueDescription">وصف المشكلة</Label>
                <Textarea
                  id="issueDescription"
                  value={newOrder.issueDescription}
                  onChange={(e) => setNewOrder({...newOrder, issueDescription: e.target.value})}
                  placeholder="اكتب وصف المشكلة"
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
                        <h4 className="font-semibold text-elaraby-blue">#{order.id}</h4>
                        <p className="text-sm text-gray-600">{order.customerName}</p>
                      </div>
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusText(order.status)}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>📱 {order.phone}</p>
                      <p>📍 {order.address}</p>
                      <p>🔧 {order.deviceType}</p>
                      <p>👨‍🔧 {order.technician}</p>
                      <p>📅 {order.createdAt}</p>
                    </div>
                    
                    {order.issueDescription && (
                      <p className="text-sm bg-gray-100 p-2 rounded mt-2">
                        {order.issueDescription}
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

export default AdminDashboard;
