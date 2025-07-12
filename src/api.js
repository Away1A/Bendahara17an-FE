// src/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "https://87091889b7b7.ngrok-free.app/api",
  headers: {
    "ngrok-skip-browser-warning": "true",
  }, // Ganti jika backend kamu berbeda
});

export default api;
