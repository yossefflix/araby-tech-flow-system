import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { UserPlus, ArrowDown } from "lucide-react";
import { supabaseDB } from "@/utils/supabaseDatabase";

const CallCenterRegister = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = async () => {
    // Validation
    if (!formData.name || !formData.phone || !formData.password || !formData.confirmPassword) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive"
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "خطأ",
        description: "كلمة المرور وتأكيد كلمة المرور غير متطابقتين",
        variant: "destructive"
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "خطأ",
        description: "كلمة المرور يجب أن تكون 6 أحرف على الأقل",
        variant: "destructive"
      });
      return;
    }

    if (formData.phone.length < 10) {
      toast({
        title: "خطأ",
        description: "رقم الهاتف يجب أن يكون 10 أرقام على الأقل",
        variant: "destructive"
      });
      return;
    }

    // Check if phone number is already registered
    const phoneRegistered = await supabaseDB.isPhoneRegistered(formData.phone);
    if (phoneRegistered) {
      toast({
        title: "خطأ",
        description: "رقم الهاتف مسجل مسبقاً في النظام",
        variant: "destructive"
      });
      return;
    }

    // Add registration request using Supabase
    try {
      const success = await supabaseDB.addRegistrationRequest({
        name: formData.name,
        phone: formData.phone,
        role: 'call_center',
        password: formData.password
      });

      if (success) {
        toast({
          title: "تم إرسال الطلب بنجاح",
          description: "تم إرسال طلب تسجيل الحساب للمراجعة. سيتم إشعارك عند الموافقة.",
        });

        // Reset form
        setFormData({
          name: '',
          phone: '',
          password: '',
          confirmPassword: ''
        });
      } else {
        throw new Error('Failed to submit request');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.",
        variant: "destructive"
      });
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
            <UserPlus className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">ELARABY</h1>
          <p className="text-green-100">تسجيل حساب كول سنتر جديد</p>
        </div>

        {/* Registration Card */}
        <Card className="bg-white/95 backdrop-blur-sm shadow-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-green-600">إنشاء حساب كول سنتر جديد</CardTitle>
            <CardDescription>
              أدخل بياناتك لطلب إنشاء حساب كول سنتر جديد
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">الاسم الكامل *</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="أدخل اسمك الكامل"
                className="text-right"
              />
            </div>

            <div>
              <Label htmlFor="phone">رقم الهاتف *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="أدخل رقم هاتفك"
                className="text-right"
              />
            </div>
            
            <div>
              <Label htmlFor="password">كلمة المرور *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="أدخل كلمة المرور (6 أحرف على الأقل)"
                className="text-right"
              />
            </div>

            <div>
              <Label htmlFor="confirmPassword">تأكيد كلمة المرور *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                placeholder="أعد إدخال كلمة المرور"
                className="text-right"
              />
            </div>
            
            <Button onClick={handleSubmit} className="w-full bg-green-600 hover:bg-green-700">
              إرسال طلب التسجيل
            </Button>

            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                لديك حساب بالفعل؟{" "}
                <Link to="/call-center-login" className="text-green-600 hover:underline">
                  تسجيل الدخول
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CallCenterRegister;
