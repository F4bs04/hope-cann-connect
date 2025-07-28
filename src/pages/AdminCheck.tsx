import React from 'react';
import AdminUserChecker from '@/components/admin/AdminUserChecker';

const AdminCheck: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔧 Verificação de Sistema - HopeCann
          </h1>
          <p className="text-gray-600">
            Ferramenta para verificar e gerenciar usuários administradores
          </p>
        </div>
        
        <AdminUserChecker />
      </div>
    </div>
  );
};

export default AdminCheck;
