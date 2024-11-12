"use client"

import { FaChevronUp, FaChevronDown } from "react-icons/fa";
import { Card } from "./ui/card"
import { Progress } from "./ui/progress"

import type { FC } from "react"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { useRouter } from "next/navigation";

type Props = {
  // proposals: Proposal[]
  monolith: string
}

export const Proposals: FC<Props> = ({ monolith }) => {
  const router = useRouter();
  return (
    <div className="w-full bg-[#000] text-base-content space-y-4 rounded-xl">
      <div className="px-6 space-y-2 py-4 w-full flex justify-between">
        <h3 className="font-bold text-lg lg:text-3xl tracking-tight">
          {monolith} proposals
        </h3>
        <input />
      </div>
      <Table className="overflow-x-scroll">
        <TableCaption>A list of your recent invoices.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="">Title</TableHead>
            <TableHead className="text-center">Voted</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-left">Results</TableHead>
            <TableHead className="text-left">Start</TableHead>
            <TableHead className="text-left">End</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[
            {
              title: "MIP 3",
              text: "tokenomics",
              pda: "qlskdjqklsjdlkqsjd",
              votes: 12,
              createdAt: "24 October 2024 - 4:20pm",
              endsAt: "25 October 2024 - 4:20pm",
              choices: [{
                id: 0,
                title: "yes"
              }, {
                id: 1, title: "no"
              }],
            },
            {
              title: "MIP 2",
              text: "security audit",
              pda: "qlskdjqklsjdlkqsjd",
              votes: 1,
              createdAt: "24 October 2024 - 4:20pm",
              endsAt: "25 October 2024 - 4:20pm",
              choices: [{
                id: 0,
                title: "yes"
              }, {
                id: 1, title: "no"
              }],
            },
            {
              title: "MIP 1",
              text: "deploy to mainnet",
              votes: 48,
              createdAt: "24 October 2024 - 4:20pm",
              endsAt: "25 October 2024 - 4:20pm",
              choices: [{
                id: 0,
                title: "yes"
              }, {
                id: 1, title: "no"
              }],
            },
          ].map((proposal, i) => (
            <TableRow key={i}
              onClick={() => {
                router.push(`/proposal/${proposal.pda}`)
              }}
              className="cursor-pointer"
            >
              <TableCell className="font-medium">
                <div>{proposal.title}</div>
                <div>{proposal.text}</div>
              </TableCell>
              <TableCell className="text-center">-</TableCell>
              <TableCell className="text-center">
                <div className="badge p-4">
                  Voting
                </div>
              </TableCell>
              <TableCell>
                <Progress value={proposal.votes} />
              </TableCell>
              <TableCell className="text-left">
                <div>{proposal.createdAt}</div>
                <div>17:31 PM</div>
              </TableCell>
              <TableCell className="text-left">
                <div>{proposal.endsAt}</div>
                <div>17:31 PM</div>
              </TableCell>
            </TableRow>
          ))}


        </TableBody>
      </Table>
      <div className="px-6 max-w-[600px] flex flex-col gap-4 overflow-y-scroll pb-8">
      </div>
    </div>
  )
}
