import { useEffect, useState } from "react";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import StudentDashboard from "./pages/StudentDashboard";
import RecruiterDashboard from "./pages/RecruiterDashboard";
import CoordinatorDashboard from "./pages/CoordinatorDashboard";
import { api, clearToken, getToken } from "./services/api";

export default function App(){
  const [user,setUser]=useState(null);
  const [loginRole,setLoginRole]=useState(null);
  const [checking,setChecking]=useState(true);

  useEffect(()=>{
    const boot=async()=>{
      if(!getToken()){ setChecking(false); return; }
      try{ const result=await api.me(); setUser(result.user); }
      catch{ clearToken(); }
      finally{ setChecking(false); }
    };
    boot();
    const forceLogout=()=>{clearToken();setUser(null);setLoginRole(null);};
    window.addEventListener("placesmart:logout",forceLogout);
    return()=>window.removeEventListener("placesmart:logout",forceLogout);
  },[]);

  const logout=async()=>{ try{await api.logout();}catch{} clearToken(); setUser(null); setLoginRole(null); };
  if(checking) return <div className="min-h-screen grid place-items-center bg-[#f7f9fc]"><div className="text-center"><div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600"/><p className="mt-4 text-sm font-bold text-slate-500">Loading PlaceSmart…</p></div></div>;
  if(user?.role === "student") return <StudentDashboard user={user} onHome={logout}/>;
  if(user?.role === "recruiter") return <RecruiterDashboard user={user} onHome={logout}/>;
  if(user?.role === "coordinator") return <CoordinatorDashboard user={user} onHome={logout}/>;
  if(loginRole) return <Login role={loginRole} onBack={()=>setLoginRole(null)} onLogin={setUser}/>;
  return <Landing onRole={setLoginRole}/>;
}
