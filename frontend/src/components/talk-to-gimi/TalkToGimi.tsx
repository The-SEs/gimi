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
      className={`flex flex-row items-center gap-4 rounded-[18px] bg-white px-4 py-3 shadow-sm sm:px-5 sm:py-4 w-full font-varela ${
        onClick
          ? "cursor-pointer transition-transform duration-150 active:scale-[0.98]"
          : ""
      } ${className}`}
    >
      <div className="shrink-0 rounded-[14px] bg-blue-100 p-3 sm:p-3.5">
        <img src={chatIcon} alt="Chat icon" className="h-8 w-8 sm:h-9 sm:w-9" />
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-lg font-bold leading-tight tracking-tight text-GIMI-blue sm:text-xl">
          {title}
        </span>
        <span className="text-sm font-normal text-slate-500 sm:text-base">
          {subtitle}
        </span>
      </div>
    </div>
  );
}
