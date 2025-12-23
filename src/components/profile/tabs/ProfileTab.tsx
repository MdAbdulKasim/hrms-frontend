// components/profile/tabs/ProfileTab.tsx
import { Mail, Phone, MapPin, Users, Briefcase, Calendar, User } from 'lucide-react';
import { Employee, Education, Dependent } from '../types';

interface ProfileTabProps {
  employee: Employee;
  education: Education[];
  dependents: Dependent[];
}

export default function ProfileTab({ employee, education, dependents }: ProfileTabProps) {
  return (
    <div className="p-6 space-y-6 max-w-7xl">
      {/* Basic Information */}
      <section className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4">Basic information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <InfoRow label="Employee ID" value={employee.employeeId} />
          <InfoRow label="Nick name" value={employee.nickName} />
          <InfoRow label="First Name" value={employee.firstName} />
          <InfoRow label="Email address" value={employee.email} />
          <InfoRow label="Last Name" value={employee.lastName} />
          <InfoRow label="Extension" value={employee.extension} />
        </div>
      </section>

      {/* Work Information */}
      <section className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4">Work Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <InfoRow label="Department" value={employee.department} icon={<Briefcase className="w-4 h-4" />} />
          <InfoRow label="Zoho Role" value={employee.zohoRole} />
          <InfoRow label="Location" value={employee.location || '-'} />
          <InfoRow label="Employment Type" value={employee.employmentType} />
          <InfoRow label="Designation" value={employee.designation} />
          <InfoRow label="Employee Status" value={employee.employeeStatus} />
          <InfoRow label="Source of Hire" value={employee.sourceOfHire} />
          <InfoRow label="Date of Joining" value={employee.dateOfJoining} icon={<Calendar className="w-4 h-4" />} />
          <InfoRow label="Current Experience" value={employee.currentExperience} />
          <InfoRow label="Total Experience" value={employee.totalExperience} />
        </div>
      </section>

      {/* Hierarchy Information */}
      <section className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4">Hierarchy Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <InfoRow label="Reporting Manager" value={employee.reportingManager} icon={<Users className="w-4 h-4" />} />
        </div>
      </section>

      {/* Personal Details */}
      <section className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4">Personal Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <InfoRow label="Date of Birth" value={employee.dateOfBirth} />
          <InfoRow label="Ask me about/Expertise" value="-" />
          <InfoRow label="Age" value={employee.age} />
          <InfoRow label="Gender" value={employee.gender} icon={<User className="w-4 h-4" />} />
          <InfoRow label="Marital Status" value={employee.maritalStatus} />
        </div>
      </section>

      {/* Identity Information */}
      <section className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4">Identity Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <InfoRow label="UAN" value={employee.uan || '**********'} sensitive />
          <InfoRow label="PAN" value={employee.pan || '**********'} sensitive />
          <InfoRow label="Aadhaar" value={employee.aadhaar || '**********'} sensitive />
        </div>
      </section>

      {/* Contact Details */}
      <section className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4">Contact Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <InfoRow label="Work Phone Number" value={employee.workPhone} icon={<Phone className="w-4 h-4" />} />
          <InfoRow label="Personal Mobile Number" value={employee.personalMobile} icon={<Phone className="w-4 h-4" />} />
          <InfoRow label="Extension" value={employee.extension} />
          <InfoRow label="Personal Email Address" value="-" icon={<Mail className="w-4 h-4" />} />
          <InfoRow label="Seating Location" value={employee.seatingLocation} icon={<MapPin className="w-4 h-4" />} />
          <InfoRow label="Tags" value="-" />
          <div className="col-span-2">
            <InfoRow 
              label="Present Address" 
              value={employee.presentAddress} 
              icon={<MapPin className="w-4 h-4" />} 
            />
          </div>
          <InfoRow label="Permanent Address" value={employee.permanentAddress || '-'} />
        </div>
      </section>

      {/* About Me */}
      <section className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4">About</h2>
        <div className="flex flex-col items-center justify-center py-8">
          <div className="text-blue-500 text-4xl mb-2">+</div>
          <p className="text-gray-500">Add About</p>
        </div>
      </section>

      {/* Work Experience */}
      <section className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4">Work experience</h2>
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
        <h2 className="text-lg font-semibold mb-4">Education Details</h2>
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
              {education.map((edu, index) => (
                <tr key={index} className="border-t">
                  <td className="px-4 py-3 text-sm">{edu.instituteName}</td>
                  <td className="px-4 py-3 text-sm">{edu.degree}</td>
                  <td className="px-4 py-3 text-sm">{edu.specialization}</td>
                  <td className="px-4 py-3 text-sm">{edu.dateOfCompletion || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Dependent Details */}
      <section className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4">Dependent Details</h2>
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
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                  No rows found.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Separation Information */}
      <section className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4">Separation Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <InfoRow label="Date of Exit" value="-" />
        </div>
      </section>

      {/* System Fields */}
      <section className="bg-white rounded-lg border p-6">
        <h2 className="text-lg font-semibold mb-4">System Fields</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
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

interface InfoRowProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
  sensitive?: boolean;
}

function InfoRow({ label, value, icon, sensitive }: InfoRowProps) {
  return (
    <div className="flex items-start gap-3">
      {icon && <div className="text-gray-400 mt-0.5">{icon}</div>}
      <div className="flex-1">
        <p className="text-sm text-gray-600 mb-1">{label}</p>
        <p className="text-sm font-medium text-gray-900">{value}</p>
      </div>
    </div>
  );
}