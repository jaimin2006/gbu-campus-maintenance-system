import React, { useState } from 'react';
import {
  Wrench,
  User,
  Clock,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  ChevronRight,
  Filter,
  Package,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DepartmentIndicator, PriorityIndicator, StatusIndicator } from './StatusBadges';
import { DepartmentType } from '../types';

interface WorkOrdersViewProps {
  onSelectComplaint: (id: string) => void;
}

export const WorkOrdersView: React.FC<WorkOrdersViewProps> = ({ onSelectComplaint }) => {
  const { complaints, technicians, currentUser } = useApp();

  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [techFilter, setTechFilter] = useState<string>('all');

  // Collect all complaints that have an active work order
  const workOrdersList = complaints
    .filter((c) => !!c.workOrder)
    .map((c) => ({
      ...c.workOrder!,
      complaint: c,
    }))
    .filter((wo) => {
      const matchDept = deptFilter === 'all' || wo.department === deptFilter;
      const matchTech = techFilter === 'all' || wo.technicianId === techFilter;
      return matchDept && matchTech;
    });

  return (
    <div className="space-y-6">
      {/* Technician Roster Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#2f3e3a] dark:text-[#f6f0e6] flex items-center gap-2">
            <Wrench className="w-4 h-4 text-[#6f8a78] dark:text-[#d9e6d3]" />
            <span>Technician Workforce & Deployment Roster (M07)</span>
          </h2>
          <span className="text-xs text-[#5e7366] dark:text-[#a8bda3]">
            {technicians.length} active technicians on duty
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {technicians.map((tech) => (
            <div
              key={tech.id}
              className={`p-3.5 rounded-xl border bg-white dark:bg-[#1e2825] transition-all shadow-xs ${
                tech.activeWorkload >= 3
                  ? 'border-amber-300 dark:border-amber-700 bg-amber-50/30 dark:bg-amber-950/20'
                  : 'border-[#ded6c9] dark:border-[#334440]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <DepartmentIndicator department={tech.department} />
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                    tech.activeWorkload === 0
                      ? 'bg-[#f6f0e6] dark:bg-[#141c1a] text-[#5e7366] dark:text-[#a8bda3]'
                      : tech.activeWorkload >= 3
                      ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300'
                      : 'bg-[#d9e6d3] dark:bg-[#263330] text-[#141c1a] dark:text-[#d9e6d3]'
                  }`}
                >
                  {tech.activeWorkload} Active {tech.activeWorkload === 1 ? 'Job' : 'Jobs'}
                </span>
              </div>

              <div className="font-bold text-xs text-[#2f3e3a] dark:text-[#f6f0e6]">{tech.name}</div>
              <div className="text-[11px] text-[#5e7366] dark:text-[#a8bda3] font-mono mt-0.5">{tech.phone}</div>

              <div className="mt-2.5 flex flex-wrap gap-1">
                {tech.skills.slice(0, 3).map((sk) => (
                  <span
                    key={sk}
                    className="text-[10px] bg-[#f6f0e6] dark:bg-[#141c1a] text-[#5e7366] dark:text-[#a8bda3] px-1.5 py-0.5 rounded"
                  >
                    {sk}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white dark:bg-[#1e2825] p-4 rounded-xl border border-[#ded6c9] dark:border-[#334440] shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs transition-colors">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[#5e7366] dark:text-[#a8bda3]">
            <Filter className="w-3.5 h-3.5" />
            <span className="font-medium">Department:</span>
          </div>
          <div className="flex items-center gap-1 bg-[#f6f0e6] dark:bg-[#141c1a] p-0.5 rounded-lg">
            {['all', 'Civil', 'Electrical', 'Horticulture'].map((d) => (
              <button
                key={d}
                onClick={() => setDeptFilter(d)}
                className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                  deptFilter === d
                    ? 'bg-[#2f3e3a] text-white dark:bg-[#6f8a78] font-semibold shadow-xs'
                    : 'text-[#5e7366] dark:text-[#a8bda3] hover:text-[#2f3e3a]'
                }`}
              >
                {d === 'all' ? 'All Departments' : d}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[#6f8a78] dark:text-[#a8bda3]">Technician:</span>
          <select
            value={techFilter}
            onChange={(e) => setTechFilter(e.target.value)}
            className="text-xs px-2.5 py-1 bg-[#f6f0e6]/70 dark:bg-[#141c1a] border border-[#ded6c9] dark:border-[#334440] text-[#24312e] dark:text-[#f6f0e6] rounded-lg focus:outline-none"
          >
            <option value="all">All Technicians</option>
            {technicians.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} ({t.department})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Work Orders Table */}
      <div className="bg-white dark:bg-[#1e2825] rounded-xl border border-[#ded6c9] dark:border-[#334440] shadow-xs overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f6f0e6]/70 dark:bg-[#141c1a]/70 border-b border-[#ded6c9] dark:border-[#334440] text-[#5e7366] dark:text-[#a8bda3] font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Work Order ID</th>
                <th className="py-3 px-4">Complaint Reference</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Assigned Technician</th>
                <th className="py-3 px-4">Material Requisition</th>
                <th className="py-3 px-4">Photographic Evidence</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ded6c9]/60 dark:divide-[#334440]">
              {workOrdersList.map((wo) => (
                <tr
                  key={wo.id}
                  onClick={() => onSelectComplaint(wo.complaint.id)}
                  className="hover:bg-[#f6f0e6]/40 dark:hover:bg-[#263330]/70 transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 px-4 font-mono font-bold text-[#2f3e3a] dark:text-[#f6f0e6] whitespace-nowrap">
                    {wo.id}
                  </td>

                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="font-semibold text-[#2f3e3a] dark:text-[#f6f0e6] group-hover:text-[#6f8a78] dark:group-hover:text-[#d9e6d3] transition-colors line-clamp-1">
                      {wo.complaint.title}
                    </div>
                    <div className="text-[11px] text-[#5e7366] dark:text-[#a8bda3] font-mono mt-0.5">
                      {wo.complaint.id} · <PriorityIndicator priority={wo.complaint.priority} />
                    </div>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="text-[#2f3e3a] dark:text-[#f6f0e6] font-medium">
                      {wo.complaint.location.building}
                    </div>
                    <div className="text-[11px] text-[#5e7366] dark:text-[#a8bda3]">
                      {wo.complaint.location.room}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="font-medium text-[#2f3e3a] dark:text-[#f6f0e6]">{wo.technicianName}</div>
                    <div className="text-[11px] text-[#5e7366] dark:text-[#a8bda3] font-mono">
                      {wo.technicianPhone}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {wo.materials && wo.materials.length > 0 ? (
                      <span className="inline-flex items-center gap-1.5 text-xs text-[#2f3e3a] dark:text-[#f6f0e6]">
                        <Package className="w-3.5 h-3.5 text-[#6f8a78]" />
                        <span>{wo.materials.length} item(s) requested</span>
                      </span>
                    ) : (
                      <span className="text-[#88a391] text-xs">No store parts</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                          wo.beforePhotoUrl
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                            : 'bg-[#f6f0e6] dark:bg-[#141c1a] text-[#5e7366] dark:text-[#a8bda3]'
                        }`}
                      >
                        Before: {wo.beforePhotoUrl ? 'Yes' : 'No'}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                          wo.afterPhotoUrl
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                            : 'bg-[#f6f0e6] dark:bg-[#141c1a] text-[#5e7366] dark:text-[#a8bda3]'
                        }`}
                      >
                        After: {wo.afterPhotoUrl ? 'Yes' : 'No'}
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <StatusIndicator status={wo.complaint.status} />
                  </td>

                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectComplaint(wo.complaint.id);
                      }}
                      className="p-1.5 text-[#6f8a78] hover:text-[#2f3e3a] dark:hover:text-[#f6f0e6] hover:bg-[#f6f0e6] dark:hover:bg-[#263330] rounded transition-colors inline-flex items-center cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}

              {workOrdersList.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#6f8a78]">
                    No active work orders found matching the filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
