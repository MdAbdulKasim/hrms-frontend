'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Plus,
  Search,
  X,
  ChevronRight,
  MapPin,
  TrendingUp,
  Users,
  Calendar,
  ArrowRight,
  CheckCircle2,
  DollarSign,
  History,
  Trash2,
  LayoutGrid
} from 'lucide-react';
import axios from 'axios';
import { getApiUrl, getAuthToken, getOrgId } from '@/lib/auth';
import { CustomAlertDialog, ConfirmDialog } from '@/components/ui/custom-dialogs';

// --- Types ---
interface Resource {
  id: string;
  name: string;
}

interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  location: string;
  salary: number;
}

interface LocationData extends Resource {
  sites?: { id: string; name: string; buildings?: string[] }[];
}

interface ProcessRequest {
  id: string;
  employeeNames: string;
  type: string;
  from: string;
  to: string;
  effectiveDate: string;
  status: 'Pending' | 'Completed' | 'Scheduled';
  timestamp: string;
}

export default function HRProcessPage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // Organizational Data State
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Resource[]>([]);
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [designations, setDesignations] = useState<Resource[]>([]);
  const [loadingLists, setLoadingLists] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form State
  const [activeTab, setActiveTab] = useState<'Department' | 'Location' | 'Promotion'>('Department');
  const [form, setForm] = useState({
    departmentId: '',
    locationId: '',
    site: '',
    building: '',
    designationId: '',
    percent: '',
    amount: '',
    date: '',
    reason: ''
  });

  const [history, setHistory] = useState<ProcessRequest[]>([]);

  // Dialog States
  const [alertState, setAlertState] = useState<{ open: boolean, title: string, description: string, variant: "success" | "error" | "info" | "warning" }>({
    open: false, title: "", description: "", variant: "info"
  });
  const [confirmState, setConfirmState] = useState<{ open: boolean, title: string, description: string, onConfirm: () => void }>({
    open: false, title: "", description: "", onConfirm: () => { }
  });

  const showAlert = (title: string, description: string, variant: "success" | "error" | "info" | "warning" = "info") => {
    setAlertState({ open: true, title, description, variant });
  };

  const showConfirm = (title: string, description: string, onConfirm: () => void) => {
    setConfirmState({ open: true, title, description, onConfirm });
  };

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('hr_process_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history from localStorage", e);
      }
    }
  }, []);

  // Save history to localStorage when it changes
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem('hr_process_history', JSON.stringify(history));
    }
  }, [history]);

  // --- API Fetching: Universal Data ---
  useEffect(() => {
    const fetchOrgData = async () => {
      try {
        const apiUrl = getApiUrl();
        const orgId = getOrgId();
        const token = getAuthToken();
        const headers = { Authorization: `Bearer ${token}` };

        if (!orgId || !token) return;

        // Perform all GET requests to retrieve organization-wide data
        const [empRes, locRes, desigRes, deptRes] = await Promise.all([
          axios.get(`${apiUrl}/org/${orgId}/employees`, { headers }),
          axios.get(`${apiUrl}/org/${orgId}/locations/`, { headers }).catch(() =>
            axios.get(`${apiUrl}/org/${orgId}/locations`, { headers })
          ),
          axios.get(`${apiUrl}/org/${orgId}/designations/`, { headers }).catch(() =>
            axios.get(`${apiUrl}/org/${orgId}/designations`, { headers })
          ),
          axios.get(`${apiUrl}/org/${orgId}/departments/`, { headers }).catch(() =>
            axios.get(`${apiUrl}/org/${orgId}/departments`, { headers })
          )
        ]);

        // 1. Process Employees
        const empRaw = empRes.data.data || empRes.data || [];
        setAllEmployees(empRaw.map((e: any) => ({
          id: e.id || e._id,
          name: e.fullName || `${e.firstName} ${e.lastName}`,
          role: e.designation?.name || e.designation || 'N/A',
          department: e.department?.name || e.department || 'N/A',
          location: e.location?.name || e.location || 'N/A',
          salary: e.salary || 0
        })));

        // 2. Process All Locations
        const locRaw = locRes.data.data || locRes.data || [];
        const locationsToSet = Array.isArray(locRaw) ? locRaw : (locRaw.locations || []);
        setLocations(locationsToSet.map((l: any) => ({
          id: l.id || l._id,
          name: l.name,
          sites: l.sites || []
        })));

        // 3. Process All Designations
        const desigRaw = desigRes.data.data || desigRes.data || [];
        const designationsToSet = Array.isArray(desigRaw) ? desigRaw : (desigRaw.designations || []);
        setDesignations(designationsToSet.map((d: any) => ({
          id: d.id || d._id,
          name: d.name
        })));

        // 4. Process All Departments
        const deptRaw = deptRes.data.data || deptRes.data || [];
        const departmentsToSet = Array.isArray(deptRaw) ? deptRaw : (deptRaw.departments || []);
        setDepartments(departmentsToSet.map((d: any) => ({
          id: d.id || d._id,
          name: d.name
        })));

      } catch (err) {
        console.error("Critical: Failed to fetch organizational metadata", err);
      } finally {
        setLoadingLists(false);
      }
    };

    fetchOrgData();
  }, []);

  // --- Helpers ---
  const filteredEmployees = useMemo(() => {
    return allEmployees.filter(emp =>
      (emp.name.toLowerCase().includes(employeeSearch.toLowerCase()) || emp.id.toLowerCase().includes(employeeSearch.toLowerCase())) &&
      !selectedIds.includes(emp.id)
    );
  }, [allEmployees, employeeSearch, selectedIds]);

  const selectedEmployees = useMemo(() => {
    return allEmployees.filter(emp => selectedIds.includes(emp.id));
  }, [allEmployees, selectedIds]);

  const handleSalaryCalc = (val: string, isPercent: boolean) => {
    const base = selectedEmployees[0]?.salary || 0;
    if (isPercent) {
      const p = parseFloat(val) || 0;
      const a = (base * p) / 100;
      setForm(prev => ({ ...prev, percent: val, amount: a.toFixed(2) }));
    } else {
      const a = parseFloat(val) || 0;
      const p = base > 0 ? (a / base) * 100 : 0;
      setForm(prev => ({ ...prev, amount: val, percent: p.toFixed(2) }));
    }
  };

  const handleProcess = async () => {
    if (selectedEmployees.length === 0) return;

    setIsProcessing(true);
    try {
      const apiUrl = getApiUrl();
      const orgId = getOrgId();
      const token = getAuthToken();
      const headers = { Authorization: `Bearer ${token}` };

      for (const emp of selectedEmployees) {
        const updateData: any = {};

        if (activeTab === 'Department') updateData.departmentId = form.departmentId;
        if (activeTab === 'Location') {
          updateData.locationId = form.locationId;
          updateData.site = form.site;
          updateData.building = form.building;
        }
        if (activeTab === 'Promotion') {
          updateData.designationId = form.designationId;
          // Note: Backend reported 'Property "salary" was not found in "Employee"'
          // Removing salary from payload for now to allow designation update to proceed.
        }

        console.log(`PROCESS_SYNC: Dispatching update for ${emp.id}`, updateData);

        try {
          await axios.put(`${apiUrl}/org/${orgId}/employees/${emp.id}`, updateData, { headers });
          console.log(`PROCESS_SYNC_SUCCESS for ${emp.id}`);

          // Update local state immediately to reflect database changes
          setAllEmployees(prev => prev.map(e => {
            if (e.id === emp.id) {
              const updated = { ...e };
              if (activeTab === 'Department') {
                updated.department = departments.find(d => d.id === form.departmentId)?.name || e.department;
              } else if (activeTab === 'Location') {
                updated.location = locations.find(l => l.id === form.locationId)?.name || e.location;
              } else if (activeTab === 'Promotion') {
                updated.role = designations.find(d => d.id === form.designationId)?.name || e.role;
              }
              return updated;
            }
            return e;
          }));
        } catch (innerErr: any) {
          const errorDetail = innerErr.response?.data || innerErr.message || innerErr;
          console.error(`PROCESS_SYNC_ERROR for ${emp.id}:`, errorDetail);
          console.error("FULL_ERROR_CONTEXT:", {
            status: innerErr.response?.status,
            payload: updateData,
            endpoint: `${apiUrl}/org/${orgId}/employees/${emp.id}`
          });
          throw innerErr;
        }
      }

      // Add to local history 
      const newEntry: ProcessRequest = {
        id: `PR-${Math.floor(Math.random() * 900) + 100}`,
        employeeNames: selectedEmployees.map(e => e.name).join(', '),
        type: activeTab,
        from: activeTab === 'Department' ? selectedEmployees[0]?.department :
          activeTab === 'Location' ? selectedEmployees[0]?.location : selectedEmployees[0]?.role,
        to: activeTab === 'Department' ? departments.find(d => d.id === form.departmentId)?.name || 'N/A' :
          activeTab === 'Location' ? `${locations.find(l => l.id === form.locationId)?.name} (${form.building || 'N/A'})` :
            designations.find(d => d.id === form.designationId)?.name || 'N/A',
        effectiveDate: form.date,
        status: 'Scheduled',
        timestamp: new Date().toISOString().slice(0, 16).replace('T', ' ')
      };

      setHistory([newEntry, ...history]);
      setSelectedIds([]);
      setForm({ departmentId: '', locationId: '', site: '', building: '', designationId: '', percent: '', amount: '', date: '', reason: '' });
      showAlert("Success", "Process executed successfully!", "success");

    } catch (err) {
      console.error("Process failed", err);
      showAlert("Error", "Failed to execute process. Please try again.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loadingLists) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 font-bold">Synchronizing Organizational Data...</p>
        <p className="text-xs text-slate-400">Fetching Departments, Locations, and Designations...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] p-4 md:p-8 font-sans text-slate-900 scrollbar-hide">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-100">
              <Plus size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">HR Process Manager</h1>
              <p className="text-sm text-slate-500 font-medium">Manage organization-wide transfers and promotions.</p>
            </div>
          </div>


        </div>

        {/* Main Workspace: Unified Card */}
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">

            {/* Left Section: Selection Summary */}
            <div className="lg:col-span-4 bg-slate-50/50 border-r border-slate-100 p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-bold text-lg flex items-center gap-3">
                  <Users size={22} className="text-blue-500" />
                  <span>Current Selection</span>
                </h3>
                <div className="bg-blue-500 text-white w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shadow-lg shadow-blue-100">
                  {selectedIds.length}
                </div>
              </div>

              {/* Search Bar - Moved to Left Panel */}
              <div className="relative w-full group mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search & Select Employee..."
                  className="w-full pl-12 pr-4 py-3.5 bg-white rounded-2xl border-none ring-1 ring-slate-200 focus:ring-2 focus:ring-blue-500 transition-all outline-none font-bold text-sm shadow-sm"
                  value={employeeSearch}
                  onChange={(e) => { setEmployeeSearch(e.target.value); setShowDropdown(true); }}
                  onFocus={() => setShowDropdown(true)}
                />
                {showDropdown && employeeSearch && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-200">
                    {filteredEmployees.length > 0 ? (
                      filteredEmployees.map(emp => (
                        <div
                          key={emp.id}
                          className="p-4 hover:bg-slate-50 cursor-pointer flex items-center gap-3 border-b border-slate-50 last:border-none transition-colors"
                          onClick={() => { setSelectedIds([...selectedIds, emp.id]); setEmployeeSearch(''); setShowDropdown(false); }}
                        >
                          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
                            {emp.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-slate-700">{emp.name}</p>
                            <p className="text-[11px] text-slate-500 font-medium">{emp.role} • {emp.department}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-slate-400 text-sm font-medium">No results found</div>
                    )}
                  </div>
                )}
              </div>

              {selectedIds.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 px-6">
                  <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center text-slate-200 border border-slate-50">
                    <Users size={36} />
                  </div>
                  <p className="text-slate-400 text-sm font-bold leading-relaxed">Search and select employees to apply organizational changes.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
                  {selectedEmployees.map(emp => (
                    <div key={emp.id} className="group relative p-5 bg-white rounded-3xl border border-slate-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300">
                      <button
                        onClick={() => setSelectedIds(selectedIds.filter(id => id !== emp.id))}
                        className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-xl shadow-lg flex items-center justify-center text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all border border-slate-50 z-10"
                      >
                        <X size={14} strokeWidth={3} />
                      </button>

                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 text-white flex items-center justify-center text-xl font-black shadow-lg shadow-blue-100">
                          {emp.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="min-w-0">
                          <p className="text-base font-black text-slate-800 truncate">{emp.name}</p>
                          <p className="text-[10px] text-blue-600 font-black tracking-widest uppercase mt-0.5 opacity-80">{emp.role}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-50">
                        <div className="space-y-0.5">
                          <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Department</p>
                          <p className="text-xs font-bold text-slate-700 truncate">{emp.department}</p>
                        </div>
                        <div className="space-y-0.5 text-right">
                          <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Location</p>
                          <p className="text-xs font-bold text-slate-700 truncate">{emp.location}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Section: Action Form */}
            <div className="lg:col-span-8 p-10">
              <div className="flex items-center gap-3 mb-10 overflow-x-auto pb-2 scrollbar-hide">
                {[
                  { id: 'Department', icon: LayoutGrid, label: 'Department Change' },
                  { id: 'Location', icon: MapPin, label: 'Location Transfer' },
                  { id: 'Promotion', icon: TrendingUp, label: 'Promotion / Hike' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === tab.id
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-100'
                      : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                      }`}
                  >
                    <tab.icon size={18} />
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="space-y-10">
                {/* Context: Global Data Info */}
                {/* <div className="flex items-center gap-3 p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                  <LayoutGrid size={18} className="text-blue-500" />
                  {/* <p className="text-xs font-semibold text-blue-700">
                  Showing all available <span className="font-bold underline">{activeTab}</span> options from the database.
                </p> */}


                {/* Tab: Department */}
                {activeTab === 'Department' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Current Department</label>
                      <div className="w-full p-4 bg-slate-100/50 rounded-2xl border border-slate-200/50 font-bold text-sm text-slate-600">
                        {(() => {
                          if (selectedEmployees.length === 0) return 'No Selection';
                          const uniqueDepts = Array.from(new Set(selectedEmployees.map(e => e.department)));
                          return uniqueDepts.length === 1 ? uniqueDepts[0] : `Mixed (${uniqueDepts.length} Variants)`;
                        })()}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Target Department</label>
                      <select
                        className="w-full p-4 bg-slate-50 rounded-2xl border-none ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-sm cursor-pointer shadow-sm"
                        value={form.departmentId}
                        onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                      >
                        <option value="">Select a Department...</option>
                        {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                      {departments.length === 0 && <p className="text-[10px] text-red-500 font-bold">No departments loaded. Check API connectivity.</p>}
                    </div>
                  </div>
                )}

                {/* Tab: Location */}
                {activeTab === 'Location' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500 mb-6">
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Current Location</label>
                      <div className="w-full p-4 bg-slate-100/50 rounded-2xl border border-slate-200/50 font-bold text-sm text-slate-600">
                        {(() => {
                          if (selectedEmployees.length === 0) return 'No Selection';
                          const uniqueLocs = Array.from(new Set(selectedEmployees.map(e => e.location)));
                          return uniqueLocs.length === 1 ? uniqueLocs[0] : `Mixed (${uniqueLocs.length} Variants)`;
                        })()}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'Location' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="space-y-3 font-medium">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Location</label>
                      <select
                        className="w-full p-4 bg-slate-50 rounded-2xl border-none ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-sm"
                        value={form.locationId}
                        onChange={(e) => setForm({ ...form, locationId: e.target.value, site: '', building: '' })}
                      >
                        <option value="">Select Location...</option>
                        {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Site</label>
                      <select
                        disabled={!form.locationId}
                        className="w-full p-4 bg-slate-50 rounded-2xl border-none ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-sm disabled:opacity-50"
                        value={form.site}
                        onChange={(e) => setForm({ ...form, site: e.target.value, building: '' })}
                      >
                        <option value="">Select Site...</option>
                        {locations.find(l => l.id === form.locationId)?.sites?.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Building</label>
                      <select
                        disabled={!form.site}
                        className="w-full p-4 bg-slate-50 rounded-2xl border-none ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-sm disabled:opacity-50"
                        value={form.building}
                        onChange={(e) => setForm({ ...form, building: e.target.value })}
                      >
                        <option value="">Select Building...</option>
                        {locations.find(l => l.id === form.locationId)?.sites?.find(s => s.name === form.site)?.buildings?.map(b => <option key={b}>{b}</option>)}
                      </select>
                    </div>
                  </div>
                )}

                {/* Tab: Promotion */}
                {activeTab === 'Promotion' && (
                  <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Current Designation</label>
                        <div className="w-full p-4 bg-slate-100/50 rounded-2xl border border-slate-200/50 font-bold text-sm text-slate-600">
                          {(() => {
                            if (selectedEmployees.length === 0) return 'No Selection';
                            const uniqueRoles = Array.from(new Set(selectedEmployees.map(e => e.role)));
                            return uniqueRoles.length === 1 ? uniqueRoles[0] : `Mixed (${uniqueRoles.length} Variants)`;
                          })()}
                        </div>
                      </div>
                      <div className="space-y-3">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">New Designation</label>
                        <select
                          className="w-full p-4 bg-slate-50 rounded-2xl border-none ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-sm"
                          value={form.designationId}
                          onChange={(e) => setForm({ ...form, designationId: e.target.value })}
                        >
                          <option value="">Select Designation...</option>
                          {designations.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-8 rounded-[32px] border border-slate-100 flex flex-col gap-8">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-green-100">
                          <DollarSign size={20} />
                        </div>
                        <h4 className="font-bold text-lg tracking-tight text-slate-800">Salary Calculator</h4>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="relative group">
                          <label className="text-[10px] font-bold text-green-600 uppercase tracking-widest mb-2 block">Promotion (%)</label>
                          <div className="relative">
                            <input
                              type="number"
                              className="w-full p-4 pr-12 bg-white rounded-2xl border-none ring-1 ring-green-100 focus:ring-2 focus:ring-green-500 transition-all font-bold text-sm outline-none"
                              placeholder="0"
                              value={form.percent}
                              onChange={(e) => handleSalaryCalc(e.target.value, true)}
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500 font-bold">%</span>
                          </div>
                        </div>
                        <div className="relative group">
                          <label className="text-[10px] font-bold text-green-600 uppercase tracking-widest mb-2 block">Increase ($)</label>
                          <div className="relative">
                            <input
                              type="number"
                              className="w-full p-4 pl-10 bg-white rounded-2xl border-none ring-1 ring-green-100 focus:ring-2 focus:ring-green-500 transition-all font-bold text-sm outline-none"
                              placeholder="0.00"
                              value={form.amount}
                              onChange={(e) => handleSalaryCalc(e.target.value, false)}
                            />
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-green-500 font-bold">$</span>
                          </div>
                        </div>
                      </div>

                      {form.amount && selectedEmployees.length > 0 && (
                        <div className="p-4 bg-white/60 rounded-2xl border border-green-50 flex items-start gap-3">
                          <CheckCircle2 size={16} className="text-green-500 mt-0.5" />
                          <p className="text-sm font-medium text-green-800">
                            Estimated New Salary:
                            <span className="font-bold ml-1 text-green-600">
                              {(() => {
                                const base = selectedEmployees[0]?.salary || 0;
                                const inc = parseFloat(form.amount || '0');
                                const total = base + (isNaN(inc) ? 0 : inc);
                                return `$${total.toLocaleString()}`;
                              })()}
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Common Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-100">
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Effective Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-5 h-5" />
                      <input
                        type="date"
                        className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border-none ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-sm"
                        value={form.date}
                        onChange={(e) => setForm({ ...form, date: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Process Remarks</label>
                    <textarea
                      className="w-full p-4 bg-slate-50 rounded-2xl border-none ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold text-sm resize-none h-14"
                      placeholder="Provide reasoning for this change..."
                      value={form.reason}
                      onChange={(e) => setForm({ ...form, reason: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-6">
                  <button
                    onClick={handleProcess}
                    disabled={selectedIds.length === 0 || !form.date || isProcessing}
                    className="px-10 py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl font-bold flex items-center gap-3 transition-all shadow-xl shadow-blue-100 disabled:opacity-50 disabled:grayscale"
                  >
                    {isProcessing ? 'Processing Transaction...' : (
                      <>
                        <ArrowRight size={20} />
                        Complete & Log Transaction
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Audit History */}
        <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
            <h3 className="text-xl font-bold flex items-center gap-3">
              <History className="text-blue-500" /> Organizational Audit History
            </h3>
            {history.length > 0 && (
              <button
                onClick={() => {
                  showConfirm(
                    "Clear History",
                    "Are you sure you want to clear all process history? This action cannot be undone.",
                    () => {
                      setHistory([]);
                      localStorage.removeItem('hr_process_history');
                    }
                  );
                }}
                className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest flex items-center gap-2"
              >
                <Trash2 size={14} /> Clear History
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-medium">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ref ID</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Employee(s)</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Type</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Transition</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Eff. Date</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {history.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6 text-xs font-bold text-blue-600">#{req.id}</td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-bold text-slate-700 truncate max-w-xs">{req.employeeNames}</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${req.type === 'Promotion' ? 'bg-green-50 text-green-600' :
                        req.type === 'Location' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'
                        }`}>
                        {req.type}
                      </span>
                    </td>
                    <td className="px-8 py-6 flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-400">{req.from}</span>
                      <ChevronRight size={14} className="text-slate-300" />
                      <span className="text-xs font-bold text-slate-700">{req.to}</span>
                    </td>
                    <td className="px-8 py-6 text-xs font-bold text-slate-600">{req.effectiveDate}</td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        <span className="text-xs font-bold text-slate-700">Committed</span>
                      </div>
                    </td>
                  </tr>
                ))}
                {history.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-8 py-10 text-center text-slate-400 font-medium italic">
                      No organizational transactions recorded in this session.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <CustomAlertDialog
        open={alertState.open}
        onOpenChange={(open) => setAlertState(prev => ({ ...prev, open }))}
        title={alertState.title}
        description={alertState.description}
        variant={alertState.variant}
      />

      <ConfirmDialog
        open={confirmState.open}
        onOpenChange={(open) => setConfirmState(prev => ({ ...prev, open }))}
        title={confirmState.title}
        description={confirmState.description}
        onConfirm={() => {
          confirmState.onConfirm();
          setConfirmState(prev => ({ ...prev, open: false }));
        }}
        variant="destructive"
      />
    </div>
  );
}
