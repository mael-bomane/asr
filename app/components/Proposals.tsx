"use client"

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaPlusCircle } from "react-icons/fa";
import { Progress } from "./ui/progress"

import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Poll, Lock } from "@/types";

import type { FC } from "react"
import { FaMagnifyingGlass } from "react-icons/fa6";

type Props = {
  lock: Lock | null
  address: string | null
  proposals: Poll[]
}

export const Proposals: FC<Props> = ({ lock, address, proposals }) => {
  const router = useRouter();
  return (
    <div className="w-full bg-[#000] text-base-content space-y-4 rounded-xl">
      <div className="px-6 w-full flex items-center justify-between">
        <h3 className="font-bold text-lg lg:text-xl flex justify-center items-center space-x-4">
          <span>Proposals</span>
          <Link href={{ pathname: '/proposal/create', query: { address } }} className="button"><FaPlusCircle className="w-5 h-5" /></Link>
        </h3>
        <div className="flex justify-center items-center space-x-2">
          <FaMagnifyingGlass className="w-5 h-5" />
          <input placeholder="Search Proposal ..." className="text-right pr-4" />
        </div>
      </div>
      <Table className="overflow-x-scroll">
        <TableCaption>{lock && lock.name} Proposals</TableCaption>
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
          {proposals.length > 0 && proposals.map((proposal, i) => (
            <TableRow key={i}
              onClick={() => {
                router.push(`/proposal/${proposal.id}`)
              }}
              className="cursor-pointer"
            >
              <TableCell className="font-medium">
                <div>{proposal.title}</div>
                {/*<div>{proposal.text}</div>*/}
              </TableCell>
              <TableCell className="text-center">-</TableCell>
              <TableCell className="text-center">
                <div className="badge p-4">
                  Voting
                </div>
              </TableCell>
              <TableCell>
                <Progress value={proposal.choices.length} />
              </TableCell>
              <TableCell className="text-left">
                {/* @ts-ignore */}
                <div>{proposal.createdAt}</div>
                <div>17:31 PM</div>
              </TableCell>
              <TableCell className="text-left">
                {/* @ts-ignore */}
                <div>{proposal.createdAt}</div>
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
