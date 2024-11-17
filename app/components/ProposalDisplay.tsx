"use client"

import { useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { program } from "@/constants";
import { Lock, Proposal, User } from "@/types/state";

import { Card, CardDescription, CardTitle } from "@/components/ui/card";

import type { FC } from "react";
import Link from "next/link";
import { ellipsis } from "@/lib/utils";

import { DepositPopup } from "./DepositPopup";
import Skeleton from "react-loading-skeleton";
import { FaCalendar, FaWallet, FaWaveSquare } from "react-icons/fa";

type Props = {
  address: string
};

export const ProposalDisplay: FC<Props> = ({ address }) => {

  const { connection } = useConnection();
  const { publicKey } = useWallet();

  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [lock, setLock] = useState<Lock | null>(null);
  const [lockPubkey, setLockPubkey] = useState<PublicKey | null>(null);
  const [season, setSeason] = useState(null);

  const [users, setUsers] = useState<User[] | null>(null);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentUserLoading, setCurrentUserLoading] = useState<boolean>(true);

  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    const fetchProposal = async () => {
      //@ts-ignore
      return await program.account.proposal.fetch(new PublicKey(address));
    }
    if (address) {
      fetchProposal()
        .then(async response => {
          if (response) {
            console.log(response);
            // @ts-ignore
            // const proposalMap = response.map(({ account, publicKey }) => {
            //   const result = account
            //   account.pubkey = publicKey
            //   return result
            // })
            console.log('proposal : ', response)
            setProposal(response);
          }
        })
        .catch(err => console.log(err));

    }

  }, []);

  useEffect(() => {
    const fetchLock = async () => {
      //@ts-ignore
      return await program.account.lock.fetch(proposal.lock);
    }
    if (proposal) {
      fetchLock()
        .then(async response => {
          if (response) {
            console.log(response);
            // @ts-ignore
            // const proposalMap = response.map(({ account, publicKey }) => {
            //   const result = account
            //   account.pubkey = publicKey
            //   return result
            // })
            console.log('lock : ', response)
            setLock(response);
          }
        })
        .catch(err => console.log(err));

    }
  }, [proposal]);

  return (
    <section className="my-6 md:my-10 w-full max-w-7xl flex justify-center items-start md:p-4 text-base-content space-x-4">
      {
        proposal && lock ? (
          <div className="w-full md:w-[66%] flex flex-col items-center justify-center bg-base-100 rounded-xl p-8">
            <h1 className="text-3xl md:text-3xl font-extrabold flex">
              {proposal.title}
            </h1>
            <h2>created by <Link
              href={`https://explorer.solana.com/address/${proposal.summoner.toString() ?? ''}?cluster=devnet`}
              className="underline"
              target="_blank"
            >
              {ellipsis(proposal.summoner.toString() ?? '')}
            </Link>
            </h2>
            <div className="w-full max-w-4xl grid grid-rows-1 md:flex justify-center items-center gap-4">
              <Card
                className={`flex-1 p-2 bg-base-100 text-base-content rounded-box flex flex-col items-center justify-between mb-2`}
              >
                <CardTitle className="text-xs px-2 text-center text-success font-semibold">Total Staked MONO</CardTitle>
                <CardDescription className="text-xs px-2 text-center text-white font-semibold">{
                  //@ts-ignore
                  // lock && tokenInfo && lock.totalDeposits.toNumber() / (1 * 10 ** tokenInfo.decimals)
                } MONO</CardDescription>
              </Card>
              <Card
                className={`flex-1 p-2 bg-base-100 text-base-content rounded-box flex flex-col items-center justify-between mb-2`}
              >
                <CardTitle className="text-xs px-2 text-center text-success font-semibold">Unique Addresses</CardTitle>
                <CardDescription className="text-xs px-2 text-center text-white font-semibold">
                  {users && users.length > 0 ? users.length : 0}
                </CardDescription>
              </Card>
            </div>

            <div className="w-full max-w-4xl grid grid-rows-1 md:flex justify-center items-center gap-4">
              <Card
                className={`flex-1 p-2 bg-base-100 text-base-content rounded-box flex flex-col items-center justify-between mb-2`}
              >
                <CardTitle className="text-xs px-2 text-center text-success font-semibold">Mint</CardTitle>
                <CardDescription className="text-xs px-2 text-center text-white font-semibold">{
                  lock && <Link
                    href={`https://explorer.solana.com/address/${lock.creator.toString()}?cluster=devnet`}
                    className="underline"
                    target="_blank"
                  >
                    {/*ellipsis(lock.mint.toString())*/}
                  </Link>
                }</CardDescription>
              </Card>
              <Card
                className={`flex-1 p-2 bg-base-100 text-base-content rounded-box flex flex-col items-center justify-between mb-2`}
              >
                <CardTitle className="text-xs px-2 text-center text-success font-semibold">Min Voting Power To Create Proposals</CardTitle>
                <CardDescription className="text-xs px-2 text-center text-white font-semibold">
                  {/*
                    lock && tokenInfo && `${lock.min.toNumber() / (1 * 10 ** tokenInfo.decimals)}`
                  */}
                </CardDescription>
              </Card>
            </div>
            <div className="w-full max-w-4xl grid grid-rows-1 md:flex justify-center items-center gap-4">
              <Card
                className={`flex-1 p-2 bg-base-100 text-base-content rounded-box flex flex-col items-center justify-between mb-2`}
              >
                <CardTitle className="text-xs px-2 text-center text-success font-semibold">Quorum</CardTitle>
                <CardDescription className="text-xs px-2 text-center text-white font-semibold">{
                  lock && lock.quorum
                } %</CardDescription>
              </Card>
              <Card
                className={`flex-1 p-2 bg-base-100 text-base-content rounded-box flex flex-col items-center justify-between mb-2`}
              >
                <CardTitle className="text-xs px-2 text-center text-success font-semibold">Approval Threshold</CardTitle>
                <CardDescription className="text-xs px-2 text-center text-white font-semibold">{
                  lock && lock.threshold
                } %</CardDescription>
              </Card>
              <Card
                className={`flex-1 p-2 bg-base-100 text-base-content rounded-box flex flex-col items-center justify-between mb-2`}
              >
                <CardTitle className="text-xs px-2 text-center text-success font-semibold">Locker Type</CardTitle>
                <CardDescription className="text-xs px-2 text-center text-white font-semibold">{
                  lock && `${lock.config == 0 ? 'Active Staking Rewards' : lock.config == 1 ? 'Voting Escrow' : ''}`
                }</CardDescription>
              </Card>

            </div>


          </div>
        ) : <>not found</>
      }
      <div className="w-[33%] md:max-w-xl flex flex-col items-center justify-center space-y-4">
        {proposal ? (
          <>
            <div className="w-full flex flex-col justify-center items-center bg-base-100 rounded-xl space-y-4 p-8">
              <div>Results</div>
              {proposal.choices.map(choice => {
                return (
                  <div className="w-full flex justify-between" key={choice.id}>
                    <span>{choice.title}</span>
                    {/*@ts-ignore*/}
                    <span>{choice.votingPower.toNumber()}</span>
                  </div>
                )
              }) || <Skeleton />}
            </div>
            <div className="w-full flex flex-col justify-center items-start bg-base-100 rounded-xl space-y-4 p-8">
              <div className="w-full flex justify-start items-center space-x-1">
                <FaWaveSquare />
                <span className="flex space-x-1">
                  <span>Status:</span> <div className="badge badge-info p-3">Voting</div>
                </span>
              </div>
              <div className="w-full flex justify-start items-center space-x-1">
                <FaWallet />
                <span className="flex space-x-1">
                  <span>Created by:</span>
                  <Link
                    href={`https://explorer.solana.com/address/${proposal.summoner.toString()}?cluster=devnet`}
                    className="underline"
                    target="_blank"
                  >
                    {ellipsis(proposal.summoner.toString())}
                  </Link>
                </span>
              </div>
              <div className="w-full flex justify-start items-center space-x-1">
                <FaCalendar />
                <span className="flex space-x-1">
                  <span>Start:</span>
                  {/* @ts-ignore */}
                  <span>{new Date(proposal.createdAt.toNumber() * 1000).toDateString()}</span>
                  {/* @ts-ignore */}
                  <span>{new Date(proposal.createdAt.toNumber() * 1000).getHours()}:{(new Date(proposal.createdAt.toNumber() * 1000).getMinutes())}</span>
                </span>
              </div>
              <div className="w-full flex justify-start items-center space-x-1">
                <FaCalendar />
                <span className="flex space-x-1">
                  <span>End:</span>
                  {/* @ts-ignore */}
                  <span>{new Date((proposal.createdAt.toNumber()) * 1000).toDateString()}</span>
                  {/* @ts-ignore */}
                  <span>{new Date((proposal.createdAt.toNumber()) * 1000).getHours()}:{(new Date((proposal.createdAt.toNumber()) * 1000).getMinutes())}</span>
                </span>
              </div>
            </div>
          </>
        ) : (
          <Skeleton />
        )}

      </div>
      {isOpen && <DepositPopup isOpen={isOpen} setIsOpen={setIsOpen} />}
    </section>
  )
}
