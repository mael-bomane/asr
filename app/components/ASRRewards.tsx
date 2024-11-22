import * as React from "react"
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { ellipsis } from "@/lib/utils";
import logo from "@/app/icon.png";

import type { FC } from "react"
import type { LockMap } from "@/types";
import Image from "next/image";
import formatNumber from "@/lib/utils/number";

type Props = {
  lock: LockMap
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export const ASRRewards: FC<Props> = ({ lock: { account, publicKey }, setIsOpen }) => {
  const wallet = useWallet();
  const router = useRouter();

  return (
    <Card
      className={`w-full p-4 bg-primary text-base-content rounded-box flex flex-col items-center justify-center space-y-2`}
    >
      <CardTitle className="w-full px-2 text-center pb-1 space-y-2">
        <div className="text-xl tracking-wide font-extrabold text-white">What&apos;s in {account.config.name}&apos; Season {(account.seasons.length - 1 !== 0) ? (account.seasons.length - 1) : 0} ASR Pool ?</div>
      </CardTitle>
      <CardContent className="w-full flex flex-col">
        <div className="w-full flex justify-between">
          <div className="w-full flex flex-col text-center">
            {account.seasons[account.seasons.length - 1].asr.map((token, index) => (
              <div className="w-full" key={index}>
                <span className="text-white font-extrabold">
                  {new Intl.NumberFormat().format(token.amount.toNumber() / (1 * 10 ** token.decimals))}</span>{' '}
                <Link href={`https://explorer.solana.com/address/${token.mint.toString()}`} className="underline text-white font-extrabold">
                  {token.symbol}</Link>
              </div>
            ))}
          </div>
        </div>
        {account.seasons.length > 1 && (<div className="w-full flex flex-col items-start justify-between">
          <div className="text-xl tracking-wide font-extrabold text-white">Season {account.seasons.length - 2} Rewards </div>
          <div className="w-full grid grid-cols-2 md:grid-cols-4 text-center p-2 md:p-4">
            {account.seasons[account.seasons.length - 2]?.asr.map((token, index) => (
              <div className="w-full border h-32 w-32 flex flex-col justify-center items-center rounded-box" key={index}>
                <div className="avatar">
                  <div className="w-14 rounded-full">
                    <Image src={logo} layout="fill" alt="mono token" className="rounded-full" />
                  </div>
                </div>
                <span className="font-semibold">{token.mint.toString() == account.config.mint.toString() ? 'Staked ' : ''}
                  <Link href={`https://explorer.solana.com/address/${token.mint.toString()}`} className="underline font-extrabold">
                    {account.config.symbol}
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
        {wallet.publicKey && wallet.publicKey.toString() == account.creator.toString() && (
          <button className="btn mt-4" onClick={() => setIsOpen(true)}>Deposit ASR</button>
        )}
      </CardContent>
    </Card>
  )
}
