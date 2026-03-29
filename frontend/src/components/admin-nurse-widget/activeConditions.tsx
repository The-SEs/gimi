import activeConditionsIcon from "../../assets/activeConditionsIcon.svg";

export default function ActiveConditions() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-3 sm:p-4 h-full flex flex-col min-w-0">
      
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <img
          src={activeConditionsIcon}
          alt="Active Conditions"
          className="w-6 h-6 sm:w-7 sm:h-7"/>
        <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800">
          Active Conditions
        </h2>
      </div>

      <div className="flex flex-col gap-2 sm:gap-3 overflow-y-auto">

        <div className="bg-red-100 border-l-4 border-red-700 rounded-md p-2 sm:p-3">
          <p className="text-xs sm:text-sm tracking-widest text-red-700 mb-1 break-all">
            PSYCHOLOGICAL
          </p>
          <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-red-800 mb-1 break-all">
            Severe Depressive Episode
          </h3>
          <p className="text-sm sm:text-base text-red-700 break-all">
            Diagnosed Jan 2026. Monitoring required for self-harm markers.
          </p>
        </div>

        <div className="bg-gray-100 rounded-md p-2 sm:p-3 break-all">
          <p className="text-xs sm:text-sm tracking-widest text-gray-500 mb-1">
            SYSTEMIC
          </p>
          <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-800 mb-1 break-all">
            Generalized Anxiety
          </h3>
          <p className="text-sm sm:text-base text-gray-600 break-all">
            Trigger-based palpitations reported by student.
          </p>
        </div>
      </div>
    </div>
  );
}