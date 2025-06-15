
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { ArrowDown, RefreshCw, FileSpreadsheet, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const GoogleSheetsSync = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [sheetConfig, setSheetConfig] = useState({
    sheetId: '1w6VzcsdWstGYf_EXmWDPeZS7wwNzziwpjsqDbnXJbfA',
    sheetName: 'Sheet1',
    range: 'A2:J1000'
  });

  const handleSync = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-google-sheets', {
        body: {
          sheetId: sheetConfig.sheetId,
          range: `${sheetConfig.sheetName}!${sheetConfig.range}`,
          action: 'sync'
        }
      });

      if (error) throw error;

      toast({
        title: "تم المزامنة بنجاح",
        description: `تم مزامنة ${data.syncedCount} طلب جديد من إجمالي ${data.totalRows} صف`,
      });
    } catch (error) {
      console.error('Error syncing Google Sheets:', error);
      toast({
        title: "خطأ في المزامنة",
        description: "فشل في مزامنة البيانات من Google Sheets",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-elaraby-gray">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="bg-green-600 text-white p-2 rounded-lg">
                <FileSpreadsheet className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-green-600">مزامنة Google Sheets</h1>
                <p className="text-gray-600">ربط الطلبات مع Google Sheets</p>
              </div>
            </div>
            <Link to="/call-center">
              <Button variant="outline">
                <ArrowDown className="h-4 w-4 ml-2" />
                العودة للكول سنتر
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Configuration Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                إعدادات Google Sheets
              </CardTitle>
              <CardDescription>
                قم بتكوين معرف الورقة ونطاق البيانات للمزامنة
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="sheetId">معرف Google Sheet</Label>
                <Input
                  id="sheetId"
                  value={sheetConfig.sheetId}
                  onChange={(e) => setSheetConfig({...sheetConfig, sheetId: e.target.value})}
                  placeholder="1w6VzcsdWstGYf_EXmWDPeZS7wwNzziwpjsqDbnXJbfA"
                  className="text-right"
                />
                <p className="text-sm text-gray-500 mt-1">
                  يوجد في رابط Google Sheet بين /spreadsheets/d/ و /edit
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sheetName">اسم الورقة</Label>
                  <Input
                    id="sheetName"
                    value={sheetConfig.sheetName}
                    onChange={(e) => setSheetConfig({...sheetConfig, sheetName: e.target.value})}
                    placeholder="Sheet1"
                    className="text-right"
                  />
                </div>
                <div>
                  <Label htmlFor="range">نطاق البيانات</Label>
                  <Input
                    id="range"
                    value={sheetConfig.range}
                    onChange={(e) => setSheetConfig({...sheetConfig, range: e.target.value})}
                    placeholder="A2:J1000"
                    className="text-right"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Expected Format Card */}
          <Card>
            <CardHeader>
              <CardTitle>تنسيق البيانات المتوقع</CardTitle>
              <CardDescription>
                يجب أن تكون بيانات Google Sheet بالتنسيق التالي
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-2 py-1 border-b">
                  <span className="font-medium">العمود A:</span>
                  <span>رقم الطلب (اختياري)</span>
                </div>
                <div className="grid grid-cols-2 gap-2 py-1 border-b">
                  <span className="font-medium">العمود B:</span>
                  <span>اسم العميل *</span>
                </div>
                <div className="grid grid-cols-2 gap-2 py-1 border-b">
                  <span className="font-medium">العمود C:</span>
                  <span>رقم الهاتف</span>
                </div>
                <div className="grid grid-cols-2 gap-2 py-1 border-b">
                  <span className="font-medium">العمود D:</span>
                  <span>العنوان *</span>
                </div>
                <div className="grid grid-cols-2 gap-2 py-1 border-b">
                  <span className="font-medium">العمود E:</span>
                  <span>رقم العقار</span>
                </div>
                <div className="grid grid-cols-2 gap-2 py-1 border-b">
                  <span className="font-medium">العمود F:</span>
                  <span>شكوى العميل</span>
                </div>
                <div className="grid grid-cols-2 gap-2 py-1 border-b">
                  <span className="font-medium">العمود G:</span>
                  <span>تاريخ الحجز</span>
                </div>
                <div className="grid grid-cols-2 gap-2 py-1 border-b">
                  <span className="font-medium">العمود H:</span>
                  <span>ملاحظات الكول سنتر</span>
                </div>
                <div className="grid grid-cols-2 gap-2 py-1 border-b">
                  <span className="font-medium">العمود I:</span>
                  <span>رقم SAP</span>
                </div>
                <div className="grid grid-cols-2 gap-2 py-1">
                  <span className="font-medium">العمود J:</span>
                  <span>نوع التكييف</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sync Action Card */}
          <Card>
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
                <h3 className="text-lg font-medium">جاهز للمزامنة</h3>
                <p className="text-gray-600">
                  اضغط على الزر أدناه لمزامنة الطلبات من Google Sheets
                </p>
                <Button 
                  onClick={handleSync} 
                  className="bg-green-600 hover:bg-green-700"
                  disabled={loading}
                  size="lg"
                >
                  <RefreshCw className={`h-5 w-5 ml-2 ${loading ? 'animate-spin' : ''}`} />
                  {loading ? 'جاري المزامنة...' : 'مزامنة الطلبات'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default GoogleSheetsSync;
