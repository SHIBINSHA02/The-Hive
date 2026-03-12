// components/Sidebar.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { X, Menu } from "lucide-react";

import {
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
  SignInButton,
  SignOutButton,
} from "@clerk/nextjs";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
}

export default function Sidebar({ isOpen, onClose, onOpen }: SidebarProps) {
  const { user } = useUser();

  return (
    <>
      {/* ================= MOBILE TOP NAV ================= */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-white flex items-center justify-between px-4 z-30 md:hidden">
        <Link href="/" className="flex items-center">
          <Image
            src="/whiteBG.svg"
            alt="The Hive Logo"
            width={120}
            height={34}
            className="object-contain"
          />
        </Link>

        <button
          onClick={onOpen}
          className="p-2 text-gray-700 hover:bg-gray-100 rounded-md transition"
          aria-label="Open Menu"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* ================= OVERLAY ================= */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
        />
      )}

      {/* ================= SIDEBAR ================= */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64  p-6 transition-transform duration-300 ease-in-out  overflow-y-auto bg-white
        ${isOpen ? "translate-x-0" : "-translate-x-full"} 
        md:translate-x-0 md:static md:block md:h-screen`}
      >
        {/* -------- Mobile Close Header -------- */}
        <div className="flex justify-between items-center mb-6">
          <Link href="/" onClick={onClose}>
            <Image
              src="/whiteBG.svg"
              alt="The Hive Logo"
              width={150}
              height={42}
              className="object-contain"
            />
          </Link>

          <button
            onClick={onClose}
            className="p-1 md:hidden text-gray-700 hover:text-black transition"
          >
            <X size={24} />
          </button>
        </div>

        {/* ================= WHEN LOGGED IN ================= */}
        <SignedIn>
          {/* User Profile Header */}
          <div className="  rounded-xl p-4 mb-6 ">
            <div className="flex items-center space-x-3">
              <UserButton appearance={{ elements: { avatarBox: "h-10 w-10" } }} />
              <div>
                <p className="font-semibold text-gray-800">
                  {user?.fullName || "User"}
                </p>
                <p className="text-gray-500 text-sm">
                  {user?.primaryEmailAddress?.emailAddress}
                </p>
              </div>
            </div>
          </div>

          <h3 className="hidden md:block font-bold text-gray-700 mb-4 mt-2 border-t pt-4">
            User Menu
          </h3>

          <ul className="space-y-2">
            <li className="font-medium text-black hover:bg-gray-200 p-2 rounded-lg transition">
              <Link href="/dashboard" onClick={onClose}>
                Overview
              </Link>
            </li>
            <li className="text-gray-600 hover:text-black hover:bg-gray-200 p-2 rounded-lg transition">
              <Link href="/dashboard/mycontracts" onClick={onClose}>
                My Contracts
              </Link>
            </li>
            <li className="text-gray-600 hover:text-black hover:bg-gray-200 p-2 rounded-lg transition">
              <Link href="/dashboard/requests" onClick={onClose}>
                Contract Requests
              </Link>
            </li>
            <li className="text-gray-600 hover:text-black hover:bg-gray-200 p-2 rounded-lg transition">
              <Link href="/dashboard/lifecycle" onClick={onClose}>
                Lifecycle
              </Link>
            </li>
            <li className="text-gray-600 hover:text-black hover:bg-gray-200 p-2 rounded-lg transition">
              <Link href="/dashboard/notifications" onClick={onClose}>
                Notifications
              </Link>
            </li>
            <li className="text-gray-600 hover:text-black hover:bg-gray-200 p-2 rounded-lg transition">
              <Link href="/dashboard/settings" onClick={onClose}>
                Settings
              </Link>
            </li>
          </ul>

          {/* Logout Button */}
          <div className="mt-8">
            <SignOutButton redirectUrl="/">
              <button className="w-full border-red-600 border hover:bg-red-200 text-red-600 bg-red-50 py-2 rounded-lg transition">
                Logout
              </button>
            </SignOutButton>
          </div>
        </SignedIn>

        {/* ================= WHEN LOGGED OUT ================= */}
        <SignedOut>
          <div className="mt-20 text-center">
            <p className="text-gray-600 mb-4 font-medium">
              Please login to access dashboard
            </p>

            <SignInButton mode="modal">
              <button className="w-full bg-blue-700 hover:bg-blue-800 text-white py-2 rounded-lg font-semibold transition">
                Login
              </button>
            </SignInButton>
          </div>
        </SignedOut>
      </aside>
    </>
  );
}
