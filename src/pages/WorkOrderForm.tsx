
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Link, useParams } from "react-router-dom";
import { Upload, Camera, FileText, ArrowDown, CheckCircle, Save, X } from "lucide-react";
import { supabaseDB, WorkOrder } from "@/utils/supabaseDatabase";

interface WorkReport {
  orderId: string;
  acType: string;
  equipmentModel1: string;
  equipmentSerial1: string;
  equipmentModel2: string;
  equipmentSerial2: string;
  warrantyStatus: string;
  workDescription: string;
  partsUsed: string;
  recommendations: string;
  customerSignature: string;
  photos: { name: string; size: number }[];
  videos: { name: string; size: number }[];
  technicianName: string;
}

const WorkOrderForm = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    acType: '',
    equipmentModel1: '',
    equipmentSerial1: '',
    equipmentModel2: '',
    equipmentSerial2: '',
    warrantyStatus: '',
    workDescription: '',
    partsUsed: '',
    recommendations: '',
    customerSignature: '',
    photos: [] as File[],
    videos: [] as File[]
  });

  useEffect(() => {
    if (id) {
      loadWorkOrder();
    }
  }, [id]);

  const loadWorkOrder = async () => {
    try {
      if (!id) return;

      // Load work order data from Supabase
      const order = await supabaseDB.getWorkOrder(id);
      if (order) {
        setWorkOrder(order);
        // Pre-fill AC type if it exists in the work order
        if (order.acType) {
          setFormData(prev => ({
            ...prev,
            acType: order.acType
          }));
        }
      }

      // Check if there's an existing work report
      const existingReport = await supabaseDB.getWorkReport(id);
      if (existingReport) {
        setFormData(prev => ({
          ...prev,
          acType: existingReport.acType || '',
          equipmentModel1: existingReport.equipmentModel1 || '',
          equipmentSerial1: existingReport.equipmentSerial1 || '',
          equipmentModel2: existingReport.equipmentModel2 || '',
          equipmentSerial2: existingReport.equipmentSerial2 || '',
          warrantyStatus: existingReport.warrantyStatus || '',
          workDescription: existingReport.workDescription || '',
          partsUsed: existingReport.partsUsed || '',
          recommendations: existingReport.recommendations || '',
          customerSignature: existingReport.customerSignature || '',
          photos: [], // Reset file arrays as they can't be restored
          videos: []
        }));
      }

      // Load saved form data from localStorage as backup
      const savedFormData = localStorage.getItem(`workOrderForm_${id}`);
      if (savedFormData && !existingReport) {
        const parsedData = JSON.parse(savedFormData);
        setFormData(prev => ({
          ...prev,
          ...parsedData,
          photos: [], // Reset file arrays as they can't be serialized
          videos: []
        }));
      }
    } catch (error) {
      console.error('Error loading work order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (type: 'photos' | 'videos', files: FileList | null) => {
    if (files) {
      const fileArray = Array.from(files);
      setFormData(prev => ({
        ...prev,
        [type]: [...prev[type], ...fileArray]
      }));
      
      toast({
        title: "تم رفع الملفات",
        description: `تم رفع ${fileArray.length} ${type === 'photos' ? 'صورة' : 'فيديو'} بنجاح`,
      });
    }
  };

  const removeFile = (type: 'photos' | 'videos', index: number) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const handleSave = () => {
    if (id) {
      // Save form data to localStorage as backup
      const dataToSave = {
        ...formData,
        photos: [], // Don't save files
        videos: []  // Don't save files
      };
      localStorage.setItem(`workOrderForm_${id}`, JSON.stringify(dataToSave));
      
      toast({
        title: "تم حفظ البيانات",
        description: "تم حفظ بيانات النموذج محلياً",
      });
    }
  };

  const handleSubmit = async () => {
    // Only check for essential fields
    if (!formData.workDescription.trim()) {
      toast({
        title: "خطأ",
        description: "يرجى كتابة وصف العمل المنجز",
        variant: "destructive"
      });
      return;
    }

    if (!id || !workOrder) return;

    setSubmitting(true);

    try {
      // Create work report
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      const workReport: Omit<WorkReport, 'id' | 'submittedAt'> = {
        orderId: id,
        acType: formData.acType,
        equipmentModel1: formData.equipmentModel1,
        equipmentSerial1: formData.equipmentSerial1,
        equipmentModel2: formData.equipmentModel2,
        equipmentSerial2: formData.equipmentSerial2,
        warrantyStatus: formData.warrantyStatus,
        workDescription: formData.workDescription,
        partsUsed: formData.partsUsed,
        recommendations: formData.recommendations,
        customerSignature: formData.customerSignature,
        photos: formData.photos.map(file => ({ name: file.name, size: file.size })),
        videos: formData.videos.map(file => ({ name: file.name, size: file.size })),
        technicianName: currentUser.name || 'فني غير محدد'
      };

      // Save work report to Supabase
      const reportSuccess = await supabaseDB.addWorkReport(workReport);
      
      if (reportSuccess) {
        // Update work order status to completed
        const statusSuccess = await supabaseDB.updateWorkOrderStatus(id, 'completed');
        
        if (statusSuccess) {
          // Clear saved form data after successful submission
          localStorage.removeItem(`workOrderForm_${id}`);
          
          toast({
            title: "تم إرسال التقرير بنجاح",
            description: "تم إرسال تقرير العمل إلى قاعدة البيانات",
          });
        } else {
          toast({
            title: "تحذير",
            description: "تم حفظ التقرير ولكن لم يتم تحديث حالة الطلب",
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "خطأ",
          description: "فشل في إرسال التقرير. يرجى المحاولة مرة أخرى",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error submitting work report:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إرسال التقرير",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-elaraby-gray flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">جاري تحميل بيانات الطلب...</p>
        </div>
      </div>
    );
  }

  if (!workOrder) {
    return (
      <div className="min-h-screen bg-elaraby-gray flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">لم يتم العثور على الطلب</p>
          <Link to="/technician">
            <Button className="mt-4">العودة لمهامي</Button>
          </Link>
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
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-elaraby-blue">نموذج العمل</h1>
                <p className="text-gray-600">طلب رقم: #{id?.slice(0, 8)}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} variant="outline" disabled={submitting}>
                <Save className="h-4 w-4 ml-2" />
                حفظ البيانات
              </Button>
              <Link to="/technician">
                <Button variant="outline">
                  <ArrowDown className="h-4 w-4 ml-2" />
                  العودة لمهامي
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>بيانات العميل</CardTitle>
              <CardDescription>المعلومات الأساسية للعميل</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>اسم العميل</Label>
                <Input value={workOrder.customerName} disabled className="bg-gray-50" />
              </div>
              <div>
                <Label>رقم الهاتف</Label>
                <Input value={workOrder.phone || 'غير محدد'} disabled className="bg-gray-50" />
              </div>
              <div className="md:col-span-2">
                <Label>العنوان</Label>
                <Input value={workOrder.address} disabled className="bg-gray-50" />
              </div>
              {workOrder.propertyNumber && (
                <div>
                  <Label>رقم العقار</Label>
                  <Input value={workOrder.propertyNumber} disabled className="bg-gray-50" />
                </div>
              )}
              {workOrder.sapNumber && (
                <div>
                  <Label>رقم SAP</Label>
                  <Input value={workOrder.sapNumber} disabled className="bg-gray-50" />
                </div>
              )}
              {workOrder.customerComplaint && (
                <div className="md:col-span-2">
                  <Label>شكوى العميل</Label>
                  <Textarea value={workOrder.customerComplaint} disabled className="bg-gray-50" rows={3} />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Equipment Details */}
          <Card>
            <CardHeader>
              <CardTitle>تفاصيل الأجهزة</CardTitle>
              <CardDescription>معلومات الأجهزة المطلوب صيانتها (اختيارية)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="acType">نوع التكييف</Label>
                <Select onValueChange={(value) => setFormData({...formData, acType: value})} value={formData.acType}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر نوع التكييف" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SHARP">SHARP</SelectItem>
                    <SelectItem value="TORNADO">TORNADO</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="equipmentModel1">الموديل الأول</Label>
                  <Input
                    id="equipmentModel1"
                    value={formData.equipmentModel1}
                    onChange={(e) => setFormData({...formData, equipmentModel1: e.target.value})}
                    placeholder="AH-XP24UHE"
                  />
                </div>
                <div>
                  <Label htmlFor="equipmentSerial1">الرقم المسلسل الأول</Label>
                  <Input
                    id="equipmentSerial1"
                    value={formData.equipmentSerial1}
                    onChange={(e) => setFormData({...formData, equipmentSerial1: e.target.value})}
                    placeholder="21F2000410008HX4UH"
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="equipmentModel2">الموديل الثاني</Label>
                  <Input
                    id="equipmentModel2"
                    value={formData.equipmentModel2}
                    onChange={(e) => setFormData({...formData, equipmentModel2: e.target.value})}
                    placeholder="AU-X24UHE"
                  />
                </div>
                <div>
                  <Label htmlFor="equipmentSerial2">الرقم المسلسل الثاني</Label>
                  <Input
                    id="equipmentSerial2"
                    value={formData.equipmentSerial2}
                    onChange={(e) => setFormData({...formData, equipmentSerial2: e.target.value})}
                    placeholder="20L1000295740X4UH"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="warrantyStatus">حالة الضمان</Label>
                <Select onValueChange={(value) => setFormData({...formData, warrantyStatus: value})} value={formData.warrantyStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر حالة الضمان" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="In warranty">داخل الضمان</SelectItem>
                    <SelectItem value="Out of warranty">خارج الضمان</SelectItem>
                    <SelectItem value="Extended warranty">ضمان ممتد</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Work Details */}
          <Card>
            <CardHeader>
              <CardTitle>تفاصيل العمل المنجز</CardTitle>
              <CardDescription>وصف العمل والقطع المستخدمة</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="workDescription">وصف العمل المنجز *</Label>
                <Textarea
                  id="workDescription"
                  value={formData.workDescription}
                  onChange={(e) => setFormData({...formData, workDescription: e.target.value})}
                  placeholder="اكتب تفاصيل العمل الذي تم إنجازه..."
                  rows={4}
                />
              </div>
              
              <div>
                <Label htmlFor="partsUsed">القطع المستخدمة</Label>
                <Textarea
                  id="partsUsed"
                  value={formData.partsUsed}
                  onChange={(e) => setFormData({...formData, partsUsed: e.target.value})}
                  placeholder="اذكر القطع التي تم استبدالها أو إصلاحها..."
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="recommendations">التوصيات</Label>
                <Textarea
                  id="recommendations"
                  value={formData.recommendations}
                  onChange={(e) => setFormData({...formData, recommendations: e.target.value})}
                  placeholder="أي توصيات للعميل..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Media Upload */}
          <Card>
            <CardHeader>
              <CardTitle>الصور والفيديوهات</CardTitle>
              <CardDescription>ارفع صور وفيديوهات من موقع العمل (اختيارية)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="photos">الصور</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Camera className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-600 mb-2">اضغط لرفع الصور أو اسحبها هنا</p>
                  <input
                    id="photos"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleFileUpload('photos', e.target.files)}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('photos')?.click()}
                  >
                    <Upload className="h-4 w-4 ml-2" />
                    اختر الصور
                  </Button>
                </div>
                
                {/* Display uploaded photos */}
                {formData.photos.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">الصور المرفوعة ({formData.photos.length}):</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {formData.photos.map((photo, index) => (
                        <div key={index} className="relative bg-gray-100 rounded-lg p-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600 truncate">
                              {photo.name}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile('photos', index)}
                              className="h-6 w-6 p-0"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <Label htmlFor="videos">الفيديوهات</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-600 mb-2">اضغط لرفع الفيديوهات أو اسحبها هنا</p>
                  <input
                    id="videos"
                    type="file"
                    multiple
                    accept="video/*"
                    onChange={(e) => handleFileUpload('videos', e.target.files)}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('videos')?.click()}
                  >
                    <Upload className="h-4 w-4 ml-2" />
                    اختر الفيديوهات
                  </Button>
                </div>
                
                {/* Display uploaded videos */}
                {formData.videos.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">الفيديوهات المرفوعة ({formData.videos.length}):</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {formData.videos.map((video, index) => (
                        <div key={index} className="relative bg-gray-100 rounded-lg p-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600 truncate">
                              {video.name}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile('videos', index)}
                              className="h-6 w-6 p-0"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <Card>
            <CardContent className="p-6">
              <div className="flex gap-4">
                <Button 
                  onClick={handleSubmit} 
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={submitting}
                >
                  <CheckCircle className="h-5 w-5 ml-2" />
                  {submitting ? 'جاري الإرسال...' : 'إرسال التقرير إلى الكول سنتر'}
                </Button>
                <Button onClick={handleSave} variant="outline" disabled={submitting}>
                  <Save className="h-4 w-4 ml-2" />
                  حفظ
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WorkOrderForm;
