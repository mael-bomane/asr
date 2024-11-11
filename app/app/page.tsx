import { Suspense } from 'react'
import Header from "@/components/Header";
import Hero from "@/components/Hero";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Suspense>
        <Header />
      </Suspense>
      <main className="w-full flex flex-col items-center justify-center grow bg-[#000]">
        <Hero />
      </main>
    </div>
  );
}
