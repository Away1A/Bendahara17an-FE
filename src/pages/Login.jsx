import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    // Simulate saved credentials
    const savedUsername = localStorage.getItem("rememberedUsername");
    if (savedUsername) {
      setForm({ ...form, username: savedUsername });
      setRememberMe(true);
    }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await api.post("/auth/login", form);
      const { token, role, user } = res.data;

      if (rememberMe) {
        localStorage.setItem("rememberedUsername", form.username);
      } else {
        localStorage.removeItem("rememberedUsername");
      }

      login(token, role, user);
      navigate("/");
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setError("Username atau password salah");
      setIsLoading(false);
    }
  };

  const handleGuestAccess = () => {
    navigate("/acara/guest");
  };

  const handleForgotPassword = () => {
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 via-gray-800 to-gray-950 text-white px-6 py-12 font-sans">
      {/* small top notification */}
      {showNotification && (
        <div className="fixed top-6 right-6 z-50">
          <div className="px-4 py-2 rounded-md bg-white/8 backdrop-blur-sm border border-white/6 text-sm">
            Hubungi Abil :)
          </div>
        </div>
      )}

      <div className="w-full max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-gradient-to-b from-gray-850/70 to-gray-900/60 rounded-3xl shadow-2xl border border-white/6 overflow-hidden">
          {/* LEFT: Brand / visual */}
          <div className="hidden md:flex flex-col items-center justify-center px-10 py-12 bg-black/60">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0">
                <img
                  src="/PNG WHITE.png"
                  alt="Logo Forum Remaja RW 09"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h2 className="text-xl font-semibold tracking-tight">
                  Forum Remaja RW 09
                </h2>
                <p className="text-sm text-white/70">
                  Panel Panitia • Area Terbatas
                </p>
              </div>
            </div>

            <div className="text-center max-w-xs text-sm text-white/60">
              <p className="mb-4">
                Akses aman untuk pengelolaan acara—gunakan akun panitia untuk
                fitur penuh.
              </p>
              <div className="mt-3 border-t border-white/6 pt-4 text-xs text-white/50">
                &copy; {new Date().getFullYear()} Forum Remaja RW 09
              </div>
            </div>
          </div>

          <div className="px-8 py-10">
            {/* Mobile logo (visible on small screens) */}
            <div className="mb-6 flex items-center justify-center md:justify-start">
              <img
                src="/public/PNG WHITE.png"
                alt="Logo Forum Remaja RW 09"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
                className="block md:hidden w-16 h-16 object-cover rounded-full border border-white/10 shadow-sm"
              />
            </div>

            <div className="mb-6 text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-semibold text-white">
                Selamat Datang
              </h1>
              <p className="text-sm text-white/70 mt-1">
                Login untuk mengakses panel panitia
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/85 mb-1">
                  Username
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    placeholder="Masukkan username"
                    required
                    className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/8 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/10 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white/85 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Masukkan password"
                  required
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/8 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/10 transition"
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="inline-flex items-center cursor-pointer select-none">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                    className="h-4 w-4 rounded bg-white/10 checked:bg-white/80 focus:outline-none"
                  />
                  <span className="ml-2 text-white/80">Ingat saya</span>
                </label>

                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-white/70 hover:underline focus:outline-none"
                >
                  Lupa password?
                </button>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/10 transition ${
                    isLoading
                      ? "bg-white/10 text-white/60 cursor-not-allowed"
                      : "bg-white text-gray-900 hover:scale-[1.01]"
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-3">
                      <svg
                        className="animate-spin h-5 w-5 text-gray-900"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        ></path>
                      </svg>
                      <span>Memproses...</span>
                    </div>
                  ) : (
                    "Login"
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6">
              <div className="text-center text-sm text-white/60 mb-3">
                Atau lihat sebagai warga
              </div>
              <button
                onClick={handleGuestAccess}
                className="w-full py-3 rounded-lg border border-white/8 text-white text-sm hover:bg-white/6 focus:outline-none transition"
              >
                Halaman Warga
              </button>
            </div>

            {/* small footer for mobile */}
            <div className="mt-6 text-center text-xs text-white/50 md:hidden">
              &copy; {new Date().getFullYear()} Forum Remaja RW 09
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fade-in-down {
          0% {
            opacity: 0;
            transform: translateY(-8px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.32s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
