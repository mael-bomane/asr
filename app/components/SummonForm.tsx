"use client"

import Image from "next/image";
import { useContext, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { PublicKey, SystemProgram, TransactionMessage, TransactionSignature, VersionedTransaction } from "@solana/web3.js";
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID, getAssociatedTokenAddressSync } from "@solana/spl-token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { toast } from "react-hot-toast";
import { BN } from "bn.js";

import { MonolithContext } from "./MonolithContextProvider";
import { Slider } from "./ui/slider";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";

import type { FC } from "react";
import { useRouter } from "next/navigation";

export const SummonForm: FC = () => {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const { program } = useContext(MonolithContext);
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [threshold, setThreshold] = useState<number>(50);
  const [votingPeriod, setVotingPeriod] = useState<Object>({ oneWeek: {} });

  type Inputs = {
    summoner: PublicKey
    mint: PublicKey
    time: number
    threshold: number
    minPollTokens: number
    name: string
  }

  const {
    register,
    handleSubmit,
    watch,
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
        console.log("signer ata : ", signerAta.toString())

        const analytics = PublicKey.findProgramAddressSync(
          [Buffer.from("analytics")],
          program.programId
        )[0];

        const auth = PublicKey.findProgramAddressSync(
          [Buffer.from("auth"), analytics.toBytes()],
          program.programId
        )[0];

        const monolith = PublicKey.findProgramAddressSync(
          // seeds = [b"monolith", summoner.key().as_ref(), mint.key().as_ref()]
          [Buffer.from("monolith"), publicKey.toBytes(), mint.toBytes()],
          program.programId
        )[0];

        const vault = PublicKey.findProgramAddressSync(
          // seeds = [b"vault", creator.key().as_ref(), mint.key().as_ref()]
          [Buffer.from("vault"), publicKey.toBytes(), mint.toBytes()],
          program.programId
        )[0];

        const instructions = await program.methods.monolithNew(votingPeriod, threshold, new BN(inputs.minPollTokens * 1 * 10 ** 6), inputs.name)
          .accountsStrict({
            summoner: publicKey,
            auth,
            monolith,
            signerAta,
            vault,
            mint,
            analytics,
            systemProgram: SystemProgram.programId,
            tokenProgram: TOKEN_PROGRAM_ID,
            associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID
          }).instruction().catch((error: any) => console.log(error));

        // Get the lates block hash to use on our transaction and confirmation
        let latestBlockhash = await connection.getLatestBlockhash()

        // Create a new TransactionMessage with version and compile it to version 0
        const messageV0 = new TransactionMessage({
          payerKey: publicKey,
          recentBlockhash: latestBlockhash.blockhash,
          instructions: [instructions],
        }).compileToV0Message();

        // Create a new VersionedTransacction to support the v0 message
        const transation = new VersionedTransaction(messageV0)

        // Send transaction and await for signature
        signature = await sendTransaction(transation, connection);

        // Await for confirmation
        await connection.confirmTransaction({ signature, ...latestBlockhash }, 'confirmed');

        console.log(signature);

        toast.success(`success, redirecting you shortly :\ntx : ${signature}`);

        router.push(`/monolith/${monolith.toString()}`);

      } catch (error) {
        console.log(error);

        setLoading(false);
      }

    } else {
      toast.error('please connect your wallet');
    }

  };

  return (
    <form className="w-full md:max-w-7xl grow w-full mx-auto flex flex-col justify-center items-center p-8 md:p-10 bg-[#000] text-base-content rounded-xl"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="flex justify-center items-center">
        <Image src={"/sith.gif"} width={33} height={33} alt="pepe wizard" className="mr-4" unoptimized />
        <h1 className="text-xl md:text-3xl font-extrabold flex justify-center items-center w-full text-center">
          summon
        </h1>
        <Image src={"/sith.gif"} width={33} height={33} alt="pepe wizard" className="ml-4 transform -scale-x-100" unoptimized />
      </div>
      <div className="w-full flex flex-col items-center justify-center space-y-4 grow">
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
        <Label htmlFor="threshold" className="self-start md:text-xl font-extrabold">min. tokens to create poll {errors.minPollTokens && <span className="text-error ml-4 text-sm">this field is required</span>}</Label>
        <Input
          type="number"
          placeholder="ex : 100"
          id="minPollTokens"
          {...register("minPollTokens", { required: true })}
        />

        <Label htmlFor="threshold" className="self-start md:text-xl font-extrabold">approval threshold : {threshold}%</Label>
        <Slider id="threshold"
          defaultValue={[threshold]}
          onValueChange={(e) => {
            console.log(e[0]);
            setThreshold(e[0])
          }}
          min={50}
          max={100}
          step={1}
        />
        {errors.threshold && <div className="text-error">this field is required</div>}
        <Label htmlFor="time" className="self-start md:text-xl font-extrabold">voting perdiod : </Label>
        <div className="flex w-full items-start justify-start">
          <RadioGroup id="time" defaultValue="TwentyFourHours" onValueChange={(e) => {
            console.log(e);
            switch (e) {
              case 'TwentyFourHours': {
                setVotingPeriod({ TwentyFourHours: {} })
              }
              case 'FourtyEightHours': {
                setVotingPeriod({ FourtyEightHours: {} })
              }
              case 'OneWeek': {
                setVotingPeriod({ OneWeek: {} })
              }
            }
          }}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={"TwentyFourHours"} id="TwentyFourHours" />
              <Label htmlFor="time" className="self-start md:text-xl font-extrabold">24h</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={"FourtyEightHours"} id="FourtyEightHours" />
              <Label htmlFor="time" className="self-start md:text-xl font-extrabold">48h</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value={"OneWeek"} id="OneWeek" />
              <Label htmlFor="time" className="self-start md:text-xl font-extrabold">1 week</Label>
            </div>
          </RadioGroup>
          {errors.time && <div className="text-error">this field is required</div>}
        </div>
      </div>
      <Button className="cursor-pointer" size="lg" type="submit">summon</Button>
    </form>
  );
}