export interface DimensionScore {
  label: string
  score: number
  max: number
}

export interface ProgramData {
  program: string
  institution: string
  level: string
  date: string
  score: number
  maxScore: number
  riskBand: 'RESILIENT' | 'MODERATE RISK' | 'HIGH RISK' | 'CRITICAL'
  thresholds: { q1: string; q2: string; q3: string }
  dimensions: DimensionScore[]
  assessmentSlug: string
  marketSlug: string
  recommendSlug?: string
}

export const PROGRAMS: ProgramData[] = [
  {
    program: 'Bachelor of Design',
    institution: 'University of Melbourne',
    level: 'Bachelor · 3 years',
    date: '2026-04-21',
    score: 17,
    maxScore: 36,
    riskBand: 'HIGH RISK',
    thresholds: { q1: 'YES', q2: 'UNCERTAIN', q3: 'NO' },
    dimensions: [
      { label: 'Automation Exposure', score: 1, max: 3 },
      { label: 'Systems Thinking', score: 2, max: 3 },
      { label: 'Technical Depth', score: 1, max: 3 },
      { label: 'Decision-Making', score: 2, max: 3 },
      { label: 'AI Literacy', score: 1, max: 3 },
      { label: 'Domain Depth', score: 2, max: 3 },
      { label: 'Research Rigour', score: 1, max: 3 },
      { label: 'Human & Relational', score: 2, max: 3 },
      { label: 'Curriculum Currency', score: 2, max: 3 },
      { label: 'Outcome Evidence', score: 1, max: 3 },
      { label: 'Irreplaceability (bonus)', score: 2, max: 3 },
    ],
    assessmentSlug: 'dfva-b-des',
    marketSlug: 'dfva-market-b-des',
    recommendSlug: 'dfva-recommend-b-des',
  },
  {
    program: 'Master of Information Systems',
    institution: 'University of Melbourne',
    level: 'Master · 1.5–2 years',
    date: '2026-05-07',
    score: 18,
    maxScore: 36,
    riskBand: 'HIGH RISK',
    thresholds: { q1: 'YES', q2: 'UNCERTAIN', q3: 'NO' },
    dimensions: [
      { label: 'Automation Exposure', score: 1, max: 3 },
      { label: 'Systems Thinking', score: 2, max: 3 },
      { label: 'Technical Depth', score: 2, max: 3 },
      { label: 'Decision-Making', score: 2, max: 3 },
      { label: 'AI Literacy', score: 1, max: 3 },
      { label: 'Domain Depth', score: 2, max: 3 },
      { label: 'Research Rigour', score: 2, max: 3 },
      { label: 'Human & Relational', score: 2, max: 3 },
      { label: 'Curriculum Currency', score: 2, max: 3 },
      { label: 'Outcome Evidence', score: 1, max: 3 },
      { label: 'Irreplaceability (bonus)', score: 1, max: 3 },
    ],
    assessmentSlug: 'dfva-mc-is',
    marketSlug: 'dfva-market-mc-is',
    recommendSlug: 'dfva-recommend-mc-is',
  },
  {
    program: 'Bachelor of Science',
    institution: 'University of Melbourne',
    level: 'Bachelor · 3 years',
    date: '2026-05-13',
    score: 23,
    maxScore: 36,
    riskBand: 'MODERATE RISK',
    thresholds: { q1: 'UNCERTAIN', q2: 'YES', q3: 'UNCERTAIN' },
    dimensions: [
      { label: 'Automation Exposure', score: 2, max: 3 },
      { label: 'Systems Thinking', score: 2, max: 3 },
      { label: 'Technical Depth', score: 3, max: 3 },
      { label: 'Decision-Making', score: 2, max: 3 },
      { label: 'AI Literacy', score: 1, max: 3 },
      { label: 'Domain Depth', score: 3, max: 3 },
      { label: 'Research Rigour', score: 3, max: 3 },
      { label: 'Human & Relational', score: 1, max: 3 },
      { label: 'Curriculum Currency', score: 2, max: 3 },
      { label: 'Outcome Evidence', score: 2, max: 3 },
      { label: 'Irreplaceability (bonus)', score: 2, max: 3 },
    ],
    assessmentSlug: 'dfva-b-sci',
    marketSlug: 'dfva-market-b-sci',
    recommendSlug: 'dfva-recommend-b-sci',
  },
  {
    program: 'Master of Biotechnology',
    institution: 'University of Melbourne',
    level: 'Master · 2 years',
    date: '2026-05-13',
    score: 24,
    maxScore: 36,
    riskBand: 'MODERATE RISK',
    thresholds: { q1: 'NO', q2: 'YES', q3: 'YES' },
    dimensions: [
      { label: 'Automation Exposure', score: 2, max: 3 },
      { label: 'Systems Thinking', score: 2, max: 3 },
      { label: 'Technical Depth', score: 2, max: 3 },
      { label: 'Decision-Making', score: 3, max: 3 },
      { label: 'AI Literacy', score: 1, max: 3 },
      { label: 'Domain Depth', score: 3, max: 3 },
      { label: 'Research Rigour', score: 2, max: 3 },
      { label: 'Human & Relational', score: 3, max: 3 },
      { label: 'Curriculum Currency', score: 2, max: 3 },
      { label: 'Outcome Evidence', score: 1, max: 3 },
      { label: 'Irreplaceability (bonus)', score: 3, max: 3 },
    ],
    assessmentSlug: 'dfva-mc-scibit',
    marketSlug: 'dfva-market-mc-scibit',
    recommendSlug: 'dfva-recommend-mc-scibit',
  },
  {
    program: 'Master of Science (Earth Sciences)',
    institution: 'University of Melbourne',
    level: 'Master \u00b7 2 years',
    date: '2026-05-15',
    score: 24,
    maxScore: 36,
    riskBand: 'MODERATE RISK',
    thresholds: { q1: 'NO', q2: 'YES', q3: 'UNCERTAIN' },
    dimensions: [
      { label: 'Automation Exposure', score: 3, max: 3 },
      { label: 'Systems Thinking', score: 2, max: 3 },
      { label: 'Technical Depth', score: 3, max: 3 },
      { label: 'Decision-Making', score: 3, max: 3 },
      { label: 'AI Literacy', score: 1, max: 3 },
      { label: 'Domain Depth', score: 3, max: 3 },
      { label: 'Research Rigour', score: 3, max: 3 },
      { label: 'Human & Relational', score: 1, max: 3 },
      { label: 'Curriculum Currency', score: 2, max: 3 },
      { label: 'Outcome Evidence', score: 1, max: 3 },
      { label: 'Irreplaceability (bonus)', score: 2, max: 3 },
    ],
    assessmentSlug: 'dfva-mc-sciear',
    marketSlug: 'dfva-market-mc-sciear',
    recommendSlug: 'dfva-recommend-mc-sciear',
  },
  {
    program: 'Master of Science (Epidemiology)',
    institution: 'University of Melbourne',
    level: 'Master \u00b7 2 years',
    date: '2026-05-15',
    score: 23,
    maxScore: 36,
    riskBand: 'MODERATE RISK',
    thresholds: { q1: 'UNCERTAIN', q2: 'YES', q3: 'YES' },
    dimensions: [
      { label: 'Automation Exposure', score: 2, max: 3 },
      { label: 'Systems Thinking', score: 2, max: 3 },
      { label: 'Technical Depth', score: 3, max: 3 },
      { label: 'Decision-Making', score: 2, max: 3 },
      { label: 'AI Literacy', score: 1, max: 3 },
      { label: 'Domain Depth', score: 3, max: 3 },
      { label: 'Research Rigour', score: 3, max: 3 },
      { label: 'Human & Relational', score: 2, max: 3 },
      { label: 'Curriculum Currency', score: 2, max: 3 },
      { label: 'Outcome Evidence', score: 1, max: 3 },
      { label: 'Irreplaceability (bonus)', score: 2, max: 3 },
    ],
    assessmentSlug: 'dfva-mc-sciepi',
    marketSlug: 'dfva-market-mc-sciepi',
    recommendSlug: 'dfva-recommend-mc-sciepi',
  },
]

/** Find a program by any of its report slugs */
export function getProgramBySlug(slug: string): ProgramData | undefined {
  return PROGRAMS.find(
    (p) =>
      p.assessmentSlug === slug ||
      p.marketSlug === slug ||
      p.recommendSlug === slug,
  )
}
