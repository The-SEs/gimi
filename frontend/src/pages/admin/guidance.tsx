import StudentIdentityWidget from "../../components/admin-guidance-widget/studentInfo.tsx"
import ConsultationHistoryWidget from "../../components/admin-guidance-widget/consultation.tsx"
import MedicalDataWidget from "../../components/admin-guidance-widget/medicalData.tsx"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom" // Added useNavigate
import { api } from "../../services/api"

export default function StudentProfilePage() {
  const { id } = useParams()
  const navigate = useNavigate() // For the back button or redirecting
  const [safetyData, setSafetyData] = useState<any>(null)
  const [showSOS, setShowSOS] = useState(false)

  useEffect(() => {
    const fetchSafetyInfo = async () => {
      try {
        // This hits your backend view that returns the latest flag for this student
        const response = await api.get(`/api/safety/flags/student/${id}/`)
        setSafetyData(response.data)

        // If the risk is High, trigger the SOS popup automatically
        if (response.data.risk_level.toLowerCase() === "high") {
          setShowSOS(true)
        }
      } catch (error) {
        console.error("No safety flags found for this student.")
      }
    }
    fetchSafetyInfo()
  }, [id])

  return (
    <div className="min-h-screen bg-white">
      <div className="flex flex-col lg:flex-row w-full h-full">
        {/* LEFT SIDEBAR */}
        <div className="w-full lg:w-95 p-4 md:p-6 lg:border-r lg:border-gray-200 flex flex-col gap-6 shrink-0">
          {/* 1. PASS THE DATA TO THE WIDGET HERE */}
          <StudentIdentityWidget data={safetyData} />

          <ConsultationHistoryWidget />

          <button className="w-full bg-white border border-gray-200 py-3 rounded-full font-bold text-gray-700 shadow-sm flex justify-center items-center gap-2 hover:bg-gray-50 transition-all active:scale-95">
            <span className="text-lg">📅</span> Schedule a Consultation
          </button>

          {/* 2. ADD THE 'VIEW INCIDENT' BUTTON IF FLAGGED */}
          {safetyData && (
            <button
              onClick={() => navigate(`/dashboard/alerts/${safetyData.id}`)}
              className="w-full bg-[#844250] text-white py-3 rounded-full font-bold shadow-md flex justify-center items-center gap-2 hover:bg-[#6b3541] transition-all active:scale-95"
            >
              🚨 View Flagged Message
            </button>
          )}
        </div>

        {/* RIGHT CONTENT AREA */}
        <div className="grow p-4 md:p-6 lg:p-10 bg-white flex flex-col gap-8">
          {/* (Keeping your placeholders for medical data as you'll wire those to their own endpoints later) */}
          <MedicalDataWidget
            title="Active Conditions"
            rows={[
              {
                label: "Depression",
                subLabel: "N/A",
                date: "December 22, 2023",
              },
              { label: "Anxiety", subLabel: "N/A", date: "January 15, 2024" },
            ]}
          />

          <MedicalDataWidget
            title="Medications"
            rows={[
              {
                label: "Escitalopram",
                subLabel: "Antidepressants",
                date: "December 22, 2023",
              },
            ]}
          />

          <MedicalDataWidget
            title="Hospitalization/Treatment History"
            rows={[
              {
                label: "Inpatient Care",
                subLabel: "Mental Health Facility",
                date: "June 10, 2023",
              },
            ]}
          />

          {/* 3. DYNAMIC SOS MODAL */}
          {showSOS && safetyData && (
            <div className="fixed bottom-24 left-4 right-4 md:left-auto md:bottom-10 md:right-10 lg:bottom-12 lg:right-12 z-50 animate-bounce">
              <div className="bg-red-50 border-2 border-white rounded-xl p-4 pr-10 shadow-2xl flex items-center gap-4 relative max-w-87.5 ring-4 ring-red-500/20">
                <div className="overflow-hidden shrink-0">
                  <img
                    src="/src/assets/gimi-head-right.svg"
                    alt="GIMI"
                    className="h-20 w-20"
                  />
                </div>
                <div className="flex-1">
                  <div className="text-md font-semibold text-gray-400 flex items-center gap-1 uppercase tracking-tighter">
                    GIMI <span className="text-red-500">🚨</span>
                  </div>
                  <div className="text-[#844250] font-black text-md leading-tight uppercase">
                    {safetyData.user_name}{" "}
                    <span className="text-gray-500 font-normal lowercase">
                      is in a <br />
                      serious situation!{" "}
                    </span>{" "}
                    <span className="text-md">SOS.</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowSOS(false)}
                  className="absolute top-4 right-4 text-red-300 font-bold hover:text-red-500"
                >
                  ✕
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
