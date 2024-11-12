import { Proposals } from "@/components/Proposals";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getSEOTags } from "@/lib/seo";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import Link from "next/link";
import { IoDiamond, IoWallet } from "react-icons/io5";
import { Input } from "@/components/ui/input";
import { Monolith } from "@/components/Monolith";


export async function generateMetadata({
  params,
}: {
  params: { address: string };
}) {


  return getSEOTags({
    title: `/monolith/${params.address}`,
    description: `/monolith/${params.address}`,
    canonicalUrlRelative: `/monolith/${params.address}`,
    extraTags: {
      openGraph: {
        title: `/monolith/${params.address}`,
        description: `/monolith/${params.address}`,
        url: `/monolith/${params.address}`,
        images: [
          {
            url: `/monolith/${params.address}.png`,
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
      <Monolith address={params.address} />
    </main >
  );
}
