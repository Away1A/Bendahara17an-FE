// src/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "https://ac06f8b8797a.ngrok-free.app/api",
  headers: {
    "ngrok-skip-browser-warning": "true",
  }, // Ganti jika backend kamu berbeda
});

export default api;
