"use client"

import { useContext, useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { program } from "@/constants";
import { Lock, Proposal, User } from "@/types/state";
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

  const { publicKey } = useWallet();
  const { currentUser, currentLock, users, setAddress } = useContext(LockContext);

  const [season, setSeason] = useState<number>(0);

  const [currentUserLoading, setCurrentUserLoading] = useState<boolean>(true);

  const [proposals, setProposals] = useState<Proposal[]>([]);

  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    if (address) {
      setAddress(address);
    }
  }, [address])



  useEffect(() => {
    const fetchProposals = async () => {
      //@ts-ignore
      return await program.account.proposal.all([
        {
          memcmp: {
            offset: 8 + 8,
            bytes: currentLock.publicKey.toBase58(),
          },
        },
      ]);
    }
    if (currentLock) {
      fetchProposals()
        .then(res => {
          if (res) {
            console.log("proposals : ", res);
            console.log(res);
            // @ts-ignore
            // const proposalsMap = res.map(({ account, publicKey }) => {
            //   const result = account
            //   account.pubkey = publicKey
            //   return result
            // })
            // console.log('monoliths : ', proposalsMap)
            setProposals(res);
          }
        })
        .catch(err => console.log(err));
    }

  }, [currentLock, publicKey]);



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
          <Proposals proposals={proposals} lock={currentLock} address={address} users={users} currentUser={currentUser} />
        </section>
      ) : <Skeleton />
      }
      {isOpen && <DepositPopup isOpen={isOpen} setIsOpen={setIsOpen} />}
    </>
  )
}
