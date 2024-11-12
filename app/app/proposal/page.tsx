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

export default async function Article({
  params,
}: {
  params: { username: string };
}) {

  return (
    <main className="my-6 md:my-10 w-full flex flex-col justify-center items-center">
      <h1 className="text-3xl md:text-3xl font-extrabold flex text-center">meet the 3-1337
        <Image src={"/hacker.gif"} width={40} height={40} alt="adhd cat dev" className="ml-4 rounded-full" unoptimized />
      </h1>
      <div className="overflow-x-auto w-full mx-auto mt-8">
      </div>
    </main>
  );
}
