import { Suspense } from 'react'
import Header from "@/components/Header";
import Footer from '@/components/Footer';
import { Hero } from '@/components/Hero';
import { MONOLITH_ID } from '@/constants';
import { LockDisplay } from '@/components/LockDisplay';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Suspense>
        <Header />
      </Suspense>
      <main className="w-full flex flex-col items-center justify-center grow">
        <Hero />
        <LockDisplay address={MONOLITH_ID} />
      </main>
      <Footer />
    </div>
  );
}
