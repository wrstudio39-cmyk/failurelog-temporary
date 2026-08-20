import Link from "next/link";

export default function NotFound() {
  return <main className="mx-auto flex min-h-[75vh] max-w-2xl flex-col items-center justify-center px-5 text-center"><span className="case-stamp case-stamp--abandoned">Case not found</span><h1 className="mt-5 font-display text-5xl font-bold tracking-[-.05em]">This file was never logged.</h1><p className="mt-4 max-w-lg font-body leading-7 text-ink-soft">The project may have been removed, renamed, or never published to the archive.</p><Link href="/marketplace" className="btn-primary mt-7">Return to the archive</Link></main>;
}
