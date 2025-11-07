import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { SignInWithGoogle } from "../SignInWithGoogle";
import { signIn } from "next-auth/react";

vi.mock("next-auth/react", () => ({
  signIn: vi.fn(),
}));

describe("SignInWithGoogle", () => {
  it("invokes next-auth signIn with the google provider", async () => {
    const user = userEvent.setup();
    render(<SignInWithGoogle />);

    const button = screen.getByRole("button", { name: /sign in with google/i });
    await user.click(button);

    expect(signIn).toHaveBeenCalledWith("google");
  });
});
