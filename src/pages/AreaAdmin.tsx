import React from 'react';
import { Routes, Route } from 'react-router-dom';
import AdminLayout from '@/components/admin-dashboard/AdminLayout';
import AdminDashboard from '@/components/admin-dashboard/AdminDashboard';
import PatientsTab from '@/components/admin-dashboard/PatientsTab';

const AreaAdmin: React.FC = () => {
  return (
    <Routes>
      <Route path="/*" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="patients" element={<PatientsTab />} />
        <Route path="doctors" element={<AdminDashboard />} />
        <Route path="reports" element={<div className="p-6"><h1 className="text-2xl font-bold">Relatórios</h1><p className="text-gray-600">Em desenvolvimento...</p></div>} />
        <Route path="settings" element={<div className="p-6"><h1 className="text-2xl font-bold">Configurações</h1><p className="text-gray-600">Em desenvolvimento...</p></div>} />
      </Route>
    </Routes>
  );
};

export default AreaAdmin;
