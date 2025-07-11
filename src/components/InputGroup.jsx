export default function InputGroup({
  label,
  name,
  type = "text",
  value,
  onChange,
}) {
  return (
    <div className="mb-3">
      <label className="block mb-1 text-sm font-semibold">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-red-500 focus:outline-none transition"
      />
    </div>
  );
}
