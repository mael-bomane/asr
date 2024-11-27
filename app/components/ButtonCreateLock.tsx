"use client"

import { useRouter } from "next/navigation"
import type { FC } from "react"
import { Button } from "./ui/button";

export const ButtonCreateLock: FC = () => {
  const router = useRouter();
  return (
    <Button
      className="mt-8"
      onClick={() => router.push(`/lock/create`)}
    >Create Lock</Button>
  )
}
