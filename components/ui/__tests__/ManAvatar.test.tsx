import { render, screen } from "@testing-library/react";
import { ManAvatar } from "../ManAvatar";

describe("ManAvatar", () => {
  it("renders initials derived from the provided name when no photo is supplied", () => {
    render(<ManAvatar name="Peter Parker" />);

    const initials = screen.getByText("PP");
    const avatar = initials.closest(".MuiAvatar-root");

    expect(initials).toBeInTheDocument();
    expect(avatar).toBeTruthy();
  });

  it("prefers the supplied photo over initials", () => {
    render(<ManAvatar name="Peter Parker" photo="/images/peter.png" />);

    const avatarImage = screen.getByRole("img", { name: "Peter Parker" });

    expect(avatarImage).toHaveAttribute("src", "/images/peter.png");
    expect(avatarImage.parentElement).not.toHaveTextContent("PP");
  });
});
