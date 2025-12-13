import { describe, expect, it } from "vitest";
import { isValidMonth, isValidScheduleResponse } from "@/lib/helpers/scheduleValidation";
import type { TSchedule } from "@/types";

describe("scheduleValidation", () => {
    describe("isValidMonth", () => {
        it("returns true for valid YYYY-MM format", () => {
            expect(isValidMonth("2024-01")).toBe(true);
            expect(isValidMonth("2025-12")).toBe(true);
            expect(isValidMonth("2020-06")).toBe(true);
        });

        it("returns false for invalid formats", () => {
            expect(isValidMonth("2024-1")).toBe(false); // Missing leading zero
            expect(isValidMonth("24-01")).toBe(false); // Short year
            expect(isValidMonth("2024/01")).toBe(false); // Wrong separator
            expect(isValidMonth("2024-13")).toBe(false); // Invalid month
            expect(isValidMonth("2024-00")).toBe(false); // Invalid month
            expect(isValidMonth("January 2024")).toBe(false); // Text format
            expect(isValidMonth("")).toBe(false); // Empty string
        });

        it("returns false for non-string inputs", () => {
            expect(isValidMonth(null as any)).toBe(false);
            expect(isValidMonth(undefined as any)).toBe(false);
            expect(isValidMonth(202401 as any)).toBe(false);
            expect(isValidMonth({} as any)).toBe(false);
        });
    });

    describe("isValidScheduleResponse", () => {
        const validSchedule: TSchedule = {
            id: "2024-01",
            month: "2024-01",
            entries: [
                { date: "2024-01-10", role: "speaker", servantId: "1" },
                { date: "2024-01-17", role: "worship_in_song", servantId: "2" },
            ],
        };

        it("returns true for valid schedule objects", () => {
            expect(isValidScheduleResponse(validSchedule)).toBe(true);
        });

        it("returns true for schedule with optional fields", () => {
            const scheduleWithOptional: TSchedule = {
                ...validSchedule,
                finalized: true,
                updatedAt: Date.now(),
                printExtras: {
                    cardBoys: "John",
                    communionFamily: "Jane",
                    monthlyDeacons: ["Bob"],
                },
            };
            expect(isValidScheduleResponse(scheduleWithOptional)).toBe(true);
        });

        it("returns false for missing id", () => {
            const invalid = { ...validSchedule, id: "" };
            expect(isValidScheduleResponse(invalid)).toBe(false);
        });

        it("returns false for missing month", () => {
            const invalid = { ...validSchedule, month: undefined };
            expect(isValidScheduleResponse(invalid)).toBe(false);
        });

        it("returns false for missing entries array", () => {
            const invalid = { ...validSchedule, entries: undefined };
            expect(isValidScheduleResponse(invalid)).toBe(false);
        });

        it("returns false for invalid entry in entries array", () => {
            const invalid = {
                ...validSchedule,
                entries: [{ date: "2024-01-10", role: "speaker" }], // missing servantId
            };
            expect(isValidScheduleResponse(invalid)).toBe(false);
        });

        it("returns false for entry with missing date", () => {
            const invalid = {
                ...validSchedule,
                entries: [{ role: "speaker", servantId: "1" }],
            };
            expect(isValidScheduleResponse(invalid)).toBe(false);
        });

        it("returns false for entry with missing role", () => {
            const invalid = {
                ...validSchedule,
                entries: [{ date: "2024-01-10", servantId: "1" }],
            };
            expect(isValidScheduleResponse(invalid)).toBe(false);
        });

        it("returns false for non-object inputs", () => {
            expect(isValidScheduleResponse(null)).toBe(false);
            expect(isValidScheduleResponse(undefined)).toBe(false);
            expect(isValidScheduleResponse("schedule")).toBe(false);
            expect(isValidScheduleResponse(123)).toBe(false);
            expect(isValidScheduleResponse([])).toBe(false);
        });

        it("returns false for empty object", () => {
            expect(isValidScheduleResponse({})).toBe(false);
        });
    });
});
