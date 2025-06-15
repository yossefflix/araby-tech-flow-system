
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, ClipboardList, Clock, CheckCircle, User, Calendar } from "lucide-react";
import { supabaseDB, WorkOrder } from "@/utils/supabaseDatabase";
import { authUtils, CurrentUser } from "@/utils/authUtils";
import { useToast } from "@/hooks/use-toast";

const AdminWorkOrders = () => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadUserAndOrders();
  }, []);

  const loadUserAndOrders = async () => {
    try {
      const user = await authUtils.getCurrentUser();
      
      if (!user || user.role !== 'admin') {
        navigate('/admin');
        return;
      }

      setCurrentUser(user);

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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>اسم العميل</TableHead>
                    <TableHead>العنوان</TableHead>
                    <TableHead>الهاتف</TableHead>
                    <TableHead>الفني المخصص</TableHead>
                    <TableHead>تاريخ الحجز</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>تاريخ الإنشاء</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.customerName}</TableCell>
                      <TableCell>{order.address}</TableCell>
                      <TableCell>{order.phone || '-'}</TableCell>
                      <TableCell>{order.assignedTechnician || 'غير محدد'}</TableCell>
                      <TableCell>
                        {order.bookingDate 
                          ? new Date(order.bookingDate).toLocaleDateString('ar-EG')
                          : '-'
                        }
                      </TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>
                        {new Date(order.createdAt).toLocaleDateString('ar-EG')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>اسم العميل</TableHead>
                    <TableHead>العنوان</TableHead>
                    <TableHead>الهاتف</TableHead>
                    <TableHead>الفني المنفذ</TableHead>
                    <TableHead>تاريخ الحجز</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>تاريخ الإكمال</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {completedOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.customerName}</TableCell>
                      <TableCell>{order.address}</TableCell>
                      <TableCell>{order.phone || '-'}</TableCell>
                      <TableCell>{order.assignedTechnician || 'غير محدد'}</TableCell>
                      <TableCell>
                        {order.bookingDate 
                          ? new Date(order.bookingDate).toLocaleDateString('ar-EG')
                          : '-'
                        }
                      </TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>
                        {new Date(order.updatedAt).toLocaleDateString('ar-EG')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminWorkOrders;
