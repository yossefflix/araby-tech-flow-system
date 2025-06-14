import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { Users, CheckCircle, X, Trash2, ArrowDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { localDB, type User } from "@/utils/localDatabase";

const AccountManagement = () => {
  const { toast } = useToast();
  const [registrationRequests, setRegistrationRequests] = useState<User[]>([]);
  const [approvedUsers, setApprovedUsers] = useState<User[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const requests = await localDB.getRegistrationRequests();
    const approved = await localDB.getApprovedUsers();
    setRegistrationRequests(requests);
    setApprovedUsers(approved);
  };

  const handleApprove = async (requestId: string) => {
    const success = await localDB.updateUserStatus(requestId, 'approved');
    
    if (success) {
      const user = registrationRequests.find(req => req.id === requestId);
      await loadData(); // Refresh data
      
      toast({
        title: "تم قبول الطلب",
        description: `تم قبول طلب ${user?.name} بنجاح`,
      });
    } else {
      toast({
        title: "خطأ",
        description: "فشل في قبول الطلب",
        variant: "destructive"
      });
    }
  };

  const handleReject = async (requestId: string) => {
    const user = registrationRequests.find(req => req.id === requestId);
    const success = await localDB.updateUserStatus(requestId, 'rejected');
    
    if (success) {
      await loadData(); // Refresh data
      
      toast({
        title: "تم رفض الطلب",
        description: `تم رفض طلب ${user?.name} بنجاح`,
        variant: "destructive"
      });
    } else {
      toast({
        title: "خطأ",
        description: "فشل في رفض الطلب",
        variant: "destructive"
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    const user = approvedUsers.find(u => u.id === userId);
    const success = await localDB.deleteUser(userId);
    
    if (success) {
      await loadData(); // Refresh data
      
      toast({
        title: "تم حذف المستخدم",
        description: `تم حذف ${user?.name} من النظام`,
        variant: "destructive"
      });
    } else {
      toast({
        title: "خطأ",
        description: "فشل في حذف المستخدم",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'في الانتظار';
      case 'approved': return 'مقبول';
      case 'rejected': return 'مرفوض';
      default: return status;
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'technician': return 'فني';
      case 'admin': return 'مدير';
      case 'call_center': return 'كول سنتر';
      default: return role;
    }
  };

  const pendingRequests = registrationRequests.filter(req => req.status === 'pending');

  return (
    <div className="min-h-screen bg-elaraby-gray">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="bg-elaraby-blue text-white p-2 rounded-lg">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-elaraby-blue">إدارة الحسابات</h1>
                <p className="text-gray-600">قبول ورفض طلبات التسجيل</p>
              </div>
            </div>
            <Link to="/admin">
              <Button variant="outline">
                <ArrowDown className="h-4 w-4 ml-2" />
                العودة للوحة المدير
              </Button>
            </Link>
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
                  <p className="text-sm text-gray-600">طلبات في الانتظار</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingRequests.length}</p>
                </div>
                <Users className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">المستخدمين المقبولين</p>
                  <p className="text-2xl font-bold text-green-600">{approvedUsers.length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">إجمالي الطلبات</p>
                  <p className="text-2xl font-bold text-elaraby-blue">{registrationRequests.length}</p>
                </div>
                <Users className="h-8 w-8 text-elaraby-blue" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Pending Requests */}
          <Card>
            <CardHeader>
              <CardTitle>طلبات التسجيل المعلقة</CardTitle>
              <CardDescription>
                مراجعة وقبول أو رفض طلبات إنشاء الحسابات الجديدة
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pendingRequests.length === 0 ? (
                <p className="text-center text-gray-500 py-8">لا توجد طلبات معلقة حالياً</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الاسم</TableHead>
                      <TableHead>الهاتف</TableHead>
                      <TableHead>الدور</TableHead>
                      <TableHead>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">{request.name}</TableCell>
                        <TableCell>{request.phone}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{getRoleText(request.role)}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleApprove(request.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4" />
                              قبول
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleReject(request.id)}
                            >
                              <X className="h-4 w-4" />
                              رفض
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Approved Users */}
          <Card>
            <CardHeader>
              <CardTitle>المستخدمين المقبولين</CardTitle>
              <CardDescription>
                قائمة المستخدمين المقبولين في النظام
              </CardDescription>
            </CardHeader>
            <CardContent>
              {approvedUsers.length === 0 ? (
                <p className="text-center text-gray-500 py-8">لا يوجد مستخدمين مقبولين حالياً</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>الاسم</TableHead>
                      <TableHead>الهاتف</TableHead>
                      <TableHead>الدور</TableHead>
                      <TableHead>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {approvedUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.phone}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{getRoleText(user.role)}</Badge>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            حذف
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* All Requests History */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>سجل جميع الطلبات</CardTitle>
            <CardDescription>
              عرض جميع طلبات التسجيل مع حالاتها
            </CardDescription>
          </CardHeader>
          <CardContent>
            {registrationRequests.length === 0 ? (
              <p className="text-center text-gray-500 py-8">لا توجد طلبات حالياً</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الاسم</TableHead>
                    <TableHead>الهاتف</TableHead>
                    <TableHead>الدور</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>تاريخ الطلب</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrationRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.name}</TableCell>
                      <TableCell>{request.phone}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{getRoleText(request.role)}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(request.status)}>
                          {getStatusText(request.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(request.createdAt).toLocaleDateString('ar-EG')}
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

export default AccountManagement;
