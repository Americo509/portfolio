import type { Metadata } from "next";
import { NotFoundView } from "@/views/NotFoundView";

export const metadata: Metadata = { robots: { index: false } };

export default function NotFound() {
  return <NotFoundView locale="pt" />;
}
