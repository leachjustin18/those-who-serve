/* eslint-disable @next/next/no-head-element, @next/next/no-img-element -- This component renders standalone email HTML, not a Next.js page. */
import * as React from "react";

type AssignmentItem = {
  id: string;
  displayDate: string;
  dayName: string;
  roleLabel: string;
  calendarLink: string;
  icsLink: string;
};

type Props = {
  recipientName: string;
  monthLabel: string;
  assignments: AssignmentItem[];
};

const primary = "#5A3B2A"; // warm brown from logo
const accent = "#D8C8B5"; // light beige accent
const text = "#3D2A1F"; // dark brown for body text
const muted = "#6B5A4C"; // muted brown/gray

export const ScheduleNotificationEmail = ({
  recipientName,
  monthLabel,
  assignments,
}: Props) => (
  <html lang="en">
    <head />
    <body style={main}>
      <div style={preview}>Your serving schedule for {monthLabel}</div>
      <div style={container}>
        <h1 style={h1}>Serving schedule for {monthLabel}</h1>
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <img
            src="https://files.39thstreetchurchofchrist.org/images/emailThoseWhoServe.png"
            alt="Those Who Serve - 39th St Church of Christ"
            width="220"
            height="240"
            style={{ display: "inline-block", width: "220px", height: "auto" }}
          />
          <p style={tagline}>Those Who Serve - 39th St Church of Christ</p>
        </div>
        <p style={paragraph}>Hi {recipientName},</p>
        <p style={paragraph}>
          Thank you for serving this month. Below are your assignments. Use the
          “Add to calendar” buttons to place each role on your calendar.
        </p>

        <div style={cardGrid}>
          {assignments.map((assignment) => (
            <div style={card} key={assignment.id}>
              <p style={dateText}>
                {assignment.dayName} · {assignment.displayDate}
              </p>
              <h3 style={roleHeading}>{assignment.roleLabel}</h3>
              <div style={buttonRow}>
                <a
                  style={button}
                  href={assignment.calendarLink}
                  target="_blank"
                  rel="noreferrer"
                >
                  Add to Google
                </a>
                <a
                  style={buttonSecondary}
                  href={assignment.icsLink}
                  target="_blank"
                  rel="noreferrer"
                >
                  Add to Apple / Outlook
                </a>
              </div>
              <p style={noteText}>
                If the links don&apos;t open, copy and paste one of these URLs:
                <br />
                Google:{" "}
                <a href={assignment.calendarLink} style={link}>
                  {assignment.calendarLink}
                </a>
              </p>
              <p style={noteText}>
                ICS (Apple/Outlook):{" "}
                <a href={assignment.icsLink} style={link}>
                  {assignment.icsLink}
                </a>
              </p>
            </div>
          ))}
        </div>

        <hr style={hr} />
        <p style={footer}>
          Sent by Those Who Service Scheduler. If you are unable to serve and/or
          if you get someone to substitue for you. Please let a decon know as
          soon as possible.
        </p>
      </div>
    </body>
  </html>
);

const preview: React.CSSProperties = {
  display: "none",
  maxHeight: 0,
  maxWidth: 0,
  opacity: 0,
  overflow: "hidden",
};

const main: React.CSSProperties = {
  backgroundColor: "#F5EDE1",
  fontFamily:
    '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  padding: "24px 0",
};

const container: React.CSSProperties = {
  margin: "0 auto",
  maxWidth: "640px",
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  padding: "28px 32px",
  border: `1px solid ${accent}`,
};

const h1: React.CSSProperties = {
  color: text,
  fontSize: "22px",
  fontWeight: 700,
  margin: "0 0 12px",
};

const paragraph: React.CSSProperties = {
  color: text,
  fontSize: "15px",
  lineHeight: "22px",
  margin: "0 0 14px",
};

const cardGrid: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: "16px",
  width: "100%",
};

const card: React.CSSProperties = {
  border: `1px solid ${accent}`,
  borderRadius: "10px",
  padding: "16px 18px",
  backgroundColor: "#ffffff",
};

const dateText: React.CSSProperties = {
  color: muted,
  fontSize: "13px",
  margin: "0 0 6px",
  textTransform: "uppercase",
  letterSpacing: "0.4px",
};

const roleHeading: React.CSSProperties = {
  color: text,
  fontSize: "17px",
  fontWeight: 700,
  margin: "0 0 12px",
};

const button: React.CSSProperties = {
  backgroundColor: primary,
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: 600,
  textDecoration: "none",
  borderRadius: "8px",
  display: "block",
  padding: "10px 14px",
  textAlign: "center",
  width: "100%",
  marginBottom: "8px",
};

const buttonSecondary: React.CSSProperties = {
  ...button,
  backgroundColor: "#111827",
  marginBottom: 0,
};

const buttonRow: React.CSSProperties = {
  display: "block",
  marginTop: "6px",
};

const noteText: React.CSSProperties = {
  color: muted,
  fontSize: "12px",
  marginTop: "10px",
  lineHeight: "18px",
};

const hr: React.CSSProperties = {
  border: "none",
  borderTop: "1px solid #E5E7EB",
  margin: "24px 0 12px",
};

const footer: React.CSSProperties = {
  color: muted,
  fontSize: "12px",
  lineHeight: "18px",
  margin: 0,
};

const link: React.CSSProperties = {
  color: primary,
  textDecoration: "underline",
  wordBreak: "break-all",
};

const tagline: React.CSSProperties = {
  color: text,
  fontSize: "13px",
  fontWeight: 600,
  marginTop: 8,
};

export default ScheduleNotificationEmail;
