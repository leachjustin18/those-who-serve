// Mock firebase admin (db) so the helper does not initialize the real SDK
vi.mock("@/lib/firebase/admin", () => ({
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
}));

// Mock googleapis send behavior and count concurrent calls
let _inFlight = 0;
let _maxSeen = 0;
vi.mock("googleapis", () => {
  const sendMock = vi.fn(async ({ requestBody }: any) => {
    _inFlight++;
    _maxSeen = Math.max(_maxSeen, _inFlight);
    await new Promise((r) => setTimeout(r, 50));
    _inFlight--;
    return { data: { id: "ok" } };
  });

  return {
    google: {
      auth: { OAuth2: function () { return { setCredentials: () => {} }; } },
      gmail: () => ({ users: { messages: { send: sendMock } } }),
      __testHelpers: { getMaxSeen: () => _maxSeen },
    },
  };
});

describe("sendGmailBatch concurrency", () => {
  it("does not exceed the provided concurrency limit", async () => {
    const { sendGmailBatch } = await import("../googleGmail");

    const recipients = Array.from({ length: 10 }, (_, i) => `u${i}@example.com`);

    const result = await sendGmailBatch({
      to: recipients,
      subject: "Concurrency Test",
      text: "x",
      concurrency: 3,
      retryTransient: false,
    });

    // all should succeed
    expect(result.successes.length).toBe(10);

    // concurrency max observed should be <= provided concurrency
    // the mock updates the module-scoped `_maxSeen` variable
    expect(_maxSeen).toBeLessThanOrEqual(3);
  });
});
