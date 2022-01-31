import { ReactNode } from 'react';

export interface ITabPanelProps {
  children: ReactNode;
  index: number;
  value: number;
}

export interface IFormInput {
  firstName: string;
  lastName: string;
  jobs: string[];
  unavailableDates: { year: number; month: string; id: string }[];
}

export interface IServant {
  firstName?: string;
  lastName?: string;
  id?: string;
  jobs?: string;
  notAvailable?: { year: number; month: string; id: string }[];
}
