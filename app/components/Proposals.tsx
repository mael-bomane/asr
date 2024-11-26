"use client"

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaCheck, FaPlusCircle } from "react-icons/fa";
import { Progress } from "./ui/progress"

import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow, HeaderTableRow } from "./ui/table";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { Input } from "./ui/input";

import { FC, useContext } from "react"
import type { Proposal, User, LockMap, ProposalMap } from "@/types";
import { cn } from "@/lib/utils";
import { BadgeProposalStatus } from "./BadgeProposalStatus";
import { ProgressSegment, StackedProgress } from "./ui/stacked-progress";
import { LockContext } from "./LockContextProvider";

export const Proposals: FC = () => {
  const { currentUser, currentLock, users, setAddress, currentLockProposals } = useContext(LockContext);
  const router = useRouter();
  return (
    <div className="w-full bg-primary text-white space-y-4 p-4 rounded-box">
      <div className="px-6 w-full flex items-center justify-between">
        <h3 className="font-bold text-lg lg:text-xl flex justify-center items-center space-x-4">
          <span className="font-extrabold">Proposals</span>
          {currentUser && (currentUser.deposits.reduce((acc, obj) => {
            return acc + obj.amount.toNumber();
          }, 0) / (1 * 10 ** currentLock.account.config.decimals)) >= (currentLock.account.config.amount.toNumber() / (1 * 10 ** currentLock.account.config.decimals)) &&
            <Link href="/proposal" className="button"><FaPlusCircle className="w-5 h-5" /></Link>
          }
        </h3>
        <div className="flex justify-center items-center space-x-2">
          <FaMagnifyingGlass className="w-5 h-5" />
          <Input placeholder="Search Proposal ..." className="text-right pr-4" />
        </div>
      </div>
      <Table className="overflow-x-scroll">
        <TableCaption>{currentLock.account.config.name} Proposals</TableCaption>
        <TableHeader>
          <HeaderTableRow>
            <TableHead className="">Title</TableHead>
            <TableHead className="text-center">Voted</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-left">Results</TableHead>
            <TableHead className="text-left">Start</TableHead>
            <TableHead className="text-left">End</TableHead>
          </HeaderTableRow>
        </TableHeader>
        <TableBody>
          {currentLockProposals.map((proposal, i) => {
            const isReady = (proposal.account.endsAt.toNumber() * 1000) < new Date().getTime() ? true : false;

            const segments: ProgressSegment[] = [];

            const colors = ['bg-info', 'bg-warning', 'bg-error'];

            proposal.account.choices.forEach((choice, index) => {
              segments.push({
                value: choice.votingPower.toNumber(),
                color: colors[index]
              })
            })

            return (
              <TableRow key={i}
                onClick={() => {
                  router.push(`/proposal/${proposal.publicKey.toString()}`)
                }}
                className="cursor-pointer"
              >
                <TableCell className="font-medium">
                  <div>{proposal.account.title}</div>
                </TableCell>
                <TableCell className="text-center">
                  {currentUser && currentUser.votes.filter((vote) => vote.proposal.toNumber() == proposal.account.id.toNumber()).length > 0 ?
                    (
                      <div className="text-center w-full flex justify-center items-center text-success"><FaCheck /></div>
                    ) : (
                      <div className="text-center w-full flex justify-center items-center">-</div>
                    )}
                </TableCell>
                <TableCell className="text-center">
                  <BadgeProposalStatus lock={currentLock.account} proposal={proposal.account} isReady={isReady} />
                </TableCell>
                <TableCell>
                  <StackedProgress segments={segments} className="bg-base-100" />
                </TableCell>
                <TableCell className="text-left">
                  <div>{new Date(proposal.account.createdAt.toNumber() * 1000).toDateString()}</div>
                  <div>{new Date(proposal.account.createdAt.toNumber() * 1000).getHours()}:{(new Date(proposal.account.createdAt.toNumber() * 1000).getMinutes())}</div>
                </TableCell>
                <TableCell className="text-left">
                  <div>{new Date(proposal.account.endsAt.toNumber() * 1000).toDateString()}</div>
                  <div>{new Date(proposal.account.endsAt.toNumber() * 1000).getHours()}:{(new Date(proposal.account.endsAt.toNumber() * 1000).getMinutes())}</div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
      <div className="px-6 max-w-[600px] flex flex-col gap-4 overflow-y-scroll pb-8">
      </div>
    </div>
  )
}
