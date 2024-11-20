import { getSEOTags } from "@/lib/seo";
import Image from "next/image";

export async function generateMetadata() {

  // @ts-ignore
  return getSEOTags({
    title: "Create ASR Lock",
    description: "Create ASR Lock",
    canonicalUrlRelative: `/lock/create`,
    extraTags: {
      openGraph: {
        title: "Create Lock",
        description: "Create ASR Lock",
        url: `/lock/create`,
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

export default async function LockPage() {

  return (
    <main className="my-6 md:my-10 w-full flex flex-col items-center">
      <h1 className="text-3xl md:text-3xl font-extrabold flex text-center">
        Ecosystem Opportunities
        <Image src={"/hacker.gif"} width={40} height={40} alt="adhd cat dev" className="ml-4 rounded-full" unoptimized />
      </h1>
      <div className="overflow-x-auto w-full mx-auto mt-8">
      </div>
    </main>
  );
}
