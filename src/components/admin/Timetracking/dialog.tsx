"use client"

import { useState, useRef, useEffect } from "react"
import { Plus, ChevronDown } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import projectService from "@/lib/projectService"
import { getOrgId } from "@/lib/auth"

interface TimeEntryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddEntry: (entry: {
    project: string
    task: string
    date: string
    hours: string
    description: string
    status: string
  }) => void
  projects: any[]
  tasks: string[]
  statuses: string[]
  onCreateProject: (project: any) => void
  onCreateTask: (name: string) => void
  onCreateStatus: (name: string) => void
}

export default function TimeEntryDialog({
  open,
  onOpenChange,
  onAddEntry,
  projects,
  tasks,
  statuses,
  onCreateProject,
  onCreateTask,
  onCreateStatus,
}: TimeEntryDialogProps) {
  const [project, setProject] = useState("")
  const [task, setTask] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [hours, setHours] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState("")
  const [newProjectInput, setNewProjectInput] = useState("")
  const [newTaskInput, setNewTaskInput] = useState("")
  const [newStatusInput, setNewStatusInput] = useState("")
  const [showProjectDropdown, setShowProjectDropdown] = useState(false)
  const [showTaskDropdown, setShowTaskDropdown] = useState(false)
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [creatingProject, setCreatingProject] = useState(false)

  const projectDropdownRef = useRef<HTMLDivElement>(null)
  const taskDropdownRef = useRef<HTMLDivElement>(null)
  const statusDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        projectDropdownRef.current &&
        !projectDropdownRef.current.contains(event.target as Node)
      ) {
        setShowProjectDropdown(false)
      }
      if (
        taskDropdownRef.current &&
        !taskDropdownRef.current.contains(event.target as Node)
      ) {
        setShowTaskDropdown(false)
      }
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(event.target as Node)
      ) {
        setShowStatusDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSubmit = () => {
    if (project && task && date && hours) {
      onAddEntry({ project, task, date, hours, description, status })
      setProject("")
      setTask("")
      setDate(new Date().toISOString().split("T")[0])
      setHours("")
      setDescription("")
      setStatus("")
      onOpenChange(false)
    }
  }

  const handleCreateProject = async () => {
    if (!newProjectInput.trim()) return;

    // Check if project already exists
    const projectExists = projects.some(p => p === newProjectInput.trim() || (typeof p === 'object' && p.name === newProjectInput.trim()));
    if (projectExists) {
      setProject(newProjectInput.trim());
      setNewProjectInput("");
      setShowProjectDropdown(false);
      return;
    }

    try {
      setCreatingProject(true);
      const orgId = getOrgId();
      if (!orgId) {
        alert('Organization not found');
        return;
      }

      const response = await projectService.create(orgId, {
        name: newProjectInput.trim(),
        startDate: new Date().toISOString()
      });

      if (response.error) {
        alert(response.error);
        return;
      }

      const newProject = response.data || response;
      onCreateProject(newProject);
      setProject(newProjectInput.trim());
      setNewProjectInput("");
      setShowProjectDropdown(false);
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project');
    } finally {
      setCreatingProject(false);
    }
  }

  const handleCreateTask = () => {
    if (newTaskInput.trim() && !tasks.includes(newTaskInput.trim())) {
      onCreateTask(newTaskInput.trim())
      setTask(newTaskInput.trim())
      setNewTaskInput("")
      setShowTaskDropdown(false)
    }
  }

  const handleCreateStatus = () => {
    if (newStatusInput.trim() && !statuses.includes(newStatusInput.trim())) {
      onCreateStatus(newStatusInput.trim())
      setStatus(newStatusInput.trim())
      setNewStatusInput("")
      setShowStatusDropdown(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0">
        {/* ✅ REQUIRED BY RADIX (VISIBLE TITLE) */}
        <DialogTitle className="text-2xl font-bold text-gray-900 px-6 pt-6">
          Add Manual Time Entry
        </DialogTitle>

        <div className="px-6 pb-6 pt-4 max-h-[90vh] overflow-y-auto">
          <div className="space-y-5">
            {/* Project */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project *
              </label>
              <div className="relative" ref={projectDropdownRef}>
                <div className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg bg-white">
                  <input
                    type="text"
                    value={project}
                    onChange={(e) => setProject(e.target.value)}
                    placeholder="Select or type project"
                    className="flex-1 outline-none text-gray-700"
                    onFocus={() => setShowProjectDropdown(true)}
                  />
                  <ChevronDown
                    size={20}
                    className="text-gray-400 cursor-pointer"
                    onClick={() =>
                      setShowProjectDropdown(!showProjectDropdown)
                    }
                  />
                </div>

                {showProjectDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    <div className="p-2">
                      <input
                        type="text"
                        value={newProjectInput}
                        onChange={(e) =>
                          setNewProjectInput(e.target.value)
                        }
                        placeholder="Type to create new..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleCreateProject()
                        }
                      />
                      {newProjectInput.trim() && (
                        <button
                          onClick={handleCreateProject}
                          className="w-full mt-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm flex items-center justify-center gap-2"
                        >
                          <Plus size={16} />
                          Create "{newProjectInput}"
                        </button>
                      )}
                    </div>
                    <div className="border-t border-gray-200">
                      {projects.map((p) => (
                        <div
                          key={typeof p === 'object' ? p.id : p}
                          onClick={() => {
                            setProject(typeof p === 'object' ? (p.name || p.title) : p)
                            setShowProjectDropdown(false)
                          }}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                        >
                          {typeof p === 'object' ? (p.name || p.title) : p}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Task */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Task *
              </label>
              <div className="relative" ref={taskDropdownRef}>
                <div className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg bg-white">
                  <input
                    type="text"
                    value={task}
                    onChange={(e) => setTask(e.target.value)}
                    placeholder="Select or type task"
                    className="flex-1 outline-none text-gray-700"
                    onFocus={() => setShowTaskDropdown(true)}
                  />
                  <ChevronDown
                    size={20}
                    className="text-gray-400 cursor-pointer"
                    onClick={() => setShowTaskDropdown(!showTaskDropdown)}
                  />
                </div>

                {showTaskDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    <div className="p-2">
                      <input
                        type="text"
                        value={newTaskInput}
                        onChange={(e) =>
                          setNewTaskInput(e.target.value)
                        }
                        placeholder="Type to create new..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleCreateTask()
                        }
                      />
                      {newTaskInput.trim() && (
                        <button
                          onClick={handleCreateTask}
                          className="w-full mt-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm flex items-center justify-center gap-2"
                        >
                          <Plus size={16} />
                          Create "{newTaskInput}"
                        </button>
                      )}
                    </div>
                    <div className="border-t border-gray-200">
                      {tasks.map((t) => (
                        <div
                          key={t}
                          onClick={() => {
                            setTask(t)
                            setShowTaskDropdown(false)
                          }}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                        >
                          {t}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <div className="relative" ref={statusDropdownRef}>
                <div className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg bg-white">
                  <input
                    type="text"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    placeholder="Select or type status"
                    className="flex-1 outline-none text-gray-700"
                    onFocus={() => setShowStatusDropdown(true)}
                  />
                  <ChevronDown
                    size={20}
                    className="text-gray-400 cursor-pointer"
                    onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                  />
                </div>

                {showStatusDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    <div className="p-2">
                      <input
                        type="text"
                        value={newStatusInput}
                        onChange={(e) =>
                          setNewStatusInput(e.target.value)
                        }
                        placeholder="Type to create new..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleCreateStatus()
                        }
                      />
                      {newStatusInput.trim() && (
                        <button
                          onClick={handleCreateStatus}
                          className="w-full mt-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm flex items-center justify-center gap-2"
                        >
                          <Plus size={16} />
                          Create "{newStatusInput}"
                        </button>
                      )}
                    </div>
                    <div className="border-t border-gray-200">
                      {statuses.map((s) => (
                        <div
                          key={s}
                          onClick={() => {
                            setStatus(s)
                            setShowStatusDropdown(false)
                          }}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                        >
                          {s}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Date + Hours */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2.5 border rounded-lg"
              />
              <input
                type="number"
                step="0.5"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder="e.g., 4.5"
                className="w-full px-4 py-2.5 border rounded-lg"
              />
            </div>

            {/* Description */}
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What did you work on?"
              rows={4}
              className="w-full px-4 py-2.5 border rounded-lg resize-none"
            />
          </div>

          {/* Footer */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={() => onOpenChange(false)}
              className="flex-1 px-4 py-2.5 border rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!project || !task || !date || !hours}
              className={`flex-1 px-4 py-2.5 rounded-lg text-white ${
                !project || !task || !date || !hours
                  ? "bg-blue-400"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              Add Entry
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}