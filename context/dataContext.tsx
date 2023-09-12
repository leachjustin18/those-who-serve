import { createContext, useMemo, useContext } from 'react';
import { useImmerReducer } from 'use-immer';
import type { ReactNode } from 'react';
import type { TJob } from '../types/types';

type TState = {
  jobs: TJob[];
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
  INITIATE_JOBS = 'INITIATE_JOBS',
  ADD_JOB = 'ADD_JOB',
  REMOVE_JOB = 'REMOVE_JOB',
}

type TAction = {
  type: actions;
  payload: any;
};

const reducer = (state: TState, action: TAction) => {
  switch (action.type) {
    case actions.INITIATE_JOBS:
      return {
        ...state,
        jobs: [...action.payload],
      };
    case actions.ADD_JOB:
      return {
        ...state,
        jobs: [...state.jobs, ...action.payload],
      };
    case actions.REMOVE_JOB:
      const filteredJobs = state.jobs.filter(
        (job) => job.key !== action.payload
      );
      return {
        ...state,
        jobs: filteredJobs,
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
