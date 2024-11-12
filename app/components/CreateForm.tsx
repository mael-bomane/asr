"use client"

import Image from "next/image";
import { useContext, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { PublicKey, SystemProgram, TransactionMessage, TransactionSignature, VersionedTransaction } from "@solana/web3.js";
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync } from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { toast } from "react-hot-toast";
import { BN } from "bn.js";

import { MonolithContext } from "./MonolithContextProvider";
import { Slider } from "./ui/slider";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";

import type { FC } from "react";
import { useRouter } from "next/navigation";
import { LockNew } from "@/lib/program/new";

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
        const signerAta = getAssociatedTokenAddressSync(mint, publicKey);
        console.log("signer ata : ", signerAta.toString());
        // signer: PublicKey,
        // mint: PublicKey,
        // signerAta: Address,
        // config: number,
        // votingPeriod: BN,
        // lockDuration: BN,
        // threshold: number,
        // quorum: number,
        // min: BN,
        // name: string

        const instruction = await LockNew(publicKey, mint, signerAta, inputs.config, new BN(inputs.votingPeriod), new BN(inputs.lockDuration), inputs.threshold, inputs.quorum, new BN(inputs.min), inputs.name);


        // Get the lates block hash to use on our transaction and confirmation
        let latestBlockhash = await connection.getLatestBlockhash()

        // Create a new TransactionMessage with version and compile it to version 0
        const messageV0 = new TransactionMessage({
          payerKey: publicKey,
          recentBlockhash: latestBlockhash.blockhash,
          instructions: [instruction],
        }).compileToV0Message();

        // Create a new VersionedTransacction to support the v0 message
        const transation = new VersionedTransaction(messageV0)

        // Send transaction and await for signature
        signature = await sendTransaction(transation, connection);

        // Await for confirmation
        await connection.confirmTransaction({ signature, ...latestBlockhash }, 'confirmed');

        console.log(signature);

        toast.success(`success, redirecting you shortly :\ntx : ${signature}`);

      } catch (error) {
        console.log(error);

        setLoading(false);
      }

    } else {
      toast.error('please connect your wallet');
    }

  };
  function getDuration(milli: number) {
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
    <form className="w-full md:max-w-7xl grow w-full mx-auto flex flex-col justify-center items-center p-8 md:p-10 bg-[#000] text-base-content rounded-xl"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="flex justify-center items-center">
        <Image src={"/sith.gif"} width={33} height={33} alt="pepe wizard" className="mr-4" unoptimized />
        <h1 className="text-xl md:text-3xl font-extrabold flex justify-center items-center w-full text-center">
          create a monolith
        </h1>
        <Image src={"/sith.gif"} width={33} height={33} alt="pepe wizard" className="ml-4 transform -scale-x-100" unoptimized />
      </div>
      <div className="w-full flex flex-col items-center justify-center space-y-2 grow">

        <Label htmlFor="time" className="md:text-xl font-extrabold mt-4">monolith type : </Label>

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
        </RadioGroup>
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
        <Label htmlFor="threshold" className="self-start md:text-xl font-extrabold">min. tokens to create poll {errors.min && <span className="text-error ml-4 text-sm">this field is required</span>}</Label>
        <Input
          type="number"
          placeholder="ex : 100"
          id="minPollTokens"
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
          min={50}
          max={100}
          step={1}
        />
        {errors.threshold && <div className="text-error">this field is required</div>}
        <Label htmlFor="votingPeriod" className="self-start md:text-xl font-extrabold">voting period : {getDuration(votingPeriod).value} {getDuration(votingPeriod).unit}</Label>
        <Slider id="votingPeriod"
          defaultValue={[votingPeriod]}
          onValueChange={(e) => {
            console.log(e[0]);
            setVotingPeriod(e[0])
            setValue('votingPeriod', e[0])
          }}
          min={86400 * 1000}
          max={86400 * 7 * 1000}
          step={86400 * 1000}
        />
        {errors.votingPeriod && <div className="text-error">this field is required</div>}
      </div>
      <Button className="cursor-pointer" size="lg" type="submit">summon</Button>
    </form>
  );
}
