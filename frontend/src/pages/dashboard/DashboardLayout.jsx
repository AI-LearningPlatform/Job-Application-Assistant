import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/dashboard/Sidebar';

const DashboardLayout = () => {
  return (
    <div className="pt-16 flex min-h-screen bg-dark-900">
      <Sidebar />
      <div className="flex-1 overflow-auto p-8">
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;
