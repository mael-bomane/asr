import Link from "next/link";
import { Card, CardDescription, CardTitle } from "./ui/card";
import type { FC } from "react";
import type { Lock, User } from "@/types";
import Skeleton from "react-loading-skeleton";

type Props = {
  lock: Lock
  users: User[]
}

export const LockStaked: FC<Props> = ({ lock, users }) => {
  return (
    <div className="w-full md:max-w-5xl mx-auto flex flex-col md:flex-row justify-center items-center md:space-x-4">
      <Card
        className={`w-full flex-1 p-1 md:p-2 bg-[#000] text-base-content rounded-box border flex items-center justify-around`}
      >
        <CardTitle className="w-full flex justify-center items-center text-sm px-2 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-500 font-extrabold">Total Staked
          <Link href={`https://explorer.solana.com/address/${lock.mint.toString()}?cluster=devnet`}
            className="text-white underline ml-1"
            target="_blank"
          >{lock.symbol}</Link></CardTitle>
        <CardDescription className="w-full  flex justify-center items-center text-sm px-2 text-center text-white font-semibold">
          {/*@ts-ignore*/}
          {lock && new Intl.NumberFormat().format(lock.totalDeposits.toNumber() / (1 * 10 ** lock.decimals))}{' '}{lock.symbol || <Skeleton />}</CardDescription>
      </Card>
      <Card
        className={`w-full flex-1 p-1 md:p-2 bg-[#000] text-base-content rounded-box flex items-center justify-around`}
      >
        <CardTitle className="w-full flex justify-center items-center text-sm px-2 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-blue-600 font-extrabold">Unique Addresses</CardTitle>
        <CardDescription className="w-full flex justify-center items-center text-sm px-2 text-center text-white font-semibold">
          {users.length > 0 ? users.length : 0}
        </CardDescription>
      </Card>
    </div>

  )
}
