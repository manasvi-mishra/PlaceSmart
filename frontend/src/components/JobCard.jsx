import { BriefcaseBusiness, CalendarDays, MapPin, IndianRupee, Users } from "lucide-react";
import Badge from "./Badge";

export default function JobCard({ job, match, onView, onApply }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-slate-900 text-white"><BriefcaseBusiness size={20}/></div>
          <div>
            <h3 className="font-extrabold text-slate-900">{job.role}</h3>
            <p className="text-sm font-semibold text-blue-600">{job.company}</p>
          </div>
        </div>
        {match !== undefined && <Badge tone={match >= 70 ? "green" : "amber"}>{match}% Match</Badge>}
      </div>
      <p className="mt-4 text-sm leading-6 text-slate-500">{job.description}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Badge tone="slate"><MapPin size={12} className="mr-1"/>{job.location}</Badge>
        <Badge tone="slate"><IndianRupee size={12} className="mr-1"/>{job.package}</Badge>
        <Badge tone="slate"><Users size={12} className="mr-1"/>{job.openings} openings</Badge>
        <Badge tone="slate"><CalendarDays size={12} className="mr-1"/>{job.deadline}</Badge>
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">{job.skills.map(s => <span key={s} className="rounded-lg bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">{s}</span>)}</div>
      <div className="mt-5 flex gap-2">
        <button onClick={() => onView?.(job)} className="flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50">View Details</button>
        <button onClick={() => onApply?.(job)} className="flex-1 rounded-xl bg-blue-600 px-3 py-2.5 text-sm font-bold text-white hover:bg-blue-700">Apply</button>
      </div>
    </div>
  );
}
