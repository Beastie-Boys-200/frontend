'use client';

import dynamic from "next/dynamic";
import { NavbarWithModal } from "@/components/layout/NavbarWithModal";

const HeroSection = dynamic(
  () => import("@/components/sections/HeroSection").then((mod) => ({ default: mod.HeroSection })),
  { ssr: false }
);

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950">
      {/* Navbar */}
      <NavbarWithModal />

      {/* Hero Section */}
      <HeroSection />
    </div>
  );
}