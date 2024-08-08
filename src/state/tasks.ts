import { atom, selector } from 'recoil';
import { recoilPersist } from 'recoil-persist';

const { persistAtom } = recoilPersist();

export interface Task {
  id: string;
  date: string;
  desc: string;
}

export const tasksState = atom<Task[]>({
  key: 'tasksState',
  default: [],
  effects_UNSTABLE: [persistAtom],
});

export const getTasksState = selector({
  key: 'getTasksState', 
  get: ({get}) => {
    const data = get(tasksState);
    return data;
  },
});
