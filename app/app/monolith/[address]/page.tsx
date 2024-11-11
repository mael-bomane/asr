import { getSEOTags } from "@/lib/seo";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";


export async function generateMetadata({
  params,
}: {
  params: { address: string };
}) {

  const { username, bio, image } = await getUser(params.username);

  return getSEOTags({
    title: username,
    description: bio,
    canonicalUrlRelative: `/monolith/${params.address}`,
    extraTags: {
      openGraph: {
        title: username,
        description: bio,
        url: `/monolith/${params.address}`,
        images: [
          {
            url: image,
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

export default async function Monolith({
  params,
}: {
  params: { address: string };
}) {
  const user = await getUser(params.username);

  return (
    <section className="my-6 md:my-10 max-w-[800px] p-4">
      <h1 className="text-3xl md:text-3xl font-extrabold flex">{user.username} work !
        <Image src={"/hacker.gif"} width={40} height={40} alt="thonk" className="ml-4 rounded-full" />
      </h1>
    </section>
  );
}
