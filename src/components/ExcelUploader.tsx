
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileSpreadsheet, Loader2 } from "lucide-react";
import { supabaseDB } from "@/utils/supabaseDatabase";
import { authUtils } from "@/utils/authUtils";
import * as XLSX from 'xlsx';

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
          const data = e.target?.result;
          let workbook: XLSX.WorkBook;
          
          if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
            workbook = XLSX.read(data, { type: 'array' });
          } else {
            // CSV file
            const textData = e.target?.result as string;
            workbook = XLSX.read(textData, { type: 'string' });
          }
          
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          const rows: ExcelRow[] = [];
          for (let i = 1; i < jsonData.length; i++) {
            const rowData = jsonData[i] as any[];
            if (rowData.length > 1 && rowData[0]) {
              const row: ExcelRow = {
                customerName: rowData[0]?.toString() || '',
                phone: rowData[1]?.toString() || '',
                address: rowData[2]?.toString() || '',
                propertyNumber: rowData[3]?.toString() || '',
                customerComplaint: rowData[4]?.toString() || '',
                bookingDate: rowData[5]?.toString() || '',
                sapNumber: rowData[6]?.toString() || '',
                acType: rowData[7]?.toString() || ''
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
      const currentUser = await authUtils.getCurrentUser();
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      console.log('Parsing file:', file.name);
      const rows = await parseExcelFile(file);
      console.log('Parsed rows:', rows);

      let successCount = 0;
      let errorCount = 0;

      for (const row of rows) {
        if (row.customerName && row.address) {
          console.log('Adding work order:', row);
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
            console.log('Successfully added order for:', row.customerName);
          } else {
            errorCount++;
            console.log('Failed to add order for:', row.customerName);
          }
        } else {
          errorCount++;
          console.log('Skipping row due to missing required fields:', row);
        }
      }

      toast({
        title: "تم الرفع بنجاح",
        description: `تم إضافة ${successCount} طلب بنجاح${errorCount > 0 ? ` مع ${errorCount} خطأ` : ''}`,
      });

      console.log(`Upload completed: ${successCount} success, ${errorCount} errors`);
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
            <p>قم برفع ملف Excel أو CSV يحتوي على الأعمدة التالية:</p>
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
                  {uploading ? 'جاري الرفع...' : 'اختر ملف Excel أو اسحبه هنا'}
                </p>
                <p className="text-sm text-gray-500">CSV, XLSX, أو XLS</p>
              </div>
            </label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExcelUploader;
