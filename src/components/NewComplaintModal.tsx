import React, { useState } from 'react';
import { X, Camera, MapPin, AlertCircle, CheckCircle2, Upload } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CAMPUS_LOCATIONS, DEPARTMENT_CATEGORIES } from '../data/mockData';
import { DepartmentType, PriorityLevel } from '../types';

interface NewComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplaintCreated: (id: string) => void;
}

export const NewComplaintModal: React.FC<NewComplaintModalProps> = ({
  isOpen,
  onClose,
  onComplaintCreated,
}) => {
  const { registerComplaint, currentUser } = useApp();

  const [regionIndex, setRegionIndex] = useState(0);
  const [buildingIndex, setBuildingIndex] = useState(0);
  const [floor, setFloor] = useState('Ground Floor');
  const [room, setRoom] = useState('');

  const [department, setDepartment] = useState<DepartmentType>('Electrical');
  const [category, setCategory] = useState(DEPARTMENT_CATEGORIES['Electrical'][0]);
  const [priority, setPriority] = useState<PriorityLevel>('high');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [attachedPhoto, setAttachedPhoto] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const currentRegion = CAMPUS_LOCATIONS[regionIndex];
  const currentBuilding = currentRegion.buildings[buildingIndex] || currentRegion.buildings[0];

  const handleDepartmentChange = (dept: DepartmentType) => {
    setDepartment(dept);
    setCategory(DEPARTMENT_CATEGORIES[dept][0]);
  };

  const handleAttachSamplePhoto = () => {
    const samples = [
      'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=400&q=80',
    ];
    setAttachedPhoto(samples[Math.floor(Math.random() * samples.length)]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrorMsg('Please enter a brief complaint title');
      return;
    }
    if (!room.trim()) {
      setErrorMsg('Please specify the exact room, lab or facility number');
      return;
    }
    if (!description.trim()) {
      setErrorMsg('Please describe the issue in detail');
      return;
    }

    const complaintId = registerComplaint({
      title: title.trim(),
      description: description.trim(),
      department,
      category,
      priority,
      location: {
        region: currentRegion.region,
        building: currentBuilding.name,
        buildingType: currentBuilding.type,
        floor,
        room: room.trim(),
      },
      attachments: attachedPhoto ? [attachedPhoto] : [],
    });

    onClose();
    onComplaintCreated(complaintId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#1e2825] rounded-xl shadow-2xl border border-[#ded6c9] dark:border-[#334440] overflow-hidden my-8 text-[#2f3e3a] dark:text-[#f6f0e6] transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#ded6c9] dark:border-[#334440] bg-[#f6f0e6]/70 dark:bg-[#263330]">
          <div>
            <h2 className="text-base font-bold text-[#2f3e3a] dark:text-[#f6f0e6]">
              Register Campus Maintenance Complaint
            </h2>
            <p className="text-xs text-[#5e7366] dark:text-[#a8bda3] mt-0.5">
              Gautam Buddha University Central Maintenance Cell (GBU-CMS)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#6f8a78] hover:text-[#2f3e3a] dark:hover:text-[#f6f0e6] rounded-lg hover:bg-[#ded6c9]/60 dark:hover:bg-[#141c1a] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 text-xs bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Caller Details Info */}
          <div className="flex items-center justify-between p-3 bg-[#f6f0e6]/60 dark:bg-[#263330] border border-[#ded6c9] dark:border-[#334440] rounded-lg text-xs text-[#5e7366] dark:text-[#a8bda3]">
            <div>
              <span className="font-semibold text-[#2f3e3a] dark:text-[#f6f0e6]">Filer: </span>
              {currentUser.name} ({currentUser.role})
            </div>
            <div>
              <span className="font-semibold text-[#2f3e3a] dark:text-[#f6f0e6]">Contact: </span>
              {currentUser.phone}
            </div>
          </div>

          {/* Campus Location Cascading */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#2f3e3a] dark:text-[#f6f0e6] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#6f8a78]" />
              Campus Location Hierarchy
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] text-[#6f8a78] mb-1 block">Campus Region</span>
                <select
                  value={regionIndex}
                  onChange={(e) => {
                    setRegionIndex(Number(e.target.value));
                    setBuildingIndex(0);
                  }}
                  className="w-full text-xs px-3 py-2 bg-white dark:bg-[#263330] border border-[#ded6c9] dark:border-[#334440] text-[#2f3e3a] dark:text-[#f6f0e6] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2f3e3a]"
                >
                  {CAMPUS_LOCATIONS.map((reg, idx) => (
                    <option key={reg.region} value={idx}>
                      {reg.region}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <span className="text-[11px] text-[#6f8a78] mb-1 block">Building / Facility</span>
                <select
                  value={buildingIndex}
                  onChange={(e) => setBuildingIndex(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 bg-white dark:bg-[#263330] border border-[#ded6c9] dark:border-[#334440] text-[#2f3e3a] dark:text-[#f6f0e6] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2f3e3a]"
                >
                  {currentRegion.buildings.map((bld, idx) => (
                    <option key={bld.name} value={idx}>
                      {bld.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <span className="text-[11px] text-[#6f8a78] mb-1 block">Floor Level</span>
                <select
                  value={floor}
                  onChange={(e) => setFloor(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white dark:bg-[#263330] border border-[#ded6c9] dark:border-[#334440] text-[#2f3e3a] dark:text-[#f6f0e6] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2f3e3a]"
                >
                  {currentBuilding.floors.map((fl) => (
                    <option key={fl} value={fl}>
                      {fl}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <span className="text-[11px] text-[#6f8a78] mb-1 block">Room / Lab / Specific Spot</span>
                <input
                  type="text"
                  placeholder="e.g. Room 314, Lab 204, West Corridor"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white dark:bg-[#263330] border border-[#ded6c9] dark:border-[#334440] text-[#2f3e3a] dark:text-[#f6f0e6] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2f3e3a]"
                />
              </div>
            </div>
          </div>

          {/* Department & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#2f3e3a] dark:text-[#f6f0e6] mb-1">
                Maintenance Department
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['Civil', 'Electrical', 'Horticulture'] as DepartmentType[]).map((dept) => (
                  <button
                    key={dept}
                    type="button"
                    onClick={() => handleDepartmentChange(dept)}
                    className={`py-2 px-2 text-xs font-medium rounded-lg border text-center transition-colors ${
                      department === dept
                        ? 'bg-[#2f3e3a] text-white border-[#2f3e3a] dark:bg-[#6f8a78] shadow-xs font-semibold'
                        : 'bg-white dark:bg-[#263330] text-[#5e7366] dark:text-[#a8bda3] border-[#ded6c9] dark:border-[#334440] hover:border-[#6f8a78]'
                    }`}
                  >
                    {dept}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2f3e3a] dark:text-[#f6f0e6] mb-1">
                Service Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-white dark:bg-[#263330] border border-[#ded6c9] dark:border-[#334440] text-[#2f3e3a] dark:text-[#f6f0e6] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2f3e3a]"
              >
                {DEPARTMENT_CATEGORIES[department].map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-semibold text-[#2f3e3a] dark:text-[#f6f0e6] mb-1">
              Priority & SLA Target
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { level: 'emergency' as const, label: 'Emergency', sla: '6h SLA', desc: 'Flooding/Sparking' },
                { level: 'high' as const, label: 'High', sla: '24h SLA', desc: 'Critical issue' },
                { level: 'medium' as const, label: 'Medium', sla: '48h SLA', desc: 'Normal repair' },
                { level: 'low' as const, label: 'Low', sla: '72h SLA', desc: 'Cosmetic / minor' },
              ].map((p) => (
                <button
                  key={p.level}
                  type="button"
                  onClick={() => setPriority(p.level)}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    priority === p.level
                      ? 'border-[#2f3e3a] bg-[#2f3e3a] text-white dark:bg-[#6f8a78] shadow-xs'
                      : 'border-[#ded6c9] dark:border-[#334440] bg-white dark:bg-[#263330] text-[#5e7366] dark:text-[#a8bda3] hover:border-[#6f8a78]'
                  }`}
                >
                  <div className="font-semibold text-xs">{p.label}</div>
                  <div className={`text-[10px] ${priority === p.level ? 'text-[#d9e6d3]' : 'text-[#6f8a78]'}`}>
                    {p.sla}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Complaint Title & Description */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#2f3e3a] dark:text-[#f6f0e6] mb-1">
                Complaint Title
              </label>
              <input
                type="text"
                placeholder="e.g. Water tap leaking continuously causing floor spill"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-white dark:bg-[#263330] border border-[#ded6c9] dark:border-[#334440] text-[#2f3e3a] dark:text-[#f6f0e6] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2f3e3a]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#2f3e3a] dark:text-[#f6f0e6] mb-1">
                Detailed Issue Description
              </label>
              <textarea
                rows={3}
                placeholder="Provide specific details about the fault, symptoms, when it occurs, and exact location inside the room..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-white dark:bg-[#263330] border border-[#ded6c9] dark:border-[#334440] text-[#2f3e3a] dark:text-[#f6f0e6] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#2f3e3a]"
              />
            </div>
          </div>

          {/* Photo Attachment */}
          <div>
            <label className="block text-xs font-semibold text-[#2f3e3a] dark:text-[#f6f0e6] mb-1">
              Attach Site Photograph (Optional)
            </label>
            {attachedPhoto ? (
              <div className="relative inline-block border border-[#ded6c9] dark:border-[#334440] rounded-lg overflow-hidden">
                <img
                  src={attachedPhoto}
                  alt="Fault site preview"
                  className="w-32 h-24 object-cover"
                />
                <button
                  type="button"
                  onClick={() => setAttachedPhoto('')}
                  className="absolute top-1 right-1 p-1 bg-[#141c1a]/90 text-white rounded-full hover:bg-[#2f3e3a]"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleAttachSamplePhoto}
                  className="px-3 py-2 border border-dashed border-[#6f8a78] hover:border-[#2f3e3a] bg-[#f6f0e6]/50 dark:bg-[#263330] rounded-lg text-xs font-medium text-[#5e7366] dark:text-[#a8bda3] flex items-center gap-2 transition-colors"
                >
                  <Camera className="w-4 h-4 text-[#6f8a78]" />
                  <span>Attach Site Photo</span>
                </button>
                <span className="text-[11px] text-[#6f8a78]">
                  (Simulate photo capture from campus device)
                </span>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#ded6c9] dark:border-[#334440]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-[#5e7366] dark:text-[#a8bda3] hover:text-[#2f3e3a] dark:hover:text-[#f6f0e6] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-[#2f3e3a] hover:bg-[#334440] dark:bg-[#6f8a78] dark:hover:bg-[#556c65] rounded-lg shadow-sm transition-colors"
            >
              Submit Complaint
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
