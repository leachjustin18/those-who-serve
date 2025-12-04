import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => {
  const push = vi.fn();
  return {
    usePathname: () => "/manage-men",
    useRouter: () => ({ push }),
  };
});

vi.mock("next-auth/react", () => ({
  signOut: vi.fn(),
}));

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BottomNavigation } from "../";

describe("BottomNavigation", () => {
  it("allows switching between actions", async () => {
    const user = userEvent.setup();
    render(<BottomNavigation />);

    const menAction = screen.getByRole("button", { name: /men/i });
    const logoutAction = screen.getByRole("button", { name: /logout/i });

    expect(menAction).toHaveClass("Mui-selected");
    expect(logoutAction).not.toHaveClass("Mui-selected");

    await user.click(logoutAction);

    expect(logoutAction).toHaveClass("Mui-selected");
    expect(menAction).not.toHaveClass("Mui-selected");
  });
});
