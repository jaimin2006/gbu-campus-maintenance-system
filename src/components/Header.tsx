import React from 'react';
import { Plus, Bell, Shield, Sun, Moon } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { gbuSealImg } from '../assets/images';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenNewComplaint: () => void;
  onOpenNotifications: () => void;
  onOpenAuditLog: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewComplaint,
  onOpenNotifications,
  onOpenAuditLog,
}) => {
  const { unreadNotificationCount, theme, toggleTheme } = useApp();

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-[#1e2825] border-b border-[#ded6c9] dark:border-[#334440] transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('complaints')}
              className="flex items-center text-left focus:outline-none cursor-pointer"
            >
              <div>
                <span className="text-xl font-extrabold tracking-tight text-[#2f3e3a] dark:text-[#f6f0e6] leading-none">
                  GBU-CMS
                </span>
                <span className="hidden sm:inline-block ml-2 text-xs text-[#5e7366] dark:text-[#a8bda3] font-normal">
                  Centralized Maintenance Platform
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: 4-6 clean text navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#5e7366] dark:text-[#a8bda3]">
            <button
              onClick={() => setActiveTab('complaints')}
              className={`hover:text-[#2f3e3a] dark:hover:text-[#f6f0e6] transition-colors py-1 ${
                activeTab === 'complaints'
                  ? 'text-[#2f3e3a] dark:text-[#f6f0e6] font-semibold border-b-2 border-[#2f3e3a] dark:border-[#d9e6d3]'
                  : ''
              }`}
            >
              Complaints
            </button>
            <button
              onClick={() => setActiveTab('workorders')}
              className={`hover:text-[#2f3e3a] dark:hover:text-[#f6f0e6] transition-colors py-1 ${
                activeTab === 'workorders'
                  ? 'text-[#2f3e3a] dark:text-[#f6f0e6] font-semibold border-b-2 border-[#2f3e3a] dark:border-[#d9e6d3]'
                  : ''
              }`}
            >
              Work Orders
            </button>
            <button
              onClick={() => setActiveTab('inventory')}
              className={`hover:text-[#2f3e3a] dark:hover:text-[#f6f0e6] transition-colors py-1 ${
                activeTab === 'inventory'
                  ? 'text-[#2f3e3a] dark:text-[#f6f0e6] font-semibold border-b-2 border-[#2f3e3a] dark:border-[#d9e6d3]'
                  : ''
              }`}
            >
              Store & Inventory
            </button>
            <button
              onClick={() => setActiveTab('locations')}
              className={`hover:text-[#2f3e3a] dark:hover:text-[#f6f0e6] transition-colors py-1 ${
                activeTab === 'locations'
                  ? 'text-[#2f3e3a] dark:text-[#f6f0e6] font-semibold border-b-2 border-[#2f3e3a] dark:border-[#d9e6d3]'
                  : ''
              }`}
            >
              Campus Master
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`hover:text-[#2f3e3a] dark:hover:text-[#f6f0e6] transition-colors py-1 ${
                activeTab === 'analytics'
                  ? 'text-[#2f3e3a] dark:text-[#f6f0e6] font-semibold border-b-2 border-[#2f3e3a] dark:border-[#d9e6d3]'
                  : ''
              }`}
            >
              Analytics & KPIs
            </button>
          </nav>

          {/* Zone 3: 1-2 primary actions */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Dark / Light Toggle Button */}
            <button
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              aria-label="Toggle Theme"
              className="p-2 text-[#5e7366] hover:text-[#2f3e3a] dark:text-[#a8bda3] dark:hover:text-[#f6f0e6] hover:bg-[#d9e6d3]/40 dark:hover:bg-[#263330] rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-[#d9e6d3]" />
              ) : (
                <Moon className="w-4 h-4 text-[#2f3e3a]" />
              )}
              <span className="hidden lg:inline capitalize">{theme} Mode</span>
            </button>

            <button
              onClick={onOpenAuditLog}
              title="View Audit Trail (FR-32)"
              className="p-2 text-[#5e7366] hover:text-[#2f3e3a] dark:text-[#a8bda3] dark:hover:text-[#f6f0e6] hover:bg-[#d9e6d3]/40 dark:hover:bg-[#263330] rounded-lg transition-colors flex items-center gap-1.5 text-xs"
            >
              <Shield className="w-4 h-4" />
              <span className="hidden xl:inline">Audit Log</span>
            </button>

            <button
              onClick={onOpenNotifications}
              title="Notifications"
              className="relative p-2 text-[#5e7366] hover:text-[#2f3e3a] dark:text-[#a8bda3] dark:hover:text-[#f6f0e6] hover:bg-[#d9e6d3]/40 dark:hover:bg-[#263330] rounded-lg transition-colors"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#6f8a78] dark:bg-[#d9e6d3] ring-2 ring-white dark:ring-[#1e2825]"></span>
              )}
            </button>

            <button
              onClick={onOpenNewComplaint}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#2f3e3a] hover:bg-[#212c29] dark:bg-[#6f8a78] dark:hover:bg-[#556c65] rounded-lg transition-colors shadow-sm whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Register Complaint</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
