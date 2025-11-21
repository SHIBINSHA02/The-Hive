// components/Footer.tsx
"use client"
import React from 'react'

export default function Footer() {
  return (
    <footer id="contact" className="bg-blue-600 text-white py-8 rounded-t-4xl">
      <div className="container mx-auto text-center">
        <h3 className="text-xl font-semibold mb-4">Contact Us</h3>
        <p className="mb-4">Have questions? Reach out to us at <a href="mailto:info@thehive.ai" className="underline">info@thehive.ai</a></p>
        <p>&copy; 2025 The Hive. All rights reserved.</p>
      </div>
    </footer>
  );
}