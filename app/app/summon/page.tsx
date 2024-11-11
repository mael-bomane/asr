import Header from "@/components/Header";
import { Suspense } from "react";
import { SummonForm } from "@/components/SummonForm";

export const dynamic = "force-dynamic";

// This is a private page: It's protected by the layout.js component which ensures the user is authenticated.
// It's a server compoment which means you can fetch data (like the user profile) before the page is rendered.
// See https://shipfa.st/docs/tutorials/private-page
export default async function Summon() {
  return (
    <div className="min-h-screen flex flex-col">
      <Suspense>
        <Header />
      </Suspense>
      <main className="flex flex-col items-center grow bg-[url('/lava.gif')] text-base-content p-8">
        <SummonForm />
      </main>
    </div>
  );
}
