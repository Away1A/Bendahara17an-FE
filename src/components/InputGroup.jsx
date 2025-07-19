export default function InputGroup({
  label,
  name,
  type = "text",
  value,
  onChange,
}) {
  return (
    <div className="flex flex-col space-y-2">
      <label htmlFor={name} className="text-sm font-semibold text-gray-700">
        {label}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm shadow-sm focus:border-rose-500 focus:ring-2 focus:ring-rose-500 transition duration-200 outline-none"
        required
      />
    </div>
  );
}
