import { describe, expect, it } from "vitest";
import { cleanHex, hexToBytes } from "../lib/snarkHex.js";

describe("hex validation", () => {
  it.each(["zz", "1g", "g1", "00gg", "0xdeadBEEZ", "0x12-4", "0x12_4", "0x１２", "00🙂"])(
    "rejects invalid characters in %j from both entry points", value => {
      expect(() => cleanHex(value)).toThrow(/Invalid hex character/);
      expect(() => hexToBytes(value)).toThrow(/Invalid hex character/);
    },
  );

  it("reports the first invalid character and its normalized position", () => {
    expect(() => hexToBytes(" 0xDE ADg0 ")).toThrow('Invalid hex character "g" at index 4');
  });

  it("names a non-ASCII character without splitting its surrogate pair", () => {
    expect(() => cleanHex("00🙂")).toThrow('Invalid hex character "🙂" at index 2');
  });

  it.each(["deadbeef", "0xdeadBEEF", "0XDEADBEEF", "  0xDe Ad\tBe\nef  "])(
    "preserves supported normalization for %j", value => {
      expect(cleanHex(value)).toBe("deadbeef");
      expect(hexToBytes(value)).toEqual(new Uint8Array([0xde, 0xad, 0xbe, 0xef]));
    },
  );

  it.each(["", "0x", " \n\t "])("preserves empty hex input %j", value => {
    expect(cleanHex(value)).toBe("");
    expect(hexToBytes(value)).toEqual(new Uint8Array(0));
  });

  it.each(["a", "0xabc", "12345"])("still rejects odd-length bytes %j", value => {
    expect(() => hexToBytes(value)).toThrow("Hex string must have even length");
  });

  it("decodes every valid byte without coercion", () => {
    const hex = Array.from({ length: 256 }, (_, byte) => byte.toString(16).padStart(2, "0")).join("");
    expect(hexToBytes(hex)).toEqual(Uint8Array.from({ length: 256 }, (_, byte) => byte));
  });
});
