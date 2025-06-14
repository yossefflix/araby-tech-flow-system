
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import { User, ArrowDown } from "lucide-react";
import { authUtils } from "@/utils/authUtils";

const TechnicianLogin = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    phone: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!credentials.phone || !credentials.password) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال رقم الهاتف وكلمة المرور",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      console.log('Attempting login for technician:', credentials.phone);
      
      const { user, error } = await authUtils.loginUser(credentials.phone, credentials.password);
      
      if (error || !user) {
        toast({
          title: "خطأ في تسجيل الدخول",
          description: error || "فشل في تسجيل الدخول",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      console.log('Login successful for user:', user);
      
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: `مرحباً بك ${user.name}`,
      });
      
      // Navigate based on role
      if (user.role === 'admin') {
        window.location.href = "/admin";
      } else if (user.role === 'call_center') {
        window.location.href = "/call-center";
      } else {
        window.location.href = "/technician";
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "خطأ في النظام",
        description: "حدث خطأ أثناء تسجيل الدخول",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-elaraby-blue to-elaraby-lightblue flex items-center justify-center p-4">
      {/* Header */}
      <div className="absolute top-4 left-4">
        <Link to="/">
          <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
            <ArrowDown className="h-4 w-4 ml-2" />
            العودة للرئيسية
          </Button>
        </Link>
      </div>

      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
            <User className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">ELARABY</h1>
          <p className="text-blue-100">دخول الفنيين</p>
        </div>

        {/* Login Card */}
        <Card className="bg-white/95 backdrop-blur-sm shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-elaraby-blue">تسجيل الدخول</CardTitle>
            <CardDescription>
              أدخل بيانات الدخول الخاصة بك للوصول لمهامك
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="phone">رقم الهاتف</Label>
              <Input
                id="phone"
                type="tel"
                value={credentials.phone}
                onChange={(e) => setCredentials({...credentials, phone: e.target.value})}
                placeholder="أدخل رقم هاتفك"
                className="text-right"
                disabled={loading}
              />
            </div>
            
            <div>
              <Label htmlFor="password">كلمة المرور</Label>
              <Input
                id="password"
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                placeholder="أدخل كلمة المرور"
                className="text-right"
                disabled={loading}
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            
            <Button 
              onClick={handleLogin} 
              className="w-full bg-elaraby-blue hover:bg-elaraby-blue/90"
              disabled={loading}
            >
              {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </Button>

            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                ليس لديك حساب؟{" "}
                <Link to="/register" className="text-elaraby-blue hover:underline">
                  تسجيل حساب جديد
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TechnicianLogin;
