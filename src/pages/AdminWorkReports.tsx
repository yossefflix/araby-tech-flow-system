
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, User, Calendar, Eye } from "lucide-react";
import { supabaseDB, WorkReport, WorkOrder } from "@/utils/supabaseDatabase";
import { authUtils, CurrentUser } from "@/utils/authUtils";
import { useToast } from "@/hooks/use-toast";

const AdminWorkReports = () => {
  const [workReports, setWorkReports] = useState<(WorkReport & { orderDetails?: WorkOrder })[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadUserAndReports();
  }, []);

  const loadUserAndReports = async () => {
    try {
      const user = await authUtils.getCurrentUser();
      
      if (!user || user.role !== 'admin') {
        navigate('/admin');
        return;
      }

      setCurrentUser(user);

      const reports = await supabaseDB.getWorkReports();
      
      const reportsWithDetails = await Promise.all(
        reports.map(async (report) => {
          const orderDetails = await supabaseDB.getWorkOrder(report.orderId);
          return { ...report, orderDetails };
        })
      );

      setWorkReports(reportsWithDetails);
    } catch (error) {
      console.error('Error loading reports:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في تحميل التقارير",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-elaraby-gray flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">جاري تحميل التقارير...</p>
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
              <div className="bg-green-600 text-white p-2 rounded-lg">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-green-600">تقارير العمل المكتملة</h1>
                <p className="text-gray-600">عرض جميع تقارير الأعمال المرفوعة من الفنيين</p>
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
                  <p className="text-sm text-gray-600">إجمالي التقارير</p>
                  <p className="text-2xl font-bold text-green-600">{workReports.length}</p>
                </div>
                <FileText className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">التقارير مع الصور</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {workReports.filter(r => r.photos && r.photos.length > 0).length}
                  </p>
                </div>
                <Eye className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">التقارير مع الفيديوهات</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {workReports.filter(r => r.videos && r.videos.length > 0).length}
                  </p>
                </div>
                <Eye className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reports Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-600" />
              تقارير العمل المكتملة
            </CardTitle>
            <CardDescription>
              جميع التقارير المرفوعة من الفنيين
            </CardDescription>
          </CardHeader>
          <CardContent>
            {workReports.length === 0 ? (
              <p className="text-center text-gray-500 py-8">لا توجد تقارير عمل بعد</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>رقم التقرير</TableHead>
                    <TableHead>اسم العميل</TableHead>
                    <TableHead>العنوان</TableHead>
                    <TableHead>الفني المنفذ</TableHead>
                    <TableHead>وصف العمل</TableHead>
                    <TableHead>الصور</TableHead>
                    <TableHead>الفيديوهات</TableHead>
                    <TableHead>تاريخ الإرسال</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">
                        #{report.id.slice(0, 8)}
                      </TableCell>
                      <TableCell>
                        {report.orderDetails?.customerName || 'غير محدد'}
                      </TableCell>
                      <TableCell>
                        {report.orderDetails?.address || 'غير محدد'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {report.technicianName}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {report.workDescription}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-100 text-blue-800">
                          {report.photos?.length || 0} صورة
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-purple-100 text-purple-800">
                          {report.videos?.length || 0} فيديو
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {new Date(report.submittedAt).toLocaleDateString('ar-EG')}
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
    </div>
  );
};

export default AdminWorkReports;
