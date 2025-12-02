export type TMan = {
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

export type TDateValue = Date | string;

export type TFormInputs = {
    firstName: string;
    lastName: string;
    email: string;
    roles: string[];
    unavailableDates?: TDateValue[];
    photoFile?: File | string;
    notes?: string;
};


