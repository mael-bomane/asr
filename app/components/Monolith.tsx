"use client"

import { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { IDL, program } from "@/constants";
import { Lock, Proposal, User } from "@/types/state";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

import type { FC } from "react";
import { Proposals } from "./Proposals";
import { VotingPower } from "./VotingPower";
import Link from "next/link";
import { ellipsis } from "@/lib/utils";

import { TokenInfo } from "@/types";
import { RewardsList } from "./RewardsList";
import { DepositPopup } from "./DepositPopup";
import { Skeleton } from "@radix-ui/themes";
import { LockDetails } from "./LockDetails";
import { LockStaked } from "./LockStaked";

type Props = {
  address: string
};


export const Monolith: FC<Props> = ({ address }) => {

  const { connection } = useConnection();
  const { publicKey } = useWallet();

  const [lock, setLock] = useState<Lock | null>(null);
  const [season, setSeason] = useState(null);

  const [users, setUsers] = useState<User[]>([]);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentUserLoading, setCurrentUserLoading] = useState<boolean>(true);

  const [proposals, setProposals] = useState<Proposal[]>([]);

  const [isOpen, setIsOpen] = useState<boolean>(false);


  useEffect(() => {
    const fetchMonolith = async () => {
      //@ts-ignore
      return await program.account.lock.fetch(new PublicKey(address));
    }

    fetchMonolith()
      .then(async res => {
        if (res) {
          console.log(res);
          setLock(res);
          res.seasons.map((season: any, index: number) => {
            console.log(`season ${index}`, season)
          });
          setSeason(res.seasons[res.seasons.length - 1])
        }
      })
      .catch(err => console.log(err));
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const user = PublicKey.findProgramAddressSync(
        // seeds = [b"user", lock.key().as_ref(), signer.key().as_ref()]
        [Buffer.from("user"), new PublicKey(address).toBytes(), publicKey.toBytes()],
        program.programId
      )[0];
      //@ts-ignore
      return await program.account.user.fetch(user);
    }
    if (lock) {
      setCurrentUserLoading(true)
      fetchUser()
        .then(res => {
          if (res) {
            console.log("current user : ", res);
            setCurrentUser(res);
            setCurrentUserLoading(false);
          }
        })
        .catch(err => {
          console.log(err);
          setCurrentUserLoading(false);
        });
    }

  }, [lock, publicKey]);

  useEffect(() => {
    const fetchProposals = async () => {
      //@ts-ignore
      return await program.account.proposal.all([
        {
          memcmp: {
            offset: 8 + 8,
            bytes: new PublicKey(address).toBase58(),
          },
        },
      ]);
    }
    if (lock) {
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

  }, [lock, publicKey]);

  useEffect(() => {
    const fetchUsers = async () => {
      //@ts-ignore
      return await program.account.user.all();
    }
    if (lock) {
      fetchUsers()
        .then(res => {
          if (res) {
            console.log("total users : ", res);
            setUsers(res);
          }
        })
        .catch(err => console.log(err));
    }

  }, [lock]);



  return (
    <section className="my-6 md:my-10 w-full flex flex-col justify-center items-center md:p-4 space-y-4">
      {lock ? (
        <>
          <h1 className="text-3xl md:text-3xl font-extrabold flex">
            {lock.name}
          </h1>
          <LockStaked lock={lock} users={users} />
          <LockDetails lock={lock} />
          <div className="w-full flex flex-col md:flex-row justify-center items-start p-2 space-y-2 md:space-y-0 md:space-x-4">
            <RewardsList lock={lock} setIsOpen={setIsOpen} />
            <VotingPower currentUser={currentUser} currentUserLoading={currentUserLoading} lock={lock} address={address} />
          </div>
          <Proposals proposals={proposals} lock={lock} address={address} users={users} currentUser={currentUser} />
        </>
      ) : <Skeleton />
      }
      {isOpen && <DepositPopup isOpen={isOpen} setIsOpen={setIsOpen} />}
    </section>
  )
}
