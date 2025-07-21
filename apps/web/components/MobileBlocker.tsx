"use client";

import { useEffect, useState } from "react";
import { Monitor, Smartphone, Music } from "lucide-react";

export default function MobileBlocker({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobile, setIsMobile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkIfMobile = () => {
      const userAgent =
        navigator.userAgent ||
        navigator.vendor ||
        (window as Window & typeof globalThis & { opera?: string }).opera ||
        "";

      // Check for mobile devices
      const mobileRegex =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      const isMobileDevice = mobileRegex.test(userAgent);

      // Also check screen width as a fallback
      const isSmallScreen = window.innerWidth < 768;

      setIsMobile(isMobileDevice || isSmallScreen);
      setIsLoading(false);
    };

    checkIfMobile();

    // Listen for resize events to catch orientation changes
    const handleResize = () => {
      const isSmallScreen = window.innerWidth < 768;
      const userAgent =
        navigator.userAgent ||
        navigator.vendor ||
        (window as Window & typeof globalThis & { opera?: string }).opera ||
        "";
      const mobileRegex =
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      const isMobileDevice = mobileRegex.test(userAgent);
      setIsMobile(isMobileDevice || isSmallScreen);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin" />
          <div className="absolute inset-0 w-16 h-16 rounded-full bg-pink-500/20 animate-ping" />
        </div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="relative mx-auto w-20 h-20 mb-6">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                <Music className="w-10 h-10 text-white" />
              </div>
              <div className="absolute inset-0 w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 animate-ping opacity-20" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
              You Listen
            </h1>
          </div>

          {/* Mobile Block Message */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-3xl blur-xl" />
            <div className="relative glass rounded-3xl p-8 text-center space-y-6">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                <Smartphone className="w-8 h-8 text-white" />
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white">
                  Desktop Experience Only
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  You Listen is designed for the best audio experience on
                  desktop devices. Please access our platform using a computer
                  for the full music streaming experience.
                </p>
              </div>

              <div className="flex items-center justify-center space-x-3 p-4 bg-white/10 rounded-xl">
                <Monitor className="w-6 h-6 text-pink-400" />
                <span className="text-gray-300 font-medium">
                  Switch to desktop to continue
                </span>
              </div>

              <div className="pt-4 space-y-2">
                <p className="text-sm text-gray-400">Why desktop only?</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>• Optimized audio controls and quality</li>
                  <li>• Full-featured music management</li>
                  <li>• Enhanced user interface</li>
                  <li>• Better performance and stability</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-gray-400 text-sm">Thank you for understanding</p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
