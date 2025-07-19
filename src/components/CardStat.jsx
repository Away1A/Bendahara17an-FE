import { DollarSign, TrendingUp, TrendingDown } from "lucide-react";

export default function CardStat({ title, value, color }) {
  const bg = {
    green: "from-green-100 to-green-50 text-green-800",
    red: "from-red-100 to-red-50 text-red-800",
    blue: "from-blue-100 to-blue-50 text-blue-800",
  };

  const icon = {
    green: <TrendingUp size={24} className="text-green-500" />,
    red: <TrendingDown size={24} className="text-red-500" />,
    blue: <DollarSign size={24} className="text-blue-500" />,
  };

  return (
    <div
      className={`p-5 rounded-2xl border shadow-sm bg-gradient-to-br ${bg[color]} transition-all hover:shadow-lg hover:scale-[1.02] duration-200`}
    >
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-bold uppercase tracking-wide">{title}</h4>
        {icon[color]}
      </div>
      <p className="text-2xl font-extrabold">{value}</p>
    </div>
  );
}
