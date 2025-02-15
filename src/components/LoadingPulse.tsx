"use client";

export function LoadingPulse() {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 bg-blue-500 rounded-full opacity-75 animate-ping"></div>
        <div className="relative bg-blue-500 rounded-full w-20 h-20"></div>
      </div>
    </div>
  );
} 