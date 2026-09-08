// Tests for sendGmailBatch

// Mock firebase admin (db) to avoid initializing the real admin SDK during tests
vi.mock("@/lib/firebase/admin", () => {
  return {
    db: {
      collection() {
        return {
          doc() {
            return { get: async () => ({ exists: true, data: () => ({ refresh_token: "token-abc" }) }) };
          },
          where() {
            return { get: async () => ({ docs: [] }) };
          },
          orderBy() {
            return { limit: () => ({ get: async () => ({ docs: [] }) }) };
          },
        };
      },
    },
  };
});

// Mock googleapis before importing the module functions that use it
vi.mock("googleapis", () => {
  // we'll provide a gmail mock whose users.messages.send inspects the raw payload
  const sendMock = vi.fn(async ({ requestBody }: any) => {
    const raw = requestBody?.raw ?? "";
    // decode base64 url-safe to plain
    const b64 = raw.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = Buffer.from(b64, "base64").toString("utf8");

    if (decoded.includes("permanent@")) {
      const err: any = new Error("permanent");
      err.response = { status: 550, data: "Invalid recipient" };
      throw err;
    }

    if (decoded.includes("transient@")) {
      const err: any = new Error("transient");
      err.response = { status: 500, data: "Server error" };
      throw err;
    }

    if (decoded.includes("retry-success@")) {
      // simulate first call failing (500), second succeeding by tracking attempts per-recipient
      const keyMatch = decoded.match(/To: ([^\r\n]+)/);
      const key = keyMatch ? keyMatch[1] : decoded;
      (sendMock as any)._attempts = (sendMock as any)._attempts || {};
      (sendMock as any)._attempts[key] = ((sendMock as any)._attempts[key] || 0) + 1;
      if ((sendMock as any)._attempts[key] === 1) {
        const err: any = new Error("transient");
        err.response = { status: 500, data: "Temporary" };
        throw err;
      }
      return { data: { id: "ok" } };
    }

    return { data: { id: "ok" } };
  });

  return {
    google: {
      auth: { OAuth2: function () { return { setCredentials: () => {}, setCredentialsSync: () => {} }; } },
      gmail: ({ version, auth }: any) => ({
        users: { messages: { send: sendMock } },
      }),
    },
  };
});

// Import the module under test after mocking dependencies
import * as gmailModule from "../googleGmail";

describe("sendGmailBatch", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("sends to valid recipients and returns failures for invalid addresses", async () => {
    // ensure token present
    vi.spyOn(gmailModule as any, "getStoredRefreshToken").mockResolvedValue("token-abc");

    const res = await gmailModule.sendGmailBatch({
      to: ["good@example.com", "bad-email", "permanent@domain.test"],
      subject: "Test",
      text: "Hello",
      concurrency: 2,
      retryTransient: true,
    });

    // good should be in successes
    expect(res.successes).toContain("good@example.com");

    // bad-email is invalid format and should be reported as failure
    const invalid = res.failures.find((f: any) => f.to === "bad-email");
    expect(invalid).toBeTruthy();

    // permanent rejection should be present
    const perm = res.failures.find((f: any) => f.to === "permanent@domain.test");
    expect(perm).toBeTruthy();
  });

  it("retries transient errors once and succeeds if retry succeeds", async () => {
    vi.spyOn(gmailModule as any, "getStoredRefreshToken").mockResolvedValue("token-abc");

    const res = await gmailModule.sendGmailBatch({
      to: ["retry-success@domain.test"],
      subject: "Retry",
      text: "Try",
      concurrency: 1,
      retryTransient: true,
    });

    expect(res.successes).toContain("retry-success@domain.test");
    expect(res.failures.length).toBe(0);
  });
});
