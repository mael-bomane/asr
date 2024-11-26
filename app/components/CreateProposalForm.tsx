"use client"

import { useContext, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import { PublicKey, TransactionInstruction, TransactionMessage, TransactionSignature, VersionedTransaction } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { BN } from "bn.js";
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";

import { ellipsis } from "@/lib/utils";
import { FaPlus, FaTrash } from "react-icons/fa";
import { toast } from "sonner"
import type { FC } from "react";
import type { ProposalChoice, Lock } from "@/types";
import { LockContext } from "./LockContextProvider";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { proposalStandardIx } from "@/lib/program/proposalStandard";
import { proposalOptionIx } from "@/lib/program/proposalOption";
import { ProposalCore, proposalCoreIx } from "@/lib/program/proposalCore";

export const CreateProposalForm: FC = () => {
  const wallet = useWallet();
  const { sendTransaction } = useWallet();
  const { connection } = useConnection();
  const { program, locks, currentLock, setCurrentLock, currentUser } = useContext(LockContext);
  const router = useRouter();
  const searchParams = useSearchParams()
  const address = searchParams.get('address');

  const [loading, setLoading] = useState<boolean>(false);

  const [choices, setChoices] = useState<ProposalChoice[]>([
    { id: 0, title: 'Approve', votingPower: new BN(0) },
    { id: 1, title: 'Reject', votingPower: new BN(0) },
  ]);

  type Inputs = {
    title: string
  }

  const FormSchema = z.object({
    votingPeriod: z.number(),
    seasonDuration: z.number(),
    threshold: z.number(),
    quorum: z.number(),
    proposalType: z.string(),
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
        required_error: "Please input Lock",
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

        let instruction: TransactionInstruction;

        switch (data.proposalType) {
          case 'Settings': {
            const props: ProposalCore = {
              program,
              signer: wallet.publicKey,
              lock: new PublicKey(data.address),
              id: new BN(currentLock.account.proposals.toNumber() + 1),
              config: currentLock.account.config.config,
              votingPeriod: data.votingPeriod ? new BN(data.votingPeriod) : null,
              seasonDuration: data.seasonDuration ? new BN(data.seasonDuration) : null,
              threshold: data.threshold ? data.threshold : null,
              quorum: data.quorum ? data.quorum : null,
            }
            instruction = await proposalCoreIx(props);
          }
          case 'Standard': {
            instruction = await proposalStandardIx(
              program,
              wallet.publicKey,
              new PublicKey(data.address),
              data.title,
              data.content,
              new BN(currentLock.account.proposals.toNumber() + 1),
            );
          }
          case 'Option': {
            instruction = await proposalOptionIx(
              program,
              wallet.publicKey,
              new PublicKey(data.address),
              data.title,
              data.content,
              choices,
              new BN(currentLock.account.proposals.toNumber() + 1),
            );
          }
        }

        // owner: PublicKey,
        // lock: PublicKey,
        // title: string,
        // choices: ProposalChoice[],
        // id: BN



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

        toast("Success :", {
          description: `tx : ${ellipsis(signature)}`,
          action: {
            label: "Explorer",
            onClick: () => router.push(`https://explorer.solana.com/tx/${signature}?cluster=devnet`),
          },
        })

        const proposal = PublicKey.findProgramAddressSync(
          // seeds = [b"proposal", lock.key().as_ref(), (locker.polls + 1).to_le_bytes().as_ref()]
          [Buffer.from("proposal"), new PublicKey(address).toBytes(), new BN(currentLock.account.proposals.toNumber() + 1).toArrayLike(Buffer, 'le', 8)],
          program.programId
        )[0];

        router.push(`/proposal/${proposal.toString()}`)

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

  return (
    <Form {...form}>
      <form className="w-full grow mx-auto flex flex-col p-8 md:p-10 bg-primary text-base-content"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <h1 className="text-xl md:text-3xl font-extrabold flex justify-center items-center w-full text-center">
          Proposal
        </h1>
        <div className="w-full flex flex-col items-center justify-center space-y-4 grow">
          <div className="w-full flex flex-col items-center justify-center space-y-2 grow">
            <FormField
              control={form.control}
              name="proposalType"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Type: {field.value}</FormLabel>
                  <Select onValueChange={field.onChange} >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem
                        value={"Settings"}
                      >
                        Settings
                      </SelectItem>
                      <SelectItem
                        value={"Standard"}
                      >
                        Standard
                      </SelectItem>
                      <SelectItem
                        value={"Option"}
                      >
                        Option
                      </SelectItem>
                      {!currentLock?.account.config.permissionless && (
                        <><SelectItem
                          value={"AddManager"}
                        >
                          Add Manager
                        </SelectItem>
                          <SelectItem
                            value={"RemoveManager"}
                          >
                            Remove Manager
                          </SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {field.value == "Settings" && (
                      <>
                        Proposal to change ASR lock settings : (name, approval threshold, quorum, permissionless/council, etc..)
                      </>
                    )}
                    {field.value == "Standard" && (
                      <>
                        Proposal Standard with 3 choices "Approve", "Against" & "Abstain"
                      </>
                    )}
                    {field.value == "Option" && (
                      <>
                        Proposal with up to 255 Options (please don&apos;t try..)
                      </>
                    )}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Lock</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Lock" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {locks?.map(({ account, publicKey }) => (
                        <SelectItem

                          value={publicKey.toString()}
                          onClick={() => setCurrentLock({ account, publicKey })}
                          key={publicKey.toString()}>
                          {account.config.name} {ellipsis(publicKey.toString())}
                        </SelectItem>
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
                      placeholder="Ex : Make the Button Blue"
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
            {form.watch('proposalType') == "Option" && (
              <>
                <div className="w-full flex flex-col items-center justify-center space-y-2">
                  <FormLabel className="w-full flex items-center space-x-2"><span>Choices</span>
                    <FaPlus
                      className="cursor-pointer w-3 h-3"
                      onClick={() => {
                        console.log("choices : ", choices);
                        setChoices([...choices, {
                          id: choices.length,
                          title: '',
                          votingPower: new BN(0),
                        }])
                      }}
                    />
                  </FormLabel>
                </div>
                <div className="w-full flex flex-col mt-4 space-y-2">
                  {choices?.map((choice, index) => (
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
              </>
            )}
          </div>
        </div>

        <Button className="cursor-pointer mt-8" size="lg" variant="secondary" type="submit">Start Proposal</Button>
      </form>
    </Form>
  );
}
