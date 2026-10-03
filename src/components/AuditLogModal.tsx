import React, { useState } from 'react';
import { X, Shield, Search, Filter, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface AuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuditLogModal: React.FC<AuditLogModalProps> = ({ isOpen, onClose }) => {
  const { auditLogs } = useApp();
  const [filterQuery, setFilterQuery] = useState('');

  if (!isOpen) return null;

  const filteredLogs = auditLogs.filter(
    (log) =>
      log.action.toLowerCase().includes(filterQuery.toLowerCase()) ||
      log.actorName.toLowerCase().includes(filterQuery.toLowerCase()) ||
      log.entityId.toLowerCase().includes(filterQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl bg-white dark:bg-[#1e2825] rounded-xl shadow-2xl border border-[#ded6c9] dark:border-[#334440] overflow-hidden flex flex-col max-h-[85vh] text-[#2f3e3a] dark:text-[#f6f0e6] transition-colors">
        {/* Header */}
        <div className="p-4 border-b border-[#ded6c9] dark:border-[#334440] flex items-center justify-between bg-[#f6f0e6]/70 dark:bg-[#263330]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2f3e3a] text-[#f6f0e6] flex items-center justify-center">
              <Shield className="w-4 h-4 text-[#d9e6d3]" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#2f3e3a] dark:text-[#f6f0e6]">
                System Transaction Audit Trail (FR-32)
              </h2>
              <p className="text-[11px] text-[#5e7366] dark:text-[#a8bda3]">
                Cryptographic immutable transaction trail for maintenance operations
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#6f8a78] hover:text-[#2f3e3a] dark:hover:text-[#f6f0e6] rounded-lg hover:bg-[#ded6c9]/60 dark:hover:bg-[#141c1a] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter bar */}
        <div className="p-3 border-b border-[#ded6c9] dark:border-[#334440] bg-white dark:bg-[#1e2825]">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#6f8a78]" />
            <input
              type="text"
              placeholder="Search audit trail by actor, action or ID..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-1.5 bg-[#f6f0e6]/50 dark:bg-[#180f17] border border-[#ded6c9] dark:border-[#334440] rounded-lg text-[#2f3e3a] dark:text-[#f6f0e6] focus:outline-none focus:ring-1 focus:ring-[#2f3e3a] dark:focus:ring-[#d9e6d3]"
            />
          </div>
        </div>

        {/* Logs List */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#ded6c9]/60 dark:divide-[#334440] p-4">
          {filteredLogs.map((log) => (
            <div key={log.id} className="py-2.5 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-[#2f3e3a] dark:text-[#f6f0e6] bg-[#ded6c9] dark:bg-[#141c1a] px-2 py-0.5 rounded text-[11px]">
                    {log.action}
                  </span>
                  <span className="text-[#2f3e3a] dark:text-[#f6f0e6] font-semibold">{log.actorName}</span>
                  <span className="text-[#6f8a78] text-[11px]">({log.actorRole})</span>
                </div>
                <span className="font-mono text-[11px] text-[#6f8a78]">
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
              <div className="text-xs text-[#5e7366] dark:text-[#a8bda3] pl-2 border-l-2 border-[#6f8a78]">
                <span className="font-mono text-[#2f3e3a] dark:text-[#d9e6d3] font-medium mr-1.5">
                  [{log.entityType}: {log.entityId}]
                </span>
                {log.details}
              </div>
            </div>
          ))}

          {filteredLogs.length === 0 && (
            <div className="py-12 text-center text-xs text-[#6f8a78]">
              No audit records found matching query.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#f6f0e6]/60 dark:bg-[#263330] border-t border-[#ded6c9] dark:border-[#334440] flex items-center justify-between text-xs text-[#5e7366] dark:text-[#a8bda3]">
          <span>{filteredLogs.length} verified operations recorded</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-[#2f3e3a] hover:bg-[#334440] text-white rounded text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
