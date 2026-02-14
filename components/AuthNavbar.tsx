// components/AuthNavbar.tsx
"use client";

import Image from "next/image";

export default function AuthNavbar() {
  return (
    <nav className="bg-transparent backdrop-blur-md rounded-xl p-4 sticky top-4 z-10 mx-4 shadow-md">
      <div className="container mx-auto flex justify-center items-center">
        <Image
          src="/whiteBG.svg"
          alt="The Hive Logo"
          width={200}
          height={56}
          className="object-contain"
          priority
        />
      </div>
    </nav>
  );
}
