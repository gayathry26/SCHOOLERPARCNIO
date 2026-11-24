'use client';

import React, { useState } from 'react';
import {
  Boxes,
  Cpu,
  FlaskConical,
  Wrench,
  AlertTriangle,
  Plus,
  CheckCircle2,
  Clock,
  ArrowRightLeft,
  DollarSign,
  Building,
  UserCheck,
  Search,
  Barcode,
  QrCode,
  Printer,
  FileText,
  PackageCheck,
  ClipboardCheck,
  ShieldAlert,
  Truck,
  Layers,
  Settings2,
  Tag,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  RefreshCw,
  FolderPlus,
} from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tabs, TabItem } from '@/components/ui/Tabs';
import { Modal } from '@/components/ui/Modal';
import { StatCard } from '@/components/ui/StatCard';
import { DataTable, Column } from '@/components/ui/DataTable';
import { formatDate, formatCurrency } from '@/lib/formatters';

export interface InventoryClientProps {
  categories: any[];
  initialAssets: any[];
  vendors: any[];
  initialRequests: any[];
  initialPurchaseOrders: any[];
  initialMovements: any[];
  initialMaintenanceLogs: any[];
  initialAuditSessions: any[];
  departments: any[];
  staffUsers: any[];
  userRole: string;
}

export const InventoryClient: React.FC<InventoryClientProps> = ({
  categories: initialCategories,
  initialAssets,
  vendors: initialVendors,
  initialRequests,
  initialPurchaseOrders,
  initialMovements,
  initialMaintenanceLogs,
  initialAuditSessions,
  departments,
  staffUsers,
  userRole,
}) => {
  // Navigation
  const [activeTab, setActiveTab] = useState('items');

  // Core Data State
  const [assets, setAssets] = useState<any[]>(initialAssets);
  const [categories, setCategories] = useState<any[]>(initialCategories);
  const [vendors, setVendors] = useState<any[]>(initialVendors);
  const [requests, setRequests] = useState<any[]>(initialRequests);
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>(initialPurchaseOrders);
  const [movements, setMovements] = useState<any[]>(initialMovements);
  const [maintenanceLogs, setMaintenanceLogs] = useState<any[]>(initialMaintenanceLogs);
  const [auditSessions, setAuditSessions] = useState<any[]>(initialAuditSessions);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [stockStatusFilter, setStockStatusFilter] = useState('ALL');
  const [itemTypeFilter, setItemTypeFilter] = useState('ALL');
  const [movementTypeFilter, setMovementTypeFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modals
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isPoModalOpen, setIsPoModalOpen] = useState(false);
  const [isGrnModalOpen, setIsGrnModalOpen] = useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
  const [isDisposalModalOpen, setIsDisposalModalOpen] = useState(false);

  // Active Selections for Action Modals
  const [selectedAsset, setSelectedAsset] = useState<any | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<any | null>(null);
  const [selectedPo, setSelectedPo] = useState<any | null>(null);

  // 1. Item Master Form
  const [itemForm, setItemForm] = useState({
    name: '',
    categoryId: initialCategories[0]?.id || '',
    vendorId: initialVendors[0]?.id || '',
    location: 'Central Storage Room A',
    unit: 'PIECES',
    purchaseCost: '1500',
    unitPrice: '1500',
    currentQuantity: '10',
    minStockThreshold: '3',
    maxStockThreshold: '50',
    reorderLevel: '5',
    condition: 'EXCELLENT',
    isConsumable: false,
    serialNumber: '',
    amcDetails: '',
    warrantyExpiry: '',
    assignedDepartmentId: departments[0]?.id || '',
    depreciationRate: '10',
  });

  // 2. Issue Form
  const [issueForm, setIssueForm] = useState({
    issuedToUserId: staffUsers[0]?.id || '',
    returnDueDate: new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0],
    quantity: 1,
    remarks: 'Issued for classroom instruction and departmental duties',
  });

  // 3. Return Form
  const [returnForm, setReturnForm] = useState({
    conditionReturn: 'GOOD',
    remarks: 'Returned in satisfactory condition after class use',
  });

  // 4. Movement Form (Adjustment, Transfer, Damage)
  const [movementForm, setMovementForm] = useState({
    assetItemId: initialAssets[0]?.id || '',
    movementType: 'ADJUSTMENT',
    quantity: '5',
    fromLocation: 'Central Storage Room A',
    toLocation: 'Physics Lab Store',
    referenceNumber: '',
    unitCost: '1500',
    reason: 'Routine stock reconciliation and periodic verification',
  });

  // 5. Purchase Requisition Form
  const [requestForm, setRequestForm] = useState({
    itemTitle: '',
    categoryName: initialCategories[0]?.name || 'Laboratory Equipment',
    departmentName: departments[0]?.name || 'Science Department',
    priority: 'MEDIUM',
    quantity: 5,
    estimatedCost: '18500',
    reason: 'Required for term laboratory practicals and class projects',
    quotationRef: 'QUOT-2026-091',
    quotationVendor: initialVendors[0]?.name || 'Scientific Suppliers Co.',
    quotationAmount: '18000',
  });

  // 6. Purchase Order Form
  const [poForm, setPoForm] = useState({
    vendorId: initialVendors[0]?.id || '',
    purchaseRequestId: '',
    expectedDeliveryDate: new Date(Date.now() + 86400000 * 10).toISOString().split('T')[0],
    paymentTerms: 'Net 30 Days',
    notes: 'Please pack in moisture-proof containers and deliver to Central Campus Stores.',
    itemTitle: 'Standard Grade 10 Science Practicals Kits',
    assetItemId: initialAssets[0]?.id || '',
    quantity: 10,
    unitPrice: 2200,
  });

  // 7. GRN & Invoice Form
  const [grnForm, setGrnForm] = useState({
    purchaseOrderId: '',
    invoiceNumber: `INV-VND-${Date.now().toString().slice(-5)}`,
    invoiceDate: new Date().toISOString().split('T')[0],
    invoiceAmount: '',
    paymentStatus: 'PAID',
    paymentMode: 'ONLINE_BANK_TRANSFER',
    transactionRef: `NEFT-SBI-${Date.now().toString().slice(-6)}`,
    remarks: 'Shipment received in good packaging, verified physically by campus store officer.',
  });

  // 8. Maintenance / Repair Form
  const [maintenanceForm, setMaintenanceForm] = useState({
    assetItemId: initialAssets[0]?.id || '',
    maintenanceType: 'PREVENTIVE',
    serviceProvider: 'Authorized OEM Service Engineers',
    technicianName: 'Rajesh Sharma',
    technicianContact: '+91 98765 43210',
    description: 'Quarterly sensor recalibration, optical alignment, and deep cleaning',
    cost: '2400',
    status: 'COMPLETED',
    nextServiceDate: new Date(Date.now() + 86400000 * 90).toISOString().split('T')[0],
  });

  // 9. Disposal Form
  const [disposalForm, setDisposalForm] = useState({
    disposalMethod: 'SCRAPPED',
    disposalValue: '0',
    disposalReason: 'Beyond economical repair and obsolete technology',
  });

  // 10. Audit Reconciliation Form
  const [auditForm, setAuditForm] = useState({
    auditorName: 'Senior Internal Auditor',
    departmentName: 'Central Campus Stores & Labs',
    remarks: 'Comprehensive Q3 physical verification and ledger synchronization.',
    counts: initialAssets.slice(0, 8).map((a) => ({
      assetItemId: a.id,
      assetName: a.name,
      assetCode: a.assetCode,
      systemQuantity: a.currentQuantity,
      physicalQuantity: a.currentQuantity,
      unitCost: a.purchaseCost,
      reconcile: true,
      reason: 'Physical count verified on site',
    })),
  });

  // 11. Vendor Form
  const [vendorForm, setVendorForm] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: 'Sector 62, Noida Industrial Area, UP',
    gstNumber: '07AAAAA0000A1Z5',
    category: 'Laboratory Equipment',
    paymentTerms: 'Net 30 Days',
  });

  // 12. Category Form
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    code: '',
    isAsset: false,
    description: 'Specialized institutional inventory items and store materials',
  });

  // Feedback Notification auto-clear
  const showFeedback = (success: string | null, error: string | null = null) => {
    setSuccessMsg(success);
    setErrorMsg(error);
    if (success) {
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  };

  // High-Level KPIs
  const totalValuation = assets.reduce((acc, a) => acc + (a.purchaseCost || 0) * (a.currentQuantity || 0), 0);
  const lowStockItems = assets.filter((a) => (a.currentQuantity || 0) <= (a.reorderLevel || a.minStockThreshold || 0));
  const pendingRequests = requests.filter((r) => r.status === 'PENDING');
  const activePOs = purchaseOrders.filter((p) => p.status === 'ISSUED' || p.status === 'PARTIALLY_DELIVERED');
  const damagedAssets = assets.filter((a) => a.condition === 'DAMAGED' || a.condition === 'NEEDS_REPAIR');
  const activeIssuesCount = assets.reduce((acc, a) => acc + (a.issues?.length || 0), 0);

  // Filtered Assets
  const filteredAssets = assets.filter((a) => {
    if (categoryFilter !== 'ALL' && a.categoryId !== categoryFilter) return false;
    if (itemTypeFilter === 'CONSUMABLE' && !a.isConsumable) return false;
    if (itemTypeFilter === 'CAPITAL_ASSET' && a.isConsumable) return false;
    if (stockStatusFilter === 'LOW_STOCK') {
      return a.currentQuantity <= (a.reorderLevel || a.minStockThreshold);
    }
    if (stockStatusFilter === 'OUT_OF_STOCK') {
      return a.currentQuantity === 0;
    }
    if (stockStatusFilter === 'HEALTHY') {
      return a.currentQuantity > (a.reorderLevel || a.minStockThreshold);
    }
    return true;
  });

  // Filtered Movements
  const filteredMovements = movements.filter((m) => {
    if (movementTypeFilter !== 'ALL' && m.movementType !== movementTypeFilter) return false;
    return true;
  });

  // -------------------------------------------------------------
  // HANDLERS
  // -------------------------------------------------------------

  // 1. Create Item Master
  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CREATE_ASSET', ...itemForm }),
      });
      const data = await res.json();
      if (res.ok) {
        setAssets([data.asset, ...assets]);
        setIsItemModalOpen(false);
        showFeedback(`Successfully registered "${data.asset.name}" (${data.asset.assetCode})`);
      } else {
        showFeedback(null, data.error || 'Failed to create item');
      }
    } catch (e: any) {
      showFeedback(null, e.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. Issue Asset
  const handleIssueAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset) return;
    setLoading(true);
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'ISSUE_ASSET',
          assetId: selectedAsset.id,
          ...issueForm,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setAssets((prev) =>
          prev.map((a) =>
            a.id === selectedAsset.id
              ? {
                  ...a,
                  currentQuantity: a.currentQuantity - issueForm.quantity,
                  issues: [data.issue, ...(a.issues || [])],
                }
              : a
          )
        );
        setIsIssueModalOpen(false);
        setSelectedAsset(null);
        showFeedback(`Issued ${issueForm.quantity} unit(s) of ${selectedAsset.name}`);
      } else {
        showFeedback(null, data.error || 'Failed to issue item');
      }
    } catch (e: any) {
      showFeedback(null, e.message);
    } finally {
      setLoading(false);
    }
  };

  // 3. Return Asset
  const handleReturnAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIssue) return;
    setLoading(true);
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'RETURN_ASSET',
          issueId: selectedIssue.id,
          conditionReturn: returnForm.conditionReturn,
          remarks: returnForm.remarks,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setAssets((prev) =>
          prev.map((a) => {
            const hasIssue = a.issues?.some((i: any) => i.id === selectedIssue.id);
            if (!hasIssue) return a;
            return {
              ...a,
              currentQuantity: a.currentQuantity + selectedIssue.quantity,
              condition: returnForm.conditionReturn,
              issues: a.issues.filter((i: any) => i.id !== selectedIssue.id),
            };
          })
        );
        setIsReturnModalOpen(false);
        setSelectedIssue(null);
        showFeedback('Asset returned successfully and restocked to central ledger.');
      } else {
        showFeedback(null, data.error || 'Failed to acknowledge return');
      }
    } catch (e: any) {
      showFeedback(null, e.message);
    } finally {
      setLoading(false);
    }
  };

  // 4. Stock Movement (Adjust, Transfer, Damage)
  const handleRecordMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'RECORD_STOCK_MOVEMENT', ...movementForm }),
      });
      const data = await res.json();
      if (res.ok) {
        setMovements([data.movement, ...movements]);
        setAssets((prev) =>
          prev.map((a) => (a.id === movementForm.assetItemId ? { ...a, currentQuantity: data.newQuantity } : a))
        );
        setIsMovementModalOpen(false);
        showFeedback(`Stock movement (${movementForm.movementType}) recorded. Updated stock: ${data.newQuantity}`);
      } else {
        showFeedback(null, data.error || 'Failed to record movement');
      }
    } catch (e: any) {
      showFeedback(null, e.message);
    } finally {
      setLoading(false);
    }
  };

  // 5. Purchase Requisition
  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'PURCHASE_REQUEST', ...requestForm }),
      });
      const data = await res.json();
      if (res.ok) {
        setRequests([data.purchaseRequest, ...requests]);
        setIsRequestModalOpen(false);
        showFeedback(`Requisition "${requestForm.itemTitle}" submitted for approval`);
      } else {
        showFeedback(null, data.error || 'Failed to raise request');
      }
    } catch (e: any) {
      showFeedback(null, e.message);
    } finally {
      setLoading(false);
    }
  };

  // 6. Approve / Reject Purchase Request
  const handleApproveRequest = async (requestId: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'APPROVE_PURCHASE', requestId, status }),
      });
      const data = await res.json();
      if (res.ok) {
        setRequests((prev) => prev.map((r) => (r.id === requestId ? data.purchaseRequest : r)));
        showFeedback(`Requisition marked as ${status}`);
      } else {
        showFeedback(null, data.error || 'Failed to update request');
      }
    } catch (e: any) {
      showFeedback(null, e.message);
    }
  };

  // 7. Create Purchase Order (PO)
  const handleCreatePO = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const lineItem = {
        itemTitle: poForm.itemTitle,
        assetItemId: poForm.assetItemId || null,
        quantity: poForm.quantity,
        unitPrice: poForm.unitPrice,
      };

      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CREATE_PURCHASE_ORDER',
          vendorId: poForm.vendorId,
          purchaseRequestId: poForm.purchaseRequestId || null,
          expectedDeliveryDate: poForm.expectedDeliveryDate,
          paymentTerms: poForm.paymentTerms,
          notes: poForm.notes,
          items: [lineItem],
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPurchaseOrders([data.purchaseOrder, ...purchaseOrders]);
        if (poForm.purchaseRequestId) {
          setRequests((prev) =>
            prev.map((r) => (r.id === poForm.purchaseRequestId ? { ...r, status: 'ORDERED' } : r))
          );
        }
        setIsPoModalOpen(false);
        showFeedback(`Purchase Order ${data.purchaseOrder.poNumber} created successfully`);
      } else {
        showFeedback(null, data.error || 'Failed to create PO');
      }
    } catch (e: any) {
      showFeedback(null, e.message);
    } finally {
      setLoading(false);
    }
  };

  // 8. Goods Received Note (GRN) & Vendor Invoice
  const handleRecordGRN = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPo) return;
    setLoading(true);
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'RECORD_GRN',
          purchaseOrderId: selectedPo.id,
          invoiceNumber: grnForm.invoiceNumber,
          invoiceDate: grnForm.invoiceDate,
          invoiceAmount: grnForm.invoiceAmount || selectedPo.totalAmount,
          paymentStatus: grnForm.paymentStatus,
          paymentMode: grnForm.paymentMode,
          transactionRef: grnForm.transactionRef,
          remarks: grnForm.remarks,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setPurchaseOrders((prev) =>
          prev.map((p) => (p.id === selectedPo.id ? { ...p, status: 'DELIVERED', grns: [data.grn, ...(p.grns || [])] } : p))
        );
        setIsGrnModalOpen(false);
        setSelectedPo(null);
        showFeedback(`GRN ${data.grn.grnNumber} recorded! Stock replenished & Expense logged in Accounting.`);
      } else {
        showFeedback(null, data.error || 'Failed to record GRN');
      }
    } catch (e: any) {
      showFeedback(null, e.message);
    } finally {
      setLoading(false);
    }
  };

  // 9. Maintenance / Repair
  const handleRecordMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'RECORD_MAINTENANCE', ...maintenanceForm }),
      });
      const data = await res.json();
      if (res.ok) {
        setMaintenanceLogs([data.maintenanceLog, ...maintenanceLogs]);
        if (maintenanceForm.status === 'COMPLETED') {
          setAssets((prev) =>
            prev.map((a) => (a.id === maintenanceForm.assetItemId ? { ...a, condition: 'EXCELLENT' } : a))
          );
        }
        setIsMaintenanceModalOpen(false);
        showFeedback('Maintenance service log recorded and asset status updated.');
      } else {
        showFeedback(null, data.error || 'Failed to log maintenance');
      }
    } catch (e: any) {
      showFeedback(null, e.message);
    } finally {
      setLoading(false);
    }
  };

  // 10. Disposal / Condemnation
  const handleDisposeAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset) return;
    setLoading(true);
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'DISPOSE_ASSET',
          assetId: selectedAsset.id,
          ...disposalForm,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setAssets((prev) =>
          prev.map((a) =>
            a.id === selectedAsset.id ? { ...a, condition: 'DISPOSED', currentQuantity: 0 } : a
          )
        );
        setIsDisposalModalOpen(false);
        setSelectedAsset(null);
        showFeedback(`Asset ${selectedAsset.assetCode} officially decommissioned & written off`);
      } else {
        showFeedback(null, data.error || 'Failed to dispose asset');
      }
    } catch (e: any) {
      showFeedback(null, e.message);
    } finally {
      setLoading(false);
    }
  };

  // 11. Stock Audit
  const handleStockAudit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'RECORD_STOCK_AUDIT',
          auditorName: auditForm.auditorName,
          departmentName: auditForm.departmentName,
          remarks: auditForm.remarks,
          items: auditForm.counts,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setAuditSessions([data.auditSession, ...auditSessions]);
        // Update local asset quantities for reconciled items
        setAssets((prev) =>
          prev.map((a) => {
            const counted = auditForm.counts.find((c) => c.assetItemId === a.id);
            if (counted && counted.reconcile) {
              return { ...a, currentQuantity: counted.physicalQuantity };
            }
            return a;
          })
        );
        setIsAuditModalOpen(false);
        showFeedback(`Audit ${data.auditSession.auditCode} completed with automatic ledger reconciliation!`);
      } else {
        showFeedback(null, data.error || 'Failed to record audit');
      }
    } catch (e: any) {
      showFeedback(null, e.message);
    } finally {
      setLoading(false);
    }
  };

  // 12. Create Vendor
  const handleCreateVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CREATE_VENDOR', ...vendorForm }),
      });
      const data = await res.json();
      if (res.ok) {
        setVendors([data.vendor, ...vendors]);
        setIsVendorModalOpen(false);
        showFeedback(`Supplier ${data.vendor.name} registered successfully`);
      } else {
        showFeedback(null, data.error || 'Failed to create vendor');
      }
    } catch (e: any) {
      showFeedback(null, e.message);
    } finally {
      setLoading(false);
    }
  };

  // 13. Create Category
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CREATE_CATEGORY', ...categoryForm }),
      });
      const data = await res.json();
      if (res.ok) {
        setCategories([...categories, data.category]);
        setIsCategoryModalOpen(false);
        showFeedback(`Inventory category ${data.category.name} created`);
      } else {
        showFeedback(null, data.error || 'Failed to create category');
      }
    } catch (e: any) {
      showFeedback(null, e.message);
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // TABS CONFIGURATION
  // -------------------------------------------------------------
  const tabs: TabItem[] = [
    {
      id: 'items',
      label: 'Item Master & Stock Ledger',
      count: assets.length,
      icon: <Boxes className="w-4 h-4 text-[#990000]" />,
    },
    {
      id: 'movements',
      label: 'Stock Movements & Ledger',
      count: movements.length,
      icon: <ArrowRightLeft className="w-4 h-4 text-emerald-600" />,
    },
    {
      id: 'procurement',
      label: 'Procurement & Purchase Orders',
      count: pendingRequests.length + activePOs.length,
      icon: <Truck className="w-4 h-4 text-indigo-600" />,
    },
    {
      id: 'assets',
      label: 'Capital Assets & Maintenance',
      count: assets.filter((a) => !a.isConsumable).length,
      icon: <Wrench className="w-4 h-4 text-amber-500" />,
    },
    {
      id: 'audit',
      label: 'Physical Stock Audit',
      count: auditSessions.length,
      icon: <ClipboardCheck className="w-4 h-4 text-purple-600" />,
    },
    {
      id: 'vendors',
      label: 'Suppliers & Categories',
      count: vendors.length,
      icon: <Building className="w-4 h-4 text-slate-600" />,
    },
  ];

  // -------------------------------------------------------------
  // COLUMNS: ITEMS MASTER TABLE
  // -------------------------------------------------------------
  const itemColumns: Column<any>[] = [
    {
      key: 'code',
      header: 'Item Code & Tags',
      render: (row) => (
        <div>
          <span className="font-mono text-xs font-bold text-[#990000]">{row.assetCode}</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <button
              onClick={() => {
                setSelectedAsset(row);
                setIsBarcodeModalOpen(true);
              }}
              title="Print Barcode / QR Label"
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
            >
              <Barcode className="w-3 h-3 text-slate-500" />
              <span>{row.barcode || '890100234'}</span>
            </button>
            <button
              onClick={() => {
                setSelectedAsset(row);
                setIsBarcodeModalOpen(true);
              }}
              className="p-1 rounded text-slate-500 hover:text-[#990000] hover:bg-slate-100"
              title="View QR Code"
            >
              <QrCode className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ),
    },
    {
      key: 'name',
      header: 'Item Description & Category',
      render: (row) => (
        <div>
          <span className="font-bold text-slate-900 text-sm block">{row.name}</span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-slate-500">{row.category?.name || 'General Stores'}</span>
            <Badge variant={row.isConsumable ? 'teal' : 'indigo'} size="xs">
              {row.isConsumable ? 'Consumable' : 'Capital Asset'}
            </Badge>
          </div>
        </div>
      ),
    },
    {
      key: 'location',
      header: 'Store Location & Unit',
      render: (row) => (
        <div>
          <span className="text-xs font-semibold text-slate-800 block">{row.location}</span>
          <span className="text-[11px] text-slate-400 font-mono">Unit: {row.unit || 'PIECES'}</span>
        </div>
      ),
    },
    {
      key: 'stock',
      header: 'Stock Levels & Reorder',
      render: (row) => {
        const isLow = row.currentQuantity <= (row.reorderLevel || row.minStockThreshold);
        const isOut = row.currentQuantity === 0;
        return (
          <div className="space-y-1 min-w-[130px]">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono font-bold text-slate-900">
                {row.currentQuantity} {row.unit || 'PCS'}
              </span>
              {isOut ? (
                <Badge variant="rose" size="xs">Out of Stock</Badge>
              ) : isLow ? (
                <Badge variant="amber" size="xs">Reorder Needed</Badge>
              ) : (
                <Badge variant="emerald" size="xs">Optimal</Badge>
              )}
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  isOut ? 'bg-rose-500 w-0' : isLow ? 'bg-amber-500 w-1/4' : 'bg-[#990000] w-3/4'
                }`}
              />
            </div>
            <span className="text-[10px] text-slate-400 block">
              Min: {row.minStockThreshold} • Reorder: {row.reorderLevel || 5} • Max: {row.maxStockThreshold || 100}
            </span>
          </div>
        );
      },
    },
    {
      key: 'valuation',
      header: 'Cost & Total Valuation',
      render: (row) => (
        <div>
          <span className="font-mono text-xs font-semibold text-slate-900 block">
            {formatCurrency(row.purchaseCost)} / unit
          </span>
          <span className="text-[11px] font-mono text-emerald-700 font-bold block">
            Total: {formatCurrency(row.purchaseCost * row.currentQuantity)}
          </span>
        </div>
      ),
    },
    {
      key: 'condition',
      header: 'Condition / Status',
      render: (row) => (
        <Badge
          variant={
            row.condition === 'EXCELLENT'
              ? 'emerald'
              : row.condition === 'GOOD'
              ? 'blue'
              : row.condition === 'NEEDS_REPAIR'
              ? 'amber'
              : 'rose'
          }
        >
          {row.condition}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Quick Actions',
      render: (row) => (
        <div className="flex items-center gap-1.5">
          <Button
            size="xs"
            variant="outline"
            disabled={row.currentQuantity === 0}
            onClick={() => {
              setSelectedAsset(row);
              setIsIssueModalOpen(true);
            }}
            title="Issue to staff custodian"
          >
            Issue
          </Button>
          <Button
            size="xs"
            variant="outline"
            onClick={() => {
              setMovementForm({
                ...movementForm,
                assetItemId: row.id,
                fromLocation: row.location,
                toLocation: row.location,
                unitCost: String(row.purchaseCost),
              });
              setIsMovementModalOpen(true);
            }}
            title="Record Stock In, Out, Adjustment or Damage"
          >
            Adjust
          </Button>
        </div>
      ),
    },
  ];

  // -------------------------------------------------------------
  // COLUMNS: MOVEMENTS TABLE
  // -------------------------------------------------------------
  const movementColumns: Column<any>[] = [
    {
      key: 'date',
      header: 'Timestamp',
      render: (row) => (
        <div>
          <span className="font-mono text-xs text-slate-900 font-semibold block">
            {formatDate(row.createdAt, 'dd MMM yyyy')}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            {new Date(row.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      ),
    },
    {
      key: 'item',
      header: 'Item Code & Name',
      render: (row) => (
        <div>
          <span className="font-bold text-slate-900 text-xs block">{row.assetItem?.name || 'Inventory Item'}</span>
          <span className="text-[11px] font-mono text-[#990000]">{row.assetItem?.assetCode}</span>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Movement Type',
      render: (row) => {
        const isPositive = ['STOCK_IN', 'RETURN'].includes(row.movementType);
        const isNegative = ['STOCK_OUT', 'ISSUE', 'DAMAGE', 'DISPOSAL'].includes(row.movementType);
        return (
          <Badge
            variant={
              isPositive
                ? 'emerald'
                : isNegative
                ? 'rose'
                : row.movementType === 'TRANSFER'
                ? 'blue'
                : 'amber'
            }
          >
            {row.movementType}
          </Badge>
        );
      },
    },
    {
      key: 'qty',
      header: 'Quantity & Stock Change',
      render: (row) => (
        <div>
          <span className="font-bold font-mono text-slate-900 text-xs block">
            Qty: {row.quantity}
          </span>
          <span className="text-[11px] text-slate-500 font-mono">
            {row.previousQuantity} &rarr; <strong className="text-slate-800">{row.newQuantity}</strong>
          </span>
        </div>
      ),
    },
    {
      key: 'locations',
      header: 'From &rarr; To Location',
      render: (row) => (
        <div className="text-xs text-slate-700">
          <span className="text-slate-500 block text-[11px]">From: {row.fromLocation || 'Store'}</span>
          <span className="font-semibold text-slate-800 block text-[11px]">To: {row.toLocation || 'Campus'}</span>
        </div>
      ),
    },
    {
      key: 'details',
      header: 'Reference & Reason',
      render: (row) => (
        <div>
          <span className="font-mono text-[11px] font-bold text-slate-700 block">
            Ref: {row.referenceNumber}
          </span>
          <span className="text-slate-500 text-xs block max-w-xs truncate">{row.reason}</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">By: {row.recordedBy}</span>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* HEADER BANNER */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-white border border-[#E5E5E5] p-6 rounded-2xl shadow-2xs">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FEF2F2] text-[#990000] flex items-center justify-center font-bold">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  Campus Inventory, Procurement &amp; Asset Management
                </h1>
                <Badge variant="blue" size="sm">
                  MySQL XAMPP Persistent
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Centralized institutional ledger for lab equipment, computers, uniforms, books, procurement POs, warranties, and stock audits.
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsRequestModalOpen(true)}
            className="flex items-center gap-1.5"
          >
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Raise Requisition
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsPoModalOpen(true)}
            className="flex items-center gap-1.5"
          >
            <Truck className="w-3.5 h-3.5 text-indigo-600" />
            Generate PO
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsMovementModalOpen(true)}
            className="flex items-center gap-1.5"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-600" />
            Stock Movement
          </Button>

          <Button
            size="sm"
            variant="primary"
            className="bg-[#990000] hover:bg-[#800000] text-white flex items-center gap-1.5"
            onClick={() => setIsItemModalOpen(true)}
          >
            <Plus className="w-3.5 h-3.5" />
            Add Item / Asset Master
          </Button>
        </div>
      </div>

      {/* ALERT FEEDBACK NOTIFICATIONS */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-700 hover:text-emerald-900 font-bold">
            &times;
          </button>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-rose-700 hover:text-rose-900 font-bold">
            &times;
          </button>
        </div>
      )}

      {/* DASHBOARD STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Stock & Asset Valuation"
          value={formatCurrency(totalValuation)}
          subtitle={`${assets.length} active master catalog items`}
          trend="up"
          variant="blue"
          icon={<DollarSign className="w-5 h-5 text-[#990000]" />}
        />
        <StatCard
          title="Low Stock & Reorder Alerts"
          value={lowStockItems.length}
          subtitle={lowStockItems.length > 0 ? 'Buffer threshold breached' : 'All stores healthy'}
          trend={lowStockItems.length > 0 ? 'down' : 'neutral'}
          variant={lowStockItems.length > 0 ? 'amber' : 'emerald'}
          icon={<AlertTriangle className="w-5 h-5 text-amber-500" />}
        />
        <StatCard
          title="Procurement & Active Orders"
          value={activePOs.length}
          subtitle={`${pendingRequests.length} requisitions awaiting approval`}
          trend="neutral"
          variant="indigo"
          icon={<Truck className="w-5 h-5 text-indigo-600" />}
        />
        <StatCard
          title="Damaged / Maintenance"
          value={damagedAssets.length}
          subtitle={`${activeIssuesCount} assets currently checked out`}
          trend={damagedAssets.length > 0 ? 'down' : 'neutral'}
          variant="rose"
          icon={<Wrench className="w-5 h-5 text-rose-500" />}
        />
      </div>

      {/* TABS NAVIGATION */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* ========================================================= */}
      {/* TAB 1: ITEM MASTER & STOCK LEDGER */}
      {/* ========================================================= */}
      {activeTab === 'items' && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  Item Master &amp; Central Stock Register
                </CardTitle>
                <p className="text-xs text-slate-500 mt-1">
                  Item codes, barcodes, QR verification, real-time inventory counts, safety buffer, and valuation.
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center flex-wrap gap-2.5">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 outline-none focus:border-[#990000]"
                >
                  <option value="ALL">All Categories ({categories.length})</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <select
                  value={stockStatusFilter}
                  onChange={(e) => setStockStatusFilter(e.target.value)}
                  className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 outline-none focus:border-[#990000]"
                >
                  <option value="ALL">All Stock Levels</option>
                  <option value="LOW_STOCK">Low Stock / Reorder Needed</option>
                  <option value="OUT_OF_STOCK">Out of Stock (0)</option>
                  <option value="HEALTHY">Healthy / Optimal</option>
                </select>

                <select
                  value={itemTypeFilter}
                  onChange={(e) => setItemTypeFilter(e.target.value)}
                  className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 outline-none focus:border-[#990000]"
                >
                  <option value="ALL">All Item Types</option>
                  <option value="CONSUMABLE">Consumables Only</option>
                  <option value="CAPITAL_ASSET">Fixed / Capital Assets Only</option>
                </select>
              </div>
            </div>
          </CardHeader>

          <DataTable
            data={filteredAssets}
            columns={itemColumns}
            searchable
            searchPlaceholder="Search item name, code, barcode, or room..."
            pagination
            pageSize={10}
          />
        </Card>
      )}

      {/* ========================================================= */}
      {/* TAB 2: STOCK MOVEMENTS & AUDIT LEDGER */}
      {/* ========================================================= */}
      {activeTab === 'movements' && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  Stock Movement &amp; Audit Trail Ledger
                </CardTitle>
                <p className="text-xs text-slate-500 mt-1">
                  Complete transactional history: Stock-In, Stock-Out, Adjustments, Transfers, Issues, Returns, and Damage write-offs.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={movementTypeFilter}
                  onChange={(e) => setMovementTypeFilter(e.target.value)}
                  className="text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white text-slate-700 outline-none focus:border-[#990000]"
                >
                  <option value="ALL">All Movement Types</option>
                  <option value="STOCK_IN">Stock In (GRN / Replenish)</option>
                  <option value="STOCK_OUT">Stock Out</option>
                  <option value="ADJUSTMENT">Stock Adjustment</option>
                  <option value="TRANSFER">Internal Transfer</option>
                  <option value="ISSUE">Staff Issue</option>
                  <option value="RETURN">Staff Return</option>
                  <option value="DAMAGE">Damaged Goods</option>
                  <option value="DISPOSAL">Decommission / Disposal</option>
                </select>

                <Button
                  size="sm"
                  variant="primary"
                  className="bg-[#990000] text-white"
                  onClick={() => setIsMovementModalOpen(true)}
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Log Movement
                </Button>
              </div>
            </div>
          </CardHeader>

          <DataTable
            data={filteredMovements}
            columns={movementColumns}
            searchable
            searchPlaceholder="Search reference, item or custodian..."
            pagination
            pageSize={10}
          />
        </Card>
      )}

      {/* ========================================================= */}
      {/* TAB 3: PROCUREMENT & PURCHASE ORDERS */}
      {/* ========================================================= */}
      {activeTab === 'procurement' && (
        <div className="space-y-6">
          {/* SECTION A: PURCHASE REQUISITIONS */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900">
                    Departmental Purchase Requisitions &amp; Quotations
                  </CardTitle>
                  <p className="text-xs text-slate-500 mt-1">
                    Multi-tier approval workflow with vendor quotations, priority tags, and cost estimates.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="primary"
                  className="bg-[#990000] text-white"
                  onClick={() => setIsRequestModalOpen(true)}
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> New Requisition
                </Button>
              </div>
            </CardHeader>

            <div className="p-5 space-y-3">
              {requests.map((req) => (
                <div
                  key={req.id}
                  className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs transition-colors hover:border-[#990000]/40"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-sm">{req.itemTitle}</h4>
                      <Badge
                        variant={
                          req.status === 'APPROVED'
                            ? 'emerald'
                            : req.status === 'ORDERED'
                            ? 'blue'
                            : req.status === 'REJECTED'
                            ? 'rose'
                            : 'amber'
                        }
                      >
                        {req.status}
                      </Badge>
                      <Badge
                        variant={
                          req.priority === 'URGENT'
                            ? 'rose'
                            : req.priority === 'HIGH'
                            ? 'amber'
                            : 'slate'
                        }
                        size="xs"
                      >
                        {req.priority || 'MEDIUM'}
                      </Badge>
                    </div>
                    <p className="text-slate-600">{req.reason}</p>
                    <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500 font-mono">
                      <span>Category: {req.categoryName}</span>
                      <span>Dept: {req.departmentName || 'General'}</span>
                      <span>Qty: {req.quantity}</span>
                      <span>Est: {formatCurrency(req.estimatedCost)}</span>
                      {req.quotationVendor && (
                        <span className="text-indigo-700 font-semibold">
                          Quote: {req.quotationVendor} ({formatCurrency(req.quotationAmount)})
                        </span>
                      )}
                      <span>
                        Requested by: {req.requestedBy?.firstName} {req.requestedBy?.lastName || ''}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {req.status === 'PENDING' &&
                      ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'PRINCIPAL', 'ACCOUNTANT'].includes(userRole) && (
                        <>
                          <Button
                            size="xs"
                            variant="outline"
                            className="text-rose-600 border-rose-200 hover:bg-rose-50"
                            onClick={() => handleApproveRequest(req.id, 'REJECTED')}
                          >
                            Reject
                          </Button>
                          <Button
                            size="xs"
                            variant="primary"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={() => handleApproveRequest(req.id, 'APPROVED')}
                          >
                            Approve
                          </Button>
                        </>
                      )}

                    {req.status === 'APPROVED' && (
                      <Button
                        size="xs"
                        variant="primary"
                        className="bg-[#990000] text-white flex items-center gap-1"
                        onClick={() => {
                          setPoForm({
                            ...poForm,
                            purchaseRequestId: req.id,
                            itemTitle: req.itemTitle,
                            quantity: req.quantity,
                            unitPrice: Math.round(req.estimatedCost / req.quantity),
                          });
                          setIsPoModalOpen(true);
                        }}
                      >
                        <Truck className="w-3 h-3" />
                        Create Purchase Order
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {requests.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-6">No purchase requisitions found.</p>
              )}
            </div>
          </Card>

          {/* SECTION B: PURCHASE ORDERS & GRN */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900">
                    Purchase Orders (PO) &amp; Goods Received Notes (GRN)
                  </CardTitle>
                  <p className="text-xs text-slate-500 mt-1">
                    Formal supplier orders with 18% GST calculation, delivery status, and automatic inventory check-in.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="primary"
                  className="bg-[#990000] text-white"
                  onClick={() => setIsPoModalOpen(true)}
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> New Purchase Order
                </Button>
              </div>
            </CardHeader>

            <div className="p-5 space-y-4">
              {purchaseOrders.map((po) => (
                <div
                  key={po.id}
                  className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 transition-colors hover:border-[#990000]/40"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#990000] text-sm">{po.poNumber}</span>
                      <Badge
                        variant={
                          po.status === 'DELIVERED'
                            ? 'emerald'
                            : po.status === 'ISSUED'
                            ? 'blue'
                            : 'amber'
                        }
                      >
                        {po.status}
                      </Badge>
                      <span className="text-xs text-slate-500">
                        Vendor: <strong className="text-slate-800">{po.vendor?.name}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        Total: {formatCurrency(po.totalAmount)}
                      </span>
                      {po.status === 'ISSUED' && (
                        <Button
                          size="xs"
                          variant="primary"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1"
                          onClick={() => {
                            setSelectedPo(po);
                            setGrnForm({
                              ...grnForm,
                              purchaseOrderId: po.id,
                              invoiceAmount: String(po.totalAmount),
                            });
                            setIsGrnModalOpen(true);
                          }}
                        >
                          <PackageCheck className="w-3.5 h-3.5" />
                          Receive Shipment (GRN)
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Line Items */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {po.items?.map((it: any) => (
                      <div key={it.id} className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                        <span className="font-semibold text-slate-900 block truncate">{it.itemTitle}</span>
                        <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono mt-0.5">
                          <span>Qty: {it.quantity} &times; {formatCurrency(it.unitPrice)}</span>
                          <span className="font-bold text-slate-800">{formatCurrency(it.totalPrice)}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* GRN & Invoice Reference if already delivered */}
                  {po.grns && po.grns.length > 0 && (
                    <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] flex items-center justify-between text-emerald-900">
                      <div>
                        <strong>GRN Received:</strong> {po.grns[0]?.grnNumber} • Invoice #{' '}
                        {po.grns[0]?.invoiceNumber || 'N/A'} (
                        {formatCurrency(po.grns[0]?.invoiceAmount)})
                      </div>
                      <Badge variant="emerald" size="xs">
                        {po.grns[0]?.paymentStatus || 'PAID'}
                      </Badge>
                    </div>
                  )}
                </div>
              ))}
              {purchaseOrders.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-6">No purchase orders recorded.</p>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: CAPITAL ASSETS & MAINTENANCE */}
      {/* ========================================================= */}
      {activeTab === 'assets' && (
        <div className="space-y-6">
          {/* Active Custody Issues */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900">
                    Faculty &amp; Staff Custody Tracking (Active Issues)
                  </CardTitle>
                  <p className="text-xs text-slate-500 mt-1">
                    Checked out laptops, projectors, and specialized apparatus with return due dates.
                  </p>
                </div>
              </div>
            </CardHeader>
            <div className="p-5 space-y-3">
              {assets.flatMap((a) =>
                (a.issues || []).map((issue: any) => (
                  <div
                    key={issue.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                        <ArrowRightLeft className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{a.name}</h4>
                        <span className="text-slate-500">
                          Issued to: <strong className="text-slate-800">{issue.issuedTo?.firstName} {issue.issuedTo?.lastName || ''}</strong> • Qty: {issue.quantity} unit(s)
                        </span>
                        <span className="block text-[11px] text-slate-400 mt-0.5">{issue.remarks}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <div className="text-right">
                        <span className="text-[11px] text-slate-400 block">Return Due Date</span>
                        <span className="font-mono font-bold text-slate-900 block">{formatDate(issue.returnDueDate)}</span>
                      </div>
                      <Button
                        size="xs"
                        variant="outline"
                        className="text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                        onClick={() => {
                          setSelectedIssue(issue);
                          setIsReturnModalOpen(true);
                        }}
                      >
                        Acknowledge Return
                      </Button>
                    </div>
                  </div>
                ))
              )}
              {assets.every((a) => (a.issues?.length || 0) === 0) && (
                <p className="text-xs text-slate-500 text-center py-6">No assets currently issued to staff custody.</p>
              )}
            </div>
          </Card>

          {/* Maintenance & Repair Logs */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900">
                    Preventive Maintenance &amp; Equipment Repairs
                  </CardTitle>
                  <p className="text-xs text-slate-500 mt-1">
                    Scheduled calibration, OEM service visits, and AMC contracts.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="primary"
                  className="bg-[#990000] text-white"
                  onClick={() => setIsMaintenanceModalOpen(true)}
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Log Maintenance / Repair
                </Button>
              </div>
            </CardHeader>
            <div className="p-5 space-y-3">
              {maintenanceLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-sm">{log.assetItem?.name}</h4>
                      <Badge variant={log.status === 'COMPLETED' ? 'emerald' : 'amber'}>
                        {log.maintenanceType} - {log.status}
                      </Badge>
                    </div>
                    <p className="text-slate-600">{log.description}</p>
                    <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500 font-mono">
                      <span>Service Provider: {log.serviceProvider}</span>
                      {log.technicianName && <span>Tech: {log.technicianName} ({log.technicianContact})</span>}
                      <span>Service Date: {formatDate(log.serviceDate)}</span>
                      {log.nextServiceDate && (
                        <span className="text-indigo-700 font-semibold">
                          Next AMC Service: {formatDate(log.nextServiceDate)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[11px] text-slate-400 block">Service Cost</span>
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {formatCurrency(log.cost)}
                    </span>
                  </div>
                </div>
              ))}
              {maintenanceLogs.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-6">No maintenance records logged.</p>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: PHYSICAL STOCK AUDIT */}
      {/* ========================================================= */}
      {activeTab === 'audit' && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  Physical Stock Audit &amp; Ledger Reconciliation
                </CardTitle>
                <p className="text-xs text-slate-500 mt-1">
                  Quarterly store audits comparing physical counts against ERP ledger with automated adjustment vouchers.
                </p>
              </div>
              <Button
                size="sm"
                variant="primary"
                className="bg-[#990000] text-white"
                onClick={() => setIsAuditModalOpen(true)}
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Conduct Physical Audit
              </Button>
            </div>
          </CardHeader>

          <div className="p-5 space-y-4">
            {auditSessions.map((audit) => (
              <div
                key={audit.id}
                className="p-5 rounded-2xl border border-slate-200 bg-white space-y-3 transition-colors hover:border-[#990000]/40"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#990000] text-sm">{audit.auditCode}</span>
                      <Badge variant="emerald" size="sm">
                        {audit.status}
                      </Badge>
                      <span className="text-xs text-slate-500">
                        Date: {formatDate(audit.auditDate)} • Auditor: <strong>{audit.auditorName}</strong>
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{audit.remarks}</p>
                  </div>
                </div>

                {/* Audit Items Variance */}
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 font-mono">
                        <th className="py-2">Item Name &amp; Code</th>
                        <th className="py-2">System Qty</th>
                        <th className="py-2">Physical Qty</th>
                        <th className="py-2">Discrepancy (+/-)</th>
                        <th className="py-2">Discrepancy Value</th>
                        <th className="py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {audit.items?.map((it: any) => (
                        <tr key={it.id}>
                          <td className="py-2.5">
                            <span className="font-bold text-slate-900 block">{it.assetItem?.name}</span>
                            <span className="font-mono text-[10px] text-slate-400">{it.assetItem?.assetCode}</span>
                          </td>
                          <td className="py-2.5 font-mono">{it.systemQuantity}</td>
                          <td className="py-2.5 font-mono font-bold text-slate-900">{it.physicalQuantity}</td>
                          <td className="py-2.5 font-mono">
                            <span
                              className={`font-bold ${
                                it.discrepancy < 0
                                  ? 'text-rose-600'
                                  : it.discrepancy > 0
                                  ? 'text-emerald-600'
                                  : 'text-slate-600'
                              }`}
                            >
                              {it.discrepancy > 0 ? `+${it.discrepancy}` : it.discrepancy}
                            </span>
                          </td>
                          <td className="py-2.5 font-mono font-semibold">
                            {formatCurrency(Math.abs(it.discrepancyValue))}
                          </td>
                          <td className="py-2.5">
                            <Badge variant={it.reconciled ? 'emerald' : 'amber'} size="xs">
                              {it.reconciled ? 'Auto-Reconciled' : 'Pending Review'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
            {auditSessions.length === 0 && (
              <p className="text-xs text-slate-500 text-center py-6">No physical audits conducted yet.</p>
            )}
          </div>
        </Card>
      )}

      {/* ========================================================= */}
      {/* TAB 6: SUPPLIERS & CATEGORIES */}
      {/* ========================================================= */}
      {activeTab === 'vendors' && (
        <div className="space-y-6">
          {/* Vendors */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900">
                    Authorized Suppliers &amp; Vendors
                  </CardTitle>
                  <p className="text-xs text-slate-500 mt-1">
                    Registered vendors for lab chemicals, uniform manufacturers, booksellers, and IT hardware.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="primary"
                  className="bg-[#990000] text-white"
                  onClick={() => setIsVendorModalOpen(true)}
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Register Supplier
                </Button>
              </div>
            </CardHeader>

            <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vendors.map((v) => (
                <div
                  key={v.id}
                  className="p-4 rounded-xl border border-slate-200 bg-white space-y-2.5 transition-colors hover:border-[#990000]/40"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#990000]">{v.vendorCode || 'VND-001'}</span>
                    <Badge variant="blue" size="xs">
                      {v.category || 'General Supplies'}
                    </Badge>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{v.name}</h4>
                  <p className="text-xs text-slate-600 line-clamp-1">{v.address || 'Noida Industrial Area'}</p>
                  <div className="pt-2 border-t border-slate-100 text-[11px] space-y-1 font-mono text-slate-600">
                    <div>GSTIN: {v.gstNumber || '07AAAAA0000A1Z5'}</div>
                    <div>Contact: {v.contactPerson || 'Sales Desk'} ({v.phone})</div>
                    <div>Terms: {v.paymentTerms || 'Net 30 Days'}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Configurable Categories */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-slate-900">
                    Configurable Inventory &amp; Asset Categories
                  </CardTitle>
                  <p className="text-xs text-slate-500 mt-1">
                    Institutional categorization structure covering consumables and depreciable capital assets.
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsCategoryModalOpen(true)}
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Category
                </Button>
              </div>
            </CardHeader>
            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {categories.map((c) => (
                <div key={c.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{c.name}</span>
                    <Badge variant={c.isAsset ? 'indigo' : 'teal'} size="xs">
                      {c.isAsset ? 'Capital' : 'Consumable'}
                    </Badge>
                  </div>
                  <span className="font-mono text-[10px] text-slate-400 block mt-1">{c.code}</span>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{c.description || 'Institutional supplies'}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: ADD ITEM / CAPITAL ASSET MASTER */}
      {/* ========================================================= */}
      <Modal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        title="Register Inventory Item / Capital Asset"
        subtitle="Catalog new equipment, uniforms, books, or consumables into the master database"
        maxWidth="2xl"
      >
        <form onSubmit={handleCreateItem} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Item Title / Description *</label>
            <input
              type="text"
              required
              placeholder="e.g. Olympus CX21i Binocular Biological Microscope"
              value={itemForm.name}
              onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-[#990000] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
              <select
                value={itemForm.categoryId}
                onChange={(e) => setItemForm({ ...itemForm, categoryId: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#990000] outline-none"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.isAsset ? 'Capital Asset' : 'Consumable'})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Supplier</label>
              <select
                value={itemForm.vendorId}
                onChange={(e) => setItemForm({ ...itemForm, vendorId: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#990000] outline-none"
              >
                <option value="">None / Open Market</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Storage Location</label>
              <input
                type="text"
                value={itemForm.location}
                onChange={(e) => setItemForm({ ...itemForm, location: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#990000] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Unit of Measure</label>
              <select
                value={itemForm.unit}
                onChange={(e) => setItemForm({ ...itemForm, unit: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#990000] outline-none"
              >
                <option value="PIECES">PIECES</option>
                <option value="SETS">SETS</option>
                <option value="BOXES">BOXES</option>
                <option value="KILOGRAMS">KILOGRAMS</option>
                <option value="LITERS">LITERS</option>
                <option value="METERS">METERS</option>
                <option value="PACKS">PACKS</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Classification</label>
              <select
                value={itemForm.isConsumable ? 'CONSUMABLE' : 'CAPITAL'}
                onChange={(e) =>
                  setItemForm({ ...itemForm, isConsumable: e.target.value === 'CONSUMABLE' })
                }
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#990000] outline-none"
              >
                <option value="CAPITAL">Fixed / Capital Asset</option>
                <option value="CONSUMABLE">Consumable Material</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Opening Stock</label>
              <input
                type="number"
                min="0"
                value={itemForm.currentQuantity}
                onChange={(e) => setItemForm({ ...itemForm, currentQuantity: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#990000] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Min Buffer</label>
              <input
                type="number"
                min="1"
                value={itemForm.minStockThreshold}
                onChange={(e) => setItemForm({ ...itemForm, minStockThreshold: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#990000] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Reorder Level</label>
              <input
                type="number"
                min="1"
                value={itemForm.reorderLevel}
                onChange={(e) => setItemForm({ ...itemForm, reorderLevel: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#990000] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Unit Cost (₹)</label>
              <input
                type="number"
                min="0"
                value={itemForm.purchaseCost}
                onChange={(e) => setItemForm({ ...itemForm, purchaseCost: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#990000] outline-none"
              />
            </div>
          </div>

          {!itemForm.isConsumable && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
              <span className="text-xs font-bold text-slate-800 block">Capital Asset Specifications</span>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Serial Number</label>
                  <input
                    type="text"
                    placeholder="e.g. SN-8940-2026"
                    value={itemForm.serialNumber}
                    onChange={(e) => setItemForm({ ...itemForm, serialNumber: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded-lg p-1.5 focus:border-[#990000] outline-none bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Warranty Expiry</label>
                  <input
                    type="date"
                    value={itemForm.warrantyExpiry}
                    onChange={(e) => setItemForm({ ...itemForm, warrantyExpiry: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded-lg p-1.5 focus:border-[#990000] outline-none bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Depreciation (% p.a.)</label>
                  <input
                    type="number"
                    value={itemForm.depreciationRate}
                    onChange={(e) => setItemForm({ ...itemForm, depreciationRate: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded-lg p-1.5 focus:border-[#990000] outline-none bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <Button size="sm" variant="outline" type="button" onClick={() => setIsItemModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" type="submit" disabled={loading} className="bg-[#990000] text-white">
              {loading ? 'Saving...' : 'Register Master Item'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 2: ISSUE ASSET TO STAFF */}
      {/* ========================================================= */}
      <Modal
        isOpen={isIssueModalOpen}
        onClose={() => {
          setIsIssueModalOpen(false);
          setSelectedAsset(null);
        }}
        title={`Issue Asset: ${selectedAsset?.name}`}
        subtitle={`Available in stock: ${selectedAsset?.currentQuantity || 0} ${selectedAsset?.unit || 'PIECES'}`}
      >
        <form onSubmit={handleIssueAsset} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Assign Custodian (Faculty / Staff) *</label>
            <select
              value={issueForm.issuedToUserId}
              onChange={(e) => setIssueForm({ ...issueForm, issuedToUserId: e.target.value })}
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-[#990000] outline-none"
            >
              {staffUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.firstName} {u.lastName || ''} ({u.role})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Issue Quantity *</label>
              <input
                type="number"
                min="1"
                max={selectedAsset?.currentQuantity || 1}
                value={issueForm.quantity}
                onChange={(e) => setIssueForm({ ...issueForm, quantity: parseInt(e.target.value) || 1 })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#990000] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Return Due Date *</label>
              <input
                type="date"
                required
                value={issueForm.returnDueDate}
                onChange={(e) => setIssueForm({ ...issueForm, returnDueDate: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#990000] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Purpose / Remarks</label>
            <textarea
              rows={2}
              value={issueForm.remarks}
              onChange={(e) => setIssueForm({ ...issueForm, remarks: e.target.value })}
              className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#990000] outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <Button size="sm" variant="outline" type="button" onClick={() => setIsIssueModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" type="submit" disabled={loading} className="bg-[#990000] text-white">
              {loading ? 'Processing...' : 'Confirm Issue'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 3: ACKNOWLEDGE RETURN */}
      {/* ========================================================= */}
      <Modal
        isOpen={isReturnModalOpen}
        onClose={() => {
          setIsReturnModalOpen(false);
          setSelectedIssue(null);
        }}
        title="Acknowledge Equipment Return"
        subtitle={`Verifying return of asset checked out by ${selectedIssue?.issuedTo?.firstName}`}
      >
        <form onSubmit={handleReturnAsset} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Condition on Return</label>
            <select
              value={returnForm.conditionReturn}
              onChange={(e) => setReturnForm({ ...returnForm, conditionReturn: e.target.value })}
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-[#990000] outline-none"
            >
              <option value="EXCELLENT">EXCELLENT (Like New)</option>
              <option value="GOOD">GOOD (Normal Wear)</option>
              <option value="NEEDS_REPAIR">NEEDS_REPAIR (Minor Damage)</option>
              <option value="DAMAGED">DAMAGED (Requires Immediate Maintenance)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Verification Remarks</label>
            <textarea
              rows={2}
              value={returnForm.remarks}
              onChange={(e) => setReturnForm({ ...returnForm, remarks: e.target.value })}
              className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#990000] outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <Button size="sm" variant="outline" type="button" onClick={() => setIsReturnModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" type="submit" disabled={loading} className="bg-emerald-600 text-white">
              {loading ? 'Updating...' : 'Accept Return & Restock'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 4: RECORD STOCK MOVEMENT / ADJUSTMENT */}
      {/* ========================================================= */}
      <Modal
        isOpen={isMovementModalOpen}
        onClose={() => setIsMovementModalOpen(false)}
        title="Record Stock Movement / Adjustment"
        subtitle="Log adjustments, internal transfers, manual stock-in, damage, or write-offs"
      >
        <form onSubmit={handleRecordMovement} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target Item *</label>
            <select
              value={movementForm.assetItemId}
              onChange={(e) => {
                const found = assets.find((a) => a.id === e.target.value);
                setMovementForm({
                  ...movementForm,
                  assetItemId: e.target.value,
                  fromLocation: found?.location || 'Central Store',
                  toLocation: found?.location || 'Central Store',
                  unitCost: String(found?.purchaseCost || 0),
                });
              }}
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-[#990000] outline-none"
            >
              {assets.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.assetCode}) - Current: {a.currentQuantity} {a.unit}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Movement Type *</label>
              <select
                value={movementForm.movementType}
                onChange={(e) => setMovementForm({ ...movementForm, movementType: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#990000] outline-none"
              >
                <option value="ADJUSTMENT">ADJUSTMENT (Count Reconciliation)</option>
                <option value="STOCK_IN">STOCK_IN (Manual Replenish)</option>
                <option value="STOCK_OUT">STOCK_OUT (Consumable Dispatch)</option>
                <option value="TRANSFER">TRANSFER (Inter-Department)</option>
                <option value="DAMAGE">DAMAGE (Breakage / Spoilage)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {movementForm.movementType === 'ADJUSTMENT' ? 'New Count Value *' : 'Quantity Units *'}
              </label>
              <input
                type="number"
                min="0"
                required
                value={movementForm.quantity}
                onChange={(e) => setMovementForm({ ...movementForm, quantity: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#990000] outline-none"
              />
            </div>
          </div>

          {movementForm.movementType === 'TRANSFER' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">From Location</label>
                <input
                  type="text"
                  value={movementForm.fromLocation}
                  onChange={(e) => setMovementForm({ ...movementForm, fromLocation: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#990000] outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">To Destination Lab / Wing</label>
                <input
                  type="text"
                  value={movementForm.toLocation}
                  onChange={(e) => setMovementForm({ ...movementForm, toLocation: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#990000] outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Operational Reason / Memo *</label>
            <textarea
              rows={2}
              required
              value={movementForm.reason}
              onChange={(e) => setMovementForm({ ...movementForm, reason: e.target.value })}
              className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#990000] outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <Button size="sm" variant="outline" type="button" onClick={() => setIsMovementModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" type="submit" disabled={loading} className="bg-[#990000] text-white">
              {loading ? 'Posting...' : 'Commit Movement'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 5: RAISE PURCHASE REQUISITION */}
      {/* ========================================================= */}
      <Modal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        title="Raise Purchase Requisition"
        subtitle="Submit departmental procurement request for principal and accounting approval"
        maxWidth="xl"
      >
        <form onSubmit={handleCreateRequest} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Item Title / Requirement *</label>
            <input
              type="text"
              required
              placeholder="e.g. CBSE Practical Grade 12 Chemistry Reagent Sets"
              value={requestForm.itemTitle}
              onChange={(e) => setRequestForm({ ...requestForm, itemTitle: e.target.value })}
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-[#990000] outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={requestForm.categoryName}
                onChange={(e) => setRequestForm({ ...requestForm, categoryName: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#990000] outline-none"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
              <select
                value={requestForm.departmentName}
                onChange={(e) => setRequestForm({ ...requestForm, departmentName: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#990000] outline-none"
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.name}>{d.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
              <select
                value={requestForm.priority}
                onChange={(e) => setRequestForm({ ...requestForm, priority: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#990000] outline-none"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="URGENT">URGENT</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Required Quantity</label>
              <input
                type="number"
                min="1"
                value={requestForm.quantity}
                onChange={(e) => setRequestForm({ ...requestForm, quantity: parseInt(e.target.value) || 1 })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#990000] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Estimated Budget (₹)</label>
              <input
                type="number"
                min="0"
                value={requestForm.estimatedCost}
                onChange={(e) => setRequestForm({ ...requestForm, estimatedCost: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#990000] outline-none"
              />
            </div>
          </div>

          {/* Quotation attachment details */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <span className="text-[11px] font-bold text-slate-700 block">Vendor Quotation Details</span>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">Quotation Ref #</label>
                <input
                  type="text"
                  value={requestForm.quotationRef}
                  onChange={(e) => setRequestForm({ ...requestForm, quotationRef: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded p-1.5 outline-none bg-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">Quoting Supplier</label>
                <input
                  type="text"
                  value={requestForm.quotationVendor}
                  onChange={(e) => setRequestForm({ ...requestForm, quotationVendor: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded p-1.5 outline-none bg-white"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 mb-1">Quoted Price (₹)</label>
                <input
                  type="number"
                  value={requestForm.quotationAmount}
                  onChange={(e) => setRequestForm({ ...requestForm, quotationAmount: e.target.value })}
                  className="w-full text-xs border border-slate-300 rounded p-1.5 outline-none bg-white"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Academic / Institutional Justification *</label>
            <textarea
              rows={2}
              required
              value={requestForm.reason}
              onChange={(e) => setRequestForm({ ...requestForm, reason: e.target.value })}
              className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#990000] outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <Button size="sm" variant="outline" type="button" onClick={() => setIsRequestModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" type="submit" disabled={loading} className="bg-[#990000] text-white">
              {loading ? 'Submitting...' : 'Submit Requisition'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 6: CREATE PURCHASE ORDER (PO) */}
      {/* ========================================================= */}
      <Modal
        isOpen={isPoModalOpen}
        onClose={() => setIsPoModalOpen(false)}
        title="Generate Purchase Order (PO)"
        subtitle="Create official purchase order with automatic 18% GST calculation"
        maxWidth="xl"
      >
        <form onSubmit={handleCreatePO} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Select Supplier *</label>
              <select
                value={poForm.vendorId}
                onChange={(e) => setPoForm({ ...poForm, vendorId: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-[#990000] outline-none"
              >
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>{v.name} ({v.vendorCode || 'VND'})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Expected Delivery Date</label>
              <input
                type="date"
                required
                value={poForm.expectedDeliveryDate}
                onChange={(e) => setPoForm({ ...poForm, expectedDeliveryDate: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#990000] outline-none"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <span className="text-xs font-bold text-slate-800 block">Order Line Item</span>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Item Title *</label>
              <input
                type="text"
                required
                value={poForm.itemTitle}
                onChange={(e) => setPoForm({ ...poForm, itemTitle: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#990000] outline-none bg-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Order Quantity</label>
                <input
                  type="number"
                  min="1"
                  value={poForm.quantity}
                  onChange={(e) => setPoForm({ ...poForm, quantity: parseInt(e.target.value) || 1 })}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#990000] outline-none bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Unit Price (₹)</label>
                <input
                  type="number"
                  min="0"
                  value={poForm.unitPrice}
                  onChange={(e) => setPoForm({ ...poForm, unitPrice: parseFloat(e.target.value) || 0 })}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#990000] outline-none bg-white"
                />
              </div>
            </div>

            {/* Calculated Order Summary */}
            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-600">Subtotal: {formatCurrency(poForm.quantity * poForm.unitPrice)}</span>
              <span className="text-slate-600">+18% GST: {formatCurrency(poForm.quantity * poForm.unitPrice * 0.18)}</span>
              <span className="font-bold text-slate-900 text-sm">
                Total PO: {formatCurrency(poForm.quantity * poForm.unitPrice * 1.18)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Terms</label>
              <input
                type="text"
                value={poForm.paymentTerms}
                onChange={(e) => setPoForm({ ...poForm, paymentTerms: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#990000] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Delivery Instructions</label>
              <input
                type="text"
                value={poForm.notes}
                onChange={(e) => setPoForm({ ...poForm, notes: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#990000] outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <Button size="sm" variant="outline" type="button" onClick={() => setIsPoModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" type="submit" disabled={loading} className="bg-[#990000] text-white">
              {loading ? 'Creating...' : 'Issue Purchase Order'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 7: RECORD GRN & VENDOR INVOICE */}
      {/* ========================================================= */}
      <Modal
        isOpen={isGrnModalOpen}
        onClose={() => {
          setIsGrnModalOpen(false);
          setSelectedPo(null);
        }}
        title={`Goods Received Note (GRN): ${selectedPo?.poNumber}`}
        subtitle="Verify delivered goods, update physical inventory, and record supplier invoice"
        maxWidth="lg"
      >
        <form onSubmit={handleRecordGRN} className="space-y-4">
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs space-y-1 text-emerald-900">
            <span className="font-bold block">Purchase Order Summary</span>
            <div>Vendor: {selectedPo?.vendor?.name}</div>
            <div>Total PO Value: {formatCurrency(selectedPo?.totalAmount)}</div>
            <div className="text-[11px] text-emerald-700">
              Note: Checking this shipment in will automatically increment catalog quantities and record a ledger movement.
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Vendor Invoice # *</label>
              <input
                type="text"
                required
                value={grnForm.invoiceNumber}
                onChange={(e) => setGrnForm({ ...grnForm, invoiceNumber: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-[#990000] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Invoice Date *</label>
              <input
                type="date"
                required
                value={grnForm.invoiceDate}
                onChange={(e) => setGrnForm({ ...grnForm, invoiceDate: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#990000] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Status</label>
              <select
                value={grnForm.paymentStatus}
                onChange={(e) => setGrnForm({ ...grnForm, paymentStatus: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#990000] outline-none"
              >
                <option value="PAID">PAID</option>
                <option value="PENDING">PENDING</option>
                <option value="PARTIALLY_PAID">PARTIALLY_PAID</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Mode</label>
              <select
                value={grnForm.paymentMode}
                onChange={(e) => setGrnForm({ ...grnForm, paymentMode: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#990000] outline-none"
              >
                <option value="ONLINE_BANK_TRANSFER">ONLINE_BANK_TRANSFER</option>
                <option value="CHEQUE">CHEQUE</option>
                <option value="NEFT_RTGS">NEFT / RTGS</option>
                <option value="CASH">CASH</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Ref / UTR #</label>
              <input
                type="text"
                value={grnForm.transactionRef}
                onChange={(e) => setGrnForm({ ...grnForm, transactionRef: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#990000] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Inspection &amp; Verification Remarks</label>
            <textarea
              rows={2}
              value={grnForm.remarks}
              onChange={(e) => setGrnForm({ ...grnForm, remarks: e.target.value })}
              className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#990000] outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <Button size="sm" variant="outline" type="button" onClick={() => setIsGrnModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" type="submit" disabled={loading} className="bg-emerald-600 text-white">
              {loading ? 'Receiving...' : 'Confirm Receipt & Replenish Stock'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 8: LOG MAINTENANCE / REPAIR */}
      {/* ========================================================= */}
      <Modal
        isOpen={isMaintenanceModalOpen}
        onClose={() => setIsMaintenanceModalOpen(false)}
        title="Schedule / Record Maintenance & Repair"
        subtitle="Track equipment repairs, AMC periodic servicing, optical calibration, or parts replacement"
      >
        <form onSubmit={handleRecordMaintenance} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Capital Asset *</label>
            <select
              value={maintenanceForm.assetItemId}
              onChange={(e) => setMaintenanceForm({ ...maintenanceForm, assetItemId: e.target.value })}
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-[#990000] outline-none"
            >
              {assets
                .filter((a) => !a.isConsumable)
                .map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.assetCode}) - {a.location}
                  </option>
                ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Service Type</label>
              <select
                value={maintenanceForm.maintenanceType}
                onChange={(e) => setMaintenanceForm({ ...maintenanceForm, maintenanceType: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#990000] outline-none"
              >
                <option value="PREVENTIVE">PREVENTIVE (Periodic Checkup)</option>
                <option value="CORRECTIVE">CORRECTIVE (Breakdown Repair)</option>
                <option value="CALIBRATION">CALIBRATION (Precision Tuning)</option>
                <option value="AMC_SERVICE">AMC_SERVICE (Contract Visit)</option>
                <option value="REPAIR">REPAIR (Component Replacement)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={maintenanceForm.status}
                onChange={(e) => setMaintenanceForm({ ...maintenanceForm, status: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#990000] outline-none"
              >
                <option value="COMPLETED">COMPLETED (Restored to Active)</option>
                <option value="IN_PROGRESS">IN_PROGRESS (Under Service)</option>
                <option value="SCHEDULED">SCHEDULED (Upcoming Visit)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Service Provider *</label>
              <input
                type="text"
                required
                value={maintenanceForm.serviceProvider}
                onChange={(e) => setMaintenanceForm({ ...maintenanceForm, serviceProvider: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#990000] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Technician</label>
              <input
                type="text"
                value={maintenanceForm.technicianName}
                onChange={(e) => setMaintenanceForm({ ...maintenanceForm, technicianName: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#990000] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Repair Cost (₹)</label>
              <input
                type="number"
                min="0"
                value={maintenanceForm.cost}
                onChange={(e) => setMaintenanceForm({ ...maintenanceForm, cost: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#990000] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Maintenance Description *</label>
            <textarea
              rows={2}
              required
              value={maintenanceForm.description}
              onChange={(e) => setMaintenanceForm({ ...maintenanceForm, description: e.target.value })}
              className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#990000] outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <Button size="sm" variant="outline" type="button" onClick={() => setIsMaintenanceModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" type="submit" disabled={loading} className="bg-[#990000] text-white">
              {loading ? 'Logging...' : 'Save Maintenance Record'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 9: CONDUCT PHYSICAL STOCK AUDIT */}
      {/* ========================================================= */}
      <Modal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        title="Conduct Physical Stock Audit & Reconciliation"
        subtitle="Compare counted inventory against database numbers with auto-reconciliation"
        maxWidth="2xl"
      >
        <form onSubmit={handleStockAudit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Auditor Name</label>
              <input
                type="text"
                required
                value={auditForm.auditorName}
                onChange={(e) => setAuditForm({ ...auditForm, auditorName: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#990000] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Store / Department</label>
              <input
                type="text"
                value={auditForm.departmentName}
                onChange={(e) => setAuditForm({ ...auditForm, departmentName: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#990000] outline-none"
              />
            </div>
          </div>

          {/* Counts Table */}
          <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-xl p-3 bg-slate-50 space-y-2">
            <span className="text-xs font-bold text-slate-800 block">Physical Count Verification</span>
            {auditForm.counts.map((c, idx) => {
              const diff = c.physicalQuantity - c.systemQuantity;
              return (
                <div
                  key={c.assetItemId}
                  className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div className="w-1/3">
                    <span className="font-semibold text-slate-900 block truncate">{c.assetName}</span>
                    <span className="font-mono text-[10px] text-slate-400">{c.assetCode}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono text-slate-500">Sys: {c.systemQuantity}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] font-semibold text-slate-700">Count:</span>
                      <input
                        type="number"
                        min="0"
                        value={c.physicalQuantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          const updated = [...auditForm.counts];
                          updated[idx].physicalQuantity = val;
                          setAuditForm({ ...auditForm, counts: updated });
                        }}
                        className="w-16 border border-slate-300 rounded p-1 font-mono text-xs text-center"
                      />
                    </div>
                    <span
                      className={`font-mono font-bold w-12 text-right ${
                        diff < 0 ? 'text-rose-600' : diff > 0 ? 'text-emerald-600' : 'text-slate-400'
                      }`}
                    >
                      {diff > 0 ? `+${diff}` : diff}
                    </span>
                    <label className="flex items-center gap-1 text-[11px] text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={c.reconcile}
                        onChange={(e) => {
                          const updated = [...auditForm.counts];
                          updated[idx].reconcile = e.target.checked;
                          setAuditForm({ ...auditForm, counts: updated });
                        }}
                      />
                      <span>Sync</span>
                    </label>
                  </div>
                </div>
              );
            })}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Audit Findings &amp; Summary</label>
            <textarea
              rows={2}
              value={auditForm.remarks}
              onChange={(e) => setAuditForm({ ...auditForm, remarks: e.target.value })}
              className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#990000] outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <Button size="sm" variant="outline" type="button" onClick={() => setIsAuditModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" type="submit" disabled={loading} className="bg-purple-600 text-white">
              {loading ? 'Reconciling...' : 'Submit Audit & Auto-Reconcile'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 10: REGISTER SUPPLIER / VENDOR */}
      {/* ========================================================= */}
      <Modal
        isOpen={isVendorModalOpen}
        onClose={() => setIsVendorModalOpen(false)}
        title="Register Supplier / Vendor"
        subtitle="Add authorized vendors for procurement orders and institutional billing"
      >
        <form onSubmit={handleCreateVendor} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Vendor Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Cambridge Scientific Instruments Ltd"
              value={vendorForm.name}
              onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })}
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-[#990000] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Person</label>
              <input
                type="text"
                value={vendorForm.contactPerson}
                onChange={(e) => setVendorForm({ ...vendorForm, contactPerson: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#990000] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
              <input
                type="text"
                required
                placeholder="+91 98110 00000"
                value={vendorForm.phone}
                onChange={(e) => setVendorForm({ ...vendorForm, phone: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#990000] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                placeholder="orders@supplier.com"
                value={vendorForm.email}
                onChange={(e) => setVendorForm({ ...vendorForm, email: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#990000] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">GSTIN Number</label>
              <input
                type="text"
                value={vendorForm.gstNumber}
                onChange={(e) => setVendorForm({ ...vendorForm, gstNumber: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#990000] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Vendor Category</label>
              <input
                type="text"
                value={vendorForm.category}
                onChange={(e) => setVendorForm({ ...vendorForm, category: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#990000] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Terms</label>
              <input
                type="text"
                value={vendorForm.paymentTerms}
                onChange={(e) => setVendorForm({ ...vendorForm, paymentTerms: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#990000] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Registered Address</label>
            <input
              type="text"
              value={vendorForm.address}
              onChange={(e) => setVendorForm({ ...vendorForm, address: e.target.value })}
              className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#990000] outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <Button size="sm" variant="outline" type="button" onClick={() => setIsVendorModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" type="submit" disabled={loading} className="bg-[#990000] text-white">
              {loading ? 'Saving...' : 'Register Vendor'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 11: ADD CUSTOM CATEGORY */}
      {/* ========================================================= */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title="Add Inventory Category"
        subtitle="Define new operational or academic category classification"
      >
        <form onSubmit={handleCreateCategory} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Category Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Smart Classroom Displays"
              value={categoryForm.name}
              onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
              className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-[#990000] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category Code</label>
              <input
                type="text"
                placeholder="CAT-SMR"
                value={categoryForm.code}
                onChange={(e) => setCategoryForm({ ...categoryForm, code: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#990000] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Asset Type</label>
              <select
                value={categoryForm.isAsset ? 'TRUE' : 'FALSE'}
                onChange={(e) => setCategoryForm({ ...categoryForm, isAsset: e.target.value === 'TRUE' })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#990000] outline-none"
              >
                <option value="FALSE">Consumable Material</option>
                <option value="TRUE">Capital / Fixed Asset</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={categoryForm.description}
              onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
              className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#990000] outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <Button size="sm" variant="outline" type="button" onClick={() => setIsCategoryModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" type="submit" disabled={loading} className="bg-[#990000] text-white">
              {loading ? 'Creating...' : 'Save Category'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 12: PRINTABLE BARCODE & QR CODE LABEL VIEWER */}
      {/* ========================================================= */}
      <Modal
        isOpen={isBarcodeModalOpen}
        onClose={() => {
          setIsBarcodeModalOpen(false);
          setSelectedAsset(null);
        }}
        title="Asset Identification & Barcode Label"
        subtitle="Standard institutional barcode and QR tag for physical equipment tagging"
        maxWidth="md"
      >
        {selectedAsset && (
          <div className="space-y-4">
            <div
              id="printable-label"
              className="p-6 rounded-2xl border-2 border-dashed border-slate-300 bg-white flex flex-col items-center text-center space-y-3"
            >
              {/* Institution Header */}
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#990000]">
                <Boxes className="w-4 h-4" />
                <span>EDVONEST CAMPUS ERP — ASSET TAG</span>
              </div>

              <div>
                <h4 className="font-bold text-slate-900 text-sm">{selectedAsset.name}</h4>
                <span className="text-[11px] text-slate-500 font-mono">
                  Location: {selectedAsset.location} • Category: {selectedAsset.category?.name || 'General'}
                </span>
              </div>

              {/* Barcode Visualization (SVG representation) */}
              <div className="w-full py-2 bg-slate-50 rounded-xl border border-slate-200 flex flex-col items-center">
                <svg className="h-12 w-48" viewBox="0 0 200 50">
                  {/* Procedural barcode stripes */}
                  <rect x="10" y="0" width="3" height="40" fill="#171717" />
                  <rect x="16" y="0" width="1" height="40" fill="#171717" />
                  <rect x="20" y="0" width="4" height="40" fill="#171717" />
                  <rect x="28" y="0" width="2" height="40" fill="#171717" />
                  <rect x="33" y="0" width="3" height="40" fill="#171717" />
                  <rect x="40" y="0" width="1" height="40" fill="#171717" />
                  <rect x="44" y="0" width="4" height="40" fill="#171717" />
                  <rect x="52" y="0" width="2" height="40" fill="#171717" />
                  <rect x="58" y="0" width="3" height="40" fill="#171717" />
                  <rect x="65" y="0" width="5" height="40" fill="#171717" />
                  <rect x="73" y="0" width="1" height="40" fill="#171717" />
                  <rect x="77" y="0" width="4" height="40" fill="#171717" />
                  <rect x="85" y="0" width="2" height="40" fill="#171717" />
                  <rect x="91" y="0" width="3" height="40" fill="#171717" />
                  <rect x="98" y="0" width="2" height="40" fill="#171717" />
                  <rect x="104" y="0" width="4" height="40" fill="#171717" />
                  <rect x="112" y="0" width="1" height="40" fill="#171717" />
                  <rect x="116" y="0" width="3" height="40" fill="#171717" />
                  <rect x="122" y="0" width="5" height="40" fill="#171717" />
                  <rect x="131" y="0" width="2" height="40" fill="#171717" />
                  <rect x="136" y="0" width="3" height="40" fill="#171717" />
                  <rect x="143" y="0" width="1" height="40" fill="#171717" />
                  <rect x="147" y="0" width="4" height="40" fill="#171717" />
                  <rect x="155" y="0" width="2" height="40" fill="#171717" />
                  <rect x="160" y="0" width="4" height="40" fill="#171717" />
                  <rect x="168" y="0" width="2" height="40" fill="#171717" />
                  <rect x="174" y="0" width="3" height="40" fill="#171717" />
                  <rect x="180" y="0" width="1" height="40" fill="#171717" />
                  <rect x="184" y="0" width="4" height="40" fill="#171717" />
                </svg>
                <span className="font-mono text-xs font-bold tracking-widest text-slate-800 mt-1">
                  {selectedAsset.barcode || '89010049281'}
                </span>
              </div>

              {/* QR Code and Asset Identifier */}
              <div className="flex items-center justify-center gap-4 pt-1">
                <div className="p-2 border border-slate-300 rounded-lg bg-white shadow-2xs">
                  <svg className="w-16 h-16 text-slate-900" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm8-2h2v2h-2v-2zm4 0h2v2h-2v-2zm-4 4h2v2h-2v-2zm4 0h2v2h-2v-2zm2-2h2v2h-2v-2zm0 4h2v2h-2v-2zm-6 2h2v2h-2v-2zm8-2h2v2h-2v-2z" />
                  </svg>
                </div>
                <div className="text-left">
                  <span className="text-[10px] text-slate-400 font-mono uppercase block">System Tag ID</span>
                  <span className="font-mono font-bold text-slate-900 text-sm block">{selectedAsset.assetCode}</span>
                  <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                    Unit Value: {formatCurrency(selectedAsset.purchaseCost)}
                  </span>
                  <span className="text-[10px] text-emerald-700 font-semibold block">Verified Physical Asset</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectedAsset(selectedAsset);
                  setIsDisposalModalOpen(true);
                  setIsBarcodeModalOpen(false);
                }}
                className="text-rose-600 border-rose-200 hover:bg-rose-50"
              >
                Decommission Asset
              </Button>

              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setIsBarcodeModalOpen(false)}>
                  Close
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  className="bg-[#990000] text-white flex items-center gap-1.5"
                  onClick={() => window.print()}
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Label Tag
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ========================================================= */}
      {/* MODAL 13: ASSET DISPOSAL / WRITE-OFF */}
      {/* ========================================================= */}
      <Modal
        isOpen={isDisposalModalOpen}
        onClose={() => {
          setIsDisposalModalOpen(false);
          setSelectedAsset(null);
        }}
        title={`Decommission / Dispose Asset: ${selectedAsset?.name}`}
        subtitle={`Asset Code: ${selectedAsset?.assetCode} • Current Book Value: ${formatCurrency(
          (selectedAsset?.purchaseCost || 0) * (selectedAsset?.currentQuantity || 0)
        )}`}
      >
        <form onSubmit={handleDisposeAsset} className="space-y-4">
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 space-y-1">
            <span className="font-bold flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              Permanent Condemnation Warning
            </span>
            <p>
              This will officially write off the asset from active service, set remaining stock to 0, and record a disposal voucher in the inventory ledger.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Disposal Method *</label>
              <select
                value={disposalForm.disposalMethod}
                onChange={(e) => setDisposalForm({ ...disposalForm, disposalMethod: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:border-[#990000] outline-none"
              >
                <option value="SCRAPPED">SCRAPPED (Metal / Plastic Salvage)</option>
                <option value="E_WASTE">E_WASTE (Certified Recycler)</option>
                <option value="AUCTIONED">AUCTIONED (Public Bidding)</option>
                <option value="DONATED">DONATED (Community NGO)</option>
                <option value="WRITTEN_OFF">WRITTEN_OFF (Lost / Damaged Beyond Repair)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Realized Salvage Value (₹)</label>
              <input
                type="number"
                min="0"
                value={disposalForm.disposalValue}
                onChange={(e) => setDisposalForm({ ...disposalForm, disposalValue: e.target.value })}
                className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#990000] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Condemnation Justification / Board Resolution *</label>
            <textarea
              rows={2}
              required
              value={disposalForm.disposalReason}
              onChange={(e) => setDisposalForm({ ...disposalForm, disposalReason: e.target.value })}
              className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:border-[#990000] outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
            <Button size="sm" variant="outline" type="button" onClick={() => setIsDisposalModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" variant="primary" type="submit" disabled={loading} className="bg-rose-600 text-white">
              {loading ? 'Disposing...' : 'Confirm Decommission & Write Off'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
