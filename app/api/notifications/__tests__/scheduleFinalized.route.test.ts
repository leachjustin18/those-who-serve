import { POST } from "../schedule-finalized/route";

// Mock dependencies used by the route
vi.mock("@/lib/api/men", () => ({
  fetchMen: async () => [
    { id: "m1", firstName: "John", email: "john@example.com" },
    { id: "m2", firstName: "Tom", email: null },
  ],
}));

vi.mock("@/lib/api/schedules", () => ({
  fetchSchedule: async (month: string) => ({
    entries: [
      { servantId: "m1", date: "2026-10-01", role: "usher" },
      { servantId: "m2", date: "2026-10-02", role: "usher" },
    ],
  }),
}));

vi.mock("@/lib/helpers/googleGmail", async () => {
  return {
    sendGmailBatch: vi.fn(async ({ to }: any) => {
      if (!to) return { successes: [], failures: [{ to: null, reason: "missing_email" }] };
      if (to === "john@example.com") return { successes: [to], failures: [] };
      return { successes: [], failures: [{ to, reason: "rejected" }] };
    }),
  };
});

vi.mock("@/lib/helpers/emailFailures", async () => ({
  recordErrorLogs: vi.fn(async () => Promise.resolve()),
}));

vi.mock("@/lib/emails/renderScheduleNotification", () => ({
  renderScheduleNotificationEmail: async () => ({ html: "<p>hi</p>", text: "hi" }),
}));

describe("schedule-finalized route", () => {
  it("sends emails to available men and records failures for missing emails", async () => {
    const req = new Request("http://localhost/api/notifications/schedule-finalized", {
      method: "POST",
      body: JSON.stringify({ month: "2026-10" }),
      headers: { "content-type": "application/json" },
    });

    const res: any = await POST(req as any);
    const data = await res.json();

    // m1 should be in sent
    expect(data.sent).toContain("m1");

    // m2 should be in failed due to missing email
    expect(data.failed.some((f: any) => f.servantId === "m2")).toBe(true);
  });
});
