import AlertIcon from "../../assets/alertGuidance.svg"
import Arrow from "../../assets/rightArrowBlack.svg"

export default function AlertGuidance() {
  return (
    <div className="flex items-center justify-between bg-[#E1E3E4] text-gray-700 rounded-xl px-5 py-3 cursor-pointer">
      <div className="flex items-center gap-3">
        <img src={AlertIcon} alt="Alert Guidance" className="w-5 h-5" />
        <span className="font-medium">Alert Guidance</span>
      </div>
      <img src={Arrow} alt="Arrow" className="w-4 h-4" />
    </div>
  )
}