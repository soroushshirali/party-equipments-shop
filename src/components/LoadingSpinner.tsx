"use client";

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="relative w-16 h-16">
        {/* Outer circle */}
        <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
        {/* Spinning circle */}
        <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
      </div>
    </div>
  );
} 