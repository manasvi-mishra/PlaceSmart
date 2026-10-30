const API = import.meta.env.VITE_API_URL || "/api";

export function getToken(){ return localStorage.getItem("placesmart_token"); }
export function clearToken(){ localStorage.removeItem("placesmart_token"); localStorage.removeItem("placesmart_user"); }

async function request(path, options = {}) {
  const headers = { "Content-Type":"application/json", ...(options.headers || {}) };
  const token = getToken();
  if(token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${API}${path}`, { ...options, headers });
  let data = null;
  try { data = await response.json(); } catch {}
  if(response.status === 401){ clearToken(); window.dispatchEvent(new Event("placesmart:logout")); }
  if(!response.ok) throw new Error(data?.message || "Something went wrong");
  return data;
}

export const api = {
  login: (email,password) => request("/auth/login", {method:"POST",body:JSON.stringify({email,password})}),
  me: () => request("/auth/me"),
  logout: () => request("/auth/logout", {method:"POST"}),
  health: () => request("/health"),
  jobs: () => request("/jobs"),
  students: () => request("/students"),
  updateStudentStatus: (id,status) => request(`/students/${id}/status`, {method:"PATCH",body:JSON.stringify({status})}),
  applications: () => request("/applications"),
  createJob: (job) => request("/jobs", {method:"POST",body:JSON.stringify(job)}),
  deleteJob: (id) => request(`/jobs/${id}`, {method:"DELETE"}),
  apply: (jobId) => request("/applications", {method:"POST",body:JSON.stringify({jobId})}),
  updateApplication: (id,status) => request(`/applications/${id}`, {method:"PATCH",body:JSON.stringify({status})}),
  createNotice: (notice) => request("/notices", {method:"POST",body:JSON.stringify(notice)}),
  notices: () => request("/notices"),
  match: (studentSkills,requiredSkills) => request("/ai/match", {method:"POST",body:JSON.stringify({studentSkills,requiredSkills})}),
  analyze: (role,name) => request("/ai/analyze", {method:"POST",body:JSON.stringify({role,name})}),
  chat: (message,role,name) => request("/ai/chat", {method:"POST",body:JSON.stringify({message,role,name})}),
  parseResume: (text) => request("/ai/resume-parse", {method:"POST",body:JSON.stringify({text})}),
  interviewCoach: (payload) => request("/ai/interview-coach", {method:"POST",body:JSON.stringify(payload)}),
  skillGap: (skills,targetRole,role) => request("/ai/skill-gap", {method:"POST",body:JSON.stringify({skills,targetRole,role})}),
  eligibility: (payload) => request("/ai/eligibility", {method:"POST",body:JSON.stringify(payload)}),
  candidateMatch: (studentSkills,requiredSkills) => request("/ai/candidate-match", {method:"POST",body:JSON.stringify({studentSkills,requiredSkills})})
};
