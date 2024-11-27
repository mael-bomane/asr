"use client"

import { useContext, useEffect, useState } from "react";
import { Proposals } from "./Proposals";
import { VotingPower } from "./VotingPower";
import { RewardsList } from "./RewardsList";
import { DepositPopup } from "./DepositPopup";
import { Skeleton } from "@radix-ui/themes";
import { LockDetails } from "./LockDetails";
import { LockStaked } from "./LockStaked";

import type { FC } from "react";
import { LockContext } from "./LockContextProvider";

type Props = {
  address: string
};


export const LockDisplay: FC<Props> = ({ address }) => {

  const { currentUser, currentLock, users, setAddress } = useContext(LockContext);

  const [season, setSeason] = useState<number>(0);

  const [currentUserLoading, setCurrentUserLoading] = useState<boolean>(true);

  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    if (address) {
      setAddress(address);
    }
  }, [address])



  return (
    <>
      {currentLock ? (
        <section className="my-6 md:my-10 grow md:w-full flex flex-col justify-center items-center md:p-4 space-y-4">
          <h1 className="text-3xl md:text-3xl font-extrabold flex">
            {currentLock.account.config.name}
          </h1>
          <LockStaked lock={currentLock} users={users} />
          <LockDetails lock={currentLock} />
          <div className="grow md:w-full mx-auto flex flex-col md:flex-row justify-center items-start p-2 space-y-2 md:space-y-0">
            <RewardsList lock={currentLock} setIsOpen={setIsOpen} season={season} address={address} />
            <VotingPower currentUser={currentUser} currentUserLoading={currentUserLoading} lock={currentLock} address={address} />
          </div>
          <Proposals />
        </section>
      ) : <Skeleton />
      }
      {isOpen && <DepositPopup isOpen={isOpen} setIsOpen={setIsOpen} />}
    </>
  )
}
