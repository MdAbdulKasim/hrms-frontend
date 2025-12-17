'use client';

import React, { useState } from 'react';
import { X, Plus, Play, Square, Target, Clock, Briefcase, CheckCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface TimeEntry {
  project: string;
  task: string;
  date: string;
  hours: string;
  status: 'Approved' | 'Pending' | 'Rejected';
}

const projects = [
  'HRMS Development',
  'Mobile App',
  'Website Redesign',
  'API Integration'
];

const tasks = [
  'Frontend Development',
  'Backend Development',
  'UI Design',
  'Testing'
];

export default function TimeTrackingApp() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedTask, setSelectedTask] = useState('');
  const [date, setDate] = useState('');
  const [hours, setHours] = useState('0.0');
  const [description, setDescription] = useState('');

  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    setIsTimerRunning(true);
  };

  const handleStop = () => {
    setIsTimerRunning(false);
    setElapsedSeconds(0);
  };

  const timeEntries: TimeEntry[] = [
    { project: 'HRMS Development', task: 'Frontend Development', date: '2024-01-15', hours: '4.5h', status: 'Approved' },
    { project: 'Mobile App', task: 'UI Design', date: '2024-01-15', hours: '3h', status: 'Pending' },
    { project: 'HRMS Development', task: 'Backend API', date: '2024-01-14', hours: '6h', status: 'Approved' },
    { project: 'Website Redesign', task: 'Testing', date: '2024-01-14', hours: '2.5h', status: 'Rejected' }
  ];

  const handleAddEntry = () => {
    // Handle form submission
    console.log({ selectedProject, selectedTask, date, hours, description });
    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setSelectedProject('');
    setSelectedTask('');
    setDate('');
    setHours('0.0');
    setDescription('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-green-100 text-green-700';
      case 'Pending': return 'bg-yellow-100 text-yellow-700';
      case 'Rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    // Responsive padding: p-4 for mobile, p-6 for tablet, p-8 for desktop
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header: Flex column on mobile, row on tablet+ */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Time Tracking</h1>
            <p className="text-gray-500 mt-1 text-sm sm:text-base">Track time spent on projects and tasks</p>
          </div>
          <button
            onClick={() => setIsDialogOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 border text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            <span className="font-medium">Manual Entry</span>
          </button>
        </div>

        {/* Timer Card */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 lg:p-8 mb-6">
          {/* Main Layout: Stack vertical on mobile, horizontal on desktop */}
          <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between mb-6 gap-6 lg:gap-0">
            
            {/* Project Select */}
            <div className="w-full lg:flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Project</label>
              <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>Select project</option>
                {projects.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>

            {/* Timer Display & Controls */}
            <div className="w-full lg:flex-1 lg:mx-8 text-center">
              <p className="text-sm text-gray-500 mb-2">Elapsed Time</p>
              <div className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-wider mb-4 font-mono">
                {formatTime(elapsedSeconds)}
              </div>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleStart}
                  disabled={isTimerRunning}
                  className={`flex-1 sm:flex-none justify-center flex items-center gap-2 px-6 py-2.5 rounded-lg transition-colors ${
                    isTimerRunning 
                      ? 'bg-blue-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-500'
                  } text-white`}
                >
                  <Play size={18} />
                  Start
                </button>
                <button 
                  onClick={handleStop}
                  disabled={!isTimerRunning}
                  className={`flex-1 sm:flex-none justify-center flex items-center gap-2 px-6 py-2.5 rounded-lg transition-colors ${
                    !isTimerRunning 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-red-400 hover:bg-red-500'
                  } text-white`}
                >
                  <Square size={18} />
                  Stop
                </button>
              </div>
            </div>

            {/* Daily Stats: Center on mobile, Right on desktop */}
            <div className="w-full lg:flex-1 text-center lg:text-right bg-gray-50 lg:bg-transparent p-4 lg:p-0 rounded-lg lg:rounded-none">
              <div className="flex justify-between lg:block">
                <div className="lg:mb-3">
                  <p className="text-sm text-gray-500 mb-1">Today's Total</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">7h 30m</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">This Week</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">32.5h</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Task</label>
            <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Select task</option>
              {tasks.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {/* Stats Cards: 1 col mobile, 2 cols tablet, 4 cols desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Target size={20} className="text-gray-600" />
              </div>
              <p className="text-sm text-gray-500">Weekly Target</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">40h</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Clock size={20} className="text-green-600" />
              </div>
              <p className="text-sm text-gray-500">Hours Logged</p>
            </div>
            <p className="text-3xl font-bold text-green-600">32.5h</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Briefcase size={20} className="text-blue-600" />
              </div>
              <p className="text-sm text-gray-500">Billable</p>
            </div>
            <p className="text-3xl font-bold text-blue-600">28h</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                <CheckCircle size={20} className="text-gray-600" />
              </div>
              <p className="text-sm text-gray-500">Non-Billable</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">4.5h</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-blue-600 text-sm sm:text-base">Weekly Progress</h3>
            <span className="text-sm text-blue-600">32.5h / 40h (81%)</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div className="bg-blue-600 h-3 rounded-full transition-all duration-500" style={{ width: '81%' }}></div>
          </div>
        </div>

        {/* Recent Time Entries: Horizontal scroll for mobile tables */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Recent Time Entries</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Project</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Task</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Date</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Hours</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {timeEntries.map((entry, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{entry.project}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{entry.task}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{entry.date}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{entry.hours}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(entry.status)}`}>
                        {entry.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Time Entry Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="w-[95vw] max-w-md rounded-xl">
            <DialogHeader>
              <DialogTitle>Add Time Entry</DialogTitle>
              <DialogDescription>
                Add a new time entry for your project work
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 sm:space-y-5 py-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Project</label>
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select project</option>
                  {projects.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Task</label>
                <select
                  value={selectedTask}
                  onChange={(e) => setSelectedTask(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select task</option>
                  {tasks.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="dd/mm/yyyy"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">Hours</label>
                  <input
                    type="number"
                    step="0.5"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What did you work on?"
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-3 sm:gap-2">
              <button
                onClick={() => setIsDialogOpen(false)}
                className="w-full sm:w-auto px-6 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 font-medium transition-colors order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEntry}
                className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors order-1 sm:order-2"
              >
                Add Entry
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}