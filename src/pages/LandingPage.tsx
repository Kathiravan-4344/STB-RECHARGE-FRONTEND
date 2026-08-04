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
    <div className="min-h-screen bg-[#F1F5F9] text-[#0F172A] font-sans antialiased overflow-x-hidden">
      {/* HEADER NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-[#CBD5E1] bg-white/95 backdrop-blur-md shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#2563EB] text-white shadow-md shadow-blue-500/20 font-bold">
              <Tv className="h-5 w-5" />
            </div>
            <div>
              <span className="font-display text-xl font-bold tracking-tight text-[#0F172A] flex items-center gap-2">
                STB RECHARGE
                <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] uppercase font-bold text-[#2563EB] border border-blue-200">
                  Live
                </span>
              </span>
              <span className="text-[10px] text-[#64748B] block font-semibold -mt-0.5">
                Operator Controlled System
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-[#64748B]">
            <a href="#how-it-works" className="hover:text-[#2563EB] transition">
              How It Works
            </a>
            <a href="#features" className="hover:text-[#2563EB] transition">
              Features
            </a>
            <a href="#live-preview" className="hover:text-[#2563EB] transition">
              Live Preview
            </a>
            <a href="#why-us" className="hover:text-[#2563EB] transition">
              Why Us
            </a>
            <a href="#support" className="hover:text-[#2563EB] transition">
              Support
            </a>
          </nav>

          {/* Header Action */}
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-2 text-xs font-bold text-[#2563EB] hover:bg-blue-100 transition-all"
            >
              <Shield className="h-4 w-4" /> Operator Panel
            </Link>
            <Link
              to="/login"
              className="flex items-center gap-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] px-4 py-2 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition-all"
            >
              Login / Register <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>


      {/* HERO SECTION */}
      <section className="relative pt-12 pb-16 sm:pt-16 sm:pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-xs font-bold text-[#2563EB]">
                <Sparkles className="h-4 w-4 text-[#2563EB]" />
                <span>Operator-Controlled Cable TV Recharge</span>
              </div>

              <h1 className="font-display text-4xl font-extrabold tracking-tight text-[#0F172A] sm:text-6xl leading-[1.1]">
                Smart Recharge with{" "}
                <span className="text-[#2563EB]">
                  Operator Control
                </span>
              </h1>

              <p className="mx-auto lg:mx-0 max-w-2xl text-base sm:text-lg text-[#64748B] font-medium leading-relaxed">
                Recharge your Set Top Box easily with secure operator approval and real-time status updates.
                Enjoy guaranteed verification and instant channel activation.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Link
                  to="/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] px-8 py-4 text-base font-bold text-white shadow-md shadow-blue-500/20 transition-all"
                >
                  <Zap className="h-5 w-5 fill-current" /> Recharge Now
                </Link>

                <Link
                  to="/login"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-xl border border-[#CBD5E1] bg-white px-8 py-4 text-base font-bold text-[#0F172A] shadow-sm hover:bg-slate-50 transition-all"
                >
                  <Clock className="h-5 w-5 text-[#2563EB]" /> Track Recharge
                </Link>
              </div>

              {/* Quick Metrics Badge */}
              <div className="pt-6 border-t border-[#CBD5E1] grid grid-cols-3 gap-4 text-center lg:text-left">
                <div>
                  <div className="font-display text-2xl font-extrabold text-[#0F172A]">100%</div>
                  <div className="text-xs text-[#64748B] font-semibold">Operator Verified</div>
                </div>
                <div>
                  <div className="font-display text-2xl font-extrabold text-[#2563EB]">
                    45 Min
                  </div>
                  <div className="text-xs text-[#64748B] font-semibold">Max Approval Time</div>
                </div>
                <div>
                  <div className="font-display text-2xl font-extrabold text-[#22C55E]">24/7</div>
                  <div className="text-xs text-[#64748B] font-semibold">Customer Support</div>
                </div>
              </div>
            </div>

            {/* Right Visual Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md">
                <div className="bg-white rounded-2xl border border-[#CBD5E1] p-6 shadow-xl space-y-6">
                  <div className="flex items-center justify-between border-b border-[#CBD5E1] pb-4">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-[#2563EB] border border-blue-200">
                        <Tv className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-bold text-[#0F172A] text-sm">STB-8839201948</div>
                        <div className="text-[11px] text-[#64748B]">Kathiravan V</div>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800">
                      <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" /> Pending
                    </span>
                  </div>

                  <div className="rounded-xl bg-[#F8FAFC] p-4 border border-[#CBD5E1] space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#64748B] uppercase font-bold text-[10px]">
                        Selected Pack
                      </span>
                      <span className="font-mono text-[#2563EB] font-bold">₹349 / Mo</span>
                    </div>
                    <div className="font-bold text-base text-[#0F172A]">
                      Tamil Sports & HD Pack (280 Channels)
                    </div>
                  </div>

                  <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 space-y-1">
                    <div className="flex items-center justify-between text-xs text-[#2563EB] font-bold">
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-[#2563EB]" /> Operator Verification
                      </span>
                      <span className="font-mono">Live Sync</span>
                    </div>
                    <p className="text-xs text-[#0F172A] font-semibold">
                      Assigned to Local Cable Operator (Kathiravan V)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="how-it-works" className="relative py-16 bg-white border-y border-[#CBD5E1]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">
              Workflow Guide
            </span>
            <h2 className="font-display text-3xl font-extrabold text-[#0F172A] sm:text-4xl">
              How the Operator System Works
            </h2>
            <p className="text-sm text-[#64748B] font-semibold">
              6 transparent steps from initial login to final STB pack activation.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                step: "01",
                icon: Lock,
                title: "Login with Mobile",
                desc: "Enter your 10-digit mobile number and receive instant OTP. Passwordless & secure.",
              },
              {
                step: "02",
                icon: Tv,
                title: "Enter STB ID",
                desc: "Type your 12-digit Set Top Box ID to view your active subscription.",
              },
              {
                step: "03",
                icon: CreditCard,
                title: "Select Plan & Pay",
                desc: "Choose from monthly packs or channel bouquets and complete checkout.",
              },
              {
                step: "04",
                icon: Clock,
                title: "Request Sent",
                desc: "Your payment enters operator queue with live approval countdown timer.",
              },
              {
                step: "05",
                icon: Shield,
                title: "Operator Approves",
                desc: "Whitelisted local cable operator approves payment & signals activation.",
              },
              {
                step: "06",
                icon: CheckCircle2,
                title: "STB Activated",
                desc: "Your STB channels are activated immediately with SMS & receipt confirmation.",
              },
            ].map((s, idx) => {
              const Icon = s.icon;
              return (
                <div
                  key={idx}
                  className="bg-[#F8FAFC] rounded-2xl border border-[#CBD5E1] p-6 shadow-sm hover:border-[#2563EB] transition"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-10 w-10 rounded-xl bg-blue-50 text-[#2563EB] border border-blue-200 flex items-center justify-center font-bold">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="font-mono text-2xl font-extrabold text-[#CBD5E1]">
                      {s.step}
                    </span>
                  </div>

                  <h3 className="font-bold text-lg text-[#0F172A] mb-1">{s.title}</h3>
                  <p className="text-xs text-[#64748B] font-medium leading-relaxed">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[#CBD5E1] bg-white py-10 text-[#64748B] text-xs">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-[#2563EB] text-white flex items-center justify-center font-bold">
              <Tv className="h-4 w-4" />
            </div>
            <div>
              <span className="font-bold text-base text-[#0F172A]">STB RECHARGE</span>
              <p className="text-[11px] text-[#64748B]">Smart Recharge with Operator Control</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 text-[#0F172A] font-bold">
            <Link to="/login" className="hover:text-[#2563EB]">
              Customer Login
            </Link>
            <Link to="/login" className="hover:text-[#2563EB]">
              Operator Portal
            </Link>
            <Link to="/login" className="hover:text-[#2563EB]">
              Super Admin
            </Link>
          </div>

          <div className="text-center md:text-right text-[11px] font-semibold text-[#64748B]">
            © {new Date().getFullYear()} STB RECHARGE. All Rights Reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
