"use client";

import { ReactNode, useContext, useEffect, useMemo, useState } from "react";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "@/components/ui/sonner";
import { Tooltip } from "react-tooltip";
import config from "@/config";
import { RecoilRoot } from "recoil";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets'
import { clusterApiUrl } from "@solana/web3.js";
import { Theme } from "@radix-ui/themes";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

import { WalletContextProvider } from './WalletContextProvider'
import { LockContext, LockContextProvider } from "./LockContextProvider";

export const ClientLayout = ({ children }: { children: ReactNode }) => {
  const { endpoint } = useContext(LockContext);
  const cluster =
    (process.env.NEXT_PUBLIC_SOLANA_NETWORK as 'devnet' | 'mainnet-beta') ||
    'devnet';
  const network = useMemo(
    () =>
      cluster === 'mainnet-beta'
        ? WalletAdapterNetwork.Mainnet
        : WalletAdapterNetwork.Devnet,
    [cluster]
  );

  const wallets = useMemo(() => [], [network])

  return (
    <>
      <NextTopLoader color={config.colors.main} showSpinner={false} />

      <WalletContextProvider
        endpoint={endpoint}
        network={network}
        wallets={wallets}
      >
        <LockContextProvider>
          <RecoilRoot>
            <Theme>
              <SidebarProvider>
                <AppSidebar />
                <SidebarTrigger />
                {children}
              </SidebarProvider>
            </Theme>
          </RecoilRoot>
        </LockContextProvider>
      </WalletContextProvider>
      <Toaster />

      <Tooltip
        id="tooltip"
        className="z-[60] !opacity-100 max-w-sm shadow-lg"
      />

    </>
  );
};
