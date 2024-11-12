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
    <section className="w-full mx-auto flex flex-col items-center justify-center px-8 py-8 text-base-content">
      <section className="max-w-7xl w-full mx-auto flex flex-col lg:flex-row items-center justify-center gap-16 lg:gap-20 px-8 py-8 lg:py-20 text-base-content">
        <div className="max-w-7xl w-full flex flex-col gap-10 lg:gap-14 items-center justify-center text-center lg:text-left lg:items-start">
          <h1 className="flex flex-col justify-center items-center font-extrabold text-2xl lg:text-4xl md:-mb-4">
            active staking rewards,<br />
            incentivized vote.
          </h1>
          <Link href="/create" className="btn btn- btn-wide btn-primary">
            create your locker
          </Link>
        </div>
        <div className="lg:w-full border">
          <Proposals proposals={proposals} />
        </div>
      </section>
    </section>
  );
}

export default Hero;
