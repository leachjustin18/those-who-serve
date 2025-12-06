import { render } from "@react-email/render";
import * as React from "react";
import { ScheduleNotificationEmail } from "@/emails/ScheduleNotificationEmail";

export type AssignmentEmailItem = {
  id: string;
  displayDate: string;
  dayName: string;
  roleLabel: string;
  calendarLink: string;
  icsLink: string;
};

type RenderParams = {
  recipientName: string;
  monthLabel: string;
  assignments: AssignmentEmailItem[];
};

export async function renderScheduleNotificationEmail({
  recipientName,
  monthLabel,
  assignments,
}: RenderParams): Promise<{ html: string; text: string }> {
  const component = (
    <ScheduleNotificationEmail
      recipientName={recipientName}
      monthLabel={monthLabel}
      assignments={assignments}
    />
  );

  const html = await render(component);
  const text = await render(component, { plainText: true });

  return { html, text };
}
