import { useState } from "react";
import hospitalizationTreatmentIcon from "../../assets/hospitalizationTreatmentIcon.svg";
import level1NurseIcon from "../../assets/level1NurseIcon.svg";
import level2NurseIcon from "../../assets/level2NurseIcon.svg";
import level3NurseIcon from "../../assets/level3NurseIcon.svg";
import { Plus, Edit2, Trash2, X, Save } from "lucide-react";
import { api } from "../../services/api";



interface TreatmentEntry {
  id?: number;
  date: string;
  careType: string;
  title: string;
  description: string;
  level: number;
}

interface HospitalizationHistoryProps {
  studentId?: string | null;
  entries?: TreatmentEntry[];
  onUpdate?: () => void;
}

const levelIcon: Record<number, string> = { 1: level1NurseIcon, 2: level2NurseIcon, 3: level3NurseIcon };

export default function HospitalizationHistory({ studentId, entries = [], onUpdate }: HospitalizationHistoryProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TreatmentEntry | null>(null);
  const [formData, setFormData] = useState<TreatmentEntry>({
    date: "",
    careType: "IN-PATIENT CARE",
    title: "",
    description: "",
    level: 1
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleOpenModal = (entry?: TreatmentEntry) => {
    if (entry) {
      setEditingEntry(entry);
      setFormData(entry);
    } else {
      setEditingEntry(null);
      setFormData({ date: "", careType: "IN-PATIENT CARE", title: "", description: "", level: 1 });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!studentId) return;
    setIsSaving(true);
    try {
      if (editingEntry?.id) {
        await api.patch(`/api/safety/admin/hospitalization/${studentId}/`, {
          id: editingEntry.id,
          ...formData
        });
      } else {
        await api.post(`/api/safety/admin/hospitalization/${studentId}/`, formData);
      }
      setIsModalOpen(false);
      onUpdate?.();
    } catch (error) {
      console.error("Failed to save history entry", error);
      alert("Failed to save history entry.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!studentId || !window.confirm("Are you sure you want to delete this entry?")) return;
    try {
      await api.delete(`/api/safety/admin/hospitalization/${studentId}/?id=${id}`);
      onUpdate?.();
    } catch (error) {
      console.error("Failed to delete history entry", error);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <img src={hospitalizationTreatmentIcon} className="w-7 h-7" />
          <h2 className="text-2xl font-semibold text-gray-800">
            Hospitalization History
          </h2>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="p-1.5 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
        >
          <Plus size={20} />
        </button>
      </div>
      <div className="relative">
        <div className="absolute left-[10px] top-3 bottom-3 w-px bg-gray-200" />
        <div className="flex flex-col gap-6 max-h-[400px] overflow-y-auto pr-2">
          {entries.map((entry, i) => (
            <div key={i} className="flex gap-4 group relative">
              <div className="relative z-10 flex-shrink-0 w-5 h-5 mt-0.5">
                <img src={levelIcon[entry.level] || levelIcon[1]} className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0 pb-2">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-sm font-semibold text-gray-500 tracking-wide uppercase">
                    {entry.date}
                  </p>
                  <span className="text-sm font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-600 truncate max-w-[150px]">
                    {entry.careType}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-1">
                  {entry.title}
                </h3>
                <p className="text-sm text-gray-500 leading-relaxed">
                  {entry.description}
                </p>
                <div className="flex gap-3 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => handleOpenModal(entry)} 
                    className="flex items-center gap-1 text-xs text-blue-600 font-bold hover:text-blue-800 transition-colors"
                  >
                    <Edit2 size={14} /> EDIT
                  </button>
                  <button 
                    onClick={() => entry.id && handleDelete(entry.id)} 
                    className="flex items-center gap-1 text-xs text-red-500 font-bold hover:text-red-700 transition-colors"
                  >
                    <Trash2 size={14} /> DELETE
                  </button>
                </div>
              </div>
            </div>
          ))}

          {entries.length === 0 && (
            <p className="text-sm text-gray-400 italic text-center py-10">No history entries on record.</p>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="bg-white rounded-[30px] w-full max-w-[500px] p-8 flex flex-col shadow-2xl animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">{editingEntry ? "Edit Entry" : "Add Entry"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-500 mb-1">DATE/PERIOD</label>
                  <input type="text" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full bg-gray-100 rounded-xl px-4 py-2 outline-none" placeholder="e.g. MAR 2026"/>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-500 mb-1">CARE TYPE</label>
                  <input type="text" value={formData.careType} onChange={(e) => setFormData({...formData, careType: e.target.value})} className="w-full bg-gray-100 rounded-xl px-4 py-2 outline-none" placeholder="e.g. INTAKE"/>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-500 mb-1">TITLE</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full bg-gray-100 rounded-xl px-4 py-2 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-500 mb-1">DESCRIPTION</label>
                <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full bg-gray-100 rounded-xl px-4 py-2 outline-none h-24 resize-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-500 mb-1">LEVEL (1-3)</label>
                <select value={formData.level} onChange={(e) => setFormData({...formData, level: parseInt(e.target.value)})} className="w-full bg-gray-100 rounded-xl px-4 py-2 outline-none">
                  <option value={1}>Level 1 (Routine)</option>
                  <option value={2}>Level 2 (Moderate)</option>
                  <option value={3}>Level 3 (Urgent)</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-bold">CANCEL</button>
              <button disabled={isSaving} onClick={handleSave} className="flex-1 bg-blue-900 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                {isSaving ? "SAVING..." : <><Save size={18} /> SAVE</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}