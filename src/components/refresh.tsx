"use client";

import { useEffect } from "react";

export default function RefreshOnTime({ time }: { time: number }) {
  useEffect(() => {
    const timer = setTimeout(() => window.location.reload(), time);
    return () => clearTimeout(timer);
  }, [time]);
  return <></>;
}
