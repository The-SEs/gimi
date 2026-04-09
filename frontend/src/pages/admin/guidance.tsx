import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { api } from "../../services/api";

// Components
import StudentIdentityWidget from "../../components/admin-guidance-widget/studentInfo.tsx";
import ConsultationHistoryWidget from "../../components/admin-guidance-widget/consultation.tsx";
import MedicalDataWidget from "../../components/admin-guidance-widget/medicalData.tsx";
import CounselorFlagCard from "../../components/widget/counselorFlagCard.tsx";

export default function StudentProfilePage() {
  const { id } = useParams();

  // Data States
  const [safetyData, setSafetyData] = useState<any>(null);
  const [conditions, setConditions] = useState<any[]>([]);
  const [medications, setMedications] = useState<any[]>([]);
  const [hospitalization, setHospitalization] = useState<any[]>([]);

  // UI States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllStudentData = async () => {
      setIsLoading(true);
      try {
        // Run all fetches in parallel for speed
        const [safetyRes, condRes, medRes, hospRes] = await Promise.all([
          api.get(`/api/safety/admin/flags/student/${id}/`),
          api.get(`/api/safety/admin/conditions/${id}/`),
          api.get(`/api/safety/admin/medications/${id}/`),
          api.get(`/api/safety/admin/hospitalization/${id}/`),
        ]);

        setSafetyData(safetyRes.data);
        setConditions(condRes.data);
        setMedications(medRes.data);
        setHospitalization(hospRes.data);
      } catch (error) {
        console.error("Error fetching student profile data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchAllStudentData();
  }, [id]);

  return (
    <div className="min-h-screen bg-white relative">
      <div className="flex flex-col lg:flex-row w-full h-full">
        {/* LEFT SIDEBAR: Identity & Consultation */}
        <div className="w-full lg:w-95 p-4 md:p-6 lg:border-r lg:border-gray-200 flex flex-col gap-6 shrink-0">
          <StudentIdentityWidget data={safetyData} />

          <ConsultationHistoryWidget />

          {/* TRIGGER MODAL BUTTON */}
          {safetyData && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full bg-[#844250] text-white py-4 rounded-full font-bold shadow-lg shadow-pink-100 hover:bg-[#6b3541] transition-all active:scale-95"
            >
              🚨 View Full Flagged Log
            </button>
          )}

          <button className="w-full bg-white border border-gray-200 py-3 rounded-full font-bold text-gray-700 shadow-sm hover:bg-gray-50 transition-all">
            <span className="text-lg">📅</span> Schedule a Consultation
          </button>
        </div>

        {/* MAIN CONTENT: Medical Data Widgets */}
        <div className="grow p-4 md:p-6 lg:p-10 bg-white flex flex-col gap-8">
          {/* Active Conditions */}
          <MedicalDataWidget
            title="Active Conditions"
            rows={conditions.map((c) => ({
              label: c.name,
              subLabel: c.category,
              date: "Active", // Or map a date field if you add it to the model
            }))}
          />

          {/* Medications */}
          <MedicalDataWidget
            title="Medications"
            rows={medications.map((m) => ({
              label: m.name,
              subLabel: `${m.dosage} - ${m.frequency}`,
              date: m.isActive ? "Current" : "Discontinued",
            }))}
          />

          {/* Hospitalization / Treatment History */}
          <MedicalDataWidget
            title="Hospitalization/Treatment History"
            rows={
              hospitalization.length > 0
                ? hospitalization.map((h) => ({
                    label: h.title,
                    subLabel: h.careType,
                    date: h.date,
                  }))
                : [{ label: "No history found", subLabel: "N/A", date: "N/A" }]
            }
          />
        </div>
      </div>

      {/* ========================================== */}
      {/* THE COUNSELOR FLAG CARD MODAL */}
      {/* ========================================== */}
      {isModalOpen && safetyData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="relative z-10 w-full max-w-2xl animate-in fade-in zoom-in duration-300">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute -top-12 right-0 text-white font-bold flex items-center gap-2 hover:text-pink-200"
            >
              Close ✕
            </button>

            <CounselorFlagCard
              flag={{
                id: safetyData.id,
                student_name: safetyData.user_name,
                timestamp: safetyData.timestamp,
                risk_level: safetyData.risk_level,
                matched_phrases: safetyData.matched_phrases,
                flagged_text: safetyData.full_text,
                ai_summary: safetyData.ai_summary,
              }}
              onReview={() => setIsModalOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
