
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "react-router-dom";
import { Phone, Search, CheckCircle, Upload, Eye, ArrowDown } from "lucide-react";

interface CompletedOrder {
  id: string;
  customerName: string;
  address: string;
  phone: string;
  technician: string;
  equipmentModel1: string;
  equipmentSerial1: string;
  equipmentModel2?: string;
  equipmentSerial2?: string;
  warrantyStatus: string;
  workDescription: string;
  partsUsed?: string;
  recommendations?: string;
  photos: number;
  videos: number;
  completedDate: string;
  status: 'pending-review' | 'approved' | 'uploaded';
}

const CallCenterDashboard = () => {
  const [orders] = useState<CompletedOrder[]>([
    {
      id: 'CAS202506024421001',
      customerName: 'محمد قاسم',
      address: 'المدينة البريطانية، طريق برنهام هيلز',
      phone: '729337925',
      technician: 'أحمد محمود',
      equipmentModel1: 'AH-XP24UHE',
      equipmentSerial1: '21F2000410008HX4UH',
      equipmentModel2: 'AU-X24UHE',
      equipmentSerial2: '20L1000295740X4UH',
      warrantyStatus: 'خارج الضمان',
      workDescription: 'تم تنظيف المكثف وشحن الفريون وفحص الدائرة الكهربائية',
      partsUsed: 'فريون R410A - 2 كيلو',
      recommendations: 'تنظيف دوري كل 6 أشهر',
      photos: 5,
      videos: 2,
      completedDate: '10/06/2025',
      status: 'pending-review'
    }
  ]);

  const [selectedOrder, setSelectedOrder] = useState<CompletedOrder | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending-review': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'uploaded': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending-review': return 'في انتظار المراجعة';
      case 'approved': return 'تم الموافقة';
      case 'uploaded': return 'تم الرفع';
      default: return status;
    }
  };

  const handleUploadToElaraby = (order: CompletedOrder) => {
    // Simulate upload process
    console.log('Uploading to ELARABY website:', order);
    alert('تم رفع البيانات إلى موقع العربي بنجاح');
  };

  return (
    <div className="min-h-screen bg-elaraby-gray">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="bg-green-600 text-white p-2 rounded-lg">
                <Phone className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-elaraby-blue">الكول سنتر</h1>
                <p className="text-gray-600">مراجعة ورفع البيانات</p>
              </div>
            </div>
            <Link to="/">
              <Button variant="outline">
                <ArrowDown className="h-4 w-4 ml-2" />
                العودة للرئيسية
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
                  <p className="text-sm text-gray-600">في انتظار المراجعة</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {orders.filter(o => o.status === 'pending-review').length}
                  </p>
                </div>
                <Eye className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">تم الموافقة</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {orders.filter(o => o.status === 'approved').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">تم الرفع</p>
                  <p className="text-2xl font-bold text-green-600">
                    {orders.filter(o => o.status === 'uploaded').length}
                  </p>
                </div>
                <Upload className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Orders List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  التقارير المكتملة
                </span>
                <div className="flex items-center gap-2">
                  <Input placeholder="بحث..." className="w-40" />
                  <Button size="sm" variant="outline">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {orders.map((order) => (
                  <div 
                    key={order.id} 
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-elaraby-blue">#{order.id}</h4>
                        <p className="text-sm text-gray-600">{order.customerName}</p>
                      </div>
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusText(order.status)}
                      </Badge>
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>📱 {order.phone}</p>
                      <p>👨‍🔧 {order.technician}</p>
                      <p>📅 {order.completedDate}</p>
                      <p>📸 {order.photos} صور، 🎥 {order.videos} فيديو</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Order Details */}
          <Card>
            <CardHeader>
              <CardTitle>تفاصيل التقرير</CardTitle>
              <CardDescription>
                {selectedOrder ? `طلب رقم: #${selectedOrder.id}` : 'اختر تقريراً لعرض التفاصيل'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedOrder ? (
                <div className="space-y-4">
                  {/* Customer Info */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">بيانات العميل</h4>
                    <div className="text-sm space-y-1">
                      <p><strong>الاسم:</strong> {selectedOrder.customerName}</p>
                      <p><strong>الهاتف:</strong> {selectedOrder.phone}</p>
                      <p><strong>العنوان:</strong> {selectedOrder.address}</p>
                    </div>
                  </div>

                  {/* Equipment Info */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">بيانات الأجهزة</h4>
                    <div className="text-sm space-y-1">
                      <p><strong>الموديل 1:</strong> {selectedOrder.equipmentModel1}</p>
                      <p><strong>المسلسل 1:</strong> {selectedOrder.equipmentSerial1}</p>
                      {selectedOrder.equipmentModel2 && (
                        <>
                          <p><strong>الموديل 2:</strong> {selectedOrder.equipmentModel2}</p>
                          <p><strong>المسلسل 2:</strong> {selectedOrder.equipmentSerial2}</p>
                        </>
                      )}
                      <p><strong>حالة الضمان:</strong> {selectedOrder.warrantyStatus}</p>
                    </div>
                  </div>

                  {/* Work Details */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">تفاصيل العمل</h4>
                    <div className="text-sm space-y-2">
                      <p><strong>الفني:</strong> {selectedOrder.technician}</p>
                      <p><strong>وصف العمل:</strong></p>
                      <div className="bg-white p-2 rounded border">
                        {selectedOrder.workDescription}
                      </div>
                      {selectedOrder.partsUsed && (
                        <>
                          <p><strong>القطع المستخدمة:</strong></p>
                          <div className="bg-white p-2 rounded border">
                            {selectedOrder.partsUsed}
                          </div>
                        </>
                      )}
                      {selectedOrder.recommendations && (
                        <>
                          <p><strong>التوصيات:</strong></p>
                          <div className="bg-white p-2 rounded border">
                            {selectedOrder.recommendations}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Media */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">الوسائط</h4>
                    <div className="text-sm">
                      <p>📸 {selectedOrder.photos} صورة</p>
                      <p>🎥 {selectedOrder.videos} فيديو</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleUploadToElaraby(selectedOrder)}
                      className="bg-elaraby-blue hover:bg-elaraby-blue/90"
                    >
                      <Upload className="h-4 w-4 ml-2" />
                      رفع إلى موقع العربي
                    </Button>
                    <Button variant="outline">
                      <Eye className="h-4 w-4 ml-2" />
                      عرض الوسائط
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>اختر تقريراً من القائمة لعرض التفاصيل</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CallCenterDashboard;
