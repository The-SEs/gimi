import journalIcon from "../../assets/journal-icon.svg";

export default function JournalWidget() {
  return (
    <div className="bg-white w-full rounded-2xl flex gap-5 px-5 py-5 items-center shadow-sm ">
      <div>
        <img src={journalIcon} alt="" />
      </div>

      <div>
        <p className="text-2xl text-[#1E40AF] font-semibold">Journal</p>
        <p className="text-sm text-[#6B7280]">Record your day</p>
      </div>
    </div>
  );
}
