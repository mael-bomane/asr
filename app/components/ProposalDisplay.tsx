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
import { IoDiamond } from "react-icons/io5";
import { useForm } from "react-hook-form";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";

type Props = {
  address: string
};

export const ProposalDisplay: FC<Props> = ({ address }) => {

  const { connection } = useConnection();
  const { publicKey } = useWallet();
  type Inputs = {
    title: string
  }

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Inputs>();

  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [lock, setLock] = useState<Lock | null>(null);

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

  useEffect(() => {
    const fetchUser = async () => {
      const user = PublicKey.findProgramAddressSync(
        // seeds = [b"user", lock.key().as_ref(), signer.key().as_ref()]
        [Buffer.from("user"), proposal.lock.toBytes(), publicKey.toBytes()],
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

  return (
    <section className="my-6 md:my-10 w-full max-w-7xl flex justify-center items-start md:p-4 text-base-content space-x-4">
      {
        proposal && lock ? (
          <div className="w-full md:w-[66%] flex flex-col items-center justify-center space-y-4 ">
            <div className="w-full flex flex-col items-center justify-center bg-primary text-white rounded-xl p-8">
              <div
                className="font-extrabold self-start">
                <Link href={`/lock/${proposal.lock.toString()}`} className="" target="_blank">
                  {lock.name}
                </Link> &gt; Proposal
              </div>
              <h1 className="text-3xl md:text-3xl font-extrabold flex">
                {proposal.title}
              </h1>

            </div>
            <form className="w-full bg-primary text-white rounded-box p-8">
              <div className="w-full flex justify-between">
                <span className="text-xl font-extrabold">Cast your vote</span>
                <span className="flex justify-center items-center text-base-content space-x-2"><IoDiamond /><span>Voting Power : {' '}
                  {currentUser ? currentUser.deposits.reduce((acc: any, obj: any) => {
                    return acc + obj.amount.toNumber();
                  }, 0) / (1 * 10 ** lock.decimals) : 0}</span></span>

              </div>
              <div>
                <RadioGroup className="mt-4">
                  {
                    proposal.choices.map(choice => {
                      return (
                        <div className="flex items-center space-x-2" key={choice.id}>
                          <RadioGroupItem value={choice.id.toString()} id={choice.id.toString()} />
                          <Label htmlFor={choice.id.toString()} className="text-lg">{choice.title}</Label>
                        </div>
                      )
                    })
                  }
                </RadioGroup>
              </div>
              <button type="submit" className="btn w-full mt-4">Vote</button>
            </form>
          </div>
        ) : <>not found</>
      }
      <div className="w-[33%] md:max-w-xl flex flex-col items-center justify-center space-y-4">
        {proposal ? (
          <>
            <div className="w-full flex flex-col justify-center items-center bg-primary text-white rounded-xl space-y-4 p-8">
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
            <div className="w-full flex flex-col justify-center items-start bg-primary text-white rounded-xl space-y-4 p-8">
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
                  <span>{new Date((proposal.endsAt.toNumber()) * 1000).toDateString()}</span>
                  {/* @ts-ignore */}
                  <span>{new Date((proposal.endsAt.toNumber()) * 1000).getHours()}:{(new Date((proposal.createdAt.toNumber()) * 1000).getMinutes())}</span>
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
