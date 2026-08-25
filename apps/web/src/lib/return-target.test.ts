import { describe, expect, it } from "vitest";

import { getSafeReturnTarget, withReturnTarget } from "./return-target";

describe("getSafeReturnTarget", () => {
  it("allows a plain internal path", () => {
    expect(getSafeReturnTarget("/workspace/member")).toBe("/workspace/member");
  });

  it("allows an internal path with a query string", () => {
    expect(
      getSafeReturnTarget("/workspace/organisation/people?organization=abc"),
    ).toBe("/workspace/organisation/people?organization=abc");
  });

  it("rejects null, undefined, and empty string", () => {
    expect(getSafeReturnTarget(null)).toBeNull();
    expect(getSafeReturnTarget(undefined)).toBeNull();
    expect(getSafeReturnTarget("")).toBeNull();
  });

  it("rejects a protocol-relative path (open redirect via //)", () => {
    expect(getSafeReturnTarget("//evil.example.com")).toBeNull();
  });

  it("rejects a backslash-based protocol-relative path", () => {
    expect(getSafeReturnTarget("/\\evil.example.com")).toBeNull();
  });

  it("rejects an absolute URL", () => {
    expect(getSafeReturnTarget("https://evil.example.com")).toBeNull();
    expect(
      getSafeReturnTarget("http://evil.example.com/join/member"),
    ).toBeNull();
  });

  it("rejects a javascript: scheme", () => {
    expect(getSafeReturnTarget("javascript:alert(1)")).toBeNull();
  });

  it("rejects a path not starting with /", () => {
    expect(getSafeReturnTarget("join/member")).toBeNull();
  });

  it("rejects a path containing whitespace", () => {
    expect(getSafeReturnTarget("/join/ member")).toBeNull();
  });
});

describe("withReturnTarget", () => {
  it("appends an encoded next= param for a safe target", () => {
    expect(withReturnTarget("/login", "/workspace/member")).toBe(
      "/login?next=%2Fworkspace%2Fmember",
    );
  });

  it("returns the bare href when there is no return target", () => {
    expect(withReturnTarget("/login", null)).toBe("/login");
    expect(withReturnTarget("/login", undefined)).toBe("/login");
  });

  it("returns the bare href when the return target is unsafe", () => {
    expect(withReturnTarget("/login", "//evil.example.com")).toBe("/login");
  });
});
