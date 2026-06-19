"use client";

import { useState, useEffect } from "react";

export default function CountdownTimer({ endTime }: { endTime: string }) {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    const calculateTime = () => {
      const difference = +new Date(endTime) - +new Date();
      if (difference <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    // Use a timeout to avoid calling setState synchronously within the effect body
    const timeout = setTimeout(() => {
      setTimeLeft(calculateTime());
    }, 0);

    const interval = setInterval(() => {
      setTimeLeft(calculateTime());
    }, 1000);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [endTime]);

  if (!timeLeft) return null;

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex gap-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 w-full justify-center">
      <div className="bg-gray-800/80 backdrop-blur-sm text-white flex flex-col items-center justify-center w-10 h-12 rounded-sm shadow-lg border border-gray-600/50">
        <span className="text-sm font-bold leading-none mt-1">{pad(timeLeft.days)}</span>
        <span className="text-[7px] text-gray-300 mt-1 tracking-wider">DIAS</span>
      </div>
      <div className="bg-gray-800/80 backdrop-blur-sm text-white flex flex-col items-center justify-center w-10 h-12 rounded-sm shadow-lg border border-gray-600/50">
        <span className="text-sm font-bold leading-none mt-1">{pad(timeLeft.hours)}</span>
        <span className="text-[7px] text-gray-300 mt-1 tracking-wider">HORAS</span>
      </div>
      <div className="bg-gray-800/80 backdrop-blur-sm text-white flex flex-col items-center justify-center w-10 h-12 rounded-sm shadow-lg border border-gray-600/50">
        <span className="text-sm font-bold leading-none mt-1">{pad(timeLeft.minutes)}</span>
        <span className="text-[7px] text-gray-300 mt-1 tracking-wider">MIN</span>
      </div>
      <div className="bg-gray-800/80 backdrop-blur-sm text-white flex flex-col items-center justify-center w-10 h-12 rounded-sm shadow-lg border border-gray-600/50">
        <span className="text-sm font-bold leading-none mt-1">{pad(timeLeft.seconds)}</span>
        <span className="text-[7px] text-gray-300 mt-1 tracking-wider">SEG</span>
      </div>
    </div>
  );
}
