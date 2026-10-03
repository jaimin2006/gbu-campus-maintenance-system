import React from 'react';
import { X, Bell, Check, Clock, AlertTriangle, ShieldCheck, Wrench, Info } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectComplaint: (id: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  onSelectComplaint,
}) => {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    unreadNotificationCount,
  } = useApp();

  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'assignment':
        return <Wrench className="w-4 h-4 text-[#6f8a78]" />;
      case 'completion':
        return <Check className="w-4 h-4 text-emerald-500" />;
      case 'approval':
        return <ShieldCheck className="w-4 h-4 text-[#2f3e3a] dark:text-[#d9e6d3]" />;
      case 'sla':
        return <AlertTriangle className="w-4 h-4 text-rose-500" />;
      default:
        return <Info className="w-4 h-4 text-[#5e7366] dark:text-[#a8bda3]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/50 backdrop-blur-xs">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-[#1e2825] shadow-2xl border-l border-[#ded6c9] dark:border-[#334440] flex flex-col text-[#2f3e3a] dark:text-[#f6f0e6] transition-colors">
          {/* Header */}
          <div className="p-4 border-b border-[#ded6c9] dark:border-[#334440] flex items-center justify-between bg-[#f6f0e6]/70 dark:bg-[#263330]">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#2f3e3a] dark:text-[#d9e6d3]" />
              <h2 className="text-sm font-bold text-[#2f3e3a] dark:text-[#f6f0e6]">System Notifications</h2>
              {unreadNotificationCount > 0 && (
                <span className="text-[10px] font-mono px-2 py-0.5 bg-[#d9e6d3] text-[#1e2825] font-bold rounded-full">
                  {unreadNotificationCount} New
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadNotificationCount > 0 && (
                <button
                  onClick={markAllNotificationsAsRead}
                  className="text-xs text-[#5e7366] hover:text-[#2f3e3a] dark:text-[#a8bda3] dark:hover:text-[#f6f0e6] transition-colors"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1 text-[#6f8a78] hover:text-[#2f3e3a] dark:hover:text-[#f6f0e6] rounded-lg hover:bg-[#ded6c9]/60 dark:hover:bg-[#141c1a]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#ded6c9]/60 dark:divide-[#334440] p-2">
            {notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  markNotificationAsRead(item.id);
                  if (item.complaintId) {
                    onSelectComplaint(item.complaintId);
                    onClose();
                  }
                }}
                className={`p-3.5 rounded-lg transition-colors cursor-pointer space-y-1 ${
                  item.read
                    ? 'bg-transparent hover:bg-[#f6f0e6]/50 dark:hover:bg-[#263330]'
                    : 'bg-[#f6f0e6]/70 hover:bg-[#f6f0e6] dark:bg-[#141c1a]/60 dark:hover:bg-[#141c1a] border border-[#ded6c9] dark:border-[#2f3e3a]'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 shrink-0">{getIcon(item.type)}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-[#2f3e3a] dark:text-[#f6f0e6]">
                        {item.title}
                      </span>
                      <span className="text-[10px] text-[#6f8a78] font-mono">
                        {new Date(item.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-[#5e7366] dark:text-[#a8bda3] mt-0.5 leading-relaxed">
                      {item.message}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {notifications.length === 0 && (
              <div className="py-12 text-center text-xs text-[#6f8a78]">
                No notifications to display.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
