import { render, screen } from "@testing-library/react";
import { AlertSnackbar } from "../AlertSnackbar";

describe("AlertSnackbar", () => {
  it("renders severity-specific icon, title, message, and action when open", () => {
    render(
      <AlertSnackbar
        open
        severity="success"
        title="Profile updated"
        message="All changes saved."
        action={<button type="button">Undo</button>}
      />,
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Profile updated")).toBeInTheDocument();
    expect(screen.getByText("All changes saved.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /undo/i })).toBeInTheDocument();
    expect(
      screen.getByTestId("CheckCircleOutlineIcon"),
    ).toBeInTheDocument();
  });

  it("falls back to default styling and icon when optional props are omitted", () => {
    render(<AlertSnackbar open message="Heads up!" />);

    expect(screen.getByRole("alert")).toHaveTextContent("Heads up!");
    expect(screen.getByTestId("InfoOutlinedIcon")).toBeInTheDocument();
    expect(document.querySelector(".MuiAlertTitle-root")).toBeNull();
  });
});
