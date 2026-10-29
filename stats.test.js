import { describe, expect, it } from "vitest";
import stats from "./stats.js";

const { wpm, pontossag } = stats;

describe("wpm", () => {
  it("250 helyes karaktert 60 másodperc alatt 50 WPM-nek számol", () => {
    expect(wpm(250, 60_000)).toBe(50);
  });

  it("0-t ad vissza nem pozitív időre", () => {
    expect(wpm(250, 0)).toBe(0);
    expect(wpm(250, -1)).toBe(0);
  });

  it("0-t ad vissza, ha nincs helyes karakter", () => {
    expect(wpm(0, 60_000)).toBe(0);
  });
});

describe("pontossag", () => {
  it("százalékra kerekíti a helyes karakterek arányát", () => {
    expect(pontossag(8, 10)).toBe(80);
    expect(pontossag(2, 3)).toBe(67);
  });

  it("üres próbánál 100%-ot ad, és 0–100 közé korlátoz", () => {
    expect(pontossag(0, 0)).toBe(100);
    expect(pontossag(12, 10)).toBe(100);
    expect(pontossag(-1, 10)).toBe(0);
  });
});
