
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { Plus, FileText, ArrowDown, Headphones, User, Clock, CheckCircle, Upload } from "lucide-react";
import { supabaseDB, WorkOrder } from "@/utils/supabaseDatabase";
import { authUtils, CurrentUser } from "@/utils/authUtils";
import ExcelUploader from "@/components/ExcelUploader";

const CallCenterDashboard = () => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUploader, setShowUploader] = useState(false);
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
        navigate('/call-center-login');
        return;
      }

      if (user.role !== 'call_center') {
        console.log('User is not call center, redirecting');
        navigate('/');
        return;
      }

      setCurrentUser(user);
      console.log('Current user:', user);

      // Get all work orders from Supabase
      const orders = await supabaseDB.getWorkOrders();
      console.log('Work orders from Supabase:', orders);
      setWorkOrders(orders);
    } catch (error) {
      console.error('Error loading user and orders:', error);
      navigate('/call-center-login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authUtils.signOut();
      navigate('/call-center-login');
    } catch (error) {
      console.error('Error during logout:', error);
      navigate('/call-center-login');
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
      case 'pending': return 'في الانتظار';
      case 'in-progress': return 'قيد التنفيذ';
      case 'completed': return 'مكتمل';
      default: return status;
    }
  };

  const handleUploadSuccess = () => {
    setShowUploader(false);
    loadUserAndOrders();
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
              <div className="bg-green-600 text-white p-2 rounded-lg">
                <Headphones className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-green-600">لوحة تحكم الكول سنتر</h1>
                <p className="text-gray-600">
                  {currentUser ? `${currentUser.name} - موظف كول سنتر` : 'موظف كول سنتر'}
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">إجمالي الطلبات</p>
                  <p className="text-2xl font-bold text-blue-600">{workOrders.length}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">في الانتظار</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {workOrders.filter(o => o.status === 'pending').length}
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
                  <p className="text-sm text-gray-600">قيد التنفيذ</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {workOrders.filter(o => o.status === 'in_progress').length}
                  </p>
                </div>
                <User className="h-8 w-8 text-blue-600" />
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

        {/* Excel Uploader Section */}
        {showUploader && (
          <div className="mb-8">
            <ExcelUploader onUploadSuccess={handleUploadSuccess} />
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <Link to="/call-center-work-order">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 space-x-reverse">
                  <div className="bg-green-600 text-white p-3 rounded-lg">
                    <Plus className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-green-600">إضافة طلب صيانة جديد</h3>
                    <p className="text-gray-600">إنشاء طلب صيانة جديد للعملاء</p>
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>

          <Card 
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setShowUploader(!showUploader)}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 space-x-reverse">
                <div className="bg-purple-600 text-white p-3 rounded-lg">
                  <Upload className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-purple-600">رفع ملف Excel</h3>
                  <p className="text-gray-600">استيراد طلبات الصيانة من ملف Excel</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <Link to="/call-center-orders-management">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 space-x-reverse">
                  <div className="bg-blue-600 text-white p-3 rounded-lg">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-blue-600">إدارة الطلبات</h3>
                    <p className="text-gray-600">متابعة وإدارة جميع طلبات الصيانة</p>
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <Link to="/work-reports">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 space-x-reverse">
                  <div className="bg-orange-600 text-white p-3 rounded-lg">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-orange-600">تقارير العمل المكتملة</h3>
                    <p className="text-gray-600">عرض تقارير الأعمال والملفات المرفقة</p>
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>
        </div>

        {/* Recent Work Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              طلبات الصيانة الحديثة
            </CardTitle>
            <CardDescription>
              آخر طلبات الصيانة المضافة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {workOrders.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>لا توجد طلبات صيانة بعد</p>
                  <div className="flex gap-4 justify-center mt-4">
                    <Link to="/call-center-work-order">
                      <Button className="bg-green-600 hover:bg-green-700">
                        <Plus className="h-4 w-4 ml-2" />
                        إضافة طلب جديد
                      </Button>
                    </Link>
                    <Button 
                      variant="outline" 
                      onClick={() => setShowUploader(true)}
                      className="border-purple-600 text-purple-600 hover:bg-purple-50"
                    >
                      <Upload className="h-4 w-4 ml-2" />
                      رفع ملف Excel
                    </Button>
                  </div>
                </div>
              ) : (
                workOrders.slice(0, 5).map((order) => (
                  <Card key={order.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-green-600">#{order.id.slice(0, 8)}</h4>
                          <p className="text-lg font-medium">{order.customerName}</p>
                        </div>
                        <Badge className={getStatusColor(order.status)}>
                          {getStatusText(order.status)}
                        </Badge>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2 text-sm">
                          {order.phone && <p><strong>الهاتف:</strong> {order.phone}</p>}
                          <p><strong>العنوان:</strong> {order.address}</p>
                          {order.assignedTechnician && <p><strong>الفني المكلف:</strong> {order.assignedTechnician}</p>}
                        </div>
                        <div className="space-y-2 text-sm">
                          {order.sapNumber && <p><strong>رقم SAP:</strong> {order.sapNumber}</p>}
                          <p><strong>تاريخ الإنشاء:</strong> {new Date(order.createdAt).toLocaleDateString('ar-EG')}</p>
                          {order.createdBy && <p><strong>أنشأ بواسطة:</strong> {order.createdBy}</p>}
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

export default CallCenterDashboard;
