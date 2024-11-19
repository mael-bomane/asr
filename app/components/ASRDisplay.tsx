"use client"

import { useEffect, useState } from "react";
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

type Props = {
  address: string
};
export const ASRDisplay: FC<Props> = ({ address }) => {

  const { publicKey } = useWallet()

  const [lock, setLock] = useState<Lock | null>(null);
  const [season, setSeason] = useState<number>(0);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentUserLoading, setCurrentUserLoading] = useState<boolean>(true);
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
          setSeason(res.seasons[res.seasons.length - 1].season)
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
    if (publicKey && lock && address) {
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
    } else {
      setCurrentUser(null);
    }

  }, [lock, publicKey, address, currentUserLoading]);

  return (
    <section className="my-6 md:my-10 w-full flex flex-col justify-center items-center md:p-4 space-y-4">
      {lock ? (
        <>
          <h1 className="text-3xl md:text-3xl font-extrabold flex">
            <Link href={`/lock/${address}`} className="mr-2">{lock.name}</Link> Active Staking Rewards
          </h1>
          <div className="w-full flex flex-col md:flex-row justify-center items-start p-2 space-y-2 md:space-y-0 md:space-x-4">
            <ASRRewards lock={lock} setIsOpen={setIsOpen} season={season} address={address} />
            <ASRClaim currentUser={currentUser} currentUserLoading={currentUserLoading} setCurrentUserLoading={setCurrentUserLoading} lock={lock} address={address} />
          </div>
        </>
      ) : <Skeleton />
      }
      {isOpen && <DepositPopup isOpen={isOpen} setIsOpen={setIsOpen} />}
    </section>)
}
