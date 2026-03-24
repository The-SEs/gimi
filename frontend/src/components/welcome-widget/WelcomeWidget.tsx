import welcomeIcon from "../../assets/welcome-icon.svg";
// import mdWelcomeIcon from "../../assets/md-welcome-icon.svg";
import { useEffect, useState } from "react";


export default function WelcomeWidget () {

    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
    });

    const [isBiggerScreen, setIsBiggerScreen] = useState(window.innerWidth >= 768);

    useEffect(() => {
    const handleResize = () => {
        setIsBiggerScreen(window.innerWidth >= 768);
    };

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="relative overflow-hidden bg-white p-6 pb-20 rounded-xl w-[90%] mx-auto md:w-1/2 md:mx-0 md:text-left md:px-10 md:py-20">
            <div className="flex flex-col gap-1">
                <p className="font-varela text-[#1E40AF] md:text-[18px] md:text-[#0C1326]">{formattedDate}</p>
                <p className="font-varela font-bold text-2xl text-[#0F172A] md:text-[48px] md:text-[#1E3A8A] leading-tight">Hi, Princess!</p>
                <p className="font-varela text-sm text-[#64748B] md:text-[18px] md:text-[#3B82F6] max-w-md">
                    <span className="md:hidden">Ready for a cozy, productive day?</span>
                    <span className="hidden md:inline">
                        Your GIMI space is ready for some creative thoughts. Let's make today beautiful!
                    </span>
                </p>
            </div>

            {/* <img src={isBiggerScreen ? mdWelcomeIcon : welcomeIcon} alt=""className={`absolute w-16 h-16 object-contain
            ${isBiggerScreen ? 'top-6 right-6 w-24 h-24' : 'bottom-2 right-2 w-16 h-16'}`}/> */}
        </div>

    );
}