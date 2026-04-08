import { Edit2, Trash2 } from "lucide-react";

import { SectionCard } from "./SectionCard";
import type { EmergencyContact, StudentSecurityCase } from "./types";

interface EmergencyContactsCardProps {
  studentCase: StudentSecurityCase;
  onAdd: () => void;
  onEdit: (contact: EmergencyContact) => void;
  onDelete: (contactId: string) => void;
}

export function EmergencyContactsCard({ 
    studentCase, 
    onAdd, 
    onEdit, 
    onDelete 
}: EmergencyContactsCardProps) {
  return (
    <SectionCard title="Emergency Contacts" actionLabel="Add" onAction={onAdd}>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse" aria-label="Emergency contacts">
          <caption className="sr-only">
            Emergency contact list for the selected monitored student
          </caption>
          <tbody>
            {studentCase.emergencyContacts.length === 0 ? (
                <tr>
                    <td className="px-5 py-8 text-center text-gray-400 text-sm italic">
                        No emergency contacts added yet.
                    </td>
                </tr>
            ) : (
                studentCase.emergencyContacts.map((contact) => (
                    <tr
                        key={contact.id}
                        className="border-t border-[#edf1f5] first:border-t-0 hover:bg-[#fafcff]"
                    >
                        <th
                        scope="row"
                        className="px-4 py-4 text-left text-[0.95rem] font-semibold text-[#2f3744] sm:px-5"
                        >
                        {contact.role}
                        </th>
                        <td className="px-4 py-4 text-[0.9rem] font-medium text-[#7a8594] sm:px-5">
                        {contact.name}
                        </td>
                        <td className="px-4 py-4 text-right text-[0.9rem] font-medium text-[#5f6673] sm:px-5">
                            <div className="flex items-center justify-end gap-3">
                                <span>{contact.phoneNumber}</span>
                                <div className="flex gap-1">
                                    <button 
                                        onClick={() => onEdit(contact)}
                                        className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                    >
                                        <Edit2 size={14} />
                                    </button>
                                    <button 
                                        onClick={() => onDelete(contact.id)}
                                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        </td>
                    </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}
