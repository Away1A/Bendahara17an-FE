// src/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "https://76794fc3913d.ngrok-free.app/api",
  headers: {
    "ngrok-skip-browser-warning": "true",
  }, // Ganti jika backend kamu berbeda
});

export default api;
