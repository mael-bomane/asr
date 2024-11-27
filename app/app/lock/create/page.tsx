import { CreateLockForm } from "@/components/CreateLockForm";

export const dynamic = "force-dynamic";

export default async function Summon() {
  return (
    <main className="w-full mx-auto flex flex-col items-center justify-center  bg-primary grow py-12">
      <CreateLockForm />
    </main >
  );
}
