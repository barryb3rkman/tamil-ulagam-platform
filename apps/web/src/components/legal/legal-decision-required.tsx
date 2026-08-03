import type {
  LegalDecisionRequired as LegalDecisionRequiredContent,
  LegalOperationalTrigger as LegalOperationalTriggerContent,
} from "@/content/legal";

interface LegalDecisionRequiredProps {
  readonly decision: LegalDecisionRequiredContent;
}

export function LegalDecisionRequired({
  decision,
}: LegalDecisionRequiredProps) {
  return (
    <aside
      aria-label={decision.label}
      className="border-heritage-maroon/50 bg-heritage-maroon/5 mt-8 border-l-4 px-5 py-6 sm:px-7"
    >
      <p className="text-heritage-maroon text-xs font-semibold tracking-[0.14em] uppercase">
        {decision.label}
      </p>
      <h3 className="text-global-navy mt-3 text-xl font-semibold">
        {decision.title}
      </h3>
      <p className="text-slate mt-3 leading-7">{decision.description}</p>
      <ul className="mt-5 grid gap-3 sm:grid-cols-2">
        {decision.items.map((item) => (
          <li key={item} className="flex gap-3 leading-7">
            <span aria-hidden="true" className="text-heritage-maroon font-bold">
              —
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}

interface LegalOperationalTriggerProps {
  readonly trigger: LegalOperationalTriggerContent;
}

export function LegalOperationalTrigger({
  trigger,
}: LegalOperationalTriggerProps) {
  return (
    <aside
      aria-label={trigger.label}
      className="border-heritage-gold bg-warm-ivory mt-8 border-l-4 px-5 py-6 sm:px-7"
    >
      <p className="text-warning text-xs font-semibold tracking-[0.14em] uppercase">
        {trigger.label}
      </p>
      <h3 className="text-global-navy mt-3 text-xl font-semibold">
        {trigger.title}
      </h3>
      <p className="text-slate mt-3 leading-7">{trigger.description}</p>
      <ul className="mt-5 grid gap-3 sm:grid-cols-2">
        {trigger.items.map((item) => (
          <li key={item} className="flex gap-3 leading-7">
            <span aria-hidden="true" className="text-heritage-gold font-bold">
              —
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
