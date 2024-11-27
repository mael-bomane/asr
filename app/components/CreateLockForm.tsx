"use client"

import { useContext, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { PublicKey, TransactionMessage, TransactionSignature, VersionedTransaction } from "@solana/web3.js";
import { getAssociatedTokenAddressSync, getMint, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { toast } from "sonner"
import { BN } from "bn.js";

import { Slider } from "./ui/slider";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";

import type { FC } from "react";
import { useRouter } from "next/navigation";
import { lockNewIx } from "@/lib/program/lockNew";
import { WalletConnectButton } from "@solana/wallet-adapter-react-ui";
import { LockContext } from "./LockContextProvider";
import { ellipsis } from "@/lib/utils";

export const CreateLockForm: FC = () => {
  const { program } = useContext(LockContext);
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [threshold, setThreshold] = useState<number>(50);
  const [quorum, setQuorum] = useState<number>(25);
  const [votingPeriod, setVotingPeriod] = useState<number>(86400 * 1000);
  const [seasonDuration, setSeasonDuration] = useState<number>(86400 * 1000 * 7);

  type Inputs = {
    signer: PublicKey
    mint: PublicKey
    symbol: string
    config: number
    permissionless: boolean
    seasonDuration: number
    votingPeriod: number
    lockDuration: number
    threshold: number
    quorum: number
    amount: number
    name: string
  }

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = async (inputs) => {
    console.log(inputs);
    let signature: TransactionSignature = '';
    if (publicKey) {
      try {
        setLoading(true)
        const mint = new PublicKey(inputs.mint);
        console.log("mint : ", mint.toString());
        const signerAta = getAssociatedTokenAddressSync(mint, publicKey);
        console.log("signer ata : ", signerAta.toString());
        const mintInfo = await getMint(
          connection,
          mint,
          "confirmed",
          TOKEN_PROGRAM_ID,
        );
        console.log("mint info : ", mintInfo);
        // signer: PublicKey,
        // mint: PublicKey,
        // signerAta: PublicKey,
        // config: number,
        // votingPeriod: BN,
        // lockDuration: BN,
        // threshold: number,
        // quorum: number,
        // min: BN,
        // name: string

        const instruction = await lockNewIx(
          program,
          publicKey,
          mint,
          signerAta,
          inputs.config ?? 0,
          inputs.permissionless ?? true,
          new BN(inputs.seasonDuration / 1000),
          new BN(inputs.votingPeriod / 1000),
          new BN(inputs.lockDuration / 1000),
          inputs.threshold,
          inputs.quorum ?? 25,
          new BN(inputs.amount * 1 * 10 ** mintInfo.decimals),
          inputs.name,
          inputs.symbol
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

        const lock = PublicKey.findProgramAddressSync(
          // seeds = [b"lock", creator.key().as_ref(), mint.key().as_ref()]
          [Buffer.from("lock"), publicKey.toBytes(), mint.toBytes()],
          program.programId
        )[0];

        toast("Success :", {
          description: `${ellipsis(signature)}`,
          action: {
            label: "Explorer",
            onClick: () => router.push(`https://explorer.solana.com/tx/${signature}?cluster=devnet`),
          },
        })

        router.push(`/lock/${lock.toString()}`);

      } catch (error) {
        console.log(error.message);

        setLoading(false);

        toast.error("Error :", {
          description: error.message,
          action: {
            label: "Undo",
            onClick: () => console.log("Undo"),
          },
        })

      }

    } else {
      toast.error('please connect your wallet');
    }

  };

  const getDuration = (milli: number) => {
    let minutes = Math.floor(milli / 60000);
    let hours = Math.round(minutes / 60);
    let days = Math.round(hours / 24);

    return (
      (days && { value: days, unit: 'days' }) ||
      (hours && { value: hours, unit: 'hours' }) ||
      { value: minutes, unit: 'minutes' }
    )
  };

  return (
    <form className="w-full relative overflow-hidden md:max-w-3xl grow w-full mx-auto flex flex-col justify-center items-center p-8 md:p-10 bg-primary text-white rounded-xl"
      onSubmit={handleSubmit(onSubmit)}
    >
      <h1 className="text-xl md:text-3xl font-extrabold flex justify-center items-center w-full text-center">
        Create ASR Lock
      </h1>
      <div className="w-full flex flex-col items-center justify-center space-y-2 grow">
        <Label htmlFor="name" className="self-start md:text-xl font-extrabold">Lock Name : {errors.name && <span className="text-error ml-4 text-sm">this field is required</span>}</Label>
        <Input placeholder="ex : monolith.haus" id="name" type="text"
          {...register("name", { required: true })}
        />
        <Label htmlFor="mint" className="self-start md:text-xl font-extrabold">Lock Mint : {errors.mint && <span className="text-error ml-4 text-sm">this field is required</span>}</Label>
        <Input
          type="text"
          placeholder="chosen mint"
          id="mint"
          {...register("mint", { required: true })}
        />
        <Label htmlFor="symbol" className="self-start md:text-xl font-extrabold">Mint Symbol : {errors.symbol && <span className="text-error ml-4 text-sm">this field is required</span>}</Label>
        <Input
          type="text"
          placeholder="ex: MONO"
          id="symbol"
          {...register("symbol", { required: true })}
        />
        <Label htmlFor="min" className="self-start md:text-xl font-extrabold">Voting Power To Start Proposal : {errors.amount && <span className="text-error ml-4 text-sm">this field is required</span>}</Label>
        <Input
          type="number"
          placeholder="ex : 100"
          id="min"
          {...register("amount", { required: true })}
        />
        <Label htmlFor="threshold" className="self-start md:text-xl font-extrabold">Approval Threshold : {threshold}% {errors.threshold && <span className="text-error ml-4 text-sm">this field is required</span>}</Label>
        <Slider id="threshold"
          defaultValue={[threshold]}
          onValueChange={(e) => {
            console.log(e[0]);
            setThreshold(e[0])
            setValue('threshold', e[0])
          }}
          {...register("threshold", { required: true })}
          min={50}
          max={100}
          step={1}
        />
        <Label htmlFor="quorum" className="self-start md:text-xl font-extrabold">Minimum Quorum : {quorum}% {errors.quorum && <span className="text-error ml-4 text-sm">this field is required</span>}</Label>
        <Slider id="quorum"
          defaultValue={[quorum]}
          onValueChange={(e) => {
            console.log(e[0]);
            setQuorum(e[0])
            setValue('quorum', e[0])
          }}
          {...register("quorum", { required: true })}
          min={0}
          max={100}
          step={1}
        />
        <Label htmlFor="votingPeriod" className="self-start md:text-xl font-extrabold">Voting Period : {getDuration(votingPeriod).value} {getDuration(votingPeriod).unit} {errors.votingPeriod && <span className="text-error ml-4 text-sm">this field is required</span>}</Label>
        <Slider id="votingPeriod"
          defaultValue={[86400 * 1000]}
          onValueChange={(e) => {
            console.log(e[0]);
            setVotingPeriod(e[0])
            setValue('votingPeriod', e[0])
          }}
          {...register("votingPeriod", { required: true })}
          min={86400 * 1000}
          max={86400 * 7 * 1000}
          step={86400 * 1000}
        />
        <Label htmlFor="seasonDuration" className="self-start md:text-xl font-extrabold">Season Duration : {getDuration(seasonDuration).value} {getDuration(seasonDuration).unit} {errors.seasonDuration && <span className="text-error ml-4 text-sm">this field is required</span>}</Label>
        <Slider id="seasonDuration"
          defaultValue={[86400 * 1000 * 7]}
          onValueChange={(e) => {
            console.log(e[0]);
            setSeasonDuration(e[0])
            setValue('seasonDuration', e[0])
          }}
          {...register("votingPeriod", { required: true })}
          min={86400 * 1000}
          max={86400 * 30 * 1000}
          step={86400 * 1000}
        />
      </div>
      {
        publicKey ? (
          <Button className="cursor-pointer mt-8 w-full font-extrabold text-lg hover:bg-base-100 border" size="lg" type="submit">Create</Button>
        ) : (
          <><WalletConnectButton /></>
        )
      }
    </form >
  );
}
