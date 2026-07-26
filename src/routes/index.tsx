import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Tv, Shield, Zap, ArrowRight } from "lucide-react";
import { sendOtp, verifyOtp, useStore } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "STB RECHARGE — Smart Cable TV Recharge with Operator Control" },
      { name: "description", content: "Recharge your Set Top Box in seconds. Login with mobile OTP, choose a plan, pay, and track operator approval live." },
      { property: "og:title", content: "STB RECHARGE" },
      { property: "og:description", content: "Smart Recharge with Operator Control." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const [step, setStep] = useState<"mobile" | "otp">("mobile");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const navigate = useNavigate();
  const user = useStore((s) => s.user);

  useEffect(() => {
    if (user) navigate({ to: "/dashboard" });
  }, [user, navigate]);

  async function handleSend() {
    setErr(null);
    if (!/^\d{10}$/.test(mobile)) { setErr("Enter a valid 10-digit mobile number"); return; }
    setLoading(true);
    await sendOtp(mobile);
    setLoading(false);
    setStep("otp");
  }
  async function handleVerify() {
    setErr(null);
    if (otp.length !== 6) { setErr("Enter the 6-digit OTP"); return; }
    setLoading(true);
    const ok = await verifyOtp(mobile, otp);
    setLoading(false);
    if (ok) navigate({ to: "/dashboard" });
    else setErr("Invalid OTP. Try 123456 for demo.");
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
      {/* Floating orbs */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary/30 blur-3xl animate-float" />
      <div className="pointer-events-none absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-[color:var(--neon-purple)]/30 blur-3xl animate-float" />

      <div className="grid w-full max-w-5xl gap-8 md:grid-cols-2">
        {/* Left brand panel */}
        <div className="hidden flex-col justify-between rounded-3xl glass-strong p-8 md:flex">
          <div>
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl gradient-primary shadow-[var(--shadow-glow)]">
                <Tv className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <div className="font-display text-2xl font-bold">STB RECHARGE</div>
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Smart Recharge with Operator Control</div>
              </div>
            </div>
            <h1 className="mt-10 text-4xl font-bold leading-tight">
              Recharge your <span className="text-gradient">Set Top Box</span> in seconds.
            </h1>
            <p className="mt-3 text-muted-foreground">
              Pay instantly and track live operator approval. Real-time status, smart reminders, and AI-picked plans.
            </p>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-3">
            {[
              { icon: Zap, t: "Instant Pay" },
              { icon: Shield, t: "Operator Verified" },
              { icon: Tv, t: "All Providers" },
            ].map(({ icon: Icon, t }) => (
              <div key={t} className="card-3d rounded-2xl p-3 text-center">
                <Icon className="mx-auto h-5 w-5 text-[color:var(--neon-cyan)]" />
                <div className="mt-1 text-xs text-muted-foreground">{t}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right auth card */}
        <div className="rounded-3xl glass-strong p-6 sm:p-8">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold">{step === "mobile" ? "Welcome back" : "Verify OTP"}</h2>
              <p className="text-sm text-muted-foreground">
                {step === "mobile" ? "Login with your mobile number" : `We sent a 6-digit code to +91 ${mobile}`}
              </p>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-xl gradient-primary text-primary-foreground shadow-[var(--shadow-glow)] md:hidden">
              <Tv className="h-5 w-5" />
            </div>
          </div>

          {step === "mobile" ? (
            <div className="space-y-4">
              <label className="block text-xs uppercase tracking-widest text-muted-foreground">Mobile Number</label>
              <div className="flex overflow-hidden rounded-2xl border border-white/10 bg-white/5 focus-within:border-primary/60 focus-within:shadow-[var(--shadow-glow)]">
                <span className="grid place-items-center px-4 text-sm text-muted-foreground">+91</span>
                <input
                  autoFocus
                  inputMode="numeric"
                  maxLength={10}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                  placeholder="98765 43210"
                  className="w-full bg-transparent py-4 pr-4 text-lg outline-none"
                />
              </div>
              {err && <p className="text-sm text-destructive">{err}</p>}
              <button
                onClick={handleSend}
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-2xl gradient-primary py-4 font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition hover:scale-[1.01] disabled:opacity-60"
              >
                {loading ? "Sending…" : "Send OTP"} <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </button>
              <p className="text-center text-xs text-muted-foreground">
                By continuing you agree to our Terms & Privacy Policy.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <label className="block text-xs uppercase tracking-widest text-muted-foreground">Enter OTP</label>
              <input
                autoFocus
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="••••••"
                className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 text-center text-3xl tracking-[0.6em] outline-none focus:border-primary/60 focus:shadow-[var(--shadow-glow)]"
              />
              <p className="text-center text-xs text-muted-foreground">Demo OTP: <span className="text-foreground">123456</span></p>
              {err && <p className="text-sm text-destructive">{err}</p>}
              <button
                onClick={handleVerify}
                disabled={loading}
                className="w-full rounded-2xl gradient-primary py-4 font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition hover:scale-[1.01] disabled:opacity-60"
              >
                {loading ? "Verifying…" : "Verify & Continue"}
              </button>
              <button onClick={() => setStep("mobile")} className="w-full text-center text-sm text-muted-foreground hover:text-foreground">
                Change number
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
