"use client"

import React, { useContext } from "react";

import { useCallback, useEffect, useState, CSSProperties } from "react"

import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, TransactionMessage, TransactionSignature, VersionedTransaction } from "@solana/web3.js";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";

import { toast } from "react-hot-toast";

import { registerIx } from "@/lib/program/register";

import RingLoader from "react-spinners/RingLoader";

import { CardDescription, CardTitle } from "@/components/ui/card";


import type { FC } from "react"
import type { User, LockMap } from "@/types";
import { cn } from "@/lib/utils";
import { FaCheck, FaGift } from "react-icons/fa";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { HeaderTableRow, Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { asrClaimIx } from "@/lib/program/asrClaim";
import { BN } from "bn.js";
import { LockContext } from "./LockContextProvider";

type Props = {
  currentUser: User | null
  currentUserLoading: boolean
  setCurrentUserLoading: React.Dispatch<React.SetStateAction<boolean>>
  lock: LockMap
}

export const ASRClaim: FC<Props> = ({ currentUser, currentUserLoading, setCurrentUserLoading, lock: { account, publicKey } }) => {
  const wallet = useWallet();
  const { sendTransaction } = useWallet();
  const { connection } = useConnection();
  const { program } = useContext(LockContext);

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
        setCurrentUserLoading(true);
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
        setCurrentUserLoading(false)
      } catch (error) {
        console.log(error);
        setCurrentUserLoading(false);
      }
    } else {
      toast.error('please connect your wallet');
    }
  }, [publicKey]);

  const onClickClaim = useCallback(async (mint: PublicKey) => {
    let signature: TransactionSignature = '';
    if (wallet.publicKey && currentUser && account) {
      try {
        setCurrentUserLoading(true);
        const signerAta = getAssociatedTokenAddressSync(mint, wallet.publicKey);
        console.log("signer ata : ", signerAta.toString());

        const instruction = await asrClaimIx(program, wallet.publicKey, publicKey, mint, signerAta, new BN(0));

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
        setCurrentUserLoading(false)
      } catch (error) {
        console.log(error);
        setCurrentUserLoading(false);
      }
    } else {
      if (!account) {
        toast.error('lock not found');
      }
      if (!currentUser) {
        toast.error('user not found');
      }
      if (!wallet.publicKey) {
        toast.error('please connect your wallet');
      }
    }
  }, [wallet.publicKey, currentUser, account]);

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

  const override: CSSProperties = {
    display: "block",
    margin: "0 auto",
    borderColor: "red",
  };

  return (
    <>
      {wallet.publicKey ? (
        <div
          className={`mx-auto w-full p-2 md:p-8 bg-primary text-base-content rounded-box flex flex-col items-center justify-center space-y-4`}
        >
          <CardTitle className="p-4 self-start w-full flex justify-between">
            <div className="w-full">
              <div className="text-lg font-extrabold text-white">Voting Summary</div>
              <div className="w-full text-sm font-semibold text-base-content mt-2">ASR Period :
                <span className="ml-4">{new Date(account.createdAt.toNumber() * 1000).toDateString()} - {new Date(account.seasons[account.seasons.length - 1]?.seasonEnd.toNumber() * 1000).toDateString()}</span>
              </div>
            </div>
            <div className="flex flex-col w-[50%] justify-end items-end space-x-4">
              <div className="w-full flex flex-col items-center space-y-4">
                <div className="w-full text-right text-xs font-extrabold">Votes Participated</div>
                <div className="w-full text-right text-xl font-extrabold text-white">
                  {currentUser?.votes?.length ?? 0}
                </div>
              </div>
            </div>
          </CardTitle>
          <CardDescription className="w-full p-2">
            {currentUser && account ? (
              <Table>
                <TableCaption>{account.config.name}&apos;s Active Staking Rewards</TableCaption>
                <TableHeader>
                  <HeaderTableRow>
                    <TableHead className="w-[100px]">Token</TableHead>
                    <TableHead className="text-center">Season</TableHead>
                    <TableHead className="text-center">Claimed</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </HeaderTableRow>
                </TableHeader>
                {account?.seasons?.filter(season => (season.seasonEnd.toNumber() * 1000) < new Date().getTime()).concat()?.map((season, id) => (
                  <TableBody key={id} >
                    {currentUser.votes.filter(vote => vote.season == season.season).length > 0 && season.asr.map((token, index) => (
                      <TableRow key={index}
                        onClick={() => onClickClaim(token.mint)}
                        className="text-white cursor-pointer font-semibold">
                        <TableCell className={cn("flex space-x-1", {
                          "w-[200px]": token.mint.toString() == account.config.mint.toString(),
                          "w-[100px]": !(token.mint.toString() == account.config.mint.toString()),
                        })}>
                          {token.mint.toString() == account.config.mint.toString() ? 'Staked ' : ''}
                          MONO
                        </TableCell>
                        <TableCell className="text-center">{season.season}</TableCell>
                        <TableCell className="w-full text-center flex justify-center items-center">
                          {(currentUser.claims.filter((claim) => (claim.mint.toString() == token.mint.toString()) && (claim.season == season.season)).length > 0) ? (
                            <FaCheck className="text-success" />
                          ) : 'Click To Claim'}
                        </TableCell>
                        <TableCell className="text-right">{new Intl.NumberFormat().format(((currentUser.votes.reduce((acc, obj) => {
                          if (obj.season == season.season) {
                            return acc + obj.votingPower.toNumber();
                          } else {
                            return acc + 0
                          }
                        }, 0)) / (1 * 10 ** account.config.decimals) * (token.amount.toNumber() / (1 * 10 ** token.decimals))) / (season.points.toNumber() / (1 * 10 ** account.config.decimals)))}
                        </TableCell>
                      </TableRow>
                    ))}

                  </TableBody>
                ))}


              </Table>

            ) : (
              <div className="w-full bg-[#121212] p-8 flex flex-col mt-4 rounded-xl text-sm text-center space-y-4">
                <div>You&apos;re not registered on this Lock</div>
                <button className={cn("w-full btn btn-[#000] mx-auto text-white")} disabled={currentUserLoading}
                  onClick={onClickRegister}
                >
                  {currentUserLoading ? (
                    <RingLoader
                      color={"#ffffff"}
                      loading={currentUserLoading}
                      cssOverride={override}
                      size={10}
                      aria-label="Loading Spinner"
                      data-testid="loader"
                    />
                  ) : <>Register To {account.config.name}</>}
                </button>
              </div>
            )}
          </CardDescription>
        </div>
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

