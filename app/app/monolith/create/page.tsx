import Header from "@/components/Header";
import { Suspense } from "react";
import { CreateForm } from "@/components/CreateForm";

export const dynamic = "force-dynamic";

export default async function Summon() {
  return (
    <main className="w-full md:max-w-7xl mx-auto bg-[#000] flex flex-col items-center justify-center grow border rounded-xl">
      <CreateForm />
    </main >
  );
}
