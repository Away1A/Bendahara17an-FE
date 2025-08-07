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
      className="px-4 py-2 text-sm font-medium text-white hover:text-yellow-300 transition duration-300"
    >
      {label}
    </Link>
  );

  return (
    <nav className="bg-gradient-to-r from-red-500 via-rose-400 to-orange-400 shadow-xl px-6 py-4 sticky top-0 z-50 rounded-b-3xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 text-2xl font-extrabold text-white tracking-wide"
        >
          <span>🌟</span>
          <span>FORUM REMAJA</span>
        </Link>

        {/* Mobile Menu Toggle */}
        <button
          onClick={toggleMenu}
          className="md:hidden p-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          {navItem("/laporan/guest", "Keuangan")}
          {navItem("/acara/guest", "Acara")}
          {navItem("/dokumentasi/guest", "Dokumentasi")}

          {/* Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={toggleDropdown}
              className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-full text-white transition"
            >
              <img
                src="https://ui-avatars.com/api/?name=Guest&background=ffffff&color=ff0000&size=32"
                alt="Guest Avatar"
                className="w-8 h-8 rounded-full shadow-md"
              />
              <span className="text-sm font-medium">Guest</span>
              <ChevronDown size={16} />
            </button>
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg overflow-hidden animate-fade-in-down z-50">
                <button
                  onClick={handleLogin}
                  className="w-full flex items-center gap-2 px-5 py-3 text-sm text-gray-800 hover:bg-gray-100 transition"
                >
                  <LogOut size={16} />
                  Login Admin
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden mt-4 flex flex-col gap-2 bg-white/10 backdrop-blur-md p-4 rounded-2xl text-white text-sm">
          {navItem("/laporan/guest", "Keuangan")}
          {navItem("/acara/guest", "Acara")}
          {navItem("/dokumentasi/guest", "Dokumentasi")}
          <button
            onClick={handleLogin}
            className="flex items-center gap-2 px-4 py-3 bg-white/20 hover:bg-white/30 rounded-lg transition"
          >
            <LogOut size={16} />
            Login Admin
          </button>
        </div>
      )}
    </nav>
  );
}
