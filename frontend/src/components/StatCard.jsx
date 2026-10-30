export default function StatCard({ icon: Icon, label, value, helper, tone = "blue" }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    violet: "bg-violet-50 text-violet-600",
    green: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600"
  };
  return (
    <div className="stat-3d card-3d rounded-2xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="display-font mt-2 text-2xl font-extrabold text-slate-900">{value}</p>
          {helper && <p className="mt-1 text-xs text-slate-400">{helper}</p>}
        </div>
        <div className={`grid h-11 w-11 place-items-center rounded-xl ${colors[tone]}`}><Icon size={20} /></div>
      </div>
    </div>
  );
}
