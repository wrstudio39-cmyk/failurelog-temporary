"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    setLoading(false);
    setDone(true);
  }

  async function handleGithubSignup() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "github",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
  }

  if (done) {
    return (
      <div className="mx-auto max-w-sm px-5 py-24 text-center">
        <div className="field-label mb-2">Check your email</div>
        <p className="font-body text-ink-soft">Confirm your account, then log in.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto grid min-h-[calc(100vh-73px)] max-w-7xl items-center gap-12 px-5 py-12 lg:grid-cols-[1fr_400px] lg:px-8">
      <div className="hidden lg:block"><div className="field-label">FailureLog / private access</div><h1 className="mt-5 display-lg max-w-xl">Create your account.<br /><span className="signal-word">Start reading failures. Then list one.</span></h1><p className="mt-6 max-w-lg font-body text-lg leading-8 text-ink-soft">Your account is the doorway to buying useful abandoned products or documenting one of your own.</p></div>
      <div className="doc-card p-6 sm:p-8">
      <div className="field-label mb-2">Sign up</div>
      <h1 className="font-display text-3xl font-bold tracking-[-.04em]">Create an account</h1>

      <button onClick={handleGithubSignup} className="btn-secondary mt-6 w-full">
        Continue with GitHub
      </button>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-hairline" />
        <span className="font-mono text-[11px] uppercase text-ink-soft">or</span>
        <div className="h-px flex-1 bg-hairline" />
      </div>

      <form onSubmit={handleSignup} className="space-y-4">
        <div>
          <label className="label" htmlFor="signup-name">Name</label>
          <input id="signup-name" autoComplete="name" required className="input" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="signup-email">Email</label>
          <input id="signup-email" type="email" autoComplete="email" required className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="signup-password">Password</label>
          <input id="signup-password" type="password" autoComplete="new-password" required minLength={6} className="input" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <p role="alert" className="font-mono text-xs text-brick">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Creating account…" : "Sign up"}
        </button>
      </form>

      <div className="mt-6 border-t border-hairline pt-5" />
      <p className="mt-5 text-center font-body text-sm text-ink-soft">
        Already have an account? <Link href="/login" className="text-amber">Log in</Link>
      </p>
      </div>
    </div>
  );
}
