
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Download, Eye, Calendar, User, Wrench, Image, Video } from "lucide-react";
import { supabaseDB, WorkReport, WorkOrder } from "@/utils/supabaseDatabase";
import { authUtils, CurrentUser } from "@/utils/authUtils";
import { useToast } from "@/hooks/use-toast";

const WorkReports = () => {
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
      
      if (!user) {
        console.log('No authenticated user found, redirecting to login');
        navigate('/call-center-login');
        return;
      }

      if (user.role !== 'call_center' && user.role !== 'admin') {
        console.log('User is not call center or admin, redirecting');
        navigate('/');
        return;
      }

      setCurrentUser(user);

      // جلب تقارير العمل
      const reports = await supabaseDB.getWorkReports();
      
      // جلب تفاصيل الطلبات لكل تقرير
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

  const downloadFile = (fileName: string, fileSize: number) => {
    // هنا يمكن إضافة منطق تحميل الملف من Supabase Storage إذا كان متاحاً
    toast({
      title: "تحميل الملف",
      description: `جاري تحميل ${fileName}...`,
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
              <Link to="/call-center">
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
                <Image className="h-8 w-8 text-blue-600" />
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
                <Video className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reports List */}
        <div className="grid gap-6">
          {workReports.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">لا توجد تقارير عمل مكتملة بعد</p>
              </CardContent>
            </Card>
          ) : (
            workReports.map((report) => (
              <Card key={report.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg text-green-600">
                        تقرير عمل #{report.id.slice(0, 8)}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          {report.technicianName}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(report.submittedAt).toLocaleDateString('ar-EG')}
                        </span>
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      مكتمل
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* معلومات الطلب */}
                  {report.orderDetails && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Wrench className="h-4 w-4" />
                        معلومات طلب الصيانة
                      </h4>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p><strong>العميل:</strong> {report.orderDetails.customerName}</p>
                          <p><strong>العنوان:</strong> {report.orderDetails.address}</p>
                          {report.orderDetails.phone && (
                            <p><strong>الهاتف:</strong> {report.orderDetails.phone}</p>
                          )}
                        </div>
                        <div>
                          {report.orderDetails.sapNumber && (
                            <p><strong>رقم SAP:</strong> {report.orderDetails.sapNumber}</p>
                          )}
                          {report.orderDetails.acType && (
                            <p><strong>نوع التكييف:</strong> {report.orderDetails.acType}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* معلومات المعدات */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      {report.acType && (
                        <p><strong>نوع التكييف:</strong> {report.acType}</p>
                      )}
                      {report.equipmentModel1 && (
                        <p><strong>موديل المعدة الأولى:</strong> {report.equipmentModel1}</p>
                      )}
                      {report.equipmentSerial1 && (
                        <p><strong>رقم السيريال الأول:</strong> {report.equipmentSerial1}</p>
                      )}
                      {report.equipmentModel2 && (
                        <p><strong>موديل المعدة الثانية:</strong> {report.equipmentModel2}</p>
                      )}
                      {report.equipmentSerial2 && (
                        <p><strong>رقم السيريال الثاني:</strong> {report.equipmentSerial2}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      {report.warrantyStatus && (
                        <p><strong>حالة الضمان:</strong> {report.warrantyStatus}</p>
                      )}
                    </div>
                  </div>

                  {/* وصف العمل */}
                  <div>
                    <h4 className="font-semibold mb-2">وصف العمل المنجز:</h4>
                    <p className="bg-gray-50 p-3 rounded text-sm">{report.workDescription}</p>
                  </div>

                  {/* القطع المستخدمة */}
                  {report.partsUsed && (
                    <div>
                      <h4 className="font-semibold mb-2">القطع المستخدمة:</h4>
                      <p className="bg-gray-50 p-3 rounded text-sm">{report.partsUsed}</p>
                    </div>
                  )}

                  {/* التوصيات */}
                  {report.recommendations && (
                    <div>
                      <h4 className="font-semibold mb-2">التوصيات:</h4>
                      <p className="bg-gray-50 p-3 rounded text-sm">{report.recommendations}</p>
                    </div>
                  )}

                  {/* توقيع العميل */}
                  {report.customerSignature && (
                    <div>
                      <h4 className="font-semibold mb-2">توقيع العميل:</h4>
                      <p className="text-green-600 font-medium">✓ تم الحصول على توقيع العميل</p>
                    </div>
                  )}

                  {/* الصور */}
                  {report.photos && report.photos.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Image className="h-4 w-4" />
                        الصور المرفقة ({report.photos.length})
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {report.photos.map((photo, index) => (
                          <div key={index} className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <Image className="h-5 w-5 text-blue-600" />
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => downloadFile(photo.name, photo.size)}
                              >
                                <Download className="h-3 w-3" />
                              </Button>
                            </div>
                            <p className="text-xs text-gray-600 truncate">{photo.name}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(photo.size)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* الفيديوهات */}
                  {report.videos && report.videos.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Video className="h-4 w-4" />
                        الفيديوهات المرفقة ({report.videos.length})
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {report.videos.map((video, index) => (
                          <div key={index} className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <Video className="h-5 w-5 text-purple-600" />
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => downloadFile(video.name, video.size)}
                              >
                                <Download className="h-3 w-3" />
                              </Button>
                            </div>
                            <p className="text-xs text-gray-600 truncate">{video.name}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(video.size)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkReports;
