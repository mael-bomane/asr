"use client"

import React, { createContext, useState, useEffect, useMemo } from 'react'
import type { ReactNode } from 'react'
import type { Analytics, Monolith, Deposit } from '@/types'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { Address, AnchorProvider, Program } from '@coral-xyz/anchor'
import { IDL } from '@/constants/idl'
import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js'
import { PROGRAM_ID } from '@/constants'

interface MonolithContext {
  program: Program<IDL> | null
  analytics: Analytics | null
  monoliths: Monolith[] | null
  monolith: Monolith | null
}

export const MonolithContext = createContext<MonolithContext>({
  program: null,
  analytics: null,
  monolith: null,
  monoliths: null,
})

export const MonolithProvider = ({ children }: { children: ReactNode }) => {
  const { publicKey, signMessage } = useWallet();
  const { connection } = useConnection();

  const opts = {
    preflightCommitment: "processed",
  };



  const [program, setProgram] = useState<Program<IDL> | null>(null)
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [monolith, setMonolith] = useState<Monolith | null>(null)
  const [monoliths, setMonoliths] = useState<Monolith[] | null>(null)

  const value = {
    program,
    analytics,
    monolith,
    monoliths,
  }

  useEffect(() => {
    if (!program) {
      const { solana } = window;

      const provider = new AnchorProvider(connection, solana, opts.preflightCommitment);
      setProgram(new Program(IDL, provider));
    }

  }, [publicKey])

  useEffect(() => {
    if (program && !analytics) {
      const pda = PublicKey.findProgramAddressSync(
        [Buffer.from('analytics')],
        program.programId
      )[0];
      const fetchAnalytics = async () => {
        // @ts-ignore
        return await program.account.analytics.fetch(pda)
      }
      fetchAnalytics()
        .then((response) => {
          setAnalytics(response)
        })
        .catch((error) => {
          console.log(error)
        })
    } else {
      console.log("no program :<")
    }
  }, [publicKey, program])

  useEffect(() => {
    if (publicKey && analytics) {
      const fetchMonoliths = async () => {
        // @ts-ignore
        return await program.account.monolith.all()
      }
      fetchMonoliths()
        .then((response) => {
          // @ts-ignore
          const monolithsMap = response.map(({ account, publicKey }) => {
            const result = account
            account.pubkey = publicKey
            return result
          })
          console.log('monoliths : ', monolithsMap)
          setMonoliths(monolithsMap)
        })
        .catch((error) => console.log(error))
    }
  }, [publicKey, analytics])

  return (
    <MonolithContext.Provider value={value}>
      {children}
    </MonolithContext.Provider>
  )
}
