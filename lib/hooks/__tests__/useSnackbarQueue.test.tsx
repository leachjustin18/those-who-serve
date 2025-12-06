import { renderHook, act, waitFor } from "@testing-library/react";
import { useSnackbarQueue } from "../useSnackbarQueue";

describe("useSnackbarQueue", () => {
  it("enqueues a snackbar and exposes it as the active message", async () => {
    const { result } = renderHook(() => useSnackbarQueue());

    act(() => {
      result.current.showSnackbar({
        severity: "success",
        title: "Saved",
        message: "Profile updated",
      });
    });

    await waitFor(() => {
      expect(result.current.messageInfo?.message).toBe("Profile updated");
    });

    expect(result.current.open).toBe(true);
    expect(result.current.messageInfo?.severity).toBe("success");
    expect(result.current.messageInfo?.title).toBe("Saved");
  });

  it("ignores clickaway close events", async () => {
    const { result } = renderHook(() => useSnackbarQueue());

    act(() => {
      result.current.showSnackbar({ message: "Hello" });
    });

    await waitFor(() => {
      expect(result.current.open).toBe(true);
    });

    act(() => {
      result.current.handleClose(undefined, "clickaway");
    });

    expect(result.current.open).toBe(true);
  });

  it("displays queued snackbars sequentially", async () => {
    const { result } = renderHook(() => useSnackbarQueue());

    act(() => {
      result.current.showSnackbar({ message: "First" });
    });

    await waitFor(() => {
      expect(result.current.messageInfo?.message).toBe("First");
    });

    act(() => {
      result.current.showSnackbar({ message: "Second" });
    });

    act(() => {
      result.current.handleClose();
    });

    expect(result.current.open).toBe(false);

    act(() => {
      result.current.handleExited();
    });

    await waitFor(() => {
      expect(result.current.messageInfo?.message).toBe("Second");
    });
    expect(result.current.open).toBe(true);
  });
});
