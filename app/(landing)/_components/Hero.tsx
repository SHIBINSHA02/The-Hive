"use client"
import React from "react";
import { ArrowRight } from "lucide-react";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="min-h-[85vh] flex items-center justify-center px-6 mt-24 lg:mt-30">
      <div className="max-w-5xl w-full text-center lg:text-left">

        {/* Tag */}
        <p className="text-sm text-slate-500 mb-6 tracking-wide">
          Contract Intelligence Platform
        </p>

        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-slate-900 leading-tight tracking-tight mb-6">
          Smarter Contracts.
          <br />
          <span className="text-slate-400">Less Risk.</span>
        </h1>

        {/* Subtext */}
        <p className="text-lg text-slate-600 max-w-2xl mb-10">
          Generate, analyze, and manage agreements with precision.
          Built for teams that don’t tolerate ambiguity.
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4">

          <SignedOut>
            <SignInButton mode="modal">
              <button className="px-6 py-3 bg-slate-900 text-white rounded-xl text-base font-medium hover:bg-slate-800 transition flex items-center justify-center">
                Get Started <ArrowRight className="ml-2 w-4 h-4" />
              </button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-slate-900 text-white rounded-xl text-base font-medium hover:bg-slate-800 transition flex items-center justify-center"
            >
              Dashboard <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </SignedIn>

          <a
            href="#demo"
            className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl text-base hover:bg-slate-100 transition text-center"
          >
            Watch Demo
          </a>
        </div>

        {/* Stats */}
        <div className="mt-12 flex gap-10 text-left">
          <div>
            <p className="text-2xl font-semibold text-slate-900">99%</p>
            <p className="text-sm text-slate-500">Accuracy</p>
          </div>
          <div>
            <p className="text-2xl font-semibold text-slate-900">10x</p>
            <p className="text-sm text-slate-500">Faster</p>
          </div>
        </div>

      </div>
    </section>
  );
}