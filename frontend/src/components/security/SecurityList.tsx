import { ShieldAlert, X } from "lucide-react";
import type { StudentSecurityCase } from "./types";

interface SecurityListProps {
  students: StudentSecurityCase[];
  selectedStudentId: string | null;
  onSelect: (studentId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function SecurityList({
  students,
  selectedStudentId,
  onSelect,
  isOpen,
  onClose,
}: SecurityListProps) {
  return (
    <aside
      className={`${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } fixed inset-y-0 left-0 z-50 w-72 transform border-r border-[#cfd7e2] bg-white transition-transform duration-300 ease-in-out lg:static lg:block lg:w-80 lg:translate-x-0 lg:rounded-[14px] lg:border shadow-sm`}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-[#eef0f4] px-6 py-5">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-red-500" />
            <h2 className="text-lg font-bold text-[#1f2937]">High Risk List</h2>
          </div>
          <button className="lg:hidden" onClick={onClose}>
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {students.map((student) => (
            <button
              key={student.id}
              onClick={() => {
                onSelect(student.id);
                onClose();
              }}
              className={`flex w-full flex-col px-6 py-4 transition-colors hover:bg-[#f8fafc] ${
                selectedStudentId === student.id
                  ? "border-r-4 border-[#5a7cff] bg-[#f3f6ff]"
                  : "border-r-4 border-transparent"
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="font-semibold text-[#1f2937] text-left">{student.name}</span>
                <span className="text-[0.7rem] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                  HIGH
                </span>
              </div>
              <div className="mt-1 flex gap-2">
                <span className="text-xs text-[#64748b] truncate max-w-[180px]">
                  {student.studentNumber}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
