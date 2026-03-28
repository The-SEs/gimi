import { useState } from "react";
import allergiesIcon from "../../assets/allergiesIcon.svg";

export default function TopInfoCard() {
  const [showAllergies, setShowAllergies] = useState(false);

  return (
    <>
      <div className="bg-white rounded-xl px-6 py-15 w-full">
        <div className="pl-10 flex items-center justify-between">
          <div className="flex flex-col mr-16 w-[320px] flex-shrink-0">
            <p className="text-base text-gray-500 font-medium mb-1 truncate">
              CSC-31 • C20230107
            </p>
            <h2 className="text-4xl font-bold text-gray-900 break-words">
              Zoie Estorbaa
            </h2>
          </div>
          <div className="flex items-center gap-14 flex-1 min-w-0">

            <div
              onClick={() => setShowAllergies(true)}
              className="flex items-center gap-2 bg-red-50 px-3 py-2 rounded-lg w-[260px] flex-shrink-0 cursor-pointer hover:bg-red-100 transition">
              <img src={allergiesIcon} className="w-5 h-5" />
              <div className="leading-tight min-w-0 ml-6">
                <p className="text-sm font-semibold text-gray-500">
                  ALLERGIES
                </p>
                <p className="text-base text-gray-800 truncate">
                  Peanuts, Seafood, Peanuts, Seafood
                </p>
              </div>
            </div>
            <div className="leading-tight min-w-0 ml-6 max-w-[220px]">
              <p className="text-sm font-semibold text-gray-500">
                PRIMARY PHYSICIAN
              </p>
              <p className="text-base font-medium text-blue-700 break-words">
                DR. P. BORBAJO
              </p>
            </div>
          </div>

          <div className="ml-auto">
            <span className="bg-red-100 text-red-600 text-base font-semibold px-4 py-1.5 rounded-full whitespace-nowrap flex-shrink-0">
              HIGH RISK
            </span>
          </div>
        </div>
      </div>

{/* delete soon */}
      {showAllergies && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={() => setShowAllergies(false)}>
          <div
            className="bg-[#EDE4E4] rounded-[30px] w-[500px] max-w-[90%] py-10 px-8 flex flex-col items-center text-center"
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
              className="bg-blue-900 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-800 transition ">
              CLOSE
            </button>
          </div>
        </div>
      )}
    </>
  );
}