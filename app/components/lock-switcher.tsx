"use client"

import * as React from "react"
import { ChevronsUpDown, Plus } from "lucide-react"

import config from "@/config";
import logo from "@/app/icon.png";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import Image from "next/image";
import Link from "next/link";
import type { LockMap, UserMap } from "@/types";

import type { FC } from "react";
import { LockContext } from "./LockContextProvider";
import Skeleton from "react-loading-skeleton";
import { MONOLITH_ID } from "@/constants";

type Props = {
  locks: LockMap[]
  userRegistrations: UserMap[]
}

export const LockSwitcher: FC<Props> = ({ locks, userRegistrations }) => {
  const { currentLock, setCurrentLock, setAddress, userLocks } = React.useContext(LockContext)
  const { isMobile } = useSidebar()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                {/*
                             <activeTeam.logo className="size-4" />
                */}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {currentLock?.account?.config?.name || <Skeleton />}
                </span>
                <span className="truncate text-xs">
                  {currentLock?.publicKey.toString() == MONOLITH_ID ? 'Core' : 'Community'}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Your Locks
            </DropdownMenuLabel>
            {userLocks.map((lock, index) => (
              <DropdownMenuItem
                key={index}
                onClick={() => setAddress(lock.publicKey.toString())}
                className="gap-2 p-2"
              >
                <Link
                  className="w-full flex justify-start gap-2 items-center"
                  href={`/lock/${lock.publicKey.toString() ?? ''}`}
                  onClick={() => setCurrentLock(lock)}
                >
                  <div className="flex size-6 items-center justify-center rounded-sm border">
                    {/*<team.logo className="size-4 shrink-0" />*/}
                  </div>
                  {lock.account.config.name}
                  <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
                </Link>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2">
              <Link href={`/lock/create`} className="w-full flex justify-start gap-2 items-center"
              >
                <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                  <Plus className="size-4" />
                </div>
                <div className="font-medium text-muted-foreground">Create Lock</div>
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
