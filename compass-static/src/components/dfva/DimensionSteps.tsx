import type { DimensionScore } from '../../data/programData'

function stepColor(score: number): string {
  if (score === 3) return '#16a34a'
  if (score === 2) return '#d97706'
  if (score === 1) return '#ea580c'
  return '#e5e7eb'
}

interface DimensionStepsProps {
  dimensions: DimensionScore[]
}

/** Segmented step bars — 3 discrete slots filled left-to-right by score. */
export function DimensionSteps({ dimensions }: DimensionStepsProps) {
  return (
    <div className="space-y-2">
      {dimensions.map((d) => {
        const color = stepColor(d.score)
        return (
          <div
            key={d.label}
            className="grid items-center gap-x-2"
            style={{ gridTemplateColumns: '8rem 1fr 2rem' }}
          >
            <span className="truncate text-xs text-muted-foreground" title={d.label}>
              {d.label}
            </span>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: d.max }, (_, i) => (
                <div
                  key={i}
                  className="h-2.5 flex-1 rounded-sm"
                  style={{ background: i < d.score ? color : '#e5e7eb' }}
                />
              ))}
            </div>
            <span
              className="text-right text-xs font-semibold tabular-nums"
              style={{ color: d.score === 0 ? '#9ca3af' : color }}
            >
              {d.score}/{d.max}
            </span>
          </div>
        )
      })}
    </div>
  )
}
