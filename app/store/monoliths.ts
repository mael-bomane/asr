import { Lock } from '@/types';
import { atom } from 'recoil'

type MonolithState = {
  monoliths: Lock[]
  current: Lock | null
}
export const defaultMonolith: MonolithState = {
  monoliths: [],
  current: null
};

export const monolithState = atom<MonolithState>({
  key: 'monolithState',
  default: defaultMonolith,
});
