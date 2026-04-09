import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { api } from "../../services/api"

// Components
import StudentIdentityWidget from "../../components/admin-guidance-widget/studentInfo.tsx"
import ConsultationHistoryWidget from "../../components/admin-guidance-widget/consultation.tsx"
import MedicalDataWidget from "../../components/admin-guidance-widget/medicalData.tsx"
import CounselorFlagCard from "../../components/widget/counselorFlagCard.tsx"
import StudentPhotosWidget from "../../components/admin-guidance-widget/studentPhotos.tsx"

type Photo ={
  id: number
  image_url: string
  caption: string
  uploaded_at: string
}

export default function StudentProfilePage() {
  const { id } = useParams()

  // Data States
  const [allFlags, setAllFlags] = useState<any[]>([])
  const [selectedFlag, setSelectedFlag] = useState<any>(null)
  const [conditions, setConditions] = useState<any[]>([])
  const [medications, setMedications] = useState<any[]>([])
  const [hospitalization, setHospitalization] = useState<any[]>([])
  const [photos, setPhotos] = useState<Photo[]>([])

  // UI States
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [addType, setAddType] = useState<
    "condition" | "medication" | "hospital" | null
  >(null)
  const [formData, setFormData] = useState<any>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true)
      try {
        // Run all fetches in parallel for speed
        const [safetyRes, condRes, medRes, hospRes, photosRes] = await Promise.all([
          api.get(`/api/safety/admin/flags/student/${id}/`),
          api.get(`/api/safety/admin/conditions/${id}/`),
          api.get(`/api/safety/admin/medications/${id}/`),
          api.get(`/api/safety/admin/hospitalization/${id}/`),
          api.get(`/api/wellness/admin/students/${id}/photos/`),
        ])

        setAllFlags(safetyRes.data)
        setSelectedFlag(safetyRes.data[0])
        setConditions(condRes.data)
        setMedications(medRes.data)
        setHospitalization(hospRes.data)
        setPhotos(photosRes.data)
      } catch (error) {
        console.error("Error loading student data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (id) fetchAllData()
  }, [id])

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      let endpoint = ""
      if (addType === "condition")
        endpoint = `/api/safety/admin/conditions/${id}/`
      if (addType === "medication")
        endpoint = `/api/safety/admin/medications/${id}/`
      if (addType === "hospital")
        endpoint = `/api/safety/admin/hospitalization/${id}/`

      await api.post(endpoint, formData)
      setIsAddModalOpen(false)
      window.location.reload()
    } catch (err) {
      alert("Failed to add entry. Check console.")
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#f3a9b7] border-t-transparent mx-auto mb-4"></div>
          <p className="font-bold text-gray-400 uppercase tracking-widest text-xs">
            Loading Profile...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white relative">
      <div className="flex flex-col lg:flex-row w-full h-full">
        {/* LEFT SIDEBAR */}
        <div className="w-full lg:w-95 p-4 md:p-6 lg:border-r lg:border-gray-200 flex flex-col gap-6 shrink-0 bg-white">
          {allFlags.length > 0 && (
            <div className="p-4 bg-gray-50 rounded-3xl border border-gray-100 shadow-sm">
              <p className="text-[10px] font-black text-gray-400 uppercase mb-3 tracking-widest">
                Alert History ({allFlags.length})
              </p>
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                {allFlags.map((flag) => (
                  <button
                    key={flag.id}
                    onClick={() => setSelectedFlag(flag)}
                    className={`text-left p-3 rounded-2xl border transition-all duration-200 ${
                      selectedFlag?.id === flag.id
                        ? "bg-[#844250] text-white border-[#844250] shadow-md scale-[1.02]"
                        : "bg-white text-gray-600 border-gray-100 hover:border-[#f3a9b7] hover:bg-pink-50/30"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span
                        className={`text-[9px] font-black px-1.5 py-0.5 rounded ${selectedFlag?.id === flag.id ? "bg-white/20 text-white" : "bg-pink-100 text-[#844250]"}`}
                      >
                        {flag.source}
                      </span>
                      <span className="text-[10px] font-bold opacity-70">
                        {new Date(flag.timestamp).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-[11px] font-medium truncate italic leading-tight">
                      "{flag.snippet}"
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <StudentIdentityWidget data={selectedFlag} />
          <StudentPhotosWidget photos={photos} />
          <ConsultationHistoryWidget />

          {selectedFlag && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-full bg-[#844250] text-white py-4 rounded-full font-bold shadow-lg shadow-pink-100 hover:bg-[#6b3541] transition-all active:scale-95"
            >
              🚨 View Full Flagged Log
            </button>
          )}

          <button className="w-full bg-white border border-gray-200 py-3 rounded-full font-bold text-gray-700 shadow-sm hover:bg-gray-50 transition-all">
            <span className="text-lg mr-2">📅</span> Schedule a Consultation
          </button>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="grow p-4 md:p-6 lg:p-10 bg-white flex flex-col gap-8">
          <MedicalDataWidget
            title="Active Conditions"
            onAdd={() => {
              setAddType("condition")
              setFormData({})
              setIsAddModalOpen(true)
            }}
            rows={
              conditions.length > 0
                ? conditions.map((c) => ({
                    label: c.name,
                    subLabel: c.category,
                    date: "Active",
                  }))
                : [{ label: "None recorded", subLabel: "N/A", date: "N/A" }]
            }
          />

          <MedicalDataWidget
            title="Medications"
            onAdd={() => {
              setAddType("medication")
              setFormData({})
              setIsAddModalOpen(true)
            }}
            rows={
              medications.length > 0
                ? medications.map((m) => ({
                    label: m.name,
                    subLabel: `${m.dosage} - ${m.frequency}`,
                    date: m.isActive ? "Current" : "Discontinued",
                  }))
                : [{ label: "None recorded", subLabel: "N/A", date: "N/A" }]
            }
          />

          <MedicalDataWidget
            title="Hospitalization/Treatment History"
            onAdd={() => {
              setAddType("hospital")
              setFormData({})
              setIsAddModalOpen(true)
            }}
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

      {/* MODAL: ADD RECORD */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsAddModalOpen(false)}
          />
          <div className="relative z-10 bg-white rounded-[2rem] p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-200">
            <h2 className="text-xl font-black text-[#844250] uppercase mb-1 tracking-tight">
              New {addType}
            </h2>
            <p className="text-xs text-gray-400 font-medium mb-6 uppercase tracking-widest">
              Medical Data Entry
            </p>
            <form onSubmit={handleAddSubmit} className="flex flex-col gap-4">
              {addType === "condition" && (
                <>
                  <input
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm"
                    placeholder="Condition Name"
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                  <input
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm"
                    placeholder="Category"
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    required
                  />
                  <textarea
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm min-h-[100px]"
                    placeholder="Brief Description"
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    required
                  />
                </>
              )}
              {addType === "medication" && (
                <>
                  <input
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm"
                    placeholder="Medication Name"
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                  <div className="flex gap-3">
                    <input
                      className="flex-1 p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm"
                      placeholder="Dosage"
                      onChange={(e) =>
                        setFormData({ ...formData, dosage: e.target.value })
                      }
                      required
                    />
                    <input
                      className="flex-1 p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm"
                      placeholder="Freq"
                      onChange={(e) =>
                        setFormData({ ...formData, frequency: e.target.value })
                      }
                      required
                    />
                  </div>
                </>
              )}
              {addType === "hospital" && (
                <>
                  <input
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm"
                    placeholder="Facility"
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                  />
                  <input
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm"
                    placeholder="Care Type"
                    onChange={(e) =>
                      setFormData({ ...formData, careType: e.target.value })
                    }
                    required
                  />
                  <input
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm"
                    placeholder="Date Range"
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    required
                  />
                  <textarea
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm min-h-[80px]"
                    placeholder="Reason"
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    required
                  />
                </>
              )}
              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-4 font-bold text-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 bg-[#844250] text-white rounded-2xl font-bold"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SOS CARD */}
      {isModalOpen && selectedFlag && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => setIsModalOpen(false)}
          />
          <div className="relative z-10 w-full max-w-2xl animate-in fade-in zoom-in duration-300">
            <CounselorFlagCard
              flag={{
                ...selectedFlag,
                student_name: selectedFlag.user_name,
                flagged_text: selectedFlag.full_text,
                matched_phrases: selectedFlag.matched_phrases || [],
              }}
              onReview={() => setIsModalOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}
