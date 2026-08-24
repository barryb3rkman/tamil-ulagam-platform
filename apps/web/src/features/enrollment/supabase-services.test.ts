import type {
  AuthChangeEvent,
  Session,
  SupabaseClient,
  User,
} from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";

import { createSupabasePlatformServices } from "./supabase-services";

const authUser = {
  id: "f87e5f44-cc58-4b8f-8f07-232234c7aa22",
  email: "nila@example.org",
  phone: "",
  user_metadata: { full_name: "Nila Raj" },
  app_metadata: {},
  aud: "authenticated",
  created_at: "2026-08-21T00:00:00.000Z",
} as unknown as User;

function clientWithAuth(options: {
  readonly loginError?: unknown;
  readonly confirmationRequired?: boolean;
  readonly missingSession?: boolean;
  readonly updatePasswordError?: unknown;
  readonly verifyOtpError?: unknown;
}) {
  const signInWithPassword = vi
    .fn()
    .mockResolvedValue(
      options.loginError
        ? { data: { user: null, session: null }, error: options.loginError }
        : { data: { user: authUser, session: {} }, error: null },
    );
  const signUp = vi.fn().mockResolvedValue({
    data: {
      user: authUser,
      session: options.confirmationRequired ? null : {},
    },
    error: null,
  });
  const signOut = vi.fn().mockResolvedValue({ error: null });
  const resetPasswordForEmail = vi.fn().mockResolvedValue({ error: null });
  const updateUser = vi
    .fn()
    .mockResolvedValue(
      options.updatePasswordError
        ? { data: { user: null }, error: options.updatePasswordError }
        : { data: { user: authUser }, error: null },
    );
  const verifyOtp = vi
    .fn()
    .mockResolvedValue(
      options.verifyOtpError
        ? { data: { user: null, session: null }, error: options.verifyOtpError }
        : { data: { user: authUser, session: {} }, error: null },
    );
  const getSession = vi
    .fn()
    .mockResolvedValue(
      options.missingSession
        ? { data: { session: null }, error: null }
        : { data: { session: {} }, error: null },
    );
  let authChangeListener:
    ((event: AuthChangeEvent, session: Session | null) => void) | undefined;
  const onAuthStateChange = vi.fn((listener) => {
    authChangeListener = listener;
    return { data: { subscription: { unsubscribe: vi.fn() } } };
  });
  const getUser = vi.fn().mockResolvedValue(
    options.missingSession
      ? {
          data: { user: null },
          error: {
            name: "AuthSessionMissingError",
            message: "Auth session missing!",
          },
        }
      : { data: { user: authUser }, error: null },
  );
  const profileBuilder = {
    select: vi.fn(),
    eq: vi.fn(),
    maybeSingle: vi.fn().mockResolvedValue({
      data: {
        id: authUser.id,
        full_name: "Nila Raj",
        phone: "+1 416 555 0110",
        country: "Canada",
        created_at: authUser.created_at,
      },
      error: null,
    }),
  };
  profileBuilder.select.mockReturnValue(profileBuilder);
  profileBuilder.eq.mockReturnValue(profileBuilder);

  const client = {
    auth: {
      getSession,
      getUser,
      onAuthStateChange,
      resetPasswordForEmail,
      signInWithPassword,
      signOut,
      signUp,
      updateUser,
      verifyOtp,
    },
    from: vi.fn().mockReturnValue(profileBuilder),
  } as unknown as SupabaseClient;

  return {
    client,
    emitAuthEvent(event: AuthChangeEvent) {
      authChangeListener?.(event, {} as Session);
    },
    getSession,
    resetPasswordForEmail,
    signInWithPassword,
    signOut,
    signUp,
    updateUser,
    verifyOtp,
  };
}

describe("Supabase enrollment services", () => {
  it("maps a successful password login into the shared user profile", async () => {
    const { client, signInWithPassword } = clientWithAuth({});
    const result = await createSupabasePlatformServices(client).auth.login({
      email: " NILA@EXAMPLE.ORG ",
      password: "TamilMvp1!",
    });

    expect(signInWithPassword).toHaveBeenCalledWith({
      email: "nila@example.org",
      password: "TamilMvp1!",
    });
    expect(result).toEqual({
      ok: true,
      user: expect.objectContaining({
        id: authUser.id,
        fullName: "Nila Raj",
        email: "nila@example.org",
        country: "Canada",
      }),
    });
  });

  it("returns a controlled invalid-credentials result", async () => {
    const { client } = clientWithAuth({
      loginError: { message: "Invalid login credentials", status: 400 },
    });

    await expect(
      createSupabasePlatformServices(client).auth.login({
        email: "nila@example.org",
        password: "incorrect",
      }),
    ).resolves.toEqual({
      ok: false,
      message: "Those credentials were not recognised.",
    });
  });

  it("does not query protected profile data before email confirmation", async () => {
    const { client, signUp } = clientWithAuth({ confirmationRequired: true });
    const from = vi.mocked(client.from);

    const result = await createSupabasePlatformServices(client).auth.signup({
      fullName: "Nila Raj",
      email: "nila@example.org",
      password: "TamilMvp1!",
      termsAccepted: true,
    });

    expect(result).toEqual(
      expect.objectContaining({
        ok: true,
        requiresEmailConfirmation: true,
      }),
    );
    expect(from).not.toHaveBeenCalled();
    expect(signUp).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({
          emailRedirectTo:
            "http://localhost:3000/auth/callback?flow=confirmation",
        }),
      }),
    );
  });

  it("restores the current user and delegates logout to Supabase Auth", async () => {
    const { client, signOut } = clientWithAuth({});
    const auth = createSupabasePlatformServices(client).auth;

    await expect(auth.getCurrentUser()).resolves.toEqual(
      expect.objectContaining({
        id: authUser.id,
        fullName: "Nila Raj",
      }),
    );
    await auth.signOut();
    expect(signOut).toHaveBeenCalledOnce();
  });

  it("treats an absent browser session as a signed-out state", async () => {
    const { client } = clientWithAuth({ missingSession: true });
    const services = createSupabasePlatformServices(client);

    await expect(services.auth.getCurrentUser()).resolves.toBeNull();
    await expect(services.snapshot()).resolves.toEqual(
      expect.objectContaining({ currentUserId: null, registrations: [] }),
    );
    await expect(services.canReviewApplications()).resolves.toBe(false);
    expect(client.from).not.toHaveBeenCalled();
  });

  it("passes CAPTCHA tokens to signup, login and password reset", async () => {
    const { client, resetPasswordForEmail, signInWithPassword, signUp } =
      clientWithAuth({});
    const auth = createSupabasePlatformServices(client).auth;
    await auth.signup({
      fullName: "Nila Raj",
      email: "nila@example.org",
      password: "TamilMvp1!",
      termsAccepted: true,
      captchaToken: "captcha-token",
    });
    await auth.login({
      email: "nila@example.org",
      password: "TamilMvp1!",
      captchaToken: "captcha-token",
    });
    await auth.requestPasswordReset("nila@example.org", "captcha-token");
    expect(signUp).toHaveBeenCalledWith(
      expect.objectContaining({
        options: expect.objectContaining({ captchaToken: "captcha-token" }),
      }),
    );
    expect(signInWithPassword).toHaveBeenCalledWith(
      expect.objectContaining({
        options: { captchaToken: "captcha-token" },
      }),
    );
    expect(resetPasswordForEmail).toHaveBeenCalledWith("nila@example.org", {
      captchaToken: "captcha-token",
      redirectTo: "http://localhost:3000/auth/callback?flow=recovery",
    });
  });

  it("accepts only a real recovery event and clears the session after update", async () => {
    const { client, emitAuthEvent, signOut, updateUser } = clientWithAuth({});
    const services = createSupabasePlatformServices(client);
    services.onAuthStateChange(() => undefined);
    const auth = services.auth;
    emitAuthEvent("PASSWORD_RECOVERY");
    await expect(
      auth.resolveAuthCallback(
        "recovery",
        "http://localhost:3000/auth/callback?flow=recovery",
      ),
    ).resolves.toEqual({ status: "recovery_ready" });
    await auth.completePasswordRecovery("UpdatedMvp2!");
    expect(updateUser).toHaveBeenCalledWith({ password: "UpdatedMvp2!" });
    expect(signOut).toHaveBeenCalledWith({ scope: "local" });
  });

  it("rejects missing, normal-session and expired recovery callbacks", async () => {
    const missing = clientWithAuth({ missingSession: true });
    await expect(
      createSupabasePlatformServices(missing.client).auth.resolveAuthCallback(
        "recovery",
        "http://localhost:3000/auth/callback?flow=recovery",
      ),
    ).resolves.toEqual(expect.objectContaining({ status: "invalid" }));

    const normal = clientWithAuth({});
    const normalServices = createSupabasePlatformServices(normal.client);
    normalServices.onAuthStateChange(() => undefined);
    const normalAuth = normalServices.auth;
    normal.emitAuthEvent("SIGNED_IN");
    await expect(
      normalAuth.resolveAuthCallback(
        "recovery",
        "http://localhost:3000/auth/callback?flow=recovery",
      ),
    ).resolves.toEqual(expect.objectContaining({ status: "invalid" }));

    const expired = clientWithAuth({});
    await expect(
      createSupabasePlatformServices(expired.client).auth.resolveAuthCallback(
        "recovery",
        "http://localhost:3000/auth/callback?flow=recovery&error=access_denied&error_code=otp_expired",
      ),
    ).resolves.toEqual(expect.objectContaining({ status: "invalid" }));
  });

  it("handles verified confirmation token hashes and invalid callbacks", async () => {
    const { client, emitAuthEvent, verifyOtp } = clientWithAuth({});
    const services = createSupabasePlatformServices(client);
    services.onAuthStateChange(() => undefined);
    const auth = services.auth;
    emitAuthEvent("SIGNED_IN");
    await expect(
      auth.resolveAuthCallback(
        "confirmation",
        "http://localhost:3000/auth/callback?flow=confirmation&token_hash=safe-hash&type=signup",
      ),
    ).resolves.toEqual({
      status: "confirmation_success",
      hasSession: true,
    });
    expect(verifyOtp).toHaveBeenCalledWith({
      token_hash: "safe-hash",
      type: "signup",
    });

    const invalid = clientWithAuth({ verifyOtpError: { code: "otp_expired" } });
    await expect(
      createSupabasePlatformServices(invalid.client).auth.resolveAuthCallback(
        "confirmation",
        "http://localhost:3000/auth/callback?flow=confirmation&token_hash=expired&type=signup",
      ),
    ).resolves.toEqual(expect.objectContaining({ status: "invalid" }));
  });

  it("maps password update failures and rejects updates outside recovery", async () => {
    const outsideRecovery = clientWithAuth({});
    await expect(
      createSupabasePlatformServices(
        outsideRecovery.client,
      ).auth.completePasswordRecovery("UpdatedMvp2!"),
    ).rejects.toThrow("no longer valid");

    const failing = clientWithAuth({
      updatePasswordError: { code: "weak_password" },
    });
    const failingServices = createSupabasePlatformServices(failing.client);
    failingServices.onAuthStateChange(() => undefined);
    const auth = failingServices.auth;
    failing.emitAuthEvent("PASSWORD_RECOVERY");
    await expect(auth.completePasswordRecovery("weak")).rejects.toThrow(
      "upper and lowercase",
    );
  });
});
