"use client"

import React, { createContext, useState, useEffect, useMemo } from 'react'
import type { ReactNode } from 'react'
import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { MONOLITH_ID } from '@/constants'
import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js'
import { IDL } from "@/constants/idl";
import idl from "@/constants/idl/asr.json";

import type { Analytics, Lock, LockMap, ProposalMap, User, UserMap } from '@/types'
import { Program } from '@coral-xyz/anchor'

interface LockInterface {
  connection: Connection | null
  program: Program<IDL> | null
  endpoint: string
  analytics: Analytics | null
  locks: LockMap[]
  currentLock: LockMap | null
  currentLockProposals: ProposalMap[]
  core: LockMap | null
  setCurrentLock: React.Dispatch<React.SetStateAction<LockMap | null>>
  address: string | null
  setAddress: React.Dispatch<React.SetStateAction<string | null>>
  users: User[]
  currentUser: User | null
  userRegistrations: UserMap[]
  userLocks: LockMap[]
  loading: boolean
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
  solana: boolean
  setSolana: React.Dispatch<React.SetStateAction<boolean>>
}

export const LockContext = createContext<LockInterface>({
  connection: null,
  program: null,
  endpoint: clusterApiUrl('devnet'),
  analytics: null,
  locks: [],
  currentLock: null,
  currentLockProposals: [],
  core: null,
  setCurrentLock: () => null,
  address: null,
  setAddress: () => null,
  users: [],
  currentUser: null,
  userRegistrations: [],
  userLocks: [],
  loading: true,
  setLoading: () => null,
  solana: true,
  setSolana: () => null,
})

export const LockContextProvider = ({ children }: { children: ReactNode }) => {
  const { publicKey, signMessage } = useWallet();

  const [solana, setSolana] = useState<boolean>(true);

  const connection = useMemo(() => {
    if (solana) {
      return new Connection('https://api.devnet.solana.com')
    } else {
      return new Connection('https://rpc.testnet.soo.network/rpc')
    }
  }, [solana])

  const [program, setProgram] = useState<Program<IDL> | null>(null);
  const [endpoint, setEndpoint] = useState<string>("");

  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [locks, setLocks] = useState<LockMap[]>([]);
  const [currentLock, setCurrentLock] = useState<LockMap | null>(null);
  const [currentLockProposals, setCurrentLockProposals] = useState<ProposalMap[]>([]);
  const [core, setCore] = useState<LockMap | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userRegistrations, setUserRegistrations] = useState<UserMap[]>([]);
  const [userLocks, setUserLocks] = useState<LockMap[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const value = {
    connection,
    program,
    endpoint,
    analytics,
    locks,
    core,
    currentLock,
    currentLockProposals,
    setCurrentLock,
    address,
    setAddress,
    users,
    currentUser,
    userRegistrations,
    userLocks,
    loading,
    setLoading,
    solana,
    setSolana
  }

  useEffect(() => {
    if (solana) {
      setEndpoint(clusterApiUrl('devnet'));
    } else if (!solana) {
      setEndpoint("https://rpc.testnet.soo.network/rpc");
    }
  }, [solana]);

  useEffect(() => {
    if (endpoint) {
      console.log("endpoint : ", endpoint);
      setProgram(new Program(idl as IDL, {
        connection: new Connection(endpoint)
      }))
    }
  }, [endpoint]);


  useEffect(() => {
    if (!analytics && program) {
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
  }, [program, solana])

  useEffect(() => {
    const fetchLocks = async () => {
      return await program.account.lock.all()
    }
    const getLock = (locks: LockMap[]): LockMap => {
      return locks.filter(lock => lock.publicKey.toString() == MONOLITH_ID)[0];
    }
    if (analytics && program) {
      fetchLocks()
        .then((response) => {
          if (response) {
            console.log('locks : ', response)
            setLocks(response);
            setCore(getLock(response));
            if (!currentLock) {
              setCurrentLock(getLock(response));
            }
          }
        })
        .catch((error) => console.log(error))
    }
  }, [publicKey, analytics, program, solana])

  useEffect(() => {
    const fetchLock = async () => {
      return await program.account.lock.fetch(new PublicKey(address))
    }
    if (address && program) {
      fetchLock()
        .then((response) => {
          if (response) {
            console.log('current lock : ', response)
            setCurrentLock({ account: response, publicKey: new PublicKey(address) });
          }
        })
        .catch((error) => console.log(error))
    }
  }, [publicKey, address, program, solana])

  useEffect(() => {
    const fetchProposals = async () => {
      return await program.account.proposal.all([
        {
          memcmp: {
            offset: 8 + 8,
            bytes: currentLock.publicKey.toBase58(),
          },
        },
      ]);
    }
    if (currentLock && program && !currentLockProposals) {
      fetchProposals()
        .then(response => {
          if (response) {
            console.log(`Proposals : for currentLock : `, response)
            setCurrentLockProposals(response)
          }
        })
        .catch(err => console.log(err));
    }
  }, [currentLock, program, solana]);

  useEffect(() => {
    const fetchUsers = async () => {
      return await program.account.user.all([{
        memcmp: {
          offset: 8 + 32,
          bytes: currentLock.publicKey.toString()
        }
      }]);
    }
    if (currentLock && program) {
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
          } else {
            setUsers([])
          }
        })
        .catch(err => console.log(err));
    }
  }, [currentLock, program, solana]);


  useEffect(() => {
    const fetchUser = async () => {
      const user = PublicKey.findProgramAddressSync(
        // seeds = [b"user", lock.key().as_ref(), signer.key().as_ref()]
        [Buffer.from("user"), currentLock.publicKey.toBytes(), publicKey.toBytes()],
        program.programId
      )[0]
      return await program.account.user.fetch(user);
    }
    if (publicKey && currentLock && program && !loading) {
      fetchUser()
        .then(response => {
          if (response) {
            console.log("current user : ", response);
            setCurrentUser(response)
          } else {
            setCurrentUser(null)
          }
        })
        .catch(err => {
          console.log(err);
          setCurrentUser(null);
        });
    }
  }, [publicKey, currentLock, program, loading, solana]);

  useEffect(() => {
    const fetchUserRegistrations = async () => {
      return await program.account.user.all([{
        memcmp: {
          offset: 8,
          bytes: publicKey.toBase58(),
        },
      }]);
    }
    const getUserLocks = (users: UserMap[], locks: LockMap[]): LockMap[] => {
      return locks.filter(lock => new Set(users.map(user => user.account.lock.toString())).has(lock.publicKey.toString()));
    }

    if (publicKey && locks && core && program) {
      fetchUserRegistrations()
        .then(response => {
          if (response) {
            console.log("current user registrations : ", response);
            setUserRegistrations(response);
            setUserLocks(getUserLocks(response, locks));
          }
        })
        .catch(err => console.log(err));
    } else if (!publicKey && locks && core) {
      setUserLocks([core]);
    }
  }, [publicKey, locks, core, program, solana]);

  return (
    <LockContext.Provider value={value}>
      {children}
    </LockContext.Provider>
  )
}
