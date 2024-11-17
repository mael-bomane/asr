import { Suspense } from "react";
import { CreateLockForm } from "@/components/CreateLockForm";

export const dynamic = "force-dynamic";

export default async function Summon() {
  return (
    <main className="w-full md:max-w-7xl mx-auto flex flex-col items-center justify-center grow">
      <Suspense>
        <CreateLockForm />
      </Suspense>
    </main >
  );
}
