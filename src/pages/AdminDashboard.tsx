
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowDown, User, Users, Shield } from "lucide-react";
import { Link } from "react-router-dom";

const AdminDashboard = () => {
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [secretCode, setSecretCode] = useState('');

  const ADMIN_SECRET = 'Gx7!vQ92#kLp@';

  const handleSecretSubmit = () => {
    if (secretCode === ADMIN_SECRET) {
      setIsAuthenticated(true);
      toast({
        title: "تم التحقق بنجاح",
        description: "مرحباً بك في لوحة تحكم المدير",
      });
    } else {
      toast({
        title: "خطأ",
        description: "الرقم السري غير صحيح",
        variant: "destructive"
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-elaraby-blue to-elaraby-lightblue flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white/95 backdrop-blur-sm shadow-2xl">
          <CardHeader className="text-center">
            <div className="bg-elaraby-blue text-white p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Shield className="h-8 w-8" />
            </div>
            <CardTitle className="text-2xl text-elaraby-blue">لوحة تحكم المدير</CardTitle>
            <CardDescription>
              أدخل الرقم السري للوصول للوحة التحكم
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="secretCode">الرقم السري</Label>
              <Input
                id="secretCode"
                type="password"
                value={secretCode}
                onChange={(e) => setSecretCode(e.target.value)}
                placeholder="أدخل الرقم السري"
                className="text-center"
                onKeyPress={(e) => e.key === 'Enter' && handleSecretSubmit()}
              />
            </div>
            
            <Button onClick={handleSecretSubmit} className="w-full bg-elaraby-blue hover:bg-elaraby-blue/90">
              دخول
            </Button>

            <div className="text-center mt-4">
              <Link to="/" className="text-sm text-elaraby-blue hover:underline">
                العودة للرئيسية
              </Link>
            </div>
          </CardContent>
        </Card>
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
              <div className="bg-elaraby-blue text-white p-2 rounded-lg">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-elaraby-blue">لوحة تحكم المدير</h1>
                <p className="text-gray-600">إدارة النظام</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsAuthenticated(false)}
              >
                تسجيل الخروج
              </Button>
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

      <div className="container mx-auto px-4 py-8">
        {/* Admin Functions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to="/account-management">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 space-x-reverse">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-elaraby-blue">إدارة الحسابات</h3>
                    <p className="text-gray-600">قبول ورفض طلبات التسجيل</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
