import { IDL } from "@/constants/idl";
import idl from "@/constants/idl/asr.json";
import { Program } from "@coral-xyz/anchor";
import { clusterApiUrl, Connection } from "@solana/web3.js";

export const PROGRAM_ID = 'ASRwFhKHjzF96q6BAvWcjCQQT8WpBU9XTkWDKe5ttmUX'
export const MONOLITH_ID = '2uUucnEPQZ8kUbG5aKoKpjcQHQFucgAAzPGwx6EDbokb'
export const UNSTAKING_TIME = 86400 * 3;

export const program = (connection: Connection) => new Program(idl as IDL, { connection });
