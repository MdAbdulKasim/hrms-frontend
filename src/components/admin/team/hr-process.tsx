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
  LayoutGrid,
  ChevronLeft
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
  dateOfJoining?: string;
}

interface LocationData extends Resource {
  sites?: { id: string; name: string; buildings?: any[] }[];
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
  endTime?: string;
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
  const [activeTab, setActiveTab] = useState<'Department' | 'Location' | 'Promotion' | 'Termination' | 'Custom'>('Department');
  const [form, setForm] = useState({
    departmentId: '',
    locationId: '',
    siteId: '',
    buildingId: '',
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

        const [empRes, locRes, desigRes, deptRes] = await Promise.all([
          axios.get(`${apiUrl}/org/${orgId}/employees`, {
            headers,
            params: { limit: 1000 } // Fetch all employees
          }),
          axios.get(`${apiUrl}/org/${orgId}/locations`, { headers }),
          axios.get(`${apiUrl}/org/${orgId}/designations`, { headers }),
          axios.get(`${apiUrl}/org/${orgId}/departments`, { headers })
        ]);

        const locRaw = locRes.data.data || locRes.data || [];
        const locationsToSet = Array.isArray(locRaw) ? locRaw : (locRaw.locations || []);
        const formattedLocations = locationsToSet.map((l: any) => ({
          id: l.id || l._id,
          name: l.locationName || l.name,
          sites: (l.sites || []).map((s: any) => ({
            id: s.id || s._id || s.name,
            name: s.siteName || s.name,
            buildings: s.buildings || []
          }))
        }));
        setLocations(formattedLocations);

        const desigRaw = desigRes.data.data || desigRes.data || [];
        const designationsToSet = Array.isArray(desigRaw) ? desigRaw : (desigRaw.designations || []);
        const formattedDesignations = designationsToSet.map((d: any) => ({
          id: d.id || d._id,
          name: d.name
        }));
        setDesignations(formattedDesignations);

        const deptRaw = deptRes.data.data || deptRes.data || [];
        const departmentsToSet = Array.isArray(deptRaw) ? deptRaw : (deptRaw.departments || []);
        const formattedDepartments = departmentsToSet.map((d: any) => ({
          id: d.id || d._id,
          name: d.departmentName || d.name
        }));
        setDepartments(formattedDepartments);

        const empRaw = empRes.data.data || empRes.data || [];
        setAllEmployees(empRaw.map((e: any) => {
          // Exhaustive name resolution: Try every possible field name variant
          const targetDeptId = String(e.departmentId || e.department_id || e.deptId || e.dept_id || (typeof e.department === 'string' ? e.department : e.department?.id) || '');
          const deptName = e.departmentName || e.department_name || e.department?.departmentName || e.department?.name ||
            formattedDepartments.find((d: any) => String(d.id) === targetDeptId)?.name ||
            (typeof e.department === 'string' && e.department.length > 10 ? '' : e.department) || '';

          const targetDesigId = String(e.designationId || e.designation_id || e.desigId || e.desig_id || (typeof e.designation === 'string' ? e.designation : e.designation?.id) || '');
          const desigName = e.designationName || e.designation_name || e.designation?.name ||
            formattedDesignations.find((d: any) => String(d.id) === targetDesigId)?.name ||
            (typeof e.designation === 'string' && e.designation.length > 10 ? '' : e.designation) || '';

          const targetLocId = String(e.locationId || e.location_id || e.locId || e.loc_id || (typeof e.location === 'string' ? e.location : e.location?.id) || '');
          const locName = e.locationName || e.location_name || e.location?.name ||
            formattedLocations.find((l: any) => String(l.id) === targetLocId)?.name ||
            (typeof e.location === 'string' && e.location.length > 10 ? '' : e.location) || '';

          // 4. Dates & Salary
          const joiningDate = e.dateOfJoining || e.date_of_joining || e.joiningDate || e.joining_date || e.createdAt;

          return {
            id: e.id || e._id,
            name: e.fullName || `${e.firstName} ${e.lastName}`,
            role: desigName || 'N/A',
            department: deptName || 'N/A',
            location: locName || 'N/A',
            salary: Number(e.basicSalary) || Number(e.salary) || Number(e.activeContract?.basicSalary) || 0,
            dateOfJoining: joiningDate
          };
        }));

      } catch (err) {
        console.error("Critical: Failed to fetch organizational metadata", err);
      } finally {
        setLoadingLists(false);
      }
    };

    fetchOrgData();
  }, []);

  const filteredEmployees = useMemo(() => {
    const term = employeeSearch.toLowerCase();
    return allEmployees.filter(emp =>
      (
        (emp.name?.toLowerCase() || '').includes(term) ||
        (emp.id?.toLowerCase() || '').includes(term) ||
        (emp.role?.toLowerCase() || '').includes(term) ||
        (emp.department?.toLowerCase() || '').includes(term) ||
        (emp.location?.toLowerCase() || '').includes(term)
      ) &&
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
        let updateData: any = {};

        if (activeTab === 'Custom') {
          if (form.departmentId) updateData.departmentId = form.departmentId;
          if (form.locationId) {
            updateData.locationId = form.locationId;
            updateData.siteId = form.siteId;
            updateData.buildingId = form.buildingId;
          }
          if (form.designationId) updateData.designationId = form.designationId;
          if (form.amount && parseFloat(form.amount) > 0) {
            updateData.basicSalary = Number(emp.salary) + parseFloat(form.amount);
          }
        } else {
          if (activeTab === 'Department') updateData.departmentId = form.departmentId;
          if (activeTab === 'Location') {
            updateData.locationId = form.locationId;
            updateData.siteId = form.siteId;
            updateData.buildingId = form.buildingId;
          }
          if (activeTab === 'Promotion') {
            updateData.designationId = form.designationId;
            if (form.amount && parseFloat(form.amount) > 0) {
              updateData.basicSalary = Number(emp.salary) + parseFloat(form.amount);
            }
          }
          if (activeTab === 'Termination') {
            updateData.terminationDate = form.date;
            updateData.remark = form.reason;
            updateData.status = 'Terminated';
          }
        }

        console.log(`PROCESS_SYNC: Dispatching update for ${emp.id}`, updateData);

        try {
          await axios.put(`${apiUrl}/org/${orgId}/employees/${emp.id}`, updateData, { headers });
          console.log(`PROCESS_SYNC_SUCCESS for ${emp.id}`);

          setAllEmployees(prev => prev.map(e => {
            if (e.id === emp.id) {
              const updated = { ...e };
              if (updateData.departmentId) {
                updated.department = departments.find(d => d.id === updateData.departmentId)?.name || e.department;
              }
              if (updateData.locationId) {
                updated.location = locations.find(l => l.id === updateData.locationId)?.name || e.location;
              }
              if (updateData.designationId) {
                updated.role = designations.find(d => d.id === updateData.designationId)?.name || e.role;
              }
              if (updateData.basicSalary) {
                updated.salary = updateData.basicSalary;
              }
              return updated;
            }
            return e;
          }));

          // If terminated, remove from current visible list after processing all
          if (updateData.status === 'Terminated') {
            setAllEmployees(prev => prev.filter(e => e.id !== emp.id));
          }
        } catch (innerErr: any) {
          const errorDetail = innerErr.response?.data || innerErr.message || innerErr;
          console.error(`PROCESS_SYNC_ERROR for ${emp.id}:`, errorDetail);
          throw innerErr;
        }
      }

      // Resolve Names for History
      let toLabel = 'N/A';
      if (activeTab === 'Custom') {
        const updates = [];
        if (form.departmentId) updates.push(`Dept: ${departments.find(d => d.id === form.departmentId)?.name}`);
        if (form.locationId) updates.push(`Loc: ${locations.find(l => l.id === form.locationId)?.name}`);
        if (form.designationId) updates.push(`Desig: ${designations.find(d => d.id === form.designationId)?.name}`);
        if (form.amount && parseFloat(form.amount) > 0) updates.push(`Salary Up`);
        if (form.date && activeTab === 'Custom' && form.reason) updates.push(`Terminated`);
        toLabel = updates.join(', ') || 'No Changes';
      } else if (activeTab === 'Department') {
        toLabel = departments.find(d => d.id === form.departmentId)?.name || 'N/A';
      } else if (activeTab === 'Location') {
        const loc = locations.find(l => l.id === form.locationId);
        const site = loc?.sites?.find(s => s.id === form.siteId)?.name;
        const buildingName = form.buildingId;
        toLabel = `${loc?.name || ''} ${site ? `(${site})` : ''} ${buildingName ? `[${buildingName}]` : ''}`;
      } else if (activeTab === 'Promotion') {
        toLabel = designations.find(d => d.id === form.designationId)?.name || 'N/A';
      } else if (activeTab === 'Termination') {
        toLabel = 'Terminated';
      }

      const newEntry: ProcessRequest = {
        id: `PR-${Math.floor(Math.random() * 900) + 100}`,
        employeeNames: selectedEmployees.map(e => e.name).join(', '),
        type: activeTab,
        from: activeTab === 'Department' ? selectedEmployees[0]?.department :
          activeTab === 'Location' ? selectedEmployees[0]?.location :
            activeTab === 'Promotion' ? selectedEmployees[0]?.role : 'Active',
        to: toLabel,
        effectiveDate: form.date,
        status: 'Scheduled',
        timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
      };

      setHistory([newEntry, ...history]);
      setSelectedIds([]);
      setForm({ departmentId: '', locationId: '', siteId: '', buildingId: '', designationId: '', percent: '', amount: '', date: '', reason: '' });
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
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-700 font-medium mt-4">Loading organizational data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button className="flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </button>
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">HR Process Manager</h1>
              <p className="text-gray-600">Manage department transfers, location changes, and promotions.</p>
            </div>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 min-h-[600px]">
            {/* Left Panel - Employee Selection */}
            <div className="lg:col-span-1 border-r border-gray-200 p-6">
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Select Employees</h2>
                <p className="text-sm text-gray-600">
                  {selectedIds.length} employee{selectedIds.length !== 1 ? 's' : ''} selected
                </p>
              </div>

              {/* Search Bar */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search employees..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={employeeSearch}
                  onChange={(e) => { setEmployeeSearch(e.target.value); setShowDropdown(true); }}
                  onFocus={() => setShowDropdown(true)}
                />
                {showDropdown && employeeSearch && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden z-50 max-h-64 overflow-y-auto">
                    {filteredEmployees.length > 0 ? (
                      filteredEmployees.map(emp => (
                        <div
                          key={emp.id}
                          className="p-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3 border-b border-gray-100 last:border-none"
                          onClick={() => { setSelectedIds([...selectedIds, emp.id]); setEmployeeSearch(''); setShowDropdown(false); }}
                        >
                          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-medium text-sm">
                            {emp.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-sm text-gray-900">{emp.name}</p>
                            <p className="text-xs text-gray-500">{emp.role} • {emp.department}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-500 text-sm">No results found</div>
                    )}
                  </div>
                )}
              </div>

              {/* Selected Employees List */}
              <div className="space-y-3">
                {selectedIds.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Users className="w-12 h-12 text-gray-300 mb-3" />
                    <p className="text-gray-500 text-sm">No employees selected</p>
                  </div>
                ) : (
                  selectedEmployees.map(emp => (
                    <div key={emp.id} className="relative p-4 bg-gray-50 rounded-lg border border-gray-200 group">
                      <button
                        onClick={() => setSelectedIds(selectedIds.filter(id => id !== emp.id))}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity border border-gray-200"
                      >
                        <X size={14} />
                      </button>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-medium text-sm">
                          {emp.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-900 truncate">{emp.name}</p>
                          <p className="text-xs text-gray-500 truncate">{emp.role}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-200">
                        <div>
                          <p className="text-xs text-gray-500">Department</p>
                          <p className="text-xs font-medium text-gray-700 truncate">{emp.department}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Location</p>
                          <p className="text-xs font-medium text-gray-700 truncate">{emp.location}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right Panel - Process Form */}
            <div className="lg:col-span-2 p-6">
              {/* Tabs */}
              <div className="flex gap-2 mb-6 overflow-x-auto">
                {[
                  { id: 'Department', icon: LayoutGrid, label: 'Department' },
                  { id: 'Location', icon: MapPin, label: 'Location' },
                  { id: 'Promotion', icon: TrendingUp, label: 'Promotion' },
                  { id: 'Termination', icon: X, label: 'Termination' },
                  { id: 'Custom', icon: LayoutGrid, label: 'Custom' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${activeTab === tab.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                  >
                    <tab.icon size={16} />
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
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Current Department</label>
                        <div className="w-full p-3 bg-gray-100 rounded-lg border border-gray-200 text-sm text-gray-700">
                          {(() => {
                            if (selectedEmployees.length === 0) return 'No Selection';
                            const uniqueDepts = Array.from(new Set(selectedEmployees.map(e => e.department)));
                            return uniqueDepts.length === 1 ? uniqueDepts[0] : `Mixed (${uniqueDepts.length})`;
                          })()}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Target Department <span className="text-red-500">*</span>
                        </label>
                        <select
                          className="w-full p-3 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          value={form.departmentId}
                          onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                        >
                          <option value="">Select Department...</option>
                          {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Location Tab */}
                {activeTab === 'Location' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Current Location</label>
                        <div className="w-full p-3 bg-gray-100 rounded-lg border border-gray-200 text-sm text-gray-700">
                          {(() => {
                            if (selectedEmployees.length === 0) return 'No Selection';
                            const uniqueLocs = Array.from(new Set(selectedEmployees.map(e => e.location)));
                            return uniqueLocs.length === 1 ? uniqueLocs[0] : `Mixed (${uniqueLocs.length})`;
                          })()}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Location <span className="text-red-500">*</span>
                        </label>
                        <select
                          className="w-full p-3 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          value={form.locationId}
                          onChange={(e) => setForm({ ...form, locationId: e.target.value, siteId: '', buildingId: '' })}
                        >
                          <option value="">Select Location...</option>
                          {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Site</label>
                        <select
                          disabled={!form.locationId}
                          className="w-full p-3 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:opacity-50 disabled:bg-gray-100"
                          value={form.siteId}
                          onChange={(e) => setForm({ ...form, siteId: e.target.value, buildingId: '' })}
                        >
                          <option value="">Select Site...</option>
                          {locations.find(l => l.id === form.locationId)?.sites?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Building</label>
                        <select
                          disabled={!form.siteId}
                          className="w-full p-3 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:opacity-50 disabled:bg-gray-100"
                          value={form.buildingId}
                          onChange={(e) => setForm({ ...form, buildingId: e.target.value })}
                        >
                          <option value="">Select Building...</option>
                          {locations.find(l => l.id === form.locationId)?.sites?.find(s => s.id === form.siteId)?.buildings?.map((b, idx) => {
                            const bId = typeof b === 'object' ? (b.id || b._id || b.name || idx.toString()) : b;
                            const bName = typeof b === 'object' ? (b.name || b.buildingName || bId) : b;
                            // Prefer using name as ID if real ID is missing, but backend usually gives IDs. 
                            // If backend expects string names for buildingId, we should check. 
                            // For now, assuming standard ID practice or Name as ID if that's how it's stored.
                            return <option key={bId} value={bId}>{bName}</option>;
                          })}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Promotion Tab */}
                {activeTab === 'Promotion' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Current Designation</label>
                        <div className="w-full p-3 bg-gray-100 rounded-lg border border-gray-200 text-sm text-gray-700">
                          {(() => {
                            if (selectedEmployees.length === 0) return 'No Selection';
                            const uniqueRoles = Array.from(new Set(selectedEmployees.map(e => e.role)));
                            return uniqueRoles.length === 1 ? uniqueRoles[0] : `Mixed (${uniqueRoles.length})`;
                          })()}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          New Designation <span className="text-red-500">*</span>
                        </label>
                        <select
                          className="w-full p-3 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          value={form.designationId}
                          onChange={(e) => setForm({ ...form, designationId: e.target.value })}
                        >
                          <option value="">Select Designation...</option>
                          {designations.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                      </div>
                    </div>

                    {/* Salary Calculator */}
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-2 mb-4">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        <h4 className="font-medium text-gray-900">Salary Calculator</h4>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-2">Increase (%)</label>
                          <input
                            type="number"
                            className="w-full p-3 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="0"
                            value={form.percent}
                            onChange={(e) => handleSalaryCalc(e.target.value, true)}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-2">Amount ($)</label>
                          <input
                            type="number"
                            className="w-full p-3 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="0.00"
                            value={form.amount}
                            onChange={(e) => handleSalaryCalc(e.target.value, false)}
                          />
                        </div>
                      </div>
                      {form.amount && selectedEmployees.length > 0 && (
                        <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                          <p className="text-sm text-green-800">
                            New Salary: <span className="font-bold">${(selectedEmployees[0]?.salary + parseFloat(form.amount || '0')).toLocaleString()}</span>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Termination Tab */}
                {activeTab === 'Termination' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Start Date (Joining)</label>
                        <div className="w-full p-3 bg-gray-100 rounded-lg border border-gray-200 text-sm text-gray-700">
                          {selectedEmployees[0]?.dateOfJoining ? new Date(selectedEmployees[0].dateOfJoining).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          End Date (Termination) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          className="w-full p-3 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          value={form.date}
                          onChange={(e) => setForm({ ...form, date: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* EOSB Calculation Card */}
                    {selectedEmployees[0]?.dateOfJoining && form.date && (
                      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 mb-4">
                          <DollarSign className="w-5 h-5 text-blue-600" />
                          <h4 className="font-medium text-gray-900">End of Service Benefit (EOSB) Calculation</h4>
                        </div>

                        {(() => {
                          const startDate = new Date(selectedEmployees[0].dateOfJoining!);
                          const endDate = new Date(form.date);
                          const diffTime = endDate.getTime() - startDate.getTime();

                          if (diffTime < 0) {
                            return <p className="text-sm text-red-600 font-medium">Termination date cannot be before joining date.</p>;
                          }

                          const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
                          const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                          const years = Math.floor(totalDays / 365.25);
                          const remainingDays = totalDays % 365.25;
                          const months = Math.floor(remainingDays / 30.44);
                          const actualDays = Math.floor(remainingDays % 30.44);

                          let eosbDays = 0;
                          if (diffYears < 1) {
                            eosbDays = 0;
                          } else if (diffYears <= 5) {
                            eosbDays = diffYears * 21;
                          } else {
                            eosbDays = (5 * 21) + (diffYears - 5) * 30;
                          }

                          const monthlySalary = selectedEmployees[0].salary || 0;
                          const dailyRate = monthlySalary / 30;
                          const totalEOSB = dailyRate * eosbDays;

                          return (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <p className="text-xs text-blue-600 font-medium">Total Year Work</p>
                                  <p className="text-lg font-bold text-blue-900">
                                    {years} Year{years !== 1 ? 's' : ''}, {months} Month{months !== 1 ? 's' : ''}, {actualDays} Day{actualDays !== 1 ? 's' : ''}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs text-blue-600 font-medium">EOSB Days</p>
                                  <p className="text-lg font-bold text-blue-900">{eosbDays.toFixed(1)} Days</p>
                                </div>
                              </div>

                              <div className="pt-4 border-t border-blue-200">
                                <div className="flex justify-between items-center">
                                  <span className="text-sm text-blue-800">Calculated EOSB Amount:</span>
                                  <span className="text-2xl font-black text-blue-900">${totalEOSB.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                                <p className="text-[10px] text-blue-500 mt-2">
                                  * Calculation based on: {diffYears < 1 ? 'Less than 1 year (No EOSB)' :
                                    diffYears <= 5 ? '1-5 years (21 days/year)' : 'Over 5 years (21 days for first 5 years, 30 days thereafter)'}
                                </p>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                )}

                {/* Custom Tab */}
                {activeTab === 'Custom' && (
                  <div className="space-y-8 animate-in fade-in duration-500 pb-10">
                    <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 flex items-center gap-2">
                      <LayoutGrid className="w-4 h-4 text-blue-600" />
                      <p className="text-xs font-semibold text-blue-700">Custom Process: Multiple Updates for {selectedEmployees[0]?.name || 'Employee'}</p>
                    </div>

                    <div className="grid grid-cols-1 gap-8">
                      {/* Section 1: Department Change */}
                      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 pb-2 border-b">
                          <LayoutGrid className="w-5 h-5 text-blue-500" />
                          1. Department Change
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">Current Department</label>
                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-sm text-gray-600 italic">
                              {selectedEmployees[0]?.department || 'N/A'}
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">Target Department <span className="text-red-500">*</span></label>
                            <select
                              className="w-full p-3 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm"
                              value={form.departmentId}
                              onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                            >
                              <option value="">No Change</option>
                              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">Effective Date <span className="text-red-500">*</span></label>
                            <input
                              type="date"
                              className="w-full p-3 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm"
                              value={form.date}
                              onChange={(e) => setForm({ ...form, date: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">Remarks</label>
                            <input
                              className="w-full p-3 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500/20 outline-none text-sm"
                              placeholder="Note for department change..."
                              value={form.reason}
                              onChange={(e) => setForm({ ...form, reason: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Section 2: Location Change */}
                      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 pb-2 border-b">
                          <MapPin className="w-5 h-5 text-orange-500" />
                          2. Location Change
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">Current Location</label>
                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-sm text-gray-600 italic">
                              {selectedEmployees[0]?.location || 'N/A'}
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">Location <span className="text-red-500">*</span></label>
                            <select
                              className="w-full p-3 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500/20 outline-none text-sm"
                              value={form.locationId}
                              onChange={(e) => setForm({ ...form, locationId: e.target.value, siteId: '', buildingId: '' })}
                            >
                              <option value="">No Change</option>
                              {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">Site</label>
                            <select
                              disabled={!form.locationId}
                              className="w-full p-3 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500/20 outline-none text-sm disabled:opacity-50"
                              value={form.siteId}
                              onChange={(e) => setForm({ ...form, siteId: e.target.value, buildingId: '' })}
                            >
                              <option value="">Select Site...</option>
                              {locations.find(l => l.id === form.locationId)?.sites?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">Building</label>
                            <select
                              disabled={!form.siteId}
                              className="w-full p-3 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500/20 outline-none text-sm disabled:opacity-50"
                              value={form.buildingId}
                              onChange={(e) => setForm({ ...form, buildingId: e.target.value })}
                            >
                              <option value="">Select Building...</option>
                              {locations.find(l => l.id === form.locationId)?.sites?.find(s => s.id === form.siteId)?.buildings?.map((b, idx) => {
                                const bId = typeof b === 'object' ? (b.id || b._id || b.name || idx.toString()) : b;
                                const bName = typeof b === 'object' ? (b.name || b.buildingName || bId) : b;
                                return <option key={bId} value={bId}>{bName}</option>;
                              })}
                            </select>
                          </div>
                          {/* Reiterating Date/Remarks as requested, though binding to same state for single action utility */}
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">Effective Date <span className="text-red-500">*</span></label>
                            <input
                              type="date"
                              className="w-full p-3 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500/20 outline-none text-sm"
                              value={form.date}
                              onChange={(e) => setForm({ ...form, date: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">Remarks</label>
                            <input
                              className="w-full p-3 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500/20 outline-none text-sm"
                              placeholder="Note for location change..."
                              value={form.reason}
                              onChange={(e) => setForm({ ...form, reason: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Section 3: Promotion */}
                      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 pb-2 border-b">
                          <TrendingUp className="w-5 h-5 text-green-500" />
                          3. Promotion
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">Current Designation</label>
                            <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-sm text-gray-600 italic">
                              {selectedEmployees[0]?.role || 'N/A'}
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wider">New Designation <span className="text-red-500">*</span></label>
                            <select
                              className="w-full p-3 bg-white rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500/20 outline-none text-sm"
                              value={form.designationId}
                              onChange={(e) => setForm({ ...form, designationId: e.target.value })}
                            >
                              <option value="">No Change</option>
                              {designations.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                          </div>
                        </div>
                        <div className="bg-green-50/50 p-4 rounded-xl border border-green-100 grid grid-cols-2 gap-4 mt-2">
                          <div>
                            <label className="block text-[10px] font-bold text-green-700 uppercase mb-2 tracking-wider text-center">Increase (%)</label>
                            <input
                              type="number"
                              className="w-full p-3 bg-white rounded-xl border border-green-200 focus:ring-2 focus:ring-green-500/20 outline-none text-sm text-center"
                              placeholder="0"
                              value={form.percent}
                              onChange={(e) => handleSalaryCalc(e.target.value, true)}
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-green-700 uppercase mb-2 tracking-wider text-center">Amount ($)</label>
                            <input
                              type="number"
                              className="w-full p-3 bg-white rounded-xl border border-green-200 focus:ring-2 focus:ring-green-500/20 outline-none text-sm text-center"
                              placeholder="0.00"
                              value={form.amount}
                              onChange={(e) => handleSalaryCalc(e.target.value, false)}
                            />
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                )}

                {/* Common Fields */}
                {activeTab !== 'Custom' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-gray-200">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {activeTab === 'Termination' ? 'Termination Date' : 'Effective Date'} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        className="w-full p-3 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        value={form.date}
                        onChange={(e) => setForm({ ...form, date: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">{activeTab === 'Termination' ? 'Termination Remark' : 'Remarks'}</label>
                      <textarea
                        className="w-full p-3 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                        rows={1}
                        placeholder="Optional notes..."
                        value={form.reason}
                        onChange={(e) => setForm({ ...form, reason: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleProcess}
                    disabled={selectedIds.length === 0 || !form.date || isProcessing}
                    className={`px-6 py-3 text-white rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${activeTab === 'Termination'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                  >
                    {isProcessing ? (
                      <>Processing...</>
                    ) : (
                      <>
                        {activeTab === 'Termination' ? <X size={18} /> : <ArrowRight size={18} />}
                        {activeTab === 'Termination' ? 'Terminate Employee' : 'Process Request'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* History Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <History className="w-5 h-5 text-blue-600" />
              Process History
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
                className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
              >
                <Trash2 size={14} />
                Clear
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employees</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Change</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {history.filter(req => !req.endTime).map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-blue-600">#{req.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{req.employeeNames}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${req.type === 'Promotion' ? 'bg-green-100 text-green-700' :
                        req.type === 'Location' ? 'bg-orange-100 text-orange-700' :
                          req.type === 'Termination' ? 'bg-red-100 text-red-700' :
                            req.type === 'Custom' ? 'bg-purple-100 text-purple-700' :
                              'bg-blue-100 text-blue-700'
                        }`}>
                        {req.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      <div className="flex items-center gap-2">
                        <span>{req.from}</span>
                        <ChevronRight size={14} className="text-gray-400" />
                        <span className="font-medium">{req.to}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">{req.effectiveDate}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-green-500" />
                        <span className="text-sm text-gray-700">Completed</span>
                      </div>
                    </td>
                  </tr>
                ))}
                {history.filter(req => !req.endTime).length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500 text-sm">
                      No process history available
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