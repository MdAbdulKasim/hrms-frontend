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

        const empRaw = empRes.data.data || empRes.data || [];
        setAllEmployees(empRaw.map((e: any) => ({
          id: e.id || e._id,
          name: e.fullName || `${e.firstName} ${e.lastName}`,
          role: e.designation?.name || e.designation || 'N/A',
          department: e.department?.name || e.department || 'N/A',
          location: e.location?.name || e.location || 'N/A',
          salary: e.salary || 0
        })));

        const locRaw = locRes.data.data || locRes.data || [];
        const locationsToSet = Array.isArray(locRaw) ? locRaw : (locRaw.locations || []);
        setLocations(locationsToSet.map((l: any) => ({
          id: l.id || l._id,
          name: l.locationName || l.name,
          sites: (l.sites || []).map((s: any) => ({
            id: s.id || s._id || s.name,
            name: s.siteName || s.name,
            buildings: s.buildings || []
          }))
        })));

        const desigRaw = desigRes.data.data || desigRes.data || [];
        const designationsToSet = Array.isArray(desigRaw) ? desigRaw : (desigRaw.designations || []);
        setDesignations(designationsToSet.map((d: any) => ({
          id: d.id || d._id,
          name: d.name
        })));

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
        }

        console.log(`PROCESS_SYNC: Dispatching update for ${emp.id}`, updateData);

        try {
          await axios.put(`${apiUrl}/org/${orgId}/employees/${emp.id}`, updateData, { headers });
          console.log(`PROCESS_SYNC_SUCCESS for ${emp.id}`);

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
          throw innerErr;
        }
      }

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
        timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
      };

      setHistory([newEntry, ...history]);
      setSelectedIds([]);
      setForm({ departmentId: '', locationId: '', site: '', building: '', designationId: '', percent: '', amount: '', date: '', reason: '' });
      alert("Process executed successfully!");

    } catch (err) {
      console.error("Process failed", err);
      alert("Failed to execute process. Please try again.");
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
    <div className="min-h-screen bg-gray-50 p-6">
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
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <tab.icon size={16} />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Form Content */}
              <div className="space-y-6">
                {/* Department Tab */}
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
                          onChange={(e) => setForm({ ...form, locationId: e.target.value, site: '', building: '' })}
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
                          value={form.site}
                          onChange={(e) => setForm({ ...form, site: e.target.value, building: '' })}
                        >
                          <option value="">Select Site...</option>
                          {locations.find(l => l.id === form.locationId)?.sites?.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Building</label>
                        <select
                          disabled={!form.site}
                          className="w-full p-3 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm disabled:opacity-50 disabled:bg-gray-100"
                          value={form.building}
                          onChange={(e) => setForm({ ...form, building: e.target.value })}
                        >
                          <option value="">Select Building...</option>
                          {locations.find(l => l.id === form.locationId)?.sites?.find(s => s.name === form.site)?.buildings?.map((b, idx) => {
                            const bId = typeof b === 'object' ? (b.id || b._id || b.name || idx.toString()) : b;
                            const bName = typeof b === 'object' ? (b.name || b.buildingName || bId) : b;
                            return <option key={bId} value={bName}>{bName}</option>;
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

                {/* Common Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-gray-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Effective Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      className="w-full p-3 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Remarks</label>
                    <textarea
                      className="w-full p-3 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                      rows={1}
                      placeholder="Optional notes..."
                      value={form.reason}
                      onChange={(e) => setForm({ ...form, reason: e.target.value })}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleProcess}
                    disabled={selectedIds.length === 0 || !form.date || isProcessing}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <>Processing...</>
                    ) : (
                      <>
                        <ArrowRight size={18} />
                        Process Request
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
                  if (confirm("Clear all history?")) {
                    setHistory([]);
                    localStorage.removeItem('hr_process_history');
                  }
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
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        req.type === 'Promotion' ? 'bg-green-100 text-green-700' :
                        req.type === 'Location' ? 'bg-orange-100 text-orange-700' : 
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
    </div>
  );
}