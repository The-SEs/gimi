import AdminIcon from "../../assets/admin-user-icon.svg"

export default function AdminAccount() {
  return (
    <div className="flex items-center justify-center cursor-pointer group">
      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white transition-all duration-200 group-hover:shadow-md">
        <img
          src={AdminIcon}
          alt="Admin User Account"
          className="w-10 h-10 object-contain"/>
      </div>
    </div>
  )
}