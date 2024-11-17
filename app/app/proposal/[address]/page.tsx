import { getSEOTags } from "@/lib/seo";
import { ProposalDisplay } from "@/components/ProposalDisplay";


export async function generateMetadata({
  params,
}: {
  params: { address: string };
}) {

  //@ts-ignore
  return getSEOTags({
    title: `Proposal`,
    description: `Proposal`,
    canonicalUrlRelative: `/proposal/${params.address}`,
    extraTags: {
      openGraph: {
        title: `Proposal`,
        description: `Proposal`,
        url: `/proposal/${params.address}`,
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

export default async function ProposalPage({
  params,
}: {
  params: { address: string };
}) {

  return (
    <main className="w-full md:max-w-7xl mx-auto flex flex-col items-center justify-center grow">
      <ProposalDisplay address={params.address} />
    </main >
  );
}
