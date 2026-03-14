export default function Account() {
  return (
    <div className="flex items-center gap-3 px-5 py-2 bg-white rounded-2xl shadow-sm ml-2">
      <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden">
        <img
          src="https://api.dicebear.com/7.x/avataaars/svg?seed=Zoie"
          alt="Avatar"
          className="w-full h-full"
        />
      </div>

      <div className="flex flex-col pr-2">
        <span className="text-xs text-gray-400 font-medium">Hello there,</span>
        <span className="text-sm font-bold text-blue-800">Lorem Name</span>
      </div>
    </div>
  );
}
