import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, ChevronDown, LogOut } from "lucide-react";

export default function GuestNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const toggleMenu = () => setIsOpen((prev) => !prev);
  const toggleDropdown = () => setShowDropdown((prev) => !prev);
  const handleLogin = () => navigate("/login");

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItem = (to, label) => (
    <Link
      to={to}
      onClick={() => setIsOpen(false)}
      className="px-4 py-2 text-sm font-medium text-slate-100 hover:text-yellow-400 transition"
    >
      {label}
    </Link>
  );

  return (
    <nav className="bg-slate-900 shadow-md sticky top-0 z-50 full-bleed">
      <div className="w-full px-6 py-3 flex items-center justify-between">
        {/* Kiri - Logo */}
        <div className="flex items-center">
          <Link
            to="/"
            className="flex items-center gap-2 text-xl font-semibold text-white tracking-tight"
          >
            <img
              src="/PNG WHITE.png"
              alt="Forum Remaja Logo"
              className="w-10 h-10 object-contain"
            />
            Forum Remaja
          </Link>
        </div>

        {/* Tengah - Menu (hidden di mobile) */}
        <div className="hidden md:flex items-center gap-6 flex-1 justify-center">
          {navItem("/acara/guest", "Acara")}
          {navItem("/dokumentasi/guest", "Dokumentasi")}
          {navItem("/laporan/guest", "Keuangan")}
        </div>

        {/* Kanan - Account */}
        <div className="hidden md:flex items-center gap-4">
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={toggleDropdown}
              className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded-full text-white transition"
            >
              <img
                src="https://ui-avatars.com/api/?name=Guest&background=334155&color=ffffff&size=32"
                alt="Guest Avatar"
                className="w-8 h-8 rounded-full"
              />
              <span className="text-sm">Guest</span>
              <ChevronDown size={16} />
            </button>
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-xl shadow-lg overflow-hidden z-50">
                <button
                  onClick={handleLogin}
                  className="w-full flex items-center gap-2 px-5 py-3 text-sm text-slate-100 hover:bg-slate-700 transition"
                >
                  <LogOut size={16} />
                  Login Admin
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Toggle */}
        <button
          onClick={toggleMenu}
          className="md:hidden p-2 text-slate-200 rounded-lg hover:bg-slate-800 transition"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-slate-800 border-t border-slate-700">
          <div className="px-4 py-3 flex flex-col gap-2 text-slate-100">
            {navItem("/acara/guest", "Acara")}
            {navItem("/dokumentasi/guest", "Dokumentasi")}
            {navItem("/laporan/guest", "Keuangan")}
            <button
              onClick={handleLogin}
              className="flex items-center gap-2 px-4 py-2 mt-2 bg-slate-700 hover:bg-slate-600 rounded-md transition text-sm"
            >
              <LogOut size={16} />
              Login Admin
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
