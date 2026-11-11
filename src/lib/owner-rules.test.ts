import { describe, expect, it } from "vitest";
import { canDeleteSignup, canRemoveOwner } from "./owner-rules";

describe("last remaining owner", () => {
  it("allows deletion only for pending sign-ups", () => { expect(canDeleteSignup(false)).toBe(true); expect(canDeleteSignup(true)).toBe(false); });
  it("cannot remove the last owner", () => { expect(canRemoveOwner(1)).toBe(false); });
  it("can remove an owner when another remains", () => { expect(canRemoveOwner(2)).toBe(true); });
});