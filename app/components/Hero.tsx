"use client"

import Image from "next/image";
import Link from "next/link";
import { Proposals } from "./Proposals";
import config from "@/config";
import logo from "@/app/icon.png";
import { useState } from "react";
import { Poll } from "@/types";

const Hero = () => {

  const [proposals, setProposals] = useState<Poll[]>([])

  return (
    <section className="w-full mx-auto flex flex-col items-center justify-center px-8 py-8 text-base-content border bg-[url('/lava.gif')]">
      {process.env.NODE_ENV == "development" ? (
        <section className="max-w-7xl w-full mx-auto flex flex-col lg:flex-row items-center justify-center gap-16 lg:gap-20 px-8 py-8 lg:py-20 text-base-content">
          <div className="max-w-7xl w-full flex flex-col gap-10 lg:gap-14 items-center justify-center text-center lg:text-left lg:items-start">
            <h1 className="flex flex-col justify-center items-center font-extrabold text-2xl lg:text-4xl md:-mb-4">

              <div className="flex w-full items-center justify-center space-x-4">
                summon a monolith
                <Image src={"/sith.gif"} width={33} height={33} alt="pepe wizard" className="ml-4 transform -scale-x-100" unoptimized />
              </div>
              <div className="flex w-full items-center justify-center space-x-4">
                become stakeholder
                <Image src={"/business.webp"} width={33} height={33} alt="pepe wizard" className="ml-4" unoptimized />
              </div>
            </h1>
            <p className="text-lg opacity-80 leading-relaxed">
              {config.appDescription}
            </p>
            <Link href="/monolith" className="btn btn- btn-wide btn-primary">
              summon
            </Link>

          </div>
          <div className="lg:w-full">
            <Proposals proposals={proposals} />
          </div>

        </section>)
        : (
          <div className="border bg-[#000] w-full mx-auto flex flex-col lg:flex-row items-center justify-center px-8 py-8 text-base-content">
            <div className="max-w-7xl w-full flex flex-col gap-10 lg:gap-14 items-center justify-center text-center lg:text-left">
              <div className="w-full flex justify-center items-center">
                <Image src={"/hacker.gif"} width={42} height={42} alt="pepe wizard" className="mr-4 transform -scale-x-100" unoptimized />
                <h1 className="text-xl md:text-3xl font-extrabold flex justify-center items-center w-full text-center">
                  work in progress
                </h1>
                <Image src={"/hacker.gif"} width={42} height={42} alt="pepe wizard" className="ml-4" unoptimized />
              </div>
              <Image src={logo} alt="logo" className="animate-spin w-[100px] h-[100px]" />
            </div>

          </div>
        )};
    </section>
  );
}

export default Hero;
