import { IDL } from '@/constants/idl';
import { Idl } from '@coral-xyz/anchor';
import { atom } from 'recoil'

export const defaultIdl = IDL;

export const idlState = atom<Idl>({
  key: 'idlState',
  default: defaultIdl,
});
