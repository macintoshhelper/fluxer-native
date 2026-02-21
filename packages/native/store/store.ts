import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage';

// import { getItem, setItem } from './storageService'; // AsyncStorage utility

interface AccountState {
  token: string;
  setToken: (token: string) => void;
}

interface TodoState {
  // todos: string[];
  // addTodo: (todo: string) => void;
  // removeTodo: (index: number) => void;
}

interface StoreState extends AccountState, TodoState {}

export const useStore = create<StoreState>()(
  persist(
    (set, get) =>  ({
      // Counter State
      token: '',
      setToken: (token) => set({ token }),
      // decrement: () => set((state) => ({ value: state.value - 1 })),

      // Todo State
      // todos: [],
      // addTodo: (todo) => set((state) => ({ todos: [...state.todos, todo] })),
      // removeTodo: (index) =>
      //   set((state) => ({
      //     todos: state.todos.filter((_, i) => i !== index),
      //   })),
    }),
    {
      name: 'app-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
)

export const useToken = () => useStore((state) => state.token);
export const useActions = () => {
  const setToken = useStore((state) => state.setToken);

  return { setToken };
}

// export const useCounter = () => useStore((state) => state.value);
// export const useTodos = () => useStore((state) => state.todos);
// export const useActions = () =>
//   useStore((state) => ({
//     increment: state.increment,
//     decrement: state.decrement,
//     addTodo: state.addTodo,
//     removeTodo: state.removeTodo,
//   }));
