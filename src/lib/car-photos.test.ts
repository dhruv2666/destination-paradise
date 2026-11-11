import { describe, expect, it } from "vitest";
import { MAIN_MAX_BYTES, MAIN_SIZE, PHOTO_QUALITY, THUMB_MAX_BYTES, THUMB_SIZE, movePhoto, photosAllowed } from "./car-photos";

it("sets the requested dimensions and strict byte budgets", () => {
  expect(MAIN_SIZE).toBe(1600); expect(THUMB_SIZE).toBe(600);
  expect(MAIN_MAX_BYTES).toBe(300000); expect(THUMB_MAX_BYTES).toBe(80000); expect(PHOTO_QUALITY).toBe(0.75);
});

describe("car photo limit of 4", () => {
  it("allows all picks when room remains", () => { expect(photosAllowed(1, 3)).toBe(3); });
  it("caps picks at the remaining slots", () => { expect(photosAllowed(2, 5)).toBe(2); });
  it("allows none once a car has 4", () => { expect(photosAllowed(4, 1)).toBe(0); });
});

describe("reordering", () => {
  it("moves a photo to become the cover", () => { expect(movePhoto(["a", "b", "c"], 2, 0)).toEqual(["c", "a", "b"]); });
});
