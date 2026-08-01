import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Tv, Shield, Zap, ArrowRight, Lock } from "lucide-react";
import { sendOtp, verifyOtp, useStore, isOperatorApproved } from "../services/store";

export function LoginPage() {
  const [role, setRole] = useState<"customer" | "operator">("customer");
  const [step, setStep] = useState<"details" | "otp">("details");

  // Common & Customer state
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [stbId, setStbId] = useState("");

  // Operator state: Contact can be Mobile Number OR Gmail
  const [operatorContact, setOperatorContact] = useState("");

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const navigate = useNavigate();
  const user = useStore((s) => s.user);

  useEffect(() => {
    if (user) {
      if (user.role === "admin") {
        navigate({ to: "/admin" });
      } else if (user.role === "operator") {
        navigate({ to: "/operator" });
      } else {
        navigate({ to: "/dashboard" });
      }
    }
  }, [user, navigate]);

  function handleSwitchRole(newRole: "customer" | "operator") {
    setRole(newRole);
    setStep("details");
    setErr(null);
  }

  // Formatting Operator Contact: Auto-lowercase for email/text, digits-only for mobile
  function handleOperatorContactChange(raw: string) {
    setErr(null);
    if (/^\d*$/.test(raw)) {
      setOperatorContact(raw.slice(0, 10));
    } else {
      setOperatorContact(raw.toLowerCase());
    }
  }

  // Real-time validation checks
  const isOperatorEmail = operatorContact.includes("@");
  const isOperatorValidEmail =
    isOperatorEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(operatorContact.trim());
  const isOperatorValidMobile = !isOperatorEmail && /^\d{10}$/.test(operatorContact.trim());

  const isOperatorValid =
    name.trim().length > 0 &&
    (isOperatorValidEmail || isOperatorValidMobile || operatorContact.trim() === "9080864542");

  const isCustomerValid =
    name.trim().length > 0 &&
    /^\d{10}$/.test(mobile.trim()) &&
    /^\d{12}$/.test(stbId.trim());

  const isFormValid = role === "operator" ? isOperatorValid : isCustomerValid;

  async function handleSend() {
    setErr(null);
    if (!name.trim()) {
      setErr("ENTER YOUR NAME");
      return;
    }

    if (role === "operator") {
      const contact = operatorContact.trim();
      const cleanedContact = contact.replace(/\D/g, "");

      if (!contact) {
        setErr("ENTER YOUR MOBILE NUMBER OR GMAIL");
        return;
      }

      // Check if Admin login number 9080864542
      if (cleanedContact === "9080864542") {
        setLoading(true);
        await sendOtp("9080864542");
        setLoading(false);
        setStep("otp");
        return;
      }

      // STRICT OPERATOR WHITELIST CHECK FOR OTHERS
      if (!isOperatorApproved(contact)) {
        setErr(
          "❌ You are not authorized. Contact Admin (KATHIRAVAN V) to add your operator number.",
        );
        return;
      }

      if (!isOperatorValidEmail && !isOperatorValidMobile) {
        if (isOperatorEmail) {
          setErr("Please enter a valid Gmail / Email address");
        } else {
          setErr("Please enter a valid 10-digit Mobile Number");
        }
        return;
      }

      setLoading(true);
      await sendOtp(contact);
      setLoading(false);
      setStep("otp");
    } else {
      const cleanedMobile = mobile.trim().replace(/\D/g, "");

      if (cleanedMobile === "9080864542") {
        setErr("❌ Admin Portal can ONLY be accessed via Operator Login tab.");
        return;
      }

      if (!/^\d{10}$/.test(mobile)) {
        setErr("Enter a valid 10-digit mobile number");
        return;
      }

      if (!/^\d{12}$/.test(stbId.trim())) {
        setErr("Enter a valid 12-digit STB ID / Smart Card Number");
        return;
      }

      setLoading(true);
      await sendOtp(mobile);
      setLoading(false);
      setStep("otp");
    }
  }

  async function handleVerify() {
    setErr(null);
    if (otp.length !== 6) {
      setErr("Enter the 6-digit OTP");
      return;
    }
    setLoading(true);

    if (role === "operator") {
      const contact = operatorContact.trim();
      const cleanedContact = contact.replace(/\D/g, "");

      // ADMIN PORTAL LOGIN (ONLY VIA OPERATOR LOGIN TAB)
      if (cleanedContact === "9080864542") {
        const ok = await verifyOtp("9080864542", otp, name || "KATHIRAVAN V", "admin");
        setLoading(false);
        if (ok) {
          navigate({ to: "/admin" });
        } else {
          setErr("Incorrect code. Your 6-digit code is set on first login — use the same one each time.");
        }
        return;
      }

      // OPERATOR LOGIN
      if (!isOperatorApproved(contact)) {
        setLoading(false);
        setErr("❌ You are not authorized. Contact Admin (KATHIRAVAN V) to add your operator number.");
        return;
      }
      const isGmail = contact.includes("@");
      const mobileNum = isGmail ? "9787312758" : contact;
      const emailAddr = isGmail ? contact : undefined;
      const operatorNum = isGmail
        ? "OP-" + contact.split("@")[0].toUpperCase()
        : "OP-" + contact.slice(-5);

      const ok = await verifyOtp(mobileNum, otp, name, "operator", {
        email: emailAddr,
        operatorNumber: operatorNum,
      });
      setLoading(false);

      if (ok) {
        navigate({ to: "/operator" });
      } else {
        setErr("Incorrect code. Your 6-digit code is set on first login — use the same one each time.");
      }
    } else {
      const cleanedMobile = mobile.trim().replace(/\D/g, "");

      // BLOCK ADMIN NUMBER ON CUSTOMER LOGIN
      if (cleanedMobile === "9080864542") {
        setLoading(false);
        setErr("❌ Admin Portal can ONLY be accessed via Operator Login tab.");
        return;
      }

      const ok = await verifyOtp(mobile, otp, name, "customer", {
        stbId: stbId.trim() || "1234567890",
      });
      setLoading(false);

      if (ok) {
        navigate({ to: "/dashboard" });
      } else {
        setErr("Incorrect code. Your 6-digit code is set on first login — use the same one each time.");
      }
    }
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
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Smart Recharge & Admin Management
                </div>
              </div>
            </div>
            <h1 className="mt-10 text-4xl font-bold leading-tight">
              {role === "operator" ? (
                <>
                  Operator <span className="text-gradient">Control Center</span> Portal
                </>
              ) : (
                <>
                  Recharge your <span className="text-gradient">Set Top Box</span> in seconds.
                </>
              )}
            </h1>
            <p className="mt-3 text-muted-foreground">
              {role === "operator"
                ? "Manage customer recharges, approve pending transactions, and monitor real-time cable TV service requests."
                : "Pay instantly and track live operator approval. Real-time status, smart reminders, and AI-picked plans."}
            </p>
          </div>
          <div className="mt-8 grid grid-cols-3 gap-3">
            {[
              { icon: Zap, t: "Instant Pay" },
              { icon: Shield, t: "Operator Verified" },
              { icon: Lock, t: "Admin Secure" },
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
          {/* Role Switcher Tabs */}
          <div className="mb-6 flex rounded-2xl bg-white/5 p-1 border border-white/10 gap-1">
            <button
              onClick={() => handleSwitchRole("customer")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold transition ${
                role === "customer"
                  ? "gradient-primary text-primary-foreground shadow-[var(--shadow-glow)]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Tv className="h-4 w-4" /> Customer Login
            </button>
            <button
              onClick={() => handleSwitchRole("operator")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold transition ${
                role === "operator"
                  ? "bg-[color:var(--neon-cyan)] text-black font-bold shadow-[0_0_15px_rgba(0,210,255,0.4)]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Shield className="h-4 w-4" /> Operator Login
            </button>
          </div>

          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold">
                {step === "details"
                  ? role === "operator"
                    ? "Operator Login"
                    : "Welcome back"
                  : "Verify OTP"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {step === "details"
                  ? role === "operator"
                    ? "Enter approved operator mobile number or Gmail"
                    : "Login with your mobile number & STB ID"
                  : `We sent a 6-digit code to ${
                      role === "operator" ? operatorContact : "+91 " + mobile
                    }`}
              </p>
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-xl gradient-primary text-primary-foreground shadow-[var(--shadow-glow)] md:hidden">
              {role === "operator" ? <Shield className="h-5 w-5" /> : <Tv className="h-5 w-5" />}
            </div>
          </div>

          {step === "details" ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-muted-foreground">
                  Name
                </label>
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setErr(null);
                  }}
                  placeholder="ENTER YOUR NAME"
                  className="mt-1.5 w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 px-4 text-sm outline-none focus:border-primary/60 focus:shadow-[var(--shadow-glow)]"
                />
              </div>

              {role === "operator" ? (
                <div>
                  <label className="block text-xs uppercase tracking-widest text-muted-foreground">
                    Mobile Number or Gmail
                  </label>
                  <input
                    value={operatorContact}
                    onChange={(e) => handleOperatorContactChange(e.target.value)}
                    placeholder="ENTER OPERATOR MOBILE NUMBER OR GMAIL"
                    className="mt-1.5 w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 px-4 text-sm outline-none focus:border-primary/60 focus:shadow-[var(--shadow-glow)]"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-muted-foreground">
                      Mobile Number
                    </label>
                    <div className="mt-1.5 flex overflow-hidden rounded-2xl border border-white/10 bg-white/5 focus-within:border-primary/60 focus-within:shadow-[var(--shadow-glow)]">
                      <span className="grid place-items-center px-4 text-sm text-muted-foreground">
                        +91
                      </span>
                      <input
                        inputMode="numeric"
                        maxLength={10}
                        value={mobile}
                        onChange={(e) => {
                          setMobile(e.target.value.replace(/\D/g, ""));
                          setErr(null);
                        }}
                        placeholder="ENTER YOUR MOBILE NUMBER"
                        className="w-full bg-transparent py-3.5 pr-4 text-sm outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <label className="block text-xs uppercase tracking-widest text-muted-foreground">
                        12-Digit STB ID / Smart Card Number *
                      </label>
                      <span className={`text-[11px] font-mono font-bold ${stbId.length === 12 ? "text-emerald-400" : "text-amber-400"}`}>
                        {stbId.length}/12
                      </span>
                    </div>
                    <input
                      inputMode="numeric"
                      maxLength={12}
                      value={stbId}
                      onChange={(e) => {
                        setStbId(e.target.value.replace(/\D/g, ""));
                        setErr(null);
                      }}
                      placeholder="ENTER 12-DIGIT STB ID"
                      className="mt-1.5 w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 px-4 text-sm outline-none focus:border-primary/60 focus:shadow-[var(--shadow-glow)] font-mono font-bold placeholder:font-sans placeholder:font-normal"
                    />
                    {stbId.length > 0 && stbId.length < 12 && (
                      <p className="mt-1.5 text-xs text-amber-400/90 font-medium">
                        ⚠️ Enter remaining {12 - stbId.length} digits to unlock OTP verification.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {err && <p className="text-sm text-destructive">{err}</p>}

              <button
                onClick={handleSend}
                disabled={loading || !isFormValid}
                className={`group flex w-full items-center justify-center gap-2 rounded-2xl py-4 font-semibold shadow-[var(--shadow-glow)] transition hover:scale-[1.01] disabled:opacity-40 disabled:pointer-events-none ${
                  role === "operator"
                    ? "bg-[color:var(--neon-cyan)] text-black font-bold shadow-[0_0_20px_rgba(0,210,255,0.4)]"
                    : "gradient-primary text-primary-foreground"
                }`}
              >
                {loading ? (
                  "Sending Verification OTP…"
                ) : role === "operator" ? (
                  <>
                    VERIFY OTP{" "}
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </>
                ) : (
                  <>
                    Send OTP <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </>
                )}
              </button>

              <p className="text-center text-xs text-muted-foreground">
                By continuing you agree to our Terms & Operator Authorization Policy.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <label className="block text-xs uppercase tracking-widest text-muted-foreground">
                Enter Verification OTP
              </label>
              <input
                autoFocus
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="••••••"
                className="w-full rounded-2xl border border-white/10 bg-white/5 py-4 text-center text-3xl tracking-[0.6em] outline-none focus:border-primary/60 focus:shadow-[var(--shadow-glow)]"
              />
              {err && <p className="text-sm text-destructive">{err}</p>}
              <button
                onClick={handleVerify}
                disabled={loading || otp.length !== 6}
                className={`w-full rounded-2xl py-4 font-semibold shadow-[var(--shadow-glow)] transition hover:scale-[1.01] disabled:opacity-40 disabled:pointer-events-none ${
                  role === "operator"
                    ? "bg-[color:var(--neon-cyan)] text-black font-bold shadow-[0_0_20px_rgba(0,210,255,0.4)]"
                    : "gradient-primary text-primary-foreground"
                }`}
              >
                {loading
                  ? "Verifying…"
                  : role === "operator"
                    ? "Verify OTP & Open Operator Panel"
                    : "Verify & Continue"}
              </button>
              <button
                onClick={() => setStep("details")}
                className="w-full text-center text-sm text-muted-foreground hover:text-foreground"
              >
                Back to details
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
