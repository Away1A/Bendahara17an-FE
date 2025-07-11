import { akunList } from "../constants/akunList";

export default function SelectKategori({ value, onChange, name = "kategori" }) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium mb-1">
        Kategori
      </label>
      <select
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        required
        className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-red-500 focus:outline-none transition"
      >
        <option value="">-- Pilih Kategori --</option>
        {akunList.map((akun, i) => (
          <option key={i} value={akun}>
            {akun}
          </option>
        ))}
      </select>
    </div>
  );
}
