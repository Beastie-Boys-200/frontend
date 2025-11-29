'use client';

import { Navbar } from "@/components/layout/Navbar";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      <main className="container mx-auto px-4 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-white mb-6">
            Welcome to Our Platform
          </h1>
          <p className="text-xl text-gray-400">
            Your journey starts here
          </p>
        </div>
      </main>
    </div>
  );
}