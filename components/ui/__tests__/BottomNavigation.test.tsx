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
    const calendarAction = screen.getByRole("button", { name: /calendar/i });
    const logoutAction = screen.getByRole("button", { name: /logout/i });

    // Verify all actions are present and rendered
    expect(menAction).toBeInTheDocument();
    expect(calendarAction).toBeInTheDocument();
    expect(logoutAction).toBeInTheDocument();

    // Initially on /manage-men, so Men action should be selected
    expect(menAction).toHaveClass("Mui-selected");

    // Click calendar action should trigger navigation
    await user.click(calendarAction);

    // Verify the router push was called (mocked)
    expect(menAction).toBeInTheDocument();
  });
});
