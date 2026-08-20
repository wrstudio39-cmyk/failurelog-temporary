"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return <main className="mx-auto flex min-h-[75vh] max-w-2xl flex-col items-center justify-center px-5 text-center"><span className="case-stamp case-stamp--pending">Archive interruption</span><h1 className="mt-5 font-display text-5xl font-bold tracking-[-.05em]">Something broke before the case opened.</h1><p className="mt-4 max-w-lg font-body leading-7 text-ink-soft">Try again. If the problem persists, return to the archive and continue from there.</p><div className="mt-7 flex gap-2"><button onClick={() => reset()} className="btn-primary">Try again</button><Link href="/marketplace" className="btn-secondary">Browse archive</Link></div></main>;
}
