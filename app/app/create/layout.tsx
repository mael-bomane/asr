import { getSEOTags } from "@/lib/seo";

import type { ReactNode } from "react";

export const metadata = getSEOTags({
  title: "create",
  canonicalUrlRelative: "/create",
});

export default async function LayoutPrivate({
  children,
}: {
  children: ReactNode;
}) {

  return <>{children}</>;
}
