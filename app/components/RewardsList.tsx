import * as React from "react"
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { useWallet } from "@solana/wallet-adapter-react";
import Link from "next/link";
import { ellipsis } from "@/lib/utils";

import type { FC } from "react"
import type { Lock } from "@/types";

type Props = {
  lock: Lock
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export const RewardsList: FC<Props> = ({ lock, setIsOpen }) => {
  const { publicKey } = useWallet();

  return (
    <Card
      className={`max-w-[500px] w-full p-4 bg-primary text-base-content rounded-box flex flex-col items-center justify-center space-y-2`}
    >
      <CardTitle className="w-full px-2 text-center pb-1 space-y-4">
        <div className="text-xl tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-500 font-extrabold">Active Staking Rewards</div>
        <div className="badge badge-outline badge-success p-4 mt-1">
          {/*@ts-ignore*/}
          {new Date(lock.createdAt * 1000).toDateString()} - {new Date(lock.seasons[lock.seasons.length - 1].seasonEnd * 1000).toDateString()}
        </div>
      </CardTitle>
      <CardContent className="w-full flex flex-col">
        <div className="w-full flex justify-between">
          <div className="w-full flex flex-col text-center">
            {lock.seasons[lock.seasons.length - 1].asr.map((token: any, index: number) => (
              <div className="w-full" key={index}>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-500 font-extrabold">
                  {new Intl.NumberFormat().format(token.amount.toNumber() / (1 * 10 ** token.decimals))}</span>{' '}
                <Link href={`https://explorer.solana.com/address/${token.mint.toString()}`} className="underline">
                  {ellipsis(token.mint.toString())}</Link>
              </div>
            ))}
          </div>
        </div>
        {/*@ts-ignore*/}
        <div className="w-full text-center text-sm font-semibold text-base-content mt-2">Next Claim: {new Date(lock.seasons[lock.seasons.length - 1].seasonEnd * 1000).toDateString()}</div>
        {publicKey && publicKey.toString() == lock.creator.toString() && (
          <button className="btn mt-4" onClick={() => setIsOpen(true)}>Deposit ASR</button>
        )}
      </CardContent>
    </Card>
  )
}
