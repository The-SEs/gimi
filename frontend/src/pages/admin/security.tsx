import { useState, useEffect } from "react";
import { AlertTriangle, Eye, Phone, Menu, X, ShieldAlert, Plus, Edit2, Trash2, type LucideIcon } from "lucide-react";
import { api } from "../../services/api";

type AlertSeverity = "Critical" | "Warning" | "Info";

interface AlertHistoryItem {
  id: string;
  label: string;
  severity: AlertSeverity;
  reportedAt: string;
}

interface EmergencyContact {
  id: string;
  role: string;
  name: string;
  phoneNumber: string;
}

interface StudentSecurityCase {
  id: string;
  name: string;
  email: string;
  age: string;
  sex: string;
  pronouns: string;
  studentNumber: string;
  riskLevel: "HIGH" | "MEDIUM" | "LOW";
  summary: string;
  detectedKeywords: string[];
  alertHistory: AlertHistoryItem[];
  emergencyContacts: EmergencyContact[];
}

const severityLabelStyles: Record<AlertSeverity, string> = {
  Critical: "text-[#b91c1c]",
  Warning: "text-[#b45309]",
  Info: "text-[#475569]",
};

interface SectionCardProps {
  title: string;
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
  children: React.ReactNode;
}

function SectionCard({ title, icon: Icon, actionLabel, onAction, children }: SectionCardProps) {
  return (
    <section className="overflow-hidden rounded-[12px] border border-[#e3e7ef] bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)]">
      <header className="flex items-center justify-between gap-3 bg-[#eef0f4] px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2 text-[#5f6673]">
          {Icon ? <Icon className="h-4 w-4" aria-hidden="true" /> : null}
          <h2 className="text-[0.95rem] font-semibold">{title}</h2>
        </div>
        {actionLabel ? (
          <button
            type="button"
            onClick={onAction}
            className="rounded-md px-2 py-1 text-sm font-semibold text-[#5a7cff] transition hover:bg-white/80 hover:text-[#4768ec] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5a7cff] flex items-center gap-1"
          >
            {actionLabel === "Add" && <Plus size={14} />}
            {actionLabel}
          </button>
        ) : null}
      </header>
      <div className="p-0">{children}</div>
    </section>
  );
}

function ContactModal({ 
    isOpen, 
    onClose, 
    onSave, 
    contactToEdit 
}: { 
    isOpen: boolean, 
    onClose: () => void, 
    onSave: (role: string, name: string, phone: string, id?: string) => void,
    contactToEdit?: EmergencyContact | null
}) {
    const [role, setRole] = useState("");
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");

    useEffect(() => {
        if (contactToEdit) {
            setRole(contactToEdit.role);
            setName(contactToEdit.name);
            setPhone(contactToEdit.phoneNumber);
        } else {
            setRole("");
            setName("");
            setPhone("");
        }
    }, [contactToEdit, isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-gray-800">
                        {contactToEdit ? "Edit Emergency Contact" : "Add Emergency Contact"}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-600">Role</label>
                        <input 
                            type="text" 
                            placeholder="e.g. Guardian, Father, Mother"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#5a7cff] focus:ring-2 focus:ring-[#5a7cff]/20 outline-none transition-all placeholder:text-gray-300"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-600">Full Name</label>
                        <input 
                            type="text" 
                            placeholder="Enter name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#5a7cff] focus:ring-2 focus:ring-[#5a7cff]/20 outline-none transition-all placeholder:text-gray-300"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-600">Phone Number</label>
                        <input 
                            type="text" 
                            placeholder="+63 9xx xxx xxxx"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#5a7cff] focus:ring-2 focus:ring-[#5a7cff]/20 outline-none transition-all placeholder:text-gray-300"
                        />
                    </div>
                </div>
                <div className="p-6 flex gap-3">
                    <button 
                        onClick={onClose}
                        className="flex-1 px-4 py-3 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={() => onSave(role, name, phone, contactToEdit?.id)}
                        className="flex-1 px-4 py-3 rounded-xl font-semibold text-white bg-GIMI-blue hover:opacity-90 transition-all active:scale-[0.98] shadow-lg shadow-[#5a7cff]/20"
                    >
                        {contactToEdit ? "Update Contact" : "Save Contact"}
                    </button>
                </div>
            </div>
        </div>
    );
}

function SecurityAdminPage() {
  const [highRiskStudents, setHighRiskStudents] = useState<StudentSecurityCase[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showAllAlerts, setShowAllAlerts] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<EmergencyContact | null>(null);

  const fetchHighRiskStudents = async () => {
    try {
      const { data } = await api.get<StudentSecurityCase[]>("/api/safety/admin/high-risk/");
      setHighRiskStudents(data);
      if (data.length > 0 && !selectedStudentId) {
        setSelectedStudentId(data[0].id);
      }
    } catch (error) {
      console.error("Failed to fetch high risk students: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHighRiskStudents();
  }, []);

  const selectedStudent = highRiskStudents.find((s) => s.id === selectedStudentId);

  const handleSaveContact = async (role: string, name: string, phone: string, id?: string) => {
    if (!selectedStudentId) return;

    try {
        if (id) {
            // Edit
            await api.patch(`/api/safety/admin/emergency-contacts/${selectedStudentId}/`, {
                id,
                role,
                name,
                phoneNumber: phone
            });
        } else {
            // Add
            await api.post(`/api/safety/admin/emergency-contacts/${selectedStudentId}/`, {
                role,
                name,
                phoneNumber: phone
            });
        }
        setIsModalOpen(false);
        setSelectedContact(null);
        fetchHighRiskStudents(); // Refresh data
    } catch (error) {
        console.error("Failed to save contact", error);
        alert("Failed to save emergency contact. Please fill all fields.");
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    if (!selectedStudentId || !window.confirm("Are you sure you want to delete this contact?")) return;

    try {
        await api.delete(`/api/safety/admin/emergency-contacts/${selectedStudentId}/?id=${contactId}`);
        fetchHighRiskStudents(); // Refresh data
    } catch (error) {
        console.error("Failed to delete contact", error);
        alert("Failed to delete emergency contact.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-5.5rem)] w-full bg-gray-50/50">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5a7cff] mx-auto"></div>
          <p className="text-gray-500 font-medium">Loading security dashboard...</p>
        </div>
      </div>
    );
  }

  if (highRiskStudents.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-5.5rem)] w-full bg-gray-50/50">
        <div className="text-center space-y-4">
          <ShieldAlert size={60} className="mx-auto text-gray-300" />
          <h1 className="text-2xl font-bold text-gray-700">No High Risk Students Detected</h1>
          <p className="text-gray-500">All systems clear. No security cases reported at this time.</p>
        </div>
      </div>
    );
  }

  if (!selectedStudent) {
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-5.5rem)] w-full bg-gray-50/50">
            <p className="text-gray-500">Please select a student from the list.</p>
        </div>
    );
  }

  const profileFacts = [
    { label: "Student Num", value: selectedStudent.studentNumber },
    { label: "Risk Level", value: selectedStudent.riskLevel },
  ] as const;

  const alertsToShow = showAllAlerts
    ? selectedStudent.alertHistory
    : selectedStudent.alertHistory.slice(0, 4);

  return (
    <div className="relative flex min-h-[calc(100vh-5.5rem)] w-full gap-4 lg:gap-6 overflow-hidden">
      <ContactModal 
        isOpen={isModalOpen}
        onClose={() => {
            setIsModalOpen(false);
            setSelectedContact(null);
        }}
        onSave={handleSaveContact}
        contactToEdit={selectedContact}
      />

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* High Risk Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 left-0 z-50 w-72 transform border-r border-[#cfd7e2] bg-white transition-transform duration-300 ease-in-out lg:static lg:block lg:w-80 lg:translate-x-0 lg:rounded-[14px] lg:border shadow-sm`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-[#eef0f4] px-6 py-5">
            <div className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-red-500" />
              <h2 className="text-lg font-bold text-[#1f2937]">High Risk List</h2>
            </div>
            <button className="lg:hidden" onClick={() => setIsSidebarOpen(false)}>
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto py-2">
            {highRiskStudents.map((student) => (
              <button
                key={student.id}
                onClick={() => {
                  setSelectedStudentId(student.id);
                  setIsSidebarOpen(false);
                }}
                className={`flex w-full flex-col px-6 py-4 transition-colors hover:bg-[#f8fafc] ${
                  selectedStudentId === student.id
                    ? "border-r-4 border-[#5a7cff] bg-[#f3f6ff]"
                    : "border-r-4 border-transparent"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-semibold text-[#1f2937] text-left">{student.name}</span>
                  <span className="text-[0.7rem] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                    HIGH
                  </span>
                </div>
                <div className="mt-1 flex gap-2">
                  <span className="text-xs text-[#64748b] truncate max-w-[180px]">{student.studentNumber}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col gap-4 lg:gap-6 min-w-0">
        {/* Mobile Header indicator and Sidebar trigger */}
        <div className="flex items-center justify-between rounded-[14px] border border-[#cfd7e2] bg-white px-4 py-3 lg:hidden">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="rounded-md p-2 hover:bg-gray-100 transition-colors"
          >
            <Menu className="h-6 w-6 text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-[#1f2937] truncate max-w-[150px]">{selectedStudent.name}</h1>
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-[0.65rem] font-bold text-red-600 whitespace-nowrap">
              HIGH RISK
            </span>
          </div>
          <div className="w-10"></div> {/* Spacer for symmetry */}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[300px_1fr] gap-4 lg:gap-6 flex-1">
          {/* Student Profile Info */}
          <aside className="h-fit rounded-[14px] border border-[#cfd7e2] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b border-[#e8ebf1] pb-3">
              <h1 className="text-[1.25rem] font-semibold tracking-tight text-[#1f2937]">
                {selectedStudent.name}
              </h1>
              <div className="inline-flex items-center gap-1.5 rounded-full px-1 text-[0.82rem] font-medium text-[#5a7cff]">
                <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                Monitoring
              </div>
            </div>

            <div className="space-y-5 pt-5">
              <p className="text-[0.94rem] leading-6 text-[#667180]">
                {selectedStudent.summary}
              </p>

              <div className="flex flex-wrap gap-2">
                {selectedStudent.detectedKeywords.map((keyword) => (
                  <span
                    key={keyword}
                    className="rounded-[14px] border border-[#f1d4d7] bg-[#f8dfe0] px-3.5 py-1.5 text-[0.82rem] font-semibold text-[#d76b72]"
                  >
                    {keyword}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap gap-2.5">
                <span className="rounded-[14px] border border-[#cfd4dd] bg-white px-4 py-1.5 text-[0.82rem] font-medium text-[#5f6673]">
                  {selectedStudent.age}
                </span>
                <span className="rounded-[14px] border border-[#cfd4dd] bg-white px-4 py-1.5 text-[0.82rem] font-medium text-[#5f6673]">
                  {selectedStudent.sex}
                </span>
                <span className="rounded-[14px] border border-[#cfd4dd] bg-white px-4 py-1.5 text-[0.82rem] font-medium text-[#5f6673]">
                  {selectedStudent.pronouns}
                </span>
              </div>

              <dl className="space-y-3 pt-1 text-[0.9rem]">
                {profileFacts.map((fact) => (
                  <div key={fact.label} className="flex items-start justify-between gap-4">
                    <dt className="text-[#7a8594]">{fact.label}</dt>
                    <dd
                      className={`text-right font-medium ${
                        fact.label === "Risk Level" ? "font-bold text-[#ef4444]" : "text-[#556070]"
                      }`}
                    >
                      {fact.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </aside>

          {/* Details Column */}
          <div className="flex flex-col gap-6">
            <SectionCard
              title="Alert History"
              icon={AlertTriangle}
              actionLabel={showAllAlerts ? "Show Less" : "View All"}
              onAction={() => setShowAllAlerts((current) => !current)}
            >
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse" aria-label="Alert history">
                  <caption className="sr-only">
                    Alert history for the selected monitored student
                  </caption>
                  <tbody>
                    {alertsToShow.map((alert) => (
                      <tr
                        key={alert.id}
                        className="border-t border-[#edf1f5] first:border-t-0 hover:bg-[#fafcff]"
                      >
                        <th
                          scope="row"
                          className="px-4 py-4 text-left text-[0.95rem] font-semibold text-[#2f3744] sm:px-5"
                        >
                          {alert.label}
                        </th>
                        <td
                          className={`px-4 py-4 text-[0.9rem] font-semibold ${severityLabelStyles[alert.severity]} sm:px-5`}
                        >
                          {alert.severity}
                        </td>
                        <td className="px-4 py-4 text-right text-[0.9rem] font-medium text-[#667180] sm:px-5">
                          {alert.reportedAt}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>

            <SectionCard 
                title="Emergency Contacts" 
                actionLabel="Add"
                onAction={() => {
                    setSelectedContact(null);
                    setIsModalOpen(true);
                }}
            >
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse" aria-label="Emergency contacts">
                  <caption className="sr-only">
                    Emergency contact list for the selected monitored student
                  </caption>
                  <tbody>
                    {selectedStudent.emergencyContacts.length === 0 ? (
                        <tr>
                            <td className="px-5 py-8 text-center text-gray-400 text-sm italic">
                                No emergency contacts added yet.
                            </td>
                        </tr>
                    ) : (
                        selectedStudent.emergencyContacts.map((contact) => (
                            <tr
                                key={contact.id}
                                className="border-t border-[#edf1f5] first:border-t-0 hover:bg-[#fafcff]"
                            >
                                <th
                                scope="row"
                                className="px-4 py-4 text-left text-[0.95rem] font-semibold text-[#2f3744] sm:px-5"
                                >
                                {contact.role}
                                </th>
                                <td className="px-4 py-4 text-[0.9rem] font-medium text-[#7a8594] sm:px-5">
                                {contact.name}
                                </td>
                                <td className="px-4 py-4 text-right text-[0.9rem] font-medium text-[#5f6673] sm:px-5">
                                    <div className="flex items-center justify-end gap-3">
                                        <span>{contact.phoneNumber}</span>
                                        <div className="flex gap-1">
                                            <button 
                                                onClick={() => {
                                                    setSelectedContact(contact);
                                                    setIsModalOpen(true);
                                                }}
                                                className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteContact(contact.id)}
                                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SecurityAdminPage;
