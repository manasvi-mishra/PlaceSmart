import { GraduationCap, Sparkles } from "lucide-react";

export default function Logo({ dark = false }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-500/20">
        <GraduationCap size={22} />
        <Sparkles size={11} className="absolute -right-1 -top-1 text-yellow-300" />
      </div>
      <div>
        <div className={`display-font text-lg font-extrabold tracking-tight ${dark ? "text-white" : "text-slate-900"}`}>Place<span className="text-blue-600">Smart</span></div>
        <div className={`text-[9px] font-bold uppercase tracking-[.18em] ${dark ? "text-slate-400" : "text-slate-500"}`}>Smart placements</div>
      </div>
    </div>
  );
}
