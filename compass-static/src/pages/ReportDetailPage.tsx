import { useParams, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ArrowLeft, BarChart2, ClipboardList, TrendingUp } from 'lucide-react'
import { REPORT_CONTENT } from '../data/reportContent'
import { getProgramBySlug } from '../data/programData'
import { ScoreArc, DimensionRadar, ThresholdPanel, RISK_CONFIG } from '../components/dfva'

const NAV_TABS = [
  { type: 'assessment' as const, label: 'Assessment', icon: BarChart2 },
  { type: 'market' as const, label: 'Market Intelligence', icon: TrendingUp },
  { type: 'recommend' as const, label: 'Improvement Plan', icon: ClipboardList },
]

function parseSlug(slug: string): { code: string; type: 'assessment' | 'market' | 'recommend' } {
  if (slug.startsWith('dfva-recommend-')) return { code: slug.slice('dfva-recommend-'.length), type: 'recommend' }
  if (slug.startsWith('dfva-market-')) return { code: slug.slice('dfva-market-'.length), type: 'market' }
  return { code: slug.slice('dfva-'.length), type: 'assessment' }
}

export default function ReportDetailPage() {
  const { reportSlug } = useParams<{ reportSlug: string }>()
  const report = reportSlug ? REPORT_CONTENT[reportSlug] : undefined

  if (!report) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="mb-4 text-2xl font-bold text-foreground">Report not found</h1>
        <p className="mb-8 text-muted-foreground">
          No report exists for slug <code>{reportSlug}</code>.
        </p>
        <Link to="/reports" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" />
          Back to reports
        </Link>
      </div>
    )
  }

  const { code, type: currentType } = parseSlug(reportSlug!)
  const slugsByType = {
    assessment: 'dfva-' + code,
    market: 'dfva-market-' + code,
    recommend: 'dfva-recommend-' + code,
  }

  const program = getProgramBySlug(reportSlug!)
  const cfg = program ? RISK_CONFIG[program.riskBand] : null
  const coreDims = program?.dimensions.filter((d) => !d.label.includes('bonus')) ?? []

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Link
        to="/reports"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        All reports
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-foreground">{report.title}</h1>
          <p className="mt-1 text-muted-foreground">{report.institution}</p>
        </div>
        {program && (
          <ScoreArc score={program.score} max={program.maxScore} band={program.riskBand} size={110} />
        )}
      </div>

      {/* Tab navigation */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        {NAV_TABS.map((tab) => {
          const slug = slugsByType[tab.type]
          if (!(slug in REPORT_CONTENT)) return null
          const isActive = tab.type === currentType
          return (
            <Link
              key={tab.type}
              to={'/reports/' + slug}
              className={[
                'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium transition-colors',
                isActive
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground',
              ].join(' ')}
            >
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
            </Link>
          )
        })}
      </div>

      {/* Visualization banner — assessment tab only */}
      {currentType === 'assessment' && program && cfg && coreDims.length > 0 && (
        <div
          className="mt-6 grid grid-cols-1 gap-6 overflow-hidden rounded-xl border p-6 sm:grid-cols-[auto_1fr]"
          style={{ borderColor: cfg.color + '40', background: cfg.track + 'cc' }}
        >
          <DimensionRadar dimensions={coreDims} band={program.riskBand} size={220} />
          <div className="flex flex-col justify-center">
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Threshold Questions
            </p>
            <ThresholdPanel thresholds={program.thresholds} />
          </div>
        </div>
      )}

      {/* Markdown content */}
      <div className="mt-6 rounded-xl border border-border bg-card p-8">
        <div className="prose prose-sm dark:prose-invert max-w-none prose-table:text-xs prose-th:font-semibold prose-td:align-top">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{report.markdown}</ReactMarkdown>
        </div>
      </div>
    </div>
  )
}
