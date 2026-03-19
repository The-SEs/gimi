export default function Account() {
  return (
    <div className="absolute right-6 top-6 sm:static sm:ml-2 flex items-center sm:gap-3 sm:bg-white sm:px-5 sm:py-2 sm:rounded-2xl sm:shadow-sm">
      {/* Avatar - Always visible, added a white border for mobile to make it pop */}
      <div className="w-12 h-12 sm:w-10 sm:h-10 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden border-2 border-white sm:border-none shadow-md sm:shadow-none">
        <img
          src="https://api.dicebear.com/7.x/avataaars/svg?seed=Zoie"
          alt="Avatar"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Text block - Hidden on mobile, visible on small screens and up */}
      <div className="hidden sm:flex flex-col pr-2">
        <span className="text-xs text-gray-400 font-medium">Hello there,</span>
        <span className="text-sm font-bold text-blue-800">Lorem Name</span>
      </div>
    </div>
  );
}
