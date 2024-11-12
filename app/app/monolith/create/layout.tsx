import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { getSEOTags } from "@/lib/seo";

import { Suspense, type ReactNode } from "react";

export const metadata = getSEOTags({
  title: "create",
  canonicalUrlRelative: "/create",
});

export default async function LayoutBlog({ children }: { children: any }) {
  return (
    <div className="bg-[#000]">
      <Suspense>
        <Header />
      </Suspense>

      <main className="min-h-screen w-full mx-auto md:p-8 border-t">{children}</main>
    </div>
  );
}
