import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Menu, X, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { auth, logout } = useAuth();

  const toggleMenu = () => setIsOpen((prev) => !prev);
  const closeMenu = () => setIsOpen(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItem = (to, label) => (
    <Link
      to={to}
      onClick={closeMenu}
      className="hover:underline block px-2 py-1 rounded-md hover:bg-red-700/30 transition"
    >
      {label}
    </Link>
  );

  const role = auth.role;
  const isAdmin = role === "admin";
  const isMaker = role === "maker" || role === "ketua divisi";
  const isChecker = role === "checker" || role === "wakil";
  const isApprover =
    role === "approver" ||
    role === "pengurus rt" ||
    role === "pengurus rw" ||
    role === "bendahara" ||
    role === "ketua panitia";

  const getPengajuanPath = () => {
    if (isMaker) return "/pengajuan/maker";
    if (isChecker) return "/pengajuan/checker";
    if (isApprover) return "/pengajuan/approver";
    return null;
  };

  const pengajuanPath = getPengajuanPath();

  return (
    <nav className="bg-red-600 text-white px-6 py-3 shadow-md sticky top-0 z-50">
      <div className="flex items-center justify-between">
        <Link to="/" className="text-xl font-bold tracking-wide">
          💰 Bendahara&nbsp;17‑an
        </Link>

        <button onClick={toggleMenu} className="md:hidden p-1">
          {isOpen ? <X size={26} /> : <Menu size={26} />}
        </button>

        <ul className="hidden md:flex gap-6 text-sm font-medium items-center">
          {navItem("/", "Dashboard")}
          {isAdmin && navItem("/pemasukan", "Pemasukan")}
          {isAdmin && navItem("/pengeluaran", "Pengeluaran")}
          {isAdmin && navItem("/pengajuan/admin", "Pengajuan")}
          {pengajuanPath && navItem(pengajuanPath, "Pengajuan")}
          {navItem("/laporan", "Laporan")}
          <li>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 bg-white/10 hover:bg-white/20 px-3 py-1 rounded-md text-xs transition"
            >
              <LogOut size={16} /> Logout
            </button>
          </li>
        </ul>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <ul className="md:hidden flex flex-col gap-2 mt-2 p-3 bg-red-600/95 rounded-lg text-sm font-medium">
          {navItem("/", "Dashboard")}
          {isAdmin && navItem("/pemasukan", "Pemasukan")}
          {isAdmin && navItem("/pengeluaran", "Pengeluaran")}
          {pengajuanPath && navItem(pengajuanPath, "Pengajuan")}
          {navItem("/laporan", "Laporan")}
          <li>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-1 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-md text-xs transition"
            >
              <LogOut size={16} /> Logout
            </button>
          </li>
        </ul>
      )}
    </nav>
  );
}
