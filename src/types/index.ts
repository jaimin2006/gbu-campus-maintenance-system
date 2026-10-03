export type UserRole = 'student' | 'officer' | 'technician' | 'store' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: 'Civil' | 'Electrical' | 'Horticulture' | 'General';
  phone: string;
  roomOrOffice?: string;
  avatarUrl?: string;
}

export type DepartmentType = 'Civil' | 'Electrical' | 'Horticulture';

export type PriorityLevel = 'emergency' | 'high' | 'medium' | 'low';

export type ComplaintStatus =
  | 'registered'
  | 'verified'
  | 'in_progress'
  | 'inspection'
  | 'rework'
  | 'resolved'
  | 'closed'
  | 'reopened'
  | 'rejected';

export interface LocationHierarchy {
  region: string;
  building: string;
  buildingType: 'Hostel' | 'Academic' | 'Administrative' | 'Sports/Facility' | 'Residential';
  floor: string;
  room: string;
}

export interface MaterialRequirement {
  itemId: string;
  itemName: string;
  requestedQty: number;
  issuedQty?: number;
  consumedQty?: number;
  status: 'requested' | 'issued' | 'consumed';
}

export interface WorkOrder {
  id: string;
  complaintId: string;
  department: DepartmentType;
  technicianId?: string;
  technicianName?: string;
  technicianPhone?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  estimatedHours: number;
  beforePhotoUrl?: string;
  afterPhotoUrl?: string;
  technicianNotes?: string;
  materials: MaterialRequirement[];
  status: 'pending_assignment' | 'assigned' | 'in_progress' | 'completed' | 'rework';
}

export interface InspectionRecord {
  inspectedBy: string;
  inspectedAt: string;
  status: 'accepted' | 'rejected';
  remarks: string;
}

export interface FeedbackRecord {
  rating: number; // 1 to 5
  comment: string;
  submittedAt: string;
  confirmedBy: string;
}

export interface Complaint {
  id: string; // e.g. GBU-2026-C0104
  title: string;
  description: string;
  department: DepartmentType;
  category: string;
  priority: PriorityLevel;
  slaTargetHours: number;
  location: LocationHierarchy;
  status: ComplaintStatus;
  createdAt: string;
  updatedAt: string;
  registeredBy: {
    id: string;
    name: string;
    role: string;
    phone: string;
    email: string;
  };
  attachments: string[];
  rejectionReason?: string;
  workOrder?: WorkOrder;
  inspection?: InspectionRecord;
  feedback?: FeedbackRecord;
  reopenReason?: string;
}

export interface InventoryItem {
  id: string;
  code: string;
  name: string;
  department: DepartmentType;
  category: string;
  unit: string;
  quantityOnHand: number;
  minThreshold: number;
  unitCost: number;
  locationShelf: string;
  lastRestocked: string;
}

export interface MaterialTransaction {
  id: string;
  timestamp: string;
  workOrderId: string;
  complaintId: string;
  itemId: string;
  itemName: string;
  type: 'issue' | 'receive' | 'return';
  quantity: number;
  issuedTo: string;
  authorizedBy: string;
}

export interface TechnicianProfile {
  id: string;
  name: string;
  department: DepartmentType;
  phone: string;
  skills: string[];
  activeWorkload: number;
  isAvailable: boolean;
  avatarUrl?: string;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  entityType: 'Complaint' | 'WorkOrder' | 'Inventory' | 'User';
  entityId: string;
  details: string;
}

export interface InAppNotification {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  complaintId?: string;
  read: boolean;
  type: 'info' | 'assignment' | 'sla' | 'approval' | 'completion';
}
