import React, { useState } from 'react';
import {
  X,
  MapPin,
  Clock,
  User,
  Phone,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Wrench,
  Package,
  ShieldCheck,
  Star,
  Camera,
  RotateCcw,
  Send,
  Building,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Complaint, PriorityLevel, DepartmentType } from '../types';
import {
  StatusIndicator,
  PriorityIndicator,
  DepartmentIndicator,
  SLATracker,
} from './StatusBadges';
import { DEPARTMENT_CATEGORIES } from '../data/mockData';

interface ComplaintDetailModalProps {
  complaintId: string | null;
  onClose: () => void;
}

export const ComplaintDetailModal: React.FC<ComplaintDetailModalProps> = ({
  complaintId,
  onClose,
}) => {
  const {
    complaints,
    currentUser,
    technicians,
    inventory,
    verifyComplaint,
    createWorkOrder,
    technicianStartWork,
    technicianUploadPhoto,
    requestMaterial,
    issueMaterial,
    technicianCompleteWork,
    inspectWorkOrder,
    submitFeedback,
    reopenComplaint,
  } = useApp();

  // Officer action states
  const [selectedTechId, setSelectedTechId] = useState('');
  const [estHours, setEstHours] = useState(2);
  const [officerPriority, setOfficerPriority] = useState<PriorityLevel>('high');
  const [officerCategory, setOfficerCategory] = useState('');
  const [officerDepartment, setOfficerDepartment] = useState<DepartmentType>('Electrical');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  // Technician action states
  const [techNotes, setTechNotes] = useState('');
  const [requestedItemId, setRequestedItemId] = useState('');
  const [requestedItemQty, setRequestedItemQty] = useState(1);
  const [afterPhotoUrl, setAfterPhotoUrl] = useState('');

  // Inspection states
  const [inspectionRemarks, setInspectionRemarks] = useState('');

  // User feedback states
  const [rating, setRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [reopenText, setReopenText] = useState('');
  const [showReopenInput, setShowReopenInput] = useState(false);

  if (!complaintId) return null;

  const complaint = complaints.find((c) => c.id === complaintId);
  if (!complaint) return null;

  // Set default tech if unselected
  const matchingTechs = technicians.filter(
    (t) => t.department === complaint.department
  );
  const activeTech = complaint.workOrder?.technicianId
    ? technicians.find((t) => t.id === complaint.workOrder?.technicianId)
    : undefined;

  // Lifecycle steps
  const steps = [
    { label: 'Registered', done: true },
    {
      label: 'Verified & Classified',
      done: complaint.status !== 'registered' && complaint.status !== 'rejected',
    },
    {
      label: 'Work Order & Tech Assigned',
      done:
        !!complaint.workOrder &&
        complaint.status !== 'registered' &&
        complaint.status !== 'verified' &&
        complaint.status !== 'rejected',
    },
    {
      label: 'Execution & Photos',
      done:
        complaint.status === 'inspection' ||
        complaint.status === 'resolved' ||
        complaint.status === 'closed',
    },
    {
      label: 'Inspection',
      done:
        (complaint.status === 'resolved' || complaint.status === 'closed') &&
        complaint.inspection?.status === 'accepted',
    },
    { label: 'Closure & Feedback', done: complaint.status === 'closed' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-[#1e2825] rounded-xl shadow-2xl border border-[#ded6c9] dark:border-[#334440] overflow-hidden my-4 sm:my-8 flex flex-col max-h-[90vh] text-[#2f3e3a] dark:text-[#f6f0e6] transition-colors">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#ded6c9] dark:border-[#334440] bg-[#f6f0e6]/70 dark:bg-[#263330]">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-bold text-[#2f3e3a] dark:text-[#f6f0e6] bg-white dark:bg-[#141c1a] px-2.5 py-1 rounded border border-[#ded6c9] dark:border-[#334440]">
              {complaint.id}
            </span>
            <DepartmentIndicator department={complaint.department} />
            <PriorityIndicator priority={complaint.priority} />
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#6f8a78] hover:text-[#2f3e3a] dark:hover:text-[#f6f0e6] rounded-lg hover:bg-[#ded6c9]/60 dark:hover:bg-[#141c1a] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Title & SLA */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-[#2f3e3a] dark:text-[#f6f0e6]">{complaint.title}</h1>
              <div className="flex items-center gap-2 text-xs text-[#5e7366] dark:text-[#a8bda3] mt-1 flex-wrap">
                <span>Category: {complaint.category}</span>
                <span aria-hidden="true">·</span>
                <span>
                  Logged on {new Date(complaint.createdAt).toLocaleDateString()} at{' '}
                  {new Date(complaint.createdAt).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                <span aria-hidden="true">·</span>
                <SLATracker
                  createdAt={complaint.createdAt}
                  targetHours={complaint.slaTargetHours}
                  isClosed={complaint.status === 'closed'}
                />
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-xs text-[#6f8a78] block mb-1">Current Lifecycle Status</span>
              <StatusIndicator status={complaint.status} />
            </div>
          </div>

          {/* Stepper */}
          <div className="bg-[#f6f0e6]/60 dark:bg-[#263330] p-4 rounded-xl border border-[#ded6c9] dark:border-[#334440]">
            <div className="text-xs font-semibold text-[#5e7366] dark:text-[#a8bda3] mb-3">
              Maintenance Lifecycle Progress
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
              {steps.map((st, idx) => (
                <div
                  key={st.label}
                  className={`p-2 rounded-lg border text-center transition-all ${
                    st.done
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 font-semibold'
                      : 'bg-white dark:bg-[#1e2825] border-[#ded6c9] dark:border-[#334440] text-[#6f8a78]'
                  }`}
                >
                  <div className="text-[10px] uppercase tracking-wider mb-0.5">
                    Step {idx + 1}
                  </div>
                  <div className="text-[11px] leading-tight line-clamp-2">{st.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Location & Resident Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-white dark:bg-[#263330] rounded-xl border border-[#ded6c9] dark:border-[#334440] space-y-2">
              <div className="text-xs font-bold text-[#2f3e3a] dark:text-[#f6f0e6] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#6f8a78]" />
                <span>Campus Location Details</span>
              </div>
              <div className="text-xs text-[#5e7366] dark:text-[#a8bda3] space-y-1">
                <div>
                  <span className="text-[#6f8a78]">Region:</span> {complaint.location.region}
                </div>
                <div>
                  <span className="text-[#6f8a78]">Building:</span>{' '}
                  <span className="font-semibold text-[#2f3e3a] dark:text-[#f6f0e6]">
                    {complaint.location.building}
                  </span>{' '}
                  ({complaint.location.buildingType})
                </div>
                <div>
                  <span className="text-[#6f8a78]">Level & Room:</span>{' '}
                  <span className="font-semibold text-[#2f3e3a] dark:text-[#f6f0e6]">
                    {complaint.location.floor} · {complaint.location.room}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-[#263330] rounded-xl border border-[#ded6c9] dark:border-[#334440] space-y-2">
              <div className="text-xs font-bold text-[#2f3e3a] dark:text-[#f6f0e6] flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#6f8a78]" />
                <span>Registered By</span>
              </div>
              <div className="text-xs text-[#5e7366] dark:text-[#a8bda3] space-y-1">
                <div>
                  <span className="text-[#6f8a78]">Name:</span>{' '}
                  <span className="font-semibold text-[#2f3e3a] dark:text-[#f6f0e6]">
                    {complaint.registeredBy.name}
                  </span>
                </div>
                <div>
                  <span className="text-[#6f8a78]">Designation:</span>{' '}
                  {complaint.registeredBy.role}
                </div>
                <div>
                  <span className="text-[#6f8a78]">Contact:</span>{' '}
                  <span className="font-mono text-[#2f3e3a] dark:text-[#f6f0e6]">
                    {complaint.registeredBy.phone}
                  </span>{' '}
                  · {complaint.registeredBy.email}
                </div>
              </div>
            </div>
          </div>

          {/* Issue Description */}
          <div className="p-4 bg-white dark:bg-[#263330] rounded-xl border border-[#ded6c9] dark:border-[#334440] space-y-2">
            <div className="text-xs font-bold text-[#2f3e3a] dark:text-[#f6f0e6]">Detailed Complaint Description</div>
            <p className="text-xs text-[#5e7366] dark:text-[#a8bda3] leading-relaxed bg-[#f6f0e6]/50 dark:bg-[#1e2825] p-3 rounded-lg border border-[#ded6c9]/80 dark:border-[#141c1a]">
              {complaint.description}
            </p>
            {complaint.attachments && complaint.attachments.length > 0 && (
              <div className="pt-2">
                <span className="text-[11px] font-medium text-[#6f8a78] block mb-1">
                  Attached Site Photo:
                </span>
                <div className="flex gap-2">
                  {complaint.attachments.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt="Site attachment"
                      className="w-28 h-20 object-cover rounded-lg border border-[#ded6c9] dark:border-[#334440]"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Work Order & Technician Section (if assigned) */}
          {complaint.workOrder && (
            <div className="p-4 bg-slate-50/90 rounded-xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-slate-700" />
                  <span className="text-xs font-bold text-slate-900">
                    Work Order: {complaint.workOrder.id}
                  </span>
                </div>
                <span className="text-xs font-medium text-slate-600 bg-white px-2.5 py-0.5 rounded border border-slate-200">
                  Technician: {complaint.workOrder.technicianName}
                </span>
              </div>

              {/* Photos Comparison (Before & After) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-slate-200 rounded-lg p-3 bg-white">
                  <div className="text-[11px] font-semibold text-slate-600 mb-1 flex items-center justify-between">
                    <span>Before Maintenance Photo</span>
                    {complaint.workOrder.beforePhotoUrl && (
                      <span className="text-emerald-600 text-[10px]">Verified Upload</span>
                    )}
                  </div>
                  {complaint.workOrder.beforePhotoUrl ? (
                    <img
                      src={complaint.workOrder.beforePhotoUrl}
                      alt="Before maintenance"
                      className="w-full h-36 object-cover rounded border border-slate-100"
                    />
                  ) : (
                    <div className="h-36 flex flex-col items-center justify-center bg-slate-50 rounded border border-dashed border-slate-200 text-slate-400 text-xs">
                      <Camera className="w-5 h-5 mb-1 text-slate-300" />
                      <span>No Before Photo Uploaded</span>
                    </div>
                  )}
                </div>

                <div className="border border-slate-200 rounded-lg p-3 bg-white">
                  <div className="text-[11px] font-semibold text-slate-600 mb-1 flex items-center justify-between">
                    <span>After Maintenance Photo (Completion Proof)</span>
                    {complaint.workOrder.afterPhotoUrl && (
                      <span className="text-emerald-600 text-[10px]">Verified Upload</span>
                    )}
                  </div>
                  {complaint.workOrder.afterPhotoUrl ? (
                    <img
                      src={complaint.workOrder.afterPhotoUrl}
                      alt="After maintenance"
                      className="w-full h-36 object-cover rounded border border-slate-100"
                    />
                  ) : (
                    <div className="h-36 flex flex-col items-center justify-center bg-slate-50 rounded border border-dashed border-slate-200 text-slate-400 text-xs">
                      <Camera className="w-5 h-5 mb-1 text-slate-300" />
                      <span>Pending Completion Upload</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Technician Notes */}
              {complaint.workOrder.technicianNotes && (
                <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs">
                  <span className="font-semibold text-slate-800">Technician Remarks: </span>
                  <span className="text-slate-600">{complaint.workOrder.technicianNotes}</span>
                </div>
              )}

              {/* Materials Consumed / Requested */}
              {complaint.workOrder.materials && complaint.workOrder.materials.length > 0 && (
                <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2">
                  <span className="text-xs font-semibold text-slate-800 block">
                    Material Requirements & Inventory Ledger (M10):
                  </span>
                  <div className="divide-y divide-slate-100 text-xs">
                    {complaint.workOrder.materials.map((mat, i) => (
                      <div key={i} className="py-1.5 flex items-center justify-between">
                        <span className="text-slate-700 font-medium">{mat.itemName}</span>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-slate-500">
                            Req: {mat.requestedQty} · Issued: {mat.issuedQty || 0}
                          </span>
                          <span
                            className={`px-2 py-0.5 text-[10px] font-semibold rounded ${
                              mat.status === 'consumed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : mat.status === 'issued'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {mat.status.toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Inspection Records */}
          {complaint.inspection && (
            <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-purple-700" />
                  Officer Quality Inspection Result
                </span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded ${
                    complaint.inspection.status === 'accepted'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {complaint.inspection.status.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-purple-950">
                <span className="font-medium text-purple-800">Inspector:</span>{' '}
                {complaint.inspection.inspectedBy} · {new Date(complaint.inspection.inspectedAt).toLocaleString()}
              </p>
              <p className="text-xs text-purple-900 italic">
                "{complaint.inspection.remarks}"
              </p>
            </div>
          )}

          {/* Feedback Records */}
          {complaint.feedback && (
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  Resident Satisfaction Feedback
                </span>
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < complaint.feedback!.rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300'
                      }`}
                    />
                  ))}
                  <span className="text-xs font-mono font-bold text-slate-800 ml-1">
                    {complaint.feedback.rating}/5
                  </span>
                </div>
              </div>
              <p className="text-xs text-emerald-900 italic">"{complaint.feedback.comment}"</p>
              <p className="text-[11px] text-emerald-700">
                Confirmed by {complaint.feedback.confirmedBy} on{' '}
                {new Date(complaint.feedback.submittedAt).toLocaleDateString()}
              </p>
            </div>
          )}

          {/* Reopen notice */}
          {complaint.reopenReason && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
              <div className="text-xs font-bold text-rose-900 flex items-center gap-1.5">
                <RotateCcw className="w-4 h-4 text-rose-600" />
                Reopened Ticket
              </div>
              <p className="text-xs text-rose-800">
                <span className="font-semibold">Reason:</span> {complaint.reopenReason}
              </p>
            </div>
          )}

          {/* Rejection notice */}
          {complaint.rejectionReason && (
            <div className="p-4 bg-slate-100 border border-slate-300 rounded-xl space-y-1">
              <div className="text-xs font-bold text-slate-800">Complaint Rejected / Invalid</div>
              <p className="text-xs text-slate-600">{complaint.rejectionReason}</p>
            </div>
          )}

          {/* ========================================================================= */}
          {/* CONTEXTUAL ACTION PANELS BASED ON CURRENT USER ROLE */}
          {/* ========================================================================= */}

          {/* 1. MAINTENANCE OFFICER ACTIONS */}
          {currentUser.role === 'officer' && (
            <div className="p-4 bg-slate-900 text-white rounded-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                    Maintenance Officer Action Panel
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">
                  Officer: {currentUser.name}
                </span>
              </div>

              {/* Case A: Complaint needs verification */}
              {complaint.status === 'registered' && (
                <div className="space-y-3">
                  <p className="text-xs text-slate-300">
                    Step 1: Review initial submission, classify SLA priority, verify department and approve or reject.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <span className="text-[11px] text-slate-400 block mb-1">Verify Priority</span>
                      <select
                        value={officerPriority}
                        onChange={(e) => setOfficerPriority(e.target.value as PriorityLevel)}
                        className="w-full text-xs px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded text-white"
                      >
                        <option value="emergency">Emergency (6h SLA)</option>
                        <option value="high">High (24h SLA)</option>
                        <option value="medium">Medium (48h SLA)</option>
                        <option value="low">Low (72h SLA)</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2 flex items-end gap-2">
                      <button
                        onClick={() => {
                          verifyComplaint(complaint.id, 'approve', {
                            priority: officerPriority,
                          });
                        }}
                        className="px-4 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded transition-colors"
                      >
                        Approve & Move to Assignment
                      </button>
                      <button
                        onClick={() => setShowRejectForm(!showRejectForm)}
                        className="px-3 py-1.5 text-xs text-rose-300 hover:text-white border border-rose-800 hover:bg-rose-900/50 rounded transition-colors"
                      >
                        Mark Duplicate / Reject
                      </button>
                    </div>
                  </div>

                  {showRejectForm && (
                    <div className="pt-2 space-y-2">
                      <input
                        type="text"
                        placeholder="State reason for rejection / duplicate ticket ID..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        className="w-full text-xs px-3 py-1.5 bg-slate-800 border border-slate-700 rounded text-white"
                      />
                      <button
                        onClick={() => {
                          verifyComplaint(complaint.id, 'reject', { rejectionReason });
                        }}
                        className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white text-xs rounded"
                      >
                        Confirm Rejection
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Case B: Verified complaint needs Work Order & Tech Assignment */}
              {(complaint.status === 'verified' || !complaint.workOrder) &&
                complaint.status !== 'registered' &&
                complaint.status !== 'rejected' && (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-300">
                      Step 2: Generate Work Order and assign qualified technician.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <span className="text-[11px] text-slate-400 block mb-1">
                          Select Technician ({complaint.department})
                        </span>
                        <select
                          value={selectedTechId || matchingTechs[0]?.id || ''}
                          onChange={(e) => setSelectedTechId(e.target.value)}
                          className="w-full text-xs px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded text-white"
                        >
                          {matchingTechs.map((tech) => (
                            <option key={tech.id} value={tech.id}>
                              {tech.name} ({tech.activeWorkload} active jobs)
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <span className="text-[11px] text-slate-400 block mb-1">
                          Estimated Hours
                        </span>
                        <input
                          type="number"
                          min={1}
                          max={48}
                          value={estHours}
                          onChange={(e) => setEstHours(Number(e.target.value))}
                          className="w-full text-xs px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded text-white font-mono"
                        />
                      </div>

                      <div className="flex items-end">
                        <button
                          onClick={() => {
                            const techId =
                              selectedTechId || matchingTechs[0]?.id || 'tech_01';
                            createWorkOrder(complaint.id, techId, estHours);
                          }}
                          className="w-full px-4 py-2 text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-slate-950 rounded transition-colors shadow-sm"
                        >
                          Dispatch Work Order
                        </button>
                      </div>
                    </div>
                  </div>
                )}

              {/* Case C: Completed work awaiting Officer Quality Inspection */}
              {complaint.status === 'inspection' && (
                <div className="space-y-3">
                  <div className="p-3 bg-purple-950/60 border border-purple-800/80 rounded-lg">
                    <p className="text-xs text-purple-200">
                      Technician {complaint.workOrder?.technicianName} has reported work completed with photographic proof. Please inspect the site and accept or reject.
                    </p>
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-300 block mb-1">
                      Inspection Quality Notes / Audit Remarks
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Inspected site, replacement part verified, tested under load..."
                      value={inspectionRemarks}
                      onChange={(e) => setInspectionRemarks(e.target.value)}
                      className="w-full text-xs px-3 py-1.5 bg-slate-800 border border-slate-700 rounded text-white"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        inspectWorkOrder(
                          complaint.id,
                          'accepted',
                          inspectionRemarks || 'Work inspected and approved in compliance with university standards.'
                        );
                      }}
                      className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded transition-colors"
                    >
                      Accept & Close (Passed Inspection)
                    </button>
                    <button
                      onClick={() => {
                        inspectWorkOrder(
                          complaint.id,
                          'rejected',
                          inspectionRemarks || 'Defect not fully resolved, rework necessary.'
                        );
                      }}
                      className="px-4 py-2 text-xs font-semibold bg-rose-700 hover:bg-rose-600 text-white rounded transition-colors"
                    >
                      Reject (Send Back for Rework)
                    </button>
                  </div>
                </div>
              )}

              {complaint.status !== 'registered' &&
                complaint.status !== 'verified' &&
                complaint.status !== 'inspection' && (
                  <p className="text-xs text-slate-400">
                    No pending officer approvals required for this ticket's current state ({complaint.status}).
                  </p>
                )}
            </div>
          )}

          {/* 2. TECHNICIAN ACTIONS */}
          {currentUser.role === 'technician' && complaint.workOrder && (
            <div className="p-4 bg-slate-900 text-white rounded-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-sky-400" />
                  <span className="text-xs font-bold text-sky-300 uppercase tracking-wider">
                    Technician Execution Workspace (M07)
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">
                  Technician: {currentUser.name}
                </span>
              </div>

              {/* Start Job button */}
              {complaint.workOrder.status === 'assigned' && (
                <div className="flex items-center justify-between p-3 bg-slate-800/80 rounded-lg">
                  <div>
                    <span className="text-xs font-semibold block text-slate-200">
                      Work Order Assigned
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Click below to clock in and change status to Work In Progress.
                    </span>
                  </div>
                  <button
                    onClick={() => technicianStartWork(complaint.id)}
                    className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded transition-colors"
                  >
                    Start Work Execution
                  </button>
                </div>
              )}

              {/* In Progress Tools */}
              {(complaint.workOrder.status === 'in_progress' ||
                complaint.workOrder.status === 'rework') && (
                <div className="space-y-4">
                  {/* Photo uploads */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-800/70 rounded-lg space-y-2">
                      <span className="text-xs font-semibold text-slate-200 block">
                        Before-Work Photograph
                      </span>
                      {complaint.workOrder.beforePhotoUrl ? (
                        <span className="text-xs text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Before photo attached
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            technicianUploadPhoto(
                              complaint.id,
                              'before',
                              'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80'
                            );
                          }}
                          className="px-3 py-1.5 text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 rounded flex items-center gap-1.5"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Simulate Upload Before Photo</span>
                        </button>
                      )}
                    </div>

                    <div className="p-3 bg-slate-800/70 rounded-lg space-y-2">
                      <span className="text-xs font-semibold text-slate-200 block">
                        After-Work Photograph (Completion Proof)
                      </span>
                      {complaint.workOrder.afterPhotoUrl ? (
                        <span className="text-xs text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          After photo attached
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            technicianUploadPhoto(
                              complaint.id,
                              'after',
                              'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=400&q=80'
                            );
                          }}
                          className="px-3 py-1.5 text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 rounded flex items-center gap-1.5"
                        >
                          <Camera className="w-3.5 h-3.5" />
                          <span>Simulate Upload After Photo</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Material Request */}
                  <div className="p-3 bg-slate-800/70 rounded-lg space-y-2">
                    <span className="text-xs font-semibold text-slate-200 block">
                      Request Material / Spare Parts from Central Store (M10)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <select
                        value={requestedItemId || inventory[0]?.id || ''}
                        onChange={(e) => setRequestedItemId(e.target.value)}
                        className="sm:col-span-2 text-xs px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-white"
                      >
                        {inventory.map((inv) => (
                          <option key={inv.id} value={inv.id}>
                            {inv.name} (Stock: {inv.quantityOnHand} {inv.unit})
                          </option>
                        ))}
                      </select>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min={1}
                          max={20}
                          value={requestedItemQty}
                          onChange={(e) => setRequestedItemQty(Number(e.target.value))}
                          className="w-16 text-xs px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-white font-mono text-center"
                        />
                        <button
                          onClick={() => {
                            const itemId = requestedItemId || inventory[0]?.id;
                            if (itemId) {
                              requestMaterial(complaint.id, itemId, requestedItemQty);
                            }
                          }}
                          className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-xs rounded text-slate-100 flex-1"
                        >
                          Request
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Completion Form */}
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <span className="text-xs font-semibold text-slate-200 block">
                      Work Execution Summary & Resolution Notes
                    </span>
                    <textarea
                      rows={2}
                      placeholder="Specify work carried out, parts installed, load checks completed..."
                      value={techNotes}
                      onChange={(e) => setTechNotes(e.target.value)}
                      className="w-full text-xs px-3 py-1.5 bg-slate-800 border border-slate-700 rounded text-white"
                    />
                    <button
                      onClick={() => {
                        technicianCompleteWork(
                          complaint.id,
                          techNotes || 'Repair completed and tested satisfactorily.',
                          'https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=400&q=80'
                        );
                      }}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded transition-colors shadow-sm"
                    >
                      Complete Job & Submit for Quality Inspection
                    </button>
                  </div>
                </div>
              )}

              {complaint.workOrder.status === 'completed' && (
                <div className="p-3 bg-slate-800 rounded-lg text-xs text-slate-300">
                  Work has been submitted and is currently in the Officer Inspection Queue.
                </div>
              )}
            </div>
          )}

          {/* 3. STORE OFFICER ACTIONS */}
          {currentUser.role === 'store' && (
            <div className="p-4 bg-slate-900 text-white rounded-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                    Store & Inventory Disbursement (M10)
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">
                  Store Officer: {currentUser.name}
                </span>
              </div>

              {complaint.workOrder?.materials &&
              complaint.workOrder.materials.some((m) => m.status === 'requested') ? (
                <div className="space-y-3">
                  <p className="text-xs text-slate-300">
                    Technician has requested materials for this Work Order. Verify stock balance and disburse:
                  </p>
                  <div className="space-y-2">
                    {complaint.workOrder.materials
                      .filter((m) => m.status === 'requested')
                      .map((mat) => {
                        const invItem = inventory.find((i) => i.id === mat.itemId);
                        const hasStock = (invItem?.quantityOnHand || 0) >= mat.requestedQty;
                        return (
                          <div
                            key={mat.itemId}
                            className="p-3 bg-slate-800 rounded-lg flex items-center justify-between"
                          >
                            <div>
                              <div className="text-xs font-semibold text-slate-100">
                                {mat.itemName}
                              </div>
                              <div className="text-[11px] text-slate-400">
                                Req: {mat.requestedQty} · Available in Store:{' '}
                                <span className="font-mono text-emerald-400">
                                  {invItem?.quantityOnHand || 0}
                                </span>
                              </div>
                            </div>
                            <button
                              disabled={!hasStock}
                              onClick={() => {
                                issueMaterial(complaint.id, mat.itemId, mat.requestedQty);
                              }}
                              className={`px-3 py-1.5 text-xs font-semibold rounded ${
                                hasStock
                                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                  : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                              }`}
                            >
                              {hasStock ? 'Issue Material' : 'Insufficient Stock'}
                            </button>
                          </div>
                        );
                      })}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-slate-400">
                  No pending material issue requests for this complaint.
                </p>
              )}
            </div>
          )}

          {/* 4. STUDENT / RESIDENT ACTIONS (Confirm & Rate OR Reopen) */}
          {currentUser.role === 'student' && (
            <div className="p-4 bg-slate-900 text-white rounded-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                    Resident Confirmation & Feedback (M15 / M16)
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">
                  Resident: {currentUser.name}
                </span>
              </div>

              {complaint.status === 'resolved' && (
                <div className="space-y-4">
                  <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-lg">
                    <p className="text-xs text-emerald-200">
                      The maintenance team has completed the repair and the inspection officer has verified it. Please confirm if the issue is solved to your satisfaction.
                    </p>
                  </div>

                  {!showReopenInput ? (
                    <div className="space-y-3">
                      <div>
                        <span className="text-xs text-slate-300 block mb-1">
                          Rate Maintenance Service Quality:
                        </span>
                        <div className="flex items-center gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRating(star)}
                              className="p-1 hover:scale-110 transition-transform"
                            >
                              <Star
                                className={`w-6 h-6 ${
                                  star <= rating
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-slate-600'
                                }`}
                              />
                            </button>
                          ))}
                          <span className="text-xs font-mono font-bold text-amber-400 ml-2">
                            {rating} Stars
                          </span>
                        </div>
                      </div>

                      <div>
                        <span className="text-xs text-slate-300 block mb-1">
                          Feedback Remarks:
                        </span>
                        <input
                          type="text"
                          placeholder="e.g. Work was completed quickly and area left clean."
                          value={feedbackComment}
                          onChange={(e) => setFeedbackComment(e.target.value)}
                          className="w-full text-xs px-3 py-1.5 bg-slate-800 border border-slate-700 rounded text-white"
                        />
                      </div>

                      <div className="flex items-center gap-3 pt-1">
                        <button
                          onClick={() => {
                            submitFeedback(
                              complaint.id,
                              rating,
                              feedbackComment || 'Work confirmed and resolved satisfactorily.'
                            );
                          }}
                          className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded transition-colors shadow-sm"
                        >
                          Confirm Resolution & Close Ticket
                        </button>
                        <button
                          onClick={() => setShowReopenInput(true)}
                          className="px-3 py-2 text-xs text-rose-300 hover:text-white border border-rose-800 hover:bg-rose-900/50 rounded transition-colors"
                        >
                          Issue Not Resolved (Reopen)
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 p-3 bg-rose-950/50 border border-rose-900 rounded-lg">
                      <span className="text-xs font-semibold text-rose-200 block">
                        Reason why issue remains unresolved:
                      </span>
                      <textarea
                        rows={2}
                        placeholder="State clearly why the fault is not solved..."
                        value={reopenText}
                        onChange={(e) => setReopenText(e.target.value)}
                        className="w-full text-xs px-3 py-1.5 bg-slate-800 border border-slate-700 rounded text-white"
                      />
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (reopenText.trim()) {
                              reopenComplaint(complaint.id, reopenText.trim());
                              setShowReopenInput(false);
                            }
                          }}
                          className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded"
                        >
                          Submit Reopen Request
                        </button>
                        <button
                          onClick={() => setShowReopenInput(false)}
                          className="px-3 py-1.5 text-xs text-slate-400 hover:text-slate-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {complaint.status === 'closed' && (
                <div className="space-y-2">
                  <p className="text-xs text-slate-400">
                    This complaint has been officially closed. If the exact same issue has recurred, you can reopen it:
                  </p>
                  {!showReopenInput ? (
                    <button
                      onClick={() => setShowReopenInput(true)}
                      className="px-3 py-1.5 bg-rose-950 text-rose-300 hover:bg-rose-900 border border-rose-800 text-xs rounded transition-colors"
                    >
                      Reopen Complaint Due to Recurrence
                    </button>
                  ) : (
                    <div className="space-y-2 p-3 bg-rose-950/50 border border-rose-900 rounded-lg">
                      <textarea
                        rows={2}
                        placeholder="Explain recurring fault..."
                        value={reopenText}
                        onChange={(e) => setReopenText(e.target.value)}
                        className="w-full text-xs px-3 py-1.5 bg-slate-800 border border-slate-700 rounded text-white"
                      />
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (reopenText.trim()) {
                              reopenComplaint(complaint.id, reopenText.trim());
                              setShowReopenInput(false);
                            }
                          }}
                          className="px-3 py-1.5 bg-rose-600 text-white text-xs rounded"
                        >
                          Confirm Reopen
                        </button>
                        <button
                          onClick={() => setShowReopenInput(false)}
                          className="px-3 py-1.5 text-xs text-slate-400"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {complaint.status !== 'resolved' && complaint.status !== 'closed' && (
                <p className="text-xs text-slate-400">
                  Your complaint is being processed through the maintenance workflow. You will be able to confirm and review once the team completes the repair and inspection.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100 bg-slate-50 text-xs text-slate-500">
          <div>
            <span>Gautam Buddha University Central Maintenance Cell</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
};
