"use client";

import * as React from "react";
import { MotionConfig as FMConfig } from "framer-motion";

export function MotionRoot({ children }: { children: React.ReactNode }) {
  return <FMConfig reducedMotion="user">{children}</FMConfig>;
}