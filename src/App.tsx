import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { RoleSwitcherBar } from './components/RoleSwitcherBar';
import { ComplaintsView } from './components/ComplaintsView';
import { WorkOrdersView } from './components/WorkOrdersView';
import { InventoryView } from './components/InventoryView';
import { MasterDataView } from './components/MasterDataView';
import { DashboardAnalyticsView } from './components/DashboardAnalyticsView';
import { ComplaintDetailModal } from './components/ComplaintDetailModal';
import { NewComplaintModal } from './components/NewComplaintModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { AuditLogModal } from './components/AuditLogModal';
import { Shield, Sparkles, CheckCircle2 } from 'lucide-react';

const AppContent: React.FC = () => {
  const { theme } = useApp();
  const [activeTab, setActiveTab] = useState<string>('complaints');
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(null);
  const [isNewComplaintOpen, setIsNewComplaintOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAuditLogOpen, setIsAuditLogOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleComplaintCreated = (id: string) => {
    setSelectedComplaintId(id);
    showToast(`Complaint ${id} registered successfully!`);
  };

  return (
    <div
      className={`min-h-screen ${theme === 'dark' ? 'dark' : ''} bg-[#f6f0e6] dark:bg-[#141c1a] flex flex-col text-[#24312e] dark:text-[#f6f0e6] transition-colors`}
      data-theme={theme}
    >
      {/* Role Switcher Banner */}
      <RoleSwitcherBar />

      {/* Main Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewComplaint={() => setIsNewComplaintOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenAuditLog={() => setIsAuditLogOpen(true)}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#381f33] dark:bg-[#593951] text-[#eeecf3] text-xs px-4 py-3 rounded-xl shadow-xl border border-[#a0849d]/40 flex items-center gap-2 transition-all">
          <CheckCircle2 className="w-4 h-4 text-[#d3b3b8] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'complaints' && (
          <ComplaintsView
            onSelectComplaint={(id) => setSelectedComplaintId(id)}
            onOpenNewComplaint={() => setIsNewComplaintOpen(true)}
          />
        )}

        {activeTab === 'workorders' && (
          <WorkOrdersView
            onSelectComplaint={(id) => setSelectedComplaintId(id)}
          />
        )}

        {activeTab === 'inventory' && <InventoryView />}

        {activeTab === 'locations' && <MasterDataView />}

        {activeTab === 'analytics' && <DashboardAnalyticsView />}
      </main>

      {/* Modals & Drawers */}
      <ComplaintDetailModal
        complaintId={selectedComplaintId}
        onClose={() => setSelectedComplaintId(null)}
      />

      <NewComplaintModal
        isOpen={isNewComplaintOpen}
        onClose={() => setIsNewComplaintOpen(false)}
        onComplaintCreated={handleComplaintCreated}
      />

      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onSelectComplaint={(id) => setSelectedComplaintId(id)}
      />

      <AuditLogModal
        isOpen={isAuditLogOpen}
        onClose={() => setIsAuditLogOpen(false)}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-[#ded6c9] dark:border-[#334440] bg-white dark:bg-[#1e2825] py-6 text-xs text-[#5e7366] dark:text-[#a8bda3] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#2f3e3a] dark:text-[#f6f0e6]">GBU-CMS</span>
            <span>· Gautam Buddha University Centralized Maintenance Platform</span>
          </div>
          <div className="flex items-center gap-4 text-[#6f8a78] dark:text-[#a8bda3]">
            <span>Greater Noida, Gautam Budh Nagar, UP</span>
            <span>·</span>
            <span>Software Requirements Specification v1.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
