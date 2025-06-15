
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileSpreadsheet, Loader2 } from "lucide-react";
import { supabaseDB } from "@/utils/supabaseDatabase";
import { authUtils } from "@/utils/authUtils";

interface ExcelRow {
  customerName: string;
  phone?: string;
  address: string;
  propertyNumber?: string;
  customerComplaint?: string;
  bookingDate?: string;
  sapNumber?: string;
  acType?: string;
}

const ExcelUploader = ({ onUploadSuccess }: { onUploadSuccess: () => void }) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const parseExcelFile = (file: File): Promise<ExcelRow[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result as string;
          const lines = data.split('\n');
          const headers = lines[0].split(',').map(h => h.trim());
          
          const rows: ExcelRow[] = [];
          for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            if (values.length > 1 && values[0]) {
              const row: ExcelRow = {
                customerName: values[0] || '',
                phone: values[1] || '',
                address: values[2] || '',
                propertyNumber: values[3] || '',
                customerComplaint: values[4] || '',
                bookingDate: values[5] || '',
                sapNumber: values[6] || '',
                acType: values[7] || ''
              };
              rows.push(row);
            }
          }
          resolve(rows);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('فشل في قراءة الملف'));
      reader.readAsText(file);
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv') && !file.name.endsWith('.xlsx')) {
      toast({
        title: "خطأ في نوع الملف",
        description: "يرجى رفع ملف Excel (.xlsx) أو CSV (.csv)",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      const currentUser = await authUtils.getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      let rows: ExcelRow[] = [];
      
      if (file.name.endsWith('.csv')) {
        rows = await parseExcelFile(file);
      } else {
        toast({
          title: "تنسيق غير مدعوم",
          description: "يرجى تحويل الملف إلى CSV أولاً",
          variant: "destructive"
        });
        return;
      }

      let successCount = 0;
      let errorCount = 0;

      for (const row of rows) {
        if (row.customerName && row.address) {
          const success = await supabaseDB.addWorkOrder({
            customerName: row.customerName,
            phone: row.phone,
            address: row.address,
            propertyNumber: row.propertyNumber,
            customerComplaint: row.customerComplaint,
            bookingDate: row.bookingDate,
            callCenterNotes: '',
            sapNumber: row.sapNumber,
            acType: row.acType,
            status: 'pending',
            createdBy: currentUser.name
          });

          if (success) {
            successCount++;
          } else {
            errorCount++;
          }
        }
      }

      toast({
        title: "تم الرفع بنجاح",
        description: `تم إضافة ${successCount} طلب بنجاح${errorCount > 0 ? ` مع ${errorCount} خطأ` : ''}`,
      });

      onUploadSuccess();
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "خطأ في الرفع",
        description: "فشل في رفع الملف وإضافة الطلبات",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      // Reset the input
      event.target.value = '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          رفع ملف Excel
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            <p>قم برفع ملف CSV يحتوي على الأعمدة التالية:</p>
            <ul className="list-disc list-inside mt-2">
              <li>اسم العميل (مطلوب)</li>
              <li>الهاتف</li>
              <li>العنوان (مطلوب)</li>
              <li>رقم العقار</li>
              <li>شكوى العميل</li>
              <li>تاريخ الحجز</li>
              <li>رقم SAP</li>
              <li>نوع التكييف</li>
            </ul>
          </div>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
              type="file"
              accept=".csv,.xlsx"
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
                  {uploading ? 'جاري الرفع...' : 'اختر ملف Excel أو اسحبه هنا'}
                </p>
                <p className="text-sm text-gray-500">CSV أو XLSX</p>
              </div>
            </label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExcelUploader;
