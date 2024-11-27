import { ButtonCreateLock } from "@/components/ButtonCreateLock";
import { LockEcosystemDisplay } from "@/components/LockEcosystemDisplay";
import { getSEOTags } from "@/lib/seo";
import Image from "next/image";

export async function generateMetadata() {

  // @ts-ignore
  return getSEOTags({
    title: "ASR Ecosystem",
    description: "ASR Ecosystem",
    canonicalUrlRelative: `/lock`,
    extraTags: {
      openGraph: {
        title: "ASR Ecosystem",
        description: "ASR Ecosystem",
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
        Lock Ecosystem
      </h1>
      <ButtonCreateLock />
      <div className="overflow-x-auto w-full mx-auto">
        <LockEcosystemDisplay />
      </div>
    </main>
  );
}
