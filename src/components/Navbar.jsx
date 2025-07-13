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
  const name = auth.user?.name || "User";
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
      className="hover:underline block px-2 py-1 rounded-md hover:bg-red-700/30 transition"
    >
      {label}
    </Link>
  );

  // Close dropdown on outside click
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
    <nav className="bg-red-600 text-white px-6 py-3 shadow-md sticky top-0 z-50">
      <div className="flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="text-xl font-bold tracking-wide">
          💰 Bendahara&nbsp;17‑an
        </Link>

        {/* Mobile Hamburger */}
        <button onClick={toggleMenu} className="md:hidden p-1">
          {isOpen ? <X size={26} /> : <Menu size={26} />}
        </button>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
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

          {/* User Info + Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={toggleDropdown}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full transition text-sm"
            >
              <img
                src="https://ui-avatars.com/api/?name=User&background=ffffff&color=ff0000&size=32"
                alt="avatar"
                className="w-7 h-7 rounded-full object-cover"
              />
              <span className="hidden md:inline">
                {name} ({roleFormatted})
              </span>
              <ChevronDown size={16} />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-40 bg-white text-black rounded shadow-lg z-50 animate-fadeIn">
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-sm hover:bg-gray-100 text-left flex items-center gap-2"
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
        <ul className="md:hidden flex flex-col gap-2 mt-2 p-3 bg-red-600/95 rounded-lg text-sm font-medium">
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
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded text-xs transition"
          >
            <LogOut size={16} /> Logout
          </button>
        </ul>
      )}
    </nav>
  );
}
