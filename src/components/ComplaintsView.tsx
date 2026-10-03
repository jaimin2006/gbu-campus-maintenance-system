import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  MapPin,
  Clock,
  CheckCircle2,
  ChevronRight,
  User,
  Wrench,
  Camera,
  FileText,
  Phone,
  Building,
  RotateCcw,
  Sparkles,
  X,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Complaint, ComplaintStatus, DepartmentType, PriorityLevel } from '../types';
import { gbuBuddhaStatueLibraryImg } from '../assets/images';

interface ComplaintsViewProps {
  onSelectComplaint: (id: string) => void;
  onOpenNewComplaint: () => void;
}

const LIFECYCLE_STEPS = [
  { num: 1, label: '1. Registered' },
  { num: 2, label: '2. Verified' },
  { num: 3, label: '3. Work Order' },
  { num: 4, label: '4. Assigned' },
  { num: 5, label: '5. Executed' },
  { num: 6, label: '6. Inspected' },
  { num: 7, label: '7. Closed' },
];

export const ComplaintsView: React.FC<ComplaintsViewProps> = ({
  onSelectComplaint,
  onOpenNewComplaint,
}) => {
  const { complaints, currentUser } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');

  // Compute 7-step lifecycle progress
  const getStepProgress = (c: Complaint) => {
    if (c.status === 'closed') return 7;
    if (c.status === 'resolved' || c.status === 'inspection') return 6;
    if (c.workOrder?.afterPhotoUrl || c.workOrder?.completedAt) return 5;
    if (c.workOrder?.technicianId) return 4;
    if (c.workOrder) return 3;
    if (c.status === 'verified') return 2;
    return 1;
  };

  // Filter complaints
  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      const matchesSearch =
        c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.location.building.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.location.room.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.registeredBy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.workOrder?.technicianName &&
          c.workOrder.technicianName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesDept = selectedDept === 'all' || c.department === selectedDept;
      const matchesStatus =
        selectedStatus === 'all'
          ? true
          : selectedStatus === 'active'
          ? c.status !== 'closed' && c.status !== 'rejected'
          : c.status === selectedStatus;
      const matchesPriority =
        selectedPriority === 'all' || c.priority === selectedPriority;

      return matchesSearch && matchesDept && matchesStatus && matchesPriority;
    });
  }, [complaints, searchQuery, selectedDept, selectedStatus, selectedPriority]);

  // Metric counts
  const totalCount = complaints.length;
  const activeCount = complaints.filter(
    (c) => c.status !== 'closed' && c.status !== 'rejected'
  ).length;
  const readyForConfirmCount = complaints.filter(
    (c) => c.status === 'resolved' || c.status === 'inspection'
  ).length;
  const closedCount = complaints.filter((c) => c.status === 'closed').length;

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedDept('all');
    setSelectedStatus('all');
    setSelectedPriority('all');
  };

  return (
    <div className="space-y-5">
      {/* Featured GBU Buddha Statue Photo Banner */}
      <div className="relative rounded-2xl overflow-hidden border border-[#ded6c9] dark:border-[#334440] bg-[#1e2825] text-white shadow-md">
        <div className="relative h-44 sm:h-52 w-full overflow-hidden">
          <img
            src={gbuBuddhaStatueLibraryImg}
            alt="GBU Central Library and Buddha Statue"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141c1a] via-[#141c1a]/60 to-transparent" />
          <div className="absolute inset-0 bg-[#2f3e3a]/25 mix-blend-multiply" />

          <div className="absolute bottom-0 inset-x-0 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#d9e6d3]/20 backdrop-blur-md text-[#f6f0e6] border border-[#d9e6d3]/30 text-[11px] font-semibold mb-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#d9e6d3] animate-pulse"></span>
                Gautam Buddha University
              </div>
              <div className="text-xl sm:text-2xl font-bold text-white drop-shadow-sm">
                Centralized Maintenance Operations
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onOpenNewComplaint}
                className="px-4 py-2 bg-[#d9e6d3] hover:bg-[#c5d4c2] text-[#141c1a] text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Register Complaint</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN: Resident/User Profile + Grievance Overview + Filters (4 cols) */}
        <aside className="lg:col-span-4 space-y-4">
          {/* Active Persona / Resident Card */}
          <div className="bg-white dark:bg-[#1e2825] p-5 rounded-2xl border border-[#ded6c9] dark:border-[#334440] shadow-xs space-y-3.5 transition-colors">
            <div className="flex items-center justify-between border-b border-[#ded6c9]/60 dark:border-[#334440] pb-2.5">
              <span className="text-xs font-bold text-[#2f3e3a] dark:text-[#f6f0e6] uppercase tracking-wider">
                Active Resident / User
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#d9e6d3] dark:bg-[#263330] text-[#141c1a] dark:text-[#d9e6d3] font-bold uppercase">
                {currentUser.role}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#5e7366] dark:text-[#a8bda3]">Name</span>
                <span className="font-bold text-[#2f3e3a] dark:text-[#f6f0e6]">
                  {currentUser.name}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#5e7366] dark:text-[#a8bda3]">Location</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {currentUser.roomOrOffice}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#5e7366] dark:text-[#a8bda3]">Contact</span>
                <span className="font-mono text-[#2f3e3a] dark:text-[#f6f0e6]">
                  {currentUser.phone}
                </span>
              </div>
            </div>

            <button
              onClick={onOpenNewComplaint}
              className="w-full mt-2 py-2.5 px-3 bg-[#d9e6d3] hover:bg-[#c5d4c2] dark:bg-[#263330] dark:hover:bg-[#334440] text-[#141c1a] dark:text-[#f6f0e6] text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-[#a8bda3]/40 dark:border-[#6f8a78]/40"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>+ New Maintenance Request</span>
            </button>
          </div>

          {/* MY GRIEVANCE OVERVIEW Card (Exactly matching screenshot) */}
          <div className="bg-white dark:bg-[#1e2825] p-5 rounded-2xl border border-[#ded6c9] dark:border-[#334440] shadow-xs space-y-3 transition-colors">
            <h3 className="text-xs font-bold text-[#2f3e3a] dark:text-[#f6f0e6] uppercase tracking-wider">
              MY GRIEVANCE OVERVIEW
            </h3>

            <div className="space-y-2">
              <div className="p-3 bg-[#f6f0e6]/60 dark:bg-[#141c1a]/60 rounded-xl border border-[#ded6c9]/60 dark:border-[#334440] flex items-center justify-between text-xs">
                <span className="font-medium text-[#2f3e3a] dark:text-[#f6f0e6]">
                  Total Registered
                </span>
                <span className="text-base font-bold font-mono text-[#2f3e3a] dark:text-[#f6f0e6]">
                  {totalCount}
                </span>
              </div>

              <div className="p-3 bg-blue-50/60 dark:bg-blue-950/20 rounded-xl border border-blue-200/60 dark:border-blue-900/40 flex items-center justify-between text-xs">
                <span className="font-medium text-blue-900 dark:text-blue-300">
                  In Active Progress
                </span>
                <span className="text-base font-bold font-mono text-blue-700 dark:text-blue-400">
                  {activeCount}
                </span>
              </div>

              <div className="p-3 bg-amber-50/60 dark:bg-amber-950/20 rounded-xl border border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between text-xs">
                <span className="font-medium text-amber-900 dark:text-amber-300">
                  Ready For Confirmation
                </span>
                <span className="text-base font-bold font-mono text-amber-700 dark:text-amber-400">
                  {readyForConfirmCount}
                </span>
              </div>

              <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/20 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40 flex items-center justify-between text-xs">
                <span className="font-medium text-emerald-900 dark:text-emerald-300">
                  Resolved & Closed
                </span>
                <span className="text-base font-bold font-mono text-emerald-700 dark:text-emerald-400">
                  {closedCount}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Filters Card */}
          <div className="bg-white dark:bg-[#1e2825] p-4 rounded-2xl border border-[#ded6c9] dark:border-[#334440] shadow-xs space-y-3 transition-colors text-xs">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#6f8a78]" />
              <input
                type="text"
                placeholder="Search complaints, rooms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-2 bg-[#f6f0e6]/60 dark:bg-[#141c1a] border border-[#ded6c9] dark:border-[#334440] text-[#24312e] dark:text-[#f6f0e6] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2f3e3a]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-[#88a391]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div>
              <span className="text-[11px] font-bold text-[#5e7366] dark:text-[#a8bda3] block mb-1.5">
                Department
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {['all', 'Civil', 'Electrical', 'Horticulture'].map((d) => (
                  <button
                    key={d}
                    onClick={() => setSelectedDept(d)}
                    className={`py-1.5 px-2 rounded-lg text-[11px] font-medium transition-colors cursor-pointer text-center truncate ${
                      selectedDept === d
                        ? 'bg-[#2f3e3a] text-white dark:bg-[#6f8a78] font-semibold'
                        : 'bg-[#f6f0e6] dark:bg-[#141c1a] text-[#5e7366] dark:text-[#a8bda3] hover:text-[#2f3e3a]'
                    }`}
                  >
                    {d === 'all' ? 'All Depts' : d}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[11px] font-bold text-[#5e7366] dark:text-[#a8bda3] block mb-1.5">
                Status Filter
              </span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 bg-[#f6f0e6] dark:bg-[#141c1a] border border-[#ded6c9] dark:border-[#334440] text-[#24312e] dark:text-[#f6f0e6] rounded-lg focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Pipeline</option>
                <option value="registered">1. Registered</option>
                <option value="verified">2. Verified</option>
                <option value="in_progress">3/4. Work Order / Assigned</option>
                <option value="inspection">6. Inspected</option>
                <option value="resolved">Resolved</option>
                <option value="closed">7. Closed</option>
                <option value="reopened">Reopened</option>
              </select>
            </div>
          </div>
        </aside>

        {/* RIGHT COLUMN: Complaint Cards in ROWS with 7-Step Horizontal Stepper (8 cols) */}
        <main className="lg:col-span-8 space-y-4">
          {/* Header Filter Summary */}
          <div className="flex items-center justify-between text-xs text-[#5e7366] dark:text-[#a8bda3] px-1">
            <div>
              Showing <strong className="text-[#2f3e3a] dark:text-[#f6f0e6]">{filteredComplaints.length}</strong> complaints
              {selectedDept !== 'all' && ` · ${selectedDept}`}
              {selectedStatus !== 'all' && ` · ${selectedStatus}`}
            </div>

            {(selectedDept !== 'all' || selectedStatus !== 'all' || searchQuery) && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-[#6f8a78] dark:text-[#d9e6d3] hover:underline font-semibold cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>

          {/* COMPLAINT ROW CARDS (EXACT ROW FORMAT FROM SCREENSHOT) */}
          <div className="space-y-4">
            {filteredComplaints.map((item) => {
              const currentStep = getStepProgress(item);

              // Priority formatting matching screenshot
              const isEmergency = item.priority === 'emergency';
              const isHigh = item.priority === 'high';

              return (
                <div
                  key={item.id}
                  onClick={() => onSelectComplaint(item.id)}
                  className="bg-white dark:bg-[#1e2825] rounded-2xl border border-[#ded6c9] dark:border-[#334440] p-5 hover:border-[#6f8a78] dark:hover:border-[#a8bda3] hover:shadow-md transition-all cursor-pointer space-y-3.5 group"
                >
                  {/* Row 1: Code Reference on Left + Priority & Status Badges on Right */}
                  <div className="flex flex-wrap items-center justify-between gap-2.5">
                    <div className="text-xs font-mono font-semibold text-blue-600 dark:text-blue-400">
                      {item.id} · <span className="text-[#2f3e3a] dark:text-[#f6f0e6]">{item.department} Maintenance</span> ·{' '}
                      <span className="text-[#5e7366] dark:text-[#a8bda3] font-normal">{item.category}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Priority pill */}
                      {isEmergency ? (
                        <span className="px-2.5 py-0.5 bg-rose-600 text-white rounded font-bold text-[11px] shadow-xs">
                          Emergency Priority
                        </span>
                      ) : isHigh ? (
                        <span className="px-2.5 py-0.5 bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800 rounded font-bold text-[11px]">
                          High Priority
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 bg-[#f6f0e6] dark:bg-[#141c1a] text-[#5e7366] dark:text-[#a8bda3] border border-[#ded6c9] dark:border-[#334440] rounded text-[11px] capitalize">
                          {item.priority} Priority
                        </span>
                      )}

                      {/* Status badge */}
                      <span className="px-2.5 py-0.5 rounded border border-[#ded6c9] dark:border-[#334440] text-[11px] font-semibold text-[#2f3e3a] dark:text-[#f6f0e6] bg-[#f6f0e6]/50 dark:bg-[#141c1a]/50">
                        {item.status === 'in_progress'
                          ? 'Work Order Created'
                          : item.status === 'verified'
                          ? 'Verified'
                          : item.status === 'inspection'
                          ? 'Ready For Inspection'
                          : item.status === 'resolved'
                          ? 'Resolved'
                          : item.status === 'closed'
                          ? 'Closed'
                          : 'Registered'}
                      </span>
                    </div>
                  </div>

                  {/* Row 2: Big Bold Title */}
                  <h2 className="text-base sm:text-lg font-bold text-[#2f3e3a] dark:text-[#f6f0e6] group-hover:text-[#6f8a78] dark:group-hover:text-[#d9e6d3] transition-colors leading-snug">
                    {item.title}
                  </h2>

                  {/* Row 3: Description Paragraph */}
                  <p className="text-xs text-[#5e7366] dark:text-[#a8bda3] leading-relaxed line-clamp-2">
                    {item.description}
                  </p>

                  {/* Row 4: Location, SLA Target, Assigned Tech */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-[#5e7366] dark:text-[#a8bda3] pt-1">
                    <div className="flex items-center gap-1.5 font-medium text-[#2f3e3a] dark:text-[#f6f0e6]">
                      <MapPin className="w-3.5 h-3.5 text-[#6f8a78]" />
                      <span>
                        {item.location.building} · {item.location.floor} · {item.location.room}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 font-mono">
                      <Clock className="w-3.5 h-3.5 text-[#6f8a78]" />
                      <span>SLA Target: {item.slaTargetHours}h Max</span>
                    </div>

                    {item.workOrder?.technicianName && (
                      <div className="font-semibold text-blue-600 dark:text-blue-400">
                        Tech: {item.workOrder.technicianName}
                      </div>
                    )}
                  </div>

                  {/* Row 5: 7-STEP HORIZONTAL LIFECYCLE PROGRESS STEPPER (EXACT AS SCREENSHOT) */}
                  <div className="pt-2">
                    <div className="grid grid-cols-7 text-[10px] sm:text-xs font-semibold pb-1.5">
                      {LIFECYCLE_STEPS.map((step) => {
                        const isDone = step.num <= currentStep;
                        return (
                          <div
                            key={step.num}
                            className={`text-center transition-colors truncate px-0.5 ${
                              isDone
                                ? 'text-blue-600 dark:text-blue-400 font-bold'
                                : 'text-[#5e7366]/40 dark:text-[#a8bda3]/30 font-medium'
                            }`}
                          >
                            {step.label}
                          </div>
                        );
                      })}
                    </div>

                    {/* Horizontal Progress Bar */}
                    <div className="w-full h-1 bg-[#f6f0e6] dark:bg-[#141c1a] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 dark:bg-blue-400 rounded-full transition-all duration-500"
                        style={{ width: `${(currentStep / 7) * 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Row 6: Filer info on Left + "View Work Order" button on Right */}
                  <div className="pt-3 border-t border-[#ded6c9]/60 dark:border-[#334440] flex items-center justify-between text-xs text-[#5e7366] dark:text-[#a8bda3]">
                    <div>
                      Logged by{' '}
                      <span className="font-semibold text-[#2f3e3a] dark:text-[#f6f0e6]">
                        {item.registeredBy.name}
                      </span>{' '}
                      on {new Date(item.createdAt).toLocaleDateString()}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectComplaint(item.id);
                      }}
                      className="px-3.5 py-1.5 rounded-lg border border-[#ded6c9] dark:border-[#334440] bg-[#f6f0e6]/50 dark:bg-[#141c1a]/50 hover:bg-[#2f3e3a] hover:text-white dark:hover:bg-[#6f8a78] font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View Work Order</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredComplaints.length === 0 && (
              <div className="bg-white dark:bg-[#1e2825] p-12 rounded-2xl border border-[#ded6c9] dark:border-[#334440] text-center text-xs text-[#5e7366] dark:text-[#a8bda3] space-y-2">
                <p>No complaints match your filters.</p>
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-[#2f3e3a] dark:text-[#d9e6d3] font-bold hover:underline cursor-pointer"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
