import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();
const app = express();
const PORT = Number(process.env.PORT || 3001);
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const JWT_SECRET = process.env.JWT_SECRET || "placesmart-hackathon-secret-change-me";

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || CLIENT_URL === "*" || origin === CLIENT_URL || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    return callback(new Error("CORS blocked this origin"));
  },
  credentials: true
}));
app.use(express.json({ limit: "1mb" }));

const users = [
  { id: "stu-1", name: "Maahi Mittal", email: "student@placesmart.demo", password: "student123", role: "student", title: "Student", company: null },
  { id: "coord-1", name: "Dr. Neha Sharma", email: "coordinator@placesmart.demo", password: "coordinator123", role: "coordinator", title: "Placement Cell Coordinator", company: "Tulas Institute" },
  { id: "rec-1", name: "Priya Mehta", email: "recruiter@placesmart.demo", password: "recruiter123", role: "recruiter", title: "Recruiter", company: "DemoTech Solutions" }
];

const sessions = new Map();
const jobs = [
  { id:"job-1", company:"TCS", role:"Graduate Software Engineer", location:"Pune / Hybrid", package:"₹7.2 LPA", deadline:"2026-10-08", openings:12, skills:["Java","SQL","DSA","Git"], eligibility:"B.Tech CSE/IT • CGPA 7+", description:"Build and maintain enterprise applications." },
  { id:"job-2", company:"Deloitte", role:"Analyst – Technology", location:"Bengaluru", package:"₹8.5 LPA", deadline:"2026-10-12", openings:8, skills:["Python","SQL","Power BI","Communication"], eligibility:"B.Tech • CGPA 7.5+", description:"Work on data-driven technology consulting." },
  { id:"job-3", company:"Microsoft", role:"Software Engineering Intern", location:"Hyderabad", package:"₹80K/month", deadline:"2026-10-20", openings:5, skills:["Python","Java","DSA","Git","React"], eligibility:"Pre-final year CSE/IT", description:"Collaborate with engineering teams to build software." },
  { id:"job-4", company:"Infosys", role:"Systems Engineer", location:"Noida", package:"₹6.5 LPA", deadline:"2026-10-15", openings:20, skills:["Java","SQL","Communication"], eligibility:"B.Tech • CGPA 6.5+", description:"Develop, test and support technology solutions." }
];
const students = [
  { id:"stu-1", name:"Maahi Mittal", collegeId:"TI24CSE001", branch:"CSE", cgpa:8.5, skills:["Java","Python","SQL","React","DSA"], status:"In Process", applications:3, interviews:2 },
  { id:"stu-2", name:"Aarav Sharma", collegeId:"TI24CSE041", branch:"CSE", cgpa:8.6, skills:["Java","SQL","Python","DSA","Git"], status:"Placed", applications:5, interviews:3 },
  { id:"stu-3", name:"Riya Verma", collegeId:"TI24CSE052", branch:"CSE", cgpa:8.1, skills:["Python","React","SQL","Firebase"], status:"In Process", applications:4, interviews:2 },
  { id:"stu-4", name:"Kabir Singh", collegeId:"TI24CSE067", branch:"CSE", cgpa:7.4, skills:["Java","C++","DSA","Git"], status:"Searching", applications:2, interviews:1 }
];
const applications = [
  { id:"app-1", studentId:"stu-1", jobId:"job-1", company:"TCS", role:"Graduate Software Engineer", status:"Interview", appliedOn:"2026-09-18" },
  { id:"app-2", studentId:"stu-1", jobId:"job-2", company:"Deloitte", role:"Analyst – Technology", status:"Shortlisted", appliedOn:"2026-09-16" }
];
const notices = [];

function signToken(user) {
  const payload = Buffer.from(JSON.stringify({ sub: user.id, exp: Date.now() + 1000 * 60 * 60 * 24 * 7 })).toString("base64url");
  const sig = crypto.createHmac("sha256", JWT_SECRET).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}
function verifyToken(token) {
  try {
    const [payload, sig] = String(token || "").split(".");
    if (!payload || !sig) return null;
    const expected = crypto.createHmac("sha256", JWT_SECRET).update(payload).digest("base64url");
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
    if (!sessions.has(token)) return null;
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (!data.exp || data.exp < Date.now()) return null;
    return users.find(u => u.id === data.sub) || null;
  } catch { return null; }
}
function publicUser(user) {
  return { id:user.id, name:user.name, email:user.email, role:user.role, title:user.title, company:user.company };
}
function auth(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  const user = verifyToken(token);
  if (!user) return res.status(401).json({ message:"Session expired. Please log in again." });
  req.user = user;
  next();
}
function roles(...allowed) { return (req,res,next) => allowed.includes(req.user.role) ? next() : res.status(403).json({message:"You do not have permission for this action."}); }

app.get("/api/health", (_, res) => res.json({ ok:true, service:"PlaceSmart API", version:"2.0.0" }));
app.post("/api/auth/login", (req,res) => {
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ message:"Invalid email or password." });
  const token = signToken(user);
  sessions.set(token, user.id);
  res.json({ token, user:publicUser(user) });
});
app.get("/api/auth/me", auth, (req,res) => res.json({ user:publicUser(req.user) }));
app.post("/api/auth/logout", auth, (req,res) => {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, "");
  sessions.delete(token);
  res.json({ ok:true });
});

app.get("/api/jobs", auth, (_, res) => res.json(jobs));
app.post("/api/jobs", auth, roles("recruiter"), (req,res) => {
  const { role, location, package:pkg, deadline, openings, skills, eligibility, description } = req.body;
  if (![role,location,pkg,deadline,openings,eligibility,description].every(Boolean)) return res.status(400).json({message:"Please complete all required fields."});
  const job = { id:`job-${Date.now()}`, company:req.user.company || "DemoTech Solutions", role, location, package:pkg, deadline, openings:Number(openings), skills:(Array.isArray(skills) ? skills : String(skills).split(",").map(s=>s.trim()).filter(Boolean)), eligibility, description };
  jobs.unshift(job); res.status(201).json(job);
});
app.delete("/api/jobs/:id", auth, roles("recruiter"), (req,res) => {
  const index = jobs.findIndex(j=>j.id===req.params.id);
  if(index < 0) return res.status(404).json({message:"Job not found"});
  jobs.splice(index,1); res.json({ok:true});
});
app.get("/api/students", auth, roles("coordinator","recruiter"), (_,res) => res.json(students));
app.patch("/api/students/:id/status", auth, roles("coordinator"), (req,res) => {
  const student = students.find(s=>s.id===req.params.id);
  if(!student) return res.status(404).json({message:"Student not found"});
  const allowed=["Placed","In Process","Searching","Not Eligible"];
  if(!allowed.includes(req.body.status)) return res.status(400).json({message:"Invalid placement status"});
  student.status=req.body.status;
  res.json(student);
});

app.get("/api/applications", auth, (req,res) => {
  const data = req.user.role === "student" ? applications.filter(a=>a.studentId===req.user.id) : applications;
  res.json(data);
});
app.post("/api/applications", auth, roles("student"), (req,res) => {
  const job = jobs.find(j=>j.id===req.body.jobId);
  if(!job) return res.status(404).json({message:"Job not found"});
  if(applications.some(a=>a.studentId===req.user.id && a.jobId===job.id)) return res.status(409).json({message:"You already applied to this job."});
  const item = { id:`app-${Date.now()}`, studentId:req.user.id, jobId:job.id, company:job.company, role:job.role, status:"Applied", appliedOn:new Date().toISOString().slice(0,10) };
  applications.unshift(item); res.status(201).json(item);
});
app.patch("/api/applications/:id", auth, roles("coordinator","recruiter"), (req,res) => {
  const item = applications.find(x=>x.id===req.params.id);
  if (!item) return res.status(404).json({message:"Application not found"});
  item.status = String(req.body.status || item.status); res.json(item);
});
app.post("/api/notices", auth, roles("coordinator"), (req,res) => {
  if(!req.body.title || !req.body.text) return res.status(400).json({message:"Title and message are required."});
  const item = { id:`notice-${Date.now()}`, date:new Date().toISOString().slice(0,10), ...req.body };
  notices.unshift(item); res.status(201).json(item);
});
app.get("/api/notices", auth, (_,res) => res.json(notices));
app.post("/api/ai/analyze", auth, (req,res) => {
  const role = req.user.role;
  const name = req.user.name;
  const first = name.split(" ")[0];
  const student = students.find(s => s.id === req.user.id) || students[0];
  const myApplications = applications.filter(a => a.studentId === req.user.id);
  const matchedJobs = jobs.map(j => {
    const have = new Set((student.skills || []).map(x => String(x).toLowerCase()));
    const reqSkills = [...new Set((j.skills || []).map(x => String(x).toLowerCase()))];
    const matched = reqSkills.filter(x => have.has(x)).length;
    return reqSkills.length ? Math.round(matched / reqSkills.length * 100) : 0;
  });
  const avgMatch = matchedJobs.length ? Math.round(matchedJobs.reduce((a,b) => a+b, 0) / matchedJobs.length) : 0;
  const placementRate = students.length ? Math.round(students.filter(s => s.status === "Placed").length / students.length * 100) : 0;
  const shortlistRate = applications.length ? Math.round(applications.filter(a => ["Shortlisted","Interview"].includes(a.status)).length / applications.length * 100) : 0;
  const openJobs = jobs.length;
  const candidateCount = students.length;

  let analysis;
  if (role === "student") {
    const profileScore = Math.min(100, Math.round(55 + (student.skills?.length || 0) * 7 + (student.cgpa || 0) * 2));
    const score = Math.max(0, Math.min(100, Math.round((profileScore + avgMatch + Math.min(100, myApplications.length * 20)) / 3)));
    const missing = [...new Set(jobs.flatMap(j => j.skills || []))].filter(skill => !(student.skills || []).some(s => s.toLowerCase() === skill.toLowerCase())).slice(0,4);
    analysis = {
      score,
      headline:`${first}'s placement readiness is ${score >= 80 ? "strong" : score >= 65 ? "developing" : "early-stage"}`,
      metrics:[{label:"Profile readiness",value:profileScore+"%"},{label:"Avg job match",value:avgMatch+"%"},{label:"Applications",value:String(myApplications.length)},{label:"Technical skills",value:String(student.skills?.length || 0)}],
      strengths:[`${student.skills?.length || 0} technical skills are available for matching`, `Average match across current jobs is ${avgMatch}%`, `${myApplications.length} application${myApplications.length===1?"":"s"} tracked in the system`],
      gaps:missing.length ? [`Missing high-value skills seen in current jobs: ${missing.join(", ")}`, "Add measurable project outcomes and evidence", "Keep resume and profile skills synchronized"] : ["Add measurable project outcomes and evidence", "Keep resume and profile skills synchronized", "Build interview-ready examples for target roles"],
      actions:["Run AI Match before every application", `Improve the ${Math.max(0,100-avgMatch)}% average skill gap`, "Add 2–3 quantified project achievements", "Track interview outcomes after every application"]
    };
  } else if (role === "recruiter") {
    const score = Math.max(0, Math.min(100, Math.round(55 + Math.min(25, openJobs * 5) + Math.min(20, candidateCount * 4))));
    analysis = {
      score,
      headline:"Your hiring workspace is ready for focused screening",
      metrics:[{label:"Open jobs",value:String(openJobs)},{label:"Candidates",value:String(candidateCount)},{label:"Shortlist rate",value:shortlistRate+"%"},{label:"Tracked applications",value:String(applications.length)}],
      strengths:[`${openJobs} active opportunities are available`, `${candidateCount} candidate profiles can be screened`, `${shortlistRate}% of tracked applications are shortlisted/interview-stage`],
      gaps:["Separate must-have from nice-to-have skills", "Use structured screening criteria", "Track conversion from shortlist to interview"],
      actions:["Define 5–8 core skills per role", "Use AI Match before shortlisting", "Review pipeline outcomes after every drive", "Close stale roles and keep deadlines current"]
    };
  } else {
    const score = Math.max(0, Math.min(100, Math.round(60 + placementRate * 0.25 + shortlistRate * 0.15 + Math.min(15, candidateCount * 2))));
    analysis = {
      score,
      headline:"Your placement cell has a strong coordination layer",
      metrics:[{label:"Students",value:String(candidateCount)},{label:"Open jobs",value:String(openJobs)},{label:"Placement rate",value:placementRate+"%"},{label:"Shortlist rate",value:shortlistRate+"%"}],
      strengths:["Student, recruiter and opportunity workflows are centralized", `${placementRate}% of demo students are currently marked placed`, `${shortlistRate}% of tracked applications are at shortlist/interview stage`],
      gaps:["Increase student profile completeness", "Track skill gaps by target role", "Measure drive-level outcomes consistently"],
      actions:["Run weekly readiness reviews", "Create skill-gap interventions with mentors", "Track shortlist, interview and placement conversion", "Use AI insights to identify students needing support"]
    };
  }
  res.json({analysis, mode:"PlaceSmart AI local heuristic analyzer", generatedAt:new Date().toISOString()});
});


app.post("/api/ai/resume-parse", auth, (req,res) => {
  const text = String(req.body.text || "").slice(0, 30000);
  if (!text.trim()) return res.status(400).json({message:"Resume text is required."});
  const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || "";
  const phone = text.match(/(?:\+91[-\s]?)?[6-9]\d{9}/)?.[0] || "";
  const known = ["Python","Java","SQL","C++","JavaScript","React","Node.js","Spring Boot","AWS","Azure","Docker","Kubernetes","Git","GitHub","Spark","PySpark","Power BI","Tableau","Excel","Machine Learning","Deep Learning","NLP","TensorFlow","PyTorch","HTML","CSS","DSA","Communication","Leadership"];
  const lower = text.toLowerCase();
  const skills = known.filter(x => lower.includes(x.toLowerCase()));
  const lines = text.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
  const name = lines.find(x => !x.includes("@") && !/^\+?\d/.test(x) && x.length >= 3 && x.length < 60) || "Not detected";
  const education = lines.filter(x => /(b\.tech|btech|b\.e|computer science|engineering|university|college|degree|cgpa|education)/i.test(x)).slice(0,5);
  const projects = lines.filter(x => /(project|intern|experience|developed|built|engineered)/i.test(x)).slice(0,6);
  const confidence = Math.min(98, Math.max(45, 45 + (email?10:0) + (phone?10:0) + Math.min(20,skills.length*2) + Math.min(13,education.length*3)));
  res.json({parsed:{name,email,phone,skills,education,projects,confidence}});
});

const interviewBank = {
  technical:["Explain a project where you had to debug a difficult technical issue.","How would you design a scalable data pipeline for a growing application?","What is the difference between a process and a thread?"],
  behavioral:["Tell me about a time you disagreed with a teammate. What did you do?","Describe a situation where you had to learn a new technology quickly.","Tell me about a failure and what you changed afterward."],
  hr:["Why should we hire you for this role?","Where do you want to grow over the next two years?","How do you prioritize when several deadlines arrive together?"],
  data:["How would you validate the quality of a data pipeline?","Explain an ETL or ELT project you have worked on.","How would you investigate a sudden drop in a business KPI?"]
};
app.post("/api/ai/interview-coach", auth, (req,res) => {
  const topic = interviewBank[req.body.topic] ? req.body.topic : "technical";
  const answer = String(req.body.answer || "").trim();
  const question = interviewBank[topic][Math.floor(Math.random()*interviewBank[topic].length)];
  if (!answer) return res.json({question,feedback:null});
  const words = answer.split(/\s+/).filter(Boolean).length;
  const evidence = /(built|created|implemented|improved|reduced|increased|measured|learned|result)/i.test(answer);
  const structure = /(situation|task|action|result|because|therefore|first|then|finally)/i.test(answer);
  const score = Math.min(96, 45 + Math.min(25, Math.round(words/6)) + (evidence?15:0) + (structure?11:0));
  const improvements=[];
  if(words<50) improvements.push("Give a more complete answer with context, action and result.");
  if(!evidence) improvements.push("Add concrete evidence such as metrics, tools, scale or outcome.");
  if(!structure) improvements.push("Use a clear Situation → Action → Result structure.");
  if(!improvements.length) improvements.push("Keep the structure concise and connect the example directly to the role.");
  res.json({question,feedback:{score,summary:`Your answer has ${words} words. The coach detected ${evidence?"concrete evidence":"limited concrete evidence"} and ${structure?"a structured flow":"an unstructured flow"}.`,improvements}});
});

const roleSkills = {
  "data engineer":["Python","SQL","Spark","ETL","Git","Cloud"],
  "software engineer":["Java","Python","DSA","Git","SQL","REST APIs"],
  "data analyst":["SQL","Python","Excel","Power BI","Statistics","Communication"],
  "frontend developer":["JavaScript","React","HTML","CSS","Git"],
  "backend developer":["Java","Spring Boot","SQL","REST APIs","Git","Docker"]
};
app.post("/api/ai/skill-gap", auth, (req,res) => {
  const skills = (req.body.skills||[]).map(x=>String(x).toLowerCase().trim());
  const key = String(req.body.targetRole||"data engineer").toLowerCase();
  const required = roleSkills[key] || roleSkills[Object.keys(roleSkills).find(k=>key.includes(k))] || roleSkills["data engineer"];
  const matched = required.filter(x=>skills.includes(x.toLowerCase()));
  const missing = required.filter(x=>!skills.includes(x.toLowerCase()));
  res.json({targetRole:req.body.targetRole,matched,missing,readiness:Math.round(matched.length/required.length*100)});
});

app.post("/api/ai/eligibility", auth, (req,res) => {
  const job=req.body.job||{}; const skills=(req.body.studentSkills||[]).map(x=>String(x).toLowerCase()); const required=(job.skills||[]).map(x=>String(x));
  const matched=required.filter(x=>skills.includes(x.toLowerCase())); const skillPct=required.length?Math.round(matched.length/required.length*100):100;
  const cgpa=Number(req.body.studentCgpa||0); const eligibility=String(job.eligibility||""); const cgpaReq=Number(eligibility.match(/cgpa\s*([0-9.]+)/i)?.[1]||0); const cgpaOk=!cgpaReq||cgpa>=cgpaReq;
  const branchReq=/cse|it/i.test(eligibility); const branchOk=!branchReq||/cse|it/i.test(String(req.body.branch||"cse"));
  const eligible=cgpaOk&&branchOk&&skillPct>=50;
  res.json({eligible,match:skillPct,summary:eligible?"The profile meets the available rule checks.":"One or more rule checks need attention before applying.",checks:[`Skill match: ${skillPct}% (${matched.length}/${required.length})`,`CGPA: ${cgpaOk?"meets":"below"} the stated threshold${cgpaReq?` (${cgpaReq})`:""}`,`Branch requirement: ${branchOk?"compatible":"needs review"}`]});
});

app.post("/api/ai/candidate-match", auth, roles("recruiter","coordinator"), (req,res) => {
  const skills=(req.body.studentSkills||[]).map(x=>String(x).toLowerCase()); const required=(req.body.requiredSkills||[]).map(x=>String(x).toLowerCase()); const matched=required.filter(x=>skills.includes(x));
  res.json({percentage:required.length?Math.round(matched.length/required.length*100):0,matched,missing:required.filter(x=>!skills.includes(x))});
});

app.post("/api/ai/chat", auth, (req,res) => {
  const q = String(req.body.message || "").toLowerCase();
  const role = req.user.role;
  let reply;
  if (q.includes("resume") || q.includes("profile")) reply = role === "student" ? "Keep your resume aligned with the role: lead with relevant skills, quantify projects, add GitHub/LinkedIn links and remove unrelated details. PlaceSmart can then use the profile for matching." : "Use structured profile fields and role-specific evidence so screening stays consistent across candidates.";
  else if (q.includes("match") || q.includes("skill")) reply = "PlaceSmart compares the skills available in a profile with the skills required by an opportunity. Use the match signal to identify missing skills before applying or shortlisting.";
  else if (q.includes("job") || q.includes("opportun")) reply = role === "recruiter" ? "Create a job with clear location, eligibility, compensation, openings and 5–8 focused skills. Clear requirements improve candidate discovery." : "Open Job Opportunities to search active roles. Compare the skill-match signal, eligibility and deadline before applying.";
  else if (q.includes("placement") || q.includes("readiness")) reply = "A practical readiness loop is: complete profile → identify skill gaps → improve evidence/projects → apply to matched roles → track interview outcomes.";
  else if (q.includes("candidate") || q.includes("hire")) reply = "For candidate screening, separate must-have skills from nice-to-have skills, then use the match signal as one input alongside eligibility and application evidence.";
  else reply = `I can help with ${role === "student" ? "profiles, resumes, skill gaps, job matching and applications" : role === "recruiter" ? "job requirements, candidate matching and hiring workflow" : "student readiness, drives, skill gaps and placement analytics"}. Try asking one of those.`;
  res.json({reply, mode:"PlaceSmart AI assistant"});
});

app.post("/api/ai/match", auth, (req,res) => {
  const student = new Set((req.body.studentSkills || []).map(x=>String(x).toLowerCase().trim()));
  const required = [...new Set((req.body.requiredSkills || []).map(x=>String(x).toLowerCase().trim()).filter(Boolean))];
  const matched = required.filter(x=>student.has(x));
  const missing = required.filter(x=>!student.has(x));
  const percentage = required.length ? Math.round(matched.length / required.length * 100) : 0;
  res.json({ percentage, matched, missing, mode:"rule-based AI assistance" });
});

app.use((err,_req,res,_next) => { console.error(err); res.status(500).json({message:"Internal server error"}); });
app.listen(PORT, () => console.log(`PlaceSmart API running on port ${PORT}`));
