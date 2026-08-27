import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { usePlatform } from "@/features/enrollment/platform-provider";

import { LoginForm, SignupForm } from "./auth-forms";

const push = vi.fn();
let searchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => searchParams,
}));

vi.mock("@/features/enrollment/platform-provider", () => ({
  usePlatform: vi.fn(),
}));

const mockedUsePlatform = vi.mocked(usePlatform);

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  searchParams = new URLSearchParams();
});

describe("LoginForm return-target behavior", () => {
  it("redirects to a safe ?next= target after a successful login, instead of the default routing", async () => {
    searchParams = new URLSearchParams({ next: "/workspace/member" });
    const login = vi
      .fn()
      .mockResolvedValue({ ok: true, hasApplication: false, canReview: false });
    mockedUsePlatform.mockReturnValue({
      captcha: { enabled: false },
      login,
      platformError: "",
    } as unknown as ReturnType<typeof usePlatform>);

    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "nila@example.org" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "TamilMvp1!" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await vi.waitFor(() =>
      expect(push).toHaveBeenCalledWith("/workspace/member"),
    );
  });

  it("ignores an unsafe ?next= target and falls back to the default post-login routing", async () => {
    searchParams = new URLSearchParams({ next: "//evil.example.com" });
    const login = vi
      .fn()
      .mockResolvedValue({ ok: true, hasApplication: true, canReview: false });
    mockedUsePlatform.mockReturnValue({
      captcha: { enabled: false },
      login,
      platformError: "",
    } as unknown as ReturnType<typeof usePlatform>);

    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "nila@example.org" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "TamilMvp1!" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await vi.waitFor(() => expect(push).toHaveBeenCalledWith("/dashboard"));
  });

  it("routes a dual-role login (own application AND a review role) to /dashboard, not straight past their own organisation to /admin", async () => {
    // Regression guard: an account that both manages its own organisation
    // and holds a reviewer grant must still land in its own context first
    // on login — /admin remains one switcher click away via its
    // Federation entry, rather than becoming the forced destination every
    // time a dual-role account signs in.
    const login = vi
      .fn()
      .mockResolvedValue({ ok: true, hasApplication: true, canReview: true });
    mockedUsePlatform.mockReturnValue({
      captcha: { enabled: false },
      login,
      platformError: "",
    } as unknown as ReturnType<typeof usePlatform>);

    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "nila@example.org" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "TamilMvp1!" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await vi.waitFor(() => expect(push).toHaveBeenCalledWith("/dashboard"));
    expect(push).not.toHaveBeenCalledWith("/admin");
  });

  it("routes a pure-reviewer login (no application of their own) to /admin", async () => {
    const login = vi
      .fn()
      .mockResolvedValue({ ok: true, hasApplication: false, canReview: true });
    mockedUsePlatform.mockReturnValue({
      captcha: { enabled: false },
      login,
      platformError: "",
    } as unknown as ReturnType<typeof usePlatform>);

    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "nila@example.org" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "TamilMvp1!" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await vi.waitFor(() => expect(push).toHaveBeenCalledWith("/admin"));
  });

  it("routes a fresh member-only login (no application, no review role, no ?next=) to /dashboard rather than straight into Organisation registration", async () => {
    // E1.5 regression guard: /register's own bootstrap effect calls
    // ensureDraft() immediately on mount, which silently enrols the
    // signed-in account as the owner of a blank organisation — a
    // member-only visitor must never be routed there just by logging in.
    const login = vi
      .fn()
      .mockResolvedValue({ ok: true, hasApplication: false, canReview: false });
    mockedUsePlatform.mockReturnValue({
      captcha: { enabled: false },
      login,
      platformError: "",
    } as unknown as ReturnType<typeof usePlatform>);

    render(<LoginForm />);
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "nila@example.org" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "TamilMvp1!" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await vi.waitFor(() => expect(push).toHaveBeenCalledWith("/dashboard"));
    expect(push).not.toHaveBeenCalledWith("/register");
  });

  it("carries the return target through the 'Create an account' cross-link", () => {
    searchParams = new URLSearchParams({ next: "/join/member" });
    mockedUsePlatform.mockReturnValue({
      captcha: { enabled: false },
      login: vi.fn(),
      platformError: "",
    } as unknown as ReturnType<typeof usePlatform>);

    render(<LoginForm />);
    expect(
      screen.getByRole("link", { name: /create an account/i }),
    ).toHaveAttribute("href", "/signup?next=%2Fjoin%2Fmember");
  });
});

describe("SignupForm return-target behavior", () => {
  it("carries the return target through the 'Sign in' cross-link", () => {
    searchParams = new URLSearchParams({ next: "/join/member" });
    mockedUsePlatform.mockReturnValue({
      captcha: { enabled: false },
      signup: vi.fn(),
      platformError: "",
    } as unknown as ReturnType<typeof usePlatform>);

    render(<SignupForm />);
    expect(screen.getByRole("link", { name: /sign in/i })).toHaveAttribute(
      "href",
      "/login?next=%2Fjoin%2Fmember",
    );
  });
});
