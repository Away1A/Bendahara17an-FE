import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-red-600 text-white px-6 py-3 shadow-md sticky top-0 z-50">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-wide">💰 Bendahara 17-an</h1>
        <ul className="flex gap-4 text-sm font-medium">
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
    </nav>
  );
}
