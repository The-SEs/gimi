import { Outlet, Link } from "react-router-dom";

export default function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-900">
      <header className="bg-gray-900 text-white p-4 shadow-md">
        <nav className="max-w-6xl mx-auto flex justify-between items-center">
          <h2 className="text-xl font-bold tracking-tight">My Awesome App</h2>
          <div className="flex gap-6 font-medium">
            <Link to="/" className="hover:text-blue-400 transition-colors">
              Home
            </Link>
            <Link to="/about" className="hover:text-blue-400 transition-colors">
              About
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-grow max-w-6xl mx-auto w-full p-6 sm:p-8">
        <Outlet />
      </main>

      <footer className="bg-gray-100 text-gray-500 text-sm text-center p-6 border-t border-gray-200">
        <p>&copy; Made with 💙 by JSE Team © 2026 </p>
      </footer>
    </div>
  );
}
