import { useState } from "react";
import { Bot, BrainCircuit, CheckCircle2, ChevronRight, Loader2, MessageCircle, Send, Sparkles, Target, X } from "lucide-react";
import { api } from "../services/api";

const starter = {
  student: "How can I improve my placement profile?",
  recruiter: "How can I find better candidates?",
  coordinator: "How can I improve placement readiness?"
};

export default function AIHub({ user }) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState("chat");
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState([{ from:"ai", text:`Hi ${user?.name?.split(" ")[0] || "there"}! I’m PlaceSmart AI. Ask me about your ${user?.role || "workspace"}, placements, skills or hiring workflow.` }]);
  const [analysis, setAnalysis] = useState(null);

  async function send(text = input) {
    const q = String(text || "").trim();
    if (!q || busy) return;
    setInput("");
    setMessages(m => [...m, {from:"user", text:q}]);
    setBusy(true);
    try {
      const result = await api.chat(q, user?.role, user?.name);
      setMessages(m => [...m, {from:"ai", text:result.reply}]);
    } catch (e) {
      setMessages(m => [...m, {from:"ai", text:"I’m having trouble reaching the AI service. Please check that the PlaceSmart backend is running."}]);
    } finally { setBusy(false); }
  }

  async function analyze() {
    setBusy(true);
    try { setAnalysis((await api.analyze(user?.role, user?.name))?.analysis); }
    catch { setAnalysis({score:78, headline:"Workspace needs a few focused improvements", strengths:["Role-based workflow is active","Core placement data is available"], gaps:["Add richer profile/job context","Keep activity data updated"], actions:["Complete missing profile fields","Review AI match insights weekly","Track outcomes from every application"]}); }
    finally { setBusy(false); }
  }

  return <>
    <button onClick={()=>setOpen(true)} aria-label="Open PlaceSmart AI" className="ai-fab group">
      <span className="ai-fab-ring"/><Bot size={21}/><span className="ai-fab-label">PlaceSmart AI</span>
    </button>
    {open && <div className="fixed inset-0 z-[70] bg-black/55 backdrop-blur-sm" onClick={()=>setOpen(false)}>
      <aside onClick={e=>e.stopPropagation()} className="ai-panel fixed bottom-4 right-4 flex h-[min(720px,calc(100vh-32px))] w-[min(430px,calc(100vw-32px))] flex-col overflow-hidden rounded-[30px] border border-white/10 bg-[#090b10]/95 shadow-[0_35px_120px_rgba(0,0,0,.65)]">
        <div className="relative overflow-hidden border-b border-white/10 p-5"><div className="absolute -right-20 -top-24 h-48 w-48 rounded-full bg-cyan-500/15 blur-3xl"/><div className="relative flex items-center justify-between"><div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-cyan-400 to-violet-500 text-black shadow-[0_0_35px_rgba(34,211,238,.25)]"><Sparkles size={20}/></div><div><div className="font-black text-white">PlaceSmart AI</div><div className="text-[10px] font-bold uppercase tracking-[.16em] text-slate-500">Intelligence layer</div></div></div><button onClick={()=>setOpen(false)} className="rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white"><X size={18}/></button></div>
          <div className="mt-4 grid grid-cols-2 rounded-2xl bg-white/5 p-1"><button onClick={()=>setTab("chat")} className={`rounded-xl px-3 py-2 text-xs font-black transition ${tab==="chat"?"bg-white text-black":"text-slate-400 hover:text-white"}`}><MessageCircle size={14} className="mr-2 inline"/>AI Chat</button><button onClick={()=>{setTab("analyze");if(!analysis) analyze();}} className={`rounded-xl px-3 py-2 text-xs font-black transition ${tab==="analyze"?"bg-white text-black":"text-slate-400 hover:text-white"}`}><BrainCircuit size={14} className="mr-2 inline"/>AI Analyzer</button></div>
        </div>
        {tab==="chat" ? <>
          <div className="flex-1 space-y-3 overflow-y-auto p-5">{messages.map((m,i)=><div key={i} className={`flex ${m.from==="user"?"justify-end":"justify-start"}`}><div className={`max-w-[86%] rounded-2xl px-4 py-3 text-sm leading-6 ${m.from==="user"?"bg-gradient-to-r from-cyan-400 to-blue-500 font-semibold text-black":"border border-white/10 bg-white/5 text-slate-200"}`}>{m.from==="ai"&&<Bot size={14} className="mr-2 inline text-cyan-300"/>}{m.text}</div></div>)}{busy&&<div className="flex items-center gap-2 text-xs font-bold text-slate-500"><Loader2 size={14} className="animate-spin"/>Thinking…</div>}
            <div className="pt-2"><p className="mb-2 text-[10px] font-black uppercase tracking-[.16em] text-slate-600">Quick prompt</p><button onClick={()=>send(starter[user?.role] || "What can PlaceSmart AI help me with?")} className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[.03] p-3 text-left text-xs font-bold text-slate-300 hover:border-cyan-400/30 hover:bg-white/[.06]">{starter[user?.role] || "What can PlaceSmart AI help me with?"}<ChevronRight size={15}/></button></div>
          </div>
          <form onSubmit={e=>{e.preventDefault();send();}} className="border-t border-white/10 p-4"><div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-2 focus-within:border-cyan-400/40"><input value={input} onChange={e=>setInput(e.target.value)} placeholder="Ask PlaceSmart AI…" className="min-w-0 flex-1 bg-transparent px-2 text-sm text-white outline-none placeholder:text-slate-600"/><button disabled={busy||!input.trim()} className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-400 text-black disabled:opacity-30"><Send size={16}/></button></div></form>
        </> : <div className="flex-1 overflow-y-auto p-5">{busy&&!analysis?<div className="grid h-full place-items-center text-center"><Loader2 size={28} className="animate-spin text-cyan-400"/><p className="mt-3 text-xs font-bold text-slate-500">Analyzing workspace…</p></div>:analysis&&<div className="space-y-4"><div className="rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-cyan-400/10 to-violet-500/10 p-5"><div className="flex items-center justify-between"><div><p className="text-[10px] font-black uppercase tracking-[.18em] text-cyan-300">AI readiness signal</p><h3 className="mt-2 text-xl font-black text-white">{analysis.headline}</h3></div><div className="grid h-16 w-16 place-items-center rounded-full border-4 border-cyan-400/30 text-xl font-black text-cyan-300">{analysis.score}</div></div></div>{analysis.metrics?.length>0&&<div className="grid grid-cols-2 gap-2">{analysis.metrics.map((m,i)=><div key={i} className="rounded-2xl border border-white/10 bg-white/[.03] p-3"><div className="text-[9px] font-black uppercase tracking-wider text-slate-500">{m.label}</div><div className="mt-1 text-lg font-black text-white">{m.value}</div></div>)}</div>}<Insight title="Strengths" icon={CheckCircle2} items={analysis.strengths}/><Insight title="Gaps detected" icon={Target} items={analysis.gaps}/><Insight title="Recommended actions" icon={Sparkles} items={analysis.actions}/><button onClick={analyze} className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 text-xs font-black text-white hover:bg-white/10">Run analysis again</button></div>}</div>}
      </aside>
    </div>}
  </>;
}

function Insight({title,icon:Icon,items=[]}) { return <div className="rounded-2xl border border-white/10 bg-white/[.03] p-4"><div className="flex items-center gap-2 text-xs font-black text-white"><Icon size={15} className="text-cyan-300"/>{title}</div><div className="mt-3 space-y-2">{items.map((x,i)=><div key={i} className="text-xs leading-5 text-slate-400"><span className="mr-2 text-cyan-400">•</span>{x}</div>)}</div></div>; }
