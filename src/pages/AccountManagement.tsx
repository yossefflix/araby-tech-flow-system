import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { Users, CheckCircle, X, Trash2, ArrowDown, Ban } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";

interface User {
  id: string;
  name: string;
  phone: string;
  role: 'admin' | 'technician' | 'call_center';
  status: 'pending' | 'approved' | 'rejected';
  password: string;
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  approvedAt?: string;
}

const AccountManagement = () => {
  const { toast } = useToast();
  const [registrationRequests, setRegistrationRequests] = useState<User[]>([]);
  const [approvedUsers, setApprovedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    console.log('Loading data from Supabase...');
    setLoading(true);
    
    try {
      // Load registration requests
      const { data: requests, error: requestsError } = await supabase
        .from('registration_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (requestsError) {
        console.error('Error loading registration requests:', requestsError);
      } else {
        const formattedRequests = requests?.map(item => ({
          id: item.id,
          name: item.name,
          phone: item.phone,
          role: item.role as 'technician' | 'call_center',
          status: item.status as 'pending' | 'approved' | 'rejected',
          password: item.password,
          createdAt: item.created_at,
          reviewedAt: item.reviewed_at,
          reviewedBy: item.reviewed_by
        })) || [];
        setRegistrationRequests(formattedRequests);
        console.log('Registration requests loaded:', formattedRequests);
      }

      // Load approved users
      const { data: approved, error: approvedError } = await supabase
        .from('approved_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (approvedError) {
        console.error('Error loading approved users:', approvedError);
      } else {
        const formattedApproved = approved?.map(item => ({
          id: item.id,
          name: item.name,
          phone: item.phone,
          role: item.role as 'admin' | 'technician' | 'call_center',
          status: 'approved' as const,
          password: item.password,
          createdAt: item.created_at,
          approvedAt: item.approved_at
        })) || [];
        setApprovedUsers(formattedApproved);
        console.log('Approved users loaded:', formattedApproved);
      }
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

  const handleApprove = async (requestId: string) => {
    try {
      const user = registrationRequests.find(req => req.id === requestId);
      if (!user) return;

      console.log('Approving user:', user);

      // Add user to approved_users table
      const { error: insertError } = await supabase
        .from('approved_users')
        .insert([{
          name: user.name,
          phone: user.phone,
          password: user.password,
          role: user.role
        }]);

      if (insertError) {
        console.error('Error inserting approved user:', insertError);
        toast({
          title: "خطأ",
          description: "فشل في قبول الطلب",
          variant: "destructive"
        });
        return;
      }

      // Update request status
      const { error: updateError } = await supabase
        .from('registration_requests')
        .update({ 
          status: 'approved',
          reviewed_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (updateError) {
        console.error('Error updating request status:', updateError);
        toast({
          title: "خطأ",
          description: "فشل في تحديث حالة الطلب",
          variant: "destructive"
        });
        return;
      }

      await loadData(); // Refresh data
      
      toast({
        title: "تم قبول الطلب",
        description: `تم قبول طلب ${user.name} بنجاح`,
      });
    } catch (error) {
      console.error('Error approving user:', error);
      toast({
        title: "خطأ",
        description: "فشل في قبول الطلب",
        variant: "destructive"
      });
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      const user = registrationRequests.find(req => req.id === requestId);
      
      console.log('Rejecting user request:', user);

      const { error } = await supabase
        .from('registration_requests')
        .update({ 
          status: 'rejected',
          reviewed_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) {
        console.error('Error rejecting request:', error);
        toast({
          title: "خطأ",
          description: "فشل في رفض الطلب",
          variant: "destructive"
        });
        return;
      }

      await loadData(); // Refresh data
      
      toast({
        title: "تم رفض الطلب",
        description: `تم رفض طلب ${user?.name} بنجاح`,
        variant: "destructive"
      });
    } catch (error) {
      console.error('Error rejecting user:', error);
      toast({
        title: "خطأ",
        description: "فشل في رفض الطلب",
        variant: "destructive"
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const user = approvedUsers.find(u => u.id === userId);
      if (!user) {
        console.error('User not found with ID:', userId);
        toast({
          title: "خطأ",
          description: "المستخدم غير موجود",
          variant: "destructive"
        });
        return;
      }

      console.log('Deleting user:', user);
      setLoading(true);

      // حذف المستخدم من قاعدة البيانات
      const { error, count } = await supabase
        .from('approved_users')
        .delete({ count: 'exact' })
        .eq('id', userId);

      if (error) {
        console.error('Error deleting user from database:', error);
        toast({
          title: "خطأ",
          description: `فشل في حذف المستخدم: ${error.message}`,
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      if (count === 0) {
        console.warn('No user was deleted - user might not exist');
        toast({
          title: "خطأ",
          description: "المستخدم غير موجود أو تم حذفه مسبقاً",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      console.log('User deleted successfully from database. Rows affected:', count);

      // تحديث البيانات المحلية فوراً
      setApprovedUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
      
      toast({
        title: "تم حذف المستخدم",
        description: `تم حذف ${user.name} من النظام بنجاح`,
        variant: "destructive"
      });

      setLoading(false);
      
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "خطأ",
        description: "فشل في حذف المستخدم",
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  const handleBlockUser = async (userId: string) => {
    try {
      const user = approvedUsers.find(u => u.id === userId);
      if (!user) return;

      console.log('Blocking user:', user);

      // تغيير الدور إلى "blocked" بدلاً من الحذف
      const { error } = await supabase
        .from('approved_users')
        .update({ role: 'blocked' })
        .eq('id', userId);

      if (error) {
        console.error('Error blocking user:', error);
        toast({
          title: "خطأ",
          description: `فشل في حظر المستخدم: ${error.message}`,
          variant: "destructive"
        });
        return;
      }

      await loadData(); // إعادة تحميل البيانات
      
      toast({
        title: "تم حظر المستخدم",
        description: `تم حظر ${user.name} ولن يتمكن من الدخول للنظام`,
        variant: "destructive"
      });
    } catch (error) {
      console.error('Error blocking user:', error);
      toast({
        title: "خطأ",
        description: "فشل في حظر المستخدم",
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
  const activeUsers = approvedUsers.filter(user => user.role !== 'blocked');
  const blockedUsers = approvedUsers.filter(user => user.role === 'blocked');

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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
                  <p className="text-sm text-gray-600">المستخدمين النشطين</p>
                  <p className="text-2xl font-bold text-green-600">{activeUsers.length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">المستخدمين المحظورين</p>
                  <p className="text-2xl font-bold text-red-600">{blockedUsers.length}</p>
                </div>
                <Ban className="h-8 w-8 text-red-600" />
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
              {loading ? (
                <p className="text-center text-gray-500 py-8">جاري تحميل البيانات...</p>
              ) : pendingRequests.length === 0 ? (
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

          {/* Active Users */}
          <Card>
            <CardHeader>
              <CardTitle>المستخدمين النشطين</CardTitle>
              <CardDescription>
                قائمة المستخدمين النشطين في النظام
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-center text-gray-500 py-8">جاري تحميل البيانات...</p>
              ) : activeUsers.length === 0 ? (
                <p className="text-center text-gray-500 py-8">لا يوجد مستخدمين نشطين حالياً</p>
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
                    {activeUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.phone}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{getRoleText(user.role)}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-orange-500 text-orange-600 hover:bg-orange-50"
                                >
                                  <Ban className="h-4 w-4" />
                                  حظر
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>حظر المستخدم</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    هل أنت متأكد من حظر {user.name}؟ سيتم منعه من الدخول للنظام ولكن سيبقى في قاعدة البيانات.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleBlockUser(user.id)}>
                                    حظر
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  حذف نهائي
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>حذف المستخدم نهائياً</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    هل أنت متأكد من حذف {user.name} نهائياً؟ هذا الإجراء لا يمكن التراجع عنه وسيتم حذف جميع بيانات المستخدم.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>
                                    حذف نهائي
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Blocked Users */}
        {blockedUsers.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>المستخدمين المحظورين</CardTitle>
              <CardDescription>
                قائمة المستخدمين المحظورين من النظام
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الاسم</TableHead>
                    <TableHead>الهاتف</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blockedUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.phone}</TableCell>
                      <TableCell>
                        <Badge variant="destructive">محظور</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              const { error } = await supabase
                                .from('approved_users')
                                .update({ role: 'technician' })
                                .eq('id', user.id);
                              
                              if (!error) {
                                await loadData();
                                toast({
                                  title: "تم إلغاء الحظر",
                                  description: `تم إلغاء حظر ${user.name}`
                                });
                              }
                            }}
                          >
                            <CheckCircle className="h-4 w-4" />
                            إلغاء الحظر
                          </Button>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                                حذف نهائي
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>حذف المستخدم نهائياً</AlertDialogTitle>
                                <AlertDialogDescription>
                                  هل أنت متأكد من حذف {user.name} نهائياً؟ هذا الإجراء لا يمكن التراجع عنه.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>إلغاء</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteUser(user.id)}>
                                  حذف نهائي
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* All Requests History */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>سجل جميع الطلبات</CardTitle>
            <CardDescription>
              عرض جميع طلبات التسجيل مع حالاتها
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-gray-500 py-8">جاري تحميل البيانات...</p>
            ) : registrationRequests.length === 0 ? (
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
