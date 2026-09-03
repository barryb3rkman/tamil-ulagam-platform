import { Container, LinkButton } from "@tamil-ulagam/ui";

export default function NotFound() {
  return (
    <Container className="py-section text-center" size="narrow">
      <p className="text-heritage-maroon text-eyebrow">404</p>
      <h1 className="text-global-navy mt-4 text-4xl font-semibold tracking-[-0.025em] sm:text-5xl">
        Page not found
      </h1>
      <p className="text-slate mx-auto mt-5 max-w-xl text-lg leading-8">
        The page may have moved, or the address may not be recognised. Return to
        the Tamil Ulagam homepage to continue exploring.
      </p>
      <LinkButton className="mt-8" href="/">
        Return home
      </LinkButton>
    </Container>
  );
}
