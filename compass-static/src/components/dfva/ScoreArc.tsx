export const RISK_CONFIG = {
  RESILIENT: {
    color: '#16a34a',
    track: '#dcfce7',
    text: '#15803d',
    label: 'Resilient',
  },
  'MODERATE RISK': {
    color: '#d97706',
    track: '#fef9c3',
    text: '#92400e',
    label: 'Moderate Risk',
  },
  'HIGH RISK': {
    color: '#ea580c',
    track: '#ffedd5',
    text: '#9a3412',
    label: 'High Risk',
  },
  CRITICAL: {
    color: '#dc2626',
    track: '#fee2e2',
    text: '#991b1b',
    label: 'Critical',
  },
} as const

export type RiskBand = keyof typeof RISK_CONFIG

interface ScoreArcProps {
  score: number
  max: number
  band: RiskBand
  size?: number
}

/** 300° arc gauge. 60° gap at bottom. Score centred inside. */
export function ScoreArc({ score, max, band, size = 120 }: ScoreArcProps) {
  const cfg = RISK_CONFIG[band]
  const sw = Math.round(size * 0.075)
  const r = (size - sw * 2) / 2
  const circumference = 2 * Math.PI * r
  const GAP_DEG = 60
  const arcLength = circumference * ((360 - GAP_DEG) / 360)
  const filledLength = arcLength * (score / max)
  // rotate so arc starts at 7 o'clock (120° clockwise from SVG's 3 o'clock)
  const rotate = 90 + GAP_DEG / 2
  const cx = size / 2
  const cy = size / 2

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={cfg.track}
            strokeWidth={sw}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeLinecap="round"
            transform={`rotate(${rotate} ${cx} ${cy})`}
          />
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={cfg.color}
            strokeWidth={sw}
            strokeDasharray={`${filledLength} ${circumference}`}
            strokeLinecap="round"
            transform={`rotate(${rotate} ${cx} ${cy})`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-bold leading-none tabular-nums"
            style={{ color: cfg.text, fontSize: Math.round(size * 0.24) }}
          >
            {score}
          </span>
          <span
            className="leading-none text-gray-400"
            style={{ fontSize: Math.round(size * 0.1) }}
          >
            /{max}
          </span>
        </div>
      </div>
      <span
        className="rounded-full px-2.5 py-0.5 text-xs font-semibold"
        style={{ background: cfg.track, color: cfg.text }}
      >
        {cfg.label}
      </span>
    </div>
  )
}
