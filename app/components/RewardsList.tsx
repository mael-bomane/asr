import { Card, CardContent, CardTitle } from "@/components/ui/card";
import type { FC } from "react"
import type { Lock } from "@/types";
import { useWallet } from "@solana/wallet-adapter-react";
import Link from "next/link";
import { ellipsis } from "@/lib/utils";

type Props = {
  lock: Lock
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export const RewardsList: FC<Props> = ({ lock, setIsOpen }) => {
  const { publicKey } = useWallet();

  return (
    <Card
      className={`w-full p-2 bg-base-100 text-base-content rounded-xl flex flex-col items-center justify-center space-y-2`}
    >
      <CardTitle className="w-full px-2 text-center pb-1 space-y-4">
        <div className="text-xl tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-500 font-extrabold">Active Staking Rewards</div>
        <div className="badge badge-outline badge-success p-4 mt-1">
          {/*@ts-ignore*/}
          For {new Date(lock.createdAt * 1000).toDateString().split(' ')[1]} - {new Date(lock.seasons[lock.seasons.length - 1].seasonEnd * 1000).toDateString().split(' ')[1]} {new Date(lock.seasons[lock.seasons.length - 1].seasonEnd * 1000).getFullYear()}
        </div>
      </CardTitle>
      <CardContent className="w-full flex flex-col">
        <div className="w-full flex justify-between">
          <div className="w-full flex flex-col text-center">
            {lock.seasons[lock.seasons.length - 1].asr.map((token: any, index: number) => (
              <div className="w-full" key={index}>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-500 font-extrabold">
                  {new Intl.NumberFormat().format(token.amount.toNumber() / (1 * 10 ** 6))}</span>{' '}
                <Link href={`https://explorer.solana.com/address/${token.mint.toString()}`} className="underline">
                  {ellipsis(token.mint.toString())}</Link>
              </div>
            ))}
          </div>
        </div>
        <div className="w-full text-center text-sm font-semibold text-base-content mt-1">Next Claim: March (For the period of Nov - Fev)</div>
        {publicKey && publicKey.toString() == lock.creator.toString() && (
          <button className="btn mt-4" onClick={() => setIsOpen(true)}>Deposit ASR</button>
        )}
      </CardContent>
    </Card>
  )
}
