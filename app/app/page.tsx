import { Suspense } from 'react'
import Header from "@/components/Header";
import Hero from "@/components/Hero";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Suspense>
        <Header />
      </Suspense>
      <main className="flex flex-col justify-center grow bg-base-100 ">
        <Hero />
      </main>
    </div>
  );
}
