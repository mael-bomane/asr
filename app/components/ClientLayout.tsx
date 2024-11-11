"use client";

import { useEffect, useState, ReactNode, useMemo } from "react";
import { usePathname } from "next/navigation";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from "react-hot-toast";
import { Tooltip } from "react-tooltip";
import config from "@/config";
import { RecoilRoot, atom } from "recoil";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets'
import { clusterApiUrl } from "@solana/web3.js";
import { Theme } from "@radix-ui/themes";

import { WalletContextProvider } from './WalletContextProvider'
import { MonolithProvider } from "./MonolithContextProvider";

export const ClientLayout = ({ children }: { children: ReactNode }) => {
  const cluster =
    (process.env.NEXT_PUBLIC_SOLANA_NETWORK as 'devnet' | 'mainnet-beta') ||
    'devnet'
  const network = useMemo(
    () =>
      cluster === 'mainnet-beta'
        ? WalletAdapterNetwork.Mainnet
        : WalletAdapterNetwork.Devnet,
    [cluster]
  )
  const endpoint =
    process.env.NEXT_PUBLIC_SOLANA_ENDPOINT || clusterApiUrl(network)
  const wallets = useMemo(() => [new PhantomWalletAdapter()], [network])

  return (
    <>
      <NextTopLoader color={config.colors.main} showSpinner={false} />

      <WalletContextProvider
        endpoint={endpoint}
        network={network}
        wallets={wallets}
      >
        <MonolithProvider>
          <RecoilRoot>
            <Theme>
              {children}
            </Theme>
          </RecoilRoot>
        </MonolithProvider>
      </WalletContextProvider>

      <Toaster
        toastOptions={{
          duration: 3000,
        }}
      />

      <Tooltip
        id="tooltip"
        className="z-[60] !opacity-100 max-w-sm shadow-lg"
      />

    </>
  );
};
