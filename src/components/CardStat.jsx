export default function CardStat({ title, value, color }) {
  const bg = {
    green: "bg-green-100 text-green-800",
    red: "bg-red-100 text-red-800",
    blue: "bg-blue-100 text-blue-800",
  };

  return (
    <div
      className={`p-4 rounded-xl shadow-sm border ${bg[color]} transition hover:scale-105 duration-200`}
    >
      <h4 className="text-sm font-semibold mb-1 uppercase">{title}</h4>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}
