import { useState } from "react";
import activeConditionsIcon from "../../assets/activeConditionsIcon.svg";
import { Plus, Edit2, Trash2, X, Save } from "lucide-react";
import { api } from "../../services/api";

type ConditionSeverity = "critical" | "normal";

interface Condition {
  id?: number;
  category: string;
  name: string;
  description: string;
  severity: ConditionSeverity;
}

interface ActiveConditionsProps {
  studentId?: string | null;
  conditions?: Condition[];
  onUpdate?: () => void;
}

const severityStyles: Record<ConditionSeverity, {
  wrapper: string;
  category: string;
  name: string;
  description: string;
}> = {
  critical: {
    wrapper: "bg-red-100 border-l-4 border-red-700 rounded-md p-2 sm:p-3 relative group",
    category: "text-xs sm:text-sm tracking-widest text-red-700 mb-1 break-all",
    name: "text-base sm:text-lg lg:text-xl font-semibold text-red-800 mb-1 break-all",
    description: "text-sm sm:text-base text-red-700 break-all",
  },
  normal: {
    wrapper: "bg-gray-100 rounded-md p-2 sm:p-3 relative group",
    category: "text-xs sm:text-sm tracking-widest text-gray-500 mb-1 break-all",
    name: "text-base sm:text-lg lg:text-xl font-semibold text-gray-800 mb-1 break-all",
    description: "text-sm sm:text-base text-gray-600 break-all",
  },
};

export default function ActiveConditions({ studentId, conditions = [], onUpdate }: ActiveConditionsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCondition, setEditingCondition] = useState<Condition | null>(null);
  const [formData, setFormData] = useState<Condition>({
    category: "",
    name: "",
    description: "",
    severity: "normal"
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleOpenModal = (condition?: Condition) => {
    if (condition) {
      setEditingCondition(condition);
      setFormData(condition);
    } else {
      setEditingCondition(null);
      setFormData({ category: "", name: "", description: "", severity: "normal" });
    }
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!studentId) return;
    setIsSaving(true);
    try {
      if (editingCondition?.id) {
        await api.patch(`/api/safety/admin/conditions/${studentId}/`, {
          id: editingCondition.id,
          ...formData
        });
      } else {
        await api.post(`/api/safety/admin/conditions/${studentId}/`, formData);
      }
      setIsModalOpen(false);
      onUpdate?.();
    } catch (error) {
      console.error("Failed to save condition", error);
      alert("Failed to save condition.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!studentId || !window.confirm("Are you sure you want to delete this condition?")) return;
    try {
      await api.delete(`/api/safety/admin/conditions/${studentId}/?id=${id}`);
      onUpdate?.();
    } catch (error) {
      console.error("Failed to delete condition", error);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-4 h-full flex flex-col min-w-0">

      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="flex items-center gap-2">
          <img
            src={activeConditionsIcon}
            alt="Active Conditions"
            className="w-6 h-6 sm:w-7 sm:h-7"/>
          <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800">
            Active Conditions
          </h2>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="p-1.5 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="flex flex-col gap-2 sm:gap-3 overflow-y-auto">
        {conditions.map((condition, i) => {
          const styles = severityStyles[condition.severity];
          return (
            <div key={i} className={styles.wrapper}>
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleOpenModal(condition)} className="p-1 text-gray-400 hover:text-blue-600"><Edit2 size={14} /></button>
                <button onClick={() => condition.id && handleDelete(condition.id)} className="p-1 text-gray-400 hover:text-red-500"><Trash2 size={14} /></button>
              </div>
              <p className={styles.category}>{condition.category}</p>
              <h3 className={styles.name}>{condition.name}</h3>
              <p className={styles.description}>{condition.description}</p>
            </div>
          );
        })}

        {conditions.length === 0 && (
          <p className="text-sm text-gray-400 italic text-center py-10">No active conditions on record.</p>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
          <div className="bg-white rounded-[30px] w-full max-w-[500px] p-8 flex flex-col shadow-2xl animate-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">{editingCondition ? "Edit Condition" : "Add Condition"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-500 mb-1">CATEGORY</label>
                <input 
                  type="text" 
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full bg-gray-100 rounded-xl px-4 py-2 outline-none"
                  placeholder="e.g. PSYCHOLOGICAL"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-500 mb-1">CONDITION NAME</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-gray-100 rounded-xl px-4 py-2 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-500 mb-1">DESCRIPTION</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full bg-gray-100 rounded-xl px-4 py-2 outline-none h-24 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-500 mb-1">SEVERITY</label>
                <select 
                  value={formData.severity}
                  onChange={(e) => setFormData({...formData, severity: e.target.value as ConditionSeverity})}
                  className="w-full bg-gray-100 rounded-xl px-4 py-2 outline-none"
                >
                  <option value="normal">Normal</option>
                  <option value="critical">Critical</option>
                </select>
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