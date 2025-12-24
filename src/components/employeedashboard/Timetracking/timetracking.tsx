"use client"

import { useState, useRef, useEffect } from "react"
import { Plus, Play, Square, Target, Clock, Briefcase, CheckCircle, ChevronDown } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

import TimeEntryDialog from "./dialog"

interface TimeEntry {
  project: string
  task: string
  date: string
  hours: string
  status: "Approved" | "Pending" | "Rejected"
  description?: string
}

const defaultProjects = ["HRMS Development", "Mobile App", "Website Redesign", "API Integration"]
const defaultTasks = ["Frontend Development", "Backend Development", "UI Design", "Testing"]
const defaultStatuses = ["Approved", "Pending", "Rejected"]

interface StopDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (status: string) => void
  currentStatus: string
  statuses: string[]
}

function StopDialog({
  open,
  onOpenChange,
  onConfirm,
  currentStatus,
  statuses,
}: StopDialogProps) {
  const [status, setStatus] = useState(currentStatus)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setStatus(currentStatus)
  }, [currentStatus])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">Stop Timer</DialogTitle>
          <DialogDescription className="text-sm text-gray-600">
            Please confirm the status before stopping the timer.
          </DialogDescription>
        </DialogHeader>

        <div className="mb-6 mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
          <div className="relative" ref={dropdownRef}>
            <div
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg bg-white cursor-pointer hover:border-gray-400 transition-colors"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <input
                type="text"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                placeholder="Enter or select status"
                className="flex-1 outline-none text-gray-700 bg-transparent"
                onFocus={() => setShowDropdown(true)}
              />
              <ChevronDown size={20} className="text-gray-400" />
            </div>

            {showDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {statuses.map((s) => (
                  <div
                    key={s}
                    onClick={() => {
                      setStatus(s)
                      setShowDropdown(false)
                    }}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-700"
                  >
                    {s}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => onOpenChange(false)}
            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm(status)
              onOpenChange(false)
            }}
            className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Confirm & Stop
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function TimeTrackingPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isStopDialogOpen, setIsStopDialogOpen] = useState(false)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [timerProject, setTimerProject] = useState("")
  const [timerTask, setTimerTask] = useState("")
  const [timerDescription, setTimerDescription] = useState("")
  const [timerStatus, setTimerStatus] = useState<string>("Pending")
  
  // New Filter State
  const [activeFilter, setActiveFilter] = useState<"All" | "Today" | "Weekly" | "Monthly" | "Yearly">("All")

  const [entries, setEntries] = useState<TimeEntry[]>([
    { project: "HRMS Development", task: "Frontend Development", date: "2024-01-15", hours: "4.5h", status: "Approved" },
    { project: "Mobile App", task: "UI Design", date: "2024-01-15", hours: "3h", status: "Pending" },
    { project: "HRMS Development", task: "Backend API", date: "2024-01-14", hours: "6h", status: "Approved" },
    { project: "Website Redesign", task: "Testing", date: "2024-01-14", hours: "2.5h", status: "Rejected" },
  ])

  const [projects, setProjects] = useState<string[]>(defaultProjects)
  const [tasks, setTasks] = useState<string[]>(defaultTasks)
  const [statuses, setStatuses] = useState<string[]>(defaultStatuses)
  const [newTimerProjectInput, setNewTimerProjectInput] = useState("")
  const [newTimerTaskInput, setNewTimerTaskInput] = useState("")
  const [newTimerStatusInput, setNewTimerStatusInput] = useState("")
  const [showTimerProjectDropdown, setShowTimerProjectDropdown] = useState(false)
  const [showTimerTaskDropdown, setShowTimerTaskDropdown] = useState(false)
  const [showTimerStatusDropdown, setShowTimerStatusDropdown] = useState(false)

  const timerProjectDropdownRef = useRef<HTMLDivElement>(null)
  const timerTaskDropdownRef = useRef<HTMLDivElement>(null)
  const timerStatusDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (timerProjectDropdownRef.current && !timerProjectDropdownRef.current.contains(event.target as Node)) {
        setShowTimerProjectDropdown(false)
      }
      if (timerTaskDropdownRef.current && !timerTaskDropdownRef.current.contains(event.target as Node)) {
        setShowTimerTaskDropdown(false)
      }
      if (timerStatusDropdownRef.current && !timerStatusDropdownRef.current.contains(event.target as Node)) {
        setShowTimerStatusDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTimerRunning) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isTimerRunning])

  // Filtering Logic
  const filteredEntries = entries.filter((entry) => {
    if (activeFilter === "All") return true
    
    const entryDate = new Date(entry.date)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    switch (activeFilter) {
      case "Today":
        return entryDate.getTime() === today.getTime()
      case "Weekly": {
        const startOfWeek = new Date(today)
        startOfWeek.setDate(today.getDate() - today.getDay())
        return entryDate >= startOfWeek && entryDate <= now
      }
      case "Monthly":
        return entryDate.getMonth() === now.getMonth() && entryDate.getFullYear() === now.getFullYear()
      case "Yearly":
        return entryDate.getFullYear() === now.getFullYear()
      default:
        return true
    }
  })

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleStart = () => setIsTimerRunning(true)
  const handleStop = () => setIsStopDialogOpen(true)

  const handleConfirmStop = (finalStatus: string) => {
    setIsTimerRunning(false)
    const hoursFormatted = (elapsedSeconds / 3600).toFixed(1) + "h"
    const newEntry: TimeEntry = {
      project: timerProject,
      task: timerTask,
      date: new Date().toISOString().split("T")[0],
      hours: hoursFormatted,
      status: finalStatus as any,
      description: timerDescription,
    }
    setEntries([newEntry, ...entries])
    setElapsedSeconds(0)
    setTimerProject("")
    setTimerTask("")
    setTimerDescription("")
    setTimerStatus("Pending")
  }

  const handleAddManualEntry = (entry: {
    project: string
    task: string
    date: string
    hours: string
    description: string
  }) => {
    const hoursFormatted = Number.parseFloat(entry.hours).toFixed(1) + "h"
    const newEntry: TimeEntry = {
      project: entry.project,
      task: entry.task,
      date: entry.date,
      hours: hoursFormatted,
      status: "Pending",
      description: entry.description,
    }
    setEntries([newEntry, ...entries])
  }

  const isTimerFormComplete =
    timerProject.trim() !== "" && timerTask.trim() !== "" && timerDescription.trim() !== "" && timerStatus.trim() !== ""

  const handleCreateTimerProject = () => {
    if (newTimerProjectInput.trim() !== "" && !projects.includes(newTimerProjectInput.trim())) {
      setProjects([...projects, newTimerProjectInput.trim()])
      setTimerProject(newTimerProjectInput.trim())
      setNewTimerProjectInput("")
      setShowTimerProjectDropdown(false)
    }
  }

  const handleCreateTimerTask = () => {
    if (newTimerTaskInput.trim() !== "" && !tasks.includes(newTimerTaskInput.trim())) {
      setTasks([...tasks, newTimerTaskInput.trim()])
      setTimerTask(newTimerTaskInput.trim())
      setNewTimerTaskInput("")
      setShowTimerTaskDropdown(false)
    }
  }

  const handleCreateTimerStatus = () => {
    if (newTimerStatusInput.trim() !== "" && !statuses.includes(newTimerStatusInput.trim())) {
      setStatuses([...statuses, newTimerStatusInput.trim()])
      setTimerStatus(newTimerStatusInput.trim())
      setNewTimerStatusInput("")
      setShowTimerStatusDropdown(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved": return "bg-green-100 text-green-700"
      case "Pending": return "bg-yellow-100 text-yellow-700"
      case "Rejected": return "bg-red-100 text-red-700"
      default: return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Time Tracking</h1>
            <p className="text-gray-500 mt-1 text-sm sm:text-base">Track time spent on projects and tasks</p>
          </div>
          <button
            onClick={() => setIsDialogOpen(true)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={20} />
            <span className="font-medium">Manual Entry</span>
          </button>
        </div>

        {/* Timer Section */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 lg:p-8 mb-6">
          <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between mb-6 gap-6 lg:gap-0">
            <div className="w-full lg:flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Project</label>
              <div className="relative" ref={timerProjectDropdownRef}>
                <div className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg bg-white cursor-pointer hover:border-gray-400 transition-colors">
                  <input
                    type="text"
                    value={timerProject}
                    onChange={(e) => setTimerProject(e.target.value)}
                    placeholder="Select or type project"
                    className="flex-1 outline-none text-gray-700"
                    onFocus={() => setShowTimerProjectDropdown(true)}
                  />
                  <ChevronDown size={20} className="text-gray-400 cursor-pointer" onClick={() => setShowTimerProjectDropdown(!showTimerProjectDropdown)} />
                </div>
                {showTimerProjectDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    <div className="p-2">
                      <input
                        type="text"
                        value={newTimerProjectInput}
                        onChange={(e) => setNewTimerProjectInput(e.target.value)}
                        placeholder="Type to create new..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onKeyPress={(e) => e.key === "Enter" && handleCreateTimerProject()}
                      />
                      {newTimerProjectInput.trim() && (
                        <button onClick={handleCreateTimerProject} className="w-full mt-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center justify-center gap-2">
                          <Plus size={16} /> Create "{newTimerProjectInput}"
                        </button>
                      )}
                    </div>
                    <div className="border-t border-gray-200">
                      {projects.map((p) => (
                        <div key={p} onClick={() => { setTimerProject(p); setShowTimerProjectDropdown(false); }} className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-700">
                          {p}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="w-full lg:flex-1 lg:mx-8 text-center">
              <p className="text-sm text-gray-500 mb-2">Elapsed Time</p>
              <div className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-wider mb-4 font-mono">
                {formatTime(elapsedSeconds)}
              </div>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleStart}
                  disabled={isTimerRunning || !isTimerFormComplete}
                  className={`flex-1 sm:flex-none justify-center flex items-center gap-2 px-6 py-2.5 rounded-lg transition-colors ${
                    isTimerRunning || !isTimerFormComplete ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-500"
                  } text-white`}
                >
                  <Play size={18} /> Start
                </button>
                <button
                  onClick={handleStop}
                  disabled={!isTimerRunning}
                  className={`flex-1 sm:flex-none justify-center flex items-center gap-2 px-6 py-2.5 rounded-lg transition-colors ${
                    !isTimerRunning ? "bg-gray-400 cursor-not-allowed" : "bg-red-400 hover:bg-red-500"
                  } text-white`}
                >
                  <Square size={18} /> Stop
                </button>
              </div>
            </div>

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Task</label>
              <div className="relative" ref={timerTaskDropdownRef}>
                <div className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg bg-white cursor-pointer hover:border-gray-400 transition-colors">
                  <input
                    type="text"
                    value={timerTask}
                    onChange={(e) => setTimerTask(e.target.value)}
                    placeholder="Select task"
                    className="flex-1 outline-none text-gray-700"
                    onFocus={() => setShowTimerTaskDropdown(true)}
                  />
                  <ChevronDown size={20} className="text-gray-400" />
                </div>
                {showTimerTaskDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {tasks.map((t) => (
                      <div key={t} onClick={() => { setTimerTask(t); setShowTimerTaskDropdown(false); }} className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-700">
                        {t}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <div className="relative" ref={timerStatusDropdownRef}>
                <div className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg bg-white cursor-pointer hover:border-gray-400 transition-colors">
                  <input
                    type="text"
                    value={timerStatus}
                    onChange={(e) => setTimerStatus(e.target.value)}
                    placeholder="Select status"
                    className="flex-1 outline-none text-gray-700"
                    onFocus={() => setShowTimerStatusDropdown(true)}
                  />
                  <ChevronDown size={20} className="text-gray-400" />
                </div>
                {showTimerStatusDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {statuses.map((s) => (
                      <div key={s} onClick={() => { setTimerStatus(s); setShowTimerStatusDropdown(false); }} className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-700">
                        {s}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={timerDescription}
              onChange={(e) => setTimerDescription(e.target.value)}
              placeholder="What are you working on?"
              rows={3}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"><Target size={20} className="text-gray-600" /></div>
              <p className="text-sm text-gray-500">Weekly Target</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">40h</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center"><Clock size={20} className="text-green-600" /></div>
              <p className="text-sm text-gray-500">Hours Logged</p>
            </div>
            <p className="text-3xl font-bold text-green-600">32.5h</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center"><Briefcase size={20} className="text-blue-600" /></div>
              <p className="text-sm text-gray-500">Billable</p>
            </div>
            <p className="text-3xl font-bold text-blue-600">28h</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center"><CheckCircle size={20} className="text-gray-600" /></div>
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
            <div className="bg-blue-600 h-3 rounded-full transition-all duration-500" style={{ width: "81%" }}></div>
          </div>
        </div>

        {/* Recent Entries Table with Filters */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Recent Time Entries</h2>
            
            {/* Filter Tabs */}
            <div className="flex bg-gray-100 p-1 rounded-lg self-stretch sm:self-auto overflow-x-auto">
              {["All", "Today", "Weekly", "Monthly", "Yearly"].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter as any)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap ${
                    activeFilter === filter
                      ? "bg-white text-blue-600 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
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
                {filteredEntries.length > 0 ? (
                  filteredEntries.map((entry, index) => (
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
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-gray-500 text-sm italic">
                      No entries found for the selected period.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <TimeEntryDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onAddEntry={handleAddManualEntry}
        projects={projects}
        tasks={tasks}
        statuses={statuses}
        onCreateProject={(name) => setProjects([...projects, name])}
        onCreateTask={(name) => setTasks([...tasks, name])}
        onCreateStatus={(name) => setStatuses([...statuses, name])}
      />

      <StopDialog
        open={isStopDialogOpen}
        onOpenChange={setIsStopDialogOpen}
        onConfirm={handleConfirmStop}
        currentStatus={timerStatus}
        statuses={statuses}
      />
    </div>
  )
}