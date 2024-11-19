"use client"

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import type { FC } from "react";
import WordRotate from "./ui/word-rotate";

export const Hero: FC = () => {
  const router = useRouter();
  return (
    <>
      {/* Hero */}
      <div className="w-full relative overflow-hidden pt-16">
        {/* Gradients */}
        <div
          aria-hidden="true"
          className="flex absolute -top-96 start-1/2 transform -translate-x-1/2"
        >
          <div className="bg-gradient-to-r from-background/50 to-background blur-3xl w-[25rem] h-[44rem] rotate-[-60deg] transform -translate-x-[10rem]" />
          <div className="bg-gradient-to-tl blur-3xl w-[90rem] h-[50rem] rounded-full origin-top-left -rotate-12 -translate-x-[15rem] from-primary-foreground via-primary-foreground to-background" />
        </div>
        {/* End Gradients */}
        <div className="w-full flex flex-col justify-center items-center relative z-10">
          <div className="container py-10 lg:py-16">
            <div className="max-w-2xl text-center mx-auto">
              <p className="badge bg-[#14F195] text-[#000] p-4">Devnet Release</p>
              {/* Title */}
              <div className="mt-5 max-w-2xl">
                <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
                  Active Staking Rewards
                </h1>
              </div>
              {/* End Title */}
              <div className="mt-5 max-w-3xl">
                <div className="text-xl text-muted-foreground flex flex-row justify-center items-center space-x-2">
                  <WordRotate words={['do more with your hodlings, without selling', 'grow with power-user feedback', 'make dao\'s great again !']} className="inline-block" />
                </div>
              </div>
              {/* Buttons */}
              <div className="mt-8 gap-3 flex justify-center">
                <Button size={"lg"}>Contribute</Button>
                <Button size={"lg"} variant={"outline"} onClick={() => {
                  router.push('/lock/create')
                }}>
                  Create Lock
                </Button>
              </div>
              {/* End Buttons */}
            </div>
          </div>
        </div>
      </div>
      {/* End Hero */}
    </>
  );
};
