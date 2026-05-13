import { useParams, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ArrowLeft, BarChart2, ClipboardList, TrendingUp } from 'lucide-react'
import { REPORT_CONTENT } from '../data/reportContent'

const riskBandStyles: Record<string, string> = {
  RESILIENT: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  'MODERATE RISK': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  'HIGH RISK': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  CRITICAL: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
}

const reportMeta: Record<string, { score: string | null; riskBand: string | null }> = {
  'dfva-b-des': { score: '17 / 36', riskBand: 'HIGH RISK' },
  'dfva-market-b-des': { score: null, riskBand: null },
  'dfva-mc-is': { score: '18 / 36', riskBand: 'HIGH RISK' },
  'dfva-market-mc-is': { score: null, riskBand: null },
  'dfva-recommend-mc-is': { score: null, riskBand: null },
  'dfva-b-sci': { score: '23 / 36', riskBand: 'MODERATE RISK' },
  'dfva-market-b-sci': { score: null, riskBand: null },
  'dfva-recommend-b-sci': { score: null, riskBand: null },
}

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
        <Link
          to="/reports"
          className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to reports
        </Link>
      </div>
    )
  }

  const meta = reportSlug ? reportMeta[reportSlug] : null
  const { code, type: currentType } = parseSlug(reportSlug!)
  const slugsByType = {
    assessment: 'dfva-' + code,
    market: 'dfva-market-' + code,
    recommend: 'dfva-recommend-' + code,
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8">
        <Link
          to="/reports"
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          All reports
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{report.title}</h1>
            <p className="mt-1 text-muted-foreground">{report.institution}</p>
          </div>
          {meta?.riskBand && (
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-3 py-1 text-sm font-semibold ${riskBandStyles[meta.riskBand]}`}
              >
                {meta.riskBand}
              </span>
              {meta.score && (
                <span className="text-sm font-medium text-muted-foreground">{meta.score}</span>
              )}
            </div>
          )}
        </div>

        {/* Report family navigation */}
        <div className="mt-5 flex flex-wrap items-center gap-2">
          {NAV_TABS.map(tab => {
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
      </div>

      <div className="rounded-xl border border-border bg-card p-8">
        <div className="prose prose-sm dark:prose-invert max-w-none prose-table:text-xs prose-th:font-semibold prose-td:align-top">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{report.markdown}</ReactMarkdown>
        </div>
      </div>
    </div>
  )
}
