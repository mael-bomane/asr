import { CreateProposalForm } from "@/components/CreateProposalForm";
import { getSEOTags } from "@/lib/seo";
import Image from "next/image";

export async function generateMetadata() {

  return getSEOTags({
    title: "monolith",
    description: "summon a monolith, become stakeholder",
    canonicalUrlRelative: `/monolith`,
    extraTags: {
      openGraph: {
        title: "monolith",
        description: "summon a monolith, become stakeholder",
        url: `/monolith`,
        images: [
          {
            url: "",
            width: 1200,
            height: 660,
          },
        ],
        locale: "en_US",
        type: "website",
      },
    },
  });
}

export default async function Article() {

  return (
    <main className="w-full mx-auto bg-primary text-base-content flex flex-col grow rounded-xl">
      <CreateProposalForm />
    </main >
  );
}
