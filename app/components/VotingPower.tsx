"use client"

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react"

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
import type { User, Lock, TokenInfo } from "@/types";
import { cn } from "@/lib/utils";
import { stakeIx } from "@/lib/program/stake";
import { SubmitHandler, useForm } from "react-hook-form";

type Props = {
  currentUser: User | null
  currentUserLoading: boolean
  lock: Lock
  address: string
  tokenInfo: TokenInfo
}

export const VotingPower: FC<Props> = ({ currentUser, currentUserLoading, lock, address, tokenInfo }) => {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const [loading, setLoading] = useState<boolean>(false);
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
    if (publicKey) {
      try {
        setLoading(true);
        const mint = new PublicKey(lock.mint);
        const signerAta = getAssociatedTokenAddressSync(mint, publicKey);
        console.log("signer ata : ", signerAta.toString());

        const instruction = await registerIx(publicKey, new PublicKey(address), mint);

        let latestBlockhash = await connection.getLatestBlockhash()

        const messageV0 = new TransactionMessage({
          payerKey: publicKey,
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
    if (publicKey) {
      try {
        setLoading(true);
        const mint = new PublicKey(lock.mint);
        const signerAta = getAssociatedTokenAddressSync(mint, publicKey);
        console.log("signer ata : ", signerAta.toString());
        // amount: number,
        // decimals: PublicKey,
        // owner: PublicKey,
        // lock: PublicKey,
        // mint: PublicKey,
        // signerAta: PublicKey,
        const instruction = await stakeIx(
          inputs.amount,
          userTokenAmount.decimals,
          publicKey,
          new PublicKey(address),
          mint,
          signerAta
        );

        let latestBlockhash = await connection.getLatestBlockhash()

        const messageV0 = new TransactionMessage({
          payerKey: publicKey,
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
  };


  useEffect(() => {
    const fetchUserBalance = async () => {
      const mint = new PublicKey(lock.mint);
      const signerAta = getAssociatedTokenAddressSync(mint, publicKey);
      return await connection.getTokenAccountBalance(signerAta);
    }
    if (publicKey) {
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
  }, [publicKey])

  return (

    <form
      onSubmit={handleSubmit(onSubmit)}

      className={`w-full p-8 bg-base-100 text-base-content rounded-box flex flex-col items-center justify-center space-y-4`}
    >
      <CardTitle className="px-2 border-b pb-4 self-start w-full">
        <div className="text-lg font-extrabold">Voting Power</div>
        <div className="mt-4 flex w-full items-center space-x-4">
          <IoDiamond className="w-6 h-6" /> <span className="text-xl font-extrabold"> {currentUser && tokenInfo ? (
            <>
              {currentUser.deposits.reduce((acc: any, obj: any) => {
                return acc + obj.amount.toNumber();
              }, 0) / (1 * 10 ** tokenInfo.decimals)}
            </>
          ) : (
            <>0</>
          )
          }</span>
        </div>
        <p className="px-2 text-base-content text-xs text-center mt-4">Lock MONO tokens to receive your voting power. <Link href="/docs" className="underline">Learn more</Link></p>
        {currentUser ? (
          <div
            className="w-full bg-[#121212] p-8 flex flex-col mt-4 rounded-xl"
          >
            <div className="w-full flex">
              <div className="flex justify-around items-center text-xs w-[25%]">
                <div
                  className={cn("cursor-pointer", {
                    "text-success font-extrabold": isStake
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
                  className={cn("cursor-pointer", {
                    "text-success font-extrabold": isUnStake
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
                <div className="flex items-center justify-center"><IoWallet className="w-4 h-4" /> <span>{`${isStake ? (userTokenAmount ? userTokenAmount.uiAmount : 0) : (`${currentUser.deposits.reduce((acc: any, obj: any) => {
                  return acc + obj.amount.toNumber();
                }, 0) / (1 * 10 ** tokenInfo.decimals)} Staked`)}`} MONO</span></div>
                <button
                  className="btn btn-xs"
                  onClick={(e) => {
                    e.preventDefault();
                    setValue('amount', isStake ? (userTokenAmount ? (userTokenAmount.uiAmount / 2) : 0) : ((currentUser.deposits.reduce((acc: any, obj: any) => {
                      return acc + obj.amount.toNumber();
                    }, 0) / 2) / (1 * 10 ** tokenInfo.decimals)))
                  }}
                >
                  HALF
                </button>
                <button
                  className="btn btn-xs"
                  onClick={(e) => {
                    e.preventDefault();
                    setValue('amount', isStake ? (userTokenAmount ? userTokenAmount.uiAmount : 0) : (currentUser.deposits.reduce((acc: any, obj: any) => {
                      return acc + obj.amount.toNumber();
                    }, 0) / (1 * 10 ** tokenInfo.decimals)))

                  }}
                >
                  MAX
                </button>
              </div>
            </div>
            <div className="w-full flex mt-4 justify-center items-center">
              <button className="btn btn-sm text-xs">
                <Image src={logo} width={30} height={30} alt="mono token" className="rounded-full" />
                {isUnStake ? 'Staked ' : ''} MONO
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
          <div className="w-full bg-[#121212] p-8 flex flex-col mt-4 rounded-xl text-sm text-center">
            you are not registered to this locker
          </div>
        )}
      </CardTitle>
      <CardDescription className="w-full p-2">
        {
          currentUser ? (
            <button
              className={cn("btn btn-lg w-full mx-auto", {
                "btn-disabled": !userTokenAmount || loading,
              })}
              type="submit"
            >
              {userTokenAmount && userTokenAmount.uiAmount > 0 ? `${isStake ? 'stake' : isUnStake ? 'unstake' : 'error'}` : 'insufficient MONO'}
            </button>
          ) : (
            <button className="w-full btn btn-lg mx-auto"
              onClick={onClickRegister}
            >
              register to this locker
            </button>
          )
        }
      </CardDescription>
    </form>
  )
}
