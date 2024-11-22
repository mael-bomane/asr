import * as React from "react"
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { ellipsis } from "@/lib/utils";

import type { FC } from "react"
import type { LockMap } from "@/types";

type Props = {
  lock: LockMap
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  address: string
  season: number
}

export const RewardsList: FC<Props> = ({ lock: { account, publicKey }, setIsOpen, season, address }) => {
  const wallet = useWallet();
  const router = useRouter();

  return (
    <Card
      className={`max-w-[500px] grow mx-auto p-4 bg-primary text-base-content rounded-box flex flex-col items-center justify-center space-y-2`}
    >
      <CardTitle className="w-full px-2 text-center pb-1 space-y-2">
        <div className="text-xl tracking-wide text-white font-extrabold">Active Staking Rewards</div>
        <div className="text-xl tracking-wide font-extrabold">Season {season}</div>
        <div className="badge badge-outline badge-success p-4">
          {new Date(account.createdAt.toNumber() * 1000).toDateString()} - {new Date(account.seasons[account.seasons.length - 1].seasonEnd.toNumber() * 1000).toDateString()}
        </div>
      </CardTitle>
      <CardContent className="w-full flex flex-col">
        <div className="w-full flex justify-between">
          <div className="w-full flex flex-col text-center">
            {account.seasons[account.seasons.length - 1].asr.map((token, index) => (
              <div className="w-full" key={index}>
                <span className="text-white font-extrabold">
                  {new Intl.NumberFormat().format(token.amount.toNumber() / (1 * 10 ** token.decimals))}</span>{' '}
                <Link href={`https://explorer.solana.com/address/${token.mint.toString()}`} className="underline font-extrabold text-white">
                  {token.symbol}</Link>
              </div>
            ))}
          </div>
        </div>
        {account.seasons.length > 1 && (<div className="w-full flex flex-col items-center justify-between">
          <div className="text-xl tracking-wide font-extrabold text-white">Season {season - 1} Rewards </div>
          <div className="w-full flex flex-col text-center">
            {account.seasons[account.seasons.length - 2]?.asr.map((token, index) => (
              <div className="w-full" key={index}>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-500 font-extrabold">
                  {new Intl.NumberFormat().format(token.amount.toNumber() / (1 * 10 ** token.decimals))}</span>{' '}
                <Link href={`https://explorer.solana.com/address/${token.mint.toString()}`} className="underline">
                  {ellipsis(token.mint.toString())}</Link>
              </div>
            ))}
          </div>
        </div>
        )}
        <div className="w-full text-center text-sm font-semibold text-base-content mt-2">
          Next Claim: {new Date(account.seasons[account.seasons.length - 1].seasonEnd.toNumber() * 1000).toDateString()}</div>
        {wallet.publicKey && wallet.publicKey.toString() == account.creator.toString() && (
          <button className="btn mt-4" onClick={() => setIsOpen(true)}>Deposit ASR</button>
        )}
        <button className="btn mt-4" onClick={() => router.push(`/asr/${address}`)}>View ASR Rewards</button>
      </CardContent>
    </Card>
  )
}
