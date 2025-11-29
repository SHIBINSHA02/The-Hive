// components/Sidebar.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { X, Menu } from "lucide-react"; // Import Menu icon

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    onOpen: () => void; // Added onOpen to handle the mobile trigger
}

export default function Sidebar({ isOpen, onClose, onOpen }: SidebarProps) {
    return (
        <>
            {/* ========================================================== */}
            {/* 1. MOBILE TOP NAVBAR (Visible on Mobile Only)              */}
            {/* ========================================================== */}
            <div className="fixed top-0 left-0 right-0 h-16 bg-white  flex items-center justify-between px-4 z-30 md:hidden">
                {/* Logo in Mobile Header */}
                <Link href="/" className="flex items-center">
                    <Image
                        src="/whiteBG.svg"
                        alt="The Hive Logo"
                        width={120} // Slightly smaller for mobile
                        height={34}
                        className="object-contain"
                    />
                </Link>

                {/* Hamburger Button to Open Sidebar */}
                <button
                    onClick={onOpen}
                    className="p-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                    aria-label="Open Menu"
                >
                    <Menu size={24} />
                </button>
            </div>

            {/* ========================================================== */}
            {/* 2. OVERLAY (Backdrop for Mobile Drawer)                    */}
            {/* ========================================================== */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 md:hidden"
                    onClick={onClose}
                />
            )}

            {/* ========================================================== */}
            {/* 3. SIDEBAR DRAWER (Desktop: Static, Mobile: Sliding)       */}
            {/* ========================================================== */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-50  p-6 transition-transform duration-300 ease-in-out h-[70vh] overflow-y-auto
                ${isOpen ? "translate-x-0" : "-translate-x-full"} 
                md:translate-x-0 md:static md:block md:h-screen`}
            >
                {/* Mobile Header INSIDE the drawer (To close it) */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center space-x-2">
                        <Link href="/" onClick={onClose} className="text-xl font-extrabold text-indigo-600">
                            <Image
                                src="/whiteBG.svg"
                                alt="The Hive Logo"
                                width={150}
                                height={42}
                                className="object-contain"
                            />
                        </Link>
                    </div>

                    {/* Close Button - Visible on Mobile only */}
                    <button onClick={onClose} className="p-1 md:hidden text-gray-700 hover:text-black transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <h3 className="hidden md:block font-bold text-gray-700 mb-4 mt-6 border-t pt-4">User Menu</h3>

                <ul className="space-y-2">
                    <li className="font-medium text-black hover:bg-gray-200 p-2 rounded-lg transition-colors">
                        <Link href="/dashboard" onClick={onClose}>Overview</Link>
                    </li>
                    <li className="text-gray-500 hover:text-black hover:bg-gray-200 p-2 rounded-lg transition-colors">
                        <Link href="/dashboard/contracts" onClick={onClose}>My Contracts</Link>
                    </li>
                    <li className="text-gray-500 hover:text-black hover:bg-gray-200 p-2 rounded-lg transition-colors">
                        <Link href="/dashboard/lifecycle" onClick={onClose}>Lifecycle</Link>
                    </li>
                    <li className="text-gray-500 hover:text-black hover:bg-gray-200 p-2 rounded-lg transition-colors">
                        <Link href="/dashboard/requests" onClick={onClose}>Contract Requests</Link>
                    </li>
                    <li className="text-gray-500 hover:text-black hover:bg-gray-200 p-2 rounded-lg transition-colors">
                        <Link href="/dashboard/notifications" onClick={onClose}>Notifications</Link>
                    </li>
                    <li className="text-gray-500 hover:text-black hover:bg-gray-200 p-2 rounded-lg transition-colors">
                        <Link href="/dashboard/settings" onClick={onClose}>Settings</Link>
                    </li>
                </ul>
            </aside>
        </>
    );
}