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
