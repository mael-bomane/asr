"use client"

import { useEffect, useState } from "react";
import { Program } from "@coral-xyz/anchor";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { IDL, program } from "@/constants";
import { Lock, Poll, User } from "@/types/state";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

import type { FC } from "react";
import { Proposals } from "./Proposals";
import { getMint, getTokenMetadata, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { VotingPower } from "./VotingPower";

type Props = {
  address: string
};

type TokenInfo = {
  mint: PublicKey,
  decimals: number

}

export const Monolith: FC<Props> = ({ address }) => {

  const { connection } = useConnection();
  const { publicKey } = useWallet();

  const [lock, setLock] = useState<Lock | null>(null);
  const [users, setUsers] = useState<User[] | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentUserLoading, setCurrentUserLoading] = useState<boolean>(true);
  const [proposals, setProposals] = useState<Poll[]>([]);
  const [season, setSeason] = useState(null);

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
          // Retrieve mint information
          const mintInfo = await getMint(
            connection,
            res.mint,
            "confirmed",
            TOKEN_PROGRAM_ID,
          );
          console.log(mintInfo)
          const metadata = await getTokenMetadata(
            connection,
            res.mint, // Mint Account address
            "confirmed",
            TOKEN_PROGRAM_ID,
          );
          console.log(metadata)
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
      return await program.account.poll.all();
    }
    if (lock) {
      fetchProposals()
        .then(res => {
          if (res) {
            console.log("proposals : ", res);
            console.log(res);
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
    <section className="my-6 md:my-10 w-full flex flex-col justify-center items-center md:p-4 bg-[#000] text-base-content space-y-8">
      {
        lock ? (
          <>
            <h1 className="text-3xl md:text-3xl font-extrabold flex">
              {lock.name}
            </h1>
            <div className="w-full max-w-4xl flex justify-around">
              <Card
                className={`px-4 bg-base-100 text-base-content rounded-box flex items-center justify-between mb-2 gap-4`}
              >
                <CardTitle className="text-xs px-2 text-center text-success font-semibold">Total Staked MONO </CardTitle>
                <CardDescription className="border-l text-xs px-2 text-center text-white font-semibold">{
                  lock.totalDeposits.toNumber() / (1 * 10 ** 6)
                } MONO</CardDescription>
              </Card>
              <Card
                className={`px-4 bg-base-100 text-base-content rounded-box flex items-center justify-between mb-2 gap-4`}
              >
                <CardTitle className="text-xs px-2 text-center text-success font-semibold">Unique Addresses</CardTitle>
                <CardDescription className="border-l text-xs px-2 text-center text-white font-semibold">{users && users.length > 0 ? users.length : 0}</CardDescription>
              </Card>
            </div>
            <div className="w-full md:max-w-4xl flex flex-col md:flex-row items-center justify-center md:justify-around md:space-x-8">
              <Card
                className={`w-full p-8 bg-base-100 text-base-content rounded-box flex flex-col items-center justify-center space-y-4`}
              >
                <CardTitle className="w-full px-2 text-center border-b pb-4">
                  <div className="text-xl font-extrabold text-success tracking-wide">Active Staking Rewards</div>
                  <div className="badge badge-outline badge-success p-4 mt-4">
                    {/*@ts-ignore*/}
                    For {new Date(lock.createdAt * 1000).toDateString().split(' ')[1]} - {new Date(lock.seasons[lock.seasons.length - 1].seasonEnd * 1000).toDateString().split(' ')[1]} {new Date(lock.seasons[lock.seasons.length - 1].seasonEnd * 1000).getFullYear()}
                  </div>
                </CardTitle>
                <CardContent className="w-full">
                  <div className="w-full flex flex-col">
                    <div className="w-full flex justify-between">
                      <div className="w-full flex flex-col text-left">
                        {lock.seasons[lock.seasons.length - 1].asr.map((token: any, index: number) => (
                          <div className="font-extrabold text-success" key={index}>
                            {token.amount.toNumber()} {token.mint.toString()}
                          </div>
                        ))}
                        <div className="font-extrabold text-success">50M MONO</div>
                        <div className="text-xs">from MONO platform fees</div>
                      </div>
                      <div className="w-full flex flex-col">
                        <div className="font-extrabold text-success">75% Platform Fees</div>
                      </div>
                    </div>
                    <ul className="w-full text-xs my-4 list-disc">
                      <li className="">Active Staking Rewards (ASR) are allocated once voted.</li>
                      <li className="">ASR allocation = Your voting power / Total voting power.</li>
                      <li className="">It doesn’t matter what you voted for, you’ll still get the rewards regardless of the results.</li>
                    </ul>
                  </div>
                </CardContent>
                <div className="text-sm font-semibold text-success mt-4">Next Claim: March (For the period of Nov - Fev)</div>
                <CardDescription className="px-2 text-center">
                </CardDescription>
              </Card>
              <VotingPower currentUser={currentUser} currentUserLoading={currentUserLoading} lock={lock} address={address} />
            </div>
            <Proposals proposals={proposals} />

          </>
        ) : <>not found</>
      }    </section>
  )
}
