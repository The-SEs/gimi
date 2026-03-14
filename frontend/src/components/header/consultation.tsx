import { Calendar } from "lucide-react";

export default function Consulation() {
  return (
    <button className="flex items-center gap-2 px-5 py-2.5 bg-white text-blue-700 text-sm font-semibold rounded-full shadow-sm hover:shadow-md transition-shadow">
      <Calendar size={20} />
      Schedule a Consultation
    </button>
  );
}
