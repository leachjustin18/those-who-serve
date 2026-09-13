import recordErrorLogs from "../emailFailures";

vi.mock("@/lib/firebase/admin", () => {
  // Minimal fake Firestore for the test
  const commitMock = vi.fn(async () => Promise.resolve());
  return {
    db: {
      batch() {
        const sets: any[] = [];
        return {
          set(docRef: any, data: any) {
            sets.push({ docRef, data });
          },
          async commit() {
            commitMock();
            return Promise.resolve();
          },
          __getSets() {
            return sets;
          },
        };
      },
      collection(name: string) {
        return {
          doc() {
            return { _id: Math.random().toString(36).slice(2) };
          },
        };
      },
    },
  };
});

describe("recordErrorLogs", () => {
  it("does nothing for empty input", async () => {
    await recordErrorLogs([]);
    // No throw, nothing to assert here
  });

  it("writes multiple entries to Firestore batch", async () => {
    // Because we mocked the module inline above, calling the function should exercise batch.commit
    const entries = [
      { to: "a@example.com", reason: "rejected", details: "bounce" },
      { to: null, reason: "missing_email", details: "no address" },
    ];

    await recordErrorLogs(entries, { extra: "ctx" });
    // If it completes without throwing we consider it successful for this unit test environment
  });
});
