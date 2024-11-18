"use client"

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaCheck, FaPlusCircle } from "react-icons/fa";
import { Progress } from "./ui/progress"

import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { Input } from "./ui/input";

import type { FC } from "react"
import type { Proposal, Lock, User } from "@/types";

type Props = {
  lock: Lock | null
  address: string | null
  proposals: Proposal[]
  users: User[]
  currentUser: User | null
}

export const Proposals: FC<Props> = ({ lock, address, proposals, users, currentUser }) => {
  const router = useRouter();
  return (
    <div className="w-full bg-[#000] text-white space-y-4 p-4 rounded-box">
      <div className="px-6 w-full flex items-center justify-between">
        <h3 className="font-bold text-lg lg:text-xl flex justify-center items-center space-x-4">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-500 font-extrabold">Proposals</span>
          {currentUser && (currentUser.deposits.reduce((acc: any, obj: any) => {
            return acc + obj.amount.toNumber();
          }, 0) / (1 * 10 ** lock.decimals)) >= (lock.amount.toNumber() / (1 * 10 ** lock.decimals)) &&
            <Link href={{ pathname: '/proposal/create', query: { address } }} className="button"><FaPlusCircle className="w-5 h-5" /></Link>
          }
        </h3>
        <div className="flex justify-center items-center space-x-2">
          <FaMagnifyingGlass className="w-5 h-5" />
          <Input placeholder="Search Proposal ..." className="text-right pr-4" />
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
          {/*@ts-ignore*/}
          {proposals.length > 0 && proposals.map(({ account, publicKey }, i) => (
            <TableRow key={i}
              onClick={() => {
                router.push(`/proposal/${publicKey}`)
              }}
              className="cursor-pointer"
            >
              <TableCell className="font-medium">
                <div>{account.title}</div>
                {/*<div>{proposal.text}</div>*/}
              </TableCell>
              <TableCell className="text-center">
                {currentUser && currentUser.votes.filter((vote) => vote.poll.toNumber() == account.id.toNumber()).length ?
                  (
                    <div className="text-center w-full flex justify-center items-center text-success"><FaCheck /></div>
                  ) : (
                    <div className="text-center w-full flex justify-center items-center">-</div>
                  )}
              </TableCell>
              <TableCell className="text-center">
                <div className="badge p-4">
                  Voting
                </div>
              </TableCell>
              <TableCell>
                <Progress value={50} />
              </TableCell>
              <TableCell className="text-left">
                {/* @ts-ignore */}
                <div>{new Date(account.createdAt.toNumber() * 1000).toDateString()}</div>
                {/* @ts-ignore */}
                <div>{new Date(account.createdAt.toNumber() * 1000).getHours()}:{(new Date(account.createdAt.toNumber() * 1000).getMinutes())}</div>
              </TableCell>
              <TableCell className="text-left">
                {/* @ts-ignore */}
                <div>{new Date(account.endsAt.toNumber() * 1000).toDateString()}</div>
                {/* @ts-ignore */}
                <div>{new Date(account.endsAt.toNumber() * 1000).getHours()}:{(new Date(account.endsAt.toNumber() * 1000).getMinutes())}</div>
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
