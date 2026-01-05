import { Mail, Phone, MapPin, Users, Briefcase, Calendar, User, Edit2, X } from 'lucide-react';
import { useState } from 'react';

interface Employee {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  nickName?: string;
  email: string;
  department: string;
  designation: string;
  zohoRole?: string;
  employmentType?: string;
  employeeStatus?: string;
  sourceOfHire?: string;
  dateOfJoining?: string;
  currentExperience?: string;
  totalExperience?: string;
  reportingManager?: string;
  workPhone?: string;
  personalMobile?: string;
  extension?: string;
  seatingLocation?: string;
  shift?: string;
  shiftTiming?: string;
  presentAddress?: string;
  permanentAddress?: string;
  dateOfBirth?: string;
  age?: string;
  gender?: string;
  maritalStatus?: string;
  profileImage?: string;
  checkInStatus?: string;
  location?: string;
  uan?: string;
  pan?: string;
  aadhaar?: string;
}

interface InfoRowProps {
  label: string;
  value: any;
}

const formatValue = (val: any): string => {
  if (val === null || val === undefined) return '-';
  if (typeof val === 'object') {
    return val.name || val.fullName || val.title || val.label || '-';
  }
  return String(val);
};

interface Education {
  instituteName: string;
  degree: string;
  specialization: string;
  dateOfCompletion?: string;
}

interface Dependent {
  name: string;
  relationship: string;
  dateOfBirth: string;
}

interface ProfileTabProps {
  employee: Employee;
  education: Education[];
  dependents: Dependent[];
}

export default function ProfileTab({ employee, education, dependents }: ProfileTabProps) {
  const [aboutText, setAboutText] = useState('');
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [tempAboutText, setTempAboutText] = useState('');

  const handleOpenAboutModal = () => {
    setTempAboutText(aboutText);
    setIsAboutModalOpen(true);
  };

  const handleSaveAbout = () => {
    setAboutText(tempAboutText);
    setIsAboutModalOpen(false);
  };

  const handleCancelAbout = () => {
    setTempAboutText(aboutText);
    setIsAboutModalOpen(false);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      {/* About Modal */}
      {isAboutModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg border-2 border-gray-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <Edit2 className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">About Me</h2>
              </div>
              <button
                onClick={handleCancelAbout}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4">
              <textarea
                value={tempAboutText}
                onChange={(e) => setTempAboutText(e.target.value)}
                className="w-full h-24 px-3 py-2 border-2 border-blue-500 rounded-lg focus:outline-none focus:border-blue-600 resize-none text-sm"
                placeholder="Tell us about yourself..."
                autoFocus
              />
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-center gap-3 p-4 border-t">
              <button
                onClick={handleSaveAbout}
                className="px-5 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors font-medium text-sm"
              >
                Submit
              </button>
              <button
                onClick={handleCancelAbout}
                className="px-5 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-md transition-colors font-medium text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Quick Info Summary Card */}
      <section className="bg-white rounded-lg border p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Department */}
          <div className="flex items-start gap-3">
            <div className="p-2 bg-gray-50 rounded-lg">
              <Briefcase className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Department</p>
              <p className="text-sm font-medium text-gray-900">{formatValue(employee.department)}</p>
            </div>
          </div>

          {/* Shift */}
          <div className="flex items-start gap-3">
            <div className="p-2 bg-gray-50 rounded-lg">
              <Calendar className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Shift</p>
              <p className="text-sm font-medium text-gray-900">
                {employee.shift} ({employee.shiftTiming})
              </p>
            </div>
          </div>

          {/* Seating Location */}
          <div className="flex items-start gap-3">
            <div className="p-2 bg-gray-50 rounded-lg">
              <MapPin className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Seating Location</p>
              <p className="text-sm font-medium text-gray-900">{formatValue(employee.seatingLocation)}</p>
            </div>
          </div>

          {/* Email address */}
          <div className="flex items-start gap-3">
            <div className="p-2 bg-gray-50 rounded-lg">
              <Mail className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Email address</p>
              <p className="text-sm font-medium text-gray-900">{formatValue(employee.email)}</p>
            </div>
          </div>

          {/* Personal Mobile Number */}
          <div className="flex items-start gap-3">
            <div className="p-2 bg-gray-50 rounded-lg">
              <Phone className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Personal Mobile Number</p>
              <p className="text-sm font-medium text-gray-900">{employee.personalMobile}</p>
            </div>
          </div>

          {/* Work Phone Number */}
          <div className="flex items-start gap-3">
            <div className="p-2 bg-gray-50 rounded-lg">
              <Phone className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Work Phone Number</p>
              <p className="text-sm font-medium text-gray-900">{employee.workPhone}</p>
            </div>
          </div>

          {/* Extension */}
          <div className="flex items-start gap-3">
            <div className="p-2 bg-gray-50 rounded-lg">
              <Phone className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Extension</p>
              <p className="text-sm font-medium text-gray-900">{formatValue(employee.extension)}</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">About</h2>
          {aboutText && (
            <button
              onClick={handleOpenAboutModal}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Edit2 className="w-4 h-4 text-gray-600" />
            </button>
          )}
        </div>

        {aboutText ? (
          <div className="text-sm text-gray-700">
            {aboutText}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <button
              onClick={handleOpenAboutModal}
              className="flex flex-col items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center">
                <div className="text-blue-500 text-3xl font-light flex items-center justify-center" style={{ lineHeight: '1', marginTop: '-2px' }}>+</div>
              </div>
              <p className="text-gray-600">Add About</p>
            </button>
          </div>
        )}
      </section>

      {/* Basic Information */}
      <section className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-6">Basic information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-6">
          <InfoRow label="Employee ID" value={employee.employeeId} />
          <InfoRow label="Nick name" value={employee.nickName || '-'} />
          <InfoRow label="First Name" value={employee.firstName} />
          <InfoRow label="Email address" value={employee.email} />
          <InfoRow label="Last Name" value={employee.lastName} />
          <InfoRow label="Extension" value={employee.extension || '-'} />
        </div>
      </section>

      {/* Work Information */}
      <section className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-6">Work Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-6">
          <InfoRow label="Department" value={employee.department} />
          <InfoRow label="Zoho Role" value={employee.zohoRole || '-'} />
          <InfoRow label="Location" value={employee.location || '-'} />
          <InfoRow label="Employment Type" value={employee.employmentType || '-'} />
          <InfoRow label="Designation" value={employee.designation} />
          <InfoRow label="Employee Status" value={employee.employeeStatus || '-'} />
          <InfoRow label="Source of Hire" value={employee.sourceOfHire || '-'} />
          <InfoRow label="Date of Joining" value={employee.dateOfJoining || '-'} />
          <InfoRow label="Current Experience" value={employee.currentExperience || '-'} />
          <InfoRow label="Total Experience" value={employee.totalExperience || '-'} />
        </div>
      </section>

      {/* Hierarchy Information */}
      <section className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-6">Hierarchy Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-6">
          <InfoRow label="Reporting Manager" value={employee.reportingManager || '-'} />
        </div>
      </section>

      {/* Personal Details */}
      <section className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-6">Personal Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-6">
          <InfoRow label="Date of Birth" value={employee.dateOfBirth || '-'} />
          <InfoRow label="Ask me about/Expertise" value="-" />
          <InfoRow label="Age" value={employee.age || '-'} />
          <InfoRow label="Gender" value={employee.gender || '-'} />
          <InfoRow label="Marital Status" value={employee.maritalStatus || '-'} />
        </div>
      </section>

      {/* Identity Information */}
      <section className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-6">Identity Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-6">
          <InfoRow label="UAN" value={employee.uan || '**********'} />
          <InfoRow label="PAN" value={employee.pan || '**********'} />
          <InfoRow label="Aadhaar" value={employee.aadhaar || '**********'} />
        </div>
      </section>

      {/* Contact Details */}
      <section className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-6">Contact Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-6">
          <InfoRow label="Work Phone Number" value={employee.workPhone || '-'} />
          <InfoRow label="Personal Mobile Number" value={employee.personalMobile || '-'} />
          <InfoRow label="Extension" value={employee.extension || '-'} />
          <InfoRow label="Personal Email Address" value="-" />
          <InfoRow label="Seating Location" value={employee.seatingLocation || '-'} />
          <InfoRow label="Tags" value="-" />
          <div className="col-span-2">
            <InfoRow label="Present Address" value={employee.presentAddress || '-'} />
          </div>
          <InfoRow label="Permanent Address" value={employee.permanentAddress || '-'} />
        </div>
      </section>

      {/* Work Experience */}
      <section className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-6">Work experience</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Company name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Job Title</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">From Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">To Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Job Description</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Relevant</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No rows found.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Education Details */}
      <section className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-6">Education Details</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Institute Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Degree/Diploma</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Specialization</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Date of Completion</th>
              </tr>
            </thead>
            <tbody>
              {education.length > 0 ? (
                education.map((edu, index) => (
                  <tr key={index} className="border-t">
                    <td className="px-4 py-3 text-sm">{edu.instituteName}</td>
                    <td className="px-4 py-3 text-sm">{edu.degree}</td>
                    <td className="px-4 py-3 text-sm">{edu.specialization}</td>
                    <td className="px-4 py-3 text-sm">{edu.dateOfCompletion || '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    No rows found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Dependent Details */}
      <section className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-6">Dependent Details</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Relationship</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Date of Birth</th>
              </tr>
            </thead>
            <tbody>
              {dependents.length > 0 ? (
                dependents.map((dep, index) => (
                  <tr key={index} className="border-t">
                    <td className="px-4 py-3 text-sm">{dep.name}</td>
                    <td className="px-4 py-3 text-sm">{dep.relationship}</td>
                    <td className="px-4 py-3 text-sm">{dep.dateOfBirth}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                    No rows found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Separation Information */}
      <section className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-6">Separation Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-6">
          <InfoRow label="Date of Exit" value="-" />
        </div>
      </section>

      {/* System Fields */}
      <section className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-6">System Fields</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-6">
          <InfoRow label="Added By" value="1 - fathima -" />
          <InfoRow label="Modified By" value="1 - fathima -" />
          <InfoRow label="Added Time" value="23-Dec-2025 03:28 PM" />
          <InfoRow label="Modified Time" value="23-Dec-2025 03:28 PM" />
          <InfoRow label="Onboarding Status" value="-" />
        </div>
      </section>
    </div>
  );
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div>
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <p className="text-sm font-medium text-gray-900">{formatValue(value)}</p>
    </div>
  );
}