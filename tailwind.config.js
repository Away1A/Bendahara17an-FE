/* eslint-disable no-undef */
/** @type {import('tailwindcss').Config} */
export const content = [
  "./index.html",
  "./src/**/*.{js,jsx,ts,tsx}",
];

export const theme = {
  extend: {
    fontFamily: {
      sans: ['Poppins', 'sans-serif'],
    },
    // Tambahan opsional (jika kamu mau animasi lebih banyak atau warna custom)
    // colors: {
    //   primary: "#1D4ED8", // contoh warna biru
    // },
  },
};

export const plugins = [
  require('@tailwindcss/aspect-ratio'),  // opsional, untuk rasio gambar
  require('@tailwindcss/typography'),    // opsional, untuk styling teks artikel
];
