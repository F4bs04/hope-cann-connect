import React from 'react';
import { Outlet } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Shield, 
  Users, 
  UserCheck, 
  BarChart3, 
  Settings, 
  LogOut,
  Home
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const AdminLayout: React.FC = () => {
  const location = useLocation();

  const navigationItems = [
    {
      icon: Home,
      label: 'Dashboard',
      path: '/admin',
      active: location.pathname === '/admin'
    },
    {
      icon: Users,
      label: 'Pacientes',
      path: '/admin/patients',
      active: location.pathname === '/admin/patients'
    },
    {
      icon: UserCheck,
      label: 'Médicos',
      path: '/admin/doctors',
      active: location.pathname === '/admin/doctors'
    },
    {
      icon: BarChart3,
      label: 'Relatórios',
      path: '/admin/reports',
      active: location.pathname === '/admin/reports'
    },
    {
      icon: Settings,
      label: 'Configurações',
      path: '/admin/settings',
      active: location.pathname === '/admin/settings'
    }
  ];

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <img 
                  src="/uploads/Logo.png" 
                  alt="HopeCann" 
                  className="h-8 w-auto"
                />
                <div>
                  <h1 className="text-xl font-bold text-hopecann-teal">HopeCann</h1>
                  <p className="text-xs text-gray-500">Painel Administrativo</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-hopecann-teal" />
                <span className="text-sm font-medium">Administrador</span>
              </div>
              <Avatar>
                <AvatarImage src="" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0">
            <Card>
              <CardContent className="p-0">
                <nav className="space-y-1 p-4">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          item.active
                            ? 'bg-hopecann-teal text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
