import React, { useState } from 'react';
import {
  Package,
  AlertTriangle,
  Plus,
  Search,
  CheckCircle2,
  TrendingDown,
  Warehouse,
  ArrowDownToLine,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DepartmentIndicator } from './StatusBadges';
import { DepartmentType } from '../types';

export const InventoryView: React.FC = () => {
  const { inventory, complaints, issueMaterial, restockInventory, currentUser } = useApp();

  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [restockItemId, setRestockItemId] = useState<string | null>(null);
  const [restockQty, setRestockQty] = useState<number>(10);

  // Filter inventory
  const filteredInventory = inventory.filter((item) => {
    const matchSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.code.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase());
    const matchDept = selectedDept === 'all' || item.department === selectedDept;
    return matchSearch && matchDept;
  });

  // Calculate low stock items
  const lowStockItems = inventory.filter(
    (item) => item.quantityOnHand <= item.minThreshold
  );

  // Collect all pending material requests across active work orders
  const pendingRequests = complaints.flatMap((c) => {
    if (!c.workOrder?.materials) return [];
    return c.workOrder.materials
      .filter((m) => m.status === 'requested')
      .map((m) => ({
        complaintId: c.id,
        workOrderId: c.workOrder!.id,
        technicianName: c.workOrder!.technicianName,
        department: c.department,
        material: m,
      }));
  });

  const handleConfirmRestock = () => {
    if (restockItemId && restockQty > 0) {
      restockInventory(restockItemId, restockQty);
      setRestockItemId(null);
      setRestockQty(10);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Store Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-[#1e2825] p-4 rounded-xl border border-[#ded6c9] dark:border-[#334440] shadow-xs transition-colors">
          <div className="text-xs font-medium text-[#5e7366] dark:text-[#a8bda3]">Total Material SKUs</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-[#2f3e3a] dark:text-[#f6f0e6] mt-1">
            {inventory.length}
          </div>
          <div className="text-[11px] text-[#6f8a78] dark:text-[#88a391] mt-0.5">Catalogued store items</div>
        </div>

        <div className="bg-white dark:bg-[#1e2825] p-4 rounded-xl border border-[#ded6c9] dark:border-[#334440] shadow-xs transition-colors">
          <div className="text-xs font-medium text-rose-600 dark:text-rose-400">Low-Stock Alerts</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-rose-700 dark:text-rose-300 mt-1">
            {lowStockItems.length}
          </div>
          <div className="text-[11px] text-[#6f8a78] dark:text-[#88a391] mt-0.5">Below buffer threshold</div>
        </div>

        <div className="bg-white dark:bg-[#1e2825] p-4 rounded-xl border border-[#ded6c9] dark:border-[#334440] shadow-xs transition-colors">
          <div className="text-xs font-medium text-amber-700 dark:text-amber-400">Pending Field Requests</div>
          <div className="text-2xl font-bold font-mono tabular-nums text-amber-800 dark:text-amber-300 mt-1">
            {pendingRequests.length}
          </div>
          <div className="text-[11px] text-[#6f8a78] dark:text-[#88a391] mt-0.5">Awaiting store issue</div>
        </div>

        <div className="bg-white dark:bg-[#1e2825] p-4 rounded-xl border border-[#ded6c9] dark:border-[#334440] shadow-xs transition-colors">
          <div className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Central Depot Status</div>
          <div className="text-base font-bold text-[#2f3e3a] dark:text-[#f6f0e6] mt-2 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Operating Normal</span>
          </div>
          <div className="text-[11px] text-[#6f8a78] dark:text-[#88a391] mt-0.5">Gate-3 Main Store Depot</div>
        </div>
      </div>

      {/* Pending Material Requisitions from Technicians (M10) */}
      {pendingRequests.length > 0 && (
        <div className="bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
              <Package className="w-4 h-4 text-amber-700 dark:text-amber-400" />
              <span>Pending Material Requisitions from Field Technicians (M10)</span>
            </h3>
            <span className="text-xs font-medium text-amber-800 dark:text-amber-300">
              {pendingRequests.length} pending issue
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {pendingRequests.map((req, idx) => {
              const invItem = inventory.find((i) => i.id === req.material.itemId);
              const hasStock = (invItem?.quantityOnHand || 0) >= req.material.requestedQty;
              return (
                <div
                  key={idx}
                  className="bg-white dark:bg-[#1e2825] p-3.5 rounded-lg border border-amber-200/80 dark:border-amber-900 shadow-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-[#2f3e3a] dark:text-[#f6f0e6]">
                      {req.workOrderId}
                    </span>
                    <DepartmentIndicator department={req.department} />
                  </div>
                  <div>
                    <div className="font-semibold text-xs text-[#2f3e3a] dark:text-[#f6f0e6]">
                      {req.material.itemName}
                    </div>
                    <div className="text-[11px] text-[#5e7366] dark:text-[#a8bda3]">
                      Tech: {req.technicianName} · Req:{' '}
                      <span className="font-bold text-[#2f3e3a] dark:text-[#f6f0e6] font-mono">
                        {req.material.requestedQty}
                      </span>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-[#ded6c9] dark:border-[#334440] flex items-center justify-between">
                    <span className="text-[11px] text-[#5e7366] dark:text-[#a8bda3]">
                      In Stock:{' '}
                      <span
                        className={`font-mono font-bold ${
                          hasStock ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-600'
                        }`}
                      >
                        {invItem?.quantityOnHand || 0}
                      </span>
                    </span>
                    <button
                      disabled={!hasStock}
                      onClick={() =>
                        issueMaterial(
                          req.complaintId,
                          req.material.itemId,
                          req.material.requestedQty
                        )
                      }
                      className={`px-3 py-1 text-xs font-semibold rounded transition-colors cursor-pointer ${
                        hasStock
                          ? 'bg-[#2f3e3a] hover:bg-[#1e2825] text-white dark:bg-[#6f8a78] dark:hover:bg-[#556c65]'
                          : 'bg-[#f6f0e6] dark:bg-[#141c1a] text-[#88a391] cursor-not-allowed'
                      }`}
                    >
                      {hasStock ? 'Approve & Issue' : 'Out of Stock'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Material Master Catalog Control Bar */}
      <div className="bg-white dark:bg-[#1e2825] p-4 rounded-xl border border-[#ded6c9] dark:border-[#334440] shadow-xs space-y-3 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#6f8a78]" />
            <input
              type="text"
              placeholder="Search material by name, code or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 bg-[#f6f0e6]/60 dark:bg-[#141c1a] border border-[#ded6c9] dark:border-[#334440] text-[#24312e] dark:text-[#f6f0e6] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2f3e3a]"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-[#f6f0e6] dark:bg-[#141c1a] p-0.5 rounded-lg text-xs">
              {['all', 'Civil', 'Electrical', 'Horticulture'].map((d) => (
                <button
                  key={d}
                  onClick={() => setSelectedDept(d)}
                  className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                    selectedDept === d
                      ? 'bg-[#2f3e3a] text-white dark:bg-[#6f8a78] font-semibold shadow-xs'
                      : 'text-[#5e7366] dark:text-[#a8bda3] hover:text-[#2f3e3a]'
                  }`}
                >
                  {d === 'all' ? 'All' : d}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Items Table */}
      <div className="bg-white dark:bg-[#1e2825] rounded-xl border border-[#ded6c9] dark:border-[#334440] shadow-xs overflow-hidden transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f6f0e6]/70 dark:bg-[#141c1a]/70 border-b border-[#ded6c9] dark:border-[#334440] text-[#5e7366] dark:text-[#a8bda3] font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Item Code</th>
                <th className="py-3 px-4">Material Description</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Shelf Location</th>
                <th className="py-3 px-4 text-right">Unit Rate</th>
                <th className="py-3 px-4 text-center">Stock Balance</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ded6c9]/60 dark:divide-[#334440]">
              {filteredInventory.map((item) => {
                const isLowStock = item.quantityOnHand <= item.minThreshold;
                return (
                  <tr key={item.id} className="hover:bg-[#f6f0e6]/40 dark:hover:bg-[#263330]/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#2f3e3a] dark:text-[#f6f0e6] whitespace-nowrap">
                      {item.code}
                    </td>

                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="font-semibold text-[#2f3e3a] dark:text-[#f6f0e6]">{item.name}</div>
                      <div className="text-[11px] text-[#6f8a78] dark:text-[#a8bda3]">
                        Category: {item.category} · Unit: {item.unit}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <DepartmentIndicator department={item.department} />
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[#5e7366] dark:text-[#a8bda3]">
                      {item.locationShelf}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono tabular-nums text-[#2f3e3a] dark:text-[#f6f0e6] whitespace-nowrap">
                      ₹{item.unitCost}
                    </td>

                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <span
                        className={`font-mono font-bold text-sm tabular-nums ${
                          isLowStock ? 'text-rose-600 dark:text-rose-400' : 'text-[#2f3e3a] dark:text-[#f6f0e6]'
                        }`}
                      >
                        {item.quantityOnHand}
                      </span>
                      <span className="text-[10px] text-[#6f8a78] dark:text-[#88a391] block">
                        Min: {item.minThreshold} {item.unit}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {isLowStock ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-900">
                          <AlertTriangle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                          Low Stock Alert
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          Optimal
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => setRestockItemId(item.id)}
                        className="px-2.5 py-1 text-xs font-semibold text-[#2f3e3a] dark:text-[#d9e6d3] hover:bg-[#f6f0e6] dark:hover:bg-[#263330] rounded border border-[#ded6c9] dark:border-[#334440] transition-colors inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Restock</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restock Modal */}
      {restockItemId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-[#1e2825] rounded-xl shadow-xl border border-[#ded6c9] dark:border-[#334440] p-6 space-y-4 text-[#2f3e3a] dark:text-[#f6f0e6]">
            <h3 className="text-base font-bold text-[#2f3e3a] dark:text-[#f6f0e6]">
              Receive Inventory Shipment / Restock
            </h3>
            {(() => {
              const item = inventory.find((i) => i.id === restockItemId);
              if (!item) return null;
              return (
                <div className="space-y-3">
                  <div className="p-3 bg-[#f6f0e6]/60 dark:bg-[#141c1a]/60 border border-[#ded6c9] dark:border-[#334440] rounded-lg text-xs space-y-1">
                    <div className="font-semibold text-[#2f3e3a] dark:text-[#f6f0e6]">{item.name}</div>
                    <div className="text-[#6f8a78] dark:text-[#a8bda3]">
                      Code: {item.code} · Current Balance: {item.quantityOnHand} {item.unit}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#2f3e3a] dark:text-[#f6f0e6] block mb-1">
                      Received Quantity ({item.unit})
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={500}
                      value={restockQty}
                      onChange={(e) => setRestockQty(Number(e.target.value))}
                      className="w-full text-sm px-3 py-2 bg-white dark:bg-[#141c1a] border border-[#ded6c9] dark:border-[#334440] text-[#2f3e3a] dark:text-[#f6f0e6] rounded-lg font-mono focus:outline-none focus:ring-1 focus:ring-[#2f3e3a]"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      onClick={() => setRestockItemId(null)}
                      className="px-3 py-1.5 text-xs text-[#5e7366] dark:text-[#a8bda3] hover:text-[#2f3e3a] dark:hover:text-[#f6f0e6] cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmRestock}
                      className="px-4 py-1.5 text-xs font-semibold bg-[#2f3e3a] hover:bg-[#1e2825] text-white dark:bg-[#6f8a78] dark:hover:bg-[#556c65] rounded-lg shadow-sm cursor-pointer"
                    >
                      Confirm Stock Receipt
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
