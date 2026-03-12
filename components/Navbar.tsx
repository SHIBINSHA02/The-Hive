// components/Navbar.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { SignedIn, SignedOut, UserButton, SignInButton } from "@clerk/nextjs";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 w-full h-16 pointer-events-none">
      <nav className="bg-white/70 backdrop-blur-xl border border-slate-200/50 shadow-[0_8px_32px_rgba(0,0,0,0.06)] rounded-full px-6 flex justify-between items-center max-w-5xl w-full pointer-events-auto transition-all duration-300">
        
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="transition-transform hover:scale-105 active:scale-95">
            <Image
              src="/whiteBG.svg"
              alt="The Hive Logo"
              width={160}
              height={45}
              className="object-contain"
              priority
            />
          </Link>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex space-x-1 items-center bg-slate-100/50 rounded-full px-2 py-1">
          <Link href="/#services" className="px-5 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-full hover:bg-white transition-all">
            Services
          </Link>
          <Link href="/#features" className="px-5 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-full hover:bg-white transition-all">
            Features
          </Link>
          <Link href="/#contact" className="px-5 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 rounded-full hover:bg-white transition-all">
            Contact
          </Link>
        </div>

        {/* Auth Buttons Desktop */}
        <div className="hidden md:flex items-center space-x-3">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="px-6 py-2.5 rounded-full bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-900/20 active:scale-95 transition-all">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <Link
              href="/dashboard"
              className="px-5 py-2.5 rounded-full bg-blue-50 text-blue-600 text-sm font-medium hover:bg-blue-100 transition-colors"
            >
              Dashboard
            </Link>
            <div className="border-l border-slate-200 pl-3 ml-1 flex items-center">
              <UserButton afterSignOutUrl="/" appearance={{ elements: { userButtonAvatarBox: "w-9 h-9" } }} />
            </div>
          </SignedIn>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 -mr-2 text-slate-600 hover:text-slate-900 bg-slate-100 rounded-full transition-colors focus:outline-none"
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      <div
        className={`fixed top-24 left-4 right-4 md:hidden overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] z-40 ${
          isOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-4 pointer-events-none"
        }`}
      >
        <div className="bg-white/90 backdrop-blur-xl border border-slate-200/60 rounded-3xl shadow-2xl p-6 flex flex-col space-y-2">
          <Link href="/#services" className="p-3 text-center text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors"
            onClick={() => setIsOpen(false)}>
            Services
          </Link>
          <Link href="/#features" className="p-3 text-center text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors"
            onClick={() => setIsOpen(false)}>
            Features
          </Link>
          <Link href="/#contact" className="p-3 text-center text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors"
            onClick={() => setIsOpen(false)}>
            Contact
          </Link>

          <div className="h-px bg-slate-100 my-2 w-full" />

          {/* Signed Out Mobile */}
          <SignedOut>
            <SignInButton mode="modal">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full mt-2 px-4 py-3 rounded-2xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors"
              >
                Sign In
              </button>
            </SignInButton>
          </SignedOut>

          {/* Signed In Mobile */}
          <SignedIn>
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="w-full px-4 py-3 rounded-2xl bg-blue-50 text-blue-600 font-medium text-center hover:bg-blue-100 transition-colors"
            >
              Dashboard
            </Link>

            <div className="flex justify-center mt-4">
              <UserButton afterSignOutUrl="/" />
            </div>
          </SignedIn>
        </div>
      </div>
    </div>
  );
}
