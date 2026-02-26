"use client";

import { useState, useEffect } from "react";
import { Plus, Trophy, Clock, Tag, Building2, User as UserIcon, CheckCircle, ExternalLink, Filter, Wallet, FileText, Send, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { useTheme } from "@/context/ThemeContext";

export default function BountyBoardPage() {
  const { theme } = useTheme();
  const isWhite = theme === "white";
  const [bounties, setBounties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPostModal, setShowPostModal] = useState(false);
  const [showSolveModal, setShowSolveModal] = useState(null);
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState("Open");
  const [newBounty, setNewBounty] = useState({
    title: "",
    description: "",
    rewardAmount: 50,
    department: "",
    subject: "",
    attachmentUrl: ""
  });
  const [solving, setSolving] = useState(false);
  const [solutionText, setSolutionText] = useState("");
  const [solutionUrl, setSolutionUrl] = useState("");

  const headingText = isWhite ? "text-neutral-900" : "text-white";
  const bodyText = isWhite ? "text-neutral-600" : "text-neutral-300";
  const mutedText = isWhite ? "text-neutral-400" : "text-neutral-500";
  const cardBg = isWhite ? "bg-white border-neutral-200" : "bg-[var(--card-bg)] border-[var(--card-border)]";

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));
    fetchBounties();
  }, [filter]);

  const fetchBounties = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/bounty?status=${filter}`);
      const data = await res.json();
      if (res.ok) setBounties(data.bounties);
      else toast.error(data.error);
    } catch {
      toast.error("Failed to load bounties");
    } finally {
      setLoading(false);
    }
  };

  const handlePostBounty = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return toast.error("Please login to post");

    try {
      const res = await fetch("/api/bounty", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(newBounty)
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Bounty posted!");
        setShowPostModal(false);
        fetchBounties();
        // Update local user points (approximate)
        if (user) {
           const updatedUser = { ...user, points: user.points - newBounty.rewardAmount };
           setUser(updatedUser);
           localStorage.setItem("user", JSON.stringify(updatedUser));
        }
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error("Failed to post bounty");
    }
  };

  const handleSolveBounty = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return toast.error("Please login to solve");

    setSolving(true);
    try {
      const res = await fetch(`/api/bounty/${showSolveModal._id}/claim`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ solutionText, solutionUrl })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Solution submitted and bounty claimed!");
        setShowSolveModal(null);
        fetchBounties();
        // Update local points
        if (user) {
            const updatedUser = { ...user, points: user.points + showSolveModal.rewardAmount };
            setUser(updatedUser);
            localStorage.setItem("user", JSON.stringify(updatedUser));
        }
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error("Failed to submit solution");
    } finally {
      setSolving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className={`text-3xl font-extrabold flex items-center gap-3 ${headingText}`}>
            <Trophy className="h-8 w-8 text-amber-500" /> Bounty Board
          </h1>
          <p className={`mt-1 text-sm ${mutedText}`}>Solve tough questions, earn real Nova Points</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className={`px-4 py-2 rounded-xl flex items-center gap-2 border ${isWhite ? "bg-neutral-50 border-neutral-200" : "bg-white/5 border-white/10"}`}>
            <Wallet className="h-4 w-4 text-cyan-400" />
            <span className={`text-xs font-bold ${headingText}`}>{user?.points || 0} Points</span>
          </div>
          <button 
            onClick={() => setShowPostModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl btn-gradient text-white text-sm font-bold shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
          >
            <Plus className="h-4 w-4" /> Post Question
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none">
        {["Open", "Solved"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
              filter === s 
                ? "bg-cyan-500 text-white shadow-md shadow-cyan-500/20" 
                : isWhite ? "bg-white text-neutral-500 border border-neutral-200 hover:border-neutral-300" : "bg-white/5 text-neutral-400 border border-white/10 hover:border-white/20"
            }`}
          >
            {s} Bounties
          </button>
        ))}
      </div>

      {/* Main Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className={`h-64 rounded-2xl animate-pulse ${isWhite ? "bg-neutral-100" : "bg-white/5"}`} />
          ))}
        </div>
      ) : bounties.length === 0 ? (
        <div className={`text-center py-20 rounded-3xl border-2 border-dashed ${isWhite ? "border-neutral-200" : "border-white/5"}`}>
          <AlertCircle className={`h-12 w-12 mx-auto mb-4 ${mutedText}`} />
          <h3 className={`text-lg font-bold ${headingText}`}>No {filter} Bounties Found</h3>
          <p className={`text-sm mt-1 max-w-xs mx-auto ${mutedText}`}>Be the first to post a tough question and set a reward!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bounties.map((b) => (
            <div key={b._id} className={`group relative flex flex-col rounded-2xl p-6 border transition-all hover:scale-[1.02] ${cardBg}`}>
              <div className="flex justify-between items-start mb-4">
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${isWhite ? "bg-neutral-100 text-neutral-600" : "bg-white/10 text-neutral-400"}`}>
                  {b.department || "General"}
                </span>
                <div className="flex items-center gap-1.5 text-amber-500">
                  <Trophy className="h-4 w-4" />
                  <span className="text-sm font-bold">{b.rewardAmount}</span>
                </div>
              </div>

              <h3 className={`text-lg font-bold mb-2 line-clamp-1 ${headingText}`}>{b.title}</h3>
              <p className={`text-sm mb-6 line-clamp-3 flex-grow ${bodyText}`}>{b.description}</p>

              <div className="flex items-center gap-3 mb-6">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${isWhite ? "bg-neutral-100 text-neutral-600" : "bg-white/10 text-white"}`}>
                  {b.postedBy?.name?.[0] || "?"}
                </div>
                <div className="min-w-0">
                  <p className={`text-xs font-bold truncate ${headingText}`}>{b.postedBy?.name}</p>
                  <p className={`text-[10px] truncate ${mutedText}`}>{b.postedBy?.college}</p>
                </div>
              </div>

              {b.status === "Open" ? (
                <button 
                  onClick={() => setShowSolveModal(b)}
                  className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white text-xs font-bold shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" /> Solve & Claim
                </button>
              ) : (
                <div className={`w-full py-3 rounded-xl flex items-center justify-center gap-2 border ${isWhite ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"}`}>
                  <CheckCircle className="h-4 w-4" /> Solved
                </div>
              )}
              
              {b.attachmentUrl && (
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                   <a href={b.attachmentUrl} target="_blank" className={`p-2 rounded-lg ${isWhite ? "bg-white shadow-md text-cyan-600" : "bg-black/50 text-cyan-400"}`}>
                      <FileText className="h-4 w-4" />
                   </a>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Post Modal */}
      {showPostModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className={`w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden ${isWhite ? "bg-white" : "bg-[#0a0a0a] border border-white/10"}`}>
            <div className={`px-6 py-4 border-b flex justify-between items-center ${isWhite ? "bg-neutral-50" : "bg-white/5"}`}>
              <h3 className={`font-bold ${headingText}`}>Post a New Bounty</h3>
              <button onClick={() => setShowPostModal(false)} className={mutedText}>&times;</button>
            </div>
            <form onSubmit={handlePostBounty} className="p-6 space-y-4">
              <div>
                <label className={`text-xs font-bold mb-1.5 block ${mutedText}`}>Question Title</label>
                <input 
                  required
                  placeholder="e.g. Tough Discrete Math Question from 2023"
                  className={`w-full p-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-cyan-500/20 ${isWhite ? "bg-neutral-50 border-neutral-200" : "bg-white/5 border-white/10 text-white"}`}
                  value={newBounty.title}
                  onChange={e => setNewBounty({...newBounty, title: e.target.value})}
                />
              </div>
              <div>
                <label className={`text-xs font-bold mb-1.5 block ${mutedText}`}>Description / Question Text</label>
                <textarea 
                  required
                  rows={4}
                  placeholder="Describe the problem in detail..."
                  className={`w-full p-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-cyan-500/20 resize-none ${isWhite ? "bg-neutral-50 border-neutral-200" : "bg-white/5 border-white/10 text-white"}`}
                  value={newBounty.description}
                  onChange={e => setNewBounty({...newBounty, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`text-xs font-bold mb-1.5 block ${mutedText}`}>Reward Amount (Points)</label>
                  <input 
                    type="number"
                    required
                    min={10}
                    className={`w-full p-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-cyan-500/20 ${isWhite ? "bg-neutral-50 border-neutral-200" : "bg-white/5 border-white/10 text-white"}`}
                    value={newBounty.rewardAmount}
                    onChange={e => setNewBounty({...newBounty, rewardAmount: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <label className={`text-xs font-bold mb-1.5 block ${mutedText}`}>Department</label>
                  <input 
                    placeholder="e.g. CSE"
                    className={`w-full p-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-cyan-500/20 ${isWhite ? "bg-neutral-50 border-neutral-200" : "bg-white/5 border-white/10 text-white"}`}
                    value={newBounty.department}
                    onChange={e => setNewBounty({...newBounty, department: e.target.value})}
                  />
                </div>
              </div>
              <button type="submit" className="w-full py-3.5 rounded-xl btn-gradient text-white font-bold shadow-lg shadow-cyan-500/20">
                Post Bounty for {newBounty.rewardAmount} Points
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Solve Modal */}
      {showSolveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className={`w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden ${isWhite ? "bg-white" : "bg-[#0a0a0a] border border-white/10"}`}>
            <div className={`px-6 py-4 border-b flex justify-between items-center ${isWhite ? "bg-neutral-50" : "bg-white/5"}`}>
              <h3 className={`font-bold ${headingText}`}>Submit Solution</h3>
              <button onClick={() => setShowSolveModal(null)} className={mutedText}>&times;</button>
            </div>
            <div className="p-6 space-y-6">
              <div className={`p-4 rounded-xl border ${isWhite ? "bg-neutral-50 border-neutral-200" : "bg-white/5 border-white/10"}`}>
                <h4 className={`text-sm font-bold mb-1 ${headingText}`}>{showSolveModal.title}</h4>
                <p className={`text-xs line-clamp-2 ${bodyText}`}>{showSolveModal.description}</p>
                <div className="flex items-center gap-1.5 mt-2 text-amber-500 font-bold text-xs">
                   <Trophy className="h-3 w-3" /> Reward: {showSolveModal.rewardAmount} Points
                </div>
              </div>

              <form onSubmit={handleSolveBounty} className="space-y-4">
                <div>
                  <label className={`text-xs font-bold mb-1.5 block ${mutedText}`}>Your Solution (Text or Link)</label>
                  <textarea 
                    required
                    rows={5}
                    placeholder="Explain the solution step-by-step..."
                    className={`w-full p-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-cyan-500/20 resize-none ${isWhite ? "bg-neutral-50 border-neutral-200" : "bg-white/5 border-white/10 text-white"}`}
                    value={solutionText}
                    onChange={e => setSolutionText(e.target.value)}
                  />
                </div>
                <div>
                  <label className={`text-xs font-bold mb-1.5 block ${mutedText}`}>Resource/Image Link (Optional)</label>
                  <input 
                    placeholder="https://cloudinary.com/..."
                    className={`w-full p-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-cyan-500/20 ${isWhite ? "bg-neutral-50 border-neutral-200" : "bg-white/5 border-white/10 text-white"}`}
                    value={solutionUrl}
                    onChange={e => setSolutionUrl(e.target.value)}
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={solving}
                  className="w-full py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white font-bold shadow-lg shadow-cyan-500/20 disabled:opacity-50"
                >
                  {solving ? "Submitting..." : `Claim ${showSolveModal.rewardAmount} Nova Points`}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
