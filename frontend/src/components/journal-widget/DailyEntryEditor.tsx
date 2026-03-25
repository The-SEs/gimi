import React, { useState } from "react";
<<<<<<< Updated upstream

const JournalView = () => {
  const [date] = useState(() => {
    const today = new Date();
    return today.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  });

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const handleSave = () => {
    const entry = {
      date,
      title,
      body,
    };

    console.log("Saved Entry:", entry);
  };

=======
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const JournalView = () => {
  const [date, setDate] = useState(new Date());
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

>>>>>>> Stashed changes
  return (
    <div className="flex justify-center items-start w-full p-8">
      <div className="w-full max-w-[2000px] min-h-[1000px] bg-white/80 backdrop-blur-md rounded-2xl shadow-lg relative">
        <div className="w-full h-4 rounded-t-2xl bg-[#FFC4DB]" />

<<<<<<< Updated upstream
        <div className="absolute top-6 right-8 flex gap-4 items-center text-xl">
          <button className="text-pink-400 hover:text-pink-600 cursor-pointer">
            ‹
          </button>
          <button className="text-pink-400 hover:text-pink-600 cursor-pointer">
            ›
          </button>

          <button
            onClick={handleSave}
            className="ml-4 px-5 py-2 bg-blue-800 text-white text-sm font-semibold rounded-full shadow-md hover:bg-blue-900 active:scale-95 transition-all duration-150"
          >
            Save
          </button>
=======
        <div className="absolute top-6 right-8 flex gap-4 text-pink-400 text-xl">
          <button className="hover:text-pink-600 cursor-pointer">‹</button>
          <button className="hover:text-pink-600 cursor-pointer">›</button>
          <button className="ml-4 text-red-400 hover:text-red-600 cursor-pointer">✕</button>
>>>>>>> Stashed changes
        </div>

        <div className="p-12 pt-6">
          <div className="mb-4">
<<<<<<< Updated upstream
            <p className="text-gray-500 text-sm">{date}</p>
=======
            <DatePicker
              selected={date}
              onChange={(d: Date) => setDate(d)}
              className="text-gray-500 text-sm outline-none border-b border-transparent focus:border-gray-300 w-full cursor-pointer"
              popperPlacement="bottom-start" // aligns popup to left
              dateFormat="MMMM d, yyyy"
            />
>>>>>>> Stashed changes
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