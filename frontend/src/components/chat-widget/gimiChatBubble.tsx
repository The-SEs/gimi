import AlertIcon from "../../assets/alertIcon.svg";

type GimiChatBubbleProps = {
  message?: string;
  className?: string;
};

export default function GimiChatBubble({
  message = "Wow, that's a lot of words, are you okay? Do you want someone to talk to?",
  className = "",
}: GimiChatBubbleProps) {
  return (
    <div
      className={`flex flex-col items-start gap-2.5 sm:flex-row sm:items-end sm:gap-3 ${className}`.trim()}
    >
      <div className="shrink-0 pl-2 sm:pl-0">
        <img
          src={AlertIcon}
          alt="GIMI chat bubble avatar"
          className="h-[92px] w-[126px] object-contain drop-shadow-[0_10px_20px_rgba(60,85,146,0.16)] sm:h-[110px] sm:w-[150px]"
        />
      </div>

      <div className="relative w-full max-w-[540px] rounded-[24px] border-2 border-dashed border-[#86B8FF] bg-white px-5 py-4 shadow-[0_16px_30px_rgba(136,178,255,0.07)] sm:px-7 sm:py-5">
        <div className="absolute -left-3 bottom-6 hidden h-6 w-6 rotate-45 border-b-2 border-l-2 border-dashed border-[#86B8FF] bg-white sm:block" />

        <p className="max-w-[32ch] text-[1rem] leading-snug font-medium tracking-[-0.02em] text-[#2D4994] sm:text-[1.4rem]">
          {message}
        </p>
      </div>
    </div>
  );
}
