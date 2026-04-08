import { useState, useEffect } from "react";
import ContactSecurity from "../../components/admin-nurse-widget/contactSecurity.tsx";
import AlertGuidance from "../../components/admin-nurse-widget/alertGuidance.tsx";
import StudentInfo from "../../components/admin-nurse-widget/studentInfo.tsx";
import ActiveConditions from "../../components/admin-nurse-widget/activeConditions";
import CurrentMedications from "../../components/admin-nurse-widget/currentMedications";
import HospitalizationTreatmentHistory from "../../components/admin-nurse-widget/hospitalizationTreatmentHistory";
import VisitDocumentation from "../../components/admin-nurse-widget/visitDocumentation";
import RecentHistory from "../../components/admin-nurse-widget/recentHistory";
import { SecurityList } from "../../components/security/SecurityList";
import { api } from "../../services/api";
import { Menu } from "lucide-react";

export default function NurseAdminPage() {
  const [highRiskStudents, setHighRiskStudents] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHighRiskStudents = async () => {
    try {
      const { data } = await api.get("/api/safety/admin/high-risk/");
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

  const handleContactSecurity = () => {
    // Functionality removed as per user request
    console.log("Contact Security clicked (functionality disabled)");
  };

  const handleAlertGuidance = () => {
    // Functionality removed as per user request
    console.log("Alert Guidance clicked (functionality disabled)");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-5.5rem)] w-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-[calc(100vh-5.5rem)] w-full gap-4 lg:gap-6 overflow-hidden">
      <SecurityList 
        students={highRiskStudents}
        selectedStudentId={selectedStudentId}
        onSelect={(id) => setSelectedStudentId(id)}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col gap-4 lg:gap-6 min-w-0">
        {/* Mobile Header indicator and Sidebar trigger */}
        <div className="flex items-center justify-between rounded-[14px] border border-[#cfd7e2] bg-white px-4 py-3 lg:hidden">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="rounded-md p-2 hover:bg-gray-100 transition-colors"
          >
            <Menu className="h-6 w-6 text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-[#1f2937] truncate max-w-[150px]">{selectedStudent?.name}</h1>
          </div>
          <div className="w-10"></div>
        </div>

        <div className="w-full box-border overflow-x-hidden overflow-y-auto pr-1">
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 mb-4 lg:mb-6">
            <div className="w-full lg:flex-1 min-w-0 overflow-hidden">
              <StudentInfo 
                studentId={selectedStudent?.id}
                caseCode={selectedStudent?.studentNumber}
                name={selectedStudent?.name}
                allergies={selectedStudent?.allergies}
                primaryPhysician={selectedStudent?.primaryPhysician}
                riskLevel={selectedStudent?.riskLevel || "HIGH RISK"}
                onUpdate={fetchHighRiskStudents}
              />
            </div>
            <div className="w-full lg:w-[35%] lg:flex-shrink-0 flex flex-row lg:flex-col items-center justify-center gap-4">
              <div className="w-full max-w-[260px] cursor-not-allowed grayscale opacity-70" onClick={handleContactSecurity}>
                <ContactSecurity />
              </div>
              <div className="w-full max-w-[260px] cursor-not-allowed grayscale opacity-70" onClick={handleAlertGuidance}>
                <AlertGuidance />
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-start">
            <div className="w-full lg:flex-1 min-w-0 flex flex-col gap-4 lg:gap-6">
              <div className="flex flex-col sm:flex-row gap-4 lg:gap-6">
                <div className="w-full sm:flex-[0_0_58%] min-h-[320px] lg:h-[380px]">
                  <ActiveConditions 
                    studentId={selectedStudentId}
                    conditions={selectedStudent?.conditions} 
                    onUpdate={fetchHighRiskStudents}
                  />
                </div>
                <div className="w-full sm:flex-1 min-h-[320px] lg:h-[380px]">
                  <CurrentMedications 
                    studentId={selectedStudentId}
                    medications={selectedStudent?.medications} 
                    onUpdate={fetchHighRiskStudents}
                  />
                </div>
              </div>
              <VisitDocumentation 
                studentId={selectedStudentId}
                onUpdate={fetchHighRiskStudents}
              />
            </div>

            <div className="w-full lg:w-[35%] lg:flex-shrink-0 flex flex-col gap-4 lg:gap-6">
              <HospitalizationTreatmentHistory 
                studentId={selectedStudentId}
                entries={selectedStudent?.hospitalizationHistory}
                onUpdate={fetchHighRiskStudents}
              />
              <RecentHistory 
                entries={selectedStudent?.nurseHistory}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}