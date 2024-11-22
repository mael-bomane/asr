"use client"

import { useContext, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import { PublicKey, TransactionMessage, TransactionSignature, VersionedTransaction } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { toast } from "react-hot-toast";
import { BN } from "bn.js";
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";

import { proposalNewIx } from "@/lib/program/proposalNew";
import { program } from "@/constants/program";

import { ellipsis } from "@/lib/utils";
import { FaTrash } from "react-icons/fa";

import type { FC } from "react";
import type { ProposalChoice, Lock } from "@/types";
import { LockContext } from "./LockContextProvider";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";

export const CreateProposalForm: FC = () => {
  const wallet = useWallet();
  const { sendTransaction } = useWallet();
  const { connection } = useConnection();
  const { locks, currentLock, setCurrentLock, currentUser } = useContext(LockContext);
  const router = useRouter();
  const searchParams = useSearchParams()
  const address = searchParams.get('address');

  const [loading, setLoading] = useState<boolean>(false);

  const [lockPubkey, setLockPubkey] = useState<PublicKey | null>(null);

  const [choices, setChoices] = useState<ProposalChoice[]>([
    { id: 0, title: 'Approve', votingPower: new BN(0) },
    { id: 1, title: 'Reject', votingPower: new BN(0) },
  ]);

  type Inputs = {
    title: string
  }

  const FormSchema = z.object({
    title: z
      .string({
        required_error: "Please input Title",
      }).min(1).max(50)
    ,
    content: z
      .string({
        required_error: "Please input Content",
      }).min(1).max(280),
    address: z
      .string({
        required_error: "Please input Content",
      }).min(1).max(280)
  })

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  })

  const onSubmit: SubmitHandler<Inputs> = async (data: z.infer<typeof FormSchema>) => {
    console.log(data);
    let signature: TransactionSignature = '';
    if (wallet.publicKey) {
      try {
        setLoading(true)

        // owner: PublicKey,
        // lock: PublicKey,
        // title: string,
        // choices: ProposalChoice[],
        // id: BN

        const instruction = await proposalNewIx(
          wallet.publicKey,
          lockPubkey,
          data.title,
          choices,
          new BN(currentLock.account.polls.toNumber() + 1),
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

        toast.success(`success, redirecting you shortly :\ntx : ${signature}`);

        const proposal = PublicKey.findProgramAddressSync(
          // seeds = [b"proposal", lock.key().as_ref(), (locker.polls + 1).to_le_bytes().as_ref()]
          [Buffer.from("proposal"), new PublicKey(address).toBytes(), new BN(currentLock.account.polls.toNumber() + 1).toArrayLike(Buffer, 'le', 8)],
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
    <Form {...form}>
      <form className="w-full grow mx-auto flex flex-col justify-center items-center p-8 md:p-10 bg-primary text-base-content"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <h1 className="text-xl md:text-3xl font-extrabold flex justify-center items-center w-full text-center">
          Create Proposal
        </h1>
        <div className="w-full flex flex-col items-center justify-center space-y-4 grow">
          <div className="w-full flex flex-col items-center justify-center space-y-2 grow">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Lock</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={currentLock?.publicKey.toString() ?? field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Lock" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {locks?.map(({ account, publicKey }) => (
                        <SelectItem value={publicKey.toString()} onClick={() => setCurrentLock({ account, publicKey })} key={publicKey.toString()}>{account.config.name} {ellipsis(publicKey.toString())}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {currentLock && (
                      <>
                        You need <span className="font-extrabold text-white">{currentLock.account.config.amount.toNumber() / (1 * 10 ** currentLock.account.config.decimals)} Staked {currentLock.account.config.symbol}</span> to create a Proposal.
                      </>
                    )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex : Ready For Mainnet !" {...field} />
                  </FormControl>
                  <FormDescription>
                    Max 50 Characters
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Body</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us a little bit about yourself"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Max 280 Characters
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="w-full flex flex-col items-center justify-center space-y-2">
              <Label htmlFor="choices" className="self-start md:text-xl font-extrabold">choices : {form.formState.errors.title && <span className="text-error ml-4 text-sm">this field is required</span>}</Label>
              <div
                className="btn btn-xs btn-primary md:max-w-36 md:margin-x-auto text-base-100 self-start"
                onClick={() => {
                  console.log("choices : ", choices);
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
              {choices.map((choice, index) => (
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
                  <div className="w-[25%] h-9 flex justify-center items-center cursor-pointer group bg-primary rounded-lg hover:bg-base-100 border"
                    onClick={() => {
                      const newChoices = choices.filter((cx) => cx.id !== choice.id).map(cx => {
                        if (cx.id > choice.id) {
                          cx.id -= 1
                        }
                        return cx
                      });
                      console.log("new choices : ", newChoices);
                      setChoices(newChoices);
                    }}
                  >
                    <FaTrash className="group-hover:text-error" />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        <Button className="cursor-pointer mt-8" size="lg" type="submit">create</Button>
      </form>
    </Form>
  );
}
