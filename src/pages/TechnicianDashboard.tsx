
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { ClipboardList, User, CheckCircle, Clock, ArrowDown } from "lucide-react";

interface Assignment {
  id: string;
  customerName: string;
  address: string;
  phone: string;
  deviceType: string;
  issueDescription: string;
  status: 'assigned' | 'in-progress' | 'completed';
  priority: 'high' | 'medium' | 'low';
  assignedDate: string;
}

const TechnicianDashboard = () => {
  const [assignments] = useState<Assignment[]>([
    {
      id: 'CAS202506024421001',
      customerName: 'محمد قاسم',
      address: 'المدينة البريطانية، طريق برنهام هيلز',
      phone: '729337925',
      deviceType: 'تكييف خارج الضمان',
      issueDescription: 'تكييف لا يبرد بشكل جيد',
      status: 'assigned',
      priority: 'high',
      assignedDate: '10/06/2025'
    },
    {
      id: 'CAS202506024421002',
      customerName: 'فاطمة أحمد',
      address: 'المعادي، شارع 9',
      phone: '729337984',
      deviceType: 'ثلاجة',
      issueDescription: 'الثلاجة لا تعمل',
      status: 'in-progress',
      priority: 'medium',
      assignedDate: '09/06/2025'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'assigned': return 'مُخصص';
      case 'in-progress': return 'قيد التنفيذ';
      case 'completed': return 'مكتمل';
      default: return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return 'عالية';
      case 'medium': return 'متوسطة';
      case 'low': return 'منخفضة';
      default: return priority;
    }
  };

  return (
    <div className="min-h-screen bg-elaraby-gray">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="bg-elaraby-lightblue text-white p-2 rounded-lg">
                <User className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-elaraby-blue">لوحة تحكم الفني</h1>
                <p className="text-gray-600">أحمد محمود - مهندس صيانة</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link to="/technician-login">
                <Button variant="outline">تسجيل الخروج</Button>
              </Link>
              <Link to="/">
                <Button variant="outline">
                  <ArrowDown className="h-4 w-4 ml-2" />
                  الرئيسية
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">المهام المخصصة</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {assignments.filter(a => a.status === 'assigned').length}
                  </p>
                </div>
                <ClipboardList className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">قيد التنفيذ</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {assignments.filter(a => a.status === 'in-progress').length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">مكتملة</p>
                  <p className="text-2xl font-bold text-green-600">
                    {assignments.filter(a => a.status === 'completed').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Assignments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              مهامي
            </CardTitle>
            <CardDescription>
              قائمة بجميع المهام المخصصة لك
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {assignments.map((assignment) => (
                <Card key={assignment.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-elaraby-blue">#{assignment.id}</h4>
                        <p className="text-lg font-medium">{assignment.customerName}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getPriorityColor(assignment.priority)}>
                          أولوية {getPriorityText(assignment.priority)}
                        </Badge>
                        <Badge className={getStatusColor(assignment.status)}>
                          {getStatusText(assignment.status)}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2 text-sm">
                        <p><strong>الهاتف:</strong> {assignment.phone}</p>
                        <p><strong>العنوان:</strong> {assignment.address}</p>
                      </div>
                      <div className="space-y-2 text-sm">
                        <p><strong>نوع الجهاز:</strong> {assignment.deviceType}</p>
                        <p><strong>تاريخ التخصيص:</strong> {assignment.assignedDate}</p>
                      </div>
                    </div>
                    
                    {assignment.issueDescription && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-1">وصف المشكلة:</p>
                        <p className="text-sm bg-gray-100 p-3 rounded">
                          {assignment.issueDescription}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      <Link to={`/work-order/${assignment.id}`}>
                        <Button size="sm" className="bg-elaraby-blue hover:bg-elaraby-blue/90">
                          فتح نموذج العمل
                        </Button>
                      </Link>
                      {assignment.status === 'assigned' && (
                        <Button size="sm" variant="outline">
                          بدء العمل
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TechnicianDashboard;
