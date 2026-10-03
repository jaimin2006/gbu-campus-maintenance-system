import React from 'react';
import { User, ShieldCheck, Wrench, Package, Award, Sparkles, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';

export const RoleSwitcherBar: React.FC = () => {
  const { currentUser, switchRole, resetDemoData } = useApp();

  const roles: {
    role: UserRole;
    label: string;
    person: string;
    icon: React.ReactNode;
    desc: string;
  }[] = [
    {
      role: 'student',
      label: 'Student / Resident',
      person: 'Ananya Sharma (Room 314)',
      icon: <User className="w-3.5 h-3.5" />,
      desc: 'Register complaints, track lifecycle, confirm & give feedback, reopen',
    },
    {
      role: 'officer',
      label: 'Maintenance Officer',
      person: 'Er. Rajesh Verma',
      icon: <ShieldCheck className="w-3.5 h-3.5" />,
      desc: 'Verify & classify, set SLA priority, create work orders, inspect & approve',
    },
    {
      role: 'technician',
      label: 'Technician',
      person: 'Mukesh Kumar',
      icon: <Wrench className="w-3.5 h-3.5" />,
      desc: 'View jobs, start work, upload before/after photos, request parts, complete',
    },
    {
      role: 'store',
      label: 'Store Officer',
      person: 'Dinesh Rawat',
      icon: <Package className="w-3.5 h-3.5" />,
      desc: 'Approve & issue materials against Work Orders, monitor low stock, restock',
    },
    {
      role: 'admin',
      label: 'University Authority',
      person: 'Prof. V.K. Singh',
      icon: <Award className="w-3.5 h-3.5" />,
      desc: 'Campus-wide KPIs, department analytics, audit trail & master records',
    },
  ];

  return (
    <div className="bg-[#2f3e3a] dark:bg-[#141c1a] text-[#f6f0e6] border-b border-[#212c29] dark:border-[#263330] text-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
          {/* Active persona descriptor */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[#d9e6d3] font-medium">Testing Persona:</span>
            <div className="flex items-center gap-1.5 bg-[#1e2825] px-2.5 py-1 rounded border border-[#6f8a78]/40 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#d9e6d3] animate-pulse"></span>
              <span className="font-semibold text-white">{currentUser.name}</span>
              <span className="text-[#a8bda3]">({currentUser.role.toUpperCase()})</span>
            </div>
            <span className="hidden xl:inline text-[#a8bda3]">
              · {currentUser.roomOrOffice}
            </span>
          </div>

          {/* Persona selector tabs */}
          <div className="flex items-center gap-1 flex-wrap">
            {roles.map((item) => {
              const isActive = currentUser.role === item.role;
              return (
                <button
                  key={item.role}
                  onClick={() => switchRole(item.role)}
                  title={item.desc}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-[#d9e6d3] text-[#141c1a] font-bold shadow-xs'
                      : 'text-[#f6f0e6] hover:text-white hover:bg-[#3f524d]'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}

            <button
              onClick={resetDemoData}
              title="Reset Demo Data"
              className="ml-2 px-2 py-1 text-[#d9e6d3] hover:text-white hover:bg-[#3f524d] rounded transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
