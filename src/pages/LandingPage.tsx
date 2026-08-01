import { Link } from "@tanstack/react-router";
import {
  Tv,
  Shield,
  Zap,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Sparkles,
  Phone,
  MessageCircle,
  Wrench,
  Package,
  CreditCard,
  Lock,
  RefreshCw,
  Award,
  Users,
  ChevronRight,
} from "lucide-react";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#07090e] text-foreground font-sans selection:bg-primary/30 selection:text-primary overflow-x-hidden">
      {/* Background Glowing Orbs */}
      <div className="pointer-events-none fixed -left-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-primary/20 blur-[120px] animate-float" />
      <div className="pointer-events-none fixed -bottom-40 -right-40 h-[36rem] w-[36rem] rounded-full bg-[color:var(--neon-purple)]/20 blur-[140px] animate-float" />
      <div className="pointer-events-none fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[40rem] w-[40rem] rounded-full bg-[color:var(--neon-cyan)]/10 blur-[160px]" />

      {/* HEADER NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b0e17]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="grid h-10 w-10 place-items-center rounded-2xl gradient-primary shadow-[0_0_20px_rgba(0,210,255,0.4)] group-hover:scale-105 transition-transform">
              <Tv className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <span className="font-display text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
                STB RECHARGE
                <span className="rounded-md border border-[color:var(--neon-cyan)]/40 bg-[color:var(--neon-cyan)]/10 px-2 py-0.5 text-[10px] uppercase font-bold text-[color:var(--neon-cyan)]">
                  Live
                </span>
              </span>
              <span className="text-[10px] text-muted-foreground block font-medium -mt-0.5">
                Operator Controlled System
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-300">
            <a href="#how-it-works" className="hover:text-[color:var(--neon-cyan)] transition">
              How It Works
            </a>
            <a href="#features" className="hover:text-[color:var(--neon-cyan)] transition">
              Features
            </a>
            <a href="#live-preview" className="hover:text-[color:var(--neon-cyan)] transition">
              Live Preview
            </a>
            <a href="#why-us" className="hover:text-[color:var(--neon-cyan)] transition">
              Why Us
            </a>
            <a href="#support" className="hover:text-[color:var(--neon-cyan)] transition">
              Support
            </a>
          </nav>

          {/* Header Action */}
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="flex items-center gap-2 rounded-xl gradient-primary px-5 py-2.5 text-xs font-extrabold text-primary-foreground shadow-[var(--shadow-glow)] hover:scale-105 transition-all"
            >
              Login / Register <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-12 pb-20 sm:pt-20 sm:pb-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-[color:var(--neon-cyan)]/40 bg-[color:var(--neon-cyan)]/10 px-4 py-1.5 text-xs font-bold text-[color:var(--neon-cyan)] shadow-[0_0_15px_rgba(0,210,255,0.2)]">
                <Sparkles className="h-4 w-4 animate-pulse" />
                <span>Operator-Controlled Cable TV Recharge</span>
              </div>

              <h1 className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-6xl leading-[1.1]">
                Smart Recharge with{" "}
                <span className="bg-gradient-to-r from-[color:var(--neon-cyan)] via-cyan-300 to-purple-400 bg-clip-text text-transparent">
                  Operator Control
                </span>
              </h1>

              <p className="mx-auto lg:mx-0 max-w-2xl text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
                Recharge your Cable TV easily with secure operator approval and real-time updates.
                Enjoy zero auto-debit errors, 45-minute guaranteed verification, and instant status
                tracking.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  to="/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl gradient-primary px-8 py-4 text-sm font-extrabold text-primary-foreground shadow-[var(--shadow-glow)] hover:scale-105 transition-all"
                >
                  <Zap className="h-5 w-5 fill-current" /> Get Started Now
                </Link>

                <Link
                  to="/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl border border-white/15 bg-white/5 px-8 py-4 text-sm font-bold text-white backdrop-blur-xl hover:bg-white/10 transition-all"
                >
                  <Clock className="h-5 w-5 text-[color:var(--neon-cyan)]" /> Track Recharge
                </Link>
              </div>

              {/* Quick Metrics Badge */}
              <div className="pt-6 border-t border-white/10 grid grid-cols-3 gap-4 text-center lg:text-left">
                <div>
                  <div className="font-display text-2xl font-black text-white">100%</div>
                  <div className="text-xs text-slate-400">Operator Verified</div>
                </div>
                <div>
                  <div className="font-display text-2xl font-black text-[color:var(--neon-cyan)]">
                    45 Min
                  </div>
                  <div className="text-xs text-slate-400">Max Approval Time</div>
                </div>
                <div>
                  <div className="font-display text-2xl font-black text-purple-400">24/7</div>
                  <div className="text-xs text-slate-400">Complaint Support</div>
                </div>
              </div>
            </div>

            {/* Right 3D Visual Floating Cards */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md">
                {/* Glowing Card Container */}
                <div className="card-3d relative overflow-hidden rounded-3xl border border-white/15 bg-[#0d121f]/90 p-6 backdrop-blur-xl shadow-2xl space-y-6">
                  {/* Card Header */}
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                        <Tv className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm">STB-8839201948</div>
                        <div className="text-[11px] text-muted-foreground">Kathiravan V</div>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow-500/40 bg-yellow-500/10 px-3 py-1 text-xs font-bold text-yellow-400">
                      <span className="h-2 w-2 rounded-full bg-yellow-400 animate-ping" /> Pending
                    </span>
                  </div>

                  {/* Active Pack Detail */}
                  <div className="rounded-2xl bg-white/5 p-4 border border-white/5 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground uppercase font-bold text-[10px]">
                        Plan Name
                      </span>
                      <span className="font-mono text-emerald-400 font-bold">₹349 / Mo</span>
                    </div>
                    <div className="font-display text-base font-extrabold text-white">
                      Tamil Sports & HD Pack (280 Channels)
                    </div>
                  </div>

                  {/* Live Timer Visual */}
                  <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-4 space-y-1">
                    <div className="flex items-center justify-between text-xs text-[color:var(--neon-cyan)] font-bold">
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4 animate-spin" /> Operator Processing
                      </span>
                      <span className="font-mono">44:12 Remaining</span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Assigned to Local Cable Operator (Ramesh Kumar · +91 98401 92837)
                    </p>
                  </div>

                  {/* Approved Badge Floating Tag */}
                  <div className="flex items-center justify-between rounded-xl bg-emerald-500/15 border border-emerald-500/40 p-3 text-xs text-emerald-400 font-bold">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4" /> Instant SMS & Receipt Ready
                    </span>
                    <span className="text-[10px] font-mono text-slate-300">Txn: #STB9941</span>
                  </div>
                </div>

                {/* Floating Decorative Badges */}
                <div className="absolute -top-6 -right-6 rounded-2xl border border-amber-500/40 bg-[#161c2e] p-3 shadow-xl flex items-center gap-2 animate-bounce">
                  <Shield className="h-5 w-5 text-amber-400" />
                  <span className="text-xs font-bold text-white">100% Secure</span>
                </div>

                <div className="absolute -bottom-6 -left-6 rounded-2xl border border-cyan-500/40 bg-[#161c2e] p-3 shadow-xl flex items-center gap-2">
                  <Zap className="h-5 w-5 text-[color:var(--neon-cyan)]" />
                  <span className="text-xs font-bold text-white">Real-Time Sync</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="relative py-20 bg-[#0a0d16] border-y border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-extrabold uppercase tracking-[0.25em] text-[color:var(--neon-cyan)]">
              Workflow Guide
            </span>
            <h2 className="font-display text-3xl font-extrabold text-white sm:text-4xl">
              How the Operator-Controlled System Works
            </h2>
            <p className="text-sm sm:text-base text-slate-300">
              Follow 6 transparent, easy steps from initial login to final STB activation.
            </p>
          </div>

          {/* 6 Step Interactive Flow Cards */}
          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                step: "01",
                icon: Lock,
                title: "Login with Mobile + OTP",
                desc: "Enter your 10-digit mobile number and receive a instant 6-digit OTP. Passwordless & secure.",
                color: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
              },
              {
                step: "02",
                icon: Tv,
                title: "Enter STB ID",
                desc: "Type your Set-Top Box ID or smartcard number to fetch active subscription & validity.",
                color: "text-purple-400 border-purple-500/30 bg-purple-500/10",
              },
              {
                step: "03",
                icon: CreditCard,
                title: "Select Plan & Pay",
                desc: "Choose from monthly packs, HD add-ons, or custom channel bundles and complete payment.",
                color: "text-amber-400 border-amber-500/30 bg-amber-500/10",
              },
              {
                step: "04",
                icon: Clock,
                title: "Request Sent to Operator",
                desc: "Your payment enters the operator approval queue with a live 45-minute countdown timer.",
                color: "text-yellow-400 border-yellow-500/30 bg-yellow-500/10",
              },
              {
                step: "05",
                icon: Shield,
                title: "Operator Approves",
                desc: "Whitelisted local cable operator verifies payment details and signals activation to the server.",
                color: "text-blue-400 border-blue-500/30 bg-blue-500/10",
              },
              {
                step: "06",
                icon: CheckCircle2,
                title: "Recharge Activated",
                desc: "Your STB channels are renewed immediately with full digital receipt & instant SMS proof.",
                color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
              },
            ].map((s, idx) => {
              const Icon = s.icon;
              return (
                <div
                  key={idx}
                  className="relative group rounded-3xl border border-white/10 bg-[#0d121f]/90 p-8 backdrop-blur-xl shadow-xl hover:border-white/25 transition-all hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className={`grid h-12 w-12 place-items-center rounded-2xl border ${s.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="font-mono text-3xl font-black text-white/20 group-hover:text-[color:var(--neon-cyan)]/40 transition">
                      {s.step}
                    </span>
                  </div>

                  <h3 className="font-display text-xl font-bold text-white mb-2">{s.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="relative py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-extrabold uppercase tracking-[0.25em] text-[color:var(--neon-purple)]">
              Core Capabilities
            </span>
            <h2 className="font-display text-3xl font-extrabold text-white sm:text-4xl">
              Powerful Features Designed for TV Viewers
            </h2>
            <p className="text-sm sm:text-base text-slate-300">
              Everything you need for seamless cable TV management and complaint resolution.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Lock,
                title: "🔐 Secure Login with OTP",
                desc: "Passwordless 6-digit OTP verification ensures high account security and instant mobile access.",
              },
              {
                icon: Tv,
                title: "📺 STB Status Tracking",
                desc: "Check active pack details, expiry dates, and subscription status in real-time.",
              },
              {
                icon: CreditCard,
                title: "💳 Easy Recharge Request",
                desc: "Select curated packs or custom channel bouquets with instant online checkout.",
              },
              {
                icon: Clock,
                title: "⏳ 45-Minute Approval Timer",
                desc: "Live countdown timer guarantees operator verification and quick signal activation.",
              },
              {
                icon: RefreshCw,
                title: "🔄 Real-Time Status Updates",
                desc: "Instant status updates between customer mobile screen, operator panel, and admin portal.",
              },
              {
                icon: Shield,
                title: "🧑‍💻 Operator Controlled System",
                desc: "Whitelisted cable operators review and approve every transaction, eliminating automated failure.",
              },
              {
                icon: Wrench,
                title: "🛠 Complaint Support & Service",
                desc: "Report TV repair, signal loss, or STB issues directly to assigned field technicians.",
              },
              {
                icon: Package,
                title: "📦 Accessories Store",
                desc: "Order replacement remotes, HDMI cables, power adapters, or new STB box installations.",
              },
              {
                icon: Award,
                title: "🧾 Digital Receipts & History",
                desc: "Download official transaction receipts and track full payment history anytime.",
              },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={i}
                  className="rounded-3xl border border-white/10 bg-[#0d121f]/80 p-6 backdrop-blur-xl shadow-xl hover:border-[color:var(--neon-cyan)]/40 transition"
                >
                  <Icon className="h-8 w-8 text-[color:var(--neon-cyan)] mb-4" />
                  <h3 className="font-display text-lg font-bold text-white mb-2">{f.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* LIVE STATUS PREVIEW (UI MOCK) */}
      <section id="live-preview" className="relative py-20 bg-[#0a0d16] border-y border-white/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-extrabold uppercase tracking-[0.25em] text-yellow-400">
              Live Demo Preview
            </span>
            <h2 className="font-display text-3xl font-extrabold text-white sm:text-4xl">
              Transparent Transaction Statuses
            </h2>
            <p className="text-sm sm:text-base text-slate-300">
              Know exactly where your recharge stands at all times with color-coded status badges.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Card 1: Pending (Yellow) */}
            <div className="rounded-3xl border border-yellow-500/30 bg-[#0d121f] p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="font-mono text-xs text-yellow-400 font-bold">#TXN-9021</span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow-500/40 bg-yellow-500/10 px-3 py-1 text-xs font-bold text-yellow-400">
                  <span className="h-2 w-2 rounded-full bg-yellow-400 animate-ping" /> 🟡 Pending
                </span>
              </div>
              <div>
                <h4 className="font-bold text-white text-base">Tamil Sports Super Pack</h4>
                <div className="text-xs text-slate-400">STB: 1234567890 · ₹349</div>
              </div>
              <div className="rounded-2xl bg-yellow-500/10 border border-yellow-500/20 p-3 text-xs text-yellow-200">
                ⏳ Operator review in progress. 42 minutes remaining on timer.
              </div>
            </div>

            {/* Card 2: Success (Green) */}
            <div className="rounded-3xl border border-emerald-500/30 bg-[#0d121f] p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="font-mono text-xs text-emerald-400 font-bold">#TXN-8842</span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" /> 🟢 Approved
                </span>
              </div>
              <div>
                <h4 className="font-bold text-white text-base">HD Entertainment Pack</h4>
                <div className="text-xs text-slate-400">STB: 9876543210 · ₹499</div>
              </div>
              <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-300">
                ✅ Activated by Operator Ramesh Kumar. Subscription valid until 31 Aug 2026.
              </div>
            </div>

            {/* Card 3: Failed (Red) */}
            <div className="rounded-3xl border border-red-500/30 bg-[#0d121f] p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="font-mono text-xs text-red-400 font-bold">#TXN-7731</span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1 text-xs font-bold text-red-400">
                  <XCircle className="h-3.5 w-3.5" /> 🔴 Rejected
                </span>
              </div>
              <div>
                <h4 className="font-bold text-white text-base">Basic Starter Pack</h4>
                <div className="text-xs text-slate-400">STB: 5544332211 · ₹199</div>
              </div>
              <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-300">
                ❌ STB ID mismatch. Refund initiated automatically to original payment method.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section id="why-us" className="relative py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-6 space-y-6">
              <span className="text-xs font-extrabold uppercase tracking-[0.25em] text-[color:var(--neon-cyan)]">
                Why Choose STB Recharge
              </span>
              <h2 className="font-display text-3xl font-extrabold text-white sm:text-4xl">
                Built Specifically for Local Cable TV Operators & Customers
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Generic automated payment apps often fail due to mismatched STB numbers or delayed
                operator signal updates. Our operator-controlled workflow bridges this gap cleanly.
              </p>

              <div className="space-y-4 pt-2">
                {[
                  "No automatic recharge errors or accidental money deductions",
                  "100% operator verified system ensuring signal restoration",
                  "Safe and transparent process with digital receipt records",
                  "Real-time live status updates between customer and operator",
                  "Customer-friendly, mobile-optimized 3D user interface",
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm text-white font-medium">
                    <div className="grid h-6 w-6 place-items-center rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shrink-0">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="rounded-3xl border border-white/15 bg-gradient-to-br from-slate-900 via-[#0d121f] to-purple-950/40 p-8 shadow-2xl space-y-6">
                <div className="flex items-center gap-4">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-white">
                      Customer & Operator Trust
                    </h3>
                    <p className="text-xs text-slate-400">Serving thousands of STB subscribers</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="rounded-2xl bg-white/5 p-4 border border-white/5">
                    <div className="font-display text-3xl font-black text-white">10K+</div>
                    <div className="text-xs text-slate-400 mt-1">Recharges Approved</div>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-4 border border-white/5">
                    <div className="font-display text-3xl font-black text-[color:var(--neon-cyan)]">
                      99.9%
                    </div>
                    <div className="text-xs text-slate-400 mt-1">Success Rate</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SUPPORT / CONTACT */}
      <section id="support" className="relative py-20 bg-[#0a0d16] border-y border-white/10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 text-center">
          <div className="rounded-3xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/30 via-slate-900 to-purple-950/30 p-8 sm:p-12 shadow-2xl space-y-6">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-[color:var(--neon-cyan)]/20 border border-[color:var(--neon-cyan)]/40 text-[color:var(--neon-cyan)] shadow-[0_0_20px_rgba(0,210,255,0.3)]">
              <Phone className="h-8 w-8" />
            </div>

            <h2 className="font-display text-3xl font-extrabold text-white sm:text-4xl">
              Need Help with your STB Connection?
            </h2>

            <p className="mx-auto max-w-xl text-sm sm:text-base text-slate-300">
              Have questions regarding your TV plan, STB signal loss, or payment status? Our
              support team and local operators are here to assist.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-2xl gradient-primary px-6 py-3.5 text-xs font-extrabold text-primary-foreground shadow-[var(--shadow-glow)] hover:scale-105 transition"
              >
                <Phone className="h-4 w-4" /> Contact Operator (+91 90808 64542)
              </Link>

              <a
                href="https://wa.me/919080864542?text=Hi%20STB%20Recharge%20Support..."
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-6 py-3.5 text-xs font-extrabold text-emerald-400 hover:bg-emerald-500/20 transition"
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp Support
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* LOGIN CTA SECTION (BOTTOM) */}
      <section className="relative py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 text-center space-y-6">
          <span className="text-xs font-extrabold uppercase tracking-[0.25em] text-amber-400">
            Start Your Recharge Now
          </span>
          <h2 className="font-display text-4xl font-extrabold text-white sm:text-5xl">
            Ready for Fast, Operator-Verified Cable TV?
          </h2>
          <p className="mx-auto max-w-xl text-sm sm:text-base text-slate-300">
            Log in with your mobile number to view active subscriptions, select new channel packs,
            or track existing recharge requests.
          </p>
          <div>
            <Link
              to="/login"
              className="inline-flex items-center gap-3 rounded-2xl gradient-primary px-10 py-4 text-base font-extrabold text-primary-foreground shadow-[var(--shadow-glow)] hover:scale-105 transition-all"
            >
              Login to Continue <ChevronRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-[#07090e] py-12 text-slate-400 text-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="grid h-8 w-8 place-items-center rounded-xl gradient-primary text-primary-foreground">
              <Tv className="h-4 w-4" />
            </div>
            <div>
              <span className="font-display text-base font-bold text-white">STB RECHARGE</span>
              <p className="text-[11px] text-slate-400">Smart Recharge with Operator Control</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 text-slate-300 font-bold">
            <Link to="/login" className="hover:text-white transition">
              Customer Login
            </Link>
            <Link to="/login" className="hover:text-white transition">
              Operator Portal
            </Link>
            <Link to="/login" className="hover:text-white transition">
              Super Admin
            </Link>
          </div>

          <div className="text-center md:text-right text-[11px]">
            © {new Date().getFullYear()} STB RECHARGE. All Rights Reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
