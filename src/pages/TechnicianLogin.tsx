
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import { User, ArrowDown } from "lucide-react";

interface ApprovedUser {
  id: string;
  name: string;
  phone: string;
  role: string;
  password: string;
  approvedAt: string;
}

const TechnicianLogin = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    phone: '',
    password: ''
  });

  const handleLogin = () => {
    if (!credentials.phone || !credentials.password) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال رقم الهاتف وكلمة المرور",
        variant: "destructive"
      });
      return;
    }

    // Get approved users from localStorage
    const approvedUsers = JSON.parse(localStorage.getItem('approvedUsers') || '[]');
    const registrationRequests = JSON.parse(localStorage.getItem('registrationRequests') || '[]');
    
    // Find user in approved users by phone
    const approvedUser = approvedUsers.find((user: ApprovedUser) => user.phone === credentials.phone);
    
    if (approvedUser) {
      // Find the original registration request to get the password
      const originalRequest = registrationRequests.find((req: any) => 
        req.id === approvedUser.id && req.status === 'approved'
      );
      
      if (originalRequest && originalRequest.password === credentials.password) {
        toast({
          title: "تم تسجيل الدخول بنجاح",
          description: `مرحباً بك ${approvedUser.name}`,
        });
        
        // Store current user info for the session
        localStorage.setItem('currentUser', JSON.stringify({
          id: approvedUser.id,
          name: approvedUser.name,
          phone: approvedUser.phone,
          role: approvedUser.role
        }));
        
        // Navigate based on role
        if (approvedUser.role === 'admin') {
          navigate("/admin");
        } else {
          navigate("/technician");
        }
      } else {
        toast({
          title: "خطأ في تسجيل الدخول",
          description: "كلمة المرور غير صحيحة",
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "خطأ في تسجيل الدخول",
        description: "رقم الهاتف غير مسجل أو غير مقبول في النظام",
        variant: "destructive"
      });
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
              />
            </div>
            
            <Button onClick={handleLogin} className="w-full bg-elaraby-blue hover:bg-elaraby-blue/90">
              تسجيل الدخول
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
