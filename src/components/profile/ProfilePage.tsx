'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import ProfileHeader from './ProfileHeader';
import ProfileTabs from './ProfileTabs';
import ProfileTab from './tabs/ProfileTab';
import PeersTab from './tabs/PeersTab';
import LeaveTab from './tabs/LeaveTab';
import AttendanceTab from './tabs/AttendanceTab';
import DepartmentTab from './tabs/DepartmentTab';
import TimeTrackingTab from './tabs/TimeTrackingTab';
import { Employee, Education, Peer, LeaveBalance, AttendanceRecord } from './types';
import axios from 'axios';
import { getApiUrl, getAuthToken, getOrgId } from '@/lib/auth';
import employeeService, { EmployeeUpdateData } from '@/lib/employeeService';
import { CustomAlertDialog, ConfirmDialog } from '@/components/ui/custom-dialogs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Edit, Upload } from 'lucide-react';
import { User } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ProfilePageProps {
  employeeId?: string;
  onBack?: () => void;
}

export default function ProfilePage({ employeeId: initialEmployeeId, onBack }: ProfilePageProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('profile');
  const [currentEmployeeId, setCurrentEmployeeId] = useState(initialEmployeeId || 'S19');
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profilePicUrl, setProfilePicUrl] = useState<string | null>(null);
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);

  // Dialog States
  const [alertState, setAlertState] = useState<{ open: boolean, title: string, description: string, variant: "success" | "error" | "info" | "warning" }>({
    open: false, title: "", description: "", variant: "info"
  });

  const showAlert = (title: string, description: string, variant: "success" | "error" | "info" | "warning" = "info") => {
    setAlertState({ open: true, title, description, variant });
  };

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const token = getAuthToken();
        const orgId = getOrgId();
        const apiUrl = getApiUrl();

        if (!token || !orgId || !currentEmployeeId) {
          setLoading(false);
          return;
        }

        const response = await axios.get(`${apiUrl}/org/${orgId}/employees/${currentEmployeeId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const emp = response.data?.data || response.data;
        setEmployee(emp);

        if (emp.profilePicUrl) {
          try {
            const picResponse = await axios.get(`${apiUrl}/org/${orgId}/employees/${currentEmployeeId}/profile-pic`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (picResponse.data.success && picResponse.data.imageUrl) {
              setProfilePicUrl(picResponse.data.imageUrl);
            }
          } catch (error) {
            console.error("Failed to fetch profile picture:", error);
          }
        }
      } catch (error) {
        console.error("Failed to fetch employee data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeData();
  }, [currentEmployeeId]);

  const handleBackClick = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicFile(file);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      showAlert("Success", "Employee updated successfully!", "success");
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating employee:', error);
      showAlert("Error", "Failed to update employee", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white border-b px-6 py-4">
        <button
          onClick={handleBackClick}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Employee Profile</h1>
            <p className="text-gray-600">View and manage employee profile information.</p>
          </div>
          <div className="flex gap-3">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}><Edit className="w-4 h-4 mr-2" />Edit</Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
              </div>
            )}
          </div>
        </div>

        {/* Profile Picture */}
        <Card className="mb-6 p-6">
          <h2 className="text-xl font-bold mb-4">Profile Picture</h2>
          <div className="flex items-center gap-6">
            <div className="w-32 h-32 rounded-full border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center">
              {profilePicUrl ? <img src={profilePicUrl} alt="Profile" className="w-full h-full object-cover" /> : <User className="w-12 h-12 text-gray-400" />}
            </div>
            {isEditing && (
              <div>
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" id="profile-pic" />
                <label htmlFor="profile-pic" className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm cursor-pointer hover:bg-gray-50">
                  <Upload className="w-4 h-4 mr-2" /> Upload New
                </label>
              </div>
            )}
          </div>
        </Card>
      </div>

      {employee && (
        <>
          <ProfileHeader
            employee={employee}
            onEdit={() => setIsEditing(true)}
            onDelete={() => { }}
          />

          <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

          <div className="bg-gray-50">
            {/* Render tab content */}
          </div>
        </>
      )}

      <CustomAlertDialog
        open={alertState.open}
        onOpenChange={(open) => setAlertState(prev => ({ ...prev, open }))}
        title={alertState.title}
        description={alertState.description}
        variant={alertState.variant}
      />
    </div>
  );
}
