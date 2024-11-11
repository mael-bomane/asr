"use client"

import Image from "next/image";
import Link from "next/link";
import { Proposals } from "./Proposals";
import config from "@/config";

const Hero = () => {
  return (
    <section className="max-w-7xl w-full mx-auto flex flex-col lg:flex-row items-center justify-center gap-16 lg:gap-20 px-8 py-8 lg:py-20 text-base-content">
      <div className="max-w-7xl w-full flex flex-col gap-10 lg:gap-14 items-center justify-center text-center lg:text-left lg:items-start">
        {process.env.NODE_ENV == !"development" ? (<>
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

        </>) : (
          <h1 className="flex flex-col justify-center items-center font-extrabold text-2xl lg:text-4xl md:-mb-4">
            work in progress
          </h1>
        )}
      </div>
      {process.env.NODE_ENV == "development" ? <>
        <div className="lg:w-full">
          <Proposals />
        </div>
      </> : <></>}

    </section>
  );
};

export default Hero;
