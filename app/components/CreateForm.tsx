"use client"

import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { PublicKey, TransactionMessage, TransactionSignature, VersionedTransaction } from "@solana/web3.js";
import { getAssociatedTokenAddressSync, getMint, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { toast } from "react-hot-toast";
import { BN } from "bn.js";

import { Slider } from "./ui/slider";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";

import type { FC } from "react";
import { useRouter } from "next/navigation";
import { lockNewIx } from "@/lib/program/lockNew";

export const CreateForm: FC = () => {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [threshold, setThreshold] = useState<number>(50);
  const [votingPeriod, setVotingPeriod] = useState<number>(86400 * 1000);

  type Inputs = {
    signer: PublicKey
    mint: PublicKey
    config: number
    votingPeriod: number
    lockDuration: number
    threshold: number
    quorum: number
    min: number
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
          publicKey,
          mint,
          signerAta,
          inputs.config ?? 0,
          new BN(inputs.votingPeriod ? (inputs.votingPeriod / 1000) : 86400),
          new BN(inputs.lockDuration ? inputs.lockDuration : new BN(0)),
          inputs.threshold,
          inputs.quorum ?? 25,
          new BN(inputs.min * 1 * 10 ** mintInfo.decimals),
          inputs.name
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

        toast.success(`success, redirecting you shortly :\ntx : ${signature}`);

      } catch (error) {
        console.log(error);

        setLoading(false);
        toast.error(`error :\n ${error}`);
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
    <form className="w-full md:max-w-7xl grow w-full mx-auto flex flex-col justify-center items-center p-8 md:p-10 bg-base-100 text-base-content rounded-xl"
      onSubmit={handleSubmit(onSubmit)}
    >
      <h1 className="text-xl md:text-3xl font-extrabold flex justify-center items-center w-full text-center">
        configure your monolith
      </h1>
      <div className="w-full flex flex-col items-center justify-center space-y-2 grow">

        {/*<Label htmlFor="time" className="md:text-xl font-extrabold mt-4">monolith type : </Label>

        <RadioGroup
          className="flex w-full items-center justify-center"
          id="config"
          defaultValue="ActiveStakingRewards"
          onValueChange={(e) => {
            console.log(e);
          }}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value={'0'} id="ActiveStakingRewards" />
            <Label htmlFor="config" className="self-start md:text-xl font-extrabold">active staking rewards</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value={'1'} id="FourtyEightHours" />
            <Label htmlFor="config" className="self-start md:text-xl font-extrabold">voting escrow</Label>
          </div>
        </RadioGroup>*/}
        <Label htmlFor="name" className="self-start md:text-xl font-extrabold">monolith name : {errors.name && <span className="text-error ml-4 text-sm">this field is required</span>}</Label>

        <Input placeholder="ex : monolith.haus" id="name" type="text"
          {...register("name", { required: true })}
        />
        <Label htmlFor="mint" className="self-start md:text-xl font-extrabold">mint to stake : {errors.mint && <span className="text-error ml-4 text-sm">this field is required</span>}</Label>

        <Input
          type="text"
          placeholder="chosen mint"
          id="mint"
          {...register("mint", { required: true })}
        />
        <Label htmlFor="min" className="self-start md:text-xl font-extrabold">min. tokens to create poll {errors.min && <span className="text-error ml-4 text-sm">this field is required</span>}</Label>
        <Input
          type="number"
          placeholder="ex : 100"
          id="min"
          {...register("min", { required: true })}
        />

        <Label htmlFor="threshold" className="self-start md:text-xl font-extrabold">approval threshold : {threshold}%</Label>
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
        {errors.threshold && <div className="text-error">this field is required</div>}
        <Label htmlFor="votingPeriod" className="self-start md:text-xl font-extrabold">voting period : {getDuration(votingPeriod).value} {getDuration(votingPeriod).unit}</Label>
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
        {errors.votingPeriod && <div className="text-error">this field is required</div>}
      </div>
      <Button className="cursor-pointer mt-8" size="lg" type="submit">create</Button>
    </form>
  );
}
