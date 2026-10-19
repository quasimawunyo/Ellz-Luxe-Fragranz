"use client";

import { usePathname } from "next/navigation";
import { AnnouncementBar } from "@/components/layout/announcement-bar";

export function PublicAnnouncement({ location, phone }: { location: string; phone: string }) {
  const pathname = usePathname();
  if (pathname === "/") return null;
  return <AnnouncementBar location={location} phone={phone} />;
}
