import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { Phone, Search, CheckCircle, Upload, Eye, ArrowDown, Plus, FileText, Camera, Video, X, Maximize2, Loader2 } from "lucide-react";

interface WorkOrder {
  id: string;
  customerName: string;
  address: string;
  propertyNumber: string;
  customerComplaint: string;
  bookingDate: string;
  assignedTechnician: string;
  status: string;
  createdAt: string;
  createdBy: string;
  sapNumber?: string;
  callCenterNotes?: string;
}

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
  photos: { name: string; size: number, data: string }[];
  videos: { name: string; size: number, data: string }[];
  submittedAt: string;
  technicianName: string;
}

const CallCenterDashboard = () => {
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);
  const [workReports, setWorkReports] = useState<WorkReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<WorkReport | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'orders' | 'reports'>('orders');
  const [selectedMedia, setSelectedMedia] = useState<{ type: 'image' | 'video', data: string, name: string } | null>(null);

  useEffect(() => {
    // Get work orders from localStorage
    const workOrders = JSON.parse(localStorage.getItem('workOrders') || '[]');
    setOrders(workOrders);
    
    // Get work reports from localStorage
    const reports = JSON.parse(localStorage.getItem('workReports') || '[]');
    setWorkReports(reports);
  }, []);

  const filteredOrders = orders.filter(order =>
    order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredReports = workReports.filter(report => {
    const order = orders.find(o => o.id === report.orderId);
    return order && (
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.orderId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'في انتظار التنفيذ';
      case 'in-progress': return 'قيد التنفيذ';
      case 'completed': return 'مكتمل';
      default: return status;
    }
  };

  const handleRefresh = () => {
    const workOrders = JSON.parse(localStorage.getItem('workOrders') || '[]');
    setOrders(workOrders);
    const reports = JSON.parse(localStorage.getItem('workReports') || '[]');
    setWorkReports(reports);
  };

  const getOrderForReport = (reportOrderId: string) => {
    return orders.find(order => order.id === reportOrderId);
  };

  const MediaViewer = ({ media, onClose }: { media: { type: 'image' | 'video', data: string, name: string }, onClose: () => void }) => (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={onClose}>
      <div className="relative max-w-4xl max-h-4xl w-full h-full p-4" onClick={(e) => e.stopPropagation()}>
        <Button
          onClick={onClose}
          className="absolute top-2 right-2 z-10 bg-white text-black hover:bg-gray-200"
          size="sm"
        >
          <X className="h-4 w-4" />
        </Button>
        
        {media.type === 'image' ? (
          <img
            src={media.data}
            alt={media.name}
            className="w-full h-full object-contain rounded-lg"
            onError={(e) => {
              console.error('خطأ في تحميل الصورة:', e);
              (e.target as HTMLImageElement).style.display = 'none';
            }}
            onLoad={() => console.log('تم تحميل الصورة بنجاح')}
          />
        ) : (
          <video
            src={media.data}
            controls
            className="w-full h-full object-contain rounded-lg"
            onError={(e) => {
              console.error('خطأ في تحميل الفيديو:', e);
            }}
            onLoadedData={() => console.log('تم تحميل الفيديو بنجاح')}
          >
            متصفحك لا يدعم تشغيل الفيديو
          </video>
        )}
        
        <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white p-2 rounded">
          {media.name}
        </div>
      </div>
    </div>
  );

  const ImageWithLoader = ({ src, alt, className, onClick }: { src: string; alt: string; className: string; onClick?: () => void }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    return (
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded text-gray-500 text-xs">
            فشل في التحميل
          </div>
        )}
        <img
          src={src}
          alt={alt}
          className={className}
          onClick={onClick}
          onLoad={() => {
            setLoading(false);
            console.log('تم تحميل الصورة:', alt);
          }}
          onError={(e) => {
            setLoading(false);
            setError(true);
            console.error('خطأ في تحميل الصورة:', alt, e);
          }}
          style={{ display: error ? 'none' : 'block' }}
        />
      </div>
    );
  };

  const VideoWithLoader = ({ src, className, onClick }: { src: string; className: string; onClick?: () => void }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    return (
      <div className="relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded text-gray-500 text-xs">
            فشل في التحميل
          </div>
        )}
        <video
          src={src}
          controls
          className={className}
          onClick={onClick}
          onLoadedData={() => {
            setLoading(false);
            console.log('تم تحميل الفيديو بنجاح');
          }}
          onError={(e) => {
            setLoading(false);
            setError(true);
            console.error('خطأ في تحميل الفيديو:', e);
          }}
          style={{ display: error ? 'none' : 'block' }}
        >
          متصفحك لا يدعم تشغيل الفيديو
        </video>
      </div>
    );
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
                <p className="text-gray-600">مراجعة ومتابعة الطلبات والتقارير</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleRefresh} variant="outline">
                تحديث
              </Button>
              <Link to="/call-center-work-order">
                <Button className="bg-green-600 hover:bg-green-700">
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة طلب جديد
                </Button>
              </Link>
              <Link to="/">
                <Button variant="outline">
                  <ArrowDown className="h-4 w-4 ml-2" />
                  العودة للرئيسية
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Media Viewer Modal */}
      {selectedMedia && (
        <MediaViewer
          media={selectedMedia}
          onClose={() => setSelectedMedia(null)}
        />
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">في انتظار التنفيذ</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {orders.filter(o => o.status === 'pending').length}
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
                  <p className="text-sm text-gray-600">قيد التنفيذ</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {orders.filter(o => o.status === 'in-progress').length}
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
                  <p className="text-sm text-gray-600">مكتملة</p>
                  <p className="text-2xl font-bold text-green-600">
                    {orders.filter(o => o.status === 'completed').length}
                  </p>
                </div>
                <Upload className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">تقارير العمل</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {workReports.length}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-4 space-x-reverse">
            <Button
              variant={activeTab === 'orders' ? 'default' : 'outline'}
              onClick={() => setActiveTab('orders')}
            >
              طلبات الصيانة
            </Button>
            <Button
              variant={activeTab === 'reports' ? 'default' : 'outline'}
              onClick={() => setActiveTab('reports')}
            >
              تقارير العمل المكتملة
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Orders/Reports List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  {activeTab === 'orders' ? (
                    <>
                      <CheckCircle className="h-5 w-5" />
                      طلبات الصيانة
                    </>
                  ) : (
                    <>
                      <FileText className="h-5 w-5" />
                      تقارير العمل المكتملة
                    </>
                  )}
                </span>
                <div className="flex items-center gap-2">
                  <Input 
                    placeholder="بحث..." 
                    className="w-40" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Button size="sm" variant="outline">
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {activeTab === 'orders' ? (
                  filteredOrders.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>لا توجد طلبات حالياً</p>
                    </div>
                  ) : (
                    filteredOrders.map((order) => (
                      <div 
                        key={order.id} 
                        className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => {
                          setSelectedOrder(order);
                          setSelectedReport(null);
                        }}
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
                          <p>👨‍🔧 {order.assignedTechnician}</p>
                          <p>📅 {new Date(order.createdAt).toLocaleDateString('ar-EG')}</p>
                          <p>📝 {order.customerComplaint.substring(0, 50)}...</p>
                        </div>
                      </div>
                    ))
                  )
                ) : (
                  filteredReports.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>لا توجد تقارير عمل حالياً</p>
                    </div>
                  ) : (
                    filteredReports.map((report) => {
                      const order = getOrderForReport(report.orderId);
                      return (
                        <div 
                          key={report.orderId} 
                          className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => {
                            setSelectedReport(report);
                            setSelectedOrder(order || null);
                          }}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-elaraby-blue">#{report.orderId}</h4>
                              <p className="text-sm text-gray-600">{order?.customerName}</p>
                            </div>
                            <Badge className="bg-green-100 text-green-800">
                              تقرير مكتمل
                            </Badge>
                          </div>
                          
                          <div className="text-sm text-gray-600 space-y-1">
                            <p>👨‍🔧 {report.technicianName}</p>
                            <p>📅 {new Date(report.submittedAt).toLocaleDateString('ar-EG')}</p>
                            <p>📝 {report.workDescription.substring(0, 50)}...</p>
                            <div className="flex gap-2 mt-2">
                              {report.photos.length > 0 && (
                                <div className="flex items-center gap-1 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  <Camera className="h-3 w-3" />
                                  {report.photos.length} صورة
                                </div>
                              )}
                              {report.videos.length > 0 && (
                                <div className="flex items-center gap-1 text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                                  <Video className="h-3 w-3" />
                                  {report.videos.length} فيديو
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )
                )}
              </div>
            </CardContent>
          </Card>

          {/* Details Panel */}
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedReport ? 'تقرير العمل المكتمل' : 'تفاصيل الطلب'}
              </CardTitle>
              <CardDescription>
                {selectedOrder ? `طلب رقم: #${selectedOrder.id}` : 'اختر طلباً أو تقريراً لعرض التفاصيل'}
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
                      <p><strong>العنوان:</strong> {selectedOrder.address}</p>
                      {selectedOrder.propertyNumber && (
                        <p><strong>رقم العقار:</strong> {selectedOrder.propertyNumber}</p>
                      )}
                      {selectedOrder.sapNumber && (
                        <p><strong>رقم SAP:</strong> {selectedOrder.sapNumber}</p>
                      )}
                    </div>
                  </div>

                  {/* Work Details */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">تفاصيل العمل</h4>
                    <div className="text-sm space-y-2">
                      <p><strong>الفني المكلف:</strong> {selectedOrder.assignedTechnician}</p>
                      <p><strong>شكوى العميل:</strong></p>
                      <div className="bg-white p-2 rounded border">
                        {selectedOrder.customerComplaint}
                      </div>
                      {selectedOrder.bookingDate && (
                        <p><strong>تاريخ الحجز:</strong> {new Date(selectedOrder.bookingDate).toLocaleDateString('ar-EG')}</p>
                      )}
                      {selectedOrder.callCenterNotes && (
                        <>
                          <p><strong>ملاحظات الكول سنتر:</strong></p>
                          <div className="bg-white p-2 rounded border">
                            {selectedOrder.callCenterNotes}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Work Report Details (if selected) */}
                  {selectedReport && (
                    <>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">تفاصيل الأجهزة</h4>
                        <div className="text-sm space-y-1">
                          {selectedReport.acType && <p><strong>نوع التكييف:</strong> {selectedReport.acType}</p>}
                          {selectedReport.equipmentModel1 && <p><strong>الموديل الأول:</strong> {selectedReport.equipmentModel1}</p>}
                          {selectedReport.equipmentSerial1 && <p><strong>الرقم المسلسل الأول:</strong> {selectedReport.equipmentSerial1}</p>}
                          {selectedReport.equipmentModel2 && <p><strong>الموديل الثاني:</strong> {selectedReport.equipmentModel2}</p>}
                          {selectedReport.equipmentSerial2 && <p><strong>الرقم المسلسل الثاني:</strong> {selectedReport.equipmentSerial2}</p>}
                          {selectedReport.warrantyStatus && <p><strong>حالة الضمان:</strong> {selectedReport.warrantyStatus}</p>}
                        </div>
                      </div>

                      <div className="bg-green-50 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">تقرير العمل المنجز</h4>
                        <div className="text-sm space-y-2">
                          <p><strong>الفني:</strong> {selectedReport.technicianName}</p>
                          <p><strong>تاريخ الإرسال:</strong> {new Date(selectedReport.submittedAt).toLocaleString('ar-EG')}</p>
                          
                          <div>
                            <p><strong>وصف العمل المنجز:</strong></p>
                            <div className="bg-white p-2 rounded border mt-1">
                              {selectedReport.workDescription}
                            </div>
                          </div>

                          {selectedReport.partsUsed && (
                            <div>
                              <p><strong>القطع المستخدمة:</strong></p>
                              <div className="bg-white p-2 rounded border mt-1">
                                {selectedReport.partsUsed}
                              </div>
                            </div>
                          )}

                          {selectedReport.recommendations && (
                            <div>
                              <p><strong>التوصيات:</strong></p>
                              <div className="bg-white p-2 rounded border mt-1">
                                {selectedReport.recommendations}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Media Section */}
                      {(selectedReport.photos.length > 0 || selectedReport.videos.length > 0) && (
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <h4 className="font-semibold mb-2">الصور والفيديوهات</h4>
                          
                          {selectedReport.photos.length > 0 && (
                            <div className="mb-4">
                              <p className="text-sm font-medium mb-3">الصور ({selectedReport.photos.length}):</p>
                              <div className="grid grid-cols-2 gap-3">
                                {selectedReport.photos.map((photo, index) => (
                                  <div key={index} className="relative group">
                                    <div className="bg-white p-2 rounded border hover:shadow-md transition-shadow">
                                      <ImageWithLoader
                                        src={photo.data}
                                        alt={photo.name}
                                        className="w-full h-32 object-cover rounded mb-2 cursor-pointer"
                                        onClick={() => setSelectedMedia({ type: 'image', data: photo.data, name: photo.name })}
                                      />
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1 flex-1 min-w-0">
                                          <Camera className="h-3 w-3 text-blue-600 flex-shrink-0" />
                                          <div className="min-w-0 flex-1">
                                            <p className="text-xs font-medium truncate">{photo.name}</p>
                                            <p className="text-xs text-gray-500">
                                              {(photo.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                          </div>
                                        </div>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => setSelectedMedia({ type: 'image', data: photo.data, name: photo.name })}
                                          className="p-1 h-6 w-6"
                                        >
                                          <Maximize2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {selectedReport.videos.length > 0 && (
                            <div>
                              <p className="text-sm font-medium mb-3">الفيديوهات ({selectedReport.videos.length}):</p>
                              <div className="grid grid-cols-1 gap-3">
                                {selectedReport.videos.map((video, index) => (
                                  <div key={index} className="bg-white p-3 rounded border">
                                    <div className="flex items-center justify-between mb-2">
                                      <div className="flex items-center gap-2 flex-1 min-w-0">
                                        <Video className="h-4 w-4 text-purple-600 flex-shrink-0" />
                                        <div className="min-w-0 flex-1">
                                          <p className="text-sm font-medium truncate">{video.name}</p>
                                          <p className="text-xs text-gray-500">
                                            {(video.size / 1024 / 1024).toFixed(2)} MB
                                          </p>
                                        </div>
                                      </div>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => setSelectedMedia({ type: 'video', data: video.data, name: video.name })}
                                        className="flex-shrink-0"
                                      >
                                        <Maximize2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                    <VideoWithLoader
                                      src={video.data}
                                      className="w-full h-48 object-contain rounded bg-gray-100 cursor-pointer"
                                      onClick={() => setSelectedMedia({ type: 'video', data: video.data, name: video.name })}
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}

                  {/* Status */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">حالة الطلب</h4>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(selectedOrder.status)}>
                        {getStatusText(selectedOrder.status)}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        تم الإنشاء: {new Date(selectedOrder.createdAt).toLocaleDateString('ar-EG')}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>اختر طلباً أو تقريراً من القائمة لعرض التفاصيل</p>
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
