
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Link } from "react-router-dom";
import { ArrowLeft, ClipboardList, Clock, CheckCircle, Phone, MapPin, Calendar, User } from "lucide-react";
import { supabaseDB, WorkOrder } from "@/utils/supabaseDatabase";
import { useToast } from "@/hooks/use-toast";

const AdminWorkOrders = () => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const orders = await supabaseDB.getAllWorkOrders();
      setWorkOrders(orders);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في تحميل الطلبات",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">معلق</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">قيد التنفيذ</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-100 text-green-800">مكتمل</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const pendingOrders = workOrders.filter(order => order.status !== 'completed');
  const completedOrders = workOrders.filter(order => order.status === 'completed');

  if (loading) {
    return (
      <div className="min-h-screen bg-elaraby-gray flex items-center justify-center">
        <div className="text-center">
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
              <Link to="/admin">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 ml-2" />
                  العودة
                </Button>
              </Link>
              <div className="bg-elaraby-blue text-white p-2 rounded-lg">
                <ClipboardList className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-elaraby-blue">إدارة طلبات الصيانة</h1>
                <p className="text-gray-600">عرض وإدارة جميع طلبات الصيانة</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">إجمالي الطلبات</p>
                  <p className="text-2xl font-bold text-elaraby-blue">{workOrders.length}</p>
                </div>
                <ClipboardList className="h-8 w-8 text-elaraby-blue" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">الطلبات المعلقة</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingOrders.length}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">الطلبات المكتملة</p>
                  <p className="text-2xl font-bold text-green-600">{completedOrders.length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Orders */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              الطلبات غير المكتملة ({pendingOrders.length})
            </CardTitle>
            <CardDescription>
              الطلبات التي لم تكتمل بعد
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pendingOrders.length === 0 ? (
              <p className="text-center text-gray-500 py-8">لا توجد طلبات معلقة</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>رقم الطلب</TableHead>
                      <TableHead>اسم العميل</TableHead>
                      <TableHead>العنوان</TableHead>
                      <TableHead>الهاتف</TableHead>
                      <TableHead>رقم العقار</TableHead>
                      <TableHead>الشكوى</TableHead>
                      <TableHead>الفني المخصص</TableHead>
                      <TableHead>تاريخ الحجز</TableHead>
                      <TableHead>ملاحظات الكول سنتر</TableHead>
                      <TableHead>رقم SAP</TableHead>
                      <TableHead>الحالة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">#{order.id.slice(0, 8)}</TableCell>
                        <TableCell className="font-medium">{order.customerName}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            {order.address}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Phone className="h-4 w-4 text-gray-500" />
                            {order.phone || '-'}
                          </div>
                        </TableCell>
                        <TableCell>{order.propertyNumber || '-'}</TableCell>
                        <TableCell className="max-w-xs truncate">{order.customerComplaint || '-'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4 text-gray-500" />
                            {order.assignedTechnician || 'غير محدد'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            {order.bookingDate 
                              ? new Date(order.bookingDate).toLocaleDateString('ar-EG')
                              : '-'
                            }
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{order.callCenterNotes || '-'}</TableCell>
                        <TableCell>{order.sapNumber || '-'}</TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Completed Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              الطلبات المكتملة ({completedOrders.length})
            </CardTitle>
            <CardDescription>
              الطلبات التي تم إنجازها
            </CardDescription>
          </CardHeader>
          <CardContent>
            {completedOrders.length === 0 ? (
              <p className="text-center text-gray-500 py-8">لا توجد طلبات مكتملة</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>رقم الطلب</TableHead>
                      <TableHead>اسم العميل</TableHead>
                      <TableHead>العنوان</TableHead>
                      <TableHead>الهاتف</TableHead>
                      <TableHead>رقم العقار</TableHead>
                      <TableHead>الشكوى</TableHead>
                      <TableHead>الفني المنفذ</TableHead>
                      <TableHead>تاريخ الحجز</TableHead>
                      <TableHead>ملاحظات الكول سنتر</TableHead>
                      <TableHead>رقم SAP</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>تاريخ الإكمال</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {completedOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">#{order.id.slice(0, 8)}</TableCell>
                        <TableCell className="font-medium">{order.customerName}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4 text-gray-500" />
                            {order.address}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Phone className="h-4 w-4 text-gray-500" />
                            {order.phone || '-'}
                          </div>
                        </TableCell>
                        <TableCell>{order.propertyNumber || '-'}</TableCell>
                        <TableCell className="max-w-xs truncate">{order.customerComplaint || '-'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4 text-gray-500" />
                            {order.assignedTechnician || 'غير محدد'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            {order.bookingDate 
                              ? new Date(order.bookingDate).toLocaleDateString('ar-EG')
                              : '-'
                            }
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{order.callCenterNotes || '-'}</TableCell>
                        <TableCell>{order.sapNumber || '-'}</TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-gray-500" />
                            {new Date(order.updatedAt).toLocaleDateString('ar-EG')}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminWorkOrders;
