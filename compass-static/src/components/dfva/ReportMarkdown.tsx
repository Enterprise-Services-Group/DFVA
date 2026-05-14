import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { TrendingUp, TrendingDown, Sparkles } from 'lucide-react'
import { RISK_CONFIG } from './ScoreArc'
import type { Components } from 'react-markdown'
import type { ReactNode } from 'react'

// ─── helpers ────────────────────────────────────────────────────────────────

/** Extract plain text recursively from React children */
function childText(children: ReactNode): string {
  if (typeof children === 'string') return children
  if (typeof children === 'number') return String(children)
  if (Array.isArray(children)) return children.map(childText).join('')
  if (children && typeof children === 'object' && 'props' in (children as object)) {
    return childText((children as { props: { children?: ReactNode } }).props.children)
  }
  return ''
}

// ─── risk badge ─────────────────────────────────────────────────────────────

const RISK_BADGE: Record<string, { color: string; bg: string; label: string }> = {
  HIGH:        { color: '#dc2626', bg: '#fef2f2', label: 'HIGH' },
  MEDIUM:      { color: '#d97706', bg: '#fffbeb', label: 'MEDIUM' },
  LOW:         { color: '#16a34a', bg: '#f0fdf4', label: 'LOW' },
  'LOW–MEDIUM':{ color: '#d97706', bg: '#fffbeb', label: 'LOW–MEDIUM' },
}

/** Detect a leading risk token (HIGH, MEDIUM, LOW, LOW–MEDIUM) followed by
 *  an optional parenthetical and/or em-dash separator, returning
 *  [badge key, remainder text] or null if no match. */
function splitRisk(text: string): [string, string] | null {
  const m = text.match(/^(LOW[–-]MEDIUM|HIGH|MEDIUM|LOW)(\s*[\u2014(].*)$/i)
  if (!m) return null
  return [m[1].toUpperCase().replace('-', '–'), m[2].trimStart()]
}

function RiskBadge({ token }: { token: string }) {
  const cfg = RISK_BADGE[token] ?? RISK_BADGE['MEDIUM']
  return (
    <span
      className="mr-1.5 inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-bold leading-none"
      style={{ color: cfg.color, background: cfg.bg }}
    >
      {cfg.label}
    </span>
  )
}

// ─── score dots ─────────────────────────────────────────────────────────────

const DOT_COLOR: Record<number, string> = {
  3: '#16a34a',
  2: '#d97706',
  1: '#ea580c',
  0: '#e5e7eb',
}

function ScoreDots({ score }: { score: number }) {
  return (
    <span className="inline-flex items-center gap-1">
      {[1, 2, 3].map((i) => (
        <span
          key={i}
          className="inline-block h-2.5 w-2.5 rounded-sm"
          style={{ background: i <= score ? DOT_COLOR[score] : DOT_COLOR[0] }}
        />
      ))}
    </span>
  )
}

// ─── direction cell ──────────────────────────────────────────────────────────

function DirectionCell({ text }: { text: string }) {
  const t = text.trim()
  if (t === 'Up')
    return <span className="inline-flex items-center gap-1 font-medium" style={{ color: '#16a34a' }}><TrendingUp className="h-3.5 w-3.5" />Up</span>
  if (t === 'Down')
    return <span className="inline-flex items-center gap-1 font-medium" style={{ color: '#dc2626' }}><TrendingDown className="h-3.5 w-3.5" />Down</span>
  if (t === 'Emerging')
    return <span className="inline-flex items-center gap-1 font-medium" style={{ color: '#d97706' }}><Sparkles className="h-3.5 w-3.5" />Emerging</span>
  return null
}

// ─── status chip (Diagnostic Summary table) ─────────────────────────────────

function StatusChip({ text }: { text: string }) {
  if (text.includes('Critical gap'))
    return <span className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-semibold" style={{ color: '#d97706', background: '#fffbeb' }}>⚠ Critical gap</span>
  if (text === 'Adequate')
    return <span className="rounded px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground" style={{ background: '#f3f4f6' }}>Adequate</span>
  return null
}

// ─── risk-band text colouring ────────────────────────────────────────────────

const BAND_PATTERN = /\b(HIGH RISK|MODERATE RISK|RESILIENT|CRITICAL)\b/

function colourBand(text: string): ReactNode {
  const parts = text.split(BAND_PATTERN)
  if (parts.length === 1) return text
  return (
    <>
      {parts.map((part, i) => {
        const band = part as keyof typeof RISK_CONFIG
        if (RISK_CONFIG[band]) {
          return (
            <strong key={i} style={{ color: RISK_CONFIG[band].color }}>
              {part}
            </strong>
          )
        }
        return part
      })}
    </>
  )
}

// ─── roadmap paragraph detection ────────────────────────────────────────────

/** Matches e.g. "Month 1–3 — Foundation:" or "Months 1–12 — Structural Fix:" */
const ROADMAP_RE = /^(?:Month|Months)\s+([\d–-]+)\s+[—–-]+\s+([^:]+):\s*(.*)/s

function RoadmapCard({ phase, range, body }: { phase: string; range: string; body: string }) {
  const items = body.split(/\s*·\s*/).map(s => s.trim()).filter(Boolean)
  return (
    <div className="mb-3 overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-2.5">
        <span className="rounded-full bg-foreground px-2.5 py-0.5 text-[10px] font-bold text-background">
          {range}
        </span>
        <span className="text-xs font-semibold uppercase tracking-widest text-foreground">
          {phase}
        </span>
      </div>
      <ul className="space-y-1 px-4 py-3">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
            <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/50" />
            {colourBand(item)}
          </li>
        ))}
      </ul>
    </div>
  )
}

// ─── section header (h3) ─────────────────────────────────────────────────────

const NUMBERED_H3 = /^(\d+)\.\s+(.*)/

function SectionHeader({ children }: { children: ReactNode }) {
  const text = childText(children)
  const m = text.match(NUMBERED_H3)
  if (m) {
    return (
      <div className="mb-4 mt-8 flex items-center gap-3 border-t border-border pt-5">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-foreground text-[10px] font-bold text-background">
          {m[1]}
        </span>
        <h3 className="text-[11px] font-semibold uppercase tracking-widest text-foreground">
          {m[2]}
        </h3>
      </div>
    )
  }
  return (
    <div className="mb-4 mt-8 border-t border-border pt-5">
      <h3 className="text-[11px] font-semibold uppercase tracking-widest text-foreground">
        {text}
      </h3>
    </div>
  )
}

// ─── verdict paragraph detection ─────────────────────────────────────────────

function isVerdictParagraph(children: ReactNode): { band: keyof typeof RISK_CONFIG } | null {
  const text = childText(children)
  const m = text.match(BAND_PATTERN)
  if (!m) return null
  const band = m[1] as keyof typeof RISK_CONFIG
  if (!RISK_CONFIG[band]) return null
  return { band }
}

// ─── td cell renderer ─────────────────────────────────────────────────────────

function SmartCell({ children }: { children: ReactNode }) {
  const text = childText(children).trim()

  // Pure single-digit score (0–3) → dots
  if (/^\d$/.test(text) && Number(text) <= 3) {
    return <td className="px-3 py-2.5 text-right"><ScoreDots score={Number(text)} /></td>
  }

  // Score fraction "18 / 36" TOTAL row
  if (/^\d+\s*\/\s*36$/.test(text)) {
    return (
      <td className="px-3 py-2.5 text-right font-bold tabular-nums text-foreground">
        {text}
      </td>
    )
  }

  // Direction (Up / Down / Emerging)
  const dir = <DirectionCell text={text} />
  if (dir) return <td className="px-3 py-2.5">{dir}</td>

  // Status chip (Critical gap / Adequate)
  const chip = <StatusChip text={text} />
  if (chip) return <td className="px-3 py-2.5">{chip}</td>

  // Risk level badge + remainder
  const riskSplit = splitRisk(text)
  if (riskSplit) {
    const [token, rest] = riskSplit
    return (
      <td className="px-3 py-2.5">
        <RiskBadge token={token} />
        <span className="text-xs text-muted-foreground">{rest}</span>
      </td>
    )
  }

  // Default — pass children through (preserves <strong>, <em>, <a> etc.)
  return <td className="px-3 py-2.5 align-top text-xs text-muted-foreground">{children}</td>
}

// ─── components map ──────────────────────────────────────────────────────────

const components: Components = {
  // Suppress duplicate title
  h2: () => null,

  h3: ({ children }) => <SectionHeader>{children}</SectionHeader>,

  blockquote: ({ children }) => (
    <div
      className="my-4 rounded-r-lg border-l-4 px-4 py-3 text-xs text-muted-foreground"
      style={{ borderColor: '#d97706', background: '#fffbeb' }}
    >
      {children}
    </div>
  ),

  // Tables — scrollable card wrapper
  table: ({ children }) => (
    <div className="my-4 overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-xs">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-muted/50">{children}</thead>,
  th: ({ children }) => (
    <th className="border-b border-border px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </th>
  ),
  tr: ({ children }) => (
    <tr className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
      {children}
    </tr>
  ),
  td: ({ children }) => <SmartCell>{children}</SmartCell>,

  // strong — colourise risk band phrases
  strong: ({ children }) => {
    const text = childText(children)
    const m = text.match(BAND_PATTERN)
    if (m) {
      const band = m[1] as keyof typeof RISK_CONFIG
      return <strong style={{ color: RISK_CONFIG[band]?.color }}>{children}</strong>
    }
    return <strong>{children}</strong>
  },

  // p — verdict callout or roadmap card, else default prose
  p: ({ children }) => {
    const text = childText(children)

    // Roadmap paragraph
    const rm = text.match(ROADMAP_RE)
    if (rm) {
      return <RoadmapCard range={`Month ${rm[1]}`} phase={rm[2].trim()} body={rm[3]} />
    }

    // Verdict callout
    const verdict = isVerdictParagraph(children)
    if (verdict) {
      const cfg = RISK_CONFIG[verdict.band]
      return (
        <div
          className="my-4 rounded-lg border-l-4 px-4 py-3 text-sm"
          style={{ borderColor: cfg.color, background: cfg.track }}
        >
          <p className="leading-relaxed text-foreground">{children}</p>
        </div>
      )
    }

    return <p className="my-3 leading-relaxed text-muted-foreground">{children}</p>
  },

  ul: ({ children }) => <ul className="my-3 list-none space-y-2 pl-0">{children}</ul>,

  li: ({ children }) => (
    <li className="flex items-start gap-2 text-xs text-muted-foreground">
      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground/50" />
      <span>{children}</span>
    </li>
  ),

  ol: ({ children }) => <ol className="my-3 list-none space-y-2 pl-0">{children}</ol>,

  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="font-medium underline underline-offset-2"
      style={{ color: '#2563eb' }}
    >
      {children}
    </a>
  ),
}

// ─── public component ────────────────────────────────────────────────────────

interface ReportMarkdownProps {
  markdown: string
}

export function ReportMarkdown({ markdown }: ReportMarkdownProps) {
  return (
    <div className="space-y-0">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {markdown}
      </ReactMarkdown>
    </div>
  )
}
