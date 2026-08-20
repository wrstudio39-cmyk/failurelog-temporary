"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setError(error.message);
    else window.location.href = "/dashboard";
  }

  async function handleGithubLogin() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
  }

  return (
    <div className="mx-auto grid min-h-[calc(100vh-73px)] max-w-7xl items-center gap-12 px-5 py-12 lg:grid-cols-[1fr_400px] lg:px-8">
      <div className="hidden lg:block"><div className="field-label">FailureLog / private access</div><h1 className="mt-5 display-lg max-w-xl">Welcome back.<br /><span className="signal-word">The archive is waiting.</span></h1><p className="mt-6 max-w-lg font-body text-lg leading-8 text-ink-soft">Your account is the doorway to buying useful abandoned products or documenting one of your own.</p></div>
      <div className="doc-card p-6 sm:p-8">
      <div className="field-label mb-2">Log in</div>
      <h1 className="font-display text-3xl font-bold tracking-[-.04em]">Welcome back</h1>

      <button onClick={handleGithubLogin} className="btn-secondary mt-6 w-full">
        Continue with GitHub
      </button>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-hairline" />
        <span className="font-mono text-[11px] uppercase text-ink-soft">or</span>
        <div className="h-px flex-1 bg-hairline" />
      </div>

      <form onSubmit={handleEmailLogin} className="space-y-4">
        <div>
          <label className="label" htmlFor="login-email">Email</label>
          <input id="login-email" type="email" autoComplete="email" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="login-password">Password</label>
          <input id="login-password" type="password" autoComplete="current-password" required className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <p role="alert" className="font-mono text-xs text-brick">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Logging in…" : "Log in"}
        </button>
      </form>

      <div className="mt-6 border-t border-hairline pt-5" />
      <p className="mt-5 text-center font-body text-sm text-ink-soft">
        No account? <Link href="/signup" className="text-amber">Sign up</Link>
      </p>
      </div>
    </div>
  );
}
