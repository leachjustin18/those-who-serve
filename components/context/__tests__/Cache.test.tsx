import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CacheProvider, useCache } from "../Cache";
import type { Man } from "@/types/man";

describe("CacheProvider / useCache", () => {
  const stubMen: Man[] = [
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      roles: ["admin"],
      unavailableDates: [],
    },
  ];

  it("exposes cached data to descendants", () => {
    const Consumer = () => {
      const cache = useCache();
      return <div>{cache.men[0]?.name}</div>;
    };

    render(
      <CacheProvider initialCache={{ men: stubMen }}>
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
