import { CircleQuestionMark } from "lucide-react";
import { Link } from "react-router-dom";

export default function HelpAndResources() {
  return (
    <Link to="/resources">
      <button className="flex items-center gap-2 px-5 py-2.5 bg-white text-blue-700 text-sm font-semibold rounded-full shadow-sm hover:shadow-md transition-shadow">
        <CircleQuestionMark size={20} />
        Help & Resources
      </button>
    </Link>
  );
}
