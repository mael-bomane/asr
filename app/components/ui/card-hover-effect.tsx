import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import React from "react";
import { useContext, useState } from "react";
import type { LockMap } from "@/types";
import { LockContext } from "../LockContextProvider";
import { Gem, Layers, VoteIcon } from "lucide-react";
import { FaCheck, FaX } from "react-icons/fa6";

export const HoverEffect = ({
  locks,
  className,
}: {
  locks: LockMap[];
  className?: string;
}) => {
  let [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const { setCurrentLock } = useContext(LockContext);

  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2  lg:grid-cols-3  py-10",
        className
      )}
    >
      {locks.map((lock, idx) => (
        <Link
          href={`/lock/${lock.publicKey.toString()}`}
          key={lock.publicKey.toString()}
          className="relative group block p-2 h-full w-full"
          onClick={() => setCurrentLock(lock)}
          onMouseEnter={() => setHoveredIndex(idx)}
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <AnimatePresence>
            {hoveredIndex === idx && (
              <motion.span
                className="absolute inset-0 h-full w-full bg-neutral-200 dark:bg-slate-800/[0.8] block  rounded-3xl"
                layoutId="hoverBackground"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  transition: { duration: 0.15 },
                }}
                exit={{
                  opacity: 0,
                  transition: { duration: 0.15, delay: 0.2 },
                }}
              />
            )}
          </AnimatePresence>
          <Card>
            <CardTitle className="w-full flex space-x-2">
              <span>{lock.account.config.name}</span>  <span>•</span>  <span>Season {(lock.account.seasons.length - 1 < 0) ? 0 : lock.account.seasons.length}</span>
            </CardTitle>
            <CardDescription>
              <div className="w-full flex flex-col space-y-4">
                <div className="w-full flex space-x-2">
                  <Gem className="w-5 h-5" /> <span className="font-extrabold">{lock.account.totalDeposits.toNumber() / (1 * 10 ** lock.account.config.decimals)}</span> <span className="font-semibold">{lock.account.config.symbol}</span>
                </div>
                <div className="w-full flex space-x-2">
                  <div className="flex justify-center items-center space-x-2">
                    <VoteIcon className="w-5 h-5" /> <span>{lock.account.proposals.toNumber()}</span>
                  </div>
                  <div className="flex justify-center items-center space-x-2">
                    <FaCheck className="text-success" /> <span>{lock.account.approved.toNumber()}</span>
                  </div>
                  <div className="flex justify-center items-center space-x-2">
                    <FaX className="text-error" /> <span>{lock.account.rejected.toNumber()}</span>
                  </div>
                </div>
              </div>

            </CardDescription>
          </Card>
        </Link>
      ))}
    </div>
  );
};

export const Card = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "rounded-2xl h-full w-full p-4 overflow-hidden bg-black border border-transparent dark:border-white/[0.2] group-hover:border-slate-700 relative z-20",
        className
      )}
    >
      <div className="relative z-50">
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};
export const CardTitle = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <h4 className={cn("text-zinc-100 font-bold tracking-wide mt-4", className)}>
      {children}
    </h4>
  );
};
export const CardDescription = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <p
      className={cn(
        "mt-8 text-zinc-400 tracking-wide leading-relaxed text-sm",
        className
      )}
    >
      {children}
    </p>
  );
};
