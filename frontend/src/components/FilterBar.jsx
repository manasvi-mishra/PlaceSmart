import { Filter, RotateCcw, Search, SlidersHorizontal } from "lucide-react";

export default function FilterBar({ search="", onSearch, filters=[], onReset, resultCount, totalCount, className="" }) {
  const activeCount = filters.filter(f => f.value && f.value !== "all").length;
  return (
    <div className={`rounded-2xl border border-white/10 bg-white/[.035] p-3 shadow-[0_20px_70px_rgba(0,0,0,.22)] backdrop-blur-xl ${className}`}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 focus-within:border-cyan-400/40">
          <Search size={17} className="text-slate-500" />
          <input value={search} onChange={e=>onSearch?.(e.target.value)} placeholder="Search..." className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {filters.map(f => (
            <label key={f.key} className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">{f.label}</span>
              <select value={f.value} onChange={e=>f.onChange(e.target.value)} className="max-w-[150px] bg-transparent text-xs font-bold text-slate-200 outline-none">
                {f.options.map(o => <option key={o.value} value={o.value} className="bg-slate-950 text-white">{o.label}</option>)}
              </select>
            </label>
          ))}
          <button onClick={onReset} className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[.04] px-3 py-2.5 text-xs font-black text-slate-300 hover:bg-white/[.08]">
            <RotateCcw size={14}/> Reset
          </button>
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between px-1 text-[10px] font-bold uppercase tracking-wider text-slate-600">
        <span className="inline-flex items-center gap-1.5"><SlidersHorizontal size={12}/> {activeCount ? `${activeCount} filter${activeCount>1?"s":""} active` : "All filters"}</span>
        {resultCount !== undefined && <span>{resultCount} of {totalCount ?? resultCount} results</span>}
      </div>
    </div>
  );
}
