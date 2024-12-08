"use client"

import {
  ChevronsUpDown,
  Plug,
  LogOut,
} from "lucide-react"

import {
  Avatar,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

import Blockies from 'react-blockies';
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { ellipsis } from "@/lib/utils";
import { useContext } from "react";
import { LockContext } from "./LockContextProvider";

export function NavUser() {
  const { solana, setSolana, endpoint } = useContext(LockContext);
  const { isMobile } = useSidebar()
  const wallet = useWallet()
  const modal = useWalletModal()

  const BlockiesAvatar = () => {
    return <Blockies seed={wallet.publicKey?.toString() ?? ''} />
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          {wallet.publicKey ? (
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-full">
                  <BlockiesAvatar />
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold text-xs">{endpoint.split('https://')[1]}</span>
                  <span className="truncate text-xs">{ellipsis(wallet.publicKey?.toString()) ?? 'Connect Wallet'}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
          ) : (
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              onClick={() => {
                modal.setVisible(true)
              }}
            >
              <Avatar className="h-8 w-8 rounded-full">
                <BlockiesAvatar />
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold text-xs">{endpoint.split('https://')[1]}</span>
                <span className="truncate text-xs">{ellipsis(wallet.publicKey?.toString()) ?? 'Connect Wallet'}</span>
              </div>
            </SidebarMenuButton>

          )}
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            {wallet.publicKey && (
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-full">
                    <BlockiesAvatar />
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{solana ? 'Solana' : 'SOON'} Network</span>
                    <span className="truncate text-xs">{ellipsis(wallet.publicKey?.toString()) ?? 'Connect Wallet'}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => {
                setSolana(!solana)
                // wallet.disconnect()
              }}>
                <Plug />
                Switch Network
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => wallet.disconnect()}>
              <LogOut />
              Disconnect Wallet
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
