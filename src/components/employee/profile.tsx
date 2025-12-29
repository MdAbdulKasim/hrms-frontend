"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { PenLine, Plus, Trash2 } from "lucide-react";
import axios from 'axios';
import { getApiUrl, getAuthToken, getOrgId, getCookie } from '@/lib/auth';

// -----------------------------------------------------
// TYPES FOR TABLE ROWS
// -----------------------------------------------------
export type WorkExperienceRow = {
  companyName: string;
  jobTitle: string;
  fromDate: string;
  toDate: string;
  jobDescription: string;
  relevant: string;
};

export type EducationRow = {
  instituteName: string;
  degree: string;
  specialization: string;
  dateOfCompletion: string;
};

export type DependentRow = {
  name: string;
  relationship: string;
  dob: string;
};

// -----------------------------------------------------
// Editable Row (for non-table fields)
// -----------------------------------------------------
const EditableRow = ({
  label,
  value,
  editMode,
  onChange,
  type = "text",
  isTextarea = false,
}: {
  label: string;
  value: string;
  editMode: boolean;
  onChange: (v: string) => void;
  type?: string;
  isTextarea?: boolean;
}) => (
  // RESPONSIVE UPDATE: Using grid-cols-1 for mobile (stacked) and md:grid-cols-3 for desktop (side-by-side)
  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-4 py-3 border-b last:border-0">
    <div className="text-xs font-semibold text-gray-600 flex items-center">
      {label}
    </div>
    <div className="col-span-1 md:col-span-2 text-sm">
      {editMode ? (
        isTextarea ? (
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={3}
            className="w-full"
          />
        ) : (
          <Input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full"
          />
        )
      ) : (
        <span className="whitespace-pre-wrap break-words block">{value || "-"}</span>
      )}
    </div>
  </div>
);

// -----------------------------------------------------
// Editable Table Component (Reusable)
// -----------------------------------------------------
const EditableTable = <T extends object>({
  title,
  columns,
  rows,
  editMode,
  onChange,
  onAddRow,
  onDeleteRow,
}: {
  title: string;
  columns: (keyof T)[];
  rows: T[];
  editMode: boolean;
  onChange: (rowIndex: number, field: keyof T, value: string) => void;
  onAddRow: () => void;
  onDeleteRow: (rowIndex: number) => void;
}) => {
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-row justify-between items-center py-4 px-4 md:px-6">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
        {editMode && (
          <Button size="sm" variant="outline" onClick={onAddRow}>
            <Plus size={14} className="mr-1" />
            <span className="hidden sm:inline">Add Row</span>
            <span className="sm:hidden">Add</span>
          </Button>
        )}
      </CardHeader>
      <CardContent className="p-0">
        {/* RESPONSIVE UPDATE: overflow-x-auto handles table scrolling on small screens */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[600px] md:min-w-full">
            <thead>
              <tr className="border-b bg-gray-50">
                {columns.map((col, i) => (
                  <th
                    key={i}
                    className="text-left p-3 text-xs font-semibold text-gray-600 whitespace-nowrap"
                  >
                    {String(col).replace(/([A-Z])/g, ' $1').trim()} {/* Formatting CamelCase headers */}
                  </th>
                ))}
                {editMode && (
                  <th className="text-left p-3 text-xs font-semibold text-gray-600 w-[60px]">
                    Action
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={columns.length + 1}
                    className="py-6 text-center text-gray-500 text-sm"
                  >
                    No rows found.
                  </td>
                </tr>
              )}
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b hover:bg-gray-50 last:border-0">
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className="p-3 text-sm align-top">
                      {editMode ? (
                        <Input
                          value={(row[col] as string) || ""}
                          onChange={(e) =>
                            onChange(rowIndex, col, e.target.value)
                          }
                          className="w-full min-w-[120px]"
                        />
                      ) : (
                        <div className="whitespace-nowrap md:whitespace-normal truncate md:overflow-visible max-w-[150px] md:max-w-none">
                          {(row[col] as string) || "-"}
                        </div>
                      )}
                    </td>
                  ))}
                  {editMode && (
                    <td className="p-3 align-top">
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-8 w-8 p-0"
                        onClick={() => setDeleteIndex(rowIndex)}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>

      {/* Delete Confirmation Popup */}
      <Dialog
        open={deleteIndex !== null}
        onOpenChange={() => setDeleteIndex(null)}
      >
        <DialogContent className="max-w-[90vw] md:max-w-md rounded-lg">
          <DialogHeader>
            <DialogTitle>Delete Row?</DialogTitle>
            <p className="text-sm text-gray-600 mt-2">
              Are you sure you want to delete this row? This action cannot be
              undone.
            </p>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteIndex(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deleteIndex !== null) onDeleteRow(deleteIndex);
                setDeleteIndex(null);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

// -----------------------------------------------------
// MAIN PROFILE PAGE
// -----------------------------------------------------
export default function ProfilePage() {
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);

  // --------------------------------------
  // Profile fields
  // --------------------------------------
  const [profile, setProfile] = useState({
    employeeId: "",
    firstName: "",
    lastName: "",
    nickName: "",
    email: "",
    department: "",
    designation: "",
    dob: "",
    gender: "",
    seatingLocation: "",
    extension: "",
    shift: "",
    timezone: "",
    workPhoneNumber: "",
    about: "",
    tags: "",
  });

  // Work Information fields
  const [workInfo, setWorkInfo] = useState({
    location: "",
    zohoRole: "",
    employmentType: "",
    employeeStatus: "",
    sourceOfHire: "",
    dateOfJoining: "",
    currentExperience: "",
    totalExperience: "",
  });

  // Hierarchy Information
  const [hierarchyInfo, setHierarchyInfo] = useState({
    reportingManager: "",
  });

  // Personal Details
  const [personalDetails, setPersonalDetails] = useState({
    dateOfBirth: "",
    age: "",
    maritalStatus: "",
    aboutMe: "",
    askMeAbout: "",
  });

  // Identity Information
  const [identityInfo, setIdentityInfo] = useState({
    uan: "",
    pan: "",
    aadhaar: "",
  });

  // Contact Details
  const [contactDetails, setContactDetails] = useState({
    personalMobileNumber: "",
    personalEmailAddress: "",
    presentAddress: "",
    permanentAddress: "",
  });

  // Separation Information
  const [separationInfo, setSeparationInfo] = useState({
    dateOfExit: "",
  });

  // System Fields
  const [systemFields] = useState({
    addedBy: "",
    addedTime: "",
    modifiedBy: "",
    modifiedTime: "",
    onboardingStatus: "",
  });

  // Fetch profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = getAuthToken();
        const apiUrl = getApiUrl();
        const orgId = getOrgId();
        const employeeId = getCookie('hrms_user_id');

        if (!token || !orgId || !employeeId) return;

        // Fetch employee profile
        const profileRes = await axios.get(`${apiUrl}/org/${orgId}/employees/${employeeId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const empData = profileRes.data.data || profileRes.data;

        // Update profile state
        setProfile({
          employeeId: empData.employeeId || empData.id || "",
          firstName: empData.firstName || "",
          lastName: empData.lastName || "",
          nickName: empData.nickName || "",
          email: empData.email || "",
          department: empData.department?.name || empData.department || "",
          designation: empData.designation?.name || empData.designation || "",
          dob: empData.dateOfBirth || "",
          gender: empData.gender || "",
          seatingLocation: empData.seatingLocation || "",
          extension: empData.extension || "",
          shift: empData.shift || "",
          timezone: empData.timezone || "",
          workPhoneNumber: empData.workPhone || empData.workPhoneNumber || "",
          about: empData.about || "",
          tags: empData.tags || "",
        });

        // Update work info
        setWorkInfo({
          location: empData.location || "",
          zohoRole: empData.role || "",
          employmentType: empData.employmentType || "",
          employeeStatus: empData.status || "",
          sourceOfHire: empData.sourceOfHire || "",
          dateOfJoining: empData.dateOfJoining || "",
          currentExperience: empData.currentExperience || "",
          totalExperience: empData.totalExperience || "",
        });

        // Update hierarchy
        setHierarchyInfo({
          reportingManager: empData.reportingManager || "",
        });

        // Update personal details
        setPersonalDetails({
          dateOfBirth: empData.dateOfBirth || "",
          age: empData.age || "",
          maritalStatus: empData.maritalStatus || "",
          aboutMe: empData.aboutMe || "",
          askMeAbout: empData.askMeAbout || "",
        });

        // Update identity information
        setIdentityInfo({
          uan: empData.uan || empData.UAN || "",
          pan: empData.pan || empData.PAN || "",
          aadhaar: empData.aadhaar || empData.aadharNumber || "",
        });

        // Update contact details
        setContactDetails({
          personalMobileNumber: empData.personalMobile || empData.personalMobileNumber || "",
          personalEmailAddress: empData.personalEmail || empData.personalEmailAddress || "",
          presentAddress: empData.presentAddress || "",
          permanentAddress: empData.permanentAddress || "",
        });

        // Update separation info
        setSeparationInfo({
          dateOfExit: empData.dateOfExit || "",
        });

        // Populate work experience from API
        if (empData.experience && Array.isArray(empData.experience)) {
          const workExperience = empData.experience.map((exp: any) => ({
            companyName: exp.companyName || "",
            jobTitle: exp.jobTitle || "",
            fromDate: exp.fromDate ? new Date(exp.fromDate).toLocaleDateString() : "",
            toDate: exp.toDate ? new Date(exp.toDate).toLocaleDateString() : "",
            jobDescription: exp.jobDescription || "",
            relevant: exp.relevant || "",
          }));
          setWorkRows(workExperience);
        }

        // Populate education from API
        if (empData.education && Array.isArray(empData.education)) {
          const education = empData.education.map((edu: any) => ({
            instituteName: edu.instituteName || "",
            degree: edu.degree || "",
            specialization: edu.specialization || "",
            dateOfCompletion: edu.dateOfCompletion ? new Date(edu.dateOfCompletion).toLocaleDateString() : "",
          }));
          setEducationRows(education);
        }

        // Populate dependents from API
        if (empData.dependents && Array.isArray(empData.dependents)) {
          const dependents = empData.dependents.map((dep: any) => ({
            name: dep.name || "",
            relationship: dep.relationship || "",
            dob: dep.dob ? new Date(dep.dob).toLocaleDateString() : "",
          }));
          setDependentRows(dependents);
        }

      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const updateField = (section: string, field: string, value: string) => {
    switch (section) {
      case "profile":
        setProfile((prev) => ({ ...prev, [field]: value }));
        break;
      case "workInfo":
        setWorkInfo((prev) => ({ ...prev, [field]: value }));
        break;
      case "hierarchyInfo":
        setHierarchyInfo((prev) => ({ ...prev, [field]: value }));
        break;
      case "personalDetails":
        setPersonalDetails((prev) => ({ ...prev, [field]: value }));
        break;
      case "identityInfo":
        setIdentityInfo((prev) => ({ ...prev, [field]: value }));
        break;
      case "contactDetails":
        setContactDetails((prev) => ({ ...prev, [field]: value }));
        break;
      case "separationInfo":
        setSeparationInfo((prev) => ({ ...prev, [field]: value }));
        break;
    }
  };

  // --------------------------------------
  // Work Experience Table
  // --------------------------------------
  const [workRows, setWorkRows] = useState<WorkExperienceRow[]>([]);

  const workColumns: (keyof WorkExperienceRow)[] = [
    "companyName",
    "jobTitle",
    "fromDate",
    "toDate",
    "jobDescription",
    "relevant",
  ];

  const updateWorkRow = (
    index: number,
    field: keyof WorkExperienceRow,
    value: string
  ) => {
    const updated = [...workRows];
    updated[index][field] = value;
    setWorkRows(updated);
  };

  const addWorkRow = () => {
    setWorkRows([
      ...workRows,
      {
        companyName: "",
        jobTitle: "",
        fromDate: "",
        toDate: "",
        jobDescription: "",
        relevant: "",
      },
    ]);
  };

  const deleteWorkRow = (index: number) =>
    setWorkRows(workRows.filter((_, i) => i !== index));

  // --------------------------------------
  // Education Table
  // --------------------------------------
  const [educationRows, setEducationRows] = useState<EducationRow[]>([]);

  const educationColumns: (keyof EducationRow)[] = [
    "instituteName",
    "degree",
    "specialization",
    "dateOfCompletion",
  ];

  const updateEducationRow = (
    index: number,
    field: keyof EducationRow,
    value: string
  ) => {
    const updated = [...educationRows];
    updated[index][field] = value;
    setEducationRows(updated);
  };

  const addEducationRow = () => {
    setEducationRows([
      ...educationRows,
      {
        instituteName: "",
        degree: "",
        specialization: "",
        dateOfCompletion: "",
      },
    ]);
  };

  const deleteEducationRow = (index: number) =>
    setEducationRows(educationRows.filter((_, i) => i !== index));

  // --------------------------------------
  // Dependent Table
  // --------------------------------------
  const [dependentRows, setDependentRows] = useState<DependentRow[]>([]);

  const dependentColumns: (keyof DependentRow)[] = [
    "name",
    "relationship",
    "dob",
  ];

  const updateDependentRow = (
    index: number,
    field: keyof DependentRow,
    value: string
  ) => {
    const updated = [...dependentRows];
    updated[index][field] = value;
    setDependentRows(updated);
  };

  const addDependentRow = () => {
    setDependentRows([
      ...dependentRows,
      { name: "", relationship: "", dob: "" },
    ]);
  };

  const deleteDependentRow = (index: number) =>
    setDependentRows(dependentRows.filter((_, i) => i !== index));

  return (
    // RESPONSIVE UPDATE: Adjusted padding for different breakpoints
    <div className="p-3 md:p-6 space-y-4 md:space-y-6 max-w-6xl mx-auto w-full">
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-gray-500">Loading profile data...</div>
        </div>
      ) : (
        <>
          {/* PAGE HEADER */}
          <div className="flex flex-row justify-between items-center gap-4">
            <h1 className="text-xl md:text-2xl font-semibold truncate">Employee Profile</h1>
            <Button
              onClick={() => setEditMode(!editMode)}
              className="bg-blue-600 hover:bg-blue-700 text-white shrink-0"
            >
              <PenLine className="mr-2 h-4 w-4" />
              {editMode ? "Save" : "Edit"}
            </Button>
          </div>

          {/* BASIC INFORMATION */}
          <Card>
            <CardHeader className="py-4 px-4 md:px-6">
              <CardTitle className="text-sm font-semibold">
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 md:px-6">
              <EditableRow
                label="Employee ID"
                value={profile.employeeId}
                editMode={editMode}
                onChange={(v) => updateField("profile", "employeeId", v)}
              />
              <EditableRow
                label="First Name"
                value={profile.firstName}
                editMode={editMode}
                onChange={(v) => updateField("profile", "firstName", v)}
              />
              <EditableRow
                label="Last Name"
                value={profile.lastName}
                editMode={editMode}
                onChange={(v) => updateField("profile", "lastName", v)}
              />
              <EditableRow
                label="Nick Name"
                value={profile.nickName}
                editMode={editMode}
                onChange={(v) => updateField("profile", "nickName", v)}
              />
              <EditableRow
                label="Email"
                value={profile.email}
                editMode={editMode}
                onChange={(v) => updateField("profile", "email", v)}
                type="email"
              />
              <EditableRow
                label="Department"
                value={profile.department}
                editMode={editMode}
                onChange={(v) => updateField("profile", "department", v)}
              />
              <EditableRow
                label="Designation"
                value={profile.designation}
                editMode={editMode}
                onChange={(v) => updateField("profile", "designation", v)}
              />
              <EditableRow
                label="Seating Location"
                value={profile.seatingLocation}
                editMode={editMode}
                onChange={(v) => updateField("profile", "seatingLocation", v)}
              />
              <EditableRow
                label="Extension"
                value={profile.extension}
                editMode={editMode}
                onChange={(v) => updateField("profile", "extension", v)}
              />
              <EditableRow
                label="Shift"
                value={profile.shift}
                editMode={editMode}
                onChange={(v) => updateField("profile", "shift", v)}
              />
              <EditableRow
                label="Time zone"
                value={profile.timezone}
                editMode={editMode}
                onChange={(v) => updateField("profile", "timezone", v)}
              />
              <EditableRow
                label="Work Phone Number"
                value={profile.workPhoneNumber}
                editMode={editMode}
                onChange={(v) => updateField("profile", "workPhoneNumber", v)}
                type="tel"
              />
            </CardContent>
          </Card>

          {/* ABOUT */}
          <Card>
            <CardHeader className="py-4 px-4 md:px-6">
              <CardTitle className="text-sm font-semibold">About</CardTitle>
            </CardHeader>
            <CardContent className="px-4 md:px-6">
              <EditableRow
                label="About"
                value={profile.about}
                editMode={editMode}
                onChange={(v) => updateField("profile", "about", v)}
                isTextarea={true}
              />
            </CardContent>
          </Card>

          {/* TAGS */}
          <Card>
            <CardHeader className="py-4 px-4 md:px-6">
              <CardTitle className="text-sm font-semibold">Tags</CardTitle>
            </CardHeader>
            <CardContent className="px-4 md:px-6">
              <EditableRow
                label="Tags"
                value={profile.tags}
                editMode={editMode}
                onChange={(v) => updateField("profile", "tags", v)}
              />
            </CardContent>
          </Card>

          {/* WORK INFORMATION */}
          <Card>
            <CardHeader className="py-4 px-4 md:px-6">
              <CardTitle className="text-sm font-semibold">
                Work Information
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 md:px-6">
              <EditableRow
                label="Department"
                value={profile.department}
                editMode={editMode}
                onChange={(v) => updateField("profile", "department", v)}
              />
              <EditableRow
                label="Location"
                value={workInfo.location}
                editMode={editMode}
                onChange={(v) => updateField("workInfo", "location", v)}
              />
              <EditableRow
                label="Designation"
                value={profile.designation}
                editMode={editMode}
                onChange={(v) => updateField("profile", "designation", v)}
              />
              <EditableRow
                label="Zoho Role"
                value={workInfo.zohoRole}
                editMode={editMode}
                onChange={(v) => updateField("workInfo", "zohoRole", v)}
              />
              <EditableRow
                label="Employment Type"
                value={workInfo.employmentType}
                editMode={editMode}
                onChange={(v) => updateField("workInfo", "employmentType", v)}
              />
              <EditableRow
                label="Employee Status"
                value={workInfo.employeeStatus}
                editMode={editMode}
                onChange={(v) => updateField("workInfo", "employeeStatus", v)}
              />
              <EditableRow
                label="Source of Hire"
                value={workInfo.sourceOfHire}
                editMode={editMode}
                onChange={(v) => updateField("workInfo", "sourceOfHire", v)}
              />
              <EditableRow
                label="Date of Joining"
                value={workInfo.dateOfJoining}
                editMode={editMode}
                onChange={(v) => updateField("workInfo", "dateOfJoining", v)}
                type="date"
              />
              <EditableRow
                label="Current Experience"
                value={workInfo.currentExperience}
                editMode={false}
                onChange={() => { }}
              />
              <EditableRow
                label="Total Experience"
                value={workInfo.totalExperience}
                editMode={false}
                onChange={() => { }}
              />
            </CardContent>
          </Card>

          {/* HIERARCHY INFORMATION */}
          <Card>
            <CardHeader className="py-4 px-4 md:px-6">
              <CardTitle className="text-sm font-semibold">
                Hierarchy Information
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 md:px-6">
              <EditableRow
                label="Reporting Manager"
                value={hierarchyInfo.reportingManager}
                editMode={editMode}
                onChange={(v) =>
                  updateField("hierarchyInfo", "reportingManager", v)
                }
              />
            </CardContent>
          </Card>

          {/* PERSONAL DETAILS */}
          <Card>
            <CardHeader className="py-4 px-4 md:px-6">
              <CardTitle className="text-sm font-semibold">
                Personal Details
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 md:px-6">
              <EditableRow
                label="Date of Birth"
                value={personalDetails.dateOfBirth}
                editMode={editMode}
                onChange={(v) => updateField("personalDetails", "dateOfBirth", v)}
                type="date"
              />
              <EditableRow
                label="Age"
                value={personalDetails.age}
                editMode={editMode}
                onChange={(v) => updateField("personalDetails", "age", v)}
              />
              <EditableRow
                label="Gender"
                value={profile.gender}
                editMode={editMode}
                onChange={(v) => updateField("profile", "gender", v)}
              />
              <EditableRow
                label="Marital Status"
                value={personalDetails.maritalStatus}
                editMode={editMode}
                onChange={(v) => updateField("personalDetails", "maritalStatus", v)}
              />
              <EditableRow
                label="About Me"
                value={personalDetails.aboutMe}
                editMode={editMode}
                onChange={(v) => updateField("personalDetails", "aboutMe", v)}
                isTextarea={true}
              />
              <EditableRow
                label="Ask me about/Expertise"
                value={personalDetails.askMeAbout}
                editMode={editMode}
                onChange={(v) => updateField("personalDetails", "askMeAbout", v)}
              />
            </CardContent>
          </Card>

          {/* IDENTITY INFORMATION */}
          <Card>
            <CardHeader className="py-4 px-4 md:px-6">
              <CardTitle className="text-sm font-semibold">
                Identity Information
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 md:px-6">
              <EditableRow
                label="UAN"
                value={identityInfo.uan}
                editMode={editMode}
                onChange={(v) => updateField("identityInfo", "uan", v)}
              />
              <EditableRow
                label="PAN"
                value={identityInfo.pan}
                editMode={editMode}
                onChange={(v) => updateField("identityInfo", "pan", v)}
              />
              <EditableRow
                label="Aadhaar"
                value={identityInfo.aadhaar}
                editMode={editMode}
                onChange={(v) => updateField("identityInfo", "aadhaar", v)}
              />
            </CardContent>
          </Card>

          {/* WORK EXPERIENCE TABLE */}
          <EditableTable
            title="Work Experience"
            columns={workColumns}
            rows={workRows}
            editMode={editMode}
            onChange={(i, field, value) =>
              updateWorkRow(i, field as keyof WorkExperienceRow, value)
            }
            onAddRow={addWorkRow}
            onDeleteRow={deleteWorkRow}
          />

          {/* EDUCATION DETAILS TABLE */}
          <EditableTable
            title="Education Details"
            columns={educationColumns}
            rows={educationRows}
            editMode={editMode}
            onChange={(i, field, value) =>
              updateEducationRow(i, field as keyof EducationRow, value)
            }
            onAddRow={addEducationRow}
            onDeleteRow={deleteEducationRow}
          />

          {/* DEPENDENT DETAILS TABLE */}
          <EditableTable
            title="Dependent Details"
            columns={dependentColumns}
            rows={dependentRows}
            editMode={editMode}
            onChange={(i, field, value) =>
              updateDependentRow(i, field as keyof DependentRow, value)
            }
            onAddRow={addDependentRow}
            onDeleteRow={deleteDependentRow}
          />

          {/* CONTACT DETAILS */}
          <Card>
            <CardHeader className="py-4 px-4 md:px-6">
              <CardTitle className="text-sm font-semibold">
                Contact Details
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 md:px-6">
              <EditableRow
                label="Work Phone Number"
                value={profile.workPhoneNumber}
                editMode={editMode}
                onChange={(v) => updateField("profile", "workPhoneNumber", v)}
                type="tel"
              />
              <EditableRow
                label="Extension"
                value={profile.extension}
                editMode={editMode}
                onChange={(v) => updateField("profile", "extension", v)}
              />
              <EditableRow
                label="Seating Location"
                value={profile.seatingLocation}
                editMode={editMode}
                onChange={(v) => updateField("profile", "seatingLocation", v)}
              />
              <EditableRow
                label="Tags"
                value={profile.tags}
                editMode={editMode}
                onChange={(v) => updateField("profile", "tags", v)}
              />
              <EditableRow
                label="Personal Mobile Number"
                value={contactDetails.personalMobileNumber}
                editMode={editMode}
                onChange={(v) =>
                  updateField("contactDetails", "personalMobileNumber", v)
                }
                type="tel"
              />
              <EditableRow
                label="Personal Email Address"
                value={contactDetails.personalEmailAddress}
                editMode={editMode}
                onChange={(v) =>
                  updateField("contactDetails", "personalEmailAddress", v)
                }
                type="email"
              />
              <EditableRow
                label="Present Address"
                value={contactDetails.presentAddress}
                editMode={editMode}
                onChange={(v) => updateField("contactDetails", "presentAddress", v)}
                isTextarea={true}
              />
              <EditableRow
                label="Permanent Address"
                value={contactDetails.permanentAddress}
                editMode={editMode}
                onChange={(v) =>
                  updateField("contactDetails", "permanentAddress", v)
                }
                isTextarea={true}
              />
            </CardContent>
          </Card>

          {/* SEPARATION INFORMATION */}
          <Card>
            <CardHeader className="py-4 px-4 md:px-6">
              <CardTitle className="text-sm font-semibold">
                Separation Information
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 md:px-6">
              <EditableRow
                label="Date of Exit"
                value={separationInfo.dateOfExit}
                editMode={editMode}
                onChange={(v) => updateField("separationInfo", "dateOfExit", v)}
                type="date"
              />
            </CardContent>
          </Card>

          {/* SYSTEM FIELDS */}
          <Card>
            <CardHeader className="py-4 px-4 md:px-6">
              <CardTitle className="text-sm font-semibold">System Fields</CardTitle>
            </CardHeader>
            <CardContent className="px-4 md:px-6">
              <EditableRow
                label="Added By"
                value={systemFields.addedBy}
                editMode={false}
                onChange={() => { }}
              />
              <EditableRow
                label="Added Time"
                value={systemFields.addedTime}
                editMode={false}
                onChange={() => { }}
              />
              <EditableRow
                label="Modified By"
                value={systemFields.modifiedBy}
                editMode={false}
                onChange={() => { }}
              />
              <EditableRow
                label="Modified Time"
                value={systemFields.modifiedTime}
                editMode={false}
                onChange={() => { }}
              />
              <EditableRow
                label="Onboarding Status"
                value={systemFields.onboardingStatus}
                editMode={false}
                onChange={() => { }}
              />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}