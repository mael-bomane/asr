"use client"

import Image from "next/image";
import Link from "next/link";
import { useCallback, useContext, useEffect, useState } from "react"

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, TransactionMessage, TransactionSignature, VersionedTransaction } from "@solana/web3.js";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";

import { toast } from "react-hot-toast";

import { registerIx } from "@/lib/program/register";

import { IoDiamond, IoWallet } from "react-icons/io5";
import logo from "@/app/icon.png";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";


import type { FC } from "react"
import type { User, LockMap } from "@/types";
import { cn } from "@/lib/utils";
import { stakeIx } from "@/lib/program/stake";
import { SubmitHandler, useForm } from "react-hook-form";
import { unstakeIx } from "@/lib/program/unstake";
import { stakeDeactivateIx } from "@/lib/program/deactivate";
import { UNSTAKING_TIME } from "@/constants";
import { LockContext } from "./LockContextProvider";

type Props = {
  currentUser: User | null
  currentUserLoading: boolean
  lock: LockMap
  address: string
}

export const VotingPower: FC<Props> = ({ currentUser, currentUserLoading, lock: { account, publicKey }, address }) => {
  const wallet = useWallet();
  const { sendTransaction } = useWallet();
  const { connection } = useConnection();
  const { program, loading, setLoading } = useContext(LockContext);
  const [isStake, setIsStake] = useState<boolean>(true);
  const [isUnStake, setIsUnStake] = useState<boolean>(false);

  type UserTokenAmount = {
    value: string
    decimals: number
    uiAmount: number
  }
  const [userTokenAmount, setUserTokenAmount] = useState<UserTokenAmount | null>(null);

  const onClickRegister = useCallback(async () => {
    let signature: TransactionSignature = '';
    if (wallet.publicKey) {
      try {
        setLoading(true);
        const signerAta = getAssociatedTokenAddressSync(account.config.mint, wallet.publicKey);
        console.log("signer ata : ", signerAta.toString());

        const instruction = await registerIx(program, wallet.publicKey, publicKey);

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

        toast.success(`success:\ntx : ${signature}`);
        setLoading(false)
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    } else {
      toast.error('please connect your wallet');
    }
  }, [publicKey]);

  type Inputs = {
    amount: number
  }

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = async (inputs) => {
    let signature: TransactionSignature = '';
    if (wallet.publicKey) {
      if (isStake) {
        try {
          setLoading(true);
          const signerAta = getAssociatedTokenAddressSync(account.config.mint, wallet.publicKey);
          console.log("signer ata : ", signerAta.toString());
          // amount: number,
          // decimals: PublicKey,
          // owner: PublicKey,
          // lock: PublicKey,
          // mint: PublicKey,
          // signerAta: PublicKey,
          const instruction = await stakeIx(
            program,
            inputs.amount,
            userTokenAmount.decimals,
            wallet.publicKey,
            publicKey,
            account.config.mint,
            signerAta
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

          toast.success(`success:\ntx : ${signature}`);
          setLoading(false)
        } catch (error) {
          console.log(error);
          setLoading(false);
        }

      } else if (isUnStake) {
        try {
          setLoading(true);

          // owner: PublicKey,
          // lock: PublicKey,
          const instruction = await stakeDeactivateIx(
            program,
            wallet.publicKey,
            publicKey,
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

          toast.success(`success:\ntx : ${signature}`);
          setLoading(false)
        } catch (error) {
          console.log(error);
          setLoading(false);
        }
      }
    } else {
      toast.error('please connect your wallet');
    }
  };


  useEffect(() => {
    const fetchUserBalance = async () => {
      const signerAta = getAssociatedTokenAddressSync(account.config.mint, wallet.publicKey);
      return await connection.getTokenAccountBalance(signerAta);
    }
    if (account && wallet.publicKey) {
      fetchUserBalance().then(res => {
        console.log("user token balance", res);
        if (res) {
          setUserTokenAmount({
            value: res.value.amount,
            decimals: res.value.decimals,
            uiAmount: res.value.uiAmount,
          });
        }

      })
    }
  }, [wallet.publicKey, account])

  return (

    <form
      onSubmit={handleSubmit(onSubmit)}
      className={`max-w-[500px] grow mx-auto p-2 md:p-8 bg-primary text-base-content rounded-box flex flex-col items-center justify-center space-y-4`}
    >
      <CardTitle className="px-2 pb-4 self-start w-full">
        <div className="text-lg font-extrabold">Voting Power</div>
        <div className="mt-4 flex w-full items-center space-x-4">
          <IoDiamond className="w-6 h-6" /> <span className="text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-500"> {currentUser ? (
            <>
              {currentUser && currentUser.deposits.reduce((acc, obj) => {
                if (!obj.deactivating) {
                  return acc + obj.amount.toNumber();
                } else {
                  return acc
                }
              }, 0) / (1 * 10 ** account.config.decimals)}
            </>
          ) : (
            <>0</>
          )
          }
          </span>
        </div>
        <div className="px-2 text-base-content text-xs text-center mt-4">Lock
          <Link href={`https://explorer.solana.com/address/${account.config.mint.toString()}?cluster=devnet`}
            className="underline font-extrabold">{' '}{account.config.symbol}{' '}</Link>
          tokens to receive your voting power. <Link href="/docs" className="underline">Learn more</Link>
        </div>
        {wallet.publicKey && currentUser ? (
          <div
            className="w-full bg-base-100 p-4 flex flex-col mt-4 rounded-xl"
          >
            <div className="w-full flex">
              <div className="flex justify-around items-center text-xs space-x-2">
                <div
                  className={cn("cursor-pointer text-lg", {
                    "bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-500 font-extrabold": isStake
                  })}
                  onClick={() => {
                    setIsStake(true);
                    setIsUnStake(false);
                    if (isUnStake) {
                      setValue('amount', 0);
                    }
                  }}
                >
                  stake
                </div>
                <div
                  className={cn("cursor-pointer text-lg", {
                    "bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-500 font-extrabold": isUnStake
                  })}
                  onClick={() => {
                    setIsStake(false);
                    setIsUnStake(true);
                    if (isStake) {
                      setValue('amount', 0);
                    }
                  }}
                >
                  unstake
                </div>
              </div>
              <div className="text-xs flex flex-1 grow w-full justify-end space-x-2">
                <div className="w-full flex items-center justify-center"><IoWallet className="w-4 h-4" /> <span className="uppercase">{`${isStake ? (userTokenAmount ? new Intl.NumberFormat().format(userTokenAmount.uiAmount) : 0) :
                  (`${new Intl.NumberFormat().format(currentUser.deposits.reduce((acc: any, obj: any) => {
                    if (!obj.deactivating) {
                      return acc + obj.amount.toNumber();
                    } else {
                      return acc
                    }
                  }, 0) / (1 * 10 ** account.config.decimals))} Staked`)}`} {account.config.symbol}</span></div>
                <button
                  className="btn btn-xs"
                  onClick={(e) => {
                    e.preventDefault();
                    setValue('amount', isStake ? (userTokenAmount ? (userTokenAmount.uiAmount / 2) : 0) : ((currentUser.deposits.reduce((acc, obj) => {
                      return acc + obj.amount.toNumber();
                    }, 0) / 2) / (1 * 10 ** account.config.decimals)))
                  }}
                >
                  HALF
                </button>
                <button
                  className="btn btn-xs"
                  onClick={(e) => {
                    e.preventDefault();
                    setValue('amount', isStake ? (userTokenAmount ? userTokenAmount.uiAmount : 0) : (currentUser.deposits.reduce((acc, obj) => {
                      return acc + obj.amount.toNumber();
                    }, 0) / (1 * 10 ** account.config.decimals)))
                  }}
                >
                  MAX
                </button>
              </div>
            </div>
            <div className="w-full flex mt-4 justify-center items-center">
              <button className="btn btn-sm text-xs">
                <Image src={logo} width={30} height={30} alt="mono token" className="rounded-full" />
                {isUnStake ? 'Staked ' : ''} {account.config.symbol}
              </button>
              <Input
                type="number"
                placeholder="0.0"
                className="text-right border-none"
                {...register("amount", { required: true })}
              />
            </div>
          </div>
        ) : (
          <>
            <button className={cn("w-full btn btn-lg mx-auto")} disabled={!wallet.publicKey}
              onClick={onClickRegister}
            >
              {wallet.publicKey ? "Register To Locker" : "Connect Your Wallet"}
            </button>
          </>
        )}
      </CardTitle>
      <CardDescription className="w-full p-2">
        {wallet.publicKey && currentUser && (
          <>
            {currentUser ? (
              <button
                className={cn("btn btn-lg w-full mx-auto", {
                  "btn-disabled": !userTokenAmount || loading,
                })}
                type="submit"
              >
                <span className={cn('', {
                  "bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-500": isStake || isUnStake,
                })}>
                  {userTokenAmount && userTokenAmount.uiAmount > 0 ? `${isStake ? 'stake' : isUnStake ? 'unstake' : 'error'}` : 'insufficient MONO'}
                </span>
              </button>
            ) : (
              <>
                <button className={cn("w-full btn btn-lg mx-auto")} disabled={!wallet.publicKey}
                  onClick={onClickRegister}
                >
                  {wallet.publicKey ? "Register To Locker" : "Connect Your Wallet"}
                </button>
              </>
            )}
          </>
        )}
        {currentUser?.deposits.filter(deposit => deposit.deactivating)?.length > 0 && (
          <div className="w-full flex flex-col justify-center items-center space-y-2 mt-2">
            <div className="self-start">Deactivating Stake : </div>
            <>{currentUser.deposits.filter(deposit => deposit.deactivating && deposit.amount.toNumber() !== 0)?.map((deposit, index) => {
              return (
                <div className="w-full bg-base-100 p-2 rounded-xl" key={index}>
                  <div className="w-full flex items-between">
                    <div className="w-full flex items-between">
                      {deposit.amount.toNumber() / (1 * 10 ** account.config.decimals)}
                    </div>
                    <div className="w-full">Claimable : {new Date((deposit.deactivationStart.toNumber() + UNSTAKING_TIME) * 1000).toDateString()}</div>
                  </div>
                </div>
              )
            })}
            </>
          </div>
        )}
      </CardDescription>
    </form>
  )
}

