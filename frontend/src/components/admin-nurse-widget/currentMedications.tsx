import currentMedicationsIcon from "../../assets/currentMedicationsIcon.svg";
import blueMedicineIcon from "../../assets/blueMedicineIcon.svg";
import greyMedicineIcon from "../../assets/greyMedicineIcon.svg";

export default function CurrentMedications() {
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

        <div className="flex items-center gap-3">
          <img
            src={blueMedicineIcon}
            alt="Medication"
            className="w-10 h-10"/>
          <div>
            <p className="text-xl font-semibold text-gray-800">
              Propranolol
            </p>
            <p className="text-sm text-gray-500">
              10MG • ONCE DAILY
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <img
            src={greyMedicineIcon}
            alt="Medication"
            className="w-10 h-10"/>
          <div>
            <p className="text-xl font-semibold text-gray-800">
              Propranolol
            </p>
            <p className="text-sm text-gray-500">
              20MG • AS NEEDED
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}