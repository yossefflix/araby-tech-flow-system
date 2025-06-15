
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileSpreadsheet, Loader2, User, Send, CheckCircle, Trash2, RefreshCw } from "lucide-react";
import { supabaseDB } from "@/utils/supabaseDatabase";
import { authUtils } from "@/utils/authUtils";
import * as XLSX from 'xlsx';

interface ExcelRow {
  orderNumber: string; // رقم الطلب (العمود الأول)
  customerName: string; // اسم العميل (العمود الثاني)
  productType: string; // نوع المنتج (العمود الثالث)
  reservationDate: string; // تاريخ الحجز (العمود الرابع)
  complaintType: string; // نوع الشكوى (العمود الخامس)
  technicianType: string; // نوع الفني (العمود السادس)
  phoneNumber: string; // رقم الهاتف (العمود السابع)
  address: string; // العنوان (العمود الثامن)
  customerName2: string; // اسم العميل (العمود التاسع)
  assignedTechnician?: string;
  sent?: boolean;
}

interface Technician {
  id: string;
  name: string;
  phone: string;
}

const ExcelWorkOrderUploader = ({ onUploadSuccess }: { onUploadSuccess: () => void }) => {
  const [uploading, setUploading] = useState(false);
  const [parsedData, setParsedData] = useState<ExcelRow[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [sendingOrders, setSendingOrders] = useState<Record<number, boolean>>({});
  const { toast } = useToast();

  const loadTechnicians = async () => {
    try {
      const users = await supabaseDB.getApprovedUsers();
      const techList = users.filter(user => user.role === 'technician');
      setTechnicians(techList);
    } catch (error) {
      console.error('Error loading technicians:', error);
    }
  };

  const parseExcelFile = (file: File): Promise<ExcelRow[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          let workbook: XLSX.WorkBook;
          
          if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
            workbook = XLSX.read(data, { type: 'array' });
          } else {
            const textData = e.target?.result as string;
            workbook = XLSX.read(textData, { type: 'string' });
          }
          
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          const rows: ExcelRow[] = [];
          for (let i = 1; i < jsonData.length; i++) {
            const rowData = jsonData[i] as any[];
            if (rowData.length > 8 && rowData[0]) {
              const row: ExcelRow = {
                orderNumber: rowData[0]?.toString() || '', // رقم الطلب
                customerName: rowData[1]?.toString() || '', // اسم العميل
                productType: rowData[2]?.toString() || '', // نوع المنتج
                reservationDate: rowData[3]?.toString() || '', // تاريخ الحجز
                complaintType: rowData[4]?.toString() || '', // نوع الشكوى
                technicianType: rowData[5]?.toString() || '', // نوع الفني
                phoneNumber: rowData[6]?.toString() || '', // رقم الهاتف
                address: rowData[7]?.toString() || '', // العنوان
                customerName2: rowData[8]?.toString() || '', // اسم العميل الثاني
                sent: false
              };
              rows.push(row);
            }
          }
          resolve(rows);
        } catch (error) {
          console.error('Error parsing file:', error);
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('فشل في قراءة الملف'));
      
      if (file.name.endsWith('.csv')) {
        reader.readAsText(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv') && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast({
        title: "خطأ في نوع الملف",
        description: "يرجى رفع ملف Excel (.xlsx, .xls) أو CSV (.csv)",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      console.log('Parsing file:', file.name);
      const rows = await parseExcelFile(file);
      console.log('Parsed rows:', rows);

      if (rows.length === 0) {
        toast({
          title: "ملف فارغ",
          description: "لا توجد بيانات في الملف المرفوع",
          variant: "destructive"
        });
        return;
      }

      setParsedData(rows);
      await loadTechnicians();

      toast({
        title: "تم تحليل الملف بنجاح",
        description: `تم استخراج ${rows.length} طلب من الملف. يمكنك الآن تعيين الفنيين وإرسال كل طلب`,
      });

    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "خطأ في تحليل الملف",
        description: "فشل في قراءة وتحليل الملف",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleTechnicianAssignment = (index: number, technicianName: string) => {
    const updatedData = [...parsedData];
    updatedData[index].assignedTechnician = technicianName;
    setParsedData(updatedData);
  };

  const sendSingleOrder = async (index: number) => {
    const order = parsedData[index];
    if (!order.assignedTechnician) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار فني قبل إرسال الطلب",
        variant: "destructive"
      });
      return;
    }

    setSendingOrders(prev => ({ ...prev, [index]: true }));
    
    try {
      const currentUser = await authUtils.getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const success = await supabaseDB.addWorkOrder({
        customerName: order.customerName, // اسم العميل الصحيح
        phone: order.phoneNumber, // رقم الهاتف الصحيح
        address: order.address,
        propertyNumber: order.orderNumber, // رقم الطلب كرقم العقار
        customerComplaint: order.complaintType,
        bookingDate: order.reservationDate,
        callCenterNotes: '',
        sapNumber: order.orderNumber,
        acType: order.productType,
        assignedTechnician: order.assignedTechnician,
        status: 'pending',
        createdBy: currentUser.name
      });

      if (success) {
        const updatedData = [...parsedData];
        updatedData[index].sent = true;
        setParsedData(updatedData);

        toast({
          title: "تم إرسال الطلب",
          description: `تم إرسال طلب ${order.customerName} إلى ${order.assignedTechnician} بنجاح`,
        });

        // Check if all orders are sent
        const allSent = updatedData.every(o => o.sent);
        if (allSent) {
          onUploadSuccess();
        }
      } else {
        toast({
          title: "خطأ في الإرسال",
          description: "فشل في إرسال الطلب",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error sending order:', error);
      toast({
        title: "خطأ في الإرسال",
        description: "فشل في إرسال الطلب",
        variant: "destructive"
      });
    } finally {
      setSendingOrders(prev => ({ ...prev, [index]: false }));
    }
  };

  const removeOrder = (index: number) => {
    const updatedData = parsedData.filter((_, i) => i !== index);
    setParsedData(updatedData);
    
    toast({
      title: "تم حذف الطلب",
      description: "تم حذف الطلب من القائمة",
    });
  };

  const resetData = () => {
    setParsedData([]);
    setSendingOrders({});
    toast({
      title: "تم مسح البيانات",
      description: "تم مسح جميع الطلبات المحملة",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            رفع ملف Excel وتوزيع الطلبات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              <p>قم برفع ملف Excel أو CSV يحتوي على الأعمدة التالية بالترتيب:</p>
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>رقم الطلب</li>
                <li>اسم العميل</li>
                <li>نوع المنتج</li>
                <li>تاريخ الحجز</li>
                <li>نوع الشكوى</li>
                <li>نوع الفني</li>
                <li>رقم الهاتف</li>
                <li>العنوان</li>
                <li>اسم العميل (النسخة الاحتياطية)</li>
              </ol>
            </div>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
                id="excel-upload"
              />
              <label htmlFor="excel-upload" className="cursor-pointer">
                <div className="flex flex-col items-center gap-2">
                  {uploading ? (
                    <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
                  ) : (
                    <Upload className="h-12 w-12 text-blue-600" />
                  )}
                  <p className="text-lg font-medium">
                    {uploading ? 'جاري تحليل الملف...' : 'اختر ملف Excel أو اسحبه هنا'}
                  </p>
                  <p className="text-sm text-gray-500">CSV, XLSX, أو XLS</p>
                </div>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      {parsedData.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                الطلبات المحملة ({parsedData.length} طلب)
              </CardTitle>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={resetData}
                  className="text-red-600 border-red-600 hover:bg-red-50"
                >
                  <RefreshCw className="h-4 w-4 ml-2" />
                  مسح الكل
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {parsedData.map((order, index) => (
                <Card 
                  key={index} 
                  className={`border-r-4 transition-all ${
                    order.sent 
                      ? 'border-r-green-500 bg-green-50' 
                      : 'border-r-blue-500'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="md:col-span-2 space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-lg text-blue-600">
                            {order.customerName}
                          </h3>
                          {order.sent && (
                            <div className="flex items-center gap-1 text-green-600">
                              <CheckCircle className="h-5 w-5" />
                              <span className="text-sm font-medium">تم الإرسال</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div className="space-y-1">
                            <p><strong>رقم الهاتف:</strong> {order.phoneNumber || 'غير محدد'}</p>
                            <p><strong>العنوان:</strong> {order.address}</p>
                            <p><strong>رقم الطلب:</strong> {order.orderNumber}</p>
                          </div>
                          <div className="space-y-1">
                            <p><strong>نوع المنتج:</strong> {order.productType}</p>
                            <p><strong>تاريخ الحجز:</strong> {order.reservationDate}</p>
                            <p><strong>نوع الفني:</strong> {order.technicianType}</p>
                          </div>
                        </div>
                        
                        {order.complaintType && (
                          <div className="mt-2">
                            <p className="text-sm font-medium">نوع الشكوى:</p>
                            <p className="text-sm bg-gray-100 p-2 rounded">{order.complaintType}</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col gap-3">
                        {!order.sent ? (
                          <>
                            <div>
                              <label className="block text-sm font-medium mb-2">اختيار الفني:</label>
                              <Select 
                                value={order.assignedTechnician || ''} 
                                onValueChange={(value) => handleTechnicianAssignment(index, value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="اختر الفني" />
                                </SelectTrigger>
                                <SelectContent>
                                  {technicians.map((technician) => (
                                    <SelectItem key={technician.id} value={technician.name}>
                                      <div className="flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        {technician.name} - {technician.phone}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div className="flex gap-2">
                              <Button 
                                onClick={() => sendSingleOrder(index)}
                                disabled={!order.assignedTechnician || sendingOrders[index]}
                                className="flex-1 bg-green-600 hover:bg-green-700"
                              >
                                {sendingOrders[index] ? (
                                  <Loader2 className="h-4 w-4 animate-spin ml-2" />
                                ) : (
                                  <Send className="h-4 w-4 ml-2" />
                                )}
                                إرسال الطلب
                              </Button>
                              
                              <Button 
                                variant="outline"
                                size="sm"
                                onClick={() => removeOrder(index)}
                                className="text-red-600 border-red-600 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </>
                        ) : (
                          <div className="text-center space-y-2">
                            <div className="flex items-center justify-center gap-2 text-green-600">
                              <CheckCircle className="h-6 w-6" />
                              <span className="font-medium">تم إرسال الطلب</span>
                            </div>
                            <p className="text-sm text-gray-600">
                              تم إرسال الطلب إلى: <strong>{order.assignedTechnician}</strong>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ExcelWorkOrderUploader;
