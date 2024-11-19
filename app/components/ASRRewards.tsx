import * as React from "react"
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { ellipsis } from "@/lib/utils";
import logo from "@/app/icon.png";

import type { FC } from "react"
import type { Lock } from "@/types";
import Image from "next/image";
import formatNumber from "@/lib/utils/number";

type Props = {
  lock: Lock
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
  address: string
  season: number
}

export const ASRRewards: FC<Props> = ({ lock, setIsOpen, season, address }) => {
  const { publicKey } = useWallet();
  const router = useRouter();

  return (
    <Card
      className={`w-full p-4 bg-primary text-base-content rounded-box flex flex-col items-center justify-center space-y-2`}
    >
      <CardTitle className="w-full px-2 text-center pb-1 space-y-2">
        <div className="text-xl tracking-wide font-extrabold text-white">What&apos;s in {lock.name}&apos; Season {(season - 1 !== 0) ? (season - 1) : 0} ASR Pool ?</div>
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
        {lock.seasons.length > 1 && (<div className="w-full flex flex-col items-start justify-between">
          <div className="text-xl tracking-wide font-extrabold text-white">Season {season - 1} Rewards </div>
          <div className="w-full grid grid-cols-2 md:grid-cols-4 text-center p-2 md:p-4">
            {lock.seasons[lock.seasons.length - 2]?.asr.map((token, index) => (
              <div className="w-full border h-32 w-32 flex flex-col justify-center items-center rounded-box" key={index}>
                <div className="avatar">
                  <div className="w-14 rounded-full">
                    <Image src={logo} layout="fill" alt="mono token" className="rounded-full" />
                  </div>
                </div>
                <span className="font-semibold">{token.mint.toString() == lock.mint.toString() ? 'Staked ' : ''}
                  <Link href={`https://explorer.solana.com/address/${token.mint.toString()}`} className="underline font-extrabold">
                    {lock.symbol}
                  </Link>
                </span>
                <span className="font-extrabold text-white">
                  {formatNumber(token.amount.toNumber() / (1 * 10 ** token.decimals))}
                </span>{' '}
              </div>
            ))}
          </div>
        </div>
        )}
        {/*@ts-ignore*/}
        {publicKey && publicKey.toString() == lock.creator.toString() && (
          <button className="btn mt-4" onClick={() => setIsOpen(true)}>Deposit ASR</button>
        )}
      </CardContent>
    </Card>
  )
}
