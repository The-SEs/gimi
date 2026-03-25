import journalIcon from "../../assets/journal-icon.svg"

type JournalWidgetProps = {
  className?: string
}

export default function JournalWidget({ className = "" }: JournalWidgetProps) {
  return (
    <div className="bg-white w-[95%] mx-auto rounded-xl flex gap-5 px-5 py-3 items-center mt-10 lg:w-[30%] lg:mx-5 lg:mt-0">
      <div>
        <img src={journalIcon} alt="" />
      </div>

      <div>
        <p className="text-2xl text-[#1E40AF] font-semibold">Journal</p>
        <p className="text-sm text-[#6B7280]">Record your day</p>
      </div>
    </div>
  )
}
