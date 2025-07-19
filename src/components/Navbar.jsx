import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, ChevronDown } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { auth, logout } = useAuth();

  const toggleMenu = () => setIsOpen((prev) => !prev);
  const closeMenu = () => setIsOpen(false);
  const toggleDropdown = () => setShowDropdown((prev) => !prev);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const role = auth.role;
  const name = auth.user?.username || "User";
  const roleFormatted = role.charAt(0).toUpperCase() + role.slice(1);

  const isAdmin = role === "admin";
  const isMaker = role === "maker" || role === "ketua divisi";
  const isChecker = role === "checker" || role === "wakil";
  const isApprover =
    role === "approver" ||
    role === "pengurus rt" ||
    role === "pengurus rw" ||
    role === "bendahara" ||
    role === "ketua panitia";

  const showPengajuan = isMaker || isChecker || isApprover;

  const navItem = (to, label) => (
    <Link
      to={to}
      onClick={closeMenu}
      className="hover:bg-black/5 hover:text-red-700 transition px-4 py-2 rounded-md font-semibold text-sm"
    >
      {label}
    </Link>
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="bg-gradient-to-r from-red-500 via-pink-500 to-orange-400 text-white px-6 py-4 shadow-lg sticky top-0 z-50 backdrop-blur-md">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Brand */}
        <Link
          to="/"
          className="text-2xl font-extrabold tracking-wide flex items-center gap-2"
        >
          <span>💰</span> <span>FORUM REMAJA</span>
        </Link>

        {/* Mobile Button */}
        <button
          onClick={toggleMenu}
          className="md:hidden p-2 rounded-lg bg-white/20 hover:bg-white/30 transition"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6 text-sm font-semibold">
          {navItem("/", "Dashboard")}
          {isAdmin && navItem("/pemasukan", "Pemasukan")}
          {isAdmin && navItem("/pengeluaran", "Pengeluaran")}
          {isAdmin && navItem("/pengajuan/admin", "Pengajuan")}
          {showPengajuan &&
            navItem(
              isMaker
                ? "/pengajuan/maker"
                : isChecker
                ? "/pengajuan/checker"
                : "/pengajuan/approver",
              "Pengajuan"
            )}
          {navItem("/laporan", "Laporan")}

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={toggleDropdown}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-3 py-2 rounded-full transition text-sm font-semibold"
            >
              <img
                src={`https://ui-avatars.com/api/?name=${name}&background=ffffff&color=ff0000&size=32`}
                alt="avatar"
                className="w-8 h-8 rounded-full object-cover"
              />
              <span>
                {name} ({roleFormatted})
              </span>
              <ChevronDown size={16} />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-xl shadow-xl z-50 animate-fade-in-down overflow-hidden">
                <button
                  onClick={handleLogout}
                  className="w-full px-5 py-3 text-left hover:bg-gray-100 flex items-center gap-2 text-sm font-medium"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="md:hidden flex flex-col mt-4 gap-2 bg-white/10 rounded-xl p-4 text-sm font-semibold">
          {navItem("/", "Dashboard")}
          {isAdmin && navItem("/pemasukan", "Pemasukan")}
          {isAdmin && navItem("/pengeluaran", "Pengeluaran")}
          {isAdmin && navItem("/pengajuan/admin", "Pengajuan")}
          {showPengajuan &&
            navItem(
              isMaker
                ? "/pengajuan/maker"
                : isChecker
                ? "/pengajuan/checker"
                : "/pengajuan/approver",
              "Pengajuan"
            )}
          {navItem("/laporan", "Laporan")}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-3 rounded-lg transition"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      )}
    </nav>
  );
}
