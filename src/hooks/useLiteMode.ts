"use client";

import { useEffect, useState } from "react";

function detectLiteMode() {
  if (typeof navigator === "undefined") {
    return false;
  }

  const navigatorInfo = navigator as Navigator & {
    deviceMemory?: number;
    hardwareConcurrency?: number;
  };

  const prefersReducedMotion =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const deviceMemory =
    typeof navigatorInfo.deviceMemory === "number" ? navigatorInfo.deviceMemory : undefined;
  const hardwareConcurrency =
    typeof navigatorInfo.hardwareConcurrency === "number"
      ? navigatorInfo.hardwareConcurrency
      : undefined;

  const userAgent = navigatorInfo.userAgent;
  const isSafari = /Safari/i.test(userAgent) && !/Chrome|Chromium|Edg|Android/i.test(userAgent);
  const safariVersionMatch = userAgent.match(/Version\/(\d+)\./i);
  const safariVersion = safariVersionMatch ? Number(safariVersionMatch[1]) : null;
  const isOldSafari = isSafari && safariVersion !== null && safariVersion < 16;

  const lowMemory = deviceMemory !== undefined && deviceMemory <= 4;
  const lowCpu = hardwareConcurrency !== undefined && hardwareConcurrency <= 4;

  return prefersReducedMotion || lowMemory || lowCpu || isOldSafari;
}

export function useLiteMode() {
  const [isLiteMode, setIsLiteMode] = useState(false);

  useEffect(() => {
    setIsLiteMode(detectLiteMode());
  }, []);

  return isLiteMode;
}
