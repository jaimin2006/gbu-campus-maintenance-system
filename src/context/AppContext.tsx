import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  UserRole,
  Complaint,
  InventoryItem,
  TechnicianProfile,
  AuditLogItem,
  InAppNotification,
  PriorityLevel,
  DepartmentType,
  LocationHierarchy,
} from '../types';
import {
  MOCK_USERS,
  INITIAL_COMPLAINTS,
  INITIAL_INVENTORY,
  MOCK_TECHNICIANS,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS,
} from '../data/mockData';

interface AppContextType {
  currentUser: UserProfile;
  switchRole: (role: UserRole) => void;
  complaints: Complaint[];
  inventory: InventoryItem[];
  technicians: TechnicianProfile[];
  auditLogs: AuditLogItem[];
  notifications: InAppNotification[];
  unreadNotificationCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  registerComplaint: (data: {
    title: string;
    description: string;
    department: DepartmentType;
    category: string;
    priority: PriorityLevel;
    location: LocationHierarchy;
    attachments: string[];
  }) => string;
  verifyComplaint: (
    complaintId: string,
    action: 'approve' | 'reject',
    data?: {
      priority?: PriorityLevel;
      category?: string;
      department?: DepartmentType;
      rejectionReason?: string;
    }
  ) => void;
  createWorkOrder: (
    complaintId: string,
    technicianId: string,
    estimatedHours: number,
    notes?: string
  ) => void;
  technicianStartWork: (complaintId: string) => void;
  technicianUploadPhoto: (complaintId: string, type: 'before' | 'after', photoUrl: string) => void;
  requestMaterial: (complaintId: string, itemId: string, quantity: number) => void;
  issueMaterial: (complaintId: string, itemId: string, quantity: number) => void;
  technicianCompleteWork: (
    complaintId: string,
    notes: string,
    afterPhotoUrl?: string
  ) => void;
  inspectWorkOrder: (
    complaintId: string,
    status: 'accepted' | 'rejected',
    remarks: string
  ) => void;
  submitFeedback: (complaintId: string, rating: number, comment: string) => void;
  reopenComplaint: (complaintId: string, reason: string) => void;
  restockInventory: (itemId: string, quantity: number) => void;
  resetDemoData: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}
// One-time cleanup of old saved data from previous versions
if (localStorage.getItem('gbu_data_version') !== '2') {
  Object.keys(localStorage)
    .filter((k) => k.startsWith('gbu_'))
    .forEach((k) => localStorage.removeItem(k));
  localStorage.setItem('gbu_data_version', '2');
}
const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('gbu_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return 'light';
  });

  useEffect(() => {
    localStorage.setItem('gbu_theme', theme);
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      document.body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      document.body.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('gbu_active_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return MOCK_USERS[0]; // Student by default
  });

  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    const saved = localStorage.getItem('gbu_complaints');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return INITIAL_COMPLAINTS;
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('gbu_inventory');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return INITIAL_INVENTORY;
  });

  const [technicians, setTechnicians] = useState<TechnicianProfile[]>(() => {
    const saved = localStorage.getItem('gbu_technicians');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return MOCK_TECHNICIANS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(() => {
    const saved = localStorage.getItem('gbu_audit_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return INITIAL_AUDIT_LOGS;
  });

  const [notifications, setNotifications] = useState<InAppNotification[]>(() => {
    const saved = localStorage.getItem('gbu_notifications');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return INITIAL_NOTIFICATIONS;
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('gbu_active_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('gbu_complaints', JSON.stringify(complaints));
  }, [complaints]);

  useEffect(() => {
    localStorage.setItem('gbu_inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('gbu_technicians', JSON.stringify(technicians));
  }, [technicians]);

  useEffect(() => {
    localStorage.setItem('gbu_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('gbu_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const switchRole = (role: UserRole) => {
    const found = MOCK_USERS.find((u) => u.role === role);
    if (found) {
      setCurrentUser(found);
    }
  };

  const addAuditLog = (
    action: string,
    entityType: 'Complaint' | 'WorkOrder' | 'Inventory' | 'User',
    entityId: string,
    details: string
  ) => {
    const newLog: AuditLogItem = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action,
      entityType,
      entityId,
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const addNotification = (
    title: string,
    message: string,
    type: 'info' | 'assignment' | 'sla' | 'approval' | 'completion',
    complaintId?: string
  ) => {
    const newNotif: InAppNotification = {
      id: `notif_${Date.now()}`,
      timestamp: new Date().toISOString(),
      title,
      message,
      complaintId,
      read: false,
      type,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const registerComplaint = (data: {
    title: string;
    description: string;
    department: DepartmentType;
    category: string;
    priority: PriorityLevel;
    location: LocationHierarchy;
    attachments: string[];
  }): string => {
    const seq = complaints.length + 102;
    const complaintId = `GBU-2026-C0${seq}`;
    const slaHoursMap: Record<PriorityLevel, number> = {
      emergency: 6,
      high: 24,
      medium: 48,
      low: 72,
    };

    const newComplaint: Complaint = {
      id: complaintId,
      title: data.title,
      description: data.description,
      department: data.department,
      category: data.category,
      priority: data.priority,
      slaTargetHours: slaHoursMap[data.priority],
      location: data.location,
      status: 'registered',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      registeredBy: {
        id: currentUser.id,
        name: currentUser.name,
        role: currentUser.role === 'student' ? 'Student Resident' : currentUser.role,
        phone: currentUser.phone,
        email: currentUser.email,
      },
      attachments: data.attachments,
    };

    setComplaints((prev) => [newComplaint, ...prev]);
    addAuditLog(
      'REGISTER_COMPLAINT',
      'Complaint',
      complaintId,
      `Registered complaint for ${data.location.building} (${data.department} / ${data.category}).`
    );
    addNotification(
      `New Complaint: ${complaintId}`,
      `${currentUser.name} reported: "${data.title}" at ${data.location.building}`,
      'info',
      complaintId
    );

    return complaintId;
  };

  const verifyComplaint = (
    complaintId: string,
    action: 'approve' | 'reject',
    data?: {
      priority?: PriorityLevel;
      category?: string;
      department?: DepartmentType;
      rejectionReason?: string;
    }
  ) => {
    const slaHoursMap: Record<PriorityLevel, number> = {
      emergency: 6,
      high: 24,
      medium: 48,
      low: 72,
    };

    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== complaintId) return c;
        if (action === 'reject') {
          return {
            ...c,
            status: 'rejected',
            rejectionReason: data?.rejectionReason || 'Marked as duplicate/invalid during officer review.',
            updatedAt: new Date().toISOString(),
          };
        }

        const newPriority = data?.priority || c.priority;
        return {
          ...c,
          status: 'verified',
          priority: newPriority,
          slaTargetHours: slaHoursMap[newPriority],
          department: data?.department || c.department,
          category: data?.category || c.category,
          updatedAt: new Date().toISOString(),
        };
      })
    );

    if (action === 'reject') {
      addAuditLog(
        'REJECT_COMPLAINT',
        'Complaint',
        complaintId,
        `Complaint rejected by ${currentUser.name}. Reason: ${data?.rejectionReason || 'Duplicate/Invalid'}`
      );
      addNotification(
        `Complaint Rejected: ${complaintId}`,
        `Complaint was reviewed and closed as invalid or duplicate.`,
        'info',
        complaintId
      );
    } else {
      addAuditLog(
        'VERIFY_COMPLAINT',
        'Complaint',
        complaintId,
        `Officer ${currentUser.name} verified and classified complaint as ${data?.priority || 'standard'} priority.`
      );
      addNotification(
        `Complaint Verified: ${complaintId}`,
        `Complaint verified by officer and moved to Work Order assignment queue.`,
        'approval',
        complaintId
      );
    }
  };

  const createWorkOrder = (
    complaintId: string,
    technicianId: string,
    estimatedHours: number,
    notes?: string
  ) => {
    const targetTech = technicians.find((t) => t.id === technicianId);
    const woId = `WO-2026-${complaintId.split('-C')[1] || '0100'}`;

    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== complaintId) return c;
        return {
          ...c,
          status: 'in_progress',
          updatedAt: new Date().toISOString(),
          workOrder: {
            id: woId,
            complaintId,
            department: c.department,
            technicianId,
            technicianName: targetTech?.name || 'Assigned Technician',
            technicianPhone: targetTech?.phone,
            createdAt: new Date().toISOString(),
            estimatedHours,
            technicianNotes: notes || '',
            materials: [],
            status: 'assigned',
          },
        };
      })
    );

    // Update technician workload
    setTechnicians((prev) =>
      prev.map((t) =>
        t.id === technicianId ? { ...t, activeWorkload: t.activeWorkload + 1 } : t
      )
    );

    addAuditLog(
      'CREATE_WORK_ORDER',
      'WorkOrder',
      woId,
      `Work order created and assigned to ${targetTech?.name || 'Technician'} (Est: ${estimatedHours}h).`
    );
    addNotification(
      `Job Assigned: ${woId}`,
      `Work order assigned to ${targetTech?.name} for complaint ${complaintId}.`,
      'assignment',
      complaintId
    );
  };

  const technicianStartWork = (complaintId: string) => {
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== complaintId || !c.workOrder) return c;
        return {
          ...c,
          status: 'in_progress',
          updatedAt: new Date().toISOString(),
          workOrder: {
            ...c.workOrder,
            status: 'in_progress',
            startedAt: new Date().toISOString(),
          },
        };
      })
    );

    addAuditLog(
      'START_WORK',
      'WorkOrder',
      complaintId,
      `Technician ${currentUser.name} clocked in and started active maintenance work.`
    );
  };

  const technicianUploadPhoto = (
    complaintId: string,
    type: 'before' | 'after',
    photoUrl: string
  ) => {
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== complaintId || !c.workOrder) return c;
        return {
          ...c,
          updatedAt: new Date().toISOString(),
          workOrder: {
            ...c.workOrder,
            beforePhotoUrl: type === 'before' ? photoUrl : c.workOrder.beforePhotoUrl,
            afterPhotoUrl: type === 'after' ? photoUrl : c.workOrder.afterPhotoUrl,
          },
        };
      })
    );

    addAuditLog(
      'UPLOAD_WORK_PHOTO',
      'WorkOrder',
      complaintId,
      `Uploaded ${type}-maintenance photographic evidence by ${currentUser.name}.`
    );
  };

  const requestMaterial = (
    complaintId: string,
    itemId: string,
    quantity: number
  ) => {
    const item = inventory.find((i) => i.id === itemId);
    if (!item) return;

    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== complaintId || !c.workOrder) return c;
        const existingMaterials = c.workOrder.materials || [];
        return {
          ...c,
          updatedAt: new Date().toISOString(),
          workOrder: {
            ...c.workOrder,
            materials: [
              ...existingMaterials,
              {
                itemId,
                itemName: item.name,
                requestedQty: quantity,
                status: 'requested',
              },
            ],
          },
        };
      })
    );

    addAuditLog(
      'REQUEST_MATERIAL',
      'Inventory',
      itemId,
      `Requested ${quantity} ${item.unit} of "${item.name}" for Work Order against ${complaintId}.`
    );
    addNotification(
      `Material Request: ${item.name}`,
      `Technician requested ${quantity} units of ${item.name} for ${complaintId}.`,
      'info',
      complaintId
    );
  };

  const issueMaterial = (
    complaintId: string,
    itemId: string,
    quantity: number
  ) => {
    // Deduct from inventory
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        const newQty = Math.max(0, item.quantityOnHand - quantity);
        return { ...item, quantityOnHand: newQty };
      })
    );

    // Update work order material status
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== complaintId || !c.workOrder) return c;
        const updatedMats = (c.workOrder.materials || []).map((m) => {
          if (m.itemId !== itemId) return m;
          return {
            ...m,
            issuedQty: quantity,
            status: 'issued' as const,
          };
        });
        return {
          ...c,
          updatedAt: new Date().toISOString(),
          workOrder: {
            ...c.workOrder,
            materials: updatedMats,
          },
        };
      })
    );

    const item = inventory.find((i) => i.id === itemId);
    addAuditLog(
      'ISSUE_MATERIAL',
      'Inventory',
      itemId,
      `Store Officer ${currentUser.name} issued ${quantity} units of "${item?.name || 'Material'}" against ${complaintId}.`
    );
    addNotification(
      `Material Issued: ${item?.name || 'Store Part'}`,
      `${quantity} units issued against complaint ${complaintId}. Inventory balances updated.`,
      'approval',
      complaintId
    );
  };

  const technicianCompleteWork = (
    complaintId: string,
    notes: string,
    afterPhotoUrl?: string
  ) => {
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== complaintId || !c.workOrder) return c;
        // Mark all issued materials as consumed
        const updatedMaterials = (c.workOrder.materials || []).map((m) => ({
          ...m,
          consumedQty: m.issuedQty || m.requestedQty,
          status: 'consumed' as const,
        }));

        return {
          ...c,
          status: 'inspection',
          updatedAt: new Date().toISOString(),
          workOrder: {
            ...c.workOrder,
            status: 'completed',
            completedAt: new Date().toISOString(),
            technicianNotes: notes,
            afterPhotoUrl: afterPhotoUrl || c.workOrder.afterPhotoUrl,
            materials: updatedMaterials,
          },
        };
      })
    );

    addAuditLog(
      'SUBMIT_FOR_INSPECTION',
      'WorkOrder',
      complaintId,
      `Technician ${currentUser.name} completed repair work and submitted for Officer inspection.`
    );
    addNotification(
      `Job Ready for Inspection: ${complaintId}`,
      `Technician finished work on ${complaintId}. Please inspect and verify quality.`,
      'completion',
      complaintId
    );
  };

  const inspectWorkOrder = (
    complaintId: string,
    status: 'accepted' | 'rejected',
    remarks: string
  ) => {
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== complaintId) return c;
        if (status === 'accepted') {
          return {
            ...c,
            status: 'resolved',
            updatedAt: new Date().toISOString(),
            inspection: {
              inspectedBy: currentUser.name,
              inspectedAt: new Date().toISOString(),
              status: 'accepted',
              remarks,
            },
          };
        } else {
          return {
            ...c,
            status: 'rework',
            updatedAt: new Date().toISOString(),
            inspection: {
              inspectedBy: currentUser.name,
              inspectedAt: new Date().toISOString(),
              status: 'rejected',
              remarks,
            },
            workOrder: c.workOrder
              ? { ...c.workOrder, status: 'rework' }
              : undefined,
          };
        }
      })
    );

    if (status === 'accepted') {
      addAuditLog(
        'INSPECT_ACCEPTED',
        'WorkOrder',
        complaintId,
        `Officer ${currentUser.name} inspected and APPROVED work for ${complaintId}. Sent for student confirmation.`
      );
      addNotification(
        `Work Accepted: ${complaintId}`,
        `Maintenance work verified and passed quality inspection. Awaiting resident feedback.`,
        'approval',
        complaintId
      );
    } else {
      addAuditLog(
        'INSPECT_REJECTED',
        'WorkOrder',
        complaintId,
        `Officer ${currentUser.name} REJECTED work for ${complaintId}. Sent back for rework: "${remarks}".`
      );
      addNotification(
        `Rework Required: ${complaintId}`,
        `Inspection failed. Corrective action required: ${remarks}`,
        'sla',
        complaintId
      );
    }
  };

  const submitFeedback = (
    complaintId: string,
    rating: number,
    comment: string
  ) => {
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== complaintId) return c;
        return {
          ...c,
          status: 'closed',
          updatedAt: new Date().toISOString(),
          feedback: {
            rating,
            comment,
            submittedAt: new Date().toISOString(),
            confirmedBy: currentUser.name,
          },
        };
      })
    );

    // Free technician workload
    const targetComp = complaints.find((c) => c.id === complaintId);
    if (targetComp?.workOrder?.technicianId) {
      const techId = targetComp.workOrder.technicianId;
      setTechnicians((prev) =>
        prev.map((t) =>
          t.id === techId
            ? { ...t, activeWorkload: Math.max(0, t.activeWorkload - 1) }
            : t
        )
      );
    }

    addAuditLog(
      'CLOSE_COMPLAINT',
      'Complaint',
      complaintId,
      `Resident ${currentUser.name} confirmed resolution with ${rating}-star feedback. Lifecycle closed.`
    );
    addNotification(
      `Complaint Closed: ${complaintId}`,
      `Resident gave ${rating} stars: "${comment}". Ticket officially closed.`,
      'info',
      complaintId
    );
  };

  const reopenComplaint = (complaintId: string, reason: string) => {
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id !== complaintId) return c;
        return {
          ...c,
          status: 'reopened',
          reopenReason: reason,
          updatedAt: new Date().toISOString(),
          workOrder: c.workOrder
            ? { ...c.workOrder, status: 'rework' }
            : undefined,
        };
      })
    );

    addAuditLog(
      'REOPEN_COMPLAINT',
      'Complaint',
      complaintId,
      `Complaint REOPENED by ${currentUser.name}. Reason: ${reason}`
    );
    addNotification(
      `Complaint Reopened: ${complaintId}`,
      `Resident flagged unresolved issue: "${reason}". Immediate corrective action required.`,
      'sla',
      complaintId
    );
  };

  const restockInventory = (itemId: string, quantity: number) => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        return {
          ...item,
          quantityOnHand: item.quantityOnHand + quantity,
          lastRestocked: new Date().toISOString().split('T')[0],
        };
      })
    );

    const targetItem = inventory.find((i) => i.id === itemId);
    addAuditLog(
      'RESTOCK_INVENTORY',
      'Inventory',
      itemId,
      `Restocked ${quantity} units of ${targetItem?.name || 'item'}. Balance updated.`
    );
  };

  const resetDemoData = () => {
    setComplaints(INITIAL_COMPLAINTS);
    setInventory(INITIAL_INVENTORY);
    setTechnicians(MOCK_TECHNICIANS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setCurrentUser(MOCK_USERS[0]);
    localStorage.removeItem('gbu_active_user');
    localStorage.removeItem('gbu_complaints');
    localStorage.removeItem('gbu_inventory');
    localStorage.removeItem('gbu_technicians');
    localStorage.removeItem('gbu_audit_logs');
    localStorage.removeItem('gbu_notifications');
  };

  const unreadNotificationCount = notifications.filter((n) => !n.read).length;

  return (
    <AppContext.Provider
      value={{
        currentUser,
        switchRole,
        complaints,
        inventory,
        technicians,
        auditLogs,
        notifications,
        unreadNotificationCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        registerComplaint,
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
        restockInventory,
        resetDemoData,
        theme,
        toggleTheme,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
