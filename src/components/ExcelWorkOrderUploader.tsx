
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
  orderName: string; // اسم الطلب (العمود A)
  customerName: string; // اسم العميل (العمود B)
  address: string; // العنوان (العمود C)
  technicianType: string; // اسم الفني (العمود D)
  phoneNumber: string; // رقم الموبايل (العمود E)
  relatedPersonPhone: string; // رقم شخص ذو صلة (العمود F)
  customerComplaint: string; // شكوى العميل (العمود G)
  reservationDate: string; // تاريخ الحجز (العمود H)
  callCenterNotes1: string; // ملاحظات الكول سنتر (العمود J)
  callCenterNotes2: string; // ملاحظات الكول سنتر (العمود K)
  sapNumber: string; // رقم SAP (العمود M)
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
            if (rowData.length > 0 && rowData[0]) {
              const row: ExcelRow = {
                orderName: rowData[0]?.toString() || '', // العمود A - اسم الطلب
                customerName: rowData[1]?.toString() || '', // العمود B - اسم العميل
                address: rowData[2]?.toString() || '', // العمود C - العنوان
                technicianType: rowData[3]?.toString() || '', // العمود D - اسم الفني
                phoneNumber: rowData[4]?.toString() || '', // العمود E - رقم الموبايل
                relatedPersonPhone: rowData[5]?.toString() || '', // العمود F - رقم شخص ذو صلة
                customerComplaint: rowData[6]?.toString() || '', // العمود G - شكوى العميل
                reservationDate: rowData[7]?.toString() || '', // العمود H - تاريخ الحجز
                callCenterNotes1: rowData[9]?.toString() || '', // العمود J - ملاحظات الكول سنتر 1
                callCenterNotes2: rowData[10]?.toString() || '', // العمود K - ملاحظات الكول سنتر 2
                sapNumber: rowData[12]?.toString() || '', // العمود M - رقم SAP
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

      // تجميع ملاحظات الكول سنتر
      const combinedNotes = [order.callCenterNotes1, order.callCenterNotes2]
        .filter(note => note && note.trim())
        .join(' - ');

      const success = await supabaseDB.addWorkOrder({
        customerName: order.customerName,
        phone: order.phoneNumber,
        address: order.address,
        propertyNumber: order.orderName,
        customerComplaint: order.customerComplaint,
        bookingDate: order.reservationDate,
        callCenterNotes: combinedNotes,
        sapNumber: order.sapNumber,
        acType: order.technicianType,
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
                <li>اسم الطلب (العمود A)</li>
                <li>اسم العميل (العمود B)</li>
                <li>العنوان (العمود C)</li>
                <li>اسم الفني (العمود D)</li>
                <li>رقم الموبايل (العمود E)</li>
                <li>رقم شخص ذو صلة (العمود F)</li>
                <li>شكوى العميل (العمود G)</li>
                <li>تاريخ الحجز (العمود H)</li>
                <li>ملاحظات الكول سنتر (العمود J)</li>
                <li>ملاحظات الكول سنتر (العمود K)</li>
                <li>رقم SAP (العمود M)</li>
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
                            <p><strong>اسم الطلب:</strong> {order.orderName}</p>
                            <p><strong>رقم الهاتف:</strong> {order.phoneNumber}</p>
                            <p><strong>رقم شخص ذو صلة:</strong> {order.relatedPersonPhone}</p>
                            <p><strong>العنوان:</strong> {order.address}</p>
                          </div>
                          <div className="space-y-1">
                            <p><strong>نوع الفني:</strong> {order.technicianType}</p>
                            <p><strong>تاريخ الحجز:</strong> {order.reservationDate}</p>
                            <p><strong>رقم SAP:</strong> {order.sapNumber}</p>
                          </div>
                        </div>
                        
                        {order.customerComplaint && (
                          <div className="mt-2">
                            <p className="text-sm font-medium">شكوى العميل:</p>
                            <p className="text-sm bg-gray-100 p-2 rounded">{order.customerComplaint}</p>
                          </div>
                        )}

                        {(order.callCenterNotes1 || order.callCenterNotes2) && (
                          <div className="mt-2">
                            <p className="text-sm font-medium">ملاحظات الكول سنتر:</p>
                            <div className="text-sm bg-gray-100 p-2 rounded space-y-1">
                              {order.callCenterNotes1 && <p>• {order.callCenterNotes1}</p>}
                              {order.callCenterNotes2 && <p>• {order.callCenterNotes2}</p>}
                            </div>
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
