
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import { ArrowLeft, FileText, User, Calendar, Eye, Phone, MapPin, Download, Image } from "lucide-react";
import { supabaseDB, WorkReport, WorkOrder, FileUploadResult } from "@/utils/supabaseDatabase";
import { useToast } from "@/hooks/use-toast";

const AdminWorkReports = () => {
  const [workReports, setWorkReports] = useState<(WorkReport & { orderDetails?: WorkOrder })[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
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

  const downloadFile = async (file: FileUploadResult) => {
    try {
      const response = await fetch(file.fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = file.fileName.split('/').pop() || 'download';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "تم التحميل",
        description: "تم تحميل الملف بنجاح"
      });
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ في تحميل الملف",
        variant: "destructive"
      });
    }
  };

  const MediaViewer = ({ files, type }: { files: FileUploadResult[], type: 'image' | 'video' }) => {
    if (!files || files.length === 0) {
      return <span className="text-gray-500">لا يوجد {type === 'image' ? 'صور' : 'فيديوهات'}</span>;
    }

    return (
      <div className="flex flex-wrap gap-2">
        {files.map((file, index) => (
          <Dialog key={index}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                {type === 'image' ? 'صورة' : 'فيديو'} {index + 1}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>{type === 'image' ? 'عرض الصورة' : 'عرض الفيديو'}</span>
                  <Button 
                    onClick={() => downloadFile(file)} 
                    variant="outline" 
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    تحميل
                  </Button>
                </DialogTitle>
              </DialogHeader>
              <div className="flex justify-center">
                {type === 'image' ? (
                  <img 
                    src={file.fileUrl} 
                    alt={`صورة ${index + 1}`}
                    className="max-w-full max-h-[70vh] object-contain rounded-lg"
                  />
                ) : (
                  <video 
                    src={file.fileUrl} 
                    controls 
                    className="max-w-full max-h-[70vh] rounded-lg"
                  >
                    متصفحك لا يدعم عرض الفيديو
                  </video>
                )}
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>
    );
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
                <Eye className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reports List */}
        {workReports.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">لا توجد تقارير عمل بعد</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {workReports.map((report) => (
              <Card key={report.id} className="overflow-hidden">
                <CardHeader className="bg-green-50">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-green-600" />
                      تقرير رقم #{report.id.slice(0, 8)}
                    </CardTitle>
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      مكتمل
                    </Badge>
                  </div>
                  <CardDescription>
                    {report.orderDetails?.customerName || 'غير محدد'} - {new Date(report.submittedAt).toLocaleDateString('ar-EG')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Customer Information */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg text-gray-800">بيانات العميل</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">اسم العميل:</span>
                          <span>{report.orderDetails?.customerName || 'غير محدد'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">الهاتف:</span>
                          <span>{report.orderDetails?.phone || '-'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">العنوان:</span>
                          <span>{report.orderDetails?.address || 'غير محدد'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">رقم العقار:</span>
                          <span>{report.orderDetails?.propertyNumber || '-'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">رقم SAP:</span>
                          <span>{report.orderDetails?.sapNumber || '-'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Work Information */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-lg text-gray-800">بيانات العمل</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">الفني المنفذ:</span>
                          <span>{report.technicianName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">نوع المكيف:</span>
                          <span>{report.acType || '-'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">تاريخ الإرسال:</span>
                          <span>{new Date(report.submittedAt).toLocaleDateString('ar-EG')}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Work Details */}
                  <div className="mt-6 space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">الشكوى الأصلية:</h4>
                      <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                        {report.orderDetails?.customerComplaint || 'لا توجد شكوى مسجلة'}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">وصف العمل المنجز:</h4>
                      <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                        {report.workDescription}
                      </p>
                    </div>

                    {report.partsUsed && (
                      <div>
                        <h4 className="font-medium text-gray-800 mb-2">القطع المستخدمة:</h4>
                        <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                          {report.partsUsed}
                        </p>
                      </div>
                    )}

                    {report.recommendations && (
                      <div>
                        <h4 className="font-medium text-gray-800 mb-2">التوصيات:</h4>
                        <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                          {report.recommendations}
                        </p>
                      </div>
                    )}

                    {report.orderDetails?.callCenterNotes && (
                      <div>
                        <h4 className="font-medium text-gray-800 mb-2">ملاحظات الكول سنتر:</h4>
                        <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                          {report.orderDetails.callCenterNotes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Media Files */}
                  <div className="mt-6 space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-800 mb-3">الصور المرفقة:</h4>
                      <MediaViewer files={report.photos} type="image" />
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-800 mb-3">الفيديوهات المرفقة:</h4>
                      <MediaViewer files={report.videos} type="video" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminWorkReports;
