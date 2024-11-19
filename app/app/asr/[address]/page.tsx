import { getSEOTags } from "@/lib/seo";
import { LockDisplay } from "@/components/LockDisplay";
import { ASRDisplay } from "@/components/ASRDisplay";


export async function generateMetadata({
  params,
}: {
  params: { address: string };
}) {

  // @ts-ignore
  return getSEOTags({
    title: `${params.address} Active Staking Rewards`,
    description: `${params.address} Active Staking Rewards`,
    canonicalUrlRelative: `/asr/${params.address}`,
    extraTags: {
      openGraph: {
        title: `${params.address} Active Staking Rewards`,
        description: `${params.address} Active Staking Rewards`,
        url: `/asr/${params.address}`,
        images: [
          {
            url: `/asr/${params.address}.png`,
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
    <main className="w-full mx-auto flex flex-col items-center justify-center grow">
      <ASRDisplay address={params.address} />
    </main >
  );
}
