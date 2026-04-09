import chatIcon from "../../assets/chat.svg";

type TalkToGimiProps = {
  title?: string;
  subtitle?: string;
  className?: string;
  onClick?: () => void;
};

export default function TalkToGimi({
  title = "Talk to GIMI",
  subtitle = "Your helpful companion",
  className = "",
  onClick,
}: TalkToGimiProps) {
  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") onClick();
            }
          : undefined
      }
      className={`flex flex-row items-center gap-5 rounded-2xl bg-white px-5 py-5 w-full shadow-[0_4px_20px_rgba(136,178,255,0.18)] ${
        onClick
          ? "cursor-pointer transition-transform duration-150 active:scale-[0.98]"
          : ""
      } ${className}`}
    >
      {/* Icon container */}
      <div className="shrink-0 rounded-[14px] bg-[#DBEAFE] p-3 sm:p-3.5">
        <img src={chatIcon} alt="Chat icon" className="h-12 w-12" />
      </div>

      {/* Text content */}
      <div className="flex flex-col gap-0.5">
        <span className="text-lg font-bold leading-tight tracking-tight text-[#1E3A8A] sm:text-xl">
          {title}
        </span>
        <span className="text-sm font-normal text-gray-500 sm:text-base">
          {subtitle}
        </span>
      </div>
    </div>
  );
}
