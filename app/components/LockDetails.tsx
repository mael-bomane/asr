import Link from "next/link";
import { FaBolt, FaCalendar, FaCheck, FaUsers, FaWallet } from "react-icons/fa";
import { RiCoinLine } from "react-icons/ri";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";

import type { LockMap } from "@/types";
import type { FC } from "react";
import { ellipsis, getDuration } from "@/lib/utils";

type Props = {
  lock: LockMap
}
export const LockDetails: FC<Props> = ({ lock: { account, publicKey } }) => {
  return (
    <Accordion type="single" collapsible className="w-[80%] md:w-full mx-auto md:max-w-3xl">
      <AccordionItem value="item-1">
        <AccordionTrigger className="p-4">Lock Details :</AccordionTrigger>
        <AccordionContent className="w-full grid grid-cols-1 md:grid-cols-2 p-2">
          <div className="w-full flex justify-start items-center space-x-2">
            <FaWallet /><span>Created by : <Link
              href={`https://explorer.solana.com/address/${account.creator.toString()}?cluster=devnet`}
              className="underline font-semibold"
              target="_blank"
            >
              {ellipsis(account.creator.toString())}
            </Link>
            </span>

          </div>
          <div className="w-full flex justify-start items-center space-x-2">
            <RiCoinLine /><span>Lock Mint : <Link
              href={`https://explorer.solana.com/address/${account.config.mint.toString()}?cluster=devnet`}
              className="underline font-semibold"
              target="_blank"
            >
              {ellipsis(account.config.mint.toString())}
            </Link>
            </span>
          </div>
          <div className="w-full flex justify-start items-center space-x-2">
            <FaCalendar /><span>Voting Period :</span> <span className="font-semibold">{`${getDuration(account.config.votingPeriod.toNumber() * 1000).value} ${getDuration(account.config.votingPeriod.toNumber() * 1000).unit}`}</span>
          </div>
          <div className="w-full flex justify-start items-center space-x-2">
            <FaCheck /><span>Approval Threshold :</span> <span className="font-semibold">{`${account.config.threshold} %`}</span>
          </div>
          <div className="w-full flex justify-start items-center space-x-2">
            <FaUsers /><span>Quorum :</span> <span className="font-semibold">{`${account.config.quorum} %`}</span>
          </div>
          <div className="w-full flex justify-start items-center space-x-2">
            <FaBolt /><span>Create Proposal :</span> <span className="font-semibold">{`${account.config.amount.toNumber() / (1 * 10 ** account.config.decimals)}`} Voting Power</span>
          </div>

        </AccordionContent>
      </AccordionItem>
    </Accordion>

  )
}
