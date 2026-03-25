import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const JournalView = () => {
  const [date, setDate] = useState(new Date());
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  return (
    <div className="flex justify-center items-start w-full p-8">
      <div className="w-full max-w-[2000px] min-h-[1000px] bg-white/80 backdrop-blur-md rounded-2xl shadow-lg relative">
        <div className="w-full h-4 rounded-t-2xl bg-[#FFC4DB]" />

        <div className="absolute top-6 right-8 flex gap-4 text-pink-400 text-xl">
          <button className="hover:text-pink-600 cursor-pointer">‹</button>
          <button className="hover:text-pink-600 cursor-pointer">›</button>
          <button className="ml-4 text-red-400 hover:text-red-600 cursor-pointer">✕</button>
        </div>

        <div className="p-12 pt-6">
          <div className="mb-4">
            <DatePicker
              selected={date}
              onChange={(d: Date) => setDate(d)}
              className="text-gray-500 text-sm outline-none border-b border-transparent focus:border-gray-300 w-full cursor-pointer"
              popperPlacement="bottom-start" // aligns popup to left
              dateFormat="MMMM d, yyyy"
            />
          </div>

          <input
            type="text"
            placeholder="Enter title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-5xl font-semibold mb-8 w-full outline-none border-b border-transparent focus:border-gray-300 placeholder-gray-400"
          />

          <textarea
            placeholder="Enter text"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="text-gray-700 leading-relaxed w-full min-h-[450px] outline-none resize-none placeholder-gray-400"
          />
        </div>
      </div>
    </div>
  );
};

export default JournalView;