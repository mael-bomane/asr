"use client"

import { HoverEffect } from "@/components/ui/card-hover-effect";
import { useContext } from "react";
import RingLoader from "react-spinners/RingLoader";
import { LockContext } from "./LockContextProvider";

export function LockEcosystemDisplay() {
  const { locks } = useContext(LockContext);
  return (
    <div className="max-w-5xl mx-auto px-8">
      {locks ? (
        <HoverEffect locks={locks} />
      ) : (
        <RingLoader />
      )}
    </div>
  );
}
