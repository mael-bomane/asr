import * as React from "react"
import { useState, useContext } from "react"
import { SubmitHandler, useForm } from "react-hook-form"
import { toast } from "react-hot-toast";
import { PublicKey, TransactionSignature, TransactionMessage, VersionedTransaction } from "@solana/web3.js"
import { useWallet, useConnection } from "@solana/wallet-adapter-react"

import { IoClose } from "react-icons/io5"
import { Label } from "./ui/label"
import { Input } from "./ui/input"

import { getAssociatedTokenAddressSync, getMint, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { asrDepositIx } from "@/lib/program/asrDeposit";

import type { FC } from "react";
import { BN } from "bn.js";
import { LockContext } from "./LockContextProvider";

type Props = {
  isOpen: boolean
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>
}

export const DepositPopup: FC<Props> = ({ isOpen, setIsOpen }) => {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  const { program } = useContext(LockContext);

  const [loading, setLoading] = useState<boolean>(false);

  type Inputs = {
    mint: string
    symbol: string
    amount: number
  }

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = async (inputs) => {
    let signature: TransactionSignature = '';
    console.log("inputs ", inputs)
    if (publicKey) {
      setLoading(true)
      try {
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
        // creator: PublicKey,
        // mint: PublicKey,
        // signerAta: PublicKey,
        // amount: BN,
        const instruction = await asrDepositIx(
          program,
          publicKey,
          mint,
          inputs.symbol,
          signerAta,
          new BN(inputs.amount * 1 * 10 ** mintInfo.decimals),
        );

        let latestBlockhash = await connection.getLatestBlockhash()

        const messageV0 = new TransactionMessage({
          payerKey: publicKey,
          recentBlockhash: latestBlockhash.blockhash,
          instructions: [instruction],
        }).compileToV0Message();

        const transaction = new VersionedTransaction(messageV0)

        signature = await sendTransaction(transaction, connection);

        await connection.confirmTransaction({ signature, ...latestBlockhash }, 'confirmed');

        console.log(signature);

        toast.success(`success :\ntx : ${signature}`);

      } catch (error) {
        console.log(error);
        toast.error(error.message);
      }
    }
  }
  return (
    <form onSubmit={handleSubmit(onSubmit)}
      className="bg-primary text-white p-8 opacity-100 rounded-box border absolute top-[25%] left-0 md:left-[25%] w-full md:w-[50vw] z-[999] shadow-md flex flex-col justify-center items-center space-y-4"
    >
      <div className="flex w-full justify-between">
        <h3 className="font-bold text-lg">Deposit ASR</h3>
        <IoClose className="w-8 h-8 text-white cursor-pointer" onClick={() => setIsOpen(false)} />
      </div>

      <Label className="w-full">Mint : </Label>
      <Input
        type="text"
        min={0}
        {...register("mint", { required: true })}
        className="p-2"
        step="1"
      />
      {errors.mint && <span>This field is required</span>}
      <Label className="w-full">Symbol : </Label>
      <Input
        type="text"
        min={0}
        {...register("symbol", { required: true })}
        className="p-2"
        step="1"
      />
      {errors.symbol && <span>This field is required</span>}

      <Label className="w-full">Amount : </Label>
      <Input
        type="number"
        min={0}
        {...register("amount", { required: true })}
        className="p-2"
        step="1"
      />
      {errors.amount && <span>This field is required</span>}

      <button type="submit" className="btn btn-sm btn-neutral text-white w-[50%] mx-auto border border-white mt-4">
        Desposit
      </button>
    </form>
  )
}
