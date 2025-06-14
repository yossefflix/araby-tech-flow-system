
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { ClipboardList, User, CheckCircle, Clock, ArrowDown } from "lucide-react";
import { supabaseDB, WorkOrder } from "@/utils/supabaseDatabase";
import { authUtils, CurrentUser } from "@/utils/authUtils";

const TechnicianDashboard = () => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadUserAndOrders();
  }, []);

  const loadUserAndOrders = async () => {
    try {
      // Get current user from Supabase Auth
      const user = await authUtils.getCurrentUser();
      
      if (!user) {
        console.log('No authenticated user found, redirecting to login');
        navigate('/technician-login');
        return;
      }

      setCurrentUser(user);
      console.log('Current user:', user);

      // Get work orders assigned to this technician from Supabase
      const orders = await supabaseDB.getWorkOrdersByTechnician(user.name);
      console.log('Technician orders from Supabase:', orders);
      setWorkOrders(orders);
    } catch (error) {
      console.error('Error loading user and orders:', error);
      navigate('/technician-login');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'مُخصص';
      case 'in-progress': return 'قيد التنفيذ';
      case 'completed': return 'مكتمل';
      default: return status;
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const success = await supabaseDB.updateWorkOrderStatus(orderId, newStatus);
      if (success) {
        // Reload orders after update
        await loadUserAndOrders();
      } else {
        console.error('Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await authUtils.signOut();
      navigate('/technician-login');
    } catch (error) {
      console.error('Error during logout:', error);
      navigate('/technician-login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-elaraby-gray flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">جاري تحميل البيانات...</p>
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
              <div className="bg-elaraby-lightblue text-white p-2 rounded-lg">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-elaraby-blue">لوحة تحكم الفني</h1>
                <p className="text-gray-600">
                  {currentUser ? `${currentUser.name} - فني صيانة` : 'فني صيانة'}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleLogout}>
                تسجيل الخروج
              </Button>
              <Link to="/">
                <Button variant="outline">
                  <ArrowDown className="h-4 w-4 ml-2" />
                  الرئيسية
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
                  <p className="text-sm text-gray-600">المهام المخصصة</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {workOrders.filter(o => o.status === 'pending').length}
                  </p>
                </div>
                <ClipboardList className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">قيد التنفيذ</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {workOrders.filter(o => o.status === 'in-progress').length}
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
                    {workOrders.filter(o => o.status === 'completed').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Work Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              مهامي
            </CardTitle>
            <CardDescription>
              قائمة بجميع المهام المخصصة لك
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {workOrders.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>لا توجد مهام مخصصة لك حالياً</p>
                </div>
              ) : (
                workOrders.map((order) => (
                  <Card key={order.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-elaraby-blue">#{order.id.slice(0, 8)}</h4>
                          <p className="text-lg font-medium">{order.customerName}</p>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={getStatusColor(order.status)}>
                            {getStatusText(order.status)}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2 text-sm">
                          {order.phone && <p><strong>الهاتف:</strong> {order.phone}</p>}
                          <p><strong>العنوان:</strong> {order.address}</p>
                          {order.propertyNumber && <p><strong>رقم العقار:</strong> {order.propertyNumber}</p>}
                        </div>
                        <div className="space-y-2 text-sm">
                          {order.sapNumber && <p><strong>رقم SAP:</strong> {order.sapNumber}</p>}
                          {order.bookingDate && <p><strong>تاريخ الحجز:</strong> {new Date(order.bookingDate).toLocaleDateString('ar-EG')}</p>}
                          <p><strong>تاريخ الإنشاء:</strong> {new Date(order.createdAt).toLocaleDateString('ar-EG')}</p>
                        </div>
                      </div>
                      
                      {order.customerComplaint && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 mb-1">شكوى العميل:</p>
                          <p className="text-sm bg-gray-100 p-3 rounded">
                            {order.customerComplaint}
                          </p>
                        </div>
                      )}
                      
                      <div className="flex gap-2">
                        <Link to={`/work-order/${order.id}`}>
                          <Button size="sm" className="bg-elaraby-blue hover:bg-elaraby-blue/90">
                            فتح نموذج العمل
                          </Button>
                        </Link>
                        {order.status === 'pending' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => updateOrderStatus(order.id, 'in-progress')}
                          >
                            بدء العمل
                          </Button>
                        )}
                        {order.status === 'in-progress' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => updateOrderStatus(order.id, 'completed')}
                          >
                            إكمال المهمة
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TechnicianDashboard;
