import currentMedicationsIcon from "../../assets/currentMedicationsIcon.svg";
import blueMedicineIcon from "../../assets/blueMedicineIcon.svg";
import greyMedicineIcon from "../../assets/greyMedicineIcon.svg";

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  isActive: boolean;
}

interface CurrentMedicationsProps {
  medications?: Medication[];
}

const defaultMedications: Medication[] = [
  { name: "Propranolol", dosage: "10MG", frequency: "ONCE DAILY", isActive: true },
  { name: "Propranolol", dosage: "20MG", frequency: "AS NEEDED", isActive: false },
];

export default function CurrentMedications({ medications = defaultMedications }: CurrentMedicationsProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 h-full flex flex-col">

      <div className="flex items-center gap-2 mb-4">
        <img
          src={currentMedicationsIcon}
          alt="Current Medications"
          className="w-7 h-7"/>
        <h2 className="text-2xl font-semibold text-gray-800">
          Current Medications
        </h2>
      </div>

      <div className="flex flex-col gap-3">
        {medications.map((med, i) => (
          <div key={i} className="flex items-center gap-3">
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
        ))}

        {medications.length === 0 && (
          <p className="text-sm text-gray-400 italic">No medications on record.</p>
        )}
      </div>
    </div>
  );
}