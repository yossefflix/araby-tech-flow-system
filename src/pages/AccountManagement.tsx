
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

interface RegistrationRequest {
  id: string;
  name: string;
  role: string;
  password: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}

interface ApprovedUser {
  id: string;
  name: string;
  role: string;
  approvedAt: string;
}

const AccountManagement = () => {
  const { toast } = useToast();
  const [registrationRequests, setRegistrationRequests] = useState<RegistrationRequest[]>([]);
  const [approvedUsers, setApprovedUsers] = useState<ApprovedUser[]>([]);

  useEffect(() => {
    // Load data from localStorage
    const requests = JSON.parse(localStorage.getItem('registrationRequests') || '[]');
    const users = JSON.parse(localStorage.getItem('approvedUsers') || '[]');
    setRegistrationRequests(requests);
    setApprovedUsers(users);
  }, []);

  const handleApprove = (requestId: string) => {
    const updatedRequests = registrationRequests.map(req => 
      req.id === requestId ? { ...req, status: 'approved' as const } : req
    );
    
    const approvedRequest = registrationRequests.find(req => req.id === requestId);
    if (approvedRequest) {
      const newUser: ApprovedUser = {
        id: approvedRequest.id,
        name: approvedRequest.name,
        role: approvedRequest.role,
        approvedAt: new Date().toISOString()
      };
      
      const updatedUsers = [...approvedUsers, newUser];
      
      setRegistrationRequests(updatedRequests);
      setApprovedUsers(updatedUsers);
      
      localStorage.setItem('registrationRequests', JSON.stringify(updatedRequests));
      localStorage.setItem('approvedUsers', JSON.stringify(updatedUsers));
      
      toast({
        title: "تم قبول الطلب",
        description: `تم قبول طلب ${approvedRequest.name} بنجاح`,
      });
    }
  };

  const handleReject = (requestId: string) => {
    const updatedRequests = registrationRequests.map(req => 
      req.id === requestId ? { ...req, status: 'rejected' as const } : req
    );
    
    setRegistrationRequests(updatedRequests);
    localStorage.setItem('registrationRequests', JSON.stringify(updatedRequests));
    
    const rejectedRequest = registrationRequests.find(req => req.id === requestId);
    toast({
      title: "تم رفض الطلب",
      description: `تم رفض طلب ${rejectedRequest?.name} بنجاح`,
      variant: "destructive"
    });
  };

  const handleDeleteUser = (userId: string) => {
    const updatedUsers = approvedUsers.filter(user => user.id !== userId);
    setApprovedUsers(updatedUsers);
    localStorage.setItem('approvedUsers', JSON.stringify(updatedUsers));
    
    const deletedUser = approvedUsers.find(user => user.id === userId);
    toast({
      title: "تم حذف المستخدم",
      description: `تم حذف ${deletedUser?.name} من النظام`,
      variant: "destructive"
    });
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
    return role === 'technician' ? 'فني' : 'مدير';
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
                      <TableHead>الدور</TableHead>
                      <TableHead>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">{request.name}</TableCell>
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
                      <TableHead>الدور</TableHead>
                      <TableHead>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {approvedUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
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
                    <TableHead>الدور</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>تاريخ الطلب</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrationRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.name}</TableCell>
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
