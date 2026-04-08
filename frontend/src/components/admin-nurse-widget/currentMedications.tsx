import { useState } from "react";
import currentMedicationsIcon from "../../assets/currentMedicationsIcon.svg";
import blueMedicineIcon from "../../assets/blueMedicineIcon.svg";
import greyMedicineIcon from "../../assets/greyMedicineIcon.svg";
import { Plus, Edit2, Trash2, X, Save } from "lucide-react";
import { api } from "../../services/api";

interface Medication {
  id?: number;
  name: string;
  dosage: string;
  frequency: string;
  isActive: boolean;
}

interface CurrentMedicationsProps {
  studentId?: string | null;
  medications?: Medication[];
  onUpdate?: () => void;
}

export default function CurrentMedications({ studentId, medications = [], onUpdate }: CurrentMedicationsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMed, setEditingMed] = useState<Medication | null>(null);
  const [formData, setFormData] = useState<Medication>({
    name: "",
    dosage: "",
    frequency: "",
    isActive: true
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleOpenModal = (med?: Medication) => {
    if (med) {
      setEditingMed(med);
      setFormData(med);
    } else {
      setEditingMed(null);
      setFormData({ name: "", dosage: "", frequency: "", isActive: true });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!studentId) return;
    setIsSaving(true);
    try {
      if (editingMed?.id) {
        await api.patch(`/api/safety/admin/medications/${studentId}/`, {
          id: editingMed.id,
          ...formData
        });
      } else {
        await api.post(`/api/safety/admin/medications/${studentId}/`, formData);
      }
      setIsModalOpen(false);
      onUpdate?.();
    } catch (error) {
      console.error("Failed to save medication", error);
      alert("Failed to save medication.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!studentId || !window.confirm("Are you sure you want to delete this medication?")) return;
    try {
      await api.delete(`/api/safety/admin/medications/${studentId}/?id=${id}`);
      onUpdate?.();
    } catch (error) {
      console.error("Failed to delete medication", error);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 h-full flex flex-col">

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <img
            src={currentMedicationsIcon}
            alt="Current Medications"
            className="w-7 h-7"/>
          <h2 className="text-2xl font-semibold text-gray-800">
            Current Medications
          </h2>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="p-1.5 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="flex flex-col gap-3 overflow-y-auto">
        {medications.map((med, i) => (
          <div key={i} className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <img
                src={med.isActive ? blueMedicineIcon : greyMedicineIcon}
                alt="Medication"
                className="w-10 h-10 flex-shrink-0"/>
              <div className="min-w-0">
                <p className="text-xl font-semibold text-gray-800 break-all">
                  {med.name}
                </p>
                <p className="text-sm text-gray-500 break-all">
                  {med.dosage} • {med.frequency}
                </p>
              </div>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => handleOpenModal(med)} className="p-1 text-gray-400 hover:text-blue-600"><Edit2 size={16} /></button>
              <button onClick={() => med.id && handleDelete(med.id)} className="p-1 text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}

        {medications.length === 0 && (
          <p className="text-sm text-gray-400 italic text-center py-10">No medications on record.</p>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="bg-white rounded-[30px] w-full max-w-[500px] p-8 flex flex-col shadow-2xl animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">{editingMed ? "Edit Medication" : "Add Medication"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-500 mb-1 uppercase">Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-gray-100 rounded-xl px-4 py-2 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-500 mb-1 uppercase">Dosage</label>
                  <input 
                    type="text" 
                    value={formData.dosage}
                    onChange={(e) => setFormData({...formData, dosage: e.target.value})}
                    className="w-full bg-gray-100 rounded-xl px-4 py-2 outline-none"
                    placeholder="e.g. 10MG"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-500 mb-1 uppercase">Frequency</label>
                  <input 
                    type="text" 
                    value={formData.frequency}
                    onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                    className="w-full bg-gray-100 rounded-xl px-4 py-2 outline-none"
                    placeholder="e.g. ONCE DAILY"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className="w-4 h-4 rounded text-blue-900"
                />
                <label htmlFor="isActive" className="text-sm font-bold text-gray-500 uppercase">Currently Active</label>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-xl font-bold">CANCEL</button>
              <button 
                disabled={isSaving}
                onClick={handleSave}
                className="flex-1 bg-blue-900 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"
              >
                {isSaving ? "SAVING..." : <><Save size={18} /> SAVE</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}