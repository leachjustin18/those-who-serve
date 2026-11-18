import { describe, expect, it } from "vitest";
import { renderScheduleNotificationEmail } from "@/lib/emails/renderScheduleNotification";

describe("renderScheduleNotificationEmail", () => {
  it("renders standalone HTML and plain text without React Email components", async () => {
    const { html, text } = await renderScheduleNotificationEmail({
      recipientName: "Jane Doe",
      monthLabel: "January 2027",
      assignments: [
        {
          id: "assignment-1",
          displayDate: "January 3, 2027",
          dayName: "Sunday",
          roleLabel: "Song Leader",
          calendarLink: "https://calendar.google.com/example",
          icsLink: "https://example.com/assignment.ics",
        },
      ],
    });

    expect(html).toContain("<!DOCTYPE html");
    expect(html).toContain("Serving schedule for");
    expect(html).toContain("January 2027");
    expect(html).toContain("https://calendar.google.com/example");
    expect(text).toContain("Hi Jane Doe");
    expect(text).toContain("SONG LEADER");
  });
});
