import { Link } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react"; // Optional: pakai icon dari lucide-react

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <nav className="bg-red-600 text-white px-6 py-3 shadow-md sticky top-0 z-50">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-wide">💰 Bendahara 17-an</h1>

        {/* Tombol hamburger (mobile) */}
        <button
          onClick={toggleMenu}
          className="md:hidden focus:outline-none"
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Menu (desktop) */}
        <ul className="hidden md:flex gap-4 text-sm font-medium">
          <li>
            <Link to="/" className="hover:underline">
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/pemasukan" className="hover:underline">
              Pemasukan
            </Link>
          </li>
          <li>
            <Link to="/pengeluaran" className="hover:underline">
              Pengeluaran
            </Link>
          </li>
          <li>
            <Link to="/laporan" className="hover:underline">
              Laporan
            </Link>
          </li>
        </ul>
      </div>

      {/* Menu (mobile dropdown) */}
      {isOpen && (
        <ul className="mt-2 flex flex-col gap-2 text-sm font-medium md:hidden">
          <li>
            <Link to="/" onClick={closeMenu} className="hover:underline block">
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              to="/pemasukan"
              onClick={closeMenu}
              className="hover:underline block"
            >
              Pemasukan
            </Link>
          </li>
          <li>
            <Link
              to="/pengeluaran"
              onClick={closeMenu}
              className="hover:underline block"
            >
              Pengeluaran
            </Link>
          </li>
          <li>
            <Link
              to="/laporan"
              onClick={closeMenu}
              className="hover:underline block"
            >
              Laporan
            </Link>
          </li>
        </ul>
      )}
    </nav>
  );
}
