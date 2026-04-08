import { useState } from "react";
import { api } from "../../services/api";
import { Save } from "lucide-react";

interface VisitDocumentationProps {
  studentId?: string | null;
  onUpdate?: () => void;
}

export default function VisitDocumentation({ studentId, onUpdate }: VisitDocumentationProps) {
  const [reasonForVisit, setReasonForVisit] = useState("");
  const [timeOfAdmission, setTimeOfAdmission] = useState("");
  const [observations, setObservations] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!studentId || !reasonForVisit || !observations) {
      alert("Please fill all fields.");
      return;
    }
    setIsSaving(true);
    try {
      await api.post(`/api/safety/admin/nurse-logs/${studentId}/`, {
        reason: reasonForVisit,
        timeOfAdmission,
        observations
      });
      setReasonForVisit("");
      setTimeOfAdmission("");
      setObservations("");
      onUpdate?.();
    } catch (error) {
      console.error("Failed to save log entry", error);
      alert("Failed to save log entry.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6 w-full">
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4 sm:mb-6">
        Visit Documentation
      </h2>
      <div className="flex flex-col sm:flex-row gap-4 mb-4 sm:mb-6">
        <div className="flex-1">
          <label className="block text-sm font-semibold text-gray-500 tracking-wide mb-1">
            REASON FOR VISIT
          </label>
          <input
            type="text"
            value={reasonForVisit}
            onChange={(e) => setReasonForVisit(e.target.value)}
            className="w-full bg-gray-100 rounded-lg px-4 py-3 text-gray-800 text-base outline-none focus:ring-2 focus:ring-blue-200 transition"/>
        </div>

        <div className="w-full sm:w-[280px]">
          <label className="block text-sm font-semibold text-gray-500 tracking-wide mb-1">
            TIME OF ADMISSION
          </label>
          <input
            type="time"
            value={timeOfAdmission}
            onChange={(e) => setTimeOfAdmission(e.target.value)}
            className="w-full bg-gray-100 rounded-lg px-4 py-3 text-gray-800 text-base outline-none focus:ring-2 focus:ring-blue-200 transition"/>
        </div>
      </div>

      <div className="mb-4 sm:mb-6">
        <label className="block text-sm font-semibold text-gray-500 tracking-wide mb-1">
          OBSERVATION & TREATMENT
        </label>
        <textarea
          value={observations}
          onChange={(e) => setObservations(e.target.value)}
          placeholder="Describe symptoms, administered treatment, and student behavior..."
          rows={4}
          className="w-full bg-gray-100 rounded-lg px-4 py-3 text-gray-800 text-base outline-none focus:ring-2 focus:ring-blue-200 transition resize-none"/>
      </div>
      <div className="flex justify-end">
        <button
          disabled={isSaving}
          onClick={handleSave}
          className="w-full sm:w-auto bg-blue-900 hover:bg-blue-800 transition text-white text-sm font-bold tracking-widest px-6 py-3 rounded-lg cursor-pointer flex items-center justify-center gap-2">
          {isSaving ? "SAVING..." : <><Save size={18} /> SAVE LOG ENTRY</>}
        </button>
      </div>
    </div>
  );
}