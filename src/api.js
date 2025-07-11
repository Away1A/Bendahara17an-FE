// src/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3001/api", // Ganti jika backend kamu berbeda
});

export default api;
