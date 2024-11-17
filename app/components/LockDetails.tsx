import Link from "next/link";
import { FaBolt, FaCalendar, FaCheck, FaUsers, FaWallet } from "react-icons/fa";
import { RiCoinLine } from "react-icons/ri";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";

import type { Lock } from "@/types";
import type { FC } from "react";
import { ellipsis, getDuration } from "@/lib/utils";

type Props = {
  lock: Lock
}
export const LockDetails: FC<Props> = ({ lock }) => {
  return (
    <Accordion type="single" collapsible className="w-full md:max-w-3xl">
      <AccordionItem value="item-1">
        <AccordionTrigger className="p-4">Lock Details :</AccordionTrigger>
        <AccordionContent className="w-full grid grid-cols-1 md:grid-cols-2 p-2">
          <div className="w-full flex justify-start items-center space-x-2">
            <FaWallet /><span>Created by : <Link
              href={`https://explorer.solana.com/address/${lock.creator.toString()}?cluster=devnet`}
              className="underline font-semibold"
              target="_blank"
            >
              {ellipsis(lock.creator.toString())}
            </Link>
            </span>

          </div>
          <div className="w-full flex justify-start items-center space-x-2">
            <RiCoinLine /><span>Lock Mint : <Link
              href={`https://explorer.solana.com/address/${lock.mint.toString()}?cluster=devnet`}
              className="underline font-semibold"
              target="_blank"
            >
              {ellipsis(lock.mint.toString())}
            </Link>
            </span>
          </div>
          <div className="w-full flex justify-start items-center space-x-2">
            {/*@ts-ignore*/}
            <FaCalendar /><span>Voting Period :</span> <span className="font-semibold">{`${getDuration(lock.votingPeriod.toNumber() * 1000).value} ${getDuration(lock.votingPeriod.toNumber() * 1000).unit}`}</span>
          </div>
          <div className="w-full flex justify-start items-center space-x-2">
            {/*@ts-ignore*/}
            <FaCheck /><span>Approval Threshold :</span> <span className="font-semibold">{`${lock.threshold} %`}</span>
          </div>
          <div className="w-full flex justify-start items-center space-x-2">
            {/*@ts-ignore*/}
            <FaUsers /><span>Quorum :</span> <span className="font-semibold">{`${lock.quorum} %`}</span>
          </div>
          <div className="w-full flex justify-start items-center space-x-2">
            <FaBolt /><span>Create Proposal :</span> <span className="font-semibold">{`${lock.amount.toNumber() / (1 * 10 ** lock.decimals)}`} Voting Power</span>
          </div>

        </AccordionContent>
      </AccordionItem>
    </Accordion>

  )
}
