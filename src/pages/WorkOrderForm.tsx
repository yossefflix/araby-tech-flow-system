
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Link, useParams } from "react-router-dom";
import { Upload, Camera, FileText, ArrowDown, CheckCircle } from "lucide-react";

const WorkOrderForm = () => {
  const { id } = useParams();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    // Customer Info (pre-filled from assignment)
    customerName: 'محمد قاسم',
    address: 'المدينة البريطانية، طريق برنهام هيلز',
    phone: '729337925',
    
    // Equipment Details
    equipmentModel1: '',
    equipmentSerial1: '',
    equipmentModel2: '',
    equipmentSerial2: '',
    warrantyStatus: '',
    
    // Work Details
    workDescription: '',
    partsUsed: '',
    recommendations: '',
    customerSignature: '',
    
    // Media uploads
    photos: [] as File[],
    videos: [] as File[]
  });

  const handleFileUpload = (type: 'photos' | 'videos', files: FileList | null) => {
    if (files) {
      const fileArray = Array.from(files);
      setFormData(prev => ({
        ...prev,
        [type]: [...prev[type], ...fileArray]
      }));
    }
  };

  const handleSubmit = () => {
    if (!formData.equipmentModel1 || !formData.workDescription) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "تم إرسال التقرير بنجاح",
      description: "تم إرسال تقرير العمل إلى الكول سنتر",
    });
  };

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
                <p className="text-gray-600">طلب رقم: #{id}</p>
              </div>
            </div>
            <Link to="/technician">
              <Button variant="outline">
                <ArrowDown className="h-4 w-4 ml-2" />
                العودة لمهامي
              </Button>
            </Link>
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
                <Input value={formData.customerName} disabled className="bg-gray-50" />
              </div>
              <div>
                <Label>رقم الهاتف</Label>
                <Input value={formData.phone} disabled className="bg-gray-50" />
              </div>
              <div className="md:col-span-2">
                <Label>العنوان</Label>
                <Input value={formData.address} disabled className="bg-gray-50" />
              </div>
            </CardContent>
          </Card>

          {/* Equipment Details */}
          <Card>
            <CardHeader>
              <CardTitle>تفاصيل الأجهزة</CardTitle>
              <CardDescription>معلومات الأجهزة المطلوب صيانتها</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="equipmentModel1">الموديل الأول *</Label>
                  <Input
                    id="equipmentModel1"
                    value={formData.equipmentModel1}
                    onChange={(e) => setFormData({...formData, equipmentModel1: e.target.value})}
                    placeholder="AH-XP24UHE"
                  />
                </div>
                <div>
                  <Label htmlFor="equipmentSerial1">الرقم المسلسل الأول *</Label>
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
                <Label htmlFor="warrantyStatus">حالة الضمان *</Label>
                <Select onValueChange={(value) => setFormData({...formData, warrantyStatus: value})}>
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
              <CardDescription>ارفع صور وفيديوهات من موقع العمل</CardDescription>
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
                  {formData.photos.length > 0 && (
                    <p className="text-sm text-green-600 mt-2">
                      تم رفع {formData.photos.length} صورة
                    </p>
                  )}
                </div>
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
                  {formData.videos.length > 0 && (
                    <p className="text-sm text-green-600 mt-2">
                      تم رفع {formData.videos.length} فيديو
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <Card>
            <CardContent className="p-6">
              <Button onClick={handleSubmit} className="w-full bg-green-600 hover:bg-green-700">
                <CheckCircle className="h-5 w-5 ml-2" />
                إرسال التقرير إلى الكول سنتر
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WorkOrderForm;
