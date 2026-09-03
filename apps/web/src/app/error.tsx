"use client";

import { Button, Container } from "@tamil-ulagam/ui";
import { useEffect } from "react";

export interface ErrorPageProps {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("Public website route error", error);
  }, [error]);

  return (
    <Container className="py-section" size="narrow">
      <div className="rounded-card border-error/20 shadow-card border bg-white p-8">
        <p className="text-error text-eyebrow">Page error</p>
        <h1 className="text-global-navy mt-4 text-3xl font-semibold">
          This page could not be displayed
        </h1>
        <p className="text-slate mt-4 leading-7">
          Please try again. If the problem continues, return to the homepage.
        </p>
        <Button className="mt-6" onClick={reset}>
          Try again
        </Button>
      </div>
    </Container>
  );
}
