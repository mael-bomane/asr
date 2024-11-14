import { getSEOTags } from "@/lib/seo";
import { Proposal } from "@/components/Proposal";


export async function generateMetadata({
  params,
}: {
  params: { address: string };
}) {

  //@ts-ignore
  return getSEOTags({
    title: `/proposal/${params.address}`,
    description: `/proposal/${params.address}`,
    canonicalUrlRelative: `/proposal/${params.address}`,
    extraTags: {
      openGraph: {
        title: `/proposal/${params.address}`,
        description: `/proposal/${params.address}`,
        url: `/proposal/${params.address}`,
        images: [
          {
            url: `/proposal/${params.address}.png`,
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

export default async function MonolithPage({
  params,
}: {
  params: { address: string };
}) {

  return (
    <main className="w-full md:max-w-7xl mx-auto flex flex-col items-center justify-center grow border rounded-xl">
      <Proposal address={params.address} />
    </main >
  );
}
