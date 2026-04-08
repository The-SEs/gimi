import { useState } from "react";
import allergiesIcon from "../../assets/allergiesIcon.svg";
import { api } from "../../services/api";
import { Edit2, Save, X } from "lucide-react";

type RiskLevel = "HIGH RISK" | "MODERATE RISK" | "LOW RISK";

interface StudentInfoProps {
  studentId?: string;
  caseCode?: string;
  name?: string;
  allergies?: string[];
  primaryPhysician?: string;
  riskLevel?: RiskLevel;
  onUpdate?: () => void;
}

const riskStyles: Record<RiskLevel, string> = {
  "HIGH RISK": "bg-red-100 text-red-600",
  "MODERATE RISK": "bg-yellow-100 text-yellow-600",
  "LOW RISK": "bg-green-100 text-green-600",
};

export default function StudentInfo({
  studentId,
  caseCode,
  name,
  allergies = [],
  primaryPhysician,
  riskLevel = "HIGH RISK",
  onUpdate,
}: StudentInfoProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedAllergies, setEditedAllergies] = useState(allergies.join(", "));
  const [editedPhysician, setEditedPhysician] = useState(primaryPhysician || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!studentId) return;
    setIsSaving(true);
    try {
      await api.patch(`/api/safety/admin/medical-info/${studentId}/`, {
        allergies: editedAllergies,
        primary_physician: editedPhysician,
      });
      setIsEditing(false);
      onUpdate?.();
    } catch (error) {
      console.error("Failed to update medical info", error);
      alert("Failed to update information.");
    } finally {
      setIsSaving(false);
    }
  };

  const allergiesText = allergies.join(", ") || "None";

  return (
    <>
      <div className="bg-white rounded-xl px-4 py-6 sm:px-6 sm:py-8 w-full overflow-hidden border border-gray-100 relative group">
        <button 
          onClick={() => {
            setEditedAllergies(allergies.join(", "));
            setEditedPhysician(primaryPhysician || "");
            setIsEditing(true);
          }}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-blue-600 transition-colors bg-gray-50 rounded-full opacity-0 group-hover:opacity-100"
        >
          <Edit2 size={16} />
        </button>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:flex-wrap sm:gap-4 lg:gap-6">
          <div className="flex flex-col min-w-0 sm:w-[260px] lg:w-[300px] sm:flex-shrink-0">
            <p className="text-base text-gray-500 font-medium mb-1 truncate">
              {studentId} • {caseCode}
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 break-words leading-tight">
              {name || "Loading..."}
            </h2>
          </div>

          <div className="flex flex-row flex-wrap items-start gap-8 min-w-0 ml-0 sm:ml-auto sm:justify-end">
            <div className="flex items-center gap-3 bg-red-50 px-3 py-2 rounded-lg min-w-0 max-w-full sm:max-w-[260px]">
              <img src={allergiesIcon} className="w-5 h-5 flex-shrink-0" />
              <div className="leading-tight min-w-0">
                <p className="text-sm font-semibold text-gray-500">ALLERGIES</p>
                <p className="text-base text-gray-800 truncate">{allergiesText}</p>
              </div>
            </div>

            <div className="leading-tight min-w-0 ml-8">
              <p className="text-sm font-semibold text-gray-500">PRIMARY PHYSICIAN</p>
              <p className="text-base font-medium text-blue-700 break-words">
                {primaryPhysician || "Not Assigned"}
              </p>
            </div>
          </div>

          <div className="sm:ml-auto flex-shrink-0">
            <span className={`text-base font-semibold px-4 py-1.5 rounded-full whitespace-nowrap ${riskStyles[riskLevel as RiskLevel] || riskStyles["HIGH RISK"]}`}>
              {riskLevel}
            </span>
          </div>
        </div>
      </div>

      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="bg-white rounded-[30px] w-full max-w-[500px] p-8 flex flex-col shadow-2xl animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Edit Patient Info</h3>
              <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wider">Allergies (comma separated)</label>
                <input 
                  type="text" 
                  value={editedAllergies}
                  onChange={(e) => setEditedAllergies(e.target.value)}
                  className="w-full bg-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-100 transition"
                  placeholder="e.g. Peanuts, Seafood"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-500 mb-2 uppercase tracking-wider">Primary Physician</label>
                <input 
                  type="text" 
                  value={editedPhysician}
                  onChange={(e) => setEditedPhysician(e.target.value)}
                  className="w-full bg-gray-100 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-100 transition"
                  placeholder="e.g. DR. SMITH"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 bg-gray-100 text-gray-600 px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition"
              >
                CANCEL
              </button>
              <button
                disabled={isSaving}
                onClick={handleSave}
                className="flex-1 bg-blue-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-800 transition flex items-center justify-center gap-2"
              >
                {isSaving ? "SAVING..." : <><Save size={18} /> SAVE CHANGES</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}