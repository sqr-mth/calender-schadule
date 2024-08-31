import { atom, selector } from 'recoil';
import { recoilPersist } from 'recoil-persist';

const { persistAtom } = recoilPersist();


export const Status= {
  1: 'waiting',
  2: 'problem',
  3: 'done'
};
export interface Task {
  id: string;
  title:string;
  date: string;
  desc: string;
  status?:keyof typeof Status;
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
