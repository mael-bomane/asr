import Header from "@/components/Header";
import { Suspense } from "react";
import { CreateForm } from "@/components/CreateForm";

export const dynamic = "force-dynamic";

export default async function Summon() {
  return (
    <div className="min-h-screen flex flex-col">
      <Suspense>
        <Header />
      </Suspense>
      <main className="flex flex-col items-center grow bg-[url('/lava.gif')] text-base-content p-8">
        <CreateForm />
      </main>
    </div>
  );
}
