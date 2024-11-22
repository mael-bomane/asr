import { Suspense } from "react";
import { CreateProposalForm } from "@/components/CreateProposalForm";

export const dynamic = "force-dynamic";

export default async function CreateProposalPage() {
  return (
    <main className="w-full mx-auto bg-primary text-base-content  flex flex-col items-center justify-center grow rounded-xl">
      <CreateProposalForm />
    </main >
  );
}
