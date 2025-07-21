"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Music, Home, Library, User, Search } from "lucide-react";

const links = [
  { name: "Home", href: "/", icon: Home },
  { name: "Library", href: "/library", icon: Library },
  { name: "Profile", href: "/profile", icon: User },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 glass text-white shadow-2xl z-50 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center transform group-hover:scale-110 transition-all duration-300">
              <Music className="w-5 h-5 text-white" />
            </div>
            <div className="absolute inset-0 w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 animate-ping opacity-20"></div>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
            You Listen
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center space-x-2">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.name}
                href={link.href}
                className={cn(
                  "flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 font-medium",
                  isActive
                    ? "bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-300 backdrop-blur-sm border border-pink-500/30"
                    : "hover:bg-white/10 text-gray-300 hover:text-white"
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:block">{link.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Search (placeholder for future) */}
        <div className="hidden md:flex items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search songs, artists..."
              className="w-64 pl-10 pr-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all duration-300"
            />
          </div>
        </div>
      </div>
    </nav>
  );
}
