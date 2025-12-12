"use client";

import React, { useState, useRef } from 'react';
import { 
  Mail, Phone, MapPin, Briefcase, Calendar, Building, 
  FileText, Edit2, Camera, UploadCloud, X, CheckCircle,
  MoreHorizontal, Shield
} from 'lucide-react';
import Dashboard from './home';


// --- Types ---
interface LeaveBalance {
  type: string;
  used: number;
  total: number;
  color: string;
}

interface Employee {
  id: string;
  name: string;
  role: string;
  avatar: string;
  coverImage: string;
  email: string;
  phone: string;
  location: string;
  department: string;
  joinDate: string;
  manager: string;
  leaves: LeaveBalance[];
}

// --- Initial Data ---
const initialData: Employee = {
  id: "EMP-2024-045",
  name: "Alex Johnson",
  role: "Senior Frontend Engineer",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
  coverImage: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?auto=format&fit=crop&q=80&w=2000",
  email: "alex.johnson@techcorp.com",
  phone: "+1 (555) 012-3456",
  location: "San Francisco, CA",
  department: "Engineering",
  joinDate: "March 15, 2021",
  manager: "Sarah Connor",
  leaves: [
    { type: 'Casual Leave', used: 4, total: 12, color: 'bg-blue-500' },
    { type: 'Sick Leave', used: 2, total: 10, color: 'bg-rose-500' },
    { type: 'Privilege Leave', used: 5, total: 15, color: 'bg-emerald-500' },
  ]
};

// --- REUSABLE COMPONENT: Modal ---
const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl transform transition-all animate-[zoomIn_0.2s_ease-out] relative z-10 overflow-hidden border border-slate-100">
        <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-white hover:shadow-sm rounded-full text-slate-400 hover:text-slate-600 transition-all">
            <X size={18} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

// --- REUSABLE COMPONENT: InfoCard ---
const InfoCard = ({ icon: Icon, label, value }: { icon: any, label: string, value: string }) => (
  <div className="group flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 hover:border-blue-100 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300">
    <div className="p-3 bg-slate-50 text-slate-500 group-hover:bg-blue-600 group-hover:text-white rounded-xl transition-colors duration-300">
      <Icon size={20} />
    </div>
    <div>
      <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-slate-800 font-semibold">{value}</p>
    </div>
  </div>
);

export default function ProfilePage() {
  const [employee, setEmployee] = useState<Employee>(initialData);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isLeaveOpen, setIsLeaveOpen] = useState(false);
  const [editForm, setEditForm] = useState(initialData);

  // Profile Picture Logic
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setEmployee(prev => ({ ...prev, avatar: URL.createObjectURL(file) }));
  };

  // Leave Logic
  const [leaveForm, setLeaveForm] = useState({ type: initialData.leaves[0].type, days: 1 });
  const handleApplyLeave = () => {
    setEmployee(prev => ({
      ...prev,
      leaves: prev.leaves.map(l => l.type === leaveForm.type ? { ...l, used: Math.min(l.used + leaveForm.days, l.total) } : l)
    }));
    setIsLeaveOpen(false);
  };

  return (
  
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 pb-20">
      
      {/* --- EDIT PROFILE MODAL --- */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Personal Details">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">First Name</label>
              <input type="text" value={editForm.name.split(' ')[0]} 
                onChange={e => setEditForm({...editForm, name: `${e.target.value} ${editForm.name.split(' ')[1] || ''}`})}
                className="w-full mt-1 p-3 bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 border rounded-xl outline-none transition-all font-medium" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Last Name</label>
              <input type="text" value={editForm.name.split(' ')[1] || ''} 
                onChange={e => setEditForm({...editForm, name: `${editForm.name.split(' ')[0]} ${e.target.value}`})}
                className="w-full mt-1 p-3 bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 border rounded-xl outline-none transition-all font-medium" />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Role / Job Title</label>
            <input type="text" value={editForm.role} onChange={e => setEditForm({...editForm, role: e.target.value})}
              className="w-full mt-1 p-3 bg-slate-50 border-transparent focus:bg-white focus:border-blue-500 border rounded-xl outline-none transition-all font-medium" />
          </div>
          <button onClick={() => { setEmployee(editForm); setIsEditOpen(false); }} 
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all mt-4">
            Save Changes
          </button>
        </div>
      </Modal>

      {/* --- APPLY LEAVE MODAL --- */}
      <Modal isOpen={isLeaveOpen} onClose={() => setIsLeaveOpen(false)} title="Request Time Off">
        <div className="space-y-5">
           <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex gap-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg h-fit"><Calendar size={20}/></div>
              <div>
                <p className="text-sm font-bold text-blue-900">Holiday Notice</p>
                <p className="text-xs text-blue-700 mt-1">Check the team calendar before applying to ensure coverage.</p>
              </div>
           </div>
           <div>
             <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Select Leave Type</label>
             <div className="grid grid-cols-3 gap-2 mt-2">
                {employee.leaves.map(l => (
                  <button key={l.type} onClick={() => setLeaveForm({...leaveForm, type: l.type})}
                    className={`p-3 rounded-xl border text-sm font-medium transition-all ${leaveForm.type === l.type ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 hover:border-slate-300'}`}>
                    {l.type.split(' ')[0]}
                  </button>
                ))}
             </div>
           </div>
           <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Number of Days</label>
              <input type="range" min="1" max="14" value={leaveForm.days} onChange={e => setLeaveForm({...leaveForm, days: Number(e.target.value)})} 
                className="w-full mt-2 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
              <div className="flex justify-between text-xs text-slate-400 mt-1 font-medium"><span>1 Day</span><span>{leaveForm.days} Days Selected</span><span>14 Days</span></div>
           </div>
           <button onClick={handleApplyLeave} className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2">
             <CheckCircle size={18} /> Submit Request
           </button>
        </div>
      </Modal>

      {/* --- MAIN CONTENT --- */}
      <div className="max-w-7xl mx-auto px-6 relative z-10 pt-8 animate-[fadeIn_0.5s_ease-out]">
        
        {/* HEADER PROFILE */}
        <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          
          <div className="px-10 py-8">
            <div className="flex flex-col lg:flex-row items-center lg:items-end gap-8">
              
              {/* Avatar */}
              <div className="relative group shrink-0">
                <div className="w-48 h-48 rounded-[2rem] border-4 border-slate-100 shadow-xl bg-white overflow-hidden relative rotate-0 hover:rotate-1 transition-all duration-300">
                  <img src={employee.avatar} alt="Profile" className="w-full h-full object-cover"/>
                  <div onClick={() => fileInputRef.current?.click()} className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center text-white backdrop-blur-[2px]">
                    <Camera size={32} />
                  </div>
                </div>
                {/* Online Indicator */}
                <div className="absolute bottom-3 -right-2 w-6 h-6 bg-emerald-500 border-[4px] border-white rounded-full">
                  <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75"></span>
                </div>
                <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*"/>
              </div>

              {/* Main Info */}
              <div className="flex-1 w-full lg:w-auto text-center lg:text-left pt-4 lg:pt-0">
                <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                  <div>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">{employee.name}</h1>
                    <p className="text-lg text-slate-500 font-medium mt-1 mb-4">{employee.role}</p>
                    
                    <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                      <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg text-sm font-semibold border border-slate-100">
                        <MapPin size={16} className="text-slate-400"/> {employee.location}
                      </span>
                      <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg text-sm font-semibold border border-slate-100">
                        <Building size={16} className="text-slate-400"/> {employee.department}
                      </span>
                      <span className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-semibold border border-blue-100">
                        <Shield size={16}/> Active Employee
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 w-full lg:w-auto mt-4 lg:mt-0">
                    <button onClick={() => { setEditForm(employee); setIsEditOpen(true); }}
                      className="flex-1 lg:flex-none items-center justify-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all shadow-lg shadow-slate-900/20">
                      <Edit2 size={18} /> Edit Profile
                    </button>
                    <button className="p-3 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-600 transition-all">
                      <MoreHorizontal size={20} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-8 mt-12 border-b border-slate-200">
              {['Overview', 'Personal', 'Teams', 'Payroll'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab.toLowerCase())}
                  className={`pb-4 px-2 text-sm font-bold tracking-wide transition-all relative ${
                    activeTab === tab.toLowerCase() ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {tab.toUpperCase()}
                  {activeTab === tab.toLowerCase() && <span className="absolute bottom-0 left-0 w-full h-[3px] bg-blue-600 rounded-t-full shadow-lg shadow-blue-500/50"></span>}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          
          {/* Left Column - Details */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/40 border border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-800">Contact Information</h3>
                <button className="text-sm font-bold text-blue-600 hover:text-blue-700">View All</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InfoCard icon={Mail} label="Work Email" value={employee.email} />
                <InfoCard icon={Phone} label="Phone Number" value={employee.phone} />
                <InfoCard icon={Briefcase} label="Reporting To" value={employee.manager} />
                <InfoCard icon={FileText} label="Employee ID" value={employee.id} />
              </div>
            </div>
          </div>

          {/* Right Column - Stats & Leave */}
          <div className="space-y-8">
            <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/40 border border-slate-100 relative overflow-hidden">
              <div className="flex justify-between items-center mb-6 relative z-10">
                 <h3 className="text-xl font-bold text-slate-800">Leave Balance</h3>
                 <span className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-500 rounded-full">2024</span>
              </div>
              
              <div className="space-y-6 relative z-10">
                {employee.leaves.map((leave, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-sm mb-2.5">
                      <span className="font-bold text-slate-700">{leave.type}</span>
                      <span className="font-semibold text-slate-400">{leave.used} / {leave.total}</span>
                    </div>
                    <div className="w-full bg-slate-50 rounded-full h-3 overflow-hidden border border-slate-100">
                      <div 
                        className={`h-full rounded-full ${leave.color} shadow-sm transition-all duration-1000 ease-out`} 
                        style={{ width: `${(leave.used / leave.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Decorative Background Blob */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

              <button 
                onClick={() => setIsLeaveOpen(true)}
                className="w-full mt-8 py-3.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-bold rounded-xl transition-all flex justify-center items-center gap-2 border border-blue-200"
              >
                <UploadCloud size={18} /> Apply for Leave
              </button>
            </div>
            
            {/* Promotion Card */}
            <div className="group bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-xl shadow-indigo-500/20 cursor-pointer">
              <div className="relative z-10 transition-transform duration-300 group-hover:-translate-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-xs font-semibold mb-4">
                   <Calendar size={12} /> Next Review: Dec 2024
                </div>
                <h3 className="text-2xl font-bold mb-2">Performance Review</h3>
                <p className="text-indigo-100 text-sm leading-relaxed">Your annual appraisal is coming up. Ensure your goals are updated.</p>
              </div>
              <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
            </div>

          </div>
        </div>
      </div>
    </div>
    
  );
}