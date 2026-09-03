function Frame({
  children,
  className = "",
}: {
  readonly children: React.ReactNode;
  readonly className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 240 180"
      fill="none"
      className={`w-full ${className}`}
    >
      <defs>
        <linearGradient id="tu-ill-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c9973c" />
          <stop offset="45%" stopColor="#f0cf82" />
          <stop offset="100%" stopColor="#b8862f" />
        </linearGradient>
      </defs>
      {children}
    </svg>
  );
}

export function NetworkIllustration({
  className,
}: {
  readonly className?: string;
}) {
  const nodes = [
    [48, 60],
    [120, 34],
    [196, 66],
    [78, 128],
    [162, 132],
  ] as const;
  return (
    <Frame className={className}>
      <g stroke="currentColor" strokeWidth="1.1" opacity="0.32">
        <path d="M48 60 120 34 196 66" />
        <path d="M48 60 78 128 162 132 196 66" />
        <path d="M120 34 78 128" />
        <path d="M120 34 162 132" />
      </g>
      <circle
        cx="120"
        cy="34"
        r="26"
        stroke="url(#tu-ill-gold)"
        strokeWidth="1.6"
        opacity="0.4"
      />
      {nodes.map(([x, y], index) => (
        <circle
          key={`${x}-${y}`}
          cx={x}
          cy={y}
          r={index === 1 ? 9 : 5.5}
          fill="url(#tu-ill-gold)"
          opacity={index === 1 ? 1 : 0.72}
        />
      ))}
    </Frame>
  );
}

export function RipplesIllustration({
  className,
}: {
  readonly className?: string;
}) {
  return (
    <Frame className={className}>
      {[18, 34, 52, 72, 94].map((r, index) => (
        <circle
          key={r}
          cx="120"
          cy="92"
          r={r}
          stroke={index < 2 ? "url(#tu-ill-gold)" : "currentColor"}
          strokeWidth={index < 2 ? 2 : 1}
          opacity={index < 2 ? 0.9 : 0.3 - index * 0.05}
        />
      ))}
      <circle cx="120" cy="92" r="7" fill="url(#tu-ill-gold)" />
    </Frame>
  );
}

export function AscentIllustration({
  className,
}: {
  readonly className?: string;
}) {
  const bars = [
    [44, 132, 26],
    [82, 116, 42],
    [120, 96, 62],
    [158, 74, 84],
    [196, 56, 102],
  ] as const;
  return (
    <Frame className={className}>
      <path
        d="M44 128 82 110 120 90 158 68 196 50"
        stroke="url(#tu-ill-gold)"
        strokeWidth="1.8"
        strokeLinecap="round"
        opacity="0.55"
      />
      {bars.map(([x, y, h], index) => (
        <rect
          key={x}
          x={x - 9}
          y={y}
          width="18"
          height={h}
          rx="5"
          fill={
            index === bars.length - 1 ? "url(#tu-ill-gold)" : "currentColor"
          }
          opacity={index === bars.length - 1 ? 0.95 : 0.14 + index * 0.05}
        />
      ))}
    </Frame>
  );
}

export function ExchangeIllustration({
  className,
}: {
  readonly className?: string;
}) {
  return (
    <Frame className={className}>
      <path
        d="M32 120c30-64 76-64 106-32"
        stroke="currentColor"
        strokeWidth="1.2"
        opacity="0.3"
      />
      <path
        d="M208 60c-30 64-76 64-106 32"
        stroke="url(#tu-ill-gold)"
        strokeWidth="1.8"
        opacity="0.75"
      />
      <circle cx="32" cy="120" r="8" fill="currentColor" opacity="0.28" />
      <circle cx="208" cy="60" r="10" fill="url(#tu-ill-gold)" />
      <circle cx="120" cy="90" r="4.5" fill="url(#tu-ill-gold)" opacity="0.8" />
    </Frame>
  );
}

export function AssemblyIllustration({
  className,
}: {
  readonly className?: string;
}) {
  const seats = [
    [64, 62],
    [120, 44],
    [176, 62],
    [196, 108],
    [148, 138],
    [92, 138],
    [44, 108],
  ] as const;
  return (
    <Frame className={className}>
      <ellipse
        cx="120"
        cy="98"
        rx="52"
        ry="30"
        stroke="url(#tu-ill-gold)"
        strokeWidth="1.8"
        opacity="0.7"
      />
      <ellipse
        cx="120"
        cy="98"
        rx="26"
        ry="15"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.25"
      />
      {seats.map(([x, y], index) => (
        <g key={`${x}-${y}`}>
          <circle
            cx={x}
            cy={y}
            r="7.5"
            fill={index % 3 === 0 ? "url(#tu-ill-gold)" : "currentColor"}
            opacity={index % 3 === 0 ? 0.95 : 0.42}
          />
          <path
            d={`M${x - 9} ${y + 21}c0-6 4-10 9-10s9 4 9 10z`}
            fill={index % 3 === 0 ? "url(#tu-ill-gold)" : "currentColor"}
            opacity={index % 3 === 0 ? 0.7 : 0.3}
          />
        </g>
      ))}
    </Frame>
  );
}

export function SignalIllustration({
  className,
}: {
  readonly className?: string;
}) {
  const cos = 0.643;
  const sin = 0.766;
  return (
    <Frame className={className}>
      {[34, 56, 78, 100].map((r, index) => (
        <path
          key={r}
          d={`M${56 + cos * r} ${90 - sin * r}A${r} ${r} 0 0 1 ${
            56 + cos * r
          } ${90 + sin * r}`}
          stroke={index === 0 ? "url(#tu-ill-gold)" : "currentColor"}
          strokeWidth={index === 0 ? 2.4 : 1.4}
          strokeLinecap="round"
          opacity={index === 0 ? 0.95 : 0.42 - index * 0.09}
        />
      ))}
      <path
        d="M46 100v36"
        stroke="currentColor"
        strokeWidth="1.6"
        opacity="0.4"
      />
      <path
        d="M34 136h24"
        stroke="currentColor"
        strokeWidth="1.6"
        opacity="0.4"
        strokeLinecap="round"
      />
      <rect
        x="32"
        y="78"
        width="28"
        height="22"
        rx="7"
        fill="url(#tu-ill-gold)"
      />
    </Frame>
  );
}

export function PillarsIllustration({
  className,
}: {
  readonly className?: string;
}) {
  const pillars = [
    [58, 74],
    [96, 54],
    [134, 66],
    [172, 46],
  ] as const;
  return (
    <Frame className={className}>
      <path
        d="M34 142h172"
        stroke="currentColor"
        strokeWidth="1.4"
        opacity="0.28"
      />
      {pillars.map(([x, top], index) => (
        <g key={x}>
          <rect
            x={x - 13}
            y={top}
            width="26"
            height={142 - top}
            rx="12"
            fill={index === 3 ? "url(#tu-ill-gold)" : "currentColor"}
            opacity={index === 3 ? 0.9 : 0.13 + index * 0.04}
          />
          <circle
            cx={x}
            cy={top - 14}
            r="6.5"
            fill="url(#tu-ill-gold)"
            opacity={index === 3 ? 1 : 0.45}
          />
        </g>
      ))}
    </Frame>
  );
}
