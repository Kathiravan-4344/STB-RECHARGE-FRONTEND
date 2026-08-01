import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "../components/AppShell";
import {
  useStore,
  fileComplaint,
  rateComplaint,
  type Complaint,
  type ComplaintStatus,
} from "../services/store";
import {
  Wrench,
  Tv,
  Radio,
  Cable,
  CreditCard,
  CheckCircle2,
  Car,
  Phone,
  Star,
  Upload,
  Send,
  X,
  Sparkles,
  History,
} from "lucide-react";

const CATEGORY_ISSUES: Record<
  string,
  { label: string; icon: React.ElementType; issues: string[] }
> = {
  "TV Issues": {
    label: "📺 TV Issues",
    icon: Tv,
    issues: ["No Signal", "Channel Not Showing", "Picture Problem", "Audio Problem"],
  },
  "STB Issues": {
    label: "📡 STB Issues",
    icon: Radio,
    issues: [
      "STB Not Working",
      "STB Power Problem",
      "Remote Not Working",
      "STB Error Message",
      "Box Replacement Request",
    ],
  },
  "Cable Connection Issues": {
    label: "🔌 Cable Connection Issues",
    icon: Cable,
    issues: ["Cable Cut", "Poor Signal", "Connection Problem"],
  },
  "Recharge Issues": {
    label: "💳 Recharge Issues",
    icon: CreditCard,
    issues: ["Recharge Not Updated", "Payment Completed but Not Activated", "Plan Issue"],
  },
};

function StatusBadge({ status }: { status: ComplaintStatus }) {
  switch (status) {
    case "Pending":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400">
          <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" /> 🟡 Pending
        </span>
      );
    case "Assigned":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/40 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-400">
          <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" /> 🔵 Assigned
        </span>
      );
    case "In Progress":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-300">
          <Car className="h-3.5 w-3.5 animate-bounce text-amber-400" /> 🟠 In Progress
        </span>
      );
    case "Resolved":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
          <CheckCircle2 className="h-3.5 w-3.5" /> 🟢 Resolved
        </span>
      );
    default:
      return null;
  }
}

function ProgressTracker({ status }: { status: ComplaintStatus }) {
  const steps: { label: string; key: ComplaintStatus; color: string }[] = [
    { label: "🟡 Pending", key: "Pending", color: "bg-amber-400" },
    { label: "🔵 Assigned", key: "Assigned", color: "bg-blue-400" },
    { label: "🟠 In Progress", key: "In Progress", color: "bg-amber-500" },
    { label: "🟢 Resolved", key: "Resolved", color: "bg-emerald-400" },
  ];

  const currentIndex = steps.findIndex((s) => s.key === status);

  return (
    <div className="w-full space-y-2 py-2">
      <div className="grid grid-cols-4 gap-1">
        {steps.map((step, idx) => {
          const isActive = idx <= currentIndex;
          return (
            <div key={step.key} className="space-y-1">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  isActive ? step.color + " shadow-[0_0_10px_currentColor]" : "bg-white/10"
                }`}
              />
              <span
                className={`block text-[10px] text-center font-bold ${isActive ? "text-white" : "text-slate-500"}`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ComplaintsPage() {
  const user = useStore((s) => s.user);
  const stb = useStore((s) => s.stb);
  const complaints = useStore((s) => s.complaints);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate({ to: "/" });
  }, [user, navigate]);

  // Tab: "raise" | "tracking" | "history"
  const [activeTab, setActiveTab] = useState<"raise" | "tracking" | "history">("raise");

  // Form State
  const [stbIdInput, setStbIdInput] = useState<string>(stb?.id ?? "1234567890");
  const [nameInput, setNameInput] = useState<string>(user?.name || stb?.customerName || "");
  const [mobileInput, setMobileInput] = useState<string>(user?.mobile || "9876543210");

  const [selectedCategory, setSelectedCategory] = useState<string>("TV Issues");
  const [selectedIssueType, setSelectedIssueType] = useState<string>("No Signal");
  const [description, setDescription] = useState<string>("");
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [preferredTime, setPreferredTime] = useState<string>("Immediate Emergency");

  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Rating Modal State for Resolved Complaints
  const [ratingComplaint, setRatingComplaint] = useState<Complaint | null>(null);
  const [starVal, setStarVal] = useState<number>(5);
  const [feedbackVal, setFeedbackVal] = useState<string>("");

  // Filter complaints by user mobile / STB ID
  const userComplaints = complaints.filter(
    (c) =>
      (user?.mobile && c.customerMobile === user.mobile) ||
      (stb?.id && c.stbId === stb.id) ||
      c.customerMobile === mobileInput,
  );

  const activeTrackingComplaints = userComplaints.filter((c) => c.status !== "Resolved");
  const resolvedComplaints = userComplaints.filter((c) => c.status === "Resolved");

  // Update selected issue type if category changes
  function handleCategoryChange(cat: string) {
    setSelectedCategory(cat);
    const available = CATEGORY_ISSUES[cat]?.issues || [];
    if (available.length > 0) {
      setSelectedIssueType(available[0]);
    }
  }

  function handleMediaUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stbIdInput.trim() || !nameInput.trim() || !mobileInput.trim()) {
      alert("Please fill in required fields.");
      return;
    }

    fileComplaint({
      category: selectedCategory,
      issueType: selectedIssueType,
      description: description.trim(),
      mediaUrl: mediaPreview || undefined,
      preferredTime,
    });

    setSuccessMsg(`Complaint submitted successfully! Operator notified.`);
    setDescription("");
    setMediaPreview(null);

    setTimeout(() => {
      setActiveTab("tracking");
    }, 1200);
  }

  function handleSaveRating(e: React.FormEvent) {
    e.preventDefault();
    if (!ratingComplaint) return;
    rateComplaint(ratingComplaint.id, starVal, feedbackVal.trim());
    setRatingComplaint(null);
    setFeedbackVal("");
    alert("Thank you for your rating & feedback!");
  }

  return (
    <AppShell>
      {/* Top Banner Header */}
      <section className="rounded-3xl glass-strong p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/10 px-3.5 py-1 text-xs font-extrabold uppercase tracking-widest text-amber-400">
              <Wrench className="h-3.5 w-3.5" /> STB RECHARGE Service Center
            </div>
            <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              🛠️ Complaint & Service Management
            </h1>
            <p className="mt-1.5 text-sm text-slate-300 max-w-xl">
              Report signal breakdown, STB power errors, cable damage, or payment issues. Track
              technician arrival live and rate completed services.
            </p>
          </div>

          {/* Navigation Pill Tabs */}
          <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-1.5 self-start md:self-auto">
            <button
              onClick={() => setActiveTab("raise")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                activeTab === "raise"
                  ? "bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.4)]"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              <Wrench className="h-4 w-4" /> Raise Complaint
            </button>
            <button
              onClick={() => setActiveTab("tracking")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                activeTab === "tracking"
                  ? "bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.4)]"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              <Car className="h-4 w-4" /> Live Tracking ({activeTrackingComplaints.length})
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                activeTab === "history"
                  ? "bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.4)]"
                  : "text-muted-foreground hover:text-white"
              }`}
            >
              <History className="h-4 w-4" /> History ({resolvedComplaints.length})
            </button>
          </div>
        </div>
      </section>

      {/* Success Notification Alert */}
      {successMsg && (
        <div className="mt-6 flex items-center justify-between gap-4 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-emerald-300">
          <div className="flex items-center gap-3 text-sm font-semibold">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button
            onClick={() => setSuccessMsg(null)}
            className="rounded-lg p-1 hover:bg-emerald-500/20"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* TAB 1: Raise Complaint Form */}
      {activeTab === "raise" && (
        <div className="mt-8 grid gap-8 lg:grid-cols-12">
          {/* Category & Issue Type Selection Grid (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-400" /> Select Issue Category & Issue Type
            </h2>

            {/* 4 Category selector cards */}
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(CATEGORY_ISSUES).map(([catKey, catObj]) => {
                const IconComp = catObj.icon;
                const isSelected = selectedCategory === catKey;
                return (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => handleCategoryChange(catKey)}
                    className={`rounded-2xl border p-4 text-left transition-all ${
                      isSelected
                        ? "border-amber-400 bg-amber-500/15 shadow-[0_0_20px_rgba(245,158,11,0.25)]"
                        : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="rounded-xl border border-white/10 bg-white/10 p-2 text-amber-400">
                        <IconComp className="h-5 w-5" />
                      </span>
                      {isSelected && (
                        <span className="text-xs font-extrabold text-amber-400">Selected ✓</span>
                      )}
                    </div>
                    <div className="mt-3 font-display text-base font-bold text-white">
                      {catObj.label}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {catObj.issues.length} Issue Types
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Issue Types selection pills */}
            <div className="rounded-3xl glass-strong border border-white/15 p-6 space-y-3">
              <h3 className="font-display text-base font-bold text-white">
                Specific {selectedCategory} Issue:
              </h3>
              <div className="flex flex-wrap gap-2">
                {CATEGORY_ISSUES[selectedCategory]?.issues.map((issue) => {
                  const isChosen = selectedIssueType === issue;
                  return (
                    <button
                      key={issue}
                      type="button"
                      onClick={() => setSelectedIssueType(issue)}
                      className={`rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                        isChosen
                          ? "bg-amber-400 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                          : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/15"
                      }`}
                    >
                      {issue}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Complaint Submission Form (5 cols) */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 rounded-3xl glass-strong border border-white/15 p-6 shadow-2xl space-y-4">
              <div className="border-b border-white/10 pb-3">
                <h3 className="font-display text-xl font-bold text-white">
                  📝 Complaint Submission Form
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Submit to local operator for technician dispatch
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {/* 1. STB ID */}
                <div>
                  <label className="block font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    STB ID (Auto Fetched)
                  </label>
                  <input
                    type="text"
                    required
                    value={stbIdInput}
                    onChange={(e) => setStbIdInput(e.target.value.replace(/\D/g, "").slice(0, 12))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-sm font-bold text-white outline-none focus:border-amber-400"
                  />
                </div>

                {/* 2. Customer Name */}
                <div>
                  <label className="block font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Customer Name
                  </label>
                  <input
                    type="text"
                    required
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-sm font-bold text-white outline-none focus:border-amber-400"
                  />
                </div>

                {/* 3. Mobile Number */}
                <div>
                  <label className="block font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Mobile Number
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={mobileInput}
                    onChange={(e) => setMobileInput(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 p-2.5 text-sm font-bold text-white outline-none focus:border-amber-400"
                  />
                </div>

                {/* 4. Category & Issue Summary */}
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-slate-200">
                  <div className="text-[10px] uppercase font-bold text-amber-400">
                    Selected Complaint
                  </div>
                  <strong className="text-white text-sm block mt-0.5">
                    {selectedCategory} → {selectedIssueType}
                  </strong>
                </div>

                {/* 5. Description */}
                <div>
                  <label className="block font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Complaint Description
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe problem details, error codes on screen, or exact wire cut location..."
                    className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white placeholder:text-muted-foreground outline-none focus:border-amber-400"
                  />
                </div>

                {/* 6. Upload Image / Video */}
                <div>
                  <label className="block font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Upload Image / Video (Optional)
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 bg-white/5 p-3 text-xs font-bold text-slate-300 hover:border-amber-400 hover:bg-white/10 transition">
                      <Upload className="h-4 w-4 text-amber-400" />
                      <span>{mediaPreview ? "Change File" : "Upload TV Error / Cable Photo"}</span>
                      <input
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleMediaUpload}
                        className="hidden"
                      />
                    </label>
                    {mediaPreview && (
                      <div className="relative h-12 w-12 rounded-xl overflow-hidden border border-white/20">
                        <img
                          src={mediaPreview}
                          alt="Attached"
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setMediaPreview(null)}
                          className="absolute top-0 right-0 grid h-4 w-4 place-items-center bg-black/80 text-white"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* 7. Preferred Service Time */}
                <div>
                  <label className="block font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Preferred Service Time
                  </label>
                  <select
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-[#161c2e] p-2.5 text-sm text-white outline-none focus:border-amber-400"
                  >
                    <option value="Immediate Emergency">⚡ Immediate Emergency (Fastest)</option>
                    <option value="Morning (9 AM - 12 PM)">🌅 Morning (9 AM - 12 PM)</option>
                    <option value="Afternoon (12 PM - 4 PM)">☀️ Afternoon (12 PM - 4 PM)</option>
                    <option value="Evening (4 PM - 7 PM)">🌆 Evening (4 PM - 7 PM)</option>
                  </select>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500 py-3.5 text-sm font-extrabold text-black shadow-[0_0_20px_rgba(245,158,11,0.4)] transition hover:bg-amber-400 active:scale-98"
                >
                  <Send className="h-4 w-4" /> Submit Complaint
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Live Tracking & Status Tracker View */}
      {activeTab === "tracking" && (
        <div className="mt-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2">
              🔄 Live Complaint Tracking & 📍 Technician Dispatch
            </h2>
            <span className="text-xs text-amber-400 font-bold flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" /> Live Status Sync
            </span>
          </div>

          {activeTrackingComplaints.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/15 bg-white/5 p-12 text-center">
              <Wrench className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-3 font-display text-lg font-bold text-white">
                No active complaints in progress
              </h3>
              <p className="mt-1 text-sm text-slate-400">
                All your service complaints have been resolved!
              </p>
              <button
                onClick={() => setActiveTab("raise")}
                className="mt-4 rounded-xl bg-amber-500 px-5 py-2.5 text-xs font-bold text-black shadow-[0_0_20px_rgba(245,158,11,0.4)]"
              >
                Raise New Complaint
              </button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {activeTrackingComplaints.map((c) => (
                <div
                  key={c.id}
                  className="rounded-3xl border border-white/15 glass-strong p-6 space-y-4 hover:border-white/30 transition shadow-2xl"
                >
                  <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
                    <div>
                      <div className="text-[11px] font-mono font-bold text-amber-400">
                        COMPLAINT ID: {c.id}
                      </div>
                      <h3 className="font-display text-xl font-bold text-white mt-0.5">
                        {c.category} – {c.issueType}
                      </h3>
                      <div className="text-xs text-muted-foreground">
                        STB ID: {c.stbId} · Submitted {new Date(c.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                    <StatusBadge status={c.status} />
                  </div>

                  {/* Progress Step Bar */}
                  <ProgressTracker status={c.status} />

                  <div className="text-xs text-slate-300 bg-black/30 p-3 rounded-xl border border-white/5">
                    <strong className="text-muted-foreground">Issue Description: </strong>{" "}
                    {c.description}
                  </div>

                  {c.mediaUrl && (
                    <div className="flex items-center gap-3">
                      <img
                        src={c.mediaUrl}
                        alt="Attached"
                        className="h-16 w-16 rounded-xl object-cover border border-white/20"
                      />
                      <span className="text-xs text-slate-400">Attached damage/screen photo</span>
                    </div>
                  )}

                  {/* Live Technician Tracking Card */}
                  {(c.status === "Assigned" || c.status === "In Progress") && c.technicianName && (
                    <div className="group relative overflow-hidden rounded-2xl border border-cyan-500/40 bg-gradient-to-r from-cyan-950/60 via-slate-900 to-slate-900 p-4 space-y-3 shadow-[0_0_20px_rgba(0,210,255,0.15)]">
                      <div className="flex items-center justify-between border-b border-white/10 pb-2">
                        <span className="font-display text-sm font-extrabold text-[color:var(--neon-cyan)] flex items-center gap-2">
                          <Car className="h-4 w-4 animate-bounce text-cyan-400" /> Technician is on
                          the way 🚗
                        </span>
                        <span className="rounded-full bg-cyan-500/20 px-2.5 py-0.5 text-[10px] font-bold text-cyan-300">
                          LIVE DISPATCH
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">
                            Technician Name
                          </span>
                          <strong className="text-white text-sm">{c.technicianName}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">
                            Expected Arrival
                          </span>
                          <strong className="text-emerald-400 font-mono text-sm">
                            {c.expectedArrival || "In 20 Minutes"}
                          </strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">
                            Assigned Time
                          </span>
                          <strong className="text-slate-200">
                            {c.assignedAt
                              ? new Date(c.assignedAt).toLocaleTimeString()
                              : "Just now"}
                          </strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block text-[10px] uppercase font-bold">
                            Contact Number
                          </span>
                          <a
                            href={`tel:${c.technicianMobile || "9840192837"}`}
                            className="inline-flex items-center gap-1 text-[color:var(--neon-cyan)] font-bold hover:underline"
                          >
                            <Phone className="h-3.5 w-3.5" /> +91{" "}
                            {c.technicianMobile || "9840192837"}
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Service History & Rating View */}
      {activeTab === "history" && (
        <div className="mt-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2">
              📜 Resolved Service History & ⭐ Rating Logs
            </h2>
            <span className="text-xs text-emerald-400 font-bold">
              {resolvedComplaints.length} Resolved Cases
            </span>
          </div>

          {resolvedComplaints.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-white/15 bg-white/5 p-12 text-center">
              <History className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-3 font-display text-lg font-bold text-white">
                No service history yet
              </h3>
              <p className="mt-1 text-sm text-slate-400">
                Completed complaints will be stored here for future reference.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {resolvedComplaints.map((c) => (
                <div
                  key={c.id}
                  className="rounded-3xl border border-white/15 glass-strong p-6 space-y-3 hover:border-white/30 transition"
                >
                  <div className="flex items-start justify-between gap-2 border-b border-white/10 pb-3">
                    <div>
                      <div className="text-[10px] font-mono font-bold text-emerald-400">
                        COMPLAINT ID: {c.id}
                      </div>
                      <h3 className="font-display text-lg font-bold text-white mt-0.5">
                        {c.category} – {c.issueType}
                      </h3>
                      <div className="text-xs text-muted-foreground">
                        Resolved on:{" "}
                        {c.resolvedAt ? new Date(c.resolvedAt).toLocaleDateString() : "Recently"}
                      </div>
                    </div>
                    <StatusBadge status={c.status} />
                  </div>

                  <div className="text-xs text-slate-300 bg-white/5 p-3 rounded-xl">
                    <div>
                      Technician: <strong>{c.technicianName || "Assigned Technician"}</strong>
                    </div>
                    <div className="mt-1 text-slate-400">Details: {c.description}</div>
                  </div>

                  {c.rating ? (
                    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-3 space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold text-amber-400">
                        <span>Your Rating Given:</span>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`h-3.5 w-3.5 ${s <= c.rating! ? "fill-amber-400 text-amber-400" : "text-slate-600"}`}
                            />
                          ))}
                        </div>
                      </div>
                      {c.feedback && (
                        <p className="text-xs text-slate-200 italic">"{c.feedback}"</p>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setRatingComplaint(c);
                        setStarVal(5);
                        setFeedbackVal("");
                      }}
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 py-2.5 text-xs font-bold text-amber-400 hover:bg-amber-500/20"
                    >
                      <Star className="h-4 w-4" /> Rate Service & Give Feedback
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Service Rating Modal */}
      {ratingComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-white/15 bg-[#0d121f] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-display text-xl font-bold text-white flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-400 fill-amber-400" /> Rate Service Experience
              </h3>
              <button
                onClick={() => setRatingComplaint(null)}
                className="rounded-lg p-1 text-slate-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRating} className="space-y-4 text-xs">
              <div className="text-center space-y-2">
                <p className="text-slate-300 font-medium">
                  How was your service experience with{" "}
                  <strong>{ratingComplaint.technicianName || "the technician"}</strong>?
                </p>

                {/* 1 to 5 Star Interactive Picker */}
                <div className="flex items-center justify-center gap-2 py-2">
                  {[1, 2, 3, 4, 5].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStarVal(st)}
                      className="p-1 transition hover:scale-125 active:scale-95"
                    >
                      <Star
                        className={`h-8 w-8 ${st <= starVal ? "fill-amber-400 text-amber-400" : "text-slate-600"}`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-amber-400 font-bold text-sm block">
                  {starVal === 5
                    ? "⭐⭐⭐⭐⭐ Excellent"
                    : starVal === 4
                      ? "⭐⭐⭐⭐ Good"
                      : starVal === 3
                        ? "⭐⭐⭐ Average"
                        : "Poor"}
                </span>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  Feedback Text Box
                </label>
                <textarea
                  rows={3}
                  value={feedbackVal}
                  onChange={(e) => setFeedbackVal(e.target.value)}
                  placeholder="Share feedback on technician behavior, arrival promptness, or resolution quality..."
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRatingComplaint(null)}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-amber-500 px-5 py-2 text-xs font-extrabold text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]"
                >
                  Save Rating & Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}

export default ComplaintsPage;
