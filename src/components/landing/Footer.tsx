"use client";

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] px-4 py-8">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm tracking-tight text-white">StackSense</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        </div>

        <div className="flex items-center gap-6 text-xs text-zinc-500">
          <a href="#" className="hover:text-zinc-300 transition-colors">Privacy</a>
          <a href="#" className="hover:text-zinc-300 transition-colors">Terms</a>
          <a href="#" className="hover:text-zinc-300 transition-colors">Docs</a>
          <a href="#" className="hover:text-zinc-300 transition-colors">Status</a>
        </div>

        <p className="text-xs text-zinc-600">
          © {new Date().getFullYear()} StackSense. Built with Next.js & Vercel AI SDK.
        </p>
      </div>
    </footer>
  );
}
