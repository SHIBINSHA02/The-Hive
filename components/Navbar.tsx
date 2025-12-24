// components/Navbar.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { SignedIn, SignedOut, UserButton, SignInButton } from "@clerk/nextjs";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-transparent backdrop-blur-md rounded-xl p-4 sticky top-4 z-10 mx-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <Image
            src="/whiteBG.svg"
            alt="The Hive Logo"
            width={200}
            height={56}
            className="object-contain"
            priority
          />
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex space-x-6 items-center font-medium">
          <Link href="/#services" className="hover:text-black text-gray-700">
            Services
          </Link>

          <Link href="/#features" className="hover:text-black text-gray-700">
            Features
          </Link>

          <Link href="/#contact" className="hover:text-black text-gray-700">
            Contact
          </Link>

          {/* 👇 When NOT logged in */}
          <SignedOut>
            <SignInButton mode="modal">
              <button className="px-4 py-2 rounded-lg bg-[#014BAC] text-white hover:bg-[#014BAC]/90 transition">
                Login
              </button>
            </SignInButton>
          </SignedOut>

          {/* 👇 When logged in */}
          <SignedIn>
            <Link
              href="/dashboard"
              className="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-black transition"
            >
              Dashboard
            </Link>

            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="focus:outline-none text-gray-700 hover:text-black transition"
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="mt-4 space-y-3 bg-white rounded-lg shadow-lg p-4">
          <Link href="/#services" className="block font-medium"
            onClick={() => setIsOpen(false)}>
            Services
          </Link>

          <Link href="/#features" className="block font-medium"
            onClick={() => setIsOpen(false)}>
            Features
          </Link>

          <Link href="/#contact" className="block font-medium"
            onClick={() => setIsOpen(false)}>
            Contact
          </Link>

          {/* Signed Out */}
          <SignedOut>
            <SignInButton mode="modal">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full mt-2 px-4 py-2 rounded-lg bg-[#014BAC] text-white"
              >
                Login
              </button>
            </SignInButton>
          </SignedOut>

          {/* Signed In */}
          <SignedIn>
            <Link
              href="/dashboard"
              onClick={() => setIsOpen(false)}
              className="block w-full px-4 py-2 rounded-lg bg-gray-900 text-white text-center"
            >
              Dashboard
            </Link>

            <div className="flex justify-center mt-2">
              <UserButton afterSignOutUrl="/" />
            </div>
          </SignedIn>
        </div>
      </div>
    </nav>
  );
}
