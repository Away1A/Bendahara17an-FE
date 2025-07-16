import { createContext, useContext, useState } from "react";

// 1. Buat context
const AuthContext = createContext();

// 2. Provider
export const AuthProvider = ({ children }) => {
  // Ambil dari localStorage saat awal render
  const [auth, setAuth] = useState({
    token: localStorage.getItem("token"),
    role: localStorage.getItem("role"),
    user: (() => {
      const storedUser = localStorage.getItem("user");
      try {
        return storedUser ? JSON.parse(storedUser) : null;
        // eslint-disable-next-line no-unused-vars
      } catch (e) {
        return null;
      }
    })(),
  });

  // 3. Login method
  const login = (token, role, user) => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    localStorage.setItem("user", JSON.stringify(user));
    setAuth({ token, role, user });
  };

  // 4. Logout method
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    setAuth({ token: null, role: null, user: null });
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// 5. Hook untuk menggunakan context
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
