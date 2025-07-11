// src/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "https://24580ab8ebc3.ngrok-free.app/api", // Ganti jika backend kamu berbeda
});

export default api;
