
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { User, Settings, Phone, UserPlus } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-elaraby-blue to-elaraby-lightblue">
      {/* Header */}
      <header className="text-center py-16">
        <div className="bg-white/20 backdrop-blur-sm rounded-full p-8 w-32 h-32 mx-auto mb-6 flex items-center justify-center">
          <div className="text-white text-4xl font-bold">E</div>
        </div>
        <h1 className="text-5xl font-bold text-white mb-4">ELARABY</h1>
        <p className="text-xl text-blue-100 mb-8">نظام إدارة طلبات الصيانة</p>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {/* Admin Dashboard */}
          <Card className="bg-white/95 backdrop-blur-sm hover:bg-white transition-colors">
            <CardHeader className="text-center">
              <div className="bg-elaraby-blue text-white p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Settings className="h-8 w-8" />
              </div>
              <CardTitle className="text-elaraby-blue">لوحة المدير</CardTitle>
              <CardDescription>
                إنشاء وتوزيع طلبات الصيانة على الفنيين
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/admin">
                <Button className="w-full bg-elaraby-blue hover:bg-elaraby-blue/90">
                  دخول المدير
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Technician Login */}
          <Card className="bg-white/95 backdrop-blur-sm hover:bg-white transition-colors">
            <CardHeader className="text-center">
              <div className="bg-green-600 text-white p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <User className="h-8 w-8" />
              </div>
              <CardTitle className="text-green-600">دخول الفني</CardTitle>
              <CardDescription>
                تسجيل دخول الفنيين لاستقبال المهام
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/technician-login">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  دخول الفني
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Call Center */}
          <Card className="bg-white/95 backdrop-blur-sm hover:bg-white transition-colors">
            <CardHeader className="text-center">
              <div className="bg-purple-600 text-white p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Phone className="h-8 w-8" />
              </div>
              <CardTitle className="text-purple-600">الكول سنتر</CardTitle>
              <CardDescription>
                مراجعة ورفع تقارير الفنيين للموقع
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/call-center">
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  دخول الكول سنتر
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Registration */}
          <Card className="bg-white/95 backdrop-blur-sm hover:bg-white transition-colors">
            <CardHeader className="text-center">
              <div className="bg-orange-600 text-white p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <UserPlus className="h-8 w-8" />
              </div>
              <CardTitle className="text-orange-600">تسجيل حساب</CardTitle>
              <CardDescription>
                إنشاء حساب جديد للفنيين والمديرين
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/register">
                <Button className="w-full bg-orange-600 hover:bg-orange-700">
                  تسجيل حساب جديد
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-white mb-8">مميزات النظام</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">إدارة شاملة</h3>
              <p className="text-blue-100">نظام متكامل لإدارة طلبات الصيانة من البداية للنهاية</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">تتبع فوري</h3>
              <p className="text-blue-100">متابعة حالة الطلبات والفنيين في الوقت الفعلي</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-xl font-semibold text-white mb-4">تقارير مفصلة</h3>
              <p className="text-blue-100">تقارير شاملة مع الصور والفيديوهات والبيانات</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
