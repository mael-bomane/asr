"use client"

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState, CSSProperties } from "react"

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, TransactionMessage, TransactionSignature, VersionedTransaction } from "@solana/web3.js";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";

import { toast } from "react-hot-toast";

import { registerIx } from "@/lib/program/register";

import RingLoader from "react-spinners/RingLoader";
import { IoDiamond, IoWallet } from "react-icons/io5";
import logo from "@/app/icon.png";

import { CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";


import type { FC } from "react"
import type { User, Lock, TokenInfo } from "@/types";
import { cn } from "@/lib/utils";
import { stakeIx } from "@/lib/program/stake";
import { SubmitHandler, useForm } from "react-hook-form";
import { stakeDeactivateIx } from "@/lib/program/deactivate";
import { UNSTAKING_TIME } from "@/constants";
import { FaGift } from "react-icons/fa";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { HeaderTableRow, Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "./ui/table";

type Props = {
  currentUser: User | null
  currentUserLoading: boolean
  lock: Lock | null
  address: string
}

export const ASRClaim: FC<Props> = ({ currentUser, currentUserLoading, lock, address }) => {
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

        const instruction = await registerIx(publicKey, new PublicKey(address));

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
      if (isStake) {
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

      } else if (isUnStake) {
        try {
          setLoading(true);

          // owner: PublicKey,
          // lock: PublicKey,
          const instruction = await stakeDeactivateIx(
            publicKey,
            new PublicKey(address),
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
    if (lock && publicKey) {
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
  }, [publicKey, lock])

  const override: CSSProperties = {
    display: "block",
    margin: "0 auto",
    borderColor: "red",
  };
  const invoices = [
    {
      invoice: "INV001",
      paymentStatus: "Paid",
      totalAmount: "$250.00",
      paymentMethod: "Credit Card",
    },
    {
      invoice: "INV002",
      paymentStatus: "Pending",
      totalAmount: "$150.00",
      paymentMethod: "PayPal",
    },
    {
      invoice: "INV003",
      paymentStatus: "Unpaid",
      totalAmount: "$350.00",
      paymentMethod: "Bank Transfer",
    },
    {
      invoice: "INV004",
      paymentStatus: "Paid",
      totalAmount: "$450.00",
      paymentMethod: "Credit Card",
    },
    {
      invoice: "INV005",
      paymentStatus: "Paid",
      totalAmount: "$550.00",
      paymentMethod: "PayPal",
    },
    {
      invoice: "INV006",
      paymentStatus: "Pending",
      totalAmount: "$200.00",
      paymentMethod: "Bank Transfer",
    },
    {
      invoice: "INV007",
      paymentStatus: "Unpaid",
      totalAmount: "$300.00",
      paymentMethod: "Credit Card",
    },
  ]
  return (
    <>
      {publicKey ? (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className={`mx-auto w-full p-2 md:p-8 bg-primary text-base-content rounded-box flex flex-col items-center justify-center space-y-4`}
        >
          <CardTitle className="p-4 self-start w-full flex justify-between">
            <div className="w-full">
              <div className="text-lg font-extrabold text-white">Voting Summary</div>
              <div className="w-full text-sm font-semibold text-base-content mt-2">ASR Period :
                {/* @ts-ignore */}
                <span className="ml-4">{new Date(lock.createdAt * 1000).toDateString()} - {new Date(lock.seasons[lock.seasons.length - 2]?.seasonEnd * 1000).toDateString()}</span>
              </div>
            </div>
            <div className="flex flex-col w-full justify-end items-end space-x-4">
              <div className="w-full flex flex-col items-center space-y-4">
                <div className="w-full text-right text-xs font-extrabold">Votes Participated</div>
                <div className="w-full text-right text-xl font-extrabold text-white">
                  {currentUser?.votes?.length ?? 0}
                </div>
              </div>
            </div>
          </CardTitle>
          <CardDescription className="w-full p-2">
            {currentUser && lock ? (
              <Table>
                <TableCaption>{lock.name}&apos;s Active Staking Rewards</TableCaption>
                <TableHeader>
                  <HeaderTableRow>
                    <TableHead className="w-[100px]">Token</TableHead>
                    <TableHead className="text-center">Season</TableHead>
                    <TableHead className="text-center">Claimed</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </HeaderTableRow>
                </TableHeader>
                <TableBody>
                  {/*@ts-ignore*/}
                  {lock?.seasons?.filter(season => (season.seasonEnd.toNumber() * 1000) < new Date().getTime()).concat()?.map((season) => (
                    <>
                      {season.asr.map((token, index) => (
                        <TableRow key={index} className="text-white cursor-pointer">
                          <TableCell className="w-[100px] font-medium">MONO</TableCell>
                          <TableCell className="text-center">{season.season}</TableCell>
                          <TableCell className="text-center">
                            {currentUser.claims.filter((claim) => (claim.mint == token.mint) && (claim.season == season.season)).length > 0 ? 'Yes' : 'Click To Claim'}
                          </TableCell>
                          <TableCell className="text-right">{((currentUser.votes.reduce((acc, obj) => {
                            if (obj.season == season.season) {
                              // @ts-ignore
                              return acc + obj.votingPower.toNumber();
                            } else {
                              return acc + 0
                            }
                          }, 0)) / (1 * 10 ** lock.decimals) * (token.amount.toNumber() / (1 * 10 ** token.decimals))) / (season.points.toNumber() / (1 * 10 ** lock.decimals))}
                          </TableCell>
                        </TableRow>
                      ))}
                    </>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="w-full bg-[#121212] p-8 flex flex-col mt-4 rounded-xl text-sm text-center space-y-4">
                <div>You&apos;re not registered on this Lock</div>
                <button className={cn("w-full btn btn-[#000] mx-auto text-white")} disabled={loading}
                  onClick={onClickRegister}
                >
                  {loading ? (
                    <RingLoader
                      color={"#ffffff"}
                      loading={loading}
                      cssOverride={override}
                      size={150}
                      aria-label="Loading Spinner"
                      data-testid="loader"
                    />
                  ) : <>Register To {lock.name}</>}
                </button>
              </div>
            )}
          </CardDescription>
        </form>
      ) : (
        <div className={`mx-auto w-full p-2 md:p-8 bg-primary text-base-content rounded-box flex flex-col items-center justify-center space-y-8`}>
          <div className="avatar p-8 rounded-full bg-base-100">
            <FaGift className="w-12 h-12 text-success" />
          </div>
          <div className="text-sm text-base-400">
            Connect your wallet to check your eligibility for rewards and claim them.
          </div>
          <WalletMultiButton />
        </div>
      )}
    </>
  )
}

