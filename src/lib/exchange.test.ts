import { expect, it } from "vitest";
import { convertEuroToMur } from "./exchange";

it("converts euros to MUR using the supplied live rate", () => {
  expect(convertEuroToMur(100, 52.414599)).toBe(5241.46);
  expect(convertEuroToMur(0, 52.414599)).toBe(0);
});
it("rejects negative amounts and invalid rates", () => {
  expect(() => convertEuroToMur(-1, 52)).toThrow();
  expect(() => convertEuroToMur(10, 0)).toThrow();
});