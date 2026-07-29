import { Container } from "@tamil-ulagam/ui";

export default function Loading() {
  return (
    <Container
      aria-live="polite"
      aria-busy="true"
      className="py-section"
      role="status"
    >
      <span className="sr-only">Loading page</span>
      <div aria-hidden="true" className="max-w-3xl animate-pulse">
        <div className="bg-heritage-gold/45 h-3 w-28 rounded-full" />
        <div className="rounded-card bg-global-navy/12 mt-6 h-12 w-4/5" />
        <div className="bg-slate/12 mt-4 h-5 w-full rounded-full" />
        <div className="bg-slate/12 mt-2 h-5 w-2/3 rounded-full" />
      </div>
    </Container>
  );
}
