import { Phone } from "lucide-react";

import { SectionCard } from "./SectionCard";
import type { StudentSecurityCase } from "./types";

interface EmergencyContactsCardProps {
  studentCase: StudentSecurityCase;
}

export function EmergencyContactsCard({ studentCase }: EmergencyContactsCardProps) {
  return (
    <SectionCard title="Emergency Contacts">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse" aria-label="Emergency contacts">
          <caption className="sr-only">
            Emergency contact list for the selected monitored student
          </caption>
          <tbody>
            {studentCase.emergencyContacts.map((contact) => (
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
                <td className="px-4 py-4 text-right sm:px-5">
                  <a
                    href={`tel:${contact.phoneNumber}`}
                    className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[0.9rem] font-medium text-[#5a7cff] transition hover:bg-[#f3f6ff] hover:text-[#4768ec] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5a7cff]"
                    aria-label={`Call ${contact.name}`}
                  >
                    <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                    Call
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}
