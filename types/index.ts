export type TMan = {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    roles: string[];
    unavailableDates: string[];
    photoFile?: File | string;
    notes?: string;
    lastServed?: Record<string, number>; // role -> timestamp of last service
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

/**
 * A single assignment on the schedule for a specific date and role.
 */
export type TScheduleEntry = {
    date: string; // ISO date string (YYYY-MM-DD)
    role: string; // role value from ROLE_OPTIONS
    servantId: string;
};

export type TSchedulePrintExtras = {
    cardBoys: string;
    communionFamily: string;
    monthlyDeacons: string[];
};

/**
 * A monthly schedule document containing all assignments for a given month.
 */
export type TSchedule = {
    id: string;
    month: string;
    entries: TScheduleEntry[];
    finalized?: boolean;
    printExtras?: TSchedulePrintExtras | null;
    createdAt?: number;
    updatedAt?: number;
};

export type TDeacons = {
    id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
}
