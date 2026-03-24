import doodleIcon from "../../assets/doodle_icon.svg";

type DoodleWidgetProps = {
  className?: string;
  title?: string;
  subtitle?: string;
};

export default function DoodleWidget({
  className = "",
  title = "Doodle",
  subtitle = "Sketch your ideas",
}: DoodleWidgetProps) {
  return (
    <div
      className={`flex items-center w-[95%] md:w-[30%] gap-4 rounded-2xl bg-white px-6 py-5 shadow-sm cursor-pointer ${className}`}
    >
      <img
        src={doodleIcon}
        alt="Doodle Icon"
        className="h-16 w-16 object-contain"
      />

      <div className="flex flex-col">
        <span className="text-[1.2rem] sm:text-[1.5rem] font-medium tracking-[-0.02em] text-[#2D4994] leading-snug">
          {title}
        </span>

        <span className="text-[0.9rem] sm:text-[1rem] font-medium tracking-[-0.01em] text-[#7d97ca] leading-snug">
          {subtitle}
        </span>
      </div>
    </div>
  );
}
