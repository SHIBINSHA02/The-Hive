// components/Navbar.tsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";

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
        <div className="hidden md:flex space-x-4">
          <Link
            href="/#services"
            className="hover:text-[#ffffff] text-[#000000] transition-colors"
          >
            Services
          </Link>

          <Link
            href="/#features"
            className="hover:text-[#fdfdfd] text-[#000000] transition-colors"
          >
            Features
          </Link>

          <Link
            href="/#contact"
            className="hover:text-[#ffffff] text-[#000000] transition-colors"
          >
            Contact
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="focus:outline-none text-gray-700 hover:text-[#fafafa] transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Links */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
          }`}
      >
        <div className="mt-4 space-y-3 bg-white rounded-lg shadow-lg p-4">
          <Link
            href="/#services"
            className="block text-gray-700 hover:text-[#dddfe4] transition-colors font-medium py-2 border-b border-gray-100"
            onClick={() => setIsOpen(false)}
          >
            Services
          </Link>

          <Link
            href="/#features"
            className="block text-gray-700 hover:text-[#dddfe4] transition-colors font-medium py-2 border-b border-gray-100"
            onClick={() => setIsOpen(false)}
          >
            Features
          </Link>

          <Link
            href="/#contact"
            className="block text-gray-700 hover:text-[#dddfe4] transition-colors font-medium py-2"
            onClick={() => setIsOpen(false)}
          >
            Contact
          </Link>
        </div>
      </div>
    </nav>
  );
}
