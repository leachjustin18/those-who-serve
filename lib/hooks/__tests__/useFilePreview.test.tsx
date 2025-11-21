import { act, renderHook } from "@testing-library/react";
import { createRef, type ChangeEvent } from "react";
import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";

import { useFilePreview } from "@/lib/hooks/useFilePreview";

describe("useFilePreview", () => {
  const originalCreateObjectURL = URL.createObjectURL;
  const originalRevokeObjectURL = URL.revokeObjectURL;

  beforeEach(() => {
    URL.createObjectURL = vi.fn(
      () => "blob:preview",
    ) as typeof URL.createObjectURL;
    URL.revokeObjectURL = vi.fn() as typeof URL.revokeObjectURL;
  });

  afterEach(() => {
    URL.createObjectURL = originalCreateObjectURL;
    URL.revokeObjectURL = originalRevokeObjectURL;
  });

  const createChangeEvent = (file: File): ChangeEvent<HTMLInputElement> =>
    ({
      target: {
        files: {
          0: file,
          length: 1,
          item: () => file,
        },
      },
    }) as unknown as ChangeEvent<HTMLInputElement>;

  it("stores the File instance and exposes a preview url", () => {
    const { result } = renderHook(() => useFilePreview());
    const file = new File(["payload"], "avatar.png", { type: "image/png" });
    const event = createChangeEvent(file);
    const inputRef = createRef<HTMLInputElement>();

    act(() => {
      result.current.onFileChange(event, inputRef);
    });

    expect(result.current.file).toBe(file);
    expect(result.current.previewFile).toBe("blob:preview");
    expect(URL.createObjectURL).toHaveBeenCalledWith(file);
  });

  it("clears the controlled input value after handling a change event", () => {
    const { result } = renderHook(() => useFilePreview());
    const file = new File(["payload"], "avatar.png", { type: "image/png" });
    const event = createChangeEvent(file);
    const inputRef = createRef<HTMLInputElement>();
    inputRef.current = document.createElement("input");
    inputRef.current.value = "something";

    act(() => {
      result.current.onFileChange(event, inputRef);
    });

    expect(inputRef.current?.value).toBe("");
  });

  it("clears the file and preview when clearFile is invoked", () => {
    const { result } = renderHook(() => useFilePreview());
    const file = new File(["payload"], "avatar.png", { type: "image/png" });
    const event = createChangeEvent(file);
    const inputRef = createRef<HTMLInputElement>();

    act(() => {
      result.current.onFileChange(event, inputRef);
    });

    expect(result.current.file).toBeDefined();
    expect(result.current.previewFile).toBeDefined();

    act(() => {
      result.current.clearFile();
    });

    expect(result.current.file).toBeUndefined();
    expect(result.current.previewFile).toBeUndefined();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:preview");
  });

  it("revokes the previous preview when choosing a new file", () => {
    const { result } = renderHook(() => useFilePreview());
    const firstFile = new File(["first"], "avatar1.png", { type: "image/png" });
    const secondFile = new File(["second"], "avatar2.png", {
      type: "image/png",
    });
    const makeEvent = (file: File) => createChangeEvent(file);
    const inputRef = createRef<HTMLInputElement>();

    act(() => {
      result.current.onFileChange(makeEvent(firstFile), inputRef);
    });

    expect(URL.revokeObjectURL).not.toHaveBeenCalled();

    act(() => {
      result.current.onFileChange(makeEvent(secondFile), inputRef);
    });

    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:preview");
  });
});
