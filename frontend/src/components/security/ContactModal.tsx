import { useState, useEffect } from "react";
import { X } from "lucide-react";
import type { EmergencyContact } from "./types";

interface ContactModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (role: string, name: string, phone: string, id?: string) => void;
    contactToEdit?: EmergencyContact | null;
}

export function ContactModal({ 
    isOpen, 
    onClose, 
    onSave, 
    contactToEdit 
}: ContactModalProps) {
    const [role, setRole] = useState("");
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");

    useEffect(() => {
        if (contactToEdit) {
            setRole(contactToEdit.role);
            setName(contactToEdit.name);
            setPhone(contactToEdit.phoneNumber);
        } else {
            setRole("");
            setName("");
            setPhone("");
        }
    }, [contactToEdit, isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-gray-800">
                        {contactToEdit ? "Edit Emergency Contact" : "Add Emergency Contact"}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6 space-y-4">
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-600">Role</label>
                        <input 
                            type="text" 
                            placeholder="e.g. Guardian, Father, Mother"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#5a7cff] focus:ring-2 focus:ring-[#5a7cff]/20 outline-none transition-all placeholder:text-gray-300"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-600">Full Name</label>
                        <input 
                            type="text" 
                            placeholder="Enter name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#5a7cff] focus:ring-2 focus:ring-[#5a7cff]/20 outline-none transition-all placeholder:text-gray-300"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-gray-600">Phone Number</label>
                        <input 
                            type="text" 
                            placeholder="+63 9xx xxx xxxx"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#5a7cff] focus:ring-2 focus:ring-[#5a7cff]/20 outline-none transition-all placeholder:text-gray-300"
                        />
                    </div>
                </div>
                <div className="p-6 flex gap-3">
                    <button 
                        onClick={onClose}
                        className="flex-1 px-4 py-3 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={() => onSave(role, name, phone, contactToEdit?.id)}
                        className="flex-1 px-4 py-3 rounded-xl font-semibold text-white bg-[#5a7cff] hover:opacity-90 transition-all active:scale-[0.98] shadow-lg shadow-[#5a7cff]/20"
                    >
                        {contactToEdit ? "Update Contact" : "Save Contact"}
                    </button>
                </div>
            </div>
        </div>
    );
}
