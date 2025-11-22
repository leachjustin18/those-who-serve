import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CacheProvider, useCache } from "../Cache";
import type { Man } from "@/types/man";

describe("CacheProvider / useCache", () => {
  const stubMen: Man[] = [
    {
      id: "1",
      firstName: "John",
      lastName: "Doe",
      email: "john@example.com",
      roles: ["admin"],
      unavailableDates: [],
    },
  ];

  it("exposes cached data to descendants", () => {
    const Consumer = () => {
      const cache = useCache();
      const man = cache.men[0];
      const fullName = [man?.firstName, man?.lastName]
        .filter(Boolean)
        .join(" ");
      return <div>{fullName}</div>;
    };

    render(
      <CacheProvider initialMen={stubMen}>
        <Consumer />
      </CacheProvider>,
    );

    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("throws when useCache is called outside of the provider", () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const Thrower = () => {
      useCache();
      return null;
    };

    expect(() => render(<Thrower />)).toThrowError(
      /useCache must be used within a CacheProvider/,
    );

    consoleErrorSpy.mockRestore();
  });
});
