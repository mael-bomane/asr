"use client"

import { FaChevronUp, FaChevronDown } from "react-icons/fa";
import { Card } from "./ui/card"
import { Progress } from "./ui/progress"

import type { FC } from "react"

type Props = {
  // proposals: Proposal[]
}

export const Proposals: FC = () => {
  return (
    <div className="bg-[#000] text-base-content space-y-4 rounded-xl">
      <div className="px-6 space-y-2 py-4">
        <h3 className="font-bold text-xl lg:text-3xl tracking-tight">
          stake &amp; vote
        </h3>
        <p className="opacity-80">users stake tokens to create &amp; vote on polls</p>
      </div>
      <div className="px-6 max-w-[600px] flex flex-col gap-4 overflow-y-scroll pb-8">
        {[
          {
            title: "MIP 3",
            text: "tokenomics",
            votes: 12,
          },
          {
            title: "MIP 2",
            text: "security audit",
            votes: 1,
          },
          {
            title: "MIP 1",
            text: "deploy to mainnet",
            votes: 48,
          },
        ].map((proposal, i) => (
          <Card
            className={`p-4 bg-base-100 text-base-content rounded-box flex justify-between mb-2 gap-4`}
            key={i}
          >
            <div className="w-full flex flex-col space-y-2">
              <p className="font-extrabold">{proposal.title}</p>
              <p className="text-base-content-secondary">
                {proposal.text}
              </p>
              <Progress value={proposal.votes} />
            </div>
            <div
              className="px-4 py-3 rounded-box text-center text-lg duration-150 border border-transparent bg-primary text-base-content-secondary flex flex-col space-y-2 items-center justify-center"
            >
              <FaChevronUp className="w-4 h-4 ease-in-out duration-150 -translate-y-0.5 hover:translate-y-0 cursor-pointer hover:text-success" />
              <span className="">{proposal.votes}</span>
              <FaChevronDown className="w-4 h-4 ease-in-out duration-150 -translate-y-0.5 hover:translate-y-0 cursor-pointer hover:text-error" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
