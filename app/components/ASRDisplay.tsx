"use client"

import { useContext, useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import { PublicKey } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";

import { program } from "@/constants";

import type { FC } from "react";
import type { User, Lock } from "@/types";
import { DepositPopup } from "./DepositPopup";
import { ASRRewards } from "./ASRRewards";
import { ASRClaim } from "./ASRClaim";
import Link from "next/link";
import { LockContext } from "./LockContextProvider";

type Props = {
  address: string
};
export const ASRDisplay: FC<Props> = ({ address }) => {

  const { currentLock, currentUser } = useContext(LockContext);
  const [currentUserLoading, setCurrentUserLoading] = useState<boolean>(true);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <section className="my-6 md:my-10 w-full flex flex-col justify-center items-center md:p-4 space-y-4">
      {currentLock ? (
        <>
          <h1 className="text-3xl md:text-3xl font-extrabold flex">
            <Link href={`/lock/${currentLock.publicKey.toString()}`} className="mr-2">{currentLock.account.config.name}</Link> Active Staking Rewards
          </h1>
          <div className="w-full flex flex-col md:flex-row justify-center items-start p-2 space-y-2 md:space-y-0 md:space-x-4">
            <ASRRewards lock={currentLock} setIsOpen={setIsOpen} />
            <ASRClaim currentUser={currentUser} currentUserLoading={currentUserLoading} setCurrentUserLoading={setCurrentUserLoading} lock={currentLock} />
          </div>
        </>
      ) : <Skeleton />
      }
      {isOpen && <DepositPopup isOpen={isOpen} setIsOpen={setIsOpen} />}
    </section>)
}
