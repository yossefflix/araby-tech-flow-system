
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { User, Shield, Headphones, Settings, CheckCircle, Clock, Users, FileText } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-elaraby-blue to-elaraby-lightblue">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="bg-white p-2 rounded-lg">
                <Settings className="h-8 w-8 text-elaraby-blue" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">ELARABY</h1>
                <p className="text-blue-100">نظام إدارة الصيانة</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            مرحباً بك في نظام إدارة الصيانة
          </h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            اختر نوع حسابك للوصول إلى الخدمات المناسبة لك
          </p>
        </div>

        {/* System Features */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-white text-center mb-8">مميزات النظام</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            <Card className="bg-white/95 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h4 className="font-bold text-elaraby-blue mb-2">إدارة متكاملة</h4>
                <p className="text-sm text-gray-600">نظام شامل لإدارة جميع طلبات الصيانة</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/95 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <Clock className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h4 className="font-bold text-elaraby-blue mb-2">متابعة فورية</h4>
                <p className="text-sm text-gray-600">تتبع حالة الطلبات في الوقت الفعلي</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/95 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <Users className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                <h4 className="font-bold text-elaraby-blue mb-2">فريق متخصص</h4>
                <p className="text-sm text-gray-600">فنيون مدربون وكول سنتر متاح 24/7</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white/95 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <FileText className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                <h4 className="font-bold text-elaraby-blue mb-2">تقارير شاملة</h4>
                <p className="text-sm text-gray-600">تقارير تفصيلية لجميع أعمال الصيانة</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Technician Card */}
          <Card className="bg-white/95 backdrop-blur-sm shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105">
            <CardHeader className="text-center pb-4">
              <div className="bg-elaraby-blue text-white p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <User className="h-10 w-10" />
              </div>
              <CardTitle className="text-2xl text-elaraby-blue">الفنيون</CardTitle>
              <CardDescription className="text-gray-600">
                دخول الفنيين لإدارة طلبات الصيانة والخدمات
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link to="/technician-login" className="block">
                <Button className="w-full bg-elaraby-blue hover:bg-elaraby-blue/90 text-lg py-6">
                  تسجيل الدخول
                </Button>
              </Link>
              <Link to="/register" className="block">
                <Button variant="outline" className="w-full border-elaraby-blue text-elaraby-blue hover:bg-elaraby-blue hover:text-white">
                  إنشاء حساب جديد
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Call Center Card */}
          <Card className="bg-white/95 backdrop-blur-sm shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105">
            <CardHeader className="text-center pb-4">
              <div className="bg-green-600 text-white p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Headphones className="h-10 w-10" />
              </div>
              <CardTitle className="text-2xl text-green-600">الكول سنتر</CardTitle>
              <CardDescription className="text-gray-600">
                دخول موظفي الكول سنتر لإدارة طلبات العملاء
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link to="/call-center-login" className="block">
                <Button className="w-full bg-green-600 hover:bg-green-700 text-lg py-6">
                  تسجيل الدخول
                </Button>
              </Link>
              <Link to="/call-center-register" className="block">
                <Button variant="outline" className="w-full border-green-600 text-green-600 hover:bg-green-600 hover:text-white">
                  إنشاء حساب جديد
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Admin Card */}
          <Card className="bg-white/95 backdrop-blur-sm shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105">
            <CardHeader className="text-center pb-4">
              <div className="bg-red-600 text-white p-4 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <Shield className="h-10 w-10" />
              </div>
              <CardTitle className="text-2xl text-red-600">المدير</CardTitle>
              <CardDescription className="text-gray-600">
                لوحة تحكم المدير لإدارة النظام والمستخدمين
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/admin" className="block">
                <Button className="w-full bg-red-600 hover:bg-red-700 text-lg py-6">
                  لوحة التحكم
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-16">
          <p className="text-blue-100 text-lg">
            © 2025 ELARABY - جميع الحقوق محفوظة
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
