"use client"

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import { PublicKey, TransactionMessage, TransactionSignature, VersionedTransaction } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { toast } from "react-hot-toast";
import { BN } from "bn.js";

import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";

import { proposalNewIx } from "@/lib/program/proposalNew";
import { program } from "@/constants/program";

import { ellipsis } from "@/lib/utils";
import { FaTrash } from "react-icons/fa";

import type { FC } from "react";
import type { ProposalChoice, Lock } from "@/types";

export const CreateProposalForm: FC = () => {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const router = useRouter();
  const searchParams = useSearchParams()
  const address = searchParams.get('address');

  const [loading, setLoading] = useState<boolean>(false);

  const [lock, setLock] = useState<Lock | null>(null);
  const [lockPubkey, setLockPubkey] = useState<PublicKey | null>(null);

  const [choices, setChoices] = useState<ProposalChoice[]>([
    { id: 0, title: 'Approve', votingPower: new BN(0) },
    { id: 1, title: 'Reject', votingPower: new BN(0) },
  ]);

  useEffect(() => {
    if (address) {
      setLockPubkey(new PublicKey(address));
    }
  }, [address])

  useEffect(() => {
    const fetchMonolith = async () => {
      //@ts-ignore
      return await program.account.lock.fetch(lockPubkey);
    }
    if (lockPubkey) {
      fetchMonolith()
        .then(async response => {
          if (response) {
            console.log(response);
            setLock(response);
          }
        })
        .catch(err => console.log(err));
    }

  }, [lockPubkey]);

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
          lockPubkey,
          inputs.title,
          choices,
          new BN(lock.polls.toNumber() + 1),
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

        const proposal = PublicKey.findProgramAddressSync(
          // seeds = [b"proposal", lock.key().as_ref(), (locker.polls + 1).to_le_bytes().as_ref()]
          [Buffer.from("proposal"), new PublicKey(address).toBytes(), new BN(lock.polls.toNumber() + 1).toArrayLike(Buffer, 'le', 8)],
          program.programId
        )[0];

        router.push(`/proposal/${proposal.toString()}`)

      } catch (error) {
        console.log(error.message);

        setLoading(false);
        toast.error(`error :\n ${error}`);
      }

    } else {
      toast.error('please connect your wallet');
    }
  };

  return (
    <form className="w-full md:max-w-7xl grow w-full mx-auto flex flex-col justify-center items-center p-8 md:p-10 bg-primary text-base-content rounded-xl"
      onSubmit={handleSubmit(onSubmit)}
    >
      <h1 className="text-xl md:text-3xl font-extrabold flex justify-center items-center w-full text-center">
        Create Proposal
      </h1>
      <div>for <Link href={`/lock/${address}`} className="underline text-white">{`${ellipsis(address)}`}</Link></div>
      <div className="w-full flex flex-col items-center justify-center space-y-4 grow">
        <div className="w-full flex flex-col items-center justify-center space-y-2 grow">
          <Label htmlFor="name" className="self-start md:text-xl font-extrabold">title : {errors.title && <span className="text-error ml-4 text-sm">this field is required</span>}</Label>
          <Input placeholder="ex : fire gary !" id="name" type="text"
            {...register("title", { required: true })}
          />
        </div>
        <div className="w-full flex flex-col items-center justify-center space-y-2 grow">
          <Label htmlFor="choices" className="self-start md:text-xl font-extrabold">choices : {errors.title && <span className="text-error ml-4 text-sm">this field is required</span>}</Label>
          <div
            className="btn btn-xs btn-primary md:max-w-36 md:margin-x-auto text-base-100 self-start"
            onClick={() => {
              setChoices([...choices, {
                id: choices.length,
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
              <Input
                type="text"
                defaultValue={choice.title ?? ''}
                onChange={(e) => {
                  e.preventDefault();
                  choices[index].title = e.target.value;
                  setChoices(choices)
                }}
                placeholder="choice title"
                className="w-full p-2"
              />
              <div className="w-[25%] h-9 flex justify-center items-center cursor-pointer group bg-primary rounded-lg hover:bg-base-100 border"><FaTrash className="group-hover:text-error" /></div>
            </div>
          ))}
        </div>
      </div>

      <Button className="cursor-pointer mt-8" size="lg" type="submit">create</Button>
    </form>
  );
}
