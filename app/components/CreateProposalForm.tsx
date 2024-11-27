"use client"

import { useContext, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SubmitHandler, useForm } from "react-hook-form";
import { PublicKey, TransactionInstruction, TransactionMessage, TransactionSignature, VersionedTransaction } from "@solana/web3.js";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { BN } from "bn.js";
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Checkbox } from "@/components/ui/checkbox"

import { ellipsis, getDuration } from "@/lib/utils";
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
import { LockDetails } from "./LockDetails";
import { FaBolt, FaCalendar, FaCheck, FaLock, FaPencil, FaUsers } from "react-icons/fa6";
import { Slider } from "./ui/slider";

export const CreateProposalForm: FC = () => {
  const wallet = useWallet();
  const { sendTransaction } = useWallet();
  const { connection } = useConnection();
  const { program, locks, currentLock, setCurrentLock, currentUser, loading, setLoading } = useContext(LockContext);
  const router = useRouter();
  const searchParams = useSearchParams()
  const address = searchParams.get('address');

  // proposal core
  const [permissionless, setPermissionless] = useState<boolean>(currentLock?.account.config.permissionless ?? false);
  const [threshold, setThreshold] = useState<number>(currentLock?.account.config.threshold ?? 50);
  const [quorum, setQuorum] = useState<number>(currentLock?.account.config.quorum ?? 25);
  const [votingPeriod, setVotingPeriod] = useState<number>(currentLock?.account.config.votingPeriod.toNumber() ?? (86400 * 1000));
  const [seasonDuration, setSeasonDuration] = useState<number>(currentLock?.account.config.seasonDuration.toNumber() ?? (86400 * 1000));
  const [lockDuration, setLockDuration] = useState<number>(currentLock?.account.config.lockDuration.toNumber() ?? (86400 * 1000));

  const [choices, setChoices] = useState<ProposalChoice[]>([
    { id: 0, title: 'Option 1', votingPower: new BN(0) },
    { id: 1, title: 'Option 2', votingPower: new BN(0) },
    { id: 2, title: 'Option 3', votingPower: new BN(0) },
    { id: 3, title: 'Option 4', votingPower: new BN(0) },
    { id: 4, title: 'Option 5', votingPower: new BN(0) },
  ]);

  const FormSchema = z.object({
    amount: z.string().refine((val) => !Number.isNaN(parseInt(val, 10)), {
      message: "Expected number, received a string"
    }),
    votingPeriod: z.number().optional(),
    lockDuration: z.number().optional(),
    seasonDuration: z.number().optional(),
    threshold: z.number().optional(),
    quorum: z.number().optional(),
    proposalType: z.string(),
    name: z.string(),
    symbol: z.string(),
    permissionless: z.boolean().optional(),
    title: z
      .string().min(1).max(50).optional()
    ,
    content: z
      .string().min(1).max(280).optional(),
    address: z
      .string().min(1).max(280)
  })

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      permissionless: currentLock?.account.config.permissionless ?? false,
    }
  })

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    console.log(data);
    let signature: TransactionSignature = '';
    if (program && wallet.publicKey) {
      try {
        setLoading(true)

        let instruction: TransactionInstruction;

        if (data.proposalType.valueOf() == "Settings") {
          const props: ProposalCore = {
            program,
            signer: wallet.publicKey,
            lock: currentLock.publicKey,
            id: new BN(currentLock.account.proposals.toNumber() + 1),
            config: currentLock.account.config.config,
            permissionless: data.permissionless ?? null,
            votingPeriod: data.votingPeriod ? new BN(data.votingPeriod / 1000) : null,
            seasonDuration: data.seasonDuration ? new BN(data.seasonDuration / 1000) : null,
            lockDuration: data.lockDuration ? new BN(data.lockDuration / 1000) : null,
            threshold: data.threshold ? data.threshold : null,
            quorum: data.quorum ? data.quorum : null,
            name: data.name ? data.name : null,
            amount: data.amount ? new BN(data.amount) : null,
            symbol: data.symbol ? data.symbol : null,
          }
          console.log("props", props)
          instruction = await proposalCoreIx(props);
        } else if (data.proposalType.valueOf() == "Standard") {
          instruction = await proposalStandardIx(
            program,
            wallet.publicKey,
            new PublicKey(data.address),
            data.title,
            data.content,
            new BN(currentLock.account.proposals.toNumber() + 1),
          );
        } else if (data.proposalType.valueOf() == "Option") {
          instruction = await proposalOptionIx(
            program,
            wallet.publicKey,
            new PublicKey(data.address),
            data.title,
            data.content,
            choices,
            new BN(currentLock.account.proposals.toNumber() + 1),
          );
        } else {
          console.log('error')
        }

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
        <div className="w-full flex flex-col items-center space-y-2 grow">
          <FormField
            control={form.control}
            name="proposalType"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Type:</FormLabel>
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
          {form.watch('proposalType') !== "Settings" && (
            <>
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
            </>
          )}
          {form.watch('proposalType') == "Settings" && (
            <div className="w-full flex flex-col space-y-4 pt-8">
              <div className="w-full flex justify-start items-center space-x-2">
                <FormItem className="flex flex-col items-center w-full">
                  <FormLabel>
                    <span>Current : {`${currentLock?.account.config.name}`}</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      defaultValue={currentLock?.account.config.name}
                      disabled
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
                <div className="flex justify-center items-center w-full space-x-2">
                  <FaPencil />
                  <span>Lock Name</span>
                </div>
                <div className="flex flex-col items-center w-full">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>
                          <span>Proposed : {field.value == (currentLock?.account.config.name || undefined) ? `Unchanged` : `${field.value}`}</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            defaultValue={currentLock?.account.config.name}
                            placeholder={currentLock?.account.config.name} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <div className="w-full flex justify-start items-center space-x-2">
                <FormItem className="flex flex-col items-center w-full">
                  <FormLabel>
                    <span>Current : {`${currentLock?.account.config.symbol}`}</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      defaultValue={currentLock?.account.config.name}
                      disabled
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
                <div className="flex justify-center items-center w-full space-x-2">
                  <FaPencil />
                  <span>Lock Symbol</span>
                </div>
                <div className="flex flex-col items-center w-full">
                  <FormField
                    control={form.control}
                    name="symbol"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <FormLabel>
                          <span>Proposed : {field.value == (currentLock?.account.config.name || undefined) ? `Unchanged` : `${field.value}`}</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            defaultValue={currentLock?.account.config.name}
                            placeholder={currentLock?.account.config.name} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>



              <div className="w-full flex justify-start items-center space-x-2">
                <FormItem className="flex flex-col items-center w-full">
                  <span>Current : {`${currentLock?.account.config.permissionless}`}</span>
                  <FormControl>
                    <Checkbox
                      checked={currentLock?.account.config.permissionless ?? false}
                      className="border border-white"
                      disabled
                    />
                  </FormControl>
                </FormItem>
                <div className="flex justify-center items-center w-full space-x-2">
                  <FaLock />
                  <span>Permissionless</span>
                </div>
                <FormField
                  control={form.control}
                  name="permissionless"
                  render={({ field }) => (
                    <FormItem className="flex flex-col items-center w-full">
                      <span>Proposed : {field.value == currentLock?.account.config.permissionless ? `Unchanged` : `${field.value}`}</span>
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="border border-white"
                        />
                      </FormControl>
                      {form.formState.errors.permissionless && <>error !</>}
                    </FormItem>
                  )}
                />
              </div>
              <div className="w-full flex justify-start items-center space-x-2">
                <div className="flex flex-col items-center w-full">
                  <span>Current : {getDuration(currentLock?.account.config.seasonDuration.toNumber() * 1000).value} {getDuration(currentLock?.account.config.seasonDuration.toNumber() * 1000).unit} </span>
                  <Slider id="seasonDuration"
                    defaultValue={[currentLock?.account.config.seasonDuration.toNumber() * 1000]}
                    onValueChange={(e) => {
                      console.log(e[0]);
                      setSeasonDuration(e[0])
                      form.setValue('seasonDuration', e[0])
                    }}
                    min={43200 * 1000}
                    max={86400 * 7 * 1000}
                    step={43200 * 1000}
                    disabled
                  />
                </div>
                <div className="flex justify-center items-center w-full space-x-2">
                  <FaCalendar />
                  <span>Season Duration </span>
                </div>
                <div className="flex flex-col items-center w-full">
                  <span>Proposed : {seasonDuration == (currentLock?.account.config.seasonDuration.toNumber() * 1000) || undefined ? `Unchanged` : `${getDuration(seasonDuration).value} ${getDuration(seasonDuration).unit}`}</span>
                  <Slider id="seasonDuration"
                    defaultValue={[currentLock?.account.config.votingPeriod.toNumber() * 1000]}
                    onValueChange={(e) => {
                      console.log(e[0]);
                      setSeasonDuration(e[0])
                      form.setValue('seasonDuration', e[0])
                    }}
                    {...form.register("seasonDuration")}
                    min={43200 * 1000}
                    max={86400 * 30 * 1000}
                    step={43200 * 1000}
                  />
                  {form.formState.errors.seasonDuration && <>error !</>}
                </div>
              </div>
              <div className="w-full flex justify-start items-center space-x-2">
                <div className="flex flex-col items-center w-full">
                  <span>Current : {getDuration(currentLock?.account.config.votingPeriod.toNumber() * 1000).value} {getDuration(currentLock?.account.config.lockDuration.toNumber() * 1000).unit} </span>
                  <Slider id="votingPeriod"
                    defaultValue={[currentLock?.account.config.votingPeriod.toNumber() * 1000]}
                    min={43200 * 1000}
                    max={86400 * 7 * 1000}
                    step={43200 * 1000}
                    disabled
                  />
                </div>
                <div className="flex justify-center items-center w-full space-x-2">
                  <FaCalendar />
                  <span>Voting Period </span>
                </div>
                <div className="flex flex-col items-center w-full">
                  <span>Proposed : {votingPeriod == (currentLock?.account.config.votingPeriod.toNumber() * 1000) ? `Unchanged` : `${getDuration(votingPeriod).value} ${getDuration(votingPeriod).unit}`}</span>
                  <Slider id="votingPeriod"
                    defaultValue={[currentLock?.account.config.votingPeriod.toNumber() * 1000]}
                    onValueChange={(e) => {
                      console.log(e[0]);
                      setVotingPeriod(e[0])
                      form.setValue('votingPeriod', e[0])
                    }}
                    {...form.register("votingPeriod")}
                    min={43200 * 1000}
                    max={86400 * 7 * 1000}
                    step={43200 * 1000}
                  />
                  {form.formState.errors.threshold && <>error !</>}
                </div>
              </div>
              <div className="w-full flex justify-start items-center space-x-2">
                <div className="flex flex-col items-center w-full">
                  <span>Current : {getDuration(currentLock?.account.config.lockDuration.toNumber() * 1000).value} {getDuration(currentLock?.account.config.votingPeriod.toNumber() * 1000).unit} </span>
                  <Slider id="lockDuration"
                    defaultValue={[currentLock?.account.config.lockDuration.toNumber() * 1000]}
                    disabled
                  />
                </div>
                <div className="flex justify-center items-center w-full space-x-2">
                  <FaLock />
                  <span>Lock Duration</span>
                </div>
                <div className="flex flex-col items-center w-full">
                  <span>Proposed : {lockDuration == (currentLock?.account.config.lockDuration.toNumber() * 1000) ? `Unchanged` : `${getDuration(lockDuration).value} ${getDuration(lockDuration).unit}`}</span>
                  <Slider id="lockDuration"
                    defaultValue={[currentLock?.account.config.lockDuration.toNumber() * 1000]}
                    onValueChange={(e) => {
                      console.log(e[0]);
                      setLockDuration(e[0])
                      form.setValue('lockDuration', e[0])
                    }}
                    {...form.register("lockDuration")}
                    min={43200 * 1000}
                    max={86400 * 7 * 1000}
                    step={43200 * 1000}
                  />
                  {form.formState.errors.lockDuration && <>error !</>}
                </div>
              </div>
              <div className="w-full flex justify-center items-center space-x-2">
                <div className="flex flex-col items-center w-full">
                  <span>Current : {currentLock?.account.config.threshold}% </span>
                  <Slider id="threshold"
                    defaultValue={[currentLock.account.config.threshold]}
                    onValueChange={(e) => {
                      console.log(e[0]);
                      setThreshold(e[0])
                      form.setValue('threshold', e[0])
                    }}
                    min={50}
                    max={100}
                    step={1}
                    disabled
                  />
                </div>
                <div className="flex items-center justify-center w-full space-x-2">
                  <FaCheck />
                  <span>Approval Threshold </span>
                </div>
                <div className="flex flex-col items-center w-full">
                  <span>Proposed : {threshold == currentLock?.account.config.threshold ? `Unchanged` : `${threshold}%`}</span>
                  <Slider id="threshold"
                    defaultValue={[currentLock?.account.config.threshold]}
                    onValueChange={(e) => {
                      console.log(e[0]);
                      setThreshold(e[0])
                      form.setValue('threshold', e[0])
                    }}
                    {...form.register("threshold")}
                    min={50}
                    max={100}
                    step={1}
                  />
                </div>
              </div>
              <div className="w-full flex justify-center items-center space-x-2">
                <div className="flex flex-col items-center w-full">
                  <span>Current : {currentLock?.account.config.quorum}% </span>
                  <Slider id="threshold"
                    defaultValue={[currentLock.account.config.quorum]}
                    onValueChange={(e) => {
                      console.log(e[0]);
                      setThreshold(e[0])
                      form.setValue('quorum', e[0])
                    }}
                    min={0}
                    max={100}
                    step={1}
                    disabled
                  />
                </div>
                <div className="flex items-center justify-center w-full space-x-2">
                  <FaUsers />
                  <span>Quorum </span>
                </div>
                <div className="flex flex-col items-center w-full">
                  <span>Proposed : {quorum == currentLock?.account.config.quorum ? `Unchanged` : `${quorum}%`}</span>
                  <Slider id="quorum"
                    defaultValue={[currentLock?.account.config.quorum]}
                    onValueChange={(e) => {
                      console.log(e[0]);
                      setQuorum(e[0])
                      form.setValue('quorum', e[0])
                    }}
                    {...form.register("quorum")}
                    min={0}
                    max={100}
                    step={1}
                  />
                </div>
              </div>
              <div className="w-full flex justify-center items-center space-x-2">
                <div className="flex flex-col items-center w-full">
                  <span>Current : {currentLock?.account.config.amount.toNumber() / (1 * 10 ** currentLock?.account.config.decimals)}
                    <span className="font-semibold ml-1">{currentLock?.account.config.symbol}</span>

                  </span>
                  <Input id="amount"
                    defaultValue={currentLock ?
                      currentLock?.account.config.amount.toNumber() / (1 * 10 ** currentLock?.account.config.decimals)
                      : 0}
                    disabled
                  />
                </div>
                <div className="flex items-center justify-center w-full space-x-2">
                  <FaBolt />
                  <span>Start Proposal </span>
                </div>
                <div className="flex flex-col items-center w-full">
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem className="w-full">
                        <span>Proposed : {parseInt(field.value) == (currentLock?.account.config.amount.toNumber() / (1 * 10 ** currentLock?.account.config.decimals)) || !field.value ? `Unchanged` : `${field.value}`}</span>
                        <FormControl>
                          <Input
                            type="number"
                            defaultValue={currentLock?.account.config.amount.toNumber() / (1 * 10 ** currentLock?.account.config.decimals)}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                </div>
              </div>
            </div>
          )}
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

        <Button className="cursor-pointer mt-8" size="lg" variant="secondary" type="submit">Start Proposal</Button>
      </form>
    </Form>
  );
}
