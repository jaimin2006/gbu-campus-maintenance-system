import React, { useState } from 'react';
import { MapPin, Building, Wrench, Shield, Users, Layers, CheckCircle2, Sparkles, Compass } from 'lucide-react';
import { CAMPUS_LOCATIONS, DEPARTMENT_CATEGORIES } from '../data/mockData';
import { useApp } from '../context/AppContext';
import { DepartmentIndicator } from './StatusBadges';
import { gbuBuddhaStatueLibraryImg } from '../assets/images';

export const MasterDataView: React.FC = () => {
  const { technicians, complaints } = useApp();
  const [activeSubTab, setActiveSubTab] = useState<'locations' | 'departments' | 'roster'>('locations');

  return (
    <div className="space-y-6">
      {/* Featured Campus Visual Header */}
      <div className="relative rounded-2xl overflow-hidden border border-[#ded6c9] dark:border-[#334440] bg-[#1e2825] text-white shadow-md">
        <div className="relative h-48 sm:h-56 w-full overflow-hidden">
          <img
            src={gbuBuddhaStatueLibraryImg}
            alt="Gautam Buddha University Campus Central Library and Buddha Statue"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141c1a] via-[#141c1a]/60 to-transparent" />
          <div className="absolute inset-0 bg-[#2f3e3a]/25 mix-blend-multiply" />

          <div className="absolute bottom-0 inset-x-0 p-5 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d9e6d3]/20 backdrop-blur-md text-[#f6f0e6] border border-[#d9e6d3]/30 text-[11px] font-semibold mb-1.5">
                <Compass className="w-3.5 h-3.5 text-[#d9e6d3]" />
                <span>GBU 511-Acre Master Hierarchy</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Gautam Buddha University Campus Infrastructure
              </h2>
              <p className="text-xs text-[#f6f0e6]/90 mt-0.5 max-w-xl">
                Integrated location codes, department maintenance matrices, and technical staff roster across 3 main campus zones.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs bg-white/10 backdrop-blur-md px-3 py-1 rounded-lg border border-white/20 text-[#f6f0e6]">
                Greater Noida, Uttar Pradesh
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center justify-between border-b border-[#ded6c9] dark:border-[#334440] pb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveSubTab('locations')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeSubTab === 'locations'
                ? 'bg-[#2f3e3a] text-white dark:bg-[#6f8a78] shadow-xs'
                : 'text-[#5e7366] dark:text-[#a8bda3] hover:text-[#2f3e3a] dark:hover:text-[#f6f0e6] hover:bg-[#d9e6d3]/40 dark:hover:bg-[#263330]'
            }`}
          >
            Campus Locations Hierarchy (M02)
          </button>
          <button
            onClick={() => setActiveSubTab('departments')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeSubTab === 'departments'
                ? 'bg-[#2f3e3a] text-white dark:bg-[#6f8a78] shadow-xs'
                : 'text-[#5e7366] dark:text-[#a8bda3] hover:text-[#2f3e3a] dark:hover:text-[#f6f0e6] hover:bg-[#d9e6d3]/40 dark:hover:bg-[#263330]'
            }`}
          >
            Department Service Catalog (M03)
          </button>
          <button
            onClick={() => setActiveSubTab('roster')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeSubTab === 'roster'
                ? 'bg-[#2f3e3a] text-white dark:bg-[#6f8a78] shadow-xs'
                : 'text-[#5e7366] dark:text-[#a8bda3] hover:text-[#2f3e3a] dark:hover:text-[#f6f0e6] hover:bg-[#d9e6d3]/40 dark:hover:bg-[#263330]'
            }`}
          >
            Technicians & Staff Roster (M07)
          </button>
        </div>
      </div>

      {/* SubTab 1: Locations */}
      {activeSubTab === 'locations' && (
        <div className="space-y-4">
          <div className="text-xs text-[#5e7366] dark:text-[#a8bda3]">
            GBU Campus Location Hierarchy:{' '}
            <span className="font-semibold text-[#2f3e3a] dark:text-[#f6f0e6]">
              Campus → Region → Building → Floor → Room/Facility
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {CAMPUS_LOCATIONS.map((region) => (
              <div
                key={region.region}
                className="bg-white dark:bg-[#1e2825] p-5 rounded-xl border border-[#ded6c9] dark:border-[#334440] shadow-xs space-y-4 flex flex-col justify-between transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2 text-[#2f3e3a] dark:text-[#f6f0e6] font-bold text-sm mb-3">
                    <MapPin className="w-4 h-4 text-[#6f8a78] dark:text-[#d9e6d3]" />
                    <span>{region.region}</span>
                  </div>

                  <div className="space-y-2.5">
                    {region.buildings.map((bld) => {
                      const count = complaints.filter(
                        (c) => c.location.building === bld.name
                      ).length;
                      return (
                        <div
                          key={bld.name}
                          className="p-3 bg-[#f6f0e6]/50 dark:bg-[#141c1a]/60 rounded-lg border border-[#ded6c9]/80 dark:border-[#334440] text-xs transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-[#2f3e3a] dark:text-[#f6f0e6]">{bld.name}</span>
                            <span className="text-[10px] px-2 py-0.5 bg-[#d9e6d3] dark:bg-[#263330] text-[#141c1a] dark:text-[#d9e6d3] rounded font-semibold">
                              {bld.type}
                            </span>
                          </div>
                          <div className="text-[11px] text-[#5e7366] dark:text-[#a8bda3] mt-1">
                            Floors: {bld.floors.join(', ')}
                          </div>
                          <div className="text-[11px] text-[#6f8a78] dark:text-[#a8bda3] mt-1 font-mono">
                            {count} complaints on record
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SubTab 2: Departments */}
      {activeSubTab === 'departments' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(DEPARTMENT_CATEGORIES).map(([dept, categories]) => (
            <div
              key={dept}
              className="bg-white dark:bg-[#1e2825] p-5 rounded-xl border border-[#ded6c9] dark:border-[#334440] shadow-xs space-y-4 transition-colors"
            >
              <div className="flex items-center justify-between border-b border-[#ded6c9] dark:border-[#334440] pb-3">
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-[#6f8a78] dark:text-[#d9e6d3]" />
                  <span className="font-bold text-sm text-[#2f3e3a] dark:text-[#f6f0e6]">
                    {dept} Maintenance
                  </span>
                </div>
                <DepartmentIndicator department={dept as any} />
              </div>

              <div className="text-xs text-[#5e7366] dark:text-[#a8bda3]">
                <span className="font-semibold text-[#2f3e3a] dark:text-[#f6f0e6] block mb-2">
                  Configured Service Categories:
                </span>
                <ul className="space-y-1.5">
                  {categories.map((cat) => (
                    <li key={cat} className="flex items-start gap-2 text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#6f8a78] mt-1.5 shrink-0" />
                      <span className="text-[#2f3e3a] dark:text-[#f6f0e6]">{cat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SubTab 3: Technician Roster */}
      {activeSubTab === 'roster' && (
        <div className="bg-white dark:bg-[#1e2825] rounded-xl border border-[#ded6c9] dark:border-[#334440] shadow-xs overflow-hidden transition-colors">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f6f0e6]/70 dark:bg-[#141c1a]/70 border-b border-[#ded6c9] dark:border-[#334440] text-[#5e7366] dark:text-[#a8bda3] font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Technician Name</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Direct Contact</th>
                <th className="py-3 px-4">Specialized Skills</th>
                <th className="py-3 px-4 text-center">Active Workload</th>
                <th className="py-3 px-4">Availability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ded6c9]/60 dark:divide-[#334440]">
              {technicians.map((t) => (
                <tr
                  key={t.id}
                  className="hover:bg-[#f6f0e6]/40 dark:hover:bg-[#263330]/70 transition-colors"
                >
                  <td className="py-3.5 px-4 font-bold text-[#2f3e3a] dark:text-[#f6f0e6]">{t.name}</td>
                  <td className="py-3.5 px-4">
                    <DepartmentIndicator department={t.department} />
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[#5e7366] dark:text-[#a8bda3]">{t.phone}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1">
                      {t.skills.map((s) => (
                        <span
                          key={s}
                          className="bg-[#d9e6d3]/60 dark:bg-[#263330] text-[#2f3e3a] dark:text-[#d9e6d3] px-2 py-0.5 rounded text-[11px] font-medium"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-[#2f3e3a] dark:text-[#f6f0e6]">
                    {t.activeWorkload} tasks
                  </td>
                  <td className="py-3.5 px-4">
                    {t.isAvailable ? (
                      <span className="text-emerald-700 dark:text-emerald-400 font-medium inline-flex items-center gap-1 text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Available for Dispatch
                      </span>
                    ) : (
                      <span className="text-amber-700 dark:text-amber-400 font-medium text-xs">
                        Max Capacity (On Site)
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
