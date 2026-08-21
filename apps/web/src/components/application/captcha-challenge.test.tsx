import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CaptchaChallenge } from "./captcha-challenge";

describe("CaptchaChallenge", () => {
  it("renders no widget or script when CAPTCHA is disabled", () => {
    const { container } = render(
      <CaptchaChallenge
        configuration={{ enabled: false }}
        resetKey={0}
        onTokenChange={vi.fn()}
      />,
    );
    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByLabelText("Security check")).not.toBeInTheDocument();
  });
});
