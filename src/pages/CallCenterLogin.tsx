
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import { Headphones, ArrowDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const CallCenterLogin = () => {
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
      console.log('Attempting call center login with:', credentials.phone);

      // First, try to find the user in approved_users table
      const { data: userData, error: userError } = await supabase
        .from('approved_users')
        .select('*')
        .eq('phone', credentials.phone)
        .eq('password', credentials.password)
        .eq('role', 'call_center')
        .single();

      if (userError || !userData) {
        console.log('Call center user not found or invalid credentials');
        toast({
          title: "خطأ في تسجيل الدخول",
          description: "رقم الهاتف أو كلمة المرور غير صحيحة، أو أن حسابك غير مقبول بعد",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      // Create a temporary email for Supabase auth
      const tempEmail = `${userData.phone}@temp.local`;
      
      // Try to sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: tempEmail,
        password: credentials.password
      });

      if (authError) {
        // If user doesn't exist in auth, create them
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: tempEmail,
          password: credentials.password,
          options: {
            data: {
              name: userData.name,
              phone: userData.phone,
              role: userData.role
            }
          }
        });

        if (signUpError) {
          console.error('Sign up error:', signUpError);
          toast({
            title: "خطأ في النظام",
            description: "حدث خطأ أثناء تسجيل الدخول",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }
      }

      console.log('Call center login successful:', userData);
      
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: `مرحباً بك ${userData.name}`,
      });
      
      navigate("/call-center");
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
    <div className="min-h-screen bg-gradient-to-br from-green-600 to-green-400 flex items-center justify-center p-4">
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
            <Headphones className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">ELARABY</h1>
          <p className="text-green-100">دخول الكول سنتر</p>
        </div>

        {/* Login Card */}
        <Card className="bg-white/95 backdrop-blur-sm shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-green-600">تسجيل الدخول</CardTitle>
            <CardDescription>
              أدخل بيانات الدخول الخاصة بك للوصول لوحة الكول سنتر
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
              />
            </div>
            
            <Button 
              onClick={handleLogin} 
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={loading}
            >
              {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
            </Button>

            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                ليس لديك حساب؟{" "}
                <Link to="/call-center-register" className="text-green-600 hover:underline">
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

export default CallCenterLogin;
