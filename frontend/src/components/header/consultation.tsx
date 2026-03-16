import { Calendar } from "lucide-react";
import {
  XMarkIcon,
  CalendarDaysIcon,
  ClockIcon,
  UserIcon,
  ComputerDesktopIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";

export default function Consulation() {
  const [isVisible, setIsVisible] = useState(false);
  const timeSlots = [
    "8:30 am",
    "9:00 am",
    "10:00 am",
    "11:00 am",
    "12:00 pm",
    "1:00 pm",
    "2:00 pm",
    "3:00 pm",
    "4:30 pm",
  ];
  return (
    <>
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="flex items-center gap-2 px-5 py-2.5 bg-white text-blue-700 text-sm font-semibold rounded-full shadow-sm hover:shadow-md transition-shadow"
      >
        <Calendar size={20} />
        Schedule a consultation
      </button>

      {isVisible && (
        <div className="flex h-screen w-full items-center justify-center bg-black/30 p-6 absolute top-0 left-0 z-50">
          <div className="relative w-full max-w-lg">
            <div className="relative rounded-3xl bg-[#ececec] p-8 border border-white/41">
              <button
                onClick={() => setIsVisible(false)}
                className="absolute top-6 right-6 text-sky-950 hover:text-sky-700"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>

              <h1 className="text-3xl font-bold text-GIMI-blue text-center mb-12">
                Schedule a consultation
              </h1>

              <div className="mb-6">
                <button className="flex items-center gap-4 bg-gray-50 p-4 rounded-full border border-gray-100 shadow-sm w-full select-none hover:bg-white">
                  <CalendarDaysIcon className="h-5 w-5 text-sky-700" />
                  <span className="text-sm font-medium text-sky-700">
                    Pick a date
                  </span>
                </button>
              </div>

              <div className="mb-8">
                <h2 className="text-sm font-semibold text-sky-900 mb-3">
                  Select time
                </h2>
                <div className="grid grid-cols-3 gap-3">
                  {timeSlots.map((time, index) => (
                    <button
                      key={index}
                      className="flex items-center justify-center gap-2 bg-gray-50 hover:bg-white px-4 py-3 rounded-full border border-gray-100 shadow-sm text-sm text-sky-700 select-none"
                    >
                      <ClockIcon className="h-4 w-4" />
                      <span>{time}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-sm font-semibold text-sky-900 mb-3">
                  Select mode of consultation
                </h2>
                <div className="flex items-center gap-4">
                  <div className="flex flex-1 items-center justify-center gap-3 bg-gray-50 hover:bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-sm text-sky-700">
                    <UserIcon className="h-5 w-5" />
                    <span>Online</span>
                  </div>
                  <div className="flex flex-1 items-center justify-center gap-3 bg-gray-50 hover:bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-sm text-sky-700">
                    <ComputerDesktopIcon className="h-5 w-5" />
                    <span>Face to face</span>
                  </div>
                </div>
              </div>

              <div className="mb-10">
                <h2 className="text-sm font-semibold text-sky-900 mb-3">
                  Brief reason (optional)
                </h2>
                <textarea
                  className="w-full h-32 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm text-sm placeholder:text-gray-300 resize-none"
                  placeholder="what would you like to discuss?"
                ></textarea>
              </div>

              <div className="flex justify-center mt-6">
                <button className="w-full bg-sky-700 text-white font-extrabold text-xl py-4 rounded-full transition-colors hover:bg-sky-600">
                  Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
