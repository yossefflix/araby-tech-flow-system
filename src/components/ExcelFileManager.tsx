
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileSpreadsheet, Loader2, Download, Eye } from "lucide-react";
import { supabaseDB } from "@/utils/supabaseDatabase";
import { authUtils } from "@/utils/authUtils";
import { supabase } from "@/integrations/supabase/client";

interface UploadedFile {
  fileName: string;
  fileUrl: string;
  uploadedAt: string;
  uploadedBy: string;
}

const ExcelFileManager = () => {
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadUploadedFiles = async () => {
    try {
      const { data, error } = await supabase.storage
        .from('work-files')
        .list('excel-uploads', {
          limit: 50,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (error) {
        console.error('Error loading files:', error);
        return;
      }

      const files: UploadedFile[] = data.map(file => ({
        fileName: file.name,
        fileUrl: supabase.storage.from('work-files').getPublicUrl(`excel-uploads/${file.name}`).data.publicUrl,
        uploadedAt: file.created_at || '',
        uploadedBy: 'موظف كول سنتر'
      }));

      setUploadedFiles(files);
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setLoading(false);
    }
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

      console.log('Uploading file to Supabase Storage:', file.name);
      const result = await supabaseDB.uploadExcelFile(file);

      if (result) {
        toast({
          title: "تم رفع الملف بنجاح",
          description: `تم حفظ الملف ${file.name} في التخزين`,
        });

        console.log('File uploaded successfully:', result);
        loadUploadedFiles();
      } else {
        throw new Error('Failed to upload file');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "خطأ في الرفع",
        description: "فشل في رفع الملف",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            رفع وإدارة ملفات Excel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              <p>قم برفع ملف Excel أو CSV ليتم حفظه في التخزين السحابي:</p>
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

      {/* Uploaded Files List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            الملفات المرفوعة
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-4">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
              <p>جاري تحميل الملفات...</p>
            </div>
          ) : uploadedFiles.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>لا توجد ملفات مرفوعة بعد</p>
            </div>
          ) : (
            <div className="space-y-3">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-medium">{file.fileName.split('/').pop()}</p>
                      <p className="text-sm text-gray-500">
                        {file.uploadedAt ? new Date(file.uploadedAt).toLocaleDateString('ar-EG') : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(file.fileUrl, '_blank')}
                    >
                      <Eye className="h-4 w-4 ml-1" />
                      عرض
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = file.fileUrl;
                        link.download = file.fileName.split('/').pop() || 'file';
                        link.click();
                      }}
                    >
                      <Download className="h-4 w-4 ml-1" />
                      تحميل
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ExcelFileManager;
