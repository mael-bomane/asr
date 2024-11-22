import Link from "next/link";
import { Card, CardDescription, CardTitle } from "./ui/card";
import type { FC } from "react";
import type { LockMap, User } from "@/types";
import Skeleton from "react-loading-skeleton";

type Props = {
  lock: LockMap
  users: User[]
}

export const LockStaked: FC<Props> = ({ lock: { account, publicKey }, users }) => {
  return (
    <div className="w-[80%] md:w-full md:max-w-5xl mx-auto flex flex-col md:flex-row justify-center items-center md:space-x-4">
      <Card
        className={`w-full flex-1 p-1 md:p-2 bg-[#000] text-white rounded-box border flex items-center justify-around`}
      >
        <CardTitle className="w-full flex justify-center items-center text-sm px-2 text-center font-extrabold">Total Staked
          <Link href={`https://explorer.solana.com/address/${account.config.mint.toString()}?cluster=devnet`}
            className="text-white underline ml-1"
            target="_blank"
          >{account.config.symbol}</Link></CardTitle>
        <CardDescription className="w-full  flex justify-center items-center text-sm px-2 text-center text-white font-extrabold">
          {new Intl.NumberFormat().format(account.totalDeposits.toNumber() / (1 * 10 ** account.config.decimals))}{' '}{account.config.symbol || <Skeleton />}</CardDescription>
      </Card>
      <Card
        className={`w-full flex-1 p-1 md:p-2 bg-[#000] text-white rounded-box flex items-center justify-around`}
      >
        <CardTitle className="w-full flex justify-center items-center text-sm px-2 text-center font-extrabold">Unique Addresses</CardTitle>
        <CardDescription className="w-full flex justify-center items-center text-sm px-2 text-center text-white font-extrabold">
          {users && users.length > 0 ? users.length : 0}
        </CardDescription>
      </Card>
    </div>

  )
}
