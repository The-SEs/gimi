import { useState } from "react";
import allergiesIcon from "../../assets/allergiesIcon.svg";

export default function studentInfo() {
  const [showAllergies, setShowAllergies] = useState(false);

  return (
    <>
      <div className="bg-white rounded-xl px-4 py-6 sm:px-6 sm:py-8 w-full overflow-hidden">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:flex-wrap sm:gap-4 lg:gap-6">
          <div className="flex flex-col min-w-0 sm:w-[260px] lg:w-[300px] sm:flex-shrink-0">
            <p className="text-base text-gray-500 font-medium mb-1 truncate">
              CSC-31 • C20230107
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 break-words leading-tight">
              José Protasio Rizal Mercado y Alonso Realonda
            </h2>
          </div>
          <div className="flex flex-row flex-wrap items-start gap-8 min-w-0 ml-0 sm:ml-auto sm:justify-end">

            <div
              onClick={() => setShowAllergies(true)}
              className="flex items-center gap-3 bg-red-50 px-3 py-2 rounded-lg cursor-pointer hover:bg-red-100 transition min-w-0 max-w-full sm:max-w-[260px]">
              <img src={allergiesIcon} className="w-5 h-5 flex-shrink-0" />
              <div className="leading-tight min-w-0">
                <p className="text-sm font-semibold text-gray-500">ALLERGIES</p>
                <p className="text-base text-gray-800 truncate">
                  Peanuts, Seafood, Peanuts, Seafood
                </p>
              </div>
            </div>
            <div className="leading-tight min-w-0 ml-8">
              <p className="text-sm font-semibold text-gray-500">PRIMARY PHYSICIAN</p>
              <p className="text-base font-medium text-blue-700 break-words">
                DR. P. BORBAJO
              </p>
            </div>
          </div>
          <div className="sm:ml-auto flex-shrink-0">
            <span className="bg-red-100 text-red-600 text-base font-semibold px-4 py-1.5 rounded-full whitespace-nowrap">
              HIGH RISK
            </span>
          </div>
        </div>
      </div>

{/* delete soon */}
      {showAllergies && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setShowAllergies(false)}>
          <div
            className="bg-[#EDE4E4] rounded-[30px] w-full max-w-[500px] py-10 px-8 flex flex-col items-center text-center"
            onClick={(e) => e.stopPropagation()}>
            <img src={allergiesIcon} className="w-10 h-10 mb-4" />
            <h3 className="text-xl font-semibold text-gray-500 tracking-wide mb-6">
              ALLERGIES
            </h3>
            <p className="text-lg text-gray-700 mb-10">
              Peanuts, Seafood, Peanuts, Seafood
            </p>
            <button
              onClick={() => setShowAllergies(false)}
              className="bg-blue-900 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-800 transition cursor-pointer">
              CLOSE
            </button>
          </div>
        </div>
      )}
    </>
  );
}