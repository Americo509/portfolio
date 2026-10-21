"use client";

import * as React from "react";
import { MotionConfig as FMConfig } from "motion/react";

export function MotionRoot({ children }: { children: React.ReactNode }) {
  return <FMConfig reducedMotion="user">{children}</FMConfig>;
}