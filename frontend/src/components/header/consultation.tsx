import { Calendar } from "lucide-react";
import {
  XMarkIcon,
  CalendarDaysIcon,
  ClockIcon,
  UserIcon,
  ComputerDesktopIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { useState, useRef } from "react";
import { consultationService } from "../../services/consultationService";

export default function Consulation() {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedMode, setSelectedMode] = useState<string | null>(null);

  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const timeContainerRef = useRef<HTMLDivElement>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1),
  );

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

  // for calendar stuffs
  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0,
  ).getDate();
  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1,
  ).getDay();

  const isMinMonth =
    currentMonth.getFullYear() === today.getFullYear() &&
    currentMonth.getMonth() === today.getMonth();

  const maxMonthDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);
  const isMaxMonth =
    currentMonth.getFullYear() === maxMonthDate.getFullYear() &&
    currentMonth.getMonth() === maxMonthDate.getMonth();

  const handlePrevMonth = () => {
    if (!isMinMonth) {
      setCurrentMonth(
        new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1),
      );
    }
  };

  const handleNextMonth = () => {
    if (!isMaxMonth) {
      setCurrentMonth(
        new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1),
      );
    }
  };

  const handleTimeScroll = () => {
    if (!timeContainerRef.current) return;
    const scrollTop = timeContainerRef.current.scrollTop;
    // Each item is 40px tall, so we divide the scroll position by 40 to get the closest index
    const index = Math.round(scrollTop / 40);

    if (index >= 0 && index < timeSlots.length) {
      if (timeSlots[index] !== selectedTime) {
        setSelectedTime(timeSlots[index]);
      }
    }
  };

  const getCombinedDateTime = () => {
    if (!selectedDate || !selectedTime) return null;

    const [time, modifier] = selectedTime.split(" ");
    const [hours, minutes] = time.split(":");
    let formattedHours = parseInt(hours, 10);

    if (formattedHours === 12) formattedHours = 0;
    if (modifier === "pm") formattedHours += 12;

    const combined = new Date(selectedDate);
    combined.setHours(formattedHours, parseInt(minutes, 10), 0, 0);
    return combined.toISOString();
  };

  const handleSubmit = async () => {
    if (!selectedDate || !selectedTime || !selectedMode) {
      alert("Please select a date, time, and mode of consultation.");
      return;
    }

    setIsSubmitting(true);
    try {
      const modeMap: Record<string, "ON" | "FF"> = {
        Online: "ON",
        "Face to face": "FF",
      };

      await consultationService.createConsultation({
        requested_date: getCombinedDateTime()!,
        mode_of_consultation: modeMap[selectedMode],
        reason: reason,
      });

      alert("Consultation scheduled successfullly!");
      setIsVisible(false);

      window.dispatchEvent(new Event("consultation-added"));

      setSelectedDate(null);
      setSelectedTime(null);
      setSelectedMode(nul);
      setReason("");
    } catch (error) {
      console.error("Failed to schedule consultation:", error);
      alert("Failed to schedule. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="flex shrink items-center gap-2 px-5 py-2.5 bg-white text-blue-700 text-sm font-semibold rounded-full shadow-sm hover:shadow-md transition-shadow"
      >
        <Calendar size={20} />
        Schedule a consultation
      </button>

      {isVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white md:bg-black/30 md:p-6">
          <div className="relative w-full h-full md:h-auto md:max-h-[90vh] md:max-w-lg flex flex-col bg-white md:rounded-3xl md:border md:border-white/41 overflow-hidden">
            {/* Top Header Section */}
            <div className="shrink-0 px-6 pt-6 pb-2 md:p-8 md:pb-0 relative">
              {/* Mobile Back Button */}
              <button
                onClick={() => setIsVisible(false)}
                className="text-sky-950 hover:text-sky-700 md:hidden mb-4"
              >
                <ChevronLeftIcon className="h-6 w-6" />
              </button>

              {/* Desktop Close Button */}
              <button
                onClick={() => setIsVisible(false)}
                className="absolute top-8 right-8 text-sky-950 hover:text-sky-700 hidden md:block"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>

              <h1 className="text-3xl font-bold text-GIMI-blue text-left md:text-center mb-6">
                Schedule a consultation
              </h1>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto px-6 md:px-8 pb-4">
              {/* Date Picker */}
              <div className="mb-6 relative">
                <button
                  onClick={() => setShowCalendar(!showCalendar)}
                  className="flex items-center gap-4 bg-gray-50 shadow-sm p-4 rounded-full border border-gray-100 w-full select-none hover:bg-white"
                >
                  <CalendarDaysIcon className="h-5 w-5 text-GIMI-blue" />
                  <span className="text-sm font-semibold text-GIMI-blue">
                    {selectedDate
                      ? selectedDate.toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "Pick a date"}
                  </span>
                </button>

                {showCalendar && (
                  <div className="absolute top-full mt-2 left-0 w-full bg-white border border-gray-200 rounded-2xl shadow-lg p-4 z-20">
                    <div className="flex justify-between items-center mb-4">
                      <button
                        onClick={handlePrevMonth}
                        disabled={isMinMonth}
                        className={`p-1 rounded-full ${
                          isMinMonth
                            ? "text-gray-300 cursor-not-allowed"
                            : "text-GIMI-blue hover:bg-gray-100"
                        }`}
                      >
                        <ChevronLeftIcon className="h-5 w-5" />
                      </button>
                      <span className="text-sm font-bold text-GIMI-blue">
                        {currentMonth.toLocaleDateString("en-US", {
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                      <button
                        onClick={handleNextMonth}
                        disabled={isMaxMonth}
                        className={`p-1 rounded-full ${
                          isMaxMonth
                            ? "text-gray-300 cursor-not-allowed"
                            : "text-GIMI-blue hover:bg-gray-100"
                        }`}
                      >
                        <ChevronRightIcon className="h-5 w-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-center mb-2">
                      {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                        <div
                          key={day}
                          className="text-xs font-semibold text-gray-400"
                        >
                          {day}
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                      {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                        <div key={`empty-${i}`} />
                      ))}
                      {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const dateObj = new Date(
                          currentMonth.getFullYear(),
                          currentMonth.getMonth(),
                          day,
                        );
                        const isDisabled = dateObj < today;
                        const isSelected =
                          selectedDate?.getTime() === dateObj.getTime();

                        return (
                          <button
                            key={day}
                            disabled={isDisabled}
                            onClick={() => {
                              setSelectedDate(dateObj);
                              setShowCalendar(false);
                            }}
                            className={`p-2 text-sm rounded-full flex items-center justify-center w-8 h-8 mx-auto transition-colors
                              ${
                                isDisabled
                                  ? "text-gray-300 cursor-not-allowed"
                                  : "hover:bg-sky-100 text-sky-900"
                              }
                              ${
                                isSelected
                                  ? "bg-GIMI-blue text-white hover:bg-sky-800"
                                  : ""
                              }
                            `}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Time Slots */}
              <div className="mb-8">
                <h2 className="text-sm font-semibold text-sky-900 mb-3 select-none">
                  Select time
                </h2>

                {/* Mobile Wheel Picker (hidden on md and larger) */}
                <div className="md:hidden relative h-40 bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden shadow-inner mb-4">
                  <style>{`
                    .hide-scrollbar::-webkit-scrollbar {
                      display: none;
                    }
                    .hide-scrollbar {
                      -ms-overflow-style: none;
                      scrollbar-width: none;
                    }
                  `}</style>

                  {/* Visual Highlight Band */}
                  <div className="absolute top-1/2 left-0 w-full h-[40px] -mt-[20px] bg-sky-100/40 border-y border-sky-200 pointer-events-none"></div>

                  <div
                    ref={timeContainerRef}
                    onScroll={handleTimeScroll}
                    className="h-full overflow-y-auto snap-y snap-mandatory scroll-smooth hide-scrollbar flex flex-col items-center"
                  >
                    <div className="h-[60px] shrink-0 w-full"></div>
                    {timeSlots.map((time, index) => {
                      const isSelected = selectedTime === time;
                      return (
                        <div
                          key={index}
                          className={`z-2 snap-center h-[40px] shrink-0 w-full flex items-center justify-center text-lg transition-all duration-200 select-none cursor-pointer ${
                            isSelected
                              ? "font-bold text-GIMI-blue"
                              : "text-gray-400 font-medium"
                          }`}
                          onClick={() => {
                            setSelectedTime(time);
                            if (timeContainerRef.current) {
                              timeContainerRef.current.scrollTo({
                                top: index * 40,
                                behavior: "smooth",
                              });
                            }
                          }}
                        >
                          {time}
                        </div>
                      );
                    })}
                    <div className="h-[60px] shrink-0 w-full"></div>
                  </div>
                </div>

                {/* Desktop Grid (hidden on mobile) */}
                <div className="hidden md:grid grid-cols-3 gap-3">
                  {timeSlots.map((time, index) => {
                    const isSelected = selectedTime === time;
                    return (
                      <button
                        key={index}
                        onClick={() => setSelectedTime(time)}
                        className={`flex items-center justify-center gap-2 px-4 py-3 rounded-full border shadow-sm text-sm select-none transition-colors ${
                          isSelected
                            ? "bg-GIMI-blue text-white border-sky-700"
                            : "bg-gray-50 text-GIMI-blue hover:bg-white border-gray-100"
                        }`}
                      >
                        <ClockIcon className="h-4 w-4" />
                        <span>{time}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Mode of Consultation */}
              <div className="mb-8">
                <h2 className="text-sm font-semibold text-sky-900 mb-3 select-none">
                  Select mode of consultation
                </h2>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setSelectedMode("Online")}
                    className={`flex flex-1 items-center justify-center gap-3 p-4 rounded-xl border shadow-sm text-sm select-none transition-colors ${
                      selectedMode === "Online"
                        ? "bg-GIMI-blue text-white border-sky-700"
                        : "bg-gray-50 text-GIMI-blue hover:bg-white border-gray-100"
                    }`}
                  >
                    <UserIcon className="h-5 w-5" />
                    <span>Online</span>
                  </button>
                  <button
                    onClick={() => setSelectedMode("Face to face")}
                    className={`flex flex-1 items-center justify-center gap-3 p-4 rounded-xl border shadow-sm text-sm select-none transition-colors ${
                      selectedMode === "Face to face"
                        ? "bg-GIMI-blue text-white border-sky-700"
                        : "bg-gray-50 text-GIMI-blue hover:bg-white border-gray-100"
                    }`}
                  >
                    <ComputerDesktopIcon className="h-5 w-5" />
                    <span className="text-center">Face to face</span>
                  </button>
                </div>
              </div>

              {/* Brief Reason */}
              <div className="mb-6 md:mb-10">
                <h2 className="text-sm font-semibold text-sky-900 mb-3 select-none">
                  Brief reason (optional)
                </h2>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full h-32 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm text-sm placeholder:text-gray-400 resize-none outline-GIMI-blue"
                  placeholder="What would you like to discuss?"
                ></textarea>
              </div>
            </div>

            {/* Sticky Footer Area */}
            <div className="shrink-0 p-6 md:p-8 pt-4 md:pt-4 bg-white border-t border-gray-100 md:border-none">
              <button
                onClick={handleSubmit}
                disbaled={isSubmitting}
                className={`w-full text-white font-extrabold text-xl py-4 rounded-full transition-colors ${
                  isSubmitting
                    ? "bg-gray-400"
                    : "bg-GIMI-blue hover:bg-GIMI-blue/90"
                }`}
              >
                {isSubmitting ? "Scheduling..." : "Schedule"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
