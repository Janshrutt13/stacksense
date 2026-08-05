"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import MagneticButton from "./MagneticButton";

interface NavbarProps {
  onCtaClick: () => void;
}

const NAV_LINKS = [
  { href: "#market-data", label: "Market Data" },
  { href: "#features", label: "Features" },
  { href: "#roadmap-preview", label: "Roadmaps" },
  { href: "#comparison", label: "Comparison" },
  { href: "#faq", label: "FAQ" },
];

export default function Navbar({ onCtaClick }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 20);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function handleNavClick(href: string) {
    setMobileOpen(false);
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-3xl px-4"
      >
        <div
          className={`flex items-center justify-between px-5 py-3 rounded-full border backdrop-blur-xl transition-all duration-300 ${
            scrolled
              ? "bg-zinc-900/80 border-zinc-800/80 shadow-lg shadow-black/20"
              : "bg-zinc-900/60 border-white/[0.08]"
          }`}
        >
          {/* Logo */}
          <a href="#" className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-tight text-white">StackSense</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </a>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="text-sm text-zinc-400 hover:text-white transition-colors duration-200"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <a
              href="/auth"
              className="hidden md:block text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Dashboard
            </a>
            <MagneticButton
              onClick={onCtaClick}
              className="text-sm font-medium px-4 py-2 rounded-full bg-cyan-400 text-black hover:bg-cyan-300 transition-colors"
            >
              Find My Stack
            </MagneticButton>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden text-zinc-400 hover:text-white transition-colors"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-3xl"
          >
            <div className="rounded-2xl border border-white/[0.08] bg-zinc-900/95 backdrop-blur-xl p-4 space-y-1">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.href}
                  onClick={() => handleNavClick(link.href)}
                  className="block w-full text-left px-4 py-3 text-sm text-zinc-400 hover:text-white hover:bg-white/[0.04] rounded-xl transition-colors"
                >
                  {link.label}
                </button>
              ))}
              <div className="pt-2 border-t border-white/[0.06]">
                <button
                  onClick={() => { setMobileOpen(false); onCtaClick(); }}
                  className="block w-full text-left px-4 py-3 text-sm text-zinc-400 hover:text-white hover:bg-white/[0.04] rounded-xl transition-colors"
                >
                  Dashboard
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
