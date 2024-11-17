import { getSEOTags } from "@/lib/seo";
import { Monolith } from "@/components/Monolith";


export async function generateMetadata({
  params,
}: {
  params: { address: string };
}) {

  // @ts-ignore
  return getSEOTags({
    title: `Lock`,
    description: `/lock/${params.address}`,
    canonicalUrlRelative: `/lock/${params.address}`,
    extraTags: {
      openGraph: {
        title: `/lock/${params.address}`,
        description: `/lock/${params.address}`,
        url: `/lock/${params.address}`,
        images: [
          {
            url: `/lock/${params.address}.png`,
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
    <main className="w-full md:max-w-7xl mx-auto flex flex-col items-center justify-center grow">
      <Monolith address={params.address} />
    </main >
  );
}
