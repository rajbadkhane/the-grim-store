"use client";

import { useEffect, useState } from "react";

export function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({
    days: 3,
    hours: 23,
    minutes: 19,
    seconds: 56
  });

  useEffect(() => {
    // Standard client countdown timer
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 3); // 3 days from now
    targetDate.setHours(targetDate.getHours() + 23);
    targetDate.setMinutes(targetDate.getMinutes() + 19);
    targetDate.setSeconds(targetDate.getSeconds() + 56);

    const timer = setInterval(() => {
      const difference = targetDate.getTime() - new Date().getTime();

      if (difference <= 0) {
        clearInterval(timer);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        setTimeLeft({ days, hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num: number) => String(num).padStart(2, "0");

  return (
    <div className="flex items-center gap-4 sm:gap-6 font-black select-none transition-colors duration-300">
      <div className="flex flex-col items-start">
        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-white/50">Days</span>
        <span className="text-2xl sm:text-4xl tracking-tight text-neutral-900 dark:text-white">{formatNumber(timeLeft.days)}</span>
      </div>
      <span className="mt-4 text-lg font-bold text-[#FF3B30]/80 sm:text-xl">:</span>
      <div className="flex flex-col items-start">
        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-white/50">Hours</span>
        <span className="text-2xl sm:text-4xl tracking-tight text-neutral-900 dark:text-white">{formatNumber(timeLeft.hours)}</span>
      </div>
      <span className="mt-4 text-lg font-bold text-[#FF3B30]/80 sm:text-xl">:</span>
      <div className="flex flex-col items-start">
        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-white/50">Minutes</span>
        <span className="text-2xl sm:text-4xl tracking-tight text-neutral-900 dark:text-white">{formatNumber(timeLeft.minutes)}</span>
      </div>
      <span className="mt-4 text-lg font-bold text-[#FF3B30]/80 sm:text-xl">:</span>
      <div className="flex flex-col items-start">
        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-white/50">Seconds</span>
        <span className="text-2xl sm:text-4xl tracking-tight text-neutral-900 dark:text-white">{formatNumber(timeLeft.seconds)}</span>
      </div>
    </div>
  );
}
