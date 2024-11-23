import { cn } from "@/lib/utils";
import { Lock, Proposal } from "@/types";
import type { FC } from "react";

type Props = {
  proposal: Proposal
  lock: Lock
  isReady: boolean
}

export const BadgeProposalStatus: FC<Props> = ({ proposal, lock, isReady }) => {
  return (
    <div className={cn("w-full badge badge-outline p-3", {
      "badge-info": !isReady,
      "badge-success": proposal.executed,
      //@ts-ignore
      "badge-warning": !proposal.executed && isReady &&
        (proposal.choices.reduce((acc: any, obj: any) => {
          return acc + obj.votingPower.toNumber();
        }, 0) / (1 * 10 ** lock.config.decimals)) > (
          //@ts-ignore
          lock.quorum * (lock.totalDeposits.toNumber() / (1 * 10 ** lock.decimals)) / 100
        ),
      "badge-error": isReady &&
        (proposal.choices.reduce((acc, obj) => {
          return acc + obj.votingPower.toNumber();
        }, 0) / (1 * 10 ** lock.config.decimals)) < (
          lock.config.quorum * (lock.totalDeposits.toNumber() / (1 * 10 ** lock.config.decimals)) / 100
        ),
    })}>
      {isReady && !proposal.executed ? (
        <>
          {(proposal.choices.reduce((acc: any, obj: any) => {
            return acc + obj.votingPower.toNumber();
          }, 0) / (1 * 10 ** lock.config.decimals)) > (
              lock.config.quorum * (lock.totalDeposits.toNumber() / (1 * 10 ** lock.config.decimals)) / 100
            ) ? (
            <>Success</>
          ) : (
            <>Failed</>
          )}
        </>
      ) : (
        <>{`${proposal.executed ? 'Completed' : 'Active'}`}</>
      )}
    </div>

  )
}
