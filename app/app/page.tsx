import { Hero } from '@/components/Hero';
import { LockEcosystemDisplay } from '@/components/LockEcosystemDisplay';

export default function Home() {
  return (
    <main className="w-full flex flex-col items-center justify-center grow">
      <Hero />
      <div className="w-full">
        <LockEcosystemDisplay />
      </div>
    </main>
  );
}
