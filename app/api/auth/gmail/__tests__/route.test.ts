import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const generateAuthUrl = vi.fn(() => "https://accounts.google.com/o/oauth2/v2/auth");
const createOAuth2Client = vi.fn(() => ({ generateAuthUrl }));

vi.mock("@/lib/nextAuth/session", () => ({
  getUserSession: vi.fn(async () => ({
    user: { email: "39cofc@gmail.com" },
  })),
}));

vi.mock("@/lib/helpers/googleGmail", () => ({
  createOAuth2Client,
  GMAIL_SCOPES: [
    "openid",
    "email",
    "https://www.googleapis.com/auth/gmail.send",
  ],
}));

describe("Gmail authorization route", () => {
  beforeEach(() => {
    vi.stubEnv("GMAIL_SENDER", "39cofc@gmail.com");
    createOAuth2Client.mockClear();
    generateAuthUrl.mockClear();
  });

  it("uses a dedicated callback on the current application origin", async () => {
    const { GET } = await import("../route");

    const response = await GET(
      new NextRequest("https://serve.example.org/api/auth/gmail"),
    );

    expect(createOAuth2Client).toHaveBeenCalledWith(
      "https://serve.example.org/api/auth/gmail/callback",
    );
    expect(generateAuthUrl).toHaveBeenCalledWith(
      expect.objectContaining({
        state: expect.any(String),
        scope: expect.arrayContaining([
          "https://www.googleapis.com/auth/gmail.send",
        ]),
      }),
    );
    expect(response.status).toBe(307);
  });
});
