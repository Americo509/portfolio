import type { Metadata, Viewport } from "next";
import { RootShell } from "@/components/RootShell";
import { pageMetadata } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  ...pageMetadata({ locale: "pt", path: "/" }),
  robots: { index: true, follow: true }
};

export const viewport: Viewport = {
  themeColor: "#080808",
  colorScheme: "dark light"
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <RootShell locale="pt">{children}</RootShell>;
}
