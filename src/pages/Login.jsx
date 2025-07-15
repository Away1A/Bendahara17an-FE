import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post("/auth/login", form);
      const { token, role } = res.data;

      login(token, role); // Simpan via context
      navigate("/");
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setError("Username atau password salah");
    }
  };

  const handleGuestAccess = () => {
    navigate("/laporan/guest");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-red-50 via-white to-red-100 px-4">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md border border-red-200">
        <h1 className="text-3xl font-extrabold text-center text-red-600 mb-2">
          Forum Remaja RW 09
        </h1>
        <p className="text-sm text-center text-gray-500 mb-6">
          Login untuk mengakses panel panitia
        </p>

        {error && (
          <div className="bg-red-100 text-red-700 px-3 py-2 rounded text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              required
              placeholder="Masukkan username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
              required
              placeholder="Masukkan password"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition font-semibold"
          >
            Login
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 mb-2">
            Atau lihat sebagai warga:
          </p>
          <button
            onClick={handleGuestAccess}
            className="text-red-600 hover:underline text-sm font-medium"
          >
            🔍 Halaman Warga
          </button>
        </div>
      </div>
    </div>
  );
}
