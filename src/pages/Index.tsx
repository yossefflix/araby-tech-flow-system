
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Users, ClipboardList, Settings, Phone } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-elaraby-blue to-elaraby-lightblue">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="bg-elaraby-blue text-white p-3 rounded-lg">
                <Settings className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-elaraby-blue">ELARABY</h1>
                <p className="text-gray-600">نظام إدارة طلبات الصيانة</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl font-bold text-white mb-4">
            نظام إدارة طلبات الصيانة الاحترافي
          </h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            نظام متكامل لإدارة طلبات الصيانة من المدير إلى الفني إلى الكول سنتر
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Admin Dashboard */}
          <Card className="bg-white/95 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardHeader className="text-center">
              <div className="mx-auto bg-elaraby-blue text-white p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <Users className="h-8 w-8" />
              </div>
              <CardTitle className="text-xl text-elaraby-blue">لوحة تحكم المدير</CardTitle>
              <CardDescription>
                إنشاء وتوزيع طلبات الصيانة على الفنيين
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/admin">
                <Button className="w-full bg-elaraby-blue hover:bg-elaraby-blue/90">
                  دخول لوحة المدير
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Technician Login */}
          <Card className="bg-white/95 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardHeader className="text-center">
              <div className="mx-auto bg-elaraby-lightblue text-white p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <ClipboardList className="h-8 w-8" />
              </div>
              <CardTitle className="text-xl text-elaraby-blue">دخول الفنيين</CardTitle>
              <CardDescription>
                استقبال المهام وملء تقارير الصيانة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/technician-login">
                <Button className="w-full bg-elaraby-lightblue hover:bg-elaraby-lightblue/90">
                  دخول الفني
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Call Center */}
          <Card className="bg-white/95 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-105">
            <CardHeader className="text-center">
              <div className="mx-auto bg-green-600 text-white p-4 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <Phone className="h-8 w-8" />
              </div>
              <CardTitle className="text-xl text-elaraby-blue">الكول سنتر</CardTitle>
              <CardDescription>
                مراجعة وإرسال البيانات لموقع العربي
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/call-center">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  دخول الكول سنتر
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="mt-16 bg-white/10 backdrop-blur-sm rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-white text-center mb-8">مميزات النظام</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center text-white">
              <div className="bg-white/20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Settings className="h-8 w-8" />
              </div>
              <h4 className="font-semibold mb-2">إدارة احترافية</h4>
              <p className="text-sm text-blue-100">نظام إدارة متكامل وسهل الاستخدام</p>
            </div>
            <div className="text-center text-white">
              <div className="bg-white/20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <ClipboardList className="h-8 w-8" />
              </div>
              <h4 className="font-semibold mb-2">تتبع المهام</h4>
              <p className="text-sm text-blue-100">متابعة حالة جميع طلبات الصيانة</p>
            </div>
            <div className="text-center text-white">
              <div className="bg-white/20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Users className="h-8 w-8" />
              </div>
              <h4 className="font-semibold mb-2">فريق العمل</h4>
              <p className="text-sm text-blue-100">إدارة الفنيين والكول سنتر</p>
            </div>
            <div className="text-center text-white">
              <div className="bg-white/20 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Phone className="h-8 w-8" />
              </div>
              <h4 className="font-semibold mb-2">دعم فوري</h4>
              <p className="text-sm text-blue-100">تواصل مباشر ومتابعة مستمرة</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/10 backdrop-blur-sm mt-16 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-white/80">
            © 2024 ELARABY Service Management System. جميع الحقوق محفوظة.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
