import { Monolith } from '@/types';
import { atom } from 'recoil'

type MonolithState = {
  monoliths: Monolith[]
  current: Monolith | null
}
export const defaultMonolith: MonolithState = {
  monoliths: [],
  current: null
};

export const monolithState = atom<MonolithState>({
  key: 'monolithState',
  default: defaultMonolith,
});
