import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BottomNavigation } from "../BottomNavigation";

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
