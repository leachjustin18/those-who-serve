import { createContext, useMemo, useContext } from 'react';
import { useImmerReducer } from 'use-immer';
import type { ReactNode } from 'react';
import type { TJobs } from '../types/types';

type TState = {
  jobs: TJobs[];
  servants: Record<string, any>[];
};

const initialState: TState = {
  jobs: [],
  servants: [],
};

export const DataContext = createContext<{
  state: TState;
  dispatch: React.Dispatch<TAction>;
}>({ state: initialState, dispatch: () => {} });

export enum actions {
  ADD_JOBS = 'ADD_JOBS',
  ADD_JOB = 'ADD_JOB',
}

type TAction = {
  type: actions;
  payload: TJobs[];
};

const reducer = (state: TState, action: TAction) => {
  switch (action.type) {
    case actions.ADD_JOBS:
      return {
        ...state,
        jobs: [...action.payload],
      };
    case actions.ADD_JOB:
      return {
        ...state,
        jobs: [...state.jobs, ...action.payload],
      };
    default:
      return state;
  }
};
export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useImmerReducer(reducer, initialState);
  const contextValue = useMemo<{
    state: TState;
    dispatch: React.Dispatch<TAction>;
  }>(() => ({ state, dispatch }), [state, dispatch]);
  return (
    <DataContext.Provider value={contextValue}>{children}</DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
