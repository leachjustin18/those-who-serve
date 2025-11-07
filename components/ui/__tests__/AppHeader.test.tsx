import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppHeader } from "../AppHeader";
import { vi } from "vitest";
import { signOut } from "next-auth/react";

vi.mock("next-auth/react", () => ({
  signOut: vi.fn().mockResolvedValue(undefined),
}));

describe("AppHeader", () => {
  it("falls back to 'Member' when userName is missing", () => {
    render(<AppHeader userName=" " userImage={null} />);

    expect(screen.getByText("Member")).toBeInTheDocument();
  });

  it("opens the menu and logs out through next-auth", async () => {
    const user = userEvent.setup();
    render(<AppHeader userName="Jane Doe" userImage="/avatar.png" />);

    const avatar = screen.getByRole("img", { name: "Jane Doe" });
    await user.click(avatar);

    const logout = await screen.findByText(/log out/i);
    await user.click(logout);

    await waitFor(() => {
      expect(signOut).toHaveBeenCalledWith({ callbackUrl: "/login" });
    });
  });
});
