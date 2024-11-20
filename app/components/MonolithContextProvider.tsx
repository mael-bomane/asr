"use client"

import React, { createContext, useState, useEffect, useMemo } from 'react'
import type { ReactNode } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { Program } from '@coral-xyz/anchor'
import { IDL } from '@/constants/idl'
import { program } from '@/constants'
import { PublicKey } from '@solana/web3.js'

import type { Analytics, Lock } from '@/types'

interface MonolithInterface {
  analytics: Analytics | null
  locks: Lock[] | null
  selectedLock: Lock | null
}

export const MonolithContext = createContext<MonolithInterface>({
  analytics: null,
  locks: null,
  selectedLock: null,
})

export const MonolithProvider = ({ children }: { children: ReactNode }) => {
  const { publicKey, signMessage } = useWallet();
  const { connection } = useConnection();

  const opts = {
    preflightCommitment: "processed",
  };



  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [selectedLock, setSelectedLock] = useState<Lock | null>(null)
  const [locks, setLocks] = useState<Lock[] | null>(null)

  const value = {
    analytics,
    locks,
    selectedLock,
  }

  useEffect(() => {
    if (!analytics) {
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
          //@ts-ignore
          // const analyticsMap = response.map(({ account, publicKey }) => {
          //   const result = account
          //   account.pubkey = publicKey
          //   return result
          // })
          // console.log('analytics : ', analyticsMap)
          // setAnalytics(analyticsMap)
        })
        .catch((error) => {
          console.log(error)
        })
    }
  }, [publicKey, program])

  useEffect(() => {
    if (publicKey && analytics) {
      const fetchMonoliths = async () => {
        // @ts-ignore
        return await program.account.lock.all()
      }
      fetchMonoliths()
        .then((response) => {
          setLocks(response);
          // @ts-ignore
          // const monolithsMap = response.map(({ account, publicKey }) => {
          //   const result = account
          //   account.pubkey = publicKey
          //   return result
          // })
          // console.log('monoliths : ', monolithsMap)
          // setMonoliths(monolithsMap)
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
