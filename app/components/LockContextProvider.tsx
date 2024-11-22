"use client"

import React, { createContext, useState, useEffect, useMemo } from 'react'
import type { ReactNode } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { program } from '@/constants'
import { PublicKey } from '@solana/web3.js'

import type { Analytics, Lock, LockMap, User } from '@/types'

interface LockInterface {
  analytics: Analytics | null
  locks: LockMap[] | null
  currentLock: LockMap | null
  setCurrentLock: React.Dispatch<React.SetStateAction<LockMap | null>>
  address: string | null
  setAddress: React.Dispatch<React.SetStateAction<string | null>>
  users: User[] | null
  currentUser: User | null
}

export const LockContext = createContext<LockInterface>({
  analytics: null,
  locks: null,
  currentLock: null,
  setCurrentLock: () => null,
  address: null,
  setAddress: () => null,
  users: null,
  currentUser: null,
})

export const LockContextProvider = ({ children }: { children: ReactNode }) => {
  const { publicKey, signMessage } = useWallet();
  const { connection } = useConnection();

  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [locks, setLocks] = useState<LockMap[] | null>(null)
  const [currentLock, setCurrentLock] = useState<LockMap | null>(null)
  const [address, setAddress] = useState<string | null>(null)
  const [users, setUsers] = useState<User[] | null>(null)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [userRegistrations, setUserRegistrations] = useState<User[] | null>(null)

  const value = {
    analytics,
    locks,
    currentLock,
    setCurrentLock,
    address,
    setAddress,
    users,
    currentUser
  }

  useEffect(() => {
    if (!analytics) {
      const pda = PublicKey.findProgramAddressSync(
        [Buffer.from('analytics')],
        program.programId
      )[0];
      const fetchAnalytics = async () => {
        return await program.account.analytics.fetch(pda)
      }
      fetchAnalytics()
        .then((response) => {
          console.log("analytics : ", response);
          setAnalytics(response)
        })
        .catch((error) => {
          console.log(error)
        })
    }
  }, [])

  useEffect(() => {
    const fetchLocks = async () => {
      return await program.account.lock.all()
    }
    if (analytics) {
      fetchLocks()
        .then((response) => {
          if (response) {
            console.log('locks : ', response)
            setLocks(response);
          }
        })
        .catch((error) => console.log(error))
    }
  }, [publicKey, analytics])

  useEffect(() => {
    const fetchLocks = async () => {
      return await program.account.lock.fetch(new PublicKey(address))
    }
    if (address) {
      fetchLocks()
        .then((response) => {
          if (response) {
            console.log('locks : ', response)
            setCurrentLock({ account: response, publicKey: new PublicKey(address) });
          }
        })
        .catch((error) => console.log(error))
    }
  }, [publicKey, analytics])

  useEffect(() => {
    const fetchUsers = async () => {
      return await program.account.user.all();
    }
    if (currentLock) {
      fetchUsers()
        .then(response => {
          if (response) {
            const usersMap = response.map(({ account, publicKey }) => {
              const result = account
              return result
            })
            console.log(`Users : for currentLock : `, usersMap)
            console.log("total users : ", usersMap);
            setUsers(usersMap)
          }
        })
        .catch(err => console.log(err));
    }
  }, [currentLock]);


  useEffect(() => {
    const fetchUser = async () => {
      const user = PublicKey.findProgramAddressSync(
        // seeds = [b"user", lock.key().as_ref(), signer.key().as_ref()]
        [Buffer.from("user"), currentLock.publicKey.toBytes(), publicKey.toBytes()],
        program.programId
      )[0]
      return await program.account.user.fetch(user);
    }
    if (publicKey && currentLock) {
      fetchUser()
        .then(response => {
          if (response) {
            console.log("current user : ", response);
            setCurrentUser(response)
          }
        })
        .catch(err => console.log(err));
    }
  }, [publicKey, currentLock]);

  useEffect(() => {
    const fetchUserLocks = async () => {
      return await program.account.user.all([{
        memcmp: {
          offset: 8,
          bytes: publicKey.toBase58(),
        },
      }]);
    }
    if (publicKey) {
      fetchUserLocks()
        .then(response => {
          if (response) {
            const registrationsMap = response.map(({ account, publicKey }) => {
              const result = account
              return result
            });
            console.log("current user registrations : ", registrationsMap);
            setUserRegistrations(registrationsMap)
          }
        })
        .catch(err => console.log(err));
    }
  }, [publicKey]);

  return (
    <LockContext.Provider value={value}>
      {children}
    </LockContext.Provider>
  )
}
