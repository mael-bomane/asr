"use client"

import Image from "next/image";
import Link from "next/link";
import { Proposals } from "./Proposals";
import config from "@/config";
import logo from "@/app/icon.png";
import { useEffect, useState } from "react";
import { Poll, TokenInfo, User, Lock } from "@/types";
import { getMint, getTokenMetadata, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { MONOLITH_ID, program, PROGRAM_ID } from "@/constants";
import { VotingPower } from "./VotingPower";
import { PublicKey } from "@solana/web3.js";
import { ellipsis } from "@/lib/utils";

const Hero = () => {

  const { connection } = useConnection();
  const { publicKey } = useWallet();

  const [proposals, setProposals] = useState<Poll[]>([])

  const [lock, setLock] = useState<Lock | null>(null);
  const [season, setSeason] = useState(null);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentUserLoading, setCurrentUserLoading] = useState<boolean>(true);
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);

  const [users, setUsers] = useState<User[] | null>(null);

  useEffect(() => {
    const fetchMonolith = async () => {
      //@ts-ignore
      return await program.account.lock.fetch(new PublicKey(MONOLITH_ID));
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
          console.log(mintInfo);
          if (mintInfo) {
            setTokenInfo({
              mint: mintInfo.address,
              decimals: mintInfo.decimals
            })
          }
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
        [Buffer.from("user"), new PublicKey(MONOLITH_ID).toBytes(), publicKey.toBytes()],
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
    <section className="w-full mx-auto flex flex-col items-center justify-center px-8 py-8 text-base-content">
      <section className="max-w-7xl w-full mx-auto flex flex-col lg:flex-row items-center justify-center gap-16 lg:gap-20 px-8 py-8 text-base-content">
        <div className="max-w-7xl w-full flex flex-col gap-10 lg:gap-14 items-center justify-center text-center">
          <h1 className="flex flex-col justify-center items-center font-extrabold text-2xl lg:text-4xl md:-mb-4">
            Active Staking Rewards,<br />
            Incentivized Vote.
          </h1>
          <Link href="/create" className="btn btn- btn-wide btn-primary">
            Create Locker
          </Link>
        </div>
        <div className="lg:w-full flex flex-col justify-center items-center space-y-4">
          {lock ? (
            <>
              <h1 className="text-3xl md:text-3xl font-extrabold flex">
                {lock.name}
              </h1>
              <h2>created by <Link
                href={`https://explorer.solana.com/address/${lock.creator.toString()}?cluster=devnet`}
                className="underline"
                target="_blank"
              >
                {ellipsis(lock.creator.toString())}
              </Link>
              </h2></>
          ) : (<></>)}
          <VotingPower currentUser={currentUser} currentUserLoading={currentUserLoading} lock={lock} address={MONOLITH_ID} tokenInfo={tokenInfo} />
          <Proposals proposals={proposals} lock={lock} />
        </div>
      </section>
    </section>
  );
}

export default Hero;
