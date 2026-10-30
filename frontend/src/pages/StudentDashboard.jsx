import { useEffect, useMemo, useState } from "react";
import { Award, Bell, Briefcase, CalendarDays, CheckCircle2, FileText, LayoutDashboard, Sparkles, UserRound, Upload, Download, Search, X } from "lucide-react";
import AppShell from "../components/AppShell";
import StatCard from "../components/StatCard";
import Badge from "../components/Badge";
import JobCard from "../components/JobCard";
import Modal from "../components/Modal";
import { demoApplications, demoInterviews, demoJobs, demoNotices } from "../data/demoData";
import { calculateMatch } from "../utils/matching";
import { api } from "../services/api";
import FilterBar from "../components/FilterBar";
import AdvancedAIWorkspace from "../components/AdvancedAIWorkspace";

const nav = [
  {id:"dashboard", label:"Dashboard", icon:LayoutDashboard},
  {id:"profile", label:"My Profile", icon:UserRound},
  {id:"resume", label:"Resume Builder", icon:FileText},
  {id:"jobs", label:"Job Opportunities", icon:Briefcase},
  {id:"applications", label:"Applications", icon:CheckCircle2},
  {id:"interviews", label:"Interviews", icon:CalendarDays},
  {id:"notifications", label:"Notifications", icon:Bell},
  {id:"ai-workspace", label:"AI Career Studio", icon:Sparkles}
];

const blankProfile = {
  name:"Maahi Mittal", collegeId:"TI24CSE001", rollNo:"CSE-001", email:"maahi.demo@tulas.edu.in",
  branch:"CSE", year:"3rd Year", phone:"98XXXXXX10", college:"Tulas Institute", city:"Dehradun", state:"Uttarakhand", dob:"",
  school10:"", percent10:"", school12:"", percent12:"", cgpa:"8.5", linkedin:"", github:"",
  technical:"Java, Python, SQL, HTML, CSS, JavaScript, React", soft:"Communication, Teamwork, Problem Solving",
  languages:"English, Hindi", projects:"Expense Manager; MediDrone", experience:"", achievements:""
};

export default function StudentDashboard({ user, onHome }) {
  const [active, setActive] = useState("dashboard");
  const [profile, setProfile] = useState(() => ({...blankProfile, name:user?.name || blankProfile.name, email:user?.email || blankProfile.email}));
  const [jobs, setJobs] = useState(demoJobs);
  const [applications, setApplications] = useState(demoApplications);
  const [modal, setModal] = useState(null);
  const [syncing, setSyncing] = useState(true);
  const [search, setSearch] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [matchFilter, setMatchFilter] = useState("all");
  const [sortFilter, setSortFilter] = useState("match");
  const [resumeMode, setResumeMode] = useState("choice");
  useEffect(() => {
    let alive = true;
    Promise.all([api.jobs(), api.applications()]).then(([remoteJobs, remoteApps]) => {
      if (!alive) return;
      if (Array.isArray(remoteJobs) && remoteJobs.length) setJobs(remoteJobs);
      if (Array.isArray(remoteApps)) setApplications(remoteApps);
    }).catch(() => {}).finally(() => alive && setSyncing(false));
    return () => { alive = false; };
  }, []);

  const skills = profile.technical.split(",").map(s=>s.trim()).filter(Boolean);
  const matches = useMemo(() => Object.fromEntries(jobs.map(j => [j.id, calculateMatch(skills, j.skills).percentage])), [jobs, profile.technical]);

  const filteredJobs = useMemo(() => {
    const result = jobs.filter(j => {
      const text = `${j.company} ${j.role} ${j.skills.join(" ")}`.toLowerCase();
      const matchesSearch = text.includes(search.toLowerCase());
      const matchesLocation = locationFilter === "all" || j.location.toLowerCase().includes(locationFilter.toLowerCase());
      const score = matches[j.id] ?? 0;
      const matchesScore = matchFilter === "all" || (matchFilter === "80" ? score >= 80 : matchFilter === "70" ? score >= 70 : score < 70);
      return matchesSearch && matchesLocation && matchesScore;
    });
    return [...result].sort((a,b) => sortFilter === "match" ? (matches[b.id]??0)-(matches[a.id]??0) : sortFilter === "deadline" ? String(a.deadline).localeCompare(String(b.deadline)) : String(a.role).localeCompare(String(b.role)));
  }, [jobs, search, locationFilter, matchFilter, sortFilter, matches]);

  const update = (key, value) => setProfile(p => ({...p, [key]:value}));

  async function apply(job) {
    if (applications.some(a => a.jobId === job.id)) return;
    try {
      const created = await api.apply(job.id);
      setApplications(a => [created, ...a]);
      setModal({type:"success", title:"Application submitted", text:`Your application for ${job.role} at ${job.company} has been submitted successfully.`});
    } catch (error) {
      setModal({type:"success", title:"Could not apply", text:error.message});
    }
  }

  function downloadResume() {
    const text = `${profile.name}\n${profile.email} | ${profile.phone}\n${profile.college} • ${profile.branch} • ${profile.year}\n\nSKILLS\n${profile.technical}\n\nPROJECTS\n${profile.projects}\n\nEDUCATION\nCGPA: ${profile.cgpa}`;
    const blob = new Blob([text], {type:"text/plain"});
    const url = URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download="PlaceSmart_Resume.txt"; a.click(); URL.revokeObjectURL(url);
  }

  const saveProfile = () => setModal({type:"success", title:"Profile saved", text:"Your profile has been updated. The matching engine can now use the latest skills."});

  return (
    <AppShell role="student" title={active==="dashboard" ? "Student Dashboard" : nav.find(n=>n.id===active)?.label} subtitle="Build your profile, discover opportunities and track your placement journey." navItems={nav} active={active} onNavigate={setActive} onHome={onHome} user={user}>
      {active==="dashboard" && <DashboardHome profile={profile} skills={skills} matches={matches} applications={applications} setActive={setActive} />}
      {active==="profile" && <Profile profile={profile} update={update} onSave={saveProfile} />}
      {active==="resume" && <Resume profile={profile} update={update} mode={resumeMode} setMode={setResumeMode} onDownload={downloadResume} />}
      {active==="jobs" && <Jobs jobs={filteredJobs} search={search} setSearch={setSearch} matches={matches} locationFilter={locationFilter} setLocationFilter={setLocationFilter} matchFilter={matchFilter} setMatchFilter={setMatchFilter} sortFilter={sortFilter} setSortFilter={setSortFilter} total={jobs.length} onApply={apply} onView={job=>setModal({type:"job", job})} />}
      {active==="applications" && <Applications applications={applications} />}
      {active==="interviews" && <Interviews />}
      {active==="notifications" && <Notifications />}
      {active==="ai-workspace" && <AdvancedAIWorkspace role="student" user={user} profile={profile} />}
      <Modal open={!!modal} title={modal?.title || ""} onClose={()=>setModal(null)}>
        {modal?.type==="job" && <div><p className="text-sm leading-7 text-slate-500">{modal.job.description}</p><div className="mt-4 flex flex-wrap gap-2">{modal.job.skills.map(s=><Badge key={s}>{s}</Badge>)}</div><button onClick={()=>{apply(modal.job);setModal(null)}} className="mt-6 w-full rounded-xl bg-blue-600 py-3 font-bold text-white">Apply Now</button></div>}
        {modal?.type==="success" && <div><div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-emerald-600"><CheckCircle2/></div><p className="mt-4 text-center text-sm leading-6 text-slate-500">{modal.text}</p><button onClick={()=>setModal(null)} className="mt-6 w-full rounded-xl bg-slate-900 py-3 font-bold text-white">Done</button></div>}
      </Modal>
    </AppShell>
  );
}

function DashboardHome({profile, skills, matches, applications, setActive}) {
  const avg = Math.round(Object.values(matches).reduce((a,b)=>a+b,0)/Object.values(matches).length);
  return <div className="space-y-6">
    <div className="rounded-3xl bg-gradient-to-r from-slate-950 to-blue-900 p-7 text-white shadow-soft md:p-9">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
        <div><p className="text-sm font-semibold text-blue-200">Good evening, {profile.name.split(" ")[0]} 👋</p><h2 className="display-font mt-2 text-3xl font-extrabold">Your placement journey is moving.</h2><p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">Complete your profile to improve job matching and make recruiter screening easier.</p></div>
        <div className="min-w-44 rounded-2xl bg-white/10 p-4 backdrop-blur"><p className="text-xs text-slate-300">Profile completion</p><div className="mt-2 text-3xl font-extrabold">82%</div><div className="mt-2 h-2 overflow-hidden rounded-full bg-white/15"><div className="h-full w-[82%] rounded-full bg-blue-400"/></div></div>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard icon={Briefcase} label="Recommended jobs" value={Object.keys(matches).length} helper={`${avg}% average match`} />
      <StatCard icon={FileText} label="Applications" value={applications.length} helper="Across active drives" tone="violet"/>
      <StatCard icon={CalendarDays} label="Interviews" value="2" helper="Next: 28 Sep" tone="green"/>
      <StatCard icon={Award} label="Skills" value={skills.length} helper="Keep adding relevant skills" tone="amber"/>
    </div>
    <div className="grid gap-6 xl:grid-cols-[1.35fr_.65fr]">
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><div><h3 className="font-extrabold">Recommended opportunities</h3><p className="text-xs text-slate-400">Local prototype matching based on your skills.</p></div><button onClick={()=>setActive("jobs")} className="text-sm font-bold text-blue-600">View all</button></div><div className="mt-4 space-y-3">{demoJobs.slice(0,3).map(job=><div key={job.id} className="flex items-center justify-between rounded-xl border border-slate-100 p-4"><div><p className="font-bold">{job.role}</p><p className="text-xs text-slate-500">{job.company} • {job.location}</p></div><Badge tone={matches[job.id]>=70?"green":"amber"}>{matches[job.id]}% Match</Badge></div>)}</div></div>
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"><div className="flex items-center gap-2"><Sparkles size={18} className="text-violet-600"/><h3 className="font-extrabold">Skill gap snapshot</h3></div><p className="mt-2 text-sm text-slate-500">For higher matches, consider adding:</p><div className="mt-4 flex flex-wrap gap-2">{["React","Power BI","AWS"].map(s=><span key={s} className="rounded-lg bg-violet-50 px-3 py-2 text-xs font-bold text-violet-700">{s}</span>)}</div><button onClick={()=>setActive("profile")} className="mt-5 w-full rounded-xl border border-slate-200 py-2.5 text-sm font-bold">Update skills</button></div>
    </div>
  </div>;
}

function Field({label, value, onChange, type="text", placeholder=""}) {
  return <label className="block"><span className="mb-1.5 block text-xs font-bold text-slate-500">{label}</span><input type={type} value={value} placeholder={placeholder} onChange={e=>onChange(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"/></label>;
}
function Profile({profile, update, onSave}) {
  const groups = [
    ["Personal Details", [["name","Name"],["collegeId","College ID"],["rollNo","Roll Number"],["email","Email"],["branch","Branch"],["year","Year"],["phone","Phone Number"],["college","College Name"],["city","City"],["state","State"],["dob","Date of Birth"]]],
    ["Education", [["school10","10th School Name"],["percent10","10th Percentage"],["school12","12th School Name"],["percent12","12th Percentage"],["cgpa","CGPA"]]],
    ["Professional & Technical", [["linkedin","LinkedIn URL"],["github","GitHub URL"],["technical","Technical Skills"],["soft","Soft Skills"],["languages","Languages Known"],["projects","Projects"],["experience","Experience"],["achievements","Achievements"]]]
  ];
  return <div className="space-y-5"><div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><div><h2 className="display-font text-xl font-extrabold">My Profile</h2><p className="mt-1 text-sm text-slate-500">Review and edit the information used for matching.</p></div><Badge tone="green">82% Complete</Badge></div></div>{groups.map(([title, fields])=><section key={title} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"><h3 className="mb-5 font-extrabold">{title}</h3><div className="grid gap-4 md:grid-cols-2">{fields.map(([key,label])=><Field key={key} label={label} value={profile[key]} onChange={v=>update(key,v)} />)}</div></section>)}<button onClick={onSave} className="rounded-xl bg-blue-600 px-6 py-3 font-bold text-white">Save Profile</button></div>;
}
function Resume({profile, update, mode, setMode, onDownload}) {
  if (mode==="choice") return <div className="mx-auto max-w-4xl"><div className="mb-7"><h2 className="display-font text-2xl font-extrabold">Resume & Profile</h2><p className="mt-1 text-sm text-slate-500">Choose how you want to create your profile.</p></div><div className="grid gap-5 md:grid-cols-2"><button onClick={()=>setMode("upload")} className="rounded-3xl border-2 border-dashed border-blue-200 bg-blue-50/50 p-8 text-left hover:border-blue-500"><Upload className="text-blue-600"/><h3 className="mt-5 text-lg font-extrabold">Upload Resume</h3><p className="mt-2 text-sm leading-6 text-slate-500">PDF/DOC/DOCX • Prototype parser extracts common profile fields.</p></button><button onClick={()=>setMode("manual")} className="rounded-3xl border border-slate-200 bg-white p-8 text-left shadow-sm hover:border-blue-300"><FileText className="text-violet-600"/><h3 className="mt-5 text-lg font-extrabold">Enter Details Manually</h3><p className="mt-2 text-sm leading-6 text-slate-500">Fill profile details and generate a clean resume.</p></button></div></div>;
  if (mode==="upload") return <div className="mx-auto max-w-2xl rounded-3xl border border-slate-100 bg-white p-8 shadow-sm"><button onClick={()=>setMode("choice")} className="text-sm font-bold text-slate-500">← Back</button><div className="mt-6 text-center"><div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-blue-50 text-blue-600"><Upload/></div><h2 className="display-font mt-5 text-2xl font-extrabold">Upload your resume</h2><p className="mt-2 text-sm text-slate-500">Choose a PDF, DOC or DOCX file. This demo simulates extraction locally.</p><input type="file" accept=".pdf,.doc,.docx" onChange={()=>{update("technical","Java, Python, SQL, DSA, Git"); setMode("parsed")}} className="mt-6 w-full rounded-xl border border-slate-200 p-3 text-sm"/></div></div>;
  if (mode==="parsed") return <div className="mx-auto max-w-2xl rounded-3xl border border-emerald-100 bg-white p-8 shadow-sm"><div className="grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-emerald-600"><CheckCircle2/></div><h2 className="display-font mt-5 text-2xl font-extrabold">Resume details extracted</h2><p className="mt-2 text-sm leading-6 text-slate-500">The prototype parser populated common fields. Review them in My Profile before using them for applications.</p><div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm"><b>Detected skills:</b> {profile.technical}</div><button onClick={()=>setMode("manual")} className="mt-5 rounded-xl bg-blue-600 px-5 py-3 font-bold text-white">Review / Edit Profile</button></div>;
  return <div className="space-y-5"><div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><div><h2 className="display-font text-2xl font-extrabold">Resume Builder</h2><p className="mt-1 text-sm text-slate-500">Edit key information and export a demo resume.</p></div><button onClick={onDownload} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white"><Download size={16}/> Download</button></div></div><div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"><div className="grid gap-4 md:grid-cols-2"><Field label="Full Name" value={profile.name} onChange={v=>update("name",v)}/><Field label="Email" value={profile.email} onChange={v=>update("email",v)}/><Field label="CGPA" value={profile.cgpa} onChange={v=>update("cgpa",v)}/><Field label="Technical Skills" value={profile.technical} onChange={v=>update("technical",v)}/></div><label className="mt-4 block"><span className="mb-1.5 block text-xs font-bold text-slate-500">Projects</span><textarea rows="4" value={profile.projects} onChange={e=>update("projects",e.target.value)} className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-blue-500"/></label></div></div>;
}
function Jobs({jobs,search,setSearch,matches,onApply,onView,locationFilter,setLocationFilter,matchFilter,setMatchFilter,sortFilter,setSortFilter,total}) { return <div className="space-y-5"><div><h2 className="display-font text-2xl font-extrabold">Job Opportunities</h2><p className="mt-1 text-sm text-slate-500">Search and filter openings by location, AI match and sorting.</p></div><FilterBar search={search} onSearch={setSearch} resultCount={jobs.length} totalCount={total} onReset={()=>{setSearch("");setLocationFilter("all");setMatchFilter("all");setSortFilter("match")}} filters={[{key:"location",label:"Location",value:locationFilter,onChange:setLocationFilter,options:[{value:"all",label:"All locations"},{value:"pune",label:"Pune"},{value:"bengaluru",label:"Bengaluru"},{value:"hyderabad",label:"Hyderabad"},{value:"noida",label:"Noida"}]},{key:"match",label:"AI Match",value:matchFilter,onChange:setMatchFilter,options:[{value:"all",label:"Any match"},{value:"80",label:"80%+ Match"},{value:"70",label:"70%+ Match"},{value:"low",label:"Below 70%"}]},{key:"sort",label:"Sort",value:sortFilter,onChange:setSortFilter,options:[{value:"match",label:"Best match"},{value:"deadline",label:"Deadline"},{value:"role",label:"Role A–Z"}]}]} /><div className="grid gap-5 lg:grid-cols-2">{jobs.map(j=><JobCard key={j.id} job={j} match={matches[j.id]} onApply={onApply} onView={onView}/>)}</div>{!jobs.length&&<div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-sm text-slate-500">No jobs match your filters. Try Reset.</div>}</div>; }
function Applications({applications}) { return <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"><h2 className="display-font text-xl font-extrabold">Application Status</h2><div className="mt-5 overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm"><thead><tr className="border-b text-xs uppercase tracking-wider text-slate-400"><th className="px-3 py-3">Company</th><th>Role</th><th>Applied</th><th>Status</th></tr></thead><tbody>{applications.map(a=><tr key={a.id} className="border-b last:border-0"><td className="px-3 py-4 font-bold">{a.company}</td><td>{a.role}</td><td className="text-slate-500">{a.appliedOn}</td><td><Badge tone={a.status==="Interview"?"green":a.status==="Rejected"?"red":"blue"}>{a.status}</Badge></td></tr>)}</tbody></table></div></div>; }
function Interviews() { return <div className="space-y-4">{demoInterviews.map(i=><div key={i.company} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"><div className="flex flex-col justify-between gap-4 md:flex-row"><div><Badge tone="green">{i.status}</Badge><h3 className="mt-3 font-extrabold">{i.role}</h3><p className="text-sm text-blue-600">{i.company}</p></div><div className="rounded-xl bg-slate-50 p-4 text-sm"><b>{i.date}</b><br/>{i.time} • {i.mode}<br/><span className="text-blue-600">{i.link}</span></div></div></div>)}</div>; }
function Notifications() { return <div className="space-y-4">{demoNotices.map(n=><div key={n.title} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"><div className="flex justify-between gap-4"><div><Badge tone={n.type==="Important"?"red":"amber"}>{n.type}</Badge><h3 className="mt-3 font-extrabold">{n.title}</h3><p className="mt-1 text-sm leading-6 text-slate-500">{n.text}</p></div><span className="text-xs text-slate-400">{n.date}</span></div></div>)}</div>; }
