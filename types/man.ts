export type Man = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: string[];
  unavailableDates: string[];
  photoFile?: File | string;
  notes?: string;
  updatedAt?: number;
  createdAt?: number;
};
