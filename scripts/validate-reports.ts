/**
 * DFVA Structural Validation Script
 *
 * Validates that generated DFVA reports and TypeScript data files
 * meet structural requirements before committing.
 *
 * Usage: npx tsx validate-reports.ts [--verbose]
 */

import { readFileSync, existsSync } from 'fs'
import { resolve, join } from 'path'

const ROOT = resolve(__dirname, '..')
const REPORTS_DIR = join(ROOT, 'reports')
const DATA_DIR = join(ROOT, 'compass-static', 'src', 'data')
const PROGRESS_FILE = join(__dirname, 'progress.json')
const MANIFEST_FILE = join(__dirname, 'manifest.json')

const verbose = process.argv.includes('--verbose')

interface ManifestEntry {
  code: string
  name: string
  slug: string
  handbookUrl: string
  notes: string
}

interface ProgressEntry {
  status: string
  date: string
  score: number
  riskBand: string
}

interface ValidationError {
  program: string
  file: string
  issue: string
}

const RISK_BANDS: Record<string, [number, number]> = {
  RESILIENT: [28, 36],
  'MODERATE RISK': [20, 27],
  'HIGH RISK': [12, 19],
  CRITICAL: [0, 11],
}

const ASSESSMENT_SECTIONS = [
  'PROGRAM PROFILE',
  'AUTOMATION EXPOSURE PROFILE',
  'DFVA SCORECARD',
  'THREE THRESHOLD QUESTIONS',
  'ANALOGUE GRADUATE PROFILE',
  'VERDICT',
  'RECOMMENDATIONS',
  'REDESIGNED GRADUATE PROFILE',
]

const MARKET_SECTIONS = [
  'JOB FAMILY MAP',
  'RECENT JOB AD SIGNALS',
  'CURRENT DISCUSSION SIGNALS',
  'SKILL SHIFT SUMMARY',
  'CURRICULUM IMPLICATIONS',
  'EVIDENCE CONFIDENCE',
]

const IMPROVEMENT_SECTIONS = [
  'DIAGNOSTIC SUMMARY',
  'SCORE-TO-ACTION MAPPING',
  'MARKET EVIDENCE SNAPSHOT',
  'PRIORITISED INTERVENTIONS',
  'IMPLEMENTATION ROADMAP',
  'CAPABILITY ROADMAP',
  'ASSESSMENT REDESIGN',
  'AI GOVERNANCE',
  'MEASUREMENT PLAN',
  'RISKS',
  'REDESIGNED GRADUATE PROFILE',
]

function loadManifest(): ManifestEntry[] {
  return JSON.parse(readFileSync(MANIFEST_FILE, 'utf-8'))
}

function loadProgress(): Record<string, ProgressEntry> {
  return JSON.parse(readFileSync(PROGRESS_FILE, 'utf-8'))
}

function checkReportSections(
  filePath: string,
  expectedSections: string[],
  program: string
): ValidationError[] {
  const errors: ValidationError[] = []
  if (!existsSync(filePath)) {
    errors.push({ program, file: filePath, issue: 'File does not exist' })
    return errors
  }
  const content = readFileSync(filePath, 'utf-8')
  for (const section of expectedSections) {
    if (!content.toUpperCase().includes(section.toUpperCase())) {
      errors.push({
        program,
        file: filePath,
        issue: `Missing section: ${section}`,
      })
    }
  }
  return errors
}

function checkThresholdFormat(filePath: string, program: string): ValidationError[] {
  const errors: ValidationError[] = []
  if (!existsSync(filePath)) return errors
  const content = readFileSync(filePath, 'utf-8')

  // Check Q1, Q2, Q3 threshold questions exist with question mark
  for (const q of ['Q1', 'Q2', 'Q3']) {
    const pattern = new RegExp(`\\*\\*${q}:.*\\?\\*\\*`, 'm')
    if (!pattern.test(content)) {
      errors.push({
        program,
        file: filePath,
        issue: `Threshold ${q} not in correct format (**${q}: ...question?** on one line, answer on next)`,
      })
    }
  }
  return errors
}

function checkScoreRiskBandConsistency(
  filePath: string,
  program: string
): ValidationError[] {
  const errors: ValidationError[] = []
  if (!existsSync(filePath)) return errors
  const content = readFileSync(filePath, 'utf-8')

  // Try to extract total score — handles both "TOTAL: 24/36" and "| **TOTAL** | **24/36** |"
  const totalMatch = content.match(/TOTAL\**[:\s|]*\**\s*(\d+)\s*\/\s*36/i)
  if (!totalMatch) {
    errors.push({ program, file: filePath, issue: 'Cannot find TOTAL: N/36 in scorecard' })
    return errors
  }

  const score = parseInt(totalMatch[1], 10)

  // Try to find risk band — case-sensitive to avoid matching "critical" in body text
  // Handles "MODERATE RISK (20–27)", "Risk band: MODERATE RISK", or "is MODERATE RISK"
  const bandMatch = content.match(
    /(RESILIENT|MODERATE RISK|HIGH RISK|CRITICAL)(?:\s*\(\d+[–\-]\d+\))?/
  )
  if (!bandMatch) {
    errors.push({ program, file: filePath, issue: 'Cannot find risk band declaration' })
    return errors
  }

  const band = bandMatch[1].toUpperCase()
  const range = RISK_BANDS[band]
  if (range && (score < range[0] || score > range[1])) {
    errors.push({
      program,
      file: filePath,
      issue: `Score ${score} does not match risk band ${band} (expected ${range[0]}–${range[1]})`,
    })
  }
  return errors
}

function checkContentFile(slug: string, program: string): ValidationError[] {
  const errors: ValidationError[] = []
  const filePath = join(DATA_DIR, `reportContent.${slug}.ts`)

  if (!existsSync(filePath)) {
    errors.push({ program, file: filePath, issue: 'Content TypeScript file does not exist' })
    return errors
  }

  const content = readFileSync(filePath, 'utf-8')

  // Check all three slug entries exist
  for (const prefix of ['dfva-', 'dfva-market-', 'dfva-recommend-']) {
    const key = `"${prefix}${slug}"`
    if (!content.includes(key)) {
      errors.push({ program, file: filePath, issue: `Missing entry for slug: ${prefix}${slug}` })
    }
  }

  // Check no raw backticks inside template literals (basic check)
  const backtickCount = (content.match(/`/g) || []).length
  // Expect 6 template literal delimiters (open+close for 3 entries) = 6 backticks
  // Plus the possible export type annotation backticks
  if (backtickCount > 20) {
    errors.push({
      program,
      file: filePath,
      issue: `Suspiciously many backticks (${backtickCount}) — may have fenced code blocks inside template literals`,
    })
  }

  return errors
}

function checkProgramDataEntry(slug: string, program: string): ValidationError[] {
  const errors: ValidationError[] = []
  const filePath = join(DATA_DIR, 'programData.ts')
  const content = readFileSync(filePath, 'utf-8')

  if (!content.includes(`assessmentSlug: 'dfva-${slug}'`)) {
    errors.push({
      program,
      file: filePath,
      issue: `No ProgramData entry with assessmentSlug 'dfva-${slug}'`,
    })
  }
  return errors
}

function checkReportContentImport(slug: string, program: string): ValidationError[] {
  const errors: ValidationError[] = []
  const filePath = join(DATA_DIR, 'reportContent.ts')
  const content = readFileSync(filePath, 'utf-8')
  const slugUpper = slug.replace(/-/g, '_').toUpperCase()

  if (!content.includes(`reportContent.${slug}`)) {
    errors.push({
      program,
      file: filePath,
      issue: `Missing import for reportContent.${slug}`,
    })
  }
  if (!content.includes(`REPORT_CONTENT_${slugUpper}`)) {
    errors.push({
      program,
      file: filePath,
      issue: `Missing spread for REPORT_CONTENT_${slugUpper}`,
    })
  }
  return errors
}

// --- Main ---

function main() {
  const manifest = loadManifest()
  const progress = loadProgress()

  const completedSlugs = Object.entries(progress)
    .filter(([, v]) => v.status === 'complete')
    .map(([k]) => k)

  if (completedSlugs.length === 0) {
    console.log('⚠️  No completed programs in progress.json — nothing to validate.')
    console.log(`   Manifest contains ${manifest.length} programs to process.`)
    process.exit(0)
  }

  console.log(`\nValidating ${completedSlugs.length} completed programs...\n`)

  const allErrors: ValidationError[] = []

  for (const slug of completedSlugs) {
    const entry = manifest.find((m) => m.slug === slug)
    const programName = entry?.name ?? slug

    if (verbose) console.log(`  Checking: ${programName} (${slug})`)

    // Check report markdown files
    allErrors.push(
      ...checkReportSections(
        join(REPORTS_DIR, `dfva-${slug}.md`),
        ASSESSMENT_SECTIONS,
        programName
      )
    )
    allErrors.push(
      ...checkReportSections(
        join(REPORTS_DIR, `dfva-market-${slug}.md`),
        MARKET_SECTIONS,
        programName
      )
    )
    allErrors.push(
      ...checkReportSections(
        join(REPORTS_DIR, `dfva-recommend-${slug}.md`),
        IMPROVEMENT_SECTIONS,
        programName
      )
    )

    // Check threshold Q format in assessment
    allErrors.push(
      ...checkThresholdFormat(join(REPORTS_DIR, `dfva-${slug}.md`), programName)
    )

    // Check score/risk band consistency
    allErrors.push(
      ...checkScoreRiskBandConsistency(
        join(REPORTS_DIR, `dfva-${slug}.md`),
        programName
      )
    )

    // Check TypeScript integration
    allErrors.push(...checkContentFile(slug, programName))
    allErrors.push(...checkProgramDataEntry(slug, programName))
    allErrors.push(...checkReportContentImport(slug, programName))
  }

  // Report results
  if (allErrors.length === 0) {
    console.log(`✅ All ${completedSlugs.length} programs pass structural validation.\n`)
    process.exit(0)
  } else {
    console.log(`❌ ${allErrors.length} issue(s) found:\n`)
    for (const err of allErrors) {
      const relFile = err.file.replace(ROOT + '/', '')
      console.log(`  [${err.program}] ${relFile}`)
      console.log(`    → ${err.issue}\n`)
    }
    process.exit(1)
  }
}

main()
