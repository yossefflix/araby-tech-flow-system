import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { ArrowDown, User, FileText, RefreshCw, Settings, ChevronDown, ChevronUp, Calendar, Phone, MapPin, Hash } from "lucide-react";
import { supabaseDB, WorkOrder } from "@/utils/supabaseDatabase";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const CallCenterOrdersManagement = () => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      console.log('Loading data from Supabase...');
      const [ordersData, technicianData] = await Promise.all([
        supabaseDB.getWorkOrders(), // This now excludes completed orders
        supabaseDB.getApprovedUsers()
      ]);

      console.log('Orders loaded:', ordersData);
      console.log('Technicians loaded:', technicianData);
      
      setOrders(ordersData);
      setTechnicians(technicianData.filter(user => user.role === 'technician'));
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل البيانات",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAssignTechnician = async (orderId: string, technicianName: string) => {
    setUpdating(orderId);
    try {
      const success = await supabaseDB.updateWorkOrderTechnician(orderId, technicianName);

      if (success) {
        setOrders(orders.map(order => 
          order.id === orderId 
            ? { ...order, assignedTechnician: technicianName }
            : order
        ));

        toast({
          title: "تم تعيين الفني",
          description: `تم تعيين ${technicianName} للطلب بنجاح`,
        });
      } else {
        toast({
          title: "خطأ",
          description: "فشل في تعيين الفني",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error assigning technician:', error);
      toast({
        title: "خطأ",
        description: "فشل في تعيين الفني",
        variant: "destructive"
      });
    } finally {
      setUpdating(null);
    }
  };

  const toggleOrderExpansion = (orderId: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'pending': { label: 'في الانتظار', variant: 'secondary' as const },
      'in_progress': { label: 'قيد التنفيذ', variant: 'default' as const },
      'completed': { label: 'مكتمل', variant: 'default' as const }
    };

    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, variant: 'secondary' as const };
    
    return (
      <Badge variant={statusInfo.variant} className={
        status === 'completed' ? 'bg-green-100 text-green-800' :
        status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
        'bg-gray-100 text-gray-800'
      }>
        {statusInfo.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-elaraby-gray flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-lg text-gray-600">جاري تحميل الطلبات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-elaraby-gray">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="bg-blue-600 text-white p-2 rounded-lg">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-blue-600">إدارة الطلبات</h1>
                <p className="text-gray-600">تعيين الفنيين ومتابعة الطلبات (غير المكتملة)</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link to="/google-sheets-sync">
                <Button variant="outline">
                  <Settings className="h-4 w-4 ml-2" />
                  مزامنة Google Sheets
                </Button>
              </Link>
              <Button onClick={loadData} variant="outline">
                <RefreshCw className="h-4 w-4 ml-2" />
                تحديث
              </Button>
              <Link to="/call-center">
                <Button variant="outline">
                  <ArrowDown className="h-4 w-4 ml-2" />
                  العودة للكول سنتر
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {/* Statistics */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{orders.length}</div>
                <div className="text-sm text-gray-600">الطلبات غير المكتملة</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {orders.filter(o => o.status === 'pending').length}
                </div>
                <div className="text-sm text-gray-600">في الانتظار</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {orders.filter(o => o.status === 'in_progress').length}
                </div>
                <div className="text-sm text-gray-600">قيد التنفيذ</div>
              </CardContent>
            </Card>
          </div>

          {/* Orders List */}
          <Card>
            <CardHeader>
              <CardTitle>قائمة الطلبات غير المكتملة ({orders.length})</CardTitle>
              <CardDescription>
                جميع طلبات الصيانة غير المكتملة مع إمكانية تعيين الفنيين وعرض التفاصيل
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orders.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">لا توجد طلبات غير مكتملة حالياً</p>
                    <p className="text-sm text-gray-500">جميع الطلبات تم إكمالها أو لا توجد طلبات بعد</p>
                  </div>
                ) : (
                  orders.map((order) => (
                    <Collapsible key={order.id}>
                      <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-4 mb-2">
                                <h3 className="font-medium text-lg">{order.customerName}</h3>
                                {getStatusBadge(order.status)}
                                <CollapsibleTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => toggleOrderExpansion(order.id)}
                                  >
                                    {expandedOrders.has(order.id) ? (
                                      <ChevronUp className="h-4 w-4" />
                                    ) : (
                                      <ChevronDown className="h-4 w-4" />
                                    )}
                                    عرض التفاصيل
                                  </Button>
                                </CollapsibleTrigger>
                              </div>
                              
                              <div className="grid md:grid-cols-2 gap-2 text-sm text-gray-600">
                                <div className="flex items-center gap-2">
                                  <Phone className="h-4 w-4" />
                                  {order.phone || 'غير محدد'}
                                </div>
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4" />
                                  {order.address}
                                </div>
                              </div>

                              <CollapsibleContent className="mt-4">
                                <div className="grid md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                                  {order.propertyNumber && (
                                    <div className="flex items-center gap-2 text-sm">
                                      <Hash className="h-4 w-4 text-blue-600" />
                                      <span className="font-medium">رقم العقار:</span>
                                      <span>{order.propertyNumber}</span>
                                    </div>
                                  )}
                                  {order.sapNumber && (
                                    <div className="flex items-center gap-2 text-sm">
                                      <FileText className="h-4 w-4 text-green-600" />
                                      <span className="font-medium">رقم SAP:</span>
                                      <span>{order.sapNumber}</span>
                                    </div>
                                  )}
                                  {order.acType && (
                                    <div className="flex items-center gap-2 text-sm">
                                      <Settings className="h-4 w-4 text-purple-600" />
                                      <span className="font-medium">نوع التكييف:</span>
                                      <span>{order.acType}</span>
                                    </div>
                                  )}
                                  {order.bookingDate && (
                                    <div className="flex items-center gap-2 text-sm">
                                      <Calendar className="h-4 w-4 text-orange-600" />
                                      <span className="font-medium">تاريخ الحجز:</span>
                                      <span>{new Date(order.bookingDate).toLocaleDateString('ar-EG')}</span>
                                    </div>
                                  )}
                                  {order.customerComplaint && (
                                    <div className="col-span-2 text-sm">
                                      <span className="font-medium">شكوى العميل:</span>
                                      <p className="mt-1 text-gray-700">{order.customerComplaint}</p>
                                    </div>
                                  )}
                                  {order.callCenterNotes && (
                                    <div className="col-span-2 text-sm">
                                      <span className="font-medium">ملاحظات الكول سنتر:</span>
                                      <p className="mt-1 text-gray-700">{order.callCenterNotes}</p>
                                    </div>
                                  )}
                                  {order.createdBy && (
                                    <div className="text-sm text-gray-500">
                                      <span className="font-medium">تم الإنشاء بواسطة:</span>
                                      <span className="mr-2">{order.createdBy}</span>
                                    </div>
                                  )}
                                  <div className="text-sm text-gray-500">
                                    <span className="font-medium">تاريخ الإنشاء:</span>
                                    <span className="mr-2">{new Date(order.createdAt).toLocaleString('ar-EG')}</span>
                                  </div>
                                </div>
                              </CollapsibleContent>
                            </div>

                            <div className="flex items-center gap-4">
                              {order.assignedTechnician ? (
                                <div className="text-center">
                                  <div className="flex items-center gap-2 text-green-600">
                                    <User className="h-4 w-4" />
                                    <span className="font-medium">{order.assignedTechnician}</span>
                                  </div>
                                  <div className="text-xs text-gray-500">فني مُعين</div>
                                </div>
                              ) : (
                                <div className="min-w-[200px]">
                                  <Select
                                    onValueChange={(value) => handleAssignTechnician(order.id, value)}
                                    disabled={updating === order.id}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="اختر الفني" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {technicians.map((technician) => (
                                        <SelectItem key={technician.id} value={technician.name}>
                                          <div className="flex items-center gap-2">
                                            <User className="h-4 w-4" />
                                            {technician.name} - {technician.phone}
                                          </div>
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Collapsible>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CallCenterOrdersManagement;
