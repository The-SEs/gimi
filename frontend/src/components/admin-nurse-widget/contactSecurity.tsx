import ContactIcon from "../../assets/contactSecurity.svg"
import Arrow from "../../assets/rightArrowWhite.svg"

export default function ContactSecurity() {
  return (
    <div className="flex items-center justify-between bg-[#21417F] text-white rounded-xl px-5 py-3 cursor-pointer">
      <div className="flex items-center gap-3">
        <img src={ContactIcon} alt="Contact Security" className="w-5 h-5" />
        <span className="font-medium">Contact Security</span>
      </div>
      <img src={Arrow} alt="Arrow" className="w-4 h-4" />
    </div>
  )
}