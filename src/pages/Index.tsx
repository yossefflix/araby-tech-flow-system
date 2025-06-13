
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Shield, User, Phone, UserPlus } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-elaraby-blue to-elaraby-lightblue">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-sm border-b border-white/20">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">ELARABY</h1>
                <p className="text-blue-100">نظام إدارة الصيانة</p>
              </div>
            </div>
            <Link to="/register">
              <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                <UserPlus className="h-4 w-4 ml-2" />
                تسجيل حساب جديد
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">
            نظام إدارة الصيانة المتقدم
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            منصة شاملة لإدارة طلبات الصيانة وتنظيم عمل الفنيين بكفاءة عالية
          </p>
        </div>

        {/* Access Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {/* Admin Access */}
          <Card className="bg-white/95 backdrop-blur-sm shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105">
            <CardHeader className="text-center">
              <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Shield className="h-8 w-8" />
              </div>
              <CardTitle className="text-xl text-gray-800">لوحة المدير</CardTitle>
              <CardDescription className="text-gray-600">
                إدارة الحسابات والمستخدمين
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/admin">
                <Button className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700">
                  دخول المدير
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Call Center Access */}
          <Card className="bg-white/95 backdrop-blur-sm shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105">
            <CardHeader className="text-center">
              <div className="bg-gradient-to-r from-elaraby-blue to-blue-600 text-white p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Phone className="h-8 w-8" />
              </div>
              <CardTitle className="text-xl text-gray-800">الكول سنتر</CardTitle>
              <CardDescription className="text-gray-600">
                إنشاء وإدارة طلبات الصيانة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/call-center-work-order">
                <Button className="w-full bg-gradient-to-r from-elaraby-blue to-blue-600 hover:from-blue-600 hover:to-blue-700">
                  دخول الكول سنتر
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Technician Access */}
          <Card className="bg-white/95 backdrop-blur-sm shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105">
            <CardHeader className="text-center">
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <User className="h-8 w-8" />
              </div>
              <CardTitle className="text-xl text-gray-800">دخول الفنيين</CardTitle>
              <CardDescription className="text-gray-600">
                الوصول لمهام الصيانة والتقارير
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/technician-login">
                <Button className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
                  دخول الفني
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white/10 backdrop-blur-sm py-16 mt-16">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-white text-center mb-12">
            مميزات النظام
          </h3>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-white mb-2">أمان عالي</h4>
              <p className="text-blue-100">نظام حماية متقدم للبيانات والحسابات</p>
            </div>
            <div className="text-center">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-white mb-2">سهولة الاستخدام</h4>
              <p className="text-blue-100">واجهة بسيطة ومفهومة لجميع المستخدمين</p>
            </div>
            <div className="text-center">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Phone className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-white mb-2">متابعة مستمرة</h4>
              <p className="text-blue-100">تتبع حالة الطلبات والمهام في الوقت الفعلي</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white/5 backdrop-blur-sm border-t border-white/10 py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-blue-100">&copy; 2025 ELARABY - جميع الحقوق محفوظة</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
