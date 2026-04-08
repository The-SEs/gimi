import { useState, useEffect } from "react";
import { Menu, ShieldAlert } from "lucide-react";
import { api } from "../../services/api";

// Component imports
import { AlertHistoryCard } from "../../components/security/AlertHistoryCard";
import { EmergencyContactsCard } from "../../components/security/EmergencyContactsCard";
import { SecuritySidebar } from "../../components/security/SecuritySidebar";
import { SecurityList } from "../../components/security/SecurityList";
import { ContactModal } from "../../components/security/ContactModal";

// Type imports
import type { StudentSecurityCase, EmergencyContact } from "../../components/security/types";

function SecurityAdminPage() {
  // State Management
  const [highRiskStudents, setHighRiskStudents] = useState<StudentSecurityCase[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showAllAlerts, setShowAllAlerts] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<EmergencyContact | null>(null);

  // Data Fetching
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

  // Handlers for Emergency Contacts
  const handleSaveContact = async (role: string, name: string, phone: string, id?: string) => {
    if (!selectedStudentId) return;

    try {
        if (id) {
            await api.patch(`/api/safety/admin/emergency-contacts/${selectedStudentId}/`, {
                id,
                role,
                name,
                phoneNumber: phone
            });
        } else {
            await api.post(`/api/safety/admin/emergency-contacts/${selectedStudentId}/`, {
                role,
                name,
                phoneNumber: phone
            });
        }
        setIsModalOpen(false);
        setSelectedContact(null);
        fetchHighRiskStudents();
    } catch (error) {
        console.error("Failed to save contact", error);
        alert("Failed to save emergency contact. Please fill all fields.");
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    if (!selectedStudentId || !window.confirm("Are you sure you want to delete this contact?")) return;

    try {
        await api.delete(`/api/safety/admin/emergency-contacts/${selectedStudentId}/?id=${contactId}`);
        fetchHighRiskStudents();
    } catch (error) {
        console.error("Failed to delete contact", error);
        alert("Failed to delete emergency contact.");
    }
  };

  // Rendering Loading and Empty States
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

      {/* High Risk Sidebar List */}
      <SecurityList 
        students={highRiskStudents}
        selectedStudentId={selectedStudentId}
        onSelect={(id) => setSelectedStudentId(id)}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

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
          <div className="w-10"></div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[300px_1fr] gap-4 lg:gap-6 flex-1">
          {/* Profile Sidebar Info Section */}
          <SecuritySidebar studentCase={selectedStudent} />

          {/* Details Sections Column */}
          <div className="flex flex-col gap-6">
            <AlertHistoryCard
              studentCase={selectedStudent}
              showAllAlerts={showAllAlerts}
              onToggleShowAll={() => setShowAllAlerts((current) => !current)}
            />
            <EmergencyContactsCard 
              studentCase={selectedStudent} 
              onAdd={() => {
                  setSelectedContact(null);
                  setIsModalOpen(true);
              }}
              onEdit={(contact) => {
                  setSelectedContact(contact);
                  setIsModalOpen(true);
              }}
              onDelete={handleDeleteContact}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default SecurityAdminPage;
