
import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default async function LayoutBlog({ children }: { children: any }) {
  return (
    <div>
      <Suspense>
        <Header />
      </Suspense>

      <main className="min-h-screen max-w-screen md:max-w-6xl mx-auto md:p-8">{children}</main>
      <div className="h-24" />
      <Footer />
    </div>
  );
}