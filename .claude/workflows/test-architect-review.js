export const meta = {
  name: 'test-architect-review',
  description: 'Software Architect review of the test suite: bugs, security, perf, maintainability, DRY/KISS, with verified findings and refactored code',
  whenToUse: 'When you want a harsh, structured architectural review of the project tests with severity-ranked findings and a refactored example.',
  phases: [
    { title: 'Survey', detail: 'Characterize suite structure, stubs, shared helpers, patterns' },
    { title: 'Review', detail: 'One reviewer per file-group emits severity-ranked findings' },
    { title: 'Verify', detail: 'Adversarially verify each Critical/High finding' },
    { title: 'Synthesize', detail: 'Assemble report + refactored code from verified findings' },
  ],
}

// ---- Work-list: substantive test files grouped into focused review batches ----
const BATCHES = [
  { key: 'acceptance', files: [
    'tests/acceptance/login-test.js',
    'tests/acceptance/me/emergency-contact-test.js',
    'tests/acceptance/me/personal-info-test.js',
    'tests/acceptance/person-assets-test.js',
  ]},
  { key: 'utils-handle-rules', files: [
    'tests/unit/utils/handle-rules-test.js', // 471 lines — the big one, reviewed alone
  ]},
  { key: 'unit-utils-misc', files: [
    'tests/unit/utils/admission-date-options-test.js',
    'tests/unit/utils/human-check-test.js',
    'tests/unit/utils/in-groups-test.js',
    'tests/unit/utils/set-cookie-test.js',
  ]},
  { key: 'unit-controllers-models', files: [
    'tests/unit/controllers/register-test.js',
    'tests/unit/controllers/admin/positions-test.js',
    'tests/unit/models/access-document-test.js',
    'tests/unit/models/person-message-test.js',
  ]},
  { key: 'integration-helpers', files: [
    'tests/integration/helpers/dayjs-format-test.js',
    'tests/integration/helpers/fa-icon-test.js',
    'tests/integration/helpers/has-role-test.js',
    'tests/integration/helpers/hour-format-test.js',
    'tests/integration/helpers/is-current-year-test.js',
    'tests/integration/helpers/mdy-format-test.js',
    'tests/integration/helpers/options-get-test.js',
    'tests/integration/helpers/pluck-test.js',
    'tests/integration/helpers/pronouns-format-test.js',
    'tests/integration/helpers/setting-test.js',
    'tests/integration/helpers/slot-full-indicator-test.js',
    'tests/integration/helpers/yesno-test.js',
  ]},
  { key: 'ui-components', files: [
    'tests/integration/components/ui-accordion-test.js',
    'tests/integration/components/ui-close-button-test.js',
    'tests/integration/components/ui-edit-button-test.js',
    'tests/integration/components/ui-empty-state-test.js',
    'tests/integration/components/ui-error-message-test.js',
    'tests/integration/components/ui-loading-test.js',
    'tests/integration/components/popover-test.js',
    'tests/integration/components/present-or-not-test.js',
    'tests/integration/components/you-or-callsign-test.js',
    'tests/integration/components/number-of-times-test.js',
  ]},
  { key: 'dashboard-components', files: [
    'tests/integration/components/dashboard-auditor-test.js',
    'tests/integration/components/dashboard-group-test.js',
    'tests/integration/components/dashboard-pnv-test.js',
    'tests/integration/components/dashboard-ranger-test.js',
    'tests/integration/components/sidebar/group-test.js',
    'tests/integration/components/alert-group-test.js',
  ]},
  { key: 'modal-intake-components', files: [
    'tests/integration/components/modal-confirm-missing-requirements-test.js',
    'tests/integration/components/modal-confirm-multiple-enrollment-test.js',
    'tests/integration/components/modal-missing-requirements-test.js',
    'tests/integration/components/intake-note-edit-test.js',
    'tests/integration/components/intake-notes-test.js',
    'tests/integration/components/intake-training-test.js',
  ]},
  { key: 'form-table-components', files: [
    'tests/integration/components/asset-table-test.js',
    'tests/integration/components/admin/slot-form-test.js',
    'tests/integration/components/survey-form-test.js',
    'tests/integration/components/survey-questionnaire-test.js',
    'tests/integration/components/team-membership-row-test.js',
    'tests/integration/components/schedule-manage-test.js',
  ]},
  { key: 'misc-components', files: [
    'tests/integration/components/autocomplete-input-test.js',
    'tests/integration/components/person-address-edit-test.js',
    'tests/integration/components/photo-edit-test.js',
    'tests/integration/components/photo-info-test.js',
    'tests/integration/components/meal-info-test.js',
    'tests/integration/components/slot-info-link-test.js',
  ]},
  { key: 'shared-infra', files: [
    'tests/helpers/index.js',
    'tests/test-helper.js',
  ]},
]

const FINDINGS_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['findings'],
  properties: {
    findings: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['severity', 'category', 'file', 'location', 'problem', 'fix'],
        properties: {
          severity: { type: 'string', enum: ['Critical', 'High', 'Medium', 'Low'] },
          category: { type: 'string', enum: [
            'Bug', 'Security', 'Performance', 'Maintainability',
            'EdgeCase', 'CodeSmell', 'FileSplit', 'Naming', 'Extraction',
          ]},
          file: { type: 'string' },
          location: { type: 'string', description: 'Line number(s) or named section' },
          problem: { type: 'string', description: 'What is wrong — be specific and harsh' },
          fix: { type: 'string', description: 'Concrete remediation' },
        },
      },
    },
  },
}

const VERDICT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['isReal', 'adjustedSeverity', 'reasoning'],
  properties: {
    isReal: { type: 'boolean', description: 'False if the finding is wrong, a non-issue, or a framework idiom mistaken for a bug' },
    adjustedSeverity: { type: 'string', enum: ['Critical', 'High', 'Medium', 'Low', 'Invalid'] },
    reasoning: { type: 'string' },
  },
}

const REVIEW_RUBRIC = `You are a harsh, senior Software Architect reviewing TEST code (Ember.js 5 / QUnit / Mirage).
Read every listed file in full with the Read tool before judging. Evaluate against ALL of:
1. Bugs: logic errors, off-by-one, null/undefined handling, race conditions, missing awaits on async test helpers, assertions that can never fail (e.g. assert.ok(true), tautologies), wrong assertion count / missing assert.expect.
2. Security: leaked credentials/tokens/PII in fixtures, injection-prone string building, auth assumptions.
3. Performance: redundant renders, N+1 fixture setup, leaked timers/intervals that hang the runloop, unnecessary loops.
4. Maintainability: naming, complexity, duplication (DRY), magic values, dead/commented-out tests, placeholder stubs.
5. Edge cases: what inputs would break the component-under-test that the test fails to cover.
6. Code smells: deeply nested logic, copy-paste setup blocks, brittle selectors.
7. Files that should be split.
8. Poor or inconsistent naming conventions.
9. Logic that should be extracted into reusable test helpers/builders.

For EVERY issue produce: severity (Critical/High/Medium/Low), file, location (line or section), the specific problem, and a concrete fix.
Be harsh but correct — do not invent issues. Only report what is actually in the files. Prefer precise line references.
Critical/High is reserved for real correctness problems (e.g. a test that asserts nothing, awaits nothing, or passes regardless of the code). Style/duplication is Medium/Low.`

// ---------------------------------------------------------------------------
phase('Survey')
log(`Surveying test suite: ${BATCHES.reduce((n, b) => n + b.files.length, 0)} substantive files across ${BATCHES.length} batches`)

const survey = await agent(
  `Survey the test suite architecture of this Ember/QUnit project. Read tests/test-helper.js and tests/helpers/index.js, list the directory tree under tests/, and run a grep for placeholder stubs.
Specifically determine and report (as prose):
- The shared test infrastructure that exists (helpers, setup wrappers, custom assertions) and gaps in it.
- How many test files are auto-generated placeholder stubs still containing "Replace this with your real tests", and what fraction of the suite that is. Use: grep -rl "Replace this with your real tests" tests | wc -l  and  find tests -name '*.js' | wc -l
- Repeated setup/boilerplate patterns that recur across files and could be centralized.
- Overall conventions inconsistency (mix of run() vs async/await, this.set patterns, assertion styles).
Return a concise structured prose summary an architect would put at the top of a review.`,
  { label: 'survey', phase: 'Survey' }
)

// ---------------------------------------------------------------------------
// Review -> Verify, pipelined per batch. Each batch's High/Critical findings
// verify as soon as that batch's review completes.
const reviewed = await pipeline(
  BATCHES,
  (batch) => agent(
    `${REVIEW_RUBRIC}\n\nReview ONLY these files (read each fully first):\n${batch.files.map(f => '- ' + f).join('\n')}\n\nReturn all findings.`,
    { label: `review:${batch.key}`, phase: 'Review', schema: FINDINGS_SCHEMA }
  ).then(r => ({ batch: batch.key, findings: (r && r.findings) || [] })),

  (review) => {
    const serious = review.findings.filter(f => f.severity === 'Critical' || f.severity === 'High')
    if (!serious.length) return { ...review, verified: review.findings.map(f => ({ ...f, verdict: null })) }
    return parallel(serious.map(f => () =>
      agent(
        `Adversarially verify this test-code review finding. Open the cited file and the code-under-test if needed. Try to REFUTE it. A finding is NOT real if it mistakes an Ember/QUnit idiom for a bug, cites a line that does not say what is claimed, or is pure opinion dressed as a defect.\n\nFINDING:\nfile: ${f.file}\nlocation: ${f.location}\nseverity: ${f.severity}\ncategory: ${f.category}\nproblem: ${f.problem}\nproposed fix: ${f.fix}\n\nReturn your verdict.`,
        { label: `verify:${f.file.split('/').pop()}`, phase: 'Verify', schema: VERDICT_SCHEMA }
      ).then(v => ({ ...f, verdict: v }))
    )).then(verifiedSerious => {
      const minor = review.findings
        .filter(f => f.severity !== 'Critical' && f.severity !== 'High')
        .map(f => ({ ...f, verdict: null }))
      return { ...review, verified: [...verifiedSerious, ...minor] }
    })
  }
)

// ---------------------------------------------------------------------------
// Flatten + drop refuted serious findings.
const allFindings = reviewed.filter(Boolean).flatMap(r => r.verified || [])
const kept = allFindings.filter(f => !f.verdict || f.verdict.isReal)
  .map(f => f.verdict && f.verdict.adjustedSeverity && f.verdict.adjustedSeverity !== 'Invalid'
    ? { ...f, severity: f.verdict.adjustedSeverity }
    : f)
const refuted = allFindings.filter(f => f.verdict && !f.verdict.isReal)

const order = { Critical: 0, High: 1, Medium: 2, Low: 3 }
kept.sort((a, b) => (order[a.severity] - order[b.severity]) || a.file.localeCompare(b.file))

log(`Findings: ${kept.length} kept, ${refuted.length} refuted by verification`)

// ---------------------------------------------------------------------------
phase('Synthesize')

const findingsTable = kept.map((f, i) =>
  `${i + 1}. [${f.severity}] (${f.category}) ${f.file} @ ${f.location}\n   PROBLEM: ${f.problem}\n   FIX: ${f.fix}`
).join('\n')

const report = await agent(
  `You are the lead Software Architect writing the final review of this Ember/QUnit test suite. Be harsh, specific, and actionable.

SURVEY:
${survey}

VERIFIED FINDINGS (already adversarially checked; refuted ones removed):
${findingsTable}

Write a Markdown report with these sections:
# Test Suite Architecture Review
## Executive Summary  — overall health verdict, top 3 systemic problems, and a maintainability/readability grade (A–F) with justification.
## Findings by Severity  — group the findings above under Critical / High / Medium / Low. For each: file:location, what's wrong, how to fix. Merge duplicate findings that recur across files into a single "systemic" entry naming all affected files.
## DRY / KISS Assessment  — the biggest duplication and over-complexity patterns, with the concrete shared helper/builder API you'd extract (function signatures).
## Refactored Example  — pick the single file with the worst combination of issues from the findings, and provide a COMPLETE refactored version in a fenced js code block that fixes the issues while preserving identical test behavior/coverage. Above it, briefly state which file and why. Also show the new shared test-helper module you are extracting (fenced js), and a 2-3 line diff-style note of how the refactored file now uses it.
## Prioritized Action Plan  — an ordered checklist (most impactful first), each item one line.

Do not pad. Every claim must trace to a finding or the survey. Output only the Markdown.`,
  { label: 'synthesize', phase: 'Synthesize' }
)

return {
  reportMarkdown: report,
  stats: {
    batches: BATCHES.length,
    filesReviewed: BATCHES.reduce((n, b) => n + b.files.length, 0),
    findingsKept: kept.length,
    findingsRefuted: refuted.length,
    bySeverity: kept.reduce((acc, f) => ((acc[f.severity] = (acc[f.severity] || 0) + 1), acc), {}),
  },
  refutedFindings: refuted.map(f => ({ file: f.file, problem: f.problem, why: f.verdict.reasoning })),
}
