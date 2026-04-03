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
      className={`flex items-center w-full gap-4 rounded-2xl bg-white px-6 py-5 shadow-sm cursor-pointer font-varela ${className}`}
    >
      <img
        src={doodleIcon}
        alt="Doodle Icon"
        className="h-16 w-16 object-contain shrink-0"
      />
      <div className="flex flex-col">
        <span className="text-xl font-bold tracking-tight text-GIMI-blue leading-snug">
          {title}
        </span>
        <span className="text-sm font-medium text-blue-300 leading-snug">
          {subtitle}
        </span>
      </div>
    </div>
  );
}
