
import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default async function LayoutBlog({ children }: { children: any }) {
  return (
    <main className="min-h-screen w-full mx-auto md:p-8">{children}</main>
  );
}
