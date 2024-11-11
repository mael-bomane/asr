import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getSEOTags } from "@/lib/seo";
import config from "@/config";

import type { ReactNode } from "react";

export const metadata = getSEOTags({
  title: "summon",
  canonicalUrlRelative: "/summon",
});

export default async function LayoutPrivate({
  children,
}: {
  children: ReactNode;
}) {

  return <>{children}</>;
}
