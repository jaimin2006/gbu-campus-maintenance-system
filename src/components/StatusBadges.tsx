import React from 'react';
import { ComplaintStatus, PriorityLevel, DepartmentType } from '../types';
import { AlertTriangle, Clock, CheckCircle2, RefreshCw, XCircle } from 'lucide-react';

export const StatusIndicator: React.FC<{ status: ComplaintStatus }> = ({ status }) => {
  switch (status) {
    case 'registered':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-400">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          Pending Verification
        </span>
      );
    case 'verified':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          Verified · Awaiting WO
        </span>
      );
    case 'in_progress':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2f3e3a] dark:text-[#d9e6d3]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#6f8a78] dark:bg-[#d9e6d3] animate-pulse"></span>
          Work In Progress
        </span>
      );
    case 'inspection':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-700 dark:text-teal-300">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
          Pending Inspection
        </span>
      );
    case 'rework':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-700 dark:text-rose-400">
          <RefreshCw className="w-3 h-3 text-rose-600 dark:text-rose-400 animate-spin" />
          Rework Required
        </span>
      );
    case 'resolved':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          Resolved · Awaiting Feedback
        </span>
      );
    case 'closed':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#5e7366] dark:text-[#a8bda3]">
          <CheckCircle2 className="w-3 h-3 text-[#6f8a78] dark:text-[#a8bda3]" />
          Closed & Confirmed
        </span>
      );
    case 'reopened':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-700 dark:text-rose-400">
          <AlertTriangle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
          Reopened
        </span>
      );
    case 'rejected':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 dark:text-slate-500">
          <XCircle className="w-3 h-3 text-slate-400" />
          Rejected / Invalid
        </span>
      );
    default:
      return <span className="text-xs text-slate-500 dark:text-slate-400">{status}</span>;
  }
};

export const PriorityIndicator: React.FC<{ priority: PriorityLevel }> = ({ priority }) => {
  switch (priority) {
    case 'emergency':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 dark:text-rose-400">
          <AlertTriangle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
          <span>Emergency (6h)</span>
        </span>
      );
    case 'high':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 dark:text-amber-400">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          <span>High (24h)</span>
        </span>
      );
    case 'medium':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-[#5e7366] dark:text-[#a8bda3]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#6f8a78]"></span>
          <span>Medium (48h)</span>
        </span>
      );
    case 'low':
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-[#88a391] dark:text-[#a8bda3]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#a8bda3]"></span>
          <span>Low (72h)</span>
        </span>
      );
    default:
      return <span className="text-xs text-slate-500 dark:text-slate-400">{priority}</span>;
  }
};

export const DepartmentIndicator: React.FC<{ department: DepartmentType }> = ({ department }) => {
  const deptColors = {
    Civil:
      'text-amber-900 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900',
    Electrical:
      'text-[#2f3e3a] bg-[#d9e6d3]/60 border-[#a8bda3]/50 dark:bg-[#263330] dark:text-[#f6f0e6] dark:border-[#6f8a78]/50',
    Horticulture:
      'text-emerald-900 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900',
  };

  return (
    <span
      className={`inline-block px-2 py-0.5 text-xs font-semibold rounded border ${deptColors[department]}`}
    >
      {department}
    </span>
  );
};

export const SLATracker: React.FC<{
  createdAt: string;
  targetHours: number;
  isClosed?: boolean;
}> = ({ createdAt, targetHours, isClosed }) => {
  const createdTime = new Date(createdAt).getTime();
  const now = Date.now();
  const elapsedHours = Math.max(0, (now - createdTime) / (1000 * 3600));
  const remainingHours = targetHours - elapsedHours;

  if (isClosed) {
    return (
      <span className="text-xs text-[#5e7366] dark:text-[#a8bda3] font-mono tabular-nums">
        Completed within SLA
      </span>
    );
  }

  if (remainingHours <= 0) {
    const overdueHrs = Math.abs(remainingHours).toFixed(1);
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-700 dark:text-rose-400 font-mono tabular-nums">
        <Clock className="w-3 h-3 text-rose-600 dark:text-rose-400" />
        SLA Breached (+{overdueHrs}h)
      </span>
    );
  }

  if (remainingHours <= 4) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 dark:text-amber-400 font-mono tabular-nums">
        <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
        Due in {remainingHours.toFixed(1)}h
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs text-[#5e7366] dark:text-[#a8bda3] font-mono tabular-nums">
      <Clock className="w-3 h-3 text-[#6f8a78] dark:text-[#a8bda3]" />
      {remainingHours.toFixed(0)}h remaining
    </span>
  );
};
