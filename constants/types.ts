import { ReactNode } from 'react';

export type TUnavailableDate = { year: number; month: string; id: string };
export interface ITabPanelProps {
  children: ReactNode;
  index: number;
  value: number;
}

export interface IFormInput {
  firstName: string;
  lastName: string;
  jobs: string[];
  unavailableDates: TUnavailableDate[];
}

export interface IServant {
  firstName?: string;
  lastName?: string;
  id?: string;
  jobs?: string;
  unavailableDates?: TUnavailableDate[];
}
