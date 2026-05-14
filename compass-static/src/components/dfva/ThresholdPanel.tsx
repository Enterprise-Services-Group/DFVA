const ANSWER_CONFIG = {
  YES:       { color: '#dc2626', bg: '#fef2f2' },
  NO:        { color: '#16a34a', bg: '#f0fdf4' },
  UNCERTAIN: { color: '#d97706', bg: '#fffbeb' },
} as const

const QUESTIONS = [
  {
    key: 'q1' as const,
    label: "Could AI produce 80% of this grad's first-2yr output?",
  },
  {
    key: 'q2' as const,
    label: 'Does this program train graduates to design systems, own decisions, or generate original insight?',
  },
  {
    key: 'q3' as const,
    label: 'Will these graduates be more employable in 5 years than today?',
  },
]

interface ThresholdPanelProps {
  thresholds: { q1: string; q2: string; q3: string }
}

export function ThresholdPanel({ thresholds }: ThresholdPanelProps) {
  return (
    <div className="space-y-3">
      {QUESTIONS.map(({ key, label }) => {
        const answer = thresholds[key]
        const cfg = ANSWER_CONFIG[answer as keyof typeof ANSWER_CONFIG]
        return (
          <div key={key} className="flex items-start gap-2.5">
            <span
              className="mt-0.5 shrink-0 rounded px-1.5 py-0.5 text-xs font-bold leading-tight"
              style={{ background: cfg?.bg ?? '#f3f4f6', color: cfg?.color ?? '#374151' }}
            >
              {answer}
            </span>
            <span className="text-xs leading-relaxed text-muted-foreground">{label}</span>
          </div>
        )
      })}
    </div>
  )
}
