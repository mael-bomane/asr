
import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default async function LayoutBlog({ children }: { children: any }) {
  return (
    <div className="">
      <Suspense>
        <Header />
      </Suspense>

      <main className="min-h-screen w-full mx-auto md:p-8 border-t">{children}</main>
      <div className="h-24" />
      <Footer />
    </div>
  );
}
