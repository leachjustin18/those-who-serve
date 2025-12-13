import { describe, expect, it } from "vitest";

import { getServantRoleOptions, getServantRoleValues } from "../roleOptions";

describe("roleOptions helper", () => {
  it("excludes roles flagged as hidden from servant selection", () => {
    const options = getServantRoleOptions();
    expect(options.some((option) => option.value === "worship_in_song")).toBe(false);
  });

  it("returns matching values array", () => {
    const options = getServantRoleOptions();
    const values = getServantRoleValues();
    expect(values).toEqual(options.map((option) => option.value));
  });
});
