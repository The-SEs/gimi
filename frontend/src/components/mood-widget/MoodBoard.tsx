import calmMood from "../../assets/calm-mood.svg";
import annoyedMood from "../../assets/annoyed-mood.svg";
import neutralMood from "../../assets/neutral-mood.svg";
import sadMood from "../../assets/sad-mood.svg";
import { useState } from "react";

export default function MoodBoard () {

    const [icon, setIcon] = useState(calmMood);
    const [mood, setMood] = useState("Neutral");
    const [time, setTime] = useState("");

    const handleMoodSelection = (name: string, svg: string) => {
    setMood(name);
    setIcon(svg);

    const currentTime = new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
    });

    setTime(currentTime);
    };

    return (
        //<div className="relative w-[90%] mx-auto items-center mt-5 lg:w-[40%] xl:w-[30%]"> //ORIGINAL; changed it to the one below due to issues in the journal page view.
        <div className="relative w-full max-w-[320px] mx-auto mt-5 sm:max-w-[360px] lg:max-w-none">
            <div className="absolute -top-3 left-3/4 -translate-x-1/4 w-20 h-6 bg-blue-300/40 backdrop-blur-[1px] border-l border-r border-white/20 -rotate-2 shadow-sm z-10"></div>
                <div className="bg-white py-5 px-7 rounded-3xl flex flex-col gap-4">

                    <h2 className="text-2xl text-[#1E40AF] font-bold font-liberation">Mood of the Day</h2>

                    <div className="border-1 border-dashed border-[#D0E1FD] rounded-xl flex flex-col gap-1 items-center py-5">
                        <img src={icon} alt={mood} className="w-12 h-12" />
                        <p className="text-xl text-[#3B82F6] font-semibold">{mood}</p>
                        <p className="text-sm text-[#C7CAD1]">Saved at {time}</p>
                    </div>

                    <div className="flex gap-5 px-5 pb-3 justify-center md:gap-10">
                        <button className="transition-transform duration-300 hover:scale-110 hover:-translate-y-1 cursor-pointer"
                            onClick={() => handleMoodSelection("Calm", calmMood)}>
                            <img src={calmMood} alt="Calm Mood" />
                        </button>
                        <button className="transition-transform duration-300 hover:scale-110 hover:-translate-y-1 cursor-pointer"
                            onClick={() => handleMoodSelection("Annoyed", annoyedMood)}>
                            <img src={annoyedMood} alt="Annoyed Mood" />
                        </button>
                        <button className="transition-transform duration-300 hover:scale-110 hover:-translate-y-1 cursor-pointer"
                            onClick={() => handleMoodSelection("Netural", neutralMood)}>
                            <img src={neutralMood} alt="Neutral Mood" />
                        </button>
                        <button className="transition-transform duration-300 hover:scale-110 hover:-translate-y-1 cursor-pointer"
                            onClick={() => handleMoodSelection("Sad", sadMood)}>
                            <img src={sadMood} alt="Sad Mood" />
                        </button>
                    </div>
                </div>
        </div>
    );
}