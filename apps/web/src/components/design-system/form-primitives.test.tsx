import { fireEvent, render, screen } from "@testing-library/react";
import {
  Checkbox,
  FormField,
  Input,
  RadioGroup,
  Select,
  Textarea,
  descriptionId,
} from "@tamil-ulagam/ui";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

describe("Input composed with FormField", () => {
  it("associates the label, and — wired explicitly per the documented pattern — the error via aria-describedby + role=alert", () => {
    render(
      <FormField id="name" label="Organisation name" required error="Required.">
        <Input
          id="name"
          aria-invalid
          aria-describedby={descriptionId("name")}
        />
      </FormField>,
    );
    const input = screen.getByLabelText(/Organisation name/);
    expect(input).toHaveAccessibleName();
    expect(input).toHaveAttribute("aria-invalid", "true");
    const error = screen.getByRole("alert");
    expect(error).toHaveTextContent("Required.");
    expect(input).toHaveAttribute("aria-describedby", error.id);
  });

  it("shows the required indicator only for required fields", () => {
    render(
      <FormField id="optional" label="Website">
        <Input id="optional" />
      </FormField>,
    );
    expect(screen.getByText("Website")).toBeInTheDocument();
    expect(screen.queryByText("*")).not.toBeInTheDocument();
  });

  it("accepts keyboard input", () => {
    render(
      <FormField id="name2" label="Organisation name">
        <Input id="name2" />
      </FormField>,
    );
    const input = screen.getByLabelText("Organisation name");
    fireEvent.change(input, { target: { value: "Toronto Tamil Sangam" } });
    expect(input).toHaveValue("Toronto Tamil Sangam");
  });
});

describe("Textarea and Select composed with FormField", () => {
  it("Textarea is labelled and editable", () => {
    render(
      <FormField id="description" label="Short description">
        <Textarea id="description" />
      </FormField>,
    );
    const textarea = screen.getByLabelText("Short description");
    fireEvent.change(textarea, { target: { value: "A community group." } });
    expect(textarea).toHaveValue("A community group.");
  });

  it("Select lists every option plus a placeholder", () => {
    render(
      <FormField id="category" label="Category">
        <Select
          id="category"
          placeholder="Choose one"
          options={[
            { value: "sangam", label: "Tamil Sangam" },
            { value: "education", label: "Education" },
          ]}
        />
      </FormField>,
    );
    const select = screen.getByLabelText("Category");
    expect(
      screen.getByRole("option", { name: "Choose one" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Tamil Sangam" }),
    ).toBeInTheDocument();
    fireEvent.change(select, { target: { value: "education" } });
    expect(select).toHaveValue("education");
  });
});

describe("Checkbox", () => {
  it("toggles via a label click (native label/input association)", () => {
    function Harness() {
      const [checked, setChecked] = useState(false);
      return (
        <Checkbox
          id="consent"
          label="I agree to the Terms of Use."
          checked={checked}
          onChange={(event) => setChecked(event.target.checked)}
        />
      );
    }
    render(<Harness />);
    const checkbox = screen.getByRole("checkbox", {
      name: "I agree to the Terms of Use.",
    });
    expect(checkbox).not.toBeChecked();
    fireEvent.click(screen.getByText("I agree to the Terms of Use."));
    expect(checkbox).toBeChecked();
  });

  it("renders an accessible error via role=alert tied to the control", () => {
    render(
      <Checkbox id="consent-error" label="I agree" error="You must agree." />,
    );
    const checkbox = screen.getByRole("checkbox", { name: "I agree" });
    const error = screen.getByRole("alert");
    expect(checkbox).toHaveAttribute("aria-invalid", "true");
    expect(checkbox).toHaveAttribute("aria-describedby", error.id);
  });
});

describe("RadioGroup", () => {
  it("exposes a fieldset/legend and marks the selected option", () => {
    const onChange = vi.fn();
    render(
      <RadioGroup
        label="Is this organisation formally registered?"
        name="registered"
        value="informal"
        onChange={onChange}
        options={[
          { value: "registered", label: "Registered organisation" },
          { value: "informal", label: "Unregistered / informal" },
        ]}
      />,
    );
    expect(
      screen.getByRole("group", {
        name: "Is this organisation formally registered?",
      }),
    ).toBeInTheDocument();
    const informal = screen.getByRole("radio", {
      name: "Unregistered / informal",
    });
    expect(informal).toBeChecked();
    fireEvent.click(
      screen.getByRole("radio", { name: "Registered organisation" }),
    );
    expect(onChange).toHaveBeenCalled();
  });
});
