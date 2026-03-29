import { Search, Funnel } from "lucide-react";

export default function AdminDashboard() {
  // TODO: replace hardcoded info here
  const students = Array(18).fill({
    name: "ZOIE ESTORBA",
    email: "C202301020207@iacademy.edu",
    keywords: ["Kms", "Kill", "Princess"],
    risk: "High",
  });

  return (
    <div className="flex flex-col w-full gap-4 justify-center">
      {/* SEARCH BAR UBOS */}
      <div className="flex flex-row flex-grow justify-between items-center bg-white p-5 shadow-sm border border-gray-100 rounded-xl text-gray-400">
        <div className="flex items-center gap-3 w-full">
          <Search size={20} />
          <input
            type="text"
            placeholder="Search for name or email..."
            className="w-full text-md text-gray-700 bg-transparent focus:outline-none placeholder-gray-400 font-semibold"
          />
        </div>
        <Funnel
          onClick={() => {
            // TODO: filtering lofic here
          }}
          className="text-gray-500 cursor-pointer"
          size={20}
        />
      </div>
      {/* TABLE UBOS */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col w-full">
        <div className="grid grid-cols-[1.5fr_2fr_2fr_0.8fr] w-full text-white font-black text-xl">
          <div className="bg-[#4b84f3] py-4 px-6 text-center">Name</div>
          <div className="bg-[#648bcf] py-4 px-6 text-center">Email</div>
          <div className="bg-[#9ebadc] py-4 px-6 text-center">
            Keywords Detected
          </div>
          <div className="bg-[#ec8783] py-4 px-6 text-center">Risk Level</div>
        </div>

        <div className="overflow-y-auto max-h-[65vh] flex flex-col">
          {students.map((student, index) => (
            <div
              key={index}
              className="grid grid-cols-[1.5fr_2fr_2fr_0.75fr] w-full items-center border-b border-gray-100 pl-3 py-5 hover:bg-gray-50 cursor-pointer transition-colors font-semibold"
              onClick={() => {
                // TODO: student click redirect logic here
              }}
            >
              <div className="text-sm text-gray-700 font-semibold pl-3">
                {student.name}
              </div>

              <div className="text-sm text-gray-600 text-center">
                {student.email}
              </div>

              <div className="flex justify-center gap-2">
                {student.keywords.map((keyword, kIndex) => (
                  <button
                    key={kIndex}
                    className="bg-[#fce3e2] text-[#c03d3f] px-4 py-2 rounded-full text-xs font-semibold hover:bg-red-200 transition-colors cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevents row click when clicking button
                      // TODO: redirect to journal that contained this keyword logic here (idk if legit ni nga i implement)
                    }}
                  >
                    {keyword}
                  </button>
                ))}
              </div>

              <div className="flex justify-center">
                <span className="bg-[#e74643] text-white px-5 py-2 rounded-full text-xs font-semibold tracking-wide">
                  {student.risk}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
