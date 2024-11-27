"use client"

import { useCallback, useContext, useEffect, useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, TransactionMessage, TransactionSignature, VersionedTransaction } from "@solana/web3.js";
import { program } from "@/constants";
import { Lock, Proposal, User } from "@/types/state";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { toast } from "react-hot-toast";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

import type { FC } from "react";
import Link from "next/link";
import { cn, ellipsis } from "@/lib/utils";

import { DepositPopup } from "./DepositPopup";
import Skeleton from "react-loading-skeleton";
import { FaCalendar, FaWallet, FaWaveSquare } from "react-icons/fa";
import { IoDiamond } from "react-icons/io5";
import { useForm } from "react-hook-form";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { proposalVoteIx } from "@/lib/program/proposalVote";
import { Progress } from "./ui/progress";
import { FaCheck } from "react-icons/fa6";
import { proposalExecuteIx } from "@/lib/program/proposalExecute";
import { BadgeProposalStatus } from "./BadgeProposalStatus";
import { LockContext } from "./LockContextProvider";
import { StackedProgress } from "./ui/stacked-progress";

type Props = {
  address: string
};

export const ProposalDisplay: FC<Props> = ({ address }) => {

  const { connection } = useConnection();
  const wallet = useWallet();
  const { sendTransaction } = useWallet();
  const { program, currentLock, currentUser } = useContext(LockContext);

  const formSchema = z.object({
    choice: z.string().min(0).max(255),
  })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      choice: "",
    },
  })

  const [proposal, setProposal] = useState<Proposal | null>(null);


  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [isExecuted, setIsExecuted] = useState<boolean>(false);

  useEffect(() => {
    const fetchProposal = async () => {
      return await program.account.proposal.fetch(new PublicKey(address));
    }
    if (program && address) {
      fetchProposal()
        .then(async response => {
          if (response) {
            console.log('proposal : ', response)
            setProposal(response);
          }
        })
        .catch(err => console.log(err));
    }
  }, [address]);

  useEffect(() => {
    if (proposal) {
      if ((proposal.endsAt.toNumber() * 1000) < new Date().getTime()) {
        setIsReady(true)
      }
    }
  }, [proposal]);


  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    let signature: TransactionSignature = '';
    if (program && wallet.publicKey) {
      const choice = parseInt(values.choice);
      console.log(choice);
      // owner: PublicKey,
      // lock: PublicKey,
      // proposal: PublicKey,
      // index: BN,
      // choice: number,
      const instruction = await proposalVoteIx(
        program,
        wallet.publicKey,
        proposal.lock,
        new PublicKey(address),
        proposal.id,
        choice,
      );

      let latestBlockhash = await connection.getLatestBlockhash()

      const messageV0 = new TransactionMessage({
        payerKey: wallet.publicKey,
        recentBlockhash: latestBlockhash.blockhash,
        instructions: [instruction],
      }).compileToV0Message();

      const transation = new VersionedTransaction(messageV0)

      signature = await sendTransaction(transation, connection);

      await connection.confirmTransaction({ signature, ...latestBlockhash }, 'confirmed');

      console.log(signature);

      toast.success(`success, redirecting you shortly :\ntx : ${signature}`);

    }
  }

  const onClick = useCallback(async () => {
    let signature: TransactionSignature = '';
    if (program && wallet.publicKey) {
      try {
        const instruction = await proposalExecuteIx(program, wallet.publicKey, proposal.lock, new PublicKey(address));
        let latestBlockhash = await connection.getLatestBlockhash()

        const messageV0 = new TransactionMessage({
          payerKey: wallet.publicKey,
          recentBlockhash: latestBlockhash.blockhash,
          instructions: [instruction],
        }).compileToV0Message();

        const transation = new VersionedTransaction(messageV0)

        signature = await sendTransaction(transation, connection);

        await connection.confirmTransaction({ signature, ...latestBlockhash }, 'confirmed');

        console.log(signature);

        toast.success(`success : ${ellipsis(signature)}`);
      } catch (error) {
        console.log(error);
      }
    }
  }, [wallet.publicKey, address])

  return (
    <section className="my-6 md:my-10 w-full max-w-7xl flex flex-col md:flex-row justify-center items-start md:p-4 text-base-content md:space-x-4">
      {
        proposal && currentLock ? (
          <div className="w-full md:w-[66%] flex flex-col items-center justify-center space-y-4 ">
            <div className="w-full flex flex-col items-center justify-center bg-primary text-white rounded-box p-8">
              <div
                className="font-extrabold self-start">
                <Link href={`/lock/${proposal.lock.toString()}`} className="" target="_blank">
                  {currentLock.account.config.name}
                </Link> &gt; Proposal
              </div>
              <h1 className="text-3xl md:text-3xl font-extrabold flex">
                {proposal.title}
              </h1>
              <p className="mt-4">{proposal.content}</p>
            </div>
            {wallet.publicKey && (
              <form onSubmit={form.handleSubmit(onSubmit)}
                className="w-full bg-primary text-white rounded-box p-8">
                <Form {...form}>
                  <div className="w-full flex justify-between">
                    <span className="text-xl font-extrabold">Cast your vote</span>
                    <span className="flex justify-center items-center text-base-content space-x-2"><IoDiamond /><span>Voting Power : {' '}
                      {currentUser ? currentUser.deposits.reduce((acc: any, obj: any) => {
                        return acc + obj.amount.toNumber();
                      }, 0) / (1 * 10 ** currentLock.account.config.decimals) : 0}</span></span>
                  </div>
                  <div>
                    <FormField
                      control={form.control}
                      name="choice"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <RadioGroup className="mt-4"
                              onValueChange={field.onChange}
                              defaultValue={field.value.toString()}>
                              {proposal.choices.map(choice => (
                                <div className="flex items-center space-x-2" key={choice.id}>
                                  <RadioGroupItem value={choice.id.toString()} id={choice.id.toString()} />
                                  <Label htmlFor={choice.id.toString()} className="text-lg">{choice.title}</Label>
                                </div>
                              ))}
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  {currentUser && currentUser.deposits.reduce((acc: any, obj: any) => {
                    return acc + obj.amount.toNumber();
                  }, 0) / (1 * 10 ** currentLock.account.config.decimals) == 0 || !currentUser && (
                    <div className="badge badge-warning badge-outline badge-lg rounded-box p-4 w-full mt-4">
                      Oops, you don’t have any voting power
                    </div>
                  )}
                  <button type="submit" className="btn w-full mt-4"
                    disabled={!wallet.publicKey || !currentUser || (currentUser.deposits.reduce((acc: any, obj: any) => {
                      return acc + obj.amount.toNumber();
                    }, 0) / (1 * 10 ** currentLock.account.config.decimals) == 0) || currentUser.votes.filter((vote) => vote.proposal.toNumber() == proposal.id.toNumber()).length > 0}
                  >
                    {currentUser && currentUser.votes.filter((vote) => vote.proposal.toNumber() == proposal.id.toNumber()).length > 0 ?
                      (
                        <span className="text-white flex justify-center items-center space-x-2">
                          <span>Voted</span> <FaCheck className="text-success" />
                        </span>
                      ) : (
                        <>
                          Vote
                        </>
                      )}
                  </button>
                </Form>
              </form>
            )}
          </div>
        ) : <>not found</>
      }
      <div className="w-full md:w-[33%] md:max-w-xl flex flex-col items-center justify-center mt-4 md:mt-0 space-y-4">
        {proposal && currentLock ? (
          <>
            <div className="w-full flex flex-col justify-center items-center bg-primary text-white rounded-box space-y-4 p-8">
              {proposal.executed ? (
                <>
                  <div>Results</div>
                  <StackedProgress segments={[]} className="bg-base-100" />
                  {proposal.choices.map(choice => {
                    return (
                      <div className="w-full flex justify-between" key={choice.id}>
                        <span>{choice.title}</span>
                        <span>{choice.votingPower.toNumber() / (1 * 10 ** currentLock.account.config.decimals)}</span>
                      </div>
                    )
                  })}
                </>) : (
                <>
                  <div>Progress</div>
                  <Progress className="bg-base-100" />
                  <div className="w-full flex items-center justify-between">
                    <div className="w-full text-sm">
                      <span className="text-base-content">Votes : </span>
                      <span>{proposal.choices.reduce((acc: any, obj: any) => {
                        return acc + obj.votingPower.toNumber();
                      }, 0) / (1 * 10 ** currentLock.account.config.decimals)}
                      </span>
                    </div>
                    <div className="w-full text-sm text-right">
                      <span className="text-base-content">Min threshold : </span>
                      <span>{currentLock.account.config.quorum * (currentLock.account.totalDeposits.toNumber() / (1 * 10 ** currentLock.account.config.decimals)) / 100}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-base-content">
                    Final voting results will be shown once the voting is closed.
                  </p>
                </>
              )}
            </div>
            <div className="w-full flex flex-col justify-center items-start bg-primary text-white rounded-box space-y-4 p-8">
              <div className="w-full flex justify-start items-center space-x-1">
                <FaWaveSquare className="text-base-content" />
                <span className="flex space-x-4">
                  <span className="text-base-content">Status:</span>
                  <BadgeProposalStatus proposal={proposal} lock={currentLock.account} isReady={isReady} />
                </span>
              </div>
              <div className="w-full flex justify-start items-center space-x-1">
                <FaWallet className="text-base-content" />
                <span className="flex space-x-4">
                  <span className="text-base-content">Created by:</span>
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
                <FaCalendar className="text-base-content" />
                <span className="flex space-x-4">
                  <span className="text-base-content">Start:</span>
                  <span>{new Date(proposal.createdAt.toNumber() * 1000).toDateString()}</span>
                  <span>{new Date(proposal.createdAt.toNumber() * 1000).getHours()}:{(new Date(proposal.createdAt.toNumber() * 1000).getMinutes())}</span>
                </span>
              </div>
              <div className="w-full flex justify-start items-center space-x-1">
                <FaCalendar className="text-base-content" />
                <span className="flex space-x-4">
                  <span className="text-base-content">End:</span>
                  <span>{new Date((proposal.endsAt.toNumber()) * 1000).toDateString()}</span>
                  <span>{new Date((proposal.endsAt.toNumber()) * 1000).getHours()}:{(new Date((proposal.endsAt.toNumber()) * 1000).getMinutes())}</span>
                </span>
              </div>
            </div>
            <div className="w-full flex flex-col justify-start items-start bg-primary text-white rounded-box space-y-4 p-8">
              <ul className="timeline timeline-vertical timeline-compact self-start">
                <li>
                  <div className="timeline-middle">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-5 w-5 text-info">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                        clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="timeline-end timeline-box text-sm">Created</div>
                  <hr className="bg-info" />
                </li>
                <li>
                  <hr className="bg-info" />
                  <div className="timeline-middle">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className={cn('h-5 w-5', {
                        "text-info": (proposal.endsAt.toNumber() * 1000) < new Date().getTime()
                      })}>
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                        clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="timeline-end timeline-box text-sm">Succeeded/Failed</div>
                  <hr className={cn('', {
                    "bg-info": proposal.executed
                  })}
                  />
                </li>
                <li>
                  <hr className={cn('', {
                    "bg-info": proposal.executed
                  })}
                  />
                  <div className="timeline-middle">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className={cn('h-5 w-5', {
                        "text-info": proposal.executed
                      })}>
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                        clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="timeline-end timeline-box text-sm">Executed</div>
                </li>
              </ul>
              {!proposal.executed && isReady &&
                <button className="btn w-full mt-4" onClick={onClick}>
                  Execute
                </button>
              }
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
