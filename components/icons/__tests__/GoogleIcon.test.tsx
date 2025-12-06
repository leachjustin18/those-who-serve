import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GoogleIcon } from "../Google";

describe("GoogleIcon", () => {
  it("renders the multi-color Google logo paths", () => {
    const { container } = render(<GoogleIcon />);

    const paths = container.querySelectorAll("path");
    expect(paths).toHaveLength(4);
  });
});
