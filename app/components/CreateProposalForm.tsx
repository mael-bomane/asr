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
import { proposalNewIx } from "@/lib/program/proposalNew";
import { ProposalChoice } from "@/types";

export const CreateProposalForm: FC = () => {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [threshold, setThreshold] = useState<number>(50);
  const [choices, setChoices] = useState<ProposalChoice[]>([
    { id: 0, title: 'approve', votingPower: new BN(0) },
    { id: 1, title: 'reject', votingPower: new BN(0) },
  ]);

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

  const onSubmit: SubmitHandler<Inputs> = async (inputs) => {
    console.log(inputs);
    let signature: TransactionSignature = '';
    if (publicKey) {
      try {
        setLoading(true)

        // owner: PublicKey,
        // lock: PublicKey,
        // title: string,
        // choices: ProposalChoice[],
        // id: BN

        const instruction = await proposalNewIx(
          publicKey,
          publicKey,
          inputs.title,
          choices,
          new BN(0),
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

  return (
    <form className="w-full md:max-w-7xl grow w-full mx-auto flex flex-col justify-center items-center p-8 md:p-10 bg-base-100 text-base-content rounded-xl"
      onSubmit={handleSubmit(onSubmit)}
    >
      <h1 className="text-xl md:text-3xl font-extrabold flex justify-center items-center w-full text-center">
        Create Proposal
      </h1>
      <div className="w-full flex flex-col items-center justify-center space-y-2 grow">
        <Label htmlFor="name" className="self-start md:text-xl font-extrabold">title : {errors.title && <span className="text-error ml-4 text-sm">this field is required</span>}</Label>
        <Input placeholder="ex : fire gary !" id="name" type="text"
          {...register("title", { required: true })}
        />
        <div
          className="btn btn-xs btn-primary md:max-w-36 md:margin-x-auto my-4 text-base-100 self-start"
          onClick={() => {
            setChoices([...choices, {
              id: choices.length + 1,
              title: '',
              votingPower: new BN(0),
            }])
          }}
        >
          Add Choice
        </div>
      </div>
      <div className="w-full flex flex-col mt-4 space-y-2">
        {choices.length > 0 && choices.map((choice, index) => (
          <div className="w-full flex justify-center space-x-2" key={index}>
            <input
              type="text"
              defaultValue={choice.title ?? ''}
              onChange={(e) => {
                e.preventDefault();
                choices[index].title = e.target.value;
                setChoices(choices)
              }}
              placeholder="title"
              className="text-black w-full"
            />
          </div>
        ))}
      </div>

      <Button className="cursor-pointer mt-8" size="lg" type="submit">create</Button>
    </form>
  );
}
